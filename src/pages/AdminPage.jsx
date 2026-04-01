import React, { useState, useEffect, Component } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorStr: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, errorStr: error.toString() + '\\n' + error.stack };
  }
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: 40, background: '#fff', color: '#EF4444', minHeight: '100vh'}}>
          <h1>CRASH REPORTED</h1>
          <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{this.state.errorStr}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ─── ESTILOS ─────────────────────────────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#F8FAFC;
  --surface:#FFFFFF;
  --surface2:#F1F5F9;
  --border:rgba(0,0,0,0.08);
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
  --text:#1E293B;
  --muted:#64748B;
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
  background:rgba(255,255,255,0.92);
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
  background:var(--surface2);
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
.payment-card:hover{border-color:rgba(0,0,0,0.15);box-shadow:0 4px 12px rgba(0,0,0,0.03);}

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
.cc-btn.remind:hover{color:var(--text);border-color:var(--border);background:#E2E8F0;}
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
.bc-btn.contact:hover{color:var(--text);background:#E2E8F0;}

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
  background:var(--surface);border:1px solid var(--border);
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
  background:var(--surface);
  border:1px solid var(--border);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
  border-radius:24px;padding:32px;
}
.gift-label{display:block;font-family:var(--display);font-size:13px;font-weight:700;color:var(--muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;}
.gift-input, .gift-textarea{
  width:100%;background:var(--surface2);border:1px solid var(--border);
  color:var(--text);border-radius:16px;padding:16px;font-family:var(--body);font-size:15px;
  margin-bottom:24px;outline:none;transition:all .3s ease;
}
.gift-input:focus, .gift-textarea:focus{border-color:var(--yellow);box-shadow:0 0 0 4px rgba(245,158,11,0.1);background:var(--surface);}
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
  position:absolute; top:100%; left:0; right:0; background:var(--surface); border:1px solid var(--border);
  border-radius:12px; margin-top:8px; max-height:220px; overflow-y:auto; z-index:999;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
}
.ac-item {
  padding:12px 16px; border-bottom:1px solid var(--border); cursor:pointer;
  display:flex; align-items:center; gap:12px; transition:background .2s;
}
.ac-item:last-child { border-bottom:none; }
.ac-item:hover { background:var(--surface2); }
.ac-avatar {
  width:36px; height:36px; border-radius:10px; background:var(--yellow); display:flex; align-items:center; justifyContent:center;
  color:#000; font-family:var(--display); font-weight:800; overflow:hidden; flex-shrink:0;
}
.ac-avatar img { width:100%; height:100%; object-fit:cover; }
.ac-text { display:flex; flex-direction:column; gap:4px; }
.ac-name { font-size:14px; font-weight:700; color:var(--text); }
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
  const [verifications, setVerifications] = useState([]); // Nuevos postulantes
  const [toast, setToast]       = useState('');
  const [confirm, setConfirm]   = useState(null); // { type, obj }
  const [viewDocs, setViewDocs] = useState(null); // Usuario a inspeccionar documentos

  // Seguridad
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [passError, setPassError] = useState(false);

  // Búsqueda en Directorio
  const [dirSearch, setDirSearch] = useState('');
  const [showDirAc, setShowDirAc] = useState(false);
  
  // Razón de Suspensión
  const [blockReason, setBlockReason] = useState('');

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

    // 2. Escuchar Usuarios (TODOS, para poder regalar a usuarios normales)
    const unsubUsers = onSnapshot(query(collection(db, 'users')), (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(arr);
    });

    // 3. Escuchar Nuevas Postulaciones a Profesionales
    const unsubVerif = onSnapshot(query(collection(db, 'users'), where('verificacion.estado', '==', 'en_revision')), (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setVerifications(arr);
    });

    return () => { unsubPay(); unsubUsers(); unsubVerif(); };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (adminPass === 'SoyArte(20251975)') {
      setIsAuthenticated(true);
      setPassError(false);
    } else {
      setPassError(true);
    }
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
      
      if (type === 'approve_verif') {
        const payload = {
          role: 'professional',
          type: 'pro',
          profileComplete: true,
          approved: true,
          planStatus: 'active',
          'verificacion.estado': 'aprobada',
          'verificacion.fechaAprobacion': new Date().toISOString()
        };
        // Solo establecer bonos si el profesional no ha sido aprobado previamente
        if (!obj.approved) {
           payload.contracts = 5;
           payload.rating = 5.0;
           payload.completedJobs = 0;
           payload.pendingJobs = 0;
        }
        // También copias su nombre y teléfono principal al nivel raíz si no existen
        if (obj.verificacion?.nombre) payload.name = obj.verificacion.nombre;
        if (obj.verificacion?.telefono) payload.phone = obj.verificacion.telefono;
        if (obj.verificacion?.cedula) payload.cedula = obj.verificacion.cedula;
        if (obj.verificacion?.docs?.selfie) payload.photoURL = obj.verificacion.docs.selfie;

        await updateDoc(doc(db, 'users', obj.id), payload);
        showToast(`🎉 ¡${obj.verificacion?.nombre || 'El usuario'} ahora es Profesional!`);
        setViewDocs(null); // Cerrar modal
      }

      if (type === 'reject_verif') {
        await updateDoc(doc(db, 'users', obj.id), {
          'verificacion.estado': 'rechazada',
          'verificacion.fechaOculto': new Date().toISOString()
        });
        showToast(`🔴 Postulación rechazada`);
        setViewDocs(null); // Cerrar modal
      }
      
      if (type === 'block') {
         await updateDoc(doc(db, 'users', obj.id), { 
            planStatus: 'inactive', 
            approved: false,
            blockReason: blockReason.trim()
         });
         showToast(`🔴 ${obj.name} marcado como suspendido`);
         setBlockReason(''); // Resetear
      }
      if (type === 'reject_payment') {
         await updateDoc(doc(db, 'payments', obj.id), { status: 'rejected' });
         showToast(`🔴 Pago de ${obj.proName} rechazado`);
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
      
      if (type === 'remind') {
         import('firebase/firestore').then(({ addDoc, collection }) => {
           addDoc(collection(db, 'notificaciones'), {
              userId: obj.proId || obj.userId || obj.id,
              type: 'system',
              title: 'Recordatorio Administrativo',
              text: 'Hola socio, te recordamos completar tu proceso pendiente o pago en la plataforma de Listo para evitar suspensiones. Gracias.',
              date: new Date().toISOString(),
              read: false
           });
         });
         showToast(`📱 Recordatorio In-App enviado a ${obj.name || obj.proName || 'Usuario'}`);
      }
    } catch(err) {
      console.error(err);
      showToast('❌ Ocurrió un error en la base de datos');
    }
  };

  // Separemos los pagos en completados y pendientes
  const completedPayments = payments.filter(p => p.status === 'paid');
  const pendingPayments   = payments.filter(p => p.status === 'pending');
  // Usuarios bloqueados/pendientes de aprobar (solo profesionales)
  const blockedUsers      = users.filter(u => u.role === 'professional' && (!u.approved || u.planStatus === 'inactive'));

  const pendienteCount = pendingPayments.length;
  const bloqueadoCount = blockedUsers.length;

  const totalVentas = completedPayments.reduce((a,p) => a + (p.planPriceVal || p.transferAmount || 0), 0);
  const planesVendidos = completedPayments.length;
  const planesPorVerificar = pendingPayments.reduce((a,p) => a + (p.planPriceVal || p.transferAmount || 0), 0);

  if (!isAuthenticated) {
    return (
      <>
        <style>{css}</style>
        <div className="admin-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 20 }}>
          <div style={{ background: 'var(--surface)', padding: '50px 40px', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid var(--border)', width: '100%', maxWidth: 400, textAlign: 'center', animation: 'slideUp 0.4s ease' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🛡️</div>
            <h2 style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Acceso Restringido</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 32 }}>Ingresa la clave maestra para poder administrar la plataforma Listo y los contratos.</p>
            <form onSubmit={handleLogin}>
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={adminPass} 
                onChange={e => { setAdminPass(e.target.value); setPassError(false); }}
                style={{ width: '100%', padding: '16px 20px', borderRadius: 16, border: `1px solid ${passError ? 'var(--red)' : 'var(--border)'}`, background: 'var(--surface2)', color: 'var(--text)', fontSize: 16, fontFamily: 'var(--mono)', marginBottom: 16, outline: 'none' }}
                autoFocus
              />
              {passError && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: -8, marginBottom: 16, textAlign: 'left', fontWeight: 'bold' }}>Clave incorrecta. Inténtalo de nuevo.</p>}
              <button type="submit" style={{ width: '100%', padding: 18, background: 'linear-gradient(135deg, var(--brand), #C24E00)', color: '#fff', border: 'none', borderRadius: 16, fontSize: 16, fontWeight: 800, fontFamily: 'var(--display)', cursor: 'pointer', boxShadow: '0 8px 16px var(--brand-dim)' }}>
                Desbloquear Panel
              </button>
            </form>
            <button onClick={() => navigate && navigate('profile')} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, marginTop: 24, cursor: 'pointer', textDecoration: 'underline' }}>Regresar a la App Segura</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <ErrorBoundary>
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
            { id:'postulaciones', icon:'🛡️', label:'Nuevos', count:verifications.length },
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

        {/* ── TAB: POSTULACIONES (Aprobar Nuevos Profesionales) ── */}
        {tab === 'postulaciones' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">Nuevas Solicitudes ({verifications.length})</span>
            </div>
            {verifications.length === 0 && (
              <div className="empty-admin"><p>No hay postulaciones nuevas por revisar.</p></div>
            )}
            {verifications.map((v, i) => {
              const vf = v.verificacion || {};
              const docsInfo = vf.docs || {};
              const numDocs = Object.keys(docsInfo).filter(k => docsInfo[k]).length;
              return (
                <div className="payment-card" key={v.id} style={{animationDelay:`${i*.06}s`, borderColor:'rgba(59,130,246,0.3)'}}>
                  <div className="pc-top" style={{alignItems:'center'}}>
                    <div className="pc-avatar" style={{background:'#3B82F6', backgroundImage: `url(${docsInfo.selfie})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                      {!docsInfo.selfie && '🛡️'}
                    </div>
                    <div className="pc-info">
                      <div className="pc-name">{vf.nombre || 'Sin nombre'}</div>
                      <div className="pc-detail">{vf.cedula || 'Sin cédula'} · {vf.direccion}</div>
                    </div>
                    <div className="pc-right">
                      <button className="cc-btn remind" style={{background:'#3B82F6', color:'#fff', border:'none', padding:'6px 12px', fontSize:'11px'}} onClick={() => setViewDocs(v)}>
                        🔎 Revisar
                      </button>
                    </div>
                  </div>
                  <div style={{fontSize:'11px', color:'var(--muted)', marginTop:8, display:'flex', gap:6}}>
                    <span style={{background:'rgba(255,255,255,0.05)', padding:'3px 8px', borderRadius:20}}>📸 {numDocs} documentos adjuntos</span>
                    <span style={{background:'rgba(255,255,255,0.05)', padding:'3px 8px', borderRadius:20}}>📞 {vf.telefono}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MODAL: REVISIÓN DE DOCUMENTOS ── */}
        {viewDocs && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:999, display:'flex', flexDirection:'column',backdropFilter:'blur(5px)'}} onClick={() => setViewDocs(null)}>
            <div style={{background:'var(--surface)', width:'100%', maxWidth:500, margin:'auto', borderRadius:20, padding:20, maxHeight:'90vh', overflowY:'auto', border:'1px solid var(--border)'}} onClick={e => e.stopPropagation()}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
                <h3 style={{fontSize:18, fontWeight:800, fontFamily:'var(--display)', color:'var(--text)', margin:0}}>Expediente de Profesional</h3>
                <button onClick={() => setViewDocs(null)} style={{background:'none', border:'none', color:'var(--text)', fontSize:20, cursor:'pointer'}}>✕</button>
              </div>

              <div style={{background:'var(--surface2)', padding:16, borderRadius:12, marginBottom:16}}>
                <p style={{margin:'0 0 4px', fontSize:14}}><strong style={{color:'var(--brand)'}}>Nombre:</strong> {viewDocs.verificacion?.nombre}</p>
                <p style={{margin:'0 0 4px', fontSize:14}}><strong style={{color:'var(--brand)'}}>Cédula:</strong> {viewDocs.verificacion?.cedula}</p>
                <p style={{margin:'0 0 4px', fontSize:14}}><strong style={{color:'var(--brand)'}}>Dirección:</strong> {viewDocs.verificacion?.direccion}, {viewDocs.verificacion?.sector}</p>
                <p style={{margin:'0 0 4px', fontSize:14}}><strong style={{color:'var(--brand)'}}>Contacto:</strong> {viewDocs.verificacion?.telefono} {viewDocs.verificacion?.telefonoAlt ? ` / ${viewDocs.verificacion.telefonoAlt}` : ''}</p>
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:12, marginBottom:20}}>
                {viewDocs.verificacion?.docs?.cedulaFrontal && (
                  <div><span style={{fontSize:12, color:'#aaa', display:'block', marginBottom:4}}>Cédula: Frente</span>
                  <img src={viewDocs.verificacion.docs.cedulaFrontal} style={{width:'100%', borderRadius:8, border:'1px solid #333'}} alt="Frente"/></div>
                )}
                {viewDocs.verificacion?.docs?.cedulaTrasera && (
                  <div><span style={{fontSize:12, color:'#aaa', display:'block', marginBottom:4}}>Cédula: Reverso</span>
                  <img src={viewDocs.verificacion.docs.cedulaTrasera} style={{width:'100%', borderRadius:8, border:'1px solid #333'}} alt="Reverso"/></div>
                )}
                {viewDocs.verificacion?.docs?.selfie && (
                  <div><span style={{fontSize:12, color:'#aaa', display:'block', marginBottom:4}}>Selfie de Autenticidad</span>
                  <img src={viewDocs.verificacion.docs.selfie} style={{width:'100%', borderRadius:8, border:'1px solid #333'}} alt="Selfie"/></div>
                )}
                {viewDocs.verificacion?.docs?.buenaConducta && (
                  <div><span style={{fontSize:12, color:'#aaa', display:'block', marginBottom:4}}>Certificado de Buena Conducta</span>
                  {viewDocs.verificacion.docs.buenaConducta.includes('.pdf') 
                    ? <a href={viewDocs.verificacion.docs.buenaConducta} target="_blank" rel="noreferrer" style={{color:'#3B82F6'}}>📄 Ver PDF Buena Conducta</a>
                    : <img src={viewDocs.verificacion.docs.buenaConducta} style={{width:'100%', borderRadius:8, border:'1px solid #333'}} alt="Antecedentes"/>}
                  </div>
                )}
              </div>

              <div style={{display:'flex', gap:10}}>
                <button onClick={() => setConfirm({type:'approve_verif', obj: viewDocs})} style={{flex:1, background:'#10B981', color:'#fff', padding:14, borderRadius:12, border:'none', fontSize:14, fontWeight:800, cursor:'pointer'}}>✅ APROBAR</button>
                <button onClick={() => setConfirm({type:'reject_verif', obj: viewDocs})} style={{flex:1, background:'#EF4444', color:'#fff', padding:14, borderRadius:12, border:'none', fontSize:14, fontWeight:800, cursor:'pointer'}}>❌ RECHAZAR</button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: PAGOS (Historial Completado) ── */}
        {tab === 'pagos' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">Todos los pagos</span>
              <button className="section-action" onClick={() => showToast('⏳ Exportación CSV en desarrollo')}>Exportar →</button>
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
                      onClick={() => setConfirm({type:'remind', obj:c})}>
                      📱 Mensaje
                    </button>
                    <button className="cc-btn paid"
                      onClick={() => setConfirm({type:'paid', obj:c})}>
                      ✅ Validar
                    </button>
                    <button className="cc-btn block"
                      onClick={() => setConfirm({type:'reject_payment', obj:c})}>
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

            <div className="ac-container">
              <div className="ac-input-wrapper">
                <input 
                  type="text" 
                  className="gift-input" 
                  placeholder="Buscar profesional (escribe el nombre)..." 
                  value={dirSearch} 
                  onChange={e => {
                    setDirSearch(e.target.value);
                    setShowDirAc(true);
                  }}
                  onFocus={() => setShowDirAc(true)}
                  style={{marginBottom: 16}}
                />
              </div>
              
              {showDirAc && dirSearch && (
                <div className="ac-dropdown">
                  {users
                    .filter(u => u.role === 'professional')
                    .filter(u => {
                      const term = dirSearch.toLowerCase().trim();
                      return String(u.name||'').toLowerCase().includes(term) || String(u.phone||'').includes(term);
                    })
                    .slice(0, 8)
                    .map(u => (
                      <div key={u.id} className="ac-item" onClick={() => {
                        setDirSearch(u.name || u.phone);
                        setShowDirAc(false);
                      }}>
                        <div className="ac-avatar">
                          {u.profilePic || u.photoURL || u.avatarId ? (
                             <img src={u.profilePic || u.photoURL || `https://i.pravatar.cc/100?u=${u.avatarId||u.id}`} alt="pro" />
                          ) : (
                             (u.name ? u.name.charAt(0).toUpperCase() : 'P')
                          )}
                        </div>
                        <div className="ac-text">
                          <span className="ac-name">{u.name || 'Sin nombre'} {u.approved ? '✅' : ''}</span>
                          <span className="ac-detail">{u.service || 'Usuario'} · Tel: {u.phone}</span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {users.filter(u => u.role === 'professional').filter(u => !dirSearch || String(u.name||'').toLowerCase().includes(dirSearch.toLowerCase().trim()) || String(u.phone||'').includes(dirSearch.trim())).length === 0 && (
              <div className="empty-admin">
                <span>🚫</span>
                <p>No se encontraron resultados</p>
              </div>
            )}
            
            {users
              .filter(u => u.role === 'professional')
              .filter(u => !dirSearch || String(u.name||'').toLowerCase().includes(dirSearch.toLowerCase().trim()) || String(u.phone||'').includes(dirSearch.trim()))
              .map((u, i) => (
              <div className="blocked-card" key={u.id} style={{animationDelay:`${i*.06}s`, borderColor: u.planStatus==='inactive'?'rgba(239,68,68,0.25)':'var(--border)'}}>
                <div className="bc-top">
                  <div className="cc-avatar" style={{background: u.planStatus==='inactive'?'#EF4444':'var(--green)', width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:12, color:'#fff', flexShrink:0, overflow:'hidden'}}>
                     {u.profilePic || u.photoURL || u.avatarId ? (
                        <img src={u.profilePic || u.photoURL || `https://i.pravatar.cc/100?u=${u.avatarId||u.id}`} alt="pro" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                     ) : (
                        u.name?u.name.charAt(0).toUpperCase():'P'
                     )}
                  </div>
                  <div className="bc-info">
                    <div className="bc-name">{u.name || 'Profesional'} {u.approved ? '✅' : '⏳'} {u.verificacion?.estado === 'en_revision' ? '⚠️' : ''}</div>
                    <div className="bc-reason" style={{color: 'var(--muted)'}}>Contratos: {u.contracts || 0} · Tel: {u.phone} {u.verificacion?.estado === 'en_revision' ? '· (Pendiente revisar doc)' : ''}</div>
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
                  {u.verificacion && (
                    <button className="bc-btn contact" style={{background:'#3B82F6', color:'#fff', border:'none'}}
                      onClick={() => setViewDocs(u)}>
                      🔎 Expediente
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
                      .filter(u => {
                        const term = giftSearch.toLowerCase().trim();
                        const userName = String(u.name || '').toLowerCase();
                        const userPhone = String(u.phone || '').toLowerCase();
                        const userService = String(u.service || '').toLowerCase();
                        return userName.includes(term) || userPhone.includes(term) || userService.includes(term);
                      })
                      .slice(0, 10) // Mostrar máximo 10
                      .map(u => (
                        <div key={u.id} className="ac-item" onClick={() => {
                          setGiftUser(u.id);
                          setGiftSearch(u.name || u.phone);
                          setShowAc(false);
                        }}>
                          <div className="ac-avatar">
                            {u.profilePic || u.photoURL || u.avatarId ? (
                               <img src={u.profilePic || u.photoURL || `https://i.pravatar.cc/100?u=${u.avatarId||u.id}`} alt="pro" />
                            ) : (
                               (u.name ? String(u.name).charAt(0).toUpperCase() : 'P')
                            )}
                          </div>
                          <div className="ac-text">
                            <span className="ac-name">{u.name || 'Sin nombre'} {u.approved ? '✅' : ''}</span>
                            <span className="ac-detail">{u.service || 'Usuario'} · Tel: {u.phone}</span>
                          </div>
                        </div>
                      ))}
                    {users.filter(u => {
                      const term = giftSearch.toLowerCase().trim();
                      const userName = String(u.name || '').toLowerCase();
                      const userPhone = String(u.phone || '').toLowerCase();
                      const userService = String(u.service || '').toLowerCase();
                      return userName.includes(term) || userPhone.includes(term) || userService.includes(term);
                    }).length === 0 && (
                      <div className="ac-item"><div className="ac-text"><span className="ac-detail">No se encontraron resultados</span></div></div>
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
          <div className="confirm-overlay" onClick={() => {setConfirm(null); setBlockReason('');}}>
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
                 confirm.type==='remind'       ? '¿Enviar Recordatorio?' :
                 confirm.type==='reject_payment' ? '¿Rechazar Pago?' :
                 confirm.type==='approve_verif' ? '¿Aprobar Profesional?' :
                 confirm.type==='reject_verif' ? '¿Rechazar Verificación?' :
                 '¿Aprobar transferencia?'}
              </h3>
              <p className="cm-sub">
                {confirm.type==='block'
                  ? `Estás a punto de suspender a ${confirm.obj.name} (${confirm.obj.service || 'Profesional'}). Quedará inactivo.`
                  : confirm.type==='unblock'
                  ? `Se activará el perfil de ${confirm.obj.name} en el sistema.`
                  : confirm.type==='add_contract'
                  ? `Se agregará 1 contrato gratis a la cuenta de ${confirm.obj.name}.`
                  : confirm.type==='sub_contract'
                  ? `Se quitará 1 contrato de la cuenta de ${confirm.obj.name}.`
                  : confirm.type==='send_gift'
                  ? `Se enviarán ${giftAmount} contratos a este usuario y saltará el confeti en su app.`
                  : confirm.type==='remind'
                  ? `Se enviará una notificación In-App al celular de ${confirm.obj.name || confirm.obj.proName} recordándole que termine el proceso.`
                  : confirm.type==='reject_payment'
                  ? `El pago de la comisión de ${confirm.obj.proName} será rechazado.`
                  : confirm.type==='approve_verif'
                  ? `El usuario ${confirm.obj.verificacion?.nombre || 'este perfil'} será promovido a Profesional Premium y se le recargarán contratos iniciales.`
                  : confirm.type==='reject_verif'
                  ? `Se rechazará esta verificación y el usuario tendrá que intentar de nuevo.`
                  : `Se marcará el pago como verificado y se agregará el plan a la cuenta de ${confirm.obj.proName}.`}
              </p>

              {confirm.type === 'block' && (
                <div style={{textAlign: 'left', margin: '-8px 0 24px'}}>
                  <label className="gift-label" style={{fontSize: 12}}>Motivo de la suspensión (Visible para auditoría)</label>
                  <textarea 
                    className="gift-textarea" 
                    placeholder="Escribe la razón detallada del bloqueo..." 
                    value={blockReason} 
                    onChange={e => setBlockReason(e.target.value)}
                    style={{marginBottom: 0, minHeight: 80}}
                  />
                </div>
              )}

              <button
                className={`cm-btn ${confirm.type==='block'||confirm.type==='sub_contract'||confirm.type==='reject_payment'||confirm.type==='reject_verif'?'danger':'success'}`}
                disabled={confirm.type === 'block' && !blockReason.trim()}
                onClick={ejecutarConfirm}>
                {confirm.type==='block'   ? '🔴 Sí, suspender'    :
                 confirm.type==='unblock' ? '✅ Sí, activar' :
                 confirm.type==='add_contract' ? '➕ Sí, sumar' :
                 confirm.type==='sub_contract' ? '➖ Sí, restar' :
                 confirm.type==='send_gift' ? '🎁 Enviar ahora' :
                 confirm.type==='remind' ? '📱 Enviar Recordatorio' :
                 confirm.type==='reject_payment' ? '🔴 Rechazar Pago' :
                 confirm.type==='approve_verif' ? '✅ Aprobar Profesional' :
                 confirm.type==='reject_verif' ? '❌ Sí, rechazar' :
                 '💚 Confirmar validación'}
              </button>
              <button className="cm-btn ghost" onClick={() => {setConfirm(null); setBlockReason('');}}>Cancelar</button>
            </div>
          </div>
        )}

      </div>
    </ErrorBoundary>
  );
}