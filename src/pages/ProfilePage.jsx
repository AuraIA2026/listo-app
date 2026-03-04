import { useState, useRef, useEffect } from 'react'
import './ProfilePage.css'
import VerificacionPage from './VerificacionPage'
import RegistroClientePage from './RegistroClientePage'

/* ─── TRADUCCIONES ──────────────────────────────────────────── */
const txt = {
  es: {
    title: 'Mi perfil', edit: 'Editar', myOrders: 'Mis pedidos',
    orders: 'pedidos', rating: 'calificación', memberSince: 'Miembro desde',
    back: 'Volver', save: 'Guardar', cancel: 'Cancelar',
    favTitle: 'Favoritos', favEmpty: 'Aún no tienes favoritos',
    favSub: 'Guarda tus profesionales favoritos aquí',
    notifTitle: 'Notificaciones',
    notifOrders: 'Pedidos y reservas',
    notifPromos: 'Promociones y ofertas',
    notifNews: 'Novedades de la app',
    notifReminders: 'Recordatorios',
    langTitle: 'Idioma', langSub: 'Selecciona tu idioma preferido',
    privTitle: 'Privacidad',
    privProfile: 'Perfil público',
    privProfileSub: 'Otros usuarios pueden ver tu perfil',
    privLocation: 'Compartir ubicación',
    privLocationSub: 'Para mostrarte profesionales cercanos',
    privData: 'Compartir datos de uso',
    privDataSub: 'Ayúdanos a mejorar la app',
    helpTitle: 'Ayuda y soporte',
    helpFaq: 'Preguntas frecuentes',
    helpChat: 'Chatear con soporte',
    helpEmail: 'Enviar correo',
    helpPhone: 'Llamar al soporte',
    helpFaqSub: 'Respuestas a las dudas más comunes',
    helpChatSub: 'Tiempo de respuesta: ~5 minutos',
    helpEmailSub: 'Listopatron.app@gmail.com',
    helpPhoneSub: '+1 (809) 909-0455',
    rateTitle: '¿Te gusta Listo?',
    rateSub: 'Tu opinión nos ayuda a mejorar',
    rateComment: 'Déjanos un comentario (opcional)',
    rateSubmit: 'Enviar calificación',
    rateThanks: '¡Gracias por tu calificación!',
    rateThanksub: 'Tu opinión es muy importante para nosotros 🙌',
    logoutTitle: 'Cerrar sesión',
    logoutConfirm: '¿Seguro que quieres cerrar sesión?',
    logoutYes: 'Sí, cerrar sesión',
    logoutNo: 'Cancelar',
    logout: 'Cerrar sesión',
    termsTitle: 'Términos y Condiciones',
    termsLastUpdate: 'Última actualización: 1 de marzo de 2026',
    terms: [
      { title: '1. Naturaleza Jurídica', body: 'Listo Patrón es una plataforma tecnológica de intermediación digital que conecta usuarios con profesionales independientes. No existe relación laboral entre la plataforma y el profesional. El profesional actúa como trabajador independiente y asume sus obligaciones fiscales y legales. Este acuerdo se rige por las leyes de la República Dominicana.' },
      { title: '2. Comisión', body: 'El profesional acepta pagar una comisión del 10% sobre el valor total de cada servicio realizado a través de la plataforma. La plataforma podrá modificar este porcentaje notificando previamente dentro de la aplicación.' },
      { title: '3. Pagos en Efectivo', body: 'Cuando el profesional reciba pagos en efectivo: deberá reportar el servicio correctamente; tendrá 24 horas calendario para pagar el 10% correspondiente; el incumplimiento generará suspensión automática temporal; después de 7 días calendario se aplicará un recargo del 5% adicional sobre el monto adeudado.' },
      { title: '4. Sistema Disciplinario', body: 'Se consideran faltas graves: incumplimiento de pago, evasión de comisión, manipulación de información, conducta inapropiada hacia usuarios, fraude o actividad ilegal.\n\nPenalizaciones:\n• Primer strike: Advertencia formal.\n• Segundo strike: Suspensión temporal.\n• Tercer strike: Cancelación permanente e irreversible.\n\nEn casos graves, la cancelación podrá ser inmediata.' },
      { title: '5. Política de Reembolsos', body: 'Si un usuario solicita reembolso por servicio deficiente comprobado, la plataforma podrá retener pagos, realizar devolución parcial o total y descontar montos de futuros ingresos del profesional.' },
      { title: '6. Protección de Datos', body: 'El profesional autoriza el tratamiento de sus datos conforme a la Ley 172-13 sobre Protección de Datos de la República Dominicana.' },
      { title: '7. Limitación de Responsabilidad', body: 'La plataforma no garantiza ingresos mínimos ni cantidad de servicios. El profesional es responsable directo por la calidad del servicio prestado.' },
      { title: '8. Resolución de Conflictos', body: 'Las partes acuerdan intentar resolver cualquier disputa mediante negociación directa. De no lograrse acuerdo, será competente la jurisdicción de los tribunales de la República Dominicana.' },
      { title: '9. Fuerza Mayor', body: 'La plataforma no será responsable por interrupciones causadas por fallos técnicos, desastres naturales, actos gubernamentales o situaciones fuera de su control.' },
      { title: '10. Aceptación', body: 'El registro y uso de la plataforma implica aceptación total de estos términos y condiciones.' },
    ],
    termsUser: [
      { title: '1. Bienvenido', body: 'Gracias por usar Listo Patrón. Nuestra plataforma conecta usuarios con profesionales independientes que ofrecen servicios a domicilio.\nAl utilizar la aplicación, aceptas estos términos y condiciones.' },
      { title: '2. Cómo Funciona la Plataforma', body: 'Listo Patrón actúa como intermediario tecnológico.\nLos servicios son realizados por profesionales independientes, quienes son responsables de la ejecución y calidad del trabajo.' },
      { title: '3. Registro y Cuenta', body: 'Debes proporcionar información real y actual.\nEres responsable del uso de tu cuenta y contraseña.\nLa plataforma podrá suspender cuentas en caso de actividad sospechosa.' },
      { title: '4. Solicitud de Servicios', body: 'Al confirmar un servicio, aceptas el precio mostrado.\nDebes estar disponible en la dirección indicada.\nRecomendamos mantener la comunicación dentro de la aplicación.' },
      { title: '5. Cancelaciones', body: 'Puedes cancelar sin costo antes de que el profesional esté en camino.\nSi ya está en ruta o en el lugar, puede aplicarse un cargo por cancelación.\nCancelaciones reiteradas podrán generar restricciones temporales.' },
      { title: '6. Reclamaciones y Ajustes', body: 'Puedes presentar una reclamación a través del soporte de la aplicación.\nCada caso será evaluado de manera individual y objetiva.\nLa plataforma podrá ofrecer ajustes, créditos promocionales o soluciones alternativas según corresponda.\nLa presentación de una reclamación no implica devolución automática de dinero.' },
      { title: '7. Conducta y Respeto', body: 'El usuario se compromete a tratar con respeto a los profesionales.\nNo se permiten conductas abusivas, ofensivas o ilegales.\nEn casos graves, la cuenta podrá ser suspendida.' },
      { title: '8. Protección de Datos', body: 'La información será tratada conforme a la Ley 172-13 sobre Protección de Datos de la República Dominicana.' },
      { title: '9. Limitación de Responsabilidad', body: 'La plataforma no garantiza resultados específicos del servicio.\nNo es responsable por acuerdos realizados fuera de la aplicación.' },
      { title: '10. Modificaciones', body: 'La plataforma podrá actualizar estos términos en cualquier momento.\nEl uso continuo implica aceptación de los cambios.' },
      { title: '11. Aceptación', body: 'Al registrarte y utilizar la aplicación, confirmas que has leído y aceptado estos términos.' },
    ],
  },
  en: {
    title: 'My profile', edit: 'Edit', myOrders: 'My orders',
    orders: 'orders', rating: 'rating', memberSince: 'Member since',
    back: 'Back', save: 'Save', cancel: 'Cancel',
    favTitle: 'Favorites', favEmpty: 'No favorites yet',
    favSub: 'Save your favorite professionals here',
    notifTitle: 'Notifications',
    notifOrders: 'Orders & bookings',
    notifPromos: 'Promotions & offers',
    notifNews: 'App updates',
    notifReminders: 'Reminders',
    langTitle: 'Language', langSub: 'Select your preferred language',
    privTitle: 'Privacy',
    privProfile: 'Public profile',
    privProfileSub: 'Other users can see your profile',
    privLocation: 'Share location',
    privLocationSub: 'To show nearby professionals',
    privData: 'Share usage data',
    privDataSub: 'Help us improve the app',
    helpTitle: 'Help & support',
    helpFaq: 'FAQ',
    helpChat: 'Chat with support',
    helpEmail: 'Send email',
    helpPhone: 'Call support',
    helpFaqSub: 'Answers to common questions',
    helpChatSub: 'Response time: ~5 minutes',
    helpEmailSub: 'Listopatron.app@gmail.com',
    helpPhoneSub: '+1 (809) 909-0455',
    rateTitle: 'Do you like Listo?',
    rateSub: 'Your feedback helps us improve',
    rateComment: 'Leave a comment (optional)',
    rateSubmit: 'Submit rating',
    rateThanks: 'Thanks for your rating!',
    rateThanksub: 'Your feedback means a lot to us 🙌',
    logoutTitle: 'Log out',
    logoutConfirm: 'Are you sure you want to log out?',
    logoutYes: 'Yes, log out',
    logoutNo: 'Cancel',
    logout: 'Log out',
    termsTitle: 'Terms & Conditions',
    termsLastUpdate: 'Last updated: March 1, 2026',
    terms: [
      { title: '1. Legal Nature', body: 'Listo Patrón is a digital intermediation technology platform that connects users with independent professionals. There is no employment relationship between the platform and the professional. The professional acts as an independent contractor and assumes their own tax and legal obligations. This agreement is governed by the laws of the Dominican Republic.' },
      { title: '2. Commission', body: 'The professional agrees to pay a 10% commission on the total value of each service performed through the platform. The platform may modify this percentage with prior notice within the application.' },
      { title: '3. Cash Payments', body: 'When the professional receives cash payments: they must report the service correctly; they have 24 calendar hours to pay the corresponding 10%; non-compliance will result in automatic temporary suspension; after 7 calendar days, an additional 5% surcharge will be applied on the outstanding amount.' },
      { title: '4. Disciplinary System', body: 'Serious violations include: non-payment, commission evasion, information manipulation, inappropriate conduct toward users, fraud or illegal activity.\n\nPenalties:\n• First strike: Formal warning.\n• Second strike: Temporary suspension.\n• Third strike: Permanent and irreversible cancellation.\n\nIn serious cases, cancellation may be immediate.' },
      { title: '5. Refund Policy', body: "If a user requests a refund for a proven deficient service, the platform may withhold payments, issue a partial or full refund, and deduct amounts from the professional's future earnings." },
      { title: '6. Data Protection', body: 'The professional authorizes the processing of their data in accordance with Law 172-13 on Data Protection of the Dominican Republic.' },
      { title: '7. Limitation of Liability', body: 'The platform does not guarantee minimum income or quantity of services. The professional is directly responsible for the quality of the service provided.' },
      { title: '8. Dispute Resolution', body: 'The parties agree to attempt to resolve any dispute through direct negotiation. If no agreement is reached, the jurisdiction of the courts of the Dominican Republic shall be competent.' },
      { title: '9. Force Majeure', body: 'The platform shall not be liable for interruptions caused by technical failures, natural disasters, government actions, or situations beyond its control.' },
      { title: '10. Acceptance', body: 'Registration and use of the platform implies full acceptance of these terms and conditions.' },
    ],
    termsUser: [
      { title: '1. Welcome', body: 'Thank you for using Listo Patrón. Our platform connects users with independent professionals who offer home services.\nBy using the app, you accept these terms and conditions.' },
      { title: '2. How the Platform Works', body: 'Listo Patrón acts as a technological intermediary.\nServices are performed by independent professionals, who are responsible for the execution and quality of the work.' },
      { title: '3. Registration and Account', body: 'You must provide real and current information.\nYou are responsible for the use of your account and password.\nThe platform may suspend accounts in case of suspicious activity.' },
      { title: '4. Service Requests', body: 'By confirming a service, you accept the displayed price.\nYou must be available at the indicated address.\nWe recommend keeping communication within the application.' },
      { title: '5. Cancellations', body: 'You can cancel at no cost before the professional is on the way.\nIf they are already on the way or at the location, a cancellation fee may apply.\nRepeated cancellations may result in temporary restrictions.' },
      { title: '6. Claims and Adjustments', body: 'You can submit a claim through the app support.\nEach case will be evaluated individually and objectively.\nThe platform may offer adjustments, promotional credits or alternative solutions.\nSubmitting a claim does not imply an automatic refund.' },
      { title: '7. Conduct and Respect', body: 'The user agrees to treat professionals with respect.\nAbusive, offensive or illegal behavior is not allowed.\nIn serious cases, the account may be suspended.' },
      { title: '8. Data Protection', body: 'Information will be processed in accordance with Law 172-13 on Data Protection of the Dominican Republic.' },
      { title: '9. Limitation of Liability', body: 'The platform does not guarantee specific results of the service.\nIt is not responsible for agreements made outside the application.' },
      { title: '10. Modifications', body: 'The platform may update these terms at any time.\nContinued use implies acceptance of the changes.' },
      { title: '11. Acceptance', body: 'By registering and using the application, you confirm that you have read and accepted these terms.' },
    ],
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
]

const LISTO_SYSTEM_PROMPT = `Eres el asistente virtual de Listo Patrón, una app dominicana que conecta usuarios con profesionales de servicios a domicilio (plomeros, electricistas, limpieza, etc.).

Información clave sobre Listo:
- La app cobra una comisión del 10% a los profesionales por cada servicio
- Los pagos en efectivo deben reportarse en 24 horas
- Los usuarios pueden cancelar gratis antes de que el profesional esté en camino
- Soporte por correo: Listopatron.app@gmail.com
- Soporte por teléfono: +1 (809) 909-0455
- Sistema de strikes: 3 strikes = cancelación permanente del profesional
- La app opera bajo las leyes de la República Dominicana

Responde siempre en español, de forma amable, breve y clara. Si no sabes algo, sugiere contactar al soporte.`

/* ─── BOT FAQ SCREEN ────────────────────────────────────────── */
function FaqBotScreen({ lang, onBack }) {
  const T = txt[lang]
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '¡Hola! 👋 Soy el asistente de Listo. ¿En qué puedo ayudarte hoy?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const suggested = [
    '¿Cómo cancelo un servicio?',
    '¿Cómo funciona la comisión?',
    '¿Cómo solicito un reembolso?',
    '¿Cómo contacto al soporte?',
  ]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const userText = text || input.trim()
    if (!userText) return
    setInput('')
    setLoading(true)
    const newMessages = [...messages, { role: 'user', text: userText }]
    setMessages(newMessages)
    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.text }))
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, system: LISTO_SYSTEM_PROMPT, messages: apiMessages })
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text || 'Lo siento, no pude responder. Intenta de nuevo.'
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error de conexión. Por favor intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="sub-screen" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <ScreenHeader title={T.helpFaq} onBack={onBack} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35, #FF8C42)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 8, flexShrink: 0, marginTop: 2 }}>🤖</div>
            )}
            <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg, #FF6B35, #FF8C42)' : '#fff', color: msg.role === 'user' ? '#fff' : '#1a1a1a', fontSize: 14, lineHeight: 1.5, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', whiteSpace: 'pre-wrap' }}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #FF6B35, #FF8C42)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
            <div style={{ background: '#fff', borderRadius: '18px 18px 18px 4px', padding: '10px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <span style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(n => (<span key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF6B35', animation: `bounce 1.2s infinite ${n * 0.2}s`, display: 'inline-block' }} />))}
              </span>
            </div>
          </div>
        )}
        {messages.length === 1 && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Preguntas frecuentes:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {suggested.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} style={{ background: '#fff', border: '1px solid #FF6B3540', borderRadius: 12, padding: '8px 14px', textAlign: 'left', fontSize: 13, color: '#FF6B35', cursor: 'pointer' }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', background: '#fff', display: 'flex', gap: 8, alignItems: 'center' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()} placeholder="Escribe tu pregunta..." disabled={loading} style={{ flex: 1, border: '1.5px solid #eee', borderRadius: 24, padding: '10px 16px', fontSize: 14, outline: 'none', background: '#fafafa' }} />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ width: 40, height: 40, borderRadius: '50%', background: input.trim() && !loading ? 'linear-gradient(135deg, #FF6B35, #FF8C42)' : '#eee', border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, transition: 'background 0.2s' }}>➤</button>
      </div>
      <style>{`@keyframes bounce { 0%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }`}</style>
    </div>
  )
}

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
  const toggle = key => setNotifs(p => ({ ...p, [key]: !p[key] }))
  const items = [
    { key: 'orders',    icon: '📦', label: T.notifOrders },
    { key: 'promos',    icon: '🎉', label: T.notifPromos },
    { key: 'news',      icon: '📱', label: T.notifNews },
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
            <Toggle checked={notifs[item.key]} onChange={() => toggle(item.key)} />
          </div>
        ))}
      </div>
    </div>
  )
}

function IdiomaScreen({ lang, setLang, onBack }) {
  const T = txt[lang]
  const languages = [
    { code: 'es', label: 'Español', flag: '🇩🇴' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ]
  return (
    <div className="sub-screen">
      <ScreenHeader title={T.langTitle} onBack={onBack} />
      <p className="screen-sub">{T.langSub}</p>
      <div className="settings-list">
        {languages.map(l => (
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
  const toggle = key => setPriv(p => ({ ...p, [key]: !p[key] }))
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
            <Toggle checked={priv[item.key]} onChange={() => toggle(item.key)} />
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
    { icon: '📧', label: T.helpEmail, sub: T.helpEmailSub, color: '#F59E0B', action: () => window.location.href = 'mailto:Listopatron.app@gmail.com' },
    { icon: '📞', label: T.helpPhone, sub: T.helpPhoneSub, color: '#EF4444', action: () => window.location.href = 'tel:+18099090455' },
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

function CalificarScreen({ lang, onBack }) {
  const T = txt[lang]
  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)

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
            <button key={n} className={`rate-star${n <= (hovered || stars) ? ' lit' : ''}`} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => setStars(n)}>★</button>
          ))}
        </div>
        <textarea className="rate-comment" placeholder={T.rateComment} value={comment} onChange={e => setComment(e.target.value)} rows={3} />
        <button className="rate-submit" disabled={stars === 0} onClick={() => setSent(true)}>{T.rateSubmit}</button>
      </div>
    </div>
  )
}

function TermsScreen({ lang, onBack, userRole }) {
  const T = txt[lang]
  const [expanded, setExpanded] = useState(null)
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
          {termsList.map((item, i) => (
            <div key={i} className="terms-item">
              <button className="terms-header" onClick={() => setExpanded(expanded === i ? null : i)}>
                <span className="terms-item-title">{item.title}</span>
                <span className={`terms-arrow ${expanded === i ? 'open' : ''}`}>›</span>
              </button>
              {expanded === i && <p className="terms-body">{item.body}</p>}
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

function LogoutModal({ lang, onConfirm, onCancel }) {
  const T = txt[lang]
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <span className="modal-icon">🚪</span>
        <h3 className="modal-title">{T.logoutTitle}</h3>
        <p className="modal-sub">{T.logoutConfirm}</p>
        <button className="modal-btn danger" onClick={onConfirm}>{T.logoutYes}</button>
        <button className="modal-btn ghost" onClick={onCancel}>{T.logoutNo}</button>
      </div>
    </div>
  )
}

/* ─── COMPONENTE PRINCIPAL ──────────────────────────────────── */
export default function ProfilePage({ lang, setLang, navigate, userRole, profileComplete, onProfileCompleted }) {
  const [screen, setScreen]         = useState(null)
  const [showLogout, setShowLogout] = useState(false)
  const [tapCount, setTapCount]     = useState(0)
  const T = txt[lang]

  const handleMenu = (action) => {
    if (action === 'orders') { navigate('orders'); return }
    setScreen(action)
  }

  const handleLogout = () => {
    setShowLogout(false)
    navigate('login')
  }

  const handleSecretTap = () => {
    const next = tapCount + 1
    setTapCount(next)
    if (next >= 5) { setTapCount(0); navigate('admin') }
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
      case 'verification':     return <VerificacionPage lang={lang} onBack={back} />
      case 'completar-perfil': return (
        <RegistroClientePage
          onBack={back}
          onSuccess={() => { onProfileCompleted?.(); back() }}
        />
      )
      default: return null
    }
  }

  if (screen) return renderScreen()

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">JD</div>
          <button className="profile-edit-btn">✏️</button>
        </div>
        <h1 className="profile-name">Juan Pérez</h1>
        <p className="profile-email">juan@ejemplo.com</p>
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-num">12</span>
            <span className="stat-label">{T.orders}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">4.8 ⭐</span>
            <span className="stat-label">{T.rating}</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-num">Feb 2026</span>
            <span className="stat-label">{T.memberSince}</span>
          </div>
        </div>
      </div>

      <div className="profile-menu">

        {/* ── SOLO usuarios (clientes) ven este botón ── */}
        {userRole === 'user' && (
          <button
            className={`profile-menu-item ${profileComplete ? 'perfil-completo-item' : 'completar-perfil-item'}`}
            onClick={() => !profileComplete && handleMenu('completar-perfil')}
          >
            <span className="pmi-icon">{profileComplete ? '✅' : '👤'}</span>
            <span className="pmi-label">
              {profileComplete
                ? (lang === 'es' ? 'Perfil completo' : 'Profile complete')
                : (lang === 'es' ? 'Completar mi perfil' : 'Complete my profile')
              }
            </span>
            <span className={profileComplete ? 'completo-badge' : 'completar-badge'}>
              {profileComplete ? '✓ Listo' : '¡Complétalo!'}
            </span>
          </button>
        )}

        {/* ── SOLO profesionales ven el botón de Verificación ── */}
        {menuItems
          .filter(item => item.action !== 'verification' || userRole === 'pro')
          .map((item, i) => (
            <button
              key={i}
              className={`profile-menu-item ${item.action === 'verification' ? 'verification-item' : ''}`}
              onClick={() => handleMenu(item.action)}
            >
              <span className="pmi-icon">{item.icon}</span>
              <span className="pmi-label">{lang === 'es' ? item.labelEs : item.labelEn}</span>
              {item.action === 'verification'
                ? <span className="verif-badge">¡Veríficate!</span>
                : <span className="pmi-arrow">›</span>
              }
            </button>
          ))
        }
      </div>

      <div className="profile-logout-wrap">
        <button className="profile-logout" onClick={() => setShowLogout(true)}>
          🚪 {T.logout}
        </button>
      </div>

      <div className="profile-brand">
        <img src="/src/assets/logo_listo.png" alt="Listo" />
        <p>Listo, patrón.</p>
        <span onClick={handleSecretTap} style={{ cursor: 'default', userSelect: 'none' }}>
          v1.0.0
        </span>
      </div>

      <div style={{ height: 80 }} />

      {showLogout && <LogoutModal lang={lang} onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
    </div>
  )
}