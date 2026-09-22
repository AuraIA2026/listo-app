import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const CUENTAS_LISTO = [
  { banco: 'Banco Popular', tipo: 'Ahorros', cuenta: '746424456', titular: 'Julio de Jesús' },
  { banco: 'Banreservas', tipo: 'Ahorros', cuenta: '9607282472', titular: 'Julio de Jesús' },
];

const BANCOS_ORIGEN = [
  'Banreservas',
  'Banco Popular',
  'BHD León',
  'Scotiabank',
  'Bancaribe',
  'Banco Promerica',
  'Asociación Popular (APAP)',
  'Vimenca',
  'Otro / Efectivo'
];

export default function PlanSelectionModal({ isOpen, onClose, onSelectPlan, proInfo: propProInfo }) {
  if (!isOpen) return null;

  // 1. Extraer parámetros del profesional desde props o automáticamente desde la URL
  const [proData, setProData] = useState({
    uid: '', name: '', email: '', phone: '', cedula: '', category: ''
  });

  // Estado del plan seleccionado y pestaña (transfer / card)
  const [selectedPlan, setSelectedPlan] = useState({
    id: 'gold',
    name: 'Plan Gold',
    price: 'RD$1,000 / mes',
    numContracts: 8,
    priceNum: 1000,
    color: '#F26000'
  });
  const [step, setStep] = useState('list'); // 'list' | 'checkout' | 'success'
  const [activeTab, setActiveTab] = useState('transfer'); // 'card' | 'transfer'

  // Formulario pre-llenado automáticamente
  const [proName, setProName] = useState('');
  const [proCategory, setProCategory] = useState('');
  const [proEmail, setProEmail] = useState('');
  const [proPhone, setProPhone] = useState('');
  const [originBank, setOriginBank] = useState('');
  const [depositorName, setDepositorName] = useState('');
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Carga inicial y escucha de datos
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
    const category = propProInfo?.category || params.get('category') || params.get('especialidad') || '';

    const initialData = {
      uid: decodeURIComponent(uid),
      name: decodeURIComponent(name),
      email: decodeURIComponent(email),
      phone: decodeURIComponent(phone),
      cedula: decodeURIComponent(cedula),
      category: decodeURIComponent(category)
    };

    setProData(initialData);

    // Llenar campos inmediatos si están disponibles en la URL
    if (initialData.name) {
      setProName(initialData.name);
      setDepositorName(initialData.name);
    }
    if (initialData.category) setProCategory(initialData.category);
    if (initialData.email) setProEmail(initialData.email);
    if (initialData.phone) setProPhone(initialData.phone);

    // Si viene uid, buscar en Firestore para garantizar 100% de datos actualizados automáticamente
    if (initialData.uid) {
      getDoc(doc(db, 'users', initialData.uid)).then(docSnap => {
        if (docSnap.exists()) {
          const u = docSnap.data();
          const vf = u.verificacion || {};
          const fullN = u.name || vf.nombre || initialData.name;
          const fullCat = u.category || vf.especialidad || u.especialidad || initialData.category;
          const fullMail = u.email || vf.correo || initialData.email;
          const fullPh = u.phone || vf.telefono || initialData.phone;

          if (fullN) { setProName(fullN); setDepositorName(fullN); }
          if (fullCat) setProCategory(fullCat);
          if (fullMail) setProEmail(fullMail);
          if (fullPh) setProPhone(fullPh);
        }
      }).catch(err => console.log('Fetch pro data error:', err));
    }

    // Si venimos con comprar-plan desde la app, ir directamente al checkout
    if (search.includes('comprar-plan') || params.has('uid')) {
      setStep('checkout');
    }
  }, [propProInfo, isOpen]);

  const plans = [
    {
      num: 1,
      id: 'standard',
      badge: 'BÁSICO',
      name: 'Plan Estándar',
      stars: '⭐ 0-3.9',
      contracts: '3 contratos',
      numContracts: 3,
      price: 'RD$500 / mes',
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
      price: 'RD$1,000 / mes',
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
      price: 'RD$1,500 / mes',
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
      price: 'RD$2,500 / mes',
      priceNum: 2500,
      bg: 'linear-gradient(135deg, #F26000, #EA580C)',
      icon: '💎',
      color: '#F26000',
      isVip: true
    }
  ];

  const copyCuenta = (num, idx) => {
    navigator.clipboard.writeText(num);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  const handleChoosePlan = (p) => {
    setSelectedPlan(p);
    setStep('checkout');
    if (onSelectPlan) onSelectPlan(p);
  };

  const handleConfirmPayment = async () => {
    if (!proName.trim()) {
      alert('⚠️ Por favor ingresa el nombre de tu cuenta.');
      return;
    }

    setSubmitting(true);
    try {
      // Guardar pago en Firestore
      await addDoc(collection(db, 'payments'), {
        proId: proData.uid || '',
        proName: proName.trim(),
        email: proEmail.trim(),
        phone: proPhone.trim(),
        cedula: proData.cedula || '',
        proCategory: proCategory.trim(),
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        planContracts: selectedPlan.numContracts,
        planPriceVal: selectedPlan.priceNum,
        transferAmount: selectedPlan.priceNum,
        status: 'pending',
        paymentMethod: activeTab,
        bank: originBank || 'Banreservas',
        depositorName: depositorName || proName,
        createdAt: serverTimestamp()
      });

      // Crear alerta en Firestore para el Administrador
      await addDoc(collection(db, 'notificaciones'), {
        userId: 'admin',
        type: 'system',
        title: '💳 NUEVO PAGO DE PLAN REGISTRADO',
        text: `El profesional ${proName} (${proCategory}) solicitó la activación del ${selectedPlan.name} (${selectedPlan.price}).`,
        read: false,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });

      setStep('success');
    } catch (err) {
      console.error('Error procesando pago:', err);
      alert('Ocurrió un error al procesar el pago. Por favor inténtalo nuevamente.');
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
        background: '#FFFFFF', borderRadius: '28px', maxWidth: '540px', width: '100%',
        padding: '24px 20px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        maxHeight: '92vh', overflowY: 'auto', border: '1px solid rgba(0,0,0,0.08)'
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
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', background: '#F26000',
                color: '#fff', fontSize: '20px', fontWeight: '900', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                boxShadow: '0 4px 14px rgba(242,96,0,0.4)'
              }}>
                Listo
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1E293B', margin: '0 0 6px', fontFamily: "system-ui, -apple-system, sans-serif" }}>
                Adquirir Plan Profesional
              </h2>
              <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0, fontWeight: '500' }}>
                Selecciona el plan que se adapte a tus necesidades para habilitar tu cuenta Listo Patrón.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
              {plans.map(p => (
                <div key={p.num} style={{
                  background: p.bg, borderRadius: '20px', padding: '20px 14px',
                  color: '#FFFFFF', position: 'relative', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center', boxShadow: p.isVip ? '0 10px 25px rgba(242,96,0,0.4), 0 0 0 2px #F26000' : '0 8px 20px rgba(0,0,0,0.12)'
                }}>
                  <div style={{ fontSize: '32px', margin: '6px 0' }}>{p.icon}</div>
                  <h3 style={{ fontSize: '15px', fontWeight: '900', margin: '0 0 4px' }}>{p.name}</h3>
                  <p style={{ fontSize: '11px', opacity: 0.95, margin: '0 0 12px', fontWeight: '600' }}>{p.stars} | {p.contracts}</p>
                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '6px 14px', borderRadius: '12px', fontSize: '14px', fontWeight: '900', margin: 'auto 0 14px' }}>
                    {p.price}
                  </div>
                  <button onClick={() => handleChoosePlan(p)} style={{
                    width: '100%', background: '#FFFFFF', color: p.color, border: 'none',
                    borderRadius: '12px', padding: '10px 12px', fontSize: '12px', fontWeight: '900', cursor: 'pointer'
                  }}>
                    ELEGIR PLAN →
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* --- PASO 2: CHECKOUT CON LOS CAMPOS AUTO-LLENADOS EXACTOS DE LA CAPTURA --- */}
        {step === 'checkout' && selectedPlan && (
          <div>
            {/* Header del Modal con el Logo Listo */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%', background: '#F26000',
                color: '#fff', fontSize: '16px', fontWeight: '900', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
                boxShadow: '0 4px 12px rgba(242,96,0,0.35)'
              }}>
                Listo
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1E293B', margin: '0 0 2px' }}>
                Pagar {selectedPlan.name}
              </h3>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#F26000' }}>
                {selectedPlan.price}
              </div>
            </div>

            {/* Pestañas: Tarjeta de Crédito | Transferencia Bancaria */}
            <div style={{
              display: 'flex', borderBottom: '2px solid #E2E8F0', marginBottom: '20px', gap: '8px'
            }}>
              <button
                onClick={() => setActiveTab('card')}
                style={{
                  flex: 1, padding: '12px 6px', background: 'none', border: 'none',
                  borderBottom: activeTab === 'card' ? '3px solid #F26000' : '3px solid transparent',
                  color: activeTab === 'card' ? '#F26000' : '#64748B',
                  fontWeight: activeTab === 'card' ? '800' : '600', fontSize: '13.5px',
                  cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.2s'
                }}
              >
                💳 Tarjeta de Crédito
              </button>
              <button
                onClick={() => setActiveTab('transfer')}
                style={{
                  flex: 1, padding: '12px 6px', background: 'none', border: 'none',
                  borderBottom: activeTab === 'transfer' ? '3px solid #F26000' : '3px solid transparent',
                  color: activeTab === 'transfer' ? '#F26000' : '#64748B',
                  fontWeight: activeTab === 'transfer' ? '800' : '600', fontSize: '13.5px',
                  cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.2s'
                }}
              >
                🏦 Transferencia Bancaria
              </button>
            </div>

            {/* CAMPOS EXACTOS AUTO-LLENADOS DE LA CAPTURA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                  Nombre en Listo
                </label>
                <input 
                  type="text" 
                  value={proName} 
                  onChange={e => setProName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '14px',
                    border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontSize: '13.5px',
                    fontWeight: '600', color: '#1E293B', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                  Profesión / Oficio
                </label>
                <input 
                  type="text" 
                  value={proCategory} 
                  onChange={e => setProCategory(e.target.value)}
                  placeholder="Ej. Pintor, Mecánico..."
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '14px',
                    border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontSize: '13.5px',
                    fontWeight: '600', color: '#1E293B', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px', textAlign: 'left' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                  Correo de tu Cuenta
                </label>
                <input 
                  type="email" 
                  value={proEmail} 
                  onChange={e => setProEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '14px',
                    border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontSize: '13.5px',
                    fontWeight: '600', color: '#1E293B', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                  Teléfono / WhatsApp
                </label>
                <input 
                  type="tel" 
                  value={proPhone} 
                  onChange={e => setProPhone(e.target.value)}
                  placeholder="809-909-0455"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '14px',
                    border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontSize: '13.5px',
                    fontWeight: '600', color: '#1E293B', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Banco de Origen Dropdown */}
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                Banco de Origen
              </label>
              <select 
                value={originBank}
                onChange={e => setOriginBank(e.target.value)}
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '14px',
                  border: '1.5px solid #E2E8F0', background: '#FFFFFF', fontSize: '13.5px',
                  fontWeight: '600', color: '#1E293B', outline: 'none', boxSizing: 'border-box'
                }}
              >
                <option value="" disabled>Selecciona tu banco...</option>
                {BANCOS_ORIGEN.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Caja de Cuentas de Listo Patrón */}
            <div style={{
              background: '#FFF8F3', border: '1px solid #FFE4D6', borderRadius: '16px',
              padding: '14px 16px', marginBottom: '16px', textAlign: 'left'
            }}>
              <div style={{ fontSize: '13px', fontWeight: '800', color: '#C24E00', marginBottom: '8px' }}>
                Cuentas de Listo Patrón:
              </div>
              {CUENTAS_LISTO.map((c, idx) => (
                <div key={c.banco} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: idx < CUENTAS_LISTO.length - 1 ? '8px' : 0, fontSize: '12px'
                }}>
                  <div style={{ color: '#1E293B' }}>
                    <strong style={{ color: idx === 0 ? '#00843D' : '#003087' }}>{c.banco}:</strong> {c.tipo} {c.cuenta} ({c.titular})
                  </div>
                  <button 
                    onClick={() => copyCuenta(c.cuenta, idx)}
                    style={{
                      background: '#E2E8F0', border: 'none', borderRadius: '8px',
                      padding: '4px 10px', fontSize: '11px', fontWeight: '700',
                      color: '#475569', cursor: 'pointer', marginLeft: '8px', flexShrink: 0
                    }}
                  >
                    {copiedIdx === idx ? '✓ Copiado' : 'Copiar'}
                  </button>
                </div>
              ))}
            </div>

            {/* Nombre del Depositante */}
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#1E293B', display: 'block', marginBottom: '6px' }}>
                Nombre del Depositante
              </label>
              <input 
                type="text" 
                value={depositorName} 
                onChange={e => setDepositorName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '14px',
                  border: '1.5px solid #E2E8F0', background: '#F8FAFC', fontSize: '13.5px',
                  fontWeight: '600', color: '#1E293B', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Botón de Adjuntar o Confirmar Pago */}
            <button 
              onClick={handleConfirmPayment}
              disabled={submitting}
              style={{
                width: '100%', padding: '16px', background: 'linear-gradient(135deg, #F26000, #C24E00)',
                color: '#FFFFFF', border: 'none', borderRadius: '16px', fontSize: '15.5px', fontWeight: '900',
                cursor: 'pointer', boxShadow: '0 8px 20px rgba(242,96,0,0.3)', opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? '⏳ Procesando pago...' : `🚀 CONFIRMAR Y ACTIVAR ${selectedPlan.name.toUpperCase()}`}
            </button>
          </div>
        )}

        {/* --- PASO 3: CONFIRMACIÓN DE ÉXITO --- */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <div style={{ fontSize: '60px', marginBottom: '14px' }}>🎉</div>
            <h3 style={{ fontSize: '22px', fontWeight: '900', color: '#1E293B', margin: '0 0 8px' }}>
              ¡Notificación de Pago Recibida!
            </h3>
            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, marginBottom: '24px' }}>
              Hola <strong>{proName}</strong>, hemos recibido tu solicitud de activación del <strong>{selectedPlan?.name}</strong>.
              <br /><br />
              El equipo administrador de <strong>Listo Patrón</strong> validará el depósito y habilitará tus contratos en tu cuenta.
            </p>
            <button onClick={onClose} style={{
              width: '100%', maxWidth: '280px', padding: '14px', background: '#10B981', color: '#FFF',
              border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '900', cursor: 'pointer'
            }}>
              Entendido 👍
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
