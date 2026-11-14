import React, { useState, useEffect } from 'react';

export function detectCardBrand(numStr = '') {
  const clean = numStr.replace(/\D/g, '');
  if (/^4/.test(clean)) return { name: 'VISA', color: '#1E3A8A', bg: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)' };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'MASTERCARD', color: '#EA580C', bg: 'linear-gradient(135deg, #1E293B 0%, #9A3412 100%)' };
  if (/^3[47]/.test(clean)) return { name: 'AMEX', color: '#0284C7', bg: 'linear-gradient(135deg, #0F172A 0%, #0369A1 100%)' };
  return { name: 'TARJETA', color: '#F26000', bg: 'linear-gradient(135deg, #1A1A2E 0%, #F26000 100%)' };
}

export function formatCardNumber(val = '') {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(val = '') {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
}

export function validateCardDetails(cardData) {
  if (!cardData) return { valid: false, error: 'Completa los datos de tu tarjeta.' };
  if (cardData.useSavedCard && cardData.savedCard) {
    if (!cardData.cvv || cardData.cvv.replace(/\D/g, '').length < 3) {
      return { valid: false, error: 'Ingresa el código de seguridad (CVV) de tu tarjeta guardada.' };
    }
    return {
      valid: true,
      brand: cardData.savedCard.brand,
      last4: cardData.savedCard.last4,
      holder: cardData.savedCard.holder
    };
  }
  const cleanNum = (cardData.number || '').replace(/\D/g, '');
  if (cleanNum.length < 15) {
    return { valid: false, error: 'El número de tarjeta debe tener 15 o 16 dígitos.' };
  }
  if (!cardData.holder || cardData.holder.trim().length < 3) {
    return { valid: false, error: 'Escribe el nombre del titular como aparece en la tarjeta.' };
  }
  const expParts = (cardData.expiry || '').split('/');
  if (expParts.length !== 2 || expParts[0].length !== 2 || expParts[1].length !== 2) {
    return { valid: false, error: 'Ingresa una fecha de vencimiento válida (MM/AA).' };
  }
  const month = parseInt(expParts[0], 10);
  if (isNaN(month) || month < 1 || month > 12) {
    return { valid: false, error: 'El mes de vencimiento debe estar entre 01 y 12.' };
  }
  const cleanCvv = (cardData.cvv || '').replace(/\D/g, '');
  if (cleanCvv.length < 3) {
    return { valid: false, error: 'Ingresa el código CVV de 3 o 4 dígitos al dorso de tu tarjeta.' };
  }
  const brand = detectCardBrand(cleanNum).name;
  const last4 = cleanNum.slice(-4);
  return {
    valid: true,
    brand,
    last4,
    holder: cardData.holder.trim().toUpperCase()
  };
}

const SAVED_CARD_STORAGE_KEY = 'pedidos_listo_saved_card_v1';

export default function CreditCardCheckoutForm({
  totalAmount = 0,
  cardData,
  onChangeCardData,
  allowAzulGateway = false
}) {
  const [savedCard, setSavedCard] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_CARD_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.last4) {
          setSavedCard(parsed);
          if (!cardData.initializedSaved) {
            onChangeCardData({
              ...cardData,
              useSavedCard: true,
              savedCard: parsed,
              initializedSaved: true
            });
          }
        }
      }
    } catch (e) {}
  }, []);

  const brandInfo = detectCardBrand(cardData?.number || '');
  const cleanDigits = (cardData?.number || '').replace(/\D/g, '');
  const maskedDisplay = cardData?.useSavedCard && savedCard
    ? `•••• •••• •••• ${savedCard.last4}`
    : (cardData?.number || '•••• •••• •••• ••••');

  const updateField = (field, value) => {
    onChangeCardData({
      ...cardData,
      [field]: value
    });
  };

  const handleRemoveSavedCard = () => {
    try { localStorage.removeItem(SAVED_CARD_STORAGE_KEY); } catch (e) {}
    setSavedCard(null);
    onChangeCardData({
      ...cardData,
      useSavedCard: false,
      savedCard: null
    });
  };

  return (
    <div style={{
      marginTop: 10,
      background: '#F8FAFC',
      border: '1.5px solid #FED7AA',
      borderRadius: 16,
      padding: 12,
      boxShadow: '0 6px 20px rgba(242, 96, 0, 0.08)'
    }}>
      {/* Selector de modalidad si hay pasarela Azul disponible */}
      {allowAzulGateway && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
          <button
            type="button"
            onClick={() => updateField('mode', 'inapp')}
            style={{
              padding: '7px 8px',
              borderRadius: 10,
              border: (cardData?.mode || 'inapp') === 'inapp' ? '2px solid #F26000' : '1px solid #CBD5E1',
              background: (cardData?.mode || 'inapp') === 'inapp' ? '#FFF4EE' : '#FFFFFF',
              color: (cardData?.mode || 'inapp') === 'inapp' ? '#C2410C' : '#475569',
              fontSize: 11,
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            💳 Pagar Aquí en la App
          </button>
          <button
            type="button"
            onClick={() => updateField('mode', 'azul')}
            style={{
              padding: '7px 8px',
              borderRadius: 10,
              border: cardData?.mode === 'azul' ? '2px solid #1E3A8A' : '1px solid #CBD5E1',
              background: cardData?.mode === 'azul' ? '#EFF6FF' : '#FFFFFF',
              color: cardData?.mode === 'azul' ? '#1E3A8A' : '#475569',
              fontSize: 11,
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            🏦 Pasarela Web AZUL
          </button>
        </div>
      )}

      {cardData?.mode === 'azul' ? (
        <div style={{ padding: '12px', background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', borderRadius: 14, border: '1.5px solid #93C5FD', color: '#1E3A8A' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 900, background: '#1D4ED8', color: '#FFF', padding: '3px 8px', borderRadius: 6 }}>
              🔒 PASARELA OFICIAL AZUL
            </span>
            <span style={{ fontSize: 11, fontWeight: 900, color: '#1E3A8A' }}>
              Afiliado: 39666400001
            </span>
          </div>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>
            🏪 Comercio: LISTO PATRON — Total: RD$ {Number(totalAmount || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.4, color: '#1E3A8A' }}>
            Acepta <strong>Visa, Mastercard, Google Pay y Apple Pay</strong>. Al confirmar tu pedido se procesará el cobro exacto de tu carrito (<strong>RD$ {Number(totalAmount || 0).toLocaleString()}</strong>) con AZUL Banco Popular.
          </div>
        </div>
      ) : (
        <>
          {/* Tarjeta visual interactiva */}
          <div style={{
            background: brandInfo.bg,
            color: '#FFFFFF',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 12,
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.25)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 30,
                  height: 22,
                  borderRadius: 5,
                  background: 'linear-gradient(135deg, #FDE047 0%, #CA8A04 100%)',
                  border: '1px solid rgba(255,255,255,0.4)'
                }} />
                <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.5px' }}>
                  PAGO SEGURO SSL
                </span>
              </div>
              <span style={{
                background: 'rgba(255,255,255,0.18)',
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 10.5,
                fontWeight: 900,
                letterSpacing: '0.8px'
              }}>
                {cardData?.useSavedCard && savedCard ? savedCard.brand : brandInfo.name}
              </span>
            </div>

            <div style={{
              fontFamily: '"Courier New", Courier, monospace',
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: '2px',
              marginBottom: 10,
              textShadow: '0 2px 4px rgba(0,0,0,0.35)'
            }}>
              {maskedDisplay}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 10 }}>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 8.5, textTransform: 'uppercase' }}>Titular</div>
                <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: '0.5px' }}>
                  {(cardData?.useSavedCard && savedCard ? savedCard.holder : cardData?.holder) || 'NOMBRE DEL TITULAR'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 8.5, textTransform: 'uppercase' }}>Vence</div>
                <div style={{ fontWeight: 800, fontSize: 11 }}>
                  {(cardData?.useSavedCard && savedCard ? savedCard.expiry : cardData?.expiry) || 'MM/AA'}
                </div>
              </div>
            </div>
          </div>

          {/* Si tiene tarjeta guardada, permitir usarla en 1 clic o cambiar a otra */}
          {savedCard && (
            <div style={{
              background: '#FFFFFF',
              border: '1.5px solid #FED7AA',
              borderRadius: 12,
              padding: '8px 10px',
              marginBottom: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: '#1E293B', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={!!cardData?.useSavedCard}
                  onChange={(e) => onChangeCardData({ ...cardData, useSavedCard: e.target.checked, savedCard })}
                  style={{ accentColor: '#F26000' }}
                />
                <span>Usar {savedCard.brand} •••• {savedCard.last4}</span>
              </label>
              <button
                type="button"
                onClick={handleRemoveSavedCard}
                style={{ background: 'none', border: 'none', color: '#DC2626', fontSize: 10.5, fontWeight: 800, cursor: 'pointer' }}
              >
                Eliminar
              </button>
            </div>
          )}

          {cardData?.useSavedCard && savedCard ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, fontSize: 11.5, color: '#475569', fontWeight: 700 }}>
                🔒 Confirma el código <strong>CVV</strong> al dorso de tu tarjeta •••• {savedCard.last4}:
              </div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="CVV"
                value={cardData?.cvv || ''}
                onChange={(e) => updateField('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                style={{
                  width: 85,
                  padding: '9px 10px',
                  borderRadius: 10,
                  border: '1.5px solid #F26000',
                  fontSize: 14,
                  fontWeight: 900,
                  textAlign: 'center',
                  outline: 'none',
                  background: '#FFFFFF'
                }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 900, color: '#475569', marginBottom: 3 }}>
                  NÚMERO DE TARJETA (CRÉDITO O DÉBITO) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={cardData?.number || ''}
                    onChange={(e) => updateField('number', formatCardNumber(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px 70px 10px 12px',
                      borderRadius: 10,
                      border: cleanDigits.length >= 15 ? '1.5px solid #10B981' : '1.5px solid #CBD5E1',
                      fontSize: 14,
                      fontWeight: 800,
                      letterSpacing: '1px',
                      outline: 'none',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: 10,
                    fontWeight: 900,
                    background: brandInfo.color,
                    color: '#FFFFFF',
                    padding: '2px 6px',
                    borderRadius: 5
                  }}>
                    {brandInfo.name}
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 10.5, fontWeight: 900, color: '#475569', marginBottom: 3 }}>
                  NOMBRE EN LA TARJETA *
                </label>
                <input
                  type="text"
                  placeholder="Ej: JUAN PEREZ"
                  value={cardData?.holder || ''}
                  onChange={(e) => updateField('holder', e.target.value.toUpperCase())}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1.5px solid #CBD5E1',
                    fontSize: 13,
                    fontWeight: 700,
                    outline: 'none',
                    background: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 900, color: '#475569', marginBottom: 3 }}>
                    VENCIMIENTO (MM/AA) *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/AA"
                    value={cardData?.expiry || ''}
                    onChange={(e) => updateField('expiry', formatExpiry(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 800,
                      textAlign: 'center',
                      outline: 'none',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 900, color: '#475569', marginBottom: 3 }}>
                    CÓDIGO CVV / CVC *
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="123"
                    value={cardData?.cvv || ''}
                    onChange={(e) => updateField('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      border: '1.5px solid #CBD5E1',
                      fontSize: 13,
                      fontWeight: 800,
                      textAlign: 'center',
                      outline: 'none',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#475569', marginTop: 2, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={cardData?.saveForLater !== false}
                  onChange={(e) => updateField('saveForLater', e.target.checked)}
                  style={{ accentColor: '#F26000' }}
                />
                <span>Guardar tarjeta de forma segura para futuros pedidos</span>
              </label>
            </div>
          )}

          <div style={{
            marginTop: 8,
            padding: '7px 10px',
            background: '#ECFDF5',
            borderRadius: 9,
            border: '1px solid #A7F3D0',
            fontSize: 10.5,
            color: '#065F46',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span>🛡️</span>
            <span>Transacción encriptada de extremo a extremo. Cargo directo: <strong>RD$ {Number(totalAmount || 0).toLocaleString()}</strong></span>
          </div>
        </>
      )}
    </div>
  );
}

export function saveCardTokenIfRequested(cardData, validated) {
  if (!cardData || cardData.useSavedCard || cardData.saveForLater === false || !validated?.valid) return;
  try {
    localStorage.setItem(SAVED_CARD_STORAGE_KEY, JSON.stringify({
      brand: validated.brand,
      last4: validated.last4,
      holder: validated.holder,
      expiry: cardData.expiry
    }));
  } catch (e) {}
}

