/* ==========================================================================
   CONFIGURACIÓN Y TEMAS DE PLANES LISTO PATRÓN
   Estándar (Verde), Gold (Dorado), Platinum (Plateado-Azul), VIP (Naranja-Diamante)
   ========================================================================== */

export function getProPlanTheme(planNameRaw, rating = 5.0) {
  const plan = String(planNameRaw || '').toLowerCase()
  const r = Number(rating || 0)

  if (plan.includes('vip') || plan.includes('élite') || plan.includes('elite') || r >= 4.8) {
    return {
      id: 'vip',
      name: 'Plan VIP',
      tag: 'ÉLITE',
      badge: '💎 SOCIO VIP ÉLITE',
      color: '#F26000',
      bgGradient: 'linear-gradient(135deg, #F26000 0%, #FF7A1A 100%)',
      ringGradient: 'linear-gradient(45deg, #F26000 0%, #FF7A1A 50%, #F59E0B 100%)',
      borderColor: '#F26000',
      badgeBg: 'linear-gradient(135deg, #F26000, #FF7A1A)',
      badgeColor: '#FFFFFF',
      price: 'RD$2,500',
      contractsLimit: '∞',
      ratingRange: '4.8 - 5.0'
    }
  }

  if (plan.includes('platinum') || plan.includes('activo') || (r >= 4.5 && r < 4.8)) {
    return {
      id: 'platinum',
      name: 'Plan Platinum',
      tag: 'ACTIVO',
      badge: '🥈 SOCIO PLATINUM',
      color: '#38BDF8',
      bgGradient: 'linear-gradient(135deg, #475569 0%, #64748B 50%, #38BDF8 100%)',
      ringGradient: 'linear-gradient(45deg, #64748B 0%, #94A3B8 50%, #38BDF8 100%)',
      borderColor: '#38BDF8',
      badgeBg: 'linear-gradient(135deg, #475569, #38BDF8)',
      badgeColor: '#FFFFFF',
      price: 'RD$1,500',
      contractsLimit: '12',
      ratingRange: '4.5 - 4.7'
    }
  }

  if (plan.includes('gold') || plan.includes('popular') || (r >= 4.0 && r < 4.5)) {
    return {
      id: 'gold',
      name: 'Plan Gold',
      tag: 'POPULAR',
      badge: '🥇 SOCIO GOLD',
      color: '#EAB308',
      bgGradient: 'linear-gradient(135deg, #D97706 0%, #EAB308 100%)',
      ringGradient: 'linear-gradient(45deg, #EAB308 0%, #F59E0B 50%, #D97706 100%)',
      borderColor: '#EAB308',
      badgeBg: 'linear-gradient(135deg, #D97706, #EAB308)',
      badgeColor: '#FFFFFF',
      price: 'RD$1,000',
      contractsLimit: '8',
      ratingRange: '4.0 - 4.7'
    }
  }

  // Fallback: Plan Estándar (Básico - Verde)
  return {
    id: 'estandar',
    name: 'Plan Estándar',
    tag: 'BÁSICO',
    badge: '🟢 SOCIO BÁSICO',
    color: '#10B981',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    ringGradient: 'linear-gradient(45deg, #10B981 0%, #34D399 100%)',
    borderColor: '#10B981',
    badgeBg: 'linear-gradient(135deg, #059669, #10B981)',
    badgeColor: '#FFFFFF',
    price: 'RD$500',
    contractsLimit: '3',
    ratingRange: '0 - 3.9'
  }
}
