import React, { useEffect, useState } from 'react';

// 🎬 Intro "Bienvenidos a Pedidos Listo" al entrar a Comercio Partner
export default function WelcomeIntro({ open, onDone, duration = 3000 }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLeaving(false);
    const t1 = setTimeout(() => setLeaving(true), duration - 450);
    const t2 = setTimeout(() => onDone && onDone(), duration);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [open]);

  if (!open) return null;

  const skip = () => { setLeaving(true); setTimeout(() => onDone && onDone(), 300); };

  return (
    <div id="pl-welcome-intro" onClick={skip}
      style={{
        position: 'fixed', inset: 0, zIndex: 100002, cursor: 'pointer', overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 38%, #2a1405 0%, #0a0e1a 55%, #05070d 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22,
        opacity: leaving ? 0 : 1, transition: 'opacity .45s ease', fontFamily: 'inherit'
      }}>
      <style>{`
        @keyframes plPop { 0%{transform:scale(.2) rotate(-25deg);opacity:0} 60%{transform:scale(1.12) rotate(4deg);opacity:1} 100%{transform:scale(1) rotate(0)} }
        @keyframes plRing { 0%{transform:scale(.8);opacity:.7} 100%{transform:scale(2.1);opacity:0} }
        @keyframes plUp { 0%{transform:translateY(26px);opacity:0} 100%{transform:translateY(0);opacity:1} }
        @keyframes plBar { 0%{width:0} 100%{width:100%} }
        @keyframes plGlow { 0%,100%{filter:drop-shadow(0 0 18px rgba(255,107,0,.55))} 50%{filter:drop-shadow(0 0 38px rgba(255,107,0,.95))} }
        @keyframes plSpark { 0%{transform:translateY(0) scale(1);opacity:.9} 100%{transform:translateY(-120px) scale(.3);opacity:0} }
      `}</style>

      {/* chispas mamey */}
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} style={{
          position: 'absolute', bottom: `${10 + (i * 37) % 50}%`, left: `${(i * 53) % 100}%`,
          width: 6, height: 6, borderRadius: '50%', background: i % 2 ? '#ff6b00' : '#ffb27a',
          animation: `plSpark ${1.6 + (i % 5) * 0.3}s ${(i % 7) * 0.2}s ease-out infinite`
        }} />
      ))}

      {/* logo círculo */}
      <div style={{ position: 'relative', width: 170, height: 170 }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #ff6b00', animation: 'plRing 1.6s .5s ease-out infinite' }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid #ff6b00', animation: 'plRing 1.6s 1.1s ease-out infinite' }} />
        <img src="/brand/listo-circulo.png" alt="Listo"
          style={{ width: 170, height: 170, borderRadius: '50%', display: 'block', animation: 'plPop .8s cubic-bezier(.2,1.4,.4,1) both, plGlow 2s 1s ease-in-out infinite' }} />
      </div>

      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <div style={{ color: '#cbd5e1', fontWeight: 800, fontSize: 15, letterSpacing: 3, textTransform: 'uppercase', animation: 'plUp .6s .7s both' }}>Bienvenidos a</div>
        <img src="/brand/logo-texto-blanco.png" alt="Pedidos Listo"
          style={{ width: 'min(78vw, 360px)', height: 'auto', display: 'block', margin: '10px auto 0', animation: 'plUp .7s .95s both' }} />
        <div style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, marginTop: 14, animation: 'plUp .6s 1.25s both' }}>
          Tu comercio, tus pedidos y tus deliverys en un solo lugar
        </div>
      </div>

      <div style={{ width: 'min(60vw, 240px)', height: 4, borderRadius: 4, background: 'rgba(255,255,255,.1)', overflow: 'hidden', animation: 'plUp .5s 1.4s both' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#ff6b00,#ffb27a)', animation: `plBar ${(duration - 1500) / 1000}s 1.4s linear both` }} />
      </div>
      <div style={{ position: 'absolute', bottom: 24, color: '#475569', fontSize: 11, fontWeight: 700 }}>Toca para continuar</div>
    </div>
  );
}
