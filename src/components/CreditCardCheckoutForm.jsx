import React, { useEffect } from 'react';

/**
 * Formulario Oficial de Checkout AZUL (Banco Popular Dominicano)
 * Comercio: LISTO PATRON (39666400001)
 */
export default function CreditCardCheckoutForm({
  totalAmount = 0,
  cardData = {},
  onChangeCardData = () => {}
}) {
  useEffect(() => {
    if (cardData?.mode !== 'azul') {
      onChangeCardData({ ...cardData, mode: 'azul' });
    }
  }, []);

  return (
    <div style={{
      marginTop: 10,
      background: '#F8FAFC',
      border: '1.5px solid #BAE6FD',
      borderRadius: 16,
      padding: 12,
      boxShadow: '0 6px 20px rgba(0, 82, 212, 0.08)'
    }}>
      {/* TARJETA OFICIAL PASARELA AZUL */}
      <div style={{
        background: 'linear-gradient(135deg, #0A2540 0%, #0052D4 50%, #1E3A8A 100%)',
        borderRadius: '20px',
        padding: '18px 20px',
        color: '#FFFFFF',
        boxShadow: '0 12px 25px rgba(0,0,0,0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.18)',
            padding: '5px 12px',
            borderRadius: '999px',
            fontSize: '11px',
            fontWeight: '900',
            letterSpacing: '0.5px'
          }}>
            🔒 PASARELA OFICIAL AZUL
          </div>
          <div style={{ fontWeight: '900', fontStyle: 'italic', fontSize: '18px', letterSpacing: '-0.5px' }}>
            Listo Patrón
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '11px', opacity: 0.85, fontWeight: '700' }}>
            Comercio Afiliado: LISTO PATRON (39666400001)
          </div>
          <div style={{ fontSize: '22px', fontWeight: '900', marginTop: '2px' }}>
            Total a Pagar: RD$ {Number(totalAmount || 0).toLocaleString()}
          </div>
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.25)',
          borderRadius: '12px',
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11.5px'
        }}>
          <span style={{ fontFamily: 'monospace', fontWeight: '700', opacity: 0.95 }}>
            pagos.azul.com.do/PaymentPage
          </span>
          <span style={{ fontWeight: '800', fontSize: '11px', color: '#A7F3D0' }}>
            SSL 256-Bit
          </span>
        </div>
      </div>

      {/* Información y características de AZUL */}
      <div style={{
        marginTop: 10,
        background: '#F0F9FF',
        border: '1.5px solid #BAE6FD',
        borderRadius: 14,
        padding: '12px 14px',
        color: '#0369A1',
        fontSize: 12,
        lineHeight: 1.45
      }}>
        <div style={{ fontWeight: 800, color: '#0C4A6E', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>🛡️</span> Pago 100% Protegido por Banco Popular
        </div>
        Acepta <strong>Visa, Mastercard, Google Pay y Apple Pay</strong>. Al confirmar tu pedido, serás dirigido a la pasarela oficial de <strong>AZUL</strong> para pagar con total tranquilidad.
      </div>
    </div>
  );
}

// Helpers exportados para compatibilidad
export function validateCardDetails() {
  return { valid: true, brand: 'AZUL', last4: 'AZUL' };
}
export function saveCardTokenIfRequested() {}
export function formatCardNumber(v = '') { return v; }
export function formatExpiry(v = '') { return v; }
export function detectCardBrand() {
  return { name: 'AZUL', color: '#0052D4', bg: 'linear-gradient(135deg, #0A2540 0%, #0052D4 100%)' };
}
