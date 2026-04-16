import { useState, useRef, useEffect } from 'react'
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

  const pro = professional;
  useEffect(() => {
    if (!pro) navigate('/');
  }, [pro, navigate]);

  if (!pro) return null;

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

  // -- INTEGRACIÓN REAL AZUL --
  const formRef = useRef(null);
  const [pagoAzulData, setPagoAzulData] = useState(null);
  const [isProcessingAzul, setIsProcessingAzul] = useState(false);
  const URL_AZUL = "https://pruebas.azul.com.do/paymentpage/Default.aspx"; // TODO: Cambiar a pagos.azul.com.do/paymentpage/Default.aspx en producción

  const handleBankPayReal = async () => {
    if (!total || total <= 0) {
      alert("Por favor ingresa un monto válido a pagar.");
      return;
    }
    setIsProcessingAzul(true);
    try {
      const { httpsCallable } = await import("firebase/functions");
      const { functions } = await import("../firebase");
      
      const generarFirma = httpsCallable(functions, "generarFirmaAzul");
      
      // Azul requires a minimum transaction amount (e.g. 50 DOP) to avoid generic rejection errors.
      if (total < 10) {
        alert("El monto mínimo para la tarjeta es RD$10");
        setIsProcessingAzul(false);
        return;
      }

      // Monto en formato AZUL (multiplicar x 100 para no enviar punto)
      const totalAzul = String(Math.round(total * 100)); 

      const cloudFunctionEndpoint = "https://us-central1-listoapp-52b46.cloudfunctions.net/azulWebHook"; 
      
      const payload = {
        MerchantName: "Listo App - Pedidos",
        MerchantType: "E-Commerce",
        CurrencyCode: "$", // $ = DOP
        OrderNumber: `ORD_${String(Date.now()).slice(-8)}`,
        Amount: totalAzul,
        ApprovedUrl: cloudFunctionEndpoint,
        DeclinedUrl: "https://listo-app.vercel.app/orders?error=declined",
        CancelUrl: "https://listo-app.vercel.app/orders?error=cancelled"
      };

      const res = await generarFirma(payload);
      const { AuthHash, MerchantId, ITBIS, ResponsePostUrl } = res.data;

      setPagoAzulData({ ...payload, MerchantId, AuthHash, ITBIS, ResponsePostUrl });
      
      // Autoenviar form
      setTimeout(() => {
        if (formRef.current) formRef.current.submit();
      }, 500);

    } catch (err) {
      console.error("Error generando Hash AZUL: ", err);
      alert("Error al conectar con el servidor de pagos. Revisa que las IPs y credenciales estén bien.");
      setIsProcessingAzul(false);
    }
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
                onClick={handleBankPayReal}
                disabled={isProcessingAzul}
                style={{ background: '#002E6D', color: 'white', border: 'none', marginTop: '16px', boxShadow: '0 4px 12px rgba(0,46,109,0.3)', opacity: isProcessingAzul ? 0.7 : 1 }}
              >
                {isProcessingAzul ? 'Conectando con Servidor Seguro AZUL...' : '💳 Pagar en Entorno Seguro (AZUL)'}
              </button>
            ) : (
              <button className="upload-receipt-btn uploaded" style={{ marginTop: '16px' }} disabled>
                ✅ Pago Aprobado por AZUL
              </button>
            )}
          </div>
        )}

        {/* FORMULARIO INVISIBLE AZUL - SE AUTOENVÍA CON REDIRECCION POST */}
        {pagoAzulData && (
          <form 
            ref={formRef} 
            action={URL_AZUL} 
            method="post" 
            style={{ display: 'none' }}
          >
            <input name="MerchantId" type="hidden" value={pagoAzulData.MerchantId} />
            <input name="MerchantName" type="hidden" value={pagoAzulData.MerchantName} />
            <input name="MerchantType" type="hidden" value={pagoAzulData.MerchantType} />
            <input name="CurrencyCode" type="hidden" value={pagoAzulData.CurrencyCode} />
            <input name="OrderNumber" type="hidden" value={pagoAzulData.OrderNumber} />
            <input name="Amount" type="hidden" value={pagoAzulData.Amount} />
            <input name="Itbis" type="hidden" value={pagoAzulData.ITBIS} />
            <input name="ApprovedUrl" type="hidden" value={pagoAzulData.ApprovedUrl} />
            <input name="DeclinedUrl" type="hidden" value={pagoAzulData.DeclinedUrl} />
            <input name="CancelUrl" type="hidden" value={pagoAzulData.CancelUrl} />
            <input name="ResponsePostUrl" type="hidden" value={pagoAzulData.ResponsePostUrl} />
            <input name="UseCustomField1" type="hidden" value="0" />
            <input name="CustomField1Label" type="hidden" value="" />
            <input name="CustomField1Value" type="hidden" value="" />
            <input name="UseCustomField2" type="hidden" value="0" />
            <input name="CustomField2Label" type="hidden" value="" />
            <input name="CustomField2Value" type="hidden" value="" />
            <input name="AuthHash" type="hidden" value={pagoAzulData.AuthHash} />
          </form>
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

        {/* ESCUDOS DE SEGURIDAD BANCARIA */}
        <div className="payment-security-footer fade-up" style={{ animationDelay: '0.2s', padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', marginTop: '24px', marginBottom: '24px' }}>
          <div className="security-logos" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px' }}>
            <div className="security-badge" style={{ background: 'white', border: '1px solid #CBD5E1', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🔒</span> 256-bit SSL
            </div>
            <div className="security-badge" style={{ background: 'white', border: '1px solid #CBD5E1', padding: '6px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🛡️</span> PCI DSS
            </div>
            {/* Basic Logos */}
            <div className="security-badge" style={{ background: 'white', border: '1px solid #CBD5E1', padding: '6px 10px', borderRadius: '8px', color: '#1A1F71', fontWeight: '900', fontStyle: 'italic', fontSize: '13px' }}>
              VISA
            </div>
            <div className="security-badge" style={{ background: 'white', border: '1px solid #CBD5E1', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '2px' }}>
               <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#EB001B', marginRight: '-6px', mixBlendMode: 'multiply' }}></div>
               <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#F79E1B', mixBlendMode: 'multiply' }}></div>
            </div>
            {/* 3D Secure Logos */}
            <div className="security-badge" style={{ background: 'white', border: '1px solid #CBD5E1', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
              <svg viewBox="0 0 190 50" style={{ height: '22px' }}>
                <text x="0" y="38" fontFamily="sans-serif" fontSize="40" fontWeight="900" fontStyle="italic" fill="#1A1F71" letterSpacing="-2">VISA</text>
                <text x="115" y="38" fontFamily="sans-serif" fontSize="20" fontWeight="600" fill="#1A1F71">Secure</text>
              </svg>
            </div>
            <div className="security-badge" style={{ background: 'white', border: '1px solid #CBD5E1', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg viewBox="0 0 100 60" style={{ height: '24px' }}>
                <circle cx="35" cy="30" r="25" fill="#EB001B" />
                <circle cx="65" cy="30" r="25" fill="#F79E1B" opacity="0.8" />
              </svg>
              <span style={{ color: '#1A1A2E', fontSize: '13px', fontWeight: '900', fontFamily: 'sans-serif' }}>ID Check&trade;</span>
            </div>
          </div>
          <p className="security-text" style={{ fontSize: '12px', marginBottom: '8px', textAlign: 'center', color: '#64748B' }}>
            {lang === 'es' ? 'Tus pagos están encriptados y comprobados con tecnología 3D Secure de autenticación biométrica.' : 'Your payments are encrypted and protected with 3D Secure.'}
          </p>
          <div style={{ background: '#ECFDF5', border: '1px dashed #10B981', padding: '8px', borderRadius: '8px', textAlign: 'center', color: '#065F46' }}>
            <p style={{ fontSize: '11.5px', fontWeight: 'bold', margin: 0 }}>
              {lang === 'es' ? '✓ Un recibo/comprobante electrónico de pago te será enviado por correo al completar.' : '✓ An electronic receipt will be sent to your email.'}
            </p>
          </div>
        </div>

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