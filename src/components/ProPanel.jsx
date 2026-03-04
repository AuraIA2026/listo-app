import { useState } from 'react'
import './ProPanel.css'

/* ─── DATOS DE EJEMPLO ──────────────────────────────────────── */
const mockPro = {
  name: 'Carlos Méndez',
  specialty: 'Mecánico Automotriz',
  rating: 4.9,
  city: 'Santo Domingo',
  plan: 'gold',
  planStatus: 'active', // 'active' | 'review' | 'inactive'
  contracts: 13,
  completedJobs: 47,
  requests: 62,
  pendingJobs: 3,
  photo: null,
  approved: true,
}

const plans = [
  {
    id: 'standard',
    icon: '🔹',
    name: 'Plan Estándar',
    contracts: 5,
    bonus: 3,
    price: 'RD$ 500',
    perks: ['Aparece en búsquedas básicas', 'Sin prioridad', 'Sin insignia especial'],
    btnLabel: 'Comprar Plan Estándar',
    btnClass: 'btn-standard',
    popular: false,
  },
  {
    id: 'gold',
    icon: '🥇',
    name: 'Pack Gold',
    contracts: 10,
    bonus: 3,
    price: 'RD$ 1,000',
    perks: ['Mejor posicionamiento', 'Más visibilidad en su categoría'],
    btnLabel: 'Comprar Gold',
    btnClass: 'btn-gold',
    popular: true,
  },
  {
    id: 'platinum',
    icon: '🥈',
    name: 'Pack Platinum',
    contracts: 15,
    bonus: 3,
    price: 'RD$ 1,500',
    perks: ['Mayor prioridad en búsquedas', 'Perfil mejor destacado'],
    btnLabel: 'Comprar Platinum',
    btnClass: 'btn-platinum',
    popular: false,
  },
  {
    id: 'vip',
    icon: '💎',
    name: 'VIP Ilimitado',
    contracts: '∞',
    bonus: 3,
    price: 'RD$ 2,000 / mensual',
    perks: ['Máxima prioridad en búsquedas', 'Insignia VIP visible', 'Profesional recomendado', 'Mayor exposición en la app'],
    btnLabel: 'Activar VIP',
    btnClass: 'btn-vip',
    popular: false,
  },
]

const banks = [
  { name: 'Banreservas', account: '9607282472', holder: 'Julio de Jesús Francisco' },
  { name: 'Banco Popular', account: '746424456', holder: 'Julio de Jesús Francisco' },
]

/* ─── STATUS BADGE ──────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    active:   { label: '🟢 Activo',           cls: 'status-active' },
    review:   { label: '🟡 Pago en revisión', cls: 'status-review' },
    inactive: { label: '🔴 Inactivo',          cls: 'status-inactive' },
  }
  const s = map[status] || map.inactive
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>
}

/* ─── SECCIÓN: PAGO ─────────────────────────────────────────── */
function PaymentSection({ plan, onBack }) {
  const [copied, setCopied] = useState(null)
  const [uploaded, setUploaded] = useState(false)

  const copy = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopied(idx)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="pp-payment">
      <button className="pp-back-btn" onClick={onBack}>← Volver a planes</button>
      <h3 className="pp-pay-title">💳 Activar {plan.name}</h3>
      <p className="pp-pay-price">{plan.price}</p>
      <p className="pp-pay-sub">📦 Total inicial: <strong>{plan.contracts === '∞' ? 'Ilimitado' : `${parseInt(plan.contracts) + plan.bonus} contratos`}</strong></p>

      <p className="pp-pay-inst">🏦 Realiza el depósito a:</p>
      {banks.map((b, i) => (
        <div key={i} className="pp-bank-card">
          <p className="pp-bank-name">🏦 {b.name}</p>
          <p className="pp-bank-acc">Cuenta: <strong>{b.account}</strong></p>
          <p className="pp-bank-holder">Titular: {b.holder}</p>
          <button className="pp-copy-btn" onClick={() => copy(b.account, i)}>
            {copied === i ? '✅ Copiado' : '📋 Copiar número'}
          </button>
        </div>
      ))}

      <p className="pp-pay-inst" style={{marginTop:20}}>📤 Enviar comprobante:</p>
      <div className="pp-send-options">
        <label className="pp-send-opt">
          <input type="file" accept="image/*" style={{display:'none'}} onChange={() => setUploaded(true)} />
          <span>📎 {uploaded ? '✅ Foto subida' : 'Subir foto del depósito'}</span>
        </label>
        <a className="pp-send-opt" href="https://wa.me/18099090455" target="_blank" rel="noreferrer">
          📲 WhatsApp: 809-909-0455
        </a>
        <a className="pp-send-opt" href="mailto:listopatron.app@gmail.com">
          📧 listopatron.app@gmail.com
        </a>
      </div>

      <div className="pp-pay-note">
        🔁 Tu estado cambiará a <strong>🟡 Pago en revisión</strong> al enviar el comprobante, y a <strong>🟢 Plan activo</strong> cuando el admin apruebe.
      </div>
    </div>
  )
}

/* ─── COMPONENTE PRINCIPAL ──────────────────────────────────── */
export default function ProPanel({ onClose, pro = mockPro }) {
  const [section, setSection]           = useState('main')
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [available, setAvailable]       = useState(true)
  const [openSection, setOpenSection]   = useState('plans')

  const toggle = (s) => setOpenSection(prev => prev === s ? null : s)

  const choosePlan = (plan) => {
    setSelectedPlan(plan)
    setSection('payment')
  }

  /* ── FORMULARIO POSTULACIÓN ── */
  const ApplyForm = () => (
    <div className="pp-apply">
      <h3 className="pp-sec-title">📝 Postularse como Profesional</h3>
      {['Nombre completo','Especialidad','Teléfono','Ciudad','Años de experiencia'].map((f,i) => (
        <input key={i} className="pp-input" placeholder={f} />
      ))}
      <textarea className="pp-input pp-textarea" placeholder="Descripción" rows={3} />
      <label className="pp-file-label">
        📄 Subir cédula
        <input type="file" accept="image/*,application/pdf" style={{display:'none'}} />
      </label>
      <label className="pp-file-label">
        🏅 Subir certificaciones
        <input type="file" accept="image/*,application/pdf" style={{display:'none'}} />
      </label>
      <button className="pp-submit-btn">👉 Enviar Solicitud</button>
    </div>
  )

  /* ── ESTADÍSTICAS COMPLETAS ── */
  const Stats = () => (
    <div className="pp-stats">
      <h3 className="pp-sec-title">📊 Mi Rendimiento</h3>
      <div className="pp-stats-grid">
        {[
          { icon:'📦', label:'Contratos disponibles', val: pro.contracts },
          { icon:'📈', label:'Trabajos completados',  val: pro.completedJobs },
          { icon:'⭐', label:'Calificación promedio',  val: pro.rating },
          { icon:'📩', label:'Solicitudes recibidas', val: pro.requests },
          { icon:'📌', label:'Trabajos pendientes',   val: pro.pendingJobs },
        ].map((s,i) => (
          <div key={i} className="pp-stat-card">
            <span className="pp-stat-icon">{s.icon}</span>
            <span className="pp-stat-val">{s.val}</span>
            <span className="pp-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="pp-overlay" onClick={onClose}>
      <div className="pp-panel" onClick={e => e.stopPropagation()}>

        {/* HANDLE */}
        <div className="pp-handle" />

        {/* CLOSE */}
        <button className="pp-close" onClick={onClose}>✕</button>

        <div className="pp-scroll">

          {section === 'payment' && selectedPlan ? (
            <PaymentSection plan={selectedPlan} onBack={() => setSection('main')} />
          ) : section === 'apply' ? (
            <>
              <ApplyForm />
              <button className="pp-back-btn" onClick={() => setSection('main')}>← Volver</button>
            </>
          ) : section === 'stats' ? (
            <>
              <Stats />
              <button className="pp-back-btn" onClick={() => setSection('main')}>← Volver</button>
            </>
          ) : (
            <>

              {/* ══ 1. PERFIL ══ */}
              <div className="pp-profile">
                <div className="pp-avatar">
                  {pro.photo
                    ? <img src={pro.photo} alt={pro.name} />
                    : <span>{pro.name.charAt(0)}</span>
                  }
                </div>
                <div className="pp-profile-info">
                  <p className="pp-name">{pro.name}</p>
                  <p className="pp-spec">{pro.specialty}</p>
                  <p className="pp-meta">⭐ {pro.rating} &nbsp;|&nbsp; 📍 {pro.city}</p>
                  <StatusBadge status={pro.planStatus} />
                </div>
                <button className="pp-edit-btn">✏️ Editar</button>
              </div>

              {/* ══ 2. PLANES ══ */}
              <div className="pp-accordion">
                <button className="pp-acc-header" onClick={() => toggle('plans')}>
                  <span>👑 Planes para Profesionales</span>
                  <span className="pp-acc-arrow">{openSection === 'plans' ? '▲' : '▼'}</span>
                </button>
                {openSection === 'plans' && (
                  <div className="pp-acc-body">
                    <p className="pp-plans-hint">Toca un plan para ver los detalles y activarlo.</p>
                    {plans.map(plan => (
                      <div key={plan.id} className={`pp-plan-card pp-plan-${plan.id}`}>
                        {plan.popular && <span className="pp-popular-tag">🟡 POPULAR</span>}
                        <div className="pp-plan-header">
                          <span className="pp-plan-icon">{plan.icon}</span>
                          <div>
                            <p className="pp-plan-name">{plan.name}</p>
                            <p className="pp-plan-price">{plan.price}</p>
                          </div>
                        </div>
                        <ul className="pp-plan-perks">
                          <li>📦 {plan.contracts === '∞' ? 'Contratos ilimitados' : `${plan.contracts} contratos`} + 🎁 {plan.bonus} gratis</li>
                          <li>📦 Total inicial: <strong>{plan.contracts === '∞' ? 'Ilimitado' : `${parseInt(plan.contracts) + plan.bonus} contratos`}</strong></li>
                          {plan.perks.map((p,i) => <li key={i}>✔ {p}</li>)}
                        </ul>
                        <button className={`pp-plan-btn ${plan.btnClass}`} onClick={() => choosePlan(plan)}>
                          👉 {plan.btnLabel}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ══ 4. BONOS ══ */}
              <div className="pp-accordion">
                <button className="pp-acc-header" onClick={() => toggle('bonos')}>
                  <span>🎁 Bonos y Créditos Extra</span>
                  <span className="pp-acc-arrow">{openSection === 'bonos' ? '▲' : '▼'}</span>
                </button>
                {openSection === 'bonos' && (
                  <div className="pp-acc-body">
                    <div className="pp-bonos-list">
                      {[
                        { icon:'⭐', text:'5 estrellas en una reseña', val:'+1 contrato' },
                        { icon:'📄', text:'Perfil 100% completo',      val:'+2 contratos' },
                        { icon:'👥', text:'Referido confirmado',        val:'+3 contratos' },
                      ].map((b,i) => (
                        <div key={i} className="pp-bono-item">
                          <span className="pp-bono-icon">{b.icon}</span>
                          <span className="pp-bono-text">{b.text}</span>
                          <span className="pp-bono-val">{b.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ══ 5. RENDIMIENTO ══ */}
              <div className="pp-accordion">
                <button className="pp-acc-header" onClick={() => toggle('stats')}>
                  <span>📊 Mi Rendimiento</span>
                  <span className="pp-acc-arrow">{openSection === 'stats' ? '▲' : '▼'}</span>
                </button>
                {openSection === 'stats' && (
                  <div className="pp-acc-body">
                    <div className="pp-stats-mini">
                      {[
                        { icon:'📦', label:'Contratos',   val: pro.contracts },
                        { icon:'📈', label:'Completados', val: pro.completedJobs },
                        { icon:'⭐', label:'Calificación', val: pro.rating },
                        { icon:'📩', label:'Solicitudes', val: pro.requests },
                        { icon:'📌', label:'Pendientes',  val: pro.pendingJobs },
                      ].map((s,i) => (
                        <div key={i} className="pp-stat-mini">
                          <span className="pp-stat-icon">{s.icon}</span>
                          <span className="pp-stat-val">{s.val}</span>
                          <span className="pp-stat-label">{s.label}</span>
                        </div>
                      ))}
                    </div>
                    <button className="pp-stats-btn" onClick={() => setSection('stats')}>👉 Ver estadísticas completas</button>
                  </div>
                )}
              </div>

              {/* ══ 6. POSTULARSE (solo si no aprobado) ══ */}
              {!pro.approved && (
                <div className="pp-accordion">
                  <button className="pp-acc-header" onClick={() => toggle('apply')}>
                    <span>📝 Postularse como Profesional</span>
                    <span className="pp-acc-arrow">{openSection === 'apply' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'apply' && (
                    <div className="pp-acc-body">
                      <button className="pp-stats-btn" onClick={() => setSection('apply')}>👉 Abrir formulario</button>
                    </div>
                  )}
                </div>
              )}

              {/* ══ 7. CONFIGURACIÓN ══ */}
              <div className="pp-accordion">
                <button className="pp-acc-header" onClick={() => toggle('config')}>
                  <span>⚙️ Configuración</span>
                  <span className="pp-acc-arrow">{openSection === 'config' ? '▲' : '▼'}</span>
                </button>
                {openSection === 'config' && (
                  <div className="pp-acc-body">
                    <div className="pp-config-row">
                      <span>🟢 Disponibilidad</span>
                      <label className="pp-toggle">
                        <input type="checkbox" checked={available} onChange={() => setAvailable(!available)} />
                        <span className="pp-toggle-slider" />
                      </label>
                    </div>
                    {['🔑 Cambiar contraseña','✏️ Editar información personal'].map((item,i) => (
                      <button key={i} className="pp-config-btn">{item}</button>
                    ))}
                    <button className="pp-logout-btn">🚪 Cerrar sesión</button>
                  </div>
                )}
              </div>

              <div style={{height: 30}} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}