import { useState, useEffect, useRef } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot, getDocs, collection, query, where, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

import HomePage               from './pages/HomePage'
import ServicesPage           from './pages/ServicesPage'
import SearchPage             from './pages/SearchPage'
import OrdersPage             from './pages/OrdersPage'
import ProfilePage            from './pages/ProfilePage'
import LoginPage              from './pages/LoginPage'
import RegisterPage           from './pages/RegisterPage'
import BookingPage            from './pages/BookingPage'
import ChatPage               from './pages/ChatPage'
import TrackingPage           from './pages/TrackingPage'
import PaymentPage            from './pages/PaymentPage'
import ProfessionalProfilePage from './pages/ProfessionalProfilePage'
import ClientProfilePage      from './pages/ClientProfilePage'
import AdminPage              from './pages/AdminPage'
import WorkDonePage           from './pages/WorkDonePage'
import Navbar                 from './components/Navbar'
import BottomNav              from './components/BottomNav'
import SplashScreen           from './components/SplashScreen'
import TutorialTour           from './components/TutorialTour'
import { ExoticOrderNotification, OrderDetailsModal } from './pages/OrdersPage'
import LocalesPage            from './locales/LocalesPage'
import LocalDetalle           from './locales/LocalDetalle'
import CrearLocal             from './locales/CrearLocal'   // ✅ AGREGADO
import './App.css'

const TOUR_KEY = 'listo_tour_done'
const PAGES_WITH_BOTTOM_NAV = ['home','services','search','orders','profile','workdone','locales']
const PAGES_WITH_TOP_NAV    = ['login','register']

/* ── Modal Mensaje Bono/Regalo ───────────────────────────────────────────── */
function BonusMessageModal({ bonus, userId, onClose }) {
  const [closing, setClosing] = useState(false);

  const handleClose = async () => {
    setClosing(true);
    if (userId) {
      try {
        await updateDoc(doc(db, 'users', userId), { bonusMessage: null });
      } catch (e) {
        console.error('Error limpiando bonus', e);
      }
    }
    setTimeout(onClose, 300);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      opacity: closing ? 0 : 1, transition: 'opacity 0.3s'
    }}>
      <div style={{
        width: '100%', maxWidth: '360px', borderRadius: '24px', padding: '32px 24px',
        background: 'linear-gradient(135deg, #1A1A2E, #2A2A4A)', border: '2px solid #F26000',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', textAlign: 'center',
        transform: closing ? 'scale(0.9)' : 'scale(1)', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        <span style={{ fontSize: '64px', display: 'block', marginBottom: '16px' }}>🎁</span>
        <h2 style={{ color: '#FFF', margin: '0 0 12px', fontSize: '24px', fontWeight: '900' }}>¡Tienes un Regalo!</h2>
        <p style={{ color: '#E2E8F0', fontSize: '15px', lineHeight: '1.5', margin: '0 0 24px' }}>
          {bonus?.message || 'Has recibido un bono especial de la administración.'}
        </p>
        <div style={{ background: 'rgba(242,96,0,0.15)', border: '1px dashed #F26000', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
          <p style={{ margin: 0, color: '#FFF', fontSize: '18px', fontWeight: 'bold' }}>
            +{bonus?.amount || 0} Contratos 📄
          </p>
        </div>
        <button
          onClick={handleClose}
          style={{
            width: '100%', padding: '16px', borderRadius: '14px', border: 'none',
            background: 'linear-gradient(135deg, #F26000, #FF8C42)', color: '#fff',
            fontSize: '16px', fontWeight: '800', cursor: 'pointer',
            boxShadow: '0 8px 16px rgba(242,96,0,0.3)'
          }}
        >
          ¡Aceptar Regalo!
        </button>
      </div>
    </div>
  );
}

/* ── Banner mensaje nuevo ────────────────────────────────────────────────── */
function ChatMessageBanner({ sender, text, onClose, onClick }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line

  return (
    <>
      <style>{`
        @keyframes bannerSlideDown {
          from { transform: translateX(-50%) translateY(-110%); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);     opacity: 1; }
        }
      `}</style>
      <div onClick={onClick} style={{
        position: 'fixed', top: 16, left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: 440,
        background: '#1A1A2E', color: '#fff',
        borderRadius: 16, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        zIndex: 9999, cursor: 'pointer',
        animation: 'bannerSlideDown .4s cubic-bezier(.32,1.2,.5,1)',
      }}>
        <div style={{
          width: 42, height: 42, borderRadius: '50%', background: '#F26000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0,
        }}>💬</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#FFD4B0' }}>{sender}</p>
          <p style={{ margin: 0, fontSize: 13, color: '#ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {text}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#F26000', fontWeight: 700 }}>
            Toca para responder en Pedidos →
          </p>
        </div>
        <button onClick={e => { e.stopPropagation(); onClose() }} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
          borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>✕</button>
      </div>
    </>
  )
}

function OfflineBanner({ lang }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, background: '#EF4444', color: '#fff',
      textAlign: 'center', padding: '10px', fontSize: '13px', fontWeight: 'bold', zIndex: 100000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
    }}>
      <span>⚠️</span>
      {lang === 'es' ? 'Sin conexión a internet. Verificando red...' : 'No internet connection. Checking network...'}
    </div>
  )
}

function UpdateBlocker({ lang }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#fff', zIndex: 1000000,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 30, textAlign: 'center'
    }}>
      <div style={{ fontSize: 60, marginBottom: 20 }}>🔄</div>
      <h2 style={{ color: '#1A1A2E', marginBottom: 10, fontSize: 24, fontWeight: 900 }}>{lang === 'es' ? 'Actualización Requerida' : 'Update Required'}</h2>
      <p style={{ color: '#666', marginBottom: 30, fontSize: 15, lineHeight: 1.5 }}>
        {lang === 'es' 
          ? 'Hemos lanzado una nueva versión obligatoria de la aplicación para mejorar tu experiencia y seguridad. Por favor, actualiza.' 
          : 'We have released a new mandatory update. Please update from the store.'}
      </p>
      <button onClick={() => window.open('https://play.google.com/store/apps/details?id=com.listopatron.app', '_blank')} style={{
        background: 'linear-gradient(135deg, #F26000, #FF8C42)', color: '#fff', border: 'none',
        padding: '16px 32px', borderRadius: 16, fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
        boxShadow: '0 8px 24px rgba(242, 96, 0, 0.3)'
      }}>
        {lang === 'es' ? 'Actualizar ahora' : 'Update now'}
      </button>
    </div>
  )
}

export default function App() {
  const [showSplash,      setShowSplash]      = useState(true)
  const [currentPage,     setCurrentPage]     = useState('login')
  const [lang,            setLang]            = useState('es')
  const [selectedPro,     setSelectedPro]     = useState(null)
  const [selectedLocal,   setSelectedLocal]   = useState(null)
  const [showTour,        setShowTour]        = useState(false)
  const [authReady,       setAuthReady]       = useState(false)
  const [userData,        setUserData]        = useState(null)
  const [userRole,        setUserRole]        = useState('user')
  const [profileInitScreen, setProfileInitScreen] = useState(null)
  const [profileComplete, setProfileComplete] = useState(false)
  const [alertOrder,        setAlertOrder]        = useState(null)
  const [detailsModalOrder, setDetailsModalOrder] = useState(null)
  const [notifiedOrderIds,  setNotifiedOrderIds]  = useState(new Set())
  const [jobDoneAlert,      setJobDoneAlert]      = useState(null)
  const [chatBanner,        setChatBanner]        = useState(null)
  const [isOffline,         setIsOffline]         = useState(!navigator.onLine)
  const [updateRequired,    setUpdateRequired]    = useState(false)

  const CURRENT_APP_VERSION = '1.0.0'

  const alertAudioRef      = useRef(null)
  const isPlayingRef       = useRef(false)
  const alertActiveRef     = useRef(false)
  const listenerReadyRef   = useRef(false)
  const jobDoneNotifIdsRef = useRef(new Set())
  const notifiedMsgIds     = useRef(new Set())
  const banneredChatIds    = useRef(new Set())
  const chatListenerReady  = useRef(false)
  const currentPageRef     = useRef('login')

  useEffect(() => { currentPageRef.current = currentPage }, [currentPage])

  // ─── OFFLINE & UPDATE CHECK ───────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline) }
  }, [])

  useEffect(() => {
    import('firebase/firestore').then(({ doc: fd, getDoc }) => {
      getDoc(fd(db, 'settings', 'appConfig')).then(snap => {
        if (snap.exists()) {
          const minV = snap.data().minVersion
          if (minV && minV > CURRENT_APP_VERSION) setUpdateRequired(true)
        }
      }).catch(() => {})
    })
  }, [])

  // ─── AUDIO ───────────────────────────────────────────────────────────────
  const startAlertSound = () => {
    if (isPlayingRef.current) return
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
      audio.volume = 0.6; audio.loop = true
      audio.play().catch(() => {})
      alertAudioRef.current = audio; isPlayingRef.current = true
    } catch (e) {}
  }
  const stopAlertSound = () => {
    try {
      if (alertAudioRef.current) {
        alertAudioRef.current.pause(); alertAudioRef.current.currentTime = 0; alertAudioRef.current = null
      }
    } catch (e) {}
    isPlayingRef.current = false; alertActiveRef.current = false
  }
  const playJobDoneSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
      audio.volume = 0.7; audio.loop = true; audio.play().catch(() => {})
      setTimeout(() => { audio.pause(); audio.currentTime = 0 }, 30000)
    } catch (e) {}
  }
  const playMsgSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')
      audio.volume = 0.45; audio.loop = false
      audio.play().catch(() => {})
      setTimeout(() => { try { audio.pause(); audio.currentTime = 0 } catch(e){} }, 1200)
    } catch (e) {}
  }

  // ─── AUTH ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let unsubSnap = null
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubSnap) { unsubSnap(); unsubSnap = null }
      if (firebaseUser) {
        unsubSnap = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data()
            const fullData = { ...data, uid: firebaseUser.uid, email: firebaseUser.email }
            setUserData(fullData)
            setUserRole(data.type === 'pro' ? 'pro' : 'user')
            localStorage.setItem('listoUserData', JSON.stringify(fullData))
            setProfileComplete(data.profileComplete || false)

            if (Capacitor.isNativePlatform()) {
              PushNotifications.requestPermissions().then(result => {
                if (result.receive === 'granted') PushNotifications.register()
              })
              PushNotifications.removeAllListeners().then(() => {
                PushNotifications.addListener('registration', token => {
                  updateDoc(doc(db, 'users', firebaseUser.uid), { fcmToken: token.value }).catch(()=>{})
                })
                PushNotifications.addListener('pushNotificationActionPerformed', () => {
                  setCurrentPage('orders')
                })
              })
            }
          }
          setAuthReady(true)
        }, () => setAuthReady(true))
      } else {
        setUserData(null); setUserRole('user'); setProfileComplete(false)
        setAuthReady(true)
        if (!showSplash) setCurrentPage('login')
      }
    })
    return () => { unsubAuth(); if (unsubSnap) unsubSnap() }
  }, []) // eslint-disable-line

  // ─── LISTENER MENSAJES NUEVOS ─────────────────────────────────────────────
  useEffect(() => {
    if (!authReady || !userData) return
    const q = query(collection(db, 'chats'), where('members', 'array-contains', userData.uid))
    const unsubMap = new Map()
    const unsubChats = onSnapshot(q, (chatsSnap) => {
      chatsSnap.forEach(chatDoc => {
        const chatId = chatDoc.id
        if (unsubMap.has(chatId)) return
        const msgQ = query(collection(db, 'chats', chatId, 'messages'), where('senderId', '!=', userData.uid))
        let isFirstLoad = true
        const unsubMsg = onSnapshot(msgQ, async (msgsSnap) => {
          if (isFirstLoad) {
            msgsSnap.forEach(d => notifiedMsgIds.current.add(d.id))
            isFirstLoad = false
            return
          }
          let hasNew = false; let lastMsg = null
          msgsSnap.forEach(msgDoc => {
            if (notifiedMsgIds.current.has(msgDoc.id)) return
            notifiedMsgIds.current.add(msgDoc.id)
            hasNew = true; lastMsg = msgDoc.data()
          })
          if (!hasNew || !lastMsg) return
          const page = currentPageRef.current
          if (page === 'orders' || page === 'chat') { playMsgSound(); return }
          if (banneredChatIds.current.has(chatId)) { playMsgSound(); return }
          let senderName = 'Profesional'
          try {
            const uSnap = await getDocs(query(collection(db, 'users'), where('__name__', '==', lastMsg.senderId)))
            if (!uSnap.empty) senderName = uSnap.docs[0].data().name || senderName
          } catch(e) {}
          banneredChatIds.current.add(chatId)
          playMsgSound()
          setChatBanner({ sender: senderName, text: lastMsg.text || '📎 Mensaje', chatId })
        })
        unsubMap.set(chatId, unsubMsg)
      })
    })
    return () => { unsubChats(); unsubMap.forEach(fn => fn()); unsubMap.clear() }
  }, [authReady, userData]) // eslint-disable-line

  useEffect(() => {
    if (currentPage === 'orders') banneredChatIds.current.clear()
  }, [currentPage])

  // ─── LISTENER job_done ────────────────────────────────────────────────────
  useEffect(() => {
    if (!authReady || !userData || userRole !== 'user') return
    const q = query(collection(db, 'notificaciones'), where('userId', '==', userData.uid), where('type', '==', 'job_done'))
    let initialized = false
    const existingIds = new Set()
    const unsub = onSnapshot(q, (snapshot) => {
      if (!initialized) {
        snapshot.forEach(d => existingIds.add(d.id))
        jobDoneNotifIdsRef.current = existingIds
        initialized = true; return
      }
      snapshot.forEach(docSnap => {
        if (jobDoneNotifIdsRef.current.has(docSnap.id)) return
        jobDoneNotifIdsRef.current.add(docSnap.id)
        const d = docSnap.data()
        updateDoc(doc(db, 'notificaciones', docSnap.id), { read: true }).catch(() => {})
        playJobDoneSound()
        setJobDoneAlert({ notifId: docSnap.id, orderId: d.orderId || null, title: d.title, text: d.text })
      })
    })
    return () => unsub()
  }, [authReady, userData, userRole])

  // ─── LISTENER ÓRDENES ────────────────────────────────────────────────────
  useEffect(() => {
    if (!authReady || !userData) return
    let unsubscribeOrders = () => {}
    const setupListener = async () => {
      if (userRole === 'pro') {
        const q = query(collection(db, 'orders'), where('proId', '==', userData.uid), where('status', '==', 'pending'))
        const existingSnap = await getDocs(q)
        const existingIds = new Set()
        existingSnap.forEach(d => existingIds.add(d.id))
        setNotifiedOrderIds(existingIds)
        listenerReadyRef.current = true
        unsubscribeOrders = onSnapshot(q, (snapshot) => {
          if (!listenerReadyRef.current || alertActiveRef.current) return
          const newPendings = []
          snapshot.forEach(docSnap => {
            if (existingIds.has(docSnap.id)) return
            const d = docSnap.data()
            newPendings.push({ id: docSnap.id, pro: d.clientName || d.clientEmail || 'Cliente', specialty: d.proSpecialty || 'Servicio', avatar: d.clientName ? d.clientName.substring(0,2).toUpperCase() : '👤', photoURL: d.clientPhotoURL || null, date: `${d.dateToken} - ${d.timeToken}`, price: d.price || 'RD$0', status: d.status || 'pending', icon: '🔧', clientAddress: d.clientAddress || d.address || '', ...d })
          })
          if (newPendings.length > 0) {
            newPendings.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
            const newest = newPendings[0]
            setNotifiedOrderIds(prev => {
              if (!prev.has(newest.id)) {
                alertActiveRef.current = true; startAlertSound(); setAlertOrder(newest)
                const nextSet = new Set(prev); nextSet.add(newest.id); return nextSet
              }
              return prev
            })
          }
        })
      } else if (userRole === 'user') {
        const q = query(collection(db, 'orders'), where('clientId', '==', userData.uid), where('status', 'in', ['accepted', 'onway']))
        const existingSnap = await getDocs(q)
        const existingIds = new Set()
        existingSnap.forEach(d => existingIds.add(d.id + '_accepted'))
        setNotifiedOrderIds(existingIds)
        listenerReadyRef.current = true
        unsubscribeOrders = onSnapshot(q, (snapshot) => {
          if (!listenerReadyRef.current) return
          const activeOrders = []
          snapshot.forEach(docSnap => {
            if (existingIds.has(docSnap.id + '_accepted')) return
            const d = docSnap.data()
            activeOrders.push({ id: docSnap.id, pro: d.proName || 'Profesional', specialty: d.proSpecialty || 'Servicio', avatar: d.proAvatar || 'P', photoURL: d.proPhotoURL || null, date: `${d.dateToken} - ${d.timeToken}`, price: d.price || 'RD$0', status: d.status, ...d })
          })
          if (activeOrders.length > 0) {
            activeOrders.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0))
            const newest = activeOrders[0]
            setNotifiedOrderIds(prev => {
              if (!prev.has(newest.id + '_accepted')) {
                setAlertOrder({ ...newest, isUserAlert: true })
                const nextSet = new Set(prev); nextSet.add(newest.id + '_accepted'); return nextSet
              }
              return prev
            })
          }
        })
      }
    }
    listenerReadyRef.current = false
    setupListener()
    return () => { listenerReadyRef.current = false; unsubscribeOrders() }
  }, [authReady, userData, userRole])

  // ─── NAVIGATE ─────────────────────────────────────────────────────────────
  const navigate = (page, data) => {
    if (page === 'localDetalle' && data) {
      setSelectedLocal(data)
      setCurrentPage('localDetalle')
      return
    }
    if (data?.professional) setSelectedPro(data.professional)
    if (data && !data.user && !data.professional && page !== 'profile') setSelectedPro(data)
    if (page === 'profile' && data?.screen) setProfileInitScreen(data.screen)
    else if (page === 'profile') setProfileInitScreen(null)
    if (page === 'home' && !localStorage.getItem(TOUR_KEY)) setTimeout(() => setShowTour(true), 800)
    setCurrentPage(page)
  }

  const handleLogout = async () => {
    await signOut(auth)
    stopAlertSound()
    setUserData(null); setUserRole('user'); setProfileComplete(false)
    setCurrentPage('login')
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => { setShowSplash(false); setCurrentPage(userData ? 'home' : 'login') }} lang={lang} />
  }

  if (!authReady) return null

  const showBottom  = PAGES_WITH_BOTTOM_NAV.includes(currentPage)
  const showTop     = PAGES_WITH_TOP_NAV.includes(currentPage)
  const commonProps = { lang, navigate }
  const userProps   = { ...commonProps, userData, userRole }

  if (updateRequired) return <UpdateBlocker lang={lang} />

  return (
    <div className="app">
      {isOffline && <OfflineBanner lang={lang} />}

      {showTop && <Navbar navigate={navigate} currentPage={currentPage} lang={lang} setLang={setLang} />}

      {currentPage === 'home'         && <HomePage     {...userProps} />}
      {currentPage === 'services'     && <ServicesPage {...commonProps} />}
      {currentPage === 'search'       && <SearchPage   {...userProps} initialCategory={selectedPro?.catToSelect || 'all'} />}
      {currentPage === 'orders'       && <OrdersPage   {...userProps} />}
      {currentPage === 'login'        && <LoginPage    {...commonProps} />}
      {currentPage === 'register'     && <RegisterPage {...commonProps} />}
      {currentPage === 'workdone'     && <WorkDonePage {...commonProps} userRole={userRole} userData={userData} professional={selectedPro} />}
      {currentPage === 'admin'        && <AdminPage    {...commonProps} />}
      {currentPage === 'locales'      && <LocalesPage  {...userProps} />}
      {currentPage === 'localDetalle' && <LocalDetalle {...userProps} local={selectedLocal} />}
      {currentPage === 'crearLocal'   && <CrearLocal   {...userProps} />}  {/* ✅ AGREGADO */}

      {currentPage === 'booking'       && <BookingPage             {...userProps}   professional={selectedPro} />}
      {currentPage === 'chat'          && <ChatPage                {...commonProps} professional={selectedPro} userData={userData} />}
      {currentPage === 'tracking'      && <TrackingPage            {...userProps}   professional={selectedPro} />}
      {currentPage === 'payment'       && <PaymentPage             {...commonProps} professional={selectedPro} />}
      {currentPage === 'proProfile'    && <ProfessionalProfilePage {...commonProps} professional={selectedPro} />}
      {currentPage === 'clientProfile' && <ClientProfilePage       {...commonProps} userData={userData} onEditProfile={() => navigate('profile')} />}

      {currentPage === 'profile' && (
        <ProfilePage lang={lang} setLang={setLang} navigate={navigate} userData={userData} userRole={userRole}
          profileComplete={profileComplete} onProfileCompleted={() => setProfileComplete(true)} onLogout={handleLogout} initialScreen={profileInitScreen} />
      )}

      {showBottom && <BottomNav currentPage={currentPage} navigate={navigate} lang={lang} userData={userData} />}

      {showTour && (
        <TutorialTour lang={lang} onFinish={() => { setShowTour(false); localStorage.setItem(TOUR_KEY, 'true') }} />
      )}

      {userData?.bonusMessage && (
        <BonusMessageModal bonus={userData.bonusMessage} userId={userData.uid} onClose={() => {}} />
      )}

      {chatBanner && (
        <ChatMessageBanner
          sender={chatBanner.sender} text={chatBanner.text}
          onClose={() => setChatBanner(null)}
          onClick={() => { setChatBanner(null); navigate('orders') }}
        />
      )}

      {alertOrder && !alertOrder.isUserAlert && (
        <ExoticOrderNotification
          order={alertOrder} lang={lang}
          onClick={() => { stopAlertSound(); setDetailsModalOrder(alertOrder); setAlertOrder(null) }}
          onClose={() => { stopAlertSound(); setAlertOrder(null) }}
        />
      )}

      {alertOrder && alertOrder.isUserAlert && (
        <div className="exotic-notif-container" onClick={() => { navigate('tracking', alertOrder); setAlertOrder(null) }}>
          <div className="exotic-notif-glow" style={{ background: 'linear-gradient(135deg, #10B981, #34D399, #059669)' }} />
          <div className="exotic-notif-content" style={{ border: '1px solid #34D399' }}>
            <button className="exotic-notif-close" onClick={e => { e.stopPropagation(); setAlertOrder(null) }}>✕</button>
            <div className="exotic-notif-icon-wrap" style={{ background: '#ECFDF5' }}>
              <div className="exotic-notif-pulse" style={{ background: '#10B981' }} />
              <span className="exotic-notif-icon">✅</span>
            </div>
            <div className="exotic-notif-text">
              <h4 className="exotic-title" style={{ color: '#065F46' }}>Pedido Aceptado</h4>
              <p className="exotic-desc">¡{alertOrder.pro} va en camino!</p>
              <div className="exotic-user">
                <span className="exotic-avatar" style={{ background: '#10B981' }}>{alertOrder.avatar}</span>
                <span className="exotic-name">{alertOrder.pro}</span>
                <span className="exotic-action" style={{ color: '#10B981' }}>Empezar Rastreo →</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {jobDoneAlert && (
        <div className="exotic-notif-container" onClick={() => { setJobDoneAlert(null); navigate('orders') }}>
          <div className="exotic-notif-glow" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #A78BFA)' }} />
          <div className="exotic-notif-content" style={{ border: '1px solid #8B5CF6' }}>
            <button className="exotic-notif-close" onClick={e => { e.stopPropagation(); setJobDoneAlert(null) }}>✕</button>
            <div className="exotic-notif-icon-wrap" style={{ background: '#EDE9FE' }}>
              <div className="exotic-notif-pulse" style={{ background: '#8B5CF6' }} />
              <span className="exotic-notif-icon">🎉</span>
            </div>
            <div className="exotic-notif-text">
              <h4 className="exotic-title" style={{ color: '#4C1D95' }}>{lang === 'es' ? '¡Trabajo Terminado!' : 'Work Done!'}</h4>
              <p className="exotic-desc">{lang === 'es' ? 'El profesional completó el servicio. ¡Procede al pago!' : 'Service completed. Proceed to payment!'}</p>
              <div className="exotic-user">
                <span className="exotic-avatar" style={{ background: '#8B5CF6' }}>💳</span>
                <span className="exotic-action" style={{ color: '#8B5CF6' }}>{lang === 'es' ? 'Ver mis pedidos →' : 'View orders →'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailsModalOrder && (
        <OrderDetailsModal
          order={detailsModalOrder} lang={lang}
          onClose={() => setDetailsModalOrder(null)}
          onAccept={(id) => {
            stopAlertSound()
            import('firebase/firestore').then(({ updateDoc, doc: fd }) => {
              updateDoc(fd(db, 'orders', id), { status: 'accepted' })
              setDetailsModalOrder(null)
              navigate('tracking', { ...detailsModalOrder, status: 'accepted' })
            })
          }}
          onDecline={(id) => {
            stopAlertSound()
            import('firebase/firestore').then(({ updateDoc, doc: fd }) => {
              updateDoc(fd(db, 'orders', id), { status: 'cancelled' })
              setDetailsModalOrder(null)
            })
          }}
        />
      )}
    </div>
  )
}
