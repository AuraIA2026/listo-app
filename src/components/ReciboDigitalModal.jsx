import { useRef } from 'react'
import logoListo from '../assets/logo_listo.png'
import './ReciboDigitalModal.css'

export default function ReciboDigitalModal({ lang = 'es', onClose, orderData }) {
  const receiptRef = useRef(null)

  const invoiceNo = `LP-${orderData?.id ? orderData.id.substring(0, 8).toUpperCase() : Math.floor(100000 + Math.random() * 900000)}`
  const dateStr = orderData?.createdAt?.seconds 
    ? new Date(orderData.createdAt.seconds * 1000).toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const proName = orderData?.proName || orderData?.pro || orderData?.professionalName || 'Profesional Listo'
  const proCategory = orderData?.proSpecialty || orderData?.specialty || orderData?.category || 'Servicios Profesionales'
  const proPhone = orderData?.proPhone || orderData?.phone || '+1 (809) 909-0455'

  const clientName = orderData?.clientName || orderData?.reviewerName || orderData?.client || 'Cliente Listo'
  const clientPhone = orderData?.clientPhone || ''
  const locationStr = orderData?.location || orderData?.city || orderData?.provincia || 'República Dominicana'

  const amountStr = orderData?.montoFinal || orderData?.checkoutMontoFinal || orderData?.montoAcordado || orderData?.checkoutMontoAcordado || orderData?.price || '1,500'
  const paymentMethod = orderData?.formaPago || orderData?.checkoutFormaPago || 'Transferencia / Efectivo'

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🧾 *COMPROBANTE OFICIAL DE SERVICIO - LISTO PATRÓN*\n` +
      `----------------------------------------\n` +
      `📄 *Factura Nº:* ${invoiceNo}\n` +
      `📅 *Fecha:* ${dateStr}\n` +
      `👨‍🔧 *Profesional:* ${proName} (${proCategory})\n` +
      `📞 *Tel. Profesional:* ${proPhone}\n` +
      `👤 *Cliente:* ${clientName}\n` +
      `📍 *Ubicación:* ${locationStr}\n` +
      `💰 *Monto Total:* RD$ ${amountStr}\n` +
      `💳 *Forma de Pago:* ${paymentMethod}\n` +
      `----------------------------------------\n` +
      `🛡️ *Garantía Listo Patrón 24h Activa*\n` +
      `🌐 *Web:* https://www.listopatron.com.do/\n` +
      `📞 *Central 24/7:* +1 (809) 909-0455`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="recibo-modal-overlay" onClick={onClose}>
      <div className="recibo-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="recibo-close-btn" onClick={onClose}>✕</button>

        {/* FACTURA IMPRIMIBLE / VISUAL */}
        <div className="recibo-paper" ref={receiptRef}>
          {/* Header con Logo y Datos Oficiales */}
          <div className="recibo-header-top">
            <div className="recibo-brand">
              <img src={logoListo} alt="Listo Patrón" className="recibo-logo" />
              <div>
                <h2 className="recibo-company-name">Listo Patrón RD</h2>
                <p className="recibo-company-sub">Servicios Profesionales de Confianza</p>
                <a href="https://www.listopatron.com.do/" target="_blank" rel="noreferrer" className="recibo-company-link">
                  🌐 www.listopatron.com.do
                </a>
              </div>
            </div>
            <div className="recibo-invoice-badge">
              <span className="badge-tag">COMPROBANTE DIGITAL</span>
              <h3 className="invoice-num">{invoiceNo}</h3>
              <p className="invoice-date">📅 {dateStr}</p>
            </div>
          </div>

          <div className="recibo-divider-line" />

          {/* Grid de Datos del Cliente y del Profesional */}
          <div className="recibo-info-grid">
            <div className="recibo-info-block">
              <h4 className="info-block-title">👤 DATOS DEL CLIENTE</h4>
              <p className="info-line"><strong>Nombre:</strong> {clientName}</p>
              {clientPhone && <p className="info-line"><strong>Teléfono:</strong> {clientPhone}</p>}
              <p className="info-line"><strong>Ubicación:</strong> {locationStr}</p>
            </div>

            <div className="recibo-info-block">
              <h4 className="info-block-title">👨‍🔧 DATOS DEL PROFESIONAL</h4>
              <p className="info-line"><strong>Profesional:</strong> {proName}</p>
              <p className="info-line"><strong>Especialidad:</strong> {proCategory}</p>
              <p className="info-line"><strong>Tel. Profesional:</strong> {proPhone}</p>
            </div>
          </div>

          {/* Tabla de Detalle de Servicio */}
          <div className="recibo-table-wrap">
            <table className="recibo-table">
              <thead>
                <tr>
                  <th>DESCRIPCIÓN DEL SERVICIO</th>
                  <th>FORMA DE PAGO</th>
                  <th style={{ textAlign: 'right' }}>MONTO (RD$)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Servicio de {proCategory}</strong>
                    <br />
                    <span style={{ fontSize: '12px', color: '#64748B' }}>
                      Atendido por {proName} — Cobertura 24h
                    </span>
                  </td>
                  <td>{paymentMethod}</td>
                  <td style={{ textAlign: 'right', fontWeight: '800' }}>RD$ {amountStr}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total & Cobertura */}
          <div className="recibo-totals-row">
            <div className="recibo-guarantee-box">
              <span>🛡️</span>
              <div>
                <strong>Garantía de Satisfacción Listo Patrón 24h</strong>
                <p>Trabajo cubierto ante cualquier imprevisto técnico.</p>
              </div>
            </div>
            <div className="recibo-total-box">
              <span className="total-label">TOTAL FACTURADO:</span>
              <span className="total-amount">RD$ {amountStr}</span>
            </div>
          </div>

          {/* Footer con Redes Sociales y Soporte */}
          <div className="recibo-footer-official">
            <div className="footer-contact">
              <p>📞 <strong>Soporte Oficial Listo:</strong> +1 (809) 909-0455</p>
              <p>📧 <strong>Email:</strong> listopatron.app@gmail.com</p>
            </div>

            <div className="footer-socials">
              <span className="social-label">Síguenos en Redes:</span>
              <div className="social-icons-row">
                <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" title="Facebook">📘 Facebook</a>
                <a href="https://www.instagram.com/listopatronofficial?igsh=OGQ5ZDc2ODk2ZA==" target="_blank" rel="noreferrer" title="Instagram">📸 Instagram</a>
                <a href="https://www.tiktok.com/@listopatron?_r=1&_t=ZS-94ntViURmdQ" target="_blank" rel="noreferrer" title="TikTok">🎵 TikTok</a>
                <a href="https://www.youtube.com/@listopatron" target="_blank" rel="noreferrer" title="YouTube">▶️ YouTube</a>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="recibo-actions-bar">
          <button type="button" className="recibo-btn print" onClick={handlePrint}>
            🖨️ {lang === 'es' ? 'Imprimir / PDF' : 'Print / PDF'}
          </button>
          <button type="button" className="recibo-btn whatsapp" onClick={handleWhatsAppShare}>
            📲 {lang === 'es' ? 'Enviar por WhatsApp' : 'Send to WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}
