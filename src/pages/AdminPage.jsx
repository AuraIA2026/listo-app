import React, { useState, useEffect, Component } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, addDoc } from 'firebase/firestore';
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

/* ── MODAL CENTRAL DE MANDO ── */
.pro-stats-modal {
  background: var(--surface); border: 1px solid rgba(242,96,0,0.3); border-radius: 24px;
  width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; margin: auto;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2); animation: scaleUp .3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.ps-header {
  background: linear-gradient(135deg, #111827, #1E293B); color: #fff; padding: 24px;
  border-radius: 24px 24px 0 0; position: relative; display:flex; align-items:center; gap: 16px;
}
.ps-close {
  position: absolute; top: 16px; right: 20px; font-size: 24px; color: rgba(255,255,255,0.5);
  background: none; border: none; cursor: pointer; transition: color .2s;
}
.ps-close:hover { color: #fff; }
.ps-avatar {
  width: 64px; height: 64px; border-radius: 18px; border: 2px solid rgba(255,255,255,0.2);
  display: flex; align-items: center; justify-content: center; font-family: var(--display);
  font-weight: 800; font-size: 24px; background: rgba(255,255,255,0.1); overflow: hidden;
}
.ps-info-top h3 { font-family: var(--display); font-size: 20px; font-weight: 800; margin: 0 0 4px; }
.ps-info-top p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.7); }
.ps-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 20px; }
.ps-metric { background: var(--surface2); padding: 16px; border-radius: 16px; border: 1px solid var(--border); text-align: center; }
.ps-metric-val { font-family: var(--mono); font-size: 24px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.ps-metric-label { font-family: var(--display); font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; }

/* Dashboard Cards */
.dash-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
  padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all .2s;
  display: flex; align-items: center; gap: 16px;
}
.dash-card:hover { border-color: var(--brand); box-shadow: 0 6px 12px var(--brand-dim); transform: translateY(-2px); }
.dash-avatar {
  width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 16px; background: var(--surface2); color: var(--text); overflow: hidden; flex-shrink:0;
}
.dash-info { flex: 1; }
.dash-name { font-family: var(--display); font-size: 15px; font-weight: 700; margin-bottom: 2px; color: var(--text); }
.dash-sub { font-size: 12px; color: var(--muted); }
.dash-status { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink:0; }
.dash-pill { padding: 4px 8px; border-radius: 8px; font-size: 10px; font-weight: 700; letter-spacing: .5px; }
.dash-pill.online { background: #DCFCE7; color: #166534; }
.dash-pill.offline { background: #F1F5F9; color: #475569; }
.dash-pill.working { background: #FEF08A; color: #854D0E; }
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
  const [reports, setReports]   = useState([]); // Quejas y Reportes de Usuarios
  const [editRequests, setEditRequests] = useState([]); // Solicitudes de Edición
  const [toast, setToast]       = useState('');
  const [confirm, setConfirm]   = useState(null); // { type, obj }
  const [viewDocs, setViewDocs] = useState(null); // Usuario a inspeccionar documentos
  const [viewProStats, setViewProStats] = useState(null); // Modal avanzado de central de mando
  const [psFilter, setPsFilter] = useState('all'); // Filtros rápidos
  const [psLimit, setPsLimit] = useState(20); // Paginación
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Cambiado a true para evitar contraseña por ahora
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

  // Formulario de Notificaciones Mensajes
  const [notifyTarget, setNotifyTarget] = useState('single'); // single, all_clients, all_pros, all_users
  const [notifyUser, setNotifyUser] = useState('');
  const [notifySearch, setNotifySearch] = useState('');
  const [showNotifyAc, setShowNotifyAc] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('Hola, Bienvenido a Listo Patrón. Para comenzar a generar dinero de inmediato debes completar tu perfil. ¡Te esperamos!');

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

    // 4. Escuchar Quejas / Reportes
    const unsubReps = onSnapshot(query(collection(db, 'reports'), orderBy('createdAt', 'desc')), (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReports(arr);
    });

    // 5. Escuchar Solicitudes de Edición
    const unsubEdits = onSnapshot(query(collection(db, 'profile_edit_requests'), orderBy('createdAt', 'desc')), (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEditRequests(arr);
    });

    return () => { unsubPay(); unsubUsers(); unsubVerif(); unsubReps(); unsubEdits(); };
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
      
      if (type === 'resolve_report') {
        await updateDoc(doc(db, 'reports', obj.id), { status: 'resolved' });
        showToast('✅ Queja resuelta y archivada');
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
        if (obj.verificacion?.nombre && !obj.name) payload.name = obj.verificacion.nombre;
        if (obj.verificacion?.telefono && !obj.phone) payload.phone = obj.verificacion.telefono;
        if (obj.verificacion?.cedula) payload.cedula = obj.verificacion.cedula;
        
        // CORRECCIÓN: NO sobrescribir la foto de perfil bonita con la selfie de la cédula, a menos que el usuario no tenga ninguna foto.
        if (obj.verificacion?.docs?.selfie && !obj.photoURL) {
            payload.photoURL = obj.verificacion.docs.selfie;
        }

        await updateDoc(doc(db, 'users', obj.id), payload);

        // Notificar al usuario sobre su éxito en verificación
        await addDoc(collection(db, 'notificaciones'), {
          userId: obj.id,
          type: 'system',
          title: '🚨 ¡Perfil Aprobado! 🎉',
          text: 'Tu perfil ha sido aprobado por el administrador. ¡Ahora puedes postularte a un plan para recibir clientes!',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(), // o serverTimestamp()
          read: false
        });

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

      if (type === 'send_notification') {
            if (notifyTarget === 'single') {
                 const u = users.find(x => x.id === notifyUser);
                 if (u) {
                     await addDoc(collection(db, 'notificaciones'), {
                        userId: notifyUser,
                        type: 'system',
                        title: 'Mensaje de Listo Patrón',
                        text: notifyMessage,
                        date: new Date().toISOString(),
                        read: false
                     });
                     showToast(`📨 Notificación enviada a ${u.name || 'Usuario'}`);
                 }
            } else {
                 let targets = [];
                 if (notifyTarget === 'all_clients') targets = users.filter(u => u.type === 'client' || (!u.type && u.role !== 'professional'));
                 if (notifyTarget === 'all_pros') targets = users.filter(u => u.type === 'pro' || u.role === 'professional');
                 if (notifyTarget === 'all_users') targets = users;

                 for (const u of targets) {
                     await addDoc(collection(db, 'notificaciones'), {
                        userId: u.id,
                        type: 'system',
                        title: 'Mensaje de Listo Patrón',
                        text: notifyMessage,
                        date: new Date().toISOString(),
                        read: false
                     });
                 }
                 showToast(`📨 Notificación Masiva enviada a ${targets.length} usuarios.`);
            }
         setNotifyUser('');
      }
      
      if (type === 'remind') {
           await addDoc(collection(db, 'notificaciones'), {
              userId: obj.proId || obj.userId || obj.id,
              type: 'system',
              title: 'Recordatorio Administrativo',
              text: 'Hola socio, te recordamos completar tu proceso pendiente o pago en la plataforma de Listo para evitar suspensiones. Gracias.',
              date: new Date().toISOString(),
              read: false
           });
         showToast(`📱 Recordatorio In-App enviado a ${obj.name || obj.proName || 'Usuario'}`);
      }
      
      if (type === 'approve_edit') {
         await updateDoc(doc(db, 'users', obj.userId), obj.requestedChanges);
         await updateDoc(doc(db, 'profile_edit_requests', obj.id), { status: 'approved', processedAt: new Date().toISOString() });
         showToast(`✅ Cambios aplicados al perfil de ${obj.userName}`);
      }

      if (type === 'reject_edit') {
         await updateDoc(doc(db, 'profile_edit_requests', obj.id), { status: 'rejected', processedAt: new Date().toISOString() });
            await addDoc(collection(db, 'notificaciones'), {
               userId: obj.userId,
               type: 'system',
               title: 'Cambio de Perfil Rechazado',
               text: 'Hola, tu solicitud para actualizar tus datos o foto de perfil no fue aprobada por nuestros agentes. Intenta de nuevo con información válida.',
               date: new Date().toISOString(),
               read: false
            });
         showToast(`🔴 Solicitud de cambio rechazada`);
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
            { id:'ediciones',  icon:'✏️', label:'Ediciones', count: editRequests.filter(r => r.status === 'pending').length },
            { id:'quejas',     icon:'🚨', label:'Quejas', count: reports.filter(r => r.status === 'pending').length },
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



        {/* ── CENTRAL DE MANDO (Directorio) ── */}
        {tab === 'bloqueados' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">Central de Mando</span>
            </div>
            
            {/* Live Metrics */}
            <div style={{display:'flex', gap:8, marginBottom: 16}}>
              <div style={{flex:1, background:'var(--surface)', border:'1px solid rgba(59,130,246,0.3)', borderRadius:12, padding:12, textAlign:'center'}}>
                <div style={{fontSize:22, fontWeight:800, color:'var(--blue)', fontFamily:'var(--mono)'}}>{users.length}</div>
                <div style={{fontSize:10, color:'var(--muted)', fontWeight:700, textTransform:'uppercase'}}>Cuentas Totales</div>
              </div>
              <div style={{flex:1, background:'#F1F5F9', border:'1px solid var(--border)', borderRadius:12, padding:12, textAlign:'center'}}>
                <div style={{fontSize:22, fontWeight:800, color:'var(--text)', fontFamily:'var(--mono)'}}>{users.filter(u => u.role !== 'professional').length}</div>
                <div style={{fontSize:10, color:'var(--muted)', fontWeight:700, textTransform:'uppercase'}}>Clientes</div>
              </div>
              <div style={{flex:1, background:'#FFFBEB', border:'1px solid rgba(245,158,11,0.3)', borderRadius:12, padding:12, textAlign:'center'}}>
                <div style={{fontSize:22, fontWeight:800, color:'var(--brand)', fontFamily:'var(--mono)'}}>{users.filter(u => u.role === 'professional').length}</div>
                <div style={{fontSize:10, color:'var(--muted)', fontWeight:700, textTransform:'uppercase'}}>Profesionales</div>
              </div>
            </div>

            <div className="ac-container" style={{marginBottom: 16}}>
              <div className="ac-input-wrapper">
                <input 
                  type="text" 
                  className="gift-input" 
                  placeholder="Buscar usuario o profesional por nombre/teléfono..." 
                  value={dirSearch} 
                  onChange={e => setDirSearch(e.target.value)}
                  style={{marginBottom: 0, paddingLeft:40}}
                />
                <span style={{position:'absolute', left:14, top:16, color:'var(--muted)'}}>🔍</span>
              </div>
            </div>

            {/* Quick Filters */}
            <div style={{display:'flex', gap:6, overflowX:'auto', paddingBottom:8, marginBottom:16}}>
              {['all', 'clients', 'pros', 'online', 'suspended'].map(f => (
                <button key={f} onClick={() => {setPsFilter(f); setPsLimit(20);}} style={{
                  padding:'6px 12px', borderRadius:20, border: psFilter===f?'none':'1px solid var(--border)',
                  background: psFilter===f?'var(--text)':'var(--surface)', color: psFilter===f?'#fff':'var(--muted)',
                  fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s'
                }}>
                  {f==='all' ? 'Todos' : f==='clients' ? '👤 Clientes' : f==='pros' ? '🛠️ Profesionales' : f==='online' ? '🟢 En Línea' : '🔴 Suspendidos'}
                </button>
              ))}
            </div>

            {(() => {
              const filteredList = users
                .filter(u => !dirSearch || String(u.name||'').toLowerCase().includes(dirSearch.toLowerCase().trim()) || String(u.phone||'').includes(dirSearch.trim()))
                .filter(u => {
                   if (psFilter === 'all') return true;
                   if (psFilter === 'clients') return u.role !== 'professional';
                   if (psFilter === 'pros') return u.role === 'professional';
                   if (psFilter === 'online') return u.role === 'professional' && u.available;
                   if (psFilter === 'suspended') return u.role === 'professional' && (!u.approved || u.planStatus === 'inactive');
                   return true;
                })
                .sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
                
              if (filteredList.length === 0) {
                 return (
                  <div className="empty-admin">
                    <span>🚫</span>
                    <p>Nadie en el radar</p>
                  </div>
                 )
              }
              
              const visibleList = filteredList.slice(0, psLimit);

              return (
                 <>
                   {visibleList.map((u, i) => (
                      <div className="dash-card" key={u.id} style={{animationDelay:`${(i%20)*.05}s`}} onClick={() => setViewProStats(u)}>
                        <div className="dash-avatar" style={{background: u.planStatus==='inactive'?'#EF4444' : u.available?'#10B981':'var(--surface2)', color: u.available?'#fff':'var(--text)'}}>
                           {u.profilePic || u.photoURL || u.avatarId ? (
                              <img src={u.profilePic || u.photoURL || `https://i.pravatar.cc/100?u=${u.avatarId||u.id}`} alt="pro" style={{width:'100%', height:'100%', objectFit:'cover'}} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name||'P')}&background=random&color=fff&size=100`; }}/>
                           ) : (
                              u.name?u.name.charAt(0).toUpperCase():'P'
                           )}
                        </div>
                        <div className="dash-info">
                          <div className="dash-name">{u.name || 'Profesional'} {u.approved ? '✅' : '⏳'} {u.verificacion?.estado === 'en_revision' ? '⚠️' : ''}</div>
                          <div className="dash-sub">{u.category || u.service || 'Servicios Generales'} · {u.contracts||0} CT</div>
                        </div>
                        <div className="dash-status">
                          <span className={`dash-pill ${u.available ? 'online' : 'offline'}`}>{u.available ? 'ONLINE' : 'OFFLINE'}</span>
                          <span style={{fontSize:10, color:'var(--muted)'}}>{fmtDate(u.createdAt)}</span>
                        </div>
                      </div>
                   ))}
                   {filteredList.length > psLimit && (
                      <button onClick={() => setPsLimit(prev => prev + 20)} style={{width:'100%', padding:16, marginTop:8, borderRadius:16, border:'1px solid var(--border)', background:'var(--surface2)', color:'var(--text)', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .2s'}}>
                        Cargar más ({filteredList.length - psLimit} restantes) ↓
                      </button>
                   )}
                 </>
              )
            })()}
          </div>
        )}

        {/* ── MODAL FLOTANTE DE ESTADÍSTICAS (CENTRAL DE MANDO) ── */}
        {viewProStats && (
          <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:999, display:'flex', flexDirection:'column', backdropFilter:'blur(10px)', padding:16}} onClick={() => setViewProStats(null)}>
            <div className="pro-stats-modal" onClick={e => e.stopPropagation()}>
              
              {/* Header Dark Mode */}
              <div className="ps-header">
                <button className="ps-close" onClick={() => setViewProStats(null)}>✕</button>
                <div className="ps-avatar">
                   {viewProStats.profilePic || viewProStats.photoURL || viewProStats.avatarId ? (
                      <img src={viewProStats.profilePic || viewProStats.photoURL || `https://i.pravatar.cc/100?u=${viewProStats.avatarId||viewProStats.id}`} alt="pro" style={{width:'100%', height:'100%', objectFit:'cover'}} onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(viewProStats.name||'P')}&background=random&color=fff&size=100`; }}/>
                   ) : (
                      viewProStats.name?viewProStats.name.charAt(0).toUpperCase():'P'
                   )}
                </div>
                <div className="ps-info-top">
                  <h3>{viewProStats.name || 'Sin Nombre'} {viewProStats.verificacion?.estado === 'en_revision' ? '⚠️' : (viewProStats.approved ? '✅' : '⏳')}</h3>
                  <p>{viewProStats.phone} · {viewProStats.email || 'Sin correo'}</p>
                </div>
              </div>

              {/* Informacion de Plan */}
              <div style={{background:'var(--brand-dim)', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)'}}>
                <div>
                  <div style={{fontSize:11, fontWeight:700, color:'var(--brand)', textTransform:'uppercase'}}>Suscripción Actual</div>
                  <div style={{fontFamily:'var(--display)', fontSize:16, fontWeight:800}}>{viewProStats.planName || (viewProStats.currentPlan === 'vip' ? 'Plan VIP' : viewProStats.currentPlan === 'premium' ? 'Plan Premium' : 'Plan Básico')}</div>
                </div>
                <span className={`status-pill ${viewProStats.planStatus === 'active' ? 'paid' : 'blocked'}`}>
                   {viewProStats.planStatus === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="ps-grid">
                <div className="ps-metric">
                  <div className="ps-metric-val">{viewProStats.contracts || 0}</div>
                  <div className="ps-metric-label">Contratos Libres</div>
                </div>
                <div className="ps-metric">
                  <div className="ps-metric-val">⭐ {Number(viewProStats.rating || 0).toFixed(1)}</div>
                  <div className="ps-metric-label">Calificación ({viewProStats.reviews||0})</div>
                </div>
                <div className="ps-metric">
                  <div className="ps-metric-val">{viewProStats.completedJobs || 0}</div>
                  <div className="ps-metric-label">Completados</div>
                </div>
                <div className="ps-metric">
                  <div className="ps-metric-val" style={{color:'var(--brand)'}}>{viewProStats.pendingJobs || 0}</div>
                  <div className="ps-metric-label">En Progreso</div>
                </div>
              </div>

              {/* Acciones de Mando */}
              <div style={{padding:'0 20px 20px'}}>
                <div style={{fontSize:12, fontWeight:800, color:'var(--muted)', marginBottom:10, textTransform:'uppercase'}}>Operaciones de Mando</div>
                
                {/* Contratos */}
                <div style={{display:'flex', gap:8, marginBottom:12}}>
                  <button className="cc-btn paid" onClick={() => setConfirm({type:'add_contract', obj:viewProStats})}>
                     ➕ Dar 1 Contrato
                  </button>
                  <button className="cc-btn block" style={{background:'var(--surface2)', color:'var(--red)', borderColor:'var(--border)'}} onClick={() => setConfirm({type:'sub_contract', obj:viewProStats})}>
                     ➖ Quitar 1 Contrato
                  </button>
                </div>

                {/* Suspensiones */}
                <div style={{display:'flex', gap:8, marginBottom:12}}>
                  {viewProStats.planStatus === 'inactive' || !viewProStats.approved ? (
                    <button className="cc-btn paid" style={{background:'#10B981', color:'#fff', flex:1}} onClick={() => setConfirm({type:'unblock', obj:viewProStats})}>
                      ✅ Reactivar Perfil
                    </button>
                  ) : (
                    <button className="cc-btn block" style={{background:'#EF4444', color:'#fff', flex:1}} onClick={() => setConfirm({type:'block', obj:viewProStats})}>
                      🔴 Suspender Perfil
                    </button>
                  )}
                </div>

                {/* Expediente Limitado */}
                {viewProStats.verificacion && (
                  <button className="cc-btn remind" style={{width:'100%', background:'#3B82F6', color:'#fff', border:'none', padding:14, fontSize:13}} onClick={() => {
                    setViewDocs(viewProStats); // Abre el modal original del expediente encima de este
                  }}>
                    🔎 Ver Expediente Legal {viewProStats.verificacion?.estado === 'en_revision' ? '(Pendiente)' : ''}
                  </button>
                )}
                {!viewProStats.verificacion && (
                  <div style={{textAlign:'center', fontSize:12, color:'var(--muted)', marginTop:8}}>El usuario no ha subido documentos de verificación.</div>
                )}
                
                {/* ── BOTÓN DEL CHAT OFICIAL ── */}
                <div style={{marginTop: 16}}>
                  <button className="cc-btn" style={{
                    width:'100%', background:'linear-gradient(135deg, #1A1A2E, #2A2A4A)', color:'#FFD700', 
                    border:'1px solid rgba(255,215,0,0.5)', padding:14, fontSize:13, fontWeight: 800, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                  }} onClick={() => {
                    if (navigate) navigate('chat', viewProStats);
                  }}>
                    💬 Entrar al Chat Seguro
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: EDICIONES DE PERFIL ── */}
        {tab === 'ediciones' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">✏️ Solicitudes de Edición</span>
            </div>
            {editRequests.filter(r => r.status === 'pending').length === 0 && (
               <div className="empty-admin">
                 <span style={{fontSize:40, marginBottom:10}}>✅</span>
                 <p>No hay solicitudes de cambio de perfil pendientes.</p>
               </div>
            )}
            {editRequests.filter(r => r.status === 'pending').map(req => {
               const u = users.find(x => x.id === req.userId);
               const isPhoto = req.type === 'photo';
               return (
                  <div className="dash-card" key={req.id} style={{alignItems: 'flex-start', background: '#FFFBEB', borderColor: '#FDE68A'}}>
                     <div className="dash-info" style={{width:'100%'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                          <span className="dash-pill" style={{background:'#F59E0B', color:'#fff', fontSize:11}}>
                            {isPhoto ? '📸 CAMBIO DE FOTO' : '📝 CAMBIO DE DATOS'}
                          </span>
                          <span style={{fontSize:11, color:'var(--muted)'}}>{fmtDate(req.createdAt)}</span>
                        </div>
                        <div style={{fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:8}}>
                          <span style={{color:'var(--brand)'}}>{u?.name || req.userName}</span> ha solicitado actualizar su perfil.
                        </div>
                        
                        {isPhoto ? (
                          <div style={{display:'flex', gap:10, marginBottom:12}}>
                             <div style={{flex:1, textAlign:'center'}}>
                               <div style={{fontSize:11, color:'var(--muted)', marginBottom:4}}>Foto Actual</div>
                               <img src={u?.photoURL || 'https://via.placeholder.com/100?text=Vacio'} style={{width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--border)'}} alt="Current"/>
                             </div>
                             <div style={{display:'flex', alignItems:'center', fontSize:24, color:'var(--muted)'}}>➔</div>
                             <div style={{flex:1, textAlign:'center'}}>
                               <div style={{fontSize:11, color:'var(--brand)', fontWeight:700, marginBottom:4}}>Foto Nueva</div>
                               <img src={req.requestedChanges.photoURL} style={{width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'3px solid #10B981'}} alt="New"/>
                             </div>
                          </div>
                        ) : (
                          <div style={{background:'rgba(255,255,255,0.7)', padding:12, borderRadius:8, marginBottom:12, border:'1px solid #FDE68A', overflowX:'auto'}}>
                             <table style={{width:'100%', fontSize:12, textAlign:'left', borderCollapse:'collapse'}}>
                                <thead>
                                   <tr style={{borderBottom:'1px solid #FDE68A'}}>
                                     <th style={{paddingBottom:6}}>Campo</th>
                                     <th style={{paddingBottom:6}}>Actual</th>
                                     <th style={{paddingBottom:6, color:'var(--brand)'}}>Nuevo</th>
                                   </tr>
                                </thead>
                                <tbody>
                                   {Object.keys(req.requestedChanges).map(key => {
                                      const oldVal = u?.[key] || '';
                                      const newVal = req.requestedChanges[key];
                                      if (oldVal === newVal) return null;
                                      return (
                                        <tr key={key} style={{borderBottom:'1px dashed #FEF08A'}}>
                                           <td style={{padding:'6px 8px 6px 0', fontWeight:600, textTransform:'capitalize', color:'var(--text)'}}>{key}</td>
                                           <td style={{padding:'6px 8px 6px 0', color:'var(--muted)'}}>{oldVal || '-'}</td>
                                           <td style={{padding:'6px 0', color:'#10B981', fontWeight:700}}>{newVal}</td>
                                        </tr>
                                      )
                                   })}
                                </tbody>
                             </table>
                          </div>
                        )}

                        <div style={{display:'flex', gap:8}}>
                          <button className="cc-btn paid" style={{flex:1, fontSize:12, padding:10}} onClick={() => setConfirm({type:'approve_edit', obj: req})}>
                             ✅ APROBAR
                          </button>
                          <button className="cc-btn block" style={{flex:1, fontSize:12, padding:10}} onClick={() => setConfirm({type:'reject_edit', obj: req})}>
                             ❌ RECHAZAR
                          </button>
                        </div>
                     </div>
                  </div>
               )
            })}
          </div>
        )}

        {/* ── TAB: CENTRAL DE REGALOS ── */}
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
                               <img src={u.profilePic || u.photoURL || `https://i.pravatar.cc/100?u=${u.avatarId||u.id}`} alt="pro" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name||'P')}&background=random&color=fff&size=100`; }} />
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
                🎁 Enviar Regalo
              </button>
            </div>

            <div className="section-header" style={{marginTop: 32}}>
              <span className="section-title">📨 Enviar Mensaje a Usuarios</span>
            </div>
            
            <div className="gift-form">
              <label className="gift-label">1. Seleccionar Destinatarios</label>
              <div style={{display:'flex', gap: 8, marginBottom: 16, flexWrap:'wrap'}}>
                <button 
                  onClick={() => setNotifyTarget('single')}
                  style={{flex:1, minWidth:'120px', padding:'10px', borderRadius:'8px', border: notifyTarget==='single' ? '2px solid var(--blue)' : '1px solid var(--border)', background: notifyTarget==='single' ? 'rgba(59,130,246,0.1)' : 'var(--surface2)', cursor:'pointer', fontWeight: 700, fontSize:'11px', color:'var(--text)', transition:'all 0.2s', fontFamily:'var(--display)'}}
                >
                  👤 Solo Un Usuario
                </button>
                <button 
                  onClick={() => setNotifyTarget('all_clients')}
                  style={{flex:1, minWidth:'120px', padding:'10px', borderRadius:'8px', border: notifyTarget==='all_clients' ? '2px solid var(--blue)' : '1px solid var(--border)', background: notifyTarget==='all_clients' ? 'rgba(59,130,246,0.1)' : 'var(--surface2)', cursor:'pointer', fontWeight: 700, fontSize:'11px', color:'var(--text)', transition:'all 0.2s', fontFamily:'var(--display)'}}
                >
                  👥 Todos los Clientes
                </button>
                <button 
                  onClick={() => setNotifyTarget('all_pros')}
                  style={{flex:1, minWidth:'120px', padding:'10px', borderRadius:'8px', border: notifyTarget==='all_pros' ? '2px solid var(--blue)' : '1px solid var(--border)', background: notifyTarget==='all_pros' ? 'rgba(59,130,246,0.1)' : 'var(--surface2)', cursor:'pointer', fontWeight: 700, fontSize:'11px', color:'var(--text)', transition:'all 0.2s', fontFamily:'var(--display)'}}
                >
                  🛠️ Todos los Profesionales
                </button>
                <button 
                  onClick={() => setNotifyTarget('all_users')}
                  style={{flex:1, minWidth:'120px', padding:'10px', borderRadius:'8px', border: notifyTarget==='all_users' ? '2px solid var(--blue)' : '1px solid var(--border)', background: notifyTarget==='all_users' ? 'rgba(59,130,246,0.1)' : 'var(--surface2)', cursor:'pointer', fontWeight: 700, fontSize:'11px', color:'var(--text)', transition:'all 0.2s', fontFamily:'var(--display)'}}
                >
                  🌐 Toda la Aplicación
                </button>
              </div>

              {notifyTarget === 'single' ? (
                <>
                  <label className="gift-label">2. Buscar Usuario</label>
                  <div className="ac-container" style={{marginBottom: 16}}>
                    <div className="ac-input-wrapper">
                      <input 
                        type="text" 
                        className="gift-input" 
                        placeholder="Escribe el nombre o teléfono..." 
                        value={notifySearch} 
                        onChange={e => {
                          setNotifySearch(e.target.value);
                          setNotifyUser(''); 
                          setShowNotifyAc(true);
                        }}
                        onFocus={() => setShowNotifyAc(true)}
                        style={{marginBottom: 0}}
                      />
                      {notifyUser && <div style={{position:'absolute', right:16, top:16, color:'#10B981'}}>✅ Seleccionado</div>}
                    </div>
                    
                    {showNotifyAc && notifySearch && !notifyUser && (
                      <div className="ac-dropdown">
                        {users
                          .filter(u => {
                            const term = notifySearch.toLowerCase().trim();
                            const userName = String(u.name || '').toLowerCase();
                            const userPhone = String(u.phone || '').toLowerCase();
                            return userName.includes(term) || userPhone.includes(term);
                          })
                          .slice(0, 10)
                          .map(u => (
                            <div key={u.id} className="ac-item" onClick={() => {
                              setNotifyUser(u.id);
                              setNotifySearch(u.name || u.phone);
                              setShowNotifyAc(false);
                              setNotifyMessage(`Hola ${u.name || 'usuario'}, Bienvenido a Listo Patrón. Para comenzar a generar dinero de inmediato debes completar tu perfil. ¡Te esperamos!`);
                            }}>
                              <div className="ac-avatar">
                                {u.profilePic || u.photoURL || u.avatarId ? (
                                   <img src={u.profilePic || u.photoURL || `https://i.pravatar.cc/100?u=${u.avatarId||u.id}`} alt="pro" onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name||'P')}&background=random&color=fff&size=100`; }} />
                                ) : (
                                   (u.name ? String(u.name).charAt(0).toUpperCase() : 'U')
                                )}
                              </div>
                              <div className="ac-text">
                                <span className="ac-name">{u.name || 'Sin nombre'}</span>
                                <span className="ac-detail">{u.phone}</span>
                              </div>
                            </div>
                          ))}
                        {users.filter(u => String(u.name||'').toLowerCase().includes(notifySearch.toLowerCase().trim())).length === 0 && (
                          <div className="ac-item"><div className="ac-text"><span className="ac-detail">Sin resultados</span></div></div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{padding:'16px', background:'#EFF6FF', borderRadius:'8px', marginBottom:'16px', border:'1px solid #BFDBFE', color:'#1E3A8A', fontSize:'13px', fontWeight:'600'}}>
                  ⚠️ Atención: El mensaje masivo se enviará a {notifyTarget==='all_users' ? users.length : notifyTarget==='all_clients' ? users.filter(u=>u.role!=='professional').length : users.filter(u=>u.role==='professional').length} usuarios simulaneamente de manera inmediata.
                </div>
              )}

              <label className="gift-label">{notifyTarget==='single' ? '3' : '2'}. Escribir Mensaje</label>
              <textarea className="gift-textarea" value={notifyMessage} onChange={e => setNotifyMessage(e.target.value)} />

              <button 
                className="gift-btn" 
                style={{background: 'linear-gradient(135deg, #3B82F6, #1E40AF)'}}
                disabled={(notifyTarget === 'single' && !notifyUser) || !notifyMessage}
                onClick={() => setConfirm({type:'send_notification'})}
              >
                {notifyTarget === 'single' ? '📨 Enviar Mensaje' : '🌐 Enviar Difusión Masiva'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: QUEJAS Y REPORTES ── */}
        {tab === 'quejas' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">🚨 Central de Quejas</span>
            </div>

            {/* Live Metrics */}
            <div className="ps-grid" style={{gap:8, padding:0, marginBottom:16}}>
              <div className="ps-metric" style={{background:'var(--surface)'}}>
                <div className="ps-metric-val">{reports.filter(r=>r.status === 'pending').length}</div>
                <div className="ps-metric-label">En Progreso</div>
              </div>
              <div className="ps-metric" style={{background:'#FEF08A', borderColor:'#FDE047'}}>
                <div className="ps-metric-val" style={{color:'#854D0E'}}>{reports.filter(r=>r.status === 'pending' && r.severity === 'leve').length}</div>
                <div className="ps-metric-label" style={{color:'#CA8A04'}}>Leves</div>
              </div>
              <div className="ps-metric" style={{background:'#FFEDD5', borderColor:'#FDBA74'}}>
                <div className="ps-metric-val" style={{color:'#9A3412'}}>{reports.filter(r=>r.status === 'pending' && r.severity === 'moderada').length}</div>
                <div className="ps-metric-label" style={{color:'#EA580C'}}>Moderadas</div>
              </div>
              <div className="ps-metric" style={{background:'#FEE2E2', borderColor:'#FCA5A5'}}>
                <div className="ps-metric-val" style={{color:'#991B1B'}}>{reports.filter(r=>r.status === 'pending' && r.severity === 'grave').length}</div>
                <div className="ps-metric-label" style={{color:'#DC2626'}}>Graves</div>
              </div>
            </div>

            {reports.filter(r => r.status === 'pending').length === 0 && (
               <div className="empty-admin">
                 <span style={{fontSize:40, marginBottom:10}}>👮</span>
                 <p>No hay quejas pendientes por revisar. Excelente servicio.</p>
               </div>
            )}

            {reports.filter(r => r.status === 'pending').map(r => (
               <div className="dash-card" key={r.id} style={{
                   borderColor: r.severity === 'grave' ? '#FCA5A5' : r.severity === 'moderada' ? '#FDBA74' : '#FDE047',
                   background: r.severity === 'grave' ? '#FEF2F2' : r.severity === 'moderada' ? '#FFF7ED' : '#FEFCE8',
                   alignItems: 'flex-start'
                 }}>
                 <div className="dash-info" style={{width:'100%'}}>
                   <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                     <div>
                       <span className={`dash-pill`} style={{
                          background: r.severity === 'grave' ? '#EF4444' : r.severity === 'moderada' ? '#F97316' : '#EAB308',
                          color: '#fff', fontSize:11
                       }}>
                         {r.severity === 'grave' ? '🔴 GRAVE' : r.severity === 'moderada' ? '🟠 MODERADA' : '🟡 LEVE'}
                       </span>
                     </div>
                     <span style={{fontSize:11, color:'var(--muted)'}}>{fmtDate(r.createdAt)}</span>
                   </div>
                   <div style={{fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:4}}>
                     Cliente <span style={{color:'var(--brand)'}}>{r.reporterName}</span> reportó a <span style={{color:'var(--brand)'}}>{r.reportedName}</span>
                   </div>
                   <div style={{fontSize:14, color:'var(--text)', fontStyle:'italic', background:'rgba(0,0,0,0.03)', padding:12, borderRadius:8, marginBottom:12, lineHeight:1.4}}>
                     "{r.reason}"
                   </div>
                   
                   <div style={{display:'flex', gap:8}}>
                     <button className="cc-btn paid" style={{flex:1, background:'#1E293B', color:'#fff', border:'none', fontSize:12, padding:10}} onClick={() => {
                        const userPro = users.find(u => u.id === r.reportedId);
                        if(userPro) {
                           setViewProStats(userPro);
                        } else {
                           setToast('El usuario ya no existe o fue bloqueado permanentemente.');
                        }
                     }}>
                        🕵️ Auditar Profesional
                     </button>
                     <button className="cc-btn paid" style={{flex:1, fontSize:12, padding:10}} onClick={() => setConfirm({type:'resolve_report', obj: r})}>
                        ✔️ Marcar Resuelta
                     </button>
                   </div>
                 </div>
               </div>
            ))}
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
                 confirm.type==='send_notification' ? '¿Enviar Mensaje?' :
                 confirm.type==='remind'       ? '¿Enviar Recordatorio?' :
                 confirm.type==='reject_payment' ? '¿Rechazar Pago?' :
                 confirm.type==='approve_verif' ? '¿Aprobar Profesional?' :
                 confirm.type==='reject_verif' ? '¿Rechazar Verificación?' :
                 confirm.type==='resolve_report' ? '¿Marcar como resuelta?' :
                 confirm.type==='approve_edit' ? '¿Aprobar cambios?' :
                 confirm.type==='reject_edit' ? '¿Rechazar solicitud de edición?' :
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
                  : confirm.type==='send_notification'
                  ? (notifyTarget === 'single' ? `Se enviará este mensaje directamente a la sección de notificaciones de la app del usuario.` : `🚨 ATENCIÓN: Estás a punto de enviar una DIFUSIÓN MASIVA. Todos los usuarios en la categoría seleccionada recibirán la notificación In-App al instante.`)
                  : confirm.type==='remind'
                  ? `Se enviará una notificación In-App al celular de ${confirm.obj.name || confirm.obj.proName} recordándole que termine el proceso.`
                  : confirm.type==='reject_payment'
                  ? `El pago de la comisión de ${confirm.obj.proName} será rechazado.`
                  : confirm.type==='approve_verif'
                  ? `El usuario ${confirm.obj.verificacion?.nombre || 'este perfil'} será promovido a Profesional Premium y se le recargarán contratos iniciales.`
                  : confirm.type==='reject_verif'
                  ? `Se rechazará esta verificación y el usuario tendrá que intentar de nuevo.`
                  : confirm.type==='resolve_report'
                  ? `La queja de ${confirm.obj.reporterName} será archivada y se quitará de la lista de pendientes.`
                  : confirm.type==='approve_edit'
                  ? `Los nuevos datos o foto sobrescribirán el perfil de ${confirm.obj.userName}.`
                  : confirm.type==='reject_edit'
                  ? `La solicitud será descartada y se enviará una notificación In-App al usuario.`
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
                 confirm.type==='send_notification' ? '📨 Enviar Mensaje' :
                 confirm.type==='remind' ? '📱 Enviar Recordatorio' :
                 confirm.type==='reject_payment' ? '🔴 Rechazar Pago' :
                 confirm.type==='approve_verif' ? '✅ Aprobar Profesional' :
                 confirm.type==='reject_verif' ? '❌ Sí, rechazar' :
                 confirm.type==='resolve_report' ? '✔️ Confirmar Resolución' :
                 confirm.type==='approve_edit' ? '✅ Aplicar Cambios' :
                 confirm.type==='reject_edit' ? '❌ Rechazar Cambios' :
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