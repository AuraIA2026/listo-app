import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { PROVINCES_LIST } from '../categories'
import './ZonaCoberturaModal.css'

export default function ZonaCoberturaModal({ lang = 'es', onClose, userData, onSuccess }) {
  const [selectedCity, setSelectedCity] = useState(userData?.provincia || userData?.ciudad || 'santo domingo')
  const [radiusKm, setRadiusKm] = useState(userData?.coverageRadiusKm || 15)
  const [customSectors, setCustomSectors] = useState(userData?.coverageSectors || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    if (!userData?.uid) return
    setSaving(true)

    try {
      const userRef = doc(db, 'users', userData.uid)
      const selectedProvObj = PROVINCES_LIST.find(p => p.id === selectedCity) || PROVINCES_LIST[1]

      await updateDoc(userRef, {
        provincia: selectedCity,
        ciudad: selectedProvObj.labelEs.replace('📍 ', ''),
        coverageRadiusKm: Number(radiusKm),
        coverageSectors: customSectors.trim(),
        location: `${selectedProvObj.labelEs.replace('📍 ', '')} (Radio ${radiusKm}km)`,
      })

      // Actualizar localStorage si existe
      try {
        const stored = JSON.parse(localStorage.getItem('listoUserData') || '{}')
        stored.provincia = selectedCity
        stored.ciudad = selectedProvObj.labelEs.replace('📍 ', '')
        localStorage.setItem('listoUserData', JSON.stringify(stored))
      } catch (e) {}

      setSaving(false)
      alert(lang === 'es' ? '¡Zona de cobertura y ciudad actualizadas exitosamente!' : 'Coverage area and city successfully updated!')
      if (onSuccess) onSuccess()
      onClose()
    } catch (err) {
      console.error('Error actualizando zona de cobertura:', err)
      setSaving(false)
      alert(lang === 'es' ? 'Error al guardar los cambios.' : 'Error saving changes.')
    }
  }

  return (
    <div className="cobertura-overlay" onClick={onClose}>
      <div className="cobertura-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cobertura-close" onClick={onClose}>✕</button>

        <div className="cobertura-header">
          <div className="cobertura-icon">🗺️</div>
          <div>
            <h3 className="cobertura-title">
              {lang === 'es' ? 'Mi Zona y Ciudad de Cobertura' : 'My Work Area & City'}
            </h3>
            <p className="cobertura-sub">
              {lang === 'es' ? 'Define dónde estás disponible para trabajar' : 'Define where you are available to work'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="cobertura-form">
          <div className="cobertura-group">
            <label className="cobertura-label">
              🏙️ {lang === 'es' ? 'Ciudad o Provincia Principal' : 'Main City or Province'}
            </label>
            <select
              className="cobertura-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {PROVINCES_LIST.filter(p => p.id !== 'all').map(prov => (
                <option key={prov.id} value={prov.id}>
                  {prov.labelEs}
                </option>
              ))}
            </select>
          </div>

          <div className="cobertura-group">
            <label className="cobertura-label">
              🚗 {lang === 'es' ? `Radio de Desplazamiento (${radiusKm} km)` : `Travel Radius (${radiusKm} km)`}
            </label>
            <input
              type="range"
              min="3"
              max="50"
              step="1"
              className="cobertura-slider"
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
            />
            <div className="slider-labels">
              <span>3 km (Cercano)</span>
              <span>15 km (Medio)</span>
              <span>50 km (Toda la región)</span>
            </div>
          </div>

          <div className="cobertura-group">
            <label className="cobertura-label">
              📍 {lang === 'es' ? 'Sectores Específicos (Opcional)' : 'Specific Neighborhoods (Optional)'}
            </label>
            <input
              type="text"
              className="cobertura-input"
              placeholder={lang === 'es' ? 'Ej. Naco, Piantini, Bella Vista, El Millón' : 'e.g. Naco, Piantini'}
              value={customSectors}
              onChange={(e) => setCustomSectors(e.target.value)}
            />
            <span className="cobertura-hint">
              {lang === 'es'
                ? 'Si cambias de ciudad, selecciona tu nueva ciudad arriba para actualizar tu presencia en la app al instante.'
                : 'If you change cities, select your new city above to update your presence in the app instantly.'}
            </span>
          </div>

          <button
            type="submit"
            className="cobertura-submit-btn"
            disabled={saving}
          >
            {saving ? (
              lang === 'es' ? 'Guardando...' : 'Saving...'
            ) : (
              lang === 'es' ? '💾 Guardar Mi Zona de Cobertura' : '💾 Save My Work Area'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
