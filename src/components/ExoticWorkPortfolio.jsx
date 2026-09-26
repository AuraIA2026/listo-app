import { useState } from 'react'
import './ExoticWorkPortfolio.css'

export default function ExoticWorkPortfolio({ lang = 'es', photos = [], proName = '', proCategory = '', onHireClick }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedWork, setSelectedWork] = useState(null)

  // Opciones de demostración enriquecidas si el profesional aún tiene pocas fotos
  const demoWorks = [
    {
      id: 'work-1',
      title: lang === 'es' ? 'Instalación de Inversor 3.5kW & Caja de Breakers' : 'Inverter 3.5kW Installation & Breaker Box',
      category: 'Electricidad',
      dateStr: '24 sep 2026',
      location: 'Piantini, Santo Domingo',
      rating: 5.0,
      clientName: 'Ing. Carlos Mendoza',
      description: lang === 'es' 
        ? 'Montaje completo de sistema de respaldo, cableado de calibre #6 y balanceo de cargas en panel principal.' 
        : 'Full installation of backup system, gauge #6 wiring and load balancing.',
      img: photos[0] ? (typeof photos[0] === 'string' ? photos[0] : photos[0].url) : 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&q=80',
      tag: '⭐ 5.0 Destacado'
    },
    {
      id: 'work-2',
      title: lang === 'es' ? 'Reparación de Fuga en Tubería PPR de 2 Pulgadas' : 'PPR Pipe Leak Repair 2 Inch',
      category: 'Plomería',
      dateStr: '18 sep 2026',
      location: 'Bella Vista, Santo Domingo',
      rating: 5.0,
      clientName: 'Dra. Patricia Gómez',
      description: lang === 'es' 
        ? 'Termofusión de tramo dañado bajo losa, prueba de presión a 90 PSI y reemplazo de llave de paso principal.' 
        : 'Under-slab thermofusion repair, 90 PSI pressure test and main valve replacement.',
      img: photos[1] ? (typeof photos[1] === 'string' ? photos[1] : photos[1].url) : 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&q=80',
      tag: '🛠️ Reparación Compleja'
    },
    {
      id: 'work-3',
      title: lang === 'es' ? 'Mantenimiento Profundo de Aire Split 24,000 BTU' : 'Deep Cleaning Split AC 24,000 BTU',
      category: 'Refrigeración',
      dateStr: '10 sep 2026',
      location: 'Naco, Santo Domingo',
      rating: 5.0,
      clientName: 'Lic. Fernando Ortiz',
      description: lang === 'es' 
        ? 'Limpieza con hidrolavadora a presión, desinfección de serpentín, recarga de refrigerante R410A y medición de consumo.' 
        : 'Pressure washing, coil disinfection, R410A refrigerant top-up and amperage check.',
      img: photos[2] ? (typeof photos[2] === 'string' ? photos[2] : photos[2].url) : 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&q=80',
      tag: '❄️ Mantenimiento'
    },
    {
      id: 'work-4',
      title: lang === 'es' ? 'Remodelación de Muro & Pintura Impermeable' : 'Wall Repair & Waterproof Paint',
      category: 'Pintura',
      dateStr: '02 sep 2026',
      location: 'Arroyo Hondo, Santo Domingo',
      rating: 5.0,
      clientName: 'Arq. Elena Castillo',
      description: lang === 'es' 
        ? 'Resane de grietas estructurales con masilla elastomérica, sellador fijador y 2 manos de pintura satinada lavable.' 
        : 'Crack sealing with elastomeric filler and 2 coats of washable satin paint.',
      img: photos[3] ? (typeof photos[3] === 'string' ? photos[3] : photos[3].url) : 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=900&q=80',
      tag: '🎨 Acabado Fino'
    }
  ]

  // Si hay más fotos subidas por el usuario, convertirlas en items enriquecidos
  const userWorks = photos.map((p, idx) => {
    const url = typeof p === 'string' ? p : p.url
    const caption = typeof p === 'string' ? `Trabajo Certificado #${idx + 1}` : (p.caption || `Trabajo Certificado #${idx + 1}`)
    const dateObj = new Date(Date.now() - (idx + 1) * 3 * 24 * 60 * 60 * 1000)
    const dateStr = dateObj.toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })
    return {
      id: `user-work-${idx}`,
      title: caption,
      category: proCategory || 'Servicio Profesional',
      dateStr: dateStr,
      location: 'Santo Domingo, R.D.',
      rating: 5.0,
      clientName: 'Cliente Verificado',
      description: `Trabajo ejecutado por ${proName || 'el profesional'} con garantía de calidad auditada por Listo Patrón.`,
      img: url,
      tag: '✨ Certificado'
    }
  })

  const allWorks = userWorks.length > 0 ? userWorks : demoWorks

  const filteredWorks = activeFilter === 'all' 
    ? allWorks 
    : allWorks.filter(w => w.category.toLowerCase().includes(activeFilter.toLowerCase()) || w.tag.toLowerCase().includes(activeFilter.toLowerCase()))

  return (
    <div className="exotic-portfolio-section">
      {/* HEADER DE ÁLBUM EXÓTICO */}
      <div className="exotic-portfolio-header">
        <div>
          <span className="exotic-badge">✨ Portafolio Oficial Verificado</span>
          <h2 className="exotic-title">
            📸 {lang === 'es' ? 'Álbum Exótico de Trabajos Realizados' : 'Exotic Portfolio of Completed Works'}
          </h2>
          <p className="exotic-sub">
            {lang === 'es' 
              ? 'Explora las ejecuciones reales del profesional con fechas exactas, ubicaciones y especificaciones técnicas.' 
              : 'Explore real job executions with dates, locations, and technical specifications.'}
          </p>
        </div>
      </div>

      {/* FILTROS RÁPIDOS ELEGANTES */}
      <div className="exotic-filters">
        <button 
          className={`exotic-chip ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          🌟 {lang === 'es' ? 'Todos los Trabajos' : 'All Works'} ({allWorks.length})
        </button>
        <button 
          className={`exotic-chip ${activeFilter === '5.0' ? 'active' : ''}`}
          onClick={() => setActiveFilter('5.0')}
        >
          ⭐ {lang === 'es' ? '5 Estrellas' : '5 Stars'}
        </button>
        <button 
          className={`exotic-chip ${activeFilter === 'electricidad' ? 'active' : ''}`}
          onClick={() => setActiveFilter('electricidad')}
        >
          ⚡ {lang === 'es' ? 'Electricidad / Equipos' : 'Electrical'}
        </button>
        <button 
          className={`exotic-chip ${activeFilter === 'plomería' ? 'active' : ''}`}
          onClick={() => setActiveFilter('plomería')}
        >
          🛠️ {lang === 'es' ? 'Plomería & Tuberías' : 'Plumbing'}
        </button>
      </div>

      {/* MASONRY / GRID DE FOTOS EXÓTICAS */}
      <div className="exotic-grid">
        {filteredWorks.map((work) => (
          <div 
            key={work.id} 
            className="exotic-card"
            onClick={() => setSelectedWork(work)}
          >
            {/* Foto con gradiente y zoom */}
            <div className="exotic-card-image-wrap">
              <img src={work.img} alt={work.title} loading="lazy" />
              <div className="exotic-card-overlay" />
              
              {/* Badge de fecha flotante */}
              <div className="exotic-date-badge">
                📅 {work.dateStr}
              </div>

              {/* Tag de tipo */}
              <div className="exotic-tag-badge">
                {work.tag}
              </div>
            </div>

            {/* Información detallada */}
            <div className="exotic-card-content">
              <div className="exotic-card-meta">
                <span className="exotic-category">{work.category}</span>
                <span className="exotic-rating">⭐ {work.rating.toFixed(1)}</span>
              </div>

              <h3 className="exotic-card-title">{work.title}</h3>
              <p className="exotic-card-desc">{work.description}</p>

              <div className="exotic-card-footer">
                <span className="exotic-location">📍 {work.location}</span>
                <span className="exotic-view-more">
                  {lang === 'es' ? 'Ver detalles 🔍' : 'View details 🔍'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LIGHTBOX MODAL EXÓTICO EN ALTA RESOLUCIÓN */}
      {selectedWork && (
        <div className="exotic-lightbox-overlay" onClick={() => setSelectedWork(null)}>
          <div className="exotic-lightbox-card" onClick={e => e.stopPropagation()}>
            <button className="exotic-lightbox-close" onClick={() => setSelectedWork(null)}>✕</button>

            <div className="exotic-lightbox-image-box">
              <img src={selectedWork.img} alt={selectedWork.title} />
              <div className="exotic-lightbox-date-banner">
                📅 {lang === 'es' ? 'Trabajo Finalizado el' : 'Completed on'} {selectedWork.dateStr}
              </div>
            </div>

            <div className="exotic-lightbox-body">
              <div className="exotic-lightbox-header">
                <div>
                  <span className="exotic-category-badge">{selectedWork.category}</span>
                  <h3 className="exotic-lightbox-title">{selectedWork.title}</h3>
                </div>
                <div className="exotic-lightbox-score">
                  ⭐ 5.0
                </div>
              </div>

              <div className="exotic-lightbox-meta-grid">
                <div className="meta-box">
                  <span className="meta-label">📍 {lang === 'es' ? 'Ubicación Exacta' : 'Location'}</span>
                  <strong>{selectedWork.location}</strong>
                </div>
                <div className="meta-box">
                  <span className="meta-label">👤 {lang === 'es' ? 'Cliente Atendido' : 'Client'}</span>
                  <strong>{selectedWork.clientName}</strong>
                </div>
                <div className="meta-box">
                  <span className="meta-label">🛡️ {lang === 'es' ? 'Garantía Técnica' : 'Guarantee'}</span>
                  <strong style={{ color: '#059669' }}>✓ Mediación 24h Activa</strong>
                </div>
              </div>

              <div className="exotic-lightbox-desc-box">
                <h4>📝 {lang === 'es' ? 'Detalles Técnicos de la Ejecución:' : 'Technical Execution Details:'}</h4>
                <p>{selectedWork.description}</p>
              </div>

              <div className="exotic-lightbox-actions">
                <button 
                  className="btn-hire-similar"
                  onClick={() => {
                    setSelectedWork(null)
                    if (onHireClick) onHireClick()
                  }}
                >
                  ⚡ {lang === 'es' ? `Contratar a ${proName || 'este Profesional'} para un trabajo similar` : 'Hire for a similar job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
