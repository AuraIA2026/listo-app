const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const crypto = require("crypto"); // Requerido para la firma de AZUL

admin.initializeApp();
const db = admin.firestore();

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 1: onPagoTarjeta
   Se dispara cuando Cardnet/Azul confirma un pago online.
   Hace el split 10/90 automáticamente.
   URL: https://TU_REGION-TU_PROYECTO.cloudfunctions.net/webhookCardnet
═══════════════════════════════════════════════════════════ */
exports.webhookCardnet = functions.https.onRequest(async (req, res) => {
  try {
    // Cardnet envía un POST con los datos del pago
    const { pedidoId, monto, estado, transaccionId } = req.body;

    // Solo procesamos pagos aprobados
    if (estado !== "APROBADO") {
      return res.status(200).json({ ok: true, msg: "Pago no aprobado, ignorado" });
    }

    const pedidoRef = db.collection("pedidos").doc(pedidoId);
    const pedidoSnap = await pedidoRef.get();

    if (!pedidoSnap.exists) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    const pedido = pedidoSnap.data();

    // Calcular split
    const tuComision    = Math.round(monto * 0.10); // 10% para ti
    const pagoProf      = Math.round(monto * 0.90); // 90% para el profesional

    const batch = db.batch();

    // 1. Actualizar pedido
    batch.update(pedidoRef, {
      status: "pagado",
      metodoPago: "tarjeta",
      montoTotal: monto,
      transaccionId,
      fechaPago: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Sumar balance al profesional
    const proRef = db.collection("users").doc(pedido.profesionalId);
    batch.update(proRef, {
      balance: admin.firestore.FieldValue.increment(pagoProf),
    });

    // 3. Registrar transacción
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
   FUNCIÓN NUEVA: generarFirmaAzul
   Llamada desde el frontend, genera el AuthHash SHA-512 requerido 
   por el Hosted Payment Page de AZUL asegurando que la llave 
   nunca se expone al cliente.
═══════════════════════════════════════════════════════════ */
exports.generarFirmaAzul = functions.https.onCall((data, context) => {
  // TODO: Reemplazar estas variables con TUS llaves secretas de AZUL
  const MERCHANT_ID = "39038540035"; // Merchant ID provisto por Azul
  const AUTH_KEY = "asdhakjshdkjasdasmndajksdkjaskldga8odya9d8yoasyd98asdyaisdhoaisyd0a8sydoashd8oasydoiahdpiashd09ayusidhaos8dy0a8dya08syd0a8ssdsax"; // Llave secreta

  const {
    MerchantName,
    MerchantType,
    CurrencyCode,
    OrderNumber,
    Amount,
    ITBIS,
    ApprovedUrl,
    DeclinedUrl,
    CancelUrl
  } = data;

  // AZUL requiere la concatenación EXACATA de estos valores en este orden
  const cadena = `${MERCHANT_ID}${MerchantName}${MerchantType}${CurrencyCode}${OrderNumber}${Amount}${ITBIS}${ApprovedUrl}${DeclinedUrl}${CancelUrl}`;
  
  // Genera el hash en HMAC-SHA512
  const authHash = crypto.createHmac('sha512', AUTH_KEY).update(cadena).digest('hex');

  return {
    AuthHash: authHash,
    MerchantId: MERCHANT_ID
  };
});


/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 2: onPagoEfectivo
   El usuario marca que pagó en efectivo desde la app.
   Crea una comisión pendiente con 24h de límite.
   Llama desde tu app React cuando el usuario confirma pago en efectivo.
═══════════════════════════════════════════════════════════ */
exports.confirmarPagoEfectivo = functions.https.onCall(async (data, context) => {
  // Verificar que el usuario está autenticado
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

  // Calcular comisión que debe pagar el profesional
  const comisionMonto = Math.round(pedido.montoTotal * 0.10);

  // Fecha límite = ahora + 24 horas
  const fechaLimite = new Date();
  fechaLimite.setHours(fechaLimite.getHours() + 24);

  const batch = db.batch();

  // 1. Actualizar pedido
  batch.update(pedidoRef, {
    status: "pendiente_comision",
    metodoPago: "efectivo",
    fechaConfirmacionEfectivo: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 2. Crear documento de comisión pendiente
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

    // Buscar comisiones vencidas no pagadas
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

      // 1. Marcar comisión como bloqueada
      batch.update(doc.ref, { bloqueado: true });

      // 2. Bloquear perfil del profesional
      const proRef = db.collection("users").doc(comision.profesionalId);
      batch.update(proRef, {
        bloqueado: true,
        motivoBloqueo: "comision_no_pagada",
        fechaBloqueo: admin.firestore.FieldValue.serverTimestamp(),
        comisionPendienteId: doc.id,
      });

      // 3. Actualizar pedido
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

  // Verificar que es el profesional correcto
  if (comision.profesionalId !== profesionalId) {
    throw new functions.https.HttpsError("permission-denied", "No autorizado");
  }

  const batch = db.batch();

  // 1. Marcar comisión como pagada
  batch.update(comisionRef, {
    pagado: true,
    fechaPago: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 2. Desbloquear perfil
  const proRef = db.collection("users").doc(profesionalId);
  batch.update(proRef, {
    bloqueado: false,
    motivoBloqueo: null,
    fechaDesbloqueo: admin.firestore.FieldValue.serverTimestamp(),
  });

  // 3. Actualizar pedido
  const pedidoRef = db.collection("pedidos").doc(comision.pedidoId);
  batch.update(pedidoRef, { status: "completado" });

  await batch.commit();

  console.log(`✅ Comisión pagada: ${comisionId} | Profesional ${profesionalId} desbloqueado`);
  return { ok: true, desbloqueado: true };
});

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 5: enviarAlertaNuevoPedido
   Se dispara automáticamente cada vez que un usuario crea un nuevo
   pedido/contrato. Encuentra el correo del profesional y le avisa.
═══════════════════════════════════════════════════════════ */
const nodemailer = require("nodemailer");

// Configurar el transportador de correo (requiere App Password de Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "listopatron.app@gmail.com",
    pass: "TU_APP_PASSWORD_AQUI" // El usuario deberá reemplazar esto o usar secrets
  }
});

exports.enviarAlertaNuevoPedido = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    try {
      const order = snap.data();
      const proId = order.proId;
      if (!proId) return null;

      // 1. Buscar el email del profesional en la colección users
      const proDoc = await db.collection("users").doc(proId).get();
      if (!proDoc.exists) return null;
      
      const proData = proDoc.data();
      const destinoEmail = proData.email;
      if (!destinoEmail) return null;

      // 2. Construir el correo
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

            <p style="font-size: 14px; color: #666; text-align: center;">Por favor, abre la aplicación <b>Listo Patrón</b> de inmediato para aceptar o rechazar este trabajo antes de que el cliente busque a otra persona.</p>
            
            <div style="text-align: center; margin-top: 25px;">
              <a href="https://listo-app.vercel.app/orders" style="background: #F26000; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; font-size: 16px;">Ir a mis pedidos</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 12px; color: #999; text-align: center;">Este es un mensaje automático de Listo Patrón. Por favor no respondas a este correo.</p>
          </div>
        `
      };

      // 3. Enviar el correo
      await transporter.sendMail(mailOptions);
      console.log(`✅ Alerta enviada exitosamente a ${destinoEmail} para la orden ${context.params.orderId}`);
      
      // 4. DISPARAR PUSH NOTIFICATION EN PANTALLA BLOQUEADA
      await db.collection("notificaciones").add({
        userId: proId,
        type: 'new_order',
        title: '🔔 ¡NUEVA SOLICITUD DE SERVICIO!',
        text: `¡Felicidades ${proData.name.split(' ')[0]}! Un cliente te necesita. ¡Abre la app para ver los detalles del trabajo!`,
        orderId: context.params.orderId,
        date: new Date().toISOString(),
        read: false
      });

      return { success: true };

    } catch (error) {
      console.error("❌ Error enviando la alerta Mágica o Push Notification:", error);
      return null;
    }
  });

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 6: enviarNotificacionPush
   Esta función captura cualquier documento creado en la 
   colección "notificaciones" y envía una alerta física nativa
   al celular a través de Firebase Cloud Messaging (FCM).
   ¡Esto hace que suene aunque la app esté cerrada!
═══════════════════════════════════════════════════════════ */
exports.enviarNotificacionPushBackground = functions.firestore
  .document("notificaciones/{notifId}")
  .onCreate(async (snap, context) => {
    try {
      const notifData = snap.data();
      const userId = notifData.userId;
      if (!userId) return null;

      // 1. Obtener el FCM Token del usuario
      const userDoc = await db.collection("users").doc(userId).get();
      if (!userDoc.exists) return null;

      const fcmToken = userDoc.data().fcmToken;
      
      // Si el usuario no tiene token guardado (no ha dado permisos o está en web) no hacemos nada
      if (!fcmToken) {
        console.log(`Usuario ${userId} no tiene FCM Token guardado.`);
        return null; 
      }

      // 2. Construir el paquete Push nativo
      const payload = {
        token: fcmToken,
        notification: {
          title: notifData.title || "🔔 Nueva Notificación",
          body: notifData.text || "Tienes un mensaje nuevo en Listo Patrón.",
        },
        android: {
          notification: {
            sound: "default",
            clickAction: "FLUTTER_NOTIFICATION_CLICK" // Comportamiento estándar Capacitor/Flutter
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

      // 3. Disparar a los servidores de Google/Apple
      const response = await admin.messaging().send(payload);
      console.log(`📲 Push Notification enviada exitosamente: ${response}`);
      return { success: true, response };

    } catch (error) {
      console.error("❌ Error enviando Push Notification:", error);
      return null;
    }
  });

/* ═══════════════════════════════════════════════════════════
   FUNCIÓN 7: actualizarRatingProfesional
   Se ejecuta cuando un usuario califica al profesional en un pedido.
   Calcula el nuevo promedio de estrellas y lo guarda en el perfil
   del profesional en la colección 'users'.
═══════════════════════════════════════════════════════════ */
exports.actualizarRatingProfesional = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Solo nos importa si acaba de ser calificado
    if (!before.rated && after.rated && after.proId) {
      const proId = after.proId;

      try {
        // Consultar todos los pedidos calificados de este profesional
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
          const prom = sum / count;
          // Redondear a 1 decimal (ej: 4.8)
          const newRating = Math.round(prom * 10) / 10;

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
   Se dispara automáticamente cada vez que un profesional adquiere o cambia de plan.
   Le envía un correo de bienvenida/agradecimiento.
═══════════════════════════════════════════════════════════ */
exports.enviarCorreoNuevoPlan = functions.firestore
  .document("users/{userId}")
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // Detectamos si el campo "plan" o "currentPlan" fue modificado
      const oldPlan = before.plan || before.currentPlan || 'basico';
      const newPlan = after.plan || after.currentPlan || 'basico';

      // Si el plan no cambió, o si la cuenta pasó a plan básico gratuito, ignoramos
      if (oldPlan === newPlan) return null;
      if (newPlan === 'basico') return null;

      const destinoEmail = after.email;
      if (!destinoEmail) return null;

      const nombre = after.name ? after.name.split(' ')[0] : 'Profesional';

      // Detectar colores e insignias según el plan
      let planDisplay = newPlan.toUpperCase();
      let colorPlan = "#F26000";
      if (planDisplay.includes("VIP")) colorPlan = "#FF3D00";
      if (planDisplay.includes("GOLD")) colorPlan = "#FFBA00";
      if (planDisplay.includes("PLATINUM") || planDisplay.includes("PLATINO")) {
        planDisplay = "PLATINUM"; 
        colorPlan = "#78909C";
      }

      // 1. Construir el correo en HTML
      const mailOptions = {
        from: '"Listo Patrón" <listopatron.app@gmail.com>',
        to: destinoEmail,
        subject: `🎉 ¡Bienvenido al Plan ${planDisplay}! - Listo Patrón`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-top: 5px solid ${colorPlan}; border-radius: 10px;">
            <h2 style="color: #1A1A2E; text-align: center;">¡Gracias por postularte y creer en tu talento, ${nombre}! 🚀</h2>
            
            <p style="font-size: 16px; color: #333; text-align: center;">Nos emociona muchísimo informarte que acabas de adquirir tu nuevo paquete y tu cuenta ha sido actualizada exitosamente.</p>
            
            <div style="background: #FAFAFA; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center; border: 1px solid #eee;">
              <p style="margin: 0; font-size: 14px; color: #666;">Tu nuevo plan asignado es:</p>
              <p style="margin: 10px 0; font-size: 26px; font-weight: 900; color: ${colorPlan};">${planDisplay}</p>
            </div>

            <p style="font-size: 15px; color: #444; line-height: 1.6;">Con esta membresía activa, tu perfil ha desbloqueado una mayor visibilidad frente a la competencia, dándote la máxima prioridad en los resultados de búsqueda de los clientes. ¡Prepárate para recibir más trabajos!</p>
            
            <p style="font-size: 15px; color: #444; line-height: 1.6;"><strong>💡 Siguiente Paso:</strong> Dale ese toque personal y único a tu perfil. Asegúrate de tener una excelente foto, escribir una descripción atractiva de lo que haces, y mostrar lo mejor de ti.</p>
            
            <div style="text-align: center; margin-top: 35px; margin-bottom: 25px;">
              <a href="https://listo-app.vercel.app/profile" style="background: #1A1A2E; color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px;">Entrar a mi Perfil</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
            <p style="font-size: 12px; color: #aaa; text-align: center;">Este es un mensaje automático del equipo de éxito de Listo Patrón. ¡Estamos para apoyarte a crecer!</p>
          </div>
        `
      };

      // 2. Enviar el correo usando NodeMailer
      await transporter.sendMail(mailOptions);
      console.log(`✅ Correo de Nuevo Plan (${planDisplay}) enviado exitosamente a ${destinoEmail}`);
      
      // 3. Disparar notificación push interna para el campana en la app
      await db.collection("notificaciones").add({
        userId: change.after.id,
        type: 'plan_update',
        title: '⭐ ¡NUEVO PLAN ACTIVADO!',
        text: `¡Felicidades ${nombre}! Ya estás disfrutando de todos los beneficios del Plan ${planDisplay}.`,
        date: new Date().toISOString(),
        read: false
      });

      return { success: true };

    } catch (error) {
      console.error("❌ Error enviando correo de cambio de plan:", error);
      return null;
    }
  });