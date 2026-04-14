import { useState, useEffect, useRef } from 'react'
import { db, auth } from '../firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { useUserData } from '../useUserData'
import './PlanesPage.css'

export default function PlanesPage({ onBack, navigate }) {
  const { userData } = useUserData()
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const currentPlanId = userData?.plan || 'gold'
  const [purchasedPlan, setPurchasedPlan] = useState(null)

  const URL_AZUL = "https://pruebas.azul.com.do/paymentpage/Default.aspx"; // TODO: prod url
  const formRef = useRef(null);
  const [pagoAzulData, setPagoAzulData] = useState(null);
  const [isProcessingAzul, setIsProcessingAzul] = useState(false);

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
        'Hasta 3 contratos al mes',
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
        'Hasta 8 contratos al mes',
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
        'Hasta 15 contratos al mes',
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

  const handleSelectPlan = async (planId, planPriceText) => {
    if (planId === currentPlanId) return
    setLoading(true)
    setIsProcessingAzul(true)
    try {
      if (auth.currentUser?.uid) {
        const { httpsCallable } = await import("firebase/functions");
        const { functions } = await import("../firebase");
        
        const generarFirma = httpsCallable(functions, "generarFirmaAzul");
        
        // Parsear "RD$1,500" a entero 1500 y multiplicarlo x100 para AZUL
        const priceNumber = parseInt(planPriceText.replace(/\D/g, ''), 10);
        const totalAzul = String(Math.round(priceNumber * 100)); 
        const userId = auth.currentUser.uid;
        const orderIdUnique = `PLAN_${planId}_${userId}`; // Formato identificable por el Webhook
        
        // Configurar webhook backend (Cloud Function)
        const cloudFunctionEndpoint = "https://us-central1-listoapp-52b46.cloudfunctions.net/azulWebHook"; 
        
        const payload = {
          MerchantName: "Listo App - Planes",
          MerchantType: "E-Commerce",
          CurrencyCode: "$", // DOP
          OrderNumber: orderIdUnique,
          Amount: totalAzul,
          Tax: "000",
          ApprovedUrl: cloudFunctionEndpoint,
          DeclinedUrl: window.location.origin + "/profile?planError=declined",
          CancelUrl: window.location.origin + "/profile?planError=cancelled",
          ResponsePostUrl: cloudFunctionEndpoint
        };

        const res = await generarFirma(payload);
        const { AuthHash, MerchantId } = res.data;

        setPagoAzulData({ ...payload, MerchantId, AuthHash });
        
        // Autoenviar a AZUL tras un breve timeout para parseo react
        setTimeout(() => {
          if (formRef.current) formRef.current.submit();
        }, 600);
      }
    } catch (e) {
      console.error(e)
      alert("Error comunicándose de manera segura con el Procesador AZUL.")
      setIsProcessingAzul(false)
      setLoading(false)
    }
  }

  if (purchasedPlan) {
    const isProfileIncomplete = !userData?.profileComplete;
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <style>{`
          @keyframes big-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes fire-glow {
            0%, 100% { box-shadow: 0 4px 15px rgba(242,96,0,0.5); }
            50% { box-shadow: 0 4px 30px rgba(255,165,0,0.8); }
          }
        `}</style>
        <div style={{ fontSize: '80px', marginBottom: '16px', animation: 'big-bounce 2s infinite' }}>🎉</div>
        <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1a1a2e', textAlign: 'center', marginBottom: '16px' }}>¡Plan Solicitado!</h2>
        
        {isProfileIncomplete ? (
          <>
            <p style={{ fontSize: '15px', color: '#666', textAlign: 'center', lineHeight: '1.6', marginBottom: '32px' }}>
              Has dado el primer paso. <b style={{color: '#1a1a2e'}}>Ahora debes completar tu perfil para comenzar a generar ingresos.</b> Necesitamos tus datos para mostrarte a los clientes.
            </p>
            <button 
              style={{ background: 'linear-gradient(135deg, #F26000, #FF7A1A)', color: 'white', border: 'none', padding: '16px 24px', fontSize: '16px', fontWeight: '900', borderRadius: '12px', cursor: 'pointer', width: '100%', maxWidth: '300px', animation: 'fire-glow 1.5s infinite' }}
              onClick={() => {
                setPurchasedPlan(null);
                navigate('completar-perfil');
              }}
            >
              📝 Completar Perfil Ahora
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: '15px', color: '#666', textAlign: 'center', lineHeight: '1.6', marginBottom: '32px' }}>
              Tu plan ha sido actualizado correctamente. Ya estás listo para destacar y conseguir más contratos en la plataforma.
            </p>
            <button 
              style={{ background: '#1a1a2e', color: 'white', border: 'none', padding: '16px 24px', fontSize: '16px', fontWeight: '900', borderRadius: '12px', cursor: 'pointer', width: '100%', maxWidth: '300px' }}
              onClick={() => {
                setPurchasedPlan(null);
                onBack(); // Volver al inicio o a donde estaba
              }}
            >
              🚀 Volver al Inicio
            </button>
          </>
        )}
      </div>
    )
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
                style={{ borderColor: isCurrent ? '' : plan.color }}
              >
                {plan.badge && <div className="plan-card-badge" style={{ background: plan.id === 'vip' ? '#1A1A2E' : plan.color, color: plan.id === 'vip' ? '#FFD700' : 'white' }}>{plan.badge}</div>}
                
                <div className="plan-top" style={{ background: plan.id === 'platinum' || plan.id === 'vip' ? 'transparent' : '#FFFBEB' }}>
                  <div className="plan-icon">{plan.icon}</div>
                  <div className="plan-name-wrap">
                    <h3 className="plan-name" style={{ color: plan.id === 'platinum' || plan.id === 'vip' ? 'white' : '#1a1a1a' }}>{plan.name}</h3>
                    <p className="plan-target" style={{ color: plan.id === 'platinum' || plan.id === 'vip' ? '#aaa' : '#666' }}>{plan.target}</p>
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
                        handleSelectPlan(plan.id, plan.price)
                    }}
                    disabled={isCurrent || isProcessingAzul || (plan.id === 'vip' && !isVipEligible)}
                  >
                    {isCurrent ? 'Plan Actual' : (plan.id === 'vip' && !isVipEligible) ? 'Requiere +3 años exp.' : isProcessingAzul ? 'Conectando...' : 'Adquirir Plan'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* INVISIBLE AZUL FORM */}
        {pagoAzulData && (
          <form 
            ref={formRef} 
            action={URL_AZUL} 
            method="post" 
            style={{ display: 'none' }}
          >
            <input name="MerchantId" type="hidden" value={pagoAzulData.MerchantId} />
            <input name="MerchantName" type="hidden" value={pagoAzulData.MerchantName} />
            <input name="MerchantType" type="hidden" value={pagoAzulData.MerchantType} />
            <input name="CurrencyCode" type="hidden" value={pagoAzulData.CurrencyCode} />
            <input name="OrderNumber" type="hidden" value={pagoAzulData.OrderNumber} />
            <input name="Amount" type="hidden" value={pagoAzulData.Amount} />
            <input name="Tax" type="hidden" value={pagoAzulData.Tax} />
            <input name="ApprovedUrl" type="hidden" value={pagoAzulData.ApprovedUrl} />
            <input name="DeclinedUrl" type="hidden" value={pagoAzulData.DeclinedUrl} />
            <input name="CancelUrl" type="hidden" value={pagoAzulData.CancelUrl} />
            <input name="ResponsePostUrl" type="hidden" value={pagoAzulData.ResponsePostUrl} />
            <input name="UseCustomField1" type="hidden" value="0" />
            <input name="CustomField1Label" type="hidden" value="" />
            <input name="CustomField1Value" type="hidden" value="" />
            <input name="UseCustomField2" type="hidden" value="0" />
            <input name="CustomField2Label" type="hidden" value="" />
            <input name="CustomField2Value" type="hidden" value="" />
            <input name="AuthHash" type="hidden" value={pagoAzulData.AuthHash} />
          </form>
        )}

        <div className="planes-promo fade-up">
          <h3>🎁 Bienvenido a Listo Patrón</h3>
          <p>¿Nuevo en Listo? Todos los profesionales nuevos reciben automáticamente <strong>1 mes gratis en el plan BÁSICO</strong> para que prueben la plataforma y comiencen a conseguir clientes.</p>
        </div>

        <div style={{ height: 40 }} />
      </div>
    </div>
  )
}
