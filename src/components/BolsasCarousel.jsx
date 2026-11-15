// Carrusel de la Tienda: bolsas y empaques personalizados (formato tarjeta vertical)
import React, { useEffect, useState } from 'react';

const WA = '18099090455';
const waLink = (t) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const PEDIR = waLink('¡Hola Listo Patrón! Quiero fabricar bolsas con mi logo y aprovechar el 20% de descuento en las primeras 5,000.');

const SLIDES = [
  { img: '/tienda/bolsa1.jpg', main: true },
  { img: '/tienda/bolsa2.jpg', tag: 'Bolsas de papel', t: 'Tu logo viaja en cada entrega' },
  { img: '/tienda/bolsa3.jpg', tag: 'Diseño a tu medida', t: 'Empaques que se recuerdan' },
  { img: '/tienda/bolsa4.jpg', tag: 'Con asas', t: 'Bolsas para llevar con estilo' },
  { img: '/tienda/bolsa5.jpg', tag: 'Kraft ecológico', t: 'Papel que cuida el planeta' },
  { img: '/tienda/bolsa6.jpg', tag: 'Cajas y estuches', t: 'Cajas para hot dogs, burgers y más' },
  { img: '/tienda/bolsa8.jpg', tag: 'Combos completos', t: 'Bolsa, vaso y servilleta a juego' },
];

export default function BolsasCarousel() {
  const [i, setI] = useState(0);
  const [pause, setPause] = useState(false);
  const n = SLIDES.length;
  const go = (k) => setI((k + n) % n);

  useEffect(() => {
    if (pause) return;
    const t = setTimeout(() => go(i + 1), 4500);
    return () => clearTimeout(t);
  }, [i, pause]);

  return (
    <section className="bcv" onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)} aria-label="Bolsas y empaques personalizados">
      <style>{CSS}</style>
      <div className="bcv-head">
        <span className="bcv-tag">🛍️ Fábrica de bolsas</span>
        <h2>Fabricamos<br /><em>tus bolsas</em></h2>
        <div className="bcv-offer"><b>20%</b><span>OFF<small>primeras 5,000</small></span></div>
      </div>

      <div className="bcv-stage">
        {SLIDES.map((s, k) => (
          <div key={s.img} className={`bcv-slide ${k === i ? 'on' : ''}`} aria-hidden={k !== i}>
            <img src={s.img} alt={s.t || 'Bolsas personalizadas para negocios de comida'} />
            {!s.main && (
              <div className="bcv-cap"><span>{s.tag}</span><b>{s.t}</b></div>
            )}
          </div>
        ))}
        <button className="bcv-arrow l" onClick={() => go(i - 1)} aria-label="Anterior">‹</button>
        <button className="bcv-arrow r" onClick={() => go(i + 1)} aria-label="Siguiente">›</button>
        <button className="bcv-pause" onClick={() => setPause((p) => !p)} aria-label={pause ? 'Reproducir' : 'Pausar'}>{pause ? '▶' : '❚❚'}</button>
      </div>

      <div className="bcv-dots">
        {SLIDES.map((s, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => go(k)} aria-label={`Ir a la imagen ${k + 1}`} />)}
      </div>
      <a id="bc-pedir" className="bcv-btn" href={PEDIR} target="_blank" rel="noreferrer">Haz tu pedido →</a>
    </section>
  );
}

const CSS = `
.bcv { position: relative; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 22px 18px 18px; border-radius: 22px; overflow: hidden; color: #fff; font-family: 'Outfit','Nunito Sans',system-ui,sans-serif;
  background: radial-gradient(circle at 85% 10%, #ffb066 0%, transparent 45%), linear-gradient(160deg, #FF7A1F 0%, #FF6000 55%, #e85400 100%); box-shadow: 0 14px 34px rgba(255,96,0,.28); }
.bcv-head { position: relative; }
.bcv-tag { display: inline-block; background: rgba(255,255,255,.2); border: 1px solid rgba(255,255,255,.5); padding: 4px 11px; border-radius: 99px; font-weight: 800; font-size: 12px; margin-bottom: 8px; }
.bcv h2 { margin: 0; font-size: 34px; line-height: .98; font-weight: 900; letter-spacing: -.02em; color: #fff; text-transform: uppercase; }
.bcv h2 em { font-style: normal; color: #fff3e6; }
.bcv-offer { position: absolute; top: 0; right: 0; display: flex; align-items: center; gap: 6px; background: #fff; color: #FF6000; border-radius: 16px; padding: 6px 10px; box-shadow: 0 10px 24px rgba(0,0,0,.2); animation: bcvPulse 2.2s ease-in-out infinite; }
.bcv-offer b { font-size: 28px; font-weight: 900; line-height: 1; }
.bcv-offer span { font-weight: 900; font-size: 14px; line-height: 1; display: flex; flex-direction: column; }
.bcv-offer small { font-weight: 700; font-size: 10px; color: #1d1d1f; margin-top: 2px; }
.bcv-stage { position: relative; flex: 1; min-height: 0; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 10px 26px rgba(0,0,0,.18); }
.bcv-slide { position: absolute; inset: 0; opacity: 0; transition: opacity .7s ease; }
.bcv-slide.on { opacity: 1; }
.bcv-slide img { width: 100%; height: 100%; object-fit: cover; display: block; transform: scale(1.06); transition: transform 5s ease; }
.bcv-slide.on img { transform: scale(1); }
.bcv-cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 40px 14px 14px; background: linear-gradient(transparent, rgba(0,0,0,.75)); display: flex; flex-direction: column; gap: 2px; }
.bcv-cap span { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #ffcf9f; }
.bcv-cap b { font-size: 17px; font-weight: 900; line-height: 1.15; }
.bcv-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; border: 0; background: rgba(255,255,255,.92); color: #FF6000; font-size: 24px; line-height: 1; cursor: pointer; opacity: 0; transition: opacity .2s, transform .15s; box-shadow: 0 6px 14px rgba(0,0,0,.2); }
.bcv:hover .bcv-arrow { opacity: 1; }
.bcv-arrow:hover { transform: translateY(-50%) scale(1.1); }
.bcv-arrow.l { left: 8px; } .bcv-arrow.r { right: 8px; }
.bcv-pause { position: absolute; left: 10px; bottom: 10px; width: 30px; height: 30px; border-radius: 50%; border: 0; background: rgba(0,0,0,.6); color: #fff; font-size: 10px; cursor: pointer; z-index: 2; }
.bcv-dots { display: flex; justify-content: center; gap: 6px; }
.bcv-dots button { width: 8px; height: 8px; border-radius: 99px; border: 0; background: rgba(255,255,255,.55); cursor: pointer; transition: all .3s; padding: 0; }
.bcv-dots button.on { width: 26px; background: #fff; }
.bcv-btn { display: block; text-align: center; background: #fff; color: #FF6000 !important; font-weight: 900; padding: 12px; border-radius: 99px; text-decoration: none; font-size: 15px; transition: transform .15s, box-shadow .2s; }
.bcv-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(0,0,0,.25); }
@keyframes bcvPulse { 50% { transform: scale(1.05); } }
`;
