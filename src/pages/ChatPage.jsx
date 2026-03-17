import { useState, useEffect, useRef } from 'react'
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, setDoc, getDoc,
  updateDoc, getDocs
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import './ChatPage.css'

const quickReplies = [
  '¿Cuándo puedes venir?',
  '¿Cuánto cuesta?',
  '¡Gracias!',
  'Confirmado 👍',
  'Necesito más información',
]

// ── Genera un ID de conversación determinista entre dos usuarios ──────────────
const getChatId = (uid1, uid2) =>
  uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`

// ── Avatar con iniciales ──────────────────────────────────────────────────────
function Avatar({ name = '?', photoURL = null, color = '#F26000', size = 44, online = false }) {
  const [err, setErr] = useState(false)
  const initials = name.substring(0, 2).toUpperCase()
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {photoURL && !err ? (
        <img src={photoURL} alt={name} onError={() => setErr(true)}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%', background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: size * 0.36,
        }}>{initials}</div>
      )}
      {online && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.26, height: size * 0.26,
          borderRadius: '50%', background: '#22C55E',
          border: '2px solid #fff',
        }} />
      )}
    </div>
  )
}

// ── Pantalla de carga ─────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '10px 14px', alignItems: 'center' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#F26000',
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  )
}

export default function ChatPage({ lang = 'es', navigate, professional, userData }) {
  const me = auth.currentUser
  const [chats,        setChats]        = useState([])   // lista de conversaciones
  const [activeChatId, setActiveChatId] = useState(null) // chatId activo
  const [otherUser,    setOtherUser]    = useState(null) // datos del otro usuario
  const [messages,     setMessages]     = useState([])
  const [inputText,    setInputText]    = useState('')
  const [isTyping,     setIsTyping]     = useState(false)
  const [showQuick,    setShowQuick]    = useState(false)
  const [loading,      setLoading]      = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)
  const typingTimer    = useRef(null)

  // ── Abrir chat directo desde otro componente (professional prop) ──────────
  useEffect(() => {
    if (!professional || !me) return
    const otherId = professional.uid || professional.proId || professional.clientId || professional.id
    if (!otherId || otherId === me.uid) return
    openOrCreateChat(otherId, professional)
  }, [professional]) // eslint-disable-line

  // ── Cargar lista de conversaciones del usuario actual ─────────────────────
  useEffect(() => {
    if (!me) return
    const q = query(
      collection(db, 'chats'),
      where('members', 'array-contains', me.uid),
      orderBy('updatedAt', 'desc')
    )
    const unsub = onSnapshot(q, async (snap) => {
      const list = []
      for (const docSnap of snap.docs) {
        const d = docSnap.data()
        const otherId = d.members.find(id => id !== me.uid)
        if (!otherId) continue
        // Cargar datos del otro usuario
        let other = d.otherUserCache?.[otherId] || null
        if (!other) {
          try {
            const uSnap = await getDoc(doc(db, 'users', otherId))
            if (uSnap.exists()) other = { uid: otherId, ...uSnap.data() }
          } catch(e) {}
        }
        list.push({
          chatId: docSnap.id,
          other,
          lastMsg:   d.lastMsg   || '',
          updatedAt: d.updatedAt || null,
          unread:    d.unreadCount?.[me.uid] || 0,
        })
      }
      setChats(list)
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, []) // eslint-disable-line

  // ── Escuchar mensajes del chat activo ─────────────────────────────────────
  useEffect(() => {
    if (!activeChatId) return
    const q = query(
      collection(db, 'chats', activeChatId, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setMessages(msgs)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
      // Marcar como leídos
      if (me) {
        updateDoc(doc(db, 'chats', activeChatId), {
          [`unreadCount.${me.uid}`]: 0
        }).catch(() => {})
      }
    })
    return () => unsub()
  }, [activeChatId]) // eslint-disable-line

  // ── Escuchar typing del otro usuario ──────────────────────────────────────
  useEffect(() => {
    if (!activeChatId || !otherUser) return
    const unsub = onSnapshot(doc(db, 'chats', activeChatId), (snap) => {
      const d = snap.data()
      setIsTyping(d?.typing?.[otherUser.uid] === true)
    })
    return () => unsub()
  }, [activeChatId, otherUser])

  // ── Abrir o crear conversación ────────────────────────────────────────────
  const openOrCreateChat = async (otherId, otherData) => {
    if (!me) return
    const chatId = getChatId(me.uid, otherId)
    const chatRef = doc(db, 'chats', chatId)
    const snap = await getDoc(chatRef)
    if (!snap.exists()) {
      await setDoc(chatRef, {
        members:    [me.uid, otherId],
        lastMsg:    '',
        updatedAt:  serverTimestamp(),
        unreadCount: { [me.uid]: 0, [otherId]: 0 },
        typing:     { [me.uid]: false, [otherId]: false },
      })
    }
    setOtherUser({ uid: otherId, ...otherData })
    setActiveChatId(chatId)
  }

  // ── Enviar mensaje ────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text.trim() || !activeChatId || !me) return
    const trimmed = text.trim()
    setInputText('')
    setShowQuick(false)

    // Quitar typing
    updateDoc(doc(db, 'chats', activeChatId), {
      [`typing.${me.uid}`]: false
    }).catch(() => {})

    // Guardar mensaje
    await addDoc(collection(db, 'chats', activeChatId, 'messages'), {
      text:      trimmed,
      senderId:  me.uid,
      createdAt: serverTimestamp(),
      status:    'sent',
    }).catch(() => {})

    // Actualizar chat: lastMsg, updatedAt, unread del otro
    const otherId = otherUser?.uid
    await updateDoc(doc(db, 'chats', activeChatId), {
      lastMsg:   trimmed,
      updatedAt: serverTimestamp(),
      ...(otherId ? { [`unreadCount.${otherId}`]: (chats.find(c => c.chatId === activeChatId)?.unread || 0) + 1 } : {}),
    }).catch(() => {})
  }

  // ── Indicador de typing ───────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInputText(e.target.value)
    if (!activeChatId || !me) return
    updateDoc(doc(db, 'chats', activeChatId), {
      [`typing.${me.uid}`]: true
    }).catch(() => {})
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      updateDoc(doc(db, 'chats', activeChatId), {
        [`typing.${me.uid}`]: false
      }).catch(() => {})
    }, 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputText) }
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
  }

  const formatLastTime = (ts) => {
    if (!ts) return ''
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    const now = new Date()
    const diff = now - d
    if (diff < 60000)       return 'Ahora'
    if (diff < 3600000)     return `${Math.floor(diff/60000)}m`
    if (diff < 86400000)    return d.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
    if (diff < 604800000)   return ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][d.getDay()]
    return d.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit' })
  }

  const totalUnread = chats.reduce((s, c) => s + (c.unread || 0), 0)

  // ════════════════════════════════════════════════════════════════════════════
  // LISTA DE CONVERSACIONES
  // ════════════════════════════════════════════════════════════════════════════
  if (!activeChatId) {
    return (
      <div className="chat-page">
        <style>{`
          @keyframes typingBounce {
            0%,80%,100% { transform: translateY(0); }
            40%          { transform: translateY(-6px); }
          }
          @keyframes fadeSlideUp {
            from { opacity:0; transform:translateY(12px); }
            to   { opacity:1; transform:translateY(0); }
          }
        `}</style>

        <div className="chat-list-header">
          <button className="chat-back-btn" onClick={() => navigate('home')}>←</button>
          <div>
            <h1 className="chat-list-title">Mensajes</h1>
            {totalUnread > 0 && <span className="chat-unread-total">{totalUnread} sin leer</span>}
          </div>
          <div style={{ width: 36 }} />
        </div>

        <div className="chat-search-bar">
          <span>🔍</span>
          <input type="text" placeholder="Buscar conversación..." />
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
            <p style={{ fontSize: 13 }}>Cargando conversaciones...</p>
          </div>
        )}

        {!loading && chats.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p style={{ fontSize: 48, margin: '0 0 12px' }}>💬</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#1A1A2E', margin: '0 0 6px' }}>
              {lang === 'es' ? 'Sin conversaciones aún' : 'No conversations yet'}
            </p>
            <p style={{ fontSize: 13, color: '#999', margin: 0 }}>
              {lang === 'es' ? 'Reserva un servicio para chatear con un profesional' : 'Book a service to start chatting'}
            </p>
          </div>
        )}

        <div className="chat-list">
          {chats.map((convo, i) => (
            <div
              key={convo.chatId}
              className="chat-list-item"
              style={{ animation: `fadeSlideUp .35s ease ${i * 0.06}s both` }}
              onClick={() => {
                setOtherUser(convo.other)
                setActiveChatId(convo.chatId)
              }}
            >
              <div className="cli-avatar-wrap">
                <Avatar
                  name={convo.other?.name || '?'}
                  photoURL={convo.other?.photoURL}
                  color={convo.other?.color || '#F26000'}
                  size={50}
                  online={convo.other?.online || false}
                />
              </div>
              <div className="cli-body">
                <div className="cli-top">
                  <span className="cli-name">{convo.other?.name || 'Usuario'}</span>
                  <span className="cli-time">{formatLastTime(convo.updatedAt)}</span>
                </div>
                <div className="cli-bottom">
                  <span className="cli-preview">{convo.lastMsg || '...'}</span>
                  {convo.unread > 0 && <span className="cli-badge">{convo.unread}</span>}
                </div>
                <span className="cli-category">{convo.other?.specialty || convo.other?.proSpecialty || ''}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 80 }} />
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // CHAT ACTIVO
  // ════════════════════════════════════════════════════════════════════════════
  const phone = otherUser?.phone || otherUser?.proPhone || otherUser?.clientPhone || null

  return (
    <div className="chat-page chat-active">
      <style>{`
        @keyframes typingBounce {
          0%,80%,100% { transform: translateY(0); }
          40%          { transform: translateY(-6px); }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="chat-header">
        <button className="chat-back-btn" onClick={() => { setActiveChatId(null); setMessages([]) }}>←</button>
        <div className="chat-header-info">
          <Avatar
            name={otherUser?.name || '?'}
            photoURL={otherUser?.photoURL}
            color={otherUser?.color || '#F26000'}
            size={40}
            online={otherUser?.online || false}
          />
          <div style={{ marginLeft: 10 }}>
            <p className="chat-header-name">{otherUser?.name || 'Usuario'}</p>
            <p className="chat-header-status">
              {isTyping
                ? <span style={{ color: '#F26000', fontSize: 12, fontWeight: 600 }}>✍️ Escribiendo...</span>
                : otherUser?.online
                  ? <span className="status-online">● En línea</span>
                  : <span className="status-offline">● Desconectado</span>
              }
            </p>
          </div>
        </div>
        <div className="chat-header-actions">
          {/* ── Llamada real por teléfono ── */}
          {phone ? (
            <a href={`tel:${phone}`} className="chat-action-btn call-btn" title={`Llamar a ${otherUser?.name}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              📞
            </a>
          ) : (
            <button className="chat-action-btn call-btn" title="Sin número registrado"
              onClick={() => alert(lang === 'es' ? 'Este usuario no tiene número registrado.' : 'No phone number registered.')}
              style={{ opacity: 0.45 }}>
              📞
            </button>
          )}
          <button className="chat-action-btn" title="Reservar" onClick={() => navigate('booking', otherUser)}>📅</button>
        </div>
      </div>

      {/* ── Info del profesional ── */}
      {otherUser?.specialty && (
        <div className="chat-pro-card">
          <span className="chat-pro-category">{otherUser.specialty || otherUser.proSpecialty}</span>
          <button className="chat-book-quick" onClick={() => navigate('booking', otherUser)}>
            {lang === 'es' ? 'Reservar servicio →' : 'Book service →'}
          </button>
        </div>
      )}

      {/* ── Mensajes ── */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 36, margin: '0 0 8px' }}>👋</p>
            <p style={{ fontSize: 14, color: '#999', margin: 0 }}>
              {lang === 'es' ? `Inicia la conversación con ${otherUser?.name || 'este usuario'}` : `Start the conversation`}
            </p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isMe = msg.senderId === me?.uid
          return (
            <div
              key={msg.id}
              className={`msg-bubble-wrap ${isMe ? 'me' : 'pro'}`}
              style={{ animation: `fadeSlideUp .25s ease ${Math.min(i,8) * 0.03}s both` }}
            >
              {!isMe && (
                <Avatar
                  name={otherUser?.name || '?'}
                  photoURL={otherUser?.photoURL}
                  color={otherUser?.color || '#F26000'}
                  size={28}
                  style={{ marginRight: 6, marginTop: 2 }}
                />
              )}
              <div className={`msg-bubble ${isMe ? 'bubble-me' : 'bubble-pro'}`}>
                <p className="msg-text">{msg.text}</p>
                <div className="msg-meta">
                  <span className="msg-time">{formatTime(msg.createdAt)}</span>
                  {isMe && (
                    <span className="msg-status">
                      {msg.status === 'read' ? '✓✓' : msg.status === 'delivered' ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="msg-bubble-wrap pro">
            <Avatar
              name={otherUser?.name || '?'}
              photoURL={otherUser?.photoURL}
              color={otherUser?.color || '#F26000'}
              size={28}
            />
            <div className="msg-bubble bubble-pro typing-bubble" style={{ marginLeft: 6 }}>
              <LoadingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Respuestas rápidas ── */}
      {showQuick && (
        <div className="quick-replies-wrap">
          {quickReplies.map((qr, i) => (
            <button key={i} className="quick-reply-chip" onClick={() => sendMessage(qr)}>
              {qr}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="chat-input-bar">
        <button
          className={`chat-emoji-btn ${showQuick ? 'active' : ''}`}
          onClick={() => setShowQuick(!showQuick)}
        >⚡</button>
        <div className="chat-input-wrap">
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder={lang === 'es' ? 'Escribe un mensaje...' : 'Type a message...'}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          className={`chat-send-btn ${inputText.trim() ? 'active' : ''}`}
          onClick={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
        >➤</button>
      </div>
    </div>
  )
}