// src/locales/CrearLocal.jsx
import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import './Locales.css'

const ICONOS_SERVICIOS = ['🔧','🪛','🔨','🚿','⚡','🧹','🌿','🎨','🚗','💻','📦','🏗️','🔑','🪟','❄️']

// ✅ Recibe userData (no currentUser) igual que el resto de páginas en App.jsx
export default function CrearLocal({ lang = 'es', navigate, userData }) {
  const [nombre,        setNombre]        = useState('')
  const [categoria,     setCategoria]     = useState('')
  const [descripcion,   setDescripcion]   = useState('')
  const [logoFile,      setLogoFile]      = useState(null)
  const [logoPreview,   setLogoPreview]   = useState(null)
  const [portadaFile,   setPortadaFile]   = useState(null)
  const [portadaPreview,setPortadaPreview]= useState(null)
  const [servicios,     setServicios]     = useState([
    { nombre: '', descripcion: '', precio: '', icono: '🔧' }
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

  const addServicio = () => {
    setServicios(prev => [...prev, { nombre: '', descripcion: '', precio: '', icono: '🔧' }])
  }

  const removeServicio = (idx) => {
    setServicios(prev => prev.filter((_, i) => i !== idx))
  }

  const updateServicio = (idx, field, value) => {
    setServicios(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s))
  }

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      setError(lang === 'es' ? 'El nombre es obligatorio' : 'Name is required')
      return
    }
    if (!userData?.uid) {
      setError(lang === 'es' ? 'Debes iniciar sesión' : 'You must be logged in')
      return
    }

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
        servicios:    serviciosFiltrados,
        activo:       true,
        plan:         'vip',
        rating:       userData.rating  || 5,
        contratos:    userData.reviews || 0,
        totalResenas: userData.reviews || 0,
        createdAt:    serverTimestamp(),
      })

      navigate('profile')  // ✅ vuelve a perfil del pro
    } catch (e) {
      console.error('Error creando local:', e)
      setError(lang === 'es' ? 'Error al guardar. Intenta de nuevo.' : 'Error saving. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="crear-local-page">

      {/* Header */}
      <div className="crear-local-header">
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
          <button
            onClick={() => navigate('profile')}
            style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer', flexShrink:0 }}
          >←</button>
          <div className="crear-local-header-title">
            <span style={{ fontSize: 24 }}>🏢</span>
            <h1>{lang === 'es' ? 'Crear mi Local VIP' : 'Create my VIP Shop'}</h1>
          </div>
        </div>
        <p className="crear-local-header-sub">
          {lang === 'es'
            ? 'Configura tu espacio exclusivo en Listo Patrón'
            : 'Set up your exclusive space in Listo Patrón'}
        </p>
      </div>

      <div className="crear-local-form">

        {/* Nombre */}
        <div className="crear-local-field">
          <label className="crear-local-label">
            🏷️ {lang === 'es' ? 'Nombre del local' : 'Shop name'}
          </label>
          <input
            className="crear-local-input"
            placeholder={lang === 'es' ? 'Ej: Plomería Express RD' : 'Ex: Express Plumbing RD'}
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        </div>

        {/* Categoría */}
        <div className="crear-local-field">
          <label className="crear-local-label">
            🔧 {lang === 'es' ? 'Categoría principal' : 'Main category'}
          </label>
          <input
            className="crear-local-input"
            placeholder={lang === 'es' ? 'Ej: Plomería, Electricidad...' : 'Ex: Plumbing, Electricity...'}
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
          />
        </div>

        {/* Descripción */}
        <div className="crear-local-field">
          <label className="crear-local-label">
            📝 {lang === 'es' ? 'Descripción' : 'Description'}
          </label>
          <textarea
            className="crear-local-textarea"
            placeholder={lang === 'es'
              ? 'Cuéntales a los clientes quiénes son y qué ofrecen...'
              : 'Tell clients who you are and what you offer...'}
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
          />
        </div>

        {/* Logo */}
        <div className="crear-local-field">
          <label className="crear-local-label">
            🖼️ {lang === 'es' ? 'Logo del local' : 'Shop logo'}
          </label>
          <label className="crear-local-upload">
            {logoPreview
              ? <img src={logoPreview} alt="logo" className="crear-local-upload-preview" style={{ height:80, width:80, borderRadius:12, objectFit:'cover' }} />
              : <>
                  <span className="crear-local-upload-icon">📷</span>
                  <span className="crear-local-upload-text">
                    {lang === 'es' ? 'Toca para subir logo' : 'Tap to upload logo'}
                  </span>
                </>
            }
            <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleLogoChange} />
          </label>
        </div>

        {/* Portada */}
        <div className="crear-local-field">
          <label className="crear-local-label">
            🏞️ {lang === 'es' ? 'Foto de portada' : 'Cover photo'}
          </label>
          <label className="crear-local-upload">
            {portadaPreview
              ? <img src={portadaPreview} alt="portada" className="crear-local-upload-preview" />
              : <>
                  <span className="crear-local-upload-icon">🏞️</span>
                  <span className="crear-local-upload-text">
                    {lang === 'es' ? 'Toca para subir portada' : 'Tap to upload cover'}
                  </span>
                </>
            }
            <input type="file" accept="image/*" style={{ display:'none' }} onChange={handlePortadaChange} />
          </label>
        </div>

        {/* Servicios */}
        <div className="crear-local-field">
          <label className="crear-local-label">
            🛠️ {lang === 'es' ? 'Servicios que ofreces' : 'Services you offer'}
          </label>

          {servicios.map((srv, idx) => (
            <div key={idx} className="crear-local-servicio-item">
              {servicios.length > 1 && (
                <button className="crear-local-servicio-delete" onClick={() => removeServicio(idx)}>✕</button>
              )}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:4 }}>
                {ICONOS_SERVICIOS.map(ico => (
                  <button
                    key={ico}
                    onClick={() => updateServicio(idx, 'icono', ico)}
                    style={{
                      fontSize:18,
                      background: srv.icono === ico ? 'rgba(242,96,0,0.15)' : 'transparent',
                      border: srv.icono === ico ? '2px solid #F26000' : '2px solid transparent',
                      borderRadius:8, padding:'2px 4px', cursor:'pointer'
                    }}
                  >{ico}</button>
                ))}
              </div>
              <input
                className="crear-local-input"
                placeholder={lang === 'es' ? 'Nombre del servicio' : 'Service name'}
                value={srv.nombre}
                onChange={e => updateServicio(idx, 'nombre', e.target.value)}
                style={{ marginBottom: 6 }}
              />
              <input
                className="crear-local-input"
                placeholder={lang === 'es' ? 'Descripción breve (opcional)' : 'Short description (optional)'}
                value={srv.descripcion}
                onChange={e => updateServicio(idx, 'descripcion', e.target.value)}
                style={{ marginBottom: 6 }}
              />
              <input
                className="crear-local-input"
                placeholder={lang === 'es' ? 'Precio (ej: 1500 o "A convenir")' : 'Price (e.g. 1500 or "To agree")'}
                value={srv.precio}
                onChange={e => updateServicio(idx, 'precio', e.target.value)}
              />
            </div>
          ))}

          <button className="crear-local-add-servicio" onClick={addServicio}>
            + {lang === 'es' ? 'Agregar otro servicio' : 'Add another service'}
          </button>
        </div>

        {error && (
          <p style={{ color:'#e55', fontSize:13, fontWeight:600, textAlign:'center', margin:0 }}>
            ⚠️ {error}
          </p>
        )}

        <button
          className="crear-local-save-btn"
          onClick={handleGuardar}
          disabled={saving}
        >
          {saving
            ? (lang === 'es' ? '⏳ Guardando...' : '⏳ Saving...')
            : (lang === 'es' ? '🏢 Publicar mi Local VIP' : '🏢 Publish my VIP Shop')
          }
        </button>
      </div>
    </div>
  )
}