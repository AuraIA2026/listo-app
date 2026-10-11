import { useRef } from 'react'
import logoListo from '../assets/logo-mamey.png'
import './ReciboDigitalModal.css'

export default function ReciboDigitalModal({ lang = 'es', onClose, orderData, order }) {
  const receiptRef = useRef(null)
  const d = orderData || order || {}

  const invoiceNo = `LP-${d?.id ? d.id.substring(0, 8).toUpperCase() : Math.floor(100000 + Math.random() * 900000)}`
  const dateStr = d?.createdAt?.seconds 
    ? new Date(d.createdAt.seconds * 1000).toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const proName = d?.proName || d?.pro || d?.professionalName || 'Profesional Listo'
  const proCategory = d?.proSpecialty || d?.specialty || d?.category || 'Servicios Profesionales'
  const proPhone = d?.proPhone || d?.phone || '+1 (809) 909-0455'

  const clientName = d?.clientName || d?.reviewerName || d?.client || 'Cliente Listo'
  const clientPhone = d?.clientPhone || ''
  const locationStr = d?.location || d?.city || d?.provincia || 'República Dominicana'

  const amountStr = d?.montoFinal || d?.checkoutMontoFinal || d?.montoAcordado || d?.checkoutMontoAcordado || d?.price || '1,500'
  const paymentMethod = d?.formaPago || d?.checkoutFormaPago || (d?.paymentMethod === 'cash' ? '💵 Efectivo en mano' : d?.paymentMethod === 'transfer' ? '🏦 Transferencia bancaria' : 'Transferencia / Efectivo')

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `ðŸ§¾ *COMPROBANTE OFICIAL DE SERVICIO - PEDIDOS LISTO*\n` +
      `----------------------------------------\n` +
      `ðŸ“„ *Factura NÂº:* ${invoiceNo}\n` +
      `ðŸ“… *Fecha:* ${dateStr}\n` +
      `ðŸ‘¨â€ðŸ”§ *Profesional:* ${proName} (${proCategory})\n` +
      `ðŸ“ž *Tel. Profesional:* ${proPhone}\n` +
      `ðŸ‘¤ *Cliente:* ${clientName}\n` +
      `ðŸ“ *UbicaciÃ³n:* ${locationStr}\n` +
      `ðŸ’° *Monto Total:* RD$ ${amountStr}\n` +
      `ðŸ’³ *Forma de Pago:* ${paymentMethod}\n` +
      `----------------------------------------\n` +
      `ðŸ›¡ï¸ *Respaldo y MediaciÃ³n Pedidos Listo 24h*\n` +
      `ðŸŒ *Web:* https://www.listopatron.com.do/\n` +
      `ðŸ“ž *Central 24/7:* +1 (809) 909-0455`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="recibo-modal-overlay" onClick={onClose}>
      <div className="recibo-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="recibo-close-btn" onClick={onClose}>âœ•</button>

        {/* FACTURA IMPRIMIBLE / VISUAL */}
        <div className="recibo-paper" ref={receiptRef}>
          {/* Header con Logo y Datos Oficiales */}
          <div className="recibo-header-top">
            <div className="recibo-brand">
              <img src={logoListo} alt="Pedidos Listo" className="recibo-logo" />
              <div>
                <h2 className="recibo-company-name">Pedidos Listo RD</h2>
                <p className="recibo-company-sub">Servicios Profesionales de Confianza</p>
                <a href="https://www.listopatron.com.do/" target="_blank" rel="noreferrer" className="recibo-company-link">
                  ðŸŒ www.listopatron.com.do
                </a>
              </div>
            </div>
            <div className="recibo-invoice-badge">
              <span className="badge-tag">COMPROBANTE DIGITAL</span>
              <h3 className="invoice-num">{invoiceNo}</h3>
              <p className="invoice-date">ðŸ“… {dateStr}</p>
            </div>
          </div>

          <div className="recibo-divider-line" />

          {/* Grid de Datos del Cliente y del Profesional */}
          <div className="recibo-info-grid">
            <div className="recibo-info-block">
              <h4 className="info-block-title">ðŸ‘¤ DATOS DEL CLIENTE</h4>
              <p className="info-line"><strong>Nombre:</strong> {clientName}</p>
              {clientPhone && <p className="info-line"><strong>TelÃ©fono:</strong> {clientPhone}</p>}
              <p className="info-line"><strong>UbicaciÃ³n:</strong> {locationStr}</p>
            </div>

            <div className="recibo-info-block">
              <h4 className="info-block-title">ðŸ‘¨â€ðŸ”§ DATOS DEL PROFESIONAL</h4>
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
                  <th>DESCRIPCIÃ“N DEL SERVICIO</th>
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
                      Atendido por {proName} â€” Cobertura 24h
                    </span>
                  </td>
                  <td>{paymentMethod}</td>
                  <td style={{ textAlign: 'right', fontWeight: '800' }}>RD$ {amountStr}</td>
                </tr>
                {(orderData?.tipAmount > 0 || orderData?.propina > 0) && (
                  <tr style={{ background: '#FFF3EC' }}>
                    <td>
                      <strong style={{ color: '#C24D00' }}>ðŸŽ Propina al Profesional (100% Directa)</strong>
                      <br />
                      <span style={{ fontSize: '11px', color: '#883A00' }}>
                        Recompensa por servicio de calidad
                      </span>
                    </td>
                    <td>-</td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: '#C24D00' }}>
                      RD$ {(orderData?.tipAmount || orderData?.propina).toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total & Cobertura */}
          <div className="recibo-totals-row">
            <div className="recibo-guarantee-box">
              <span>ðŸ›¡ï¸</span>
              <div>
                <strong>Respaldo y MediaciÃ³n Pedidos Listo 24h</strong>
                <p>Soporte de mediaciÃ³n directa con el profesional contratado.</p>
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
              <p>ðŸ“ž <strong>Soporte Oficial Listo:</strong> +1 (809) 909-0455</p>
              <p>ðŸ“§ <strong>Email:</strong> listopatron.app@gmail.com</p>
            </div>

            <div className="footer-socials">
              <span className="social-label">SÃ­guenos en Redes:</span>
              <div className="social-icons-row">
                <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" title="Facebook">ðŸ“˜ Facebook</a>
                <a href="https://www.instagram.com/listopatronofficial?igsh=OGQ5ZDc2ODk2ZA==" target="_blank" rel="noreferrer" title="Instagram">ðŸ“¸ Instagram</a>
                <a href="https://www.tiktok.com/@listopatron?_r=1&_t=ZS-94ntViURmdQ" target="_blank" rel="noreferrer" title="TikTok">ðŸŽµ TikTok</a>
                <a href="https://www.youtube.com/@listopatron" target="_blank" rel="noreferrer" title="YouTube">â–¶ï¸ YouTube</a>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de AcciÃ³n */}
        <div className="recibo-actions-bar">
          <button type="button" className="recibo-btn print" onClick={handlePrint}>
            ðŸ–¨ï¸ {lang === 'es' ? 'Imprimir / PDF' : 'Print / PDF'}
          </button>
          <button type="button" className="recibo-btn whatsapp" onClick={handleWhatsAppShare}>
            ðŸ“² {lang === 'es' ? 'Enviar por WhatsApp' : 'Send to WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  )
}
