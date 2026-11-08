import React, { useState } from 'react';

const DEFAULT_ACCOUNTS = [
  { id: 'banreservas', bank: 'Banreservas', type: 'Cuenta Corriente / Ahorros', number: '960-482910-4', holder: 'Listo Patrón / Pedidos Listo', color: '#0284C7' },
  { id: 'popular', bank: 'Banco Popular', type: 'Cuenta Corriente', number: '814-295018-2', holder: 'Listo Patrón / Pedidos Listo', color: '#1E3A8A' }
];

const compressReceiptImage = (file, maxRes = 720) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height) {
        if (width > maxRes) { height = Math.round((height * maxRes) / width); width = maxRes; }
      } else {
        if (height > maxRes) { width = Math.round((width * maxRes) / height); height = maxRes; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    img.onerror = reject;
    img.src = e.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function BankTransferCheckoutBox({
  totalAmount = 0,
  receiptImage,
  onChangeReceiptImage,
  referenceNumber = '',
  onChangeReferenceNumber,
  storeName = ''
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleCopy = (acc) => {
    try {
      navigator.clipboard.writeText(acc.number.replace(/[^0-9]/g, ''));
      setCopiedId(acc.id);
      setTimeout(() => setCopiedId(null), 2200);
    } catch (e) {}
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressReceiptImage(file);
      if (onChangeReceiptImage) onChangeReceiptImage(compressed);
    } catch (err) {
      console.error('Error comprimiendo comprobante:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      marginTop: 10,
      background: '#F8FAFC',
      border: '1.5px solid #BFDBFE',
      borderRadius: 16,
      padding: 12,
      boxShadow: '0 6px 18px rgba(30, 58, 138, 0.07)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 900, color: '#1E3A8A' }}>
          🏦 Cuentas para Transferencia Bancaria
        </span>
        <span style={{ fontSize: 11, fontWeight: 900, color: '#F26000', background: '#FFF4EE', padding: '2px 8px', borderRadius: 8 }}>
          RD$ {Number(totalAmount || 0).toLocaleString()}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {DEFAULT_ACCOUNTS.map(acc => (
          <div key={acc.id} style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 12,
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  background: acc.color,
                  color: '#FFFFFF',
                  fontSize: 9.5,
                  fontWeight: 900,
                  padding: '2px 6px',
                  borderRadius: 5
                }}>
                  {acc.bank}
                </span>
                <span style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>{acc.type}</span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 900, color: '#0F172A', fontFamily: 'monospace', marginTop: 3 }}>
                {acc.number}
              </div>
              <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>
                Titular: {storeName || acc.holder}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(acc)}
              style={{
                background: copiedId === acc.id ? '#10B981' : '#EFF6FF',
                color: copiedId === acc.id ? '#FFFFFF' : '#1D4ED8',
                border: copiedId === acc.id ? '1px solid #10B981' : '1px solid #BFDBFE',
                borderRadius: 9,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 900,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {copiedId === acc.id ? '✓ Copiada' : '📋 Copiar'}
            </button>
          </div>
        ))}
      </div>

      {/* Campo opcional de número de referencia */}
      {onChangeReferenceNumber && (
        <div style={{ marginBottom: 8 }}>
          <input
            type="text"
            placeholder="Núm. de referencia o últimos 4 dígitos (opcional)"
            value={referenceNumber || ''}
            onChange={(e) => onChangeReferenceNumber(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid #CBD5E1',
              fontSize: 12,
              fontWeight: 700,
              background: '#FFFFFF',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Subida de foto del comprobante */}
      <div>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: receiptImage ? '#ECFDF5' : 'linear-gradient(135deg, #FFF4EE, #FFEDD5)',
          color: receiptImage ? '#047857' : '#C2410C',
          border: receiptImage ? '1.5px dashed #10B981' : '1.5px dashed #F26000',
          borderRadius: 12,
          padding: '10px 12px',
          fontSize: 12,
          fontWeight: 900,
          cursor: 'pointer',
          textAlign: 'center'
        }}>
          <span>{uploading ? '⏳ Procesando imagen...' : (receiptImage ? '✅ Comprobante adjuntado (Toca para cambiar)' : '📷 Subir Captura del Comprobante de Pago')}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>

        {receiptImage && (
          <div style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF',
            padding: 8,
            borderRadius: 10,
            border: '1px solid #A7F3D0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img
                src={receiptImage}
                alt="Comprobante de transferencia"
                style={{ width: 46, height: 46, borderRadius: 8, objectFit: 'cover', border: '1px solid #CBD5E1' }}
              />
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 900, color: '#065F46' }}>Comprobante listo</div>
                <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700 }}>Se enviará directo a la Comandera del local</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onChangeReceiptImage && onChangeReceiptImage(null)}
              style={{
                background: '#FEE2E2',
                color: '#DC2626',
                border: 'none',
                borderRadius: 8,
                padding: '5px 8px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              ✕ Quitar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

