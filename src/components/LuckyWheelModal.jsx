import React, { useState, useEffect } from 'react';

const PRIZES = [
  { id: 1, label: '+10%', percent: 10, color: '#FF4500', icon: '⚡' },
  { id: 2, label: '+20%', percent: 20, color: '#FF8C00', icon: '🎁' },
  { id: 3, label: '+30%', percent: 30, color: '#E11D48', icon: '💎' },
  { id: 4, label: '+40%', percent: 40, color: '#2563EB', icon: '🚀' },
  { id: 5, label: '+50%', percent: 50, color: '#16A34A', icon: '🔥' },
  { id: 6, label: '+60%', percent: 60, color: '#9333EA', icon: '🏆' },
  { id: 7, label: '+80%', percent: 80, color: '#D97706', icon: '🌟' },
  { id: 8, label: '100% GRATIS', percent: 100, isJackpot: true, color: '#DC2626', icon: '👑' }
];

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

  useEffect(() => {
    setAnimatedProgress(wheelProgress);
  }, [wheelProgress]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning || wonPrize) return;
    setSpinning(true);

    // TRUQUIAR LA RULETA:
    // Si el profesional ha completado 10 contratos (o múltiplo de 10), SE TRUQUEA para caer en el 100% GRATIS (índice 7)
    let prizeIndex;
    if (completedContracts > 0 && completedContracts % 10 === 0) {
      prizeIndex = 7; // Index of '100% GRATIS'
    } else {
      // En giros normales, elige con alta probabilidad de dar buenos porcentajes (20%, 30%, 40%, 50%, 60%)
      const normalIndices = [1, 2, 3, 4, 5, 6];
      prizeIndex = normalIndices[Math.floor(Math.random() * normalIndices.length)];
    }

    const segmentAngle = 360 / PRIZES.length;
    const extraTurns = 5 * 360;
    const targetAngle = extraTurns + (PRIZES.length - prizeIndex) * segmentAngle - segmentAngle / 2;

    setRotation(targetAngle);

    setTimeout(() => {
      setSpinning(false);
      const prize = PRIZES[prizeIndex];
      setWonPrize(prize);

      // Animar el progreso
      const newTotal = animatedProgress + prize.percent;
      setAnimatedProgress(newTotal >= 100 ? 100 : newTotal);
    }, 4200);
  };

  const isContractWon = wonPrize && (wonPrize.isJackpot || (wheelProgress + wonPrize.percent) >= 100);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      animation: 'fadeIn 0.3s ease'
    }}>
      <style>{`
        @keyframes popVictory {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes progressGlow {
          0% { box-shadow: 0 0 8px rgba(34,197,94,0.4); }
          100% { box-shadow: 0 0 16px rgba(34,197,94,0.8); }
        }
      `}</style>

      <div style={{
        width: '100%', maxWidth: '390px', background: 'linear-gradient(160deg, #1A1A2E 0%, #16213E 100%)',
        borderRadius: '28px', border: '2px solid #FF7A1A',
        boxShadow: '0 20px 50px rgba(242,96,0,0.4), 0 0 30px rgba(0,0,0,0.8)',
        padding: '24px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>

        {/* Botón cerrar */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
            borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
            fontSize: '16px', fontWeight: 'bold', zIndex: 10
          }}
        >
          ✕
        </button>

        {!wonPrize ? (
          <>
            {/* Header del Modal */}
            <div style={{ marginBottom: '14px' }}>
              <span style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#1A1A2E', padding: '4px 12px', borderRadius: '20px',
                fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px'
              }}>
                🎰 RULETA DE LA SUERTE LISTO PATRÓN
              </span>
              <h2 style={{ color: '#FFFFFF', margin: '8px 0 4px', fontSize: '19px', fontWeight: '900' }}>
                {lang === 'es' ? '¡Gira y Llena tu Barra al 100%!' : 'Spin & Fill Your Bar to 100%!'}
              </h2>
              <p style={{ color: '#B3D7FF', fontSize: '12px', margin: 0, fontWeight: '600' }}>
                {lang === 'es' ? 'Al llegar al 100% ganas 1 Contrato 100% GRATIS' : 'At 100% you win 1 FREE Contract'}
              </p>
            </div>

            {/* BARRA DE PROGRESO */}
            <div style={{
              background: 'rgba(255,255,255,0.08)', borderRadius: '16px', padding: '10px 14px',
              border: '1px solid rgba(255,255,255,0.15)', marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#FFD700', marginBottom: '6px' }}>
                <span>📊 PROGRESO PARA 1 CONTRATO</span>
                <span>{animatedProgress}% / 100%</span>
              </div>
              <div style={{ width: '100%', height: '14px', background: 'rgba(0,0,0,0.5)', borderRadius: '10px', overflow: 'hidden', padding: '2px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <div style={{
                  width: `${Math.min(animatedProgress, 100)}%`, height: '100%',
                  background: 'linear-gradient(90deg, #22C55E, #10B981, #FFD700)',
                  borderRadius: '8px', transition: 'width 0.8s ease-in-out',
                  animation: 'progressGlow 1.5s infinite alternate'
                }} />
              </div>
              {completedContracts > 0 && (
                <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#6EE7B7', fontWeight: '700' }}>
                  🎯 Contratos completados: {completedContracts} (Truco cada 10 contratos)
                </p>
              )}
            </div>

            {/* Contenedor de Ruleta Giratoria */}
            <div style={{ position: 'relative', width: '240px', height: '240px', margin: '0 auto 16px' }}>
              
              {/* Puntero Indicador Superior */}
              <div style={{
                position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                width: '0', height: '0',
                borderLeft: '14px solid transparent', borderRight: '14px solid transparent',
                borderTop: '24px solid #FFD700', zIndex: 20,
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))'
              }} />

              {/* Rueda SVG */}
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                overflow: 'hidden', border: '6px solid #FF7A1A',
                boxShadow: '0 0 24px rgba(242,96,0,0.6)',
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none'
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
                    const textX = 50 + 32 * Math.cos((Math.PI * midAngle) / 180);
                    const textY = 50 + 32 * Math.sin((Math.PI * midAngle) / 180);

                    return (
                      <g key={prize.id}>
                        <path d={pathData} fill={prize.color} stroke="#1A1A2E" strokeWidth="0.8" />
                        <text
                          x={textX}
                          y={textY}
                          fill="#FFFFFF"
                          fontSize="3.5"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                        >
                          {prize.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Botón Central de la Rueda */}
              <div 
                onClick={handleSpin}
                style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '60px', height: '60px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  border: '4px solid #FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: spinning ? 'default' : 'pointer', zIndex: 15
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: '900', color: '#1A1A2E' }}>
                  {spinning ? '⏳' : 'GIRAR'}
                </span>
              </div>
            </div>

            {/* Botón Acción Principal */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              style={{
                width: '100%', padding: '14px', borderRadius: '16px', border: 'none',
                background: 'linear-gradient(135deg, #FF7A1A, #F26000)', color: 'white',
                fontSize: '15px', fontWeight: '900', cursor: spinning ? 'default' : 'pointer',
                boxShadow: '0 8px 20px rgba(242,96,0,0.4)', opacity: spinning ? 0.7 : 1
              }}
            >
              {spinning ? '🎰 Girando Rueda...' : '🎰 ¡GIRAR RULETA LISTO PATRÓN!'}
            </button>
          </>
        ) : (
          /* Pantalla Ganador de Premio */
          <div style={{ animation: 'popVictory 0.5s ease-out forwards', padding: '10px 0' }}>
            <span style={{ fontSize: '54px', display: 'block', marginBottom: '8px' }}>
              {isContractWon ? '👑' : '🎉'}
            </span>
            <span style={{
              background: '#FFD700', color: '#1A1A2E', padding: '4px 12px',
              borderRadius: '20px', fontSize: '11px', fontWeight: '900'
            }}>
              {isContractWon ? '¡CONTRATO GANADO!' : '¡PORCENTAJE GANADO!'}
            </span>
            
            <h2 style={{ color: '#FFFFFF', margin: '10px 0 4px', fontSize: '22px', fontWeight: '900' }}>
              {isContractWon 
                ? '¡Felicidades! Ganaste 1 Contrato Gratis' 
                : `¡Sumaste ${wonPrize.label} a tu Barra!`}
            </h2>

            <p style={{ color: '#E2E8F0', fontSize: '13px', margin: '0 0 16px', fontWeight: '600' }}>
              {isContractWon 
                ? 'Se ha añadido 1 contrato gratis a tu cuenta de Listo Patrón.' 
                : `Tu progreso total ahora es de ${Math.min(wheelProgress + wonPrize.percent, 100)}%`}
            </p>

            {/* Barra Visual de Resultados */}
            <div style={{
              background: 'rgba(255,255,255,0.1)', border: '2px dashed #FFD700',
              borderRadius: '16px', padding: '14px', marginBottom: '20px'
            }}>
              <p style={{ margin: 0, color: '#B3D7FF', fontSize: '11px', fontWeight: '800' }}>NUEVO PROGRESO ACUMULADO</p>
              <p style={{ margin: '4px 0 0', color: '#FFD700', fontSize: '24px', fontWeight: '900', letterSpacing: '1px' }}>
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
                width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
                background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: 'white',
                fontSize: '16px', fontWeight: '900', cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(34,197,94,0.4)'
              }}
            >
              🚀 ¡CONTINUAR!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
