import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db, auth } from '../firebase'
import { useUserData } from '../useUserData'
import './BottomNav.css'
const IconSvg = ({ type, active }) => {
  const color = active ? '#F26000' : '#8E8E93'

  switch (type) {
    case 'home':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? '0' : '2.2'} strokeLinecap="round" strokeLinejoin="round">
          {active ? (
            <path d="M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={color} />
          ) : (
            <>
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </>
          )}
        </svg>
      )
    case 'search':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={active ? '3' : '2.2'} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" fill={active ? 'rgba(242,96,0,0.1)' : 'none'} />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    case 'orders':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? '0' : '2.2'} strokeLinecap="round" strokeLinejoin="round">
          {active ? (
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill={color} />
          ) : (
            <>
               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
               <polyline points="14 2 14 8 20 8" />
               <line x1="16" y1="13" x2="8" y2="13" />
               <line x1="16" y1="17" x2="8" y2="17" />
               <polyline points="10 9 9 9 8 9" />
            </>
          )}
        </svg>
      )
    case 'profile':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? '0' : '2.2'} strokeLinecap="round" strokeLinejoin="round">
          {active ? (
            <>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill={color} />
              <circle cx="12" cy="7" r="4" fill={color} />
            </>
          ) : (
            <>
               <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
               <circle cx="12" cy="7" r="4" />
            </>
          )}
        </svg>
      )
    case 'workdone':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? '0' : '2.2'} strokeLinecap="round" strokeLinejoin="round">
          {active ? (
             <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14L22 4" fill={color} />
          ) : (
             <>
               <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
               <polyline points="22 4 12 14.01 9 11.01" />
             </>
          )}
        </svg>
      )
    case 'chat':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth={active ? '0' : '2.2'} strokeLinecap="round" strokeLinejoin="round">
           {active ? (
             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill={color} />
           ) : (
             <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
           )}
        </svg>
      )
    default: return null
  }
}

const allTabs = [
  { id: 'home',     labelEs: 'Inicio',    labelEn: 'Home',    iconType: 'home' },
  { id: 'search',   labelEs: 'Buscar',    labelEn: 'Search',  iconType: 'search' },
  { id: 'workdone', labelEs: 'Trabajo',   labelEn: 'Done',    iconType: 'workdone' },
  { id: 'orders',   labelEs: 'Pedidos',   labelEn: 'Orders',  iconType: 'orders' },
  { id: 'chat',     labelEs: 'Mensajes',  labelEn: 'Chat',    iconType: 'chat' },
  { id: 'profile',  labelEs: 'Perfil',    labelEn: 'Profile', iconType: 'profile' }
]

export default function BottomNav({ currentPage, navigate, lang = 'es', userRole }) {
  const { userData, profileComplete, userRole: fetchedRole } = useUserData()
  const resolvedRole = userRole || fetchedRole

  const [unreadChats, setUnreadChats]     = useState(0)
  const [pendingOrders, setPendingOrders] = useState(0)
  const [unreadOrderNotifs, setUnreadOrderNotifs] = useState(0)
  const [unreadMsgNotifs, setUnreadMsgNotifs] = useState(0)

  useEffect(() => {
    if (!auth.currentUser) return
    const uid = auth.currentUser.uid

    // Unread Chats Logic
    const qChats = query(collection(db, 'chats'), where('members', 'array-contains', uid))
    const unsubChats = onSnapshot(qChats, snap => {
      let count = 0
      snap.forEach(d => { count += (d.data().unreadCount?.[uid] || 0) })
      setUnreadChats(count)
    }, () => {})

    // Pending Orders Logic
    const fieldType = resolvedRole === 'pro' || userData?.type === 'pro' ? 'proId' : 'clientId'
    const qOrders = query(collection(db, 'orders'), where(fieldType, '==', uid), where('status', '==', 'pending'))
    const unsubOrders = onSnapshot(qOrders, snap => {
      setPendingOrders(snap.size)
    }, () => {})

    // Unread Notifs Logic
    const targetIds = userData?.email === 'listopatron.app@gmail.com' ? [uid, 'admin'] : [uid]
    const qNotifs = query(collection(db, 'notificaciones'), where('userId', 'in', targetIds), where('read', '==', false))
    const unsubNotifs = onSnapshot(qNotifs, snap => {
      let tempOrders = 0
      let tempMsgs = 0
      snap.forEach(d => {
        const t = d.data().type
        if (['new_order', 'job_done', 'order_status', 'system'].includes(t)) tempOrders++
        else if (t === 'message') tempMsgs++
      })
      setUnreadOrderNotifs(tempOrders)
      setUnreadMsgNotifs(tempMsgs)
    }, () => {})

    return () => { unsubChats(); unsubOrders(); unsubNotifs() }
  }, [resolvedRole, userData?.type])

  const activeTab =
    currentPage === 'home'     ? 'home'     :
    currentPage === 'search'   ? 'search'   :
    currentPage === 'workdone' ? 'workdone' :
    currentPage === 'orders'   ? 'orders'   :
    currentPage === 'chat'     ? 'chat'     :
    currentPage === 'profile'  ? 'profile'  : 'home'

  return (
    <>
      <style>{`
        @keyframes tipBounce { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-4px) scale(1.05); } }
        @keyframes popIcon { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
      `}</style>
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {allTabs.map(tab => {
            const isActive = activeTab === tab.id
            const label = lang === 'es' ? tab.labelEs : tab.labelEn
            return (
              <button
                key={tab.id}
                data-tour={`nav-${tab.id}`}
                className={`nav-tab ${isActive ? 'active' : ''}`}
                onClick={() => navigate(tab.id)}
              >
                {/* Alerta de Perfil Incompleto */}
                {tab.id === 'profile' && userData && !profileComplete && (
                   <div style={{
                     position: 'absolute', bottom: '90%', right: '15%', background: '#FF3B30', color: '#FFF',
                     width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #FFF',
                     boxShadow: '0 2px 8px rgba(255,59,48,0.5)',
                     animation: 'tipBounce 1.5s ease-in-out infinite', zIndex: 100
                   }} />
                )}

                {/* Badges de Notificaciones */}
                {tab.id === 'chat' && (unreadChats + unreadMsgNotifs) > 0 && (
                  <span className="nav-badge">{(unreadChats + unreadMsgNotifs) > 99 ? '99+' : (unreadChats + unreadMsgNotifs)}</span>
                )}
                {tab.id === 'orders' && (pendingOrders + unreadOrderNotifs) > 0 && (
                  <span className="nav-badge">{(pendingOrders + unreadOrderNotifs) > 99 ? '99+' : (pendingOrders + unreadOrderNotifs)}</span>
                )}
                
                <span className="nav-icon" style={{ animation: isActive ? 'popIcon 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none' }}>
                  <IconSvg type={tab.iconType} active={isActive} />
                </span>
                
                <span className="nav-label">
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}