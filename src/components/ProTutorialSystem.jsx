import React, { useState, useEffect, useRef } from 'react';

const TOUR_DONE_KEY = 'listo_pro_tour_fully_done';
const WELCOME_DONE_KEY = 'listo_pro_welcome_done';
const NAV_TOUR_DONE_KEY = 'listo_pro_nav_tour_done';

export default function ProTutorialSystem({ userRole, userData, currentPage, navigate, lang }) {
  const [mission, setMission] = useState(null);
  const [targetRect, setTargetRect] = useState(null);
  const [windowDimensions, setWindowDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });

  // Update window dimensions
  useEffect(() => {
    const handleResize = () => setWindowDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine Mission Logic
  useEffect(() => {
    if (userRole !== 'pro' || !userData) {
      setMission(null);
      return;
    }

    const tourKey = `${TOUR_DONE_KEY}_${userData.uid}`;
    const welcomeKey = `${WELCOME_DONE_KEY}_${userData.uid}`;
    const navKey = `${NAV_TOUR_DONE_KEY}_${userData.uid}`;

    if (localStorage.getItem(tourKey)) {
      setMission(null);
      return;
    }

    // Delay mission evaluation slightly to allow DOM to render
    const timer = setTimeout(() => {
      // Mission 1: Welcome
      if (!localStorage.getItem(welcomeKey)) {
        setMission({ id: 'welcome', type: 'modal', welcomeKey, tourKey, navKey });
        return;
      }

      const isProfileComplete = userData.profileComplete || userData.verificacion;
      const isPlanActive = userData.planStatus === 'active' || (userData.currentPlan && userData.currentPlan !== 'basico');

      // Mission 2: Complete Profile
      if (!isProfileComplete) {
        if (currentPage === 'home') {
          setMission({ id: 'completar-perfil', type: 'tooltip', targetSelector: '[data-tour="completar-perfil"]', text: '📝 Misión 1: ¡Los clientes no confían en fantasmas! Toca aquí para llenar tus datos básicos y subir tu cédula. Obligatorio.' });
        } else {
          setMission({ id: 'nav-home', type: 'tooltip', targetSelector: '[data-tour="nav-home"]', text: '🏠 Debemos volver a la pantalla de Inicio para la misión.' });
        }
        return;
      }

      // Mission 3: Buy Plan
      if (!isPlanActive) {
        if (currentPage === 'profile') {
          setMission({ id: 'comprar-plan', type: 'tooltip', targetSelector: '[data-tour="comprar-plan"]', text: '💎 Ya casi terminas. Para salir en el buscador y empezar a recibir trabajos, recarga tus contratos aquí.' });
        } else {
          setMission({ id: 'nav-profile', type: 'tooltip', targetSelector: '[data-tour="nav-profile"]', text: '👤 Ve a tu Perfil para activar tu plan vip.' });
        }
        return;
      }

      // Mission 4: Nav Tour
      if (!localStorage.getItem(navKey)) {
        setMission({ id: 'nav-tour-1', type: 'tooltip', targetSelector: '[data-tour="nav-orders"]', text: '📋 Aquí te caerán los trabajos para que los cotices y aceptes.', navKey, tourKey });
        return;
      }

      // Completed everything
      localStorage.setItem(tourKey, 'true');
      setMission(null);

    }, 300);

    return () => clearTimeout(timer);
  }, [userRole, userData, currentPage, windowDimensions]);

  // Element tracker using requestAnimationFrame for smooth precision
  useEffect(() => {
    if (!mission || mission.type !== 'tooltip' || !mission.targetSelector) {
      setTargetRect(null);
      return;
    }

    let aFrame;
    const trackElement = () => {
      const el = document.querySelector(mission.targetSelector);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(prev => {
          if (!prev || Math.abs(prev.top - rect.top) > 2 || Math.abs(prev.left - rect.left) > 2) {
            return { top: rect.top, left: rect.left, width: Math.max(rect.width, 10), height: Math.max(rect.height, 10) };
          }
          return prev;
        });
      } else {
        setTargetRect(null);
      }
      aFrame = requestAnimationFrame(trackElement);
    };

    aFrame = requestAnimationFrame(trackElement);
    return () => cancelAnimationFrame(aFrame);
  }, [mission]);

  if (!mission) return null;

  if (mission.type === 'modal' && mission.id === 'welcome') {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 24, padding: 30, textAlign: 'center', maxWidth: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <div style={{ fontSize: 60, marginBottom: 10 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#1a1a2e', marginBottom: 16 }}>¡Bienvenido a la Élite!</h2>
          <p style={{ fontSize: 16, color: '#444', lineHeight: 1.5, marginBottom: 24 }}>
            Felicidades por unirte a la red de profesionales de Listo Patrón. Vamos a poner tu cuenta a producir dinero juntos. Sígueme en estos rápidos pasos.
          </p>
          <button 
            onClick={() => { localStorage.setItem(mission.welcomeKey, 'true'); setMission({id: 'recalc'}); }}
            style={{ background: '#F26000', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 100, fontSize: 16, fontWeight: 800, width: '100%', cursor: 'pointer', boxShadow: '0 4px 14px rgba(242,96,0,0.4)' }}
          >
            Poner mi cuenta en rojo 🔥
          </button>
        </div>
        <style>{`@keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
      </div>
    );
  }

  if (mission.id === 'nav-tour-1' && targetRect) {
     return <TooltipOverlay rect={targetRect} text={mission.text} onNext={() => setMission({ id: 'nav-tour-2', type: 'tooltip', targetSelector: '[data-tour="nav-chat"]', text: '💬 Aquí negociarás los precios y detalles con el cliente.' })} btnText="Siguiente 👉" />;
  }
  if (mission.id === 'nav-tour-2' && targetRect) {
     return <TooltipOverlay rect={targetRect} text={mission.text} onNext={() => setMission({ id: 'nav-tour-3', type: 'tooltip', targetSelector: '[data-tour="nav-profile"]', text: '👤 Y aquí en tu Perfil configuras todo tu sistema.' })} btnText="Siguiente 👉" />;
  }
  if (mission.id === 'nav-tour-3' && targetRect) {
     return <TooltipOverlay rect={targetRect} text={mission.text} onNext={() => { localStorage.setItem(mission.navKey, 'true'); localStorage.setItem(mission.tourKey, 'true'); setMission(null); alert("¡YA ESTÁS LISTO, PATRÓN! Tu cuenta está blindada. A trabajar se ha dicho."); }} btnText="¡A trabajar! 🚀" />;
  }

  if (targetRect) {
    return <TooltipOverlay rect={targetRect} text={mission.text} hideBtn={true} />;
  }

  return null;
}

function TooltipOverlay({ rect, text, onNext, btnText, hideBtn }) {
  const isBottom = rect.top > window.innerHeight / 2;

  const tooltipStyle = {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#fff',
    padding: '16px 20px',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    width: '90%',
    maxWidth: '320px',
    zIndex: 100000,
    textAlign: 'center'
  };

  if (isBottom) {
    tooltipStyle.bottom = window.innerHeight - rect.top + 20;
  } else {
    tooltipStyle.top = rect.top + rect.height + 20;
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, pointerEvents: 'none' }}>
      <style>{`
        .pt-hand {
          position: absolute;
          width: 80px;
          height: auto;
          z-index: 100001;
          filter: drop-shadow(0 8px 12px rgba(242,96,0,0.5));
        }
        .pt-hand.pointing-up {
          animation: pointUpAnim 1s infinite alternate;
        }
        .pt-hand.pointing-down {
          transform: rotate(180deg);
          animation: pointDownAnim 1s infinite alternate;
        }
        @keyframes pointUpAnim { 0% { transform: translateY(0); } 100% { transform: translateY(15px); } }
        @keyframes pointDownAnim { 0% { transform: rotate(180deg) translateY(0); } 100% { transform: rotate(180deg) translateY(-15px); } }
        .pt-star { position: absolute; pointer-events: none; font-size: 20px; animation: starTwinkle 1.5s infinite alternate; z-index: 100001; }
        @keyframes starTwinkle { 0% { transform: scale(0.8) rotate(-10deg); opacity: 0.5; } 100% { transform: scale(1.2) rotate(10deg); opacity: 1; } }
      `}</style>
      
      <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          clipPath: `polygon(
              0% 0%, 0% 100%, ${rect.left}px 100%, 
              ${rect.left}px ${rect.top}px, 
              ${rect.left + rect.width}px ${rect.top}px, 
              ${rect.left + rect.width}px ${rect.top + rect.height}px, 
              ${rect.left}px ${rect.top + rect.height}px, 
              ${rect.left}px 100%, 100% 100%, 100% 0%
          )`,
          background: 'rgba(0,0,0,0.85)', pointerEvents: hideBtn ? 'auto' : 'none', backdropFilter: 'blur(3px)'
      }} />

      <div style={{ position: 'absolute', top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8, borderRadius: 12, border: '3px solid #F26000', animation: 'starTwinkle 1s infinite alternate', pointerEvents: 'none' }} />

      {/* Hand Switcher */}
      <img src="/assets/mano.png" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} className={`pt-hand ${isBottom ? 'pointing-down' : 'pointing-up'}`} style={{ top: isBottom ? rect.top - 90 : rect.top + rect.height + 10, left: rect.left + rect.width/2 - 40 }} />
      <div className={`pt-hand ${isBottom ? 'pointing-down' : 'pointing-up'}`} style={{ top: isBottom ? rect.top - 80 : rect.top + rect.height + 10, left: rect.left + rect.width/2 - 20, fontSize: 60, display: 'none', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}>👆</div>

      <div className="pt-star" style={{ top: isBottom ? rect.top - 120 : rect.top + rect.height + 80, left: rect.left + rect.width/2 - 60 }}>✨</div>
      <div className="pt-star" style={{ top: isBottom ? rect.top - 60 : rect.top + rect.height + 20, left: rect.left + rect.width/2 + 40, fontSize: 26 }}>⭐</div>
      <div className="pt-star" style={{ top: isBottom ? rect.top - 90 : rect.top + rect.height + 50, left: rect.left + rect.width/2 + 60, fontSize: 16 }}>✨</div>

      <div style={tooltipStyle}>
        <p style={{ margin: 0, padding: hideBtn ? '0' : '0 0 16px 0', fontSize: 14, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.4, pointerEvents: 'auto' }}>
          {text}
        </p>
        {!hideBtn && (
          <button onClick={onNext} style={{ pointerEvents: 'auto', background: '#10B981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 99, fontWeight: 800, cursor: 'pointer', width: '100%', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
             {btnText}
          </button>
        )}
      </div>
    </div>
  );
}
