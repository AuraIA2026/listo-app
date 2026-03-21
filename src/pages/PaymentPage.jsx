import { useState, useRef } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import './PaymentPage.css'

import banreservas    from '../assets/banks/banreservas.png'
import bhd            from '../assets/banks/bhd.png'
import popular        from '../assets/banks/popular.png'
import scotiabank     from '../assets/banks/scotiabank.png'
import bancaribe      from '../assets/banks/bancaribe.png'
import bancoPromerica from '../assets/banks/banco_promerica.png'
import asocPopular    from '../assets/banks/asociacion_popular.png'
import vimenca        from '../assets/banks/vimenca.png'

const banks = [
  { id: 'banreservas',  name: 'Banco de Reservas', short: 'Banreservas', color: '#003087', logo: banreservas,     account: '210-123456-7',  type: 'Cuenta Corriente' },
  { id: 'bhd',          name: 'BHD León',           short: 'BHD León',   color: '#E31837', logo: bhd,             account: '27500012345',   type: 'Cuenta de Ahorros' },
  { id: 'popular',      name: 'Banco Popular',      short: 'Popular',    color: '#00843D', logo: popular,         account: '810-123456-1',  type: 'Cuenta Corriente' },
  { id: 'scotiabank',   name: 'Scotiabank',         short: 'Scotiabank', color: '#EC111A', logo: scotiabank,      account: '00123456789',   type: 'Cuenta de Ahorros' },
  { id: 'bancaribe',    name: 'Bancaribe',          short: 'Bancaribe',  color: '#005BAC', logo: bancaribe,       account: '301-123456-0',  type: 'Cuenta Corriente' },
  { id: 'promerica',    name: 'Banco Promerica',    short: 'Promerica',  color: '#F47920', logo: bancoPromerica,  account: '401-123456-2',  type: 'Cuenta de Ahorros' },
  { id: 'asoc_popular', name: 'Asoc. Popular',      short: 'Asoc. Pop.', color: '#007A3D', logo: asocPopular,     account: '501-123456-3',  type: 'Cuenta de Ahorros' },
  { id: 'vimenca',      name: 'Vimenca',            short: 'Vimenca',    color: '#1A3A6B', logo: vimenca,         account: '601-123456-4',  type: 'Cuenta Corriente' },
]

const txt = {
  es: {
    title: 'Pago del servicio',
    method: 'Método de pago',
    cash: 'Efectivo / Trato Directo',
    cashDesc: 'Paga en mano al profesional o transfiere directamente al finalizar el servicio.',
    transfer: 'Transferencia bancaria / App',
    transferDesc: 'Envía el dinero y adjunta el comprobante para el profesional.',
    card: 'Tarjeta de Crédito o Débito',
    cardDesc: 'Paga de forma segura usando tu tarjeta vía la pasarela AZUL.',
    selectBank: 'Selecciona tu banco o billetera',
    accountName: 'A nombre de',
    accountNum: 'Cuenta/Número',
    accountType: 'Tipo',
    copyAccount: 'Copiar',
    copied: '¡Copiado!',
    uploadReceipt: 'Subir comprobante',
    receiptUploaded: '¡Comprobante subido!',
    summary: 'Resumen del pago',
    service: 'Costo del Servicio',
    cardTitle: '💳 Tarjeta',
    total: 'Total a Pagar',
    confirm: 'Trabajo Listo',
    cashNote: '💡 El pago se hace 100% al profesional.',
    transferNote: '💡 Al subir el recibo se enviará directamente al celular de tu profesional.',
    success: '¡Excelente!',
    successSub: 'Acabas de asegurar el pago con el profesional.',
    backOrders: 'Ir a Pedidos',
  },
  en: {
    title: 'Service payment',
    method: 'Payment method',
    cash: 'Cash / Direct Deal',
    cashDesc: 'Pay the professional in hand or transfer directly at the end of the service.',
    transfer: 'Bank Transfer / App',
    transferDesc: 'Send the money and attach the receipt here for the professional.',
    selectBank: 'Select an option',
    accountName: 'Name',
    accountNum: 'Account',
    accountType: 'Type',
    copyAccount: 'Copy',
    copied: 'Copied!',
    uploadReceipt: 'Upload receipt',
    receiptUploaded: 'Receipt uploaded!',
    summary: 'Payment summary',
    service: 'Service Cost',
    total: 'Total to Pay',
    confirm: 'Work Done',
    cashNote: '💡 Listo does not charge a fee. Payment goes 100% to the pro.',
    transferNote: '💡 Uploading the receipt sends it directly to your professional.',
    success: 'Excellent!',
    successSub: 'You have arranged the payment with the professional.',
    backOrders: 'Go to Orders',
  }
}

export default function PaymentPage({ lang = 'es', navigate, professional }) {
  const T = txt[lang]

  const pro = professional || {
    name: 'Carlos Méndez',
    category: '🔧 Mecánico',
    avatar: 'CM',
    color: '#F26000',
    price: 'RD$800',
    id: 'test_profesional_001'
  }

  // Se elimina el precio quemado. El usuario decide el precio final
  const [customPrice, setCustomPrice] = useState('')
  const total = Number(customPrice) || 0

  const [method, setMethod]               = useState('cash')
  const [selectedBank, setSelectedBank]   = useState(null)
  const [receiptUploaded, setReceiptUploaded] = useState(false)
  const [loading, setLoading]             = useState(false)
  
  // -- ESTADO TRANSFERENCIA MANUAL --
  const [transferAmount, setTransferAmount] = useState('')
  const [depositorName, setDepositorName]   = useState('')
  const receiptInputRef                   = useRef(null)

  // -- ESTADO TARJETA AZUL --
  const [cardName, setCardName]           = useState('')
  const [cardNumber, setCardNumber]       = useState('')
  const [cardExp, setCardExp]             = useState('')
  const [cardCvv, setCardCvv]             = useState('')
  const [showWebview, setShowWebview]     = useState(false)
  const [webviewLoading, setWebviewLoading] = useState(false)

  const handleBankPay = async () => {
    setWebviewLoading(true)
    await new Promise(res => setTimeout(res, 1500))
    setWebviewLoading(false)
    setShowWebview(false)
    setReceiptUploaded(true) // Simula aprobación AZUL
  }

  const handleReceiptUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptUploaded(true)
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      if (pro.orderId) {
        await updateDoc(doc(db, 'orders', pro.orderId), {
          price: customPrice ? `RD$${customPrice}` : (pro.price || 'RD$0'),
          paymentMethod: method,
          paymentStatus: method === 'cash' ? 'pending_cash' : 'verifying',
          depositorName: method === 'transfer' ? depositorName : null,
          depositBank: method === 'transfer' ? selectedBank?.name : null
        })

        // Enviar notificación al profesional
        import('firebase/firestore').then(({ addDoc, collection, serverTimestamp }) => {
          addDoc(collection(db, 'notificaciones'), {
            userId: pro.proId || pro.uid || pro.id,
            orderId: pro.orderId,
            type: 'payment_received',
            title: lang === 'es' ? '💸 ¡Pago Declarado!' : '💸 Payment Initiated!',
            text: method === 'cash' 
              ? (lang === 'es' ? 'El cliente declaró haberte pagado en efectivo.' : 'Client declared cash payment.')
              : (lang === 'es' ? 'El cliente procesó el pago.' : 'Client processed the payment.'),
            read: false,
            icon: '💸',
            createdAt: serverTimestamp()
          }).catch(console.error);
        });
      }
    } catch (e) {
      console.error("Error actualizando pago de orden:", e)
    }
    setLoading(false)
    navigate('workdone', pro)
  }

  // Validaciones
  const canConfirmCash = method === 'cash'
  const canConfirmTransfer = method === 'transfer' && selectedBank && transferAmount > 0 && depositorName.trim() !== '' && receiptUploaded
  const canConfirmCard = method === 'card' && receiptUploaded
  const canConfirm = canConfirmCash || canConfirmTransfer || canConfirmCard

  return (
    <div className="payment-page">
      <div className="payment-header">
        <button className="pay-back-btn" onClick={() => navigate('tracking', pro)}>←</button>
        <h1 className="payment-title">{T.title}</h1>
      </div>

      <div className="payment-body">
        <div className="pay-pro-card fade-up">
          <div className="pay-pro-avatar" style={{ background: pro.color }}>{pro.avatar}</div>
          <div className="pay-pro-info">
            <p className="pay-pro-name">{pro.name}</p>
            <p className="pay-pro-cat">{pro.category}</p>
          </div>
          {method !== 'cash' && (
            <div className="pay-pro-custom-price">
              <span className="price-currency">RD$</span>
              <input 
                type="number" 
                className="price-input" 
                placeholder={method === 'transfer' ? "Monto depositado" : "Monto a pagar"} 
                value={customPrice}
                onChange={e => {
                  setCustomPrice(e.target.value)
                  if (method === 'transfer') setTransferAmount(e.target.value)
                }}
              />
            </div>
          )}
        </div>

        <div className="pay-section fade-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="pay-section-title">{T.method}</h3>
          <div className="pay-methods">
            <button
              className={`pay-method-card ${method === 'cash' ? 'selected' : ''}`}
              onClick={() => { setMethod('cash'); setSelectedBank(null) }}
            >
              <div className="pay-method-icon cash-icon">💵</div>
              <div className="pay-method-info">
                <p className="pay-method-name">{T.cash}</p>
                <p className="pay-method-desc">{T.cashDesc}</p>
              </div>
              <div className={`pay-method-radio ${method === 'cash' ? 'checked' : ''}`} />
            </button>
            
            <button
              className={`pay-method-card ${method === 'transfer' ? 'selected' : ''}`}
              onClick={() => { setMethod('transfer'); setReceiptUploaded(false) }}
            >
              <div className="pay-method-icon transfer-icon">🏦</div>
              <div className="pay-method-info">
                <p className="pay-method-name">{T.transfer}</p>
                <p className="pay-method-desc">{T.transferDesc}</p>
              </div>
              <div className={`pay-method-radio ${method === 'transfer' ? 'checked' : ''}`} />
            </button>
            <button
               className={`pay-method-card ${method === 'card' ? 'selected' : ''}`}
               onClick={() => { setMethod('card'); setReceiptUploaded(false) }}
            >
              <div className="pay-method-icon card-icon" style={{background:'#E3F2FD', color:'#1976D2'}}>💳</div>
              <div className="pay-method-info">
                <p className="pay-method-name">{T.card}</p>
                <p className="pay-method-desc">{T.cardDesc}</p>
              </div>
              <div className={`pay-method-radio ${method === 'card' ? 'checked' : ''}`} />
            </button>
          </div>
        </div>

        {method === 'cash' && (
          <div className="pay-note cash-note fade-up">
            <p>{T.cashNote}</p>
          </div>
        )}

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
                onChange={e => {
                  setTransferAmount(e.target.value)
                  setCustomPrice(e.target.value)
                }}
              />

              <label style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '13.5px', fontWeight: 700, color: 'var(--black)', marginBottom: '8px' }}>Nombre de quien deposita</label>
              <input 
                type="text" 
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1.5px solid #eee', background: '#FAFAFA', fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--black)', boxSizing: 'border-box', marginBottom: '16px', outline: 'none' }}
                placeholder="Ej. Juan Pérez"
                value={depositorName}
                onChange={e => setDepositorName(e.target.value)}
              />

              <label className="transfer-manual-label" style={{marginTop:'16px'}}>Foto del Recibo</label>
              <div className="transfer-manual-upload" onClick={() => receiptInputRef.current?.click()}>
                {receiptUploaded ? (
                  <div className="receipt-success">
                    <span>✅ Recibo Cargado con Éxito</span>
                    <span style={{fontSize:'12px', color:'#666', marginTop:'4px'}}>Toca para cambiar</span>
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

        {/* WEBVIEW MODAL DE BANCO SIMULADO (ESTILO AZUL) */}
        {showWebview && method === 'card' && (
          <div className="payment-webview-overlay">
            <div className="payment-webview-modal">
              <div className="webview-header">
                <span className="webview-lock">🔒</span>
                <div className="webview-url-bar">
                  https://pagos.azul.com.do/payment/checkout
                </div>
                <button className="webview-close" onClick={() => setShowWebview(false)}>×</button>
              </div>
              
              <div className="webview-content azul-content">
                <div className="azul-header-brand">
                  <h1 className="azul-logo-text">AZUL</h1>
                </div>
                
                <h3 style={{ marginBottom: '6px', fontFamily: 'var(--font-display)', color: '#002E6D' }}>Pago Seguro</h3>
                <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>Monto a debitar: <strong>RD${total.toLocaleString()}</strong></p>
                
                <div className="webview-form azul-form">
                  <div className="webview-input-group">
                    <label>Titular de la tarjeta</label>
                    <input 
                      type="text" 
                      placeholder="Nombre como aparece en la tarjeta" 
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                    />
                  </div>

                  <div className="webview-input-group">
                    <label>Número de Tarjeta</label>
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000" 
                      maxLength={19}
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="webview-input-group" style={{ flex: 1 }}>
                      <label>Expiración (MM/AA)</label>
                      <input 
                        type="text" 
                        placeholder="MM/AA" 
                        maxLength={5}
                        value={cardExp}
                        onChange={e => setCardExp(e.target.value)}
                      />
                    </div>
                    <div className="webview-input-group" style={{ width: '100px' }}>
                      <label>CVV</label>
                      <input 
                        type="text" 
                        placeholder="123" 
                        maxLength={4}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    className="webview-pay-btn azul-pay-btn" 
                    disabled={webviewLoading || !cardName || !cardNumber || !cardExp || !cardCvv}
                    onClick={handleBankPay}
                  >
                    {webviewLoading ? <span className="webview-spinner" /> : 'Procesar Pago'}
                  </button>
                </div>
                
                <p style={{ marginTop: '24px', fontSize: '11px', color: '#888', textAlign: 'center', maxWidth: '300px' }}>
                  Este es un entorno seguro provisto por Servicios Digitales Popular para el procesamiento de pagos de Listo App.
                </p>
              </div>
            </div>
          </div>
        )}

        {method === 'transfer' && (
          <div className="pay-section pay-summary fade-up">
            <h3 className="pay-section-title">{T.summary}</h3>
            <div className="summary-rows">
              <div className="summary-row">
                <span>{T.service}</span>
                <span>RD${total.toLocaleString()}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <span>{T.total}</span>
                <span className="total-amount">RD${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <button
          className={`pay-confirm-btn ${canConfirm ? 'active' : ''} ${loading ? 'loading' : ''}`}
          disabled={!canConfirm || loading}
          onClick={handleConfirm}
        >
          {loading ? <span className="pay-spinner" /> : `✅ ${T.confirm}`}
        </button>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}