import { useState, useEffect, useRef } from 'react'
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
    cash: 'Efectivo',
    cashDesc: 'Paga en mano al profesional al finalizar el servicio',
    transfer: 'Transferencia bancaria',
    transferDesc: 'Transfiere antes del servicio y envía el comprobante',
    selectBank: 'Selecciona tu banco',
    accountName: 'Nombre de la cuenta',
    accountNum: 'Número de cuenta',
    accountType: 'Tipo de cuenta',
    copyAccount: 'Copiar número',
    copied: '¡Copiado!',
    uploadReceipt: 'Subir comprobante',
    receiptUploaded: '¡Comprobante subido!',
    summary: 'Resumen del pago',
    service: 'Servicio',
    professional: 'Profesional',
    subtotal: 'Subtotal',
    fee: 'Comisión Listo (10%)',
    total: 'Total',
    confirm: 'Confirmar pago',
    cashNote: '💡 Ten el efectivo listo al finalizar el servicio. El profesional tiene 24 horas para reportar el pago.',
    transferNote: '💡 Una vez confirmada la transferencia, el profesional será notificado.',
    success: '¡Pago confirmado!',
    successSub: 'Tu reserva está confirmada',
    backOrders: 'Ver mis pedidos',
  },
  en: {
    title: 'Service payment',
    method: 'Payment method',
    cash: 'Cash',
    cashDesc: 'Pay the professional in hand at the end of the service',
    transfer: 'Bank transfer',
    transferDesc: 'Transfer before the service and send the receipt',
    selectBank: 'Select your bank',
    accountName: 'Account name',
    accountNum: 'Account number',
    accountType: 'Account type',
    copyAccount: 'Copy number',
    copied: 'Copied!',
    uploadReceipt: 'Upload receipt',
    receiptUploaded: 'Receipt uploaded!',
    summary: 'Payment summary',
    service: 'Service',
    professional: 'Professional',
    subtotal: 'Subtotal',
    fee: 'Listo fee (10%)',
    total: 'Total',
    confirm: 'Confirm payment',
    cashNote: '💡 Have the cash ready at the end of the service. The professional has 24 hours to report the payment.',
    transferNote: '💡 Once the transfer is confirmed, the professional will be notified.',
    success: 'Payment confirmed!',
    successSub: 'Your booking is confirmed',
    backOrders: 'View my orders',
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

  const servicePrice = 800
  const comision = Math.round(servicePrice * 0.10)
  const total = servicePrice + comision

  const [method, setMethod]               = useState(null)
  const [selectedBank, setSelectedBank]   = useState(null)
  const [copied, setCopied]               = useState(false)
  const [receiptUploaded, setReceiptUploaded] = useState(false)
  const [confirmed, setConfirmed]         = useState(false)
  const [loading, setLoading]             = useState(false)
  const transferRef                       = useRef(null)

  useEffect(() => {
    if (method === 'transfer' && transferRef.current) {
      setTimeout(() => transferRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }, [method])

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirm = async () => {
    setLoading(true)
    // Simulamos un pequeño delay como si procesara
    await new Promise(res => setTimeout(res, 1200))
    setLoading(false)
    setConfirmed(true)
  }

  const canConfirm = method === 'cash' || (method === 'transfer' && selectedBank && receiptUploaded)

  if (confirmed) {
    return (
      <div className="payment-page">
        <div className="payment-success fade-up">
          <div className="success-circle">
            <span className="success-check">✓</span>
          </div>
          <h2 className="success-title">{T.success}</h2>
          <p className="success-sub">{T.successSub}</p>
          <div className="success-card">
            <div className="success-pro-row">
              <div className="success-avatar" style={{ background: pro.color }}>{pro.avatar}</div>
              <div>
                <p className="success-pro-name">{pro.name}</p>
                <p className="success-pro-cat">{pro.category}</p>
              </div>
              <div className="success-amount">RD${total.toLocaleString()}</div>
            </div>
            <div className="success-method-row">
              <span>{method === 'cash' ? '💵 ' + T.cash : '🏦 ' + T.transfer}</span>
              <span className="success-status">✓ Confirmado</span>
            </div>
          </div>
          <button className="btn-success-action" onClick={() => navigate('orders')}>{T.backOrders}</button>
          <button className="btn-success-home" onClick={() => navigate('home')}>Ir al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-page">
      <div className="payment-header">
        <button className="pay-back-btn" onClick={() => navigate('booking')}>←</button>
        <h1 className="payment-title">{T.title}</h1>
        <div className="pay-secure-badge">🔒 Seguro</div>
      </div>

      <div className="payment-body">

        <div className="pay-pro-card fade-up">
          <div className="pay-pro-avatar" style={{ background: pro.color }}>{pro.avatar}</div>
          <div className="pay-pro-info">
            <p className="pay-pro-name">{pro.name}</p>
            <p className="pay-pro-cat">{pro.category}</p>
          </div>
          <div className="pay-pro-price">RD${servicePrice.toLocaleString()}<span>/hr</span></div>
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
              onClick={() => setMethod('transfer')}
            >
              <div className="pay-method-icon transfer-icon">🏦</div>
              <div className="pay-method-info">
                <p className="pay-method-name">{T.transfer}</p>
                <p className="pay-method-desc">{T.transferDesc}</p>
              </div>
              <div className={`pay-method-radio ${method === 'transfer' ? 'checked' : ''}`} />
            </button>
          </div>
        </div>

        {method === 'cash' && (
          <div className="pay-note cash-note fade-up">
            <p>{T.cashNote}</p>
          </div>
        )}

        <div ref={transferRef} />

        {method === 'transfer' && (
          <div className="pay-section fade-up">
            <h3 className="pay-section-title">{T.selectBank}</h3>
            <div className="banks-grid">
              {banks.map(bank => (
                <button
                  key={bank.id}
                  className={`bank-card ${selectedBank?.id === bank.id ? 'selected' : ''}`}
                  onClick={() => setSelectedBank(bank)}
                  style={{ '--bank-color': bank.color }}
                >
                  <img src={bank.logo} alt={bank.short} className="bank-logo-img" />
                  <span className="bank-name">{bank.short}</span>
                  {selectedBank?.id === bank.id && <span className="bank-check">✓</span>}
                </button>
              ))}
            </div>

            {selectedBank && (
              <div className="account-details fade-up">
                <div className="account-header">
                  <img src={selectedBank.logo} alt={selectedBank.short} className="account-bank-logo-img" />
                  <div>
                    <p className="account-bank-name">{selectedBank.name}</p>
                    <p className="account-bank-type">{selectedBank.type}</p>
                  </div>
                </div>
                <div className="account-row">
                  <span className="account-label">{T.accountName}</span>
                  <span className="account-value">Listo RD, SRL</span>
                </div>
                <div className="account-row">
                  <span className="account-label">{T.accountNum}</span>
                  <div className="account-num-row">
                    <span className="account-value account-num">{selectedBank.account}</span>
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={() => handleCopy(selectedBank.account)}>
                      {copied ? T.copied : T.copyAccount}
                    </button>
                  </div>
                </div>
                <div className="account-row">
                  <span className="account-label">{T.accountType}</span>
                  <span className="account-value">{selectedBank.type}</span>
                </div>
                <div className="transfer-amount-box">
                  <span className="transfer-amount-label">Monto a transferir</span>
                  <span className="transfer-amount-value">RD${total.toLocaleString()}</span>
                </div>
                <button
                  className={`upload-receipt-btn ${receiptUploaded ? 'uploaded' : ''}`}
                  onClick={() => setReceiptUploaded(true)}
                >
                  {receiptUploaded
                    ? <><span>✅</span> {T.receiptUploaded}</>
                    : <><span>📎</span> {T.uploadReceipt}</>}
                </button>
                <div className="pay-note transfer-note">
                  <p>{T.transferNote}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {method && (
          <div className="pay-section pay-summary fade-up">
            <h3 className="pay-section-title">{T.summary}</h3>
            <div className="summary-rows">
              <div className="summary-row">
                <span>{T.service}</span>
                <span>RD${servicePrice.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>{T.fee}</span>
                <span>RD${comision.toLocaleString()}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <span>{T.total}</span>
                <span className="total-amount">RD${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {method && (
          <button
            className={`pay-confirm-btn ${canConfirm ? 'active' : ''} ${loading ? 'loading' : ''}`}
            disabled={!canConfirm || loading}
            onClick={handleConfirm}
          >
            {loading ? <span className="pay-spinner" /> : `🔒 ${T.confirm} · RD$${total.toLocaleString()}`}
          </button>
        )}

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}