// ── ARCHIVO CENTRAL DE CATEGORÍAS ──
// Importa este archivo en HomePage, SearchPage y RegisterPage

export const FILTERS = [
  { id: 'disponible', icon: '⚡', labelEs: 'Disponible hoy',     labelEn: 'Available today' },
  { id: 'domicilio',  icon: '🏠', labelEs: 'A domicilio',         labelEn: 'Home service' },
  { id: 'top_recomendado', icon: '🏆', labelEs: 'Top recomendado', labelEn: 'Top recommended' },
  { id: 'mas_contratado',  icon: '🔥', labelEs: 'Más contratado',  labelEn: 'Most hired' },
  { id: 'exclusivo',       icon: '💎', labelEs: 'Exclusivo',       labelEn: 'Exclusive' },
]

export const PLANS = {
  basico: {
    id: 'basico',
    icon: '⚪',
    labelEs: 'Básico',
    labelEn: 'Basic',
    ratingMin: 0,
    ratingMax: 3.9,
    color: '#9CA3AF',
    bg: '#F3F4F6',
  },
  gold: {
    id: 'gold',
    icon: '🟡',
    labelEs: 'Gold',
    labelEn: 'Gold',
    ratingMin: 4.0,
    ratingMax: 4.7,
    color: '#F59E0B',
    bg: '#FFFBEB',
  },
  vip: {
    id: 'vip',
    icon: '⭐',
    labelEs: 'VIP',
    labelEn: 'VIP',
    ratingMin: 4.8,
    ratingMax: 5.0,
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  platinum: {
    id: 'platinum',
    icon: '⚫',
    labelEs: 'Platinum',
    labelEn: 'Platinum',
    ratingMin: 4.5,
    ratingMax: 4.7,
    color: '#1A1A2E',
    bg: '#F5F3FF',
  },
}

export const CATEGORIES = [
  // ── HOGAR Y MANTENIMIENTO ──
  {
    id: 'mantenimiento',
    icon: '🔧',
    labelEs: 'Mantenimiento',
    labelEn: 'Maintenance',
    subcategories: [
      { id: 'plomero',       icon: '🔩', labelEs: 'Plomero',          labelEn: 'Plumber' },
      { id: 'electricista',  icon: '⚡', labelEs: 'Electricista',     labelEn: 'Electrician' },
      { id: 'mecanico',      icon: '🔧', labelEs: 'Mecánico',         labelEn: 'Mechanic' },
      { id: 'refrigeracion', icon: '❄️', labelEs: 'Refrigeración',    labelEn: 'Refrigeration' },
      { id: 'cerrajero',     icon: '🔑', labelEs: 'Cerrajero',        labelEn: 'Locksmith' },
      { id: 'pintor',        icon: '🎨', labelEs: 'Pintor',           labelEn: 'Painter' },
      { id: 'carpintero',    icon: '🪵', labelEs: 'Carpintero',       labelEn: 'Carpenter' },
      { id: 'instalacion',   icon: '🔨', labelEs: 'Instalación',      labelEn: 'Installation' },
      { id: 'reparacion',    icon: '🛠️', labelEs: 'Reparación',       labelEn: 'Repair' },
      { id: 'reformas',      icon: '🏗️', labelEs: 'Reformas',         labelEn: 'Renovations' },
      { id: 'montaje',       icon: '🔩', labelEs: 'Montaje',          labelEn: 'Assembly' },
    ]
  },

  // ── LIMPIEZA ──
  {
    id: 'limpieza',
    icon: '🧹',
    labelEs: 'Limpieza',
    labelEn: 'Cleaning',
    subcategories: [
      { id: 'limpieza_hogar',   icon: '🏠', labelEs: 'Limpieza del hogar',   labelEn: 'Home cleaning' },
      { id: 'limpieza_oficina', icon: '🏢', labelEs: 'Limpieza de oficina',  labelEn: 'Office cleaning' },
      { id: 'limpieza_auto',    icon: '🚗', labelEs: 'Limpieza de auto',     labelEn: 'Car cleaning' },
      { id: 'limpieza_muebles', icon: '🛋️', labelEs: 'Limpieza de muebles', labelEn: 'Furniture cleaning' },
      { id: 'lavanderia',       icon: '👕', labelEs: 'Lavandería',           labelEn: 'Laundry' },
      { id: 'plagas',           icon: '🐛', labelEs: 'Control de plagas',    labelEn: 'Pest control' },
    ]
  },

  // ── CUIDADO PERSONAL ──
  {
    id: 'cuidado',
    icon: '👶',
    labelEs: 'Cuidado personal',
    labelEn: 'Personal care',
    subcategories: [
      { id: 'ninera',     icon: '👶', labelEs: 'Niñera',           labelEn: 'Nanny' },
      { id: 'educativo',  icon: '📚', labelEs: 'Apoyo educativo',  labelEn: 'Educational support' },
      { id: 'jardinero',  icon: '🌿', labelEs: 'Jardinero',        labelEn: 'Gardener' },
      { id: 'mensajero',  icon: '🛵', labelEs: 'Mensajero',        labelEn: 'Messenger' },
      { id: 'mudanzas',   icon: '📦', labelEs: 'Mudanzas',         labelEn: 'Moving' },
    ]
  },

  // ── EVENTOS ──
  {
    id: 'eventos',
    icon: '🎉',
    labelEs: 'Eventos',
    labelEn: 'Events',
    subcategories: [

      // Organización
      { id: 'organizador',   icon: '🎈', labelEs: 'Organizador de eventos', labelEn: 'Event organizer' },
      { id: 'wedding',       icon: '💍', labelEs: 'Wedding planner',        labelEn: 'Wedding planner' },
      { id: 'coordinador',   icon: '📋', labelEs: 'Coordinador de eventos', labelEn: 'Event coordinator' },
      { id: 'planificador',  icon: '🎯', labelEs: 'Planificador de fiestas',labelEn: 'Party planner' },
      { id: 'productor',     icon: '🎬', labelEs: 'Productor de eventos',   labelEn: 'Event producer' },

      // Decoración
      { id: 'decorador',     icon: '🎨', labelEs: 'Decorador de eventos',   labelEn: 'Event decorator' },
      { id: 'decorador_int', icon: '🛋️', labelEs: 'Decorador de interiores',labelEn: 'Interior decorator' },
      { id: 'disenador_int', icon: '📐', labelEs: 'Diseñador de interiores',labelEn: 'Interior designer' },
      { id: 'decor_tematica',icon: '🎭', labelEs: 'Decoración temática',    labelEn: 'Thematic decoration' },
      { id: 'globos',        icon: '🎈', labelEs: 'Especialista en globos', labelEn: 'Balloon specialist' },
      { id: 'iluminacion',   icon: '💡', labelEs: 'Iluminación decorativa', labelEn: 'Decorative lighting' },
      { id: 'montaje_ev',    icon: '🏗️', labelEs: 'Montaje de eventos',     labelEn: 'Event setup' },

      // Fotografía y video
      { id: 'fotografo',     icon: '📸', labelEs: 'Fotógrafo profesional',  labelEn: 'Professional photographer' },
      { id: 'videografo',    icon: '🎥', labelEs: 'Videógrafo',             labelEn: 'Videographer' },
      { id: 'editor',        icon: '💻', labelEs: 'Editor de fotos y video',labelEn: 'Photo & video editor' },
      { id: 'drone',         icon: '🚁', labelEs: 'Drone para eventos',     labelEn: 'Event drone' },
      { id: 'photobooth',    icon: '📷', labelEs: 'Cabina de fotos',        labelEn: 'Photobooth' },

      // Alquiler
      { id: 'alq_sillas',    icon: '🪑', labelEs: 'Alquiler de sillas',     labelEn: 'Chair rental' },
      { id: 'alq_mesas',     icon: '🪑', labelEs: 'Alquiler de mesas',      labelEn: 'Table rental' },
      { id: 'alq_carpas',    icon: '⛺', labelEs: 'Alquiler de carpas',     labelEn: 'Tent rental' },
      { id: 'alq_sonido',    icon: '🔊', labelEs: 'Alquiler de sonido',     labelEn: 'Sound rental' },
      { id: 'alq_luces',     icon: '💡', labelEs: 'Alquiler de luces',      labelEn: 'Light rental' },
      { id: 'alq_tarimas',   icon: '🎪', labelEs: 'Alquiler de tarimas',    labelEn: 'Stage rental' },
      { id: 'alq_vajilla',   icon: '🍽️', labelEs: 'Alquiler de vajilla',    labelEn: 'Tableware rental' },
      { id: 'alq_decoracion',icon: '🏺', labelEs: 'Alquiler de decoración', labelEn: 'Decoration rental' },

      // Entretenimiento
      { id: 'bartender',     icon: '🍾', labelEs: 'Bartender',              labelEn: 'Bartender' },
      { id: 'catering',      icon: '🍱', labelEs: 'Catering',               labelEn: 'Catering' },
      { id: 'chef_privado',  icon: '👨‍🍳', labelEs: 'Chef privado / gourmet',  labelEn: 'Private / gourmet chef' },
      { id: 'dj',            icon: '🎵', labelEs: 'Show en vivo / DJ',      labelEn: 'Live show / DJ' },
      { id: 'payasos',       icon: '🤡', labelEs: 'Payasos / entretenimiento infantil', labelEn: 'Clowns / kids entertainment' },
      { id: 'fuegos',        icon: '🎆', labelEs: 'Fuegos artificiales',    labelEn: 'Fireworks' },
      { id: 'limusina',      icon: '🚗', labelEs: 'Servicio de limusina',   labelEn: 'Limousine service' },

      // Servicios personales (Roles corporativos / eventos)
      { id: 'host',          icon: '🎤', labelEs: 'Host / Anfitrión Corporativo', labelEn: 'Corporate Host' },
      { id: 'maestro_cer',   icon: '🎩', labelEs: 'Maestro de ceremonias',  labelEn: 'Master of ceremonies' },
      { id: 'animador',      icon: '🎭', labelEs: 'Animador',               labelEn: 'Entertainer' },
      { id: 'modelo',        icon: '💃', labelEs: 'Modelo para eventos',    labelEn: 'Event model' },
      { id: 'seguridad',     icon: '🛡️', labelEs: 'Seguridad para eventos', labelEn: 'Event security' },
    ]
  },

  // ── PERSONALIZADO ──
  {
    id: 'personalizado',
    icon: '🎯',
    labelEs: 'Personalizado',
    labelEn: 'Custom',
    subcategories: [
      { id: 'custom', icon: '🎯', labelEs: 'Servicio personalizado', labelEn: 'Custom service' },
    ]
  },
]

// Helper para obtener todas las subcategorías flat
export const ALL_SUBCATEGORIES = CATEGORIES.flatMap(cat =>
  cat.subcategories.map(sub => ({ ...sub, parentId: cat.id, parentLabel: cat.labelEs }))
)

// Helper para obtener el plan de un profesional según su rating (Fallback por defecto)
export const getPlan = (rating) => {
  if (rating >= 4.8) return PLANS.vip
  if (rating >= 4.5) return PLANS.platinum
  if (rating >= 4.0) return PLANS.gold
  return PLANS.basico
}