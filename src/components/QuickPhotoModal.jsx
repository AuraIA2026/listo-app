import React, { useState, useRef } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function QuickPhotoModal({ isOpen, onClose, user, onPhotoUpdated }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Iniciar cámara frontal para selfie
  const startCamera = async () => {
    setError('');
    setUseCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error abriendo cámara:', err);
      setError('No se pudo acceder a la cámara. Por favor selecciona una foto de tu galería.');
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
  };

  const takeSelfie = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth || 400, video.videoHeight || 400);
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPreview(dataUrl);
    stopCamera();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 400, 400);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        setPreview(compressed);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!preview || !user?.uid) return;
    setLoading(true);
    setError('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: preview,
        profilePhoto: preview,
        avatarUrl: preview,
        profileComplete: true,
        photoUpdatedAt: new Date().toISOString()
      });

      try {
        localStorage.setItem('user_photo_url', preview);
        const stored = JSON.parse(localStorage.getItem('listoUserData') || '{}');
        stored.photoURL = preview;
        stored.profilePhoto = preview;
        stored.profileComplete = true;
        localStorage.setItem('listoUserData', JSON.stringify(stored));
      } catch (_) {}

      if (onPhotoUpdated) onPhotoUpdated(preview);
      onClose();
    } catch (err) {
      console.error('Error guardando foto:', err);
      setError('Error al guardar la foto. Intenta con una imagen más liviana.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div
      onClick={handleModalClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        background: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '26px',
          width: '100%',
          maxWidth: '430px',
          padding: '26px 22px',
          textAlign: 'center',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          border: '1.5px solid #FED7AA',
          position: 'relative'
        }}
      >
        <button
          onClick={handleModalClose}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            cursor: 'pointer',
            fontSize: 14,
            color: '#64748B',
            fontWeight: 800
          }}
        >
          ✕
        </button>

        <div style={{ fontSize: 38, marginBottom: 6 }}>📸</div>
        <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 900, color: '#0F172A', fontFamily: 'var(--display)' }}>
          Añade tu Foto de Perfil
        </h3>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: '#64748B', lineHeight: 1.4 }}>
          Una foto real genera confianza inmediata en Listo Patrón y activa tu perfil al 100%.
        </p>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 12, padding: '8px 12px', fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* Zona de Cámara en Vivo */}
        {useCamera ? (
          <div style={{ position: 'relative', width: 220, height: 220, margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--brand)', boxShadow: '0 4px 18px rgba(242,96,0,0.3)' }}>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              onClick={takeSelfie}
              style={{
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#F26000',
                color: '#FFF',
                border: '2px solid #FFF',
                borderRadius: 20,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 900,
                cursor: 'pointer'
              }}
            >
              📸 Capturar
            </button>
          </div>
        ) : (
          /* Previsualización Circular */
          <div style={{ width: 150, height: 150, borderRadius: '50%', margin: '0 auto 18px', background: preview ? 'transparent' : 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)', border: '3.5px dashed #F26000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            {preview ? (
              <img src={preview} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 44, color: '#F26000', opacity: 0.65 }}>👤</span>
            )}
          </div>
        )}

        {/* Botones de Selección */}
        {!useCamera && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            <button
              type="button"
              onClick={startCamera}
              style={{
                padding: '11px',
                borderRadius: 14,
                border: '1.5px solid #E2E8F0',
                background: '#F8FAFC',
                color: '#334155',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              🤳 Tomar Selfie
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '11px',
                borderRadius: 14,
                border: '1.5px solid #FED7AA',
                background: '#FFF7ED',
                color: '#C2410C',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              📁 Subir de Galería
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Botón Guardar Foto */}
        {preview && (
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #F26000 0%, #EA580C 100%)',
              color: '#FFF',
              border: 'none',
              fontSize: 15,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(242, 96, 0, 0.4)',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Guardando foto...' : '✅ Guardar Mi Foto de Perfil'}
          </button>
        )}
      </div>
    </div>
  );
}
