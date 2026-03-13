import { useState, useRef } from 'react'
import './CreditosMenu.css'

const BANCOS = [
  { nombre: 'Banreservas', cuenta: '9607282472', titular: 'Julio de Jesús Francisco', color: '#e6b800', icon: '🏦' },
  { nombre: 'Banco Popular', cuenta: '746424456', titular: 'Julio de Jesús Francisco', color: '#e63946', icon: '🏛️' },
]
const WHATSAPP = '8099090455'

export default function CreditosMenu({ lang }) {
  const [menuOpen, setMenuOpen]       = useState(false)
  const [screen, setScreen]           = useState(null) // null | 'comprar' | 'canjear'
  const [comprobante, setComprobante] = useState(null)
  const [copiedIdx, setCopiedIdx]     = useState(null)
  const [monto, setMonto]             = useState('')
  const [enviado, setEnviado]         = useState(false)
  const [codigoC, setCodigoC]         = useState('')
  const fileRef = useRef()

  const openScreen = (s) => { setMenuOpen(false); setScreen(s); setEnviado(false); setComprobante(null); setMonto(''); setCodigoC('') }
  const close      = ()  => { setScreen(null) }

  const copiar = (texto, idx) => {
    navigator.clipboard.writeText(texto)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1800)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setComprobante(URL.createObjectURL(file))
  }

  const enviarWhatsApp = () => {
    const msg = encodeURIComponent(`Hola! Adjunto comprobante de depósito por RD$${monto} para recarga de créditos en app Listo.`)
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
    setEnviado(true)
  }

  return (
    <>
      {/* ── BOTÓN 3 RAYITAS ── */}
      <button
        className={`cm-ham-btn ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(v => !v)}
        aria-label="Menú"
      >
        <span className="cm-line" />
        <span className="cm-line" />
        <span className="cm-line" />
      </button>

      {/* ── DRAWER ── */}
      {menuOpen && (
        <div className="cm-overlay" onClick={() => setMenuOpen(false)}>
          <div className="cm-drawer" onClick={e => e.stopPropagation()}>
            <div className="cm-drawer-head">
              <div className="cm-avatar">👷</div>
              <div className="cm-dname">{lang === 'es' ? 'Mi Cuenta' : 'My Account'}</div>
              <div className="cm-dsub">{lang === 'es' ? 'Profesional registrado' : 'Registered professional'}</div>
            </div>

            <div className="cm-sec-label">{lang === 'es' ? 'CRÉDITOS' : 'CREDITS'}</div>

            <button className="cm-item cm-item-highlight" onClick={() => openScreen('comprar')}>
              <div className="cm-icon" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>💳</div>
              <div className="cm-item-text">
                <span className="cm-item-title">{lang === 'es' ? 'Comprar Crédito' : 'Buy Credit'}</span>
                <span className="cm-item-sub">{lang === 'es' ? 'Deposita y recarga' : 'Deposit and recharge'}</span>
              </div>
              <span className="cm-badge">+</span>
            </button>

            <button className="cm-item cm-item-highlight cm-item-gold" onClick={() => openScreen('canjear')}>
              <div className="cm-icon" style={{ background: 'linear-gradient(135deg,#fbbf24,#d97706)' }}>🎁</div>
              <div className="cm-item-text">
                <span className="cm-item-title" style={{ color: '#b45309' }}>{lang === 'es' ? 'Canjear Crédito' : 'Redeem Credit'}</span>
                <span className="cm-item-sub">{lang === 'es' ? 'Usa tu saldo' : 'Use your balance'}</span>
              </div>
              <span className="cm-badge" style={{ background: '#fbbf24' }}>↓</span>
            </button>

            <div className="cm-divider" />
            <div className="cm-sec-label">{lang === 'es' ? 'GENERAL' : 'GENERAL'}</div>

            {[
              ['👤', lang === 'es' ? 'Mi Perfil'    : 'My Profile',  '#fff7ed'],
              ['📋', lang === 'es' ? 'Mis Pedidos'  : 'My Orders',   '#f0fdf4'],
              ['⭐', lang === 'es' ? 'Reseñas'      : 'Reviews',     '#fefce8'],
              ['💬', lang === 'es' ? 'Mensajes'     : 'Messages',    '#eff6ff'],
            ].map(([ic, lb, bg]) => (
              <button className="cm-item" key={lb} onClick={() => setMenuOpen(false)}>
                <div className="cm-icon" style={{ background: bg }}>{ic}</div>
                <span>{lb}</span>
              </button>
            ))}

            <div className="cm-divider" />
            {[
              ['❓', lang === 'es' ? 'Ayuda'         : 'Help',     '#fdf4ff'],
              ['⚙️', lang === 'es' ? 'Configuración' : 'Settings', '#f8fafc'],
              ['🚪', lang === 'es' ? 'Cerrar sesión' : 'Log out',  '#fff5f5'],
            ].map(([ic, lb, bg]) => (
              <button className="cm-item" key={lb} onClick={() => setMenuOpen(false)}>
                <div className="cm-icon" style={{ background: bg }}>{ic}</div>
                <span>{lb}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── SHEET: COMPRAR ── */}
      {screen === 'comprar' && (
        <div className="cm-sheet-overlay" onClick={close}>
          <div className="cm-sheet" onClick={e => e.stopPropagation()}>
            <div className="cm-sheet-handle" />
            <div className="cm-sheet-header">
              <div className="cm-sheet-eyebrow">💳 {lang === 'es' ? 'Créditos' : 'Credits'}</div>
              <div className="cm-sheet-title">{lang === 'es' ? 'Comprar Crédito' : 'Buy Credit'}</div>
              <div className="cm-sheet-sub">{lang === 'es' ? 'Deposita y envía tu comprobante para activar créditos' : 'Deposit and send your receipt to activate credits'}</div>
            </div>

            <div className="cm-sheet-body">
              {/* monto */}
              <div className="cm-field">
                <label className="cm-label">{lang === 'es' ? 'MONTO A DEPOSITAR (RD$)' : 'AMOUNT TO DEPOSIT (RD$)'}</label>
                <input className="cm-input-amount" type="number" placeholder="Ej: 500" value={monto} onChange={e => setMonto(e.target.value)} />
              </div>

              {/* cuentas */}
              <div className="cm-label" style={{ marginBottom: 8 }}>{lang === 'es' ? 'CUENTAS BANCARIAS' : 'BANK ACCOUNTS'}</div>

              {BANCOS.map((b, i) => (
                <div className="cm-bank-card" key={b.nombre} style={{ borderColor: `${b.color}40` }}>
                  <div className="cm-bank-top">
                    <div className="cm-bank-icon">{b.icon}</div>
                    <div>
                      <div className="cm-bank-name" style={{ color: b.color }}>{b.nombre}</div>
                      <div className="cm-bank-titular">{b.titular}</div>
                    </div>
                  </div>
                  <div className="cm-copy-row">
                    <div>
                      <div className="cm-copy-label">{lang === 'es' ? 'No. de cuenta' : 'Account number'}</div>
                      <div className="cm-copy-num">{b.cuenta}</div>
                    </div>
                    <button className={`cm-copy-btn ${copiedIdx === i ? 'copied' : ''}`} onClick={() => copiar(b.cuenta, i)}>
                      {copiedIdx === i ? '✓ Copiado' : lang === 'es' ? 'Copiar' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))}

              {/* comprobante */}
              <div className="cm-label" style={{ marginBottom: 8 }}>{lang === 'es' ? 'COMPROBANTE DE DEPÓSITO' : 'DEPOSIT RECEIPT'}</div>

              {!comprobante ? (
                <div className="cm-upload" onClick={() => fileRef.current.click()}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>📎</div>
                  <div className="cm-upload-text">
                    <strong>{lang === 'es' ? 'Toca para subir foto' : 'Tap to upload photo'}</strong><br />
                    {lang === 'es' ? 'del comprobante de depósito' : 'of your deposit receipt'}<br />
                    <span style={{ fontSize: 11, opacity: 0.6 }}>JPG, PNG · máx. 10MB</span>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img src={comprobante} alt="comprobante" className="cm-preview" />
                  <button className="cm-change-btn" onClick={() => setComprobante(null)}>
                    {lang === 'es' ? 'Cambiar' : 'Change'}
                  </button>
                </div>
              )}

              {/* whatsapp */}
              <div className="cm-label" style={{ marginBottom: 8 }}>{lang === 'es' ? 'TAMBIÉN POR WHATSAPP' : 'ALSO VIA WHATSAPP'}</div>

              <div className="cm-wa-card">
                <div className="cm-wa-icon">💬</div>
                <div className="cm-wa-info">
                  <div className="cm-wa-title">WhatsApp</div>
                  <div className="cm-wa-num">809-909-0455</div>
                </div>
                <button className={`cm-wa-btn ${enviado ? 'sent' : ''}`} onClick={enviarWhatsApp}>
                  {enviado ? '✓ Enviado' : lang === 'es' ? 'Enviar' : 'Send'}
                </button>
              </div>

              <button className="cm-btn-main" onClick={close}>
                ✓ {lang === 'es' ? 'Ya realicé el depósito' : 'I already deposited'}
              </button>
              <button className="cm-btn-cancel" onClick={close}>
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SHEET: CANJEAR ── */}
      {screen === 'canjear' && (
        <div className="cm-sheet-overlay" onClick={close}>
          <div className="cm-sheet" onClick={e => e.stopPropagation()}>
            <div className="cm-sheet-handle" />
            <div className="cm-sheet-header">
              <div className="cm-sheet-eyebrow">🎁 {lang === 'es' ? 'Créditos' : 'Credits'}</div>
              <div className="cm-sheet-title">{lang === 'es' ? 'Canjear Crédito' : 'Redeem Credit'}</div>
              <div className="cm-sheet-sub">{lang === 'es' ? 'Usa tu saldo para servicios en la app' : 'Use your balance for services in the app'}</div>
            </div>

            <div className="cm-sheet-body">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="cm-balance-chip">💰 {lang === 'es' ? 'Balance disponible' : 'Available balance'}: <strong>RD$0.00</strong></div>
              </div>

              <div className="cm-field">
                <label className="cm-label">{lang === 'es' ? 'CÓDIGO DE CANJE' : 'REDEEM CODE'}</label>
                <input className="cm-input-canje" placeholder={lang === 'es' ? 'Ingresa tu código aquí...' : 'Enter your code here...'} value={codigoC} onChange={e => setCodigoC(e.target.value)} />
              </div>

              <div className="cm-field">
                <label className="cm-label">{lang === 'es' ? 'O MONTO A CANJEAR (RD$)' : 'OR AMOUNT TO REDEEM (RD$)'}</label>
                <input className="cm-input-amount" type="number" placeholder="Ej: 200" value={monto} onChange={e => setMonto(e.target.value)} />
              </div>

              <div className="cm-info-box">
                ℹ️ {lang === 'es'
                  ? 'Los créditos se aplican a tu próximo servicio. El proceso puede tardar hasta 5 minutos.'
                  : 'Credits apply to your next service. The process may take up to 5 minutes.'}
              </div>

              <button className="cm-btn-main" onClick={close}>
                🎁 {lang === 'es' ? 'Canjear ahora' : 'Redeem now'}
              </button>
              <button className="cm-btn-cancel" onClick={close}>
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}