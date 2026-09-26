import React, { useState } from 'react'

const ESTIMADOS_DATA = [
  {
    category: 'Sheetrock / Shirrok',
    icon: '🏗️',
    items: [
      { name: 'Instalación de Pared de Sheetrock (m²)', range: 'RD$ 700 - RD$ 1,200', note: 'Incluye masillado y lijado básico' },
      { name: 'Techo Falso en Sheetrock (m²)', range: 'RD$ 850 - RD$ 1,450', note: 'Varía según diseño y molduras' },
      { name: 'Reparación de Grietas / Huecos', range: 'RD$ 1,500 - RD$ 3,500', note: 'Trabajo puntual masillado' },
    ]
  },
  {
    category: 'Electricidad',
    icon: '⚡',
    items: [
      { name: 'Instalación de Tomacorriente / Switche', range: 'RD$ 400 - RD$ 800', note: 'Por punto eléctrico' },
      { name: 'Montaje de Lámpara o Abanico de Techo', range: 'RD$ 800 - RD$ 1,800', note: 'Según peso y altura' },
      { name: 'Revisión y Diagnóstico de Cortocircuito', range: 'RD$ 1,200 - RD$ 2,500', note: 'Inspección de caja breakers' },
      { name: 'Instalación de Breaker / Caja', range: 'RD$ 1,500 - RD$ 3,000', note: 'Mano de obra técnica' },
    ]
  },
  {
    category: 'Plomería',
    icon: '🚰',
    items: [
      { name: 'Reparación de Fuga de Agua o Gotera', range: 'RD$ 1,000 - RD$ 2,500', note: 'Localización y sellado' },
      { name: 'Destape de Inodoro o Fregadero', range: 'RD$ 1,200 - RD$ 2,800', note: 'Con guaya o máquina' },
      { name: 'Instalación de Inodoro / Lavamanos', range: 'RD$ 1,500 - RD$ 3,000', note: 'Montaje y fijación de grifería' },
      { name: 'Instalación de Bomba de Agua / Presurizador', range: 'RD$ 2,500 - RD$ 5,000', note: 'Conexión eléctrica e hidráulica' },
    ]
  },
  {
    category: 'Pintura',
    icon: '🎨',
    items: [
      { name: 'Pintura de Habitación Estándar (Paredes)', range: 'RD$ 2,500 - RD$ 5,000', note: 'Mano de obra (2 manos)' },
      { name: 'Pintura de Apartamento Completo (2-3 Habs)', range: 'RD$ 12,000 - RD$ 25,000', note: 'Varía según estado de paredes' },
      { name: 'Pintado de Rejas o Portón Metálico', range: 'RD$ 2,000 - RD$ 5,500', note: 'Lijado y anticorrosivo' },
    ]
  },
  {
    category: 'Refrigeración / Aire Acondicionado',
    icon: '❄️',
    items: [
      { name: 'Mantenimiento preventivo A/C Split (12k-24k BTU)', range: 'RD$ 1,200 - RD$ 2,000', note: 'Limpieza profunda con bomba' },
      { name: 'Instalación de A/C Inverter', range: 'RD$ 3,000 - RD$ 6,000', note: 'Incluye tubería básica' },
      { name: 'Carga de Gas Refrigerante (R410/R22)', range: 'RD$ 1,800 - RD$ 3,500', note: 'Revisión previa de fugas' },
    ]
  },
  {
    category: 'Cerrajería',
    icon: '🔑',
    items: [
      { name: 'Apertura de Puerta de Casa (Llave Dentro)', range: 'RD$ 1,000 - RD$ 2,500', note: 'Según tipo de cerradura' },
      { name: 'Cambio de Cerradura / Cilindro', range: 'RD$ 800 - RD$ 1,800', note: 'Mano de obra de instalación' },
      { name: 'Apertura de Vehículo (Puerta Trancada)', range: 'RD$ 1,500 - RD$ 3,000', note: 'Servicio de urgencia a domicilio' },
    ]
  },
  {
    category: 'Mecánica Rápida',
    icon: '🔧',
    items: [
      { name: 'Cambio de Aceite y Filtro (A domicilio)', range: 'RD$ 800 - RD$ 1,500', note: 'Mano de obra en tu ubicación' },
      { name: 'Diagnóstico por Escáner Computarizado', range: 'RD$ 1,000 - RD$ 2,000', note: 'Lectura de códigos de motor' },
      { name: 'Reemplazo de Pastillas de Freno (Par)', range: 'RD$ 1,200 - RD$ 2,500', note: 'Mano de obra cambio' },
    ]
  }
]

export default function EstimadorPreciosModal({ isOpen, onClose, lang = 'es', onSelectCategory }) {
  const [selectedCatIndex, setSelectedCatIndex] = useState(0)

  if (!isOpen) return null

  const currentCat = ESTIMADOS_DATA[selectedCatIndex]

  return (
    <div className="modal-overlay fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div className="modal-card slide-up-anim" style={{ background: '#fff', borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#1A1A2E' }}>
                {lang === 'es' ? 'Estimador de Precios (RD$)' : 'Price Estimator (RD$)'}
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B' }}>
                {lang === 'es' ? 'Valores promedio de mercado en República Dominicana' : 'Average market prices in the Dominican Republic'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* Categorías selector */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '16px', scrollbarWidth: 'none' }}>
          {ESTIMADOS_DATA.map((cat, idx) => (
            <button
              key={cat.category}
              onClick={() => setSelectedCatIndex(idx)}
              style={{
                padding: '8px 14px',
                borderRadius: '100px',
                border: selectedCatIndex === idx ? '2px solid #F26000' : '1px solid #E2E8F0',
                background: selectedCatIndex === idx ? '#FFF3EC' : '#FAFAFA',
                color: selectedCatIndex === idx ? '#F26000' : '#475569',
                fontWeight: selectedCatIndex === idx ? '800' : '600',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.category}</span>
            </button>
          ))}
        </div>

        {/* Lista de precios estimados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {currentCat.items.map((item, i) => (
            <div key={i} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ fontWeight: '700', fontSize: '13.5px', color: '#1E293B', flex: 1 }}>{item.name}</span>
                <span style={{ fontWeight: '900', fontSize: '13.5px', color: '#10B981', background: '#ECFDF5', padding: '3px 8px', borderRadius: '8px', border: '1px solid #A7F3D0', whiteSpace: 'nowrap' }}>
                  {item.range}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748B' }}>💡 {item.note}</span>
            </div>
          ))}
        </div>

        {/* Nota informativa */}
        <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '14px', padding: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '20px' }}>💡</span>
          <p style={{ margin: 0, fontSize: '11px', color: '#92400E', lineHeight: 1.4 }}>
            <strong>Recuerda:</strong> Los precios son de referencia. Acuerda siempre el costo exacto directamente con el profesional antes de iniciar el trabajo.
          </p>
        </div>

        <button 
          onClick={() => {
            if (onSelectCategory) onSelectCategory(currentCat.category)
            onClose()
          }}
          style={{ width: '100%', marginTop: '16px', padding: '14px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #F26000, #C24D00)', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(242,96,0,0.3)' }}
        >
          🔍 {lang === 'es' ? 'Buscar profesionales de este rubro' : 'Find professionals in this category'}
        </button>

      </div>
    </div>
  )
}
