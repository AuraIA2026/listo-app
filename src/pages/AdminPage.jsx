import { useState, useEffect } from "react";

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
`;

/* ─── DATOS MOCK ─────────────────────────────────────────── */
const MOCK_PAGOS = [
  { id:'p1', pro:'Carlos Méndez', avatar:'CM', color:'#F26000', service:'Mecánico', total:1800, metodo:'tarjeta', status:'paid',    fecha:'Hoy, 2:45 PM' },
  { id:'p2', pro:'Carmen Díaz',   avatar:'CD', color:'#3B82F6', service:'Limpieza', total:1200, metodo:'efectivo', status:'pending', fecha:'Hoy, 1:30 PM' },
  { id:'p3', pro:'Ana Rodríguez', avatar:'AR', color:'#8B5CF6', service:'Electricista', total:950, metodo:'tarjeta', status:'paid', fecha:'Ayer, 5:00 PM' },
  { id:'p4', pro:'Pedro Sánchez', avatar:'PS', color:'#10B981', service:'Plomero', total:750, metodo:'efectivo', status:'pending', fecha:'Ayer, 3:15 PM' },
];

const MOCK_COMISIONES = [
  { id:'c1', pro:'Carmen Díaz',   avatar:'CD', color:'#3B82F6', service:'Limpieza',    monto:120, horasRestantes:18, pedidoId:'#00892' },
  { id:'c2', pro:'Pedro Sánchez', avatar:'PS', color:'#10B981', service:'Plomero',     monto:75,  horasRestantes:3,  pedidoId:'#00891' },
  { id:'c3', pro:'Luis García',   avatar:'LG', color:'#F59E0B', service:'Pintor',      monto:250, horasRestantes:22, pedidoId:'#00887' },
];

const MOCK_BLOQUEADOS = [
  { id:'b1', pro:'Roberto Vásquez', avatar:'RV', color:'#EF4444', service:'Carpintero',  deuda:180, fechaBloqueo:'28 Feb 2026' },
];

/* ─── HELPERS ────────────────────────────────────────────── */
const fmtRD = (n) => `RD$${n.toLocaleString()}`;
const timerState = (h) => h <= 4 ? 'critical' : h <= 10 ? 'warning' : 'ok';
const timerPct   = (h) => Math.round((h / 24) * 100);

/* ─── COMPONENTE PRINCIPAL ───────────────────────────────── */
export default function AdminPage({ navigate }) {
  const [tab, setTab]           = useState('pagos');
  const [pagos, setPagos]       = useState(MOCK_PAGOS);
  const [comisiones, setComs]   = useState(MOCK_COMISIONES);
  const [bloqueados, setBloc]   = useState(MOCK_BLOQUEADOS);
  const [toast, setToast]       = useState('');
  const [confirm, setConfirm]   = useState(null); // { type, id, name }

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  /* Confirmar bloqueo */
  const ejecutarConfirm = () => {
    const { type, id, name } = confirm;
    if (type === 'block') {
      const com = comisiones.find(c => c.id === id);
      setComs(p => p.filter(c => c.id !== id));
      setBloc(p => [{ id:'b'+Date.now(), pro:name, avatar:name.split(' ').map(w=>w[0]).join('').slice(0,2), color:'#EF4444', service:com?.service||'', deuda:com?.monto||0, fechaBloqueo:'Hoy' }, ...p]);
      showToast(`🔴 ${name} bloqueado`);
    }
    if (type === 'unblock') {
      setBloc(p => p.filter(b => b.id !== id));
      showToast(`✅ ${name} desbloqueado`);
    }
    if (type === 'paid') {
      setComs(p => p.filter(c => c.id !== id));
      showToast(`💚 Comisión de ${name} marcada como pagada`);
    }
    setConfirm(null);
  };

  const pendienteCount = comisiones.length;
  const bloqueadoCount = bloqueados.length;

  const totalRecaudado = pagos.filter(p=>p.status==='paid').reduce((a,p)=>a+p.total*.1,0);
  const totalProfesionales = pagos.filter(p=>p.status==='paid').reduce((a,p)=>a+p.total*.9,0);
  const comisionesPendientes = comisiones.reduce((a,c)=>a+c.monto,0);

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
            <div className="metric-label">Tu comisión</div>
            <div className="metric-value">{fmtRD(Math.round(totalRecaudado))}</div>
            <div className="metric-sub">10% recaudado</div>
          </div>
          <div className="metric-card green">
            <div className="metric-label">A profesionales</div>
            <div className="metric-value">{fmtRD(Math.round(totalProfesionales))}</div>
            <div className="metric-sub">90% transferido</div>
          </div>
          <div className="metric-card yellow">
            <div className="metric-label">Comisiones pend.</div>
            <div className="metric-value">{fmtRD(comisionesPendientes)}</div>
            <div className="metric-sub">{pendienteCount} profesionales</div>
          </div>
          <div className="metric-card red">
            <div className="metric-label">Bloqueados</div>
            <div className="metric-value">{bloqueadoCount}</div>
            <div className="metric-sub">perfiles suspendidos</div>
          </div>
        </div>

        {/* TABS */}
        <div className="admin-tabs">
          {[
            { id:'pagos',      icon:'💳', label:'Pagos',      count:pagos.length },
            { id:'comisiones', icon:'⏳', label:'Pendientes', count:pendienteCount },
            { id:'bloqueados', icon:'🔴', label:'Bloqueados',  count:bloqueadoCount },
          ].map(t => (
            <button key={t.id} className={`tab-btn${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
              <span className="tab-icon">{t.icon}</span>
              <span>{t.label}</span>
              <span className="tab-count">{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: PAGOS ── */}
        {tab === 'pagos' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">Todos los pagos</span>
              <button className="section-action">Exportar →</button>
            </div>
            {pagos.map((p, i) => {
              const mine = Math.round(p.total * 0.1);
              const pro  = Math.round(p.total * 0.9);
              return (
                <div className="payment-card" key={p.id} style={{animationDelay:`${i*.06}s`}}>
                  <div className="pc-top">
                    <div className="pc-avatar" style={{background:p.color}}>{p.avatar}</div>
                    <div className="pc-info">
                      <div className="pc-name">{p.pro}</div>
                      <div className="pc-detail">{p.service} · {p.fecha}</div>
                    </div>
                    <div className="pc-right">
                      <div className="pc-total">{fmtRD(p.total)}</div>
                      <span className={`method-pill ${p.metodo==='tarjeta'?'card':'cash'}`}>
                        {p.metodo==='tarjeta'?'💳 Tarjeta':'💵 Efectivo'}
                      </span>
                    </div>
                  </div>
                  <div className="pc-split">
                    <div className="split-item mine">
                      <div className="split-label">Tu parte</div>
                      <div className="split-amount">{fmtRD(mine)}</div>
                      <div className="split-pct">10%</div>
                    </div>
                    <div className="split-item pro">
                      <div className="split-label">Profesional</div>
                      <div className="split-amount">{fmtRD(pro)}</div>
                      <div className="split-pct">90%</div>
                    </div>
                  </div>
                  <span className={`status-pill ${p.status}`}>
                    {p.status==='paid' ? '✅ Pagado' : '⏳ Pendiente confirmación'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB: COMISIONES PENDIENTES ── */}
        {tab === 'comisiones' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">Efectivo — cobro pendiente</span>
            </div>
            {comisiones.length === 0 && (
              <div className="empty-admin">
                <span>🎉</span>
                <p>Sin pendientes</p>
                <small>Todos los profesionales están al día</small>
              </div>
            )}
            {comisiones.map((c, i) => {
              const state = timerState(c.horasRestantes);
              const pct   = timerPct(c.horasRestantes);
              return (
                <div className={`comision-card${state==='critical'?' critical':''}`} key={c.id} style={{animationDelay:`${i*.06}s`}}>
                  <div className="cc-top">
                    <div className="cc-avatar" style={{background:c.color}}>{c.avatar}</div>
                    <div className="cc-info">
                      <div className="cc-name">{c.pro}</div>
                      <div className="cc-service">{c.service} · Pedido {c.pedidoId}</div>
                    </div>
                    <div className="cc-amount">{fmtRD(c.monto)}</div>
                  </div>

                  <div className="timer-bar-wrap">
                    <div className="timer-label">
                      <span>⏱ Tiempo restante</span>
                      <span className={state}>{c.horasRestantes}h restantes</span>
                    </div>
                    <div className="timer-track">
                      <div className={`timer-fill ${state}`} style={{width:`${pct}%`}} />
                    </div>
                  </div>

                  <div className="cc-actions">
                    <button className="cc-btn remind"
                      onClick={() => showToast(`📱 Recordatorio enviado a ${c.pro}`)}>
                      📱 Recordar
                    </button>
                    <button className="cc-btn paid"
                      onClick={() => setConfirm({type:'paid', id:c.id, name:c.pro})}>
                      ✅ Marcar pagado
                    </button>
                    <button className="cc-btn block"
                      onClick={() => setConfirm({type:'block', id:c.id, name:c.pro})}>
                      🔴 Bloquear
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB: BLOQUEADOS ── */}
        {tab === 'bloqueados' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">Perfiles suspendidos</span>
            </div>
            {bloqueados.length === 0 && (
              <div className="empty-admin">
                <span>✅</span>
                <p>Sin bloqueados</p>
                <small>Ningún perfil está suspendido</small>
              </div>
            )}
            {bloqueados.map((b, i) => (
              <div className="blocked-card" key={b.id} style={{animationDelay:`${i*.06}s`}}>
                <div className="bc-top">
                  <div className="cc-avatar" style={{background:b.color, width:40, height:40, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:12, color:'#fff', flexShrink:0}}>{b.avatar}</div>
                  <div className="bc-info">
                    <div className="bc-name">{b.pro}</div>
                    <div className="bc-reason">⛔ Comisión no pagada · {b.fechaBloqueo}</div>
                  </div>
                  <div className="bc-debt">{fmtRD(b.deuda)}</div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}>
                  <span className="blocked-icon">BLOQUEADO</span>
                  <span style={{fontSize:12,color:'var(--muted)'}}>No puede recibir pedidos</span>
                </div>
                <div className="bc-actions">
                  <button className="bc-btn contact"
                    onClick={() => showToast(`📞 Contactando a ${b.pro}...`)}>
                    📞 Contactar
                  </button>
                  <button className="bc-btn unblock"
                    onClick={() => setConfirm({type:'unblock', id:b.id, name:b.pro})}>
                    ✅ Desbloquear
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TOAST */}
        <div className={`toast${toast?' show':''}`}>{toast}</div>

        {/* CONFIRM MODAL */}
        {confirm && (
          <div className="confirm-overlay" onClick={() => setConfirm(null)}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
              <span className="cm-icon">
                {confirm.type==='block' ? '🔴' : confirm.type==='unblock' ? '✅' : '💚'}
              </span>
              <h3 className="cm-title">
                {confirm.type==='block'   ? '¿Bloquear perfil?' :
                 confirm.type==='unblock' ? '¿Desbloquear perfil?' :
                 '¿Marcar como pagado?'}
              </h3>
              <p className="cm-sub">
                {confirm.type==='block'
                  ? `${confirm.name} no podrá recibir nuevos pedidos hasta que pague su comisión.`
                  : confirm.type==='unblock'
                  ? `${confirm.name} podrá volver a recibir pedidos normalmente.`
                  : `Confirmas que ${confirm.name} pagó su comisión en efectivo.`}
              </p>
              <button
                className={`cm-btn ${confirm.type==='block'?'danger':'success'}`}
                onClick={ejecutarConfirm}>
                {confirm.type==='block'   ? '🔴 Sí, bloquear'    :
                 confirm.type==='unblock' ? '✅ Sí, desbloquear' :
                 '💚 Confirmar pago'}
              </button>
              <button className="cm-btn ghost" onClick={() => setConfirm(null)}>Cancelar</button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}