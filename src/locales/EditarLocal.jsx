// src/locales/EditarLocal.jsx
import { useState } from 'react'
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import './Locales.css'

const compressImage = (file, maxRes = 600) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > height) { if (width > maxRes) { height = Math.round(height * maxRes / width); width = maxRes } }
      else { if (height > maxRes) { width = Math.round(width * maxRes / height); height = maxRes } }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = reject; img.src = e.target.result
  }
  reader.onerror = reject; reader.readAsDataURL(file)
})

const ICONOS_SERVICIOS = ['🔧','🪛','🔨','🚿','⚡','🧹','🌿','🎨','🚗','💻','📦','🏗️','🔑','🪟','❄️']
const METODOS_PAGO_OPTS = [
  { id: 'transferencia', label: 'Transferencia 🏦' },
  { id: 'tarjeta', label: 'Tarjeta 💳' }
]

export default function EditarLocal({ lang = 'es', navigate, local }) {
  const [nombre,        setNombre]        = useState(local?.nombre      || '')
  const [categoria,     setCategoria]     = useState(local?.categoria   || '')
  const [descripcion,   setDescripcion]   = useState(local?.descripcion || '')
  
  const [logoFile,      setLogoFile]      = useState(null)
  const [logoPreview,   setLogoPreview]   = useState(local?.logoURL     || null)
  const [portadaFile,   setPortadaFile]   = useState(null)
  const [portadaPreview,setPortadaPreview]= useState(local?.portadaURL  || null)
  
  const [whatsapp,      setWhatsapp]      = useState(local?.whatsapp    || '')
  const [instagram,     setInstagram]     = useState(local?.instagram   || '')
  const [horario,       setHorario]       = useState(local?.horario     || 'Lunes a Viernes, 8:00 AM - 6:00 PM')
  const [pagos,         setPagos]         = useState(local?.pagos       || ['transferencia', 'tarjeta'])

  const [servicios,     setServicios]     = useState(local?.servicios   || [
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

  const handleGuardar = async () => {
    if (!nombre.trim()) { setError(lang === 'es' ? 'El nombre es obligatorio' : 'Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      let logoURL = local?.logoURL || null
      let portadaURL = local?.portadaURL || null
      
      if (logoFile) {
        logoURL = await compressImage(logoFile, 400)
      }
      if (portadaFile) {
        portadaURL = await compressImage(portadaFile, 800)
      }

      await updateDoc(doc(db, 'locales', local.id), {
        nombre:       nombre.trim(),
        categoria:    categoria.trim(),
        descripcion:  descripcion.trim(),
        logoURL, portadaURL,
        whatsapp:     whatsapp.trim(),
        instagram:    instagram.trim(),
        horario:      horario.trim(),
        pagos:        pagos,
        servicios:    servicios.filter(s => s.nombre.trim()),
        activo:       false, // Requiere aprobación del administrador tras editar
        updatedAt:    serverTimestamp(),
      })

      // Enviar notificación al administrador
      await addDoc(collection(db, 'notificaciones'), {
        userId: 'admin',
        type: 'new_vip_local_request',
        title: '🏬 TIENDA VIP ACTUALIZADA',
        text: `El profesional ${local.proNombre || 'Un VIP'} ha actualizado su tienda VIP "${nombre.trim()}". Requiere aprobación.`,
        read: false,
        createdAt: serverTimestamp(),
        date: new Date().toISOString()
      })

      alert(lang === 'es'
        ? "¡Tus cambios han sido guardados! Tu tienda VIP estará temporalmente en revisión por la Central de Mando antes de publicarse de nuevo."
        : "Your changes have been saved! Your VIP shop will undergo admin review before being published again."
      )

      navigate('profile')
    } catch (e) {
      console.error('Error editando local:', e)
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
            <span style={{ fontSize: 24 }}>✏️</span>
            <h1>{lang === 'es' ? 'Editar mi Local VIP' : 'Edit my VIP Shop'}</h1>
          </div>
        </div>
        <p className="crear-local-header-sub">
          {lang === 'es' ? 'Actualiza los datos y catálogo de tu escaparate.' : 'Update the data and catalog of your storefront.'}
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
                
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <label className="cl-service-photo-upload" style={{
                    width: 70, height: 70, borderRadius: 10, border: '2px dashed #555',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.02)', position: 'relative'
                  }}>
                    {srv.fotoURL ? (
                      <img src={srv.fotoURL} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Srv" />
                    ) : (
                      <div style={{ textAlign: 'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
                        <span style={{ fontSize: 16 }}>📷</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#888', marginTop: 2 }}>Foto</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files[0]
                        if (file) {
                          try {
                            const base64 = await compressImage(file, 400)
                            updateServicio(idx, 'fotoURL', base64)
                          } catch (err) { console.error(err) }
                        }
                      }}
                    />
                  </label>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <input className="crear-local-input slim" placeholder="Nombre del producto/servicio" value={srv.nombre} onChange={e => updateServicio(idx, 'nombre', e.target.value)} />
                    <input className="crear-local-input slim text-sm" placeholder="Descripción breve (opcional)" value={srv.descripcion} onChange={e => updateServicio(idx, 'descripcion', e.target.value)} />
                  </div>
                </div>

                <div className="cls-ico-scroll" style={{ marginTop: 4 }}>
                  {ICONOS_SERVICIOS.map(ico => (
                    <button key={ico} className={`cls-ico-btn ${srv.icono === ico ? 'active' : ''}`} onClick={() => updateServicio(idx, 'icono', ico)}>{ico}</button>
                  ))}
                </div>
                
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
          {saving ? '⏳ Guardando...' : '💾 Guardar cambios'}
        </button>
      </div>
      <div style={{ height: 60 }} />
    </div>
  )
}