import React, { useState, useEffect } from 'react'
import { requestNotificationPermission } from '../utils/notifications'

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already running as standalone PWA
    const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    setIsStandalone(isApp)

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      const dismissed = localStorage.getItem('listo_pwa_banner_dismissed')
      if (!dismissed) {
        setShowBanner(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`PWA install choice: ${outcome}`)
      setDeferredPrompt(null)
      setShowBanner(false)
    } else {
      alert('📲 Para instalar Pedidos Listo en tu teléfono:\n\n1. En iPhone (Safari): Presiona el botón "Compartir" (subir) y elige "Agregar a inicio".\n2. En Android (Chrome): Toca los 3 puntos (⋮) y elige "Instalar aplicación".')
    }
    await requestNotificationPermission()
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('listo_pwa_banner_dismissed', 'true')
  }

  if (isStandalone || !showBanner) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '76px',
      left: '16px',
      right: '16px',
      background: 'linear-gradient(135deg, #1E293B, #0F172A)',
      color: '#FFFFFF',
      padding: '12px 16px',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      border: '1.5px solid rgba(242, 96, 0, 0.4)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      animation: 'pwaBannerSlideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      <style>{`
        @keyframes pwaBannerSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #FF7A1A, #F26000)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(242, 96, 0, 0.5)'
        }}>
          📲
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: '13px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '0.2px' }}>
            Instalar Pedidos Listo App
          </span>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            Acceso rápido en tu pantalla de inicio + Notificaciones ⚡
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={handleInstallClick}
          style={{
            background: 'linear-gradient(135deg, #F26000, #FF7A1A)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '20px',
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: '900',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(242, 96, 0, 0.4)',
            whiteSpace: 'nowrap'
          }}
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
