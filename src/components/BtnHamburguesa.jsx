import { useState, useEffect, useRef } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useUserData } from '../useUserData'
import './BtnHamburguesa.css'
import '../pages/PaymentPage.css' // Importando estilos idénticos al pago de usuarios

/* ─── PLANES ─── */
const planes = [
  {
    id: 'standard', num: '1', emoji: '🔹', nombre: 'Plan Estándar', contratos: '5 contratos',
    precio: 'RD$500', colorKey: 'standard', badge: 'BÁSICO',
    titulo: 'Plan Estándar — Empieza a crecer',
    subtitulo: 'El primer paso para conseguir más clientes.',
    descripcion: 'Con 5 contratos disponibles puedes comenzar a postularte y demostrar tu talento. Ideal para profesionales que están iniciando en la plataforma.',
    beneficios: ['✅ 5 contratos listos para usar', '✅ Aparece en búsquedas básicas', '✅ +3 contratos gratis al suscribirte'],
    cta: '¡El mejor punto de partida para construir tu reputación en Listo!',
  },
  {
    id: 'gold', num: '2', emoji: '🥇', nombre: 'Pack Gold', contratos: '10 contratos',
    precio: 'RD$1,000', colorKey: 'gold', badge: 'POPULAR',
    titulo: 'Pack Gold — El más popular',
    subtitulo: 'El favorito de los profesionales que quieren crecer rápido.',
    descripcion: 'Da el salto y consigue 10 contratos adicionales para postularte a los mejores proyectos.',
    beneficios: ['⚡ 10 contratos listos para usar', '⚡ Mayor visibilidad en búsquedas', '⚡ Más chances de cerrar ventas'],
    cta: '¡El plan más elegido por profesionales exitosos en Listo!',
  },
  {
    id: 'platinum', num: '3', emoji: '🥈', nombre: 'Pack Platinum', contratos: '15 contratos',
    precio: 'RD$1,500', colorKey: 'platinum', badge: 'ACTIVO',
    titulo: 'Pack Platinum — Para gente activa',
    subtitulo: 'Para los que no se detienen.',
    descripcion: 'Con 15 contratos disponibles puedes postularte sin pausas y mantener un flujo constante de nuevos clientes.',
    beneficios: ['🔥 15 contratos de alto valor', '🔥 Flujo constante de postulaciones', '🔥 Crecimiento sostenido garantizado'],
    cta: 'Para profesionales que entienden que más oportunidades = más ingresos.',
  },
  {
    id: 'vip', num: '4', emoji: '💎', nombre: 'VIP Ilimitado', contratos: '∞ contratos',
    precio: 'RD$2,000/mes', colorKey: 'vip', badge: 'ÉLITE',
    titulo: 'VIP Ilimitado — Sin techo',
    subtitulo: 'Sin límites. Sin restricciones. Máximo potencial.',
    descripcion: 'Postúlate a contratos ilimitados cada mes. Cero restricciones, máxima exposición, prioridad absoluta.',
    beneficios: ['🚀 Postulaciones ilimitadas cada mes', '🚀 Prioridad en resultados de búsqueda', '🚀 Ventaja competitiva absoluta'],
    cta: 'Si tu negocio son tus servicios, no puedes permitirte límites.',
  },
]

/* ─── PALETAS ─── */
const palettes = {
  standard: {
    primary: '#2E7D32',
    gradient: 'linear-gradient(145deg, #66BB6A 0%, #388E3C 40%, #2E7D32 70%, #4CAF50 100%)',
    shadow: 'rgba(46,125,50,0.55)', shine: 'rgba(165,214,167,0.65)',
    light: '#E8F5E9', btn3d: '#1B5E20', badgeBg: '#1B5E20',
    glow: '0 0 22px rgba(46,125,50,0.65), 0 0 44px rgba(46,125,50,0.3)',
  },
  gold: {
    primary: '#D4A017',
    gradient: 'linear-gradient(145deg, #F5C842 0%, #D4940A 40%, #B8780A 70%, #E8B832 100%)',
    shadow: 'rgba(212,160,23,0.55)', shine: 'rgba(255,240,160,0.65)',
    light: '#FFF8E0', btn3d: '#9A6E08', badgeBg: '#7A4D00',
    glow: '0 0 22px rgba(212,160,23,0.65), 0 0 44px rgba(212,160,23,0.3)',
  },
  platinum: {
    primary: '#7A8FA8',
    gradient: 'linear-gradient(145deg, #C8D4E0 0%, #8E9BAF 40%, #6B7A8D 70%, #B0BEC8 100%)',
    shadow: 'rgba(110,130,155,0.55)', shine: 'rgba(220,230,240,0.75)',
    light: '#F0F2F6', btn3d: '#4A5C70', badgeBg: '#3A5068',
    glow: '0 0 20px rgba(122,143,168,0.6), 0 0 40px rgba(122,143,168,0.25)',
  },
  vip: {
    primary: '#F26000',
    gradient: 'linear-gradient(145deg, #FF8C42 0%, #F26000 35%, #C94E00 65%, #FF7020 100%)',
    shadow: 'rgba(242,96,0,0.6)', shine: 'rgba(255,200,140,0.55)',
    light: '#FFF0E6', btn3d: '#A03800', badgeBg: '#6B1D00',
    glow: '0 0 24px rgba(242,96,0,0.7), 0 0 52px rgba(242,96,0,0.35)',
  },
}

/* ─── BOTÓN 3D ─── */
function Btn3D({ onClick, bg, shadow, children, secondary }) {
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)} onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        width: '100%', padding: secondary ? '13px' : '16px',
        background: secondary ? 'linear-gradient(145deg,#F0F0F0,#D8D8D8)' : bg,
        color: secondary ? '#777' : 'white', border: 'none', borderRadius: '16px',
        fontSize: secondary ? '14px' : '16px', fontWeight: '900', cursor: 'pointer',
        boxShadow: pressed
          ? `0 2px 0 ${secondary ? '#B0B0B0' : shadow}`
          : `0 6px 0 ${secondary ? '#B0B0B0' : shadow}, 0 8px 24px ${secondary ? '#B0B0B0' : shadow}44`,
        transform: pressed ? 'translateY(4px)' : 'translateY(0)',
        transition: 'transform 0.08s, box-shadow 0.08s', marginBottom: '10px',
      }}
    >{children}</button>
  )
}

/* ─── TARJETA 3D ─── */
function PlanCard3D({ plan, onSelect }) {
  const [hover, setHover] = useState(false)
  const pal = palettes[plan.colorKey]
  const isVip = plan.colorKey === 'vip'
  return (
    <div
      onClick={() => onSelect(plan)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', cursor: 'pointer',
        transform: hover ? 'translateY(-7px) scale(1.05)' : 'translateY(0) scale(1)',
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        filter: hover ? `drop-shadow(0 14px 28px ${pal.shadow})` : `drop-shadow(0 5px 12px ${pal.shadow})`,
      }}
    >
      <div style={{ position: 'absolute', bottom: '-7px', left: '7px', right: '-2px', height: '100%', borderRadius: '18px', background: pal.primary, opacity: 0.28, filter: 'blur(5px)', zIndex: 0 }} />
      <div style={{
        position: 'relative', zIndex: 1, background: pal.gradient, borderRadius: '18px',
        padding: '18px 10px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
        border: `1.5px solid ${pal.shine}`, minHeight: '158px', overflow: 'hidden',
        boxShadow: hover ? pal.glow : `inset 0 1px 0 ${pal.shine}`, transition: 'box-shadow 0.3s',
      }}>
        <div style={{ position: 'absolute', top: 0, left: '8%', right: '8%', height: '38%', background: `linear-gradient(180deg,${pal.shine} 0%,transparent 100%)`, borderRadius: '0 0 50% 50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '8px', right: '8px', background: pal.badgeBg, color: 'white', fontSize: '7px', fontWeight: '900', letterSpacing: '0.5px', padding: '2px 6px', borderRadius: '5px' }}>{plan.badge}</div>
        <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.18)', color: 'rgba(255,255,255,0.9)', width: '20px', height: '20px', borderRadius: '50%', fontSize: '10px', fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{plan.num}</div>
        <div style={{ marginTop: '12px', position: 'relative' }}>
          <span style={{ fontSize: '32px', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.3))' }}>{plan.emoji}</span>
          {isVip && <>
            <span style={{ position: 'absolute', top: '-8px', right: '-13px', fontSize: '13px', animation: 'twinkle 0.8s ease-in-out infinite alternate' }}>✨</span>
            <span style={{ position: 'absolute', bottom: '-5px', left: '-11px', fontSize: '11px', animation: 'twinkle 1.2s ease-in-out infinite alternate' }}>⭐</span>
          </>}
        </div>
        <p style={{ fontSize: '12px', fontWeight: '800', color: 'white', margin: '6px 0 0', textShadow: '0 1px 4px rgba(0,0,0,0.4)', textAlign: 'center', lineHeight: 1.2 }}>{plan.nombre}</p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: '600' }}>{plan.contratos}</p>
        <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: '8px', padding: '4px 10px', marginTop: '5px', border: '1px solid rgba(255,255,255,0.2)' }}>
          <p style={{ fontSize: '13px', fontWeight: '900', color: 'white', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{plan.precio}</p>
        </div>
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 0', letterSpacing: '0.5px' }}>TAP PARA VER →</p>
      </div>
    </div>
  )
}

/* ─── MODAL DETALLE PLAN ─── */
function PlanModal({ plan, onClose, onConfirm }) {
  const pal = palettes[plan.colorKey]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(7px)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '28px 28px 0 0', padding: '12px 22px 44px', width: '100%', maxWidth: '480px', maxHeight: '92vh', overflowY: 'auto', animation: 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: '40px', height: '4px', background: '#E0E0E0', borderRadius: '2px', margin: '0 auto 18px' }} />
        <div style={{ background: pal.gradient, borderRadius: '20px', padding: '22px 20px', marginBottom: '20px', position: 'relative', overflow: 'hidden', boxShadow: `0 8px 32px ${pal.shadow}` }}>
          <div style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: '35%', background: `linear-gradient(180deg,${pal.shine} 0%,transparent 100%)`, borderRadius: '0 0 50% 50%', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '50px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>{plan.emoji}</span>
            <div>
              <div style={{ background: 'rgba(0,0,0,0.18)', display: 'inline-block', color: 'rgba(255,255,255,0.95)', fontSize: '10px', fontWeight: '900', letterSpacing: '1px', padding: '2px 8px', borderRadius: '6px', marginBottom: '6px' }}>{plan.badge}</div>
              <h2 style={{ fontSize: '19px', fontWeight: '900', color: 'white', margin: '0 0 4px', textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>{plan.titulo}</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', margin: 0, lineHeight: 1.5 }}>{plan.subtitulo}</p>
            </div>
          </div>
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)', borderRadius: '10px', padding: '6px 14px' }}>
              <span style={{ color: 'white', fontWeight: '900', fontSize: '18px' }}>{plan.precio}</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontWeight: '600' }}>{plan.contratos}</span>
          </div>
        </div>
        <p style={{ fontSize: '14px', color: '#555', lineHeight: 1.75, margin: '0 0 18px' }}>{plan.descripcion}</p>
        <div style={{ background: pal.light, borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1.5px solid ${pal.primary}22` }}>
          <p style={{ fontSize: '11px', fontWeight: '900', color: '#1C1C1C', letterSpacing: '0.8px', margin: '0 0 10px', textTransform: 'uppercase' }}>¿QUÉ INCLUYE?</p>
          {plan.beneficios.map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderBottom: i < plan.beneficios.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
              <span style={{ fontSize: '14px' }}>{b}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '13px', fontWeight: '700', fontStyle: 'italic', color: pal.primary, textAlign: 'center', margin: '0 0 22px', lineHeight: 1.5 }}>"{plan.cta}"</p>
        <Btn3D onClick={onConfirm} bg={pal.gradient} shadow={pal.btn3d}>💎 Postularme al {plan.nombre}</Btn3D>
        <Btn3D onClick={onClose} secondary>🤔 Lo pensaré más tarde</Btn3D>
      </div>
    </div>
  )
}

/* ─── MODAL CONFIRMACIÓN ─── */
function ConfirmModal({ plan, onClose }) {
  const pal = palettes[plan.colorKey]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(7px)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '28px', padding: '40px 28px', width: '100%', maxWidth: '360px', textAlign: 'center', animation: 'bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '64px', marginBottom: '14px' }}>✅</div>
        <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1C1C1C', margin: '0 0 10px' }}>¡Solicitud enviada!</h3>
        <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.7, margin: '0 0 28px' }}>
          Un asesor de <strong>Listo</strong> te contactará pronto para activar tu <strong style={{ color: pal.primary }}>{plan.nombre}</strong>.
        </p>
        <Btn3D onClick={onClose} bg={pal.gradient} shadow={pal.btn3d}>Entendido 👍</Btn3D>
      </div>
    </div>
  )
}

/* ─── SECCIÓN PAGO (IDÉNTICO A USUARIOS / PAYMENTPAGE) ─── */
function PaymentSection({ plan, onBack, onConfirm }) {
  const pal = palettes[plan.colorKey]
  const [method, setMethod] = useState('transfer') // 'transfer' o 'card'

  // States para Transferencia
  const [selectedBank, setSelectedBank] = useState(null)
  const [transferAmount, setTransferAmount] = useState('')
  const [depositorName, setDepositorName] = useState('')
  const [receiptUploaded, setReceiptUploaded] = useState(false)
  const receiptInputRef = useRef(null)

  // States para Modal Webview AZUL
  const [showWebview, setShowWebview] = useState(false)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [isProcessingAzul, setIsProcessingAzul] = useState(false)

  const banks = [
    { id: 'reservas', name: 'Banco de Reservas' },
    { id: 'bhd', name: 'BHD León' },
    { id: 'popular', name: 'Banco Popular' },
    { id: 'scotia', name: 'Scotiabank' },
    { id: 'bancaribe', name: 'Bancaribe' },
    { id: 'promerica', name: 'Banco Promerica' },
    { id: 'asoc', name: 'Asoc. Popular' },
    { id: 'vimenca', name: 'Vimenca' },
  ]

  const handleReceiptUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) setReceiptUploaded(true)
  }

  const handleProcessAzul = () => {
    if (!cardName || cardNumber.length < 15 || !cardExp || !cardCvv) {
      alert("Por favor completa los datos de la tarjeta.")
      return
    }
    setIsProcessingAzul(true)
    setTimeout(() => {
      setIsProcessingAzul(false)
      setShowWebview(false)
      setReceiptUploaded(true)
    }, 2000)
  }

  const canConfirmTransfer = method === 'transfer' && selectedBank && transferAmount > 0 && depositorName.trim() !== '' && receiptUploaded
  const canConfirmCard = method === 'card' && receiptUploaded
  const canConfirm = canConfirmTransfer || canConfirmCard

  return (
    <div className="payment-page" style={{ position: 'relative', height: '100%', minHeight: 'auto', background: 'transparent' }}>

      <div className="payment-header" style={{ marginBottom: '20px', borderRadius: '16px', background: '#FFF3EC' }}>
        <button className="pay-back-btn" onClick={onBack}>←</button>
        <h3 className="payment-title" style={{ margin: 0, fontSize: '18px' }}>Activar {plan.nombre}</h3>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <p className="pp-pay-price" style={{ color: pal.primary, fontSize: '28px', fontWeight: '900', margin: '0' }}>{plan.precio}</p>
        <p className="pp-pay-sub" style={{ color: '#666', fontSize: '14px', margin: '4px 0 0' }}>📦 Total inicial: <strong>{plan.contratos}</strong> + 🎁 3 gratis</p>
      </div>

      <div style={{ padding: '0 10px 120px', marginBottom: '40px' }}>
        <div className="pay-section fade-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="pay-section-title">Método de pago</h3>
          <div className="pay-methods">
            <button
              className={`pay-method-card ${method === 'transfer' ? 'selected' : ''}`}
              onClick={() => { setMethod('transfer'); setReceiptUploaded(false) }}
            >
              <div className="pay-method-icon transfer-icon">🏦</div>
              <div className="pay-method-info">
                <p className="pay-method-name">Transferencia bancaria / App</p>
                <p className="pay-method-desc">Envía el dinero y adjunta el comprobante para el profesional.</p>
              </div>
              <div className={`pay-method-radio ${method === 'transfer' ? 'checked' : ''}`} />
            </button>
            <button
              className={`pay-method-card ${method === 'card' ? 'selected' : ''}`}
              onClick={() => { setMethod('card'); setReceiptUploaded(false) }}
            >
              <div className="pay-method-icon card-icon" style={{ background: '#E3F2FD', color: '#1976D2' }}>💳</div>
              <div className="pay-method-info">
                <p className="pay-method-name">Tarjeta de Crédito o Débito</p>
                <p className="pay-method-desc">Paga de forma segura usando tu tarjeta vía la pasarela AZUL.</p>
              </div>
              <div className={`pay-method-radio ${method === 'card' ? 'checked' : ''}`} />
            </button>
          </div>
        </div>

        {method === 'transfer' && (
          <div className="pay-section fade-up">
            <h3 className="pay-section-title">Detalles de la Transferencia</h3>
            <div className="transfer-manual-box" style={{ background: 'white', borderRadius: '18px', padding: '20px', border: '1.5px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', textAlign: 'left' }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '13.5px', fontWeight: 700, color: 'var(--black)', marginBottom: '8px' }}>Banco Destino</label>
              <select
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #eee', background: '#FAFAFA', fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--black)', boxSizing: 'border-box', marginBottom: '16px', outline: 'none' }}
                value={selectedBank?.id || ''}
                onChange={e => setSelectedBank(banks.find(b => b.id === e.target.value))}
              >
                <option value="" disabled>Selecciona la cuenta del profesional...</option>
                {banks.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>

              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '13.5px', fontWeight: 700, color: 'var(--black)', marginBottom: '8px' }}>Monto Depositado (RD$)</label>
              <input
                type="number"
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #eee', background: '#FAFAFA', fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--black)', boxSizing: 'border-box', marginBottom: '16px', outline: 'none' }}
                placeholder="Ej. 1500"
                value={transferAmount}
                onChange={e => setTransferAmount(e.target.value)}
              />

              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '13.5px', fontWeight: 700, color: 'var(--black)', marginBottom: '8px' }}>Nombre de quien deposita</label>
              <input
                type="text"
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #eee', background: '#FAFAFA', fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--black)', boxSizing: 'border-box', marginBottom: '16px', outline: 'none' }}
                placeholder="Ej. Juan Pérez"
                value={depositorName}
                onChange={e => setDepositorName(e.target.value)}
              />

              <label className="transfer-manual-label" style={{ marginTop: '16px' }}>Foto del Recibo</label>
              <div className="transfer-manual-upload" onClick={() => receiptInputRef.current?.click()}>
                {receiptUploaded ? (
                  <div className="receipt-success">
                    <span>✅ Recibo Cargado con Éxito</span>
                    <span style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Toca para cambiar</span>
                  </div>
                ) : (
                  <div className="receipt-placeholder">
                    <span className="receipt-icon">📸</span>
                    <span className="receipt-text">Toca para cargar foto del recibo</span>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                ref={receiptInputRef}
                className="hidden-input"
                onChange={handleReceiptUpload}
              />
            </div>
          </div>
        )}

        {method === 'card' && (
          <div className="pay-section fade-up">
            <div className="pay-note transfer-note">
              <p>El cargo se procesará de forma segura a través de AZUL.</p>
            </div>

            {!receiptUploaded ? (
              <button
                className="upload-receipt-btn"
                onClick={() => setShowWebview(true)}
                style={{ background: '#002E6D', color: 'white', border: 'none', marginTop: '16px', boxShadow: '0 4px 12px rgba(0,46,109,0.3)' }}
              >
                💳 Introducir Tarjeta (Vía AZUL)
              </button>
            ) : (
              <button className="upload-receipt-btn uploaded" style={{ marginTop: '16px' }} disabled>
                ✅ Pago Aprobado por AZUL
              </button>
            )}
          </div>
        )}
      </div>

      {/* WEBVIEW MODAL DE BANCO SIMULADO (ESTILO AZUL) */}
      {showWebview && method === 'card' && (
        <div className="payment-webview-overlay" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="payment-webview-modal" style={{ background: '#fff', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.3s ease' }}>
            <div className="webview-header" style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', background: '#F8F9FA', borderBottom: '1px solid #ddd' }}>
              <span style={{ color: '#4CAF50', marginRight: '8px' }}>🔒</span>
              <div style={{ flex: 1, background: '#E9ECEF', borderRadius: '20px', padding: '6px 16px', fontSize: '12px', color: '#495057', textAlign: 'center' }}>
                https://pagos.azul.com.do/payment/checkout
              </div>
              <button onClick={() => setShowWebview(false)} style={{ background: 'none', border: 'none', fontSize: '24px', marginLeft: '12px', padding: '4px', cursor: 'pointer' }}>×</button>
            </div>

            <div className="webview-content azul-content" style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h1 style={{ color: '#002E6D', fontSize: '36px', fontWeight: '900', fontStyle: 'italic', margin: 0, letterSpacing: '2px' }}>AZUL</h1>
              </div>

              <h3 style={{ marginBottom: '6px', fontFamily: 'var(--font-display)', color: '#002E6D' }}>Pago Seguro</h3>
              <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>Monto a debitar: <strong>{plan.precio}</strong></p>

              <div className="webview-form azul-form">
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>Titular de la tarjeta</label>
                  <input
                    type="text"
                    placeholder="Nombre como aparece en la tarjeta"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>Número de Tarjeta</label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>Vencimiento</label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      value={cardExp}
                      onChange={e => setCardExp(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#555' }}>CVC/CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={4}
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>
                </div>

                <button
                  className={`azul-submit-btn ${isProcessingAzul ? 'processing' : ''}`}
                  onClick={handleProcessAzul}
                  disabled={isProcessingAzul}
                  style={{ width: '100%', background: '#002E6D', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}
                >
                  {isProcessingAzul ? <span className="loader-azul"></span> : `Pagar ${plan.precio}`}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                  <span style={{ fontSize: '12px', color: '#999' }}>Procesado localmente por</span>
                  <strong style={{ color: '#0055A5', fontSize: '12px' }}>Banco Popular</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIXED BOTTOM BAR */}
      <div className="payment-fixed-bottom" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '20px', borderTop: '1px solid #eee', boxShadow: '0 -4px 16px rgba(0,0,0,0.05)', zIndex: 100 }}>
        <button
          className={`pay-confirm-btn fade-up ${canConfirm ? 'ready' : ''}`}
          disabled={!canConfirm}
          onClick={onConfirm}
          style={{ width: '100%', padding: '16px', background: canConfirm ? pal.primary : '#E0E0E0', color: canConfirm ? 'white' : '#999', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '900', cursor: canConfirm ? 'pointer' : 'not-allowed', transition: 'all 0.3s' }}
        >
          {canConfirm
            ? `Enviar Solicitud de ${plan.nombre}`
            : 'Completa los pasos para continuar'}
        </button>
      </div>

    </div>
  )
}

/* ─── STATUS BADGE ─── */
function StatusBadge({ status }) {
  const map = {
    active: { label: '🟢 Activo', cls: 'status-active' },
    review: { label: '🟡 Pago en revisión', cls: 'status-review' },
    inactive: { label: '🔴 Inactivo', cls: 'status-inactive' },
  }
  const s = map[status] || map.inactive
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>
}

/* ─── MODAL EDITAR PERFIL ─── */
function EditModal({ userData, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onCancel}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '32px 24px', width: '100%', maxWidth: 360, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <span style={{ fontSize: 40 }}>✏️</span>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: '10px 0 4px' }}>Editar perfil</h3>
        <p style={{ fontSize: 13, color: '#999', margin: '0 0 20px' }}>Actualiza tu información</p>

        <div style={{ textAlign: 'left', marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4, fontWeight: 600 }}>Nombre completo</label>
          <input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #eee', fontSize: 15, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = '#F26000'}
            onBlur={e => e.target.style.borderColor = '#eee'}
          />
        </div>

        <div style={{ textAlign: 'left', marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4, fontWeight: 600 }}>Teléfono</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="809-000-0000"
            style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #eee', fontSize: 15, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
            onFocus={e => e.target.style.borderColor = '#F26000'}
            onBlur={e => e.target.style.borderColor = '#eee'}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', padding: 14, background: saving ? '#ccc' : 'linear-gradient(135deg,#FF6B35,#FF8C42)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', marginBottom: 10 }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button onClick={onCancel} style={{ width: '100%', padding: 12, background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

/* ─── COMPONENTE PRINCIPAL ─── */
export default function BtnHamburguesa({ onClose, navigate, initialOpenSection = 'plans' }) {
  const { userData, loading, user, getInitials, profileComplete } = useUserData()

  const [section, setSection] = useState('main')
  const [planDetalle, setPlanDetalle] = useState(null)
  const [confirmed, setConfirmed] = useState(null)
  const [available, setAvailable] = useState(true)
  const [openSection, setOpenSection] = useState(initialOpenSection)
  const [showEditModal, setShowEditModal] = useState(false)

  const scrollRef = useRef(null)
  const planesRef = useRef(null)

  useEffect(() => {
    if (initialOpenSection === 'plans') {
      setTimeout(() => {
        if (planesRef.current && scrollRef.current) {
          scrollRef.current.scrollTop = planesRef.current.offsetTop - 10
        }
      }, 400)
    }
  }, [])

  const toggle = (s) => setOpenSection(prev => prev === s ? null : s)

  // ── Guardar cambios del perfil ──
  const handleSaveProfile = async (form) => {
    try {
      await updateProfile(user, { displayName: form.name })
      await updateDoc(doc(db, 'users', user.uid), {
        name: form.name,
        phone: form.phone,
      })
      setShowEditModal(false)
    } catch (e) {
      console.error('Error guardando:', e)
    }
  }

  // Datos a mostrar: Firebase o fallback
  const displayName = userData?.name || user?.displayName || 'Profesional'
  const displayCity = userData?.city || 'Santo Domingo'
  const displayRating = userData?.rating || '—'
  const displayPhoto = userData?.photoURL || user?.photoURL || null
  const displayStatus = userData?.planStatus || 'inactive'
  const displaySpec = userData?.category || userData?.specialty || 'Profesional'

  const ApplyForm = () => (
    <div className="pp-apply">
      <h3 className="pp-sec-title">📝 Postularse como Profesional</h3>
      {['Nombre completo', 'Especialidad', 'Teléfono', 'Ciudad', 'Años de experiencia'].map((f, i) => (
        <input key={i} className="pp-input" placeholder={f} />
      ))}
      <textarea className="pp-input pp-textarea" placeholder="Descripción" rows={3} />
      <label className="pp-file-label">📄 Subir cédula<input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} /></label>
      <label className="pp-file-label">🏅 Subir certificaciones<input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} /></label>
      <button className="pp-submit-btn">👉 Enviar Solicitud</button>
    </div>
  )

  const Stats = () => (
    <div className="pp-stats">
      <h3 className="pp-sec-title">📊 Mi Rendimiento</h3>
      <div className="pp-stats-grid">
        {[
          { icon: '📦', label: 'Contratos disponibles', val: userData?.contracts || 0 },
          { icon: '📈', label: 'Trabajos completados', val: userData?.completedJobs || 0 },
          { icon: '⭐', label: 'Calificación promedio', val: userData?.rating || '—' },
          { icon: '📩', label: 'Solicitudes recibidas', val: userData?.requests || 0 },
          { icon: '📌', label: 'Trabajos pendientes', val: userData?.pendingJobs || 0 },
        ].map((s, i) => (
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
    <>
      <style>{`
        @keyframes twinkle  { 0%{opacity:.3;transform:scale(.7) rotate(-10deg)} 100%{opacity:1;transform:scale(1.2) rotate(10deg)} }
        @keyframes slideUp  { from{transform:translateY(60px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes bounceIn { 0%{transform:scale(.6);opacity:0} 100%{transform:scale(1);opacity:1} }
        @keyframes pulseGuide { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(242,96,0,0); } 50% { transform: scale(1.05); box-shadow: 0 0 12px rgba(242,96,0,0.6); } }
      `}</style>

      <div className="pp-overlay" onClick={onClose}>
        <div className="pp-panel" onClick={e => e.stopPropagation()}>
          <div className="pp-handle" />
          <button className="pp-close" onClick={onClose}>✕</button>

          <div className="pp-scroll" ref={scrollRef}>

            {section === 'payment' && planDetalle ? (
              <PaymentSection plan={planDetalle} onBack={() => { setSection('main'); setPlanDetalle(null) }} onConfirm={() => setConfirmed(planDetalle)} />

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
                {/* ══ 1. PERFIL — DATOS REALES ══ */}
                <div className="pp-profile">
                  <div className="pp-avatar">
                    {loading
                      ? <span style={{ fontSize: 14 }}>...</span>
                      : displayPhoto
                        ? <img src={displayPhoto} alt={displayName} />
                        : <span>{getInitials(displayName)}</span>
                    }
                  </div>
                  <div className="pp-profile-info">
                    <p className="pp-name">{loading ? '...' : displayName}</p>
                    <p className="pp-spec">{displaySpec}</p>
                    <p className="pp-meta">⭐ {displayRating} &nbsp;|&nbsp; 📍 {displayCity}</p>
                    <StatusBadge status={displayStatus} />
                  </div>
                  {/* ── Botón ✏️ FUNCIONAL ── */}
                  <button 
                    className="pp-edit-btn" 
                    onClick={() => setShowEditModal(true)}
                    style={{ animation: !profileComplete && userData?.approved ? 'pulseGuide 1.5s infinite' : 'none' }}
                  >✏️ Editar</button>
                </div>

                {/* ══ 2. PLANES 3D ══ */}
                <div className="pp-accordion" ref={planesRef}>
                  <button className="pp-acc-header" onClick={() => toggle('plans')}>
                    <span>👑 Planes para Profesionales</span>
                    <span className="pp-acc-arrow">{openSection === 'plans' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'plans' && (
                    <div className="pp-acc-body">
                      <p className="pp-plans-hint">Toca un plan para ver los detalles y activarlo.</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                        {planes.map((p, i) => (
                          <PlanCard3D key={i} plan={p} onSelect={selected => setPlanDetalle(selected)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ══ 3. BONOS ══ */}
                <div className="pp-accordion">
                  <button className="pp-acc-header" onClick={() => toggle('bonos')}>
                    <span>🎁 Bonos y Créditos Extra</span>
                    <span className="pp-acc-arrow">{openSection === 'bonos' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'bonos' && (
                    <div className="pp-acc-body">
                      {[
                        { icon: '⭐', text: '5 estrellas en una reseña', val: '+1 contrato' },
                        { icon: '📄', text: 'Perfil 100% completo', val: '+2 contratos' },
                        { icon: '👥', text: 'Referido confirmado', val: '+3 contratos' },
                      ].map((b, i) => (
                        <div key={i} className="pp-bono-item">
                          <span className="pp-bono-icon">{b.icon}</span>
                          <span className="pp-bono-text">{b.text}</span>
                          <span className="pp-bono-val">{b.val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ══ 4. RENDIMIENTO ══ */}
                <div className="pp-accordion">
                  <button className="pp-acc-header" onClick={() => toggle('stats')}>
                    <span>📊 Mi Rendimiento</span>
                    <span className="pp-acc-arrow">{openSection === 'stats' ? '▲' : '▼'}</span>
                  </button>
                  {openSection === 'stats' && (
                    <div className="pp-acc-body">
                      <div className="pp-stats-mini">
                        {[
                          { icon: '📦', label: 'Contratos', val: userData?.contracts || 0 },
                          { icon: '📈', label: 'Completados', val: userData?.completedJobs || 0 },
                          { icon: '⭐', label: 'Calificación', val: userData?.rating || '—' },
                          { icon: '📩', label: 'Solicitudes', val: userData?.requests || 0 },
                          { icon: '📌', label: 'Pendientes', val: userData?.pendingJobs || 0 },
                        ].map((s, i) => (
                          <div key={i} className="pp-stat-mini">
                            <span className="pp-stat-icon">{s.icon}</span>
                            <span className="pp-stat-val">{s.val}</span>
                            <span className="pp-stat-label">{s.label}</span>
                          </div>
                        ))}
                      </div>
                      <button className="pp-stats-btn" onClick={() => { if (navigate) navigate('orders'); onClose(); }}>👉 Ver estadísticas completas</button>
                    </div>
                  )}
                </div>

                {/* ══ 5. POSTULARSE ══ */}
                {!userData?.approved && (
                  <div className="pp-accordion" style={{ animation: 'pulseGuide 2s infinite', borderRadius: '16px', boxShadow: '0 0 10px rgba(242,96,0,0.3)' }}>
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

                {/* ══ 6. CONFIGURACIÓN ══ */}
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
                      {['🔑 Cambiar contraseña', '✏️ Editar información personal'].map((item, i) => (
                        <button key={i} className="pp-config-btn">{item}</button>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ height: 30 }} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MODAL DETALLE PLAN ── */}
      {planDetalle && section !== 'payment' && !confirmed && (
        <PlanModal
          plan={planDetalle}
          onClose={() => setPlanDetalle(null)}
          onConfirm={() => { setSection('payment') }}
        />
      )}

      {/* ── MODAL CONFIRMACIÓN ── */}
      {confirmed && (
        <ConfirmModal
          plan={confirmed}
          onClose={() => {
            setConfirmed(null)
            setPlanDetalle(null)
            setSection('main')
            setOpenSection('plans')
          }}
        />
      )}

      {/* ── MODAL EDITAR PERFIL ── */}
      {showEditModal && (
        <EditModal
          userData={userData}
          onSave={handleSaveProfile}
          onCancel={() => setShowEditModal(false)}
        />
      )}
    </>
  )
}