/**
 * Módulo de integración oficial con la Pasarela de Pagos AZUL (Banco Popular Dominicano)
 * Comercio: LISTO PATRON
 * Afiliado: 39666400001
 */

export const AZUL_CONFIG = {
  paymentUrl: 'https://pagos.azul.com.do/PaymentPage/Default.aspx',
  merchantId: '39666400001',
  merchantName: 'LISTO PATRON',
  merchantType: 'E-Commerce',
  currencyCode: '$',
  authKey: 'VR8JyGGrFCwxd5stU6rcxifZd5pXj8tdttPFzrpGC474eCBQ6hrwLDViiOBFpUWRMYXgy0c6T0gSbDF0he1aHLuAUbGwHmUzNoBTPUKMAkz8EBYi1mtFhAjiy5gU2O6T',
  webhookUrl: 'https://us-central1-listoapp-52b46.cloudfunctions.net/azulWebHook'
};

/**
 * Calcula el AuthHash requerido por AZUL usando Web Crypto (HMAC-SHA512)
 */
export async function computeAzulAuthHash(fields, authKey = AZUL_CONFIG.authKey) {
  const hashString = 
    (fields.MerchantId || '') +
    (fields.MerchantName || '') +
    (fields.MerchantType || '') +
    (fields.CurrencyCode || '') +
    (fields.OrderNumber || '') +
    (fields.Amount || '') +
    (fields.ITBIS || '000') +
    (fields.ApprovedUrl || '') +
    (fields.DeclinedUrl || '') +
    (fields.CancelUrl || '') +
    (fields.ResponsePostUrl || '') +
    (fields.UseCustomField1 || '0') +
    (fields.CustomField1Label || '') +
    (fields.CustomField1Value || '') +
    (fields.UseCustomField2 || '0') +
    (fields.CustomField2Label || '') +
    (fields.CustomField2Value || '') +
    authKey;

  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(authKey),
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const signature = await window.crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(hashString)
  );

  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Prepara y envía al usuario a la Pasarela Oficial de Pagos AZUL
 * @param {Object} params
 * @param {string} params.orderNumber - Código de orden único (ej. ORD_123456)
 * @param {number} params.amount - Monto en pesos dominicanos (ej. 1500)
 * @param {string} [params.approvedUrl] - URL de retorno en caso de éxito
 * @param {string} [params.declinedUrl] - URL de retorno en caso de fallo
 * @param {string} [params.cancelUrl] - URL de retorno en caso de cancelación
 */
export async function payWithAzul({
  orderNumber,
  amount,
  approvedUrl,
  declinedUrl,
  cancelUrl
}) {
  if (!orderNumber || !amount) {
    throw new Error('Número de orden y monto son requeridos para pagar con AZUL.');
  }

  // Convertir a centavos requeridos por AZUL (RD$ 150.00 -> "15000")
  const amountCents = String(Math.round(Number(amount) * 100));
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://listopatron.vercel.app';

  const finalApprovedUrl = approvedUrl || AZUL_CONFIG.webhookUrl;
  const finalDeclinedUrl = declinedUrl || `${base}/?pago=declinado&orden=${encodeURIComponent(orderNumber)}`;
  const finalCancelUrl = cancelUrl || `${base}/?pago=cancelado&orden=${encodeURIComponent(orderNumber)}`;

  const formFields = {
    MerchantId: AZUL_CONFIG.merchantId,
    MerchantName: AZUL_CONFIG.merchantName,
    MerchantType: AZUL_CONFIG.merchantType,
    CurrencyCode: AZUL_CONFIG.currencyCode,
    OrderNumber: String(orderNumber),
    Amount: amountCents,
    ITBIS: '000',
    ApprovedUrl: finalApprovedUrl,
    DeclinedUrl: finalDeclinedUrl,
    CancelUrl: finalCancelUrl,
    ResponsePostUrl: AZUL_CONFIG.webhookUrl,
    UseCustomField1: '0',
    CustomField1Label: '',
    CustomField1Value: '',
    UseCustomField2: '0',
    CustomField2Label: '',
    CustomField2Value: ''
  };

  const authHash = await computeAzulAuthHash(formFields, AZUL_CONFIG.authKey);
  formFields.AuthHash = authHash;

  // Crear y enviar formulario POST a AZUL
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = AZUL_CONFIG.paymentUrl;

  // En Capacitor nativo o web:
  const isCapacitor = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
  if (isCapacitor) {
    form.target = '_self';
  } else {
    form.target = '_self';
  }

  Object.entries(formFields).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v ?? '';
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  setTimeout(() => {
    try { document.body.removeChild(form); } catch (e) {}
  }, 3000);
}
