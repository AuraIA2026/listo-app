// Fila de tarjetas verticales de la Tienda (estilo Amazon)
import React, { useEffect, useRef, useState } from 'react';
import BolsasCarousel from './BolsasCarousel';

// Tarjeta vertical con cuadrícula 2x2 de productos que rota por páginas
function ProductGridCard({ title, kicker, items, bg, accent, onPick }) {
  const pages = [];
  for (let k = 0; k < items.length; k += 4) pages.push(items.slice(k, k + 4));
  const [p, setP] = useState(0);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause || pages.length < 2) return;
    const t = setTimeout(() => setP((p + 1) % pages.length), 5000);
    return () => clearTimeout(t);
  }, [p, pause, pages.length]);

  return (
    <section className="sr-card" style={{ background: bg }} onMouseEnter={() => setPause(true)} onMouseLeave={() => setPause(false)}>
      {kicker && <span className="sr-kick">{kicker}</span>}
      <h3 className="sr-title">{title}</h3>
      <div className="sr-pages">
        {pages.map((pg, k) => (
          <div key={k} className={`sr-grid ${k === p ? 'on' : ''}`} aria-hidden={k !== p}>
            {pg.map((it) => (
              <button key={it.id} className="sr-item" onClick={() => onPick && onPick(it)} title={it.name}>
                <img src={it.image} alt={it.name} loading="lazy" />
                <span className="sr-price" style={{ background: accent }}>RD$ {it.price.toLocaleString()}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
      {pages.length > 1 && (
        <div className="sr-dots">
          {pages.map((_, k) => <button key={k} className={k === p ? 'on' : ''} onClick={() => setP(k)} aria-label={`Página ${k + 1}`} />)}
        </div>
      )}
    </section>
  );
}

export default function ShopCarouselRow({ products = [], onPick }) {
  const ref = useRef(null);
  const by = (c) => products.filter((x) => x.category === c);
  const ropa = [
    { id: 'r1', name: 'Camisa de trabajo reflectante', price: 1250, image: '/tienda/ropa_camisa.png', category: 'ropa' },
    { id: 'r2', name: 'Botas de seguridad punta de acero', price: 3450, image: '/tienda/ropa_botas.png', category: 'ropa' },
    { id: 'r3', name: 'Overol de mecánico con reflectivos', price: 2290, image: '/tienda/ropa_overol.png', category: 'ropa' },
    { id: 'r4', name: 'Guantes de trabajo antideslizantes', price: 450, image: '/tienda/ropa_guantes.png', category: 'ropa' },
  ];
  const cards = [
    { title: 'Ropa de trabajo', kicker: 'Uniformes para tu equipo', items: ropa, bg: 'linear-gradient(165deg,#ff8a2b,#d94f00)', accent: '#1d1d1f' },
    { title: 'Pantalones de trabajo', kicker: 'Resistentes y cómodos', items: by('pantalones'), bg: 'linear-gradient(165deg,#3a2a1e,#1f1712)', accent: '#FF6000' },
    { title: 'Trajes y protección', kicker: 'Seguridad certificada', items: by('proteccion'), bg: 'linear-gradient(165deg,#24543b,#163626)', accent: '#2fb36b' },
    { title: 'Equipos de seguridad', kicker: 'Esenciales del patrón', items: by('seguridad'), bg: 'linear-gradient(165deg,#1f3b73,#14264b)', accent: '#3b82f6' },
  ].filter((c) => c.items.length);

  const scroll = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <div className="sr-wrap">
      <style>{CSS}</style>
      <button className="sr-nav l" onClick={() => scroll(-1)} aria-label="Ver anteriores">‹</button>
      <div className="sr-row" ref={ref}>
        <div className="sr-slot"><BolsasCarousel /></div>
        {cards.map((c) => <div className="sr-slot" key={c.title}><ProductGridCard {...c} onPick={onPick} /></div>)}
      </div>
      <button className="sr-nav r" onClick={() => scroll(1)} aria-label="Ver siguientes">›</button>
    </div>
  );
}

const CSS = `
.sr-wrap { position: relative; margin-top: 72px; padding: 20px 0 10px; background: linear-gradient(#fff4ea, #fff); font-family: 'Outfit','Nunito Sans',system-ui,sans-serif; }
.sr-row { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 6px 24px 18px; scrollbar-width: none; }
.sr-row::-webkit-scrollbar { display: none; }
.sr-slot { flex: 0 0 clamp(270px, 24vw, 320px); height: 520px; scroll-snap-align: start; }
.sr-card { height: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; padding: 22px 16px 16px; border-radius: 22px; color: #fff; box-shadow: 0 14px 30px rgba(0,0,0,.18); transition: transform .25s; }
.sr-slot:hover .sr-card, .sr-slot:hover .bcv { transform: translateY(-4px); }
.bcv { transition: transform .25s; }
.sr-kick { font-size: 13px; font-weight: 700; opacity: .85; }
.sr-title { margin: 0; font-size: 28px; line-height: 1.05; font-weight: 900; color: #fff; }
.sr-pages { position: relative; flex: 1; min-height: 0; }
.sr-grid { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px; opacity: 0; transform: translateX(16px); transition: opacity .6s, transform .6s; pointer-events: none; }
.sr-grid.on { opacity: 1; transform: none; pointer-events: auto; }
.sr-item { position: relative; border: 0; padding: 8px; border-radius: 14px; background: #fff; cursor: pointer; overflow: hidden; transition: transform .2s, box-shadow .2s; }
.sr-item:hover { transform: scale(1.04); box-shadow: 0 10px 20px rgba(0,0,0,.25); }
.sr-item img { width: 100%; height: 100%; object-fit: contain; display: block; }
.sr-price { position: absolute; left: 6px; bottom: 6px; color: #fff; font-size: 11px; font-weight: 900; padding: 3px 7px; border-radius: 8px; }
.sr-dots { display: flex; justify-content: center; gap: 6px; }
.sr-dots button { width: 8px; height: 8px; border-radius: 99px; border: 0; background: rgba(255,255,255,.45); cursor: pointer; padding: 0; transition: all .3s; }
.sr-dots button.on { width: 26px; background: #fff; }
.sr-nav { position: absolute; top: 50%; z-index: 5; transform: translateY(-50%); width: 46px; height: 90px; border: 1px solid #e5e5e5; border-radius: 10px; background: rgba(255,255,255,.95); color: #1d1d1f; font-size: 34px; cursor: pointer; box-shadow: 0 6px 18px rgba(0,0,0,.15); transition: background .2s; }
.sr-nav:hover { background: #fff; color: #FF6000; }
.sr-nav.l { left: 6px; } .sr-nav.r { right: 6px; }
@media (max-width: 760px) {
  .sr-nav { display: none; }
  .sr-slot { flex-basis: 82vw; height: 500px; }
  .sr-row { padding: 6px 16px 16px; }
}
`;
