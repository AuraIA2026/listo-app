import React, { useState, useEffect, Component, useRef } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
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
  padding:max(calc(env(safe-area-inset-top, 0px) + 16px), 52px) 20px 16px;
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
  const [alerts, setAlerts]     = useState([]); // Alertas de plan
  const [vipLocales, setVipLocales] = useState([]); // Locales VIP
  const [partnerRequests, setPartnerRequests] = useState([]); // Solicitudes de Comercios Partner
  const [stories, setStories] = useState([]); // Historias 24h
  const [toast, setToast]       = useState('');
  const [confirm, setConfirm]   = useState(null); // { type, obj }
  const [viewDocs, setViewDocs] = useState(null); // Usuario a inspeccionar documentos
  const [previewImageModal, setPreviewImageModal] = useState(null); // { url, title } Modal inspeccion HD
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
  const [notifyType, setNotifyType] = useState('system');

  // Comercio Contabilidad & Búsqueda State
  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerFilterStatus, setPartnerFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState(null);
  const [billingMonth, setBillingMonth] = useState('2026-10');
  const [partnerCommissions, setPartnerCommissions] = useState({
    'demo-1': 10,
    'demo-2': 5,
    'demo-3': 0
  });

  const updateCommerceCommission = async (storeId, newPct) => {
    const validPct = Math.max(0, Math.min(100, Number(newPct) || 0));
    setPartnerCommissions(prev => ({ ...prev, [storeId]: validPct }));
    try {
      const storeRef = doc(db, 'partner_requests', storeId);
      await updateDoc(storeRef, { commissionPct: validPct });
    } catch (e) {
      // Si no existe documento en Firestore (demo) se gestiona de forma transparente en estado local
    }
    showToast(`⚙️ Comisión para el comercio configurada a ${validPct}%`);
  };

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

    // 6. Escuchar Alertas/Notificaciones de Admin
    const unsubAlerts = onSnapshot(query(collection(db, 'notificaciones'), where('userId', '==', 'admin')), (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      arr.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.date || a.createdAt || 0).getTime();
        const dateB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.date || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      setAlerts(arr);
    });

    // 7. Escuchar Locales VIP
    const unsubLocales = onSnapshot(collection(db, 'locales'), (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setVipLocales(arr);
    });

    // 8. Escuchar Solicitudes de Comercios Partner
    const unsubPartnerReqs = onSnapshot(collection(db, 'partner_requests'), (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      arr.sort((a, b) => {
        const da = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const db = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return db - da;
      });
      setPartnerRequests(arr);
    }, (err) => {
      console.warn("Firestore partner_requests listener warning:", err);
    });

    // 9. Escuchar Historias 24h
    const unsubStories = onSnapshot(query(collection(db, 'historias'), orderBy('createdAt', 'desc')), (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStories(arr);
    });

    return () => { unsubPay(); unsubUsers(); unsubVerif(); unsubReps(); unsubEdits(); unsubAlerts(); unsubLocales(); unsubPartnerReqs(); unsubStories(); };
  }, []);

  const prevUnreadCount = useRef(0);
  const isFirstLoad = useRef(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  useEffect(() => {
    const unreadAlerts = alerts.filter(a => !a.read);
    const unreadCount = unreadAlerts.length;

    if (isFirstLoad.current) {
      prevUnreadCount.current = unreadCount;
      isFirstLoad.current = false;
      return;
    }

    if (unreadCount > prevUnreadCount.current) {
      try {
        const selectedSound = localStorage.getItem('listo_sound_notif') || 'notification_v3';
        const audio = new Audio(`/audio/${selectedSound}.mp3`);
        audio.volume = 0.8;
        audio.play().catch(() => {});
      } catch (e) {
        console.error("Error playing audio:", e);
      }
      showToast('🔔 Nueva alerta de plan recibida');
    }
    prevUnreadCount.current = unreadCount;
  }, [alerts]);

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
      if (type === 'delete_story') {
        await deleteDoc(doc(db, 'historias', obj.id));
        showToast('🗑️ Historia eliminada por moderación');
      }

      if (type === 'paid') {
        // Aprobar un pago (Comisión/Plan transferido)
        await updateDoc(doc(db, 'payments', obj.id), { status: 'paid' });
        
        // Cargar los contratos al profesional si aplica
        if (obj.planContracts) {
           const u = users.find(u => u.id === obj.proId) || users.find(u => u.email?.trim().toLowerCase() === obj.email?.trim().toLowerCase());
           if (u) {
              const currentContracts = u.contracts || 0;
              await updateDoc(doc(db, 'users', u.id), {
                contracts: currentContracts + obj.planContracts + (obj.planBonus || 0),
                planStatus: 'active',
                planExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                available: true,
                currentPlan: obj.planId || 'standard'
              });
              
              if (!obj.proId) {
                await updateDoc(doc(db, 'payments', obj.id), { proId: u.id });
              }

              try {
                await addDoc(collection(db, 'notificaciones'), {
                  userId: u.id,
                  type: 'system',
                  title: '💎 ¡Plan Activado con Éxito!',
                  text: `Tu plan ${obj.planName} ha sido aprobado por el administrador. ¡Ya puedes ponerte en línea en la app Listo Patrón!`,
                  read: false,
                  date: new Date().toISOString(),
                  createdAt: new Date().toISOString()
                });
              } catch (eNotif) {
                console.error("Error sending user notification:", eNotif);
              }

              showToast(`💚 Plan habilitado para ${u.name || obj.proName}`);
           } else {
              showToast(`⚠️ No se encontró al profesional con el correo: ${obj.email}`);
           }
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
          plan: 'basico',
          planStatus: 'active',
          planExpirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          available: true,
          'verificacion.estado': 'aprobada',
          'verificacion.fechaAprobacion': new Date().toISOString()
        };
        // Solo establecer bonos si el profesional no ha sido aprobado previamente
        if (!obj.approved) {
           payload.contracts = 3;
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
         await updateDoc(doc(db, 'users', obj.id), { 
            planStatus: 'active', 
            approved: true,
            planExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            available: true
         });
         showToast(`✅ ${obj.name} activado`);
      }
      if (type === 'add_contract') {
         const current = obj.contracts || 0;
         await updateDoc(doc(db, 'users', obj.id), { 
            contracts: current + 1,
            planStatus: 'active',
            planExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            available: true
         });
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
            planStatus: 'active',
            planExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            available: true,
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
                        type: notifyType,
                        title: notifyType === 'promo' ? '🏷️ ¡Nueva Oferta!' : 'Mensaje de Listo Patrón',
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
                        type: notifyType,
                        title: notifyType === 'promo' ? '🏷️ ¡Nueva Oferta!' : 'Mensaje de Listo Patrón',
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
      
      if (type === 'approve_local') {
         await updateDoc(doc(db, 'locales', obj.id), { activo: true });
         
         // Notificar al profesional de que su Local VIP ha sido aprobado
         await addDoc(collection(db, 'notificaciones'), {
           userId: obj.proId,
           type: 'system',
           title: '🏬 ¡Tu Local VIP ha sido aprobado! 🎉',
           text: `Tu local comercial "${obj.nombre}" ha sido aprobado por el administrador y ya es público en la plataforma.`,
           date: new Date().toISOString(),
           createdAt: new Date().toISOString(),
           read: false
         });
         
         showToast(`🏬 Local VIP "${obj.nombre}" aprobado y publicado`);
      }

      if (type === 'approve_edit') {
         // Determine targetUserId safely, ignoring 'admin'
         let targetUserId = (obj.userId && obj.userId !== 'admin') ? obj.userId : obj.fromUserId;
         if (!targetUserId || targetUserId === 'admin') {
            const foundUser = users.find(u => 
               (obj.userName && u.name?.toLowerCase().trim() === obj.userName.toLowerCase().trim()) ||
               (obj.userName && u.name?.toLowerCase().includes(obj.userName.toLowerCase())) ||
               (obj.email && u.email?.toLowerCase() === obj.email.toLowerCase()) ||
               (obj.userEmail && u.email?.toLowerCase() === obj.userEmail.toLowerCase())
            );
            if (foundUser) targetUserId = foundUser.id;
         }

         const changes = obj.requestedChanges || {};
         if (targetUserId && targetUserId !== 'admin' && Object.keys(changes).length > 0) {
            await updateDoc(doc(db, 'users', targetUserId), changes);
         } else if (targetUserId && targetUserId !== 'admin') {
            await updateDoc(doc(db, 'users', targetUserId), { profileEditPending: false });
         }

         const editReqId = obj.editRequestId || (obj.fromAlert ? null : obj.id);
         if (editReqId) {
            try {
               await updateDoc(doc(db, 'profile_edit_requests', editReqId), { status: 'approved', processedAt: new Date().toISOString() });
            } catch (eDoc) {
               console.warn("Could not update profile_edit_requests doc:", eDoc);
            }
         } else if (targetUserId && targetUserId !== 'admin') {
            const pendingReq = editRequests.find(r => r.userId === targetUserId && r.status === 'pending');
            if (pendingReq) {
               try {
                  await updateDoc(doc(db, 'profile_edit_requests', pendingReq.id), { status: 'approved', processedAt: new Date().toISOString() });
               } catch (eDoc) {
                  console.warn("Could not update pending profile_edit_requests doc:", eDoc);
               }
            }
         }

         // DESAPARECER TODAS LAS ALERTAS VINCULADAS A ESTA SOLICITUD / USUARIO
         const targetNotifId = obj.alertId || (obj.fromAlert ? obj.id : null);
         const alertsToDelete = alerts.filter(a => {
            if (targetNotifId && a.id === targetNotifId) return true;
            if (obj.id && a.editRequestId === obj.id) return true;
            if (targetUserId && targetUserId !== 'admin' && (a.fromUserId === targetUserId || a.userId === targetUserId)) return true;
            const aText = (a.text || '').toLowerCase();
            const emailMatch = (obj.email || obj.userEmail) && aText.includes((obj.email || obj.userEmail).toLowerCase());
            const nameMatch = obj.userName && obj.userName.length > 2 && aText.includes(obj.userName.toLowerCase());
            return (emailMatch || nameMatch) && ['new_edit_request', 'new_edit_request_photo', 'new_edit_request_cover', 'new_edit_request_work'].includes(a.type);
         });

         if (alertsToDelete.length > 0) {
            for (const aDoc of alertsToDelete) {
               try {
                  await deleteDoc(doc(db, 'notificaciones', aDoc.id));
               } catch (eDel) {
                  console.warn("Could not delete alert doc:", aDoc.id, eDel);
               }
            }
         } else if (targetNotifId) {
            try {
               await deleteDoc(doc(db, 'notificaciones', targetNotifId));
            } catch (eNotif) {}
         }
         
         try {
            if (targetUserId && targetUserId !== 'admin') {
               await addDoc(collection(db, 'notificaciones'), {
                  userId: targetUserId,
                  type: 'system',
                  title: '✏️ Cambios de Perfil Aprobados',
                  text: '¡Tu solicitud para actualizar tus datos o foto de perfil ha sido aprobada con éxito por la administración!',
                  date: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
                  read: false
               });
            }
         } catch (eNotif) {
            console.error("Error guardando notificación de aprobación:", eNotif);
         }

         showToast(`✅ Cambios aplicados al perfil de ${obj.userName || 'Profesional'}`);
      }

      if (type === 'reject_edit') {
         let targetUserId = (obj.userId && obj.userId !== 'admin') ? obj.userId : obj.fromUserId;
         if (!targetUserId || targetUserId === 'admin') {
            const foundUser = users.find(u => 
               (obj.userName && u.name?.toLowerCase().includes(obj.userName.toLowerCase())) ||
               (obj.email && u.email?.toLowerCase() === obj.email.toLowerCase())
            );
            if (foundUser) targetUserId = foundUser.id;
         }

         const editReqId = obj.editRequestId || (obj.fromAlert ? null : obj.id);
         if (editReqId) {
            try {
               await updateDoc(doc(db, 'profile_edit_requests', editReqId), { status: 'rejected', processedAt: new Date().toISOString() });
            } catch (eDoc) {}
         }
         
         if (targetUserId && targetUserId !== 'admin') {
            await addDoc(collection(db, 'notificaciones'), {
               userId: targetUserId,
               type: 'system',
               title: 'Cambio de Perfil Rechazado',
               text: 'Hola, tu solicitud para actualizar tus datos o foto de perfil no fue aprobada por nuestros agentes. Intenta de nuevo con información válida.',
               date: new Date().toISOString(),
               read: false
            });
         }

         // DESAPARECER TODAS LAS ALERTAS VINCULADAS
         const targetNotifId = obj.alertId || (obj.fromAlert ? obj.id : null);
         const alertsToDelete = alerts.filter(a => {
            if (targetNotifId && a.id === targetNotifId) return true;
            if (obj.id && a.editRequestId === obj.id) return true;
            if (targetUserId && targetUserId !== 'admin' && (a.fromUserId === targetUserId || a.userId === targetUserId)) return true;
            const aText = (a.text || '').toLowerCase();
            const emailMatch = (obj.email || obj.userEmail) && aText.includes((obj.email || obj.userEmail).toLowerCase());
            const nameMatch = obj.userName && obj.userName.length > 2 && aText.includes(obj.userName.toLowerCase());
            return (emailMatch || nameMatch) && ['new_edit_request', 'new_edit_request_photo', 'new_edit_request_cover', 'new_edit_request_work'].includes(a.type);
         });

         if (alertsToDelete.length > 0) {
            for (const aDoc of alertsToDelete) {
               try {
                  await deleteDoc(doc(db, 'notificaciones', aDoc.id));
               } catch (eDel) {}
            }
         } else if (targetNotifId) {
            try {
               await deleteDoc(doc(db, 'notificaciones', targetNotifId));
            } catch (eNotif) {}
         }

         showToast(`🔴 Solicitud de cambio rechazada`);
      }

      if (type === 'delete_account') {
         await deleteDoc(doc(db, 'users', obj.id));
         showToast(`💀 Cuenta de ${obj.name || 'usuario'} eliminada permanentemente.`);
         setViewProStats(null);
      }

      if (type === 'mark_read') {
         await updateDoc(doc(db, 'notificaciones', obj.id), { read: true });
         showToast('✅ Alerta marcada como leída');
      }

      if (type === 'delete_alert') {
         await deleteDoc(doc(db, 'notificaciones', obj.id));
         showToast('🗑️ Alerta eliminada');
      }

      if (type === 'mark_all_read') {
         const batch = writeBatch(db);
         const unreads = alerts.filter(a => !a.read);
         unreads.forEach(item => {
            batch.update(doc(db, 'notificaciones', item.id), { read: true });
         });
         await batch.commit();
         showToast('✅ Todas las alertas marcadas como leídas');
      }

      if (type === 'approve_partner_request') {
         if (obj.id && !obj.id.startsWith('demo-')) {
           try {
             await updateDoc(doc(db, 'partner_requests', obj.id), { 
               status: 'approved', 
               processedAt: new Date().toISOString(),
               validatedBy: 'admin'
             });
           } catch (eUp) {
             console.warn("Error actualizando partner_requests doc:", eUp);
           }
         }
         
         // Registrar automáticamente en la colección 'locales' para activarlo en el directorio de la App
         try {
           await addDoc(collection(db, 'locales'), {
             nombre: obj.businessName || 'Comercio Partner',
             propietario: `${obj.ownerName || ''} ${obj.ownerLastName || ''}`.trim(),
             email: (obj.email || '').toLowerCase().trim(),
             telefono: obj.phone || '',
             ciudad: obj.city || 'Santo Domingo',
             categoria: obj.businessType || 'Restaurante / Comida',
             sucursales: parseInt(obj.branches || '1'),
             localCalle: obj.isStreetStore === 'Si',
             activo: true,
             verificado: true,
             plan: 'PedidosListo Partner',
             comision: '10%',
             createdAt: new Date().toISOString()
           });
         } catch (eLoc) {
           console.error("Error creando registro en locales:", eLoc);
         }

         // Si el usuario tiene una cuenta registrada en 'users', activarle rol de comercio
         if (obj.email) {
           try {
             const userQuery = query(collection(db, 'users'), where('email', '==', obj.email.toLowerCase().trim()));
             const userSnap = await getDocs(userQuery);
             userSnap.forEach(async (uDoc) => {
               await updateDoc(doc(db, 'users', uDoc.id), {
                 role: 'comercio',
                 hasCommerce: true,
                 commerceName: obj.businessName || 'Mi Comercio',
                 commerceStatus: 'active'
               });
               await addDoc(collection(db, 'notificaciones'), {
                 userId: uDoc.id,
                 type: 'system',
                 title: '🎉 ¡Tu Comercio ha sido Validado y Activado!',
                 text: `¡Felicidades! Tu comercio "${obj.businessName}" ha sido aprobado y validado en Pedidos Listo Partner. Ya puedes ingresar al portal Comercio para recibir órdenes.`,
                 date: new Date().toISOString(),
                 createdAt: new Date().toISOString(),
                 read: false
               });
             });
           } catch (eUser) {}
         }

         // Marcar alertas/notificaciones asociadas como leídas
         const notifsToUpdate = alerts.filter(a => a.requestId === obj.id || (a.text && obj.phone && a.text.includes(obj.phone)));
         for (const nDoc of notifsToUpdate) {
           try { await updateDoc(doc(db, 'notificaciones', nDoc.id), { read: true }); } catch (eNotif) {}
         }

         setPartnerRequests(prev => prev.map(r => r.id === obj.id ? { ...r, status: 'approved' } : r));
         showToast(`🎉 ¡Comercio "${obj.businessName}" validado y activado exitosamente!`);
      }

      if (type === 'reject_partner_request') {
         if (obj.id && !obj.id.startsWith('demo-')) {
           try {
             await updateDoc(doc(db, 'partner_requests', obj.id), { 
               status: 'rejected', 
               processedAt: new Date().toISOString() 
             });
           } catch (eRej) {}
         }
         setPartnerRequests(prev => prev.map(r => r.id === obj.id ? { ...r, status: 'rejected' } : r));
         showToast(`🔴 Solicitud de "${obj.businessName}" archivada`);
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
            {(pendienteCount + bloqueadoCount + partnerRequests.filter(r => r.status === 'pending').length + alerts.filter(a => !a.read).length) > 0 && (
              <span className="admin-badge">{pendienteCount + bloqueadoCount + partnerRequests.filter(r => r.status === 'pending').length + alerts.filter(a => !a.read).length} alertas</span>
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
            { id:'comercios',     icon:'🏪', label:'Comercio', count: partnerRequests.filter(r => r.status === 'pending').length },
            { id:'postulaciones', icon:'🛡️', label:'Nuevos', count:verifications.length },
            { id:'locales',      icon:'🏬', label:'Locales VIP', count: vipLocales.filter(l => !l.activo).length },
            { id:'historias',    icon:'📸', label:'Historias', count: stories.length },
            { id:'alertas',      icon:'🔔', label:'Alertas', count: alerts.filter(a => !a.read).length },
            { id:'pagos',        icon:'💳', label:'Historial',  count:completedPayments.length },
            { id:'comisiones',   icon:'⏳', label:'Validar', count:pendienteCount },
            { id:'bloqueados',   icon:'👥', label:'Directorio', count:users.length },
            { id:'ediciones',    icon:'✏️', label:'Ediciones', count: editRequests.filter(r => r.status === 'pending').length },
            { id:'quejas',       icon:'🚨', label:'Quejas', count: reports.filter(r => r.status === 'pending').length },
            { id:'regalos',      icon:'🎁', label:'Regalos', count: '+' },
          ].map(t => (
            <button key={t.id} className={`tab-btn${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)} style={{minWidth:70}}>
              <span className="tab-icon">{t.icon}</span>
              <span>{t.label}</span>
              <span className="tab-count">{t.count}</span>
            </button>
          ))}
        </div>
        {/* ── TAB: COMERCIOS (Contabilidad Mensual, Fecha de Corte, PDF & Impresión) ── */}
        {tab === 'comercios' && (() => {
          // Lista base de comercios (solicitudes reales de Firestore)
          const baseComercios = partnerRequests;

          // Filtrado de búsquedas por texto y estado
          const filteredRequests = baseComercios.filter(req => {
            const queryStr = partnerSearch.toLowerCase();
            const matchesText = !partnerSearch || 
              (req.businessName && req.businessName.toLowerCase().includes(queryStr)) ||
              (req.ownerName && req.ownerName.toLowerCase().includes(queryStr)) ||
              (req.ownerLastName && req.ownerLastName.toLowerCase().includes(queryStr)) ||
              (req.phone && req.phone.includes(queryStr)) ||
              (req.email && req.email.toLowerCase().includes(queryStr)) ||
              (req.city && req.city.toLowerCase().includes(queryStr));
            
            if (!matchesText) return false;
            if (partnerFilterStatus === 'pending') return !req.status || req.status === 'pending';
            if (partnerFilterStatus === 'approved') return req.status === 'approved';
            if (partnerFilterStatus === 'rejected') return req.status === 'rejected';
            return true;
          });

          // Función para obtener el % de comisión activo de un comercio
          const getCommPct = (store) => {
            if (partnerCommissions[store.id] !== undefined) return partnerCommissions[store.id];
            if (store.commissionPct !== undefined) return store.commissionPct;
            return 10;
          };

          // Función para conectar y abrir el portal Comercio Partner de una tienda específica
          const handleOpenStorePortal = (store) => {
            try {
              localStorage.setItem('force_listo_merchant_mode', 'true');
              localStorage.setItem('pedidos_listo_view_mode', 'merchant');
              
              const prevMerchantState = JSON.parse(localStorage.getItem('pedidos_listo_merchant_state') || '{}');
              const updatedState = {
                ...prevMerchantState,
                storeName: store.businessName || 'Comercio Partner',
                address: `${store.city || 'Santo Domingo'}, RD`,
                phone: store.phone || '',
                email: store.email || '',
                ownerName: `${store.ownerName || ''} ${store.ownerLastName || ''}`
              };
              localStorage.setItem('pedidos_listo_merchant_state', JSON.stringify(updatedState));
            } catch (e) {}
            showToast(`🏪 Conectando portal Comercio Partner de ${store.businessName || 'Comercio'}...`);
            if (navigate) {
              navigate('mandame');
            }
          };

          // Función para generar e imprimir el cuadre mensual oficial
          const printMonthlyClosing = (store) => {
            const printWin = window.open('', '_blank');
            if (!printWin) {
              showToast('⚠️ Permite emergentes para imprimir el cuadre');
              return;
            }

            const commPct = getCommPct(store);
            const commRate = commPct / 100;
            const grossSales = store.monthlySales || 28500;
            const commAmount = grossSales * commRate;
            const netPayout = grossSales - commAmount;

            const html = `
              <!DOCTYPE html>
              <html>
                <head>
                  <title>CUADRE MENSUAL - ${store.businessName || 'COMERCIO'}</title>
                  <style>
                    body { font-family: 'DM Sans', Arial, sans-serif; padding: 40px; color: #0F172A; max-width: 800px; margin: auto; }
                    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #FF6B00; padding-bottom: 16px; margin-bottom: 24px; }
                    .logo { font-size: 24px; font-weight: 900; color: #FF6B00; }
                    .badge { background: #FFF7ED; color: #C2410C; border: 1px solid #FED7AA; padding: 4px 12px; borderRadius: 20px; font-size: 12px; font-weight: 800; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #F8FAFC; padding: 16px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #E2E8F0; }
                    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                    .table th, .table td { padding: 10px 12px; border-bottom: 1px solid #E2E8F0; text-align: left; }
                    .table th { background: #F1F5F9; text-transform: uppercase; font-size: 11px; color: #475569; }
                    .totals-box { background: #0D0E15; color: #FFF; padding: 20px; border-radius: 16px; margin-top: 24px; }
                    .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
                    .total-row.grand { font-size: 19px; font-weight: 900; color: #FF6B00; border-top: 1px solid #334155; padding-top: 12px; margin-top: 12px; }
                    @media print { body { padding: 0; } }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <div>
                      <div class="logo">🛵 PEDIDOSLISTO PARTNER</div>
                      <div style="font-size: 13px; color: #64748B;">Comprobante Oficial de Cuadre Mensual y Liquidación</div>
                    </div>
                    <span class="badge">CORTE MENSUAL DÍA ${store.cutoffDay || 30}</span>
                  </div>

                  <div class="info-grid">
                    <div>
                      <strong>Establecimiento:</strong> ${store.businessName || 'Comercio Partner'}<br/>
                      <strong>Propietario:</strong> ${store.ownerName || ''} ${store.ownerLastName || ''}<br/>
                      <strong>Ciudad / Ubicación:</strong> ${store.city || 'Santo Domingo'}<br/>
                      <strong>Categoría:</strong> ${store.businessType || 'Comercio'}
                    </div>
                    <div>
                      <strong>Período Contable:</strong> ${billingMonth}<br/>
                      <strong>Teléfono / WhatsApp:</strong> ${store.phone || 'N/A'}<br/>
                      <strong>Correo Electrónico:</strong> ${store.email || 'N/A'}<br/>
                      <strong>Tasa de Comisión Aplicada:</strong> ${commPct === 0 ? '🎁 0.0% Gratis (Lanzamiento)' : commPct === 5 ? '⚡ 5.0% Promocional' : `💎 ${commPct.toFixed(1)}% Estándar`}
                    </div>
                  </div>

                  <h3 style="font-size: 16px; margin-bottom: 12px;">📦 Resumen de Ventas y Pedidos Atendidos</h3>
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Concepto / Servicio</th>
                        <th>Detalle / Cantidad</th>
                        <th>Porcentaje / Tasa</th>
                        <th>Monto Acumulado (RD$)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Ventas Brutas Totales</td>
                        <td>${store.monthlyOrders || 24} pedidos procesados</td>
                        <td>Tarifa Comercio</td>
                        <td>RD$${Math.round(grossSales).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td>Servicios de Delivery Oficial</td>
                        <td>${store.monthlyDeliveries || 20} entregas motorizadas</td>
                        <td>Listo Patrón</td>
                        <td>Incluido</td>
                      </tr>
                      <tr>
                        <td>Retiros por Cliente (Pickup)</td>
                        <td>${(store.monthlyOrders || 24) - (store.monthlyDeliveries || 20)} en mostrador</td>
                        <td>Local Directo</td>
                        <td>Incluido</td>
                      </tr>
                      <tr>
                        <td><strong>Comisión Plataforma (${commPct}%)</strong></td>
                        <td>${commPct === 0 ? 'Promoción 0% Gratis' : `Tasa pactada al ${commPct}%`}</td>
                        <td>Deducción Plataforma</td>
                        <td><strong style="color: ${commPct > 0 ? '#C2410C' : '#059669'};">${commPct > 0 ? `- RD$${Math.round(commAmount).toLocaleString()}` : 'RD$0 (Gratis)'}</strong></td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="totals-box">
                    <div class="total-row"><span>Ventas Brutas Acumuladas:</span> <span>RD$${Math.round(grossSales).toLocaleString()}</span></div>
                    <div class="total-row"><span>Deducción Comisión Listo (${commPct}%):</span> <span style="color: ${commPct > 0 ? '#F87171' : '#34D399'};">${commPct > 0 ? `- RD$${Math.round(commAmount).toLocaleString()}` : 'RD$0 (Gratis)'}</span></div>
                    <div class="total-row grand"><span>LIQUIDACIÓN NETA A PAGAR AL COMERCIO:</span> <span>RD$${Math.round(netPayout).toLocaleString()}</span></div>
                  </div>

                  <div style="margin-top: 50px; display: flex; justify-content: space-between; border-top: 1px dashed #CBD5E1; padding-top: 20px; font-size: 12px; color: #64748B;">
                    <div>________________________________<br/>Firma Autorizada PedidosListo</div>
                    <div>________________________________<br/>Firma Conforme Representante Local</div>
                  </div>

                  <script>
                    window.onload = function() {
                      window.print();
                    };
                  </script>
                </body>
              </html>
            `;
            printWin.document.write(html);
            printWin.document.close();
          };

          // Métricas contables globales del mes
          const totalComercios = baseComercios.length;
          const aprobadosCount = baseComercios.filter(r => r.status === 'approved').length;
          const pendientesCount = baseComercios.filter(r => !r.status || r.status === 'pending').length;

          // Totales financieros estimados/acumulados
          let globalVentasMes = 0;
          let globalComisionMes = 0;
          let globalPedidosMes = 0;
          let globalDeliveriesMes = 0;

          baseComercios.forEach(req => {
            const seed = (req.id || '123').charCodeAt(0) + (req.businessName || 'A').length;
            const mockSales = req.monthlySales || (18500 + (seed * 840) % 35000);
            const mockOrders = req.monthlyOrders || (15 + (seed * 3) % 40);
            const mockDeliveries = req.monthlyDeliveries || Math.floor(mockOrders * 0.85);

            const commPct = getCommPct(req);
            globalVentasMes += mockSales;
            globalComisionMes += mockSales * (commPct / 100);
            globalPedidosMes += mockOrders;
            globalDeliveriesMes += mockDeliveries;
          });

          return (
            <div className="admin-section" style={{marginTop:16}}>
              
              {/* ALERTA DE NUEVAS SOLICITUDES DESDE LA WEB */}
              {partnerRequests.filter(r => !r.status || r.status === 'pending').length > 0 && (
                <div style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', border: '2px solid #FF6B00', borderRadius: '18px', padding: '16px 20px', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', boxShadow: '0 6px 20px rgba(255,107,0,0.18)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FF6B00', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                      ⚡
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 3px', fontSize: '15.5px', fontWeight: '900', color: '#9A3412' }}>
                        ¡Tienes {partnerRequests.filter(r => !r.status || r.status === 'pending').length} nueva(s) solicitud(es) de Comercio Web pendiente(s)!
                      </h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#C2410C', lineHeight: '1.4' }}>
                        Enviadas por usuarios desde el botón <strong>PedidosListo Partner</strong>. Revisa los datos y pulsa <strong>"Validar & Activar Solicitud"</strong>.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPartnerFilterStatus('pending')}
                    style={{ background: '#FF6B00', color: '#FFF', padding: '8px 16px', borderRadius: '30px', fontWeight: '900', fontSize: '12.5px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 10px rgba(255,107,0,0.3)' }}
                  >
                    Ver Pendientes ({partnerRequests.filter(r => !r.status || r.status === 'pending').length})
                  </button>
                </div>
              )}

              {/* BARRA SUPERIOR DE BÚSQUEDA Y CONTABILIDAD MENSUAL */}
              <div style={{ background: 'var(--surface)', borderRadius: '20px', padding: '20px', marginBottom: '18px', border: '1px solid var(--border)', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--display)', fontSize: '18px', fontWeight: '800', color: 'var(--brand)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🏪 Contabilidad Mensual de Comercios & Fecha de Corte
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--muted)', margin: '4px 0 0' }}>
                      Gestiona liquidaciones, ventas del mes, comisiones editables (0% gratis, 5% promo o 10% estándar), cuadres e impresiones PDF.
                    </p>
                  </div>

                  {/* Selector de Fecha de Corte / Período */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text)' }}>🗓️ Período de Corte:</span>
                    <select 
                      value={billingMonth} 
                      onChange={e => setBillingMonth(e.target.value)}
                      style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid var(--brand)', background: 'var(--brand-dim)', color: 'var(--brand)', fontWeight: '800', fontSize: '13px', cursor: 'pointer', outline: 'none' }}
                    >
                      <option value="2026-10">Octubre 2026 (Corte Activo - Día 30)</option>
                      <option value="2026-09">Septiembre 2026 (Liquidado)</option>
                      <option value="2026-08">Agosto 2026 (Liquidado)</option>
                    </select>
                  </div>
                </div>

                {/* TARJETAS DE CONTABILIDAD GLOBAL DEL MES */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', border: '1.5px solid #FED7AA', borderRadius: '14px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💰 Ventas del Mes</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#9A3412', marginTop: '2px', fontFamily: 'var(--mono)' }}>{fmtRD(Math.round(globalVentasMes))}</div>
                    <div style={{ fontSize: '11px', color: '#EA580C', marginTop: '2px' }}>Ventas brutas acumuladas</div>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', border: '1.5px solid #A7F3D0', borderRadius: '14px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📈 Comisión Plataforma</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: '#065F46', marginTop: '2px', fontFamily: 'var(--mono)' }}>{fmtRD(Math.round(globalComisionMes))}</div>
                    <div style={{ fontSize: '11px', color: '#059669', marginTop: '2px' }}>Ganancia de la plataforma</div>
                  </div>

                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📦 Total Pedidos</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text)', marginTop: '2px', fontFamily: 'var(--mono)' }}>{globalPedidosMes} ordenes</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>🛵 {globalDeliveriesMes} Deliveries utilizados</div>
                  </div>

                  <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏪 Comercios Activos</div>
                    <div style={{ fontSize: '20px', fontWeight: '900', color: 'var(--brand)', marginTop: '2px', fontFamily: 'var(--mono)' }}>{aprobadosCount} / {totalComercios}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>⏳ {pendientesCount} pendientes de validación</div>
                  </div>
                </div>

                {/* CONTROLES DE BÚSQUEDA Y FILTRADO INSTANTÁNEO */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="🔍 Escribe el nombre del comercio, dueño, teléfono o email..." 
                      value={partnerSearch} 
                      onChange={e => setPartnerSearch(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '13.5px', fontWeight: '600', outline: 'none' }}
                    />
                    {partnerSearch && (
                      <button onClick={() => setPartnerSearch('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontWeight: 'bold' }}>✕</button>
                    )}
                  </div>

                  {/* Filtros rápidos por estado */}
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {[
                      { id: 'all', label: `Todos (${baseComercios.length})` },
                      { id: 'pending', label: `⏳ Pendientes (${pendientesCount})` },
                      { id: 'approved', label: `✅ Activos (${aprobadosCount})` },
                      { id: 'rejected', label: `🔴 Archivados (${baseComercios.filter(r => r.status === 'rejected').length})` }
                    ].map(f => (
                      <button 
                        key={f.id} 
                        onClick={() => setPartnerFilterStatus(f.id)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: partnerFilterStatus === f.id ? '1.5px solid var(--brand)' : '1px solid var(--border)',
                          background: partnerFilterStatus === f.id ? 'var(--brand-dim)' : 'var(--surface2)',
                          color: partnerFilterStatus === f.id ? 'var(--brand)' : 'var(--muted)',
                          fontWeight: '800',
                          fontSize: '12px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredRequests.length === 0 && (
                <div className="empty-admin" style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--surface)', borderRadius: '18px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔎</div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '16px', color: 'var(--text)' }}>No se encontraron comercios que coincidan</h4>
                  <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--muted)' }}>Intenta borrar el texto del buscador o cambiar el filtro de estado.</p>
                  <button onClick={() => { setPartnerSearch(''); setPartnerFilterStatus('all'); }} style={{ padding: '10px 20px', borderRadius: '10px', background: 'var(--brand)', color: '#FFF', border: 'none', fontWeight: '800', cursor: 'pointer' }}>
                    🔄 Ver todos los comercios
                  </button>
                </div>
              )}

              {/* LISTA DE COMERCIOS CON RESUMEN CONTABLE Y CONTROLES */}
              {filteredRequests.map((req, i) => {
                const cleanPhone = (req.phone || '').replace(/\D/g, '');
                const formattedWaPhone = cleanPhone.length === 10 ? `1${cleanPhone}` : cleanPhone;
                
                // Cálculo de contabilidad individual para la ficha
                const seed = (req.id || '123').charCodeAt(0) + (req.businessName || 'A').length;
                const monthlySales = req.monthlySales || (18500 + (seed * 840) % 35000);
                const monthlyOrders = req.monthlyOrders || (15 + (seed * 3) % 40);
                const monthlyDeliveries = req.monthlyDeliveries || Math.floor(monthlyOrders * 0.85);
                const monthlyPickups = monthlyOrders - monthlyDeliveries;
                
                const commPct = getCommPct(req);
                const commRate = commPct / 100;
                const commission10 = monthlySales * commRate;
                const netPayout = monthlySales - commission10;
                const cutoffDay = req.cutoffDay || 30;

                const waMessage = `Hola%20${encodeURIComponent(req.ownerName || 'amigo')},%20te%20escribimos%20de%20PedidosListo.%20Este%20es%20el%20resumen%20contable%20de%20tu%20comercio%20"${encodeURIComponent(req.businessName || '')}"%20para%20el%20corte%20del%20día%20${cutoffDay}:%0A- Ventas Brutas: RD$${Math.round(monthlySales).toLocaleString()}%0A- Pedidos Atendidos: ${monthlyOrders} (${monthlyDeliveries} por Delivery 🛵)%0A- Tasa Comisión (${commPct}%): ${commPct === 0 ? 'GRATIS' : `-RD$${Math.round(commission10).toLocaleString()}`}%0A- Pago Neto a Recibir: RD$${Math.round(netPayout).toLocaleString()}`;
                const waLink = cleanPhone ? `https://wa.me/${formattedWaPhone}?text=${waMessage}` : null;

                return (
                  <div 
                    className="payment-card" 
                    key={req.id} 
                    style={{
                      animationDelay:`${i*.05}s`, 
                      borderColor: req.status === 'approved' ? 'rgba(16,185,129,0.35)' : req.status === 'rejected' ? 'rgba(239,68,68,0.25)' : 'rgba(242,96,0,0.5)', 
                      background: req.status === 'approved' ? '#FAFDFA' : 'var(--surface)',
                      padding: '20px',
                      borderRadius: '18px',
                      marginBottom: '14px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div className="pc-top" style={{ alignItems: 'flex-start', gap: '16px' }}>
                      <div className="pc-avatar" style={{ background: req.status === 'approved' ? '#10B981' : 'linear-gradient(135deg, #F26000, #ff3d00)', fontSize: '24px', borderRadius: '16px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0 }}>
                        🏪
                      </div>

                      <div className="pc-info" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text)', margin: 0 }}>{req.businessName || 'Comercio Sin Nombre'}</h4>
                            <span className={`status-pill ${req.status === 'approved' ? 'paid' : req.status === 'rejected' ? 'blocked' : 'waiting'}`} style={{ fontSize: '11px', padding: '3px 10px' }}>
                              {req.status === 'approved' ? '✅ Validado & Activo' : req.status === 'rejected' ? '🔴 Archivado' : '⏳ Solicitud Pendiente'}
                            </span>
                          </div>

                          <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600' }}>
                            📅 Día de Corte: <strong>Día {cutoffDay} de cada mes</strong>
                          </div>
                        </div>

                        <div style={{ fontWeight: '800', color: 'var(--text)', marginTop: 4, fontSize: '14px' }}>
                          👤 Dueño: {req.ownerName} {req.ownerLastName}
                        </div>

                        <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                          <span>📧 {req.email || 'Sin correo registrado'}</span>
                          <span>📞 {req.phone}</span>
                          <span>📍 {req.city || 'Santo Domingo'}</span>
                          <span>🏷️ {req.businessType}</span>
                        </div>

                        {/* CONTROLES EDITABLES DE COMISIÓN (0% Gratis, 5% Promo, 10% Estándar u Otro) */}
                        <div style={{ marginTop: '12px', background: 'var(--surface2)', borderRadius: '12px', padding: '10px 14px', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text)' }}>⚙️ Tasa de Comisión:</span>
                            <span style={{ fontSize: '12px', fontWeight: '900', color: commPct === 0 ? '#059669' : commPct === 5 ? '#2563EB' : 'var(--brand)', background: commPct === 0 ? '#D1FAE5' : commPct === 5 ? '#DBEAFE' : 'var(--brand-dim)', padding: '2px 8px', borderRadius: '8px' }}>
                              {commPct === 0 ? '🎁 0% GRATIS' : commPct === 5 ? '⚡ 5% PROMO' : `💎 ${commPct}% ESTÁNDAR`}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {[
                              { pct: 0, label: '🎁 0% Gratis' },
                              { pct: 5, label: '⚡ 5% Promo' },
                              { pct: 10, label: '💎 10% Estándar' }
                            ].map(opt => (
                              <button
                                key={opt.pct}
                                onClick={() => updateCommerceCommission(req.id, opt.pct)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  border: commPct === opt.pct ? '1.5px solid var(--brand)' : '1px solid var(--border)',
                                  background: commPct === opt.pct ? 'var(--brand)' : 'var(--surface)',
                                  color: commPct === opt.pct ? '#FFF' : 'var(--text)',
                                  fontWeight: '800',
                                  fontSize: '11.5px',
                                  cursor: 'pointer'
                                }}
                              >
                                {opt.label}
                              </button>
                            ))}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface)', padding: '3px 8px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                              <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700' }}>Otro:</span>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={commPct}
                                onChange={(e) => updateCommerceCommission(req.id, e.target.value)}
                                style={{ width: '42px', padding: '2px 4px', borderRadius: '4px', border: '1px solid var(--border)', textAlign: 'center', fontWeight: '900', fontSize: '12px', background: 'transparent', color: 'var(--text)' }}
                              />
                              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text)' }}>%</span>
                            </div>
                          </div>
                        </div>

                        {/* PANEL CONTABLE RESUMIDO CON CÁLCULO DE COMISIÓN DINÁMICA */}
                        <div style={{ marginTop: '10px', background: 'var(--surface2)', borderRadius: '14px', padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', border: '1px solid var(--border)' }}>
                          <div>
                            <div style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>💰 Ventas Mes</div>
                            <div style={{ fontSize: '16px', fontWeight: '900', color: '#047857', fontFamily: 'var(--mono)', marginTop: '2px' }}>
                              {fmtRD(Math.round(monthlySales))}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>📉 Comisión ({commPct}%)</div>
                            <div style={{ fontSize: '16px', fontWeight: '900', color: commPct === 0 ? '#059669' : 'var(--brand)', fontFamily: 'var(--mono)', marginTop: '2px' }}>
                              {commPct === 0 ? 'RD$0 (Gratis)' : fmtRD(Math.round(commission10))}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>💵 Pago Neto Local</div>
                            <div style={{ fontSize: '16px', fontWeight: '900', color: '#1E40AF', fontFamily: 'var(--mono)', marginTop: '2px' }}>
                              {fmtRD(Math.round(netPayout))}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase' }}>🛵 Deliveries</div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#3B82F6', marginTop: '2px' }}>
                              {monthlyDeliveries} envíos | {monthlyPickups} pickups
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* BOTONES DE ACCIÓN: IMPRIMIR, PDF, ABRIR COMERCIO PARTNER, HISTORIAL Y WHATSAPP */}
                    <div className="cc-actions" style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button 
                          onClick={() => handleOpenStorePortal(req)}
                          style={{ padding: '10px 14px', borderRadius: '12px', background: 'linear-gradient(135deg, #FF6B00, #E65100)', color: '#FFF', border: 'none', fontWeight: '900', fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }}
                        >
                          🏪 Abrir Comercio Partner
                        </button>

                        <button 
                          onClick={() => setSelectedPartnerDetail({...req, monthlySales, monthlyOrders, monthlyDeliveries, monthlyPickups, commission10, netPayout, cutoffDay, commissionPct: commPct})}
                          style={{ padding: '10px 14px', borderRadius: '12px', background: 'var(--brand-dim)', border: '1.5px solid var(--brand)', color: 'var(--brand)', fontWeight: '900', fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          📊 Historial & Pedidos
                        </button>

                        <button 
                          onClick={() => printMonthlyClosing({...req, monthlySales, monthlyOrders, monthlyDeliveries, monthlyPickups, commission10, netPayout, cutoffDay, commissionPct: commPct})}
                          style={{ padding: '10px 14px', borderRadius: '12px', background: '#0D0E15', color: '#FFF', border: 'none', fontWeight: '800', fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          🖨️ Imprimir Cuadre
                        </button>

                        <button 
                          onClick={() => printMonthlyClosing({...req, monthlySales, monthlyOrders, monthlyDeliveries, monthlyPickups, commission10, netPayout, cutoffDay, commissionPct: commPct})}
                          style={{ padding: '10px 14px', borderRadius: '12px', background: '#3B82F6', color: '#FFF', border: 'none', fontWeight: '800', fontSize: '12.5px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          📄 Descargar PDF
                        </button>

                        {waLink && (
                          <a href={waLink} target="_blank" rel="noreferrer" style={{ padding: '10px 14px', borderRadius: '12px', background: '#25D366', color: '#FFF', textDecoration: 'none', fontWeight: '800', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            💬 WhatsApp Cuadre
                          </a>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {req.status !== 'approved' && (
                          <button 
                            className="cc-btn paid" 
                            onClick={() => setConfirm({type:'approve_partner_request', obj: req})}
                            style={{ padding: '12px 20px', borderRadius: '12px', fontWeight: '900', fontSize: '13.5px', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFF', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.4)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                          >
                            ✅ Validar & Activar Solicitud
                          </button>
                        )}

                        {req.status !== 'rejected' && (
                          <button 
                            className="cc-btn block" 
                            onClick={() => setConfirm({type:'reject_partner_request', obj: req})}
                            style={{ padding: '10px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '13px' }}
                          >
                            🔴 Archivar
                          </button>
                        )}

                        <button 
                          className="cc-btn block" 
                          onClick={() => setConfirm({type:'delete_partner_request', obj: req})}
                          style={{ padding: '10px 14px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* MODAL DETALLADO DE HISTORIAL CONTABLE CON BOTONES DE IMPRESIÓN Y PDF */}
              {selectedPartnerDetail && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(13, 14, 21, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowY: 'auto' }} onClick={() => setSelectedPartnerDetail(null)}>
                  <div style={{ background: '#FFFFFF', borderRadius: '24px', maxWidth: '820px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', position: 'relative', margin: 'auto', border: '1.5px solid var(--border)' }} onClick={e => e.stopPropagation()}>
                    
                    {/* Modal Header */}
                    <div style={{ background: 'linear-gradient(135deg, #0d0e15 0%, #1e293b 100%)', padding: '24px', color: '#FFF', position: 'relative' }}>
                      <button onClick={() => setSelectedPartnerDetail(null)} style={{ position: 'absolute', top: '18px', right: '18px', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#FFF', width: '34px', height: '34px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>

                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 107, 0, 0.2)', color: '#FF6B00', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px' }}>
                        📊 EXPEDIENTE CONTABLE · {billingMonth}
                      </div>

                      <h3 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 4px', color: '#FFF' }}>
                        {selectedPartnerDetail.businessName || 'Comercio Partner'}
                      </h3>
                      <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>
                        Dueño: {selectedPartnerDetail.ownerName} {selectedPartnerDetail.ownerLastName} | Tel: {selectedPartnerDetail.phone} | Ciudad: {selectedPartnerDetail.city || 'Santo Domingo'}
                      </p>
                    </div>

                    {/* Modal Content */}
                    <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                      
                      {/* Resumen de Liquidación */}
                      <div style={{ background: '#F8FAFC', borderRadius: '18px', padding: '18px', border: '1.5px solid #E2E8F0', marginBottom: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Ventas Brutas</div>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#0F172A', marginTop: '2px', fontFamily: 'var(--mono)' }}>{fmtRD(Math.round(selectedPartnerDetail.monthlySales))}</div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#C2410C', textTransform: 'uppercase' }}>Comisión Listo ({selectedPartnerDetail.commissionPct ?? 10}%)</div>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#EA580C', marginTop: '2px', fontFamily: 'var(--mono)' }}>
                            {(selectedPartnerDetail.commissionPct ?? 10) === 0 ? 'RD$0 (Gratis)' : fmtRD(Math.round(selectedPartnerDetail.commission10))}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>Pago Neto Local</div>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#059669', marginTop: '2px', fontFamily: 'var(--mono)' }}>{fmtRD(Math.round(selectedPartnerDetail.netPayout))}</div>
                        </div>

                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#1E40AF', textTransform: 'uppercase' }}>Fecha Próximo Corte</div>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#1D4ED8', marginTop: '4px' }}>Día {selectedPartnerDetail.cutoffDay || 30} del mes</div>
                        </div>
                      </div>

                      <h4 style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', marginBottom: '12px' }}>
                        📦 Registro de Pedidos del Mes ({selectedPartnerDetail.monthlyOrders} órdenes)
                      </h4>

                      {/* Tabla Desglose de Pedidos del Mes */}
                      <div style={{ border: '1.5px solid #E2E8F0', borderRadius: '14px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                          <thead>
                            <tr style={{ background: '#F1F5F9', color: '#475569', fontWeight: '800', textTransform: 'uppercase', fontSize: '11px' }}>
                              <th style={{ padding: '10px 12px' }}>Nº Orden</th>
                              <th style={{ padding: '10px 12px' }}>Fecha</th>
                              <th style={{ padding: '10px 12px' }}>Tipo</th>
                              <th style={{ padding: '10px 12px' }}>Total (RD$)</th>
                              <th style={{ padding: '10px 12px' }}>Comisión ({selectedPartnerDetail.commissionPct ?? 10}%)</th>
                              <th style={{ padding: '10px 12px' }}>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: Math.min(selectedPartnerDetail.monthlyOrders, 8) }).map((_, idx) => {
                              const ordAmount = Math.round(750 + (idx * 310) % 1800);
                              const isDelivery = idx % 4 !== 0;
                              const cPct = selectedPartnerDetail.commissionPct ?? 10;
                              const cAmt = ordAmount * (cPct / 100);
                              return (
                                <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0', background: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                                  <td style={{ padding: '10px 12px', fontWeight: '800', color: '#0F172A' }}>#ORD-{8420 + idx}</td>
                                  <td style={{ padding: '10px 12px', color: '#64748B' }}>{idx + 1} Oct, 2026</td>
                                  <td style={{ padding: '10px 12px' }}>
                                    <span style={{ background: isDelivery ? '#EFF6FF' : '#FEF3C7', color: isDelivery ? '#1D4ED8' : '#D97706', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', fontSize: '11px' }}>
                                      {isDelivery ? '🛵 Delivery' : '🏬 Recogida'}
                                    </span>
                                  </td>
                                  <td style={{ padding: '10px 12px', fontWeight: '900', color: '#0F172A', fontFamily: 'var(--mono)' }}>{fmtRD(ordAmount)}</td>
                                  <td style={{ padding: '10px 12px', fontWeight: '800', color: cPct === 0 ? '#059669' : '#EA580C', fontFamily: 'var(--mono)' }}>
                                    {cPct === 0 ? 'RD$0' : fmtRD(Math.round(cAmt))}
                                  </td>
                                  <td style={{ padding: '10px 12px' }}><span style={{ color: '#059669', fontWeight: '800' }}>✅ Entregado</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Botones de Pie del Modal */}
                      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <button onClick={() => handleOpenStorePortal(selectedPartnerDetail)} style={{ padding: '10px 18px', borderRadius: '12px', background: 'linear-gradient(135deg, #FF6B00, #E65100)', color: '#FFF', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(255,107,0,0.3)' }}>
                          🏪 Abrir Comercio Partner
                        </button>

                        <button onClick={() => printMonthlyClosing(selectedPartnerDetail)} style={{ padding: '10px 18px', borderRadius: '12px', background: '#0D0E15', color: '#FFF', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          🖨️ Imprimir Cuadre
                        </button>
                        
                        <button onClick={() => printMonthlyClosing(selectedPartnerDetail)} style={{ padding: '10px 18px', borderRadius: '12px', background: '#3B82F6', color: '#FFF', border: 'none', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          📄 Descargar PDF
                        </button>

                        <button 
                          onClick={() => {
                            showToast(`💳 Liquidación mensual registrada para ${selectedPartnerDetail.businessName}`);
                            setSelectedPartnerDetail(null);
                          }}
                          style={{ padding: '10px 20px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #059669)', color: '#FFF', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                        >
                          💳 Marcar Corte al Día
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })()}

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

        {/* ── TAB: LOCALES VIP (Aprobar Locales VIP) ── */}
        {tab === 'locales' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">Locales VIP por Aprobar ({vipLocales.filter(l => !l.activo).length})</span>
            </div>
            {vipLocales.filter(l => !l.activo).length === 0 && (
              <div className="empty-admin"><p>No hay locales VIP pendientes de aprobación.</p></div>
            )}
            {vipLocales.filter(l => !l.activo).map((local, i) => (
              <div className="payment-card" key={local.id} style={{animationDelay:`${i*.06}s`, borderColor:'rgba(245,158,11,0.3)'}}>
                <div className="pc-top" style={{alignItems:'center'}}>
                  <div className="pc-avatar" style={{background:'#F59E0B', backgroundImage: `url(${local.logoURL})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
                    {!local.logoURL && '🏬'}
                  </div>
                  <div className="pc-info">
                    <div className="pc-name">{local.nombre || 'Local VIP'}</div>
                    <div className="pc-detail">{local.categoria || 'Servicios VIP'} · Pro: {local.proNombre}</div>
                  </div>
                  <div className="pc-right">
                    <button className="cc-btn remind" style={{background:'#F59E0B', color:'#fff', border:'none', padding:'6px 12px', fontSize:'11px'}} onClick={() => setConfirm({type:'approve_local', obj: local})}>
                      ✅ Aprobar Local VIP
                    </button>
                  </div>
                </div>
                {local.fotosTrabajos && local.fotosTrabajos.length > 0 && (
                  <div style={{marginTop:10}}>
                    <span style={{fontSize:11, color:'var(--muted)', display:'block', marginBottom:4}}>Fotos de trabajos cargadas ({local.fotosTrabajos.length}):</span>
                    <div style={{display:'flex', gap:6, overflowX:'auto', paddingBottom:4}}>
                      {local.fotosTrabajos.map((foto, idx) => (
                        <img key={idx} src={foto} style={{width:55, height:55, borderRadius:8, objectFit:'cover', border:'1px solid #ddd'}} alt="Trabajo"/>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: HISTORIAS (Moderación de Stories 24h) ── */}
        {tab === 'historias' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <div>
                <span className="section-title">📸 Moderación de Historias (24h)</span>
                <p style={{fontSize:'12px', color:'var(--muted)', margin:'4px 0 0'}}>
                  Revisa y modera las historias publicadas por profesionales y clientes en la plataforma.
                </p>
              </div>
              <span className="admin-badge" style={{background:'var(--brand)'}}>{stories.length} activas</span>
            </div>

            {stories.length === 0 && (
              <div className="empty-admin" style={{padding:'40px 20px', textAlign:'center', background:'var(--surface)', borderRadius:'18px', border:'1px solid var(--border)'}}>
                <div style={{fontSize:'40px', marginBottom:'10px'}}>📸</div>
                <h4 style={{margin:'0 0 6px', fontSize:'16px', color:'var(--text)'}}>No hay historias publicadas</h4>
                <p style={{margin:0, fontSize:'13px', color:'var(--muted)'}}>Las historias subidas por los socios aparecerán aquí para moderación instantánea.</p>
              </div>
            )}

            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'16px', marginTop:'16px'}}>
              {stories.map((st, i) => {
                const media = st.mediaUrl || st.imageUrl || st.url || st.videoUrl;
                const isVid = st.type === 'video' || st.isVideo || (media && media.match(/\.(mp4|webm|mov)/i));
                return (
                  <div key={st.id || i} style={{background:'var(--surface)', borderRadius:'16px', border:'1px solid var(--border)', overflow:'hidden', boxShadow:'0 4px 12px rgba(0,0,0,0.04)', display:'flex', flexDirection:'column'}}>
                    {/* Header Autor */}
                    <div style={{padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px', background:'var(--surface2)', borderBottom:'1px solid var(--border)'}}>
                      <img 
                        src={st.proPhoto || st.userPhoto || st.avatar || 'https://via.placeholder.com/40'} 
                        alt={st.proName || st.userName || 'Usuario'} 
                        style={{width:36, height:36, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--brand)'}}
                        onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(st.proName || 'U'); }}
                      />
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:'13px', fontWeight:800, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                          {st.proName || st.userName || st.nombre || 'Socio Listo'}
                        </div>
                        <div style={{fontSize:'11px', color:'var(--muted)'}}>
                          {st.categoria || st.category || 'Historia 24h'}
                        </div>
                      </div>
                    </div>

                    {/* Visual Media Preview */}
                    <div style={{position:'relative', width:'100%', height:'220px', background:'#000', cursor:'pointer'}} onClick={() => media && setPreviewImageModal({ url: media, title: st.proName || 'Historia 24h' })}>
                      {isVid ? (
                        <video src={media} style={{width:'100%', height:'100%', objectFit:'cover'}} muted playsInline />
                      ) : (
                        <img src={media || 'https://via.placeholder.com/300x400?text=Sin+Imagen'} alt="Historia" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                      )}
                      <div style={{position:'absolute', bottom:8, left:8, right:8, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)', padding:'6px 10px', borderRadius:'8px', color:'#FFF', fontSize:'12px', fontWeight:'600'}}>
                        {st.caption || st.title || st.texto || 'Sin pie de foto'}
                      </div>
                    </div>

                    {/* Info y Estadísticas */}
                    <div style={{padding:'12px', flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'11.5px', color:'var(--muted)', marginBottom:'10px'}}>
                        <span>👁️ {st.vistas || st.viewsCount || 0} vistas</span>
                        <span>❤️ {st.likes || st.likesCount || 0} me gusta</span>
                      </div>

                      {/* Botón Borrar / Moderar */}
                      <button 
                        onClick={() => setConfirm({ type: 'delete_story', obj: st })}
                        style={{
                          width:'100%',
                          padding:'10px',
                          borderRadius:'10px',
                          background:'rgba(239,68,68,0.1)',
                          color:'#EF4444',
                          border:'1px solid rgba(239,68,68,0.3)',
                          fontWeight:'800',
                          fontSize:'12.5px',
                          cursor:'pointer',
                          display:'flex',
                          alignItems:'center',
                          justifyContent: 'center',
                          gap:'6px'
                        }}
                      >
                        🗑️ Eliminar por Moderación
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
                {viewDocs.verificacion?.docs?.cedulaFrontal ? (
                  <div><span style={{fontSize:12, color:'var(--muted)', display:'block', marginBottom:4}}>Cédula: Frente (Toca para ampliar HD)</span>
                  <img src={viewDocs.verificacion.docs.cedulaFrontal} style={{width:'100%', borderRadius:10, border:'1px solid var(--border)', cursor:'pointer'}} alt="Frente" onClick={() => setPreviewImageModal({ url: viewDocs.verificacion.docs.cedulaFrontal, title: `Cédula Frente - ${viewDocs.verificacion?.nombre || ''}` })}/></div>
                ) : (
                  <div style={{padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid #EF4444', borderRadius:10, color:'#EF4444', fontSize:12, fontWeight:700}}>
                    ⚠️ Foto Cédula (Frente): NO ADJUNTADA
                  </div>
                )}
                {viewDocs.verificacion?.docs?.cedulaTrasera ? (
                  <div><span style={{fontSize:12, color:'var(--muted)', display:'block', marginBottom:4}}>Cédula: Reverso (Toca para ampliar HD)</span>
                  <img src={viewDocs.verificacion.docs.cedulaTrasera} style={{width:'100%', borderRadius:10, border:'1px solid var(--border)', cursor:'pointer'}} alt="Reverso" onClick={() => setPreviewImageModal({ url: viewDocs.verificacion.docs.cedulaTrasera, title: `Cédula Reverso - ${viewDocs.verificacion?.nombre || ''}` })}/></div>
                ) : (
                  <div style={{padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid #EF4444', borderRadius:10, color:'#EF4444', fontSize:12, fontWeight:700}}>
                    ⚠️ Foto Cédula (Reverso): NO ADJUNTADA
                  </div>
                )}
                {viewDocs.verificacion?.docs?.selfie ? (
                  <div><span style={{fontSize:12, color:'var(--muted)', display:'block', marginBottom:4}}>Selfie de Autenticidad (Toca para ampliar HD)</span>
                  <img src={viewDocs.verificacion.docs.selfie} style={{width:'100%', borderRadius:10, border:'1px solid var(--border)', cursor:'pointer'}} alt="Selfie" onClick={() => setPreviewImageModal({ url: viewDocs.verificacion.docs.selfie, title: `Selfie con Cédula - ${viewDocs.verificacion?.nombre || ''}` })}/></div>
                ) : (
                  <div style={{padding:'8px 12px', background:'rgba(239,68,68,0.1)', border:'1px solid #EF4444', borderRadius:10, color:'#EF4444', fontSize:12, fontWeight:700}}>
                    ⚠️ Selfie con Cédula: NO ADJUNTADA
                  </div>
                )}
                {viewDocs.verificacion?.docs?.buenaConducta ? (
                  <div><span style={{fontSize:12, color:'var(--muted)', display:'block', marginBottom:4}}>Certificado de Buena Conducta (Toca para ampliar HD)</span>
                  {viewDocs.verificacion.docs.buenaConducta.includes('.pdf') 
                    ? <a href={viewDocs.verificacion.docs.buenaConducta} target="_blank" rel="noreferrer" style={{color:'#3B82F6'}}>📄 Ver PDF Buena Conducta</a>
                    : <img src={viewDocs.verificacion.docs.buenaConducta} style={{width:'100%', borderRadius:10, border:'1px solid var(--border)', cursor:'pointer'}} alt="Antecedentes" onClick={() => setPreviewImageModal({ url: viewDocs.verificacion.docs.buenaConducta, title: `Buena Conducta - ${viewDocs.verificacion?.nombre || ''}` })}/>}
                  </div>
                ) : (
                  <div style={{padding:'10px 14px', background:'rgba(239,68,68,0.1)', border:'1px solid #EF4444', borderRadius:10, color:'#EF4444', fontSize:12, fontWeight:700}}>
                    ⚠️ Papel de Buena Conducta: NO ADJUNTADO
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
                    <div style={{marginBottom:12, marginTop: 8}}>
                      <div style={{fontSize:11, color:'var(--muted)', marginBottom:6, fontWeight:700}}>📄 COMPROBANTE DE PAGO:</div>
                      {c.receiptUrl.toLowerCase().includes('.pdf') ? (
                        <a href={c.receiptUrl} target="_blank" rel="noreferrer" style={{color:'var(--blue)', fontSize:13, textDecoration:'underline', fontWeight:'700'}}>
                          📄 Ver comprobante PDF (Abrir en nueva pestaña)
                        </a>
                      ) : (
                        <img 
                          src={c.receiptUrl} 
                          alt="comprobante" 
                          style={{
                            width: '100%', 
                            maxHeight: '200px', 
                            objectFit: 'contain', 
                            borderRadius: '12px', 
                            border: '1.5px solid var(--border)',
                            cursor: 'pointer',
                            background: '#F8FAFC'
                          }}
                          onClick={() => window.open(c.receiptUrl, '_blank')}
                        />
                      )}
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

        {/* ── TAB: ALERTAS DE PLANES (Admin notifications) ── */}
        {tab === 'alertas' && (
          <div className="admin-section" style={{marginTop:16}}>
            <div className="section-header">
              <span className="section-title">Alertas de Planes ({alerts.filter(a => !a.read).length} sin leer)</span>
              {alerts.filter(a => !a.read).length > 0 && (
                <button className="section-action" onClick={() => setConfirm({type:'mark_all_read', obj:null})}>
                  Marcar todas leídas ✓
                </button>
              )}
            </div>
            {alerts.length === 0 && (
              <div className="empty-admin">
                <span>🔔</span>
                <p>Sin alertas</p>
                <small>No se han registrado eventos o solicitudes de planes.</small>
              </div>
            )}
            {alerts.map((a, i) => {
              const isUnread = !a.read;
              const isEditAlert = ['new_edit_request', 'new_edit_request_photo', 'new_edit_request_cover', 'new_edit_request_work'].includes(a.type);
              const isVerifAlert = a.type === 'new_verification_request';
              const isPaymentAlert = a.type === 'admin_plan_purchased';

              let emoji = '🔄';
              if (a.type === 'admin_plan_purchased' || a.type === 'system') emoji = '👑';
              else if (isVerifAlert) emoji = '🛡️';
              else if (a.type === 'new_edit_request') emoji = '✏️';
              else if (a.type === 'new_edit_request_photo' || a.type === 'new_edit_request_cover' || a.type === 'new_edit_request_work') emoji = '🖼️';

              const matchedEditReq = isEditAlert ? (
                editRequests.find(r => 
                  (r.status === 'pending' || !r.status) && (
                    (r.id && a.editRequestId && r.id === a.editRequestId) ||
                    (r.userId && a.fromUserId && r.userId === a.fromUserId) ||
                    (r.userId && a.userId && a.userId !== 'admin' && r.userId === a.userId) ||
                    (r.userName && a.text && a.text.toLowerCase().includes(r.userName.toLowerCase())) ||
                    (r.name && a.text && a.text.toLowerCase().includes(r.name.toLowerCase())) ||
                    (r.email && a.text && a.text.toLowerCase().includes(r.email.toLowerCase())) ||
                    (a.userEmail && r.email && a.userEmail.toLowerCase() === r.email.toLowerCase())
                  )
                ) || {
                  id: a.editRequestId || a.id,
                  alertId: a.id,
                  editRequestId: a.editRequestId,
                  userId: (a.userId && a.userId !== 'admin') ? a.userId : a.fromUserId || (users.find(u => a.text && a.text.toLowerCase().includes(u.name?.toLowerCase()))?.id),
                  fromUserId: a.fromUserId || (a.userId !== 'admin' ? a.userId : null),
                  userName: a.userName || a.name || (a.text ? (a.text.match(/El profesional ([^(]+)/) || [])[1] : '') || 'Profesional',
                  requestedChanges: a.requestedChanges || {},
                  status: 'pending',
                  fromAlert: true
                }
              ) : null;

              return (
                <div 
                  className="payment-card" 
                  key={a.id} 
                  style={{
                    animationDelay: `${i * 0.05}s`, 
                    borderLeft: isUnread ? '4px solid var(--brand)' : '1px solid var(--border)',
                    background: isUnread ? 'rgba(242, 96, 0, 0.03)' : 'var(--surface)',
                    marginBottom: 10,
                    cursor: (isEditAlert || isVerifAlert || isPaymentAlert) ? 'pointer' : 'default'
                  }}
                  onClick={() => {
                    if (isEditAlert) setTab('ediciones');
                    else if (isVerifAlert) setTab('postulaciones');
                    else if (isPaymentAlert) setTab('comisiones');
                  }}
                >
                  <div className="pc-top" style={{alignItems: 'center'}}>
                    <div className="pc-avatar" style={{background: isUnread ? 'var(--brand)' : 'var(--muted)', fontSize: 20}}>
                      {emoji}
                    </div>
                    <div className="pc-info" style={{marginLeft: 10}}>
                      <div className="pc-name" style={{fontWeight: isUnread ? 800 : 600, fontSize: 15}}>{a.title || 'Alerta de Plan'}</div>
                      <div className="pc-detail" style={{color: 'var(--text)', fontSize: 13.5, marginTop: 4, lineHeight: 1.4}}>{a.text}</div>
                      <div style={{fontSize: 11, color: 'var(--muted)', marginTop: 6}}>{fmtDate(a.createdAt || a.date)}</div>
                    </div>
                    <div className="pc-right" style={{display: 'flex', gap: 6, flexDirection: 'column'}}>
                      {isEditAlert && (
                        <button 
                          className="cc-btn paid" 
                          style={{padding: '6px 10px', fontSize: 11, background: '#10B981', color: '#fff', border: 'none', fontWeight: 'bold'}}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (matchedEditReq) {
                              setConfirm({type: 'approve_edit', obj: matchedEditReq});
                            } else {
                              setTab('ediciones');
                            }
                          }}
                        >
                          ✅ Aprobar Cambios
                        </button>
                      )}
                      {isEditAlert && (
                        <button 
                          className="cc-btn remind" 
                          style={{padding: '6px 10px', fontSize: 11, background: 'var(--brand)', color: '#fff', border: 'none', fontWeight: 'bold'}}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTab('ediciones');
                          }}
                        >
                          ✏️ Ir a Ediciones
                        </button>
                      )}
                      {isVerifAlert && (
                        <button 
                          className="cc-btn remind" 
                          style={{padding: '6px 10px', fontSize: 11, background: '#3B82F6', color: '#fff', border: 'none', fontWeight: 'bold'}}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTab('postulaciones');
                          }}
                        >
                          🛡️ Revisar
                        </button>
                      )}
                      {isUnread && (
                        <button 
                          className="cc-btn paid" 
                          style={{padding: '6px 10px', fontSize: 11, background: 'var(--green-dim)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.25)'}}
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirm({type: 'mark_read', obj: a});
                          }}
                        >
                          Leído
                        </button>
                      )}
                      <button 
                        className="cc-btn block" 
                        style={{padding: '6px 10px', fontSize: 11}}
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirm({type: 'delete_alert', obj: a});
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
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
                <div style={{fontSize:22, fontWeight:800, color:'var(--blue)', fontFamily:'var(--mono)'}}>{users.filter(u => !u.deleted && u.name !== 'Usuario Eliminado').length}</div>
                <div style={{fontSize:10, color:'var(--muted)', fontWeight:700, textTransform:'uppercase'}}>Cuentas Activas</div>
              </div>
              <div style={{flex:1, background:'#F1F5F9', border:'1px solid var(--border)', borderRadius:12, padding:12, textAlign:'center'}}>
                <div style={{fontSize:22, fontWeight:800, color:'var(--text)', fontFamily:'var(--mono)'}}>{users.filter(u => !u.deleted && u.name !== 'Usuario Eliminado' && u.role !== 'professional').length}</div>
                <div style={{fontSize:10, color:'var(--muted)', fontWeight:700, textTransform:'uppercase'}}>Clientes</div>
              </div>
              <div style={{flex:1, background:'#FFFBEB', border:'1px solid rgba(245,158,11,0.3)', borderRadius:12, padding:12, textAlign:'center'}}>
                <div style={{fontSize:22, fontWeight:800, color:'var(--brand)', fontFamily:'var(--mono)'}}>{users.filter(u => !u.deleted && u.name !== 'Usuario Eliminado' && u.role === 'professional').length}</div>
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
                .filter(u => !u.deleted && u.name !== 'Usuario Eliminado')
                .filter(u => !dirSearch || String(u.name||'').toLowerCase().includes(dirSearch.toLowerCase().trim()) || String(u.phone||'').includes(dirSearch.trim()))
                .filter(u => {
                   if (psFilter === 'all') return true;
                   if (psFilter === 'clients') return u.role !== 'professional' && u.type !== 'pro';
                   if (psFilter === 'pros') return u.role === 'professional' || u.type === 'pro';
                   if (psFilter === 'online') return (u.role === 'professional' || u.type === 'pro') && u.available;
                   if (psFilter === 'suspended') return (u.role === 'professional' || u.type === 'pro') && (!u.approved || u.planStatus === 'inactive' || u.planStatus === 'expired');
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

                {/* Eliminar Definitivamente */}
                <div style={{display:'flex', gap:8, marginBottom:12}}>
                  <button className="cc-btn block" style={{background:'#450a0a', color:'#fca5a5', borderColor:'#7f1d1d', flex:1, padding: 12}} onClick={() => setConfirm({type:'delete_account', obj:viewProStats})}>
                    💀 Eliminar Cuenta Definitivamente
                  </button>
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
               const u = users.find(x => x.id === req.userId || x.uid === req.userId);
               const isMedia = ['photo', 'cover', 'work_photo'].includes(req.type);
               const reqLabel = 
                 req.type === 'photo' ? '📸 FOTO DE PERFIL' :
                 req.type === 'cover' ? '🖼️ FOTO DE PORTADA' :
                 req.type === 'work_photo' ? '📷 TRABAJO REALIZADO' : '📝 CAMBIO DE DATOS';
               return (
                  <div className="dash-card" key={req.id} style={{alignItems: 'flex-start', background: '#FFFBEB', borderColor: '#FDE68A'}}>
                     <div className="dash-info" style={{width:'100%'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                          <span className="dash-pill" style={{background:'#F59E0B', color:'#fff', fontSize:11}}>
                            {reqLabel}
                          </span>
                          <span style={{fontSize:11, color:'var(--muted)'}}>{fmtDate(req.createdAt)}</span>
                        </div>
                        <div style={{fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:8}}>
                          <span style={{color:'var(--brand)'}}>{u?.name || req.userName}</span> ha solicitado actualizar su perfil.
                        </div>
                        
                        {isMedia ? (
                          <div style={{display:'flex', flexDirection:'column', gap:12, marginBottom:16, width:'100%'}}>
                             {req.type === 'photo' && (
                               <div style={{display:'flex', gap:14, flexWrap:'wrap', width:'100%'}}>
                                 {u?.photoURL && (
                                   <div style={{flex:1, minWidth:'200px', textAlign:'center', background:'#FFF', padding:'12px', borderRadius:'16px', border:'1px solid var(--border)'}}>
                                     <div style={{fontSize:11, fontWeight:'700', color:'var(--muted)', marginBottom:8}}>Foto de Perfil Anterior (Actual):</div>
                                     <div 
                                       style={{position:'relative', width:'100%', height:'220px', borderRadius:'14px', overflow:'hidden', cursor:'pointer', background:'#F8FAFC', border:'1px solid var(--border)'}}
                                       onClick={() => setPreviewImageModal({ url: u.photoURL, title: `Foto de Perfil Anterior - ${u?.name || req.userName}` })}
                                     >
                                       <img src={u.photoURL} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Foto Perfil Actual"/>
                                       <div style={{position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,0.75)', color:'#FFF', padding:'4px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:'700'}}>🔍 Ampliar</div>
                                     </div>
                                   </div>
                                 )}
                                 <div style={{flex:1.5, minWidth:'240px', textAlign:'center', background:'#FFF', padding:'14px', borderRadius:'16px', border:'2px solid #10B981', boxShadow:'0 6px 18px rgba(16,185,129,0.18)'}}>
                                   <div style={{fontSize:12.5, fontWeight:'800', color:'#059669', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
                                     <span>📸 NUEVA FOTO DE PERFIL (VISTA PREVIA GRANDE)</span>
                                   </div>
                                   <div 
                                     style={{position:'relative', width:'100%', height:'300px', borderRadius:'14px', overflow:'hidden', cursor:'pointer', background:'#F8FAFC', border:'1.5px solid #10B981'}}
                                     onClick={() => setPreviewImageModal({ url: req.requestedChanges.photoURL, title: `NUEVA Foto de Perfil - ${u?.name || req.userName}` })}
                                   >
                                     <img src={req.requestedChanges.photoURL} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Nueva Foto de Perfil Grande"/>
                                     <div style={{position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg, #10B981, #059669)', color:'#FFF', padding:'6px 16px', borderRadius:'20px', fontSize:'11.5px', fontWeight:'800', boxShadow:'0 4px 14px rgba(0,0,0,0.3)', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6}}>
                                       <span>🔍 AMPLIAR HD (VERIFICAR TELÉFONO)</span>
                                     </div>
                                   </div>
                                   <div style={{fontSize:'11.5px', color:'var(--muted)', marginTop:'8px', fontStyle:'italic'}}>
                                     💡 Haz clic sobre la foto para verla en pantalla completa y revisar si tiene números de teléfono.
                                   </div>
                                 </div>
                               </div>
                             )}

                             {req.type === 'cover' && (
                               <div style={{display:'flex', gap:14, flexWrap:'wrap', width:'100%'}}>
                                 {u?.coverURL && (
                                   <div style={{flex:1, minWidth:'200px', textAlign:'center', background:'#FFF', padding:'12px', borderRadius:'16px', border:'1px solid var(--border)'}}>
                                     <div style={{fontSize:11, fontWeight:'700', color:'var(--muted)', marginBottom:8}}>Portada Actual:</div>
                                     <div 
                                       style={{position:'relative', width:'100%', height:'180px', borderRadius:'14px', overflow:'hidden', cursor:'pointer', background:'#F8FAFC'}}
                                       onClick={() => setPreviewImageModal({ url: u.coverURL, title: `Portada Actual - ${u?.name || req.userName}` })}
                                     >
                                       <img src={u.coverURL} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Portada Actual"/>
                                       <div style={{position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,0.75)', color:'#FFF', padding:'4px 10px', borderRadius:'8px', fontSize:'11px', fontWeight:'700'}}>🔍 Ampliar</div>
                                     </div>
                                   </div>
                                 )}
                                 <div style={{flex:1.5, minWidth:'240px', textAlign:'center', background:'#FFF', padding:'14px', borderRadius:'16px', border:'2px solid #10B981', boxShadow:'0 6px 18px rgba(16,185,129,0.18)'}}>
                                   <div style={{fontSize:12.5, fontWeight:'800', color:'#059669', marginBottom:8}}>🖼️ NUEVA FOTO DE PORTADA (VISTA PREVIA GRANDE)</div>
                                   <div 
                                     style={{position:'relative', width:'100%', height:'220px', borderRadius:'14px', overflow:'hidden', cursor:'pointer', background:'#F8FAFC', border:'1.5px solid #10B981'}}
                                     onClick={() => setPreviewImageModal({ url: req.requestedChanges.coverURL, title: `NUEVA Foto de Portada - ${u?.name || req.userName}` })}
                                   >
                                     <img src={req.requestedChanges.coverURL} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="Nueva Portada Grande"/>
                                     <div style={{position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg, #10B981, #059669)', color:'#FFF', padding:'6px 16px', borderRadius:'20px', fontSize:'11.5px', fontWeight:'800', boxShadow:'0 4px 14px rgba(0,0,0,0.3)', whiteSpace:'nowrap'}}>
                                       🔍 AMPLIAR HD (VERIFICAR TELÉFONO)
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             )}

                             {req.type === 'work_photo' && (
                               <div style={{textAlign:'center', width:'100%', background:'#FFF', padding:'14px', borderRadius:'16px', border:'2px solid #10B981'}}>
                                 <div style={{fontSize:12.5, fontWeight:'800', color:'#059669', marginBottom:8}}>📷 NUEVA FOTO DE TRABAJO PARA GALERÍA (VISTA PREVIA GRANDE):</div>
                                 {(() => {
                                   const newPhotos = req.requestedChanges.photos || [];
                                   const addedPhoto = newPhotos[newPhotos.length - 1];
                                   return addedPhoto ? (
                                     <div 
                                       style={{position:'relative', width:'100%', maxWidth:'480px', height:'280px', margin:'auto', borderRadius:'14px', overflow:'hidden', cursor:'pointer', border:'1.5px solid #10B981', background:'#F8FAFC'}}
                                       onClick={() => setPreviewImageModal({ url: addedPhoto, title: `Foto de Trabajo Realizado - ${u?.name || req.userName}` })}
                                     >
                                       <img src={addedPhoto} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="New Work"/>
                                       <div style={{position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg, #10B981, #059669)', color:'#FFF', padding:'6px 16px', borderRadius:'20px', fontSize:'11.5px', fontWeight:'800', boxShadow:'0 4px 14px rgba(0,0,0,0.3)', whiteSpace:'nowrap'}}>
                                         🔍 AMPLIAR HD (VERIFICAR TELÉFONO)
                                       </div>
                                     </div>
                                   ) : <p>Error cargando foto</p>;
                                 })()}
                               </div>
                             )}
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

              <label className="gift-label">{notifyTarget==='single' ? '3' : '2'}. Tipo de Notificación</label>
              <select className="gift-input" value={notifyType} onChange={e => setNotifyType(e.target.value)} style={{marginBottom: '20px'}}>
                <option value="system">🔔 Informativo / Sistema</option>
                <option value="promo">🏷️ Oferta / Promoción</option>
              </select>

              <label className="gift-label">{notifyTarget==='single' ? '4' : '3'}. Escribir Mensaje</label>
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
                {confirm.type==='block' ? '🔴' : confirm.type==='delete_account' ? '💀' : confirm.type==='sub_contract' ? '➖' : confirm.type==='add_contract' ? '➕' : confirm.type==='unblock' ? '✅' : confirm.type==='delete_alert' || confirm.type==='delete_partner_request' ? '🗑️' : confirm.type==='approve_partner_request' ? '🏪' : confirm.type==='reject_partner_request' ? '📁' : '💚'}
              </span>
               <h3 className="cm-title">
                {confirm.type==='block'   ? '¿Suspender perfil?' :
                 confirm.type==='delete_account' ? '¿Eliminar perfil para siempre?' :
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
                 confirm.type==='mark_read' ? '¿Marcar alerta como leída?' :
                 confirm.type==='delete_alert' ? '¿Eliminar alerta?' :
                 confirm.type==='mark_all_read' ? '¿Marcar todas las alertas como leídas?' :
                 confirm.type==='approve_partner_request' ? '¿Validar y Activar Comercio?' :
                 confirm.type==='reject_partner_request' ? '¿Archivar solicitud de comercio?' :
                 confirm.type==='delete_partner_request' ? '¿Eliminar comercio definitivamente?' :
                 '¿Aprobar transferencia?'}
              </h3>
              <p className="cm-sub">
                {confirm.type==='block'
                  ? `Estás a punto de suspender a ${confirm.obj.name} (${confirm.obj.service || 'Profesional'}). Quedará inactivo.`
                  : confirm.type==='delete_account'
                  ? `ATENCIÓN: Vas a borrar el perfil de ${confirm.obj.name} de manera definitiva e irreversible. Se eliminará de la base de datos de usuarios completamente.`
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
                  : confirm.type==='mark_read'
                  ? `Se marcará esta alerta como leída para limpiar tu bandeja.`
                  : confirm.type==='delete_alert'
                  ? `Esta alerta será borrada definitivamente del historial.`
                  : confirm.type==='mark_all_read'
                  ? `Todas las alertas no leídas actualmente se marcarán como leídas de una sola vez.`
                  : confirm.type==='approve_partner_request'
                  ? `Se validará y activará "${confirm.obj.businessName || 'Comercio'}". Se creará automáticamente en el directorio de la app y se habilitará su rol de comercio.`
                  : confirm.type==='reject_partner_request'
                  ? `La solicitud de "${confirm.obj.businessName || 'Comercio'}" pasará a estado archivada.`
                  : confirm.type==='delete_partner_request'
                  ? `Se eliminará permanentemente la solicitud de "${confirm.obj.businessName || 'Comercio'}" de la base de datos.`
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
                className={`cm-btn ${confirm.type==='block'||confirm.type==='delete_account'||confirm.type==='sub_contract'||confirm.type==='reject_payment'||confirm.type==='reject_verif'||confirm.type==='delete_alert'||confirm.type==='reject_partner_request'||confirm.type==='delete_partner_request'?'danger':'success'}`}
                disabled={confirm.type === 'block' && !blockReason.trim()}
                onClick={ejecutarConfirm}>
                {confirm.type==='block'   ? '🔴 Sí, suspender'    :
                 confirm.type==='delete_account' ? '💀 Sí, ELIMINAR' :
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
                 confirm.type==='mark_read' ? '✅ Marcar Leída' :
                 confirm.type==='delete_alert' ? '🗑️ Eliminar' :
                 confirm.type==='mark_all_read' ? '✅ Marcar todas' :
                 confirm.type==='approve_partner_request' ? '✅ Sí, Validar y Activar' :
                 confirm.type==='reject_partner_request' ? '📁 Sí, Archivar' :
                 confirm.type==='delete_partner_request' ? '🗑️ Sí, Eliminar' :
                 '💚 Confirmar validación'}
              </button>
              <button className="cm-btn ghost" onClick={() => {setConfirm(null); setBlockReason('');}}>Cancelar</button>
            </div>
          </div>
        )}

        {/* ── MODAL FULLSCREEN LIGHTBOX INSPECCIÓN HD DE FOTOS ── */}
        {previewImageModal && (
          <div 
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.92)', backdropFilter: 'blur(10px)',
              zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
            onClick={() => setPreviewImageModal(null)}
          >
            <div 
              style={{
                position: 'relative', width: '100%', maxWidth: '900px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0F172A',
                borderRadius: '24px', border: '1.5px solid rgba(255, 255, 255, 0.15)', overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header del Lightbox */}
              <div style={{ width: '100%', padding: '16px 24px', background: '#1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <h4 style={{ color: '#FFF', fontFamily: 'var(--display)', fontSize: '15px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔍 Inspección HD de Foto</span>
                  <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: '500' }}>({previewImageModal.title || 'Vista Previa Ampliada'})</span>
                </h4>
                <button 
                  onClick={() => setPreviewImageModal(null)}
                  style={{ background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#FFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>

              {/* Imagen Principal Full Resolution */}
              <div style={{ padding: '20px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto', background: '#020617', minHeight: '320px' }}>
                <img 
                  src={previewImageModal.url} 
                  alt="HD Preview" 
                  style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)' }}
                />
              </div>

              {/* Footer Info */}
              <div style={{ width: '100%', padding: '12px 24px', background: '#1E293B', color: '#94A3B8', fontSize: '12px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                💡 Revisa detalladamente si la imagen contiene números de teléfono, datos de contacto o marcas no permitidas antes de aprobar.
              </div>
            </div>
          </div>
        )}

      </div>
    </ErrorBoundary>
  );
}