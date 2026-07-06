import { useState, useEffect, useRef } from 'react'
import { db, auth } from '../firebase'
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useUserData } from '../useUserData'
import './PlanesPage.css'

export default function PlanesPage({ onBack, navigate }) {
  const { userData } = useUserData()
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const currentPlanId = userData?.plan || 'gold'
  const [purchasedPlan, setPurchasedPlan] = useState(null)

  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null)
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExp, setCardExp] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [showReceipt, setShowReceipt] = useState(false)
  const [purchasedPlanDetails, setPurchasedPlanDetails] = useState(null)
  const [authCode, setAuthCode] = useState(0)
  const [last4, setLast4] = useState('')

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

  const handleSelectPlan = (planId, planPriceText) => {
    if (planId === currentPlanId) return
    const planObj = planes.find(p => p.id === planId)
    setSelectedPlanForCheckout(planObj)
    setCardName('')
    setCardNumber('')
    setCardExp('')
    setCardCvv('')
  }

  const handleConfirmPayment = async () => {
    if (!selectedPlanForCheckout) return
    setLoading(true)
    try {
      if (auth.currentUser?.uid) {
        // 1. Actualizar el plan en Firestore
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          plan: selectedPlanForCheckout.id,
          planStatus: 'active',
          approved: true
        })

        // 2. Crear notificación para admin
        try {
          await addDoc(collection(db, 'notificaciones'), {
            userId: 'admin',
            type: 'plan_purchased',
            title: '💎 NUEVA COMPRA DE PLAN',
            text: `El profesional ${userData?.name || 'Un profesional'} (${userData?.email || 'Sin email'}) ha adquirido el plan ${selectedPlanForCheckout.id.toUpperCase()} por ${selectedPlanForCheckout.price}.`,
            read: false,
            createdAt: serverTimestamp()
          });
        } catch (errNotif) {
          console.error("Error guardando notificación admin:", errNotif);
        }

        // 3. Preparar datos del recibo
        setAuthCode(Math.floor(10000 + Math.random() * 90000))
        setLast4(cardNumber.replace(/\s/g, '').slice(-4) || '••••')
        setPurchasedPlanDetails(selectedPlanForCheckout)
        setShowReceipt(true)
        setSelectedPlanForCheckout(null)
      }
    } catch (err) {
      console.error("Error al procesar el pago del plan:", err)
      alert("Error al procesar el pago. Por favor intenta de nuevo.")
    } finally {
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

        {/* INVISIBLE AZUL FORM — CORRECCIONES APLICADAS */}
        {pagoAzulData && (
          <form 
            ref={formRef} 
            action={URL_AZUL} 
            method="post" 
            style={{ display: 'none' }}
          >
            <input name="MerchantId"        type="hidden" value={pagoAzulData.MerchantId} />
            <input name="MerchantName"      type="hidden" value={pagoAzulData.MerchantName} />
            <input name="MerchantType"      type="hidden" value={pagoAzulData.MerchantType} />
            <input name="CurrencyCode"      type="hidden" value={pagoAzulData.CurrencyCode} />
            <input name="OrderNumber"       type="hidden" value={pagoAzulData.OrderNumber} />
            <input name="Amount"            type="hidden" value={pagoAzulData.Amount} />
            {/* ✅ FIX 1: Corregido "Itbis" → "ITBIS" (mayúsculas correctas) */}
            <input name="ITBIS"             type="hidden" value={pagoAzulData.ITBIS} />
            <input name="ApprovedUrl"       type="hidden" value={pagoAzulData.ApprovedUrl} />
            <input name="DeclinedUrl"       type="hidden" value={pagoAzulData.DeclinedUrl} />
            <input name="CancelUrl"         type="hidden" value={pagoAzulData.CancelUrl} />
            <input name="UseCustomField1"   type="hidden" value="0" />
            <input name="CustomField1Label" type="hidden" value="" />
            <input name="CustomField1Value" type="hidden" value="" />
            <input name="UseCustomField2"   type="hidden" value="0" />
            <input name="CustomField2Label" type="hidden" value="" />
            <input name="CustomField2Value" type="hidden" value="" />
            <input name="AuthHash"          type="hidden" value={pagoAzulData.AuthHash} />
          </form>
        )}

        <div className="planes-promo fade-up">
          <h3>🎁 Bienvenido a Listo Patrón</h3>
          <p>¿Nuevo en Listo? Todos los profesionales nuevos reciben automáticamente <strong>1 mes gratis en el plan BÁSICO</strong> para que prueben la plataforma y comiencen a conseguir clientes.</p>
        </div>

        <div style={{ height: 40 }} />
      </div>

      {/* Checkout Modal */}
      {selectedPlanForCheckout && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF', backgroundColor: '#FFFFFF',
            borderRadius: '24px', padding: '28px 24px', width: '100%', maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative',
            display: 'flex', flexDirection: 'column', gap: '16px', color: '#1A1A2E',
            textAlign: 'left'
          }}>
            <button 
              onClick={() => setSelectedPlanForCheckout(null)}
              style={{
                position: 'absolute', top: '20px', right: '20px', border: 'none',
                background: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748B'
              }}
            >✕</button>

            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, fontFamily: "'Syne', sans-serif" }}>
              Detalles del Pago
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0, marginTop: '-8px' }}>
              Completa tu tarjeta para adquirir el plan {selectedPlanForCheckout.name}
            </p>

            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Plan seleccionado:</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: selectedPlanForCheckout.color }}>{selectedPlanForCheckout.name} ({selectedPlanForCheckout.price})</span>
            </div>

            {/* Card Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Nombre en la Tarjeta</label>
                <input 
                  type="text" 
                  placeholder="Nombre completo"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#FAFAFA', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Número de Tarjeta</label>
                <input 
                  type="tel" 
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  value={cardNumber}
                  onChange={e => {
                    let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
                    let parts = []
                    for (let i = 0; i < v.length; i += 4) {
                      parts.push(v.substring(i, i + 4))
                    }
                    setCardNumber(parts.join(' '))
                  }}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#FAFAFA', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Vencimiento</label>
                  <input 
                    type="tel" 
                    placeholder="MM/AA"
                    maxLength={5}
                    value={cardExp}
                    onChange={e => {
                      let val = e.target.value
                      let clean = val.replace(/\D/g, '')
                      if (clean.length === 1 && clean > '1') clean = '0' + clean
                      if (clean.length >= 2) {
                        let m = parseInt(clean.substring(0,2), 10)
                        if (m < 1) m = 1
                        if (m > 12) m = 12
                        clean = (m < 10 ? '0' + m : String(m)) + clean.substring(2)
                      }
                      if (clean.length > 2) setCardExp(clean.substring(0,2) + '/' + clean.substring(2,4))
                      else setCardExp(clean)
                    }}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#FAFAFA', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>CVV</label>
                  <input 
                    type="tel" 
                    placeholder="123"
                    maxLength={4}
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E2E8F0', background: '#FAFAFA', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* Security Logos */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', opacity: 0.8, fontSize: '12px', color: '#64748B', margin: '4px 0' }}>
              <span>🔒 Pago seguro 256-bit SSL</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
              <button
                disabled={loading || cardName.trim() === '' || cardNumber.replace(/\s/g, '').length < 15 || cardExp.length < 5 || cardCvv.length < 3}
                onClick={handleConfirmPayment}
                style={{
                  background: 'linear-gradient(135deg, #F26000, #FF8533)',
                  color: 'white', border: 'none', borderRadius: '14px', padding: '14px',
                  fontSize: '16px', fontWeight: '700', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(242,96,0,0.3)', outline: 'none',
                  opacity: (cardName.trim() === '' || cardNumber.replace(/\s/g, '').length < 15 || cardExp.length < 5 || cardCvv.length < 3) ? 0.6 : 1
                }}
              >
                {loading ? 'Procesando Pago...' : `Confirmar y Pagar ${selectedPlanForCheckout.price}`}
              </button>
              <button
                onClick={() => setSelectedPlanForCheckout(null)}
                style={{
                  background: 'none', border: 'none', color: '#64748B', padding: '8px',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer', outline: 'none'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && purchasedPlanDetails && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10001,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '380px', background: '#FFFFFF',
            borderRadius: '24px', overflow: 'hidden',
            boxShadow: '0 24px 50px rgba(0,0,0,0.3)',
            borderTop: '8px solid #F26000',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '30px 24px', boxSizing: 'border-box', color: '#1a1a2e',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            
            {/* Logo */}
            <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '0.5px', marginBottom: '16px' }}>
              LISTO <span style={{ color: '#F26000' }}>PATRÓN</span>
            </div>

            {/* Success Check */}
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: '#ECFDF5', border: '2px solid #10B981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', color: '#10B981', marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
            }}>✓</div>

            {/* Title / Subtitle */}
            <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 4px', textAlign: 'center' }}>¡Pago Completado!</h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px', textAlign: 'center' }}>Su recibo electrónico fue generado.</p>

            {/* Amount */}
            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1A1A2E', marginBottom: '24px', letterSpacing: '-0.5px' }}>
              RD$ {parseFloat(purchasedPlanDetails.price.replace(/\D/g, '')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            {/* Details Box */}
            <div style={{
              width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0',
              borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column',
              gap: '12px', boxSizing: 'border-box', marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748B', fontWeight: '500' }}>Concepto:</span>
                <span style={{ color: '#1A1A2E', fontWeight: '700', textAlign: 'right' }}>Plan {purchasedPlanDetails.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748B', fontWeight: '500' }}>Fecha:</span>
                <span style={{ color: '#1A1A2E', fontWeight: '700', textAlign: 'right' }}>
                  {(() => {
                    const date = new Date();
                    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                    return `${date.getDate()} de ${months[date.getMonth()]} del ${date.getFullYear()}`;
                  })()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748B', fontWeight: '500' }}>Método de pago:</span>
                <span style={{ color: '#1A1A2E', fontWeight: '700', textAlign: 'right' }}>VISA •••• {last4}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748B', fontWeight: '500' }}>Autorización AZUL:</span>
                <span style={{ color: '#00b050', fontWeight: '800', textAlign: 'right' }}>Aprobado #{authCode}</span>
              </div>
            </div>

            {/* Screenshot capture text */}
            <p style={{ fontSize: '11px', color: '#F26000', fontWeight: '700', margin: '0 0 16px', textAlign: 'center' }}>
              📸 Toma una captura de pantalla de este recibo.
            </p>

            {/* Footer text */}
            <div style={{ fontSize: '10.5px', color: '#94A3B8', textAlign: 'center', lineHeight: '1.4', marginBottom: '24px' }}>
              Este es un recibo automático generado por Listo Patrón SRL. Gracias por confiar en nosotros. Si tiene algún reclamo sobre su pago, por favor contáctenos a través de la aplicación.
            </div>

            {/* Main Button with dynamic plan text */}
            <button 
              onClick={() => {
                setShowReceipt(false);
                setPurchasedPlanDetails(null);
                onBack();
              }}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #F26000, #FF8533)',
                color: 'white', border: 'none', borderRadius: '14px', padding: '16px',
                fontSize: '15px', fontWeight: '700', cursor: 'pointer', outline: 'none',
                boxShadow: '0 4px 16px rgba(242,96,0,0.3)', fontFamily: "'Syne', sans-serif"
              }}
            >
              {(() => {
                const planId = purchasedPlanDetails.id.toLowerCase();
                if (planId === 'basico') return 'Has comprado un plan Básico';
                if (planId === 'gold') return 'Has comprado un plan Gold';
                if (planId === 'platinum') return 'Has comprado un plan Platinum';
                if (planId === 'vip') return 'Has comprado un plan VIP';
                return `Has comprado un plan ${purchasedPlanDetails.id.toUpperCase()}`;
              })()}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}