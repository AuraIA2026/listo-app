import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'
import './MantenimientoPreventivoModal.css'

const PRESET_MAINTENANCES = [
  { id: 'ac', icon: '❄️', titleEs: 'Mantenimiento de Aire Acondicionado', titleEn: 'A/C Maintenance', freqDefault: 6, category: 'refrigeracion' },
  { id: 'water_filter', icon: '🚰', titleEs: 'Cambio de Filtro de Agua / Purificador', titleEn: 'Water Filter Change', freqDefault: 3, category: 'plomero' },
  { id: 'inverter', icon: '⚡', titleEs: 'Revisión de Inversor / Baterías / Planta', titleEn: 'Inverter & Generator Check', freqDefault: 6, category: 'electricista' },
  { id: 'tinaco', icon: '🛢️', titleEs: 'Limpieza y Desinfección de Tinaco / Cisterna', titleEn: 'Water Tank Cleaning', freqDefault: 6, category: 'plomero' },
  { id: 'fumigation', icon: '🦟', titleEs: 'Fumigación y Control de Plagas', titleEn: 'Pest Control & Fumigation', freqDefault: 6, category: 'fumigacion' },
  { id: 'vehicle', icon: '🚗', titleEs: 'Mantenimiento Preventivo de Vehículo', titleEn: 'Vehicle Maintenance', freqDefault: 3, category: 'mecanico' },
]

export default function MantenimientoPreventivoModal({ lang = 'es', onClose, navigate, userProfile }) {
  const isEs = lang === 'es'
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [pastPros, setPastPros] = useState([])

  // Form states
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('refrigeracion')
  const [frequencyMonths, setFrequencyMonths] = useState(6)
  const [nextDate, setNextDate] = useState('')
  const [preferredPro, setPreferredPro] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Set default nextDate 6 months from now
    const d = new Date()
    d.setMonth(d.getMonth() + 6)
    setNextDate(d.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    fetchRemindersAndPros()
  }, [])

  const fetchRemindersAndPros = async () => {
    const user = auth.currentUser
    if (!user) {
      setLoading(false)
      return
    }

    try {
      // 1. Fetch user maintenance reminders
      const q = query(collection(db, 'mantenimientos_preventivos'), where('userId', '==', user.uid))
      const snap = await getDocs(q)
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      list.sort((a, b) => new Date(a.nextDate || 0) - new Date(b.nextDate || 0))
      setReminders(list)

      // 2. Fetch past pros for quick assignment
      const ordersQ = query(collection(db, 'orders'), where('clientId', '==', user.uid))
      const ordersSnap = await getDocs(ordersQ)
      const prosMap = {}
      ordersSnap.docs.forEach(docSnap => {
        const data = docSnap.data()
        if (data.proId && data.proName) {
          prosMap[data.proId] = { id: data.proId, name: data.proName, specialty: data.proSpecialty || 'Profesional' }
        }
      })
      setPastPros(Object.values(prosMap))
    } catch (err) {
      console.error('Error cargando mantenimientos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePresetSelect = (preset) => {
    setTitle(isEs ? preset.titleEs : preset.titleEn)
    setCategory(preset.category)
    setFrequencyMonths(preset.freqDefault)
    
    const d = new Date()
    d.setMonth(d.getMonth() + preset.freqDefault)
    setNextDate(d.toISOString().split('T')[0])

    setShowAddForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!title.trim() || !nextDate) return

    setSaving(true)
    const user = auth.currentUser

    try {
      const selectedProObj = pastPros.find(p => p.id === preferredPro) || null

      const newReminder = {
        userId: user?.uid || 'guest',
        title: title.trim(),
        category,
        frequencyMonths: Number(frequencyMonths),
        nextDate,
        preferredProId: selectedProObj ? selectedProObj.id : '',
        preferredProName: selectedProObj ? selectedProObj.name : '',
        notes: notes.trim(),
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(collection(db, 'mantenimientos_preventivos'), newReminder)
      setReminders(prev => [...prev, { id: docRef.id, ...newReminder }])
      
      // Reset form
      setTitle('')
      setNotes('')
      setPreferredPro('')
      setShowAddForm(false)
    } catch (err) {
      console.error('Error guardando recordatorio:', err)
      alert(isEs ? 'Error al guardar el recordatorio. Intenta de nuevo.' : 'Error saving reminder. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm(isEs ? '¿Seguro que deseas eliminar este recordatorio?' : 'Delete this reminder?')) return
    try {
      await deleteDoc(doc(db, 'mantenimientos_preventivos', id))
      setReminders(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error('Error al eliminar:', err)
    }
  }

  const handleRebook = (reminder) => {
    onClose()
    if (reminder.preferredProId) {
      navigate('booking', { proId: reminder.preferredProId, proName: reminder.preferredProName, specialty: reminder.category })
    } else {
      navigate('search', { state: { searchQuery: reminder.title } })
    }
  }

  const getDaysRemaining = (dateStr) => {
    if (!dateStr) return null
    const diffTime = new Date(dateStr) - new Date()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="maint-overlay" onClick={onClose}>
      <div className="maint-modal-content" onClick={e => e.stopPropagation()}>
        <button className="maint-close-btn" onClick={onClose}>✕</button>

        {/* Encabezado */}
        <div className="maint-header">
          <div className="maint-badge-icon">📅</div>
          <div>
            <h3 className="maint-title">
              {isEs ? 'Agenda de Mantenimiento Preventivo' : 'Preventive Maintenance Schedule'}
            </h3>
            <p className="maint-subtitle">
              {isEs 
                ? 'Programa recordatorios periódicos y re-contrata a tu profesional con 1 clic.' 
                : 'Schedule periodic reminders & rebook your favorite pro in 1 click.'}
            </p>
          </div>
        </div>

        {/* Acciones principales / Presets */}
        {!showAddForm && (
          <div className="maint-preset-section">
            <p className="maint-section-label">⚡ {isEs ? 'Mantenimientos Frecuentes Sugeridos:' : 'Suggested Maintenances:'}</p>
            <div className="maint-presets-grid">
              {PRESET_MAINTENANCES.map(p => (
                <button 
                  key={p.id} 
                  className="preset-chip"
                  onClick={() => handlePresetSelect(p)}
                >
                  <span className="preset-chip-icon">{p.icon}</span>
                  <span className="preset-chip-title">{isEs ? p.titleEs : p.titleEn}</span>
                  <span className="preset-chip-freq">Cada {p.freqDefault} {isEs ? 'meses' : 'mos'}</span>
                </button>
              ))}
            </div>

            <button className="maint-add-custom-btn" onClick={() => setShowAddForm(true)}>
              ➕ {isEs ? 'Programar Otro Mantenimiento Personalizado' : 'Add Custom Maintenance'}
            </button>
          </div>
        )}

        {/* Formulario Agregar Recordatorio */}
        {showAddForm && (
          <form onSubmit={handleSave} className="maint-form fade-in">
            <div className="maint-form-header">
              <h4>📝 {isEs ? 'Nuevo Recordatorio de Mantenimiento' : 'New Maintenance Reminder'}</h4>
              <button type="button" className="maint-cancel-link" onClick={() => setShowAddForm(false)}>
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
            </div>

            <div className="maint-field">
              <label>{isEs ? 'Título / Nombre del Servicio' : 'Service Title'}</label>
              <input 
                type="text" 
                required 
                placeholder={isEs ? 'Ej: Mantenimiento de A/C Sala' : 'e.g. Living Room A/C Service'}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="maint-field-row">
              <div className="maint-field">
                <label>{isEs ? 'Frecuencia' : 'Frequency'}</label>
                <select value={frequencyMonths} onChange={e => setFrequencyMonths(e.target.value)}>
                  <option value={1}>{isEs ? 'Cada 1 Mes' : 'Every 1 Month'}</option>
                  <option value={3}>{isEs ? 'Cada 3 Meses' : 'Every 3 Months'}</option>
                  <option value={6}>{isEs ? 'Cada 6 Meses' : 'Every 6 Months'}</option>
                  <option value={12}>{isEs ? 'Cada 1 Año (12 Meses)' : 'Every 1 Year'}</option>
                </select>
              </div>

              <div className="maint-field">
                <label>{isEs ? 'Próxima Fecha' : 'Next Date'}</label>
                <input 
                  type="date" 
                  required 
                  value={nextDate} 
                  onChange={e => setNextDate(e.target.value)}
                />
              </div>
            </div>

            {pastPros.length > 0 && (
              <div className="maint-field">
                <label>👷 {isEs ? 'Profesional Preferido Asignado (Opcional)' : 'Preferred Pro (Optional)'}</label>
                <select value={preferredPro} onChange={e => setPreferredPro(e.target.value)}>
                  <option value="">{isEs ? '-- Asignar automáticamente en la búsqueda --' : '-- Assign automatically --'}</option>
                  {pastPros.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.specialty})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="maint-field">
              <label>📝 {isEs ? 'Notas Adicionales (Opcional)' : 'Notes (Optional)'}</label>
              <input 
                type="text" 
                placeholder={isEs ? 'Ej: Filtro de 12,000 BTU, usa gas R410A' : 'Notes for pro'}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="maint-save-btn" disabled={saving}>
              {saving ? (isEs ? 'Guardando...' : 'Saving...') : (isEs ? '💾 Guardar Recordatorio' : '💾 Save Reminder')}
            </button>
          </form>
        )}

        {/* Lista de Mantenimientos Activos */}
        <div className="maint-list-section">
          <h4 className="maint-list-title">
            📋 {isEs ? 'Tus Mantenimientos Programados' : 'Scheduled Maintenances'} ({reminders.length})
          </h4>

          {loading ? (
            <div className="maint-loading">⏳ {isEs ? 'Cargando agenda...' : 'Loading schedule...'}</div>
          ) : reminders.length === 0 ? (
            <div className="maint-empty">
              <span>📅</span>
              <p>{isEs ? 'No tienes mantenimientos preventivos activos.' : 'No active preventive maintenances.'}</p>
              <small>{isEs ? 'Selecciona una sugerencia arriba para activar tu primer recordatorio.' : 'Select a suggestion above to start.'}</small>
            </div>
          ) : (
            <div className="maint-cards-list">
              {reminders.map(r => {
                const daysLeft = getDaysRemaining(r.nextDate)
                const isOverdue = daysLeft !== null && daysLeft <= 0
                const isSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 15

                return (
                  <div key={r.id} className={`maint-card ${isOverdue ? 'overdue' : isSoon ? 'soon' : ''}`}>
                    <div className="maint-card-top">
                      <div className="maint-card-icon">🔧</div>
                      <div className="maint-card-info">
                        <h5 className="maint-card-title">{r.title}</h5>
                        <p className="maint-card-meta">
                          🔄 {isEs ? `Cada ${r.frequencyMonths} meses` : `Every ${r.frequencyMonths} mos`} &nbsp;•&nbsp; 📅 {r.nextDate}
                        </p>
                        {r.preferredProName && (
                          <p className="maint-card-pro">
                            👷 {isEs ? 'Pro Preferido:' : 'Preferred Pro:'} <strong>{r.preferredProName}</strong>
                          </p>
                        )}
                        {r.notes && <p className="maint-card-notes">"{r.notes}"</p>}
                      </div>
                      <button className="maint-delete-btn" onClick={() => handleDelete(r.id)} title="Eliminar">🗑️</button>
                    </div>

                    <div className="maint-card-bottom">
                      <div className={`maint-status-chip ${isOverdue ? 'overdue' : isSoon ? 'soon' : 'ok'}`}>
                        {isOverdue 
                          ? (isEs ? '🚨 ¡Vencido! Toca re-contratar' : '🚨 Overdue!')
                          : isSoon
                          ? (isEs ? `⏰ Próximo en ${daysLeft} días` : `⏰ Due in ${daysLeft} days`)
                          : (isEs ? `🟢 En orden (${daysLeft} días)` : `🟢 On track (${daysLeft} days)`)}
                      </div>

                      <button className="maint-rebook-btn" onClick={() => handleRebook(r)}>
                        🚀 {isEs ? 'Re-contratar con 1 Clic' : 'Rebook in 1 Click'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
