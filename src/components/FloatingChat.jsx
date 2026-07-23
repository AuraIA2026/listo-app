import React, { useState, useEffect, useRef } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, orderBy, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { ReportModal } from '../pages/ChatPage'
import CallModal from './CallModal'

const playChatMsgSound = () => {
  try {
    const audio = new Audio('/audio/notification.mp3?v=3')
    audio.volume = 0.5
    audio.loop   = false
    audio.play().catch(() => {})
    // Cortar a 1.5s para que suene como tono corto de notificación
    setTimeout(() => { try { audio.pause(); audio.currentTime = 0 } catch(e) {} }, 1500)
  } catch(e) {}
}

const getChatId = (uid1, uid2) => uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`

export default function FloatingChat({ otherUid, otherName, otherColor = '#F26000', otherPhone = null, lang, onClose, zIndex = 1000000 }) {
  const me       = auth.currentUser
  const chatId   = me && otherUid ? getChatId(me.uid, otherUid) : null
  const initials = (otherName || '?').substring(0, 2).toUpperCase()

  const [messages,  setMessages]  = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping,  setIsTyping]  = useState(false)
  const [showCall,  setShowCall]  = useState(false)
  const [showReport, setShowReport] = useState(false)

  const messagesEndRef = useRef(null)
  const typingTimer    = useRef(null)
  const seenMsgIds     = useRef(new Set())  // persiste entre renders
  const isFirstLoad    = useRef(true)       // primera entrega no suena

  // Crear chat si no existe
  useEffect(() => {
    if (!chatId || !me || !otherUid) return
    getDoc(doc(db, 'chats', chatId)).then(snap => {
      if (!snap.exists()) {
        setDoc(doc(db, 'chats', chatId), {
          members: [me.uid, otherUid], lastMsg: '', updatedAt: serverTimestamp(),
          unreadCount: { [me.uid]: 0, [otherUid]: 0 },
          typing: { [me.uid]: false, [otherUid]: false },
        }).catch(() => {})
      }
    }).catch(() => {})
  }, [chatId]) // eslint-disable-line

  // Escuchar mensajes
  useEffect(() => {
    if (!chatId) return
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'))
    const unsub = onSnapshot(q, snap => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))

      if (isFirstLoad.current) {
        // Primera entrega: marcar todos como vistos, NO sonar
        msgs.forEach(m => seenMsgIds.current.add(m.id))
        isFirstLoad.current = false
      } else {
        // Entregas siguientes: sonar solo en mensajes nuevos del OTRO
        msgs.forEach(m => {
          if (!seenMsgIds.current.has(m.id)) {
            seenMsgIds.current.add(m.id)
            if (m.senderId !== me?.uid) {
              playChatMsgSound()
            }
          }
        })
      }

      setMessages(msgs)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
      updateDoc(doc(db, 'chats', chatId), { [`unreadCount.${me?.uid}`]: 0 }).catch(() => {})
    })
    return () => unsub()
  }, [chatId]) // eslint-disable-line

  // Typing del otro
  useEffect(() => {
    if (!chatId || !otherUid) return
    const unsub = onSnapshot(doc(db, 'chats', chatId), snap => {
      setIsTyping(snap.data()?.typing?.[otherUid] === true)
    })
    return () => unsub()
  }, [chatId, otherUid])

  const sendMessage = async () => {
    if (!inputText.trim() || !chatId || !me) return
    const text = inputText.trim()
    setInputText('')
    updateDoc(doc(db, 'chats', chatId), { [`typing.${me.uid}`]: false }).catch(() => {})
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text, senderId: me.uid, createdAt: serverTimestamp(), status: 'sent',
    }).catch(() => {})
    await updateDoc(doc(db, 'chats', chatId), { lastMsg: text, updatedAt: serverTimestamp() }).catch(() => {})
  }

  const handleDeleteMessage = async (msgId) => {
    if (window.confirm(lang === 'es' ? '¿Borrar este mensaje?' : 'Delete this message?')) {
      await deleteDoc(doc(db, 'chats', chatId, 'messages', msgId)).catch(() => {})
    }
  }

  const handleInput = (e) => {
    setInputText(e.target.value)
    if (!chatId || !me) return
    updateDoc(doc(db, 'chats', chatId), { [`typing.${me.uid}`]: true }).catch(() => {})
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      updateDoc(doc(db, 'chats', chatId), { [`typing.${me.uid}`]: false }).catch(() => {})
    }, 2000)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const fmtTime = (ts) => {
    if (!ts) return ''
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts)
      if (isNaN(d.getTime())) return ''
      return d.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })
    } catch(e) {
      return ''
    }
  }

  return (
    <>
      <style>{`
        @keyframes chatSlideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes typingDot { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.1)', zIndex: zIndex }} />
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, height:'50vh', background:'#fff', borderRadius:'24px 24px 0 0', boxShadow:'0 -8px 40px rgba(0,0,0,0.25)', zIndex: zIndex + 1, display:'flex', flexDirection:'column', animation:'chatSlideUp .35s cubic-bezier(.32,1.2,.5,1)' }}>
        <div style={{ width:40, height:4, background:'#ddd', borderRadius:2, margin:'12px auto 0', flexShrink:0 }} />
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid #f0f0f0', flexShrink:0 }}>
          <div style={{ width:42, height:42, borderRadius:'50%', background:otherColor, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:15, flexShrink:0 }}>{initials}</div>
          <div style={{ flex:1 }}>
            <p style={{ margin:0, fontWeight:800, fontSize:15, color:'#1A1A2E' }}>{otherName}</p>
            <p style={{ margin:0, fontSize:12, fontWeight:600, color: isTyping?'#F26000':'#22C55E' }}>{isTyping?'✍️ Escribiendo...':'● En línea'}</p>
          </div>
          <button onClick={() => setShowReport(true)} style={{ width:38, height:38, borderRadius:'50%', background:'#FEE2E2', border:'none', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, cursor:'pointer', flexShrink:0 }} title="Reportar / Bloquear">⚠️</button>
          <button onClick={() => setShowCall(true)} style={{ width:38, height:38, borderRadius:'50%', background:otherPhone?'#FFF3EC':'#f5f5f5', border:otherPhone?'1px solid #FFD4B0':'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, cursor:'pointer', opacity:otherPhone?1:0.45 }}>📞</button>
          <button onClick={onClose} style={{ width:38, height:38, borderRadius:'50%', background:'#f5f5f5', border:'none', fontSize:16, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        {/* Mensajes */}
        <div style={{ flex:1, overflowY:'auto', padding:'12px 16px', display:'flex', flexDirection:'column', gap:8 }}>
          {messages.length === 0 && (
            <div style={{ textAlign:'center', margin:'auto', color:'#999', fontSize:13 }}>
              <p style={{ fontSize:32, margin:'0 0 8px' }}>👋</p>
              <p style={{ margin:0 }}>{lang==='es'?`Inicia la conversación con ${otherName}`:`Start the conversation`}</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.senderId === me?.uid
            return (
              <div key={msg.id} style={{ display:'flex', justifyContent:isMe?'flex-end':'flex-start', gap:8 }}>
                {!isMe && <div style={{ width:26, height:26, borderRadius:'50%', background:otherColor, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:10, flexShrink:0, marginTop:2 }}>{initials}</div>}
                <div style={{ maxWidth:'72%', padding:'9px 13px', borderRadius:isMe?'18px 18px 4px 18px':'18px 18px 18px 4px', background:isMe?'#F26000':'#F5F5F5', color:isMe?'#fff':'#1A1A2E', fontSize:14, lineHeight:1.4 }}>
                  <p style={{ margin:0 }}>{msg.text}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: 4 }}>
                     {isMe && (
                       <span 
                         onClick={() => handleDeleteMessage(msg.id)} 
                         style={{ cursor: 'pointer', fontSize: 13, opacity: 0.9, marginRight: 4 }}
                         title={lang === 'es' ? 'Borrar mensaje' : 'Delete message'}
                       >🗑️</span>
                     )}
                    <span style={{ fontSize:10, opacity:0.7 }}>{fmtTime(msg.createdAt)} {isMe&&'✓✓'}</span>
                  </div>
                </div>
              </div>
            )
          })}
          {isTyping && (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:otherColor, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:700 }}>{initials}</div>
              <div style={{ background:'#F5F5F5', borderRadius:'18px 18px 18px 4px', padding:'10px 14px', display:'flex', gap:4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#999', animation:`typingDot 1.2s ease ${i*0.2}s infinite` }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {/* Input */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px 24px', borderTop:'1px solid #f0f0f0', flexShrink:0 }}>
          <input type="text" value={inputText} onChange={handleInput} onKeyDown={handleKey}
            placeholder={lang==='es'?'Escribe un mensaje...':'Type a message...'}
            style={{ flex:1, padding:'11px 16px', borderRadius:24, border:'1.5px solid #e0e0e0', fontSize:14, outline:'none', background:'#FAFAFA', color:'#1A1A2E' }} />
          <button onClick={sendMessage} disabled={!inputText.trim()} style={{ width:44, height:44, borderRadius:'50%', border:'none', background:inputText.trim()?'#F26000':'#e0e0e0', color:'#fff', fontSize:18, cursor:inputText.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .2s', flexShrink:0 }}>➤</button>
        </div>
      </div>
      {showCall && <CallModal name={otherName} phone={otherPhone} lang={lang} onClose={() => setShowCall(false)} zIndex={zIndex + 1000} />}
      {showReport && <ReportModal lang={lang} otherUser={{ uid: otherUid, name: otherName }} onClose={() => setShowReport(false)} />}
    </>
  )
}
