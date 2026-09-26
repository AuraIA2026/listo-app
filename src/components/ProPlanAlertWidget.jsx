import React, { useEffect, useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ProPlanAlertWidget({ userData, onOpenPlanModal }) {
  const isPro = userData?.type === 'pro' || userData?.role === 'professional';
  if (!isPro || !userData) return null;

  const contractsCount = Number(userData.contracts || 0);
  
  let daysLeft = null;
  let isExpired = false;

  if (userData.planExpirationDate) {
    const expTime = new Date(userData.planExpirationDate).getTime();
    const diffMs = expTime - Date.now();
    daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffMs <= 0) {
      isExpired = true;
    }
  } else if (userData.planStatus === 'inactive' || userData.planStatus === 'expired') {
    isExpired = true;
  }

  const isLowContracts = contractsCount <= 1;
  const isNearExpiration = daysLeft !== null && daysLeft <= 3 && !isExpired;
  const showAlert = isLowContracts || isNearExpiration || isExpired;

  useEffect(() => {
    if (!userData?.uid || !showAlert) return;
    const todayStr = new Date().toISOString().slice(0, 10);
    const key = `listo_plan_alert_sent_${userData.uid}_${todayStr}`;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, 'true');
      const title = isExpired 
        ? '🚨 Tu Plan de Listo Patrón ha Vencido' 
        : isLowContracts 
        ? `⚠️ Alerta: ¡Te queda solo ${contractsCount} contrato!` 
        : `⚠️ Alerta: Tu Plan vence en ${daysLeft} días`;
        
      const text = isExpired
        ? 'Hola socio, tu plan ha vencido. Renueva ahora en 1 clic para volver a ponerte en línea y recibir solicitudes de clientes.'
        : isLowContracts
        ? `Hola socio, te queda solo ${contractsCount} contrato libre en Listo Patrón. Renueva tu plan en 1 clic para evitar pausar tu visibilidad.`
        : `Hola socio, tu suscripción vence en ${daysLeft} día(s). Renueva en 1 clic para mantener tu estatus VIP y clientes activos.`;

      addDoc(collection(db, 'notificaciones'), {
        userId: userData.uid,
        type: 'system',
        title: title,
        text: text,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        read: false
      }).catch(err => console.log('Error creating alert notif:', err));
    }
  }, [userData?.uid, showAlert, isExpired, isLowContracts, contractsCount, daysLeft]);

  if (!showAlert) return null;

  return (
    <>
      <style>{`
        @keyframes alertGlow {
          0% { box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3); transform: scale(1); }
          50% { box-shadow: 0 12px 30px rgba(239, 68, 68, 0.6); transform: scale(1.01); }
          100% { box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3); transform: scale(1); }
        }
        @keyframes amberGlow {
          0% { box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3); transform: scale(1); }
          50% { box-shadow: 0 12px 30px rgba(245, 158, 11, 0.6); transform: scale(1.01); }
          100% { box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3); transform: scale(1); }
        }
      `}</style>
      <div 
        style={{
          margin: '0 16px 16px',
          padding: '16px',
          background: isExpired || (isLowContracts && contractsCount === 0) 
            ? 'linear-gradient(135deg, #7F1D1D, #EF4444)' 
            : 'linear-gradient(135deg, #78350F, #F59E0B)',
          borderRadius: '20px',
          color: '#FFFFFF',
          border: '1.5px solid rgba(255,255,255,0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          animation: isExpired || (isLowContracts && contractsCount === 0) ? 'alertGlow 2.5s infinite' : 'amberGlow 2.5s infinite',
          position: 'relative',
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', flexShrink: 0
          }}>
            {isExpired ? '🚨' : isLowContracts ? '⚠️' : '⏳'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: '900', fontFamily: 'var(--display)', color: '#FFF' }}>
              {isExpired
                ? '¡Tu Plan ha Vencido!'
                : (isLowContracts
                    ? (contractsCount === 0 ? '¡Sin Contratos Libres!' : '¡Solo 1 Contrato Libre!')
                    : `¡Tu Plan Vence en ${daysLeft} Días!`)}
            </h4>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.95, lineHeight: 1.4, fontWeight: '500' }}>
              {isExpired
                ? 'Renueva tu suscripción para volver a estar visible para clientes.'
                : (isLowContracts
                    ? `Te quedan ${contractsCount} contratos. Renueva para recibir pedidos continuo.`
                    : `Tu plan vence el ${new Date(userData.planExpirationDate).toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })}. Renueva con 1 clic.`)}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenPlanModal}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#FFFFFF',
            color: isExpired || (isLowContracts && contractsCount === 0) ? '#991B1B' : '#78350F',
            border: 'none',
            borderRadius: '14px',
            fontSize: '13.5px',
            fontWeight: '900',
            cursor: 'pointer',
            fontFamily: 'var(--display)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.1s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span>⚡ Renovación y Envío de Comprobante en 1 Clic</span>
          <span>›</span>
        </button>
      </div>
    </>
  );
}
