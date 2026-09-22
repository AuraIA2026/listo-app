import React from 'react';

export default function PlanSelectionModal({ isOpen, onClose, onSelectPlan }) {
  if (!isOpen) return null;

  const plans = [
    {
      num: 1,
      id: 'standard',
      badge: 'BÁSICO',
      name: 'Plan Estándar',
      stars: '⭐ 0-3.9',
      contracts: '3 contratos',
      price: 'RD$500',
      bg: 'linear-gradient(135deg, #10B981, #059669)',
      badgeBg: '#047857',
      icon: '🔹',
      color: '#10B981'
    },
    {
      num: 2,
      id: 'gold',
      badge: 'POPULAR',
      name: 'Plan Gold',
      stars: '⭐ 4.0-4.7',
      contracts: '8 contratos',
      price: 'RD$1,000',
      bg: 'linear-gradient(135deg, #F59E0B, #D97706)',
      badgeBg: '#B45309',
      icon: '🥇',
      color: '#F59E0B'
    },
    {
      num: 3,
      id: 'platinum',
      badge: 'ACTIVO',
      name: 'Plan Platinum',
      stars: '⭐ 4.5-4.7',
      contracts: '12 contratos',
      price: 'RD$1,500',
      bg: 'linear-gradient(135deg, #64748B, #475569)',
      badgeBg: '#334155',
      icon: '🥈',
      color: '#64748B'
    },
    {
      num: 4,
      id: 'vip',
      badge: 'ÉLITE',
      name: 'Plan VIP',
      stars: '⭐ 4.8-5.0',
      contracts: '∞ contratos',
      price: 'RD$2,500',
      bg: 'linear-gradient(135deg, #F26000, #EA580C)',
      badgeBg: '#C24E00',
      icon: '💎',
      color: '#F26000',
      isVip: true
    }
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }} onClick={onClose}>
      <div style={{
        background: '#FFFFFF', borderRadius: '24px', maxWidth: '850px', width: '100%',
        padding: '28px 24px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        maxHeight: '90vh', overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Botón Cerrar */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: '#F1F5F9', border: 'none', borderRadius: '50%',
          width: '32px', height: '32px', fontSize: '16px', fontWeight: 'bold',
          color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          ✕
        </button>

        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1E293B', margin: '0 0 6px', fontFamily: "system-ui, -apple-system, sans-serif" }}>
            Adquirir Plan Profesional
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: '500' }}>
            Selecciona el plan que se adapte a tus necesidades para habilitar tu cuenta Listo Patrón.
          </p>
        </div>

        {/* Rejilla de 4 Tarjetas de Planes */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px'
        }}>
          {plans.map(p => (
            <div key={p.num} style={{
              background: p.bg, borderRadius: '20px', padding: '18px 14px',
              color: '#FFFFFF', position: 'relative', display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center', boxShadow: p.isVip ? '0 10px 25px rgba(242,96,0,0.4), 0 0 0 2px #F26000' : '0 8px 20px rgba(0,0,0,0.12)',
              transform: 'scale(1)', transition: 'transform 0.2s'
            }}>
              {/* Número Circulo */}
              <div style={{
                position: 'absolute', top: '10px', left: '10px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.25)', fontSize: '11px',
                fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {p.num}
              </div>

              {/* Insignia Tag */}
              <div style={{
                position: 'absolute', top: '10px', right: '10px',
                background: 'rgba(0,0,0,0.35)', padding: '2px 8px', borderRadius: '100px',
                fontSize: '9px', fontWeight: '900', letterSpacing: '0.5px'
              }}>
                {p.badge}
              </div>

              {/* Icono */}
              <div style={{ fontSize: '32px', margin: '14px 0 6px' }}>
                {p.icon}
              </div>

              {/* Nombre y Estrellas */}
              <h3 style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 4px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                {p.name}
              </h3>
              <p style={{ fontSize: '10.5px', opacity: 0.95, margin: '0 0 12px', fontWeight: '600' }}>
                {p.stars} | {p.contracts}
              </p>

              {/* Caja de Precio */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)', padding: '6px 14px', borderRadius: '12px',
                fontSize: '14px', fontWeight: '900', margin: 'auto 0 14px', border: '1px solid rgba(255,255,255,0.2)'
              }}>
                {p.price}
              </div>

              {/* Botón de Acción */}
              <button onClick={() => onSelectPlan && onSelectPlan(p)} style={{
                width: '100%', background: '#FFFFFF', color: p.color,
                border: 'none', borderRadius: '12px', padding: '9px 12px',
                fontSize: '11px', fontWeight: '900', cursor: 'pointer',
                letterSpacing: '0.5px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                transition: 'transform 0.1s'
              }}>
                ELEGIR PLAN →
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
