// src/locales/EditarLocal.jsx
import { useState, useEffect } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import './Locales.css'

const ICONOS_SERVICIOS = ['🔧','🪛','🔨','🚿','⚡','🧹','🌿','🎨','🚗','💻','📦','🏗️','🔑','🪟','❄️']

export default function EditarLocal({ lang = 'es', navigate, local }) {
  const [nombre,        setNombre]        = useState(local?.nombre      || '')
  const [categoria,     setCategoria]     = useState(local?.categoria   || '')
  const [descripcion,   setDescripcion]   = useState(local?.descripcion || '')
  const [logoFile,      setLogoFile]      = useState(null)
  const [logoPreview,   setLogoPreview]   = useState(local?.logoURL     || null)
  const [portadaFile,   setPortadaFile]   = useState(null)
  const [portadaPreview,setPortadaPreview]= useState(local?.portadaURL  || null)
  const [servicios,     setServicios]     = useState(local?.servicios   || [{ nombre:'', descripcion:'', precio:'', icono:'🔧' }])
  const [saving,        setSaving]        = useState(false)
  const [error,         setError]         = useState(null)
  const [success,       setSuccess]       = useState(false)

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
    if (!nombre.trim()) { setError(lang === 'es' ? 'El nombre es obligatorio' : 'Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      const updates = {
        nombre:      nombre.trim(),
        categoria:   categoria.trim(),
        descripcion: descripcion.trim(),
        servicios:   servicios.filter(s => s.nombre.trim()),
      }

      // Subir logo si cambió
      if (logoFile) {
        const logoRef = ref(storage, `locales/${local.proId}/logo_${Date.now()}`)
        await uploadBytes(logoRef, logoFile)
        updates.logoURL = await getDownloadURL(logoRef)
      }

      // Subir portada si cambió
      if (portadaFile) {
        const portadaRef = ref(storage, `locales/${local.proId}/portada_${Date.now()}`)
        await uploadBytes(portadaRef, portadaFile)
        updates.portadaURL = await getDownloadURL(portadaRef)
      }

      await updateDoc(doc(db, 'locales', local.id), updates)
      setSuccess(true)
      setTimeout(() => navigate('proPanel'), 1500)
    } catch (e) {
      console.error('Error actualizando local:', e)
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
            onClick={() => navigate('proPanel')}
            style={{ background:'rgba(255,255,255,0.15)', border:'none', color:'#fff', borderRadius:'50%', width:32, height:32, fontSize:16, cursor:'pointer' }}
          >←</button>
          <div className="crear-local-header-title">
            <span style={{ fontSize:22 }}>✏️</span>
            <h1>{lang === 'es' ? 'Editar mi Local VIP' : 'Edit my VIP Shop'}</h1>
          </div>
        </div>
        <p className="crear-local-header-sub">
          {lang === 'es' ? 'Actualiza la información de tu local' : 'Update your shop information'}
        </p>
      </div>

      <div className="crear-local-form">

        {/* Nombre */}
        <div className="crear-local-field">
          <label className="crear-local-label">🏷️ {lang === 'es' ? 'Nombre del local' : 'Shop name'}</label>
          <input className="crear-local-input" value={nombre} onChange={e => setNombre(e.target.value)} />
        </div>

        {/* Categoría */}
        <div className="crear-local-field">
          <label className="crear-local-label">🔧 {lang === 'es' ? 'Categoría' : 'Category'}</label>
          <input className="crear-local-input" value={categoria} onChange={e => setCategoria(e.target.value)} />
        </div>

        {/* Descripción */}
        <div className="crear-local-field">
          <label className="crear-local-label">📝 {lang === 'es' ? 'Descripción' : 'Description'}</label>
          <textarea className="crear-local-textarea" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
        </div>

        {/* Logo */}
        <div className="crear-local-field">
          <label className="crear-local-label">🖼️ {lang === 'es' ? 'Logo' : 'Logo'}</label>
          <label className="crear-local-upload">
            {logoPreview
              ? <img src={logoPreview} alt="logo" style={{ height:80, width:80, borderRadius:12, objectFit:'cover' }} />
              : <><span className="crear-local-upload-icon">📷</span><span className="crear-local-upload-text">{lang === 'es' ? 'Cambiar logo' : 'Change logo'}</span></>
            }
            <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleLogoChange} />
          </label>
        </div>

        {/* Portada */}
        <div className="crear-local-field">
          <label className="crear-local-label">🏞️ {lang === 'es' ? 'Portada' : 'Cover'}</label>
          <label className="crear-local-upload">
            {portadaPreview
              ? <img src={portadaPreview} alt="portada" className="crear-local-upload-preview" />
              : <><span className="crear-local-upload-icon">🏞️</span><span className="crear-local-upload-text">{lang === 'es' ? 'Cambiar portada' : 'Change cover'}</span></>
            }
            <input type="file" accept="image/*" style={{ display:'none' }} onChange={handlePortadaChange} />
          </label>
        </div>

        {/* Servicios */}
        <div className="crear-local-field">
          <label className="crear-local-label">🛠️ {lang === 'es' ? 'Servicios' : 'Services'}</label>
          {servicios.map((srv, idx) => (
            <div key={idx} className="crear-local-servicio-item">
              {servicios.length > 1 && (
                <button className="crear-local-servicio-delete" onClick={() => removeServicio(idx)}>✕</button>
              )}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:4 }}>
                {ICONOS_SERVICIOS.map(ico => (
                  <button key={ico} onClick={() => updateServicio(idx, 'icono', ico)}
                    style={{ fontSize:18, background: srv.icono===ico?'rgba(242,96,0,0.15)':'transparent', border: srv.icono===ico?'2px solid #F26000':'2px solid transparent', borderRadius:8, padding:'2px 4px', cursor:'pointer' }}>
                    {ico}
                  </button>
                ))}
              </div>
              <input className="crear-local-input" placeholder={lang==='es'?'Nombre del servicio':'Service name'} value={srv.nombre} onChange={e=>updateServicio(idx,'nombre',e.target.value)} style={{marginBottom:6}} />
              <input className="crear-local-input" placeholder={lang==='es'?'Descripción breve':'Short description'} value={srv.descripcion} onChange={e=>updateServicio(idx,'descripcion',e.target.value)} style={{marginBottom:6}} />
              <input className="crear-local-input" placeholder={lang==='es'?'Precio':'Price'} value={srv.precio} onChange={e=>updateServicio(idx,'precio',e.target.value)} />
            </div>
          ))}
          <button className="crear-local-add-servicio" onClick={addServicio}>
            + {lang==='es'?'Agregar servicio':'Add service'}
          </button>
        </div>

        {error   && <p style={{ color:'#e55', fontSize:13, fontWeight:600, textAlign:'center' }}>⚠️ {error}</p>}
        {success && <p style={{ color:'#2a9d2a', fontSize:13, fontWeight:600, textAlign:'center' }}>✅ {lang==='es'?'¡Guardado correctamente!':'Saved successfully!'}</p>}

        <button className="crear-local-save-btn" onClick={handleGuardar} disabled={saving}>
          {saving ? (lang==='es'?'⏳ Guardando...':'⏳ Saving...') : (lang==='es'?'💾 Guardar cambios':'💾 Save changes')}
        </button>
      </div>
    </div>
  )
}