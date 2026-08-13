import { useState, useEffect, useRef } from 'react'
import { getAuth, updateProfile } from 'firebase/auth'
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useUserData } from '../useUserData'
import './BtnHamburguesa.css'
import '../pages/PaymentPage.css'

/* ─── MODAL EDITAR PERFIL ─── */
function EditModal({ userData, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: userData?.name || '',
    phone: userData?.phone || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onCancel}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '32px 24px', width: '100%', maxWidth: 360, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <span style={{ fontSize: 40 }}>✏️</span>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: '10px 0 4px' }}>Editar perfil</h3>
        <p style={{ fontSize: 13, color: '#999', margin: '0 0 20px' }}>Actualiza tu información</p>

        <div style={{ textAlign: 'left', marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4, fontWeight: 600 }}>Nombre completo</label>
          <input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #eee', fontSize: 15, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ textAlign: 'left', marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: '#666', display: 'block', marginBottom: 4, fontWeight: 600 }}>Teléfono</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            placeholder="809-000-0000"
            style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #eee', fontSize: 15, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', padding: 14, background: saving ? '#ccc' : 'linear-gradient(135deg,#FF6B35,#FF8C42)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', marginBottom: 10 }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button onClick={onCancel} style={{ width: '100%', padding: 12, background: '#f5f5f5', color: '#666', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

/* ─── ACCORDION UTILITARIO ─── */
function Accordion({ title, children, open, onToggle }) {
  return (
    <div className="pp-accordion">
      <button className="pp-acc-header" onClick={onToggle}>
        <span>{title}</span>
        <span className="pp-acc-arrow">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="pp-acc-body">{children}</div>}
    </div>
  )
}

/* ─── COMPONENTE PRINCIPAL ─── */
export default function BtnHamburguesa({ onClose, navigate, lang = 'es', activeView, setActiveView }) {
  const { userData, loading, user, userRole, getInitials, profileComplete } = useUserData()
  const scrollRef = useRef(null)

  const [section, setSection] = useState('main')
  const [openSection, setOpenSection] = useState('stats')
  const [showEditModal, setShowEditModal] = useState(false)
  const [computedStats, setComputedStats] = useState({ completed: 0, requests: 0, pending: 0 })

  const auth = getAuth()

  useEffect(() => {
    if (!user?.uid || userRole !== 'pro') return
    const fetchOrdersStats = async () => {
      try {
        const q = query(collection(db, 'orders'), where('proId', '==', user.uid))
        const snap = await getDocs(q)
        let c = 0, r = 0, p = 0
        snap.forEach(doc => {
          const o = doc.data()
          r++
          if (o.status === 'done') c++
          else if (o.status !== 'cancelled') p++
        })
        setComputedStats({ completed: c, requests: r, pending: p })
      } catch (err) {
        console.error("Error fetching pro orders for stats:", err)
      }
    }
    fetchOrdersStats()
  }, [user?.uid, userRole])

  const handleSaveProfile = async (form) => {
    try {
      await updateProfile(user, { displayName: form.name })
      await updateDoc(doc(db, 'users', user.uid), {
        name: form.name,
        phone: form.phone,
      })
      setShowEditModal(false)
    } catch (e) {
      console.error('Error guardando:', e)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      onClose()
      navigate('login')
    } catch (e) {
      console.error('Error logout:', e)
    }
  }

  const toggle = (s) => setOpenSection(prev => prev === s ? null : s)

  if (loading) return null

  return (
    <div className="pp-container">
      <style>{`
        .pp-container { position: fixed; inset: 0; z-index: 1000; font-family: 'Outfit', sans-serif; }
        .pp-overlay { position: absolute; inset: 0; background: rgba(26,26,46,0.4); backdrop-filter: blur(8px); }
        .pp-panel { position: absolute; bottom: 0; left: 0; right: 0; background: #FFF9F6; border-radius: 32px 32px 0 0; box-shadow: 0 -10px 40px rgba(0,0,0,0.15); max-height: 92vh; display: flex; flexDirection: column; animation: slideUp 0.3s ease-out; }
        .pp-handle { width: 44px; height: 5px; background: #E0D5D0; border-radius: 3px; margin: 12px auto 8px; }
        .pp-close { position: absolute; top: 16px; right: 20px; border: none; background: #F5EAE6; color: #7A6962; width: 32px; height: 32px; border-radius: 50%; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .pp-scroll { overflow-y: auto; padding: 12px 0 44px; flex: 1; }
        .pp-user-box { display: flex; align-items: center; gap: 14px; padding: 12px 24px 20px; border-bottom: 1px solid #F5EAE6; margin-bottom: 20px; }
        .pp-avatar { width: 56px; height: 56px; border-radius: 50%; background: #F26000; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; fontSize: 20px; border: 3px solid white; box-shadow: 0 4px 12px rgba(242,96,0,0.18); object-fit: cover; }
        .pp-user-info { flex: 1; text-align: left; }
        .pp-name { font-size: 18px; fontWeight: 800; color: #1A1A2E; margin: 0; }
        .pp-role { font-size: 12px; color: #F26000; margin: 2px 0 0; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .pp-edit-btn { background: none; border: none; color: #8F7D75; font-size: 13px; font-weight: 700; cursor: pointer; padding: 6px 12px; border-radius: 8px; background: #F5EAE6; transition: background 0.2s; }
        .pp-edit-btn:hover { background: #EADCD6; }
        .pp-accordion { background: white; border-radius: 18px; margin: 0 20px 14px; border: 1.5px solid #F5EAE6; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
        .pp-acc-header { width: 100%; padding: 16px 20px; background: none; border: none; display: flex; justify-content: space-between; align-items: center; font-family: inherit; font-size: 15px; font-weight: 800; color: #1A1A2E; cursor: pointer; }
        .pp-acc-arrow { font-size: 11px; color: #A08F87; }
        .pp-acc-body { padding: 0 20px 20px; border-top: 1.5px solid #FFF5F2; background: #FFFDFD; text-align: left; }
        .pp-bono-item { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid #FFF5F2; }
        .pp-bono-item:last-child { border-bottom: none; }
        .pp-bono-icon { font-size: 18px; margin-right: 10px; }
        .pp-bono-text { flex: 1; font-size: 13.5px; color: #555; font-weight: 600; }
        .pp-bono-val { font-size: 13px; font-weight: 800; color: #2E7D32; background: #E8F5E9; padding: 3px 8px; border-radius: 6px; }
        .pp-stat-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 10px; }
        .pp-stat-card { background: white; border: 1.5px solid #F5EAE6; padding: 14px 10px; border-radius: 14px; text-align: center; }
        .pp-stat-num { display: block; font-size: 20px; font-weight: 900; color: #1A1A2E; }
        .pp-stat-lbl { font-size: 10px; color: #8F7D75; font-weight: 700; text-transform: uppercase; margin-top: 4px; display: block; }
        .pp-logout-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: none; border: none; color: #DC2626; font-size: 15px; font-weight: 800; cursor: pointer; margin: 20px auto 0; padding: 12px 24px; border-radius: 12px; transition: background 0.2s; }
        .pp-logout-btn:hover { background: #FEE2E2; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      <div className="pp-overlay" onClick={onClose} />
      <div className="pp-panel" onClick={e => e.stopPropagation()}>
        <div className="pp-handle" />
        <button className="pp-close" onClick={onClose}>✕</button>

        <div className="pp-scroll" ref={scrollRef}>
          {section === 'stats' ? (
            <div style={{ padding: '0 20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1C1C1C', margin: '0 0 16px', textAlign: 'left' }}>📊 Mi Rendimiento</h3>
              <div className="pp-stat-row">
                <div className="pp-stat-card">
                  <span className="pp-stat-num">{computedStats.requests}</span>
                  <span className="pp-stat-lbl">Pedidos</span>
                </div>
                <div className="pp-stat-card">
                  <span className="pp-stat-num" style={{ color: '#2E7D32' }}>{computedStats.completed}</span>
                  <span className="pp-stat-lbl">Completados</span>
                </div>
                <div className="pp-stat-card">
                  <span className="pp-stat-num" style={{ color: '#D4940A' }}>{computedStats.pending}</span>
                  <span className="pp-stat-lbl">Pendientes</span>
                </div>
              </div>
              <button 
                onClick={() => setSection('main')}
                style={{ background: '#F5EAE6', color: '#7A6962', border: 'none', borderRadius: '12px', padding: '12px', fontSize: '14px', fontWeight: '800', width: '100%', cursor: 'pointer', marginTop: '20px' }}
              >
                ← Volver al Menú
              </button>
            </div>
          ) : (
            <>
              {/* Info Usuario */}
              <div className="pp-user-box">
                {userData?.profilePhoto || userData?.photoURL ? (
                  <img src={userData.profilePhoto || userData.photoURL} alt="Avatar" className="pp-avatar" />
                ) : (
                  <div className="pp-avatar">{getInitials(userData?.name || '')}</div>
                )}
                <div className="pp-user-info">
                  <h4 className="pp-name">{userData?.name || 'Socio'}</h4>
                  <p className="pp-role">{userData?.category ? `🔧 ${userData.category.toUpperCase()}` : '🔧 PROFESIONAL'}</p>
                </div>
                <button className="pp-edit-btn" onClick={() => setShowEditModal(true)}>✏️ Editar</button>
              </div>

              {/* Contratos Highlight */}
              <div style={{ background: 'linear-gradient(135deg, #FFF0E6, #FFE4D6)', borderRadius: '16px', padding: '16px', margin: '4px 20px 24px', border: '1px solid #F2600044', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(242,96,0,0.08)' }}>
                <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid #F2600033' }}>
                  <span style={{ display: 'block', fontSize: '28px', fontWeight: '900', color: '#F26000', lineHeight: 1 }}>{userData?.contracts || 0}</span>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#B34700', textTransform: 'uppercase', marginTop: '6px', display: 'block' }}>Restantes</span>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <span style={{ display: 'block', fontSize: '28px', fontWeight: '900', color: '#666', lineHeight: 1 }}>{userData?.contractsUsed || 0}</span>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#777', textTransform: 'uppercase', marginTop: '6px', display: 'block' }}>Usados</span>
                </div>
              </div>

              {/* Aviso de Renovación o Actualización de Plan */}
              {((userData?.contracts || 0) <= 0 || userData?.planStatus === 'expired') && (
                <div style={{ background: '#FEF2F2', border: '1.5px solid #F87171', borderRadius: '16px', padding: '16px', margin: '0 20px 24px', textAlign: 'left', boxShadow: '0 4px 12px rgba(239,68,68,0.05)' }}>
                  <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#991B1B', fontWeight: 'bold', lineHeight: 1.5 }}>
                    ⚠️ Has agotado tus contratos de este mes o tu plan ha expirado. Para seguir postulándote a trabajos de inmediato, puedes actualizar tu plan en nuestra web.
                  </p>
                  <button 
                    onClick={() => {
                      const email = encodeURIComponent(userData?.email || '');
                      const phone = encodeURIComponent(userData?.phone || '');
                      const name = encodeURIComponent(userData?.name || '');
                      const category = encodeURIComponent(userData?.category || '');
                      window.open(`https://listopatron.com.do/?action=buy_plan&email=${email}&phone=${phone}&name=${name}&category=${category}`, '_system');
                    }}
                    style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', fontWeight: '900', width: '100%', cursor: 'pointer', boxShadow: '0 4px 10px rgba(220,38,38,0.2)' }}
                  >
                    🔄 Actualizar en la Web
                  </button>
                </div>
              )}

              {/* Mi Rendimiento (Estadísticas) Accordion */}
              <Accordion title="📊 Rendimiento y Estadísticas" open={openSection === 'stats'} onToggle={() => toggle('stats')}>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '14px', lineHeight: 1.5 }}>Consulta tus números y el historial de pedidos completados.</p>
                <button 
                  onClick={() => setSection('stats')}
                  style={{ background: '#F26000', color: 'white', border: 'none', borderRadius: '12px', padding: '12px 16px', fontSize: '13.5px', fontWeight: '800', cursor: 'pointer', width: '100%' }}
                >
                  Ver Estadísticas Detalladas
                </button>
              </Accordion>

              {/* Bonos Accordion */}
              <Accordion title="🎁 Bonos y Créditos Extra" open={openSection === 'bonos'} onToggle={() => toggle('bonos')}>
                {[
                  { icon: '⭐', text: '5 estrellas en una reseña', val: '+1 contrato' },
                  { icon: '📄', text: 'Perfil 100% completo', val: '+2 contratos' },
                  { icon: '👥', text: 'Referido confirmado', val: '+3 contratos' },
                ].map((b, i) => (
                  <div key={i} className="pp-bono-item">
                    <span className="pp-bono-icon">{b.icon}</span>
                    <span className="pp-bono-text">{b.text}</span>
                    <span className="pp-bono-val">{b.val}</span>
                  </div>
                ))}
              </Accordion>

              {/* Botón de Cambiar a Modo Cliente */}
              <button 
                onClick={() => {
                  localStorage.setItem('listo_active_view', 'user')
                  setActiveView('user')
                  onClose()
                }}
                style={{
                  background: '#2E7D32',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '900',
                  width: 'calc(100% - 40px)',
                  margin: '20px 20px 0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(46,125,50,0.22)',
                  fontFamily: 'inherit',
                  transition: 'transform 0.1s'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                👤 {lang === 'es' ? 'Modo Cliente' : 'Client Mode'}
              </button>

              {/* Botón Logout */}
              <button className="pp-logout-btn" onClick={handleLogout}>
                🚪 Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </div>

      {showEditModal && (
        <EditModal 
          userData={userData} 
          onSave={handleSaveProfile} 
          onCancel={() => setShowEditModal(false)} 
        />
      )}
    </div>
  )
}