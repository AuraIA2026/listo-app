// src/locales/CrearLocal.jsx
import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import './Locales.css'

const ICONOS_SERVICIOS = ['🔧','🪛','🔨','🚿','⚡','🧹','🌿','🎨','🚗','💻','📦','🏗️','🔑','🪟','❄️']
const METODOS_PAGO_OPTS = [
  { id: 'transferencia', label: 'Transferencia 🏦' },
  { id: 'tarjeta', label: 'Tarjeta 💳' }
]

export default function CrearLocal({ lang = 'es', navigate, userData }) {
  const [step, setStep] = useState(1) // 1: Formulario, 2: Pago VIP
  const [paymentType, setPaymentType] = useState('tarjeta')

  const [nombre,        setNombre]        = useState('')
  const [categoria,     setCategoria]     = useState('')
  const [descripcion,   setDescripcion]   = useState('')
  const [logoFile,      setLogoFile]      = useState(null)
  const [logoPreview,   setLogoPreview]   = useState(null)
  const [portadaFile,   setPortadaFile]   = useState(null)
  const [portadaPreview,setPortadaPreview]= useState(null)
  
  const [whatsapp,      setWhatsapp]      = useState('')
  const [instagram,     setInstagram]     = useState('')
  const [horario,       setHorario]       = useState('Lunes a Viernes, 8:00 AM - 6:00 PM')
  const [pagos,         setPagos]         = useState(['transferencia', 'tarjeta'])

  const [servicios,     setServicios]     = useState([
    { nombre: '', descripcion: '', tipoPrecio: 'fijo', precio: '', icono: '🔧' }
  ])
  
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)

  const handleLogoChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setLogoFile(file); setLogoPreview(URL.createObjectURL(file))
  }
  const handlePortadaChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setPortadaFile(file); setPortadaPreview(URL.createObjectURL(file))
  }
  const handlePagoToggle = (id) => {
    setPagos(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }
  const addServicio = () => setServicios(prev => [...prev, { nombre: '', descripcion: '', tipoPrecio: 'fijo', precio: '', icono: '🔧' }])
  const removeServicio = (idx) => setServicios(prev => prev.filter((_, i) => i !== idx))
  const updateServicio = (idx, field, value) => setServicios(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))

  const irAlPago = () => {
    if (!nombre.trim()) { setError(lang === 'es' ? 'El nombre es obligatorio' : 'Name is required'); return }
    if (!userData?.uid) { setError(lang === 'es' ? 'Debes iniciar sesión' : 'You must be logged in'); return }
    setError(null)
    setStep(2)
  }

  const handleGuardar = async () => {
    setSaving(true)
    setError(null)
    try {
      let logoURL = null, portadaURL = null
      if (logoFile) {
        const logoRef = ref(storage, `locales/${userData.uid}/logo_${Date.now()}`)
        await uploadBytes(logoRef, logoFile); logoURL = await getDownloadURL(logoRef)
      }
      if (portadaFile) {
        const portadaRef = ref(storage, `locales/${userData.uid}/portada_${Date.now()}`)
        await uploadBytes(portadaRef, portadaFile); portadaURL = await getDownloadURL(portadaRef)
      }

      await addDoc(collection(db, 'locales'), {
        proId:        userData.uid,
        proNombre:    userData.name || userData.displayName || 'Profesional',
        nombre:       nombre.trim(),
        categoria:    categoria.trim(),
        descripcion:  descripcion.trim(),
        logoURL, portadaURL,
        whatsapp:     whatsapp.trim(),
        instagram:    instagram.trim(),
        horario:      horario.trim(),
        pagos:        pagos,
        servicios:    servicios.filter(s => s.nombre.trim()),
        activo:       true,
        plan:         'vip',
        suscripcionPaida: true,
        rating:       userData.rating  || 5,
        contratos:    userData.reviews || 0,
        totalResenas: userData.reviews || 0,
        createdAt:    serverTimestamp(),
      })
      navigate('profile')
    } catch (e) {
      console.error('Error creando local:', e)
      setError(lang === 'es' ? 'Error al guardar. Intenta de nuevo.' : 'Error saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (step === 2) {
    return (
      <div className="crear-local-page">
        <div className="crear-local-header" style={{ paddingBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
            <button onClick={() => setStep(1)} className="crear-local-back">←</button>
            <div className="crear-local-header-title">
              <span style={{ fontSize: 24 }}>💳</span>
              <h1>Suscripción VIP</h1>
            </div>
          </div>
          <p className="crear-local-header-sub">Estás a un paso de activar tu Tienda Virtual. Membresía: RD$ 10,000 / mes.</p>
        </div>

        <div className="crear-local-form">
          <div className="crear-local-section" style={{ textAlign:'center', background:'linear-gradient(135deg, #fffbf0, #fff)' }}>
            <h2 style={{ fontSize:32, color:'#F26000', margin:'0 0 8px', fontWeight:900 }}>RD$ 10,000</h2>
            <p style={{ color:'#666', fontSize:13, margin:0, fontWeight:600 }}>/ Mensual</p>
          </div>

          <div className="crear-local-section">
            <h2 className="cls-title">Método de pago de Listo Patrón</h2>
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
               <button onClick={() => setPaymentType('tarjeta')} style={{ flex:1, padding:12, borderRadius:12, border:paymentType==='tarjeta' ? '2px solid #F26000' : '2px solid #eee', background:paymentType==='tarjeta'?'#FFF4E6':'#fff', fontWeight:800, cursor:'pointer' }}>💳 Tarjeta</button>
               <button onClick={() => setPaymentType('transferencia')} style={{ flex:1, padding:12, borderRadius:12, border:paymentType==='transferencia' ? '2px solid #F26000' : '2px solid #eee', background:paymentType==='transferencia'?'#FFF4E6':'#fff', fontWeight:800, cursor:'pointer' }}>🏦 Transferencia</button>
            </div>

            {paymentType === 'tarjeta' ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <input className="crear-local-input" placeholder="Número de Tarjeta (Ej: 4111 2222 3333 4444)" />
                <div style={{ display:'flex', gap:10 }}>
                  <input className="crear-local-input" placeholder="MM/AA" style={{ flex:1 }} />
                  <input className="crear-local-input" placeholder="CVC" style={{ flex:1 }} />
                </div>
                <input className="crear-local-input" placeholder="Nombre en la Tarjeta" />
              </div>
            ) : (
              <div style={{ background:'#fafafa', padding:16, borderRadius:12, border:'1px solid #eee' }}>
                <p style={{ fontSize:13, color:'#555', margin:'0 0 12px', lineHeight:1.5 }}>
                  Realiza el depósito de <strong>RD$ 10,000</strong> a la siguiente cuenta y envía tu comprobante a nuestro soporte. Tu tienda se publicará inmediatamente.
                </p>
                <div style={{ background:'#fff', padding:12, borderRadius:8, border:'1px solid #ddd' }}>
                  <p style={{ margin:'0 0 4px', fontSize:14, fontWeight:800 }}>Banco Popular</p>
                  <p style={{ margin:'0 0 4px', fontSize:13, color:'#666' }}>Cuenta Corriente: <strong>123456789</strong></p>
                  <p style={{ margin:0, fontSize:13, color:'#666' }}>A nombre de: <strong>Listo Patrón SRL</strong></p>
                </div>
              </div>
            )}
          </div>

          {error && <div className="cl-error-toast">⚠️ {error}</div>}

          <button className="crear-local-save-btn glow" onClick={handleGuardar} disabled={saving}>
            {saving ? '⏳ Procesando...' : '🚀 Pagar y Publicar Tienda'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="crear-local-page">
      <div className="crear-local-header">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <button onClick={() => navigate('profile')} className="crear-local-back">←</button>
          <div className="crear-local-header-title">
            <span style={{ fontSize: 24 }}>🏢</span>
            <h1>{lang === 'es' ? 'Mi Local VIP' : 'My VIP Shop'}</h1>
          </div>
        </div>
        <p className="crear-local-header-sub">
          {lang === 'es' ? 'Paso 1: Diseña tu escaparate profesional.' : 'Step 1: Design your storefront.'}
        </p>
      </div>

      <div className="crear-local-form">
        <div className="crear-local-section">
          <h2 className="cls-title">🎨 {lang === 'es' ? 'Identidad Visual' : 'Visual Identity'}</h2>
          <div className="cls-grid">
            <div className="crear-local-field">
              <label className="crear-local-label">🖼️ Logo del negocio</label>
              <label className="crear-local-upload">
                {logoPreview ? <img src={logoPreview} alt="logo" className="cl-preview-img-logo" /> : <><span className="cl-upload-ico">📷</span><span className="cl-upload-txt">Subir Logo</span></>}
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleLogoChange} />
              </label>
            </div>
            <div className="crear-local-field">
              <label className="crear-local-label">🏞️ Foto de Portada</label>
              <label className="crear-local-upload covertop">
                {portadaPreview ? <img src={portadaPreview} alt="portada" className="cl-preview-img-cover" /> : <><span className="cl-upload-ico">🏞️</span><span className="cl-upload-txt">Subir Portada</span></>}
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={handlePortadaChange} />
              </label>
            </div>
          </div>
        </div>

        <div className="crear-local-section">
          <h2 className="cls-title">📝 {lang === 'es' ? 'Información General' : 'General Info'}</h2>
          <div className="crear-local-field">
            <label className="crear-local-label">Nombre del local</label>
            <input className="crear-local-input" placeholder="Ej: Plomería Express RD" value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div className="crear-local-field">
            <label className="crear-local-label">Categoría Especializada</label>
            <input className="crear-local-input" placeholder="Ej: Instalaciones Eléctricas, Tutorías..." value={categoria} onChange={e => setCategoria(e.target.value)} />
          </div>
          <div className="crear-local-field">
            <label className="crear-local-label">Descripción Atractiva</label>
            <textarea className="crear-local-textarea" placeholder="Convence a tus clientes por qué eres el mejor..." value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          </div>
        </div>

        <div className="crear-local-section">
          <h2 className="cls-title">⚙️ {lang === 'es' ? 'Operaciones y Contacto' : 'Operations & Contact'}</h2>
          <div className="crear-local-field">
            <label className="crear-local-label">🕒 Horarios de Atención</label>
            <input className="crear-local-input" placeholder="Ej: Lun-Vie 8am - 6pm, Sábados 9am - 2pm" value={horario} onChange={e => setHorario(e.target.value)} />
          </div>
          <div className="crear-local-field">
            <label className="crear-local-label">📱 WhatsApp del Negocio (Opcional)</label>
            <input className="crear-local-input" placeholder="+1 809-000-0000" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
          </div>
          <div className="crear-local-field">
            <label className="crear-local-label">📸 Usuario de Instagram (Opcional)</label>
            <input className="crear-local-input" placeholder="@tu_negocio_rd" value={instagram} onChange={e => setInstagram(e.target.value)} />
          </div>
          <div className="crear-local-field">
            <label className="crear-local-label">💳 Métodos de Pago Aceptados</label>
            <div className="cl-pagos-grid">
              {METODOS_PAGO_OPTS.map(p => (
                <label key={p.id} className={`cl-pago-opt ${pagos.includes(p.id) ? 'active' : ''}`}>
                  <input type="checkbox" checked={pagos.includes(p.id)} onChange={() => handlePagoToggle(p.id)} style={{ display:'none' }} />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="crear-local-section">
          <h2 className="cls-title">🛠️ {lang === 'es' ? 'Catálogo de Servicios' : 'Service Catalog'}</h2>
          <p className="cls-subtitle">Ofrece opciones claras. Agrega desde productos físicos hasta servicios por hora.</p>
          <div className="cl-servicios-list">
            {servicios.map((srv, idx) => (
              <div key={idx} className="cl-servicio-card">
                {servicios.length > 1 && <button className="cl-servicio-delete" onClick={() => removeServicio(idx)}>✕</button>}
                <div className="cls-ico-scroll">
                  {ICONOS_SERVICIOS.map(ico => (
                    <button key={ico} className={`cls-ico-btn ${srv.icono === ico ? 'active' : ''}`} onClick={() => updateServicio(idx, 'icono', ico)}>{ico}</button>
                  ))}
                </div>
                <div className="cl-sg-row">
                  <input className="crear-local-input slim" placeholder="Nombre del servicio" value={srv.nombre} onChange={e => updateServicio(idx, 'nombre', e.target.value)} />
                </div>
                <input className="crear-local-input slim text-sm" placeholder="Descripción breve (opcional)" value={srv.descripcion} onChange={e => updateServicio(idx, 'descripcion', e.target.value)} />
                <div className="cl-price-row">
                  <select className="cl-price-select" value={srv.tipoPrecio} onChange={e => updateServicio(idx, 'tipoPrecio', e.target.value)}>
                    <option value="fijo">Precio Fijo</option>
                    <option value="desde">A partir de</option>
                    <option value="convenir">A convenir</option>
                  </select>
                  {srv.tipoPrecio !== 'convenir' && (
                    <input className="crear-local-input slim cl-money" placeholder="RD$ 1,500" value={srv.precio} onChange={e => updateServicio(idx, 'precio', e.target.value)} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="cl-add-servicio-btn" onClick={addServicio}>+ {lang === 'es' ? 'Añadir otro servicio' : 'Add service'}</button>
        </div>

        {error && <div className="cl-error-toast">⚠️ {error}</div>}

        <button className="crear-local-save-btn glow" onClick={irAlPago}>
          Siguiente: Método de Pago ➔
        </button>
      </div>
      <div style={{ height: 60 }} />
    </div>
  )
}