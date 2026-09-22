import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const banks = [
  { id: 'banreservas', name: 'Banco de Reservas', short: 'Banreservas', account: '210-123456-7', type: 'Cuenta Corriente', color: '#003087' },
  { id: 'bhd', name: 'BHD León', short: 'BHD León', account: '27500012345', type: 'Cuenta de Ahorros', color: '#E31837' },
  { id: 'popular', name: 'Banco Popular', short: 'Popular', account: '810-123456-1', type: 'Cuenta Corriente', color: '#00843D' },
  { id: 'scotiabank', name: 'Scotiabank', short: 'Scotiabank', account: '00123456789', type: 'Cuenta de Ahorros', color: '#EC111A' },
  { id: 'bancaribe', name: 'Bancaribe', short: 'Bancaribe', account: '301-123456-0', type: 'Cuenta Corriente', color: '#005BAC' },
  { id: 'promerica', name: 'Banco Promerica', short: 'Promerica', account: '401-123456-2', type: 'Cuenta de Ahorros', color: '#F47920' },
  { id: 'asoc_popular', name: 'Asoc. Popular (APAP)', short: 'APAP', account: '501-123456-3', type: 'Cuenta de Ahorros', color: '#007A3D' },
  { id: 'vimenca', name: 'Vimenca', short: 'Vimenca', account: '601-123456-4', type: 'Cuenta Corriente', color: '#1A3A6B' },
];

export default function PlanSelectionModal({ isOpen, onClose, onSelectPlan, proInfo: propProInfo }) {
  if (!isOpen) return null;

  // Extraer información del profesional desde props o automáticamente de los parámetros de la URL
  const [proData, setProData] = useState({
    uid: '', name: '', email: '', phone: '', cedula: '', category: ''
  });

  useEffect(() => {
    let search = '';
    if (typeof window !== 'undefined') {
      search = window.location.search || '';
    }
    const params = new URLSearchParams(search);

    const uid = propProInfo?.uid || params.get('uid') || '';
    const name = propProInfo?.name || params.get('name') || '';
    const email = propProInfo?.email || params.get('email') || '';
    const phone = propProInfo?.phone || params.get('phone') || '';
    const cedula = propProInfo?.cedula || params.get('cedula') || '';
    const category = propProInfo?.category || params.get('category') || '';

    setProData({
      uid: decodeURIComponent(uid),
      name: decodeURIComponent(name),
      email: decodeURIComponent(email),
      phone: decodeURIComponent(phone),
      cedula: decodeURIComponent(cedula),
      category: decodeURIComponent(category)
    });
  }, [propProInfo, isOpen]);

  // Estado del flujo del modal: 'list' (seleccionar plan) -> 'checkout' (formulario de pago) -> 'success' (confirmación)
  const [step, setStep] = useState('list');
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Campos del formulario de checkout pre-llenados automáticamente
  const [proName, setProName] = useState('');
  const [proEmail, setProEmail] = useState('');
  const [proPhone, setProPhone] = useState('');
  const [proCedula, setProCedula] = useState('');
  const [selectedBank, setSelectedBank] = useState(banks[0]);
  const [depositorName, setDepositorName] = useState('');
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (proData.name) setProName(proData.name);
    if (proData.email) setProEmail(proData.email);
    if (proData.phone) setProPhone(proData.phone);
    if (proData.cedula) setProCedula(proData.cedula);
    if (proData.name) setDepositorName(proData.name);
  }, [proData]);

  const plans = [
    {
      num: 1,
      id: 'standard',
      badge: 'BÁSICO',
      name: 'Plan Estándar',
      stars: '⭐ 0-3.9',
      contracts: '3 contratos',
      numContracts: 3,
      price: 'RD$500',
      priceNum: 500,
      bg: 'linear-gradient(135deg, #10B981, #059669)',
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
      numContracts: 8,
      price: 'RD$1,000',
      priceNum: 1000,
      bg: 'linear-gradient(135deg, #F59E0B, #D97706)',
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
      numContracts: 12,
      price: 'RD$1,500',
      priceNum: 1500,
      bg: 'linear-gradient(135deg, #64748B, #475569)',
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
      numContracts: 999,
      price: 'RD$2,500',
      priceNum: 2500,
      bg: 'linear-gradient(135deg, #F26000, #EA580C)',
      icon: '💎',
      color: '#F26000',
      isVip: true
    }
  ];

  const handleChoosePlan = (p) => {
    setSelectedPlan(p);
    setStep('checkout');
    if (onSelectPlan) onSelectPlan(p);
  };

  const handleConfirmPayment = async () => {
    if (!proName.trim() || !proEmail.trim()) {
      alert('⚠️ Por favor completa tu nombre y correo electrónico.');
      return;
    }

    setSubmitting(true);
    try {
      // Guardar la solicitud de pago directamente en Firestore
      await addDoc(collection(db, 'payments'), {
        proId: proData.uid || '',
        proName: proName.trim(),
        email: proEmail.trim(),
        phone: proPhone.trim(),
        cedula: proCedula.trim(),
        proCategory: proData.category || '',
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        planContracts: selectedPlan.numContracts,
        planPriceVal: selectedPlan.priceNum,
        transferAmount: selectedPlan.priceNum,
        status: 'pending',
        bank: selectedBank?.name || 'Banreservas',
        depositorName: depositorName || proName,
        createdAt: serverTimestamp()
      });

      // Crear notificación para el administrador
      await addDoc(collection(db, 'notificaciones'), {
        userId: 'admin',
        type: 'system',
        title: '💳 NUEVA COMPRA DE PLAN EN LA WEB',
        text: `El profesional ${proName} (${proEmail}) solicitó la compra del ${selectedPlan.name} (${selectedPlan.price}) vía web.`,
        read: false,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });

      setStep('success');
    } catch (err) {
      console.error('Error procesando pago:', err);
      alert('Ocurrió un error al enviar el comprobante. Por favor inténtalo nuevamente.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999999,
      background: 'rgba(0, 0, 0, 0.78)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }} onClick={onClose}>
      <div style={{
        background: '#FFFFFF', borderRadius: '24px', maxWidth: '850px', width: '100%',
        padding: '28px 24px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        maxHeight: '92vh', overflowY: 'auto', border: '1px solid rgba(0,0,0,0.1)'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Botón Cerrar */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: '#F1F5F9', border: 'none', borderRadius: '50%',
          width: '34px', height: '34px', fontSize: '16px', fontWeight: 'bold',
          color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          ✕
        </button>

        {/* --- PASO 1: SELECCIÓN DE PLAN --- */}
        {step === 'list' && (
          <>
            {/* Tarjeta Banner de Profesional Detectado */}
            {(proData.name || proData.email) && (
              <div style={{
                background: 'linear-gradient(135deg, #FFF3EC 0%, #FFE4D6 100%)',
                border: '1.5px solid #F26000', borderRadius: '18px',
                padding: '16px 20px', marginBottom: '20px', textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F26000', fontWeight: '800', fontSize: '15px' }}>
                  <span>👤 Profesional Registrado:</span>
                  <span style={{ color: '#1E293B', fontWeight: '900' }}>{proData.name}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '6px', display: 'flex', gap: '14px', flexWrap: 'wrap', fontWeight: '600' }}>
                  {proData.email && <span>📧 {proData.email}</span>}
                  {proData.phone && <span>📞 {proData.phone}</span>}
                  {proData.cedula && <span>🪪 Cédula: {proData.cedula}</span>}
                </div>
                <p style={{ fontSize: '11.5px', color: '#059669', margin: '8px 0 0 0', fontWeight: '700' }}>
                  ✅ Tus datos de Listo Patrón han sido cargados automáticamente. Selecciona tu plan para completar la actualización:
                </p>
              </div>
            )}

            {/* Encabezado */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1E293B', margin: '0 0 6px', fontFamily: "system-ui, -apple-system, sans-serif" }}>
                Adquirir Plan Profesional
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: '500' }}>
                Selecciona el plan que se adapte a tus necesidades para habilitar tu cuenta en la app Listo Patrón.
              </p>
            </div>

            {/* Rejilla de 4 Tarjetas de Planes */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px'
            }}>
              {plans.map(p => (
                <div key={p.num} style={{
                  background: p.bg, borderRadius: '20px', padding: '20px 14px',
                  color: '#FFFFFF', position: 'relative', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center', boxShadow: p.isVip ? '0 10px 25px rgba(242,96,0,0.4), 0 0 0 2px #F26000' : '0 8px 20px rgba(0,0,0,0.12)',
                  transition: 'transform 0.2s'
                }}>
                  <div style={{
                    position: 'absolute', top: '10px', left: '10px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.25)', fontSize: '11px',
                    fontWeight: '900', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {p.num}
                  </div>

                  <div style={{
                    position: 'absolute', top: '10px', right: '10px',
                    background: 'rgba(0,0,0,0.35)', padding: '2px 8px', borderRadius: '100px',
                    fontSize: '9px', fontWeight: '900', letterSpacing: '0.5px'
                  }}>
                    {p.badge}
                  </div>

                  <div style={{ fontSize: '32px', margin: '14px 0 6px' }}>
                    {p.icon}
                  </div>

                  <h3 style={{ fontSize: '14px', fontWeight: '900', margin: '0 0 4px', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                    {p.name}
                  </h3>
                  <p style={{ fontSize: '10.5px', opacity: 0.95, margin: '0 0 12px', fontWeight: '600' }}>
                    {p.stars} | {p.contracts}
                  </p>

                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)', padding: '6px 14px', borderRadius: '12px',
                    fontSize: '14px', fontWeight: '900', margin: 'auto 0 14px', border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    {p.price}
                  </div>

                  <button onClick={() => handleChoosePlan(p)} style={{
                    width: '100%', background: '#FFFFFF', color: p.color,
                    border: 'none', borderRadius: '12px', padding: '10px 12px',
                    fontSize: '11.5px', fontWeight: '900', cursor: 'pointer',
                    letterSpacing: '0.5px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    transition: 'transform 0.1s'
                  }}>
                    ELEGIR PLAN →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- PASO 2: FORMULARIO DE CHECKOUT Y TRANSFERENCIA --- */}
        {step === 'checkout' && selectedPlan && (
          <div style={{ textAlign: 'left' }}>
            <button onClick={() => setStep('list')} style={{
              background: '#F1F5F9', border: 'none', borderRadius: '8px',
              padding: '6px 12px', fontSize: '13px', fontWeight: '700',
              color: '#475569', cursor: 'pointer', marginBottom: '16px'
            }}>
              ← Volver a Planes
            </button>

            <div style={{ background: selectedPlan.bg, color: '#fff', padding: '16px 20px', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>{selectedPlan.icon} {selectedPlan.name}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>Incluye {selectedPlan.contracts} activados en tu cuenta Listo Patrón</p>
              </div>
              <div style={{ fontSize: '20px', fontWeight: '900', background: 'rgba(0,0,0,0.3)', padding: '6px 14px', borderRadius: '12px' }}>
                {selectedPlan.price}
              </div>
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', marginBottom: '12px' }}>1. Confirmar Datos del Profesional</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Nombre Completo</label>
                <input 
                  type="text" 
                  value={proName} 
                  onChange={e => setProName(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} 
                  placeholder="Tu Nombre"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Correo Electrónico</label>
                <input 
                  type="email" 
                  value={proEmail} 
                  onChange={e => setProEmail(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} 
                  placeholder="tu@correo.com"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Teléfono</label>
                <input 
                  type="tel" 
                  value={proPhone} 
                  onChange={e => setProPhone(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} 
                  placeholder="809-000-0000"
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '4px' }}>Nº Cédula</label>
                <input 
                  type="text" 
                  value={proCedula} 
                  onChange={e => setProCedula(e.target.value)} 
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }} 
                  placeholder="000-0000000-0"
                />
              </div>
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', marginBottom: '12px' }}>2. Cuentas Bancarias para Transferencia</h4>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px', marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '6px' }}>Selecciona tu banco de destino:</label>
              <select 
                value={selectedBank.id} 
                onChange={e => setSelectedBank(banks.find(b => b.id === e.target.value) || banks[0])}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', background: '#fff', marginBottom: '12px' }}
              >
                {banks.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.type})</option>
                ))}
              </select>

              <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: selectedBank.color }}>{selectedBank.name}</div>
                <div style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: '700', color: '#0F172A', marginTop: '4px' }}>
                  Cuenta: {selectedBank.account} ({selectedBank.type})
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>A nombre de: Listo Patrón SRL</div>
              </div>
            </div>

            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', marginBottom: '12px' }}>3. Adjuntar Comprobante</h4>
            <div style={{ marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="Nombre de quien realizó el depósito/transferencia" 
                value={depositorName} 
                onChange={e => setDepositorName(e.target.value)} 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box', marginBottom: '10px' }}
              />

              <div 
                onClick={() => setReceiptUploaded(true)}
                style={{
                  border: '2px dashed #CBD5E1', borderRadius: '12px', padding: '16px', textAlign: 'center',
                  background: receiptUploaded ? '#F0FDF4' : '#F8FAFC', borderColor: receiptUploaded ? '#22C55E' : '#CBD5E1',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {receiptUploaded ? (
                  <div style={{ color: '#166534', fontWeight: '800', fontSize: '13.5px' }}>
                    ✅ Comprobante adjuntado correctamente
                  </div>
                ) : (
                  <div style={{ color: '#64748B', fontSize: '13px', fontWeight: '600' }}>
                    📸 Toca para marcar comprobante listo
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleConfirmPayment}
              disabled={submitting}
              style={{
                width: '100%', padding: '16px', background: 'linear-gradient(135deg, #F26000, #C24E00)',
                color: '#FFFFFF', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '900',
                cursor: 'pointer', boxShadow: '0 8px 20px rgba(242,96,0,0.3)', opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? '⏳ Guardando comprobante...' : '🚀 CONFIRMAR Y ENVIAR COMPROBANTE DE PAGO'}
            </button>
          </div>
        )}

        {/* --- PASO 3: CONFIRMACIÓN DE ÉXITO --- */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1E293B', margin: '0 0 8px' }}>
              ¡Actualización y Pago Recibidos!
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
              Hola <strong>{proName}</strong>, tu solicitud de compra del <strong>{selectedPlan?.name}</strong> fue recibida correctamente.
              <br /><br />
              El equipo de administración de <strong>Listo Patrón</strong> validará la transferencia y activará tus contratos directamente en tu cuenta de la App.
            </p>
            <button onClick={onClose} style={{
              width: '100%', maxWidth: '300px', padding: '14px', background: '#10B981', color: '#FFF',
              border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '900', cursor: 'pointer'
            }}>
              Entendido 👍
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
