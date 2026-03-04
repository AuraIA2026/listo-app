import { useState } from 'react'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import SearchPage from './pages/SearchPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BookingPage from './pages/BookingPage'
import ChatPage from './pages/ChatPage'
import TrackingPage from './pages/TrackingPage'
import PaymentPage from './pages/PaymentPage'
import ProfessionalProfilePage from './pages/ProfessionalProfilePage'
import AdminPage from './pages/AdminPage'
import WorkDonePage from './pages/WorkDonePage'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import SplashScreen from './components/SplashScreen'
import TutorialTour from './components/TutorialTour'
import './App.css'

const TOUR_KEY = 'listo_tour_done'
const PAGES_WITH_BOTTOM_NAV = ['home', 'services', 'search', 'orders', 'profile', 'workdone']
const PAGES_WITH_TOP_NAV = ['login', 'register']

export default function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [currentPage, setCurrentPage] = useState('login')
  const [lang, setLang] = useState('es')
  const [selectedPro, setSelectedPro] = useState(null)
  const [userRole, setUserRole] = useState('client')
  const [showTour, setShowTour] = useState(false)

  const navigate = (page, data) => {
    if (data?.professional) setSelectedPro(data.professional)
    if (data?.user?.type) setUserRole(data.user.type)
    if (data && !data.user && !data.professional) setSelectedPro(data)

    if (page === 'home' && !localStorage.getItem(TOUR_KEY)) {
      setTimeout(() => setShowTour(true), 800)
    }

    setCurrentPage(page)
  }

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={(page) => {
          setShowSplash(false)
          setCurrentPage(page || 'login')
        }}
        lang={lang}
      />
    )
  }

  const showBottom = PAGES_WITH_BOTTOM_NAV.includes(currentPage)
  const showTop    = PAGES_WITH_TOP_NAV.includes(currentPage)

  return (
    <div className="app">
      {showTop && <Navbar navigate={navigate} currentPage={currentPage} lang={lang} setLang={setLang} />}

      {currentPage === 'home'       && <HomePage                lang={lang} navigate={navigate} userRole={userRole} />}
      {currentPage === 'services'   && <ServicesPage            lang={lang} navigate={navigate} />}
      {currentPage === 'search'     && <SearchPage              lang={lang} navigate={navigate} />}
      {currentPage === 'orders'     && <OrdersPage              lang={lang} navigate={navigate} />}
      {currentPage === 'profile'    && <ProfilePage             lang={lang} setLang={setLang} navigate={navigate} userRole={userRole} />}
      {currentPage === 'login'      && <LoginPage               lang={lang} navigate={navigate} />}
      {currentPage === 'register'   && <RegisterPage            lang={lang} navigate={navigate} />}
      {currentPage === 'booking'    && <BookingPage             lang={lang} navigate={navigate} professional={selectedPro} />}
      {currentPage === 'chat'       && <ChatPage                lang={lang} navigate={navigate} professional={selectedPro} />}
      {currentPage === 'tracking'   && <TrackingPage            lang={lang} navigate={navigate} professional={selectedPro} />}
      {currentPage === 'payment'    && <PaymentPage             lang={lang} navigate={navigate} professional={selectedPro} />}
      {currentPage === 'proProfile' && <ProfessionalProfilePage lang={lang} navigate={navigate} professional={selectedPro} />}
      {currentPage === 'admin'      && <AdminPage               lang={lang} navigate={navigate} />}
      {currentPage === 'workdone'   && <WorkDonePage            lang={lang} navigate={navigate} />}

      {showBottom && <BottomNav currentPage={currentPage} navigate={navigate} lang={lang} />}

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