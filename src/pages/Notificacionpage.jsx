import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import ChatPage from './pages/ChatPage';
import TrackingPage from './pages/TrackingPage';
import VerificacionPage from './pages/VerificacionPage';
import WorkDonePage from './pages/WorkDonePage';
import ProfessionalProfilePage from './pages/ProfessionalProfilePage';
import AdminPage from './pages/AdminPage';
import NotificacionPage from './pages/notificacionpage'; // ← CORREGIDO
import AdminPanelPage from './pages/AdminPanelPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [lang, setLang] = useState('es');

  // Atajos de teclado para entrar a admin (A + A + A)
  useEffect(() => {
    let aCount = 0;
    let lastTime = 0;

    const handleKeyPress = (e) => {
      const now = Date.now();
      
      // Reset si pasó más de 1 segundo desde el último
      if (now - lastTime > 1000) {
        aCount = 0;
      }

      if (e.key && e.key.toLowerCase() === 'a') { // ← AGREGUÉ VALIDACIÓN
        aCount++;
        lastTime = now;

        if (aCount === 3) {
          const userRole = localStorage.getItem('userRole');
          if (userRole === 'admin') {
            setCurrentPage('adminPanel'); // ← CAMBIÉ A 'adminPanel'
            console.log('🔓 Entrando a Centro de Control Admin');
          } else {
            console.log('❌ No tienes permisos de admin');
          }
          aCount = 0;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <>
      {currentPage === 'login' && <LoginPage setCurrentPage={setCurrentPage} lang={lang} setLang={setLang} />}
      {currentPage === 'register' && <RegisterPage setCurrentPage={setCurrentPage} lang={lang} setLang={setLang} />}
      {currentPage === 'booking' && <BookingPage setCurrentPage={setCurrentPage} lang={lang} />}
      {currentPage === 'chat' && <ChatPage setCurrentPage={setCurrentPage} lang={lang} />}
      {currentPage === 'tracking' && <TrackingPage setCurrentPage={setCurrentPage} lang={lang} />}
      {currentPage === 'verificacion' && <VerificacionPage setCurrentPage={setCurrentPage} lang={lang} />}
      {currentPage === 'workdone' && <WorkDonePage setCurrentPage={setCurrentPage} lang={lang} />}
      {currentPage === 'profProfile' && <ProfessionalProfilePage setCurrentPage={setCurrentPage} lang={lang} />}
      {currentPage === 'admin' && <AdminPage setCurrentPage={setCurrentPage} lang={lang} />}
      {currentPage === 'notificaciones' && <NotificacionPage setCurrentPage={setCurrentPage} lang={lang} />}
      {currentPage === 'adminPanel' && <AdminPanelPage setCurrentPage={setCurrentPage} />}
    </>
  );
}

export default App;