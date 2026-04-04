import { useState, useRef, useEffect } from 'react'
import { db, auth } from '../firebase'
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { deleteUser } from 'firebase/auth'
import { useUserData } from '../useUserData'
import './ProfilePage.css'
import VerificacionPage    from './VerificacionPage'
import RegistroClientePage from './RegistroClientePage'
import PlanesPage          from './PlanesPage'

const txt = {
  es: {
    orders: 'pedidos', rating: 'calificación', memberSince: 'Miembro desde', contracts: 'contratos',
    favTitle: 'Favoritos', favEmpty: 'Aún no tienes favoritos', favSub: 'Guarda tus profesionales favoritos aquí',
    notifTitle: 'Notificaciones', notifOrders: 'Pedidos y reservas', notifPromos: 'Promociones y ofertas',
    notifNews: 'Novedades de la app', notifReminders: 'Recordatorios',
    langTitle: 'Idioma', langSub: 'Selecciona tu idioma preferido',
    privTitle: 'Privacidad', privProfile: 'Perfil público', privProfileSub: 'Otros usuarios pueden ver tu perfil',
    privLocation: 'Compartir ubicación', privLocationSub: 'Para mostrarte profesionales cercanos',
    privData: 'Compartir datos de uso', privDataSub: 'Ayúdanos a mejorar la app',
    helpTitle: 'Ayuda y soporte', helpFaq: 'Preguntas frecuentes', helpChat: 'Chatear con soporte',
    helpEmail: 'Enviar correo', helpPhone: 'Llamar al soporte',
    helpFaqSub: 'Respuestas a las dudas más comunes', helpChatSub: 'Tiempo de respuesta: ~5 minutos',
    helpEmailSub: 'listopatron.app@gmail.com', helpPhoneSub: '+1 (809) 909-0455',
    rateTitle: '¿Te gusta Listo?', rateSub: 'Tu opinión nos ayuda a mejorar',
    rateComment: 'Déjanos un comentario (opcional)', rateSubmit: 'Enviar calificación',
    rateThanks: '¡Gracias por tu calificación!', rateThanksub: 'Tu opinión es muy importante para nosotros 🙌',
    logoutTitle: 'Cerrar sesión', logoutConfirm: '¿Seguro que quieres cerrar sesión?',
    logoutYes: 'Sí, cerrar sesión', logoutNo: 'Cancelar', logout: 'Cerrar sesión',
    deleteTitle: 'Eliminar cuenta', deleteConfirm: '¿Estás completamente seguro? Esta acción es irreversible y tu información será eliminada de nuestros servidores.', deleteYes: 'Sí, eliminar permanentemente', deleteNo: 'Mantener cuenta',
    photoTitle: 'Foto de perfil', photoGallery: '📷 Elegir de galería', photoCamera: '🤳 Tomar foto',
    photoCancel: 'Cancelar', photoSaved: '¡Foto actualizada!', photoError: 'Error al guardar. Intenta de nuevo.',
    termsTitle: 'Términos y Condiciones', termsLastUpdate: 'Última actualización: 1 de marzo de 2026',
    privacyDocTitle: 'Política de Privacidad', privacyDocLastUpdate: 'Última actualización: 1 de marzo de 2026',
    terms: [
      { title: '1. Naturaleza del Servicio', body: 'Listo Patrón es una plataforma tecnológica de intermediación digital que conecta usuarios con profesionales independientes.\n\nLa plataforma no participa en la ejecución de los servicios ofrecidos ni en los acuerdos comerciales entre las partes.\n\nEl profesional reconoce que actúa de manera independiente, sin que exista relación laboral, sociedad o representación con la plataforma.\n\nEl acuerdo de servicio, precios y condiciones son responsabilidad exclusiva entre el profesional y el usuario.\n\nEste acuerdo se rige por las leyes de la República Dominicana.' },
      { title: '2. Modelo de Uso y Planes', body: 'Para utilizar la plataforma, el profesional deberá adquirir uno de los planes disponibles dentro de la aplicación.\n\nCada plan otorga una cantidad específica de servicios, contactos o contratos que el profesional podrá gestionar dentro de la plataforma.\n\nUna vez consumidos los beneficios del plan, el profesional deberá adquirir uno nuevo para continuar utilizando la plataforma.\n\nLos pagos de los planes deberán realizarse exclusivamente mediante métodos digitales habilitados por la plataforma (transferencia o tarjeta). No se aceptan pagos en efectivo para la compra de planes.\n\nLa plataforma podrá modificar los planes, precios y beneficios notificando previamente dentro de la aplicación.' },
      { title: '3. Pagos por Servicios', body: 'Los pagos por los servicios realizados podrán efectuarse mediante:\n\n- Efectivo\n- Transferencia bancaria\n- Tarjeta (a través de la plataforma)\n\nCuando el pago se realice con tarjeta dentro de la aplicación, la plataforma actuará como facilitador del procesamiento del pago y podrá gestionar temporalmente los fondos antes de transferirlos al profesional.\n\nEn pagos realizados fuera de la plataforma (efectivo o transferencia directa), la plataforma no interviene en la transacción.' },
      { title: '4. Responsabilidad del Profesional', body: 'El profesional es el único responsable por:\n- La calidad del servicio prestado\n- El cumplimiento de los acuerdos con el usuario\n- La veracidad de la información proporcionada\n- Su comportamiento dentro y fuera de la plataforma' },
      { title: '5. Sistema Disciplinario', body: 'Se consideran faltas graves:\n- Proporcionar información falsa\n- Conducta inapropiada hacia usuarios\n- Uso indebido de la plataforma\n- Actividades ilegales o fraudulentas\n\nPenalizaciones:\n- Primer strike: Advertencia formal\n- Segundo strike: Suspensión temporal\n- Tercer strike: Cancelación permanente e irreversible\n\nEn casos graves, la cancelación podrá ser inmediata sin previo aviso.' },
      { title: '6. Protección de Datos', body: 'El profesional autoriza el tratamiento de sus datos conforme a la Ley 172-13 sobre Protección de Datos de la República Dominicana.' },
      { title: '7. Limitación de Responsabilidad', body: 'Listo Patrón no garantiza ingresos, cantidad de clientes ni volumen de trabajo.\n\nLa plataforma no es responsable por:\n- Disputas entre usuario y profesional\n- Incumplimientos de acuerdos\n- Resultados del servicio prestado' },
      { title: '8. Resolución de Conflictos', body: 'Cualquier conflicto entre el profesional y el usuario deberá resolverse directamente entre ambas partes.\n\nLa plataforma podrá facilitar canales de comunicación sin asumir responsabilidad en la resolución.' },
      { title: '9. Fuerza Mayor', body: 'La plataforma no será responsable por interrupciones causadas por fallos técnicos, desastres naturales, decisiones gubernamentales o situaciones fuera de su control.' },
      { title: '10. Aceptación', body: 'El uso de la plataforma implica la aceptación total de estos términos y condiciones.' },
    ],
    termsUser: [
      { title: '1. Bienvenido', body: 'Gracias por usar Listo Patrón. Nuestra plataforma conecta usuarios con profesionales independientes que ofrecen servicios.\n\nAl utilizar la aplicación, aceptas estos términos y condiciones.' },
      { title: '2. Naturaleza del Servicio', body: 'Listo Patrón actúa exclusivamente como intermediario tecnológico entre usuarios y profesionales independientes.\n\nLos profesionales son responsables de la ejecución, calidad, precios y condiciones del servicio.\n\nLa plataforma no participa directamente en la prestación del servicio.' },
      { title: '3. Pagos', body: 'Los pagos por los servicios podrán realizarse mediante:\n\n💵 Efectivo\n\n🏦 Transferencia bancaria\n\n💳 Tarjeta (a través de la aplicación)\n\nCuando el pago se realice con tarjeta dentro de la aplicación, este será procesado mediante herramientas tecnológicas que permiten transferir el pago directamente al profesional.\n\nLa plataforma no retiene, administra ni gestiona fondos en ningún momento.\n\nEn pagos realizados en efectivo o transferencia directa, la plataforma no interviene en la transacción.' },
      { title: '4. Registro y Cuenta', body: 'El usuario debe proporcionar información veraz y actualizada.\n\nEs responsable del uso de su cuenta y de mantener la confidencialidad de sus datos.\n\nLa plataforma podrá suspender cuentas en caso de uso indebido.' },
      { title: '5. Solicitud de Servicios', body: 'El usuario es responsable de:\n\n- Describir correctamente el servicio requerido\n- Acordar detalles con el profesional\n- Verificar condiciones antes de aceptar el servicio\n\nSe recomienda mantener la comunicación dentro de la aplicación.' },
      { title: '6. Cancelaciones', body: 'El usuario podrá cancelar un servicio.\n\nLas condiciones de cancelación podrán ser acordadas directamente con el profesional.\n\nEn servicios pagados con tarjeta dentro de la aplicación, podrán aplicarse condiciones técnicas del proveedor de pago.\n\nCancelaciones abusivas podrán generar restricciones en el uso de la plataforma.' },
      { title: '7. Conducta', body: 'El usuario se compromete a:\n\n- Tratar con respeto a los profesionales\n- No realizar actividades ilegales\n- No utilizar la plataforma de forma indebida\n\nEl incumplimiento podrá resultar en suspensión de la cuenta.' },
      { title: '8. Protección de Datos', body: 'Los datos serán tratados conforme a la Ley 172-13 sobre Protección de Datos de la República Dominicana.' },
      { title: '9. Limitación de Responsabilidad', body: 'Listo Patrón no garantiza resultados ni la calidad del servicio.\n\nLa plataforma no es responsable por:\n\n- La ejecución del trabajo por parte del profesional\n- Acuerdos realizados fuera de la aplicación\n- Incumplimientos entre las partes\n- Transacciones realizadas entre usuario y profesional\n\nEn pagos con tarjeta, la responsabilidad de la plataforma se limita a facilitar la conexión tecnológica con el proveedor de pago.' },
      { title: '10. Resolución de Conflictos', body: 'Los conflictos entre usuario y profesional deberán resolverse directamente entre ambas partes.\n\nLa plataforma podrá facilitar comunicación sin asumir responsabilidad en la resolución.' },
      { title: '11. Modificaciones', body: 'Listo Patrón podrá modificar estos términos en cualquier momento.\n\nEl uso continuo de la plataforma implica la aceptación de los cambios.' },
      { title: '12. Aceptación', body: 'Al registrarte y utilizar la aplicación, confirmas que has leído y aceptado estos términos y condiciones.' },
    ],
  },
  en: {
    orders: 'orders', rating: 'rating', memberSince: 'Member since', contracts: 'contracts',
    favTitle: 'Favorites', favEmpty: 'No favorites yet', favSub: 'Save your favorite professionals here',
    notifTitle: 'Notifications', notifOrders: 'Orders & bookings', notifPromos: 'Promotions & offers',
    notifNews: 'App updates', notifReminders: 'Reminders',
    langTitle: 'Language', langSub: 'Select your preferred language',
    privTitle: 'Privacy', privProfile: 'Public profile', privProfileSub: 'Other users can see your profile',
    privLocation: 'Share location', privLocationSub: 'To show nearby professionals',
    privData: 'Share usage data', privDataSub: 'Help us improve the app',
    helpTitle: 'Help & support', helpFaq: 'FAQ', helpChat: 'Chat with support',
    helpEmail: 'Send email', helpPhone: 'Call support',
    helpFaqSub: 'Answers to common questions', helpChatSub: 'Response time: ~5 minutes',
    helpEmailSub: 'listopatron.app@gmail.com', helpPhoneSub: '+1 (809) 909-0455',
    rateTitle: 'Do you like Listo?', rateSub: 'Your feedback helps us improve',
    rateComment: 'Leave a comment (optional)', rateSubmit: 'Submit rating',
    rateThanks: 'Thanks for your rating!', rateThanksub: 'Your feedback means a lot to us 🙌',
    logoutTitle: 'Log out', logoutConfirm: 'Are you sure you want to log out?',
    logoutYes: 'Yes, log out', logoutNo: 'Cancel', logout: 'Log out',
    deleteTitle: 'Delete account', deleteConfirm: 'Are you absolutely sure? This action is irreversible and your data will be wiped from our servers.', deleteYes: 'Yes, permanently delete', deleteNo: 'Keep account',
    photoTitle: 'Profile photo', photoGallery: '📷 Choose from gallery', photoCamera: '🤳 Take photo',
    photoCancel: 'Cancel', photoSaved: 'Photo updated!', photoError: 'Error saving. Please try again.',
    termsTitle: 'Terms & Conditions', termsLastUpdate: 'Last updated: March 1, 2026',
    privacyDocTitle: 'Privacy Policy', privacyDocLastUpdate: 'Last updated: March 1, 2026',
    terms: [{ title: '1. Legal Nature', body: 'Listo Patrón is a digital intermediation platform.' }],
    termsUser: [{ title: '1. Welcome', body: 'Thank you for using Listo Patrón.' }],
  }
}

const menuItems = [
  { icon: '🛡️', labelEs: 'Verificación Profesional',  labelEn: 'Professional Verification', action: 'verification' },
  { icon: '📋', labelEs: 'Mis pedidos',                labelEn: 'My orders',                 action: 'orders' },
  { icon: '❤️', labelEs: 'Favoritos',                  labelEn: 'Favorites',                 action: 'favorites' },
  { icon: '🔔', labelEs: 'Notificaciones',             labelEn: 'Notifications',             action: 'notifications' },
  { icon: '🌐', labelEs: 'Idioma',                     labelEn: 'Language',                  action: 'language' },
  { icon: '🔒', labelEs: 'Privacidad',                 labelEn: 'Privacy',                   action: 'privacy' },
  { icon: '❓', labelEs: 'Ayuda y soporte',            labelEn: 'Help & support',            action: 'help' },
  { icon: '⭐', labelEs: 'Calificar la app',           labelEn: 'Rate the app',              action: 'rate' },
  { icon: '📄', labelEs: 'Términos y Condiciones',     labelEn: 'Terms & Conditions',        action: 'terms' },
  { icon: '🛡️', labelEs: 'Política de Privacidad',     labelEn: 'Privacy Policy',            action: 'privacyDoc' },
]

const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 400
      let { width, height } = img
      if (width > height) { if (width > MAX) { height = Math.round(height * MAX / width); width = MAX } }
      else { if (height > MAX) { width = Math.round(width * MAX / height); height = MAX } }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = reject; img.src = e.target.result
  }
  reader.onerror = reject; reader.readAsDataURL(file)
})

function ScreenHeader({ title, onBack }) {
  return (
    <div className="screen-header">
      <button className="screen-back" onClick={onBack}>‹</button>
      <h2 className="screen-title">{title}</h2>
      <div style={{ width: 36 }} />
    </div>
  )
}

function Toggle({ checked, onChange }) {
  return (
    <button className={`toggle${checked ? ' on' : ''}`} onClick={() => onChange(!checked)}>
      <span className="toggle-knob" />
    </button>
  )
}

function FavoritosScreen({ lang, onBack }) {
  const T = txt[lang]
  return (
    <div className="sub-screen">
      <ScreenHeader title={T.favTitle} onBack={onBack} />
      <div className="empty-state">
        <span className="empty-icon">❤️</span>
        <p className="empty-title">{T.favEmpty}</p>
        <p className="empty-sub">{T.favSub}</p>
      </div>
    </div>
  )
}

function NotificacionesScreen({ lang, onBack }) {
  const T = txt[lang]
  const [notifs, setNotifs] = useState({ orders: true, promos: false, news: true, reminders: true })
  const items = [
    { key: 'orders', icon: '📦', label: T.notifOrders },
    { key: 'promos', icon: '🎉', label: T.notifPromos },
    { key: 'news',   icon: '📱', label: T.notifNews },
    { key: 'reminders', icon: '⏰', label: T.notifReminders },
  ]
  return (
    <div className="sub-screen">
      <ScreenHeader title={T.notifTitle} onBack={onBack} />
      <div className="settings-list">
        {items.map(item => (
          <div key={item.key} className="settings-row">
            <span className="settings-icon">{item.icon}</span>
            <span className="settings-label">{item.label}</span>
            <Toggle checked={notifs[item.key]} onChange={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key] }))} />
          </div>
        ))}
      </div>
    </div>
  )
}

function IdiomaScreen({ lang, setLang, onBack }) {
  const T = txt[lang]
  return (
    <div className="sub-screen">
      <ScreenHeader title={T.langTitle} onBack={onBack} />
      <p className="screen-sub">{T.langSub}</p>
      <div className="settings-list">
        {[{ code: 'es', label: 'Español', flag: '🇩🇴' }, { code: 'en', label: 'English', flag: '🇺🇸' }].map(l => (
          <button key={l.code} className={`lang-option${lang === l.code ? ' selected' : ''}`} onClick={() => setLang(l.code)}>
            <span className="lang-flag">{l.flag}</span>
            <span className="lang-label">{l.label}</span>
            {lang === l.code && <span className="lang-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

function PrivacidadScreen({ lang, onBack }) {
  const T = txt[lang]
  const [priv, setPriv] = useState({ profile: true, location: true, data: false })
  const items = [
    { key: 'profile',  icon: '👤', label: T.privProfile,  sub: T.privProfileSub },
    { key: 'location', icon: '📍', label: T.privLocation, sub: T.privLocationSub },
    { key: 'data',     icon: '📊', label: T.privData,     sub: T.privDataSub },
  ]
  return (
    <div className="sub-screen">
      <ScreenHeader title={T.privTitle} onBack={onBack} />
      <div className="settings-list">
        {items.map(item => (
          <div key={item.key} className="settings-row two-line">
            <span className="settings-icon">{item.icon}</span>
            <div className="settings-text">
              <span className="settings-label">{item.label}</span>
              <span className="settings-sub">{item.sub}</span>
            </div>
            <Toggle checked={priv[item.key]} onChange={() => setPriv(p => ({ ...p, [item.key]: !p[item.key] }))} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AyudaScreen({ lang, onBack, onFaq }) {
  const T = txt[lang]
  const items = [
    { icon: '❓', label: T.helpFaq,   sub: T.helpFaqSub,   color: '#3B82F6', action: onFaq },
    { icon: '💬', label: T.helpChat,  sub: T.helpChatSub,  color: '#10B981', action: () => window.open('https://wa.me/18099090455', '_blank') },
    { icon: '📧', label: T.helpEmail, sub: T.helpEmailSub, color: '#F59E0B', action: () => { window.location.href = 'mailto:listopatron.app@gmail.com' } },
    { icon: '📞', label: T.helpPhone, sub: T.helpPhoneSub, color: '#EF4444', action: () => { window.location.href = 'tel:+18099090455' } },
  ]
  return (
    <div className="sub-screen">
      <ScreenHeader title={T.helpTitle} onBack={onBack} />
      <div className="help-list">
        {items.map((item, i) => (
          <button key={i} className="help-item" onClick={item.action}>
            <div className="help-icon-wrap" style={{ background: item.color + '18' }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
            </div>
            <div className="help-text">
              <span className="settings-label">{item.label}</span>
              <span className="settings-sub">{item.sub}</span>
            </div>
            <span className="pmi-arrow">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function FaqBotScreen({ lang, onBack }) {
  const T = txt[lang]
  const faqs = [
    { q: '¿Cómo funciona Listo?', a: 'Listo conecta a clientes que necesitan un servicio (electricistas, plomeros, mecánicos, etc.) con profesionales calificados. Tú eliges, acuerdas y nosotros garantizamos el enlace seguro.' },
    { q: '¿Cómo cancelo un servicio?', a: 'Para cancelar un servicio, ve a la pestaña "Pedidos", entra a los detalles del trabajo en curso y pulsa "Cancelar Pedido". Solo puedes cancelar antes de que el profesional inicie formalmente el trabajo para evitar penalidad.' },
    { q: '¿Cómo funcionan los planes de Profesional?', a: 'Los planes VIP y Estándar te dan "contratos" para postularte a solicitudes de clientes. Un contrato se gasta únicamente cuando el cliente acepta tu propuesta y el trabajo comienza.' },
    { q: '¿Los pagos son seguros?', a: 'Actualmente, los pagos por el servicio los gestionas directamente con el profesional. Nosotros no intervenimos en cobros de servicios, lo que te garantiza precios justos y reales.' },
    { q: '¿Cómo reporto un problema con un profesional?', a: 'Ve a "Pedidos", entra al chat con el profesional y toca el icono superior "⚠️" para Reportar o Bloquear. Nuestro equipo revisará el caso de manera manual.' },
    { q: '¿Cómo contacto a un humano de soporte?', a: 'Regresa a la pantalla anterior pulsando atrás, y luego toca en "Chatear con soporte" para comunicarte por WhatsApp con nuestro equipo directamente. O mediante el correo listopatron.app@gmail.com.' },
  ]
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="sub-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#FAFAFA' }}>
      <ScreenHeader title={T.helpFaq} onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '20px', color: '#1a1a1a' }}>💡 Dudas más comunes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', border: '1px solid #eaeaea' }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: 0 }}
              >
                <span style={{ fontSize: '15px', fontWeight: '700', color: openIndex === i ? '#F26000' : '#333', paddingRight: '14px', lineHeight: 1.4 }}>{faq.q}</span>
                <span style={{ color: '#ccc', fontSize: '24px', transition: 'transform 0.3s', transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </button>
              {openIndex === i && (
                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f0f0f0', fontSize: '14px', color: '#666', lineHeight: '1.6', animation: 'slideDown 0.3s ease' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '13px', color: '#aaa' }}>¿No encontraste lo que buscabas? <br/>¡Usa las opciones de contacto directo con nuestro equipo!</p>
      </div>
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}

function CalificarScreen({ lang, onBack }) {
  const T = txt[lang]
  const [stars,setStars]     = useState(0)
  const [hovered,setHovered] = useState(0)
  const [comment,setComment] = useState('')
  const [sent,setSent]       = useState(false)
  if (sent) return (
    <div className="sub-screen">
      <ScreenHeader title={T.rateTitle} onBack={onBack} />
      <div className="empty-state">
        <span className="empty-icon">🎉</span>
        <p className="empty-title">{T.rateThanks}</p>
        <p className="empty-sub">{T.rateThanksub}</p>
      </div>
    </div>
  )
  return (
    <div className="sub-screen">
      <ScreenHeader title={T.rateTitle} onBack={onBack} />
      <div className="rate-container">
        <p className="rate-sub">{T.rateSub}</p>
        <div className="rate-stars">
          {[1,2,3,4,5].map(n => (
            <button key={n} className={`rate-star${n<=(hovered||stars)?' lit':''}`} onMouseEnter={()=>setHovered(n)} onMouseLeave={()=>setHovered(0)} onClick={()=>setStars(n)}>★</button>
          ))}
        </div>
        <textarea className="rate-comment" placeholder={T.rateComment} value={comment} onChange={e=>setComment(e.target.value)} rows={3} />
        <button className="rate-submit" disabled={stars===0} onClick={()=>setSent(true)}>{T.rateSubmit}</button>
      </div>
    </div>
  )
}

function TermsScreen({ lang, onBack, userRole }) {
  const T = txt[lang]
  const [expanded,setExpanded] = useState(null)
  const termsList = userRole === 'pro' ? T.terms : T.termsUser
  return (
    <div className="sub-screen">
      <ScreenHeader title={T.termsTitle} onBack={onBack} />
      <div className="terms-container">
        <div className="terms-badge">
          <span>📄</span>
          <div>
            <p className="terms-badge-title">{T.termsTitle}</p>
            <p className="terms-badge-date">{T.termsLastUpdate}</p>
          </div>
        </div>
        <div className="terms-list">
          {termsList.map((item,i) => (
            <div key={i} className="terms-item">
              <button className="terms-header" onClick={()=>setExpanded(expanded===i?null:i)}>
                <span className="terms-item-title">{item.title}</span>
                <span className={`terms-arrow ${expanded===i?'open':''}`}>›</span>
              </button>
              {expanded===i && <p className="terms-body">{item.body}</p>}
            </div>
          ))}
        </div>
        <div className="terms-footer">
          <p>© 2026 Listo App. Todos los derechos reservados.</p>
          <p>legal@listo.app</p>
        </div>
      </div>
      <div style={{ height: 40 }} />
    </div>
  )
}

function PrivacyDocScreen({ lang, onBack }) {
  const T = txt[lang]
  return (
    <div className="sub-screen">
      <ScreenHeader title={T.privacyDocTitle} onBack={onBack} />
      <div className="terms-container" style={{ padding: '0 20px' }}>
        <div className="terms-badge">
          <span>🛡️</span>
          <div>
            <p className="terms-badge-title">{T.privacyDocTitle}</p>
            <p className="terms-badge-date">{T.privacyDocLastUpdate}</p>
          </div>
        </div>
        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#444', marginTop: '20px' }}>
          <p><strong>1. Recopilación de Datos</strong><br/>Recopilamos su nombre, teléfono, ubicación GPS, imágenes de su perfil y rasgos biométricos (reconocimiento facial) únicamente para la seguridad y el correcto funcionamiento de 'Listo Patrón'.</p>
          <br/>
          <p><strong>2. Uso de la Ubicación</strong><br/>La aplicación requiere acceso a su ubicación en primer y segundo plano para conectar clientes con los profesionales más cercanos y permitir el seguimiento en tiempo real del trayecto.</p>
          <br/>
          <p><strong>3. Compartir con Terceros</strong><br/>No vendemos sus datos personales a terceros. Su número y nombre solo se comparten con el profesional o cliente reservado para coordinar el trabajo.</p>
          <br/>
          <p><strong>4. Eliminación de Datos</strong><br/>Usted tiene el derecho de eliminar su cuenta y todos sus datos personales en cualquier momento desde esta misma aplicación (sección Perfil).</p>
        </div>
      </div>
    </div>
  )
}

function LogoutModal({ lang, onConfirm, onCancel }) {
  const T = txt[lang]
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <span className="modal-icon">🚪</span>
        <h3 className="modal-title">{T.logoutTitle}</h3>
        <p className="modal-sub">{T.logoutConfirm}</p>
        <button className="modal-btn danger" onClick={onConfirm}>{T.logoutYes}</button>
        <button className="modal-btn ghost" onClick={onCancel}>{T.logoutNo}</button>
      </div>
    </div>
  )
}

function EditRequestScreen({ lang, user, onBack }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    provincia: user?.provincia || '',
    municipio: user?.municipio || '',
    direccion: user?.direccion || ''
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return alert("Nombre y teléfono requeridos");
    setLoading(true);
    try {
       await addDoc(collection(db, 'profile_edit_requests'), {
          userId: user.uid,
          userName: user.name,
          requestedChanges: form,
          status: 'pending',
          createdAt: serverTimestamp(),
          type: 'data'
       });
       setDone(true);
    } catch (e) {
       console.error(e);
       alert("Error al enviar la solicitud");
    }
    setLoading(false);
  };

  if (done) {
     return (
       <div className="sub-screen" style={{display:'flex', flexDirection:'column', height:'100%'}}>
         <ScreenHeader title="Solicitud Enviada" onBack={onBack} />
         <div className="empty-state">
           <span className="empty-icon">⏳</span>
           <p className="empty-title">¡Recibido!</p>
           <p className="empty-sub">El equipo de administración revisará tus datos en un plazo de hasta 72 horas. Si todo está correcto, se actualizará tu perfil automáticamente.</p>
           <button style={{marginTop: 20, padding: '12px 24px', borderRadius: 99, background: '#F3F4F6', color: '#333', border: 'none', fontWeight: 800, cursor: 'pointer'}} onClick={onBack}>Regresar al perfil</button>
         </div>
       </div>
     );
  }

  return (
    <div className="sub-screen" style={{display:'flex', flexDirection:'column', height:'100%', background:'#FAFAFA'}}>
      <ScreenHeader title={lang==='es' ? 'Cambio de Datos' : 'Request Data Change'} onBack={onBack} />
      <div style={{flex: 1, overflowY: 'auto', padding: '20px'}}>
        <div style={{background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#92400E', lineHeight: '1.5'}}>
          💡 Por seguridad, como tu perfil ya está activo, cualquier cambio principal debe ser aprobado por la administración (demora hasta 72 horas laborales).
        </div>
        
        <div style={{marginBottom: '16px'}}>
          <label style={{fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '6px', display: 'block'}}>Nombre Completo</label>
          <input type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} style={{width:'100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none', background: '#fff'}} />
        </div>
        <div style={{marginBottom: '16px'}}>
          <label style={{fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '6px', display: 'block'}}>Número de Teléfono</label>
          <input type="text" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} style={{width:'100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none', background: '#fff'}} />
        </div>
        <div style={{display:'flex', gap:'10px', marginBottom: '16px'}}>
           <div style={{flex:1}}>
             <label style={{fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '6px', display: 'block'}}>Provincia</label>
             <input type="text" value={form.provincia} onChange={e=>setForm({...form, provincia: e.target.value})} style={{width:'100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none', background: '#fff'}} />
           </div>
           <div style={{flex:1}}>
             <label style={{fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '6px', display: 'block'}}>Municipio</label>
             <input type="text" value={form.municipio} onChange={e=>setForm({...form, municipio: e.target.value})} style={{width:'100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none', background: '#fff'}} />
           </div>
        </div>
        <div style={{marginBottom: '24px'}}>
          <label style={{fontSize: '12px', fontWeight: 700, color: '#666', marginBottom: '6px', display: 'block'}}>Dirección Exacta</label>
          <input type="text" value={form.direccion} onChange={e=>setForm({...form, direccion: e.target.value})} style={{width:'100%', padding: '14px', borderRadius: '12px', border: '1.5px solid #E5E7EB', outline: 'none', background: '#fff'}} />
        </div>

        <button 
           onClick={handleSubmit} 
           disabled={loading || (form.name===user?.name && form.phone===user?.phone && form.provincia===user?.provincia && form.municipio===user?.municipio && form.direccion===user?.direccion)}
           style={{width: '100%', background: '#F26000', color: '#fff', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: 800, opacity: loading ? 0.6 : 1, transition:'0.3s', cursor: 'pointer', boxShadow: '0 4px 14px rgba(242,96,0,0.3)'}}
        >
           {loading ? 'Enviando...' : 'Enviar Solicitud al Administrador'}
        </button>
      </div>
    </div>
  )
}

function DeleteAccountModal({ lang, onConfirm, onCancel }) {
  const T = txt[lang]
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <span className="modal-icon" style={{ background: '#FEE2E2', color: '#EF4444' }}>⚠️</span>
        <h3 className="modal-title">{T.deleteTitle}</h3>
        <p className="modal-sub">{T.deleteConfirm}</p>
        <button className="modal-btn danger" style={{ background: '#EF4444' }} onClick={onConfirm}>{T.deleteYes}</button>
        <button className="modal-btn ghost" onClick={onCancel}>{T.deleteNo}</button>
      </div>
    </div>
  )
}

export default function ProfilePage({ lang, setLang, navigate, onLogout, initialScreen }) {
  const { userData, userRole, profileComplete, getMemberSince } = useUserData()

  const [screen,      setScreen]      = useState(initialScreen || null)
  const [showLogout,  setShowLogout]  = useState(false)
  const [showDelete,  setShowDelete]  = useState(false)
  const [showPhoto,   setShowPhoto]   = useState(false)
  const [photoStatus, setPhotoStatus] = useState(null)
  const [ordersCount, setOrdersCount] = useState(0)
  const [hideUpgrade, setHideUpgrade] = useState(() => localStorage.getItem('hideUpgrade_Listo_' + (userData?.uid || 'guest')) === 'true')

  useEffect(() => {
    if (!userData?.uid) return
    const fetchOrdersCount = async () => {
      try {
        const field = userRole === 'pro' ? 'proId' : 'clientId'
        const q = query(collection(db, 'orders'), where(field, '==', userData.uid))
        const snap = await getDocs(q)
        setOrdersCount(snap.size)
      } catch (err) {
        console.error("Error fetching orders count:", err)
      }
    }
    fetchOrdersCount()
  }, [userData?.uid, userRole])

  const fileInputRef   = useRef(null)
  const cameraInputRef = useRef(null)
  const T = txt[lang]

  const displayName  = userData?.name  || 'Usuario'
  const displayEmail = userData?.email || ''
  const photoURL     = userData?.photoURL || null
  const memberSince  = getMemberSince(lang)
  const initials     = displayName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const isProVerifComplete = !!userData?.verificacion

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setShowPhoto(false)
    setPhotoStatus('saving')
    try {
      const base64 = await compressImage(file)
      
      if (profileComplete || isProVerifComplete) {
         await addDoc(collection(db, 'profile_edit_requests'), {
            userId: userData.uid,
            userName: userData.name,
            requestedChanges: { photoURL: base64 },
            status: 'pending',
            createdAt: serverTimestamp(),
            type: 'photo'
         });
         setPhotoStatus('saved_request')
         setTimeout(() => setPhotoStatus(null), 4000)
      } else {
         if (userData?.uid) {
           await updateDoc(doc(db, 'users', userData.uid), { photoURL: base64 })
         }
         setPhotoStatus('saved')
         setTimeout(() => setPhotoStatus(null), 2500)
      }
    } catch {
      setPhotoStatus('error')
      setTimeout(() => setPhotoStatus(null), 3000)
    }
    e.target.value = ''
  }

  const handleMenu = (action) => {
    if (action === 'orders') { navigate('orders'); return }
    if (action === 'clientProfile') { navigate('clientProfile'); return }
    setScreen(action)
  }

  const handleLogout = () => {
    setShowLogout(false)
    if (onLogout) onLogout()
    else navigate('login')
  }

  const handleDeleteAccount = async () => {
    setShowDelete(false)
    if (userData?.uid) {
      try {
        const user = auth.currentUser;
        if (user) await deleteUser(user);
        await deleteDoc(doc(db, 'users', userData.uid));
      } catch (err) {
        console.error("Error borrando cuenta (posible sesión antigua):", err);
        await updateDoc(doc(db, 'users', userData.uid), { deleted: true, available: false, name: 'Usuario Eliminado', phone: '' });
      }
    }
    if (onLogout) onLogout()
    else navigate('login')
  }

  const toggleAvailability = async () => {
    if (!userData?.uid) return;
    const current = userData.available !== false;
    try {
      await updateDoc(doc(db, 'users', userData.uid), { available: !current });
    } catch (err) {
      console.error("Error updating availability:", err);
    }
  }

  const renderScreen = () => {
    const back = () => setScreen(null)
    switch (screen) {
      case 'favorites':        return <FavoritosScreen lang={lang} onBack={back} />
      case 'notifications':    return <NotificacionesScreen lang={lang} onBack={back} />
      case 'language':         return <IdiomaScreen lang={lang} setLang={setLang} onBack={back} />
      case 'privacy':          return <PrivacidadScreen lang={lang} onBack={back} />
      case 'help':             return <AyudaScreen lang={lang} onBack={back} onFaq={() => setScreen('faq')} />
      case 'faq':              return <FaqBotScreen lang={lang} onBack={() => setScreen('help')} />
      case 'rate':             return <CalificarScreen lang={lang} onBack={back} />
      case 'terms':            return <TermsScreen lang={lang} onBack={back} userRole={userRole} />
      case 'privacyDoc':       return <PrivacyDocScreen lang={lang} onBack={back} />
      case 'verification':     return <VerificacionPage lang={lang} onBack={back} />
      case 'completar-perfil': return <RegistroClientePage userRole={userRole} onBack={back} onSuccess={(target) => { if(target) setScreen(target); else back(); }} />
      case 'planes':           return <PlanesPage onBack={back} navigate={navigate} />
      case 'edit-request':     return <EditRequestScreen lang={lang} user={userData} onBack={back} />
      default: return null
    }
  }

  if (screen) return renderScreen()

  return (
    <div className="profile-page">

      <input ref={fileInputRef}   type="file" accept="image/*"               style={{ display:'none' }} onChange={handleFileSelected} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" style={{ display:'none' }} onChange={handleFileSelected} />

      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar" style={photoURL ? { padding:0, overflow:'hidden' } : {}}>
            {photoURL
              ? <img src={photoURL} alt="perfil" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : initials
            }
          </div>
          <button className="profile-edit-btn" onClick={() => setShowPhoto(true)} disabled={photoStatus==='saving'}>
            {photoStatus === 'saving' ? '⏳' : '✏️'}
          </button>
        </div>

        {photoStatus === 'saved' && (
          <div style={{ background:'#22C55E',color:'white',borderRadius:99,padding:'4px 14px',fontSize:12,fontWeight:700,marginBottom:6 }}>
            ✅ {T.photoSaved}
          </div>
        )}
        {photoStatus === 'saved_request' && (
          <div style={{ background:'#F59E0B',color:'white',borderRadius:12,padding:'8px 14px',fontSize:12,fontWeight:700,marginBottom:10,textAlign:'center',boxShadow:'0 4px 10px rgba(245,158,11,0.2)' }}>
            ⏳ Foto enviada a revisión.<br/>Se actualizará en un máximo de 72h.
          </div>
        )}
        {photoStatus === 'error' && (
          <div style={{ background:'#EF4444',color:'white',borderRadius:99,padding:'4px 14px',fontSize:12,fontWeight:700,marginBottom:6 }}>
            ❌ {T.photoError}
          </div>
        )}

        <h1 className="profile-name">{displayName}</h1>
        <p className="profile-email">{displayEmail}</p>

        {userRole === 'pro' && (
          <button 
             onClick={toggleAvailability}
             style={{ 
               margin: '12px auto', 
               background: userData?.available !== false ? '#10B981' : '#EF4444', 
               color: 'white', 
               border: 'none', 
               padding: '10px 24px', 
               borderRadius: '100px', 
               fontWeight: '800', 
               display: 'flex', 
               alignItems: 'center', 
               gap: '8px', 
               cursor: 'pointer', 
               boxShadow: userData?.available !== false ? '0 4px 12px rgba(16,185,129,0.3)' : '0 4px 12px rgba(239,68,68,0.3)', 
               transition: 'all 0.2s', 
               transform: 'scale(1)' 
             }}
             onMouseDown={e => e.currentTarget.style.transform='scale(0.95)'}
             onMouseUp={e => e.currentTarget.style.transform='scale(1)'}
             onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
          >
            <span style={{ fontSize: '16px' }}>{userData?.available !== false ? '✅' : '⛔'}</span>
            {userData?.available !== false ? (lang==='es'?'DISPONIBLE':'AVAILABLE') : (lang==='es'?'OCUPADO':'BUSY')}
          </button>
        )}

        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-num">{ordersCount}</span>
            <span className="stat-label">{T.orders}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">{userRole === 'pro' ? Number(userData?.rating || 5).toFixed(1) : '—'}</span>
            <span className="stat-label">{T.rating}</span>
          </div>
          {userRole === 'pro' && (
            <>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-num" style={{ color: '#FFD700' }}>{userData?.contracts || 0}</span>
                <span className="stat-label">{T.contracts}</span>
              </div>
            </>
          )}
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">{memberSince}</span>
            <span className="stat-label">{T.memberSince}</span>
          </div>
        </div>

        {/* ── Gamified Seller Dashboard ── */}
        {userRole === 'pro' && (
          <div className="pro-performance-dash">
            <div className="perf-header">
              <span className="perf-title">📈 {lang==='es' ? 'Rendimiento' : 'Performance'}</span>
              <span className="perf-badge">🚀 TOP {Math.max(1, Math.floor((6 - (userData?.rating || 5)) * 10))}%</span>
            </div>
            <div className="perf-bar-bg">
              <div className="perf-bar-fill" style={{ width: `${Math.min(((userData?.rating || 5.0) / 5) * 100, 100)}%` }} />
            </div>
            <p className="perf-sub">{lang==='es' ? '¡Tu perfil destaca sobre los demás!' : 'Your profile stands out!'} {lang==='es' ? 'Mantén el buen servicio.' : 'Keep up the good work.'}</p>
            
            {(!hideUpgrade && (!userData?.planId || userData?.planId === 'basico' || userData?.currentPlan === 'basico' || localStorage.getItem('showUpgradeOverride_Listo_' + userData?.uid) === 'true')) && (
              <div style={{ position: 'relative', marginTop: '12px' }}>
                <button data-tour="comprar-plan" className="perf-action" onClick={() => setScreen('planes')} style={{ margin: 0, width: '100%' }}>
                  <span>💎 {lang === 'es' ? 'Sube de Nivel (Gana más)' : 'Upgrade Level (Earn more)'}</span>
                  <span style={{ fontSize: '18px' }}>›</span>
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setHideUpgrade(true); 
                    localStorage.setItem('hideUpgrade_Listo_' + userData?.uid, 'true');
                    localStorage.removeItem('showUpgradeOverride_Listo_' + userData?.uid);
                  }}
                  style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    background: '#ECECEC', color: '#666', border: 'none',
                    borderRadius: '50%', width: '22px', height: '22px',
                    fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            
            {(userData?.planId === 'gold' || userData?.planId === 'platinum' || userData?.planId === 'vip' || (userData?.currentPlan||'').includes('vip')) && (
              <div style={{ marginTop: 16, padding: 12, background: '#F0FDF4', borderRadius: 12, border: '1px solid #BBF7D0', color: '#166534', fontSize: 13, fontWeight: 700, display: 'flex', gap: 10, alignItems: 'center', boxShadow: '0 2px 8px rgba(22,101,52,0.05)' }}>
                <span style={{ fontSize: 24, animation: 'floatEmoji 3s infinite' }}>👑</span>
                <span style={{ lineHeight: 1.3 }}>{lang === 'es' ? 'Eres un perfil Premium. Tienes prioridad máxima en las búsquedas.' : 'Premium Profile. You have top priority in searches.'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {userData?.email === 'listopatron.app@gmail.com' && (
        <div style={{ padding: '0 20px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => navigate('admin')}
            style={{
              background: 'linear-gradient(135deg, #1A1A2E, #2A2A4A)',
              color: '#FFD700', border: '1px solid rgba(242, 96, 0, 0.5)',
              padding: '10px 24px', borderRadius: '100px',
              fontSize: '14px', fontWeight: '900', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 16px rgba(242, 96, 0, 0.25)',
              transition: 'transform 0.2s', letterSpacing: '0.5px'
            }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'}
            onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
          >
            <span style={{ fontSize: '18px', filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.4))' }}>👑</span>
            PANEL DE ADMINISTRACIÓN
          </button>
        </div>
      )}

      <div className="profile-menu">
        <button className="profile-menu-item" onClick={() => handleMenu('clientProfile')}>
          <span className="pmi-icon">👤</span>
          <span className="pmi-label">{lang==='es' ? 'Ver mi perfil público' : 'View my public profile'}</span>
          <span className="pmi-arrow">›</span>
        </button>

        {(profileComplete || isProVerifComplete) && (
          <button className="profile-menu-item" onClick={() => handleMenu('edit-request')}>
            <span className="pmi-icon" style={{background:'#FFFBEB', color:'#F59E0B', borderRadius:'8px', fontSize:'16px'}}>✏️</span>
            <span className="pmi-label">{lang==='es' ? 'Solicitar cambio de datos' : 'Request data edit'}</span>
            <span className="pmi-arrow">›</span>
          </button>
        )}



        {userRole === 'user' && (
          <button
            className={`profile-menu-item ${profileComplete ? 'perfil-completo-item' : 'completar-perfil-item'}`}
            onClick={() => !profileComplete && handleMenu('completar-perfil')}
          >
            <span className="pmi-icon">{profileComplete ? '✅' : '📝'}</span>
            <span className="pmi-label">
              {profileComplete
                ? (lang==='es' ? 'Perfil completo' : 'Profile complete')
                : (lang==='es' ? 'Completar mi perfil' : 'Complete my profile')
              }
            </span>
            <span className={profileComplete ? 'completo-badge' : 'completar-badge'}>
              {profileComplete ? '✓ Listo' : '¡Complétalo!'}
            </span>
          </button>
        )}

        {menuItems
          .filter(item => item.action !== 'verification' || userRole === 'pro')
          .map((item, i) => {
            let btnClass = 'profile-menu-item '
            if (item.action === 'verification') {
              if (isProVerifComplete) {
                btnClass += (userData?.verificacion?.estado === 'verificado' || userData?.verificacion?.estado === 'aprobada') 
                               ? 'verification-item' 
                               : 'verification-item-yellow'
              } else {
                btnClass += 'verification-item-blue'
              }
            }
            return (
              <button key={i} className={btnClass} onClick={() => handleMenu(item.action)}>
                <span className="pmi-icon">{item.icon}</span>
                <span className="pmi-label">{lang==='es' ? item.labelEs : item.labelEn}</span>
                {item.action === 'verification'
                  ? <span className={isProVerifComplete ? ((userData?.verificacion?.estado === 'verificado' || userData?.verificacion?.estado === 'aprobada') ? "verif-badge" : "verif-badge-yellow") : "verif-badge-blue"}>
                      {isProVerifComplete
                        ? ((userData?.verificacion?.estado === 'verificado' || userData?.verificacion?.estado === 'aprobada') ? '✓ Verificado' : 'En revisión')
                        : '¡Veríficate!'}
                    </span>
                  : <span className="pmi-arrow">›</span>
                }
              </button>
            )
          })
        }
      </div>

      <div className="profile-logout-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="profile-logout" onClick={() => setShowLogout(true)}>🚪 {T.logout}</button>
        <button className="profile-logout" style={{ background: '#FFF0F0', color: '#EF4444', borderColor: '#FECACA' }} onClick={() => setShowDelete(true)}>
          🗑️ {T.deleteTitle}
        </button>
      </div>

      <div className="profile-brand">
        <img src="/src/assets/logo_listo.png" alt="Listo" />
        <p>Listo, patrón.</p>
        <span style={{ cursor:'default', userSelect:'none' }}>v1.0.0</span>
      </div>

      <div style={{ height: 80 }} />

      {showPhoto && (
        <div className="modal-overlay" onClick={() => setShowPhoto(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <span className="modal-icon">📸</span>
            <h3 className="modal-title">{T.photoTitle}</h3>
            <button className="modal-btn danger" style={{ background:'linear-gradient(135deg,#F26000,#C24E00)' }}
              onClick={() => { setShowPhoto(false); fileInputRef.current?.click() }}>
              {T.photoGallery}
            </button>
            <button className="modal-btn danger" style={{ background:'linear-gradient(135deg,#3B82F6,#2563EB)', marginTop:8 }}
              onClick={() => { setShowPhoto(false); cameraInputRef.current?.click() }}>
              {T.photoCamera}
            </button>
            <button className="modal-btn ghost" onClick={() => setShowPhoto(false)}>{T.photoCancel}</button>
          </div>
        </div>
      )}

      {showLogout && <LogoutModal lang={lang} onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      {showDelete && <DeleteAccountModal lang={lang} onConfirm={handleDeleteAccount} onCancel={() => setShowDelete(false)} />}
    </div>
  )
}