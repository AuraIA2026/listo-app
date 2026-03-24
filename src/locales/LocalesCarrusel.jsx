// src/locales/LocalesCarrusel.jsx
import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import LocalCard from './LocalCard'
import './Locales.css'

export default function LocalesCarrusel({ lang = 'es', navigate }) {
  const [locales, setLocales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocales = async () => {
      try {
        const q = query(
          collection(db, 'locales'),
          where('activo', '==', true)
        )
        const snap = await getDocs(q)
        const lista = []
        snap.forEach(doc => lista.push({ id: doc.id, ...doc.data() }))
        setLocales(lista)
      } catch (e) {
        console.error('Error cargando locales:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchLocales()
  }, [])

  // No mostrar si no hay locales
  if (loading || locales.length === 0) return null

  return (
    <div className="locales-section">
      {/* Header */}
      <div className="locales-section-header">
        <div className="locales-section-title">
          <span className="crown-icon">👑</span>
          <h2>{lang === 'es' ? 'Locales VIP' : 'VIP Shops'}</h2>
        </div>
        <button
          className="locales-ver-todos"
          onClick={() => navigate('localesPage')}
        >
          {lang === 'es' ? 'Ver todos' : 'See all'}
        </button>
      </div>

      {/* Carrusel */}
      <div className="locales-carrusel-scroll">
        {locales.map(local => (
          <LocalCard
            key={local.id}
            local={local}
            onPress={() => navigate('localDetalle', local)}
          />
        ))}
      </div>
    </div>
  )
}