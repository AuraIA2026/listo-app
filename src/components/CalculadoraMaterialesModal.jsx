import { useState } from 'react'
import './CalculadoraMaterialesModal.css'

const CALCULATOR_PRESETS = [
  {
    id: 'pintura',
    titleEs: '🎨 Pintura de Habitaciones / Paredes',
    titleEn: '🎨 Room / Wall Painting',
    category: 'pintor',
    unitLabelEs: 'Área aproximada en m²',
    unitLabelEn: 'Approximate area in m²',
    defaultQty: 25,
    calcFn: (qty) => {
      const gallons = Math.ceil(qty / 20) // ~20m² per gallon
      const tape = Math.max(1, Math.ceil(qty / 40))
      const rollers = Math.max(1, Math.ceil(qty / 50))
      const matCost = (gallons * 1200) + (tape * 150) + (rollers * 350)
      const laborCost = Math.round(qty * 180) // RD$ 180 / m²
      return {
        materials: [
          `🎨 ${gallons} Galón(es) de Pintura Acrílica (RD$ ${gallons * 1200})`,
          `📜 ${tape} Rollo(s) de Cinta de Enmascarar / Tape (RD$ ${tape * 150})`,
          `🖌️ ${rollers} Rodillo(s) & Felpa de Pintar (RD$ ${rollers * 350})`,
          `🧱 Sellador / Pasta para Grietas (RD$ 300)`,
        ],
        matCost,
        laborCost,
        totalCost: matCost + laborCost,
      }
    }
  },
  {
    id: 'ac_inverter',
    titleEs: '❄️ Instalación de Aire Inverter',
    titleEn: '❄️ Inverter A/C Installation',
    category: 'refrigeracion',
    unitLabelEs: 'Cantidad de Aires a instalar',
    unitLabelEn: 'Number of A/C units',
    defaultQty: 1,
    calcFn: (qty) => {
      const copperFeet = qty * 12
      const breaker = qty
      const matCost = (qty * 2500) + (copperFeet * 350) + (breaker * 800)
      const laborCost = qty * 3500
      return {
        materials: [
          `🔩 Kit de Soporte & Anclaje de Pared (RD$ ${qty * 2500})`,
          `🪈 ${copperFeet} Pies de Tubería de Cobre Aislada (RD$ ${copperFeet * 350})`,
          `⚡ ${breaker} Breaker Térmico de Protección (RD$ ${breaker * 800})`,
          `🔌 Cableado Eléctrico Cobre 10/12 AWG (RD$ 1200)`,
        ],
        matCost,
        laborCost,
        totalCost: matCost + laborCost,
      }
    }
  },
  {
    id: 'inodoro_plomeria',
    titleEs: '🚰 Cambio de Inodoro o Lavamanos',
    titleEn: '🚰 Toilet or Sink Replacement',
    category: 'plomero',
    unitLabelEs: 'Cantidad de piezas a reemplazar',
    unitLabelEn: 'Number of fixtures',
    defaultQty: 1,
    calcFn: (qty) => {
      const waxRing = qty
      const hoses = qty * 2
      const matCost = (qty * 350) + (hoses * 250) + (qty * 400)
      const laborCost = qty * 2200
      return {
        materials: [
          `⭕ ${waxRing} Cuello de Cera con Guía para Inodoro (RD$ ${waxRing * 350})`,
          `🚰 ${hoses} Mangueras Flexibles de Cera / Conexión (RD$ ${hoses * 250})`,
          `🧱 Silicona Antihongos Baños / Cemento Blanco (RD$ ${qty * 400})`,
        ],
        matCost,
        laborCost,
        totalCost: matCost + laborCost,
      }
    }
  },
  {
    id: 'electricidad_inversor',
    titleEs: '⚡ Instalación de Inversor / Baterías',
    titleEn: '⚡ Inverter & Battery Setup',
    category: 'electricista',
    unitLabelEs: 'Capacidad del Inversor (KiloWatts / KVA)',
    unitLabelEn: 'Inverter capacity (KVA)',
    defaultQty: 2,
    calcFn: (qty) => {
      const cables = Math.ceil(qty * 4)
      const matCost = (cables * 450) + (qty * 1500)
      const laborCost = Math.round(qty * 2500)
      return {
        materials: [
          `🔌 ${cables} Pies de Cable Calibre 2 AWG para Baterías (RD$ ${cables * 450})`,
          `⚡ Breaker de Corte y Transferencia Manual (RD$ ${qty * 1500})`,
          `🔩 Terminales de Cobre y Aisladores (RD$ 600)`,
        ],
        matCost,
        laborCost,
        totalCost: matCost + laborCost,
      }
    }
  }
]

export default function CalculadoraMaterialesModal({ lang = 'es', onClose, navigate }) {
  const isEs = lang === 'es'
  const [selectedPreset, setSelectedPreset] = useState(CALCULATOR_PRESETS[0])
  const [quantity, setQuantity] = useState(CALCULATOR_PRESETS[0].defaultQty)

  const calcResult = selectedPreset.calcFn(Number(quantity) || 1)

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset)
    setQuantity(preset.defaultQty)
  }

  const handleCopyMaterials = () => {
    const text = `📋 LISTA ESTIMADA DE MATERIALES - LISTO PATRÓN:\nTrabajo: ${selectedPreset.titleEs}\n\nMateriales:\n${calcResult.materials.join('\n')}\n\nCosto Estimado Materiales: RD$ ${calcResult.matCost.toLocaleString()}\nMano de Obra Estimada: RD$ ${calcResult.laborCost.toLocaleString()}\nTOTAL ESTIMADO: RD$ ${calcResult.totalCost.toLocaleString()}`
    navigator.clipboard.writeText(text)
    alert(isEs ? '📋 ¡Lista de materiales copiada al portapapeles!' : '📋 Materials list copied!')
  }

  const handleFlashQuote = () => {
    onClose()
    if (navigate) {
      navigate('search', { state: { category: selectedPreset.category } })
    }
  }

  return (
    <div className="calc-overlay" onClick={onClose}>
      <div className="calc-modal-content" onClick={e => e.stopPropagation()}>
        <button className="calc-close-btn" onClick={onClose}>✕</button>

        {/* Encabezado */}
        <div className="calc-header">
          <div className="calc-badge-icon">🧰</div>
          <div>
            <h3 className="calc-title">
              {isEs ? 'Calculadora de Materiales y Presupuestos RD$' : 'RD$ Materials & Budget Calculator'}
            </h3>
            <p className="calc-subtitle">
              {isEs 
                ? 'Estima los materiales necesarios y costo de mano de obra en República Dominicana' 
                : 'Estimate required materials and labor costs in Dominican Republic'}
            </p>
          </div>
        </div>

        {/* Seleccionar Trabajo */}
        <p className="calc-label">🏷️ {isEs ? 'Selecciona el Tipo de Trabajo:' : 'Select Job Type:'}</p>
        <div className="calc-presets-scroll">
          {CALCULATOR_PRESETS.map(p => (
            <button
              key={p.id}
              className={`calc-preset-btn ${selectedPreset.id === p.id ? 'active' : ''}`}
              onClick={() => handleSelectPreset(p)}
            >
              {isEs ? p.titleEs : p.titleEn}
            </button>
          ))}
        </div>

        {/* Slider / Input de Cantidad */}
        <div className="calc-input-box">
          <div className="calc-input-header">
            <span className="calc-input-label">{isEs ? selectedPreset.unitLabelEs : selectedPreset.unitLabelEn}</span>
            <span className="calc-input-val">{quantity}</span>
          </div>
          <input 
            type="range"
            min="1"
            max="100"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="calc-range-slider"
          />
        </div>

        {/* Desglose de Materiales y Costos */}
        <div className="calc-results-box">
          <h4 className="calc-results-title">📦 {isEs ? 'Materiales Estimados Necesarios:' : 'Estimated Materials:'}</h4>
          <ul className="calc-mat-list">
            {calcResult.materials.map((mat, i) => (
              <li key={i}>{mat}</li>
            ))}
          </ul>

          <div className="calc-cost-breakdown">
            <div className="calc-cost-row">
              <span>🛒 {isEs ? 'Materiales Estimados:' : 'Est. Materials:'}</span>
              <strong>RD$ {calcResult.matCost.toLocaleString()}</strong>
            </div>
            <div className="calc-cost-row">
              <span>👷 {isEs ? 'Mano de Obra Estimada Listo Patrón:' : 'Est. Listo Patrón Labor:'}</span>
              <strong style={{ color: '#F26000' }}>RD$ {calcResult.laborCost.toLocaleString()}</strong>
            </div>
            <div className="calc-cost-row total">
              <span>💰 {isEs ? 'PRESUPUESTO TOTAL APROX.:' : 'APPROX TOTAL BUDGET:'}</span>
              <span className="calc-total-badge">RD$ {calcResult.totalCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="calc-actions-row">
          <button className="calc-btn copy" onClick={handleCopyMaterials}>
            📋 {isEs ? 'Copiar Lista' : 'Copy List'}
          </button>
          <button className="calc-btn flash" onClick={handleFlashQuote}>
            ⚡ {isEs ? 'Solicitar Profesional con estos Datos' : 'Request Pro with this Data'}
          </button>
        </div>

      </div>
    </div>
  )
}
