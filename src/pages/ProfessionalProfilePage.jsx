import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import './ProfessionalProfilePage.css'

const txt = {
  es: {
    reviews: 'Reseñas',
    photos: 'Fotos de trabajos',
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
    photos: 'Work photos',
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

function PhotoGrid({ photos, lang }) {
  const T = txt[lang]
  const [lightbox, setLightbox] = useState(null)
  const [localPhotos, setLocalPhotos] = useState(photos)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)

  const handleUpload = () => {
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setUploaded(true)
      setLocalPhotos(prev => [...prev, {
        id: prev.length + 1,
        url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80',
        caption: 'Nuevo trabajo'
      }])
      setTimeout(() => setUploaded(false), 2000)
    }, 1500)
  }

  return (
    <div className="photo-section">
      {localPhotos.length === 0 && (
         <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📸</span>
            <p style={{ fontWeight: 'bold', margin: 0, color: '#333' }}>{T.noPhotos}</p>
         </div>
      )}
      <div className="photos-grid">
        {localPhotos.map(photo => (
          <button key={photo.id} className="photo-thumb" onClick={() => setLightbox(photo)}>
            <img src={photo.url} alt={photo.caption} />
            <div className="photo-overlay"><span>{photo.caption}</span></div>
          </button>
        ))}
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
  const pro = professional || {
    name: 'Carlos Méndez', categoryEs: 'Mecánico', categoryEn: 'Mechanic',
    icon: '🔧', rating: 4.9, reviews: 128, price: 'RD$800/hr',
    location: 'Santo Domingo', avatar: 'CM', available: true, id: 1
  }

  const [activeTab, setActiveTab] = useState('photos')
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [showWriteReview, setShowWriteReview] = useState(false)
  const avatarColors = ['#F26000','#C24D00','#FF8533','#7A3000','#FFB380']
  const proColor = avatarColors[pro.id % avatarColors.length] || '#F26000'

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'orders'),
          where('proId', '==', pro.id || pro.uid),
          where('rated', '==', true)
        )
        const snapshot = await getDocs(q)
        const fetched = []
        snapshot.forEach(doc => {
          const d = doc.data()
          fetched.push({
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
        })
        
        // Add some mock reviews if none fetched so UI is not completely empty for testing
        if (fetched.length === 0) {
          setReviews(mockReviews)
        } else {
          fetched.sort((a,b) => b.createdAt - a.createdAt)
          setReviews(fetched)
        }
      } catch(e) {
        console.error("Error fetching reviews:", e)
        setReviews(mockReviews)
      } finally {
        setLoadingReviews(false)
      }
    }
    fetchReviews()
  }, [pro.id, pro.uid])

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

  return (
    <div className="pro-profile-page">
      {/* Header con cover */}
      <div className="pro-cover">
        <button className="pro-back-btn" onClick={() => navigate('search')}>←</button>
        <div className="pro-cover-gradient" />
      </div>

      {/* Info del profesional */}
      <div className="pro-info-section">
        <div className="pro-avatar-large" style={{ background: proColor }}>
          {pro.avatar}
        </div>
        <div className="pro-info-main">
          <div className="pro-name-row">
            <h1 className="pro-name">{pro.name}</h1>
            <span className="pro-verified">✓</span>
          </div>
          <p className="pro-cat">{pro.icon} {lang === 'es' ? pro.categoryEs : pro.categoryEn}</p>
          <p className="pro-location">📍 {pro.location}</p>
          <div className="pro-badges">
            <span className={`pro-status-badge ${pro.available ? 'avail' : 'busy'}`}>
              {pro.available ? T.available : T.busy}
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
          <span className="pro-stat-num">{pro.price}</span>
          <span className="pro-stat-label">Tarifa</span>
        </div>
        <div className="pro-stat-divider" />
        <div className="pro-stat">
          <span className="pro-stat-num">3</span>
          <span className="pro-stat-label">{T.years}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="pro-actions">
        <button className="pro-btn-book" onClick={() => navigate('booking', pro)}>
          📅 {T.book}
        </button>
        <button className="pro-btn-chat" onClick={() => navigate('chat', pro)}>
          💬 {T.chat}
        </button>
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
        {/* FOTOS */}
        {activeTab === 'photos' && (
          <PhotoGrid photos={pro.photos || []} lang={lang} />
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
            <button className="write-review-toggle" onClick={() => setShowWriteReview(v => !v)}>
              ✏️ {T.writeReview}
            </button>

            {showWriteReview && (
              <WriteReview lang={lang} proName={pro.name} onSubmit={handleNewReview} />
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

      <div style={{ height: 80 }} />
    </div>
  )
}