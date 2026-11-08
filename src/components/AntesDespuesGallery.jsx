import { useState, useRef, useEffect } from 'react'
import './AntesDespuesGallery.css'

// Imágenes por defecto de trasformaciones reales en RD
const DEFAULT_TRANSFORMATIONS = [
  {
    id: 'bano',
    titleEs: 'Remodelación y Plomería de Baño',
    titleEn: 'Bathroom Plumbing & Remodel',
    category: 'plomero',
    proName: 'Plomería & Acabados RD',
    beforeImg: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
    afterImg: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'pintura',
    titleEs: 'Pintura y Restauración de Fachada',
    titleEn: 'Facade Painting & Restoration',
    category: 'pintor',
    proName: 'Pinturas VIP Santo Domingo',
    beforeImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    afterImg: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'ac',
    titleEs: 'Limpieza Profunda & Mantenimiento A/C',
    titleEn: 'Deep A/C Cleaning & Service',
    category: 'refrigeracion',
    proName: 'RefriClima Dominicana',
    beforeImg: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    afterImg: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'jardin',
    titleEs: 'Paisajismo y Arreglo de Jardín',
    titleEn: 'Garden Landscaping & Design',
    category: 'jardinero',
    proName: 'Jardines & Verdes RD',
    beforeImg: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=800&q=80',
    afterImg: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
  }
]

export function BeforeAfterItem({ item, lang = 'es' }) {
  const [sliderPos, setSliderPos] = useState(50)
  const isDragging = useRef(false)
  const containerRef = useRef(null)

  const handleMove = (clientX) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    let percentage = (x / rect.width) * 100
    if (percentage < 0) percentage = 0
    if (percentage > 100) percentage = 100
    setSliderPos(percentage)
  }

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX)
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      handleMove(e.clientX)
    }
  }

  return (
    <div className="ba-card">
      <div className="ba-card-header">
        <h4 className="ba-title">{lang === 'es' ? item.titleEs : item.titleEn}</h4>
        {item.proName && <span className="ba-pro-badge">👷 {item.proName}</span>}
      </div>

      <div 
        ref={containerRef}
        className="ba-image-container"
        onMouseDown={(e) => { isDragging.current = true; handleMouseMove(e); }}
        onMouseUp={() => { isDragging.current = false; }}
        onMouseLeave={() => { isDragging.current = false; }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Imagen Después (Fondo Completo) */}
        <img src={item.afterImg} alt="Después" className="ba-img ba-img-after" />
        <span className="ba-label ba-label-after">{lang === 'es' ? 'DESPUÉS ✨' : 'AFTER ✨'}</span>

        {/* Imagen Antes (Capa Recortada) */}
        <div className="ba-before-wrapper" style={{ width: `${sliderPos}%` }}>
          <img src={item.beforeImg} alt="Antes" className="ba-img ba-img-before" />
          <span className="ba-label ba-label-before">{lang === 'es' ? 'ANTES 🏚️' : 'BEFORE 🏚️'}</span>
        </div>

        {/* Línea Divisoria y Handle Deslizable */}
        <div className="ba-handle" style={{ left: `${sliderPos}%` }}>
          <div className="ba-handle-line" />
          <div className="ba-handle-button">
            <span>◄</span>
            <span>►</span>
          </div>
          <div className="ba-handle-line" />
        </div>
      </div>

      <div className="ba-instruction">
        👉 {lang === 'es' ? 'Desliza hacia la izquierda o derecha para ver la transformación' : 'Slide left or right to see transformation'}
      </div>
    </div>
  )
}

export default function AntesDespuesGallery({ lang = 'es', customItems = null, proName = null }) {
  const isEs = lang === 'es'
  const itemsToDisplay = customItems && customItems.length > 0 ? customItems : DEFAULT_TRANSFORMATIONS

  return (
    <div className="ba-gallery-container">
      <div className="ba-gallery-header">
        <div className="ba-gallery-icon">📸</div>
        <div>
          <h3 className="ba-gallery-title">
            {isEs ? 'Galería Interactiva Antes y Después' : 'Interactive Before & After Gallery'}
          </h3>
          <p className="ba-gallery-sub">
            {isEs 
              ? 'Resultados reales de trabajos completados en Listo Patrón' 
              : 'Real results from jobs completed on Listo Patrón'}
          </p>
        </div>
      </div>

      <div className="ba-gallery-grid">
        {itemsToDisplay.map((item) => (
          <BeforeAfterItem key={item.id} item={item} lang={lang} />
        ))}
      </div>
    </div>
  )
}
