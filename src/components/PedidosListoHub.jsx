// src/components/PedidosListoHub.jsx
import React, { useState, useEffect } from 'react';
import './PedidosListoHub.css';

// Mock Data for Quick Commerce
const HERO_BANNERS = [
  {
    id: 1,
    tag: '⚡ Listo Market',
    title: 'Supermercado en tu puerta en 15 min',
    desc: 'Hasta 40% OFF en frutas, bebidas y abarrotes hoy.',
    btnText: 'Pedir al Market 🛒',
    bgGradient: 'linear-gradient(135deg, #FF6000 0%, #FF8533 100%)',
    emoji: '🛒'
  },
  {
    id: 2,
    tag: '🍔 Combos Mamey',
    title: 'Los mejores restaurantes de la ciudad',
    desc: 'Envío gratis en tus pedidos de hamburguesas y pizza.',
    btnText: 'Ver Restaurantes 🍕',
    bgGradient: 'linear-gradient(135deg, #E04E00 0%, #FF6000 100%)',
    emoji: '🍔'
  },
  {
    id: 3,
    tag: '🛵 Mándame Express',
    title: 'Envíos instantáneos de paquetes',
    desc: '¿Necesitas enviar llaves o documentos? Lo hacemos por ti.',
    btnText: 'Solicitar Envíos 📦',
    bgGradient: 'linear-gradient(135deg, #D44200 0%, #FF731A 100%)',
    emoji: '🛵'
  }
];

const CATEGORIES = [
  { id: 'restaurantes', name: 'Restaurantes', icon: '🍔', badge: 'Popular', bg: '#FFF0E6' },
  { id: 'market', name: 'Listo Market', icon: '🛒', badge: '15 min', bg: '#E6F9F0' },
  { id: 'mandame', name: 'Mándame', icon: '🛵', badge: 'Express', bg: '#EFF6FF' },
  { id: 'farmacias', name: 'Farmacias', icon: '💊', badge: '24/7', bg: '#FFF5F5' },
  { id: 'bebidas', name: 'Licores & Frías', icon: '🍺', badge: 'Frías', bg: '#FFFBEB' },
  { id: 'ofertas', name: 'Promos Mamey', icon: '⚡', badge: '-50%', bg: '#FFF0F5' },
  { id: 'mascotas', name: 'Mascotas', icon: '🐾', badge: null, bg: '#F5F3FF' },
  { id: 'tiendas', name: 'Variedades', icon: '🛍️', badge: null, bg: '#F0FDF4' }
];

const STORES = [
  {
    id: 'st1',
    name: 'Burger Mamey House',
    cat: 'Hamburguesas & Grill',
    time: '20-30 min',
    rating: '4.9',
    reviews: '340',
    delivery: 'RD$ 75',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    bannerTag: '🔥 2x1 Martes'
  },
  {
    id: 'st2',
    name: 'Listo Market - Villa Olga',
    cat: 'Supermercado & Frescos',
    time: '12-18 min',
    rating: '5.0',
    reviews: '890',
    delivery: 'GRATIS',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    bannerTag: '⚡ Entrega en 15m'
  },
  {
    id: 'st3',
    name: 'Pizzeria Don Mamey',
    cat: 'Pizza Artesanal & Pastas',
    time: '25-35 min',
    rating: '4.8',
    reviews: '520',
    delivery: 'RD$ 50',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    bannerTag: '🍕 Masa Madre'
  },
  {
    id: 'st4',
    name: 'Comida Criolla Doña Rosa',
    cat: 'Sancocho, Mofongo & Pollo',
    time: '15-25 min',
    rating: '4.9',
    reviews: '610',
    delivery: 'RD$ 60',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    bannerTag: '🇩🇴 Sabor Dominicano'
  }
];

const MARKET_PRODUCTS = [
  {
    id: 'p1',
    name: 'Leche Entera 1L',
    price: 110,
    unit: '1 Litro',
    img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=200&q=80',
    cat: 'market'
  },
  {
    id: 'p2',
    name: 'Cerveza Presidente 6-Pack',
    price: 650,
    unit: 'Lata 12oz',
    img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=200&q=80',
    cat: 'bebidas'
  },
  {
    id: 'p3',
    name: 'Pan de Agua Fresco',
    price: 75,
    unit: 'Funda 10 u',
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
    cat: 'market'
  },
  {
    id: 'p4',
    name: 'Aguacate Hass Premium',
    price: 85,
    unit: 'Por unidad',
    img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=200&q=80',
    cat: 'market'
  },
  {
    id: 'p5',
    name: 'Burger Mamey Especial',
    price: 390,
    unit: 'Doble carne + papas',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
    cat: 'restaurantes'
  }
];

export default function PedidosListoHub({ lang = 'es', navigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCat, setSelectedCat] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('Villa Olga, Calle 5 #12, Santiago');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [tipAmount, setTipAmount] = useState(50);

  // Auto-slide hero banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Cart functions
  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const deliveryFee = subtotal > 500 ? 0 : 75;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + serviceFee + tipAmount;

  const handleConfirmOrder = () => {
    if (cartItems.length === 0) return;
    const newOrder = {
      id: 'PL-' + Math.floor(100000 + Math.random() * 900000),
      items: cartItems,
      total: total,
      address: deliveryAddress,
      status: 'confirmado',
      time: '15-25 min',
      riderName: 'Juan Carlos M. (Mándame Rider)',
      riderPhone: '809-555-0192'
    };
    setActiveTrackingOrder(newOrder);
    setCartItems([]);
    setShowCartDrawer(false);
  };

  return (
    <div className="pedidos-listo-container">
      {/* 1. BARRA SUPERIOR DE UBICACIÓN & BÚSQUEDA */}
      <div className="pl-header">
        <div className="pl-location-bar" onClick={() => {
          const newAddr = prompt('Escribe tu dirección de entrega:', deliveryAddress);
          if (newAddr) setDeliveryAddress(newAddr);
        }}>
          <div className="pl-loc-left">
            <div className="pl-loc-icon">📍</div>
            <div className="pl-loc-text">
              <span className="pl-loc-label">Entregar en</span>
              <span className="pl-loc-address">{deliveryAddress} ▾</span>
            </div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--mamey-primary)', background: 'var(--mamey-light)', padding: '4px 10px', borderRadius: 12 }}>
            ⚡ 15-25 min
          </span>
        </div>

        <div className="pl-search-bar">
          <span className="pl-search-icon-left">🔍</span>
          <input
            type="text"
            className="pl-search-input"
            placeholder="¿Qué se te antoja hoy? (Comida, súper, farmacia...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="pl-search-icon-right">🎤</button>
        </div>
      </div>

      {/* 2. HERO BANNERS CAROUSEL (ESTILO PEDIDOSYA EN MAMEY) */}
      <div className="pl-banner-wrapper">
        {HERO_BANNERS.map((banner, index) => (
          index === currentSlide && (
            <div
              key={banner.id}
              className="pl-banner-slide"
              style={{ background: banner.bgGradient }}
            >
              <div className="pl-banner-info">
                <span className="pl-banner-tag">{banner.tag}</span>
                <h3 className="pl-banner-title">{banner.title}</h3>
                <p className="pl-banner-desc">{banner.desc}</p>
                <button className="pl-banner-btn" onClick={() => setSelectedCat(banner.id === 1 ? 'market' : banner.id === 2 ? 'restaurantes' : 'mandame')}>
                  {banner.btnText}
                </button>
              </div>
              <div className="pl-banner-img-wrap">{banner.emoji}</div>
            </div>
          )
        ))}
        <div className="pl-banner-dots">
          {HERO_BANNERS.map((_, idx) => (
            <button
              key={idx}
              className={`pl-banner-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
            />
          ))}
        </div>
      </div>

      {/* 3. MOSAICO DE CATEGORÍAS (QUICK-COMMERCE GRID) */}
      <div className="pl-grid-title-row">
        <h3 className="pl-section-title">Servicios Pedidos Listo</h3>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--mamey-primary)', cursor: 'pointer' }}>
          Ver todos →
        </span>
      </div>

      <div className="pl-grid-categories">
        {CATEGORIES.map(cat => (
          <div
            key={cat.id}
            className={`pl-cat-card ${selectedCat === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCat(cat.id === selectedCat ? 'todos' : cat.id)}
          >
            {cat.badge && <span className="pl-cat-badge">{cat.badge}</span>}
            <div className="pl-cat-icon-box" style={{ background: cat.bg }}>
              {cat.icon}
            </div>
            <span className="pl-cat-name">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* 4. CARRUSEL DE PRODUCTOS DE LISTO MARKET */}
      <div className="pl-horizontal-section">
        <div className="pl-grid-title-row">
          <h3 className="pl-section-title">🛒 Listo Market - Entrega en 15 min</h3>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--mamey-primary)', cursor: 'pointer' }}>
            Explorar súper
          </span>
        </div>

        <div className="pl-horiz-scroll">
          {MARKET_PRODUCTS.map(prod => (
            <div key={prod.id} className="pl-product-card" onClick={() => setSelectedProduct(prod)}>
              <img src={prod.img} alt={prod.name} className="pl-product-img" />
              <div>
                <p className="pl-product-name">{prod.name}</p>
                <div className="pl-product-price-row">
                  <span className="pl-product-price">RD$ {prod.price}</span>
                  <button
                    className="pl-product-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(prod);
                    }}
                  >+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. LOCALE & RESTAURANTES DESTACADOS */}
      <div className="pl-horizontal-section">
        <div className="pl-grid-title-row">
          <h3 className="pl-section-title">🔥 Restaurantes & Locales Populares</h3>
        </div>

        <div className="pl-horiz-scroll">
          {STORES.map(store => (
            <div key={store.id} className="pl-store-card" onClick={() => alert(`Abriendo menú de ${store.name}`)}>
              <div className="pl-store-banner" style={{ backgroundImage: `url(${store.img})` }}>
                <span className="pl-store-tag">{store.bannerTag}</span>
                <span className="pl-store-time">⏱️ {store.time}</span>
              </div>
              <div className="pl-store-body">
                <h4 className="pl-store-name">{store.name}</h4>
                <p className="pl-store-sub">{store.cat}</p>
                <div className="pl-store-meta">
                  <span className="pl-store-rating">★ {store.rating} ({store.reviews})</span>
                  <span className="pl-store-delivery">🛵 {store.delivery}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. BOTÓN FLOTANTE DEL CARRITO */}
      {cartItems.length > 0 && (
        <div className="pl-floating-cart" onClick={() => setShowCartDrawer(true)}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="pl-cart-badge">{cartItems.reduce((a,b) => a + b.qty, 0)}</span>
            <span className="pl-cart-text">Ver Mi Pedido Listo</span>
          </div>
          <span className="pl-cart-total">RD$ {total.toLocaleString()} →</span>
        </div>
      )}

      {/* 7. MODAL DRAWER DE CARRITO & CHECKOUT */}
      {showCartDrawer && (
        <div className="pl-modal-overlay" onClick={() => setShowCartDrawer(false)}>
          <div className="pl-cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="pl-drawer-header">
              <h3 className="pl-drawer-title">🛒 Mi Pedido Listo</h3>
              <button className="pl-close-btn" onClick={() => setShowCartDrawer(false)}>✕</button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#666', margin: '0 0 6px' }}>📍 DIRECCIÓN DE ENTREGA</p>
              <div style={{ background: '#F8F9FA', padding: '10px 14px', borderRadius: 14, fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>
                {deliveryAddress}
              </div>
            </div>

            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 14 }}>
              {cartItems.map(item => (
                <div key={item.id} className="pl-cart-item-row">
                  <div className="pl-cart-item-info">
                    <div>
                      <p className="pl-cart-item-name">{item.name}</p>
                      <p className="pl-cart-item-sub">RD$ {item.price} c/u</p>
                    </div>
                  </div>
                  <div className="pl-cart-qty-controls">
                    <button className="pl-qty-btn" onClick={() => updateQty(item.id, -1)}>-</button>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{item.qty}</span>
                    <button className="pl-qty-btn" onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pl-checkout-summary">
              <div className="pl-sum-row">
                <span>Subtotal</span>
                <span>RD$ {subtotal.toLocaleString()}</span>
              </div>
              <div className="pl-sum-row">
                <span>Costo de Envío 🛵</span>
                <span>{deliveryFee === 0 ? 'GRATIS' : `RD$ ${deliveryFee}`}</span>
              </div>
              <div className="pl-sum-row">
                <span>Tarifa de servicio</span>
                <span>RD$ {serviceFee}</span>
              </div>
              <div className="pl-sum-row total">
                <span>Total a Pagar</span>
                <span style={{ color: 'var(--mamey-primary)' }}>RD$ {total.toLocaleString()}</span>
              </div>
            </div>

            <button className="pl-order-confirm-btn" onClick={handleConfirmOrder}>
              🚀 Confirmar & Realizar Pedido
            </button>
          </div>
        </div>
      )}

      {/* 8. MODAL DE SEGUIMIENTO EN TIEMPO REAL (RASTREO EN VIVO) */}
      {activeTrackingOrder && (
        <div className="pl-modal-overlay">
          <div className="pl-cart-drawer" style={{ background: '#FFFFFF', borderRadius: '28px' }}>
            <div className="pl-drawer-header">
              <h3 className="pl-drawer-title">🛵 Seguimiento de Pedido Listo</h3>
              <button className="pl-close-btn" onClick={() => setActiveTrackingOrder(null)}>✕</button>
            </div>

            <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🛵💨</div>
              <h4 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 900, color: '#1A1A2E' }}>
                ¡El repartidor va en camino!
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: '#777', fontWeight: 600 }}>
                Tiempo estimado de llegada: <strong>15 - 20 minutos</strong>
              </p>
            </div>

            <div style={{ background: '#FFF4EE', border: '1.5px solid #FFE4D6', borderRadius: 18, padding: 16, marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 900, color: 'var(--mamey-primary)' }}>
                REPARTIDOR ASIGNADO
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--mamey-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                    🛵
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1A1A2E' }}>{activeTrackingOrder.riderName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#777' }}>Mándame Rider • ⭐ 4.9</p>
                  </div>
                </div>
                <button
                  style={{ padding: '8px 14px', borderRadius: 12, background: '#10B981', color: '#FFF', border: 'none', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}
                  onClick={() => alert(`Llamando al repartidor ${activeTrackingOrder.riderPhone}...`)}
                >
                  📞 Llamar
                </button>
              </div>
            </div>

            <button
              className="pl-order-confirm-btn"
              style={{ background: '#1A1A2E' }}
              onClick={() => setActiveTrackingOrder(null)}
            >
              Cerrar Mapa de Rastreo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
