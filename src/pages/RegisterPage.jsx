import { useState } from 'react'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useFaceAuth } from '../useFaceAuth'
import './AuthPage.css'
import './FaceModal.css'

const categories = [
  { id: 'mechanic',     label: { es: 'Mecánico',     en: 'Mechanic'    }, icon: '🔧' },
  { id: 'electrician',  label: { es: 'Electricista', en: 'Electrician' }, icon: '⚡' },
  { id: 'plumber',      label: { es: 'Plomero',      en: 'Plumber'     }, icon: '🔩' },
  { id: 'nanny',        label: { es: 'Niñera',       en: 'Nanny'       }, icon: '👶' },
  { id: 'painter',      label: { es: 'Pintor',       en: 'Painter'     }, icon: '🎨' },
  { id: 'carpenter',    label: { es: 'Carpintero',   en: 'Carpenter'   }, icon: '🪵' },
  { id: 'cleaner',      label: { es: 'Limpieza',     en: 'Cleaning'    }, icon: '🧹' },
  { id: 'gardener',     label: { es: 'Jardinero',    en: 'Gardener'    }, icon: '🌿' },
]

const txt = {
  es: {
    title: 'Crear cuenta',
    sub: 'Únete a la comunidad de Listo',
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
  const auth = getAuth()
  const [userType, setUserType] = useState('client')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', category: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'face'
  const [newUserId, setNewUserId] = useState(null)

  const { videoRef, status, message, registerFace, stopCamera } = useFaceAuth()

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 3) e.name = T.errName
    if (!form.email.includes('@') || !form.email.includes('.')) e.email = T.errEmail
    if (form.phone.replace(/\D/g, '').length < 8) e.phone = T.errPhone
    if (form.password.length < 6) e.password = T.errPass
    if (form.password !== form.confirm) e.confirm = T.errConfirm
    if (userType === 'pro' && !form.category) e.category = T.errCategory
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleRegister = async () => {
    if (!validate()) return
    setLoading(true)
    setErrors({})
    try {
      // Crear usuario en Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await updateProfile(result.user, { displayName: form.name })

      // Guardar en Firestore
      const userId = result.user.uid
      await setDoc(doc(db, 'users', userId), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        type: userType,
        ...(userType === 'pro' && { category: form.category }),
        createdAt: serverTimestamp(),
      })

      // También guardar con email como key para face login
      const emailKey = form.email.replace(/[^a-zA-Z0-9]/g, '_')
      await setDoc(doc(db, 'users', emailKey), { uid: userId }, { merge: true })

      setNewUserId(userId)
      setLoading(false)
      setStep('face') // Ir al paso de registro facial
    } catch (err) {
      setErrors({ general: err.code === 'auth/email-already-in-use'
        ? (lang === 'es' ? 'Este correo ya está registrado.' : 'This email is already registered.')
        : T.errGeneral
      })
      setLoading(false)
    }
  }

  const handleFaceRegister = async () => {
    await registerFace(newUserId)
    setTimeout(() => navigate('login'), 2000)
  }

  const handleSkipFace = () => {
    navigate('login')
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

            {userType === 'pro' && (
              <div className="field">
                <label>{T.category}</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}
                  className={errors.category ? 'input-error' : ''}>
                  <option value="">{T.selectCat}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.label[lang]}</option>
                  ))}
                </select>
                {errors.category && <span className="error-msg">{errors.category}</span>}
              </div>
            )}

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

            {errors.general && <div className="error-banner">{errors.general}</div>}

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