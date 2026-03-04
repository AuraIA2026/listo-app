import logoImg from '../assets/logo_listo.png'
import './Navbar.css'

const t = {
  es: { services: 'Servicios', login: 'Iniciar sesión', register: 'Registrarse', tagline: 'Profesionales a tu puerta' },
  en: { services: 'Services', login: 'Log in', register: 'Sign up', tagline: 'Professionals at your door' }
}

export default function Navbar({ navigate, currentPage, lang, setLang }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo" onClick={() => navigate('services')}>
          <img src={logoImg} alt="Listo" className="logo-img" />
          <span className="logo-tag">{t[lang].tagline}</span>
        </div>

        <div className="navbar-actions">
          <button
            className={`lang-toggle ${lang === 'es' ? 'active' : ''}`}
            onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </button>
          <button
            className={`btn-ghost ${currentPage === 'login' ? 'active' : ''}`}
            onClick={() => navigate('login')}
          >
            {t[lang].login}
          </button>
          <button
            className={`btn-primary ${currentPage === 'register' ? 'active' : ''}`}
            onClick={() => navigate('register')}
          >
            {t[lang].register}
          </button>
        </div>
      </div>
    </nav>
  )
}
