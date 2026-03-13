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
      {currentPage === 'workdone'      && <WorkDonePage      {...commonProps} professional={selectedPro} />}
      {currentPage === 'admin'         && <AdminPage         {...commonProps} />}

      {currentPage === 'booking'    && (
        <BookingPage    {...commonProps} professional={selectedPro} />
      )}
      {currentPage === 'chat'       && (
        <ChatPage       {...commonProps} professional={selectedPro} />
      )}
      {currentPage === 'tracking'   && (
        <TrackingPage   {...commonProps} professional={selectedPro} />
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
    </div>
  )
}