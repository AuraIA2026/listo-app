import { useState, useEffect, useRef } from 'react'
import './ChatPage.css'

// Mapa de especialidad -> foto
const specialtyPhoto = {
  '🔧 Mecánico':      '/src/assets/pros/Mecanico.jpg',
  '🧹 Limpieza':      '/src/assets/pros/Niñera.jpg',
  '⚡ Electricista':  '/src/assets/pros/Electricista.jpg',
  '🔩 Plomero':       '/src/assets/pros/Plomero.jpg',
  '🎨 Pintor':        '/src/assets/pros/Pintor.jpg',
  '🌿 Jardinero':     '/src/assets/pros/Jardinero.jpg',
  '🔑 Cerrajero':     '/src/assets/pros/Cerrajero.jpg',
}

// Componente avatar con foto o iniciales como fallback
function ProAvatar({ pro, size = 44, style = {} }) {
  const [imgError, setImgError] = useState(false)
  const photo = specialtyPhoto[pro.category]

  if (photo && !imgError) {
    return (
      <img
        src={photo}
        alt={pro.name}
        onError={() => setImgError(true)}
        style={{
          width: size, height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          ...style
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: pro.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700,
        fontSize: size * 0.35,
        flexShrink: 0,
        ...style
      }}
    >
      {pro.avatar}
    </div>
  )
}

const conversations = [
  {
    id: 1,
    pro: { name: 'Carlos Méndez', avatar: 'CM', color: '#F26000', category: '🔧 Mecánico', available: true },
    lastMsg: '¡Claro! Puedo estar allá a las 10am.',
    time: '10:32',
    unread: 2,
    messages: [
      { id: 1, from: 'pro', text: '¡Hola! Vi que necesitas ayuda con tu vehículo. ¿En qué puedo ayudarte?', time: '10:20', status: 'read' },
      { id: 2, from: 'me', text: 'Sí, el carro no enciende desde ayer. Creo que es la batería.', time: '10:22', status: 'read' },
      { id: 3, from: 'pro', text: 'Entendido. ¿Cuál es tu dirección?', time: '10:25', status: 'read' },
      { id: 4, from: 'me', text: 'Calle El Conde #45, Santo Domingo.', time: '10:28', status: 'read' },
      { id: 5, from: 'pro', text: '¡Claro! Puedo estar allá a las 10am.', time: '10:32', status: 'delivered' },
    ]
  },
  {
    id: 2,
    pro: { name: 'Carmen Díaz', avatar: 'CD', color: '#C24D00', category: '🧹 Limpieza', available: true },
    lastMsg: 'Perfecto, nos vemos mañana 👍',
    time: 'Ayer',
    unread: 0,
    messages: [
      { id: 1, from: 'pro', text: 'Buenos días, confirmando tu reserva para mañana a las 9am.', time: '09:00', status: 'read' },
      { id: 2, from: 'me', text: 'Confirmado, gracias Carmen!', time: '09:15', status: 'read' },
      { id: 3, from: 'pro', text: 'Perfecto, nos vemos mañana 👍', time: '09:16', status: 'read' },
    ]
  },
  {
    id: 3,
    pro: { name: 'Ana Rodríguez', avatar: 'AR', color: '#FF8533', category: '⚡ Electricista', available: false },
    lastMsg: 'El presupuesto sería RD$1,500 por todo.',
    time: 'Lun',
    unread: 0,
    messages: [
      { id: 1, from: 'me', text: '¿Cuánto costaría instalar 3 tomas nuevas?', time: '14:00', status: 'read' },
      { id: 2, from: 'pro', text: 'Déjame revisar los materiales...', time: '14:30', status: 'read' },
      { id: 3, from: 'pro', text: 'El presupuesto sería RD$1,500 por todo.', time: '14:35', status: 'read' },
    ]
  },
]

const quickReplies = [
  '¿Cuándo puedes venir?',
  '¿Cuánto cuesta?',
  '¡Gracias!',
  'Confirmado 👍',
  'Necesito más información',
]

export default function ChatPage({ lang = 'es', navigate, professional }) {
  const [activeChat, setActiveChat] = useState(null)
  const [convos, setConvos] = useState(conversations)
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (professional) {
      const existing = convos.find(c => c.pro.name === professional.name)
      if (existing) setActiveChat(existing.id)
    }
  }, [professional])

  useEffect(() => {
    if (activeChat) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [activeChat, convos])

  const currentConvo = convos.find(c => c.id === activeChat)

  const sendMessage = (text) => {
    if (!text.trim() || !activeChat) return
    const newMsg = {
      id: Date.now(),
      from: 'me',
      text: text.trim(),
      time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    }
    setConvos(prev => prev.map(c =>
      c.id === activeChat
        ? { ...c, messages: [...c.messages, newMsg], lastMsg: text.trim(), time: 'Ahora' }
        : c
    ))
    setInputText('')
    setShowQuickReplies(false)
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const responses = ['Entendido, enseguida te confirmo.','Perfecto, lo anoto.','¡Claro que sí! Sin problema.','Dame un momento para revisarlo.','Recibido 👍']
      const reply = {
        id: Date.now() + 1,
        from: 'pro',
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered'
      }
      setConvos(prev => prev.map(c =>
        c.id === activeChat
          ? { ...c, messages: [...c.messages, reply], lastMsg: reply.text, time: 'Ahora' }
          : c
      ))
    }, 1500 + Math.random() * 1000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputText)
    }
  }

  const totalUnread = convos.reduce((sum, c) => sum + c.unread, 0)

  if (!activeChat) {
    return (
      <div className="chat-page">
        <div className="chat-list-header">
          <button className="chat-back-btn" onClick={() => navigate('home')}>←</button>
          <div>
            <h1 className="chat-list-title">Mensajes</h1>
            {totalUnread > 0 && <span className="chat-unread-total">{totalUnread} sin leer</span>}
          </div>
          <button className="chat-new-btn">✏️</button>
        </div>

        <div className="chat-search-bar">
          <span>🔍</span>
          <input type="text" placeholder="Buscar conversación..." />
        </div>

        <div className="chat-list">
          {convos.map((convo, i) => (
            <div
              key={convo.id}
              className="chat-list-item fade-up"
              style={{ animationDelay: `${i * 0.07}s` }}
              onClick={() => {
                setActiveChat(convo.id)
                setConvos(prev => prev.map(c => c.id === convo.id ? { ...c, unread: 0 } : c))
              }}
            >
              <div className="cli-avatar-wrap">
                <ProAvatar pro={convo.pro} size={48} />
                {convo.pro.available && <div className="cli-online-dot" />}
              </div>

              <div className="cli-body">
                <div className="cli-top">
                  <span className="cli-name">{convo.pro.name}</span>
                  <span className="cli-time">{convo.time}</span>
                </div>
                <div className="cli-bottom">
                  <span className="cli-preview">{convo.lastMsg}</span>
                  {convo.unread > 0 && <span className="cli-badge">{convo.unread}</span>}
                </div>
                <span className="cli-category">{convo.pro.category}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 80 }} />
      </div>
    )
  }

  return (
    <div className="chat-page chat-active">
      <div className="chat-header">
        <button className="chat-back-btn" onClick={() => setActiveChat(null)}>←</button>
        <div className="chat-header-info">
          <ProAvatar pro={currentConvo.pro} size={38} />
          <div>
            <p className="chat-header-name">{currentConvo.pro.name}</p>
            <p className="chat-header-status">
              {currentConvo.pro.available
                ? <span className="status-online">● En línea</span>
                : <span className="status-offline">● Desconectado</span>
              }
            </p>
          </div>
        </div>
        <div className="chat-header-actions">
          <button className="chat-action-btn" title="Llamar">📞</button>
          <button className="chat-action-btn" title="Reservar" onClick={() => navigate('booking', currentConvo.pro)}>📅</button>
        </div>
      </div>

      <div className="chat-pro-card">
        <span className="chat-pro-category">{currentConvo.pro.category}</span>
        <button className="chat-book-quick" onClick={() => navigate('booking', currentConvo.pro)}>
          Reservar servicio →
        </button>
      </div>

      <div className="chat-messages">
        {currentConvo.messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`msg-bubble-wrap ${msg.from === 'me' ? 'me' : 'pro'}`}
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            {msg.from === 'pro' && (
              <ProAvatar pro={currentConvo.pro} size={28} style={{ marginRight: 6, marginTop: 2 }} />
            )}
            <div className={`msg-bubble ${msg.from === 'me' ? 'bubble-me' : 'bubble-pro'}`}>
              <p className="msg-text">{msg.text}</p>
              <div className="msg-meta">
                <span className="msg-time">{msg.time}</span>
                {msg.from === 'me' && (
                  <span className="msg-status">
                    {msg.status === 'sent' ? '✓' : '✓✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="msg-bubble-wrap pro">
            <ProAvatar pro={currentConvo.pro} size={28} style={{ marginRight: 6 }} />
            <div className="msg-bubble bubble-pro typing-bubble">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {showQuickReplies && (
        <div className="quick-replies-wrap">
          {quickReplies.map((qr, i) => (
            <button key={i} className="quick-reply-chip" onClick={() => sendMessage(qr)}>
              {qr}
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-bar">
        <button
          className={`chat-emoji-btn ${showQuickReplies ? 'active' : ''}`}
          onClick={() => setShowQuickReplies(!showQuickReplies)}
        >
          ⚡
        </button>
        <div className="chat-input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Escribe un mensaje..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          className={`chat-send-btn ${inputText.trim() ? 'active' : ''}`}
          onClick={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  )
}