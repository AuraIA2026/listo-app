import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase'
import { CATEGORIES, ALL_SUBCATEGORIES } from '../categories'
import { useUserData } from '../useUserData'
import logoListo from '../assets/logo_listo.png'
import './ProfessionalProfilePage.css'

const txt = {
  es: {
    reviews: 'Reseñas',
    photos: 'Trabajos Realizados',
    book: 'Reservar servicio',
    chat: 'Enviar mensaje',
    available: 'Disponible ahora',
    busy: 'Ocupado',
    writeReview: 'Escribe tu reseña',
    reviewPlaceholder: 'Describe tu experiencia con este profesional...',
    submitReview: 'Publicar reseña',
    reviewTitle: 'Calificar a',
    selectRating: 'Selecciona una calificación',
    reviewSent: '¡Reseña publicada!',
    reviewSentSub: 'Gracias por tu opinión',
    noPhotos: 'Este profesional aún no ha subido fotos',
    noReviews: 'Aún no hay reseñas',
    noReviewsSub: 'Sé el primero en calificar',
    addPhoto: 'Subir foto de trabajo',
    photoUploaded: '¡Foto subida!',
    jobs: 'trabajos',
    years: 'años exp.',
    viewAll: 'Ver todas',
    hide: 'Ocultar',
    service: 'Servicio',
    verifiedPro: 'Profesional verificado',
  },
  en: {
    reviews: 'Reviews',
    photos: 'Work Completed',
    book: 'Book service',
    chat: 'Send message',
    available: 'Available now',
    busy: 'Busy',
    writeReview: 'Write your review',
    reviewPlaceholder: 'Describe your experience with this professional...',
    submitReview: 'Post review',
    reviewTitle: 'Rate',
    selectRating: 'Select a rating',
    reviewSent: 'Review posted!',
    reviewSentSub: 'Thank you for your feedback',
    noPhotos: 'This professional has not uploaded photos yet',
    noReviews: 'No reviews yet',
    noReviewsSub: 'Be the first to rate',
    addPhoto: 'Upload work photo',
    photoUploaded: 'Photo uploaded!',
    jobs: 'jobs',
    years: 'yrs exp.',
    viewAll: 'View all',
    hide: 'Hide',
    service: 'Service',
    verifiedPro: 'Verified professional',
  }
}

const mockReviews = [
  { id: 1, user: 'María López', avatar: 'ML', color: '#F26000', rating: 5, comment: 'Excelente trabajo, muy profesional y puntual. Lo recomiendo al 100%.', date: '20 Feb 2026', service: 'Instalación eléctrica' },
  { id: 2, user: 'Pedro Sánchez', avatar: 'PS', color: '#C24D00', rating: 4, comment: 'Buen trabajo, llegó a tiempo y resolvió el problema rápido.', date: '15 Feb 2026', service: 'Reparación de circuito' },
  { id: 3, user: 'Ana Rodríguez', avatar: 'AR', color: '#FF8533', rating: 5, comment: '¡Increíble! Muy limpio y ordenado. Ya lo contraté dos veces.', date: '10 Feb 2026', service: 'Instalación eléctrica' },
  { id: 4, user: 'Luis García', avatar: 'LG', color: '#7A3000', rating: 3, comment: 'Buen trabajo pero llegó un poco tarde.', date: '5 Feb 2026', service: 'Reparación general' },
]

const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 600
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

const categoryMockPhotos = {
  electricista: [
    'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=600&q=80',
    'https://images.unsplash.com/photo-1558224494-ef8b24494494?w=600&q=80',
    'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&q=80',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80'
  ],
  mecanico: [
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80',
    'https://images.unsplash.com/photo-1507541904319-4720e9209701?w=600&q=80',
    'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=600&q=80',
    'https://images.unsplash.com/photo-1530047676767-17726af8bb55?w=600&q=80'
  ],
  'mecanico / asistencia vial': [
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80',
    'https://images.unsplash.com/photo-1507541904319-4720e9209701?w=600&q=80',
    'https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?w=600&q=80'
  ],
  plomero: [
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80',
    'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=600&q=80',
    'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&q=80',
    'https://images.unsplash.com/photo-1542013936693-8848e5740476?w=600&q=80'
  ],
  limpieza: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff0e9c3e92c?w=600&q=80',
    'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600&q=80',
    'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80'
  ],
  'limpieza del hogar': [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
    'https://images.unsplash.com/photo-1527515637462-cff0e9c3e92c?w=600&q=80'
  ],
  jardinero: [
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80',
    'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600&q=80',
    'https://images.unsplash.com/photo-1598902108854-10e335adac99?w=600&q=80'
  ],
  default: [
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
    'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=600&q=80',
    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80'
  ]
}

function Stars({ rating, interactive = false, onRate }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="stars-row">
      {[1,2,3,4,5].map(n => (
        <span
          key={n}
          className={`star ${n <= (interactive ? (hovered || rating) : rating) ? 'lit' : ''} ${interactive ? 'interactive' : ''}`}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate && onRate(n)}
        >★</span>
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  return (
    <div className="review-card">
      <div className="review-top">
        <div className="review-avatar" style={{ background: review.color }}>{review.avatar}</div>
        <div className="review-meta">
          <p className="review-user">{review.user}</p>
          <p className="review-service">{review.service}</p>
        </div>
        <div className="review-right">
          <Stars rating={review.rating} />
          <p className="review-date">{review.date}</p>
        </div>
      </div>
      <p className="review-comment">{review.comment}</p>
    </div>
  )
}

function PhotoGrid({ photos, lang, isOwnProfile, onUploadPhoto, onDeletePhoto }) {
  const T = txt[lang]
  const [lightbox, setLightbox] = useState(null)

  const handleFileChange = (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    onUploadPhoto(files)
    e.target.value = ''
  }

  return (
    <div className="photo-section">
      <input id="pro-work-upload" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
      
      {photos.length === 0 && !isOwnProfile && (
         <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📸</span>
            <p style={{ fontWeight: 'bold', margin: 0, color: '#333' }}>{T.noPhotos}</p>
         </div>
      )}

      <div className="photos-grid-title-wrap">
        <h2 className="photos-grid-title">{T.photos}</h2>
      </div>

      <div className="photos-grid">
        {isOwnProfile && (
          <button className="photo-upload-btn-new" onClick={() => document.getElementById('pro-work-upload').click()}>
            <span className="upload-icon">➕</span>
            <span className="upload-text">Subir Trabajo</span>
          </button>
        )}
        {photos.map((photo, index) => {
          const photoUrl = typeof photo === 'string' ? photo : photo.url
          const caption = typeof photo === 'string' ? 'Trabajo realizado' : (photo.caption || 'Trabajo realizado')
          const photoId = typeof photo === 'string' ? `img-${index}` : (photo.id || index)
          const isPortfolioPhoto = typeof photoId === 'string' && photoId.startsWith('port-')

          return (
            <div key={photoId} className="photo-thumb-wrapper">
              <button className="photo-thumb" onClick={() => setLightbox({ url: photoUrl, caption })}>
                <img src={photoUrl} alt={caption} />
                <div className="photo-overlay"><span>{caption}</span></div>
              </button>
              {isOwnProfile && isPortfolioPhoto && (
                <button className="delete-photo-btn" onClick={(e) => { e.stopPropagation(); onDeletePhoto(photoUrl) }} title="Eliminar foto">
                  ✕
                </button>
              )}
            </div>
          )
        })}
      </div>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.url} alt={lightbox.caption} />
            <p className="lightbox-caption">{lightbox.caption}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function WriteReview({ lang, proName, onSubmit }) {
  const T = txt[lang]
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [service, setService] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = () => {
    if (!rating || !comment.trim()) return
    setSent(true)
    onSubmit({ rating, comment, service })
  }

  if (sent) return (
    <div className="review-sent">
      <span>🎉</span>
      <p>{T.reviewSent}</p>
      <span className="review-sent-sub">{T.reviewSentSub}</span>
    </div>
  )

  return (
    <div className="write-review">
      <p className="write-review-title">{T.reviewTitle} {proName}</p>
      <Stars rating={rating} interactive onRate={setRating} />
      {rating === 0 && <p className="rating-hint">{T.selectRating}</p>}
      <input
        className="review-service-input"
        placeholder={T.service}
        value={service}
        onChange={e => setService(e.target.value)}
      />
      <textarea
        className="review-textarea"
        placeholder={T.reviewPlaceholder}
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
      />
      <button
        className={`review-submit-btn ${rating && comment.trim() ? 'active' : ''}`}
        disabled={!rating || !comment.trim()}
        onClick={handleSubmit}
      >
        {T.submitReview}
      </button>
    </div>
  )
}

export default function ProfessionalProfilePage({ lang = 'es', navigate, professional }) {
  const T = txt[lang]
  const { userData } = useUserData()

  const pro = professional || {
    name: 'Carlos Méndez', categoryEs: 'Mecánico', categoryEn: 'Mechanic',
    icon: '🔧', rating: 4.9, reviews: 128, price: 'RD$800/hr',
    location: 'Santo Domingo', avatar: 'CM', available: true, id: 1
  }

  const isOwnProfile = userData && (userData.uid === pro.id || userData.uid === pro.uid)
  const displayPro = isOwnProfile ? userData : pro

  const [activeTab, setActiveTab] = useState(pro.autoWriteReview ? 'reviews' : 'photos')
  const [reviews, setReviews] = useState([])
  const [proPhotos, setProPhotos] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [showWriteReview, setShowWriteReview] = useState(pro.autoWriteReview || false)
  const avatarColors = ['#F26000','#C24D00','#FF8533','#7A3000','#FFB380']
  const proColor = avatarColors[displayPro.id % avatarColors.length] || '#F26000'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('proId', '==', displayPro.id || displayPro.uid)
        )
        const snapshot = await getDocs(q)
        const fetchedReviews = []
        const fetchedEvidences = []
        let photoIdCounter = 1

        snapshot.forEach(doc => {
          const d = doc.data()
          if (d.rated === true || typeof d.ratingScore === 'number') {
            fetchedReviews.push({
              id: doc.id,
              user: d.reviewerName || d.clientName || 'Cliente',
              avatar: (d.reviewerName || d.clientName || 'C').substring(0,2).toUpperCase(),
              color: avatarColors[Math.floor(Math.random() * avatarColors.length)],
              rating: d.ratingScore || 5,
              comment: d.ratingComment || '',
              date: d.dateToken || 'Reciente',
              service: d.proSpecialty || d.specialty || 'Servicio General',
              createdAt: d.createdAt?.seconds || 0
            })
          }
          if (d.evidences && Array.isArray(d.evidences) && d.evidences.length > 0) {
            d.evidences.forEach(url => {
              fetchedEvidences.push({
                id: photoIdCounter++,
                url: url,
                caption: d.evidenceText || d.specialty || d.proSpecialty || 'Evidencia de trabajo completado',
                createdAt: d.createdAt?.seconds || 0
              })
            })
          }
        })
        
        fetchedEvidences.sort((a,b) => b.createdAt - a.createdAt)
        setProPhotos(fetchedEvidences)

        if (fetchedReviews.length === 0) {
          setReviews(mockReviews)
        } else {
          fetchedReviews.sort((a,b) => b.createdAt - a.createdAt)
          setReviews(fetchedReviews)
        }
      } catch (e) {
        console.error('Error fetching data:', e)
        setReviews(mockReviews)
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchData()
  }, [displayPro.id, displayPro.uid])

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0'
  const ratingDist = [5,4,3,2,1].map(n => ({
    n,
    count: reviews.filter(r => r.rating === n).length,
    pct: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === n).length / reviews.length) * 100) : (n === 5 ? 100 : 0)
  }))

  const handleNewReview = ({ rating, comment, service }) => {
    setReviews(prev => [{
      id: prev.length + 1,
      user: 'Tú',
      avatar: 'TU',
      color: '#F26000',
      rating,
      comment,
      date: 'Hoy',
      service: service || 'Servicio general'
    }, ...prev])
    setShowWriteReview(false)
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await compressImage(file)
      await updateDoc(doc(db, 'users', userData.uid), { coverURL: base64 })
    } catch (err) {
      console.error("Error uploading cover:", err)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const base64 = await compressImage(file)
      await updateDoc(doc(db, 'users', userData.uid), { photoURL: base64 })
    } catch (err) {
      console.error("Error uploading avatar:", err)
    }
  }

  const handleWorkUpload = async (files) => {
    try {
      const uploadPromises = Array.from(files).map(file => compressImage(file))
      const base64Images = await Promise.all(uploadPromises)
      await updateDoc(doc(db, 'users', userData.uid), {
        photos: arrayUnion(...base64Images)
      })
    } catch (err) {
      console.error("Error uploading work photos:", err)
    }
  }

  const handleDeleteWorkPhoto = async (photoUrl) => {
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        photos: arrayRemove(photoUrl)
      })
    } catch (err) {
      console.error("Error deleting work photo:", err)
    }
  }

  // Combine manual photos and evidences
  const portfolioPhotos = displayPro.photos || []
  const allPhotos = [
    ...portfolioPhotos.map((url, i) => ({ id: `port-${i}`, url, caption: 'Portafolio' })),
    ...proPhotos.filter(ph => !portfolioPhotos.includes(ph.url))
  ]

  const finalPhotos = allPhotos.length > 0 ? allPhotos : (
    (categoryMockPhotos[String(displayPro.category || displayPro.categoryEs || '').toLowerCase()] || categoryMockPhotos.default).map((url, i) => ({
      id: `mock-${i}`,
      url,
      caption: 'Demo - Trabajo'
    }))
  )

  const getPlanDetails = (planId) => {
    const p = (planId || '').toLowerCase()
    if (p.includes('vip') || p.includes('elite') || p.includes('ilimitado')) {
      return { label: 'PLAN VIP', medal: '👑', grad: 'linear-gradient(135deg, #F97316, #EF4444)' }
    } else if (p.includes('platinum') || p.includes('platino')) {
      return { label: 'PLAN PLATINUM', medal: '💎', grad: 'linear-gradient(135deg, #B0BEC5, #78909C)' }
    } else if (p.includes('gold')) {
      return { label: 'PLAN GOLD', medal: '⭐', grad: 'linear-gradient(135deg, #FDE047, #EAB308)' }
    }
    return { label: 'PLAN BÁSICO', medal: '🛠️', grad: 'linear-gradient(135deg, #94A3B8, #64748B)' }
  }

  const planInfo = getPlanDetails(displayPro.currentPlan || displayPro.planId || displayPro.plan)

  return (
    <div className="pro-profile-page">
      {/* Ocultos inputs de archivos */}
      <input id="pro-cover-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
      <input id="pro-avatar-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />

      {/* Header naranja superior de 25.png */}
      <div className="pro-header-bar">
        <button className="pro-back-btn-new" onClick={() => navigate('search')}>←</button>
        <span className="pro-header-title">PERFIL PROFESIONAL</span>
        <div className="pro-bell-wrap">
          <span className="pro-bell-icon">🔔</span>
          <span className="pro-bell-badge">1</span>
        </div>
      </div>

      {/* Portada Cover */}
      <div 
        className="pro-cover"
        style={displayPro.coverURL ? { backgroundImage: `linear-gradient(135deg, rgba(255,140,66,0.1) 0%, rgba(242,96,0,0.2) 100%), url(${displayPro.coverURL})` } : {}}
      >
        <div className="pro-logo-overlay">
          <img src={logoListo} alt="Listo Patrón Logo" className="pro-logo-img" />
        </div>
        {isOwnProfile && (
          <button className="edit-cover-btn" onClick={() => document.getElementById('pro-cover-upload').click()} title="Cambiar Portada">
            📷 Cambiar Portada
          </button>
        )}
      </div>

      {/* Info del profesional */}
      <div className="pro-info-section">
        <div className="pro-avatar-wrap">
          {displayPro.photoURL ? (
            <img src={displayPro.photoURL} alt={displayPro.name} className="pro-avatar-large" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="pro-avatar-large" style={{ background: proColor }}>
              {displayPro.avatar || pro.avatar}
            </div>
          )}
          
          {isOwnProfile ? (
            <button className="edit-avatar-btn" onClick={() => document.getElementById('pro-avatar-upload').click()} title="Cambiar Foto de Perfil">
              ✏️
            </button>
          ) : (
            <button className="pro-chat-floating-btn" onClick={() => navigate('chat', displayPro)} title="Enviar mensaje">
              💬
            </button>
          )}
        </div>

        <div className="pro-info-main">
          {/* Placa de Plan */}
          <div className="pro-plan-badge" style={{ background: planInfo.grad }}>
            <div className="plan-badge-left">
              <span className="plan-badge-title">PLAN</span>
              <span className="plan-badge-type">{planInfo.label.replace('PLAN ', '')}</span>
            </div>
            <span className="plan-badge-medal">{planInfo.medal}</span>
          </div>

          <div className="pro-name-row">
            <h1 className="pro-name">{displayPro.name}</h1>
            <span className="pro-verified">✓</span>
          </div>
          
          <h2 className="pro-spec-bold">
            {displayPro.category || displayPro.categoryEs || displayPro.specEs || 'PROFESIONAL'}
          </h2>
          
          <p className="pro-location">📍 {displayPro.location}</p>
          <div className="pro-badges">
            <span className={`pro-status-badge ${displayPro.available ? 'avail' : 'busy'}`}>
              {displayPro.available ? T.available : T.busy}
            </span>
            <span className="pro-verified-badge">✓ {T.verifiedPro}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="pro-stats-row">
        <div className="pro-stat">
          <span className="pro-stat-num">★ {avgRating}</span>
          <span className="pro-stat-label">{T.reviews}</span>
        </div>
        <div className="pro-stat-divider" />
        <div className="pro-stat">
          <span className="pro-stat-num">{reviews.length}</span>
          <span className="pro-stat-label">{T.reviews}</span>
        </div>
        <div className="pro-stat-divider" />
        <div className="pro-stat">
          <span className="pro-stat-num">{displayPro.price || pro.price}</span>
          <span className="pro-stat-label">Tarifa</span>
        </div>
        <div className="pro-stat-divider" />
        <div className="pro-stat">
          <span className="pro-stat-num">3</span>
          <span className="pro-stat-label">{T.years}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="pro-tabs">
        <button className={`pro-tab ${activeTab === 'photos' ? 'active' : ''}`} onClick={() => setActiveTab('photos')}>
          📷 {T.photos}
        </button>
        <button className={`pro-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
          ⭐ {T.reviews} ({reviews.length})
        </button>
      </div>

      <div className="pro-tab-content">
        {/* FOTOS Y EVIDENCIAS */}
        {activeTab === 'photos' && (
          <PhotoGrid 
            photos={finalPhotos} 
            lang={lang} 
            isOwnProfile={isOwnProfile}
            onUploadPhoto={handleWorkUpload}
            onDeletePhoto={handleDeleteWorkPhoto}
          />
        )}

        {/* RESEÑAS */}
        {activeTab === 'reviews' && (
          <div className="reviews-section">
            {/* Rating summary */}
            <div className="rating-summary">
              <div className="rating-big">
                <span className="rating-num">{avgRating}</span>
                <Stars rating={Math.round(avgRating)} />
                <span className="rating-count">{reviews.length} {T.reviews}</span>
              </div>
              <div className="rating-bars">
                {ratingDist.map(({ n, count, pct }) => (
                  <div key={n} className="rating-bar-row">
                    <span className="rbar-label">{n}★</span>
                    <div className="rbar-track">
                      <div className="rbar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="rbar-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botón escribir reseña */}
            {!isOwnProfile && (
              <button className="write-review-toggle" onClick={() => setShowWriteReview(v => !v)}>
                ✏️ {T.writeReview}
              </button>
            )}

            {showWriteReview && !isOwnProfile && (
              <WriteReview lang={lang} proName={displayPro.name} onSubmit={handleNewReview} />
            )}

            {/* Lista de reseñas */}
            <div className="reviews-list">
              {loadingReviews && <p style={{textAlign: 'center', color: '#666', padding: '20px'}}>{lang === 'es' ? 'Cargando reseñas...' : 'Loading reviews...'}</p>}
              {!loadingReviews && reviews.length === 0 && (
                 <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <span style={{ fontSize: 40 }}>⭐</span>
                    <p style={{ fontWeight: 'bold', margin: '12px 0 4px' }}>{T.noReviews}</p>
                    <p style={{ color: '#666', fontSize: 14 }}>{T.noReviewsSub}</p>
                 </div>
              )}
              {!loadingReviews && reviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ height: 110 }} />

      {/* Sticky Bottom Actions */}
      {!isOwnProfile && (
        <div className="pro-actions-sticky slide-up-anim">
          {(() => {
            let btnStyle = { flex: 1, padding: '16px', borderRadius: '100px', border: 'none', color: '#fff', fontSize: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' };
            
            if (planInfo.label.includes('VIP')) { 
              btnStyle.background = 'linear-gradient(135deg, #FF6B00, #FF3D00)'; 
              btnStyle.boxShadow = '0 8px 20px rgba(255, 107, 0, 0.35)'; 
            } else if (planInfo.label.includes('PLATINUM')) { 
              btnStyle.background = 'linear-gradient(135deg, #B0BEC5, #78909C)'; 
              btnStyle.boxShadow = '0 8px 20px rgba(176, 190, 197, 0.35)'; 
            } else if (planInfo.label.includes('GOLD')) { 
              btnStyle.background = 'linear-gradient(135deg, #FDE047, #EAB308)'; 
              btnStyle.color = '#1a1a2e'; 
              btnStyle.boxShadow = '0 8px 20px rgba(255, 215, 0, 0.35)'; 
            } else { 
              btnStyle.background = 'linear-gradient(135deg, #F26000, #E65C00)'; 
              btnStyle.boxShadow = '0 8px 20px rgba(242, 96, 0, 0.3)'; 
            }
            
            let icon = planInfo.medal;

            if (typeof displayPro.contracts !== 'undefined' && displayPro.contracts <= 0) {
              return (
                <button style={{ ...btnStyle, background: '#E0E0E0', color: '#888', boxShadow: 'none', cursor: 'not-allowed' }} disabled>
                  🚫 {lang === 'es' ? 'Sin turnos disponibles' : 'No available slots'}
                </button>
              )
            }
            return (
              <button className="book-btn-squish" style={btnStyle} onClick={() => navigate('booking', displayPro)}>
                {icon} {T.book}
              </button>
            )
          })()}
        </div>
      )}
    </div>
  )
}