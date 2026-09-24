/* ==========================================================================
   CONFIGURACIÓN Y TEMAS DE PLANES LISTO PATRÓN
   Estándar (Verde), Gold (Dorado), Platinum (Plateado-Azul), VIP (Naranja-Diamante)
   ========================================================================== */

export function getProPlanTheme(planNameRaw, rating = 0) {
  const plan = String(planNameRaw || '').toLowerCase().trim()
  const r = Number(rating || 0)

  // 1. Cliente Listo (Sin plan profesional)
  if (plan.includes('client') || plan.includes('cliente')) {
    return {
      id: 'cliente',
      name: 'Cliente Listo',
      tag: 'CLIENTE',
      badge: '🤝 CLIENTE LISTO',
      color: '#3B82F6',
      bgGradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
      ringGradient: 'linear-gradient(45deg, #3B82F6 0%, #60A5FA 100%)',
      borderColor: '#3B82F6',
      badgeBg: 'linear-gradient(135deg, #1E40AF, #3B82F6)',
      badgeColor: '#FFFFFF',
      headerGradient: 'linear-gradient(to bottom, rgba(30, 64, 175, 0.95) 0%, rgba(59, 130, 246, 0.6) 75%, rgba(0,0,0,0) 100%)',
      headerBorder: '1px solid rgba(59, 130, 246, 0.35)',
      headerGlow: '0 8px 25px rgba(59, 130, 246, 0.3)',
      price: 'RD$0',
      contractsLimit: 'N/A',
      ratingRange: 'N/A'
    }
  }

  // 2. Plan VIP / Élite (Naranja - RD$2,500)
  if (plan.includes('vip') || plan.includes('élite') || plan.includes('elite')) {
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
      headerGradient: 'linear-gradient(to bottom, rgba(242, 96, 0, 0.95) 0%, rgba(255, 122, 26, 0.6) 75%, rgba(0,0,0,0) 100%)',
      headerBorder: '1px solid rgba(242, 96, 0, 0.45)',
      headerGlow: '0 8px 25px rgba(242, 96, 0, 0.4)',
      price: 'RD$2,500',
      contractsLimit: '∞',
      ratingRange: '4.8 - 5.0'
    }
  }

  // 3. Plan Platinum / Activo (Azul-Plateado - RD$1,500)
  if (plan.includes('platinum') || plan.includes('platino') || plan.includes('activo')) {
    return {
      id: 'platinum',
      name: 'Plan Platinum',
      tag: 'PLATINUM',
      badge: '🥈 SOCIO PLATINUM',
      color: '#38BDF8',
      bgGradient: 'linear-gradient(135deg, #475569 0%, #64748B 50%, #38BDF8 100%)',
      ringGradient: 'linear-gradient(45deg, #64748B 0%, #94A3B8 50%, #38BDF8 100%)',
      borderColor: '#38BDF8',
      badgeBg: 'linear-gradient(135deg, #475569, #38BDF8)',
      badgeColor: '#FFFFFF',
      headerGradient: 'linear-gradient(to bottom, rgba(15, 118, 110, 0.95) 0%, rgba(56, 189, 248, 0.6) 75%, rgba(0,0,0,0) 100%)',
      headerBorder: '1px solid rgba(56, 189, 248, 0.45)',
      headerGlow: '0 8px 25px rgba(56, 189, 248, 0.4)',
      price: 'RD$1,500',
      contractsLimit: '12',
      ratingRange: '4.5 - 4.7'
    }
  }

  // 4. Plan Gold / Popular (Dorado - RD$1,000)
  if (plan.includes('gold') || plan.includes('popular') || plan.includes('oro')) {
    return {
      id: 'gold',
      name: 'Plan Gold',
      tag: 'GOLD',
      badge: '🥇 SOCIO GOLD',
      color: '#EAB308',
      bgGradient: 'linear-gradient(135deg, #D97706 0%, #EAB308 100%)',
      ringGradient: 'linear-gradient(45deg, #EAB308 0%, #F59E0B 50%, #D97706 100%)',
      borderColor: '#EAB308',
      badgeBg: 'linear-gradient(135deg, #D97706, #EAB308)',
      badgeColor: '#FFFFFF',
      headerGradient: 'linear-gradient(to bottom, rgba(217, 119, 6, 0.95) 0%, rgba(234, 179, 8, 0.6) 75%, rgba(0,0,0,0) 100%)',
      headerBorder: '1px solid rgba(234, 179, 8, 0.45)',
      headerGlow: '0 8px 25px rgba(234, 179, 8, 0.4)',
      price: 'RD$1,000',
      contractsLimit: '8',
      ratingRange: '4.0 - 4.7'
    }
  }

  // 5. Plan Estándar / Básico (Verde - RD$500)
  if (plan.includes('estandar') || plan.includes('estándar') || plan.includes('basico') || plan.includes('básico') || plan.includes('standard')) {
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
      headerGradient: 'linear-gradient(to bottom, rgba(5, 150, 105, 0.95) 0%, rgba(16, 185, 129, 0.6) 75%, rgba(0,0,0,0) 100%)',
      headerBorder: '1px solid rgba(16, 185, 129, 0.45)',
      headerGlow: '0 8px 25px rgba(16, 185, 129, 0.4)',
      price: 'RD$500',
      contractsLimit: '3',
      ratingRange: '0 - 3.9'
    }
  }

  // 6. Evaluación secundaria solo si NO hay nombre explícito de plan en los datos
  if (r >= 4.8) {
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
      headerGradient: 'linear-gradient(to bottom, rgba(242, 96, 0, 0.95) 0%, rgba(255, 122, 26, 0.6) 75%, rgba(0,0,0,0) 100%)',
      headerBorder: '1px solid rgba(242, 96, 0, 0.45)',
      headerGlow: '0 8px 25px rgba(242, 96, 0, 0.4)',
      price: 'RD$2,500',
      contractsLimit: '∞',
      ratingRange: '4.8 - 5.0'
    }
  }

  if (r >= 4.5) {
    return {
      id: 'platinum',
      name: 'Plan Platinum',
      tag: 'PLATINUM',
      badge: '🥈 SOCIO PLATINUM',
      color: '#38BDF8',
      bgGradient: 'linear-gradient(135deg, #475569 0%, #64748B 50%, #38BDF8 100%)',
      ringGradient: 'linear-gradient(45deg, #64748B 0%, #94A3B8 50%, #38BDF8 100%)',
      borderColor: '#38BDF8',
      badgeBg: 'linear-gradient(135deg, #475569, #38BDF8)',
      badgeColor: '#FFFFFF',
      headerGradient: 'linear-gradient(to bottom, rgba(15, 118, 110, 0.95) 0%, rgba(56, 189, 248, 0.6) 75%, rgba(0,0,0,0) 100%)',
      headerBorder: '1px solid rgba(56, 189, 248, 0.45)',
      headerGlow: '0 8px 25px rgba(56, 189, 248, 0.4)',
      price: 'RD$1,500',
      contractsLimit: '12',
      ratingRange: '4.5 - 4.7'
    }
  }

  if (r >= 4.0) {
    return {
      id: 'gold',
      name: 'Plan Gold',
      tag: 'GOLD',
      badge: '🥇 SOCIO GOLD',
      color: '#EAB308',
      bgGradient: 'linear-gradient(135deg, #D97706 0%, #EAB308 100%)',
      ringGradient: 'linear-gradient(45deg, #EAB308 0%, #F59E0B 50%, #D97706 100%)',
      borderColor: '#EAB308',
      badgeBg: 'linear-gradient(135deg, #D97706, #EAB308)',
      badgeColor: '#FFFFFF',
      headerGradient: 'linear-gradient(to bottom, rgba(217, 119, 6, 0.95) 0%, rgba(234, 179, 8, 0.6) 75%, rgba(0,0,0,0) 100%)',
      headerBorder: '1px solid rgba(234, 179, 8, 0.45)',
      headerGlow: '0 8px 25px rgba(234, 179, 8, 0.4)',
      price: 'RD$1,000',
      contractsLimit: '8',
      ratingRange: '4.0 - 4.7'
    }
  }

  // Fallback: Plan Estándar (Verde)
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
    headerGradient: 'linear-gradient(to bottom, rgba(5, 150, 105, 0.95) 0%, rgba(16, 185, 129, 0.6) 75%, rgba(0,0,0,0) 100%)',
    headerBorder: '1px solid rgba(16, 185, 129, 0.45)',
    headerGlow: '0 8px 25px rgba(16, 185, 129, 0.4)',
    price: 'RD$500',
    contractsLimit: '3',
    ratingRange: '0 - 3.9'
  }
}

