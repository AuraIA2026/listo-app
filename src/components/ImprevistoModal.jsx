import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'
import './ImprevistoModal.css'

export default function ImprevistoModal({ lang = 'es', onClose, orderInfo, proName }) {
  const [reason, setReason] = useState('delay')
  const [comments, setComments] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const user = auth.currentUser
      await addDoc(collection(db, 'support_tickets'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || '',
        orderId: orderInfo?.id || 'direct_tracking',
        proName: proName || 'Profesional',
        reason,
        comments: comments.trim(),
        priority: 'URGENTE_24H',
        status: 'open',
        createdAt: serverTimestamp(),
      })

      // Notificación de confirmación al usuario
      if (user?.uid) {
        await addDoc(collection(db, 'notificaciones'), {
          userId: user.uid,
          type: 'support_ticket_created',
          title: lang === 'es' ? '🚨 Reporte de Imprevisto Recibido' : '🚨 Incident Report Received',
          text: lang === 'es'
            ? 'El equipo de Soporte y Garantía Listo Patrón ha recibido tu alerta 24/7. Te contactaremos de inmediato.'
            : 'Listo Patrón 24/7 Support has received your alert. We will contact you immediately.',
          read: false,
          icon: '🛡️',
          createdAt: serverTimestamp(),
        })
      }

      setSubmitting(false)
      setSubmitted(true)
    } catch (err) {
      console.error('Error reportando imprevisto:', err)
      setSubmitting(false)
      alert(lang === 'es' ? 'Ocurrió un error al enviar el reporte. Por favor llama al soporte directo.' : 'Error sending report. Please call direct support.')
    }
  }

  const handleWhatsAppClick = () => {
    const text = encodeURIComponent(
      `🚨 *ASISTENCIA DE EMERGENCIA 24/7 - LISTO PATRÓN*\n` +
      `Hola equipo de Soporte, necesito asistencia inmediata durante mi servicio con ${proName || 'el profesional'}.\n` +
      `Orden ID: ${orderInfo?.id || 'Activa'}`
    )
    window.open(`https://wa.me/18099090455?text=${text}`, '_blank')
  }

  return (
    <div className="imprevisto-overlay" onClick={onClose}>
      <div className="imprevisto-content" onClick={(e) => e.stopPropagation()}>
        <button className="imprevisto-close" onClick={onClose}>✕</button>

        {!submitted ? (
          <>
            <div className="imprevisto-header">
              <div className="imprevisto-shield-icon">🛡️</div>
              <div>
                <h3 className="imprevisto-title">
                  {lang === 'es' ? 'Protocolo de Imprevistos y Seguridad 24/7' : '24/7 Safety & Incident Protocol'}
                </h3>
                <p className="imprevisto-sub">
                  {lang === 'es' ? 'Garantía Listo Patrón para tu tranquilidad' : 'Listo Patrón Guarantee for your peace of mind'}
                </p>
              </div>
            </div>

            {/* Accesos rápidos de contacto directo */}
            <div className="imprevisto-actions-grid">
              <button 
                type="button" 
                className="imprevisto-act-btn whatsapp"
                onClick={handleWhatsAppClick}
              >
                <span className="act-icon">💬</span>
                <div>
                  <strong>{lang === 'es' ? 'WhatsApp Directo 24/7' : '24/7 Direct WhatsApp'}</strong>
                  <span className="act-sub">+1 (809) 909-0455</span>
                </div>
              </button>

              <a 
                href="tel:+18099090455" 
                className="imprevisto-act-btn phone"
              >
                <span className="act-icon">📞</span>
                <div>
                  <strong>{lang === 'es' ? 'Soporte Listo Patrón 24/7' : 'Listo Patrón 24/7 Support'}</strong>
                  <span className="act-sub">+1 (809) 909-0455</span>
                </div>
              </a>

              <a 
                href="tel:911" 
                className="imprevisto-act-btn emergency911"
              >
                <span className="act-icon">🚨</span>
                <div>
                  <strong>{lang === 'es' ? 'Emergencias Nacionales (911)' : 'National Emergency (911)'}</strong>
                  <span className="act-sub">{lang === 'es' ? 'Llamada directa de auxilio policial/médico' : 'Direct emergency dispatch call'}</span>
                </div>
              </a>
            </div>

            <div className="imprevisto-divider">
              <span>{lang === 'es' ? 'o reporta el problema en la app' : 'or report issue in app'}</span>
            </div>

            <form onSubmit={handleSubmit} className="imprevisto-form">
              <div className="imprevisto-group">
                <label className="imprevisto-label">
                  ⚠️ {lang === 'es' ? '¿Cuál es la situación?' : 'What is the situation?'}
                </label>
                <select 
                  className="imprevisto-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  <option value="delay">{lang === 'es' ? 'El profesional tardó demasiado o no responde' : 'Professional is delayed or unresponsive'}</option>
                  <option value="price_change">{lang === 'es' ? 'Discrepancia con el precio acordado en RD$' : 'Discrepancy with agreed price in RD$'}</option>
                  <option value="incomplete">{lang === 'es' ? 'El trabajo no se está realizando según lo acordado' : 'Work is not being done as agreed'}</option>
                  <option value="damage">{lang === 'es' ? 'Ocurrió un imprevisto / daño accidental en el lugar' : 'Accidental damage occurred on site'}</option>
                  <option value="behavior">{lang === 'es' ? 'Inconformidad con el comportamiento del profesional' : 'Unsatisfactory professional behavior'}</option>
                </select>
              </div>

              <div className="imprevisto-group">
                <label className="imprevisto-label">
                  📝 {lang === 'es' ? 'Comentarios adicionales' : 'Additional comments'}
                </label>
                <textarea
                  className="imprevisto-textarea"
                  rows={3}
                  placeholder={lang === 'es' ? 'Describe brevemente lo sucedido...' : 'Briefly describe what happened...'}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="imprevisto-submit-btn"
                disabled={submitting}
              >
                {submitting ? (
                  lang === 'es' ? 'Enviando Alerta...' : 'Sending Alert...'
                ) : (
                  lang === 'es' ? '🚨 Enviar Alerta de Emergencia 24/7' : '🚨 Send 24/7 Emergency Alert'
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="imprevisto-success-screen fade-in">
            <div className="imprevisto-success-icon">🛡️</div>
            <h3 className="imprevisto-success-title">
              {lang === 'es' ? '¡Alerta de Seguridad Registrada!' : 'Safety Alert Registered!'}
            </h3>
            <p className="imprevisto-success-desc">
              {lang === 'es'
                ? 'Un agente de nuestro equipo de supervisión 24/7 ha sido asignado a tu caso. Se comunicará contigo por teléfono o chat en los próximos 3 a 5 minutos.'
                : 'A 24/7 support agent has been assigned to your case. They will contact you within 3 to 5 minutes.'}
            </p>
            <button className="imprevisto-finish-btn" onClick={onClose}>
              {lang === 'es' ? 'Entendido' : 'Got it'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
