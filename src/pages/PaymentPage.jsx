import { useState, useRef, useEffect } from 'react'
import { doc, updateDoc, addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db, auth } from '../firebase'
import './PaymentPage.css'

// Comprime imagen a base64 (o lee directamente si es PDF)
const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  if (file.type === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'))) {
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
    return;
  }
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 900;
      let { width, height } = img;
      if (width > height) { if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; } }
      else { if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; } }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = e.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const txt = {
  es: {
    title: 'Pago del Servicio Realizado',
    method: 'Selecciona la forma de pago:',
    cash: 'Pago en Efectivo',
    cashDesc: 'Pagas en mano en efectivo directamente al profesional al terminar el servicio.',
    transfer: 'Transferencia Bancaria',
    transferDesc: 'Transfiere a la cuenta bancaria y adjunta el comprobante del depósito.',
    summary: 'Resumen del pago',
    service: 'Costo del Servicio',
    total: 'Total a Pagar',
    confirm: 'Confirmar Pago',
    cashNote: '💡 Has seleccionado Pago en Efectivo. Entregarás este dinero directamente en mano al profesional al completar el servicio. El pago va 100% al profesional sin comisiones.',
    transferNote: '💡 Al confirmar la transferencia, el comprobante se enviará al profesional para su validación inmediata.',
    success: '¡Excelente!',
    successSub: 'Acabas de asegurar el pago con el profesional.',
    backOrders: 'Ir a Pedidos',
  },
  en: {
    title: 'Service Payment',
    method: 'Select payment method:',
    cash: 'Cash Payment',
    cashDesc: 'Pay directly in cash to the professional upon completion of the service.',
    transfer: 'Bank Transfer',
    transferDesc: 'Transfer to bank account and attach the deposit receipt.',
    summary: 'Payment summary',
    service: 'Service Cost',
    total: 'Total to Pay',
    confirm: 'Confirm Payment',
    cashNote: '💡 You selected Cash. You will pay directly to the professional upon completion. Payment goes 100% to the pro.',
    transferNote: '💡 Uploading the receipt sends it directly to your professional for verification.',
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

  // Precio acordado inicial o personalizable
  const initialPriceStr = pro?.price ? String(pro.price).replace(/[^0-9.]/g, '') : ''
  const [customPrice, setCustomPrice] = useState(initialPriceStr)

  const [method, setMethod]                 = useState('transfer') // 'transfer' | 'cash'
  const [originBank, setOriginBank]         = useState('Banreservas')
  const [transferAmount, setTransferAmount] = useState(initialPriceStr)
  const [depositorName, setDepositorName]   = useState(auth.currentUser?.displayName || '')
  const [receiptFile, setReceiptFile]       = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [receiptBase64, setReceiptBase64]   = useState(null)
  const [receiptUploaded, setReceiptUploaded] = useState(false)
  const [copiedIdx, setCopiedIdx]           = useState(null)
  const [loading, setLoading]               = useState(false)
  const receiptInputRef                     = useRef(null)

  const proName = pro?.name || pro?.pro || 'Profesional Listo'
  const proCategory = pro?.category || pro?.specialty || 'Servicios Profesionales'

  // Cuentas de depósito: Si el profesional tiene cuenta configurada o cuentas de referencia
  const proAccountList = [
    {
      bank: pro?.bankName || 'Banco Popular Dominicano',
      account: pro?.bankAccount || '746424456',
      holder: pro?.bankHolder || proName || 'Julio de Jesús',
      type: pro?.bankType || 'Ahorros',
      color: '#047857'
    },
    {
      bank: 'Banreservas',
      account: pro?.banreservasAccount || '960728472',
      holder: proName || 'Julio de Jesús',
      type: 'Ahorros',
      color: '#1E3A8A'
    }
  ]

  const copyCuenta = (numero, idx) => {
    navigator.clipboard.writeText(numero).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2500)
    }).catch(() => {})
  }

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setReceiptFile(file)
    setReceiptUploaded(true)

    if (file.type.startsWith('image/')) {
      const previewReader = new FileReader()
      previewReader.onload = (ev) => setReceiptPreview(ev.target.result)
      previewReader.readAsDataURL(file)
    } else {
      setReceiptPreview('pdf')
    }

    try {
      const b64 = await compressImage(file)
      setReceiptBase64(b64)
    } catch (err) {
      console.warn('Error comprimiendo comprobante:', err)
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    const finalAmount = customPrice ? `RD$${Number(customPrice).toLocaleString()}` : (pro?.price || 'RD$0')
    const finalAmountNum = parseFloat(customPrice || pro?.price?.replace(/[^0-9.]/g, '') || 0)
    const orderId = pro?.orderId || pro?.id

    const invoiceNo = `LP-${orderId ? String(orderId).substring(0, 8).toUpperCase() : Math.floor(100000 + Math.random() * 900000)}`

    try {
      if (orderId) {
        await updateDoc(doc(db, 'orders', orderId), {
          price: finalAmount,
          paymentMethod: method,
          paymentStatus: method === 'cash' ? 'pending_cash' : 'verifying',
          depositorName: method === 'transfer' ? (depositorName.trim() || 'Cliente') : null,
          depositBank: method === 'transfer' ? originBank : null,
          receiptUrl: method === 'transfer' ? (receiptBase64 || null) : null,
          invoiceNo: invoiceNo,
          invoiceDate: new Date().toISOString(),
          facturaGenerada: true
        })

        // Notificación al profesional
        addDoc(collection(db, 'notificaciones'), {
          userId: pro.proId || pro.uid || pro.id,
          orderId: orderId,
          type: 'payment_received',
          title: method === 'cash' 
            ? (lang === 'es' ? '💵 ¡Pago en Efectivo Declarado!' : '💵 Cash Payment Declared!')
            : (lang === 'es' ? '🏦 ¡Pago por Transferencia Declarado!' : '🏦 Bank Transfer Payment Declared!'),
          text: method === 'cash' 
            ? (lang === 'es' ? `El cliente declaró que te pagará ${finalAmount} en mano en efectivo.` : `Client declared cash payment of ${finalAmount}.`)
            : (lang === 'es' ? `El cliente transfirió ${finalAmount} vía ${originBank} y adjuntó su comprobante.` : `Client transferred ${finalAmount} and attached receipt.`),
          read: false,
          icon: method === 'cash' ? '💵' : '🏦',
          createdAt: serverTimestamp()
        }).catch(console.error);

        // Notificación al cliente confirmando la Factura Oficial
        addDoc(collection(db, 'notificaciones'), {
          userId: auth.currentUser?.uid || pro.clientId,
          orderId: orderId,
          type: 'invoice_ready',
          title: lang === 'es' ? '🎉 ¡Listo Patrón! Factura Oficial Generada' : '🎉 Done Boss! Official Invoice Generated',
          text: lang === 'es' 
            ? `Tu factura oficial ${invoiceNo} por ${finalAmount} ha sido registrada. Método: ${method === 'cash' ? 'Efectivo en mano' : 'Transferencia bancaria'}.` 
            : `Your official invoice ${invoiceNo} for ${finalAmount} is ready.`,
          read: false,
          icon: '🧾',
          invoiceNo: invoiceNo,
          createdAt: serverTimestamp()
        }).catch(console.error);

        // Registro de auditoría en 'payments'
        addDoc(collection(db, 'payments'), {
          orderId: orderId,
          proId: pro.proId || pro.uid || pro.id || '',
          proName: proName,
          proCategory: proCategory,
          email: pro.email || '',
          phone: pro.phone || '',
          planName: method === 'transfer' ? 'Pago de Servicio (Transferencia)' : 'Pago de Servicio (Efectivo)',
          planId: 'servicio_pago',
          planPriceVal: finalAmountNum,
          transferAmount: finalAmountNum,
          status: 'pending',
          paymentMethod: method === 'cash' ? 'cash' : 'transfer',
          bank: method === 'transfer' ? originBank : 'Efectivo',
          depositorName: method === 'transfer' ? (depositorName || 'Cliente') : (auth.currentUser?.displayName || 'Cliente'),
          receiptUrl: method === 'transfer' ? (receiptBase64 || null) : null,
          invoiceNo: invoiceNo,
          createdAt: serverTimestamp()
        }).catch(console.error);
      }
    } catch (e) {
      console.error("Error actualizando pago de orden:", e)
    }

    setLoading(false)
    navigate('orders')
  }

  // Validaciones
  const canConfirmCash = method === 'cash' && Number(customPrice || 0) > 0
  const canConfirmTransfer = method === 'transfer' && (Number(transferAmount || customPrice || 0) > 0) && depositorName.trim() !== '' && receiptUploaded && Boolean(receiptBase64)
  const canConfirm = canConfirmCash || canConfirmTransfer

  return (
    <div className="payment-page">
      <div className="payment-header">
        <button className="pay-back-btn" onClick={() => navigate('orders')}>←</button>
        <h1 className="payment-title">{T.title}</h1>
      </div>

      <div className="payment-body">
        {/* Tarjeta del Profesional y Servicio */}
        <div className="pay-pro-card fade-up">
          <div className="pay-pro-avatar" style={{ background: pro?.color || '#F26000' }}>{pro?.avatar || '👤'}</div>
          <div className="pay-pro-info">
            <p className="pay-pro-name">{proName}</p>
            <p className="pay-pro-cat">{proCategory}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Costo</span>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#F26000', fontFamily: 'var(--font-display)' }}>
              RD${Number(customPrice || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Selector de Pestañas: Transferencia vs Efectivo */}
        <div className="pay-section fade-up" style={{ animationDelay: '0.05s' }}>
          <h3 className="pay-section-title">{T.method}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            
            {/* PESTAÑA 1: TRANSFERENCIA BANCARIA */}
            <button
              type="button"
              onClick={() => { setMethod('transfer'); if (!transferAmount && customPrice) setTransferAmount(customPrice); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 12px',
                borderRadius: '16px',
                border: method === 'transfer' ? '2.5px solid #F26000' : '1.5px solid #E2E8F0',
                background: method === 'transfer' ? '#FFF7ED' : '#FFFFFF',
                boxShadow: method === 'transfer' ? '0 4px 16px rgba(242,96,0,0.15)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '28px' }}>🏦</span>
              <span style={{ fontSize: '13.5px', fontWeight: '800', color: method === 'transfer' ? '#C2410C' : '#334155' }}>
                Transferencia
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', textAlign: 'center' }}>
                Copia cuenta y adjunta voucher
              </span>
            </button>

            {/* PESTAÑA 2: PAGO EN EFECTIVO */}
            <button
              type="button"
              onClick={() => setMethod('cash')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 12px',
                borderRadius: '16px',
                border: method === 'cash' ? '2.5px solid #10B981' : '1.5px solid #E2E8F0',
                background: method === 'cash' ? '#F0FDF4' : '#FFFFFF',
                boxShadow: method === 'cash' ? '0 4px 16px rgba(16,185,129,0.15)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '28px' }}>💵</span>
              <span style={{ fontSize: '13.5px', fontWeight: '800', color: method === 'cash' ? '#065F46' : '#334155' }}>
                Efectivo
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', textAlign: 'center' }}>
                En mano al terminar el trabajo
              </span>
            </button>
          </div>
        </div>

        {/* ── SECCIÓN 1: FORMULARIO DE TRANSFERENCIA BANCARIA (FORMATO WEB) ── */}
        {method === 'transfer' && (
          <div className="pay-section fade-up" style={{ border: '1.5px solid #FED7AA', background: '#FFFFFF', borderRadius: '20px', padding: '18px' }}>
            
            {/* Banco de Origen / Destino */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                Banco donde transferiste (Destino):
              </label>
              <select
                value={originBank}
                onChange={e => setOriginBank(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', background: '#FFFFFF', color: '#0F172A', fontWeight: '600', outline: 'none' }}
              >
                <option value="Banreservas">Banreservas (Banco de Reservas)</option>
                <option value="Banco Popular">Banco Popular Dominicano</option>
                <option value="Banco BHD">Banco BHD</option>
                <option value="Scotiabank">Scotiabank República Dominicana</option>
                <option value="Asociacion Popular">Asociación Popular (APAP)</option>
                <option value="Banco Promerica">Banco Promerica</option>
                <option value="Otro">Otro Banco / Cooperativa</option>
              </select>
            </div>

            {/* Caja de Cuentas Oficiales para Transferir (Idéntica a la Web) */}
            <div style={{
              background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '18px',
              padding: '14px 16px', marginBottom: '16px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '900', color: '#C2410C', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📋</span> Cuentas para Transferir al Profesional:
              </div>

              {proAccountList.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: idx === 0 ? '10px' : '0', fontSize: '12px', paddingBottom: idx === 0 ? '10px' : '0', borderBottom: idx === 0 ? '1px dashed #FDBA74' : 'none' }}>
                  <div>
                    <strong style={{ color: item.color }}>{item.bank}:</strong> {item.type} {item.account} ({item.holder})
                  </div>
                  <button
                    type="button"
                    onClick={() => copyCuenta(item.account, idx + 1)}
                    style={{
                      background: copiedIdx === idx + 1 ? '#10B981' : '#FFFFFF',
                      color: copiedIdx === idx + 1 ? '#FFFFFF' : '#334155',
                      border: '1px solid #CBD5E1', borderRadius: '8px', padding: '4px 10px',
                      fontSize: '11px', fontWeight: '800', cursor: 'pointer', flexShrink: 0, marginLeft: '8px'
                    }}
                  >
                    {copiedIdx === idx + 1 ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
              ))}
            </div>

            {/* Nombre del Depositante */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                Nombre del Depositante (Titular que Transfirió):
              </label>
              <input
                type="text"
                value={depositorName}
                onChange={e => setDepositorName(e.target.value)}
                placeholder="Nombre completo de quien transfirió"
                style={{ width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '13.5px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Monto Transferido */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                Monto Transferido (RD$):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#F26000', marginRight: '6px' }}>RD$</span>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={e => {
                    setTransferAmount(e.target.value)
                    setCustomPrice(e.target.value)
                  }}
                  placeholder="Ej: 1500"
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '17px', fontWeight: '800', color: '#0F172A' }}
                />
              </div>
            </div>

            {/* Subir Comprobante con Vista Previa */}
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
              Foto del Comprobante / Voucher de Transferencia:
            </label>
            <div
              onClick={() => receiptInputRef.current?.click()}
              style={{
                border: receiptPreview ? '2px solid #10B981' : '2px dashed #CBD5E1',
                borderRadius: '16px', padding: '16px',
                textAlign: 'center', background: receiptPreview ? '#F0FDF4' : '#F8FAFC',
                cursor: 'pointer', transition: 'all 0.2s', marginBottom: '14px'
              }}
            >
              {receiptPreview && receiptPreview !== 'pdf' ? (
                <div>
                  <img
                    src={receiptPreview}
                    alt="Comprobante"
                    style={{ maxHeight: '160px', maxWidth: '100%', borderRadius: '10px', border: '1px solid #86EFAC', objectFit: 'contain', marginBottom: '8px' }}
                  />
                  <div style={{ fontSize: '12px', color: '#15803D', fontWeight: '800' }}>
                    ✓ Comprobante listo ({receiptFile?.name})
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    Toca para cambiar la foto si deseas
                  </div>
                </div>
              ) : receiptPreview === 'pdf' ? (
                <div>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>📑</div>
                  <div style={{ fontSize: '12.5px', color: '#1D4ED8', fontWeight: '800' }}>
                    Documento PDF cargado ({receiptFile?.name})
                  </div>
                </div>
              ) : (
                <div>
                  <span style={{ fontSize: '32px', display: 'block', marginBottom: '6px' }}>📸</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#F26000' }}>
                    Toca aquí para seleccionar foto del comprobante
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                    Formatos: JPG, PNG o PDF
                  </span>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              ref={receiptInputRef}
              style={{ display: 'none' }}
              onChange={handleReceiptUpload}
            />

            <div className="pay-note transfer-note" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', borderRadius: '14px', padding: '12px', fontSize: '12px', lineHeight: '1.5' }}>
              {T.transferNote}
            </div>
          </div>
        )}

        {/* ── SECCIÓN 2: FORMULARIO DE PAGO EN EFECTIVO ── */}
        {method === 'cash' && (
          <div className="pay-section fade-up" style={{ border: '1.5px solid #86EFAC', background: '#FFFFFF', borderRadius: '20px', padding: '18px' }}>
            <h3 className="pay-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803D' }}>
              <span>💵</span> Pago en Efectivo Directo
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                Monto acordado a entregar en mano (RD$):
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '14px', padding: '10px 14px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#10B981', marginRight: '6px' }}>RD$</span>
                <input
                  type="number"
                  value={customPrice}
                  onChange={e => {
                    setCustomPrice(e.target.value)
                    setTransferAmount(e.target.value)
                  }}
                  placeholder="Ej: 1500"
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}
                />
              </div>
            </div>

            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '14px', padding: '14px', fontSize: '13px', lineHeight: '1.5', fontWeight: '600' }}>
              {T.cashNote}
            </div>
          </div>
        )}

        {/* Botón Principal de Confirmación */}
        <button
          className={`pay-confirm-btn ${canConfirm ? 'active' : ''} ${loading ? 'loading' : ''}`}
          disabled={!canConfirm || loading}
          onClick={handleConfirm}
          style={{
            padding: '16px 20px',
            fontSize: '16px',
            fontWeight: '900',
            borderRadius: '16px',
            background: !canConfirm
              ? '#CBD5E1'
              : method === 'cash'
              ? 'linear-gradient(135deg, #10B981, #059669)'
              : 'linear-gradient(135deg, #F26000, #C24E00)',
            boxShadow: canConfirm
              ? (method === 'cash' ? '0 6px 20px rgba(16,185,129,0.35)' : '0 6px 20px rgba(242,96,0,0.35)')
              : 'none',
            cursor: canConfirm ? 'pointer' : 'not-allowed',
            transition: 'all 0.25s ease',
            marginTop: '10px'
          }}
        >
          {loading ? (
            <span className="pay-spinner" />
          ) : method === 'cash' ? (
            `💵 Confirmar Pago en Efectivo (RD$ ${Number(customPrice || 0).toLocaleString()})`
          ) : (
            `🏦 Confirmar Transferencia y Enviar Comprobante (RD$ ${Number(transferAmount || customPrice || 0).toLocaleString()})`
          )}
        </button>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}