import React, { useState, useEffect, useRef } from 'react';
import logoMamey from '../assets/logo-mamey.png';
import './PedidosListoIntro.css';


export default function PedidosListoIntro({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('entering'); // 'entering' | 'alita_glow' | 'ready' | 'exiting'
  const [statusText, setStatusText] = useState('🛵 Encendiendo motores en Santiago...');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioPlayedRef = useRef(false);

  // Play pleasant chime on mount / alita reveal
  const playAlitaChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      // Note 1: 523.25 Hz (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.18);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2: Harmonic shimmer for "La Alita"
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(783.99, now + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.45);
      gain2.gain.setValueAtTime(0.3, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.85);
    } catch (e) {}
  };

  useEffect(() => {
    // Stage 1: Alita glow trigger after 600ms
    const timer1 = setTimeout(() => {
      setPhase('alita_glow');
      if (soundEnabled && !audioPlayedRef.current) {
        audioPlayedRef.current = true;
        playAlitaChime();
      }
    }, 600);

    // Progress bar runner
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase('ready');
          return 100;
        }
        const next = prev + 3;
        if (next >= 25 && next < 55) {
          setStatusText('🪶 Desplegando la alita de Listo...');
        } else if (next >= 55 && next < 85) {
          setStatusText('🍔 Preparando los mejores sabores de Santiago...');
        } else if (next >= 85) {
          setStatusText('✨ ¡Todo Listo! ¡Bienvenido a Pedidos Listo!');
        }
        return next;
      });
    }, 80);

    return () => {
      clearTimeout(timer1);
      clearInterval(interval);
    };
  }, [soundEnabled]);

  const handleEnterApp = () => {
    setPhase('exiting');
    setTimeout(() => {
      if (onFinish) onFinish();
    }, 450);
  };

  return (
    <div className={`pedidos-intro-container ${phase === 'exiting' ? 'intro-fade-out' : ''}`}>
      {/* Background Ambient Aura Glows */}
      <div className="intro-aurora-bg" />
      <div className="intro-floating-glow top-left" />
      <div className="intro-floating-glow bottom-right" />

      {/* Floating Sparks/Embers */}
      <div className="intro-particles-container">
        {[...Array(14)].map((_, i) => (
          <span
            key={i}
            className="intro-particle"
            style={{
              left: `${(i * 7.5 + 4) % 94}%`,
              animationDelay: `${(i * 0.28).toFixed(2)}s`,
              animationDuration: `${(2.2 + (i % 3) * 0.7).toFixed(2)}s`
            }}
          />
        ))}
      </div>

      {/* Sound Toggle (Top Right) */}
      <div className="intro-top-bar">
        <button
          className="intro-sound-btn"
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            if (!soundEnabled) playAlitaChime();
          }}
          title={soundEnabled ? 'Silenciar intro' : 'Activar sonido'}
        >
          {soundEnabled ? '🔊 Sonido Listo' : '🔇 Silencio'}
        </button>
        <button className="intro-skip-btn" onClick={handleEnterApp}>
          Saltar Intro ➔
        </button>
      </div>

      {/* Centerpiece Showcase */}
      <div className="intro-center-hero">
        {/* Animated Multi-Ring Logo Wrapper */}
        <div className="intro-logo-outer-halo">
          <div className="intro-logo-ring ring-1" />
          <div className="intro-logo-ring ring-2" />

          {/* Circular Main Logo */}
          <div className="intro-logo-disc">
            <img
              src={logoMamey}
              alt="Pedidos Listo Logo"
              className="intro-main-logo-img"
            />

            {/* "LA ALITA" Dedicated Spotlight FX */}
            <div className={`alita-spotlight-overlay ${phase === 'alita_glow' || phase === 'ready' ? 'alita-active' : ''}`}>
              <div className="alita-wing-particle p1">✨</div>
              <div className="alita-wing-particle p2">⚡</div>
              <div className="alita-wing-particle p3">🪶</div>
              <div className="alita-energy-pulse" />
            </div>
          </div>
        </div>

        {/* Brand Banner Title */}
        <div className="intro-brand-details">
          <div className="intro-alita-pill-badge">
            <span className="alita-icon-flapping">🪶</span>
            <span className="alita-badge-text">CON LA ALITA DE LISTO • DELIVERY AL VUELO</span>
            <span className="alita-flag">🇩🇴</span>
          </div>

          <h1 className="intro-app-title">
            <span className="intro-title-white">PEDIDOS</span>
            <span className="intro-title-orange"> LISTO</span>
          </h1>

          <p className="intro-tagline">
            Delivery Dominicano & Sabores Únicos de Santiago
          </p>
        </div>

        {/* Progress & Launch Section */}
        <div className="intro-progress-section">
          {/* Progress Bar Container */}
          <div className="intro-progress-bar-track">
            <div
              className="intro-progress-bar-fill"
              style={{ width: `${Math.min(100, progress)}%` }}
            >
              <div className="intro-progress-spark" />
            </div>
          </div>

          {/* Dynamic Status Text */}
          <div className="intro-status-row">
            <span className="intro-status-text">{statusText}</span>
            <span className="intro-percentage">{progress}%</span>
          </div>

          {/* Big Launch Button */}
          <button
            className={`intro-launch-btn ${progress >= 100 ? 'ready-pulse' : ''}`}
            onClick={handleEnterApp}
          >
            <span className="launch-btn-icon">🚀</span>
            <span className="launch-btn-label">
              {progress >= 100 ? '¡ENTRAR A PEDIDOS LISTO!' : 'ENTRAR AL PROGRAMA'}
            </span>
            <span className="launch-btn-arrow">➔</span>
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="intro-footer-note">
        <span>© 2026 Pedidos Listo Dominicana • Sabor & Velocidad</span>
      </footer>
    </div>
  );
}
