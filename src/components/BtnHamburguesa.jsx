import { useState, useEffect, useRef } from 'react'
import { getAuth, updateProfile, sendPasswordResetEmail } from 'firebase/auth'
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { useUserData } from '../useUserData'
import './BtnHamburguesa.css'
import '../pages/PaymentPage.css' // Importando estilos idénticos al pago de usuarios

/* ─── PLANES ─── */
const planes = [
  {
    id: 'standard', num: '1', emoji: '🔹', nombre: 'Plan Estándar', contratos: '3 contratos',
    precio: 'RD$500', colorKey: 'standard', badge: 'BÁSICO',
    titulo: 'Plan Estándar — Empieza a crecer',
    subtitulo: 'Ideal para conseguir tus primeros clientes.',
    descripcion: 'Con 3 contratos disponibles puedes darte a conocer. Apto para quienes prueban la app.',
    beneficios: ['✅ Perfil público en la app', '✅ Hasta 3 contratos al mes', '✅ Soporte estándar'],
    cta: '¡El mejor punto de partida!',
  },
  {
    id: 'gold', num: '2', emoji: '🥇', nombre: 'Pack Gold', contratos: '8 contratos',
    precio: 'RD$1,000', colorKey: 'gold', badge: 'POPULAR',
    titulo: 'Pack Gold — El más pedido',
    subtitulo: 'El favorito de los profesionales que quieren crecer rápido.',
    descripcion: 'Aumenta tus oportunidades y presencia en búsquedas con 8 aplicaciones a trabajos.',
    beneficios: ['⚡ Mejor visibilidad que el Estándar', '⚡ Hasta 8 contratos al mes', '⚡ Perfil Recomendado'],
    cta: '¡El plan para profesionales activos!',
  },
  {
    id: 'platinum', num: '3', emoji: '🥈', nombre: 'Pack Platinum', contratos: '15 contratos',
    precio: 'RD$1,500', colorKey: 'platinum', badge: 'ACTIVO',
    titulo: 'Pack Platinum — Para gente activa',
    subtitulo: 'Aumenta tu estatus y aplica con más margen.',
    descripcion: 'Aplica a 15 trabajos directamente y accede a clientes premium con prioridad.',
    beneficios: ['🔥 Mayor visibilidad en búsquedas', '🔥 Hasta 15 contratos al mes', '🔥 Crecimiento sostenido'],
    cta: 'Para quienes no quieren perderse grandes clientes.',
  },
  {
    id: 'vip', num: '4', emoji: '💎', nombre: 'VIP Ilimitado', contratos: '∞ contratos',
    precio: 'RD$2,500/mes', colorKey: 'vip', badge: 'ÉLITE',
    titulo: 'VIP Ilimitado — Sin límites',
    subtitulo: 'Sin restricciones. Requiere +3 años de experiencia.',
    descripcion: 'Acepta contratos sin límite cada mes. Exclusividad total, contacto directo y estatus N°1.',
    beneficios: ['🚀 Contratos ILIMITADOS', '🚀 Prioridad absoluta N°1 en búsquedas', '🚀 Requiere +3 años exp. comprobada'],
    cta: 'Si tienes la experiencia, este es el plan para dominar.',
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
        <Btn3D onClick={onConfirm} bg={pal.gradient} shadow={pal.btn3d}>💎 Activar el {plan.nombre}</Btn3D>
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
  const [receiptFile, setReceiptFile] = useState(null)
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
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0])
      setReceiptUploaded(true)
    }
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
  const [isUploading, setIsUploading] = useState(false)

  const handleConfirmPay = async () => {
    setIsUploading(true)
    await onConfirm({ method, selectedBank, transferAmount, depositorName, receiptFile })
    setIsUploading(false)
  }

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

      <div style={{ padding: '0 10px' }}>
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

        {/* BOTÓN ENVIAR INLINE (MÁS VISIBLE Y SEGURO CONTRA CORTES) */}
        <div style={{ marginTop: '24px', paddingBottom: '140px' }}>
          <button
            className={`pay-confirm-btn fade-up ${canConfirm ? 'ready' : ''}`}
            disabled={!canConfirm || isUploading}
            onClick={handleConfirmPay}
            style={{ width: '100%', padding: '16px', background: canConfirm ? pal.primary : '#E0E0E0', color: canConfirm ? 'white' : '#999', border: 'none', borderRadius: '16px', fontSize: '16px', fontWeight: '900', cursor: canConfirm ? 'pointer' : 'not-allowed', transition: 'all 0.3s', boxShadow: canConfirm ? `0 4px 12px ${pal.primary}66` : 'none' }}
          >
            {isUploading ? 'Procesando pago...' : canConfirm
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
  const { userData, loading, user, userRole, getInitials, profileComplete } = useUserData()

  const [section, setSection] = useState('main')
  const [computedStats, setComputedStats] = useState({ completed: 0, requests: 0, pending: 0 })

  useEffect(() => {
    if (!user?.uid || userRole !== 'pro') return
    const fetchOrdersStats = async () => {
      try {
        const q = query(collection(db, 'orders'), where('proId', '==', user.uid))
        const snap = await getDocs(q)
        let c = 0, r = 0, p = 0
        snap.forEach(doc => {
          const o = doc.data()
          r++
          if (o.status === 'done') c++
          else if (o.status !== 'cancelled') p++
        })
        setComputedStats({ completed: c, requests: r, pending: p })
      } catch (err) {
        console.error("Error fetching pro orders for stats:", err)
      }
    }
    fetchOrdersStats()
  }, [user?.uid, userRole])
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

  // ── Procesar Pago a Firebase ──
  const createPaymentInDb = async (payData) => {
    try {
       let picUrl = ''
       if (payData.method === 'transfer' && payData.receiptFile) {
          const imgRef = ref(storage, `receipts/${user.uid}_${Date.now()}`)
          await uploadBytes(imgRef, payData.receiptFile)
          picUrl = await getDownloadURL(imgRef)
       }

       const priceNum = parseInt(planDetalle.precio.replace(/\D/g, '')) || 0
       const contractsParsed = planDetalle.contratos.includes('∞') ? 999 : (parseInt(planDetalle.contratos.replace(/\D/g, '')) || 0)

       const newPayment = {
         proId: user.uid,
         proName: userData?.name || 'Profesional',
         proPhone: userData?.phone || '',
         proCity: userData?.city || '',
         proAvatar: userData?.photoURL || '',
         planId: planDetalle.id,
         planName: planDetalle.nombre,
         planPriceText: planDetalle.precio,
         planPriceVal: priceNum,
         planContracts: contractsParsed,
         planBonus: 3,
         method: payData.method,
         status: payData.method === 'card' ? 'paid' : 'pending',
         bank: payData.selectedBank ? payData.selectedBank.name : '',
         transferAmount: payData.transferAmount || '',
         depositorName: payData.depositorName || '',
         receiptUrl: picUrl,
         createdAt: serverTimestamp()
       }

       await addDoc(collection(db, 'payments'), newPayment)

       // ── Notificación para el Admin ──
       await addDoc(collection(db, 'notificaciones'), {
         userId: 'admin',
         type: 'plan_purchase',
         title: 'NUEVO PAGO DE PLAN 👑',
         text: `El profesional ${userData?.name || 'Un profesional'} ha solicitado el plan ${planDetalle.nombre}.`,
         read: false,
         createdAt: serverTimestamp()
       })

       if (payData.method === 'card') {
          const finalContracts = (userData?.contracts || 0) + contractsParsed + 3
          await updateDoc(doc(db, 'users', user.uid), {
             contracts: finalContracts,
             planStatus: 'active',
             currentPlan: planDetalle.id
          })
       } else {
          await updateDoc(doc(db, 'users', user.uid), { planStatus: 'review' })
       }

       setConfirmed(planDetalle)
    } catch(err) {
       console.error("Error creating payment", err)
       alert("Error procesando pago. Intenta de nuevo.")
    }
  }

  // ── Restablecer Contraseña ──
  const handleResetPassword = () => {
    if (!user?.email) {
      alert("No se encontró un correo asociado a tu cuenta.");
      return;
    }
    const auth = getAuth();
    sendPasswordResetEmail(auth, user.email)
      .then(() => alert("Te hemos enviado un enlace a tu correo para restablecer la contraseña."))
      .catch((e) => alert("Error: " + e.message));
  }

  const Stats = () => (
    <div className="pp-stats">
      <h3 className="pp-sec-title">📊 Mi Rendimiento</h3>
      <div className="pp-stats-grid">
        {[
          { icon: '📦', label: 'Contratos disponibles', val: userData?.contracts || 0 },
          { icon: '📈', label: 'Trabajos completados', val: computedStats.completed },
          { icon: '⭐', label: 'Calificación promedio', val: Number(userData?.rating || 5).toFixed(1) },
          { icon: '📩', label: 'Solicitudes recibidas', val: computedStats.requests },
          { icon: '📌', label: 'Trabajos pendientes', val: computedStats.pending },
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
              <PaymentSection plan={planDetalle} onBack={() => { setSection('main'); setPlanDetalle(null) }} onConfirm={createPaymentInDb} />



            ) : section === 'stats' ? (
              <>
                <Stats />
                <button className="pp-back-btn" onClick={() => setSection('main')}>← Volver</button>
              </>

            ) : (
              <>
                {/* ══ 1. PERFIL — DATOS REALES (Removido por solicitud) ══ */}

                {/* ══ 1.5 CONTRATOS HIGHLIGHT ══ */}
                <div style={{ background: 'linear-gradient(135deg, #FFF0E6, #FFE4D6)', borderRadius: '16px', padding: '16px', margin: '4px 20px 24px', border: '1px solid #F2600044', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(242,96,0,0.08)' }}>
                   <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid #F2600033' }}>
                      <span style={{ display: 'block', fontSize: '28px', fontWeight: '900', color: '#F26000', lineHeight: 1 }}>{userData?.contracts || 0}</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#B34700', textTransform: 'uppercase', marginTop: '6px', display: 'block' }}>Restantes</span>
                   </div>
                   <div style={{ textAlign: 'center', flex: 1 }}>
                      <span style={{ display: 'block', fontSize: '28px', fontWeight: '900', color: '#666', lineHeight: 1 }}>{userData?.contractsUsed || 0}</span>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#777', textTransform: 'uppercase', marginTop: '6px', display: 'block' }}>Usados</span>
                   </div>
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
                          { icon: '📈', label: 'Completados', val: computedStats.completed },
                          { icon: '⭐', label: 'Calificación', val: Number(userData?.rating || 5).toFixed(1) },
                          { icon: '📩', label: 'Solicitudes', val: computedStats.requests },
                          { icon: '📌', label: 'Pendientes', val: computedStats.pending },
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

                {/* ══ 5. POSTULARSE y 6. CONFIGURACIÓN han sido removidos (duplicidad con Perfil Principal) ══ */}

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