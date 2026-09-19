import React, { useState, useEffect, useRef } from 'react';

const PRIZES = [
  { id: 1, label: '+1%', percent: 1, color: '#374151', icon: '🌱' },
  { id: 2, label: '+5%', percent: 5, color: '#2563EB', icon: '🔹' },
  { id: 3, label: '+10%', percent: 10, color: '#FF4500', icon: '⚡' },
  { id: 4, label: '+15%', percent: 15, color: '#7C3AED', icon: '🔮' },
  { id: 5, label: '+20%', percent: 20, color: '#FF8C00', icon: '🎁' },
  { id: 6, label: '+30%', percent: 30, color: '#E11D48', icon: '💎' },
  { id: 7, label: '+50%', percent: 50, color: '#16A34A', icon: '🔥' },
  { id: 8, label: '+75%', percent: 75, color: '#D97706', icon: '🏆' },
  { id: 9, label: '100% GRATIS', percent: 100, isJackpot: true, color: '#DC2626', icon: '👑' },
  { id: 10, label: '+5%', percent: 5, color: '#0284C7', icon: '🌟' }
];

// Synth click sound generation using Web Audio API
const playTickSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.03);
    gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {}
};

const playFanfareSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [261.63, 329.63, 392.00, 523.25].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * 0.1);
      osc.stop(audioCtx.currentTime + i * 0.1 + 0.45);
    });
  } catch (e) {}
};

export default function LuckyWheelModal({ 
  isOpen, 
  onClose, 
  lang = 'es', 
  wheelProgress = 0, 
  completedContracts = 0,
  onClaimReward 
}) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);
  const [animatedProgress, setAnimatedProgress] = useState(wheelProgress);
  const [pointerBounce, setPointerBounce] = useState(false);
  const tickTimerRef = useRef(null);

  useEffect(() => {
    setAnimatedProgress(wheelProgress);
  }, [wheelProgress]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning || wonPrize) return;
    setSpinning(true);

    // TRUQUIAR LA RULETA SMARTLY:
    // 1. Si el profesional tiene contratos completados múltiples de 10 -> Cae en Jackpot (100% GRATIS)
    // 2. De lo contrario, selección ponderada emocionante (+1%, +5%, +10%, +20%, +30%, +50%, +75%)
    let prizeIndex;
    if (completedContracts > 0 && completedContracts % 10 === 0) {
      prizeIndex = 8; // Index of '100% GRATIS'
    } else {
      // Ponderación truqueada: favorece +10%, +20%, +30%, +50%, con opción a +1% y +5%
      const weights = [
        { index: 0, weight: 10 }, // +1%
        { index: 1, weight: 15 }, // +5%
        { index: 2, weight: 25 }, // +10%
        { index: 3, weight: 15 }, // +15%
        { index: 4, weight: 15 }, // +20%
        { index: 5, weight: 10 }, // +30%
        { index: 6, weight: 6 },  // +50%
        { index: 7, weight: 3 },  // +75%
        { index: 9, weight: 10 }  // +5% (segundo)
      ];
      
      const totalWeight = weights.reduce((acc, w) => acc + w.weight, 0);
      let randomNum = Math.random() * totalWeight;
      for (const w of weights) {
        if (randomNum < w.weight) {
          prizeIndex = w.index;
          break;
        }
        randomNum -= w.weight;
      }
      if (typeof prizeIndex === 'undefined') prizeIndex = 2; // Fallback +10%
    }

    const numSegments = PRIZES.length;
    const segmentAngle = 360 / numSegments;
    const extraTurns = 6 * 360; // 6 giros completos
    const targetAngle = extraTurns + (numSegments - prizeIndex) * segmentAngle - segmentAngle / 2;

    setRotation(targetAngle);

    // Sonidos de clicks durante el giro
    let clickCount = 0;
    const totalClicks = 35;
    const intervalTime = 4000 / totalClicks;

    const playTicks = () => {
      if (clickCount < totalClicks) {
        playTickSound();
        setPointerBounce(prev => !prev);
        clickCount++;
        const nextInterval = intervalTime * (1 + (clickCount / totalClicks) * 1.8);
        tickTimerRef.current = setTimeout(playTicks, nextInterval);
      }
    };
    playTicks();

    setTimeout(() => {
      setSpinning(false);
      clearTimeout(tickTimerRef.current);
      const prize = PRIZES[prizeIndex];
      setWonPrize(prize);

      playFanfareSound();

      // Animar el progreso
      const newTotal = animatedProgress + prize.percent;
      setAnimatedProgress(newTotal >= 100 ? 100 : newTotal);
    }, 4400);
  };

  const isContractWon = wonPrize && (wonPrize.isJackpot || (wheelProgress + wonPrize.percent) >= 100);

  // Generar posiciones de luces LED alrededor de la ruleta
  const ledBulbs = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i * 360) / 16;
    const rad = (angle * Math.PI) / 180;
    const r = 126; // Radio del círculo de luces
    const x = 135 + r * Math.cos(rad);
    const y = 135 + r * Math.sin(rad);
    return { x, y, delay: i * 0.1 };
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      animation: 'wheelModalFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style>{`
        @keyframes wheelModalFadeIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes popVictory {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes progressGlow {
          0% { box-shadow: 0 0 8px rgba(34,197,94,0.4); }
          100% { box-shadow: 0 0 20px rgba(255,215,0,0.9); }
        }
        @keyframes ledBlinkOdd {
          0%, 100% { background: #FFD700; box-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700; }
          50% { background: #374151; box-shadow: none; }
        }
        @keyframes ledBlinkEven {
          0%, 100% { background: #374151; box-shadow: none; }
          50% { background: #FF4500; box-shadow: 0 0 10px #FF4500, 0 0 20px #FF4500; }
        }
        @keyframes pointerTick {
          0% { transform: translateX(-50%) rotate(0deg); }
          50% { transform: translateX(-50%) rotate(-18deg); }
          100% { transform: translateX(-50%) rotate(0deg); }
        }
      `}</style>

      <div style={{
        width: '100%', maxWidth: '400px', background: 'linear-gradient(160deg, #111827 0%, #1E1B4B 60%, #0F172A 100%)',
        borderRadius: '32px', border: '2px solid #F26000',
        boxShadow: '0 24px 60px rgba(242,96,0,0.45), 0 0 40px rgba(0,0,0,0.9)',
        padding: '24px 20px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>

        {/* Botón cerrar */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
            fontSize: '16px', fontWeight: 'bold', zIndex: 10,
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        >
          ✕
        </button>

        {!wonPrize ? (
          <>
            {/* Header del Modal */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#1A1A2E', padding: '5px 14px', borderRadius: '20px',
                fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px',
                boxShadow: '0 2px 10px rgba(255, 215, 0, 0.4)'
              }}>
                🎰 RULETA VIP LISTO PATRÓN
              </span>
              <h2 style={{ color: '#FFFFFF', margin: '8px 0 4px', fontSize: '20px', fontWeight: '900', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                {lang === 'es' ? '¡Gira y Completa tu Contrato!' : 'Spin & Win Your Free Contract!'}
              </h2>
              <p style={{ color: '#93C5FD', fontSize: '12px', margin: 0, fontWeight: '600' }}>
                {lang === 'es' ? 'Acumula desde +1% hasta 100% GRATIS' : 'Accumulate from +1% up to 100% FREE'}
              </p>
            </div>

            {/* BARRA DE PROGRESO CON GRADIENTE Y BRILLO */}
            <div style={{
              background: 'rgba(255,255,255,0.06)', borderRadius: '18px', padding: '12px 14px',
              border: '1px solid rgba(255,255,255,0.15)', marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '900', color: '#FFD700', marginBottom: '6px' }}>
                <span>📊 ACUMULADO PARA 1 CONTRATO</span>
                <span style={{ fontSize: '12px', color: '#FFFFFF', textShadow: '0 0 8px #FFD700' }}>{animatedProgress}% / 100%</span>
              </div>
              <div style={{ width: '100%', height: '16px', background: 'rgba(0,0,0,0.6)', borderRadius: '10px', overflow: 'hidden', padding: '2px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{
                  width: `${Math.min(animatedProgress, 100)}%`, height: '100%',
                  background: 'linear-gradient(90deg, #22C55E 0%, #10B981 50%, #FFD700 100%)',
                  borderRadius: '8px', transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  animation: 'progressGlow 1.5s infinite alternate'
                }} />
              </div>
              {completedContracts > 0 && (
                <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#6EE7B7', fontWeight: '700' }}>
                  🎯 Contratos completados: {completedContracts} (Premio asegurado cada 10)
                </p>
              )}
            </div>

            {/* CONTENEDOR RULETA CASINO CON LUCES LED */}
            <div style={{ position: 'relative', width: '270px', height: '270px', margin: '0 auto 16px' }}>
              
              {/* Luces LED perimetrales */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
                {ledBulbs.map((led, i) => (
                  <circle
                    key={i}
                    cx={led.x}
                    cy={led.y}
                    r="4"
                    fill={i % 2 === 0 ? '#FFD700' : '#FF4500'}
                    style={{
                      animation: `${i % 2 === 0 ? 'ledBlinkOdd' : 'ledBlinkEven'} ${spinning ? '0.25s' : '1.2s'} infinite`
                    }}
                  />
                ))}
              </svg>

              {/* Puntero Indicador Superior Con Animación de Rebote */}
              <div style={{
                position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)',
                width: '0', height: '0',
                borderLeft: '14px solid transparent', borderRight: '14px solid transparent',
                borderTop: '26px solid #FFD700', zIndex: 25,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))',
                animation: pointerBounce ? 'pointerTick 0.1s ease' : 'none'
              }} />

              {/* Rueda SVG Con Bisel Dorado Casino */}
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                overflow: 'hidden', border: '7px solid #FF7A1A',
                boxShadow: '0 0 30px rgba(242,96,0,0.7), inset 0 0 20px rgba(0,0,0,0.8)',
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4.4s cubic-bezier(0.12, 0.95, 0.15, 1)' : 'none'
              }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  {PRIZES.map((prize, idx) => {
                    const angle = 360 / PRIZES.length;
                    const startAngle = idx * angle;
                    const endAngle = (idx + 1) * angle;

                    const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                    const midAngle = startAngle + angle / 2;
                    const textX = 50 + 33 * Math.cos((Math.PI * midAngle) / 180);
                    const textY = 50 + 33 * Math.sin((Math.PI * midAngle) / 180);

                    return (
                      <g key={prize.id}>
                        <path d={pathData} fill={prize.color} stroke="#111827" strokeWidth="0.8" />
                        <text
                          x={textX}
                          y={textY}
                          fill="#FFFFFF"
                          fontSize="3.2"
                          fontWeight="900"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                        >
                          {prize.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Botón Central Pulsante de la Rueda */}
              <div 
                onClick={handleSpin}
                style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF7A1A 100%)',
                  border: '4px solid #FFFFFF', boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: spinning ? 'default' : 'pointer', zIndex: 20
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#1A1A2E', letterSpacing: '0.5px' }}>
                  {spinning ? '🎰' : 'GIRAR'}
                </span>
              </div>
            </div>

            {/* Botón Acción Principal */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              style={{
                width: '100%', padding: '15px', borderRadius: '18px', border: 'none',
                background: 'linear-gradient(135deg, #FF7A1A, #F26000, #C24D00)', color: 'white',
                fontSize: '15px', fontWeight: '900', cursor: spinning ? 'default' : 'pointer',
                boxShadow: '0 8px 24px rgba(242,96,0,0.45)', opacity: spinning ? 0.7 : 1,
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {spinning ? '🎰 Girando Rueda...' : '🎰 ¡GIRAR RULETA LISTO PATRÓN!'}
            </button>
          </>
        ) : (
          /* Pantalla Ganador de Premio Con Celebración */
          <div style={{ animation: 'popVictory 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards', padding: '10px 0' }}>
            <span style={{ fontSize: '58px', display: 'block', marginBottom: '8px', filter: 'drop-shadow(0 4px 10px rgba(255,215,0,0.5))' }}>
              {isContractWon ? '👑' : wonPrize.icon}
            </span>
            <span style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1A1A2E', padding: '5px 14px',
              borderRadius: '20px', fontSize: '11px', fontWeight: '900', boxShadow: '0 2px 8px rgba(255,215,0,0.4)'
            }}>
              {isContractWon ? '¡CONTRATO 100% GANADO!' : '¡NUEVO PORCENTAJE SUMADO!'}
            </span>
            
            <h2 style={{ color: '#FFFFFF', margin: '12px 0 4px', fontSize: '22px', fontWeight: '900', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {isContractWon 
                ? '¡Felicidades! Ganaste 1 Contrato Gratis' 
                : `¡Sumaste ${wonPrize.label} a tu Barra!`}
            </h2>

            <p style={{ color: '#E2E8F0', fontSize: '13px', margin: '0 0 16px', fontWeight: '600' }}>
              {isContractWon 
                ? 'Se ha añadido 1 contrato gratis a tu cuenta de Listo Patrón.' 
                : `Tu progreso total acumulado ahora es de ${Math.min(wheelProgress + wonPrize.percent, 100)}%`}
            </p>

            {/* Barra Visual de Resultados */}
            <div style={{
              background: 'rgba(255,255,255,0.08)', border: '2px dashed #FFD700',
              borderRadius: '18px', padding: '14px', marginBottom: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}>
              <p style={{ margin: 0, color: '#93C5FD', fontSize: '11px', fontWeight: '800' }}>NUEVO PROGRESO ACUMULADO</p>
              <p style={{ margin: '4px 0 0', color: '#FFD700', fontSize: '26px', fontWeight: '900', letterSpacing: '1px', textShadow: '0 0 10px rgba(255,215,0,0.6)' }}>
                {Math.min(wheelProgress + wonPrize.percent, 100)}% / 100%
              </p>
            </div>

            <button
              onClick={() => {
                const totalPercent = wheelProgress + wonPrize.percent;
                const earnedContract = wonPrize.isJackpot || totalPercent >= 100;
                const remainingProgress = totalPercent >= 100 ? (totalPercent - 100) : totalPercent;
                
                if (onClaimReward) {
                  onClaimReward(wonPrize, remainingProgress, earnedContract);
                }
                onClose();
              }}
              style={{
                width: '100%', padding: '16px', borderRadius: '18px', border: 'none',
                background: 'linear-gradient(135deg, #22C55E, #16A34A, #15803D)', color: 'white',
                fontSize: '16px', fontWeight: '900', cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(34,197,94,0.45)',
                transition: 'transform 0.2s'
              }}
            >
              🚀 ¡RECLAMAR Y CONTINUAR!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

