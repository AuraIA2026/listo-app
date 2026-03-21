import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

/* ─── ESTILOS ─────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#07090F;
  --surface:#0E1117;
  --surface2:#151820;
  --border:rgba(255,255,255,0.06);
  --brand:#F26000;
  --brand-dim:rgba(242,96,0,0.12);
  --brand-glow:rgba(242,96,0,0.3);
  --green:#10B981;
  --green-dim:rgba(16,185,129,0.12);
  --red:#EF4444;
  --red-dim:rgba(239,68,68,0.12);
  --yellow:#F59E0B;
  --yellow-dim:rgba(245,158,11,0.12);
  --blue:#3B82F6;
  --blue-dim:rgba(59,130,246,0.12);
  --text:#ECE9E3;
  --muted:#5C5A56;
  --mono:'IBM Plex Mono',monospace;
  --display:'Syne',sans-serif;
  --body:'DM Sans',sans-serif;
}
body{background:var(--bg);color:var(--text);font-family:var(--body);}

.admin-wrap{
  min-height:100vh;
  background:var(--bg);
  padding:0 0 80px;
  position:relative;
  overflow-x:hidden;
}

/* Fondo decorativo */
.admin-wrap::before{
  content:'';
  position:fixed;
  top:-300px;left:-200px;
  width:700px;height:700px;
  background:radial-gradient(circle,rgba(242,96,0,0.04) 0%,transparent 60%);
  pointer-events:none;z-index:0;
}
.admin-wrap::after{
  content:'';
  position:fixed;
  bottom:-200px;right:-200px;
  width:500px;height:500px;
  background:radial-gradient(circle,rgba(16,185,129,0.03) 0%,transparent 60%);
  pointer-events:none;z-index:0;
}

/* ── TOPBAR ── */
.admin-topbar{
  position:sticky;top:0;z-index:50;
  background:rgba(7,9,15,0.92);
  backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;justify-content:space-between;
  padding:16px 20px;
}
.topbar-left{display:flex;align-items:center;gap:12px;}
.admin-back{
  background:var(--surface2);border:1px solid var(--border);
  color:var(--muted);width:36px;height:36px;border-radius:10px;
  cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;
  transition:all .2s;
}
.admin-back:hover{color:var(--text);border-color:rgba(255,255,255,0.15);}
.admin-title{font-family:var(--display);font-size:17px;font-weight:800;letter-spacing:-.3px;}
.admin-badge{
  background:var(--red);color:#fff;
  font-family:var(--display);font-size:10px;font-weight:700;
  padding:2px 7px;border-radius:20px;letter-spacing:.5px;
  animation:badgePulse 2s ease-in-out infinite;
}
@keyframes badgePulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 5px transparent}}

.topbar-right{display:flex;align-items:center;gap:8px;}
.admin-tag{
  font-family:var(--mono);font-size:10px;
  color:var(--brand);background:var(--brand-dim);
  border:1px solid rgba(242,96,0,0.2);
  padding:4px 10px;border-radius:6px;letter-spacing:.5px;
}

/* ── TABS ── */
.admin-tabs{
  display:flex;gap:4px;
  padding:16px 20px 0;
  position:relative;z-index:1;
}
.tab-btn{
  flex:1;padding:10px 8px;
  background:var(--surface);border:1px solid var(--border);
  color:var(--muted);font-family:var(--display);font-size:12px;font-weight:700;
  border-radius:12px;cursor:pointer;transition:all .2s;
  letter-spacing:.3px;display:flex;flex-direction:column;align-items:center;gap:3px;
}
.tab-btn span.tab-icon{font-size:16px;}
.tab-btn.active{
  background:var(--brand-dim);border-color:rgba(242,96,0,0.3);
  color:var(--brand);
}
.tab-count{
  font-family:var(--mono);font-size:10px;
  background:rgba(255,255,255,0.06);
  padding:1px 6px;border-radius:4px;
  color:var(--muted);
}
.tab-btn.active .tab-count{background:rgba(242,96,0,0.2);color:var(--brand);}

/* ── MÉTRICAS ── */
.metrics-grid{
  display:grid;grid-template-columns:1fr 1fr;
  gap:10px;padding:16px 20px;
  position:relative;z-index:1;
}
.metric-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:16px;padding:16px;
  animation:fadeUp .4s ease both;
}
.metric-card:nth-child(1){animation-delay:.05s}
.metric-card:nth-child(2){animation-delay:.1s}
.metric-card:nth-child(3){animation-delay:.15s}
.metric-card:nth-child(4){animation-delay:.2s}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

.metric-label{font-size:10px;color:var(--muted);font-family:var(--display);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;}
.metric-value{font-family:var(--mono);font-size:22px;font-weight:500;margin-bottom:2px;}
.metric-sub{font-size:11px;color:var(--muted);}
.metric-card.green{border-color:rgba(16,185,129,0.2);}
.metric-card.green .metric-value{color:var(--green);}
.metric-card.brand{border-color:rgba(242,96,0,0.2);}
.metric-card.brand .metric-value{color:var(--brand);}
.metric-card.red{border-color:rgba(239,68,68,0.2);}
.metric-card.red .metric-value{color:var(--red);}
.metric-card.yellow{border-color:rgba(245,158,11,0.2);}
.metric-card.yellow .metric-value{color:var(--yellow);}

/* ── SECCIÓN ── */
.admin-section{padding:0 20px;margin-bottom:24px;position:relative;z-index:1;}
.section-header{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:12px;
}
.section-title{
  font-family:var(--display);font-size:11px;font-weight:700;
  color:var(--muted);letter-spacing:2px;text-transform:uppercase;
}
.section-action{
  font-family:var(--mono);font-size:10px;color:var(--brand);
  background:none;border:none;cursor:pointer;letter-spacing:.5px;
  padding:4px 8px;border-radius:6px;transition:background .2s;
}
.section-action:hover{background:var(--brand-dim);}

/* ── TARJETA PAGO ── */
.payment-card{
  background:var(--surface);border:1px solid var(--border);
  border-radius:16px;padding:16px;margin-bottom:10px;
  animation:fadeUp .35s ease both;
  transition:border-color .2s;
}
.payment-card:hover{border-color:rgba(255,255,255,0.1);}

.pc-top{display:flex;align-items:flex-start;gap:12px;}
.pc-avatar{
  width:40px;height:40px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--display);font-weight:800;font-size:12px;color:#fff;
  flex-shrink:0;
}
.pc-info{flex:1;min-width:0;}
.pc-name{font-family:var(--display);font-weight:700;font-size:14px;margin-bottom:2px;}
.pc-detail{font-size:12px;color:var(--muted);}
.pc-right{text-align:right;flex-shrink:0;}
.pc-total{font-family:var(--mono);font-weight:500;font-size:16px;color:var(--text);margin-bottom:4px;}

/* Pill de método */
.method-pill{
  display:inline-flex;align-items:center;gap:4px;
  font-size:10px;font-family:var(--display);font-weight:700;
  padding:3px 8px;border-radius:20px;letter-spacing:.3px;
}
.method-pill.card{background:var(--blue-dim);color:var(--blue);}
.method-pill.cash{background:var(--yellow-dim);color:var(--yellow);}

/* Split visual */
.pc-split{
  display:flex;gap:8px;margin-top:12px;
}
.split-item{
  flex:1;background:var(--surface2);border-radius:10px;
  padding:10px 12px;
  border:1px solid var(--border);
}
.split-label{font-size:10px;color:var(--muted);font-family:var(--display);font-weight:700;letter-spacing:.5px;margin-bottom:4px;}
.split-amount{font-family:var(--mono);font-size:15px;font-weight:500;}
.split-item.mine .split-amount{color:var(--brand);}
.split-item.pro .split-amount{color:var(--green);}
.split-pct{font-size:10px;color:var(--muted);margin-top:1px;}

/* Status */
.status-pill{
  display:inline-block;font-size:10px;font-family:var(--display);font-weight:700;
  padding:3px 9px;border-radius:20px;letter-spacing:.3px;margin-top:8px;
}
.status-pill.paid{background:var(--green-dim);color:var(--green);}
.status-pill.pending{background:var(--yellow-dim);color:var(--yellow);}
.status-pill.blocked{background:var(--red-dim);color:var(--red);}
.status-pill.waiting{background:var(--blue-dim);color:var(--blue);}

/* ── COMISIÓN PENDIENTE ── */
.comision-card{
  background:var(--surface);
  border:1px solid rgba(245,158,11,0.2);
  border-radius:16px;padding:16px;margin-bottom:10px;
  animation:fadeUp .35s ease both;
  position:relative;overflow:hidden;
}
.comision-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--yellow),transparent);
}
.comision-card.critical{border-color:rgba(239,68,68,0.3);}
.comision-card.critical::before{background:linear-gradient(90deg,var(--red),transparent);}

.cc-top{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.cc-avatar{
  width:40px;height:40px;border-radius:12px;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--display);font-weight:800;font-size:12px;color:#fff;
}
.cc-info{flex:1;}
.cc-name{font-family:var(--display);font-weight:700;font-size:14px;margin-bottom:2px;}
.cc-service{font-size:12px;color:var(--muted);}
.cc-amount{
  font-family:var(--mono);font-size:18px;font-weight:500;color:var(--yellow);
  text-align:right;
}
.comision-card.critical .cc-amount{color:var(--red);}

/* Barra de tiempo */
.timer-bar-wrap{margin-bottom:12px;}
.timer-label{
  display:flex;justify-content:space-between;
  font-size:10px;color:var(--muted);font-family:var(--mono);
  margin-bottom:6px;
}
.timer-label span:last-child.critical{color:var(--red);}
.timer-label span:last-child.warning{color:var(--yellow);}
.timer-track{background:var(--surface2);border-radius:4px;height:6px;overflow:hidden;}
.timer-fill{height:100%;border-radius:4px;transition:width .5s;}
.timer-fill.ok{background:var(--green);}
.timer-fill.warning{background:var(--yellow);}
.timer-fill.critical{background:var(--red);animation:timerPulse 1s ease-in-out infinite;}
@keyframes timerPulse{0%,100%{opacity:1}50%{opacity:.5}}

.cc-actions{display:flex;gap:8px;}
.cc-btn{
  flex:1;padding:9px;border-radius:10px;border:none;
  font-family:var(--display);font-size:11px;font-weight:700;cursor:pointer;
  transition:all .2s;letter-spacing:.3px;
}
.cc-btn.block{background:var(--red-dim);color:var(--red);border:1px solid rgba(239,68,68,.25);}
.cc-btn.block:hover{background:rgba(239,68,68,.2);}
.cc-btn.remind{background:var(--surface2);color:var(--muted);border:1px solid var(--border);}
.cc-btn.remind:hover{color:var(--text);border-color:rgba(255,255,255,.15);}
.cc-btn.paid{background:var(--green-dim);color:var(--green);border:1px solid rgba(16,185,129,.25);}
.cc-btn.paid:hover{background:rgba(16,185,129,.2);}

/* ── PROFESIONAL BLOQUEADO ── */
.blocked-card{
  background:var(--surface);
  border:1px solid rgba(239,68,68,0.25);
  border-radius:16px;padding:16px;margin-bottom:10px;
  animation:fadeUp .35s ease both;
  position:relative;overflow:hidden;
}
.blocked-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--red),transparent);
}
.bc-top{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
.blocked-icon{
  font-size:11px;font-family:var(--display);font-weight:700;
  background:var(--red-dim);color:var(--red);
  padding:3px 8px;border-radius:6px;letter-spacing:.5px;
}
.bc-info{flex:1;}
.bc-name{font-family:var(--display);font-weight:700;font-size:14px;}
.bc-reason{font-size:12px;color:var(--red);opacity:.7;margin-top:2px;}
.bc-debt{font-family:var(--mono);font-size:16px;color:var(--red);}
.bc-actions{display:flex;gap:8px;margin-top:12px;}
.bc-btn{
  flex:1;padding:9px;border-radius:10px;border:none;
  font-family:var(--display);font-size:11px;font-weight:700;cursor:pointer;
  transition:all .2s;letter-spacing:.3px;
}
.bc-btn.unblock{background:var(--green-dim);color:var(--green);border:1px solid rgba(16,185,129,.25);}
.bc-btn.unblock:hover{background:rgba(16,185,129,.2);}
.bc-btn.contact{background:var(--surface2);color:var(--muted);border:1px solid var(--border);}
.bc-btn.contact:hover{color:var(--text);}

/* ── EMPTY ── */
.empty-admin{
  text-align:center;padding:40px 20px;
  color:var(--muted);
}
.empty-admin span{font-size:36px;display:block;margin-bottom:10px;}
.empty-admin p{font-family:var(--display);font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px;}
.empty-admin small{font-size:12px;}

/* ── TOAST ── */
.toast{
  position:fixed;bottom:100px;left:50%;transform:translateX(-50%) translateY(20px);
  background:var(--surface2);border:1px solid var(--border);
  border-radius:12px;padding:12px 20px;
  font-family:var(--display);font-size:13px;font-weight:600;
  color:var(--text);z-index:200;
  opacity:0;transition:all .3s;pointer-events:none;
  white-space:nowrap;
}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);}

/* ── CONFIRM MODAL ── */
.confirm-overlay{
  position:fixed;inset:0;background:rgba(0,0,0,.75);
  backdrop-filter:blur(8px);display:flex;align-items:flex-end;
  justify-content:center;z-index:100;
  animation:fadeIn .2s;
}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.confirm-modal{
  background:var(--surface);border:1px solid rgba(255,255,255,.08);
  border-radius:24px 24px 0 0;padding:28px 24px 44px;
  width:100%;max-width:480px;text-align:center;
  animation:slideUp .3s cubic-bezier(.34,1.56,.64,1);
}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.cm-icon{font-size:40px;display:block;margin-bottom:12px;}
.cm-title{font-family:var(--display);font-size:20px;font-weight:800;margin-bottom:6px;}
.cm-sub{color:var(--muted);font-size:14px;margin-bottom:24px;line-height:1.5;}
.cm-btn{
  width:100%;padding:14px;border-radius:14px;border:none;
  font-family:var(--display);font-size:14px;font-weight:700;cursor:pointer;
  transition:all .2s;margin-bottom:8px;letter-spacing:.3px;
}
.cm-btn.danger{background:var(--red);color:#fff;}
.cm-btn.danger:hover{background:#dc2626;}
.cm-btn.success{background:var(--green);color:#fff;}
.cm-btn.success:hover{background:#059669;}
.cm-btn.ghost{background:var(--surface2);color:var(--muted);border:1px solid var(--border);}

/* ── FORMULARIO REGALOS ── */
.gift-form{
  background:linear-gradient(180deg, rgba(20,24,36,0.8), rgba(11,15,25,0.9));
  border:1px solid rgba(255,255,255,0.05);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
  border-radius:24px;padding:32px;
}
.gift-label{display:block;font-family:var(--display);font-size:13px;font-weight:700;color:#A1A1AA;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;}
.gift-input, .gift-textarea{
  width:100%;background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.1);
  color:var(--text);border-radius:16px;padding:16px;font-family:var(--body);font-size:15px;
  margin-bottom:24px;outline:none;transition:all .3s ease;
}
.gift-input:focus, .gift-textarea:focus{border-color:var(--yellow);box-shadow:0 0 0 4px rgba(245,158,11,0.1);}
.gift-textarea{resize:vertical;min-height:90px;}
.gift-btn{
  width:100%;background:linear-gradient(135deg, #F59E0B, #F26000);color:#FFF;border:none;border-radius:16px;
  padding:18px;font-family:var(--display);font-size:16px;font-weight:800;cursor:pointer;
  transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform:uppercase; letter-spacing:1px;
}
.gift-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 20px -10px rgba(245,158,11,0.5);}
.gift-btn:active:not(:disabled){transform:translateY(0);}
.gift-btn:disabled{opacity:.5;cursor:not-allowed;background:var(--surface2);color:var(--muted);}

/* ── AUTOCOMPLETE CUSTOM ── */
.ac-container { position:relative; margin-bottom:24px; }
.ac-input-wrapper { position:relative; }
.ac-input-wrapper input { margin-bottom: 0; }
.ac-dropdown {
  position:absolute; top:100%; left:0; right:0; background:#1A1D27; border:1px solid rgba(255,255,255,0.1);
  border-radius:12px; margin-top:8px; max-height:200px; overflow-y:auto; z-index:10;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}
.ac-item {
  padding:12px 16px; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer;
  display:flex; flex-direction:column; gap:4px;
}
.ac-item:last-child { border-bottom:none; }
.ac-item:hover { background:rgba(255,255,255,0.05); }
.ac-name { font-size:14px; font-weight:700; color:#fff; }
.ac-detail { font-size:12px; color:var(--muted); }
`;

/* ─── HELPERS ────────────────────────────────────────────── */
const fmtRD = (n) => `RD$${Number(n).toLocaleString()}`;
const timerState = (h) => h <= 4 ? 'critical' : h <= 10 ? 'warning' : 'ok';
const timerPct   = (h) => Math.round((h / 24) * 100);

/* ─── FORMATTER HORA ─── */
const fmtDate = (timestamp) => {
  if (!timestamp) return 'Reciente';
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString('es-DO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ─── COMPONENTE PRINCIPAL ───────────────────────────────── */
export default function AdminPage({ navigate }) {
  const [tab, setTab]           = useState('pagos');
  const [payments, setPayments] = useState([]);
  const [users, setUsers]       = useState([]);
  const [toast, setToast]       = useState('');
  const [confirm, setConfirm]   = useState(null); // { type, obj }

  // Formulario de Regalos
  const [giftUser, setGiftUser] = useState(''); // UID del usuario seleccionado
  const [giftSearch, setGiftSearch] = useState(''); // Texto escrito para buscar
  const [showAc, setShowAc] = useState(false); // Mostrar dropdown de autocomplete
  const [giftAmount, setGiftAmount] = useState('5');
  const [giftMessage, setGiftMessage] = useState('¡Felicidades! Pronto serás tu propio Patrón. Te regalamos estos contratos para que sigas creciendo.');

  useEffect(() => {
    // 1. Escuchar Pagos
    const unsubPay = onSnapshot(query(collection(db, 'payments'), orderBy('createdAt', 'desc')), (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPayments(arr);
    });

    // 2. Escuchar Usuarios (role: 'professional')
    const unsubUsers = onSnapshot(query(collection(db, 'users'), where('role', '==', 'professional')), (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(arr);
    });

    return () => { unsubPay(); unsubUsers(); };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  /* Confirmar acciones reales con Firebase */
  const ejecutarConfirm = async () => {
    if (!confirm) return;
    const { type, obj } = confirm;
    setConfirm(null);

    try {
      if (type === 'paid') {
        // Aprobar un pago (Comisión/Plan transferido)
        await updateDoc(doc(db, 'payments', obj.id), { status: 'paid' });
        
        // Cargar los contratos al profesional si aplica
        if (obj.planContracts) {
           const u = users.find(u => u.id === obj.proId);
           const currentContracts = u?.contracts || 0;
           await updateDoc(doc(db, 'users', obj.proId), {
             contracts: currentContracts + obj.planContracts + (obj.planBonus || 0),
             planStatus: 'active',
             currentPlan: obj.planId || 'standard'
           });
           showToast(`💚 Plan habilitado para ${obj.proName}`);
        } else {
           showToast(`💚 Transferencia de ${obj.proName} validada`);
        }
      }
      
      if (type === 'block') {
         await updateDoc(doc(db, 'users', obj.id), { planStatus: 'inactive', approved: false });
         showToast(`🔴 ${obj.name} bloqueado`);
      }
      if (type === 'unblock') {
         await updateDoc(doc(db, 'users', obj.id), { planStatus: 'active', approved: true });
         showToast(`✅ ${obj.name} activado`);
      }
      if (type === 'add_contract') {
         const current = obj.contracts || 0;
         await updateDoc(doc(db, 'users', obj.id), { contracts: current + 1 });
         showToast(`✅ Se sumó 1 contrato a ${obj.name}`);
      }
      if (type === 'sub_contract') {
         const current = obj.contracts || 0;
         if (current > 0) {
            await updateDoc(doc(db, 'users', obj.id), { contracts: current - 1 });
            showToast(`➖ Se restó 1 contrato a ${obj.name}`);
         } else {
            showToast(`⚠️ ${obj.name} ya tiene 0 contratos`);
         }
      }
      if (type === 'send_gift') {
         const u = users.find(x => x.id === giftUser);
         if (!u) return;
         const current = u.contracts || 0;
         const toAdd = parseInt(giftAmount) || 0;
         await updateDoc(doc(db, 'users', giftUser), {
            contracts: current + toAdd,
            bonusMessage: {
              amount: toAdd,
              message: giftMessage,
              date: new Date().toISOString()
            }
         });
         showToast(`🎁 ¡Regalo enviado a ${u.name}!`);
         setGiftUser('');
         setGiftAmount('5');
      }
    } catch(err) {
      console.error(err);
      showToast('❌ Ocurrió un error en la base de datos');
    }
  };

  // Separemos los pagos en completados y pendientes
  const completedPayments = payments.filter(p => p.status === 'paid');
  const pendingPayments   = payments.filter(p => p.status === 'pending');
  // Usuarios bloqueados/pendientes de aprobar
  const blockedUsers      = users.filter(u => !u.approved || u.planStatus === 'inactive');

  const pendienteCount = pendingPayments.length;
  const bloqueadoCount = blockedUsers.length;

  const totalVentas = completedPayments.reduce((a,p) => a + (p.planPriceVal || p.transferAmount || 0), 0);
  const planesVendidos = completedPayments.length;
  const planesPorVerificar = pendingPayments.reduce((a,p) => a + (p.planPriceVal || p.transferAmount || 0), 0);

  return (
    <>
      <style>{css}</style>
      <div className="admin-wrap">

        {/* TOPBAR */}
        <div className="admin-topbar">
          <div className="topbar-left">
            <button className="admin-back" onClick={() => navigate && navigate('profile')}>‹</button>
            <span className="admin-title">🛡️ Admin</span>
            {(pendienteCount + bloqueadoCount) > 0 && (
              <span className="admin-badge">{pendienteCount + bloqueadoCount} alertas</span>
            )}
          </div>
          <div className="topbar-right">
            <span className="admin-tag">LISTO v1.0</span>
          </div>
        </div>

        {/* MÉTRICAS */}
        <div className="metrics-grid">
          <div className="metric-card brand">
            <div className="metric-label">Ventas Totales</div>
            <div className="metric-value">{fmtRD(Math.round(totalVentas))}</div>
            <div className="metric-sub">Ingresos por planes</div>
          </div>
          <div className="metric-card green">
            <div className="metric-label">Planes Vendidos</div>
            <div className="metric-value">{planesVendidos}</div>
            <div className="metric-sub">contratos activados</div>
          </div>
          <div className="metric-card yellow">
            <div className="metric-label">Pagos por Validar</div>
            <div className="metric-value">{fmtRD(planesPorVerificar)}</div>
            <div className="metric-sub">{pendienteCount} transferencias</div>
          </div>
          <div className="metric-card red">
            <div className="metric-label">Bloqueados</div>
            <div className="metric-value">{bloqueadoCount}</div>
            <div className="metric-sub">perfiles suspendidos</div>
          </div>
        </div>

        {/* TABS */}
        <div className="admin-tabs" style={{overflowX:'auto', paddingBottom:4}}>
          {[
            { id:'pagos',      icon:'💳', label:'Historial',  count:completedPayments.length },
            { id:'comisiones', icon:'⏳', label:'Validar', count:pendienteCount },
            { id:'bloqueados', icon:'👥', label:'Directorio', count:users.length },
            { id:'regalos',    icon:'🎁', label:'Regalos', count: '+' },
          ].map(t => (
            <button key={t.id} className={`tab-btn${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)} style={{minWidth:70}}>
              <span className="tab-icon">{t.icon}</span>
              <span>{t.label}</span>
              <span className="tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: PAGOS (Historial Completado) ── */}
        {tab === 'pagos' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">Todos los pagos</span>
              <button className="section-action">Exportar →</button>
            </div>
            {completedPayments.length === 0 && (
               <div className="empty-admin"><p>Aún no hay transacciones validadas.</p></div>
            )}
            {completedPayments.map((p, i) => {
              const amount = p.planPriceVal || p.transferAmount || 0;
              const avatarLetter = p.proName.charAt(0).toUpperCase();
              return (
                <div className="payment-card" key={p.id} style={{animationDelay:`${i*.06}s`}}>
                  <div className="pc-top">
                    <div className="pc-avatar" style={{background:'#F26000'}}>{avatarLetter}</div>
                    <div className="pc-info">
                      <div className="pc-name">{p.proName}</div>
                      <div className="pc-detail">{p.planName || 'Plan Personalizado'} · {fmtDate(p.createdAt)}</div>
                    </div>
                    <div className="pc-right">
                      <div className="pc-total">{fmtRD(amount)}</div>
                      <span className={`method-pill ${p.method==='card'?'card':'cash'}`}>
                        {p.method==='card'?'💳 Tarjeta':'💵 Efectivo'}
                      </span>
                    </div>
                  </div>
                  <span className={`status-pill ${p.status}`}>
                    ✅ Confirmado
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB: COMISIONES PENDIENTES (Revisiones) ── */}
        {tab === 'comisiones' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">Transferencias por Validar</span>
            </div>
            {pendingPayments.length === 0 && (
              <div className="empty-admin">
                <span>🎉</span>
                <p>Sin pendientes</p>
                <small>Todos los profesionales están al día</small>
              </div>
            )}
            {pendingPayments.map((c, i) => {
              const amount = c.planPriceVal || c.transferAmount || 0;
              const avatarLetter = c.proName.charAt(0).toUpperCase();
              return (
                <div className="comision-card warning" key={c.id} style={{animationDelay:`${i*.06}s`}}>
                  <div className="cc-top">
                    <div className="cc-avatar" style={{background:'#F59E0B'}}>{avatarLetter}</div>
                    <div className="cc-info">
                      <div className="cc-name">{c.proName}</div>
                      <div className="cc-service">{c.planName || 'Compra de Plan'} · Banco {c.bank||'No disp'}</div>
                      <div style={{fontSize:12, color:'var(--brand)', marginTop:2}}>Deposita: {c.depositorName}</div>
                    </div>
                    <div className="cc-amount">{fmtRD(amount)}</div>
                  </div>
                  
                  {c.receiptUrl && (
                    <div style={{marginBottom:12}}>
                      <a href={c.receiptUrl} target="_blank" rel="noreferrer" style={{color:'var(--blue)', fontSize:12, textDecoration:'none', background:'var(--blue-dim)', padding:'4px 8px', borderRadius:8}}>
                         🖼️ Ver comprobante de pago
                      </a>
                    </div>
                  )}

                  <div className="cc-actions">
                    <button className="cc-btn remind"
                      onClick={() => showToast(`📱 Recordatorio enviado a ${c.proName}`)}>
                      📱 Mensaje
                    </button>
                    <button className="cc-btn paid"
                      onClick={() => setConfirm({type:'paid', obj:c})}>
                      ✅ Validar pago & activar
                    </button>
                    <button className="cc-btn block"
                      onClick={() => setConfirm({type:'block', obj:c})}>
                      🔴 Rechazar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB: DIRECTORIO (Todos los usuarios) ── */}
        {tab === 'bloqueados' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">Todos los profesionales</span>
            </div>
            {users.length === 0 && (
              <div className="empty-admin">
                <span>🚫</span>
                <p>No hay profesionales</p>
              </div>
            )}
            {users.map((u, i) => (
              <div className="blocked-card" key={u.id} style={{animationDelay:`${i*.06}s`, borderColor: u.planStatus==='inactive'?'rgba(239,68,68,0.25)':'rgba(255,255,255,0.1)'}}>
                <div className="bc-top">
                  <div className="cc-avatar" style={{background: u.planStatus==='inactive'?'#EF4444':'#10B981', width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:12, color:'#fff', flexShrink:0}}>
                     {u.name?u.name.charAt(0).toUpperCase():'P'}
                  </div>
                  <div className="bc-info">
                    <div className="bc-name">{u.name || 'Profesional'} {u.approved ? '✅' : '⏳'}</div>
                    <div className="bc-reason" style={{color: 'var(--muted)'}}>Contratos: {u.contracts || 0} · Tel: {u.phone}</div>
                  </div>
                </div>
                <div className="bc-actions">
                  <button className="bc-btn unblock" onClick={() => setConfirm({type:'add_contract', obj:u})}>
                    ➕ 1 Contrato
                  </button>
                  <button className="bc-btn contact" style={{color:'var(--yellow)', borderColor:'rgba(245,158,11,0.2)'}} onClick={() => setConfirm({type:'sub_contract', obj:u})}>
                    ➖ 1 Contrato
                  </button>
                </div>
                <div className="bc-actions" style={{marginTop:8}}>
                  {u.planStatus === 'inactive' || !u.approved ? (
                    <button className="bc-btn unblock"
                      onClick={() => setConfirm({type:'unblock', obj:u})}>
                      ✅ Activar
                    </button>
                  ) : (
                    <button className="bc-btn contact" style={{color:'#EF4444', borderColor:'rgba(239,68,68,0.2)'}}
                      onClick={() => setConfirm({type:'block', obj:u})}>
                      🔴 Suspender
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: REGALOS (Bonos de contratos) ── */}
        {tab === 'regalos' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">🎁 Central de Regalos</span>
            </div>
            
            <div className="gift-form">
              <label className="gift-label">1. Buscar Profesional o Usuario</label>
              <div className="ac-container">
                <div className="ac-input-wrapper">
                  <input 
                    type="text" 
                    className="gift-input" 
                    placeholder="Escribe el nombre o teléfono..." 
                    value={giftSearch} 
                    onChange={e => {
                      setGiftSearch(e.target.value);
                      setGiftUser(''); // Reset selection if typing
                      setShowAc(true);
                    }}
                    onFocus={() => setShowAc(true)}
                  />
                  {giftUser && <div style={{position:'absolute', right:16, top:16, color:'#10B981'}}>✅ Seleccionado</div>}
                </div>
                
                {showAc && giftSearch && !giftUser && (
                  <div className="ac-dropdown">
                    {users
                      .filter(u => 
                        (u.name||'').toLowerCase().includes(giftSearch.toLowerCase()) || 
                        (u.phone||'').includes(giftSearch)
                      )
                      .slice(0, 5) // Mostrar máximo 5
                      .map(u => (
                        <div key={u.id} className="ac-item" onClick={() => {
                          setGiftUser(u.id);
                          setGiftSearch(u.name || u.phone);
                          setShowAc(false);
                        }}>
                          <span className="ac-name">{u.name || 'Sin nombre'} {u.approved ? '✅' : ''}</span>
                          <span className="ac-detail">{u.service || 'Usuario'} · Tel: {u.phone}</span>
                        </div>
                      ))}
                    {users.filter(u => (u.name||'').toLowerCase().includes(giftSearch.toLowerCase()) || (u.phone||'').includes(giftSearch)).length === 0 && (
                      <div className="ac-item"><span className="ac-detail">No se encontraron resultados</span></div>
                    )}
                  </div>
                )}
              </div>

              <label className="gift-label">2. Contratos a regalar</label>
              <input type="number" className="gift-input" value={giftAmount} onChange={e => setGiftAmount(e.target.value)} min="1" />

              <label className="gift-label">3. Mensaje de Felicitación</label>
              <textarea className="gift-textarea" value={giftMessage} onChange={e => setGiftMessage(e.target.value)} />

              <button 
                className="gift-btn" 
                disabled={!giftUser || !giftAmount}
                onClick={() => setConfirm({type:'send_gift'})}
              >
                🎁 Enviar y Notificar
              </button>
            </div>
          </div>
        )}

        {/* TOAST */}
        <div className={`toast${toast?' show':''}`}>{toast}</div>

        {/* CONFIRM MODAL */}
        {confirm && (
          <div className="confirm-overlay" onClick={() => setConfirm(null)}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
              <span className="cm-icon">
                {confirm.type==='block' ? '🔴' : confirm.type==='sub_contract' ? '➖' : confirm.type==='add_contract' ? '➕' : confirm.type==='unblock' ? '✅' : '💚'}
              </span>
              <h3 className="cm-title">
                {confirm.type==='block'   ? '¿Suspender perfil?' :
                 confirm.type==='unblock' ? '¿Activar perfil?' :
                 confirm.type==='add_contract' ? '¿Sumar contrato?' :
                 confirm.type==='sub_contract' ? '¿Restar contrato?' :
                 confirm.type==='send_gift'    ? '¿Enviar regalo sorpresa?' :
                 '¿Aprobar transferencia?'}
              </h3>
              <p className="cm-sub">
                {confirm.type==='block'
                  ? `${confirm.obj.name} quedará inactivo y no recibirá trabajos.`
                  : confirm.type==='unblock'
                  ? `Se activará el perfil de ${confirm.obj.name} en el sistema.`
                  : confirm.type==='add_contract'
                  ? `Se agregará 1 contrato gratis a la cuenta de ${confirm.obj.name}.`
                  : confirm.type==='sub_contract'
                  ? `Se quitará 1 contrato de la cuenta de ${confirm.obj.name}.`
                  : confirm.type==='send_gift'
                  ? `Se enviarán ${giftAmount} contratos a este usuario y saltará el confeti en su app.`
                  : `Se marcará el pago como verificado y se agregará el plan a la cuenta de ${confirm.obj.proName}.`}
              </p>
              <button
                className={`cm-btn ${confirm.type==='block'||confirm.type==='sub_contract'?'danger':'success'}`}
                onClick={ejecutarConfirm}>
                {confirm.type==='block'   ? '🔴 Sí, suspender'    :
                 confirm.type==='unblock' ? '✅ Sí, activar' :
                 confirm.type==='add_contract' ? '➕ Sí, sumar' :
                 confirm.type==='sub_contract' ? '➖ Sí, restar' :
                 confirm.type==='send_gift' ? '🎁 Enviar ahora' :
                 '💚 Confirmar validación'}
              </button>
              <button className="cm-btn ghost" onClick={() => setConfirm(null)}>Cancelar</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}