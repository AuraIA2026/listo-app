import { useState, useEffect } from 'react'
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, signInWithCredential, OAuthProvider, FacebookAuthProvider } from 'firebase/auth'
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { useFaceAuth } from '../useFaceAuth'
import { SignInWithApple } from '@capacitor-community/apple-sign-in'
import { FacebookLogin } from '@capacitor-community/facebook-login'
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
  const T    = txt[lang]
  const auth = getAuth()
  const db   = getFirestore()

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
  const FACEBOOK_APP_ID = '123456789012345' // REEMPLAZAR CON TU APP ID DE FACEBOOK

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
        // El usuario ya existe en Firestore, verificamos que coincida el tipo seleccionado
        const existingData = userDocSnap.data()
        const existingIsPro = existingData.type === 'pro'
        const selectedIsPro = userType === 'pro'
        
        if (existingIsPro !== selectedIsPro) {
          await auth.signOut()
          setErrors({ general: T.errWrongType })
          setLoading(false)
          return
        }
        finalUserData = existingData
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
    } catch (err) {
      console.error('Apple Login Error:', err)
      if (err.message && (err.message.includes('cancel') || err.message.includes('user Canceled'))) {
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
      const result = await FacebookLogin.login({ permissions: ['email', 'public_profile'] });
      
      if (result.accessToken && result.accessToken.token) {
        const credential = FacebookAuthProvider.credential(result.accessToken.token);
        const userCredential = await signInWithCredential(auth, credential);
        
        await checkAndRegisterSocialUser(userCredential.user, 'Facebook');
      } else {
        throw new Error('No se recibió token de acceso de Facebook');
      }
    } catch (err) {
      console.error('Facebook Login Error:', err)
      if (err.message && (err.message.includes('cancel') || err.message.includes('user Canceled'))) {
        setLoading(false)
        return
      }
      setErrors({ general: lang === 'es' ? 'Error al iniciar sesión con Facebook' : 'Error signing in with Facebook' })
    }
    setLoading(false)
  }

  const validate = () => {
    const newErrors = {}
    const isEmail = email.includes('@') && email.includes('.')
    const cleanPhone = email.replace(/\D/g, '')
    const isPhone = !email.includes('@') && cleanPhone.length >= 8

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
      let loginEmail = email

      // Si no contiene '@', asumimos que es número telefónico
      if (!email.includes('@')) {
        const cleanPhone = email.replace(/\D/g, '')
        
        // Buscar el usuario por su número de teléfono
        // Construimos variantes por si se guardó con o sin formato
        const possiblePhones = [email, cleanPhone]
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
          loginEmail = userFound.email
        } else {
          setErrors({ general: lang === 'es' ? 'El usuario asociado no tiene un correo registrado' : 'Associated user has no registered email' })
          setLoading(false)
          return
        }
      }

      const result   = await signInWithEmailAndPassword(auth, loginEmail, password)
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

            <button className="apple-login-btn" onClick={handleAppleLogin} disabled={loading}>
              <span style={{ fontSize: '18px', display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 170 170" width="18" height="18" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.36.13-9.13-1.88-14.32-6.03-3.24-2.63-7.08-7.25-11.52-13.87-9.5-14.28-15.97-30.8-19.42-49.54-1.79-9.74-2.69-19.05-2.69-27.94 0-14.5 3.47-26.6 10.42-36.3 6.95-9.7 15.66-14.63 26.14-14.8 4.7 0 9.89 1.39 15.57 4.17 5.68 2.78 9.38 4.17 11.1 4.17 1.56 0 5.09-1.29 10.57-3.86 6.36-2.9 11.83-4.24 16.42-4.04 17.08.89 30.08 7.37 38.98 19.42-14.07 8.59-20.93 20.31-20.57 35.15.36 11.27 4.75 20.73 13.16 28.38 8.41 7.65 18.25 11.75 29.53 12.3 1.01 2.9 2.13 6.13 3.36 9.69zM119.22 30c0-7.81 2.85-15.11 8.56-21.9C133.48 1.3 140.73-1.61 149.53 1.15c-.78 9.26-4.02 17.58-9.72 24.96-5.7 7.38-12.75 11.39-21.14 12.01-1.23-.45-2.45-1.22-3.69-2.34-3.8-3.48-5.76-7.75-5.76-12.78z" />
                </svg>
              </span>
              {lang === 'es' ? 'Iniciar sesión con Apple' : 'Sign in with Apple'}
            </button>

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
                ? <>Únete a <strong>más de 10,000 dominicanos</strong> que ya confían en Listo.</>
                : <>Join <strong>over 10,000 customers</strong> who already trust Listo.</>}
            </p>
          </div>

          {/* ── FOOTER DE MÉTODOS DE PAGO SEGUROS ── */}
          <div className="auth-payment-footer" style={{
            marginTop: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            borderTop: '1px solid #E2E8F0',
            paddingTop: '20px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '11px',
              color: '#64748B',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {lang === 'es' ? 'Pagos 100% Seguros' : '100% Secure Payments'}
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {/* Visa Logo */}
              <div style={{
                background: 'white',
                border: '1px solid #CBD5E1',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: '900',
                color: '#1A1F71',
                fontStyle: 'italic',
                fontSize: '13px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                userSelect: 'none'
              }}>VISA</div>

              {/* Mastercard Circles */}
              <div style={{
                background: 'white',
                border: '1px solid #CBD5E1',
                padding: '5px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                userSelect: 'none'
              }}>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EB001B', marginRight: '-4px', mixBlendMode: 'multiply' }}></div>
                 <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F79E1B', mixBlendMode: 'multiply' }}></div>
              </div>

              {/* AZUL secure payment badge */}
              <div style={{
                background: 'white',
                border: '1px solid #CBD5E1',
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                userSelect: 'none'
              }}>
                <span style={{ color: '#002E6D', fontFamily: 'sans-serif', fontSize: '12px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '0.5px', lineHeight: '1' }}>AZUL</span>
              </div>

              {/* 3D Secure Visa */}
              <div style={{
                background: 'white',
                border: '1px solid #CBD5E1',
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                userSelect: 'none'
              }}>
                <svg viewBox="0 0 190 50" style={{ height: '16px' }}>
                  <text x="0" y="38" fontFamily="sans-serif" fontSize="40" fontWeight="900" fontStyle="italic" fill="#1A1F71" letterSpacing="-2">VISA</text>
                  <text x="115" y="38" fontFamily="sans-serif" fontSize="20" fontWeight="600" fill="#1A1F71">Secure</text>
                </svg>
              </div>

              {/* ID Check Mastercard */}
              <div style={{
                background: 'white',
                border: '1px solid #CBD5E1',
                padding: '4px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                userSelect: 'none'
              }}>
                <svg viewBox="0 0 100 60" style={{ height: '16px' }}>
                  <circle cx="35" cy="30" r="25" fill="#EB001B" />
                  <circle cx="65" cy="30" r="25" fill="#F79E1B" opacity="0.8" />
                </svg>
                <span style={{ color: '#1A1A2E', fontSize: '9px', fontWeight: '900', fontFamily: 'sans-serif' }}>ID Check</span>
              </div>
            </div>
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