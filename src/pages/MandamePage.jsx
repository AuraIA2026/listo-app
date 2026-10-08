import React, { useState, useEffect, useRef } from 'react';
import './MandamePage.css';

// Initial Mock State
const ANIMATED_BANNERS_CATALOG = [
  // CATEGORY 1: 🔥 Fuegos & Relámpagos (10 Banners)
  { id: 'b-fire-1', category: '🔥 Fuegos & Relámpagos', title: '🔥 Oferta de Fuego Relámpago', text: '🔥 OFERTA DE FUEGO RELÁMPAGO ⚡', bg: 'linear-gradient(135deg, #ff6b00, #ef4444)', border: '#ff6b00', anim: 'studio-fire-border' },
  { id: 'b-fire-2', category: '🔥 Fuegos & Relámpagos', title: '⚡ Descuento Relámpago Flash', text: '⚡ DESCUENTO RELÁMPAGO FLASH 🔥', bg: 'linear-gradient(135deg, #ff5500, #ff0055)', border: '#ff5500', anim: 'studio-fire-border' },
  { id: 'b-fire-3', category: '🔥 Fuegos & Relámpagos', title: '🔥 Candela Dominicana', text: '🔥 CANDELA DOMINICANA 🇩🇴', bg: 'linear-gradient(135deg, #e65100, #b71c1c)', border: '#e65100', anim: 'studio-fire-border' },
  { id: 'b-fire-4', category: '🔥 Fuegos & Relámpagos', title: '⚡ Súper Promo 2x1 Fuego', text: '⚡ SÚPER PROMO 2X1 EN FUEGO 🔥', bg: 'linear-gradient(135deg, #ff6b00, #ff8533)', border: '#ff6b00', anim: 'studio-fire-border' },
  { id: 'b-fire-5', category: '🔥 Fuegos & Relámpagos', title: '🔥 Combazo Ardiente', text: '🔥 COMBAZO ARDIENTE DE LA CASA 💥', bg: 'linear-gradient(135deg, #d84315, #bf360c)', border: '#d84315', anim: 'studio-fire-border' },
  { id: 'b-fire-6', category: '🔥 Fuegos & Relámpagos', title: '⚡ Envío Fuego Gratis', text: '⚡ ENVÍO GRATIS EN FUEGO 🚚', bg: 'linear-gradient(135deg, #ff6b00, #00e699)', border: '#00e699', anim: 'studio-fire-border' },
  { id: 'b-fire-7', category: '🔥 Fuegos & Relámpagos', title: '🔥 Especial de la Casa Flame', text: '🔥 ESPECIAL DE LA CASA FLAME 👑', bg: 'linear-gradient(135deg, #ff3d00, #dd2c00)', border: '#ff3d00', anim: 'studio-fire-border' },
  { id: 'b-fire-8', category: '🔥 Fuegos & Relámpagos', title: '⚡ Bajón de Medianoche Fuego', text: '⚡ BAJÓN DE MEDIANOCHE FUEGO 🌙', bg: 'linear-gradient(135deg, #311b92, #ff6b00)', border: '#ff6b00', anim: 'studio-fire-border' },
  { id: 'b-fire-9', category: '🔥 Fuegos & Relámpagos', title: '🔥 Chicharrón Fuego Crocante', text: '🔥 CHICHARRÓN FUEGO CROCANTE 🥓', bg: 'linear-gradient(135deg, #bf360c, #ff6b00)', border: '#bf360c', anim: 'studio-fire-border' },
  { id: 'b-fire-10', category: '🔥 Fuegos & Relámpagos', title: '⚡ Super Flash Deal 24/7', text: '⚡ SUPER FLASH DEAL 24/7 🔥', bg: 'linear-gradient(135deg, #ff1744, #ff9100)', border: '#ff1744', anim: 'studio-fire-border' },

  // CATEGORY 2: 🏷️ Descuentos & Cupones (10 Banners)
  { id: 'b-disc-1', category: '🏷️ Descuentos & Cupones', title: '💸 50% OFF Mega Descuento', text: '💸 50% OFF MEGA DESCUENTO ⚡', bg: 'linear-gradient(135deg, #dc2626, #991b1b)', border: '#dc2626', anim: 'studio-fire-border' },
  { id: 'b-disc-2', category: '🏷️ Descuentos & Cupones', title: '🏷️ 40% OFF Cupón Especial', text: '🏷️ 40% OFF CUPÓN ESPECIAL 🎁', bg: 'linear-gradient(135deg, #ea580c, #c2410c)', border: '#ea580c', anim: 'studio-fire-border' },
  { id: 'b-disc-3', category: '🏷️ Descuentos & Cupones', title: '🎁 30% OFF Primera Compra', text: '🎁 30% OFF PRIMERA COMPRA 🎉', bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: '#2563eb', anim: 'studio-neon-border' },
  { id: 'b-disc-4', category: '🏷️ Descuentos & Cupones', title: '🎉 20% OFF Fin de Semana', text: '🎉 20% OFF FIN DE SEMANA 🥳', bg: 'linear-gradient(135deg, #059669, #047857)', border: '#059669', anim: 'studio-neon-border' },
  { id: 'b-disc-5', category: '🏷️ Descuentos & Cupones', title: '💳 15% Cashback Banreservas', text: '💳 15% CASHBACK BANRESERVAS 💳', bg: 'linear-gradient(135deg, #d97706, #b45309)', border: '#d97706', anim: 'studio-gold-border' },
  { id: 'b-disc-6', category: '🏷️ Descuentos & Cupones', title: '🤑 10% OFF Cashback Listo', text: '🤑 10% CASHBACK PEDIDOS LISTO 💛', bg: 'linear-gradient(135deg, #ff6b00, #ff8533)', border: '#ff6b00', anim: 'studio-fire-border' },
  { id: 'b-disc-7', category: '🏷️ Descuentos & Cupones', title: '🏷️ 2x1 Martes de Promo', text: '🏷️ 2X1 MARTES DE PROMO 🔥', bg: 'linear-gradient(135deg, #e11d48, #be123c)', border: '#e11d48', anim: 'studio-fire-border' },
  { id: 'b-disc-8', category: '🏷️ Descuentos & Cupones', title: '🏷️ 3x2 Combo Familiar', text: '🏷️ 3X2 COMBO FAMILIAR 🍕', bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: '#7c3aed', anim: 'studio-neon-border' },
  { id: 'b-disc-9', category: '🏷️ Descuentos & Cupones', title: '🏷️ RD$ 200 OFF Cupón', text: '🏷️ RD$ 200 OFF CUPÓN ACTIVO 🏷️', bg: 'linear-gradient(135deg, #0284c7, #0369a1)', border: '#0284c7', anim: 'studio-neon-border' },
  { id: 'b-disc-10', category: '🏷️ Descuentos & Cupones', title: '🏷️ RD$ 500 OFF Super Combo', text: '🏷️ RD$ 500 OFF SUPER COMBO 💥', bg: 'linear-gradient(135deg, #16a34a, #15803d)', border: '#16a34a', anim: 'studio-neon-border' },

  // CATEGORY 3: 👑 VIP & Chef Gourmet (10 Banners)
  { id: 'b-vip-1', category: '👑 VIP & Chef Gourmet', title: '👑 Selección Chef VIP Gold', text: '👑 SELECCIÓN CHEF VIP ESTRELLA ⭐', bg: 'linear-gradient(135deg, #0a0e1a, #121829)', border: '#ffb703', anim: 'studio-gold-border' },
  { id: 'b-vip-2', category: '👑 VIP & Chef Gourmet', title: '⭐ Platillo 5 Estrellas', text: '⭐ PLATILLO 5 ESTRELLAS VIP 👑', bg: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '#818cf8', anim: 'studio-gold-border' },
  { id: 'b-vip-3', category: '👑 VIP & Chef Gourmet', title: '💎 Edición Especial Premium', text: '💎 EDICIÓN ESPECIAL PREMIUM ✨', bg: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '#38bdf8', anim: 'studio-neon-border' },
  { id: 'b-vip-4', category: '👑 VIP & Chef Gourmet', title: '🥇 El #1 Más Vendido Santiago', text: '🥇 EL #1 MÁS VENDIDO SANTIAGO 🏆', bg: 'linear-gradient(135deg, #b45309, #78350f)', border: '#f59e0b', anim: 'studio-gold-border' },
  { id: 'b-vip-5', category: '👑 VIP & Chef Gourmet', title: '🏆 Premio Gastronómico 2026', text: '🏆 GANADOR PREMIO GASTRONÓMICO 🥇', bg: 'linear-gradient(135deg, #854d0e, #713f12)', border: '#eab308', anim: 'studio-gold-border' },
  { id: 'b-vip-6', category: '👑 VIP & Chef Gourmet', title: '👑 Receta Secreta del Chef', text: '👑 RECETA SECRETA DEL CHEF 🤫', bg: 'linear-gradient(135deg, #0284c7, #0f172a)', border: '#38bdf8', anim: 'studio-neon-border' },
  { id: 'b-vip-7', category: '👑 VIP & Chef Gourmet', title: '✨ Especialidad Gourmet', text: '✨ ESPECIALIDAD GOURMET FRESCA 🍇', bg: 'linear-gradient(135deg, #4c1d95, #2e1065)', border: '#c084fc', anim: 'studio-gold-border' },
  { id: 'b-vip-8', category: '👑 VIP & Chef Gourmet', title: '🏅 Plato Calidad Garantizada', text: '🏅 PLATO CALIDAD GARANTIZADA 🛡️', bg: 'linear-gradient(135deg, #047857, #064e3b)', border: '#34d399', anim: 'studio-neon-border' },
  { id: 'b-vip-9', category: '👑 VIP & Chef Gourmet', title: '🌟 Recomendación de la Casa', text: '🌟 RECOMENDACIÓN DE LA CASA ⭐', bg: 'linear-gradient(135deg, #c2410c, #7c2d12)', border: '#fb923c', anim: 'studio-fire-border' },
  { id: 'b-vip-10', category: '👑 VIP & Chef Gourmet', title: '💫 Experiencia Sabor Premium', text: '💫 EXPERIENCIA SABOR PREMIUM 👑', bg: 'linear-gradient(135deg, #0f172a, #334155)', border: '#f43f5e', anim: 'studio-gold-border' },

  // CATEGORY 4: 🇩🇴 Sabor Criollo (10 Banners)
  { id: 'b-do-1', category: '🇩🇴 Sabor Criollo', title: '🇩🇴 100% Sabor Criollo Dominicano', text: '🇩🇴 100% SABOR CRIOLLO DOMINICANO 🇩🇴', bg: 'linear-gradient(135deg, #002590, #ce1126)', border: '#ce1126', anim: 'studio-fire-border' },
  { id: 'b-do-2', category: '🇩🇴 Sabor Criollo', title: '🍌 Plátano Majado al Moho', text: '🍌 PLÁTANO MAJADO AL MOHO CRIOLLO 🧄', bg: 'linear-gradient(135deg, #ca8a04, #854d0e)', border: '#eab308', anim: 'studio-gold-border' },
  { id: 'b-do-3', category: '🇩🇴 Sabor Criollo', title: '🧄 Mofongo Ajo Tradicional', text: '🧄 MOFONGO AJO TRADICIONAL 🍌', bg: 'linear-gradient(135deg, #a16207, #713f12)', border: '#fde047', anim: 'studio-gold-border' },
  { id: 'b-do-4', category: '🇩🇴 Sabor Criollo', title: '🌴 Sabor del Caribe Santiago', text: '🌴 SABOR DEL CARIBE SANTIAGO ☀️', bg: 'linear-gradient(135deg, #0284c7, #0369a1)', border: '#38bdf8', anim: 'studio-neon-border' },
  { id: 'b-do-5', category: '🇩🇴 Sabor Criollo', title: '🍚 Bandera Dominicana 7 Carnes', text: '🍚 BANDERA DOMINICANA 7 CARNES 🍗', bg: 'linear-gradient(135deg, #002590, #0f172a)', border: '#ce1126', anim: 'studio-fire-border' },
  { id: 'b-do-6', category: '🇩🇴 Sabor Criollo', title: '🇩🇴 Hecho en RD con Amor', text: '🇩🇴 HECHO EN RD CON AMOR 💛', bg: 'linear-gradient(135deg, #ce1126, #991b1b)', border: '#002590', anim: 'studio-fire-border' },
  { id: 'b-do-7', category: '🇩🇴 Sabor Criollo', title: '🧀 Queso Frito Geo Criollo', text: '🧀 QUESO FRITO GEO CRIOLLO 🧀', bg: 'linear-gradient(135deg, #d97706, #b45309)', border: '#fbbf24', anim: 'studio-gold-border' },
  { id: 'b-do-8', category: '🇩🇴 Sabor Criollo', title: '🥓 Chicharrón de la Casa', text: '🥓 CHICHARRÓN CROCANTE CRIOLLO 🔥', bg: 'linear-gradient(135deg, #b91c1c, #7f1d1d)', border: '#ef4444', anim: 'studio-fire-border' },
  { id: 'b-do-9', category: '🇩🇴 Sabor Criollo', title: '🥑 Víveres al Moho Criollo', text: '🥑 VÍVERES AL MOHO CRIOLLO 🇩🇴', bg: 'linear-gradient(135deg, #15803d, #14532d)', border: '#4ade80', anim: 'studio-neon-border' },
  { id: 'b-do-10', category: '🇩🇴 Sabor Criollo', title: '🇩🇴 Tradición Santiago 100%', text: '🇩🇴 TRADICIÓN SANTIAGO 100% 🌴', bg: 'linear-gradient(135deg, #002590, #ce1126)', border: '#ffffff', anim: 'studio-fire-border' },

  // CATEGORY 5: 💥 Lanzamientos & Novedades (10 Banners)
  { id: 'b-new-1', category: '💥 Lanzamientos', title: '💥 ¡NUEVO LANZAMIENTO EXCLUSIVO!', text: '💥 ¡NUEVO LANZAMIENTO EXCLUSIVO! ⭐', bg: 'linear-gradient(135deg, #ef4444, #dc2626)', border: '#ef4444', anim: 'studio-fire-border' },
  { id: 'b-new-2', category: '💥 Lanzamientos', title: '🆕 Recién Agregado al Menú', text: '🆕 RECIÉN AGREGADO AL MENÚ 📜', bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: '#3b82f6', anim: 'studio-neon-border' },
  { id: 'b-new-3', category: '💥 Lanzamientos', title: '🚀 Estreno de Temporada', text: '🚀 ESTRENO DE TEMPORADA 2026 ✨', bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: '#a855f7', anim: 'studio-neon-border' },
  { id: 'b-new-4', category: '💥 Lanzamientos', title: '✨ Nueva Receta Crocante', text: '✨ NUEVA RECETA CROCANTE 🍗', bg: 'linear-gradient(135deg, #d97706, #b45309)', border: '#f59e0b', anim: 'studio-gold-border' },
  { id: 'b-new-5', category: '💥 Lanzamientos', title: '📣 ¡PRUÉBALO HOY MISMO!', text: '📣 ¡PRUÉBALO HOY MISMO! 😋', bg: 'linear-gradient(135deg, #ff6b00, #ff8533)', border: '#ff6b00', anim: 'studio-fire-border' },
  { id: 'b-new-6', category: '💥 Lanzamientos', title: '🌟 Sabor Inigualable Nuevo', text: '🌟 SABOR INIGUALABLE NUEVO 🍔', bg: 'linear-gradient(135deg, #059669, #047857)', border: '#10b981', anim: 'studio-neon-border' },
  { id: 'b-new-7', category: '💥 Lanzamientos', title: '🎉 Edición Limitada 2026', text: '🎉 EDICIÓN LIMITADA 2026 🎁', bg: 'linear-gradient(135deg, #db2777, #be185d)', border: '#f43f5e', anim: 'studio-fire-border' },
  { id: 'b-new-8', category: '💥 Lanzamientos', title: '🔥 Recién Salido de Cocina', text: '🔥 RECIÉN SALIDO DE COCINA 👨‍🍳', bg: 'linear-gradient(135deg, #ea580c, #c2410c)', border: '#f97316', anim: 'studio-fire-border' },
  { id: 'b-new-9', category: '💥 Lanzamientos', title: '⚡ Exclusiva Pedidos Listo', text: '⚡ EXCLUSIVA PEDIDOS LISTO 🛵', bg: 'linear-gradient(135deg, #0a0e1a, #1e293b)', border: '#00e699', anim: 'studio-neon-border' },
  { id: 'b-new-10', category: '💥 Lanzamientos', title: '🎁 Sorpresa del Chef', text: '🎁 SORPRESA DEL CHEF 👑', bg: 'linear-gradient(135deg, #0284c7, #0369a1)', border: '#38bdf8', anim: 'studio-neon-border' },

  // CATEGORY 6: 🍔 Fast Food & Combos (10 Banners)
  { id: 'b-ff-1', category: '🍔 Fast Food & Combos', title: '🍔 Combo Burger & Papas', text: '🍔 COMBO BURGER & PAPAS FRITAS 🍟', bg: 'linear-gradient(135deg, #ff6b00, #d97706)', border: '#ff6b00', anim: 'studio-fire-border' },
  { id: 'b-ff-2', category: '🍔 Fast Food & Combos', title: '🍗 Cubeta Familiar Pollo', text: '🍗 CUBETA FAMILIAR POLLO 🪣', bg: 'linear-gradient(135deg, #b91c1c, #991b1b)', border: '#ef4444', anim: 'studio-fire-border' },
  { id: 'b-ff-3', category: '🍔 Fast Food & Combos', title: '🍕 Pizza Gigante Familiar', text: '🍕 PIZZA GIGANTE FAMILIAR 🧀', bg: 'linear-gradient(135deg, #c2410c, #9a3412)', border: '#f97316', anim: 'studio-fire-border' },
  { id: 'b-ff-4', category: '🍔 Fast Food & Combos', title: '🌮 Taco Fest Combo', text: '🌮 TACO FEST COMBO MEXICANO 🌶️', bg: 'linear-gradient(135deg, #15803d, #166534)', border: '#22c55e', anim: 'studio-neon-border' },
  { id: 'b-ff-5', category: '🍔 Fast Food & Combos', title: '🍟 Papas Fritas Extra Queso', text: '🍟 PAPAS FRITAS EXTRA QUESO 🧀', bg: 'linear-gradient(135deg, #eab308, #ca8a04)', border: '#fde047', anim: 'studio-gold-border' },
  { id: 'b-ff-6', category: '🍔 Fast Food & Combos', title: '🥤 Incluye Bebida Gratis', text: '🥤 INCLUYE BEBIDA GRATIS 🧊', bg: 'linear-gradient(135deg, #0284c7, #075985)', border: '#38bdf8', anim: 'studio-neon-border' },
  { id: 'b-ff-7', category: '🍔 Fast Food & Combos', title: '🍔 Doble Carne Extra Bacon', text: '🍔 DOBLE CARNE EXTRA BACON 🥓', bg: 'linear-gradient(135deg, #78350f, #451a03)', border: '#d97706', anim: 'studio-fire-border' },
  { id: 'b-ff-8', category: '🍔 Fast Food & Combos', title: '🍗 Piezas Crujientes Hot', text: '🍗 PIEZAS CROCANTES HOT 🌶️', bg: 'linear-gradient(135deg, #dc2626, #991b1b)', border: '#f87171', anim: 'studio-fire-border' },
  { id: 'b-ff-9', category: '🍔 Fast Food & Combos', title: '🍕 2 Pizzas Grandes por 1', text: '🍕 2 PIZZAS GRANDES POR 1 🏷️', bg: 'linear-gradient(135deg, #ea580c, #9a3412)', border: '#fb923c', anim: 'studio-fire-border' },
  { id: 'b-ff-10', category: '🍔 Fast Food & Combos', title: '🌭 Perro Caliente Dominicano', text: '🌭 PERRO CALIENTE DOMINICANO 🇩🇴', bg: 'linear-gradient(135deg, #2563eb, #1e40af)', border: '#60a5fa', anim: 'studio-neon-border' },

  // CATEGORY 7: 🌱 Saludable & Fitness (10 Banners)
  { id: 'b-fit-1', category: '🌱 Saludable & Fitness', title: '🌱 100% Natural & Saludable', text: '🌱 100% NATURAL & SALUDABLE 🥗', bg: 'linear-gradient(135deg, #059669, #047857)', border: '#00e699', anim: 'studio-neon-border' },
  { id: 'b-fit-2', category: '🌱 Saludable & Fitness', title: '🥑 Fit Keto Approved', text: '🥑 FIT KETO APPROVED 🥑', bg: 'linear-gradient(135deg, #15803d, #14532d)', border: '#4ade80', anim: 'studio-neon-border' },
  { id: 'b-fit-3', category: '🌱 Saludable & Fitness', title: '🌾 Sin Gluten Gluten-Free', text: '🌾 SIN GLUTEN GLUTEN-FREE 🌾', bg: 'linear-gradient(135deg, #d97706, #92400e)', border: '#fbbf24', anim: 'studio-gold-border' },
  { id: 'b-fit-4', category: '🌱 Saludable & Fitness', title: '🥗 Ensalada Fresh Organics', text: '🥗 ENSALADA FRESH ORGANICS 🍏', bg: 'linear-gradient(135deg, #16a34a, #15803d)', border: '#86efac', anim: 'studio-neon-border' },
  { id: 'b-fit-5', category: '🌱 Saludable & Fitness', title: '🍏 Bajos en Calorías', text: '🍏 BAJOS EN CALORÍAS FIT 💪', bg: 'linear-gradient(135deg, #0284c7, #0369a1)', border: '#38bdf8', anim: 'studio-neon-border' },
  { id: 'b-fit-6', category: '🌱 Saludable & Fitness', title: '🥑 Proteína Completa Fit', text: '🥑 PROTEÍNA COMPLETA FIT 🍳', bg: 'linear-gradient(135deg, #0d9488, #115e59)', border: '#2dd4bf', anim: 'studio-neon-border' },
  { id: 'b-fit-7', category: '🌱 Saludable & Fitness', title: '🌱 Opción 100% Vegana', text: '🌱 OPCIÓN 100% VEGANA 🌿', bg: 'linear-gradient(135deg, #16a34a, #14532d)', border: '#4ade80', anim: 'studio-neon-border' },
  { id: 'b-fit-8', category: '🌱 Saludable & Fitness', title: '🥤 Jugos Naturales 100% Fruta', text: '🥤 JUGOS NATURALES 100% FRUTA 🍊', bg: 'linear-gradient(135deg, #ea580c, #c2410c)', border: '#fb923c', anim: 'studio-fire-border' },
  { id: 'b-fit-9', category: '🌱 Saludable & Fitness', title: '🥗 Fresh Garden Salad', text: '🥗 FRESH GARDEN SALAD 🥦', bg: 'linear-gradient(135deg, #059669, #064e3b)', border: '#34d399', anim: 'studio-neon-border' },
  { id: 'b-fit-10', category: '🌱 Saludable & Fitness', title: '🥑 Aguacate Fresco Criollo', text: '🥑 AGUACATE FRESCO CRIOLLO 🇩🇴', bg: 'linear-gradient(135deg, #15803d, #166534)', border: '#86efac', anim: 'studio-neon-border' },

  // CATEGORY 8: 🚚 Delivery & Envíos (10 Banners)
  { id: 'b-del-1', category: '🚚 Delivery & Envíos', title: '🚚 Delivery Gratis Hoy', text: '🚚 DELIVERY GRATIS HOY EN SANTIAGO 📦', bg: 'linear-gradient(135deg, #ff6b00, #ff8533)', border: '#ff6b00', anim: 'studio-fire-border' },
  { id: 'b-del-2', category: '🚚 Delivery & Envíos', title: '⏱️ Entrega en 15 Minutos', text: '⏱️ ENTREGA EN 15 MINUTOS 🛵', bg: 'linear-gradient(135deg, #0284c7, #0369a1)', border: '#38bdf8', anim: 'studio-neon-border' },
  { id: 'b-del-3', category: '🚚 Delivery & Envíos', title: '🛵 Envío Exprés Mándame', text: '🛵 ENVÍO EXPRÉS MÁNDAME ⚡', bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: '#60a5fa', anim: 'studio-neon-border' },
  { id: 'b-del-4', category: '🚚 Delivery & Envíos', title: '🛡️ Garantía PIN OTP', text: '🛡️ GARANTÍA ENTREGA TOKEN PIN OTP 🔒', bg: 'linear-gradient(135deg, #059669, #047857)', border: '#00e699', anim: 'studio-neon-border' },
  { id: 'b-del-5', category: '🚚 Delivery & Envíos', title: '📦 Empaque Térmico Mantén Caliente', text: '📦 EMPAQUE TÉRMICO MANTIENE CALIENTE 🔥', bg: 'linear-gradient(135deg, #dc2626, #991b1b)', border: '#ef4444', anim: 'studio-fire-border' },
  { id: 'b-del-6', category: '🚚 Delivery & Envíos', title: '🚚 Envío RD$ 0 Santiago', text: '🚚 ENVÍO RD$ 0 EN TODO SANTIAGO 🎉', bg: 'linear-gradient(135deg, #16a34a, #15803d)', border: '#4ade80', anim: 'studio-neon-border' },
  { id: 'b-del-7', category: '🚚 Delivery & Envíos', title: '🛵 Conductor VIP Listo', text: '🛵 CONDUCTOR VIP PEDIDOS LISTO 💛', bg: 'linear-gradient(135deg, #ff6b00, #d97706)', border: '#ffb703', anim: 'studio-gold-border' },
  { id: 'b-del-8', category: '🚚 Delivery & Envíos', title: '⏱️ Preparación Súper Rápida', text: '⏱️ PREPARACIÓN SÚPER RÁPIDA ⚡', bg: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: '#c084fc', anim: 'studio-neon-border' },
  { id: 'b-del-9', category: '🚚 Delivery & Envíos', title: '🚚 Envío Priority 10 Min', text: '🚚 ENVÍO PRIORITY 10 MIN 🚀', bg: 'linear-gradient(135deg, #0284c7, #0f172a)', border: '#38bdf8', anim: 'studio-neon-border' },
  { id: 'b-del-10', category: '🚚 Delivery & Envíos', title: '🛵 Cobertura Santiago Completa', text: '🛵 COBERTURA SANTIAGO COMPLETA 🇩🇴', bg: 'linear-gradient(135deg, #002590, #ce1126)', border: '#ffffff', anim: 'studio-fire-border' },

  // CATEGORY 9: 🌙 Trasnochadores & Noche (10 Banners)
  { id: 'b-night-1', category: '🌙 Trasnochadores', title: '🌙 Bajón de Medianoche', text: '🌙 BAJÓN DE MEDIANOCHE LISTO 🍔', bg: 'linear-gradient(135deg, #1e1b4b, #0f172a)', border: '#818cf8', anim: 'studio-neon-border' },
  { id: 'b-night-2', category: '🌙 Trasnochadores', title: '🔥 Yaroa Especial Noche', text: '🔥 YAROA ESPECIAL NOCTURNA 🥓', bg: 'linear-gradient(135deg, #311b92, #ff6b00)', border: '#ff6b00', anim: 'studio-fire-border' },
  { id: 'b-night-3', category: '🌙 Trasnochadores', title: '🍔 Abierto Hasta Tardísimo', text: '🍔 ABIERTO HASTA TARDÍSIMO ⏰', bg: 'linear-gradient(135deg, #4c1d95, #1e1b4b)', border: '#a855f7', anim: 'studio-neon-border' },
  { id: 'b-night-4', category: '🌙 Trasnochadores', title: '🍻 Combo Cerveza & Bocado', text: '🍻 COMBO CERVEZA & BOCADO 🍺', bg: 'linear-gradient(135deg, #d97706, #78350f)', border: '#fbbf24', anim: 'studio-gold-border' },
  { id: 'b-night-5', category: '🌙 Trasnochadores', title: '🌙 Antojo Nocturno 24/7', text: '🌙 ANTOJO NOCTURNO 24/7 ✨', bg: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '#38bdf8', anim: 'studio-neon-border' },
  { id: 'b-night-6', category: '🌙 Trasnochadores', title: '🔥 Mofonguito Noche', text: '🔥 MOFONGUITO TRASNOCHADOR 🧄', bg: 'linear-gradient(135deg, #854d0e, #311b92)', border: '#eab308', anim: 'studio-gold-border' },
  { id: 'b-night-7', category: '🌙 Trasnochadores', title: '🍟 Papas Suprema Noche', text: '🍟 PAPAS SUPREMA DE NOCHE 🧀', bg: 'linear-gradient(135deg, #ca8a04, #1e1b4b)', border: '#fde047', anim: 'studio-gold-border' },
  { id: 'b-night-8', category: '🌙 Trasnochadores', title: '🍕 Pizza Trasnochadora', text: '🍕 PIZZA TRASNOCHADORA HOT 🍕', bg: 'linear-gradient(135deg, #b91c1c, #311b92)', border: '#ef4444', anim: 'studio-fire-border' },
  { id: 'b-night-9', category: '🌙 Trasnochadores', title: '🌙 Especial Madrugada', text: '🌙 ESPECIAL DE MADRUGADA ⏰', bg: 'linear-gradient(135deg, #0284c7, #1e1b4b)', border: '#38bdf8', anim: 'studio-neon-border' },
  { id: 'b-night-10', category: '🌙 Trasnochadores', title: '🔥 Bajonero Certificado', text: '🔥 BAJONERO CERTIFICADO 👑', bg: 'linear-gradient(135deg, #ff6b00, #311b92)', border: '#ff6b00', anim: 'studio-fire-border' },

  // CATEGORY 10: 🎉 Fiestas & Celebración (10 Banners)
  { id: 'b-party-1', category: '🎉 Fiestas & Celebraciones', title: '🎉 Oferta de Cumpleaños', text: '🎉 OFERTA CUMPLEAÑOS ESPECIAL 🍰', bg: 'linear-gradient(135deg, #db2777, #9d174d)', border: '#f43f5e', anim: 'studio-fire-border' },
  { id: 'b-party-2', category: '🎉 Fiestas & Celebraciones', title: '🥳 Combo Fiestón Criollo', text: '🥳 COMBO FIESTÓN CRIOLLO 🇩🇴', bg: 'linear-gradient(135deg, #002590, #ce1126)', border: '#ffb703', anim: 'studio-gold-border' },
  { id: 'b-party-3', category: '🎉 Fiestas & Celebraciones', title: '🍻 Cerveza bien Fría Presidente', text: '🍻 CERVEZA BIEN FRÍA PRESIDENTE 🍺', bg: 'linear-gradient(135deg, #15803d, #14532d)', border: '#86efac', anim: 'studio-neon-border' },
  { id: 'b-party-4', category: '🎉 Fiestas & Celebraciones', title: '🍾 Botella & Licores Fríos', text: '🍾 BOTELLA & LICORES FRÍOS 🥂', bg: 'linear-gradient(135deg, #7c3aed, #4c1d95)', border: '#c084fc', anim: 'studio-neon-border' },
  { id: 'b-party-5', category: '🎉 Fiestas & Celebraciones', title: '🎉 Party Pack 10 Personas', text: '🎉 PARTY PACK 10 PERSONAS 🍕', bg: 'linear-gradient(135deg, #ea580c, #9a3412)', border: '#fb923c', anim: 'studio-fire-border' },
  { id: 'b-party-6', category: '🎉 Fiestas & Celebraciones', title: '🥳 Domingos de Familia', text: '🥳 DOMINGOS DE FAMILIA LISTO 💛', bg: 'linear-gradient(135deg, #ff6b00, #d97706)', border: '#ffb703', anim: 'studio-gold-border' },
  { id: 'b-party-7', category: '🎉 Fiestas & Celebraciones', title: '🍻 Happy Hour 2x1', text: '🍻 HAPPY HOUR 2X1 LICORES 🍹', bg: 'linear-gradient(135deg, #e11d48, #9f1239)', border: '#fda4af', anim: 'studio-fire-border' },
  { id: 'b-party-8', category: '🎉 Fiestas & Celebraciones', title: '🎉 Fin de Semana de Fiesta', text: '🎉 FIN DE SEMANA DE FIESTA 🥳', bg: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: '#60a5fa', anim: 'studio-neon-border' },
  { id: 'b-party-9', category: '🎉 Fiestas & Celebraciones', title: '🥳 Celebración Pedidos Listo', text: '🥳 CELEBRACIÓN PEDIDOS LISTO 🎂', bg: 'linear-gradient(135deg, #059669, #047857)', border: '#34d399', anim: 'studio-neon-border' },
  { id: 'b-party-10', category: '🎉 Fiestas & Celebraciones', title: '🍻 Cubetazo Cervezas', text: '🍻 CUBETAZO CERVEZAS FRÍAS 🧊', bg: 'linear-gradient(135deg, #0284c7, #075985)', border: '#38bdf8', anim: 'studio-neon-border' }
];

const INITIAL_STORES = [
  {
    id: 'store-1',
    name: 'KFC Las Colinas Santiago',
    rating: 4.8,
    ratingText: '4.8 ⭐',
    timeMinutes: 20,
    time: '15-25 min',
    deliveryFee: 0,
    badge: 'Bucket 33% OFF',
    category: 'bocado',
    image: 'assets/burger_3d.png'
  },
  {
    id: 'store-2',
    name: 'Cartel De Los Tacos',
    rating: 4.3,
    ratingText: '4.3 ⭐',
    timeMinutes: 15,
    time: '10-25 min',
    deliveryFee: 100,
    badge: 'Envío Gratis Mándame',
    category: 'bocado',
    image: 'assets/burger_3d.png'
  },
  {
    id: 'store-3',
    name: 'Mofongo Xpress & Yaroa',
    rating: 4.9,
    ratingText: '4.9 ⭐',
    timeMinutes: 18,
    time: '12-20 min',
    deliveryFee: 0,
    badge: '⭐ El Más Vendido',
    category: 'criollo',
    image: 'assets/burger_3d.png'
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    storeId: 'store-1',
    name: 'Bucket Familiar KFC (8 Pzs)',
    price: 999,
    description: '8 piezas de pollo crujiente receta secreta con papas grandes.',
    image: 'assets/burger_3d.png',
    inStock: true
  },
  {
    id: 'prod-2',
    storeId: 'store-1',
    name: 'Combo Yaroa Especial Mándame',
    price: 330,
    description: 'Yaroa de papa con pollo, carne molida y extra queso fundido.',
    image: 'assets/burger_3d.png',
    inStock: true
  },
  {
    id: 'prod-3',
    storeId: 'store-1',
    name: 'Refresco Cola 2L',
    price: 55,
    description: 'Refresco sabor cola bien frío 2 Litros.',
    image: 'assets/drinks_3d_1791137124884.png',
    inStock: true
  },
  {
    id: 'prod-4',
    storeId: 'store-1',
    name: 'Salcocho Criollo 7 Carnes',
    price: 480,
    description: 'Sancocho dominicano espeso con víveres, carne de res, cerdo y pollo con arroz.',
    image: 'assets/burger_3d.png',
    inStock: true
  }
];

export default function MandamePage({ navigate, userData, userRole, lang }) {
  const isMerchantUser = Boolean(
    userData?.role === 'merchant' ||
    userData?.role === 'comercio' ||
    userData?.type === 'comercio' ||
    userData?.isMerchant === true ||
    userData?.email === 'listopatron.app@gmail.com' ||
    userData?.email === 'admin@listopatron.com.do' ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('force_listo_merchant_mode') === 'true')
  );

  const [viewMode, setViewMode] = useState(() => {
    try {
      if (isMerchantUser) {
        const saved = localStorage.getItem('pedidos_listo_view_mode');
        if (saved === 'merchant' || localStorage.getItem('force_listo_merchant_mode') === 'true') {
          return 'merchant';
        }
      }
    } catch (e) {}
    return 'client';
  }); // 'client' | 'merchant'

  // Garantizar que los usuarios normales sin comercio siempre vean la app de cliente normal
  useEffect(() => {
    if (!isMerchantUser && viewMode !== 'client') {
      setViewMode('client');
    }
  }, [isMerchantUser, viewMode]);

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('pedidos_listo_view_mode', mode);
      if (mode === 'merchant') {
        localStorage.setItem('force_listo_merchant_mode', 'true');
      } else {
        localStorage.removeItem('force_listo_merchant_mode');
      }
    } catch (e) {}
  };

  // Escuchar cambios de pestaña desde la barra de navegación global (Ej: Mercado, Buscar, Pedidos)
  useEffect(() => {
    const handleSwitch = (e) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('mandame-switch-tab', handleSwitch);
    return () => window.removeEventListener('mandame-switch-tab', handleSwitch);
  }, []);

  const [activeTab, setActiveTab] = useState('inicio'); // 'inicio' | 'mercado' | 'promociones' | 'pedidos' | 'buscar'
  const [merchantTab, setMerchantTab] = useState('catalogo'); // 'resumen' | 'pedidos' | 'catalogo' | 'promos' | 'resenas' | 'finanzas' | 'perfil'

  // Cart & State
  const [cart, setCart] = useState([]);
  const [selectedTip, setSelectedTip] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [activeStoreModal, setActiveStoreModal] = useState(null);
  const [storeModalTab, setStoreModalTab] = useState('menu'); // 'menu' | 'info'
  const [customizeProduct, setCustomizeProduct] = useState(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Merchant Dish Form State (Uber Eats Style)
  const [merchantState, setMerchantState] = useState(() => {
    try {
      const saved = localStorage.getItem('pedidos_listo_merchant_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            storeName: parsed.storeName || 'KFC Las Colinas Santiago',
            status: parsed.status || 'open',
            prepTime: parsed.prepTime || '15-25',
            address: parsed.address || 'Av. Juan Pablo Duarte #10, Santiago',
            todaySales: typeof parsed.todaySales === 'number' ? parsed.todaySales : 18450,
            todayOrdersCount: typeof parsed.todayOrdersCount === 'number' ? parsed.todayOrdersCount : 42,
            products: (Array.isArray(parsed.products) && parsed.products.length > 0) ? parsed.products : INITIAL_PRODUCTS,
            orders: (Array.isArray(parsed.orders) && parsed.orders.length > 0) ? parsed.orders : [
              {
                id: 'ORD-7719',
                customerName: 'Juan Pérez',
                customerPhone: '809-555-0199',
                address: 'Av. Juan Pablo Duarte #10, Apt 3B, Santiago',
                items: [
                  { name: 'Bucket Familiar KFC (8 Pzs)', qty: 1, price: 999, details: 'Con Tostones Crujientes y Coca Cola 2L' },
                  { name: 'Refresco Cola 2L', qty: 1, price: 55, details: 'Bien Frío' }
                ],
                total: 1054,
                pinOTP: '7492',
                status: 'new',
                driverName: 'Kelvin Santos (Mándame 🛵)',
                createdAt: 'Hace 2 mins',
                paymentMethod: '💳 Tarjeta Banreservas'
              },
              {
                id: 'ORD-7718',
                customerName: 'María Rodríguez',
                customerPhone: '809-555-0842',
                address: 'C. Perimetral Oeste #45, Santiago',
                items: [
                  { name: 'Combo Yaroa Especial Mándame', qty: 2, price: 330, details: 'Extra Queso Frito y Chicharrón' }
                ],
                total: 715,
                pinOTP: '3819',
                status: 'cooking',
                driverName: 'Asignando Conductor 🛵',
                createdAt: 'Hace 12 mins',
                paymentMethod: '💵 Efectivo Contra Entrega'
              }
            ]
          };
        }
      }
    } catch (e) {}
    return {
      storeName: 'KFC Las Colinas Santiago',
      status: 'open',
      prepTime: '15-25',
      address: 'Av. Juan Pablo Duarte #10, Santiago',
      todaySales: 18450,
      todayOrdersCount: 42,
      products: INITIAL_PRODUCTS,
      orders: [
        {
          id: 'ORD-7719',
          customerName: 'Juan Pérez',
          customerPhone: '809-555-0199',
          address: 'Av. Juan Pablo Duarte #10, Apt 3B, Santiago',
          items: [
            { name: 'Bucket Familiar KFC (8 Pzs)', qty: 1, price: 999, details: 'Con Tostones Crujientes y Coca Cola 2L' },
            { name: 'Refresco Cola 2L', qty: 1, price: 55, details: 'Bien Frío' }
          ],
          total: 1054,
          pinOTP: '7492',
          status: 'new',
          driverName: 'Kelvin Santos (Mándame 🛵)',
          createdAt: 'Hace 2 mins',
          paymentMethod: '💳 Tarjeta Banreservas'
        },
        {
          id: 'ORD-7718',
          customerName: 'María Rodríguez',
          customerPhone: '809-555-0842',
          address: 'C. Perimetral Oeste #45, Santiago',
          items: [
            { name: 'Combo Yaroa Especial Mándame', qty: 2, price: 330, details: 'Extra Queso Frito y Chicharrón' }
          ],
          total: 715,
          pinOTP: '3819',
          status: 'cooking',
          driverName: 'Asignando Conductor 🛵',
          createdAt: 'Hace 12 mins',
          paymentMethod: '💵 Efectivo Contra Entrega'
        }
      ]
    };
  });

  // Form New Product Controls
  const [newProdName, setNewProdName] = useState('Yaroa de Pollo & Queso Mofongo');
  const [newProdPrice, setNewProdPrice] = useState('450');
  const [newProdCategory, setNewProdCategory] = useState('plato_dia');
  const [newProdDesc, setNewProdDesc] = useState('Plátano majado con ajo criollo, chicharrón crocante y salsa especial.');
  const [newProdImages, setNewProdImages] = useState(['assets/burger_3d.png']);
  const [activePreviewImageIndex, setActivePreviewImageIndex] = useState(0);
  const [customizeModalImgIndex, setCustomizeModalImgIndex] = useState(0);
  
  // Dish Photo Editor Ultra Pro State
  const [editingPhotoIndex, setEditingPhotoIndex] = useState(null);
  const [editorTab, setEditorTab] = useState('emojis'); // 'emojis' | 'templates' | 'filters' | 'adjust' | 'effects'
  const [photoTemplate, setPhotoTemplate] = useState('fire_flash'); // 'none' | 'fire_flash' | 'discount_50' | 'gold_star' | 'flag_criollo' | 'healthy_green' | 'new_launch'
  const [photoFilter, setPhotoFilter] = useState('gourmet');
  const [photoBrightness, setPhotoBrightness] = useState(110);
  const [photoContrast, setPhotoContrast] = useState(105);
  const [photoSaturate, setPhotoSaturate] = useState(120);
  const [photoRotate, setPhotoRotate] = useState(0);
  const [photoFlipH, setPhotoFlipH] = useState(false);
  const [photoVignette, setPhotoVignette] = useState(true);
  const [photoSticker, setPhotoSticker] = useState('🔥 Recién Hecho');
  const [customOfferText, setCustomOfferText] = useState('50% OFF');

  // 100 Animated Banners Catalog State
  const [bannerCategory, setBannerCategory] = useState('🔥 Fuegos & Relámpagos');
  const [selectedBannerId, setSelectedBannerId] = useState('b-fire-1');

  // Published Dish Photos Management State
  const [editingDishPhotosId, setEditingDishPhotosId] = useState(null);

  // Interactive Emoji Placement State
  const [placedEmojis, setPlacedEmojis] = useState([
    { id: 'em-1', text: '🔥', x: 20, y: 20, size: 36 },
    { id: 'em-2', text: '⚡', x: 80, y: 20, size: 36 }
  ]);
  const [activeEmojiId, setActiveEmojiId] = useState(null);

  const [selectedDietaryTags, setSelectedDietaryTags] = useState(['🔥 Más Vendido']);
  const [selectedGuarniciones, setSelectedGuarniciones] = useState(['🍌 Tostones Crujientes', '🍟 Papas Fritas']);
  const [selectedBebidas, setSelectedBebidas] = useState(['Coca Cola 2L', 'Jugo Chinola']);
  const [selectedExtras, setSelectedExtras] = useState(['Chicharrón Extra (+120)', 'Queso Frito (+80)']);
  const [isFlashOffer, setIsFlashOffer] = useState(false);
  const [prepTimeShift, setPrepTimeShift] = useState('15-25');
  const [menuShift, setMenuShift] = useState('all');

  // Kitchen Terminal & Comandera Realtime State
  const [kitchenFilterTab, setKitchenFilterTab] = useState('all'); // 'all' | 'new' | 'cooking' | 'ready' | 'completed'
  const [isSoundAlarmEnabled, setIsSoundAlarmEnabled] = useState(true);
  const [selectedTicketOrder, setSelectedTicketOrder] = useState(null);
  const [otpInputValues, setOtpInputValues] = useState({});

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('pedidos_listo_merchant_state', JSON.stringify(merchantState));
    } catch (e) {}
  }, [merchantState]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const [selectedAlarmSound, setSelectedAlarmSound] = useState(() => {
    try {
      return localStorage.getItem('pedidos_listo_alarm_sound') || 'alarm_kitchen';
    } catch (e) {
      return 'alarm_kitchen';
    }
  });

  const handleSelectAlarmSound = (soundType) => {
    setSelectedAlarmSound(soundType);
    try {
      localStorage.setItem('pedidos_listo_alarm_sound', soundType);
    } catch (e) {}
    playKitchenAlarmSound(soundType);
    showToast(`🔊 Tono de alerta cambiado a: ${soundType === 'chaching' ? '💰 Caja Registradora' : soundType === 'siren' ? '📢 Sirena Emergencia' : soundType === 'chime' ? '🔔 Timbre Clásico' : '🚨 Alarma Cocina High-Volume'}`);
  };

  const playKitchenAlarmSound = (soundType = selectedAlarmSound) => {
    try {
      const selectedAudio = localStorage.getItem('listo_sound_order') || 'new_contract_v3';
      const audio = new Audio(`/audio/${selectedAudio}.mp3`);
      audio.volume = 1.0;
      audio.play().catch(() => {});
    } catch (e) {}

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (soundType === 'chaching') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.3);
      } else if (soundType === 'siren') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.35);
      } else if (soundType === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
      } else {
        // 'alarm_kitchen' por defecto
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.25);
      }

      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {}
  };

  const handleAcceptAndCookOrder = (orderId) => {
    setMerchantState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === orderId ? { ...o, status: 'cooking' } : o)
    }));
    showToast('👨‍🍳 Pedido Aceptado. ¡Cocinando en Comandera!');
  };

  const handleMarkOrderReady = (orderId) => {
    setMerchantState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === orderId ? { ...o, status: 'ready', driverName: 'Kelvin Santos (Mándame 🛵)' } : o)
    }));
    showToast('🟢 Pedido listo en mostrador. Asignado a Repartidor Mándame.');
  };

  const handleVerifyOTPAndCompleteOrder = (orderId) => {
    const enteredOTP = otpInputValues[orderId] || '';
    const targetOrder = merchantState.orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    if (enteredOTP.trim() === targetOrder.pinOTP) {
      setMerchantState(prev => ({
        ...prev,
        todaySales: prev.todaySales + targetOrder.total,
        todayOrdersCount: prev.todayOrdersCount + 1,
        orders: prev.orders.map(o => o.id === orderId ? { ...o, status: 'completed' } : o)
      }));
      showToast('🔒 ¡Token PIN OTP Validado! Pedido entregado con éxito.');
    } else {
      alert(`❌ Token PIN OTP incorrecto. El cliente/repartidor debe proporcionar la clave válida (${targetOrder.pinOTP}).`);
    }
  };

  const handleSimulateNewIncomingOrder = () => {
    const newId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const mockOrder = {
      id: newId,
      customerName: 'Carlos Gómez',
      customerPhone: '809-555-4920',
      address: 'Calle Del Sol #88, Zona Colonial, Santiago',
      items: [
        { name: 'Yaroa de Pollo & Queso Mofongo', qty: 2, price: 450, details: 'Con Tostones y Extra Queso Frito' },
        { name: 'Jugo Chinola 16oz', qty: 2, price: 80, details: 'Bien Frío' }
      ],
      total: 1060,
      pinOTP: newOtp,
      status: 'new',
      driverName: 'Buscando Repartidor 🛵',
      createdAt: 'Ahora mismo',
      paymentMethod: '💳 Tarjeta Banreservas'
    };

    setMerchantState(prev => ({
      ...prev,
      orders: [mockOrder, ...prev.orders]
    }));

    if (isSoundAlarmEnabled) {
      playKitchenAlarmSound();
      setTimeout(playKitchenAlarmSound, 450);
      setTimeout(playKitchenAlarmSound, 900);
    }
    showToast('🔔 ¡NUEVO PEDIDO RECIBIDO EN COMANDERA!');
  };

  // =========================================================================
  // PEDIDOS LISTO PUNTO DE VENTAS (POS CAJA & MOSTRADOR) STATE & HANDLERS
  // =========================================================================
  const [posCart, setPosCart] = useState([]);
  const [posOrderType, setPosOrderType] = useState('takeout'); // 'takeout' | 'dinein' | 'delivery'
  const [posTableNumber, setPosTableNumber] = useState('Mesa 1');
  const [posCustomerName, setPosCustomerName] = useState('Cliente Mostrador');
  const [posPaymentMethod, setPosPaymentMethod] = useState('cash'); // 'cash' | 'card' | 'transfer'
  const [posCashTendered, setPosCashTendered] = useState('1000');
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posCategoryFilter, setPosCategoryFilter] = useState('all');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [isCashReportOpen, setIsCashReportOpen] = useState(false);

  const handleAddPosCartItem = (product) => {
    setPosCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.price), qty: 1 }];
    });
    showToast(`🛒 Añadido a Caja: ${product.name}`);
  };

  const handleAddCustomPosItem = (e) => {
    e.preventDefault();
    if (!customItemName || !customItemPrice) return;
    const newItem = {
      id: 'custom-' + Date.now(),
      name: customItemName,
      price: Number(customItemPrice),
      qty: 1
    };
    setPosCart(prev => [...prev, newItem]);
    setCustomItemName('');
    setCustomItemPrice('');
    showToast(`✨ Ítem Personalizado Agregado a Caja`);
  };

  const handleDecreasePosQty = (id) => {
    setPosCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0));
  };

  const handleIncreasePosQty = (id) => {
    setPosCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  };

  const handleRemovePosItem = (id) => {
    setPosCart(prev => prev.filter(i => i.id !== id));
  };

  // DGII NCF Fiscal & Coupon State
  const [posNcfType, setPosNcfType] = useState('B02'); // 'B02' (Consumo) | 'B01' (Crédito Fiscal) | 'B14' (Especial)
  const [posRncNumber, setPosRncNumber] = useState('');
  const [posDiscountAmount, setPosDiscountAmount] = useState(0); // RD$ discount
  const [posCouponCode, setPosCouponCode] = useState('');
  const [posActiveCashier, setPosActiveCashier] = useState('Juan Pérez (Cajero #1)');

  const handleApplyPosCoupon = () => {
    if (!posCouponCode || typeof posCouponCode !== 'string') return;
    const codeUpper = posCouponCode.toUpperCase().trim();
    if (codeUpper === 'LISTO200' || codeUpper === 'PROMO200') {
      setPosDiscountAmount(200);
      showToast('🏷️ Cupón LISTO200 Aplicado: RD$ 200 OFF');
    } else if (codeUpper === 'DESCUENTO10' || codeUpper === '10OFF') {
      const currentSub = posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const disc = Math.round(currentSub * 0.10);
      setPosDiscountAmount(disc);
      showToast(`🏷️ Cupón 10% OFF Aplicado: RD$ ${disc} OFF`);
    } else {
      showToast('⚠️ Cupón no válido (Prueba con LISTO200 o 10OFF)');
    }
  };

  const handleCheckoutPosOrder = () => {
    if (posCart.length === 0) {
      showToast('⚠️ Agrega platillos a la caja antes de cobrar');
      return;
    }

    const rawTotal = posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const finalTotal = Math.max(0, rawTotal - posDiscountAmount);
    const newOrderId = 'POS-' + Math.floor(1000 + Math.random() * 9000);
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    const generatedNcf = `${posNcfType}000${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newOrderObj = {
      id: newOrderId,
      customerName: posCustomerName || (posOrderType === 'dinein' ? `Mesa (${posTableNumber})` : 'Cliente Mostrador'),
      customerPhone: '809-POS-LIVE',
      address: posOrderType === 'dinein' ? `Mesa: ${posTableNumber}` : posOrderType === 'takeout' ? 'Mostrador (Para Llevar)' : 'Delivery Mándame',
      items: posCart.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      subtotal: rawTotal,
      discount: posDiscountAmount,
      total: finalTotal,
      pinOTP: generatedPin,
      ncf: generatedNcf,
      ncfTypeLabel: posNcfType === 'B01' ? 'B01 - Crédito Fiscal' : posNcfType === 'B14' ? 'B14 - Reg. Especial' : 'B02 - Consumo Final',
      rncNumber: posRncNumber || '131-98420-1',
      cashierName: posActiveCashier,
      status: 'new',
      driverName: posOrderType === 'delivery' ? 'Asignando Conductor 🛵' : 'Entrega en Barra 🏪',
      createdAt: 'Ahora mismo',
      paymentMethod: posPaymentMethod === 'cash' ? `💵 Efectivo (Pagó RD$ ${posCashTendered})` : posPaymentMethod === 'card' ? '💳 Tarjeta Verifone' : '📱 Transferencia Bancaria',
      cashTendered: posPaymentMethod === 'cash' ? Number(posCashTendered || finalTotal) : finalTotal,
      changeDue: posPaymentMethod === 'cash' ? Math.max(0, Number(posCashTendered || finalTotal) - finalTotal) : 0,
      orderTypeLabel: posOrderType === 'dinein' ? `🍽️ Mesa ${posTableNumber}` : posOrderType === 'takeout' ? '🛍️ Para Llevar' : '🛵 Delivery'
    };

    setMerchantState(prev => ({
      ...prev,
      todaySales: prev.todaySales + finalTotal,
      todayOrdersCount: prev.todayOrdersCount + 1,
      orders: [newOrderObj, ...prev.orders]
    }));

    if (isSoundAlarmEnabled) {
      playKitchenAlarmSound();
    }

    setPosCart([]);
    setPosDiscountAmount(0);
    setPosCouponCode('');
    setSelectedTicketOrder(newOrderObj);
    showToast(`✅ Venta #${newOrderId} Procesada (NCF ${generatedNcf})`);
  };

  // =========================================================================
  // INGREDIENTS & RAW MATERIAL STOCK CONTROL HANDLERS
  // =========================================================================
  const [ingredients, setIngredients] = useState([
    { id: 'ing-1', name: '🧀 Queso Frito Geo (Bloques)', stock: 15, unit: 'Kg', minAlert: 5, category: 'Lácteos' },
    { id: 'ing-2', name: '🍌 Plátano Verde Criollo', stock: 120, unit: 'Unidades', minAlert: 30, category: 'Víveres' },
    { id: 'ing-3', name: '🍗 Carne de Pollo Sazonada', stock: 25, unit: 'Kg', minAlert: 8, category: 'Carnes' },
    { id: 'ing-4', name: '🥓 Chicharrón Crocante', stock: 18, unit: 'Kg', minAlert: 6, category: 'Carnes' },
    { id: 'ing-5', name: '🧄 Ajo Criollo Molido', stock: 10, unit: 'Kg', minAlert: 3, category: 'Especias' },
    { id: 'ing-6', name: '🥤 Coca Cola 2L', stock: 45, unit: 'Botellas', minAlert: 10, category: 'Bebidas' }
  ]);
  const [newIngName, setNewIngName] = useState('');
  const [newIngStock, setNewIngStock] = useState('');
  const [newIngUnit, setNewIngUnit] = useState('Kg');
  const [newIngMinAlert, setNewIngMinAlert] = useState('5');
  const [newIngCategory, setNewIngCategory] = useState('Carnes');

  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!newIngName || !newIngStock) return;
    const newId = 'ing-' + Date.now();
    const item = {
      id: newId,
      name: newIngName,
      stock: Number(newIngStock),
      unit: newIngUnit,
      minAlert: Number(newIngMinAlert || 5),
      category: newIngCategory
    };
    setIngredients(prev => [...prev, item]);
    setNewIngName('');
    setNewIngStock('');
    showToast(`📦 Insumo "${newIngName}" agregado al inventario`);
  };

  const handleUpdateIngStock = (id, delta) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id !== id) return ing;
      const newStock = Math.max(0, ing.stock + delta);
      return { ...ing, stock: newStock };
    }));
    showToast('📦 Stock de insumo actualizado');
  };

  const handleDeleteIngredient = (id) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
    showToast('🗑️ Insumo eliminado');
  };

  const handleOpenDishPhotoManager = (dishId) => {
    setEditingDishPhotosId(dishId);
  };

  const handleOpenPublishedDishPhotoEditor = (dishId, photoIndex) => {
    setEditingDishPhotosId(dishId);
    handleOpenPhotoEditor(photoIndex);
  };

  const handleDeleteDishPhoto = (dishId, photoIndex) => {
    setMerchantState(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id !== dishId) return p;
        const currentImgs = (p.images && p.images.length > 0) ? [...p.images] : [p.image];
        const updatedImgs = currentImgs.filter((_, idx) => idx !== photoIndex);
        const finalImgs = updatedImgs.length > 0 ? updatedImgs : ['assets/burger_3d.png'];
        return {
          ...p,
          image: finalImgs[0],
          images: finalImgs
        };
      })
    }));
    showToast('🗑️ Foto eliminada del platillo');
  };

  const handleSetDishCoverPhoto = (dishId, photoIndex) => {
    setMerchantState(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id !== dishId) return p;
        const currentImgs = (p.images && p.images.length > 0) ? [...p.images] : [p.image];
        const selectedImg = currentImgs[photoIndex];
        const restImgs = currentImgs.filter((_, idx) => idx !== photoIndex);
        const newOrder = [selectedImg, ...restImgs];
        return {
          ...p,
          image: newOrder[0],
          images: newOrder
        };
      })
    }));
    showToast('⭐ Foto establecida como portada principal del platillo');
  };

  const handleAddPhotosToPublishedDish = (dishId, e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const readPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => resolve(evt.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(newImages => {
      setMerchantState(prev => ({
        ...prev,
        products: prev.products.map(p => {
          if (p.id !== dishId) return p;
          const currentImgs = (p.images && p.images.length > 0) ? [...p.images] : [p.image];
          const updated = [...currentImgs, ...newImages];
          return {
            ...p,
            image: updated[0],
            images: updated
          };
        })
      }));
      showToast(`📸 ${newImages.length} foto(s) agregada(s) al platillo`);
    });
  };

  const handleDeleteProductFromInventory = (dishId) => {
    const dish = merchantState.products.find(p => p.id === dishId);
    if (window.confirm(`⚠️ ¿Estás seguro de eliminar el platillo "${dish ? dish.name : ''}" del inventario?`)) {
      setMerchantState(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== dishId)
      }));
      if (editingDishPhotosId === dishId) setEditingDishPhotosId(null);
      showToast('🗑️ Platillo eliminado del inventario');
    }
  };

  const handleOpenPhotoEditor = (index) => {
    setEditingPhotoIndex(index);
    setEditorTab('emojis');
    setPhotoTemplate('fire_flash');
    setBannerCategory('🔥 Fuegos & Relámpagos');
    setSelectedBannerId('b-fire-1');
    setPhotoFilter('gourmet');
    setPhotoBrightness(110);
    setPhotoContrast(105);
    setPhotoSaturate(120);
    setPhotoRotate(0);
    setPhotoFlipH(false);
    setPhotoVignette(true);
    setPhotoSticker('🔥 Recién Hecho');
    setCustomOfferText('50% OFF');
    setPlacedEmojis([
      { id: 'em-1', text: '🔥', x: 20, y: 20, size: 36 },
      { id: 'em-2', text: '⚡', x: 80, y: 20, size: 36 }
    ]);
  };

  const handleAddEmojiSticker = (emojiChar) => {
    const newId = 'em-' + Date.now();
    const newSticker = {
      id: newId,
      text: emojiChar,
      x: 50,
      y: 50,
      size: 36
    };
    setPlacedEmojis(prev => [...prev, newSticker]);
    setActiveEmojiId(newId);
    showToast(`✨ Emoji ${emojiChar} agregado! Toca la foto para posicionarlo.`);
  };

  const handleRemovePlacedEmoji = (id) => {
    setPlacedEmojis(prev => prev.filter(e => e.id !== id));
    if (activeEmojiId === id) setActiveEmojiId(null);
  };

  const handleCanvasWorkspaceClick = (e) => {
    if (!activeEmojiId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPlacedEmojis(prev => prev.map(em => em.id === activeEmojiId ? { ...em, x: Math.round(clickX), y: Math.round(clickY) } : em));
  };

  const handleApplyFilterPreset = (preset) => {
    setPhotoFilter(preset);
    if (preset === 'gourmet') {
      setPhotoBrightness(110);
      setPhotoContrast(110);
      setPhotoSaturate(130);
    } else if (preset === 'crispy') {
      setPhotoBrightness(105);
      setPhotoContrast(125);
      setPhotoSaturate(140);
    } else if (preset === 'fresh') {
      setPhotoBrightness(115);
      setPhotoContrast(100);
      setPhotoSaturate(125);
    } else if (preset === 'luxury') {
      setPhotoBrightness(95);
      setPhotoContrast(135);
      setPhotoSaturate(110);
    } else if (preset === 'normal') {
      setPhotoBrightness(100);
      setPhotoContrast(100);
      setPhotoSaturate(100);
    }
  };

  const handleSavePhotoEdit = () => {
    if (editingPhotoIndex === null) return;
    let currentImgSrc = newProdImages[editingPhotoIndex];
    if (editingDishPhotosId) {
      const targetDish = merchantState.products.find(p => p.id === editingDishPhotosId);
      if (targetDish) {
        const dishImgs = (targetDish.images && targetDish.images.length > 0) ? targetDish.images : [targetDish.image];
        currentImgSrc = dishImgs[editingPhotoIndex] || targetDish.image;
      }
    }
    if (!currentImgSrc) currentImgSrc = 'assets/burger_3d.png';

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const rad = (photoRotate * Math.PI) / 180;
      const is90or270 = photoRotate === 90 || photoRotate === 270;
      canvas.width = is90or270 ? img.height : img.width;
      canvas.height = is90or270 ? img.width : img.height;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.scale(photoFlipH ? -1 : 1, 1);

      let filterStr = `brightness(${photoBrightness}%) contrast(${photoContrast}%) saturate(${photoSaturate}%)`;
      if (photoFilter === 'gourmet') filterStr += ' sepia(12%)';
      if (photoFilter === 'fresh') filterStr += ' hue-rotate(5deg)';
      if (photoFilter === 'crispy') filterStr += ' contrast(120%)';

      ctx.filter = filterStr;
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // 1. Draw Vignette Ring FX if enabled
      if (photoVignette) {
        const outerRadius = Math.max(canvas.width, canvas.height) * 0.75;
        const vignetteGradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.width * 0.25,
          canvas.width / 2, canvas.height / 2, outerRadius
        );
        vignetteGradient.addColorStop(0, 'rgba(0,0,0,0)');
        vignetteGradient.addColorStop(1, 'rgba(0,0,0,0.6)');
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Draw Active Banners (from 100 Catalog or Legacy Templates)
      const activeBannerObj = ANIMATED_BANNERS_CATALOG.find(b => b.id === selectedBannerId);
      if (activeBannerObj) {
        // Glowing Outer Border
        ctx.lineWidth = Math.max(12, canvas.width * 0.03);
        ctx.strokeStyle = activeBannerObj.border || '#ff6b00';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Top Banner Box
        const bHeight = Math.max(38, canvas.height * 0.11);
        const grad = ctx.createLinearGradient(0, 0, canvas.width, bHeight);
        if (activeBannerObj.border === '#ef4444' || activeBannerObj.border === '#ff5500') {
          grad.addColorStop(0, '#ff6b00');
          grad.addColorStop(1, '#ef4444');
        } else if (activeBannerObj.border === '#ffb703' || activeBannerObj.border === '#f59e0b') {
          grad.addColorStop(0, '#0a0e1a');
          grad.addColorStop(1, '#1e1b4b');
        } else if (activeBannerObj.border === '#ce1126' || activeBannerObj.border === '#002590') {
          grad.addColorStop(0, '#002590');
          grad.addColorStop(1, '#ce1126');
        } else if (activeBannerObj.border === '#00e699' || activeBannerObj.border === '#34d399') {
          grad.addColorStop(0, '#059669');
          grad.addColorStop(1, '#047857');
        } else {
          grad.addColorStop(0, '#ff6b00');
          grad.addColorStop(1, '#ff8533');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, bHeight);

        // Banner Text Overlay
        ctx.font = `900 ${Math.max(13, Math.floor(bHeight * 0.45))}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(activeBannerObj.text, canvas.width / 2, bHeight * 0.65);
      } else if (photoTemplate === 'fire_flash') {
        // Flame Gradient Border
        ctx.lineWidth = Math.max(12, canvas.width * 0.03);
        ctx.strokeStyle = '#ff6b00';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Top Banner
        const bHeight = Math.max(34, canvas.height * 0.1);
        ctx.fillStyle = 'rgba(255, 107, 0, 0.95)';
        ctx.fillRect(0, 0, canvas.width, bHeight);
        ctx.font = `900 ${Math.max(14, bHeight * 0.5)}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('🔥 OFERTA RELÁMPAGO ⚡', canvas.width / 2, bHeight * 0.68);
      } else if (photoTemplate === 'discount_50') {
        // Mega Discount Corner Circle
        const bSize = Math.max(75, canvas.width * 0.26);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(canvas.width - 15, 15, bSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${Math.max(16, bSize * 0.35)}px sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(customOfferText || '50% OFF', canvas.width - 25, 45);
      } else if (photoTemplate === 'gold_star') {
        // Gold VIP Frame
        ctx.lineWidth = Math.max(12, canvas.width * 0.03);
        ctx.strokeStyle = '#ffb703';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        const bHeight = Math.max(34, canvas.height * 0.1);
        ctx.fillStyle = 'rgba(10, 14, 26, 0.92)';
        ctx.fillRect(0, canvas.height - bHeight, canvas.width, bHeight);
        ctx.font = `900 ${Math.max(13, bHeight * 0.5)}px sans-serif`;
        ctx.fillStyle = '#ffb703';
        ctx.textAlign = 'center';
        ctx.fillText('👑 SELECCIÓN CHEF VIP ESTRELLA ⭐', canvas.width / 2, canvas.height - bHeight * 0.35);
      } else if (photoTemplate === 'flag_criollo') {
        // Dominican Flag Top Border
        const hBar = Math.max(12, canvas.height * 0.035);
        ctx.fillStyle = '#002590';
        ctx.fillRect(0, 0, canvas.width / 2, hBar);
        ctx.fillStyle = '#ce1126';
        ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, hBar);

        // Bottom Badge
        const bHeight = Math.max(34, canvas.height * 0.09);
        ctx.fillStyle = 'rgba(0, 37, 144, 0.92)';
        ctx.fillRect(0, canvas.height - bHeight, canvas.width, bHeight);
        ctx.font = `900 ${Math.max(13, bHeight * 0.5)}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('🇩🇴 100% SABOR CRIOLLO DOMINICANO 🇩🇴', canvas.width / 2, canvas.height - bHeight * 0.35);
      } else if (photoTemplate === 'healthy_green') {
        // Organic Green Frame
        ctx.lineWidth = Math.max(10, canvas.width * 0.025);
        ctx.strokeStyle = '#00e699';
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        const bHeight = Math.max(30, canvas.height * 0.08);
        ctx.fillStyle = 'rgba(0, 230, 153, 0.95)';
        ctx.fillRect(0, 0, canvas.width, bHeight);
        ctx.font = `900 ${Math.max(12, bHeight * 0.5)}px sans-serif`;
        ctx.fillStyle = '#0a0e1a';
        ctx.textAlign = 'center';
        ctx.fillText('🌱 100% NATURAL & SALUDABLE 🥗', canvas.width / 2, bHeight * 0.65);
      } else if (photoTemplate === 'new_launch') {
        // New Launch Banner
        const bHeight = Math.max(34, canvas.height * 0.1);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
        ctx.fillRect(0, 0, canvas.width, bHeight);
        ctx.font = `900 ${Math.max(14, bHeight * 0.55)}px sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('💥 ¡NUEVO LANZAMIENTO! ⭐', canvas.width / 2, bHeight * 0.68);
      }

      // 3. Draw Selected Badge Sticker if applicable
      if (photoSticker && (photoTemplate === 'none' || photoTemplate === 'discount_50')) {
        const fontSize = Math.max(16, Math.floor(canvas.width * 0.05));
        ctx.font = `900 ${fontSize}px sans-serif`;
        const textMetrics = ctx.measureText(photoSticker);
        const textWidth = textMetrics.width;
        const padX = 14;
        const padY = 8;
        const posX = 20;
        const posY = canvas.height - fontSize - 25;

        ctx.fillStyle = '#ff6b00';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(posX, posY, textWidth + padX * 2, fontSize + padY * 2, 12);
        } else {
          ctx.rect(posX, posY, textWidth + padX * 2, fontSize + padY * 2);
        }
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(photoSticker, posX + padX, posY + fontSize + 2);
      }

      // 4. Draw Interactive Placed Emojis on Canvas
      placedEmojis.forEach(em => {
        const posX = (em.x / 100) * canvas.width;
        const posY = (em.y / 100) * canvas.height;
        const fontSize = Math.max(24, Math.floor((em.size / 220) * canvas.width));
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(em.text, posX, posY);
      });

      const editedDataUrl = canvas.toDataURL('image/jpeg', 0.94);

      if (editingDishPhotosId) {
        setMerchantState(prev => ({
          ...prev,
          products: prev.products.map(p => {
            if (p.id !== editingDishPhotosId) return p;
            const currentImgs = (p.images && p.images.length > 0) ? [...p.images] : [p.image];
            currentImgs[editingPhotoIndex] = editedDataUrl;
            return {
              ...p,
              image: currentImgs[0],
              images: currentImgs
            };
          })
        }));
      } else {
        setNewProdImages(prev => {
          const copy = [...prev];
          copy[editingPhotoIndex] = editedDataUrl;
          return copy;
        });
      }
      setEditingPhotoIndex(null);
      showToast('✨ ¡Foto Ultra Pro guardada con plantilla y efectos!');
    };
    img.src = currentImgSrc;
  };

  const handleToggleDietaryTag = (tag) => {
    if (selectedDietaryTags.includes(tag)) {
      setSelectedDietaryTags(selectedDietaryTags.filter(t => t !== tag));
    } else {
      setSelectedDietaryTags([...selectedDietaryTags, tag]);
    }
  };

  const handleToggleGuarnicion = (val) => {
    if (selectedGuarniciones.includes(val)) {
      setSelectedGuarniciones(selectedGuarniciones.filter(v => v !== val));
    } else {
      setSelectedGuarniciones([...selectedGuarniciones, val]);
    }
  };

  const handleToggleBebida = (val) => {
    if (selectedBebidas.includes(val)) {
      setSelectedBebidas(selectedBebidas.filter(v => v !== val));
    } else {
      setSelectedBebidas([...selectedBebidas, val]);
    }
  };

  const handleToggleExtra = (val) => {
    if (selectedExtras.includes(val)) {
      setSelectedExtras(selectedExtras.filter(v => v !== val));
    } else {
      setSelectedExtras([...selectedExtras, val]);
    }
  };

  const handleMultipleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const readPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => resolve(evt.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(newImages => {
      setNewProdImages(prev => [...prev, ...newImages]);
      showToast(`📸 ${newImages.length} foto(s) agregada(s)`);
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setNewProdImages(prev => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      return filtered.length > 0 ? filtered : ['assets/burger_3d.png'];
    });
    if (activePreviewImageIndex >= indexToRemove && activePreviewImageIndex > 0) {
      setActivePreviewImageIndex(prev => prev - 1);
    }
  };

  const handleSetCoverImage = (indexToCover) => {
    setNewProdImages(prev => {
      const selected = prev[indexToCover];
      const rest = prev.filter((_, idx) => idx !== indexToCover);
      return [selected, ...rest];
    });
    setActivePreviewImageIndex(0);
    showToast('⭐ Foto establecida como portada principal');
  };

  const handleAddNewProduct = (e) => {
    e.preventDefault();
    const coverImage = newProdImages[0] || 'assets/burger_3d.png';
    const newProd = {
      id: 'prod-' + Date.now(),
      storeId: 'store-1',
      name: newProdName || 'Platillo Especial Pedidos Listo',
      price: parseFloat(newProdPrice) || 450,
      category: newProdCategory,
      description: newProdDesc || 'Platillo especial preparado fresco al momento.',
      image: coverImage,
      images: newProdImages.length > 0 ? newProdImages : [coverImage],
      inStock: true,
      isFlash: isFlashOffer,
      dietaryTags: selectedDietaryTags,
      guarniciones: selectedGuarniciones,
      bebidas: selectedBebidas,
      extras: selectedExtras
    };

    setMerchantState(prev => ({
      ...prev,
      products: [newProd, ...prev.products]
    }));

    showToast(`✨ ¡"${newProd.name}" publicado con ${newProd.images.length} foto(s)!`);
  };

  const handleQuickEditPrice = (prodId) => {
    const prod = merchantState.products.find(p => p.id === prodId);
    if (!prod) return;
    const newPriceStr = prompt(`✏️ Editar precio para "${prod.name}" (RD$):`, prod.price);
    if (newPriceStr !== null) {
      const val = parseFloat(newPriceStr);
      if (!isNaN(val) && val > 0) {
        setMerchantState(prev => ({
          ...prev,
          products: prev.products.map(p => p.id === prodId ? { ...p, price: val } : p)
        }));
        showToast(`✅ Precio actualizado a RD$ ${val}`);
      }
    }
  };

  const handleToggleStock = (prodId) => {
    setMerchantState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === prodId ? { ...p, inStock: !p.inStock } : p)
    }));
  };

  const handleAddToCartCustom = (prod, selectedSide, selectedDrink) => {
    if (!prod) return;
    const sideStr = (selectedSide && typeof selectedSide === 'string') ? selectedSide.split(' ')[0] : 'Normal';
    const itemTitle = `${prod.name || 'Producto'} (${sideStr})`;
    const itemPrice = prod.price || 0;
    setCart(prev => {
      const existing = prev.find(i => i.name === itemTitle);
      if (existing) {
        return prev.map(i => i.name === itemTitle ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: (prod.id || Date.now()) + '-' + Date.now(), name: itemTitle, price: itemPrice, qty: 1 }];
    });
    setCustomizeProduct(null);
    showToast(`🛒 "${prod.name || 'Producto'}" añadido al carrito`);
  };

  const handleIncreaseQty = (itemId) => {
    setCart(prev => prev.map(item => item.id === itemId ? { ...item, qty: item.qty + 1 } : item));
  };

  const handleDecreaseQty = (itemId) => {
    setCart(prev => {
      return prev
        .map(item => item.id === itemId ? { ...item, qty: item.qty - 1 } : item)
        .filter(item => item.qty > 0);
    });
  };

  const handleRemoveCartItem = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    showToast('🗑️ Producto eliminado del carrito');
  };

  const totalCartItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const cartTotal = cartSubtotal > 0 ? cartSubtotal + 55 + selectedTip : 0;

  return (
    <div className={`app-viewport ${viewMode === 'merchant' ? 'merchant-app-viewport' : ''}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 1000, background: '#0a0e1a', color: '#00e699', border: '1px solid #00e699', padding: '12px 16px', borderRadius: 14, fontWeight: 800, fontSize: 13, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          {toastMessage}
        </div>
      )}

      {/* Mode Switcher Pill Header - ÚNICAMENTE visible si el usuario tiene una Cuenta de Comercio Registrada o Admin */}
      {isMerchantUser && (
        <div style={{ background: '#0a0e1a', color: 'white', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ff6b00', fontSize: 11, fontWeight: 800 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>🍔</span>
            <span style={{ color: '#ff6b00', fontWeight: 900, letterSpacing: '0.5px' }}>PEDIDOS LISTO</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => handleSetViewMode('client')} 
              style={{ 
                background: viewMode === 'client' ? '#ff6b00' : 'rgba(255,255,255,0.12)', 
                color: 'white', 
                border: viewMode === 'client' ? '1px solid #ff8533' : '1px solid rgba(255,255,255,0.2)', 
                padding: '6px 14px', 
                borderRadius: 20, 
                fontSize: 11, 
                fontWeight: 900, 
                cursor: 'pointer',
                boxShadow: viewMode === 'client' ? '0 4px 12px rgba(255,107,0,0.4)' : 'none'
              }}
            >
              📱 App Cliente
            </button>
            <button 
              onClick={() => handleSetViewMode('merchant')} 
              style={{ 
                background: viewMode === 'merchant' ? '#ff6b00' : 'rgba(255,255,255,0.12)', 
                color: 'white', 
                border: viewMode === 'merchant' ? '1px solid #ff8533' : '1px solid rgba(255,255,255,0.2)', 
                padding: '6px 14px', 
                borderRadius: 20, 
                fontSize: 11, 
                fontWeight: 900, 
                cursor: 'pointer',
                boxShadow: viewMode === 'merchant' ? '0 4px 12px rgba(255,107,0,0.4)' : 'none'
              }}
            >
              🏪 Comercio Partner
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
         CLIENT APP VIEW MODE
         ========================================================================= */}
      {viewMode === 'client' && (
        <>
          {/* Header */}
          <header className="py-app-header" style={{ background: 'linear-gradient(135deg, #121829 0%, #0a0e1a 100%)', borderBottom: '3px solid #ff6b00', padding: '16px 16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button 
                onClick={() => navigate && navigate('home')}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: '900',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(6px)'
                }}
              >
                ← Volver a Listo Patrón
              </button>
              <div style={{ fontSize: '11px', fontWeight: 900, color: '#ff6b00', background: 'rgba(255,107,0,0.15)', padding: '4px 12px', borderRadius: '16px', border: '1px solid rgba(255,107,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🛵 PEDIDOS LISTO & MÁNDAME
              </div>
            </div>

            <div className="py-top-row" style={{ marginBottom: 12 }}>
              <div className="py-address-pill" onClick={() => setIsAddressModalOpen(true)}>
                <span>📍 C. Perimetral Oeste, Santiago</span>
                <span style={{ fontSize: 10 }}>▼</span>
              </div>
              <div className="py-top-actions">
                <div className="py-header-icon" onClick={() => showToast('Notificaciones')}>🔔</div>
                <div className="py-header-icon" style={{ position: 'relative' }} onClick={() => setIsCartModalOpen(true)}>
                  🛒
                  {totalCartItems > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white',
                      borderRadius: '50%', width: 20, height: 20, fontSize: 10, fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white'
                    }}>
                      {totalCartItems}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* BARRA DE SUB-NAVEGACIÓN DE PÍLDORAS DESLIZABLES */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
              <button 
                onClick={() => setActiveTab('inicio')}
                style={{ background: activeTab === 'inicio' ? '#ff6b00' : 'rgba(255,255,255,0.08)', color: 'white', border: activeTab === 'inicio' ? '1px solid #ff8533' : '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap', cursor: 'pointer', boxShadow: activeTab === 'inicio' ? '0 4px 14px rgba(255,107,0,0.4)' : 'none' }}
              >
                🏠 Inicio
              </button>
              <button 
                onClick={() => setActiveTab('mercado')}
                style={{ background: activeTab === 'mercado' ? '#ff6b00' : 'rgba(255,255,255,0.08)', color: 'white', border: activeTab === 'mercado' ? '1px solid #ff8533' : '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap', cursor: 'pointer', boxShadow: activeTab === 'mercado' ? '0 4px 14px rgba(255,107,0,0.4)' : 'none' }}
              >
                🛍️ Mercado & Súper
              </button>
              <button 
                onClick={() => setActiveTab('promociones')}
                style={{ background: activeTab === 'promociones' ? '#ff6b00' : 'rgba(255,255,255,0.08)', color: 'white', border: activeTab === 'promociones' ? '1px solid #ff8533' : '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap', cursor: 'pointer', boxShadow: activeTab === 'promociones' ? '0 4px 14px rgba(255,107,0,0.4)' : 'none' }}
              >
                🔥 Promos & Fuego
              </button>
              <button 
                onClick={() => setActiveTab('buscar')}
                style={{ background: activeTab === 'buscar' ? '#ff6b00' : 'rgba(255,255,255,0.08)', color: 'white', border: activeTab === 'buscar' ? '1px solid #ff8533' : '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap', cursor: 'pointer', boxShadow: activeTab === 'buscar' ? '0 4px 14px rgba(255,107,0,0.4)' : 'none' }}
              >
                🔍 Buscar Productos
              </button>
              <button 
                onClick={() => setIsAddressModalOpen(true)}
                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap', cursor: 'pointer', boxShadow: '0 4px 14px rgba(168,85,247,0.4)' }}
              >
                🛵 Motor Mándame Express
              </button>
              <button 
                onClick={() => setActiveTab('pedidos')}
                style={{ background: activeTab === 'pedidos' ? '#ff6b00' : 'rgba(255,255,255,0.08)', color: 'white', border: activeTab === 'pedidos' ? '1px solid #ff8533' : '1px solid rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap', cursor: 'pointer', boxShadow: activeTab === 'pedidos' ? '0 4px 14px rgba(255,107,0,0.4)' : 'none' }}
              >
                📄 Mis Comandas
              </button>
            </div>
          </header>

          {/* Active Screen Tab Content */}
          <div className="screen-panel active">
            {activeTab === 'inicio' && (
              <>
                {/* 1. Merchant Stories Reel (Partner Brand Avatars) */}
                <div className="stories-reel-row">
                  <div className="story-circle-item" onClick={() => setActiveStoreModal(INITIAL_STORES[0])}>
                    <div className="story-avatar-box">
                      <img src="assets/burger_3d.png" alt="KFC" />
                      <span className="story-live-badge badge-flash">33% OFF</span>
                    </div>
                    <span className="story-label">KFC Colinas</span>
                  </div>

                  <div className="story-circle-item" onClick={() => setActiveStoreModal(INITIAL_STORES[1])}>
                    <div className="story-avatar-box" style={{ background: 'linear-gradient(135deg, #00e699, #059669)' }}>
                      <img src="assets/burger_3d.png" alt="Cartel Tacos" />
                      <span className="story-live-badge badge-pro">Envío RD$0</span>
                    </div>
                    <span className="story-label">Cartel Tacos</span>
                  </div>

                  <div className="story-circle-item" onClick={() => setActiveStoreModal(INITIAL_STORES[2])}>
                    <div className="story-avatar-box" style={{ background: 'linear-gradient(135deg, #ffc107, #d97706)' }}>
                      <img src="assets/burger_3d.png" alt="Mofongo Xpress" />
                      <span className="story-live-badge badge-flash">⭐ Top #1</span>
                    </div>
                    <span className="story-label">Mofongo Xpress</span>
                  </div>

                  <div className="story-circle-item" onClick={() => showToast('🍻 Pork & Beer 2x1 Cerveza')}>
                    <div className="story-avatar-box" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                      <img src="assets/drinks_3d_1791137124884.png" alt="Pork & Beer" />
                      <span className="story-live-badge badge-pro">2x1 Frías</span>
                    </div>
                    <span className="story-label">Pork & Beer</span>
                  </div>

                  <div className="story-circle-item" onClick={() => showToast('🍦 Don Pula Postres')}>
                    <div className="story-avatar-box">
                      <img src="assets/grocery_bag_3d.png" alt="Don Pula" />
                      <span className="story-live-badge badge-flash">Postres</span>
                    </div>
                    <span className="story-label">Don Pula</span>
                  </div>

                  <div className="story-circle-item" onClick={() => showToast('🍕 Pizza Hut Deal')}>
                    <div className="story-avatar-box" style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}>
                      <img src="assets/market_basket_3d.png" alt="Pizza Hut" />
                      <span className="story-live-badge badge-flash">Flash</span>
                    </div>
                    <span className="story-label">Pizza Hut</span>
                  </div>
                </div>

                {/* 2. Main Hero Banner - Mamey Gradient Style (IMG_4455.png) */}
                <div style={{ padding: '0 16px', marginBottom: 16 }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #ff6b00 0%, #ea580c 50%, #c2410c 100%)',
                    borderRadius: 24,
                    padding: 20,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 10px 30px rgba(255, 107, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    <div style={{ position: 'relative', zIndex: 2, maxWidth: '72%' }}>
                      <span style={{ background: 'rgba(0,0,0,0.25)', color: '#ffffff', fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 12, display: 'inline-block', marginBottom: 8, letterSpacing: '0.5px' }}>
                        🇩🇴 100% SABOR CRIOLLO SANTIAGO
                      </span>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 21, lineHeight: 1.15, marginBottom: 6 }}>
                        🔥 Come y Cena hasta RD$ 345
                      </h2>
                      <p style={{ fontSize: 12, opacity: 0.92, lineHeight: 1.3, marginBottom: 14 }}>
                        El plan perfecto para tu bolsillo. Mofongos, Yaroas, Pizzas y Combos Familiares directo a tu mesa.
                      </p>
                      <button 
                        onClick={() => setActiveTab('promociones')}
                        style={{
                          background: '#ffffff',
                          color: '#ff6b00',
                          border: 'none',
                          padding: '8px 18px',
                          borderRadius: 14,
                          fontWeight: 900,
                          fontSize: 12,
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        Ver Ofertas de Fuego ⚡
                      </button>
                    </div>

                    <img 
                      src="assets/burger_3d.png" 
                      alt="Burger 3D" 
                      style={{
                        position: 'absolute',
                        right: -10,
                        bottom: -10,
                        width: 135,
                        height: 135,
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                      }} 
                    />
                  </div>
                </div>

                {/* 3. Category Hub Grid (IMG_4455.png reference) */}
                <div className="py-main-hub-section" style={{ padding: '0 16px', marginBottom: 20 }}>
                  {/* Top 2 Big Cards */}
                  <div className="py-hub-top-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div 
                      className="py-big-hub-card" 
                      onClick={() => setActiveStoreModal(INITIAL_STORES[0])}
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)',
                        border: '1.5px solid #ffedd5',
                        borderRadius: 20,
                        padding: 14,
                        position: 'relative',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 900, color: '#ff6b00', background: '#fff3e6', padding: '2px 8px', borderRadius: 8 }}>30+ Comercios</span>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 15, color: '#1e293b', marginTop: 4 }}>Restaurantes</div>
                      </div>
                      <img src="assets/burger_3d.png" className="py-big-hub-img" alt="Restaurantes" style={{ width: 65, height: 65, objectFit: 'contain', alignSelf: 'flex-end' }} />
                    </div>

                    <div 
                      className="py-big-hub-card" 
                      onClick={() => setActiveTab('mercado')}
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                        border: '1.5px solid #dcfce7',
                        borderRadius: 20,
                        padding: 14,
                        position: 'relative',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 10, fontWeight: 900, color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: 8 }}>P Market</span>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 15, color: '#1e293b', marginTop: 4 }}>Pedidos Listo Market</div>
                      </div>
                      <img src="assets/market_basket_3d.png" className="py-big-hub-img" alt="Market" style={{ width: 65, height: 65, objectFit: 'contain', alignSelf: 'flex-end' }} />
                    </div>
                  </div>

                  {/* Bottom 4 Medium Grid Cards */}
                  <div className="py-hub-bottom-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    <div 
                      className="py-med-hub-card" 
                      onClick={() => setActiveTab('mercado')}
                      style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '10px 6px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
                    >
                      <img src="assets/grocery_bag_3d.png" className="py-med-hub-img" alt="Mercados" style={{ width: 38, height: 38, objectFit: 'contain', margin: '0 auto 4px' }} />
                      <span className="py-med-hub-label" style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', display: 'block' }}>Mercados</span>
                    </div>

                    <div 
                      className="py-med-hub-card" 
                      onClick={() => showToast('💊 Farmacias & Salud 24/7 Abiertas')}
                      style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '10px 6px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
                    >
                      <img src="assets/health_kit_3d.png" className="py-med-hub-img" alt="Salud" style={{ width: 38, height: 38, objectFit: 'contain', margin: '0 auto 4px' }} />
                      <span className="py-med-hub-label" style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', display: 'block' }}>Salud 24/7</span>
                    </div>

                    <div 
                      className="py-med-hub-card" 
                      onClick={() => setIsAddressModalOpen(true)}
                      style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '10px 6px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
                    >
                      <img src="assets/grocery_bag_3d.png" className="py-med-hub-img" alt="Mándao" style={{ width: 38, height: 38, objectFit: 'contain', margin: '0 auto 4px' }} />
                      <span className="py-med-hub-label" style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', display: 'block' }}>Mándao'</span>
                    </div>

                    <div 
                      className="py-med-hub-card" 
                      onClick={() => setActiveTab('promociones')}
                      style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: '10px 6px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}
                    >
                      <img src="assets/drinks_3d_1791137124884.png" className="py-med-hub-img" alt="Licores" style={{ width: 38, height: 38, objectFit: 'contain', margin: '0 auto 4px' }} />
                      <span className="py-med-hub-label" style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', display: 'block' }}>Licores</span>
                    </div>
                  </div>
                </div>

                {/* 4. Flash Discounts Section with Live Timer (IMG_4457.png reference) */}
                <div className="flash-deals-box" style={{ margin: '0 16px 20px 16px', background: 'linear-gradient(135deg, #fff3e6 0%, #ffffff 100%)', padding: 16, borderRadius: 20, border: '1px solid #ffe0b2' }}>
                  <div className="flash-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div>
                      <div className="flash-title" style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 16, color: '#ff6b00', display: 'flex', alignItems: 'center', gap: 6 }}>
                        ⚡ Descuentos Relámpago en Vivo
                      </div>
                      <span style={{ fontSize: 11, color: '#64748b' }}>Ahorra hasta RD$ 300 en platillos seleccionados</span>
                    </div>
                    <span style={{ background: '#ff6b00', color: 'white', fontWeight: 900, fontSize: 11, padding: '4px 10px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      ⏱️ 01:45:12
                    </span>
                  </div>

                  <div className="flash-scroll-row" style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
                    {INITIAL_PRODUCTS.map(prod => (
                      <div key={prod.id} className="flash-item-card" style={{ minWidth: 150, maxWidth: 150, background: 'white', borderRadius: 16, padding: 10, position: 'relative', border: '1px solid #fed7aa', boxShadow: '0 4px 12px rgba(255,107,0,0.08)' }}>
                        <span className="flash-tag" style={{ position: 'absolute', top: 8, left: 8, background: '#ef4444', color: 'white', fontWeight: 900, fontSize: 10, padding: '2px 6px', borderRadius: 6 }}>
                          -30% OFF
                        </span>
                        <img src={prod.image} alt={prod.name} className="flash-img" style={{ width: '100%', height: 80, objectFit: 'contain', margin: '8px 0' }} />
                        <div className="flash-item-title" style={{ fontSize: 11, fontWeight: 800, color: '#1e293b', marginBottom: 4, height: 28, overflow: 'hidden' }}>{prod.name}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span className="flash-price" style={{ fontWeight: 900, fontSize: 14, color: '#ff6b00' }}>RD$ {Math.round(prod.price * 0.7)}</span>
                          <span style={{ fontSize: 10, color: '#94a3b8', textDecoration: 'line-through' }}>RD$ {prod.price}</span>
                        </div>
                        <div 
                          className="btn-add-flash" 
                          onClick={() => handleAddToCartCustom(prod, 'Tostones', 'Cola')}
                          style={{ position: 'absolute', bottom: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: '#ff6b00', color: 'white', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,107,0,0.4)' }}
                        >
                          +
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Quick Category Filter Chips (IMG_4456.png reference) */}
                <div style={{ padding: '0 16px', marginBottom: 14 }}>
                  <div className="filters-scroll-row" style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', padding: '4px 0' }}>
                    {[
                      { id: 'all', label: '🔥 Todos' },
                      { id: 'bocado', label: '🍔 Hamburguesas' },
                      { id: 'criollo', label: '🧄 Mofongos' },
                      { id: 'pollo', label: '🍗 Pollo Crujiente' },
                      { id: 'pizza', label: '🍕 Pizzas' },
                      { id: 'saludable', label: '🥑 Saludable' },
                      { id: 'licores', label: '🍺 Bebidas' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`filter-chip ${selectedCategoryFilter === cat.id ? 'active' : ''}`}
                        style={{
                          background: selectedCategoryFilter === cat.id ? '#ff6b00' : 'white',
                          color: selectedCategoryFilter === cat.id ? 'white' : '#64748b',
                          border: selectedCategoryFilter === cat.id ? '1px solid #ff8533' : '1px solid #e2e8f0',
                          padding: '6px 14px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          boxShadow: selectedCategoryFilter === cat.id ? '0 4px 12px rgba(255,107,0,0.3)' : 'none'
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Loyalty & Cashback Banner (IMG_4460.png reference) */}
                <div style={{ padding: '0 16px', marginBottom: 20 }}>
                  <div style={{
                    background: 'linear-gradient(135deg, #0a0e1a 0%, #121829 100%)',
                    borderRadius: 20,
                    padding: 16,
                    color: 'white',
                    border: '1.5px solid rgba(255, 107, 0, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 16 }}>💰</span>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 14, color: '#ff6b00' }}>
                          Listo Puntos & Cashback Mamey
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>
                        Acumula 10% de devolución en cada pedido. Saldo acumulado: <strong style={{ color: '#00e699' }}>RD$ 250</strong>
                      </div>
                    </div>
                    <button 
                      onClick={() => showToast('💰 Monedero Mamey Activo')}
                      style={{
                        background: 'rgba(255,107,0,0.2)',
                        color: '#ff6b00',
                        border: '1px solid #ff6b00',
                        padding: '6px 12px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 900,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Ver Monedero
                    </button>
                  </div>
                </div>

                {/* 7. Stores Directory List */}
                <div style={{ padding: '0 16px 24px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 17, color: '#1e293b', margin: 0 }}>
                      Comercios & Restaurantes Destacados
                    </h3>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#ff6b00', cursor: 'pointer' }}>
                      Ver Todos ({INITIAL_STORES.length})
                    </span>
                  </div>

                  {INITIAL_STORES.filter(st => selectedCategoryFilter === 'all' || st.category === selectedCategoryFilter).map(st => (
                    <div key={st.id} className="custom-store-card" onClick={() => setActiveStoreModal(st)}>
                      <div style={{ position: 'relative' }}>
                        <img src={st.image} alt={st.name} className="store-header-image" />
                        <span className="store-rating-badge">{st.ratingText}</span>
                      </div>
                      <div className="store-body-pad">
                        <div className="store-title-row">
                          <span className="store-name-text">{st.name}</span>
                        </div>
                        <div className="store-sub-meta">
                          <span>⏱️ {st.time}</span>
                          <span>•</span>
                          <span>{st.deliveryFee === 0 ? '🚚 Envío Gratis' : `RD$ ${st.deliveryFee}`}</span>
                          <span style={{ color: 'var(--brand-mamey)', fontWeight: 800 }}>{st.badge}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'buscar' && (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18, marginBottom: 12, color: '#1e293b' }}>
                  🔍 Buscador de Platillos, Productos & Comercios
                </h3>
                <div className="custom-search-container" style={{ marginBottom: 16 }}>
                  <input
                    type="text"
                    className="custom-search-input"
                    style={{ background: 'white', color: '#1e293b', border: '2px solid #ff6b00' }}
                    placeholder="Busca en Pedidos Listo: Yaroas, Pizzas, Pollo, Leche, Víveres..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="custom-search-btn">🔍</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {INITIAL_PRODUCTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())).map(prod => (
                    <div key={prod.id} style={{ background: 'white', borderRadius: 16, padding: 12, boxShadow: '0 4px 14px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <img src={prod.image} alt={prod.name} style={{ width: '100%', height: 90, objectFit: 'contain', marginBottom: 8 }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 12, color: '#1e293b', marginBottom: 4 }}>{prod.name}</div>
                        <div style={{ fontWeight: 900, color: '#ff6b00', fontSize: 14 }}>RD$ {prod.price}</div>
                      </div>
                      <button 
                        onClick={() => handleAddToCartCustom(prod, 'Tostones', 'Soda')}
                        style={{ width: '100%', marginTop: 8, background: '#ff6b00', color: 'white', border: 'none', padding: '6px 0', borderRadius: 10, fontWeight: 900, fontSize: 11, cursor: 'pointer' }}
                      >
                        + Agregar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'mercado' && (
              <div style={{ padding: 16 }}>
                <div style={{ background: 'linear-gradient(135deg, #ff6b00, #ff8533)', color: 'white', padding: 16, borderRadius: 20, marginBottom: 16, boxShadow: '0 8px 24px rgba(255,107,0,0.3)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 19, margin: '0 0 4px 0' }}>🛒 Pedidos Listo Market & Víveres</h3>
                  <p style={{ margin: 0, fontSize: 12, opacity: 0.95 }}>Supermercados, víveres frescos criollos, farmacias y licorerías de Santiago directo a tu puerta.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: 'white', padding: 14, borderRadius: 16, border: '1.5px solid #e2e8f0', textAlign: 'center', cursor: 'pointer' }} onClick={() => showToast('🛒 Abriendo Supermercados')}>
                    <img src="assets/grocery_bag_3d.png" style={{ width: 60, height: 60, objectFit: 'contain', margin: '0 auto 6px' }} alt="" />
                    <div style={{ fontWeight: 900, fontSize: 13, color: '#1e293b' }}>Supermercados</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Víveres, carnes y provisiones</div>
                  </div>
                  <div style={{ background: 'white', padding: 14, borderRadius: 16, border: '1.5px solid #e2e8f0', textAlign: 'center', cursor: 'pointer' }} onClick={() => showToast('💊 Abriendo Farmacias')}>
                    <img src="assets/health_kit_3d.png" style={{ width: 60, height: 60, objectFit: 'contain', margin: '0 auto 6px' }} alt="" />
                    <div style={{ fontWeight: 900, fontSize: 13, color: '#1e293b' }}>Farmacias 24/7</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Medicamentos y salud</div>
                  </div>
                  <div style={{ background: 'white', padding: 14, borderRadius: 16, border: '1.5px solid #e2e8f0', textAlign: 'center', cursor: 'pointer' }} onClick={() => showToast('🍻 Abriendo Licorería')}>
                    <img src="assets/market_basket_3d.png" style={{ width: 60, height: 60, objectFit: 'contain', margin: '0 auto 6px' }} alt="" />
                    <div style={{ fontWeight: 900, fontSize: 13, color: '#1e293b' }}>Licorería & Fríos</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Cervezas frías y bebidas</div>
                  </div>
                  <div style={{ background: 'white', padding: 14, borderRadius: 16, border: '1.5px solid #e2e8f0', textAlign: 'center', cursor: 'pointer' }} onClick={() => showToast('🥩 Abriendo Carnicería')}>
                    <img src="assets/burger_3d.png" style={{ width: 60, height: 60, objectFit: 'contain', margin: '0 auto 6px' }} alt="" />
                    <div style={{ fontWeight: 900, fontSize: 13, color: '#1e293b' }}>Carnicería & Chicharrón</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Cortes frescos y chicharrones</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'promociones' && (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18, marginBottom: 12 }}>🏷️ Promociones & Cupones Activos</h3>
                <div style={{ background: '#fff3e6', border: '1px solid #ffe0b2', padding: 14, borderRadius: 16, marginBottom: 10 }}>
                  <div style={{ fontWeight: 900, color: 'var(--brand-mamey)' }}>CUPÓN: EATPRO2026</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>RD$ 200 OFF en pedidos mayores a RD$ 500</div>
                </div>
              </div>
            )}

            {activeTab === 'pedidos' && (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18, marginBottom: 12 }}>📋 Mis Pedidos Activos</h3>
                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>🛵 Pedido ORD-7719 • KFC Santiago</div>
                  <div style={{ fontSize: 12, color: 'var(--brand-mamey)', fontWeight: 800, marginTop: 4 }}>PIN OTP de Entrega: 7492</div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Bottom Navigation */}
          {/* Custom Bottom Nav Removed for Global BottomNav */}
        </>
      )}

      {/* =========================================================================
         MERCHANT PARTNER PORTAL VIEW MODE
         ========================================================================= */}
      {viewMode === 'merchant' && (
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: 16, paddingBottom: 80 }}>
          {/* Header */}
          <div style={{ background: '#121829', padding: 16, borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 16, display: 'flex', gap: 10, overflowX: 'auto', alignItems: 'center' }}>
            <button onClick={() => setMerchantTab('pos')} style={{ background: merchantTab === 'pos' ? 'linear-gradient(135deg, #00e699, #00b377)' : '#121829', color: merchantTab === 'pos' ? '#0a0e1a' : 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>💻 POS Caja</span>
              <span style={{ background: merchantTab === 'pos' ? '#0a0e1a' : '#00e699', color: merchantTab === 'pos' ? '#00e699' : '#0a0e1a', fontSize: 9, fontWeight: 900, padding: '1px 6px', borderRadius: 6 }}>
                RD$ {merchantState.todaySales}
              </span>
            </button>
            <button onClick={() => setMerchantTab('pedidos')} style={{ background: merchantTab === 'pedidos' ? '#ff6b00' : '#121829', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🔔 Comandera Cocina</span>
              {merchantState.orders.filter(o => o.status === 'new').length > 0 && (
                <span style={{ background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 900, padding: '1px 6px', borderRadius: 6, animation: 'pulse 1s infinite alternate' }}>
                  {merchantState.orders.filter(o => o.status === 'new').length} Nuevos
                </span>
              )}
            </button>
            <button onClick={() => setMerchantTab('dashboard')} style={{ background: merchantTab === 'dashboard' ? '#ffb703' : '#121829', color: merchantTab === 'dashboard' ? '#0a0e1a' : 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              📊 Dashboard & Ventas
            </button>
            <button onClick={() => setMerchantTab('insumos')} style={{ background: merchantTab === 'insumos' ? '#38bdf8' : '#121829', color: merchantTab === 'insumos' ? '#0a0e1a' : 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              📦 Insumos & Stock
            </button>
            <button onClick={() => setMerchantTab('gps')} style={{ background: merchantTab === 'gps' ? '#a855f7' : '#121829', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🛵 Monitoreo GPS Mándame
            </button>
            <button onClick={() => setMerchantTab('catalogo')} style={{ background: merchantTab === 'catalogo' ? '#ff6b00' : '#121829', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: 12, fontWeight: 800, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              🍔 Catalogo & Platillos
            </button>
          </div>

          {/* TAB: PUNTO DE VENTAS POS (PEDIDOS LISTO CAJA & MOSTRADOR TERMINAL) */}
          {merchantTab === 'pos' && (
            <div>
              {/* POS Top Control Bar */}
              <div style={{ background: '#121829', padding: 14, borderRadius: 20, border: '2px solid #00e699', marginBottom: 14, boxShadow: '0 6px 20px rgba(0,230,153,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, background: '#00e699', color: '#0a0e1a', padding: '3px 8px', borderRadius: 6, fontWeight: 900 }}>
                      🟢 CAJA ABIERTA
                    </span>
                    <span style={{ fontWeight: 900, fontSize: 16, color: 'white' }}>
                      💻 Pedidos Listo Punto de Ventas
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>Ventas Hoy (Caja):</div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#00e699' }}>RD$ {merchantState.todaySales}</div>
                    </div>
                    <button
                      onClick={() => setIsCashReportOpen(true)}
                      style={{ background: 'rgba(255,183,3,0.15)', color: '#ffb703', border: '1px solid #ffb703', padding: '8px 12px', borderRadius: 10, fontWeight: 900, fontSize: 11, cursor: 'pointer' }}
                    >
                      📊 Reporte X/Z (Cierre)
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid 2 Columns: Left = Menu & Search / Right = POS Live Ticket */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
                {/* LEFT COLUMN: Fast Product Tap Grid */}
                <div>
                  {/* Category Pills Filter */}
                  <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 10 }}>
                    {[
                      { id: 'all', label: '🔥 Todo' },
                      { id: 'plato_dia', label: '🍛 Platos del Día' },
                      { id: 'desayuno', label: '🍳 Desayunos' },
                      { id: 'bocado', label: '🍔 Fast Food' },
                      { id: 'bebidas', label: '🥤 Bebidas' },
                      { id: 'antojitos', label: '🍢 Antojitos' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setPosCategoryFilter(cat.id)}
                        style={{
                          background: posCategoryFilter === cat.id ? '#ff6b00' : 'rgba(255,255,255,0.06)',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: 10,
                          fontWeight: 800,
                          fontSize: 11,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Fast Search Input */}
                  <div style={{ marginBottom: 12 }}>
                    <input
                      type="text"
                      placeholder="🔎 Buscar por código o nombre del producto..."
                      value={posSearchQuery}
                      onChange={e => setPosSearchQuery(e.target.value)}
                      style={{ width: '100%', background: '#121829', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '10px 14px', borderRadius: 12, fontSize: 13, outline: 'none' }}
                    />
                  </div>

                  {/* Products Tap Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, maxHeight: 380, overflowY: 'auto', paddingRight: 4 }}>
                    {merchantState.products
                      .filter(p => posCategoryFilter === 'all' || p.category === posCategoryFilter)
                      .filter(p => !posSearchQuery || p.name.toLowerCase().includes(posSearchQuery.toLowerCase()))
                      .map(prod => (
                        <div
                          key={prod.id}
                          onClick={() => handleAddPosCartItem(prod)}
                          style={{
                            background: '#121829',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 16,
                            padding: 10,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          }}
                        >
                          <img src={prod.image} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} alt={prod.name} />
                          <div style={{ flexGrow: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 800, fontSize: 12, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</div>
                            <div style={{ fontWeight: 900, fontSize: 13, color: '#00e699', marginTop: 2 }}>RD$ {prod.price}</div>
                          </div>
                          <button style={{ background: '#ff6b00', color: 'white', border: 'none', width: 28, height: 28, borderRadius: 8, fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            +
                          </button>
                        </div>
                      ))}
                  </div>

                  {/* Fast Custom Item Entry Form */}
                  <div style={{ background: '#121829', borderRadius: 16, padding: 12, marginTop: 12, border: '1px dashed rgba(255,255,255,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: '#ffb703', marginBottom: 8 }}>
                      ➕ Venta Rápida Personalizada (Fuera de Menú)
                    </div>
                    <form onSubmit={handleAddCustomPosItem} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr auto', gap: 6 }}>
                      <input
                        type="text"
                        placeholder="Nombre / Descripción"
                        value={customItemName}
                        onChange={e => setCustomItemName(e.target.value)}
                        style={{ background: '#0a0e1a', color: 'white', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 10px', borderRadius: 8, fontSize: 11 }}
                      />
                      <input
                        type="number"
                        placeholder="Precio RD$"
                        value={customItemPrice}
                        onChange={e => setCustomItemPrice(e.target.value)}
                        style={{ background: '#0a0e1a', color: 'white', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 10px', borderRadius: 8, fontSize: 11 }}
                      />
                      <button type="submit" style={{ background: '#ffb703', color: '#0a0e1a', border: 'none', padding: '6px 12px', borderRadius: 8, fontWeight: 900, fontSize: 11, cursor: 'pointer' }}>
                        + Agregar
                      </button>
                    </form>
                  </div>
                </div>

                {/* RIGHT COLUMN: POS Ticket & Payment Calculator */}
                <div style={{ background: '#121829', borderRadius: 20, padding: 14, border: '2px solid #ff6b00', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 8 }}>
                      <div style={{ fontWeight: 900, fontSize: 14, color: '#ff6b00' }}>🧾 TICKET DE CAJA EN VIVO</div>
                      {posCart.length > 0 && (
                        <button onClick={() => setPosCart([])} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
                          Vaciar
                        </button>
                      )}
                    </div>

                    {/* Order Type & Table Controls */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 10 }}>
                      {[
                        { id: 'takeout', label: '🛍️ Llevar' },
                        { id: 'dinein', label: '🍽️ Mesa' },
                        { id: 'delivery', label: '🛵 Delivery' }
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => setPosOrderType(type.id)}
                          style={{
                            background: posOrderType === type.id ? '#ff6b00' : 'rgba(255,255,255,0.06)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 2px',
                            borderRadius: 8,
                            fontWeight: 900,
                            fontSize: 10,
                            cursor: 'pointer'
                          }}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>

                    {/* Dine-in Table Selector */}
                    {posOrderType === 'dinein' && (
                      <div style={{ marginBottom: 10, display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 800 }}>Mesa:</span>
                        <select
                          value={posTableNumber}
                          onChange={e => setPosTableNumber(e.target.value)}
                          style={{ flexGrow: 1, background: '#0a0e1a', color: '#00e699', border: '1px solid #00e699', padding: '6px 8px', borderRadius: 8, fontWeight: 900, fontSize: 11 }}
                        >
                          {['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5', 'Bar 1', 'Terraza 1'].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                    )}

                    {/* Ticket Items List */}
                    <div style={{ maxHeight: 180, overflowY: 'auto', paddingRight: 2, marginBottom: 10 }}>
                      {posCart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: 12 }}>
                          🛒 Toca cualquier platillo a la izquierda para añadirlo a la caja.
                        </div>
                      ) : (
                        posCart.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px 8px', borderRadius: 8, marginBottom: 4 }}>
                            <div style={{ flexGrow: 1, minWidth: 0, paddingRight: 6 }}>
                              <div style={{ fontWeight: 800, fontSize: 12, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                              <div style={{ fontSize: 10, color: '#00e699', fontWeight: 900 }}>RD$ {item.price}</div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <button onClick={() => handleDecreasePosQty(item.id)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', width: 22, height: 22, borderRadius: 6, fontWeight: 900, fontSize: 12, cursor: 'pointer' }}>-</button>
                              <span style={{ fontWeight: 900, fontSize: 12, color: 'white', width: 16, textAlign: 'center' }}>{item.qty}</span>
                              <button onClick={() => handleIncreasePosQty(item.id)} style={{ background: '#ff6b00', color: 'white', border: 'none', width: 22, height: 22, borderRadius: 6, fontWeight: 900, fontSize: 12, cursor: 'pointer' }}>+</button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* DGII NCF Fiscal Comprobante Selector */}
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: 8, borderRadius: 10, marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontWeight: 900, color: '#38bdf8', marginBottom: 4 }}>
                        🏛️ COMPROBANTE FISCAL DGII (NCF)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 6 }}>
                        <select
                          value={posNcfType}
                          onChange={e => setPosNcfType(e.target.value)}
                          style={{ background: '#0a0e1a', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '4px 6px', borderRadius: 6, fontSize: 10, fontWeight: 800 }}
                        >
                          <option value="B02">B02 - Consumo Final</option>
                          <option value="B01">B01 - Crédito Fiscal</option>
                          <option value="B14">B14 - Reg. Especial</option>
                        </select>

                        {posNcfType === 'B01' ? (
                          <input
                            type="text"
                            placeholder="RNC / Cédula"
                            value={posRncNumber}
                            onChange={e => setPosRncNumber(e.target.value)}
                            style={{ background: '#0a0e1a', color: '#00e699', border: '1px solid #00e699', padding: '4px 6px', borderRadius: 6, fontSize: 10, fontWeight: 900 }}
                          />
                        ) : (
                          <span style={{ fontSize: 10, color: '#94a3b8', display: 'flex', alignItems: 'center' }}>✓ Consumidor Final</span>
                        )}
                      </div>
                    </div>

                    {/* Coupon / Discount Entry */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Código Cupón (ej: LISTO200)"
                        value={posCouponCode}
                        onChange={e => setPosCouponCode(e.target.value)}
                        style={{ flexGrow: 1, background: '#0a0e1a', color: '#ffb703', border: '1px solid rgba(255,183,3,0.3)', padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800 }}
                      />
                      <button
                        type="button"
                        onClick={handleApplyPosCoupon}
                        style={{ background: '#ffb703', color: '#0a0e1a', border: 'none', padding: '4px 8px', borderRadius: 6, fontWeight: 900, fontSize: 10, cursor: 'pointer' }}
                      >
                        🏷️ Aplicar
                      </button>
                    </div>
                  </div>

                  {/* Payment Calculator Footer */}
                  <div style={{ borderTop: '2px dashed rgba(255,255,255,0.15)', paddingTop: 10 }}>
                    {/* Method Selector */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 8 }}>
                      {[
                        { id: 'cash', label: '💵 Efectivo' },
                        { id: 'card', label: '💳 Tarjeta' },
                        { id: 'transfer', label: '📱 Qik / Transfer' }
                      ].map(pay => (
                        <button
                          key={pay.id}
                          onClick={() => setPosPaymentMethod(pay.id)}
                          style={{
                            background: posPaymentMethod === pay.id ? '#00e699' : 'rgba(255,255,255,0.06)',
                            color: posPaymentMethod === pay.id ? '#0a0e1a' : 'white',
                            border: 'none',
                            padding: '6px 2px',
                            borderRadius: 8,
                            fontWeight: 900,
                            fontSize: 10,
                            cursor: 'pointer'
                          }}
                        >
                          {pay.label}
                        </button>
                      ))}
                    </div>

                    {/* Cash Calculator (Change Due) */}
                    {posPaymentMethod === 'cash' && (
                      <div style={{ background: 'rgba(0,230,153,0.1)', border: '1px solid rgba(0,230,153,0.3)', padding: 8, borderRadius: 10, marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800 }}>Recibido RD$:</span>
                          <input
                            type="number"
                            value={posCashTendered}
                            onChange={e => setPosCashTendered(e.target.value)}
                            style={{ width: 80, background: '#0a0e1a', color: '#00e699', border: '1px solid #00e699', padding: '3px 6px', borderRadius: 6, fontWeight: 900, fontSize: 12, textAlign: 'right' }}
                          />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 900, fontSize: 12, color: 'white' }}>
                          <span>CAMBIO A DEVOLVER:</span>
                          <span style={{ color: '#00e699', fontSize: 14 }}>
                            RD$ {Math.max(0, Number(posCashTendered || 0) - posCart.reduce((sum, item) => sum + (item.price * item.qty), 0))}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Total Summary */}
                    {(() => {
                      const totalPos = posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
                      return (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 900, color: 'white' }}>TOTAL A COBRAR:</span>
                            <span style={{ fontSize: 18, fontWeight: 900, color: '#00e699' }}>RD$ {totalPos}</span>
                          </div>

                          <button
                            onClick={handleCheckoutPosOrder}
                            style={{
                              width: '100%',
                              background: 'linear-gradient(135deg, #00e699, #00b377)',
                              color: '#0a0e1a',
                              border: 'none',
                              padding: 12,
                              borderRadius: 12,
                              fontWeight: 900,
                              fontSize: 14,
                              cursor: 'pointer',
                              boxShadow: '0 4px 15px rgba(0,230,153,0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 6
                            }}
                          >
                            ⚡ COBRAR & IMPRIMIR TICKET (RD$ {totalPos})
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DASHBOARD & ANALÍTICAS DE VENTAS EN TIEMPO REAL */}
          {merchantTab === 'dashboard' && (
            <div>
              {/* Dashboard KPI Top Banner */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                <div style={{ background: '#121829', padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800 }}>💰 VENTAS TOTALES (HOY)</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#00e699', marginTop: 4 }}>RD$ {merchantState.todaySales}</div>
                  <div style={{ fontSize: 10, color: '#00e699', marginTop: 2 }}>📈 +24.5% vs ayer</div>
                </div>

                <div style={{ background: '#121829', padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800 }}>🧾 TOTAL PEDIDOS</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#ff6b00', marginTop: 4 }}>{merchantState.todayOrdersCount} Pedidos</div>
                  <div style={{ fontSize: 10, color: '#ff6b00', marginTop: 2 }}>⚡ Promedio RD$ {Math.round(merchantState.todaySales / (merchantState.todayOrdersCount || 1))}</div>
                </div>

                <div style={{ background: '#121829', padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800 }}>⭐ PLATILLO MÁS VENDIDO</div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: 'white', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Yaroa Mofongo</div>
                  <div style={{ fontSize: 10, color: '#ffb703', marginTop: 2 }}>🔥 48 Vendidos Hoy</div>
                </div>

                <div style={{ background: '#121829', padding: 14, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800 }}>⏱️ TIEMPO PROMEDIO</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#38bdf8', marginTop: 4 }}>14 Mins</div>
                  <div style={{ fontSize: 10, color: '#38bdf8', marginTop: 2 }}>⚡ Cocina Eficiente</div>
                </div>
              </div>

              {/* Grid 2 Columns: Hourly Chart + Channel Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 14 }}>
                {/* Hourly Sales Bar Chart */}
                <div style={{ background: '#121829', borderRadius: 20, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ fontWeight: 900, fontSize: 14, color: 'white' }}>📊 Flujo de Ventas por Horas (Hoy)</div>
                    <span style={{ fontSize: 10, background: 'rgba(0,230,153,0.15)', color: '#00e699', padding: '2px 8px', borderRadius: 6, fontWeight: 900 }}>Santiago RD</span>
                  </div>

                  {/* CSS Bar Chart Graph */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, paddingTop: 20, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    {[
                      { hour: '09 AM', height: '25%', amount: 'RD$ 1.2k' },
                      { hour: '11 AM', height: '45%', amount: 'RD$ 3.8k' },
                      { hour: '01 PM', height: '90%', amount: 'RD$ 9.4k' },
                      { hour: '03 PM', height: '40%', amount: 'RD$ 3.2k' },
                      { hour: '05 PM', height: '60%', amount: 'RD$ 5.1k' },
                      { hour: '07 PM', height: '80%', amount: 'RD$ 8.2k' },
                      { hour: '09 PM', height: '95%', amount: 'RD$ 11.5k' },
                      { hour: '11 PM', height: '30%', amount: 'RD$ 2.1k' }
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                        <span style={{ fontSize: 8, color: '#94a3b8', marginBottom: 4, fontWeight: 800 }}>{item.amount}</span>
                        <div
                          style={{
                            width: 22,
                            height: item.height,
                            background: idx === 6 ? 'linear-gradient(180deg, #ff6b00, #ff8533)' : 'linear-gradient(180deg, #00e699, #00b377)',
                            borderRadius: '6px 6px 0 0',
                            boxShadow: '0 4px 12px rgba(0,230,153,0.3)'
                          }}
                        />
                        <span style={{ fontSize: 9, color: '#cbd5e1', marginTop: 6, fontWeight: 800 }}>{item.hour}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Channel Sales Distribution */}
                <div style={{ background: '#121829', borderRadius: 20, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: 'white', marginBottom: 14 }}>📈 Ventas por Canal</div>
                  
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'white', fontWeight: 800 }}>💻 Mostrador POS / Caja</span>
                      <span style={{ color: '#00e699', fontWeight: 900 }}>65% (RD$ {Math.round(merchantState.todaySales * 0.65)})</span>
                    </div>
                    <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: '65%', height: '100%', background: '#00e699', borderRadius: 6 }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'white', fontWeight: 800 }}>🛵 Delivery App Mándame</span>
                      <span style={{ color: '#ff6b00', fontWeight: 900 }}>35% (RD$ {Math.round(merchantState.todaySales * 0.35)})</span>
                    </div>
                    <div style={{ height: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ width: '35%', height: '100%', background: '#ff6b00', borderRadius: 6 }} />
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.04)', padding: 10, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: '#ffb703', marginBottom: 2 }}>💡 Sugerencia del Sistema</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Las ventas en caja física alcanzaron el pico a las 09 PM. ¡Buen volumen en comanderas!</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GESTIÓN DE INSUMOS & STOCK DE MATERIAS PRIMAS */}
          {merchantTab === 'insumos' && (
            <div>
              {/* Alert Header Banner */}
              <div style={{ background: '#121829', padding: 14, borderRadius: 20, border: '2px solid #38bdf8', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, background: '#38bdf8', color: '#0a0e1a', padding: '3px 8px', borderRadius: 6, fontWeight: 900 }}>
                      📦 ALMACÉN & STOCK
                    </span>
                    <span style={{ fontWeight: 900, fontSize: 15, color: 'white' }}>Gestión de Materias Primas</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 800 }}>{ingredients.length} Insumos Registrados</span>
                </div>
              </div>

              {/* Add New Ingredient Form */}
              <div style={{ background: 'white', color: '#0f172a', borderRadius: 20, padding: 16, marginBottom: 14 }}>
                <h4 style={{ fontWeight: 900, fontSize: 15, color: '#ff6b00', marginBottom: 10 }}>➕ Agregar Nuevo Insumo al Almacén</h4>
                <form onSubmit={handleAddIngredient} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Nombre del insumo (ej: Queso Frito)"
                    value={newIngName}
                    onChange={e => setNewIngName(e.target.value)}
                    style={{ border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: 10, fontSize: 12 }}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Cantidad Stock"
                    value={newIngStock}
                    onChange={e => setNewIngStock(e.target.value)}
                    style={{ border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: 10, fontSize: 12 }}
                    required
                  />
                  <select
                    value={newIngUnit}
                    onChange={e => setNewIngUnit(e.target.value)}
                    style={{ border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: 10, fontSize: 12 }}
                  >
                    <option value="Kg">Kg (Kilos)</option>
                    <option value="Unidades">Unidades</option>
                    <option value="Botellas">Botellas</option>
                    <option value="Gramos">Gramos</option>
                    <option value="Litros">Litros</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Alerta Mínima"
                    value={newIngMinAlert}
                    onChange={e => setNewIngMinAlert(e.target.value)}
                    style={{ border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: 10, fontSize: 12 }}
                  />
                  <button type="submit" style={{ background: '#00e699', color: '#0a0e1a', border: 'none', padding: '8px 16px', borderRadius: 10, fontWeight: 900, fontSize: 12, cursor: 'pointer' }}>
                    + Guardar
                  </button>
                </form>
              </div>

              {/* Ingredients List Table */}
              <div style={{ background: '#121829', borderRadius: 20, padding: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ fontWeight: 900, fontSize: 14, color: 'white', marginBottom: 12 }}>📋 Listado de Stock en Almacén</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ingredients.map(ing => {
                    const isLow = ing.stock <= ing.minAlert;
                    return (
                      <div key={ing.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isLow ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)', border: isLow ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: 12 }}>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: 13, color: 'white' }}>{ing.name}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                            Categoría: {ing.category} • Umbral Mínimo: {ing.minAlert} {ing.unit}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 11, fontWeight: 900, padding: '3px 8px', borderRadius: 6, background: isLow ? '#ef4444' : '#00e699', color: isLow ? 'white' : '#0a0e1a' }}>
                            {isLow ? `⚠️ ALERTA BAJO: ${ing.stock} ${ing.unit}` : `✓ OK: ${ing.stock} ${ing.unit}`}
                          </span>

                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => handleUpdateIngStock(ing.id, -1)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', width: 26, height: 26, borderRadius: 6, fontWeight: 900, cursor: 'pointer' }}>-</button>
                            <button onClick={() => handleUpdateIngStock(ing.id, +5)} style={{ background: '#38bdf8', color: '#0a0e1a', border: 'none', padding: '0 8px', height: 26, borderRadius: 6, fontWeight: 900, fontSize: 11, cursor: 'pointer' }}>+5</button>
                            <button onClick={() => handleDeleteIngredient(ing.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', width: 26, height: 26, borderRadius: 6, fontWeight: 900, fontSize: 11, cursor: 'pointer' }}>🗑️</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MONITOREO GPS DE REPARTIDORES EN VIVO (MAPA SANTIAGO RD) */}
          {merchantTab === 'gps' && (
            <div>
              {/* GPS Header */}
              <div style={{ background: '#121829', padding: 14, borderRadius: 20, border: '2px solid #a855f7', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, background: '#a855f7', color: 'white', padding: '3px 8px', borderRadius: 6, fontWeight: 900, animation: 'pulse 1s infinite alternate' }}>
                      🔴 RASTREO GPS LIVE
                    </span>
                    <span style={{ fontWeight: 900, fontSize: 15, color: 'white' }}>Monitoreo Repartidores Mándame (Santiago RD)</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#a855f7', fontWeight: 800 }}>2 Conductores Activos</span>
                </div>
              </div>

              {/* Grid 2 Columns: Map Simulation + Driver Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 14 }}>
                {/* Interactive Map Simulation Graphic */}
                <div style={{ background: '#0a0e1a', borderRadius: 20, padding: 16, border: '1px solid rgba(255,255,255,0.1)', position: 'relative', minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  {/* Map Mock Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(18,24,41,0.85)', padding: '8px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: 'white' }}>📍 Mapa de Santiago de los Caballeros</span>
                    <span style={{ fontSize: 10, color: '#00e699', fontWeight: 800 }}>GPS Conectado 📡</span>
                  </div>

                  {/* Simulated City Grid Graphic with Markers */}
                  <div style={{ position: 'relative', width: '100%', height: 220, background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)', borderRadius: 16, border: '1px dashed rgba(255,255,255,0.15)', overflow: 'hidden', margin: '10px 0' }}>
                    {/* Simulated Map Streets Grid Lines */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                    {/* Marker 1: Restaurant Kitchen */}
                    <div style={{ position: 'absolute', top: '35%', left: '25%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <div style={{ background: '#ff6b00', color: 'white', padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900, boxShadow: '0 0 15px #ff6b00' }}>
                        🏪 Restaurante Pedidos Listo
                      </div>
                    </div>

                    {/* Marker 2: Driver Motorcyclist Moving */}
                    <div style={{ position: 'absolute', top: '55%', left: '55%', transform: 'translate(-50%, -50%)', textAlign: 'center', animation: 'bounce 2s infinite' }}>
                      <div style={{ background: '#a855f7', color: 'white', padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900, boxShadow: '0 0 20px #a855f7' }}>
                        🛵 Kelvin Santos (Mándame #48)
                      </div>
                    </div>

                    {/* Marker 3: Customer House */}
                    <div style={{ position: 'absolute', top: '75%', left: '80%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <div style={{ background: '#00e699', color: '#0a0e1a', padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900, boxShadow: '0 0 15px #00e699' }}>
                        🏠 Destino: Calle Del Sol #88
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                    ⚡ Monitoreo de velocidad en vivo: 32 km/h • ETA estimado: 12 Mins
                  </div>
                </div>

                {/* Driver Cards Column */}
                <div>
                  <div style={{ background: '#121829', borderRadius: 20, padding: 14, border: '1px solid rgba(255,255,255,0.1)', marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 900, fontSize: 13, color: '#00e699' }}>🛵 Kelvin Santos</span>
                      <span style={{ fontSize: 9, background: 'rgba(0,230,153,0.15)', color: '#00e699', padding: '2px 6px', borderRadius: 4, fontWeight: 900 }}>En Trayecto</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 6 }}>
                      <div>📦 Pedido: <strong>#POS-7718</strong></div>
                      <div>📍 Entrega: C. Perimetral #45, Santiago</div>
                      <div>🔑 Token PIN OTP: <strong>3819</strong></div>
                    </div>
                    <button onClick={() => showToast('📞 Llamando a Repartidor Kelvin Santos...')} style={{ width: '100%', background: 'rgba(168,85,247,0.2)', color: '#a855f7', border: '1px solid #a855f7', padding: 8, borderRadius: 10, fontWeight: 900, fontSize: 11, cursor: 'pointer' }}>
                      📞 Contactar Conductor
                    </button>
                  </div>

                  <div style={{ background: '#121829', borderRadius: 20, padding: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontWeight: 900, fontSize: 13, color: '#38bdf8' }}>🛵 Miguel Álvarez</span>
                      <span style={{ fontSize: 9, background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '2px 6px', borderRadius: 4, fontWeight: 900 }}>Disponible en Zona</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 6 }}>
                      <div>📍 Zona: Zona Colonial Santiago</div>
                      <div>⭐ Valoración: 4.9 (142 Envíos)</div>
                    </div>
                    <button onClick={() => showToast('🛵 Repartidor Miguel listo para recibir comandas')} style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: 8, borderRadius: 10, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>
                      ✓ Asignado a Próximo Pedido
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: EDICIÓN DE MENÚ & CATÁLOGO (UBER EATS STYLE) */}
          {merchantTab === 'catalogo' && (
            <div>
              {/* Form Card */}
              <div style={{ background: 'white', color: '#0f172a', borderRadius: 24, padding: 18, marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18, color: '#ff6b00', marginBottom: 14 }}>
                  ➕ Subir Nuevo Platillo al Catálogo Pedidos Listo
                </h3>

                <form onSubmit={handleAddNewProduct}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 4 }}>Nombre del Platillo / Producto</label>
                    <input type="text" className="custom-search-input" style={{ border: '1px solid #cbd5e1' }} value={newProdName} onChange={e => setNewProdName(e.target.value)} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 4 }}>Precio (RD$)</label>
                      <input type="number" className="custom-search-input" style={{ border: '1px solid #cbd5e1' }} value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} required />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 4 }}>Categoría del Menú</label>
                      <select className="custom-search-input" style={{ border: '1px solid #cbd5e1' }} value={newProdCategory} onChange={e => setNewProdCategory(e.target.value)}>
                        <option value="plato_dia">🍛 Plato del Día</option>
                        <option value="desayuno">🍳 Desayuno Criollo</option>
                        <option value="merienda">☕ Merienda / Snacks</option>
                        <option value="antojitos">🍢 Antojitos & Picaderas</option>
                        <option value="cena">🌙 Cena Especial</option>
                        <option value="bocado">🍔 Bocado Rápido / Fast Food</option>
                        <option value="pollos">🍗 Pollos & Piezas Crujientes</option>
                        <option value="cubetas">🪣 Cubetas & Combos Familiares</option>
                        <option value="criollo">🍛 Comida Criolla & Platos Fuertes</option>
                        <option value="pizzas">🍕 Pizzas & Pastas</option>
                        <option value="tacos">🌮 Tacos & Comida Mexicana</option>
                        <option value="sushi">🍣 Sushi & Comida Asiática</option>
                        <option value="saludable">🥗 Ensaladas & Comida Saludable</option>
                        <option value="postres">🍰 Postres & Repostería</option>
                        <option value="bebidas">🥤 Bebidas & Jugos Naturales</option>
                        <option value="licor">🍾 Licores, Cervezas & Bebidas Frías</option>
                        <option value="super">🛒 Supermercado, Víveres & Despensa</option>
                        <option value="salud">💊 Farmacia & Cuidado Personal</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 4 }}>Descripción / Ingredientes</label>
                    <textarea className="custom-search-input" style={{ border: '1px solid #cbd5e1', borderRadius: 14 }} rows="2" value={newProdDesc} onChange={e => setNewProdDesc(e.target.value)} />
                  </div>

                  {/* ETIQUETAS DE DIETA & ALÉRGENOS (PEDIDOS LISTO) */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: 14, borderRadius: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                      <span>🏷️ ETIQUETAS & DIETA ESPECIAL (PEDIDOS LISTO)</span>
                      <span style={{ fontSize: 10, background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Visible al Cliente</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {['👑 Chef', '🌱 Vegano', '🌾 Sin Gluten', '🌶️ Picante', '🔥 Más Vendido', '🥑 Keto'].map(tag => (
                        <label key={tag} style={{ fontSize: 11, background: 'white', padding: '6px 8px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input type="checkbox" checked={selectedDietaryTags.includes(tag)} onChange={() => handleToggleDietaryTag(tag)} /> {tag}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* CONFIGURADOR DE GUARNICIONES, BEBIDAS & EXTRAS PARA EL CLIENTE */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: 14, borderRadius: 16, marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#ff6b00', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                      <span>⚙️ CONFIGURAR GUARNICIONES, BEBIDAS & EXTRAS</span>
                      <span style={{ fontSize: 10, color: '#64748b', background: 'white', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>Personalización Cliente</span>
                    </div>

                    {/* 1. Guarniciones */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 4 }}>🍟 Guarniciones & Acompañantes Disponibles (Pedidos Listo)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                        {[
                          '🍌 Tostones Crujientes',
                          '🍟 Papas Fritas',
                          '🧄 Mofonguito de Ajo',
                          '🥑 Yuquita al Moho',
                          '🧀 Queso Frito Geo',
                          '🥓 Chicharrón Crocante',
                          '🍌 Maduritos Fritos',
                          '🍚 Arroz Blanco Criollo',
                          '🫘 Habichuelas Guisadas',
                          '🥑 Aguacate en Lajas',
                          '🥗 Ensalada Rusa',
                          '🥔 Puré de Papa al Ajo',
                          '🍌 Mangú con Cebollita',
                          '🌽 Arepitas de Maíz'
                        ].map(val => (
                          <label key={val} style={{ fontSize: 11, background: 'white', padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="checkbox" checked={selectedGuarniciones.includes(val)} onChange={() => handleToggleGuarnicion(val)} /> {val}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 2. Bebidas */}
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 4 }}>🥤 Bebidas a Elegir por el Cliente</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                        {['Coca Cola 2L', 'Jugo Chinola', 'Cerveza Presidente', 'Agua Mineral'].map(val => (
                          <label key={val} style={{ fontSize: 11, background: 'white', padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="checkbox" checked={selectedBebidas.includes(val)} onChange={() => handleToggleBebida(val)} /> {val}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 3. Extras */}
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: 4 }}>🥓 Extras & Salsas Especiales</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                        {['Chicharrón Extra (+120)', 'Queso Frito (+80)', 'Salsa Ajo (+35)', 'Aguacate Fresco (+60)'].map(val => (
                          <label key={val} style={{ fontSize: 11, background: 'white', padding: '6px 10px', borderRadius: 8, border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="checkbox" checked={selectedExtras.includes(val)} onChange={() => handleToggleExtra(val)} /> {val}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload Zone (Multiple Photos Manager & Studio Pro Launcher) */}
                  <div style={{ background: '#f8fafc', border: '2px solid #ff6b00', padding: 16, borderRadius: 20, marginBottom: 14, boxShadow: '0 6px 20px rgba(255,107,0,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 900, color: '#0f172a' }}>
                          📸 FOTOS DEL PLATILLO (MÚLTIPLES FOTOS)
                        </label>
                        <span style={{ fontSize: 10, background: '#fff3e6', color: '#ff6b00', padding: '2px 8px', borderRadius: 6, fontWeight: 900 }}>
                          {newProdImages.length} Foto(s)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenPhotoEditor(activePreviewImageIndex)}
                        style={{
                          background: 'linear-gradient(135deg, #ff6b00, #ff8533)',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: 10,
                          fontWeight: 900,
                          fontSize: 11,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(255,107,0,0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        ⚡ Editor Ultra HD Pro
                      </button>
                    </div>

                    {/* Thumbnail Grid & Action Bar */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                      {newProdImages.map((imgUrl, idx) => (
                        <div key={idx} style={{ position: 'relative', width: 78, height: 78, borderRadius: 14, overflow: 'hidden', border: idx === activePreviewImageIndex ? '3px solid #ff6b00' : '1px solid #cbd5e1', boxShadow: idx === 0 ? '0 4px 12px rgba(255,107,0,0.3)' : 'none' }}>
                          <img src={imgUrl} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => setActivePreviewImageIndex(idx)} />
                          
                          {/* Cover badge or Set cover button */}
                          {idx === 0 ? (
                            <span style={{ position: 'absolute', bottom: 2, left: 2, right: 2, background: 'rgba(255,107,0,0.95)', color: 'white', fontSize: 8, fontWeight: 900, textAlign: 'center', borderRadius: 4, padding: '1px 0' }}>
                              ⭐ Portada
                            </span>
                          ) : (
                            <button type="button" onClick={() => handleSetCoverImage(idx)} title="Hacer foto principal" style={{ position: 'absolute', bottom: 2, left: 2, right: 2, background: 'rgba(15,23,42,0.85)', color: 'white', border: 'none', fontSize: 7, fontWeight: 800, borderRadius: 4, padding: '1px 0', cursor: 'pointer' }}>
                              ⭐ Portada
                            </button>
                          )}

                          {/* Edit HD Photo button */}
                          <button type="button" onClick={() => handleOpenPhotoEditor(idx)} title="Editar foto con fuegos, filtros y sellos HD" style={{ position: 'absolute', top: 2, left: 2, background: 'rgba(0,230,153,0.95)', color: '#0a0e1a', border: 'none', padding: '2px 5px', borderRadius: 4, fontSize: 8, fontWeight: 900, cursor: 'pointer', zIndex: 5 }}>
                            🎨 Editor
                          </button>

                          {/* Delete photo button */}
                          <button type="button" onClick={() => handleRemoveImage(idx)} title="Eliminar foto" style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(239,68,68,0.95)', color: 'white', border: 'none', width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5 }}>
                            ✕
                          </button>
                        </div>
                      ))}

                      {/* Add photo trigger button */}
                      <label style={{ width: 78, height: 78, borderRadius: 14, border: '2px dashed #ff6b00', background: '#fff3e6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center' }}>
                        <span style={{ fontSize: 22, lineHeight: 1 }}>➕</span>
                        <span style={{ fontSize: 10, fontWeight: 900, color: '#ff6b00', marginTop: 2 }}>Añadir</span>
                        <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} style={{ display: 'none' }} />
                      </label>
                    </div>

                    {/* Quick Launch Studio Banner */}
                    <div style={{ background: '#0a0e1a', color: 'white', padding: 12, borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 900, color: '#00e699' }}>✨ ESTUDIO ULTRA PRO DE FOTOGRAFÍA</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>Añade fuegos animados 🔥, sellos 🇩🇴, 50% OFF ⚡ y filtros.</div>
                      </div>
                      <button type="button" onClick={() => handleOpenPhotoEditor(activePreviewImageIndex)} style={{ background: 'linear-gradient(135deg, #00e699, #00b377)', color: '#0a0e1a', border: 'none', padding: '7px 12px', borderRadius: 10, fontWeight: 900, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,230,153,0.3)' }}>
                        🎨 Abrir Editor
                      </button>
                    </div>
                  </div>

                  {/* LIVE PREVIEW CARD SIMULATOR */}
                  <div style={{ background: 'white', borderRadius: 20, padding: 16, border: '2px solid #ff6b00', marginBottom: 16, boxShadow: '0 8px 20px rgba(255,107,0,0.15)' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#ff6b00', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>📱 VISTA PREVIA DEL CLIENTE EN TIEMPO REAL</span>
                      {newProdImages.length > 1 && (
                        <span style={{ fontSize: 10, background: '#fff3e6', color: '#ff6b00', padding: '2px 6px', borderRadius: 4, fontWeight: 800 }}>
                          📸 {activePreviewImageIndex + 1} / {newProdImages.length}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 12, background: '#f8fafc', padding: 12, borderRadius: 16, border: '1px solid #e2e8f0', alignItems: 'center' }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={newProdImages[activePreviewImageIndex] || newProdImages[0]} style={{ width: 75, height: 75, borderRadius: 12, objectFit: 'cover' }} alt="Preview" />
                        {newProdImages.length > 1 && (
                          <span style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: 8, fontWeight: 900, padding: '1px 4px', borderRadius: 4 }}>
                            📸 {newProdImages.length}
                          </span>
                        )}
                      </div>
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 900, fontSize: 14 }}>{newProdName}</div>
                        <div style={{ fontSize: 11, color: '#64748b', margin: '2px 0' }}>{newProdDesc}</div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', margin: '4px 0' }}>
                          {selectedDietaryTags.map(t => <span key={t} style={{ fontSize: 9, fontWeight: 800, background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: 4 }}>{t}</span>)}
                          <span style={{ fontSize: 9, fontWeight: 800, background: '#fff3e6', color: '#ff6b00', padding: '2px 6px', borderRadius: 4 }}>🍟 {selectedGuarniciones.length} Guarniciones</span>
                          <span style={{ fontSize: 9, fontWeight: 800, background: '#e0f2fe', color: '#0284c7', padding: '2px 6px', borderRadius: 4 }}>🥤 {selectedBebidas.length} Bebidas</span>
                          <span style={{ fontSize: 9, fontWeight: 800, background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: 4 }}>🥓 {selectedExtras.length} Extras</span>
                        </div>
                        <div style={{ fontWeight: 900, fontSize: 15, color: '#ff6b00' }}>RD$ {newProdPrice}</div>
                      </div>
                    </div>

                    {/* Gallery Carousel Strip preview inside form */}
                    {newProdImages.length > 1 && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 2 }}>
                        {newProdImages.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            onClick={() => setActivePreviewImageIndex(i)}
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 8,
                              objectFit: 'cover',
                              border: activePreviewImageIndex === i ? '2px solid #ff6b00' : '1px solid #e2e8f0',
                              cursor: 'pointer',
                              opacity: activePreviewImageIndex === i ? 1 : 0.65
                            }}
                            alt={`Preview thumb ${i + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn-mamey" style={{ width: '100%', padding: 14, fontSize: 15 }}>
                    ✨ Publicar Platillo en Pedidos Listo
                  </button>
                </form>
              </div>

              {/* Inventory Active List */}
              <div style={{ background: '#121829', borderRadius: 20, padding: 16, border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 16, marginBottom: 12, color: 'white' }}>
                  📋 Mi Inventario Activo ({merchantState.products.length} Productos)
                </h3>
                {merchantState.products.map(prod => {
                  const prodImgCount = (prod.images && prod.images.length) || 1;
                  return (
                    <div key={prod.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '10px 12px', borderRadius: 14, marginBottom: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexGrow: 1, minWidth: 0 }} onClick={() => handleOpenDishPhotoManager(prod.id)}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <img src={prod.image} style={{ width: 46, height: 46, borderRadius: 10, objectFit: 'cover' }} alt={prod.name} />
                          <span style={{ position: 'absolute', bottom: -2, right: -2, background: '#ff6b00', color: 'white', fontSize: 8, fontWeight: 900, padding: '1px 4px', borderRadius: 4 }}>
                            {prodImgCount} 📷
                          </span>
                        </div>
                        <div style={{ minWidth: 0, paddingRight: 6 }}>
                          <div style={{ fontWeight: 800, fontSize: 13, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</div>
                          <div style={{ fontSize: 12, color: '#ff6b00', fontWeight: 900, display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                            <span>RD$ {prod.price}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleQuickEditPrice(prod.id); }} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '2px 6px', borderRadius: 6, fontSize: 10, cursor: 'pointer' }}>✏️ Precio</button>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => handleOpenDishPhotoManager(prod.id)} title="Gestionar, editar o borrar fotos" style={{ background: 'linear-gradient(135deg, #ff6b00, #ff8533)', color: 'white', border: 'none', padding: '6px 8px', borderRadius: 8, fontWeight: 900, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          📷 Fotos ({prodImgCount})
                        </button>
                        <button onClick={() => handleToggleStock(prod.id)} style={{ background: prod.inStock ? '#dcfce7' : '#fee2e2', color: prod.inStock ? '#15803d' : '#b91c1c', border: 'none', padding: '6px 8px', borderRadius: 8, fontWeight: 900, fontSize: 10, cursor: 'pointer' }}>
                          {prod.inStock ? '✓ Stock' : '❌ Agotado'}
                        </button>
                        <button onClick={() => handleDeleteProductFromInventory(prod.id)} title="Eliminar platillo" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', width: 26, height: 26, borderRadius: 8, fontWeight: 900, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: COMANDERA DE COCINA EN TIEMPO REAL (KITCHEN TERMINAL MODE) */}
          {merchantTab === 'pedidos' && (
            <div>
              {/* Comandera Top Action Control Header */}
              <div style={{ background: '#121829', padding: 14, borderRadius: 20, border: '2px solid #ff6b00', marginBottom: 14, boxShadow: '0 6px 20px rgba(255,107,0,0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, background: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: 6, fontWeight: 900, animation: 'pulse 1s infinite alternate' }}>
                      🔴 COCINA EN VIVO
                    </span>
                    <span style={{ fontWeight: 900, fontSize: 15, color: 'white' }}>Receptor de Pedidos</span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <select
                      value={selectedAlarmSound}
                      onChange={(e) => handleSelectAlarmSound(e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        color: '#FFF',
                        border: '1px solid rgba(255,107,0,0.5)',
                        padding: '5px 8px',
                        borderRadius: 10,
                        fontWeight: 900,
                        fontSize: 10.5,
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="alarm_kitchen" style={{ background: '#121829', color: '#FFF' }}>🚨 Alarma Fuerte Cocina</option>
                      <option value="chime" style={{ background: '#121829', color: '#FFF' }}>🔔 Timbre Clásico</option>
                      <option value="chaching" style={{ background: '#121829', color: '#FFF' }}>💰 Caja Registradora</option>
                      <option value="siren" style={{ background: '#121829', color: '#FFF' }}>📢 Sirena Emergencia</option>
                    </select>

                    <button
                      onClick={() => setIsSoundAlarmEnabled(prev => !prev)}
                      style={{
                        background: isSoundAlarmEnabled ? 'rgba(0,230,153,0.15)' : 'rgba(239,68,68,0.15)',
                        color: isSoundAlarmEnabled ? '#00e699' : '#ef4444',
                        border: `1px solid ${isSoundAlarmEnabled ? '#00e699' : '#ef4444'}`,
                        padding: '6px 10px',
                        borderRadius: 10,
                        fontWeight: 900,
                        fontSize: 10,
                        cursor: 'pointer'
                      }}
                    >
                      {isSoundAlarmEnabled ? '🔔 Alarma: ON' : '🔕 Alarma: OFF'}
                    </button>

                    <button
                      onClick={() => playKitchenAlarmSound(selectedAlarmSound)}
                      style={{ background: 'linear-gradient(135deg, #FF6B00, #E65100)', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 10, fontWeight: 900, fontSize: 10, cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,107,0,0.3)' }}
                    >
                      🔊 Probar Sonido
                    </button>
                  </div>
                </div>

                {/* Simulation Button */}
                <button
                  onClick={handleSimulateNewIncomingOrder}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #ff6b00, #ff8533)',
                    color: 'white',
                    border: 'none',
                    padding: 12,
                    borderRadius: 14,
                    fontWeight: 900,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(255,107,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  ⚡ Simular Nuevo Pedido Entrante de Cliente (Prueba Live con Alarma)
                </button>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginBottom: 14, background: 'rgba(255,255,255,0.05)', padding: 4, borderRadius: 14 }}>
                {[
                  { id: 'all', label: 'Todos', count: merchantState.orders.length },
                  { id: 'new', label: '🟡 Nuevos', count: merchantState.orders.filter(o => o.status === 'new').length },
                  { id: 'cooking', label: '🔵 Cocina', count: merchantState.orders.filter(o => o.status === 'cooking').length },
                  { id: 'ready', label: '🟢 Listos', count: merchantState.orders.filter(o => o.status === 'ready').length },
                  { id: 'completed', label: '🏁 PIN', count: merchantState.orders.filter(o => o.status === 'completed').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setKitchenFilterTab(tab.id)}
                    style={{
                      background: kitchenFilterTab === tab.id ? '#ff6b00' : 'transparent',
                      color: 'white',
                      border: 'none',
                      padding: '8px 2px',
                      borderRadius: 10,
                      fontWeight: 900,
                      fontSize: 10,
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>

              {/* Orders List Container */}
              <div>
                {merchantState.orders
                  .filter(o => kitchenFilterTab === 'all' || o.status === kitchenFilterTab)
                  .map(order => {
                    const isNew = order.status === 'new';
                    const isCooking = order.status === 'cooking';
                    const isReady = order.status === 'ready';
                    const isCompleted = order.status === 'completed';

                    return (
                      <div
                        key={order.id}
                        style={{
                          background: '#121829',
                          border: isNew ? '2px solid #eab308' : isCooking ? '2px solid #3b82f6' : isReady ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 20,
                          padding: 16,
                          marginBottom: 14,
                          boxShadow: isNew ? '0 0 20px rgba(234,179,8,0.3)' : '0 4px 15px rgba(0,0,0,0.3)'
                        }}
                      >
                        {/* Order Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 8 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontWeight: 900, fontSize: 16, color: '#ff6b00' }}>#{order.id}</span>
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>• {order.createdAt}</span>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: 'white', marginTop: 2 }}>
                              👤 {order.customerName} ({order.customerPhone})
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            {isNew && <span style={{ background: '#eab308', color: '#0a0e1a', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 6 }}>🟡 NUEVO PEDIDO</span>}
                            {isCooking && <span style={{ background: '#3b82f6', color: 'white', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 6 }}>🔵 EN PREPARACIÓN</span>}
                            {isReady && <span style={{ background: '#10b981', color: 'white', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 6 }}>🟢 LISTO / REPARTIDOR</span>}
                            {isCompleted && <span style={{ background: 'rgba(255,255,255,0.15)', color: '#00e699', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 6 }}>🏁 ENTREGADO OTP</span>}
                          </div>
                        </div>

                        {/* Customer Address & Payment */}
                        <div style={{ fontSize: 11, color: '#cbd5e1', marginBottom: 10, background: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 10 }}>
                          <div>📍 <strong>Entrega:</strong> {order.address}</div>
                          <div style={{ marginTop: 2 }}>💳 <strong>Pago:</strong> {order.paymentMethod || 'Efectivo'}</div>
                        </div>

                        {/* Order Items Breakdown */}
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: '#ff6b00', marginBottom: 6 }}>📜 PLATILLOS A PREPARAR:</div>
                          {(order.items || []).map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.06)', padding: '8px 10px', borderRadius: 10, marginBottom: 4 }}>
                              <div>
                                <span style={{ fontWeight: 900, fontSize: 13, color: '#00e699', marginRight: 6 }}>{item.qty}x</span>
                                <span style={{ fontWeight: 800, fontSize: 13, color: 'white' }}>{item.name}</span>
                                {item.details && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>🔹 {item.details}</div>}
                              </div>
                              <div style={{ fontWeight: 900, fontSize: 12, color: 'white' }}>RD$ {item.price * item.qty}</div>
                            </div>
                          ))}
                        </div>

                        {/* Order Total & Action Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
                          <div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>Total Venta:</div>
                            <div style={{ fontWeight: 900, fontSize: 16, color: '#00e699' }}>RD$ {order.total}</div>
                          </div>

                          <button
                            onClick={() => setSelectedTicketOrder(order)}
                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: 10, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}
                          >
                            🖨️ Ticket Térmico
                          </button>
                        </div>

                        {/* Dynamic Action Buttons per State */}
                        <div style={{ marginTop: 10 }}>
                          {isNew && (
                            <button
                              onClick={() => handleAcceptAndCookOrder(order.id)}
                              style={{ width: '100%', background: 'linear-gradient(135deg, #ff6b00, #ff8533)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 900, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 15px rgba(255,107,0,0.4)' }}
                            >
                              ✅ ACEPTAR Y COCINAR (15 MIN)
                            </button>
                          )}

                          {isCooking && (
                            <button
                              onClick={() => handleMarkOrderReady(order.id)}
                              style={{ width: '100%', background: 'linear-gradient(135deg, #00e699, #00b377)', color: '#0a0e1a', border: 'none', padding: 12, borderRadius: 12, fontWeight: 900, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,230,153,0.3)' }}
                            >
                              🟢 MARCAR LISTO PARA REPARTIDOR MÁNDAME
                            </button>
                          )}

                          {isReady && (
                            <div style={{ background: 'rgba(0,230,153,0.1)', border: '1px solid rgba(0,230,153,0.3)', padding: 10, borderRadius: 14 }}>
                              <div style={{ fontSize: 11, fontWeight: 900, color: '#00e699', marginBottom: 4 }}>
                                🛵 Conductor: {order.driverName}
                              </div>
                              <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 6 }}>
                                Ingresa el Token PIN OTP del cliente/repartidor para validar entrega:
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <input
                                  type="text"
                                  placeholder="Token PIN OTP (ej: 7492)"
                                  value={otpInputValues[order.id] || ''}
                                  onChange={(e) => setOtpInputValues({ ...otpInputValues, [order.id]: e.target.value })}
                                  style={{ flexGrow: 1, background: '#0a0e1a', color: '#00e699', border: '1px solid #00e699', padding: '8px 10px', borderRadius: 8, fontSize: 13, fontWeight: 900, textAlign: 'center', letterSpacing: 2 }}
                                />
                                <button
                                  onClick={() => handleVerifyOTPAndCompleteOrder(order.id)}
                                  style={{ background: '#00e699', color: '#0a0e1a', border: 'none', padding: '8px 12px', borderRadius: 8, fontWeight: 900, fontSize: 12, cursor: 'pointer' }}
                                >
                                  🔒 Validar PIN
                                </button>
                              </div>
                            </div>
                          )}

                          {isCompleted && (
                            <div style={{ fontSize: 11, color: '#00e699', fontWeight: 900, textAlign: 'center', background: 'rgba(0,230,153,0.1)', padding: 6, borderRadius: 8 }}>
                              ✓ Entregado con éxito • PIN OTP Validado ({order.pinOTP})
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PUBLISHED DISH PHOTO & DETAILS MANAGER MODAL */}
      {editingDishPhotosId !== null && editingPhotoIndex === null && (
        <div className="modal-backdrop active" style={{ zIndex: 550 }}>
          <div className="modal-card" style={{ background: '#121829', color: 'white', borderTop: '3px solid #ff6b00', maxHeight: '90vh' }}>
            {(() => {
              const dish = merchantState.products.find(p => p.id === editingDishPhotosId);
              if (!dish) return null;
              const dishImgs = (dish.images && dish.images.length > 0) ? dish.images : [dish.image || 'assets/burger_3d.png'];

              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <span style={{ fontSize: 10, background: '#ff6b00', color: 'white', padding: '2px 8px', borderRadius: 6, fontWeight: 900 }}>
                        📸 GESTIONAR & MODIFICAR FOTOS
                      </span>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18, color: 'white', margin: '2px 0 0 0' }}>
                        {dish.name}
                      </h3>
                    </div>
                    <div className="close-btn" onClick={() => setEditingDishPhotosId(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>&times;</div>
                  </div>

                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                    RD$ {dish.price} • {dishImgs.length} Foto(s) subida(s). Modifica, edita con fuegos/banners o borra cualquier foto.
                  </div>

                  {/* Photos Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 14, maxHeight: 260, overflowY: 'auto' }}>
                    {dishImgs.map((imgUrl, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', border: idx === 0 ? '2px solid #ff6b00' : '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 8, position: 'relative' }}>
                        <div style={{ position: 'relative', width: '100%', height: 110, borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                          <img src={imgUrl} alt={`Foto ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {idx === 0 && (
                            <span style={{ position: 'absolute', top: 4, left: 4, background: '#ff6b00', color: 'white', fontSize: 8, fontWeight: 900, padding: '2px 6px', borderRadius: 4 }}>
                              ⭐ Portada Principal
                            </span>
                          )}
                        </div>

                        {/* Action Buttons for this Photo */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 4 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenPublishedDishPhotoEditor(dish.id, idx)}
                            style={{ background: 'linear-gradient(135deg, #00e699, #00b377)', color: '#0a0e1a', border: 'none', padding: '6px 2px', borderRadius: 8, fontWeight: 900, fontSize: 9, cursor: 'pointer' }}
                          >
                            🎨 Editar Ultra HD
                          </button>

                          {idx !== 0 ? (
                            <button
                              type="button"
                              onClick={() => handleSetDishCoverPhoto(dish.id, idx)}
                              style={{ background: 'rgba(255,183,3,0.2)', color: '#ffb703', border: '1px solid #ffb703', padding: '6px 2px', borderRadius: 8, fontWeight: 800, fontSize: 9, cursor: 'pointer' }}
                            >
                              ⭐ Portada
                            </button>
                          ) : (
                            <span style={{ fontSize: 9, color: '#ff6b00', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              ✓ En Portada
                            </span>
                          )}
                        </div>

                        {/* Delete photo button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteDishPhoto(dish.id, idx)}
                          style={{ width: '100%', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '5px 0', borderRadius: 8, fontWeight: 900, fontSize: 10, cursor: 'pointer' }}
                        >
                          🗑️ Borrar Foto
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Upload new photo button to dish */}
                  <label style={{ display: 'block', width: '100%', background: 'rgba(255,107,0,0.15)', border: '2px dashed #ff6b00', color: '#ff6b00', padding: 12, borderRadius: 14, textAlign: 'center', fontWeight: 900, fontSize: 13, cursor: 'pointer', marginBottom: 12 }}>
                    ➕ Subir Nueva Foto a Este Platillo
                    <input type="file" accept="image/*" multiple onChange={(e) => handleAddPhotosToPublishedDish(dish.id, e)} style={{ display: 'none' }} />
                  </label>

                  {/* Delete entire product button */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button onClick={() => setEditingDishPhotosId(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: 10, borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>
                      ✕ Cerrar
                    </button>
                    <button onClick={() => handleDeleteProductFromInventory(dish.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: 10, borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: 'pointer' }}>
                      🗑️ Borrar Platillo del Menú
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* =========================================================================
         STORE DETAIL MODAL WITH TABS (VER RESTAURANTE, VER TODO EL MENÚ & INFORMACIÓN)
         ========================================================================= */}
      {activeStoreModal && (
        <div className="modal-backdrop active">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18, color: '#ff6b00', margin: 0 }}>🏪 {activeStoreModal.name}</h3>
              <div className="close-btn" onClick={() => setActiveStoreModal(null)}>&times;</div>
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 14 }}>
              <button onClick={() => { setActiveStoreModal(null); setViewMode('client'); setActiveTab('inicio'); }} style={{ background: 'linear-gradient(135deg, #ff6b00, #ff8533)', color: 'white', border: 'none', padding: '9px 6px', borderRadius: 12, fontWeight: 900, fontSize: 11, cursor: 'pointer' }}>
                🏪 Ver Restaurante
              </button>
              <button onClick={() => setStoreModalTab('menu')} style={{ background: storeModalTab === 'menu' ? '#ff6b00' : '#f1f5f9', color: storeModalTab === 'menu' ? 'white' : '#475569', border: 'none', padding: '9px 6px', borderRadius: 12, fontWeight: 900, fontSize: 11, cursor: 'pointer' }}>
                📜 Todo el Menú
              </button>
              <button onClick={() => setStoreModalTab('info')} style={{ background: storeModalTab === 'info' ? '#ff6b00' : '#f1f5f9', color: storeModalTab === 'info' ? 'white' : '#475569', border: 'none', padding: '9px 6px', borderRadius: 12, fontWeight: 900, fontSize: 11, cursor: 'pointer' }}>
                ℹ️ Información
              </button>
            </div>

            {/* Modal Tab Content */}
            {storeModalTab === 'menu' ? (
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 10 }}>📜 Platillos Disponibles</div>
                {merchantState.products.map(prod => {
                  const prodImgCount = (prod.images && prod.images.length) || 1;
                  return (
                    <div key={prod.id} style={{ display: 'flex', gap: 12, background: '#f8fafc', padding: 12, borderRadius: 14, marginBottom: 10, border: '1px solid #e2e8f0', alignItems: 'center', cursor: 'pointer' }} onClick={() => { setCustomizeProduct(prod); setCustomizeModalImgIndex(0); }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={prod.image} style={{ width: 65, height: 65, borderRadius: 10, objectFit: 'cover' }} alt={prod.name} />
                        {prodImgCount > 1 && (
                          <span style={{ position: 'absolute', bottom: 2, right: 2, background: 'rgba(10,14,26,0.85)', color: 'white', fontSize: 8, fontWeight: 900, padding: '1px 4px', borderRadius: 4 }}>
                            📸 {prodImgCount}
                          </span>
                        )}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{prod.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{prod.description}</div>
                        <div style={{ fontWeight: 900, color: '#ff6b00', marginTop: 4 }}>RD$ {prod.price}</div>
                      </div>
                      <button style={{ background: '#ff6b00', color: 'white', border: 'none', width: 32, height: 32, borderRadius: 10, fontWeight: 900, fontSize: 16 }}>+</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <h4 style={{ fontWeight: 900, fontSize: 15, marginBottom: 10 }}>ℹ️ Información del Restaurante</h4>
                <p style={{ fontSize: 12, color: '#64748b' }}>📍 {merchantState.address}</p>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>⏱️ Horario: 08:00 AM - 11:00 PM</p>
                <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>🛡️ Garantía Pedidos Listo con Token PIN OTP</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CUSTOMIZE DISH MODAL WITH INTERACTIVE MULTI-PHOTO GALLERY */}
      {customizeProduct && (
        <div className="modal-backdrop active">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 17, color: '#ff6b00', margin: 0 }}>
                🍔 {customizeProduct.name}
              </h3>
              <div className="close-btn" onClick={() => setCustomizeProduct(null)}>&times;</div>
            </div>

            {/* Gallery Header Carousel */}
            {(() => {
              const galleryImages = customizeProduct.images && customizeProduct.images.length > 0
                ? customizeProduct.images
                : [customizeProduct.image || 'assets/burger_3d.png'];
              const activeImg = galleryImages[customizeModalImgIndex] || galleryImages[0];

              return (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ position: 'relative', width: '100%', height: 180, borderRadius: 16, overflow: 'hidden', background: '#0a0e1a' }}>
                    <img src={activeImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={customizeProduct.name} />
                    
                    {galleryImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCustomizeModalImgIndex(prev => prev > 0 ? prev - 1 : galleryImages.length - 1); }}
                          style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontWeight: 900, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setCustomizeModalImgIndex(prev => prev < galleryImages.length - 1 ? prev + 1 : 0); }}
                          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.65)', color: 'white', border: 'none', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontWeight: 900, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          ›
                        </button>
                        <span style={{ position: 'absolute', bottom: 8, right: 10, background: 'rgba(10,14,26,0.85)', color: 'white', fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 8 }}>
                          📸 {customizeModalImgIndex + 1} / {galleryImages.length}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip selector */}
                  {galleryImages.length > 1 && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, overflowX: 'auto', paddingBottom: 4 }}>
                      {galleryImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Thumb ${idx + 1}`}
                          onClick={() => setCustomizeModalImgIndex(idx)}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 10,
                            objectFit: 'cover',
                            cursor: 'pointer',
                            border: customizeModalImgIndex === idx ? '2px solid #ff6b00' : '1px solid #e2e8f0',
                            opacity: customizeModalImgIndex === idx ? 1 : 0.6,
                            transition: 'all 0.15s ease'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ fontWeight: 900, fontSize: 16, color: '#ff6b00', marginBottom: 12 }}>RD$ {customizeProduct.price}</div>
            <button className="btn-mamey" style={{ width: '100%', padding: 14 }} onClick={() => handleAddToCartCustom(customizeProduct, 'Tostones Crujientes', 'Coca-Cola 2L')}>
              🛒 Agregar al Carrito
            </button>
          </div>
        </div>
      )}

      {/* ULTRA DISH PHOTO STUDIO PRO MODAL */}
      {editingPhotoIndex !== null && (
        <div className="modal-backdrop active" style={{ zIndex: 600 }}>
          <div className="modal-card" style={{ background: '#0a0e1a', color: 'white', borderTop: '3px solid #ff6b00', maxHeight: '92vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 10, background: 'linear-gradient(135deg, #ff6b00, #ff8533)', color: 'white', padding: '2px 8px', borderRadius: 6, fontWeight: 900 }}>
                  ⚡ ESTUDIO ULTRA PRO HD
                </span>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18, color: 'white', margin: '2px 0 0 0' }}>
                  Editor de Fotos de Platillos
                </h3>
              </div>
              <div className="close-btn" onClick={() => setEditingPhotoIndex(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>&times;</div>
            </div>

            {/* Studio Workspace Canvas Preview with Live Animated Templates & 100 Catalog Banners */}
            {(() => {
              const activeBanner = ANIMATED_BANNERS_CATALOG.find(b => b.id === selectedBannerId);
              const animClass = activeBanner ? activeBanner.anim : (
                photoTemplate === 'fire_flash' ? 'studio-fire-border' :
                photoTemplate === 'gold_star' ? 'studio-gold-border' :
                photoTemplate === 'healthy_green' ? 'studio-neon-border' : ''
              );

              return (
                <div
                  onClick={handleCanvasWorkspaceClick}
                  className={animClass}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: 220,
                    borderRadius: 20,
                    overflow: 'hidden',
                    background: '#050811',
                    border: '1px solid rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                    cursor: activeEmojiId ? 'crosshair' : 'default'
                  }}
                >
                  <img
                    src={newProdImages[editingPhotoIndex]}
                    alt="Edit Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      transform: `rotate(${photoRotate}deg) scaleX(${photoFlipH ? -1 : 1})`,
                      filter: `brightness(${photoBrightness}%) contrast(${photoContrast}%) saturate(${photoSaturate}%) ${photoFilter === 'gourmet' ? 'sepia(12%)' : photoFilter === 'fresh' ? 'hue-rotate(5deg)' : ''}`,
                      transition: 'all 0.15s ease'
                    }}
                  />

                  {/* Live Vignette Ring Overlay */}
                  {photoVignette && (
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,0.65) 100%)', pointerEvents: 'none' }} />
                  )}

                  {/* Active Banner Overlay from 100 Catalog */}
                  {activeBanner && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      background: activeBanner.bg,
                      color: 'white',
                      padding: '7px 10px',
                      textAlign: 'center',
                      fontWeight: 900,
                      fontSize: 12,
                      letterSpacing: 0.5,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
                      pointerEvents: 'none',
                      zIndex: 10
                    }}>
                      {activeBanner.text}
                    </div>
                  )}

                  {/* Legacy Overlays for Backwards Compatibility */}
                  {!activeBanner && photoTemplate === 'fire_flash' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'linear-gradient(135deg, #ff6b00, #ef4444)', color: 'white', padding: '6px 0', textAlign: 'center', fontWeight: 900, fontSize: 12, letterSpacing: 0.5, boxShadow: '0 4px 15px rgba(255,107,0,0.5)', pointerEvents: 'none' }}>
                      🔥 OFERTA RELÁMPAGO ⚡
                    </div>
                  )}

                  {!activeBanner && photoTemplate === 'discount_50' && (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: 'white', width: 65, height: 65, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, textAlign: 'center', boxShadow: '0 4px 15px rgba(239,68,68,0.6)', transform: 'rotate(12deg)', pointerEvents: 'none' }}>
                      {customOfferText || '50% OFF'}
                    </div>
                  )}

                  {!activeBanner && photoTemplate === 'gold_star' && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(10, 14, 26, 0.9)', color: '#ffb703', padding: '6px 0', textAlign: 'center', fontWeight: 900, fontSize: 11, borderTop: '2px solid #ffb703', pointerEvents: 'none' }}>
                      👑 SELECCIÓN CHEF VIP ESTRELLA ⭐
                    </div>
                  )}

                  {!activeBanner && photoTemplate === 'flag_criollo' && (
                    <>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: 'linear-gradient(90deg, #002590 50%, #ce1126 50%)', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0, 37, 144, 0.92)', color: 'white', padding: '6px 0', textAlign: 'center', fontWeight: 900, fontSize: 11, pointerEvents: 'none' }}>
                        🇩🇴 100% SABOR CRIOLLO DOMINICANO 🇩🇴
                      </div>
                    </>
                  )}

                  {!activeBanner && photoTemplate === 'healthy_green' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#00e699', color: '#0a0e1a', padding: '6px 0', textAlign: 'center', fontWeight: 900, fontSize: 11, pointerEvents: 'none' }}>
                      🌱 100% NATURAL & SALUDABLE 🥗
                    </div>
                  )}

                  {!activeBanner && photoTemplate === 'new_launch' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#ef4444', color: 'white', padding: '6px 0', textAlign: 'center', fontWeight: 900, fontSize: 12, pointerEvents: 'none' }}>
                      💥 ¡NUEVO LANZAMIENTO! ⭐
                    </div>
                  )}

              {/* Interactive Placed Emoji Stickers */}
              {placedEmojis.map(em => (
                <div
                  key={em.id}
                  onClick={(e) => { e.stopPropagation(); setActiveEmojiId(em.id); }}
                  style={{
                    position: 'absolute',
                    left: `${em.x}%`,
                    top: `${em.y}%`,
                    transform: 'translate(-50%, -50%)',
                    fontSize: em.size,
                    cursor: 'pointer',
                    userSelect: 'none',
                    filter: activeEmojiId === em.id ? 'drop-shadow(0 0 10px #00e699)' : 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
                    border: activeEmojiId === em.id ? '2px dashed #00e699' : 'none',
                    borderRadius: 8,
                    padding: 2,
                    background: activeEmojiId === em.id ? 'rgba(0,230,153,0.15)' : 'transparent',
                    zIndex: 20
                  }}
                >
                  {em.text}
                  {activeEmojiId === em.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemovePlacedEmoji(em.id); }}
                      style={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        fontSize: 10,
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        })()}

            {/* Studio Navigation Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3, marginBottom: 12, background: 'rgba(255,255,255,0.05)', padding: 3, borderRadius: 12 }}>
              <button onClick={() => setEditorTab('emojis')} style={{ background: editorTab === 'emojis' ? '#ff6b00' : 'transparent', color: 'white', border: 'none', padding: '6px 2px', borderRadius: 10, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
                😄 Emojis
              </button>
              <button onClick={() => setEditorTab('templates')} style={{ background: editorTab === 'templates' ? '#ff6b00' : 'transparent', color: 'white', border: 'none', padding: '6px 2px', borderRadius: 10, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
                🖼️ Plantillas
              </button>
              <button onClick={() => setEditorTab('filters')} style={{ background: editorTab === 'filters' ? '#ff6b00' : 'transparent', color: 'white', border: 'none', padding: '6px 2px', borderRadius: 10, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
                🎨 Filtros
              </button>
              <button onClick={() => setEditorTab('adjust')} style={{ background: editorTab === 'adjust' ? '#ff6b00' : 'transparent', color: 'white', border: 'none', padding: '6px 2px', borderRadius: 10, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
                ⚙️ Ajustes
              </button>
              <button onClick={() => setEditorTab('effects')} style={{ background: editorTab === 'effects' ? '#ff6b00' : 'transparent', color: 'white', border: 'none', padding: '6px 2px', borderRadius: 10, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
                🌟 Sellos
              </button>
            </div>

            {/* TAB 0: EMOJIS ANIMADOS & UBIQUIDAD */}
            {editorTab === 'emojis' && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#00e699', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>😄 AÑADIR EMOJI ANIMADO A LA FOTO</span>
                  <span style={{ fontSize: 9, color: '#94a3b8' }}>Toca la foto para ubicar</span>
                </div>

                {/* Emoji Selection Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6, marginBottom: 10, background: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 12 }}>
                  {['🔥', '⚡', '💥', '🍔', '🍗', '🍕', '🍌', '🥑', '🧀', '👑', '⭐', '🌶️', '🏷️', '💸', '🛍️', '💛'].map(emojiChar => (
                    <button
                      key={emojiChar}
                      onClick={() => handleAddEmojiSticker(emojiChar)}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 10,
                        fontSize: 20,
                        padding: '6px 0',
                        cursor: 'pointer',
                        transition: 'transform 0.15s'
                      }}
                    >
                      {emojiChar}
                    </button>
                  ))}
                </div>

                {/* Position Preset Buttons for Active Emoji */}
                {activeEmojiId && (
                  <div style={{ background: 'rgba(0,230,153,0.1)', border: '1px solid rgba(0,230,153,0.3)', padding: 10, borderRadius: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: '#00e699', marginBottom: 6 }}>
                      📍 POSICIONAR EMOJI SELECCIONADO EN CUALQUIER PARTE:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                      <button onClick={() => setPlacedEmojis(prev => prev.map(em => em.id === activeEmojiId ? { ...em, x: 20, y: 20 } : em))} style={{ background: '#121829', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 2px', borderRadius: 8, fontSize: 9, fontWeight: 800, cursor: 'pointer' }}>↖️ Izq Sup</button>
                      <button onClick={() => setPlacedEmojis(prev => prev.map(em => em.id === activeEmojiId ? { ...em, x: 80, y: 20 } : em))} style={{ background: '#121829', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 2px', borderRadius: 8, fontSize: 9, fontWeight: 800, cursor: 'pointer' }}>↗️ Der Sup</button>
                      <button onClick={() => setPlacedEmojis(prev => prev.map(em => em.id === activeEmojiId ? { ...em, x: 50, y: 50 } : em))} style={{ background: '#ff6b00', color: 'white', border: 'none', padding: '5px 2px', borderRadius: 8, fontSize: 9, fontWeight: 900, cursor: 'pointer' }}>🎯 Centro</button>
                      <button onClick={() => setPlacedEmojis(prev => prev.map(em => em.id === activeEmojiId ? { ...em, x: 20, y: 80 } : em))} style={{ background: '#121829', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 2px', borderRadius: 8, fontSize: 9, fontWeight: 800, cursor: 'pointer' }}>↙️ Izq Inf</button>
                      <button onClick={() => setPlacedEmojis(prev => prev.map(em => em.id === activeEmojiId ? { ...em, x: 80, y: 80 } : em))} style={{ background: '#121829', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '5px 2px', borderRadius: 8, fontSize: 9, fontWeight: 800, cursor: 'pointer' }}>↘️ Der Inf</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: 100+ PLANTILLAS Y BANNERS ANIMADOS DE OFERTAS */}
            {editorTab === 'templates' && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 900, color: '#ff6b00', margin: 0 }}>
                    🔥 CATÁLOGO DE 100 BANNERS ANIMADOS
                  </label>
                  {(selectedBannerId || photoTemplate !== 'none') && (
                    <button
                      onClick={() => { setSelectedBannerId(null); setPhotoTemplate('none'); }}
                      style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 900, cursor: 'pointer' }}
                    >
                      ✕ Quitar Banner
                    </button>
                  )}
                </div>

                {/* Category Dropdown Selector (10 Categories) */}
                <select
                  value={bannerCategory}
                  onChange={e => setBannerCategory(e.target.value)}
                  style={{
                    background: '#121829',
                    color: '#ff6b00',
                    border: '1px solid #ff6b00',
                    padding: '8px 10px',
                    borderRadius: 10,
                    fontWeight: 900,
                    fontSize: 12,
                    outline: 'none',
                    width: '100%',
                    marginBottom: 8,
                    cursor: 'pointer'
                  }}
                >
                  <option value="🔥 Fuegos & Relámpagos">🔥 Fuegos & Relámpagos (10)</option>
                  <option value="🏷️ Descuentos & Cupones">🏷️ Descuentos & Cupones (10)</option>
                  <option value="👑 VIP & Chef Gourmet">👑 VIP & Chef Gourmet (10)</option>
                  <option value="🇩🇴 Sabor Criollo">🇩🇴 Sabor Criollo (10)</option>
                  <option value="💥 Lanzamientos">💥 Lanzamientos (10)</option>
                  <option value="🍔 Fast Food & Combos">🍔 Fast Food & Combos (10)</option>
                  <option value="🌱 Saludable & Fitness">🌱 Saludable & Fitness (10)</option>
                  <option value="🚚 Delivery & Envíos">🚚 Delivery & Envíos (10)</option>
                  <option value="🌙 Trasnochadores">🌙 Trasnochadores (10)</option>
                  <option value="🎉 Fiestas & Celebraciones">🎉 Fiestas & Celebraciones (10)</option>
                </select>

                {/* Banner Selector Grid (Scrollable displaying selected category banners) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, maxHeight: 140, overflowY: 'auto', paddingRight: 2 }}>
                  {ANIMATED_BANNERS_CATALOG.filter(b => b.category === bannerCategory).map(b => (
                    <button
                      key={b.id}
                      onClick={() => { setSelectedBannerId(b.id); setPhotoTemplate('custom_banner'); }}
                      style={{
                        background: b.bg,
                        color: 'white',
                        border: selectedBannerId === b.id ? '2px solid white' : '1px solid rgba(255,255,255,0.15)',
                        padding: '8px 6px',
                        borderRadius: 10,
                        fontWeight: 900,
                        fontSize: 10,
                        textAlign: 'center',
                        cursor: 'pointer',
                        boxShadow: selectedBannerId === b.id ? '0 0 10px rgba(255,107,0,0.8)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {b.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: FILTROS GASTRONÓMICOS */}
            {editorTab === 'filters' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 900, color: '#00e699', display: 'block', marginBottom: 6 }}>
                  ✨ FILTROS GASTRONÓMICOS HD
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                  {[
                    { id: 'gourmet', label: '🔥 Gourmet' },
                    { id: 'crispy', label: '🍗 Crocante' },
                    { id: 'fresh', label: '🌿 Fresco' },
                    { id: 'luxury', label: '🖤 Lujo' },
                    { id: 'normal', label: 'Original' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleApplyFilterPreset(f.id)}
                      style={{
                        background: photoFilter === f.id ? 'linear-gradient(135deg, #00e699, #00b377)' : 'rgba(255,255,255,0.06)',
                        color: photoFilter === f.id ? '#0a0e1a' : 'white',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '8px 4px',
                        borderRadius: 10,
                        fontWeight: 900,
                        fontSize: 10,
                        cursor: 'pointer'
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: AJUSTES DE FOTOGRAFÍA */}
            {editorTab === 'adjust' && (
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: 12, borderRadius: 16, marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, marginBottom: 2 }}>☀️ Brillo: {photoBrightness}%</div>
                    <input type="range" min="60" max="150" value={photoBrightness} onChange={e => setPhotoBrightness(Number(e.target.value))} style={{ width: '100%', accentColor: '#ff6b00' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, marginBottom: 2 }}>🌓 Contraste: {photoContrast}%</div>
                    <input type="range" min="60" max="150" value={photoContrast} onChange={e => setPhotoContrast(Number(e.target.value))} style={{ width: '100%', accentColor: '#ff6b00' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 800, marginBottom: 2 }}>🎨 Color: {photoSaturate}%</div>
                    <input type="range" min="50" max="180" value={photoSaturate} onChange={e => setPhotoSaturate(Number(e.target.value))} style={{ width: '100%', accentColor: '#ff6b00' }} />
                  </div>
                </div>
                <label style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'white', fontWeight: 800 }}>
                  <input type="checkbox" checked={photoVignette} onChange={e => setPhotoVignette(e.target.checked)} /> 🌑 Viñeta Oscura de Enfoque (Sombra de Fondo)
                </label>
              </div>
            )}

            {/* TAB 4: SELLOS Y ROTACIÓN */}
            {editorTab === 'effects' && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setPhotoRotate(r => (r + 90) % 360)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 10, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>
                      🔄 Rotar 90°
                    </button>
                    <button onClick={() => setPhotoFlipH(f => !f)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 10, fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>
                      ↔️ Espejo
                    </button>
                  </div>
                </div>

                <label style={{ fontSize: 11, fontWeight: 800, color: '#ff6b00', display: 'block', marginBottom: 4 }}>Sello / Badge sobre la Foto:</label>
                <select value={photoSticker} onChange={e => setPhotoSticker(e.target.value)} style={{ background: '#121829', color: '#ff6b00', border: '1px solid #ff6b00', padding: '8px 10px', borderRadius: 10, fontWeight: 900, fontSize: 12, outline: 'none', width: '100%' }}>
                  <option value="">Sin Sello</option>
                  <option value="🔥 Recién Hecho">🔥 Recién Hecho</option>
                  <option value="⭐ Recomendado">⭐ Recomendado</option>
                  <option value="👑 Plato Estrella">👑 Plato Estrella</option>
                  <option value="🍌 100% Criollo">🍌 100% Criollo</option>
                  <option value="🧀 Extra Queso">🧀 Extra Queso</option>
                  <option value="🌶️ Picante Especial">🌶️ Picante Especial</option>
                </select>
              </div>
            )}

            {/* Confirm & Save Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 }}>
              <button onClick={() => setEditingPhotoIndex(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 800, cursor: 'pointer' }}>
                ✕ Cancelar
              </button>
              <button onClick={handleSavePhotoEdit} style={{ background: 'linear-gradient(135deg, #ff6b00, #ff8533)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 900, fontSize: 14, cursor: 'pointer', boxShadow: '0 6px 20px rgba(255,107,0,0.4)' }}>
                ✨ Aplicar Edición Ultra HD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CART MODAL WITH ITEM DELETION & QUANTITY CONTROLS */}
      {isCartModalOpen && (
        <div className="modal-backdrop active">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18, color: '#ff6b00', margin: 0 }}>🛒 Tu Carrito Pedidos Listo</h3>
                {totalCartItems > 0 && (
                  <span style={{ fontSize: 11, background: '#fff3e6', color: '#ff6b00', padding: '2px 8px', borderRadius: 8, fontWeight: 900 }}>
                    {totalCartItems} Ítems
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {cart.length > 0 && (
                  <button onClick={() => { setCart([]); showToast('🗑️ Carrito vaciado'); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: 8, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
                    Vaciar
                  </button>
                )}
                <div className="close-btn" onClick={() => setIsCartModalOpen(false)}>&times;</div>
              </div>
            </div>

            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🛒</div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 15 }}>Tu carrito está vacío</div>
                <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Agrega platillos deliciosos para realizar tu pedido.</p>
              </div>
            ) : (
              <div>
                <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ flexGrow: 1, paddingRight: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: '#ff6b00', fontWeight: 900, marginTop: 2 }}>
                          RD$ {item.price} <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>(Subtotal: RD$ {item.price * item.qty})</span>
                        </div>
                      </div>

                      {/* Item Quantity Controls & Delete Button */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => handleDecreaseQty(item.id)} title="Disminuir" style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', width: 28, height: 28, borderRadius: 8, fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          -
                        </button>
                        <span style={{ fontWeight: 900, fontSize: 13, minWidth: 18, textAlign: 'center' }}>
                          {item.qty}
                        </span>
                        <button onClick={() => handleIncreaseQty(item.id)} title="Aumentar" style={{ background: '#ff6b00', color: 'white', border: 'none', width: 28, height: 28, borderRadius: 8, fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          +
                        </button>
                        <button onClick={() => handleRemoveCartItem(item.id)} title="Eliminar producto del carrito" style={{ background: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5', width: 28, height: 28, borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer', marginLeft: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Delivery breakdown */}
                <div style={{ borderTop: '2px dashed #e2e8f0', marginTop: 14, paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                    <span>Subtotal Platillos:</span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>RD$ {cartSubtotal}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                    <span>Costo Delivery 🛵:</span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>RD$ 55</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                    <span>Propina Conductor 💛:</span>
                    <span style={{ fontWeight: 800, color: '#0f172a' }}>RD$ {selectedTip}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900, color: '#0f172a', paddingTop: 8, borderTop: '1px solid #e2e8f0' }}>
                    <span>Total a Pagar:</span>
                    <span style={{ color: '#ff6b00' }}>RD$ {cartTotal}</span>
                  </div>
                </div>

                <button className="btn-mamey" style={{ width: '100%', marginTop: 14, padding: 14 }} onClick={() => { setCart([]); setIsCartModalOpen(false); showToast('🔒 ¡Pedido Confirmado con PIN OTP!'); }}>
                  🔒 Confirmar Pedido (RD$ {cartTotal})
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* THERMAL RECEIPT TICKET PRINTER MODAL (58mm / 80mm ESC/POS PREVIEW) */}
      {selectedTicketOrder && (
        <div className="modal-backdrop active" style={{ zIndex: 600 }}>
          <div className="modal-card" style={{ background: '#0a0e1a', color: 'white', borderTop: '4px solid #00e699', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 900, fontSize: 15, color: '#00e699' }}>
                🖨️ Ticket Térmico POS (Impresión ESC/POS)
              </div>
              <div className="close-btn" onClick={() => setSelectedTicketOrder(null)} style={{ color: 'white', background: 'rgba(255,255,255,0.1)' }}>&times;</div>
            </div>

            {/* Thermal Ticket Paper Simulation Card */}
            <div
              id="thermal-receipt-print-area"
              style={{
                background: '#ffffff',
                color: '#000000',
                fontFamily: '"Courier New", Courier, monospace',
                padding: 16,
                borderRadius: 8,
                boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
                fontSize: 12,
                lineHeight: 1.3,
                marginBottom: 14,
                border: '1px solid #cbd5e1'
              }}
            >
              <div style={{ textAlign: 'center', fontWeight: 900, fontSize: 16, marginBottom: 2 }}>
                PEDIDOS LISTO POS 🇩🇴
              </div>
              <div style={{ textAlign: 'center', fontSize: 10, color: '#475569', marginBottom: 6 }}>
                Santiago de los Caballeros, Rep. Dom.<br />
                RNC: 131-98420-1 • Tel: 809-555-LISTO
              </div>
              <div style={{ textAlign: 'center', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '4px 0', margin: '6px 0', fontWeight: 900, fontSize: 13 }}>
                COMANDA #{selectedTicketOrder.id}
              </div>

              <div style={{ fontSize: 10, marginBottom: 6 }}>
                <div><strong>Fecha:</strong> {new Date().toLocaleDateString('es-DO')} {new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}</div>
                <div><strong>NCF:</strong> {selectedTicketOrder.ncf || 'B0200004921'} ({selectedTicketOrder.ncfTypeLabel || 'B02 Consumo'})</div>
                {selectedTicketOrder.rncNumber && <div><strong>RNC Cliente:</strong> {selectedTicketOrder.rncNumber}</div>}
                <div><strong>Cajero:</strong> {selectedTicketOrder.cashierName || 'Juan Pérez (Cajero #1)'}</div>
                <div><strong>Cliente:</strong> {selectedTicketOrder.customerName}</div>
                <div><strong>Tipo:</strong> {selectedTicketOrder.orderTypeLabel || '🛍️ Mostrador / Llevar'}</div>
                <div><strong>Pago:</strong> {selectedTicketOrder.paymentMethod || '💵 Efectivo'}</div>
              </div>

              <div style={{ borderTop: '1px dashed #000', paddingTop: 6, marginBottom: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '25px 1fr 65px', fontWeight: 900, fontSize: 11, marginBottom: 4 }}>
                  <span>Cant</span>
                  <span>Descripción</span>
                  <span style={{ textAlign: 'right' }}>Total</span>
                </div>
                {selectedTicketOrder.items && selectedTicketOrder.items.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '25px 1fr 65px', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ fontWeight: 900 }}>{item.qty}x</span>
                    <span>{item.name}</span>
                    <span style={{ textAlign: 'right', fontWeight: 700 }}>RD${item.price * item.qty}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px dashed #000', paddingTop: 6, fontSize: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>RD$ {selectedTicketOrder.subtotal || Math.round(selectedTicketOrder.total * 0.82)}</span>
                </div>
                {selectedTicketOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#000', fontWeight: 900 }}>
                    <span>Descuento Cupón:</span>
                    <span>- RD$ {selectedTicketOrder.discount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>ITBIS (18% Incl.):</span>
                  <span>RD$ {Math.round(selectedTicketOrder.total * 0.18)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: 14, borderTop: '1px solid #000', paddingTop: 4, marginTop: 4 }}>
                  <span>TOTAL A PAGAR:</span>
                  <span>RD$ {selectedTicketOrder.total}</span>
                </div>

                {selectedTicketOrder.cashTendered > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10 }}>
                      <span>Efectivo Recibido:</span>
                      <span>RD$ {selectedTicketOrder.cashTendered}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, color: '#000', fontSize: 11 }}>
                      <span>CAMBIO ENTREGADO:</span>
                      <span>RD$ {selectedTicketOrder.changeDue || 0}</span>
                    </div>
                  </>
                )}
              </div>

              <div style={{ textAlign: 'center', borderTop: '1px dashed #000', marginTop: 8, paddingTop: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 2 }}>
                  🔑 PIN OTP: {selectedTicketOrder.pinOTP}
                </div>
                <div style={{ fontSize: 9, marginTop: 4 }}>
                  ¡Gracias por su compra en Pedidos Listo!<br />
                  Sistema POS Pedidos Listo • SUNMI Hardware
                </div>
              </div>
            </div>

            {/* Print Action Button */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                onClick={() => window.print()}
                style={{ background: 'linear-gradient(135deg, #00e699, #00b377)', color: '#0a0e1a', border: 'none', padding: 12, borderRadius: 12, fontWeight: 900, fontSize: 13, cursor: 'pointer' }}
              >
                🖨️ Imprimir Ticket
              </button>
              <button
                onClick={() => setSelectedTicketOrder(null)}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CASH REGISTER X/Z CLOSURE REPORT MODAL */}
      {isCashReportOpen && (
        <div className="modal-backdrop active" style={{ zIndex: 600 }}>
          <div className="modal-card" style={{ background: '#121829', color: 'white', borderTop: '4px solid #ffb703' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18, color: '#ffb703', margin: 0 }}>
                📊 Reporte de Cierre de Caja (Corte X/Z)
              </h3>
              <div className="close-btn" onClick={() => setIsCashReportOpen(false)} style={{ color: 'white', background: 'rgba(255,255,255,0.1)' }}>&times;</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 14, marginBottom: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 13 }}>
                <span>💰 Total Ventas en Caja:</span>
                <span style={{ fontWeight: 900, color: '#00e699' }}>RD$ {merchantState.todaySales}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 13 }}>
                <span>🧾 Total Transacciones / Comandas:</span>
                <span style={{ fontWeight: 900, color: 'white' }}>{merchantState.todayOrdersCount} Pedidos</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 13 }}>
                <span>💵 Total Cobrado en Efectivo:</span>
                <span style={{ fontWeight: 900, color: '#00e699' }}>RD$ {Math.round(merchantState.todaySales * 0.65)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: 13 }}>
                <span>💳 Total Cobrado por Tarjeta / Verifone:</span>
                <span style={{ fontWeight: 900, color: '#38bdf8' }}>RD$ {Math.round(merchantState.todaySales * 0.35)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                <span>🏛️ Impuestos ITBIS Retenidos (18%):</span>
                <span style={{ fontWeight: 900, color: '#ffb703' }}>RD$ {Math.round(merchantState.todaySales * 0.18)}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                onClick={() => { window.print(); setIsCashReportOpen(false); }}
                style={{ background: '#ffb703', color: '#0a0e1a', border: 'none', padding: 12, borderRadius: 12, fontWeight: 900, fontSize: 13, cursor: 'pointer' }}
              >
                🖨️ Imprimir Corte Z
              </button>
              <button
                onClick={() => setIsCashReportOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: 12, borderRadius: 12, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
