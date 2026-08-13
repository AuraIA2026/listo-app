import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithCredential, OAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { useFaceAuth } from '../useFaceAuth'
import { SignInWithApple } from '@capacitor-community/apple-sign-in'
import { FacebookLogin } from '@capacitor-community/facebook-login'
import { Capacitor } from '@capacitor/core'
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
    recoveryTitle: 'Recuperar contraseña',
    recoverySub: 'Ingresa el correo de tu cuenta. Te enviaremos un enlace seguro para restablecer tu contraseña al estilo de Google.',
    recoveryEmail: 'Correo electrónico registrado',
    recoveryBtn: 'Enviar enlace de recuperación',
    recoverySuccessMsg: '¡Correo enviado con éxito! Revisa tu bandeja de entrada o spam para restablecer tu contraseña.',
    recoveryErrorMsg: 'No se pudo enviar el correo. Verifica que la dirección esté registrada.',
    recoveryClose: 'Regresar al inicio de sesión'
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
    recoveryTitle: 'Recover Password',
    recoverySub: 'Enter your account email. We will send you a secure link to reset your password.',
    recoveryEmail: 'Registered email address',
    recoveryBtn: 'Send recovery link',
    recoverySuccessMsg: 'Email sent successfully! Check your inbox or spam folder to reset your password.',
    recoveryErrorMsg: 'Could not send email. Verify if the address is registered.',
    recoveryClose: 'Return to login'
  }
}

export default function LoginPage({ lang, navigate }) {
  const isNative = Capacitor.isNativePlatform()
  const T    = txt[lang]

  const [userType, setUserType] = useState('client')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [showFaceModal, setShowFaceModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryLoading, setRecoveryLoading] = useState(false)
  const [recoverySuccess, setRecoverySuccess] = useState(false)
  const [recoveryError, setRecoveryError] = useState('')

  const { videoRef, status, message, verifyFace, stopCamera } = useFaceAuth()

  // Constant for Facebook App ID (user can replace this)
  const FACEBOOK_APP_ID = '1737961517531121' // REEMPLAZAR CON TU APP ID DE FACEBOOK

  useEffect(() => {
    // Inicializar Facebook Login SDK en Capacitor
    const initFb = async () => {
      try {
        await FacebookLogin.initialize({ appId: FACEBOOK_APP_ID });
      } catch (err) {
        console.warn('Error al inicializar Facebook Login:', err);
      }
    };
    initFb();
  }, []);

  const checkAndRegisterSocialUser = async (user, providerId, appleName = null) => {
    try {
      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)
      
      let finalUserData = {}
      
      if (!userDocSnap.exists()) {
        // Es un nuevo registro social
        const expireDate = new Date()
        expireDate.setDate(expireDate.getDate() + 30)
        
        const displayName = appleName || user.displayName || 'Usuario ' + providerId
        
        finalUserData = {
          name: displayName,
          email: user.email || '',
          phone: user.phoneNumber || '',
          type: userType, // "client" o "pro" según el toggle activo
          createdAt: serverTimestamp(),
        }
        
        if (userType === 'pro') {
          finalUserData.plan = 'basico'
          finalUserData.contracts = 3
          finalUserData.planExpirationDate = expireDate.toISOString()
        }
        
        await setDoc(userDocRef, finalUserData)
        
        // También registrar con el correo como llave para el inicio de sesión facial si se requiere
        if (user.email) {
          const emailKey = user.email.replace(/[^a-zA-Z0-9]/g, '_')
          await setDoc(doc(db, 'users', emailKey), { uid: user.uid }, { merge: true })
        }
        
        // Enviar mensaje de bienvenida
        const welcomeText = userType === 'client'
          ? `¡Hola ${displayName.split(' ')[0]}! Bienvenido a Listo Patrón. Estamos felices de tenerte aquí. Explora nuestro directorio y contrata a los mejores profesionales de confianza para tus proyectos hoy mismo.`
          : `¡Hola ${displayName.split(' ')[0]}! Bienvenido a Listo Patrón. Estás a un paso de generar ingresos. Entra a "Perfil", llena tus datos de Verificación y postúlate para ser un aliado oficial. ¡Mucho éxito!`;
          
        try {
          await addDoc(collection(db, 'notificaciones'), {
            userId: user.uid,
            type: 'system',
            title: 'Mensaje de Listo Patrón',
            text: welcomeText,
            date: new Date().toISOString(),
            read: false
          });
        } catch (e) {
          console.error("Error al crear notificación de bienvenida social:", e);
        }
      } else {
        // El usuario ya existe en Firestore
        finalUserData = userDocSnap.data()
      }
      
      // Navegar a home con los datos correspondientes
      navigate('home', {
        user: {
          uid: user.uid,
          email: user.email,
          name: finalUserData.name || '',
          phone: finalUserData.phone || '',
          type: finalUserData.type || userType,
          category: finalUserData.category || '',
          profileComplete: finalUserData.profileComplete || false,
          createdAt: finalUserData.createdAt || null,
        }
      })
    } catch (err) {
      console.error('Error checking/registering social user:', err)
      setErrors({ general: lang === 'es' ? 'Error al procesar el inicio de sesión social' : 'Error processing social login' })
    }
  }

  const handleAppleLogin = async () => {
    setLoading(true)
    setErrors({})
    try {
      if (isNative) {
        const result = await SignInWithApple.authorize({
          clientId: 'com.listopatron.app',
          redirectURI: 'https://listoapp-52b46.firebaseapp.com/__/auth/handler',
          scopes: 'email name'
        });
        
        if (result.response && result.response.identityToken) {
          const credential = new OAuthProvider('apple.com').credential({
            idToken: result.response.identityToken
          });
          
          const userCredential = await signInWithCredential(auth, credential);
          
          let fullName = null;
          if (result.response.givenName) {
            fullName = result.response.givenName + (result.response.familyName ? ' ' + result.response.familyName : '');
          }
          
          await checkAndRegisterSocialUser(userCredential.user, 'Apple', fullName);
        } else {
          throw new Error('No se recibió token de identidad de Apple');
        }
      } else {
        const provider = new OAuthProvider('apple.com');
        const userCredential = await signInWithPopup(auth, provider);
        await checkAndRegisterSocialUser(userCredential.user, 'Apple');
      }
    } catch (err) {
      console.error('Apple Login Error:', err)
      if (err.message && (err.message.includes('cancel') || err.message.includes('user Canceled') || err.message.includes('closed by user'))) {
        setLoading(false)
        return
      }
      setErrors({ general: lang === 'es' ? 'Error al iniciar sesión con Apple' : 'Error signing in with Apple' })
    }
    setLoading(false)
  }

  const handleFacebookLogin = async () => {
    setLoading(true)
    setErrors({})
    try {
      if (isNative) {
        const result = await FacebookLogin.login({ permissions: ['email', 'public_profile'] });
        
        if (result.accessToken && result.accessToken.token) {
          const credential = FacebookAuthProvider.credential(result.accessToken.token);
          const userCredential = await signInWithCredential(auth, credential);
          
          await checkAndRegisterSocialUser(userCredential.user, 'Facebook');
        } else {
          throw new Error('No se recibió token de acceso de Facebook');
        }
      } else {
        const provider = new FacebookAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        await checkAndRegisterSocialUser(userCredential.user, 'Facebook');
      }
    } catch (err) {
      console.error('Facebook Login Error:', err)
      if (err.message && (err.message.includes('cancel') || err.message.includes('user Canceled') || err.message.includes('closed by user'))) {
        setLoading(false)
        return
      }
      setErrors({ general: lang === 'es' ? 'Error al iniciar sesión con Facebook' : 'Error signing in with Facebook' })
    }
    setLoading(false)
  }

  const validate = () => {
    const newErrors = {}
    const trimmedEmail = (email || '').trim()
    const isEmail = trimmedEmail.includes('@') && trimmedEmail.includes('.')
    const cleanPhone = trimmedEmail.replace(/\D/g, '')
    const isPhone = !trimmedEmail.includes('@') && cleanPhone.length >= 8

    if (!isEmail && !isPhone) {
      newErrors.email = lang === 'es' ? 'Ingresa un correo válido o número de teléfono' : 'Enter a valid email or phone number'
    }
    if (password.length < 6) newErrors.pass = T.errPass
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validate()) return
    setLoading(true)
    setErrors({})
    try {
      const trimmedEmail = (email || '').trim()
      let loginEmail = trimmedEmail

      // Si no contiene '@', asumimos que es número telefónico
      if (!trimmedEmail.includes('@')) {
        const cleanPhone = trimmedEmail.replace(/\D/g, '')
        
        // Buscar el usuario por su número de teléfono
        // Construimos variantes por si se guardó con o sin formato
        const possiblePhones = [trimmedEmail, cleanPhone]
        if (cleanPhone.length === 10) {
          possiblePhones.push(`${cleanPhone.substring(0,3)}-${cleanPhone.substring(3,6)}-${cleanPhone.substring(6)}`)
        }
        
        const q = query(collection(db, 'users'), where('phone', 'in', possiblePhones))
        const querySnapshot = await getDocs(q)
        
        if (querySnapshot.empty) {
          setErrors({ general: lang === 'es' ? 'No se encontró ningún usuario con ese número de teléfono' : 'No user found with that phone number' })
          setLoading(false)
          return
        }
        
        const userFound = querySnapshot.docs[0].data()
        if (userFound.email) {
          loginEmail = userFound.email.trim()
        } else {
          setErrors({ general: lang === 'es' ? 'El usuario asociado no tiene un correo registrado' : 'Associated user has no registered email' })
          setLoading(false)
          return
        }
      }

      const result   = await signInWithEmailAndPassword(auth, loginEmail, password)
      const uid      = result.user.uid

      // Guardar credenciales de forma local para iniciar sesión con rostro en el futuro
      localStorage.setItem('listo_saved_email', loginEmail)
      localStorage.setItem('listo_saved_password', password)

      // ── Leer datos completos del usuario en Firestore ──
      const userDoc  = await getDoc(doc(db, 'users', uid))
      const userData = userDoc.exists() ? userDoc.data() : {}

      // ✅ FIX: usar "type" en lugar de "role"
      const type = userData.type || 'client'  // "pro" o "client"

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
    
    const savedEmail = localStorage.getItem('listo_saved_email')
    const savedPassword = localStorage.getItem('listo_saved_password')
    
    if (!savedEmail || !savedPassword || savedEmail.trim().toLowerCase() !== email.trim().toLowerCase()) {
      setErrors({ general: lang === 'es' ? 'Primero debes iniciar sesión con contraseña una vez en este dispositivo para activar el reconocimiento facial.' : 'You must first log in with password once on this device to enable face recognition.' })
      return
    }
    
    setShowFaceModal(true)
    const userId  = email.replace(/[^a-zA-Z0-9]/g, '_')
    const success = await verifyFace(userId)
    
    if (success) {
      try {
        const result = await signInWithEmailAndPassword(auth, savedEmail, savedPassword)
        const uid = result.user.uid
        
        const userDoc = await getDoc(doc(db, 'users', uid))
        const userData = userDoc.exists() ? userDoc.data() : {}
        const type = userData.type || 'client'
        
        setTimeout(() => {
          setShowFaceModal(false)
          navigate('home', {
            user: {
              uid,
              email: result.user.email,
              name: userData.name || '',
              phone: userData.phone || '',
              type: type,
              category: userData.category || '',
              profileComplete: userData.profileComplete || false,
              createdAt: userData.createdAt || null,
            }
          })
        }, 1500)
      } catch (err) {
        console.error('Face sign-in error:', err)
        setTimeout(() => setShowFaceModal(false), 2500)
      }
    } else {
      setTimeout(() => setShowFaceModal(false), 2500)
    }
  }

  const closeFaceModal = () => {
    stopCamera()
    setShowFaceModal(false)
  }

  const handleSendRecovery = async () => {
    if (!recoveryEmail.includes('@') || !recoveryEmail.includes('.')) {
      setRecoveryError(lang === 'es' ? 'Ingresa un correo válido' : 'Enter a valid email')
      return
    }
    setRecoveryLoading(true)
    setRecoveryError('')
    try {
      await sendPasswordResetEmail(auth, recoveryEmail)
      setRecoverySuccess(true)
    } catch (err) {
      console.error("Error al enviar email de recuperación:", err)
      setRecoveryError(T.recoveryErrorMsg)
    } finally {
      setRecoveryLoading(false)
    }
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
                <span className="forgot-link" onClick={() => {
                  setRecoveryEmail(email)
                  setRecoverySuccess(false)
                  setRecoveryError('')
                  setShowRecoveryModal(true)
                }}>{T.forgot}</span>
              </div>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={errors.pass ? 'input-error' : ''}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ paddingRight: '48px', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    outline: 'none'
                  }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
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

            {Capacitor.getPlatform() !== 'android' && (
              <button className="apple-login-btn" onClick={handleAppleLogin} disabled={loading}>
                <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                  <svg viewBox="0 0 18 18" width="18" height="18" fill="currentColor">
                    <path d="M15.56 10.1c-.04-2.22 1.81-3.28 1.89-3.33-1.03-1.51-2.64-1.72-3.21-1.76-1.37-.14-2.68.81-3.38.81-.69 0-1.78-.79-2.94-.77-1.52.02-2.93.89-3.71 2.24-1.58 2.75-.41 6.81 1.12 9.02.75 1.08 1.64 2.29 2.81 2.24 1.12-.04 1.55-.72 2.91-.72 1.35 0 1.75.72 2.92.7 1.19-.02 1.97-1.1 2.71-2.19.86-1.26 1.21-2.48 1.23-2.54-.03-.01-2.37-.91-2.36-3.6zM13.25 3.03c.62-.75 1.03-1.79.92-2.83-.89.04-1.98.6-2.62 1.35-.57.65-1.07 1.71-.94 2.72.99.08 2.02-.49 2.64-1.24z" />
                  </svg>
                </span>
                {lang === 'es' ? 'Iniciar sesión con Apple' : 'Sign in with Apple'}
              </button>
            )}

            <button className="facebook-login-btn" onClick={handleFacebookLogin} disabled={loading}>
              <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </span>
              {lang === 'es' ? 'Iniciar sesión con Facebook' : 'Sign in with Facebook'}
            </button>
          </div>

          <p className="auth-switch">
            {T.noAccount}{' '}
            <span onClick={() => navigate('register')}>{T.register}</span>
          </p>

          <div className="auth-social-proof fade-up" style={{animationDelay: '0.2s'}}>
            <div className="avatar-group">
              <img src="https://i.pravatar.cc/100?img=1" className="avatar-overlap" alt="User 1" />
              <img src="https://i.pravatar.cc/100?img=33" className="avatar-overlap" alt="User 2" />
              <img src="https://i.pravatar.cc/100?img=47" className="avatar-overlap" alt="User 3" />
              <img src="https://i.pravatar.cc/100?img=12" className="avatar-overlap" alt="User 4" />
              <div className="avatar-overlap" style={{ color:'#fc9842', backgroundColor:'#fff' }}>10k+</div>
            </div>
            <p className="auth-social-text">
              {lang === 'es' 
                ? <>Únete a <strong>más de 10,000 dominicanos</strong> que ya confían en Listo Patrón.</>
                : <>Join <strong>over 10,000 customers</strong> who already trust Listo Patrón.</>}
            </p>
          </div>

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

      {showRecoveryModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div className="fade-up" style={{
            background: '#FFFFFF', borderRadius: '24px', padding: '36px 28px',
            width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px',
            color: '#1E293B', textAlign: 'left'
          }}>
            <button 
              onClick={() => setShowRecoveryModal(false)}
              style={{
                position: 'absolute', top: '20px', right: '20px', border: 'none',
                background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B'
              }}
            >✕</button>

            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, fontFamily: "var(--font-display, inherit)", color: '#0F172A' }}>
              {T.recoveryTitle}
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0, marginTop: '-4px', lineHeight: 1.5 }}>
              {T.recoverySub}
            </p>

            {recoverySuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: '#ECFDF5', border: '2px solid #10B981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', color: '#10B981', boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
                }}>✓</div>
                <p style={{ fontSize: '14px', color: '#047857', fontWeight: '600', margin: 0, lineHeight: 1.5 }}>
                  {T.recoverySuccessMsg}
                </p>
                <button 
                  onClick={() => setShowRecoveryModal(false)}
                  style={{
                    background: '#0F172A', color: 'white', border: 'none', borderRadius: '12px',
                    padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
                    width: '100%', marginTop: '8px'
                  }}
                >
                  {T.recoveryClose}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#000' }}>{T.recoveryEmail}</label>
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={e => setRecoveryEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    style={{
                      width: '100%', padding: '14px 16px', borderRadius: '16px',
                      border: '2px solid transparent', background: '#F1F5F9',
                      fontSize: '15px', fontWeight: '500', outline: 'none'
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--mamey)'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}
                  />
                  {recoveryError && <span className="error-msg">{recoveryError}</span>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  <button
                    disabled={recoveryLoading || !recoveryEmail.trim()}
                    onClick={handleSendRecovery}
                    style={{
                      background: 'linear-gradient(135deg, var(--mamey), #FF3D00)',
                      color: 'white', border: 'none', borderRadius: '14px', padding: '14px',
                      fontSize: '15px', fontWeight: '800', cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(242,96,0,0.3)', outline: 'none',
                      opacity: (recoveryLoading || !recoveryEmail.trim()) ? 0.6 : 1
                    }}
                  >
                    {recoveryLoading ? (lang === 'es' ? 'Enviando...' : 'Sending...') : T.recoveryBtn}
                  </button>
                  <button
                    onClick={() => setShowRecoveryModal(false)}
                    style={{
                      background: 'none', border: 'none', color: '#64748B', padding: '8px',
                      fontSize: '14px', fontWeight: '600', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    {lang === 'es' ? 'Cancelar' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}