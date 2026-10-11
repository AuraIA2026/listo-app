import { useState, useRef, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '../firebase'
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
    title: 'Pago por Trabajo Realizado',
    method: 'Selecciona cómo vas a pagar:',
    cash: 'Pago en Efectivo',
    cashDesc: 'Pagas en mano en efectivo directamente al profesional al terminar el servicio.',
    transfer: 'Pago por Transferencia Bancaria',
    transferDesc: 'Transfiere a la cuenta bancaria del profesional y adjunta el comprobante de pago.',
    selectBank: 'Selecciona el banco del profesional',
    accountName: 'A nombre de',
    accountNum: 'Cuenta/Número',
    accountType: 'Tipo',
    copyAccount: 'Copiar',
    copied: '¡Copiado!',
    uploadReceipt: 'Subir foto del comprobante',
    receiptUploaded: '¡Comprobante cargado con éxito!',
    summary: 'Resumen del pago',
    service: 'Costo del Servicio',
    total: 'Total a Pagar',
    confirm: 'Confirmar Pago',
    cashNote: '💡 Has seleccionado Pago en Efectivo. Entregarás este dinero directamente en mano al profesional al completar el servicio. El pago va 100% al profesional sin cargos extra.',
    transferNote: '💡 Al confirmar la transferencia, el comprobante se enviará al profesional y quedará registrado para su validación.',
    success: '¡Excelente!',
    successSub: 'Acabas de asegurar el pago con el profesional.',
    backOrders: 'Ir a Pedidos',
  },
  en: {
    title: 'Service payment',
    method: 'Select how you will pay:',
    cash: 'Cash Payment',
    cashDesc: 'Pay directly in cash to the professional upon completion of the service.',
    transfer: 'Bank Transfer Payment',
    transferDesc: 'Transfer to the professional’s bank account and attach the deposit receipt.',
    selectBank: 'Select an option',
    accountName: 'Name',
    accountNum: 'Account',
    accountType: 'Type',
    copyAccount: 'Copy',
    copied: 'Copied!',
    uploadReceipt: 'Upload receipt photo',
    receiptUploaded: 'Receipt uploaded!',
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
  const total = Number(customPrice) || 0

  const [method, setMethod]                 = useState('cash') // 'cash' | 'transfer'
  const [selectedBank, setSelectedBank]     = useState(null)
  const [transferAmount, setTransferAmount] = useState(initialPriceStr)
  const [depositorName, setDepositorName]   = useState('')
  const [receiptFile, setReceiptFile]       = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [receiptBase64, setReceiptBase64]   = useState(null)
  const [receiptUploaded, setReceiptUploaded] = useState(false)
  const [loading, setLoading]               = useState(false)
  const [showReceipt, setShowReceipt]       = useState(false)
  const receiptInputRef                     = useRef(null)

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
    const finalAmount = customPrice ? `RD$${customPrice}` : (pro.price || 'RD$0')
    const finalAmountNum = parseFloat(customPrice || pro.price?.replace(/[^0-9.]/g, '') || 0)

    try {
      if (pro.orderId) {
        await updateDoc(doc(db, 'orders', pro.orderId), {
          price: finalAmount,
          paymentMethod: method,
          paymentStatus: method === 'cash' ? 'pending_cash' : 'verifying',
          depositorName: method === 'transfer' ? depositorName : null,
          depositBank: method === 'transfer' ? (selectedBank?.name || selectedBank?.short || 'Banco') : null,
          receiptUrl: method === 'transfer' ? (receiptBase64 || null) : null
        })

        // Enviar notificación al profesional
        import('firebase/firestore').then(async ({ addDoc, getDocs, query, where, collection, serverTimestamp }) => {
          addDoc(collection(db, 'notificaciones'), {
            userId: pro.proId || pro.uid || pro.id,
            orderId: pro.orderId,
            type: 'payment_received',
            title: method === 'cash' 
              ? (lang === 'es' ? '💵 ¡Pago en Efectivo Declarado!' : '💵 Cash Payment Declared!')
              : (lang === 'es' ? '🏦 ¡Pago por Transferencia Declarado!' : '🏦 Bank Transfer Payment Declared!'),
            text: method === 'cash' 
              ? (lang === 'es' ? `El cliente declaró que te pagará ${finalAmount} en efectivo en mano por el trabajo realizado.` : `Client declared cash payment of ${finalAmount}.`)
              : (lang === 'es' ? `El cliente transfirió ${finalAmount} a tu cuenta de ${selectedBank?.name || 'banco'} y adjuntó su comprobante.` : `Client transferred ${finalAmount} and attached receipt.`),
            read: false,
            icon: method === 'cash' ? '💵' : '🏦',
            createdAt: serverTimestamp()
          }).catch(console.error);

          // Enviar notificación al administrador
          addDoc(collection(db, 'notificaciones'), {
            userId: 'admin',
            orderId: pro.orderId,
            type: 'system',
            title: method === 'transfer' ? '🏦 NUEVO PAGO POR TRANSFERENCIA' : '💵 PAGO EN EFECTIVO DECLARADO',
            text: `El cliente con correo ${auth.currentUser?.email || 'desconocido'} ha declarado un pago de ${finalAmount} para el profesional ${pro.name || 'desconocido'} (${pro.category || 'sin categoría'}) mediante ${method === 'transfer' ? 'transferencia bancaria (' + (selectedBank?.name || '') + ')' : 'pago en efectivo en mano'}.`,
            read: false,
            date: new Date().toISOString(),
            createdAt: serverTimestamp()
          }).catch(console.error);

          // Registrar en la colección 'payments' para que el admin pueda validarlo en la App
          addDoc(collection(db, 'payments'), {
            orderId: pro.orderId,
            proId: pro.proId || pro.uid || pro.id || '',
            proName: pro.name || 'Profesional',
            proCategory: pro.category || '',
            email: pro.email || '',
            phone: pro.phone || '',
            planName: method === 'transfer' ? 'Pago de Servicio (Transferencia)' : 'Pago de Servicio (Efectivo)',
            planId: 'servicio_pago',
            planPriceVal: finalAmountNum,
            transferAmount: finalAmountNum,
            status: 'pending',
            paymentMethod: method === 'cash' ? 'cash' : 'transfer',
            bank: method === 'transfer' ? (selectedBank?.name || 'Transferencia') : 'Efectivo',
            depositorName: method === 'transfer' ? (depositorName || 'Cliente') : (auth.currentUser?.displayName || 'Cliente'),
            receiptUrl: method === 'transfer' ? (receiptBase64 || null) : null,
            createdAt: serverTimestamp()
          }).catch(console.error);

          // Buscar la notificación de trabajo terminado para el cliente y cambiar su texto
          try {
            const notifQ = query(
              collection(db, 'notificaciones'),
              where('orderId', '==', pro.orderId),
              where('userId', '==', auth.currentUser?.uid || '')
            );
            const notifSnap = await getDocs(notifQ);
            notifSnap.forEach(async (docSnap) => {
              const data = docSnap.data();
              if (data.text && (data.text.toLowerCase().includes('pago') || data.text.toLowerCase().includes('payment') || data.text.toLowerCase().includes('procede') || data.text.toLowerCase().includes('proceed') || data.type === 'job_done')) {
                await updateDoc(doc(db, 'notificaciones', docSnap.id), {
                  text: lang === 'es' 
                    ? `${pro.name || 'El profesional'} ha terminado el trabajo. ¡Pago registrado!` 
                    : `${pro.name || 'The professional'} finished the job. Payment recorded!`,
                  title: lang === 'es' ? '🎉 ¡Pago Registrado!' : '🎉 Payment Recorded!',
                  icon: '✅'
                });
              }
            });
          } catch (errNotif) {
            console.error("Error al actualizar la notificación de pago del cliente:", errNotif);
          }
        });
      }
    } catch (e) {
      console.error("Error actualizando pago de orden:", e)
    }
    setLoading(false)
    navigate('workdone', pro)
  }

  // Validaciones estrictas según método elegido
  const canConfirmCash = method === 'cash' && Number(customPrice || 0) > 0
  const canConfirmTransfer = method === 'transfer' && selectedBank && (Number(transferAmount || 0) > 0 || Number(customPrice || 0) > 0) && depositorName.trim() !== '' && receiptUploaded && Boolean(receiptBase64)
  const canConfirm = canConfirmCash || canConfirmTransfer

  return (
    <div className="payment-page">
      <div className="payment-header">
        <button className="pay-back-btn" onClick={() => navigate('tracking', pro)}>←</button>
        <h1 className="payment-title">{T.title}</h1>
      </div>

      <div className="payment-body">
        {/* Tarjeta del Profesional */}
        <div className="pay-pro-card fade-up">
          <div className="pay-pro-avatar" style={{ background: pro.color || '#F26000' }}>{pro.avatar || '👤'}</div>
          <div className="pay-pro-info">
            <p className="pay-pro-name">{pro.name || 'Profesional Listo'}</p>
            <p className="pay-pro-cat">{pro.category || 'Servicio Profesional'}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Costo</span>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#F26000', fontFamily: 'var(--font-display)' }}>
              RD${Number(customPrice || 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Sección de Selección de Método de Pago */}
        <div className="pay-section fade-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="pay-section-title">{T.method}</h3>
          <div className="pay-methods">
            {/* OPCIÓN 1: PAGO EN EFECTIVO */}
            <button
              type="button"
              className={`pay-method-card ${method === 'cash' ? 'selected' : ''}`}
              onClick={() => { setMethod('cash'); setSelectedBank(null); }}
              style={{
                border: method === 'cash' ? '2px solid #F26000' : '2px solid #E2E8F0',
                background: method === 'cash' ? '#FFF7ED' : '#FFFFFF',
                borderRadius: '16px',
                padding: '16px',
                cursor: 'pointer'
              }}
            >
              <div className="pay-method-icon cash-icon" style={{ fontSize: '26px' }}>💵</div>
              <div className="pay-method-info">
                <p className="pay-method-name" style={{ color: method === 'cash' ? '#C2410C' : '#1E293B', fontWeight: '800' }}>
                  {T.cash}
                </p>
                <p className="pay-method-desc" style={{ color: '#64748B', marginTop: '4px' }}>
                  {T.cashDesc}
                </p>
              </div>
              <div className={`pay-method-radio ${method === 'cash' ? 'checked' : ''}`} />
            </button>
            
            {/* OPCIÓN 2: PAGO POR TRANSFERENCIA */}
            <button
              type="button"
              className={`pay-method-card ${method === 'transfer' ? 'selected' : ''}`}
              onClick={() => { 
                setMethod('transfer'); 
                if (!transferAmount && customPrice) setTransferAmount(customPrice);
              }}
              style={{
                border: method === 'transfer' ? '2px solid #F26000' : '2px solid #E2E8F0',
                background: method === 'transfer' ? '#FFF7ED' : '#FFFFFF',
                borderRadius: '16px',
                padding: '16px',
                cursor: 'pointer'
              }}
            >
              <div className="pay-method-icon transfer-icon" style={{ fontSize: '26px' }}>🏦</div>
              <div className="pay-method-info">
                <p className="pay-method-name" style={{ color: method === 'transfer' ? '#C2410C' : '#1E293B', fontWeight: '800' }}>
                  {T.transfer}
                </p>
                <p className="pay-method-desc" style={{ color: '#64748B', marginTop: '4px' }}>
                  {T.transferDesc}
                </p>
              </div>
              <div className={`pay-method-radio ${method === 'transfer' ? 'checked' : ''}`} />
            </button>
          </div>
        </div>

        {/* DETALLES SI SELECCIONA EFECTIVO */}
        {method === 'cash' && (
          <div className="pay-section fade-up" style={{ border: '1.5px solid #FDBA74', background: '#FFFFFF' }}>
            <h3 className="pay-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C2410C' }}>
              <span>💵</span> Detalles del Pago en Efectivo
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1E293B', marginBottom: '6px' }}>
                Monto acordado a pagar en mano (RD$)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', border: '1.5px solid #CBD5E1', borderRadius: '14px', padding: '10px 14px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#F26000', marginRight: '6px' }}>RD$</span>
                <input 
                  type="number"
                  value={customPrice}
                  onChange={e => {
                    setCustomPrice(e.target.value);
                    setTransferAmount(e.target.value);
                  }}
                  placeholder="Ej. 1500"
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}
                />
              </div>
            </div>

            <div className="pay-note cash-note" style={{ background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', borderRadius: '14px', padding: '14px' }}>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', fontWeight: '600' }}>
                {T.cashNote}
              </p>
            </div>

            {/* Resumen Efectivo */}
            <div className="summary-rows" style={{ marginTop: '16px', background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div className="summary-row">
                <span style={{ fontWeight: '700', color: '#64748B' }}>Método seleccionado:</span>
                <span style={{ fontWeight: '800', color: '#15803D' }}>💵 Pago en Efectivo</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <span style={{ fontWeight: '800', color: '#0F172A' }}>Total a entregar en mano:</span>
                <span className="total-amount" style={{ color: '#F26000', fontWeight: '900', fontSize: '20px' }}>
                  RD${Number(customPrice || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* DETALLES SI SELECCIONA TRANSFERENCIA BANCARIA */}
        {method === 'transfer' && (
          <div className="pay-section fade-up" style={{ border: '1.5px solid #93C5FD', background: '#FFFFFF' }}>
            <h3 className="pay-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1D4ED8' }}>
              <span>🏦</span> Detalles de la Transferencia Bancaria
            </h3>

            <div className="transfer-manual-box" style={{ background: '#F8FAFC', borderRadius: '18px', padding: '16px', border: '1.5px solid #E2E8F0', textAlign: 'left' }}>
              
              {/* Selector de Banco */}
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1E293B', marginBottom: '6px' }}>
                Banco del Profesional (Destino)
              </label>
              <select 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', background: '#FFFFFF', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '14px', outline: 'none' }}
                value={selectedBank?.id || ''}
                onChange={e => setSelectedBank(banks.find(b => b.id === e.target.value))}
              >
                <option value="" disabled>Selecciona el banco donde transferiste...</option>
                {banks.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.type})</option>
                ))}
              </select>

              {/* Monto Transferido */}
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1E293B', marginBottom: '6px' }}>
                Monto Transferido (RD$)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px', marginBottom: '14px' }}>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#F26000', marginRight: '6px' }}>RD$</span>
                <input 
                  type="number" 
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: '17px', fontWeight: '800', color: '#0F172A' }}
                  placeholder="Ej. 1500"
                  value={transferAmount}
                  onChange={e => {
                    setTransferAmount(e.target.value);
                    setCustomPrice(e.target.value);
                  }}
                />
              </div>

              {/* Nombre de Quien Transfiere */}
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1E293B', marginBottom: '6px' }}>
                Nombre del Titular que Transfirió
              </label>
              <input 
                type="text" 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', background: '#FFFFFF', fontSize: '14px', fontWeight: '600', color: '#1E293B', marginBottom: '16px', outline: 'none', boxSizing: 'border-box' }}
                placeholder="Nombre completo de quien transfirió"
                value={depositorName}
                onChange={e => setDepositorName(e.target.value)}
              />

              {/* Foto del Comprobante / Recibo con Preview Real */}
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1E293B', marginBottom: '6px' }}>
                Foto del Comprobante / Recibo de Pago
              </label>
              <div 
                onClick={() => receiptInputRef.current?.click()}
                style={{
                  border: receiptPreview ? '2px solid #10B981' : '2px dashed #93C5FD',
                  borderRadius: '16px', padding: '16px',
                  textAlign: 'center', background: receiptPreview ? '#F0FDF4' : '#EFF6FF',
                  cursor: 'pointer', transition: 'all 0.2s', marginBottom: '8px'
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
                      ✓ Foto del comprobante cargada ({receiptFile?.name})
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      Toca aquí si deseas cambiar la foto
                    </div>
                  </div>
                ) : receiptPreview === 'pdf' ? (
                  <div>
                    <div style={{ fontSize: '28px', marginBottom: '4px' }}>📑</div>
                    <div style={{ fontSize: '12.5px', color: '#1D4ED8', fontWeight: '800' }}>
                      Documento PDF cargado ({receiptFile?.name})
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                      Toca aquí si deseas cambiar el archivo
                    </div>
                  </div>
                ) : (
                  <div>
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '6px' }}>📸</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#1D4ED8' }}>
                      Toca aquí para seleccionar foto del comprobante
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '4px' }}>
                      Formatos soportados: JPG, PNG, PDF
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
            </div>

            <div className="pay-note transfer-note" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', borderRadius: '14px', padding: '14px', marginTop: '14px' }}>
              <p style={{ margin: 0, fontSize: '12.5px', lineHeight: '1.5', fontWeight: '600' }}>
                {T.transferNote}
              </p>
            </div>

            {/* Resumen Transferencia */}
            <div className="summary-rows" style={{ marginTop: '16px', background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div className="summary-row">
                <span style={{ fontWeight: '700', color: '#64748B' }}>Banco destino:</span>
                <span style={{ fontWeight: '800', color: '#1E293B' }}>{selectedBank?.name || 'Por seleccionar'}</span>
              </div>
              <div className="summary-row">
                <span style={{ fontWeight: '700', color: '#64748B' }}>Comprobante:</span>
                <span style={{ fontWeight: '800', color: receiptUploaded ? '#15803D' : '#DC2626' }}>
                  {receiptUploaded ? '✓ Cargado' : 'Pendiente de adjuntar'}
                </span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row total-row">
                <span style={{ fontWeight: '800', color: '#0F172A' }}>Total transferido:</span>
                <span className="total-amount" style={{ color: '#F26000', fontWeight: '900', fontSize: '20px' }}>
                  RD${Number(transferAmount || customPrice || 0).toLocaleString()}
                </span>
              </div>
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
            transition: 'all 0.25s ease'
          }}
        >
          {loading ? (
            <span className="pay-spinner" />
          ) : method === 'cash' ? (
            `💵 Confirmar Pago en Efectivo (RD$ ${Number(customPrice || 0).toLocaleString()})`
          ) : (
            `🏦 Confirmar Pago por Transferencia (RD$ ${Number(transferAmount || customPrice || 0).toLocaleString()})`
          )}
        </button>

        <div style={{ height: 40 }} />
      </div>

      {showReceipt && (
        <div className="receipt-overlay">
          <div className="receipt-modal">
            <div className="receipt-logo">LISTO <span>PATRÓN</span></div>
            <div className="receipt-success-icon">✓</div>
            <div className="receipt-title">¡Pago Completado!</div>
            <div className="receipt-subtitle">Su recibo electrónico fue generado.</div>
            
            <div className="receipt-amount">RD$ {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            
            <div className="receipt-details-box">
              <div className="receipt-detail-row">
                <span className="receipt-detail-label">Concepto:</span>
                <span className="receipt-detail-value">Servicio de {pro.category}</span>
              </div>
              <div className="receipt-detail-row">
                <span className="receipt-detail-label">Fecha:</span>
                <span className="receipt-detail-value">
                  {(() => {
                    const date = new Date();
                    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                    return `${date.getDate()} de ${months[date.getMonth()]} del ${date.getFullYear()}`;
                  })()}
                </span>
              </div>
              <div className="receipt-detail-row">
                <span className="receipt-detail-label">Método de pago:</span>
                <span className="receipt-detail-value">{method === 'cash' ? 'Efectivo' : 'Transferencia'}</span>
              </div>
              <div className="receipt-detail-row">
                <span className="receipt-detail-label">Estado:</span>
                <span className="receipt-detail-value" style={{ color: '#00b050' }}>Completado</span>
              </div>
            </div>

            <p style={{ fontSize: '11px', color: '#F26000', fontWeight: '700', margin: '10px 0' }}>
              📸 Toma una captura de pantalla de este recibo.
            </p>

            <div className="receipt-footer-text">
              Este es un recibo automático generado por Pedidos Listo SRL. Gracias por confiar en nosotros. Si tiene algún reclamo sobre su pago, por favor contáctenos a través de la aplicación.
            </div>

            <button className="receipt-close-btn" onClick={() => { setShowReceipt(false); navigate('workdone', pro); }}>
              Continuar a Valoración
            </button>
          </div>
        </div>
      )}
    </div>
  )
}