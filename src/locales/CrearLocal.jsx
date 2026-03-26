// src/locales/CrearLocal.jsx
import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import './Locales.css'

const ICONOS_SERVICIOS = ['🔧','🪛','🔨','🚿','⚡','🧹','🌿','🎨','🚗','💻','📦','🏗️','🔑','🪟','❄️']
const METODOS_PAGO_OPTS = [
  { id: 'efectivo', label: 'Efectivo 💵' },
  { id: 'transferencia', label: 'Transferencia 🏦' },
  { id: 'tarjeta', label: 'Tarjeta 💳' },
  { id: 'paypal', label: 'PayPal 📱' }
]

export default function CrearLocal({ lang = 'es', navigate, userData }) {
  const [nombre,        setNombre]        = useState('')
  const [categoria,     setCategoria]     = useState('')
  const [descripcion,   setDescripcion]   = useState('')
  const [logoFile,      setLogoFile]      = useState(null)
  const [logoPreview,   setLogoPreview]   = useState(null)
  const [portadaFile,   setPortadaFile]   = useState(null)
  const [portadaPreview,setPortadaPreview]= useState(null)
  
  // Novedades VIP
  const [whatsapp,      setWhatsapp]      = useState('')
  const [instagram,     setInstagram]     = useState('')
  const [horario,       setHorario]       = useState('Lunes a Viernes, 8:00 AM - 6:00 PM')
  const [pagos,         setPagos]         = useState(['efectivo', 'transferencia'])

  const [servicios,     setServicios]     = useState([
    { nombre: '', descripcion: '', tipoPrecio: 'fijo', precio: '', icono: '🔧' }
  ])
  
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  const handlePortadaChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPortadaFile(file)
    setPortadaPreview(URL.createObjectURL(file))
  }

  const handlePagoToggle = (id) => {
    setPagos(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
  }

  const addServicio = () => {
    setServicios(prev => [...prev, { nombre: '', descripcion: '', tipoPrecio: 'fijo', precio: '', icono: '🔧' }])
  }

  const removeServicio = (idx) => {
    setServicios(prev => prev.filter((_, i) => i !== idx))
  }

  const updateServicio = (idx, field, value) => {
    setServicios(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const handleGuardar = async () => {
    if (!nombre.trim()) { setError(lang === 'es' ? 'El nombre es obligatorio' : 'Name is required'); return }
    if (!userData?.uid) { setError(lang === 'es' ? 'Debes iniciar sesión' : 'You must be logged in'); return }

    setSaving(true)
    setError(null)

    try {
      let logoURL    = null
      let portadaURL = null

      if (logoFile) {
        const logoRef = ref(storage, `locales/${userData.uid}/logo_${Date.now()}`)
        await uploadBytes(logoRef, logoFile)
        logoURL = await getDownloadURL(logoRef)
      }
      if (portadaFile) {
        const portadaRef = ref(storage, `locales/${userData.uid}/portada_${Date.now()}`)
        await uploadBytes(portadaRef, portadaFile)
        portadaURL = await getDownloadURL(portadaRef)
      }

      const serviciosFiltrados = servicios.filter(s => s.nombre.trim())

      await addDoc(collection(db, 'locales'), {
        proId:        userData.uid,
        proNombre:    userData.name || userData.displayName || 'Profesional',
        nombre:       nombre.trim(),
        categoria:    categoria.trim(),
        descripcion:  descripcion.trim(),
        logoURL,
        portadaURL,
        whatsapp:     whatsapp.trim(),
        instagram:    instagram.trim(),
        horario:      horario.trim(),
        pagos:        pagos,
        servicios:    serviciosFiltrados,
        activo:       true,
        plan:         'vip',
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
          {lang === 'es' ? 'Diseña tu escaparate profesional de alto impacto.' : 'Design your high-impact professional storefront.'}
        </p>
      </div>

      <div className="crear-local-form">
        {/* SECCIÓN 1: IDENTIDAD VISUAL */}
        <div className="crear-local-section">
          <h2 className="cls-title">🎨 {lang === 'es' ? 'Identidad Visual' : 'Visual Identity'}</h2>
          
          <div className="cls-grid">
            <div className="crear-local-field">
              <label className="crear-local-label">🖼️ {lang === 'es' ? 'Logo del negocio' : 'Business logo'}</label>
              <label className="crear-local-upload">
                {logoPreview ? <img src={logoPreview} alt="logo" className="cl-preview-img-logo" /> : <><span className="cl-upload-ico">📷</span><span className="cl-upload-txt">Subir Logo</span></>}
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleLogoChange} />
              </label>
            </div>
            
            <div className="crear-local-field">
              <label className="crear-local-label">🏞️ {lang === 'es' ? 'Foto de Portada' : 'Cover Photo'}</label>
              <label className="crear-local-upload covertop">
                {portadaPreview ? <img src={portadaPreview} alt="portada" className="cl-preview-img-cover" /> : <><span className="cl-upload-ico">🏞️</span><span className="cl-upload-txt">Subir Portada</span></>}
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={handlePortadaChange} />
              </label>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: INFORMACIÓN BÁSICA */}
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

        {/* SECCIÓN 3: OPERACIONES Y CONTACTO */}
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

        {/* SECCIÓN 4: CATÁLOGO DE SERVICIOS */}
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

        <button className="crear-local-save-btn glow" onClick={handleGuardar} disabled={saving}>
          {saving ? '⏳ Guardando Universo...' : '🚀 Poner en línea mi Local VIP'}
        </button>
      </div>
      <div style={{ height: 60 }} />
    </div>
  )
}