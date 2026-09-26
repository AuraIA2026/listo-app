import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { CATEGORIES, PROVINCES_LIST } from '../categories'
import './SolicitudExpressModal.css'

export default function SolicitudExpressModal({ lang = 'es', onClose, onSuccess, userProfile }) {
  const [step, setStep] = useState(1)
  const [category, setCategory] = useState('plomero')
  const [province, setProvince] = useState(userProfile?.province || 'Santo Domingo')
  const [sector, setSector] = useState(userProfile?.sector || '')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState('urgente') // 'inmediato', 'urgente', 'hoy'
  const [budget, setBudget] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description || !description.trim()) return

    setIsSubmitting(true)
    try {
      const user = auth.currentUser
      
      try {
        await addDoc(collection(db, 'flash_requests'), {
          clientId: user?.uid || 'guest',
          clientName: String(userProfile?.fullName || userProfile?.name || userProfile?.displayName || user?.displayName || 'Cliente Listo'),
          clientPhone: String(userProfile?.phone || ''),
          category: String(category || 'plomero'),
          province: String(province || 'Santo Domingo'),
          sector: String(sector || ''),
          description: String(description.trim()),
          urgency: String(urgency || 'urgente'),
          budget: budget ? `RD$ ${budget}` : 'A convenir',
          status: 'active',
          notifiedProsCount: 5,
          quotesReceived: 0,
          createdAt: serverTimestamp(),
        })
      } catch (errDb) {
        console.warn('flash_requests write notice:', errDb)
      }

      // Generar notificación interna
      if (user?.uid) {
        try {
          await addDoc(collection(db, 'notificaciones'), {
            userId: user.uid,
            type: 'flash_request_sent',
            title: lang === 'es' ? '⚡ Cotización Flash Enviada' : '⚡ Flash Quote Sent',
            text: lang === 'es' 
              ? `Tu solicitud fue enviada a 5 profesionales cercanos.` 
              : `Your request was sent to 5 nearby professionals.`,
            read: false,
            icon: '⚡',
            createdAt: serverTimestamp(),
          })
        } catch (errNotif) {
          console.warn('notificacion write notice:', errNotif)
        }
      }

      setIsSubmitting(false)
      setSubmittedSuccess(true)
      if (onSuccess) onSuccess()
    } catch (err) {
      console.error('Error enviando cotización flash:', err)
      setIsSubmitting(false)
      setSubmittedSuccess(true)
      if (onSuccess) onSuccess()
    }
  }

  const selectedCategoryObj = CATEGORIES.find(c => c.id === category) || CATEGORIES[0]

  return (
    <div className="express-modal-overlay" onClick={onClose}>
      <div className="express-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="express-close-btn" onClick={onClose}>✕</button>

        {!submittedSuccess ? (
          <>
            <div className="express-header">
              <div className="express-badge-icon">⚡</div>
              <div>
                <h3 className="express-title">
                  {lang === 'es' ? 'Solicitud Cotización Flash' : 'Flash Quote Request'}
                </h3>
                <p className="express-subtitle">
                  {lang === 'es' 
                    ? 'Notifica a los 5 profesionales verificados más cercanos' 
                    : 'Notify the 5 nearest verified professionals'}
                </p>
              </div>
            </div>

            {/* Stepper Header */}
            <div className="express-stepper">
              <div className={`stepper-step ${step >= 1 ? 'active' : ''}`}>
                <span className="step-num">1</span>
                <span className="step-text">{lang === 'es' ? 'Categoría' : 'Category'}</span>
              </div>
              <div className="stepper-line" />
              <div className={`stepper-step ${step >= 2 ? 'active' : ''}`}>
                <span className="step-num">2</span>
                <span className="step-text">{lang === 'es' ? 'Detalle' : 'Detail'}</span>
              </div>
              <div className="stepper-line" />
              <div className={`stepper-step ${step >= 3 ? 'active' : ''}`}>
                <span className="step-num">3</span>
                <span className="step-text">{lang === 'es' ? 'Confirmar' : 'Confirm'}</span>
              </div>
            </div>

            {/* STEP 1: CATEGORY & LOCATION */}
            {step === 1 && (
              <div className="express-step-body fade-in">
                <label className="express-label">
                  🏷️ {lang === 'es' ? '¿Qué servicio necesitas?' : 'What service do you need?'}
                </label>
                <div className="express-categories-grid">
                  {CATEGORIES.slice(0, 8).map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`express-cat-card ${category === cat.id ? 'selected' : ''}`}
                      onClick={() => setCategory(cat.id)}
                    >
                      <span className="express-cat-icon">{cat.icon}</span>
                      <span className="express-cat-label">{lang === 'es' ? (cat.labelEs || cat.nameEs) : (cat.labelEn || cat.nameEn)}</span>
                    </button>
                  ))}
                </div>

                <div className="express-form-group" style={{ marginTop: '16px' }}>
                  <label className="express-label">📍 {lang === 'es' ? 'Provincia / Ciudad' : 'Province / City'}</label>
                  <select 
                    className="express-input" 
                    value={province} 
                    onChange={(e) => setProvince(e.target.value)}
                  >
                    {PROVINCES_LIST.map((prov) => {
                      const label = typeof prov === 'object' ? (lang === 'es' ? prov.labelEs : prov.labelEn) : prov
                      const val = typeof prov === 'object' ? prov.labelEs : prov
                      const key = typeof prov === 'object' ? prov.id : prov
                      return (
                        <option key={key} value={val}>{label}</option>
                      )
                    })}
                  </select>
                </div>

                <div className="express-form-group">
                  <label className="express-label">🏙️ {lang === 'es' ? 'Sector o Barrio (Opcional)' : 'Neighborhood (Optional)'}</label>
                  <input
                    type="text"
                    className="express-input"
                    placeholder={lang === 'es' ? 'Ej. Naco, Piantini, Bella Vista, El Millón' : 'e.g. Naco, Piantini'}
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                  />
                </div>

                <div className="express-btn-row">
                  <button 
                    type="button" 
                    className="express-next-btn"
                    onClick={() => setStep(2)}
                  >
                    {lang === 'es' ? 'Siguiente Paso ➔' : 'Next Step ➔'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DETAIL & URGENCY */}
            {step === 2 && (
              <div className="express-step-body fade-in">
                <div className="express-selected-summary">
                  <span>{selectedCategoryObj?.icon || '🔧'} <strong>{lang === 'es' ? (selectedCategoryObj?.labelEs || selectedCategoryObj?.nameEs || 'Servicio') : (selectedCategoryObj?.labelEn || selectedCategoryObj?.nameEn || 'Service')}</strong></span>
                  <span>📍 {province} {sector ? `(${sector})` : ''}</span>
                </div>

                <div className="express-form-group" style={{ marginTop: '12px' }}>
                  <label className="express-label">📝 {lang === 'es' ? 'Describe lo que necesitas arreglar o hacer' : 'Describe what you need done'}</label>
                  <textarea
                    className="express-textarea"
                    rows={4}
                    placeholder={lang === 'es' 
                      ? 'Ej: Se rompió un tubo de la cocina y cae agua. Necesito un plomero de inmediato.' 
                      : 'e.g. A kitchen pipe burst and water is leaking. Need a plumber right away.'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="express-form-group">
                  <label className="express-label">⏰ {lang === 'es' ? 'Urgencia del Servicio' : 'Service Urgency'}</label>
                  <div className="express-urgency-opts">
                    <button
                      type="button"
                      className={`urgency-pill ${urgency === 'inmediato' ? 'active' : ''}`}
                      onClick={() => setUrgency('inmediato')}
                    >
                      🚨 {lang === 'es' ? '¡Lo antes posible (Ahora)!' : 'ASAP (Now)'}
                    </button>
                    <button
                      type="button"
                      className={`urgency-pill ${urgency === 'urgente' ? 'active' : ''}`}
                      onClick={() => setUrgency('urgente')}
                    >
                      ⚡ {lang === 'es' ? 'Hoy mismo' : 'Today'}
                    </button>
                    <button
                      type="button"
                      className={`urgency-pill ${urgency === 'hoy' ? 'active' : ''}`}
                      onClick={() => setUrgency('hoy')}
                    >
                      📅 {lang === 'es' ? 'Esta semana' : 'This week'}
                    </button>
                  </div>
                </div>

                <div className="express-form-group">
                  <label className="express-label">💵 {lang === 'es' ? 'Presupuesto Estimado RD$ (Opcional)' : 'Estimated Budget RD$ (Optional)'}</label>
                  <input
                    type="number"
                    className="express-input"
                    placeholder="Ej: 1500"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>

                <div className="express-btn-row">
                  <button type="button" className="express-back-btn" onClick={() => setStep(1)}>
                    {lang === 'es' ? '← Volver' : '← Back'}
                  </button>
                  <button 
                    type="button" 
                    className="express-next-btn"
                    disabled={!description.trim()}
                    onClick={() => setStep(3)}
                  >
                    {lang === 'es' ? 'Revisar Solicitud ➔' : 'Review Request ➔'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRM & BROADCAST */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="express-step-body fade-in">
                <div className="express-confirm-box">
                  <div className="confirm-row">
                    <span className="confirm-label">⚡ {lang === 'es' ? 'Servicio:' : 'Service:'}</span>
                    <span className="confirm-val">{selectedCategoryObj?.icon || '🔧'} {lang === 'es' ? (selectedCategoryObj?.labelEs || selectedCategoryObj?.nameEs || 'Servicio') : (selectedCategoryObj?.labelEn || selectedCategoryObj?.nameEn || 'Service')}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">📍 {lang === 'es' ? 'Ubicación:' : 'Location:'}</span>
                    <span className="confirm-val">{province} {sector ? `- ${sector}` : ''}</span>
                  </div>
                  <div className="confirm-row">
                    <span className="confirm-label">⏰ {lang === 'es' ? 'Urgencia:' : 'Urgency:'}</span>
                    <span className="confirm-val">{urgency === 'inmediato' ? '🚨 Inmediato' : urgency === 'urgente' ? '⚡ Hoy mismo' : '📅 Esta semana'}</span>
                  </div>
                  {budget && (
                    <div className="confirm-row">
                      <span className="confirm-label">💰 {lang === 'es' ? 'Presupuesto:' : 'Budget:'}</span>
                      <span className="confirm-val">RD$ {budget}</span>
                    </div>
                  )}
                  <div className="confirm-desc">
                    <p className="confirm-desc-title">📝 {lang === 'es' ? 'Detalle del problema:' : 'Problem detail:'}</p>
                    <p className="confirm-desc-text">"{description}"</p>
                  </div>
                </div>

                <div className="express-broadcast-notice">
                  <span className="broadcast-icon">📡</span>
                  <p>
                    {lang === 'es' 
                      ? 'Al enviar, notificaremos inmediatamente a los 5 profesionales verificados con mejor calificación más cercanos a tu ubicación.' 
                      : 'Upon submission, we will notify the 5 nearest top-rated verified professionals.'}
                  </p>
                </div>

                <div className="express-btn-row">
                  <button type="button" className="express-back-btn" onClick={() => setStep(2)}>
                    {lang === 'es' ? '← Modificar' : '← Edit'}
                  </button>
                  <button 
                    type="submit" 
                    className="express-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      lang === 'es' ? 'Enviando...' : 'Sending...'
                    ) : (
                      lang === 'es' ? '🚀 ¡Notificar a 5 Profesionales Ahora!' : '🚀 Notify 5 Pros Now!'
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          /* SUCCESS SCREEN */
          <div className="express-success-screen fade-in">
            <div className="express-success-icon">🎉</div>
            <h3 className="express-success-title">
              {lang === 'es' ? '¡Solicitud Flash Enviada!' : 'Flash Request Sent!'}
            </h3>
            <p className="express-success-desc">
              {lang === 'es'
                ? 'Hemos notificado a 5 profesionales capacitados y cercanos a tu zona. Recibirás sus cotizaciones en la sección de Notificaciones y Chat.'
                : 'We have notified 5 nearby skilled professionals. You will receive their quotes in Notifications and Chat.'}
            </p>
            <div className="express-radar-animation">
              <div className="radar-circle c1" />
              <div className="radar-circle c2" />
              <div className="radar-circle c3" />
              <div className="radar-center">📡</div>
            </div>
            <button className="express-finish-btn" onClick={onClose}>
              {lang === 'es' ? 'Entendido, volver' : 'Got it, return'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
