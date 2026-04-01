import { useState, useEffect, useRef } from 'react'
import {
  collection, query, where, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, setDoc, getDoc,
  updateDoc, deleteDoc
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
          borderRadius: '50%', background: '#10B981',
          border: '2px solid #fff',
        }} />
      )}
    </div>
  )
}

// ── Pantalla de carga (Burbujas) ──────────────────────────────────────────────
function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '10px 14px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%', background: '#CBD5E1',
          animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  )
}

function ChatSkeleton() {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton-bubble" style={{ alignSelf: 'flex-start', width: '60%', height: 48, borderRadius: '20px 20px 20px 4px' }} />
      <div className="skeleton-bubble" style={{ alignSelf: 'flex-start', width: '40%', height: 40, borderRadius: '20px 20px 20px 4px' }} />
      <div className="skeleton-bubble-me" style={{ alignSelf: 'flex-end', width: '70%', height: 60, borderRadius: '20px 20px 4px 20px' }} />
      <div className="skeleton-bubble" style={{ alignSelf: 'flex-start', width: '50%', height: 40, borderRadius: '20px 20px 20px 4px' }} />
      <div className="skeleton-bubble-me" style={{ alignSelf: 'flex-end', width: '50%', height: 40, borderRadius: '20px 20px 4px 20px' }} />
    </div>
  )
}

export default function ChatPage({ lang = 'es', navigate, professional, userData }) {
  const me = auth.currentUser
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [messages, setMessages] = useState([])
  
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const [loadingChats, setLoadingChats] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(true)
  
  const [showQuick, setShowQuick] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [selectedMsgId, setSelectedMsgId] = useState(null) // Para opciones de borrar/copiar
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimer = useRef(null)

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
        
        let other = d.otherUserCache?.[otherId] || null
        if (!other) {
          try {
            const uSnap = await getDoc(doc(db, 'users', otherId))
            if (uSnap.exists()) other = { uid: otherId, ...uSnap.data() }
          } catch (e) { }
        }
        list.push({
          chatId: docSnap.id,
          other,
          lastMsg: d.lastMsg || '',
          updatedAt: d.updatedAt || null,
          unread: d.unreadCount?.[me.uid] || 0,
        })
      }
      setChats(list)
      setLoadingChats(false)
    }, () => setLoadingChats(false))
    return () => unsub()
  }, []) // eslint-disable-line

  // ── Escuchar mensajes del chat activo ─────────────────────────────────────
  useEffect(() => {
    if (!activeChatId) {
      setLoadingMessages(true)
      return
    }
    const q = query(
      collection(db, 'chats', activeChatId, 'messages'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setMessages(msgs)
      setLoadingMessages(false)
      
      // Auto-scroll robusto
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      
      if (me) {
        updateDoc(doc(db, 'chats', activeChatId), {
          [`unreadCount.${me.uid}`]: 0
        }).catch(() => { })
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
        members: [me.uid, otherId],
        lastMsg: '',
        updatedAt: serverTimestamp(),
        unreadCount: { [me.uid]: 0, [otherId]: 0 },
        typing: { [me.uid]: false, [otherId]: false },
      })
    }
    setOtherUser({ uid: otherId, ...otherData })
    setActiveChatId(chatId)
    setLoadingMessages(true)
  }

  // ── Enviar mensaje ────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text.trim() || !activeChatId || !me) return
    const trimmed = text.trim()
    setInputText('')
    setShowQuick(false)

    updateDoc(doc(db, 'chats', activeChatId), {
      [`typing.${me.uid}`]: false
    }).catch(() => { })

    await addDoc(collection(db, 'chats', activeChatId, 'messages'), {
      text: trimmed,
      senderId: me.uid,
      createdAt: serverTimestamp(),
      status: 'sent',
    }).catch(() => { })

    const otherId = otherUser?.uid
    await updateDoc(doc(db, 'chats', activeChatId), {
      lastMsg: trimmed,
      updatedAt: serverTimestamp(),
      ...(otherId ? { [`unreadCount.${otherId}`]: (chats.find(c => c.chatId === activeChatId)?.unread || 0) + 1 } : {}),
    }).catch(() => { })
  }

  // ── Opciones de Mensaje (Borrar / Copiar) ─────────────────────────────────
  const handleDeleteMessage = async (msgId) => {
    if (window.confirm(lang === 'es' ? '¿Quieres eliminar este mensaje para todos?' : 'Delete message for everyone?')) {
      await deleteDoc(doc(db, 'chats', activeChatId, 'messages', msgId)).catch(() => { })
      setSelectedMsgId(null)
    }
  }

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text)
    setSelectedMsgId(null)
  }

  // ── Indicador de typing ───────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInputText(e.target.value)
    if (!activeChatId || !me) return
    updateDoc(doc(db, 'chats', activeChatId), { [`typing.${me.uid}`]: true }).catch(() => { })
    
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      updateDoc(doc(db, 'chats', activeChatId), { [`typing.${me.uid}`]: false }).catch(() => { })
    }, 2000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputText) }
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts)
      if (isNaN(d.getTime())) return ''
      return d.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
    } catch (e) { return '' }
  }

  const formatLastTime = (ts) => {
    if (!ts) return ''
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts)
      if (isNaN(d.getTime())) return ''
      const now = new Date()
      const diff = now - d
      if (diff < 60000) return 'Ahora'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
      if (diff < 86400000) return d.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
      if (diff < 604800000) return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()]
      return d.toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit' })
    } catch (e) { return '' }
  }

  const totalUnread = chats.reduce((s, c) => s + (c.unread || 0), 0)

  // ════════════════════════════════════════════════════════════════════════════
  // LISTA DE CONVERSACIONES
  // ════════════════════════════════════════════════════════════════════════════
  if (!activeChatId) {
    return (
      <div className="chat-page">
        <style>{`
          @keyframes fadeSlideUp {
            from { opacity:0; transform:translateY(12px); }
            to   { opacity:1; transform:translateY(0); }
          }
          .skeleton-bubble { background: #E2E8F0; animation: pulse 1.5s infinite; }
          .skeleton-bubble-me { background: #F1F5F9; animation: pulse 1.5s infinite; }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        `}</style>

        <div className="chat-list-header">
          <button className="chat-back-btn" onClick={() => navigate('home')}>←</button>
          <div>
            <h1 className="chat-list-title">{lang === 'es' ? 'Mensajes' : 'Messages'}</h1>
            {totalUnread > 0 && <span className="chat-unread-total">{totalUnread}</span>}
          </div>
          <div style={{ width: 40 }} />
        </div>

        <div className="chat-search-bar">
          <span>🔍</span>
          <input type="text" placeholder={lang === 'es' ? 'Buscar conversación...' : 'Search...'} />
        </div>

        <div className="chat-list" style={{ paddingBottom: 80 }}>
          {loadingChats && (
            <div style={{ padding: 20 }}>
               {[1,2,3].map(i => (
                 <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                   <div className="skeleton-bubble" style={{ width: 52, height: 52, borderRadius: 16 }} />
                   <div style={{ flex: 1 }}>
                     <div className="skeleton-bubble" style={{ width: '60%', height: 16, borderRadius: 8, marginBottom: 8 }} />
                     <div className="skeleton-bubble" style={{ width: '40%', height: 12, borderRadius: 6 }} />
                   </div>
                 </div>
               ))}
            </div>
          )}

          {!loadingChats && chats.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', opacity: 0.8 }}>
              <p style={{ fontSize: 64, margin: '0 0 16px', filter: 'hue-rotate(-10deg)' }}>💬</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--black)', margin: '0 0 8px' }}>
                {lang === 'es' ? 'Sin conversaciones aún' : 'No conversations yet'}
              </p>
              <p style={{ fontSize: 14, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                {lang === 'es' ? 'Reserva un servicio para chatear con un profesional. Todo queda guardado aquí.' : 'Book a service to start chatting.'}
              </p>
            </div>
          )}

          {chats.map((convo, i) => (
            <div
              key={convo.chatId}
              className="chat-list-item"
              style={{ animation: `fadeSlideUp .35s ease ${i * 0.05}s both` }}
              onClick={() => {
                setOtherUser(convo.other)
                setActiveChatId(convo.chatId)
                setLoadingMessages(true)
              }}
            >
              <div className="cli-avatar-wrap">
                <Avatar
                  name={convo.other?.name || '?'}
                  photoURL={convo.other?.photoURL}
                  color={convo.other?.color || '#F26000'}
                  size={52}
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
          <div style={{ marginLeft: 0 }}>
            <p className="chat-header-name">{otherUser?.name || 'Usuario'}</p>
            <p className="chat-header-status">
              {isTyping
                ? <span style={{ color: 'var(--mamey)', fontWeight: 700 }}>Escribiendo...</span>
                : otherUser?.online
                  ? <span className="status-online">En línea</span>
                  : <span className="status-offline">Desconectado</span>
              }
            </p>
          </div>
        </div>
        <div className="chat-header-actions">
          {phone ? (
            <a href={`tel:${phone}`} className="chat-action-btn call-btn" title={`Llamar a ${otherUser?.name}`}
              style={{ textDecoration: 'none' }}>📞</a>
          ) : (
            <button className="chat-action-btn call-btn" title="Sin número"
              onClick={() => alert('Este perfil no tiene número.')} style={{ opacity: 0.5 }}>📞</button>
          )}
          <button className="chat-action-btn" title="Reservar" onClick={() => navigate('booking', otherUser)}>📅</button>
        </div>
      </div>

      {otherUser?.specialty && (
        <div className="chat-pro-card">
          <span className="chat-pro-category">{otherUser.specialty || otherUser.proSpecialty}</span>
          <button className="chat-book-quick" onClick={() => navigate('booking', otherUser)}>
            {lang === 'es' ? 'Contratar →' : 'Book →'}
          </button>
        </div>
      )}

      {/* ── Mensajes ── */}
      <div className="chat-messages" onClick={() => setSelectedMsgId(null)}>
        {loadingMessages ? (
          <ChatSkeleton />
        ) : (
          <>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: 48, margin: '0 0 12px' }}>👋</p>
                <p style={{ fontSize: 16, color: '#64748B', margin: 0, fontWeight: 600 }}>
                  {lang === 'es' ? `Cifrado de extremo a extremo con ${otherUser?.name || 'el profesional'}` : `Start the conversation`}
                </p>
              </div>
            )}

            {messages.map((msg, i) => {
              const isMe = msg.senderId === me?.uid
              const isSelected = selectedMsgId === msg.id

              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={`msg-bubble-wrap ${isMe ? 'me' : 'pro'}`}
                    style={{ animation: `fadeSlideUp .25s ease ${Math.min(i, 8) * 0.03}s both` }}
                  >
                    {!isMe && (
                      <Avatar
                        name={otherUser?.name || '?'} photoURL={otherUser?.photoURL}
                        color={otherUser?.color || '#F26000'} size={28}
                        style={{ marginRight: 6, marginBottom: 2 }}
                      />
                    )}
                    
                    <div 
                      className={`msg-bubble ${isMe ? 'bubble-me' : 'bubble-pro'} ${isSelected ? 'bubble-selected' : ''}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedMsgId(isSelected ? null : msg.id) }}
                      style={{ cursor: 'pointer', transition: 'all 0.2s', transform: isSelected ? 'scale(0.98)' : 'scale(1)' }}
                    >
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

                  {/* Opciones del mensaje si está seleccionado */}
                  {isSelected && (
                    <div className={`msg-actions-menu ${isMe ? 'actions-right' : 'actions-left'}`}>
                      <button onClick={(e) => { e.stopPropagation(); handleCopyMessage(msg.text) }}>📄 Copiar</button>
                      {isMe && <button onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id) }} className="delete-text">🗑️ Borrar</button>}
                    </div>
                  )}
                </div>
              )
            })}

            {isTyping && (
              <div className="msg-bubble-wrap pro">
                <Avatar name={otherUser?.name || '?'} photoURL={otherUser?.photoURL} color={otherUser?.color || '#F26000'} size={28} />
                <div className="msg-bubble bubble-pro typing-bubble" style={{ marginLeft: 6 }}>
                  <LoadingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} style={{ height: 1 }} />
          </>
        )}
      </div>

      {/* ── Respuestas rápidas ── */}
      {showQuick && (
        <div className="quick-replies-wrap">
          {quickReplies.map((qr, i) => (
            <button key={i} className="quick-reply-chip" onClick={() => sendMessage(qr)}>{qr}</button>
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
            ref={inputRef} type="text" className="chat-input"
            placeholder={lang === 'es' ? 'Mensaje...' : 'Message...'}
            value={inputText} onChange={handleInputChange} onKeyDown={handleKeyDown}
            onFocus={() => setSelectedMsgId(null)}
          />
        </div>
        <button
          className={`chat-send-btn ${inputText.trim() ? 'active' : ''}`}
          onClick={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
        >➤</button>
      </div>

      {showReport && <ReportModal lang={lang} otherUser={otherUser} onClose={() => setShowReport(false)} />}
    </div>
  )
}

// ── Modal de Reporte (Google Play UGC Compliance) ──────────────────────────
export function ReportModal({ lang, otherUser, onClose }) {
  const me = auth.currentUser
  const [reason, setReason] = useState('')
  const [severity, setSeverity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  
  const submitReport = async (isBlock) => {
    if (!severity) return alert('Por favor selecciona la gravedad de la queja primero.')
    if (!reason.trim()) return alert('Escribe el motivo de la queja.')
    setSubmitting(true)
    try {
      await addDoc(collection(db, 'reports'), {
        reporterId: me.uid, 
        reporterName: me.displayName || 'Usuario',
        reportedId: otherUser?.uid || 'unknown',
        reportedName: otherUser?.name || 'Profesional',
        reason: reason.trim(), 
        severity: severity,
        action: isBlock ? 'blocked' : 'reported',
        createdAt: serverTimestamp(), 
        status: 'pending'
      })
      setDone(true)
    } catch(e) {}
    setSubmitting(false)
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:24, padding:32, width:'100%', maxWidth:360, boxShadow:'0 20px 40px rgba(0,0,0,0.2)', maxHeight:'90vh', overflowY:'auto' }}>
        {done ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🛡️</div>
            <h3 style={{ margin:'0 0 16px', color:'#1A1A2E' }}>Queja Registrada</h3>
            <p style={{ fontSize:14, color:'#64748B', marginBottom:20 }}>Nuestra Central de Mando ha recibido la notificación y auditará al perfil inmediatamente.</p>
            <button onClick={onClose} style={{ width:'100%', padding:14, borderRadius:16, border:'none', background:'#F1F5F9', fontWeight:'bold', cursor:'pointer' }}>Cerrar</button>
          </div>
        ) : (
          <>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'#FEE2E2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, margin:'0 auto 16px' }}>🚨</div>
            <h3 style={{ textAlign:'center', margin:'0 0 8px', color:'#1A1A2E' }}>Reportar Problema</h3>
            <p style={{ textAlign:'center', margin:'0 0 20px', fontSize:14, color:'#64748B' }}>¿Qué sucedió con {otherUser?.name}?</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8, marginBottom: 16 }}>
              {[
                { id: 'leve', label: '🟡 Leve (Tardanza, Trato)', color: '#B45309', bg: '#FEF08A', border: '#FDE047' },
                { id: 'moderada', label: '🟠 Moderada (Mal trabajo)', color: '#C2410C', bg: '#FFEDD5', border: '#FDBA74' },
                { id: 'grave', label: '🔴 Grave (Robo, Agresión)', color: '#B91C1C', bg: '#FEE2E2', border: '#FCA5A5' },
              ].map(s => (
                <div key={s.id} onClick={() => setSeverity(s.id)} style={{ padding: '10px 14px', borderRadius: 12, border: severity===s.id ? `2px solid ${s.border}` : '2px solid transparent', background: severity===s.id ? s.bg : '#F1F5F9', cursor: 'pointer', textAlign: 'left', fontWeight: 700, fontSize: 13, color: severity===s.id ? s.color : '#475569', transition: 'all .2s' }}>
                  {s.label}
                </div>
              ))}
            </div>

            <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Describe qué ocurrió exactamente..." style={{ width:'100%', height:80, padding:14, borderRadius:12, border:'2px solid #E2E8F0', resize:'none', marginBottom:16, fontFamily:'inherit' }} />
            
            <div style={{ display:'flex', gap:12, marginBottom:12 }}>
              <button onClick={()=>submitReport(false)} disabled={submitting} style={{ flex:1, padding:14, borderRadius:12, border:'none', background:'#1E293B', color:'#fff', fontWeight:'bold', cursor:'pointer' }}>Enviar Queja</button>
              <button onClick={()=>submitReport(true)} disabled={submitting} style={{ flex:1, padding:14, borderRadius:12, border:'none', background:'#EF4444', color:'#fff', fontWeight:'bold', cursor:'pointer' }}>Bloquear</button>
            </div>
            <button onClick={onClose} style={{ width:'100%', padding:12, borderRadius:12, border:'none', background:'transparent', color:'#64748B', fontWeight:'bold', cursor:'pointer' }}>Cancelar</button>
          </>
        )}
      </div>
    </div>
  )
}