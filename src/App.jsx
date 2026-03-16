import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from './firebase'

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
import { collection, query, where } from 'firebase/firestore'
import './App.css'

const TOUR_KEY = 'listo_tour_done'
const PAGES_WITH_BOTTOM_NAV = ['home','services','search','orders','profile','workdone']
const PAGES_WITH_TOP_NAV    = ['login','register']

export default function App() {
  const [showSplash,      setShowSplash]      = useState(true)
  const [currentPage,     setCurrentPage]     = useState('login')
  const [lang,            setLang]            = useState('es')
  const [selectedPro,     setSelectedPro]     = useState(null)
  const [showTour,        setShowTour]        = useState(false)
  const [authReady,       setAuthReady]       = useState(false)

  // ── Estado central del usuario ──────────────────────────
  const [userData,        setUserData]        = useState(null)
  const [userRole,        setUserRole]        = useState('user')
  const [profileComplete, setProfileComplete] = useState(false)

  // ── Estados Alerta Exótica Global (Para Profesionales) ──
  const [alertOrder, setAlertOrder]                 = useState(null) 
  const [detailsModalOrder, setDetailsModalOrder]   = useState(null) 
  const [notifiedOrderIds, setNotifiedOrderIds]     = useState(new Set())

  // ── onAuthStateChanged + onSnapshot: fuente única de verdad ──
  useEffect(() => {
    let unsubSnap = null

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubSnap) { unsubSnap(); unsubSnap = null }

      if (firebaseUser) {
        unsubSnap = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              const data = snap.data()
              const fullData = {
                ...data,
                uid:   firebaseUser.uid,
                email: firebaseUser.email,
              }
              setUserData(fullData)
              setUserRole(data.type === 'pro' ? 'pro' : 'user')
              localStorage.setItem('listoUserData', JSON.stringify(fullData))
              setProfileComplete(data.profileComplete || false)
            }
            setAuthReady(true)
          },
          (err) => {
            console.error('App onSnapshot error:', err)
            setAuthReady(true)
          }
        )
      } else {
        setUserData(null)
        setUserRole('user')
        setProfileComplete(false)
        setAuthReady(true)
        if (!showSplash) setCurrentPage('login')
      }
    })

    return () => {
      unsubAuth()
      if (unsubSnap) unsubSnap()
    }
  }, []) // eslint-disable-line

  // ── Notificaciones Globales de Pedidos (Para Profesionales y Usuarios) ──
  useEffect(() => {
    if (!authReady || !userData) return
    let unsubscribeOrders = () => {}

    if (userRole === 'pro') {
      const q = query(collection(db, 'orders'), where('proId', '==', userData.uid), where('status', '==', 'pending'))
      unsubscribeOrders = onSnapshot(q, (snapshot) => {
         const newPendings = []
         snapshot.forEach(docSnap => {
           const d = docSnap.data()
           newPendings.push({
             id: docSnap.id,
             pro: d.clientName || d.clientEmail || 'Cliente', 
             specialty: d.proSpecialty || 'Servicio',
             avatar: d.clientName ? d.clientName.substring(0, 2).toUpperCase() : '👤',
             photoURL: d.clientPhotoURL || null,
             date: `${d.dateToken} - ${d.timeToken}`,
             price: d.price || 'RD$0',
             status: d.status || 'pending',
             icon: '🔧',
             clientAddress: d.clientAddress || d.address || '',
             ...d
           })
         })

         if (newPendings.length > 0) {
           newPendings.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
           const newest = newPendings[0]
           setNotifiedOrderIds(prev => {
             if (!prev.has(newest.id)) {
               setAlertOrder(newest)
               const nextSet = new Set(prev)
               nextSet.add(newest.id)
               return nextSet
             }
             return prev
           })
         }
      })
    } else if (userRole === 'user') {
      // Como usuario observamos si alguna orden pasó a 'accepted' o 'onway'
      const q = query(collection(db, 'orders'), where('clientId', '==', userData.uid), where('status', 'in', ['accepted', 'onway']))
      unsubscribeOrders = onSnapshot(q, (snapshot) => {
         const activeOrders = []
         snapshot.forEach(docSnap => {
           const d = docSnap.data()
           activeOrders.push({
             id: docSnap.id,
             pro: d.proName || 'Profesional',
             specialty: d.proSpecialty || 'Servicio',
             avatar: d.proAvatar || 'P',
             photoURL: d.proPhotoURL || null,
             date: `${d.dateToken} - ${d.timeToken}`,
             price: d.price || 'RD$0',
             status: d.status,
             ...d
           })
         })

         // Si la orden fue aceptada por el pro, avisarle al usuario
         if (activeOrders.length > 0) {
           activeOrders.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
           const newest = activeOrders[0]
           setNotifiedOrderIds(prev => {
             if (!prev.has(newest.id + '_accepted')) {
               // Construimos una notificacion diferente para el usuario
               setAlertOrder({
                 ...newest,
                 isUserAlert: true, // flag
               })
               const nextSet = new Set(prev)
               nextSet.add(newest.id + '_accepted')
               return nextSet
             }
             return prev
           })
         }
      })
    }

    return () => unsubscribeOrders()
  }, [authReady, userData, userRole])

  const navigate = (page, data) => {
    if (data?.professional) setSelectedPro(data.professional)
    if (data && !data.user && !data.professional) setSelectedPro(data)
    if (page === 'home' && !localStorage.getItem(TOUR_KEY)) {
      setTimeout(() => setShowTour(true), 800)
    }
    setCurrentPage(page)
  }

  const handleLogout = async () => {
    await signOut(auth)
    setUserData(null)
    setUserRole('user')
    setProfileComplete(false)
    setCurrentPage('login')
  }

  // ── Splash ───────────────────────────────────────────────
  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => {
          setShowSplash(false)
          setCurrentPage(userData ? 'home' : 'login')
        }}
        lang={lang}
      />
    )
  }

  if (!authReady) return null

  const showBottom = PAGES_WITH_BOTTOM_NAV.includes(currentPage)
  const showTop    = PAGES_WITH_TOP_NAV.includes(currentPage)

  // Props comunes que muchas páginas necesitan
  const commonProps = { lang, navigate }
  const userProps   = { ...commonProps, userData, userRole }

  return (
    <div className="app">
      {showTop && (
        <Navbar
          navigate={navigate}
          currentPage={currentPage}
          lang={lang}
          setLang={setLang}
        />
      )}

      {currentPage === 'home'          && <HomePage          {...userProps} />}
      {currentPage === 'services'      && <ServicesPage      {...commonProps} />}
      {currentPage === 'search'        && <SearchPage        {...commonProps} />}
      {currentPage === 'orders'        && <OrdersPage        {...userProps} />}
      {currentPage === 'login'         && <LoginPage         {...commonProps} />}
      {currentPage === 'register'      && <RegisterPage      {...commonProps} />}
      {currentPage === 'workdone'      && <WorkDonePage      {...commonProps} userRole={userRole} userData={userData} professional={selectedPro} />}
      {currentPage === 'admin'         && <AdminPage         {...commonProps} />}

      {currentPage === 'booking'    && (
        <BookingPage    {...userProps} professional={selectedPro} />
      )}
      {currentPage === 'chat'       && (
        <ChatPage       {...commonProps} professional={selectedPro} />
      )}
      {currentPage === 'tracking'   && (
        <TrackingPage   {...userProps} professional={selectedPro} />
      )}
      {currentPage === 'payment'    && (
        <PaymentPage    {...commonProps} professional={selectedPro} />
      )}
      {currentPage === 'proProfile' && (
        <ProfessionalProfilePage {...commonProps} professional={selectedPro} />
      )}
      {currentPage === 'clientProfile' && (
        <ClientProfilePage
          {...commonProps}
          userData={userData}
          onEditProfile={() => navigate('profile')}
        />
      )}

      {currentPage === 'profile' && (
        <ProfilePage
          lang={lang}
          setLang={setLang}
          navigate={navigate}
          userData={userData}
          userRole={userRole}
          profileComplete={profileComplete}
          onProfileCompleted={() => setProfileComplete(true)}
          onLogout={handleLogout}
        />
      )}

      {showBottom && (
        <BottomNav
          currentPage={currentPage}
          navigate={navigate}
          lang={lang}
          userData={userData}
        />
      )}

      {showTour && (
        <TutorialTour
          lang={lang}
          onFinish={() => {
            setShowTour(false)
            localStorage.setItem(TOUR_KEY, 'true')
          }}
        />
      )}

      {/* Alerta exótica de nuevo pedido flotante GLOBAL */}
      {alertOrder && !alertOrder.isUserAlert && (
        <ExoticOrderNotification 
          order={alertOrder} 
          lang={lang} 
          onClick={() => {
            setDetailsModalOrder(alertOrder)
            setAlertOrder(null)
          }}
          onClose={() => setAlertOrder(null)}
        />
      )}

      {/* Alerta de aceptación para el USUARIO GLOBAL */}
      {alertOrder && alertOrder.isUserAlert && (
        <div className="exotic-notif-container" onClick={() => {
          navigate('tracking', alertOrder)
          setAlertOrder(null)
        }}>
          <div className="exotic-notif-glow" style={{ background: 'linear-gradient(135deg, #10B981, #34D399, #059669)' }}></div>
          <div className="exotic-notif-content" style={{ border: '1px solid #34D399' }}>
            <button className="exotic-notif-close" onClick={(e) => { e.stopPropagation(); setAlertOrder(null); }}>✕</button>
            <div className="exotic-notif-icon-wrap" style={{ background: '#ECFDF5' }}>
              <div className="exotic-notif-pulse" style={{ background: '#10B981' }}></div>
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

      {/* Modal de detalles del pedido (Aceptar/Rechazar) GLOBAL */}
      {detailsModalOrder && (
        <OrderDetailsModal
          order={detailsModalOrder}
          lang={lang}
          onClose={() => setDetailsModalOrder(null)}
          onAccept={(id) => {
            import('firebase/firestore').then(({ updateDoc, doc }) => {
              updateDoc(doc(db, 'orders', id), { status: 'accepted' })
              setDetailsModalOrder(null)
              navigate('tracking', { ...detailsModalOrder, status: 'accepted' }) // Redirigir al tracking
            })
          }}
          onDecline={(id) => {
            import('firebase/firestore').then(({ updateDoc, doc }) => {
              updateDoc(doc(db, 'orders', id), { status: 'cancelled' })
              setDetailsModalOrder(null)
            })
          }}
        />
      )}
    </div>
  )
}