// src/locales/LocalCard.jsx
import './Locales.css'

const avatarColors = ['#F26000','#C24D00','#FF8533','#7A3000','#FFB380']

function getAvatarColor(str) {
  return avatarColors[
    Array.from(str || 'L').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length
  ]
}

export default function LocalCard({ local, onPress }) {
  const initials = (local.nombre || 'L').substring(0, 2).toUpperCase()
  const avatarBg = getAvatarColor(local.id || local.nombre || 'L')

  return (
    <div className="local-card" onClick={() => onPress && onPress(local)}>

      {/* Portada */}
      <div className="local-card-portada-wrap">
        {local.portadaURL
          ? <img src={local.portadaURL} alt={local.nombre} className="local-card-portada" />
          : <div className="local-card-portada-placeholder">🏢</div>
        }

        {/* Badge VIP */}
        <span className="local-card-vip-badge">👑 VIP</span>

        {/* Logo */}
        <div className="local-card-logo-wrap">
          {local.logoURL
            ? <img src={local.logoURL} alt="logo" className="local-card-logo" />
            : <div className="local-card-logo-placeholder" style={{ background: avatarBg }}>
                {initials}
              </div>
          }
        </div>
      </div>

      {/* Info */}
      <div className="local-card-body">
        <p className="local-card-nombre">{local.nombre || 'Local VIP'}</p>
        <p className="local-card-categoria">🔧 {local.categoria || 'Servicios'}</p>

        {/* Rating */}
        <div className="local-card-rating">
          <span className="local-card-stars">
            {'★'.repeat(Math.round(local.rating || 0))}{'☆'.repeat(5 - Math.round(local.rating || 0))}
          </span>
          <span className="local-card-rating-num">{Number(local.rating || 0).toFixed(1)}</span>
          <span className="local-card-reviews">({local.totalResenas || 0})</span>
        </div>

        <button className="local-card-btn" onClick={e => { e.stopPropagation(); onPress && onPress(local) }}>
          🏪 Ver Local
        </button>
      </div>
    </div>
  )
}