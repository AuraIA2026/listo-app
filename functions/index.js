const functions = require("firebase-functions");
const admin = require("firebase-admin");

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