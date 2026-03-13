import { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { useFaceAuth } from '../useFaceAuth'
import './AuthPage.css'
import './FaceModal.css'

const txt = {
  es: {
    title: 'Bienvenido de vuelta',
    sub: 'Inicia sesión en tu cuenta',
    email: 'Correo electrónico',
    password: 'Contraseña',
    forgot: '¿Olvidaste tu contraseña?',
    btn: 'Iniciar sesión',
    loading: 'Entrando...',
    faceBtn: 'Entrar con reconocimiento facial',
    noAccount: '¿No tienes cuenta?',
    register: 'Regístrate',
    asClient: 'Cliente',
    asPro: 'Profesional',
    errEmail: 'Ingresa un correo válido',
    errPass: 'La contraseña debe tener al menos 6 caracteres',
    errInvalid: 'Correo o contraseña incorrectos',
    errWrongType: 'Este correo no corresponde al tipo de cuenta seleccionado',
    faceEmailRequired: 'Ingresa tu correo primero para usar reconocimiento facial',
  },
  en: {
    title: 'Welcome back',
    sub: 'Sign in to your account',
    email: 'Email address',
    password: 'Password',
    forgot: 'Forgot password?',
    btn: 'Sign in',
    loading: 'Signing in...',
    faceBtn: 'Sign in with face recognition',
    noAccount: "Don't have an account?",
    register: 'Sign up',
    asClient: 'Client',
    asPro: 'Professional',
    errEmail: 'Enter a valid email',
    errPass: 'Password must be at least 6 characters',
    errInvalid: 'Incorrect email or password',
    errWrongType: 'This email does not match the selected account type',
    faceEmailRequired: 'Enter your email first to use face recognition',
  }
}

export default function LoginPage({ lang, navigate }) {
  const T    = txt[lang]
  const auth = getAuth()
  const db   = getFirestore()

  const [userType, setUserType] = useState('client')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [showFaceModal, setShowFaceModal] = useState(false)

  const { videoRef, status, message, verifyFace, stopCamera } = useFaceAuth()

  const validate = () => {
    const newErrors = {}
    if (!email.includes('@') || !email.includes('.')) newErrors.email = T.errEmail
    if (password.length < 6) newErrors.pass = T.errPass
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return
    setLoading(true)
    setErrors({})
    try {
      const result   = await signInWithEmailAndPassword(auth, email, password)
      const uid      = result.user.uid

      // ── Leer datos completos del usuario en Firestore ──
      const userDoc  = await getDoc(doc(db, 'users', uid))
      const userData = userDoc.exists() ? userDoc.data() : {}

      // ✅ FIX: usar "type" en lugar de "role"
      const type = userData.type || userType  // "pro" o "client"

      // Validar que el tipo coincida con lo seleccionado
      // "client" en Firestore puede venir como "client" o "user"
      const selectedIsPro    = userType === 'pro'
      const firestoreIsPro   = type === 'pro'

      if (userDoc.exists() && selectedIsPro !== firestoreIsPro) {
        await auth.signOut()
        setErrors({ general: T.errWrongType })
        setLoading(false)
        return
      }

      // Todo OK → navegar con todos los datos del usuario
      navigate('home', {
        user: {
          uid,
          email:           result.user.email,
          name:            userData.name            || '',
          phone:           userData.phone           || '',
          type:            type,
          category:        userData.category        || '',
          profileComplete: userData.profileComplete || false,
          createdAt:       userData.createdAt       || null,
        }
      })

    } catch (err) {
      console.error('Login error:', err)
      setErrors({ general: T.errInvalid })
    }
    setLoading(false)
  }

  const handleFaceLogin = async () => {
    if (!email.includes('@')) {
      setErrors({ email: T.faceEmailRequired })
      return
    }
    setShowFaceModal(true)
    const userId  = email.replace(/[^a-zA-Z0-9]/g, '_')
    const success = await verifyFace(userId)
    if (success) {
      setTimeout(() => {
        setShowFaceModal(false)
        navigate('home', { user: { email, type: userType } })
      }, 1500)
    } else {
      setTimeout(() => setShowFaceModal(false), 2500)
    }
  }

  const closeFaceModal = () => {
    stopCamera()
    setShowFaceModal(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-deco">
          <div className="deco-blob" />
          <div className="auth-quote">
            <span className="quote-icon">✦</span>
            <p>{lang === 'es'
              ? 'Conectamos personas con los mejores profesionales de tu zona.'
              : 'We connect people with the best professionals in your area.'}
            </p>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card fade-up">
          <div className="auth-header">
            <h2 className="auth-title">{T.title}</h2>
            <p className="auth-sub">{T.sub}</p>
          </div>

          <div className="user-type-toggle">
            <button className={userType === 'client' ? 'active' : ''} onClick={() => setUserType('client')}>
              👤 {T.asClient}
            </button>
            <button className={userType === 'pro' ? 'active' : ''} onClick={() => setUserType('pro')}>
              🔧 {T.asPro}
            </button>
          </div>

          <div className="auth-form">
            <div className="field">
              <label>{T.email}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="field">
              <div className="field-label-row">
                <label>{T.password}</label>
                <span className="forgot-link">{T.forgot}</span>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={errors.pass ? 'input-error' : ''}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              {errors.pass && <span className="error-msg">{errors.pass}</span>}
            </div>

            {errors.general && <div className="error-banner">{errors.general}</div>}

            <button className="auth-btn" onClick={handleLogin} disabled={loading}>
              {loading ? T.loading : T.btn}
            </button>

            <div className="auth-divider">
              <span></span>
              <p>{lang === 'es' ? 'o' : 'or'}</p>
              <span></span>
            </div>

            <button className="face-login-btn" onClick={handleFaceLogin}>
              <span className="face-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                  <line x1="9" y1="9" x2="9.01" y2="9"/>
                  <line x1="15" y1="9" x2="15.01" y2="9"/>
                </svg>
              </span>
              {T.faceBtn}
            </button>
          </div>

          <p className="auth-switch">
            {T.noAccount}{' '}
            <span onClick={() => navigate('register')}>{T.register}</span>
          </p>
        </div>
      </div>

      {showFaceModal && (
        <div className="face-modal-overlay">
          <div className="face-modal">
            <button className="face-modal-close" onClick={closeFaceModal}>✕</button>
            <h3>{lang === 'es' ? 'Reconocimiento Facial' : 'Face Recognition'}</h3>
            <p className="face-modal-sub">{lang === 'es' ? 'Mira directamente a la cámara' : 'Look directly at the camera'}</p>
            <div className={`face-video-container ${status}`}>
              <video ref={videoRef} className="face-video" autoPlay muted playsInline />
              <div className="face-overlay">
                <div className="face-frame">
                  <div className="corner tl" /><div className="corner tr" />
                  <div className="corner bl" /><div className="corner br" />
                </div>
                {status === 'scanning' && <div className="scan-line" />}
              </div>
              {status === 'success' && <div className="face-result success">✓</div>}
              {status === 'error'   && <div className="face-result error">✕</div>}
            </div>
            <div className={`face-status ${status}`}>
              {status === 'loading' && <span className="face-spinner" />}
              <p>{message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}