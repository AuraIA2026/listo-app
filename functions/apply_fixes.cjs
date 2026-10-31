const fs = require('fs');
const path = require('path');

const filePath = path.join('E:\\listo\\src\\pages\\AdminPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

let changes = 0;

// ── FIX 1: Alerts query con orderBy y fallback ──────────────────────────────
const OLD_ALERTS_QUERY = `    // 6. Escuchar Alertas/Notificaciones de Admin
    const unsubAlerts = onSnapshot(query(collection(db, 'notificaciones'), where('userId', '==', 'admin')), (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      arr.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.date || a.createdAt || 0).getTime();
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.date || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      setAlerts(arr);
    });`;

const NEW_ALERTS_QUERY = `    // 6. Escuchar Alertas/Notificaciones de Admin (ordenadas, mas recientes primero)
    const processAlerts = (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      arr.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.date || a.createdAt || 0).getTime();
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.date || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      setAlerts(arr);
    };
    // Intentar con orderBy primero, fallback sin orden si falta el indice
    let unsubAlerts;
    try {
      unsubAlerts = onSnapshot(
        query(collection(db, 'notificaciones'), where('userId', '==', 'admin'), orderBy('createdAt', 'desc')),
        processAlerts,
        () => {
          unsubAlerts = onSnapshot(query(collection(db, 'notificaciones'), where('userId', '==', 'admin')), processAlerts);
        }
      );
    } catch(_e) {
      unsubAlerts = onSnapshot(query(collection(db, 'notificaciones'), where('userId', '==', 'admin')), processAlerts);
    }`;

// Normalize line endings for comparison
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedOld1 = OLD_ALERTS_QUERY.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedOld1)) {
  content = content.replace(/    \/\/ 6\. Escuchar Alertas\/Notificaciones de Admin\r?\n    const unsubAlerts = onSnapshot\(query\(collection\(db, 'notificaciones'\), where\('userId', '==', 'admin'\)\), \(snap\) => \{[\s\S]*?setAlerts\(arr\);\r?\n    \}\);/, NEW_ALERTS_QUERY);
  console.log('✅ Fix 1 applied: alerts query with orderBy fallback');
  changes++;
} else {
  console.log('⚠️  Fix 1: pattern not found, trying regex...');
  const regex1 = /    \/\/ 6\. Escuchar Alertas\/Notificaciones de Admin\r?\n    const unsubAlerts = onSnapshot\(query\(collection\(db, 'notificaciones'\), where\('userId', '==', 'admin'\)\), \(snap\) => \{[\s\S]*?setAlerts\(arr\);\r?\n    \}\);/;
  if (regex1.test(content)) {
    content = content.replace(regex1, NEW_ALERTS_QUERY);
    console.log('✅ Fix 1 applied via regex');
    changes++;
  } else {
    console.log('❌ Fix 1 NOT applied');
  }
}

// ── FIX 2: Mejorar toast de notificaciones (distinguir tipo) ─────────────────
const OLD_TOAST = `      showToast('🔔 Nueva alerta de plan recibida');`;
const NEW_TOAST = `      // Detectar tipo de nueva alerta
      const latestNew = unreadAlerts[0];
      if (latestNew?.type === 'new_verification_request') {
        showToast('🛡️ ¡Nueva postulacion pendiente de revision!');
      } else if (latestNew?.type === 'new_story_review' || (latestNew?.title && latestNew.title.includes('HISTORIA'))) {
        showToast('📸 Nueva historia esperando validacion');
      } else if (latestNew?.type === 'admin_plan_purchased') {
        showToast('👑 Nuevo pago de plan recibido');
      } else {
        showToast('🔔 Nueva alerta recibida');
      }`;

if (content.includes(OLD_TOAST)) {
  content = content.replace(OLD_TOAST, NEW_TOAST);
  console.log('✅ Fix 2 applied: specific toast messages per alert type');
  changes++;
} else {
  console.log('❌ Fix 2 NOT applied: toast text not found');
}

// ── FIX 3: Tab count de Alertas incluye postulaciones pendientes ──────────────
const OLD_TAB_ALERTAS = `            { id:'alertas',      label:'Alertas', count: alerts.filter(a => !a.read).length },`;
const NEW_TAB_ALERTAS  = `            { id:'alertas',      label:'Alertas', count: alerts.filter(a => !a.read).length + verifications.length },`;

if (content.includes(OLD_TAB_ALERTAS)) {
  content = content.replace(OLD_TAB_ALERTAS, NEW_TAB_ALERTAS);
  console.log('✅ Fix 3 applied: Alertas tab count includes pending verifications');
  changes++;
} else {
  console.log('❌ Fix 3 NOT applied: tab alertas count pattern not found');
}

// ── FIX 4: Banner azul en tab Alertas cuando hay postulaciones pendientes ─────
const OLD_EMPTY_ALERTS = `            {alerts.length === 0 && (
              <div className="empty-admin">
                <span>🔔</span>
                <p>Sin alertas</p>
                <small>No se han registrado eventos o solicitudes de planes.</small>
              </div>
            )}`;
const NEW_EMPTY_ALERTS  = `            {/* Banner azul si hay postulaciones activas */}
            {verifications.length > 0 && (
              <div style={{background:'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.06))', border:'2px solid #3B82F6', borderRadius:16, padding:'14px 16px', marginBottom:14, display:'flex', alignItems:'center', gap:12, cursor:'pointer'}} onClick={() => setTab('postulaciones')}>
                <span style={{fontSize:28}}>🛡️</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800, fontSize:15, color:'#1E40AF'}}>¡{verifications.length} postulacion(es) pendiente(s)!</div>
                  <div style={{fontSize:12, color:'#3B82F6', marginTop:2}}>Toca aqui para revisar los documentos en la pestana Nuevos</div>
                </div>
                <span style={{fontSize:22, color:'#3B82F6'}}>›</span>
              </div>
            )}
            {alerts.length === 0 && verifications.length === 0 && (
              <div className="empty-admin">
                <span>🔔</span>
                <p>Sin alertas</p>
                <small>No se han registrado eventos o solicitudes.</small>
              </div>
            )}`;

if (content.includes(OLD_EMPTY_ALERTS)) {
  content = content.replace(OLD_EMPTY_ALERTS, NEW_EMPTY_ALERTS);
  console.log('✅ Fix 4 applied: Blue banner for pending verifications in Alertas tab');
  changes++;
} else {
  console.log('❌ Fix 4 NOT applied: empty alerts pattern not found');
}

// ── FIX 5: Section title in Alertas shows verif count ──────────────────────
const OLD_SECTION_TITLE = `              <span className="section-title">Alertas de Planes ({alerts.filter(a => !a.read).length} sin leer)</span>`;
const NEW_SECTION_TITLE  = `              <span className="section-title">Alertas ({alerts.filter(a => !a.read).length} sin leer{verifications.length > 0 ? \` · \${verifications.length} postulacion(es)\` : ''})</span>`;

if (content.includes(OLD_SECTION_TITLE)) {
  content = content.replace(OLD_SECTION_TITLE, NEW_SECTION_TITLE);
  console.log('✅ Fix 5 applied: section title shows verif count');
  changes++;
} else {
  console.log('❌ Fix 5 NOT applied: section title pattern not found');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\n📝 ${changes} fix(es) applied and saved to AdminPage.jsx`);
