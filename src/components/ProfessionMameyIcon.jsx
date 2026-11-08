import React from 'react'

export default function ProfessionMameyIcon({ id, parentId, active = false, size = 34 }) {
  const stroke = active ? '#FFFFFF' : '#F26000'
  const fill   = active ? 'rgba(255,255,255,0.28)' : 'rgba(242,96,0,0.16)'
  const badgeBg = active
    ? 'linear-gradient(135deg, #FF7A1A 0%, #F26000 100%)'
    : 'linear-gradient(135deg, #FFF5EE 0%, #FFE4D1 100%)'
  const badgeBorder = active
    ? '1.5px solid rgba(255,255,255,0.45)'
    : '1.5px solid rgba(242,96,0,0.28)'
  const svgSize = Math.round(size * 0.56)

  const key = (id || parentId || 'all').toLowerCase()

  const renderGlyph = () => {
    switch (key) {
      case 'all':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none">
            <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" fill={stroke} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="19" cy="5" r="1.5" fill={stroke} />
            <circle cx="5" cy="19" r="1.2" fill={stroke} />
          </svg>
        )

      // ── MANTENIMIENTO Y REPARACIÓN ──
      case 'albanil':
      case 'pisos':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="8" height="5" rx="1" fill={fill} />
            <rect x="13" y="4" width="8" height="5" rx="1" fill={fill} />
            <rect x="3" y="10" width="5" height="5" rx="1" />
            <rect x="10" y="10" width="8" height="5" rx="1" fill={fill} />
            <rect x="3" y="16" width="9" height="4" rx="1" fill={fill} />
            <rect x="14" y="16" width="7" height="4" rx="1" />
          </svg>
        )

      case 'plomero':
      case 'plumber':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill={fill} />
            <path d="M9.5 14a3.5 3.5 0 0 0 5 0" />
          </svg>
        )

      case 'electricista':
      case 'electrician':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={fill} />
          </svg>
        )

      case 'mecanico':
      case 'mechanic':
      case 'mantenimiento':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill={fill} />
          </svg>
        )

      case 'refrigeracion':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="m20 16-4-4 4-4" />
            <path d="m4 8 4 4-4 4" />
            <path d="m16 4-4 4-4-4" />
            <path d="m8 20 4-4 4 4" />
            <circle cx="12" cy="12" r="3" fill={fill} />
          </svg>
        )

      case 'camaras':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" fill={fill} />
            <circle cx="12" cy="13" r="3.5" fill={stroke} />
          </svg>
        )

      case 'inversores':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="12" height="18" rx="2" fill={fill} />
            <line x1="10" y1="2" x2="14" y2="2" strokeWidth="2.5" />
            <path d="M13 8l-3 5h4l-3 5" />
          </svg>
        )

      case 'computadoras':
      case 'editor':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" fill={fill} />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        )

      case 'celulares':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2.5" fill={fill} />
            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.8" />
          </svg>
        )

      case 'cerrajero':
      case 'locksmith':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7.5" cy="15.5" r="5.5" fill={fill} />
            <path d="m21 2-9.6 9.6" />
            <path d="m15.5 7.5 3 3L22 7l-3-3" fill={fill} />
          </svg>
        )

      case 'pintor':
      case 'painter':
      case 'decorador':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="14" height="7" rx="2" fill={fill} />
            <path d="M17 6.5h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-7a2 2 0 0 0-2 2v1.5" />
            <rect x="8.5" y="17" width="3" height="5" rx="1" fill={stroke} />
          </svg>
        )

      case 'carpintero':
      case 'carpenter':
      case 'instalacion':
      case 'herrero':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9" fill={fill} />
            <path d="M17.64 15 22 10.64" />
            <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91" />
          </svg>
        )

      case 'tapicero':
      case 'limpieza_muebles':
      case 'decorador_int':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" fill={fill} />
            <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" fill={fill} />
            <path d="M4 18v2" />
            <path d="M20 18v2" />
          </svg>
        )

      case 'sheetrock':
      case 'constructor':
      case 'montaje_ev':
      case 'disenador_int':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" fill={fill} />
            <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
            <path d="M4 15v-3a6 6 0 0 1 6-6h0" fill={fill} />
            <path d="M14 6h0a6 6 0 0 1 6 6v3" fill={fill} />
          </svg>
        )

      // ── LIMPIEZA ──
      case 'limpieza':
      case 'cleaner':
      case 'limpieza_hogar':
      case 'airbnb':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={fill} />
            <path d="M12 11l1.2 2.8L16 15l-2.8 1.2L12 19l-1.2-2.8L8 15l2.8-1.2L12 11z" fill={stroke} />
          </svg>
        )

      case 'limpieza_oficina':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" fill={fill} />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" strokeWidth="2.4" />
          </svg>
        )

      case 'limpieza_auto':
      case 'limusina':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" fill={fill} />
            <circle cx="7" cy="17" r="2" fill={stroke} />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" fill={stroke} />
          </svg>
        )

      case 'lavanderia':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" fill={fill} />
          </svg>
        )

      case 'plagas':
      case 'seguridad':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={fill} />
            <path d="m9 12 2 2 4-4" />
          </svg>
        )

      // ── CUIDADO PERSONAL Y EDUCACIÓN ──
      case 'ninera':
      case 'nanny':
      case 'cuidado':
      case 'ancianos':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill={fill} />
          </svg>
        )

      case 'enfermera':
      case 'veterinario':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" fill={fill} />
            <path d="M8 5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M12 10v6" strokeWidth="2.5" />
            <path d="M9 13h6" strokeWidth="2.5" />
          </svg>
        )

      case 'educativo':
      case 'coordinador':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" fill={fill} />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" fill={fill} />
          </svg>
        )

      case 'jardinero':
      case 'gardener':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" fill={fill} />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        )

      case 'mensajero':
      case 'delivery':
      case 'mudanzas':
      case 'transporte':
      case 'grua':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" fill={fill} />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
            <circle cx="17" cy="18" r="2" fill={stroke} />
            <circle cx="7" cy="18" r="2" fill={stroke} />
          </svg>
        )

      // ── BELLEZA Y BIENESTAR ──
      case 'belleza':
      case 'peluquero':
      case 'barbero':
      case 'pelu_canina':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="6" cy="6" r="3" fill={fill} />
            <circle cx="6" cy="18" r="3" fill={fill} />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
        )

      case 'masajista':
      case 'maquillaje':
      case 'manicura':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z" fill={fill} />
            <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" fill={stroke} />
          </svg>
        )

      case 'entrenador':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5 17.5 17.5" />
            <path d="M3 10l7-7" strokeWidth="2.6" />
            <path d="M14 21l7-7" strokeWidth="2.6" />
            <path d="M2 6l4-4" />
            <path d="M18 22l4-4" />
          </svg>
        )

      // ── MASCOTAS ──
      case 'mascotas':
      case 'paseador':
      case 'cuidador':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="4" r="2" fill={fill} />
            <circle cx="18" cy="8" r="2" fill={fill} />
            <circle cx="20" cy="16" r="2" fill={fill} />
            <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" fill={fill} />
          </svg>
        )

      // ── EVENTOS Y FOTOGRAFÍA ──
      case 'fotografo':
      case 'videografo':
      case 'drone':
      case 'photobooth':
      case 'productor':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" fill={fill} />
            <circle cx="12" cy="13" r="3.5" fill={stroke} />
          </svg>
        )

      case 'chef_privado':
      case 'catering':
      case 'bartender':
      case 'alq_vajilla':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" fill={fill} />
            <line x1="6" y1="17" x2="18" y2="17" />
          </svg>
        )

      case 'dj':
      case 'alq_sonido':
      case 'host':
      case 'maestro_cer':
      case 'animador':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" fill={fill} />
            <circle cx="6" cy="18" r="3" fill={stroke} />
            <circle cx="18" cy="16" r="3" fill={stroke} />
          </svg>
        )

      case 'iluminacion':
      case 'alq_luces':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" fill={fill} />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
        )

      case 'personalizado':
      case 'custom':
      case 'planificador':
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" fill={fill} />
            <circle cx="12" cy="12" r="5" />
            <circle cx="12" cy="12" r="1.8" fill={stroke} />
          </svg>
        )

      default:
        return (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={fill} />
          </svg>
        )
    }
  }

  return (
    <span
      className="profession-mamey-badge"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.32)}px`,
        background: badgeBg,
        border: badgeBorder,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: active
          ? 'inset 0 1px 2px rgba(255,255,255,0.35), 0 3px 8px rgba(242, 96, 0, 0.25)'
          : '0 3px 8px rgba(242, 96, 0, 0.14)',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {renderGlyph()}
    </span>
  )
}

