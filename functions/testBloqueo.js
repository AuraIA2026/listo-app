// ═══════════════════════════════════════════════════════════
// testBloqueo.js
// Script para probar el bloqueo automático SIN esperar 24 horas
// Ejecuta desde tu terminal: node testBloqueo.js
// ═══════════════════════════════════════════════════════════

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // descárgalo de Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ── COLORES para la terminal ──
const verde  = (t) => `\x1b[32m${t}\x1b[0m`;
const rojo   = (t) => `\x1b[31m${t}\x1b[0m`;
const amarillo = (t) => `\x1b[33m${t}\x1b[0m`;
const cyan   = (t) => `\x1b[36m${t}\x1b[0m`;

async function testBloqueoAutomatico() {
  console.log(cyan("\n══════════════════════════════════════"));
  console.log(cyan("  🧪 TEST: Bloqueo automático 24h"));
  console.log(cyan("══════════════════════════════════════\n"));

  // ── PASO 1: Crear un profesional de prueba ──────────────
  console.log("📝 PASO 1: Creando profesional de prueba...");
  const proRef = db.collection("users").doc("test_profesional_001");
  await proRef.set({
    nombre: "Carlos Test",
    email: "carlos@test.com",
    tipo: "profesional",
    especialidad: "Plomero",
    balance: 0,
    bloqueado: false,
    creadoEn: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(verde("  ✅ Profesional creado: test_profesional_001\n"));

  // ── PASO 2: Crear un pedido de prueba ───────────────────
  console.log("📝 PASO 2: Creando pedido de prueba...");
  const pedidoRef = db.collection("pedidos").doc("test_pedido_001");
  await pedidoRef.set({
    clienteId: "test_cliente_001",
    profesionalId: "test_profesional_001",
    montoTotal: 1000,
    metodoPago: "efectivo",
    status: "pendiente_comision",
    fecha: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(verde("  ✅ Pedido creado: RD$1,000 en efectivo\n"));

  // ── PASO 3: Crear comisión con fecha YA VENCIDA ─────────
  console.log("📝 PASO 3: Creando comisión con fecha VENCIDA (simula 24h)...");
  const fechaVencida = new Date();
  fechaVencida.setHours(fechaVencida.getHours() - 1); // 1 hora en el PASADO

  const comisionRef = db.collection("comisiones").doc("test_comision_001");
  await comisionRef.set({
    pedidoId: "test_pedido_001",
    profesionalId: "test_profesional_001",
    clienteId: "test_cliente_001",
    montoTotal: 1000,
    comisionMonto: 100, // 10%
    fechaLimite: admin.firestore.Timestamp.fromDate(fechaVencida),
    pagado: false,
    bloqueado: false,
    creadoEn: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(amarillo("  ⏰ Comisión creada con fecha vencida hace 1 hora\n"));

  // ── PASO 4: Ejecutar la lógica de bloqueo ───────────────
  console.log("⚙️  PASO 4: Ejecutando lógica de bloqueo...");
  await ejecutarBloqueo();

  // ── PASO 5: Verificar resultado ─────────────────────────
  console.log("\n🔍 PASO 5: Verificando resultado en Firestore...");
  await verificarResultado();

  // ── PASO 6: Limpiar datos de prueba ────────────────────
  console.log("\n🧹 PASO 6: Limpiando datos de prueba...");
  await limpiarPrueba();

  console.log(cyan("\n══════════════════════════════════════"));
  console.log(cyan("  ✅ TEST COMPLETADO"));
  console.log(cyan("══════════════════════════════════════\n"));
  process.exit(0);
}

// ── Lógica de bloqueo (igual que la Cloud Function) ────────
async function ejecutarBloqueo() {
  const ahora = admin.firestore.Timestamp.now();

  const vencidasSnap = await db.collection("comisiones")
    .where("pagado", "==", false)
    .where("bloqueado", "==", false)
    .where("fechaLimite", "<=", ahora)
    .get();

  if (vencidasSnap.empty) {
    console.log(rojo("  ❌ No se encontraron comisiones vencidas"));
    return;
  }

  const batch = db.batch();

  for (const doc of vencidasSnap.docs) {
    const comision = doc.data();
    console.log(amarillo(`  🔍 Comisión vencida encontrada: ${doc.id}`));
    console.log(amarillo(`     Profesional: ${comision.profesionalId}`));
    console.log(amarillo(`     Monto pendiente: RD$${comision.comisionMonto}`));

    // Marcar comisión como bloqueada
    batch.update(doc.ref, { bloqueado: true });

    // Bloquear perfil del profesional
    const proRef = db.collection("users").doc(comision.profesionalId);
    batch.update(proRef, {
      bloqueado: true,
      motivoBloqueo: "comision_no_pagada",
      fechaBloqueo: admin.firestore.FieldValue.serverTimestamp(),
      comisionPendienteId: doc.id,
    });

    // Actualizar pedido
    const pedidoRef = db.collection("pedidos").doc(comision.pedidoId);
    batch.update(pedidoRef, { status: "comision_vencida" });
  }

  await batch.commit();
  console.log(rojo(`  🔴 ${vencidasSnap.size} profesional(es) BLOQUEADO(S)`));
}

// ── Verificar que el bloqueo funcionó ──────────────────────
async function verificarResultado() {
  const proSnap     = await db.collection("users").doc("test_profesional_001").get();
  const comSnap     = await db.collection("comisiones").doc("test_comision_001").get();
  const pedidoSnap  = await db.collection("pedidos").doc("test_pedido_001").get();

  const pro    = proSnap.data();
  const com    = comSnap.data();
  const pedido = pedidoSnap.data();

  console.log("\n  📊 RESULTADOS:");
  console.log(`  Usuario bloqueado:    ${pro.bloqueado ? rojo("✅ SÍ (BLOQUEADO)") : verde("❌ No")}`);
  console.log(`  Motivo:               ${pro.motivoBloqueo || "—"}`);
  console.log(`  Comisión bloqueada:   ${com.bloqueado ? rojo("✅ SÍ") : verde("❌ No")}`);
  console.log(`  Status pedido:        ${pedido.status}`);

  if (pro.bloqueado && com.bloqueado && pedido.status === "comision_vencida") {
    console.log(verde("\n  🎉 PRUEBA EXITOSA — El bloqueo automático funciona correctamente!"));
  } else {
    console.log(rojo("\n  ❌ PRUEBA FALLIDA — Algo no funcionó correctamente"));
  }
}

// ── Limpiar datos de prueba de Firestore ───────────────────
async function limpiarPrueba() {
  await db.collection("users").doc("test_profesional_001").delete();
  await db.collection("pedidos").doc("test_pedido_001").delete();
  await db.collection("comisiones").doc("test_comision_001").delete();
  console.log(verde("  ✅ Datos de prueba eliminados de Firestore"));
}

// ── Ejecutar ───────────────────────────────────────────────
testBloqueoAutomatico().catch((err) => {
  console.error(rojo("\n❌ ERROR:"), err);
  process.exit(1);
});