const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 1: webhookCardnet
   Se dispara cuando Cardnet/Azul confirma un pago online.
   Hace el split 10/90 automáticamente.
═══════════════════════════════════════════════════════════ */
exports.webhookCardnet = functions.https.onRequest(async (req, res) => {
  try {
    const { pedidoId, monto, estado, transaccionId } = req.body;

    if (estado !== "APROBADO") {
      return res.status(200).json({ ok: true, msg: "Pago no aprobado, ignorado" });
    }

    const pedidoRef = db.collection("pedidos").doc(pedidoId);
    const pedidoSnap = await pedidoRef.get();

    if (!pedidoSnap.exists) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const pedido = pedidoSnap.data();

    const tuComision = Math.round(monto * 0.10);
    const pagoProf   = Math.round(monto * 0.90);

    const batch = db.batch();

    batch.update(pedidoRef, {
      status: "pagado",
      metodoPago: "tarjeta",
      montoTotal: monto,
      transaccionId,
      fechaPago: admin.firestore.FieldValue.serverTimestamp(),
    });

    const proRef = db.collection("users").doc(pedido.profesionalId);
    batch.update(proRef, {
      balance: admin.firestore.FieldValue.increment(pagoProf),
    });

    const txRef = db.collection("transacciones").doc();
    batch.set(txRef, {
      pedidoId,
      profesionalId: pedido.profesionalId,
      clienteId: pedido.clienteId,
      montoTotal: monto,
      tuComision,
      pagoProf,
      tipo: "tarjeta",
      fecha: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    console.log(`✅ Pago tarjeta procesado: pedido ${pedidoId} | Prof: RD$${pagoProf} | Comisión: RD$${tuComision}`);
    return res.status(200).json({ ok: true, tuComision, pagoProf });

  } catch (error) {
    console.error("❌ Error en webhookCardnet:", error);
    return res.status(500).json({ error: error.message });
  }
});

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN: generarFirmaAzul
   Genera el AuthHash requerido por AZUL para cualquier pago.
   Funciona para planes Y para pagos de servicios.
═══════════════════════════════════════════════════════════ */
exports.generarFirmaAzul = functions.https.onCall((data, context) => {
  const MERCHANT_ID = "39038540035";
  const AUTH_KEY    = "asdhakjshdkjasdasmndajksdkjaskldga8odya9d8yoasyd98asdyaisdhoaisyd0a8sydoashd8oasydoiahdpiashd09ayusidhaos8dy0a8dya08syd0a8ssdsax";

  const {
    MerchantName,
    MerchantType,
    CurrencyCode,
    OrderNumber,
    Amount,
    ApprovedUrl,
    DeclinedUrl,
    CancelUrl,
  } = data;

  const ITBIS = "000";

  const UseCustomField1   = "0";
  const CustomField1Label = "";
  const CustomField1Value = "";
  const UseCustomField2   = "0";
  const CustomField2Label = "";
  const CustomField2Value = "";

  const ResponsePostUrl = ApprovedUrl;

  // Orden EXACTO requerido por AZUL para el AuthHash
  const cadena =
    MERCHANT_ID +
    MerchantName +
    MerchantType +
    CurrencyCode +
    OrderNumber +
    Amount +
    ITBIS +
    ApprovedUrl +
    DeclinedUrl +
    CancelUrl +
    UseCustomField1 +
    CustomField1Label +
    CustomField1Value +
    UseCustomField2 +
    CustomField2Label +
    CustomField2Value +
    AUTH_KEY;

  const authHash = crypto.createHmac('sha512', AUTH_KEY)
    .update(cadena)
    .digest('hex');

  return {
    AuthHash:        authHash,
    MerchantId:      MERCHANT_ID,
    ITBIS,
    ResponsePostUrl,
  };
});

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN: azulWebHook  ✅ UNIFICADO
   Recibe el retorno de AZUL para CUALQUIER tipo de pago:
     - PLAN_  → activa plan del profesional
     - ORD-   → procesa pago de servicio (split 10/90)
   El monto siempre viene de AZUL en centavos (Amount).
═══════════════════════════════════════════════════════════ */
exports.azulWebHook = functions.https.onRequest(async (req, res) => {
  try {
    const payload = req.method === "POST" ? req.body : req.query;
    console.log("AZUL WebHook Payload:", payload);

    const orderNumber = payload.OrderNumber || "";

    // AZUL envía el Amount en centavos → convertir a pesos reales
    const montoAzul = parseInt(payload.Amount || "0", 10);
    const monto = Math.round(montoAzul / 100);

    const isoCode = payload.IsoCode || "";
    const responseMessage = (payload.ResponseMessage || "").toUpperCase();

    // Verificar si el pago fue realmente aprobado
    // Azul generalmente responde con IsoCode "00" o ResponseMessage "APROBADA"
    const isApproved = isoCode === "00" || responseMessage.includes("APROBADA") || payload.AuthorizationCode;

    if (!isApproved) {
      console.warn(`⚠️ Pago NO aprobado. IsoCode: ${isoCode}, Mensaje: ${responseMessage}`);
      if (orderNumber.startsWith("PLAN_")) {
        return res.redirect(`https://listo-app.vercel.app/profile?planError=declined`);
      } else {
        return res.redirect(`https://listo-app.vercel.app/orders?payment=error`);
      }
    }

    // ── PLANES: formato PLAN_{planId}_{userId} ───────────────
    if (orderNumber.startsWith("PLAN_")) {
      const parts = orderNumber.split("_");
      if (parts.length >= 3) {
        const planId = parts[1].toLowerCase();
        const userId = parts[2];
        const validPlans = ["basico", "gold", "platinum", "vip"];
        const actualPlan = validPlans.includes(planId) ? planId : null;

        if (actualPlan) {
          await db.collection("users").doc(userId).update({
            plan: actualPlan,
            planUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`✅ Plan ${actualPlan} activado para usuario ${userId}`);
          return res.redirect(`https://listo-app.vercel.app/profile?planSetupSuccess=${actualPlan}`);
        }
      }

      // Plan inválido — redirigir con error
      return res.redirect(`https://listo-app.vercel.app/profile?planError=invalid`);
    }

    // ── SERVICIOS: formato ORD-{timestamp} ───────────────────
    if (orderNumber.startsWith("ORD-") || orderNumber.startsWith("ORD_")) {
      if (monto <= 0) {
        console.warn("⚠️ Monto inválido recibido de AZUL:", payload.Amount);
        return res.redirect(`https://listo-app.vercel.app/orders?payment=error`);
      }

      const tuComision = Math.round(monto * 0.10);
      const pagoProf   = Math.round(monto * 0.90);

      // Buscar la orden en Firestore por el orderNumber guardado antes de ir a AZUL
      const ordersSnap = await db.collection("orders")
        .where("orderNumber", "==", orderNumber)
        .limit(1)
        .get();

      if (!ordersSnap.empty) {
        const orderDoc = ordersSnap.docs[0];
        const order    = orderDoc.data();

        const batch = db.batch();

        // Actualizar la orden
        batch.update(orderDoc.ref, {
          status:        "pagado",
          paymentStatus: "pagado",
          metodoPago:    "tarjeta",
          montoTotal:    monto,
          transaccionId: payload.RRN || payload.AzulOrderId || orderNumber,
          fechaPago:     admin.firestore.FieldValue.serverTimestamp(),
        });

        // Acreditar 90% al profesional
        const proId = order.proId || order.profesionalId;
        if (proId) {
          const proRef = db.collection("users").doc(proId);
          batch.update(proRef, {
            balance: admin.firestore.FieldValue.increment(pagoProf),
          });
        }

        // Registrar transacción
        const txRef = db.collection("transacciones").doc();
        batch.set(txRef, {
          orderNumber,
          orderId:       orderDoc.id,
          profesionalId: order.proId || order.profesionalId || null,
          clienteId:     order.clientId || order.clienteId  || null,
          montoTotal:    monto,
          tuComision,
          pagoProf,
          tipo:          "tarjeta",
          fecha:         admin.firestore.FieldValue.serverTimestamp(),
        });

        await batch.commit();
        console.log(`✅ Servicio pagado | Order: ${orderNumber} | Monto: RD$${monto} | Prof: RD$${pagoProf} | Comisión: RD$${tuComision}`);
      } else {
        // La orden no existe en Firestore — igual registrar la transacción para auditoría
        console.warn(`⚠️ Orden no encontrada en Firestore para OrderNumber: ${orderNumber}. Registrando transacción de auditoría.`);
        await db.collection("transacciones").add({
          orderNumber,
          montoTotal:  monto,
          tuComision,
          pagoProf,
          tipo:        "tarjeta",
          nota:        "orden_no_encontrada",
          fecha:       admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return res.redirect(`https://listo-app.vercel.app/orders?payment=success`);
    }

    // OrderNumber no reconocido
    console.warn("⚠️ OrderNumber no reconocido:", orderNumber);
    return res.redirect(`https://listo-app.vercel.app/`);

  } catch (err) {
    console.error("❌ Error en azulWebHook:", err);
    return res.redirect(`https://listo-app.vercel.app/?paymentError=true`);
  }
});

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 2: confirmarPagoEfectivo
   El usuario marca que pagó en efectivo.
   Crea una comisión pendiente con 24h de límite.
═══════════════════════════════════════════════════════════ */
exports.confirmarPagoEfectivo = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Debes estar autenticado");
  }

  const { pedidoId } = data;

  const pedidoRef  = db.collection("pedidos").doc(pedidoId);
  const pedidoSnap = await pedidoRef.get();

  if (!pedidoSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Pedido no encontrado");
  }

  const pedido = pedidoSnap.data();

  const comisionMonto = Math.round(pedido.montoTotal * 0.10);

  const fechaLimite = new Date();
  fechaLimite.setHours(fechaLimite.getHours() + 24);

  const batch = db.batch();

  batch.update(pedidoRef, {
    status: "pendiente_comision",
    metodoPago: "efectivo",
    fechaConfirmacionEfectivo: admin.firestore.FieldValue.serverTimestamp(),
  });

  const comisionRef = db.collection("comisiones").doc();
  batch.set(comisionRef, {
    pedidoId,
    profesionalId: pedido.profesionalId,
    clienteId: pedido.clienteId,
    montoTotal: pedido.montoTotal,
    comisionMonto,
    fechaLimite: admin.firestore.Timestamp.fromDate(fechaLimite),
    pagado: false,
    bloqueado: false,
    creadoEn: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  console.log(`⏳ Efectivo registrado: pedido ${pedidoId} | Comisión: RD$${comisionMonto} | Límite: ${fechaLimite}`);
  return { ok: true, comisionMonto, fechaLimite };
});

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 3: checkComisionesPendientes
   Corre automáticamente cada hora.
   Revisa comisiones vencidas y bloquea el perfil del profesional.
═══════════════════════════════════════════════════════════ */
exports.checkComisionesPendientes = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async (context) => {
    const ahora = admin.firestore.Timestamp.now();

    const vencidasSnap = await db.collection("comisiones")
      .where("pagado", "==", false)
      .where("bloqueado", "==", false)
      .where("fechaLimite", "<=", ahora)
      .get();

    if (vencidasSnap.empty) {
      console.log("✅ No hay comisiones vencidas");
      return null;
    }

    const batch = db.batch();
    let bloqueados = 0;

    for (const doc of vencidasSnap.docs) {
      const comision = doc.data();

      batch.update(doc.ref, { bloqueado: true });

      const proRef = db.collection("users").doc(comision.profesionalId);
      batch.update(proRef, {
        bloqueado: true,
        motivoBloqueo: "comision_no_pagada",
        fechaBloqueo: admin.firestore.FieldValue.serverTimestamp(),
        comisionPendienteId: doc.id,
      });

      const pedidoRef = db.collection("pedidos").doc(comision.pedidoId);
      batch.update(pedidoRef, { status: "comision_vencida" });

      bloqueados++;
      console.log(`🔴 Bloqueado: profesional ${comision.profesionalId} por comisión ${doc.id}`);
    }

    await batch.commit();
    console.log(`🔴 Total bloqueados: ${bloqueados}`);
    return null;
  });

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 4: pagarComision
   El profesional paga su comisión del 10% manualmente.
   Desbloquea su perfil automáticamente.
═══════════════════════════════════════════════════════════ */
exports.pagarComision = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Debes estar autenticado");
  }

  const { comisionId } = data;
  const profesionalId = context.auth.uid;

  const comisionRef  = db.collection("comisiones").doc(comisionId);
  const comisionSnap = await comisionRef.get();

  if (!comisionSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Comisión no encontrada");
  }

  const comision = comisionSnap.data();

  if (comision.profesionalId !== profesionalId) {
    throw new functions.https.HttpsError("permission-denied", "No autorizado");
  }

  const batch = db.batch();

  batch.update(comisionRef, {
    pagado: true,
    fechaPago: admin.firestore.FieldValue.serverTimestamp(),
  });

  const proRef = db.collection("users").doc(profesionalId);
  batch.update(proRef, {
    bloqueado: false,
    motivoBloqueo: null,
    fechaDesbloqueo: admin.firestore.FieldValue.serverTimestamp(),
  });

  const pedidoRef = db.collection("pedidos").doc(comision.pedidoId);
  batch.update(pedidoRef, { status: "completado" });

  await batch.commit();

  console.log(`✅ Comisión pagada: ${comisionId} | Profesional ${profesionalId} desbloqueado`);
  return { ok: true, desbloqueado: true };
});

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 5: enviarAlertaNuevoPedido
   Se dispara cuando se crea un nuevo pedido.
   Encuentra el correo del profesional y le avisa.
═══════════════════════════════════════════════════════════ */
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "listopatron.app@gmail.com",
    pass: "TU_APP_PASSWORD_AQUI"
  }
});

exports.enviarAlertaNuevoPedido = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    try {
      const order = snap.data();
      const proId = order.proId;
      if (!proId) return null;

      const proDoc = await db.collection("users").doc(proId).get();
      if (!proDoc.exists) return null;
      
      const proData = proDoc.data();
      const destinoEmail = proData.email;
      if (!destinoEmail) return null;

      const mailOptions = {
        from: '"Listo Patrón" <listopatron.app@gmail.com>',
        to: destinoEmail,
        subject: "🚨 ¡NUEVO CONTRATO DISPONIBLE! - Listo Patrón 🚨",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-top: 5px solid #F26000; border-radius: 10px;">
            <h2 style="color: #1A1A2E; text-align: center;">¡Felicidades, ${proData.name.split(' ')[0]}! 🎉</h2>
            <p style="font-size: 16px; color: #333;">Tienes una nueva solicitud de servicio esperándote en la plataforma.</p>
            <div style="background: #FAFAFA; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>👤 Cliente:</strong> ${order.clientName || 'Usuario'}</p>
              <p style="margin: 5px 0;"><strong>🛠️ Servicio:</strong> ${order.proSpecialty || 'Solicitud general'}</p>
              <p style="margin: 5px 0;"><strong>📍 Dirección:</strong> ${order.clientAddress || order.address || 'Ver en la app'}</p>
              <p style="margin: 5px 0;"><strong>💰 Precio:</strong> ${order.price || 'A convenir'}</p>
              <p style="margin: 5px 0;"><strong>🕒 Fecha:</strong> ${order.dateToken} - ${order.timeToken}</p>
            </div>
            <p style="font-size: 14px; color: #666; text-align: center;">Por favor, abre la aplicación <b>Listo Patrón</b> de inmediato para aceptar o rechazar este trabajo.</p>
            <div style="text-align: center; margin-top: 25px;">
              <a href="https://listo-app.vercel.app/orders" style="background: #F26000; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; font-size: 16px;">Ir a mis pedidos</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 12px; color: #999; text-align: center;">Este es un mensaje automático de Listo Patrón. Por favor no respondas a este correo.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Alerta enviada a ${destinoEmail} para la orden ${context.params.orderId}`);
      
      await db.collection("notificaciones").add({
        userId: proId,
        type: 'new_order',
        title: '🔔 ¡NUEVA SOLICITUD DE SERVICIO!',
        text: `¡Felicidades ${proData.name.split(' ')[0]}! Un cliente te necesita. ¡Abre la app para ver los detalles!`,
        orderId: context.params.orderId,
        date: new Date().toISOString(),
        read: false
      });

      return { success: true };

    } catch (error) {
      console.error("❌ Error enviando alerta:", error);
      return null;
    }
  });

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 6: enviarNotificacionPushBackground
   Captura documentos creados en "notificaciones" y envía
   push notification vía Firebase Cloud Messaging (FCM).
═══════════════════════════════════════════════════════════ */
exports.enviarNotificacionPushBackground = functions.firestore
  .document("notificaciones/{notifId}")
  .onCreate(async (snap, context) => {
    try {
      const notifData = snap.data();
      const userId = notifData.userId;
      if (!userId) return null;

      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) return null;

      const fcmToken = userDoc.data().fcmToken;
      
      if (!fcmToken) {
        console.log(`Usuario ${userId} no tiene FCM Token guardado.`);
        return null; 
      }

      const payload = {
        token: fcmToken,
        notification: {
          title: notifData.title || "🔔 Nueva Notificación",
          body: notifData.text || "Tienes un mensaje nuevo en Listo Patrón.",
        },
        android: {
          notification: {
            sound: "default",
            clickAction: "FLUTTER_NOTIFICATION_CLICK"
          }
        },
        apns: {
          payload: {
            aps: {
              sound: "default"
            }
          }
        }
      };

      const response = await admin.messaging().send(payload);
      console.log(`📲 Push Notification enviada: ${response}`);
      return { success: true, response };

    } catch (error) {
      console.error("❌ Error enviando Push Notification:", error);
      return null;
    }
  });

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 7: actualizarRatingProfesional
   Se ejecuta cuando un usuario califica al profesional.
   Calcula el nuevo promedio de estrellas.
═══════════════════════════════════════════════════════════ */
exports.actualizarRatingProfesional = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (!before.rated && after.rated && after.proId) {
      const proId = after.proId;

      try {
        const ordersSnap = await db.collection("orders")
          .where("proId", "==", proId)
          .where("rated", "==", true)
          .get();

        if (ordersSnap.empty) return null;

        let sum = 0;
        let count = 0;

        ordersSnap.forEach(doc => {
          const d = doc.data();
          if (typeof d.ratingScore === 'number') {
            sum += d.ratingScore;
            count++;
          }
        });

        if (count > 0) {
          const newRating = Math.round((sum / count) * 10) / 10;

          await db.collection("users").doc(proId).update({
            rating: newRating,
            reviewCount: count
          });

          console.log(`⭐ Rating actualizado para ${proId}: ${newRating} (${count} reseñas)`);
        }
      } catch (err) {
        console.error("❌ Error actualizando rating:", err);
      }
    }
    return null;
  });

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 8: enviarCorreoNuevoPlan
   Se dispara cuando un profesional adquiere o cambia de plan.
═══════════════════════════════════════════════════════════ */
exports.enviarCorreoNuevoPlan = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      let triggeredPlan = null;
      if (before.plan !== after.plan && after.plan) {
        triggeredPlan = after.plan;
      } else if (before.currentPlan !== after.currentPlan && after.currentPlan) {
        triggeredPlan = after.currentPlan;
      }

      if (!triggeredPlan || triggeredPlan === 'basico') return null;

      const destinoEmail = after.email;
      if (!destinoEmail) return null;

      const nombre = after.name ? after.name.split(' ')[0] : 'Profesional';

      let planDisplay = triggeredPlan.toUpperCase();
      let colorPlan = "#F26000";
      if (planDisplay.includes("VIP"))      colorPlan = "#FF3D00";
      if (planDisplay.includes("GOLD"))     colorPlan = "#FFBA00";
      if (planDisplay.includes("PLATINUM") || planDisplay.includes("PLATINO")) {
        planDisplay = "PLATINUM";
        colorPlan = "#78909C";
      }

      const mailOptions = {
        from: '"Listo Patrón" <listopatron.app@gmail.com>',
        to: destinoEmail,
        subject: `🎉 ¡Bienvenido al Plan ${planDisplay}! - Listo Patrón`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-top: 5px solid ${colorPlan}; border-radius: 10px;">
            <h2 style="color: #1A1A2E; text-align: center;">¡Gracias por postularte y creer en tu talento, ${nombre}! 🚀</h2>
            <p style="font-size: 16px; color: #333; text-align: center;">Tu cuenta ha sido actualizada exitosamente.</p>
            <div style="background: #FAFAFA; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center; border: 1px solid #eee;">
              <p style="margin: 0; font-size: 14px; color: #666;">Tu nuevo plan asignado es:</p>
              <p style="margin: 10px 0; font-size: 26px; font-weight: 900; color: ${colorPlan};">${planDisplay}</p>
            </div>
            <p style="font-size: 15px; color: #444; line-height: 1.6;">Con esta membresía activa, tu perfil tiene máxima prioridad en los resultados de búsqueda. ¡Prepárate para recibir más trabajos!</p>
            <div style="text-align: center; margin-top: 35px; margin-bottom: 25px;">
              <a href="https://listo-app.vercel.app/profile" style="background: #1A1A2E; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px;">Entrar a mi Perfil</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 12px; color: #aaa; text-align: center;">Mensaje automático del equipo de Listo Patrón.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Correo Plan ${planDisplay} enviado a ${destinoEmail}`);
      
      await db.collection("notificaciones").add({
        userId: change.after.id,
        type: 'plan_update',
        title: '⭐ ¡NUEVO PLAN ACTIVADO!',
        text: `¡Felicidades ${nombre}! Ya disfrutas de los beneficios del Plan ${planDisplay}.`,
        date: new Date().toISOString(),
        read: false
      });

      return { success: true };

    } catch (error) {
      console.error("❌ Error enviando correo de plan:", error);
      return null;
    }
  });