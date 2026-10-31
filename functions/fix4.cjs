const fs = require('fs');
const file = 'E:\\listo\\src\\pages\\AdminPage.jsx';
let content = fs.readFileSync(file, 'utf8');

// Fix 4: Insertar banner azul ANTES del bloque "alerts.length === 0"
// El patrón tiene \r\n como separador
const target = `            {alerts.length === 0 && (\r\n              <div className="empty-admin">\r\n                <span>\uD83D\uDD14</span>\r\n                <p>Sin alertas</p>\r\n                <small>No se han registrado eventos o solicitudes de planes.</small>\r\n              </div>\r\n            )}`;

const replacement = `            {/* Banner si hay postulaciones pendientes */}\r\n            {verifications.length > 0 && (\r\n              <div style={{background:'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.06))',border:'2px solid #3B82F6',borderRadius:16,padding:'14px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={() => setTab('postulaciones')}>\r\n                <span style={{fontSize:28}}>\uD83D\uDEE1\uFE0F</span>\r\n                <div style={{flex:1}}>\r\n                  <div style={{fontWeight:800,fontSize:15,color:'#1E40AF'}}>!{verifications.length} postulacion(es) pendiente(s) de revision!</div>\r\n                  <div style={{fontSize:12,color:'#3B82F6',marginTop:2}}>Toca aqui para ir a la pestana "Nuevos" y revisar los documentos</div>\r\n                </div>\r\n                <span style={{fontSize:22,color:'#3B82F6'}}>›</span>\r\n              </div>\r\n            )}\r\n            {alerts.length === 0 && verifications.length === 0 && (\r\n              <div className="empty-admin">\r\n                <span>\uD83D\uDD14</span>\r\n                <p>Sin alertas</p>\r\n                <small>No se han registrado eventos o solicitudes.</small>\r\n              </div>\r\n            )}`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Fix 4 applied: blue banner for pending verifications');
} else {
  // Try without specific emoji encoding
  const idx = content.indexOf('            {alerts.length === 0 && (\r\n              <div className="empty-admin">');
  if (idx !== -1) {
    const endIdx = content.indexOf('            )}', idx) + '            )}'.length;
    const oldBlock = content.substring(idx, endIdx);
    console.log('Found block at index', idx, ':');
    console.log(JSON.stringify(oldBlock.substring(0,200)));
    
    const newBlock = `            {/* Banner si hay postulaciones pendientes */}\r\n            {verifications.length > 0 && (\r\n              <div style={{background:'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.06))',border:'2px solid #3B82F6',borderRadius:16,padding:'14px 16px',marginBottom:14,display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={() => setTab('postulaciones')}>\r\n                <span style={{fontSize:28}}>\uD83D\uDEE1\uFE0F</span>\r\n                <div style={{flex:1}}>\r\n                  <div style={{fontWeight:800,fontSize:15,color:'#1E40AF'}}>!{verifications.length} postulacion(es) pendiente(s)!</div>\r\n                  <div style={{fontSize:12,color:'#3B82F6',marginTop:2}}>Toca aqui para ir a la pestana "Nuevos" y revisar los documentos</div>\r\n                </div>\r\n                <span style={{fontSize:22,color:'#3B82F6'}}>›</span>\r\n              </div>\r\n            )}\r\n            {alerts.length === 0 && verifications.length === 0 && (\r\n              <div className="empty-admin">\r\n                <span>\uD83D\uDD14</span>\r\n                <p>Sin alertas</p>\r\n                <small>No se han registrado eventos o solicitudes.</small>\r\n              </div>\r\n            )}`;
    
    content = content.substring(0, idx) + newBlock + content.substring(endIdx);
    fs.writeFileSync(file, content, 'utf8');
    console.log('✅ Fix 4 applied via index search');
  } else {
    console.log('❌ Fix 4 failed - block not found');
  }
}
