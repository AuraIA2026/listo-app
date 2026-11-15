import { useState, useRef } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth'
import { doc, setDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { useFaceAuth } from '../useFaceAuth'
import './AuthPage.css'
import './FaceModal.css'
import { ALL_SUBCATEGORIES } from '../categories'

const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 400
      let { width, height } = img
      if (width > height) { if (width > MAX) { height = Math.round(height * MAX / width); width = MAX } }
      else { if (height > MAX) { width = Math.round(width * MAX / height); height = MAX } }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.onerror = reject; img.src = e.target.result
  }
  reader.onerror = reject; reader.readAsDataURL(file)
})

const txt = {
  es: {
    title: 'Crear cuenta',
    sub: 'Únete a la comunidad de Listo',
    photo: 'Foto de perfil (Obligatoria)',
    photoSub: 'Sube una foto nítida de tu rostro',
    name: 'Nombre completo',
    email: 'Correo electrónico',
    phone: 'Teléfono',
    password: 'Contraseña',
    confirm: 'Confirmar contraseña',
    category: 'Categoría de servicio',
    selectCat: 'Selecciona una categoría',
    btn: 'Crear cuenta',
    loading: 'Creando cuenta...',
    faceStep: 'Registrar mi rostro',
    faceSkip: 'Omitir por ahora',
    faceStepSub: 'Opcional: activa el acceso por reconocimiento facial',
    hasAccount: '¿Ya tienes cuenta?',
    login: 'Inicia sesión',
    asClient: 'Cliente',
    asPro: 'Profesional',
    errPhoto: 'Por favor sube o toma tu foto de perfil',
    errName: 'Ingresa tu nombre completo',
    errEmail: 'Ingresa un correo válido',
    errPhone: 'Ingresa un teléfono válido',
    errPass: 'La contraseña debe tener al menos 6 caracteres',
    errConfirm: 'Las contraseñas no coinciden',
    errCategory: 'Selecciona una categoría',
    errGeneral: 'Error al crear cuenta. Intenta de nuevo.',
  },
  en: {
    title: 'Create account',
    sub: 'Join the Listo community',
    photo: 'Profile photo (Required)',
    photoSub: 'Upload a clear photo of your face',
    name: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    password: 'Password',
    confirm: 'Confirm password',
    category: 'Service category',
    selectCat: 'Select a category',
    btn: 'Create account',
    loading: 'Creating account...',
    faceStep: 'Register my face',
    faceSkip: 'Skip for now',
    faceStepSub: 'Optional: enable face recognition access',
    hasAccount: 'Already have an account?',
    login: 'Sign in',
    asClient: 'Client',
    asPro: 'Professional',
    errPhoto: 'Please upload or take a profile photo',
    errName: 'Enter your full name',
    errEmail: 'Enter a valid email',
    errPhone: 'Enter a valid phone number',
    errPass: 'Password must be at least 6 characters',
    errConfirm: 'Passwords do not match',
    errCategory: 'Select a category',
    errGeneral: 'Error creating account. Please try again.',
  }
}

export default function RegisterPage({ lang, navigate }) {
  const T = txt[lang]
  const [userType, setUserType] = useState('client')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', category: '', photo: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'face'
  const [newUserId, setNewUserId] = useState(null)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const isRegisteringRef = useRef(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const { videoRef, status, message, registerFace, stopCamera } = useFaceAuth()

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await compressImage(file)
      set('photo', base64)
      setErrors(prev => ({ ...prev, photo: null }))
    } catch (err) {
      console.error("Error al procesar la foto:", err)
      setErrors(prev => ({ ...prev, photo: lang === 'es' ? 'Error al procesar la imagen' : 'Error processing image' }))
    }
    e.target.value = ''
  }

  const validate = () => {
    const e = {}
    const cleanEmail = (form.email || '').trim().toLowerCase()
    const cleanPhone = (form.phone || '').replace(/\D/g, '')

    if (!form.photo) e.photo = T.errPhoto
    if ((form.name || '').trim().length < 3) e.name = T.errName
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) e.email = T.errEmail
    if (cleanPhone.length < 8) e.phone = T.errPhone
    if ((form.password || '').length < 6) e.password = T.errPass
    if (form.password !== form.confirm) e.confirm = T.errConfirm
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleRegister = async () => {
    if (isRegisteringRef.current || loading) return
    if (!validate()) return

    isRegisteringRef.current = true
    setLoading(true)
    setErrors({})

    const cleanEmail = form.email.trim().toLowerCase()
    const cleanName  = form.name.trim()
    const cleanPhone = form.phone.trim()

    let resultUser = null

    try {
      // 1. Crear usuario en Firebase Auth
      try {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, form.password)
        resultUser = res.user
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          // Si el usuario ya existe en Auth (por intento previo o interrupción), probamos autenticar con la clave ingresada
          try {
            const loginRes = await signInWithEmailAndPassword(auth, cleanEmail, form.password)
            resultUser = loginRes.user
          } catch (loginErr) {
            setErrors({ general: 'email-already-in-use' })
            isRegisteringRef.current = false
            setLoading(false)
            return
          }
        } else {
          throw authErr
        }
      }

      if (!resultUser) throw new Error("No user object")

      const userId = resultUser.uid

      try {
        await updateProfile(resultUser, {
          displayName: cleanName,
          ...(form.photo ? { photoURL: form.photo } : {})
        })
      } catch (e) {
        console.warn("Could not update profile displayName/photoURL:", e)
      }

      // Guardar credenciales locales para reconocimiento facial futuro
      try {
        localStorage.setItem('listo_saved_email', cleanEmail)
        localStorage.setItem('listo_saved_password', form.password)
      } catch (e) {
        console.warn("Could not write to localStorage:", e)
      }

      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + 90)

      const userPayload = {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        type: userType, // 'client' o 'pro'
        role: userType === 'pro' ? 'professional' : 'client',
        photoURL: form.photo || null,
        avatar: form.photo || null,
        profilePic: form.photo || null,
        profileComplete: userType === 'pro' ? false : Boolean(cleanName && cleanPhone && form.photo),
        createdAt: serverTimestamp(),
      }

      if (userType === 'pro') {
        userPayload.plan = 'basico'
        userPayload.contracts = 3
        userPayload.planStatus = 'active'
        userPayload.available = false
        userPayload.planExpirationDate = expireDate.toISOString()
      }

      // Guardar en Firestore
      try {
        await setDoc(doc(db, 'users', userId), userPayload, { merge: true })
      } catch (e) {
        console.error("Error setting user doc in Firestore:", e)
      }

      // También guardar con email como key para mapeo rápido
      try {
        const emailKey = cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')
        await setDoc(doc(db, 'users', emailKey), { uid: userId }, { merge: true })
      } catch (e) {
        console.warn("Could not save emailKey doc:", e)
      }

      // Mensaje Automático de Bienvenida
      try {
        const welcomeText = userType === 'pro'
          ? `¡Hola ${cleanName.split(' ')[0]}! Bienvenido a Listo Patrón como Profesional. Entra a tu Perfil, completa tus datos de Verificación y postúlate para recibir clientes.`
          : `¡Hola ${cleanName.split(' ')[0]}! Bienvenido a Listo Patrón. Estamos felices de tenerte aquí. Explora nuestro directorio y contrata a los mejores profesionales hoy mismo.`

        await addDoc(collection(db, 'notificaciones'), {
          userId: userId,
          type: 'system',
          title: 'Mensaje de Listo Patrón',
          text: welcomeText,
          date: new Date().toISOString(),
          read: false
        });
      } catch (e) {
        console.error("Error creating welcome notification", e);
      }

      setNewUserId(userId)
      setStep('face') // Ir al paso de registro facial
    } catch (err) {
      console.error("Error al registrar:", err)
      let msg = T.errGeneral
      if (err.code === 'auth/invalid-email') {
        msg = lang === 'es' ? 'El formato del correo no es válido.' : 'Invalid email format.'
      } else if (err.code === 'auth/weak-password') {
        msg = lang === 'es' ? 'La contraseña debe ser de al menos 6 caracteres.' : 'Password is too weak.'
      } else if (err.code === 'auth/network-request-failed') {
        msg = lang === 'es' ? 'Error de conexión. Verifica tu internet.' : 'Network error. Check internet connection.'
      }
      setErrors({ general: msg })
    } finally {
      isRegisteringRef.current = false
      setLoading(false)
    }
  }

  const handleFaceRegister = async () => {
    await registerFace(newUserId)
    setTimeout(() => navigate('home'), 1500)
  }

  const handleSkipFace = () => {
    navigate('home')
  }

  // ── Paso 2: Registro facial ──
  if (step === 'face') {
    return (
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-deco">
            <div className="deco-blob" />
            <div className="auth-quote">
              <span className="quote-icon">✦</span>
              <p>{lang === 'es'
                ? 'Tu rostro es tu contraseña más segura.'
                : 'Your face is your most secure password.'}
              </p>
            </div>
          </div>
        </div>
        <div className="auth-right">
          <div className="auth-card fade-up">
            <div className="auth-header">
              <h2 className="auth-title">
                {lang === 'es' ? '¡Cuenta creada! 🎉' : 'Account created! 🎉'}
              </h2>
              <p className="auth-sub">{T.faceStepSub}</p>
            </div>

            <div className={`face-video-container ${status}`} style={{ marginBottom: 16 }}>
              <video ref={videoRef} className="face-video" autoPlay muted playsInline />
              <div className="face-overlay">
                <div className="face-frame">
                  <div className="corner tl" /><div className="corner tr" />
                  <div className="corner bl" /><div className="corner br" />
                </div>
                {status === 'scanning' && <div className="scan-line" />}
              </div>
              {status === 'success' && <div className="face-result success">✓</div>}
              {status === 'error' && <div className="face-result error">✕</div>}
            </div>

            {message && (
              <div className={`face-status ${status}`} style={{ marginBottom: 16 }}>
                {status === 'loading' && <span className="face-spinner" />}
                <p>{message}</p>
              </div>
            )}

            {(status === 'idle' || status === 'error') && (
              <button className="auth-btn" onClick={handleFaceRegister}>
                {T.faceStep}
              </button>
            )}

            {status !== 'success' && (
              <button
                className="face-skip-btn"
                onClick={handleSkipFace}
                style={{ marginTop: 12 }}
              >
                {T.faceSkip}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Paso 1: Formulario ──
  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-deco">
          <div className="deco-blob" />
          <div className="auth-quote">
            <span className="quote-icon">✦</span>
            <p>{lang === 'es'
              ? 'Forma parte de la red de profesionales más confiable de tu zona.'
              : 'Be part of the most reliable professional network in your area.'}
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
            {/* Foto de perfil obligatoria */}
            <div className="field photo-upload-field" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '18px' }}>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '8px', textAlign: 'center' }}>
                {T.photo} <span style={{ color: '#EF4444' }}>*</span>
              </label>

              <div style={{ position: 'relative', width: '92px', height: '92px', marginBottom: '10px' }}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: '92px',
                    height: '92px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: errors.photo ? '3px solid #EF4444' : '3px solid #F26000',
                    boxShadow: '0 4px 14px rgba(242, 96, 0, 0.25)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: form.photo ? '#FFFFFF' : '#FFF3EC',
                    transition: 'transform 0.15s ease'
                  }}
                  title={lang === 'es' ? 'Toca para elegir foto' : 'Tap to choose photo'}
                >
                  {form.photo ? (
                    <img src={form.photo} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '36px', lineHeight: 1 }}>👤</span>
                      <span style={{ fontSize: '8.5px', fontWeight: 900, color: '#F26000', marginTop: '2px', letterSpacing: '0.5px' }}>SUBIR FOTO</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#1A1A2E',
                    color: '#FFFFFF',
                    border: '2.5px solid #FFFFFF',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  title={lang === 'es' ? 'Tomar selfie' : 'Take selfie'}
                >
                  📷
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📁 {lang === 'es' ? 'Subir foto' : 'Upload photo'}
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  style={{
                    background: '#FFF3EC',
                    color: '#F26000',
                    border: '1px solid #FDBA74',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  📷 {lang === 'es' ? 'Tomar selfie' : 'Take selfie'}
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoSelected}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                style={{ display: 'none' }}
                onChange={handlePhotoSelected}
              />

              {errors.photo && (
                <span className="error-msg" style={{ textAlign: 'center', marginTop: '6px' }}>{errors.photo}</span>
              )}
            </div>
            <div className="field">
              <label>{T.name}</label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder={lang === 'es' ? 'Juan Pérez' : 'John Doe'}
                className={errors.name ? 'input-error' : ''} />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="field">
              <label>{T.email}</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="correo@ejemplo.com" className={errors.email ? 'input-error' : ''} />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="field">
              <label>{T.phone}</label>
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                placeholder="809-000-0000" className={errors.phone ? 'input-error' : ''} />
              {errors.phone && <span className="error-msg">{errors.phone}</span>}
            </div>



            <div className="field">
              <label>{T.password}</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="••••••••" className={errors.password ? 'input-error' : ''} />
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>

            <div className="field">
              <label>{T.confirm}</label>
              <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)}
                placeholder="••••••••" className={errors.confirm ? 'input-error' : ''}
                onKeyDown={e => e.key === 'Enter' && handleRegister()} />
              {errors.confirm && <span className="error-msg">{errors.confirm}</span>}
            </div>

            {errors.general === 'email-already-in-use' ? (
              <div className="error-banner" style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                <p style={{ margin: 0, fontWeight: '600' }}>
                  {lang === 'es'
                    ? 'Este correo ya está registrado en Listo Patrón.'
                    : 'This email is already registered in Listo Patrón.'}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                  <button
                    type="button"
                    onClick={() => navigate('login')}
                    style={{
                      background: '#0F172A', color: 'white', border: 'none',
                      padding: '8px 14px', borderRadius: '10px', fontSize: '12px',
                      fontWeight: '700', cursor: 'pointer', outline: 'none'
                    }}
                  >
                    {lang === 'es' ? '🔑 Iniciar Sesión' : '🔑 Sign In'}
                  </button>

                  <button
                    type="button"
                    disabled={resetLoading || resetSent}
                    onClick={async () => {
                      if (!form.email.trim()) return
                      setResetLoading(true)
                      try {
                        await sendPasswordResetEmail(auth, form.email.trim().toLowerCase())
                        setResetSent(true)
                      } catch (e) {
                        console.error('Reset error:', e)
                      } finally {
                        setResetLoading(false)
                      }
                    }}
                    style={{
                      background: resetSent ? '#10B981' : '#F26000', color: 'white', border: 'none',
                      padding: '8px 14px', borderRadius: '10px', fontSize: '12px',
                      fontWeight: '700', cursor: 'pointer', outline: 'none', transition: 'all 0.2s'
                    }}
                  >
                    {resetSent
                      ? (lang === 'es' ? '✓ Enlace enviado al correo' : '✓ Reset link sent!')
                      : resetLoading
                        ? (lang === 'es' ? 'Enviando...' : 'Sending...')
                        : (lang === 'es' ? '📧 Restablecer Contraseña' : '📧 Reset Password')}
                  </button>
                </div>
              </div>
            ) : (
              errors.general && <div className="error-banner">{errors.general}</div>
            )}

            <button className="auth-btn" onClick={handleRegister} disabled={loading}>
              {loading ? T.loading : T.btn}
            </button>
          </div>

          <p className="auth-switch">
            {T.hasAccount}{' '}
            <span onClick={() => navigate('login')}>{T.login}</span>
          </p>


        </div>
      </div>
    </div>
  )
}