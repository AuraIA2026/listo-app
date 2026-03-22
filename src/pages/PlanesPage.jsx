import { useState, useEffect } from 'react'
import { db, auth } from '../firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useUserData } from '../useUserData'
import './PlanesPage.css'

export default function PlanesPage({ onBack, navigate }) {
  const { userData } = useUserData()
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const currentPlanId = userData?.plan || 'gold'

  const planes = [
    {
      id: 'basico',
      name: 'BÁSICO (Entrada)',
      icon: '⚪',
      price: 'RD$500',
      period: '/ mes',
      shortDesc: 'Ideal para conseguir tus primeros clientes',
      target: 'Plan de inicio',
      color: '#9CA3AF',
      features: [
        'Perfil público en la app',
        'Hasta 3 postulaciones (trabajos) al mes',
        'Soporte estándar',
      ],
      limitations: [
        'Aparece debajo de los perfiles destacados',
        'Sin etiquetas exclusivas'
      ]
    },
    {
      id: 'gold',
      name: 'GOLD (Crecimiento)',
      icon: '🟡',
      price: 'RD$1,000',
      period: '/ mes',
      shortDesc: 'Aumenta tus oportunidades y presencia',
      target: 'Más visibilidad',
      color: '#F59E0B',
      features: [
        'Mejor visibilidad en búsquedas que el Básico',
        'Hasta 8 postulaciones a trabajos al mes',
        'Perfil con etiqueta "Recomendado"',
        'Soporte estándar'
      ]
    },
    {
      id: 'platinum',
      name: 'PLATINUM (Profesional)',
      icon: '⚫',
      price: 'RD$1,500',
      period: '/ mes',
      shortDesc: 'Aumenta tu estatus y aplica sin límites',
      target: 'El más popular',
      color: '#1A1A2E',
      badge: 'Popular 🔥',
      features: [
        'Hasta 15 postulaciones a trabajos al mes',
        'Alta visibilidad en búsquedas',
        'Acceso a clientes premium',
        'Badge destacado Platinum'
      ]
    },
    {
      id: 'vip',
      name: 'VIP (Élite Exclusivo)',
      icon: '⭐',
      price: 'RD$2,500',
      period: '/ mes',
      shortDesc: 'Solo para los mejores expertos verificados',
      target: 'Exclusividad Total',
      color: '#3B82F6',
      badge: '💎 Reservado',
      features: [
        'Requiere +3 años de experiencia comprobada',
        'Máxima visibilidad N°1 en tu categoría',
        'Contacto directo sin importar competencia',
        'Acceso prioritario a leads VIP',
        'Soporte VIP inmediato'
      ]
    }
  ]

  // Validar experiencia para VIP
  const isVipEligible = (() => {
    const exp = userData?.verificacion?.experiencia || ''
    return ['3 - 5 años', '5 - 10 años', 'Más de 10 años'].includes(exp)
  })()

  const handleSelectPlan = async (planId) => {
    if (planId === currentPlanId) return
    setLoading(true)
    try {
      if (auth.currentUser?.uid) {
        // En una app real esto llevaría a una pasarela de pago.
        // Aquí simulamos el cambio de plan
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          plan: planId,
          planUpdatedAt: new Date().toISOString()
        })
        setSuccessMsg(`¡Felicidades! Ahora eres nivel ${planId.toUpperCase()}`)
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  return (
    <div className="planes-page">
      <div className="planes-header">
        <button className="planes-back" onClick={onBack}>‹</button>
        <h2 className="planes-title">Mejora tu Plan</h2>
        <div style={{ width: 36 }} />
      </div>

      <div className="planes-scroll">
        <div className="planes-hero">
          <h1>Desbloquea más clientes</h1>
          <p>Sube de nivel y accede a trabajos exclusivos y mejor pagados. Invierte en tu perfil y multiplica tus ingresos.</p>
        </div>

        {successMsg && (
          <div className="planes-success-alert fade-in">
            ✅ {successMsg}
          </div>
        )}

        <div className="planes-list">
          {planes.map(plan => {
            const isCurrent = currentPlanId === plan.id
            return (
              <div 
                key={plan.id} 
                className={`plan-card ${plan.id} ${isCurrent ? 'current' : ''}`}
                style={{ borderColor: plan.color }}
              >
                {plan.badge && <div className="plan-card-badge" style={{ background: plan.color }}>{plan.badge}</div>}
                
                <div className="plan-top" style={{ background: plan.id==='platinum' ? '#1A1A2E' : plan.id==='vip' ? '#EFF6FF' : '#FFFBEB' }}>
                  <div className="plan-icon">{plan.icon}</div>
                  <div className="plan-name-wrap">
                    <h3 className="plan-name" style={{ color: plan.id==='platinum'?'white':'#1a1a1a' }}>{plan.name}</h3>
                    <p className="plan-target" style={{ color: plan.id==='platinum'?'#aaa':'#666' }}>{plan.target}</p>
                  </div>
                </div>

                <div className="plan-body">
                  <div className="plan-pricing">
                    <span className="plan-price">{plan.price}</span>
                    <span className="plan-period">{plan.period}</span>
                  </div>
                  
                  <p className="plan-short-desc">"{plan.shortDesc}"</p>

                  <ul className="plan-features">
                    {plan.features.map((feat, i) => (
                      <li key={i}><span>✔️</span> {feat}</li>
                    ))}
                    {plan.limitations?.map((lim, i) => (
                      <li key={i} className="limitation"><span>⚠️</span> {lim}</li>
                    ))}
                  </ul>

                  <button 
                    className={`plan-action-btn ${isCurrent || (plan.id === 'vip' && !isVipEligible) ? 'disabled' : ''}`}
                    style={{ background: isCurrent || (plan.id === 'vip' && !isVipEligible) ? '#E5E7EB' : plan.color, color: isCurrent || (plan.id === 'vip' && !isVipEligible) ? '#9CA3AF' : 'white' }}
                    onClick={() => {
                        if (plan.id === 'vip' && !isVipEligible) {
                            alert('El plan VIP requiere más de 3 años de experiencia en tu perfil verificado.');
                            return;
                        }
                        handleSelectPlan(plan.id)
                    }}
                    disabled={isCurrent || loading || (plan.id === 'vip' && !isVipEligible)}
                  >
                    {isCurrent ? 'Plan Actual' : (plan.id === 'vip' && !isVipEligible) ? 'Requiere +3 años exp.' : loading ? 'Procesando...' : 'Adquirir Plan'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="planes-promo fade-up">
          <h3>🎁 Oferta de Bienvenida</h3>
          <p>¿Nuevo en Listo? Todos los profesionales nuevos reciben automáticamente <strong>7 días gratis en el plan VIP</strong> para que prueben los beneficios de conseguir clientes de alto nivel.</p>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
