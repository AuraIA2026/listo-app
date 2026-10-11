// src/components/PedidosListoHub.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import './PedidosListoHub.css';
import ConfigurarRestauranteModal from './ConfigurarRestauranteModal';

const HERO_BANNERS = [
  {
    id: 1,
    tag: '⚡ Listo Market 15m',
    title: 'Supermercado a tu puerta en 15 min',
    desc: 'Hasta 40% OFF en frutas, bebidas y abarrotes.',
    btnText: 'Pedir al Súper 🛒',
    bgGradient: 'linear-gradient(135deg, #FF6000 0%, #FF8533 100%)',
    emoji: '🛒',
    catId: 'market'
  },
  {
    id: 2,
    tag: '🍔 Combos Mamey',
    title: 'Los mejores restaurantes de la ciudad',
    desc: 'Envío gratis en tus hamburguesas y pizzas favoritas.',
    btnText: 'Ver Restaurantes 🍕',
    bgGradient: 'linear-gradient(135deg, #E04E00 0%, #FF6000 100%)',
    emoji: '🍔',
    catId: 'restaurantes'
  },
  {
    id: 3,
    tag: '🛵 Mándame Express',
    title: 'Envíos instantáneos de paquetes',
    desc: 'Envía llaves, documentos o encargos en minutos.',
    btnText: 'Solicitar Rider 📦',
    bgGradient: 'linear-gradient(135deg, #D44200 0%, #FF731A 100%)',
    emoji: '🛵',
    catId: 'mandame'
  }
];

const DUAL_SLIDES = [
  {
    id: 1,
    left: {
      bg: '#3B0764',
      badge: 'plus',
      title: '6 meses Gratis',
      desc: '+3 meses al 50% OFF con tus Tarjetas Mastercard Standard o Gold APAP',
      btnText: 'Suscribirme',
      btnClass: 'pl-btn-green',
      action: 'sub'
    },
    right: {
      bg: '#D50000',
      badge: 'COMBO PROMO',
      title: 'RD$ 299 Pechuga',
      desc: 'Pechurinas crujientes con tostones y refresco frío incluido.',
      btnText: 'Pedir Combo',
      btnClass: 'pl-btn-white',
      action: 'combo'
    }
  },
  {
    id: 2,
    left: {
      bg: '#FF6000',
      badge: 'SUPERMARKET',
      title: 'Envío Gratis Súper',
      desc: 'En tu compra de Listo Market mayor a RD$ 500 en 15 minutos.',
      btnText: 'Ir al Súper',
      btnClass: 'pl-btn-white',
      action: 'market'
    },
    right: {
      bg: '#1E1B4B',
      badge: 'MÁNDAME',
      title: '50% OFF Courier',
      desc: 'Envía documentos y paquetes por la ciudad a mitad de precio.',
      btnText: 'Pedir Rider',
      btnClass: 'pl-btn-green',
      action: 'mandame'
    }
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
    id: 'st-fiera',
    name: 'La Fiera Hot Dog',
    cat: 'restaurantes',
    sub: 'Hot Dogs Dominicanos & Fast Food Criollo',
    time: '10-20 min',
    rating: '5.0',
    reviews: '980',
    delivery: 'Envío GRATIS',
    img: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&w=1000&q=80',
    logo: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=200&q=80',
    address: 'Av. 27 de Febrero esq. Estrella Sadhalá, Santiago, República Dominicana',
    phone: '809-583-1020',
    whatsapp: '18095831020',
    socials: {
      instagram: '@lafierahotdog.rd',
      facebook: 'facebook.com/lafierahotdog',
      tiktok: '@lafierahotdog'
    },
    bannerTag: '🌭 #1 en Santiago',
    menu: [
      { id: 'm-f1', name: '🌭 Hot Dog La Fiera Especial', price: 220, desc: 'Salchicha parrillera artesanal, repollo criollo dulce, tocineta crocante y salsa de la casa.', img: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=200&q=80' },
      { id: 'm-f2', name: '🧀 Hot Dog Triple Queso Fundido', price: 260, desc: 'Pan brioche tostado, salchicha gigante, triple queso cheddar, mozzarella y maíz.', img: 'https://images.unsplash.com/photo-1627054234553-91147a46979a?auto=format&fit=crop&w=200&q=80' },
      { id: 'm-f3', name: '🍟 Papas Fritas Fiera Monster', price: 250, desc: 'Papas fritas con salchicha parrillera troceada, tocineta y salsa cheddar caliente.', img: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=200&q=80' },
      { id: 'm-f4', name: '🥤 Refresco Cola 20oz Bien Frío', price: 65, desc: 'Refresco dominicano helado de 20oz.', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80' }
    ]
  }
];

const MARKET_PRODUCTS = [
  { id: 'p1', name: 'Leche Entera 1L', price: 110, unit: '1 Litro', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=200&q=80' },
  { id: 'p2', name: 'Cerveza Presidente 6-Pack', price: 650, unit: 'Lata 12oz', img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=200&q=80' },
  { id: 'p3', name: 'Pan de Agua Fresco', price: 75, unit: 'Funda 10 u', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80' },
  { id: 'p4', name: 'Aguacate Hass Premium', price: 85, unit: 'Por unidad', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=200&q=80' },
  { id: 'p5', name: 'Burger Mamey Especial', price: 390, unit: 'Doble carne', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80' }
];

export default function PedidosListoHub({ lang = 'es', navigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dualSlideIndex, setDualSlideIndex] = useState(0);
  const [selectedCat, setSelectedCat] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showMandameModal, setShowMandameModal] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('Villa Olga, Calle 5 #12, Santiago');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [tipAmount, setTipAmount] = useState(50);

  // REAL LIVE COUNTDOWN TIMER (39 MIN 47 SEC = 2387 SECONDS)
  const [secondsLeft, setSecondsLeft] = useState(2387);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 2387));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Mándame State
  const [mandamePickUp, setMandamePickUp] = useState('Mi ubicación actual');
  const [mandameDropOff, setMandameDropOff] = useState('');
  const [mandameType, setMandameType] = useState('Documentos');

  // Auto-slide hero banner & dual carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const dualTimer = setInterval(() => {
      setDualSlideIndex(prev => (prev + 1) % DUAL_SLIDES.length);
    }, 4000);
    return () => clearInterval(dualTimer);
  }, []);

  const [dbStores, setDbStores] = useState([]);

  useEffect(() => {
    let unsub = () => {};
    try {
      const q = query(collection(db, 'locales'));
      unsub = onSnapshot(q, (snap) => {
        const loaded = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.nombre || 'Restaurante Partner',
            cat: (d.categoria || '').toLowerCase().includes('market') ? 'market' : 'restaurantes',
            sub: d.categoria || 'Gastronomía & Platos',
            time: d.horario || '20-30 min',
            rating: Number(d.rating || 5.0).toFixed(1),
            reviews: d.totalResenas || 48,
            delivery: 'RD$ 75',
            img: d.portadaURL || d.logoURL || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
            cover: d.portadaURL || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
            logo: d.logoURL || d.portadaURL || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
            address: d.direccion || 'Santiago Centro, República Dominicana',
            phone: d.telefono || d.phone || d.whatsapp || '809-555-0100',
            whatsapp: d.whatsapp || '',
            socials: {
              instagram: d.instagram || '',
              facebook: d.facebook || '',
              tiktok: d.tiktok || ''
            },
            bannerTag: '👑 Local VIP Partner',
            menu: (d.servicios && d.servicios.length > 0)
              ? d.servicios.map((s, idx) => ({
                  id: `db_${doc.id}_${idx}`,
                  name: s.nombre,
                  price: parseFloat(String(s.precio).replace(/[^0-9.]/g, '')) || 250,
                  desc: s.descripcion || 'Especialidad de la casa preparada al momento.',
                  img: s.fotoURL || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80'
                }))
              : [
                  { id: `db_combo_${doc.id}`, name: 'Combo Especial de la Casa', price: 350, desc: 'Plato principal con guarnición y bebida fría.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80' }
                ]
          };
        }).filter(st => st.activo !== false);
        setDbStores(loaded);
      }, () => {});
    } catch(e) {}
    return () => unsub();
  }, []);

  const isFieraStore = (st) => {
    const n = (st?.name || '').toLowerCase();
    return n.includes('fiera') || n.includes('hot dog') || n.includes('hotdog');
  };

  const filteredDbStores = dbStores.filter(isFieraStore);
  const allAvailableStores = filteredDbStores.length > 0 ? filteredDbStores : STORES;

  // Filter stores by category
  const filteredStores = allAvailableStores.filter(st => {
    const matchesCat = selectedCat === 'todos' || st.cat === selectedCat;
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          st.sub.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Cart functions
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
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

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) return;
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const orderData = {
      orderId: 'PL-' + Math.floor(100000 + Math.random() * 900000),
      type: 'delivery',
      clientId: auth.currentUser?.uid || 'guest_client',
      clientName: auth.currentUser?.displayName || 'Cliente Listo',
      clientEmail: auth.currentUser?.email || '',
      clientPhone: auth.currentUser?.phoneNumber || '809-555-0192',
      items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      serviceFee: serviceFee,
      tipAmount: tipAmount,
      total: total,
      deliveryAddress: deliveryAddress,
      address: deliveryAddress,
      paymentMethod: paymentMethod,
      pinOTP: pin,
      storeName: 'La Fiera Hot Dog',
      status: 'pending',
      createdAt: serverTimestamp(),
      dateToken: 'Hoy',
      timeToken: '15-25 min',
      proName: 'Juan Carlos M. (Mándame Rider)',
      proSpecialty: 'Delivery & Reparto Express',
      proAvatar: '🛵',
      proPhone: '809-555-0192',
      estimatedTime: 18,
      coords: { lat: 18.4861, lng: -69.9312 }
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      await addDoc(collection(db, 'notificaciones'), {
        userId: auth.currentUser?.uid || 'guest_client',
        orderId: docRef.id,
        type: 'new_order',
        title: '🛵 ¡Pedido Confirmado!',
        text: `Tu pedido #${orderData.orderId} por RD$ ${total} está en camino. Tu PIN de seguridad es: ${pin}`,
        read: false,
        icon: '🛵',
        createdAt: serverTimestamp()
      });

      // Notificación directa a la Comandera Cocina del Restaurante
      try {
        await addDoc(collection(db, 'notificaciones'), {
          userId: 'merchant',
          orderId: docRef.id,
          type: 'kitchen_order',
          title: '🚨 ¡Nuevo Pedido en Comandera Cocina!',
          text: `Pedido #${orderData.orderId} por RD$ ${total.toLocaleString()} recibido para preparar.`,
          read: false,
          icon: '🔔',
          pinOTP: pin,
          createdAt: serverTimestamp()
        });
      } catch (eM) {}

      const confirmed = { ...orderData, id: docRef.id };
      setActiveTrackingOrder(confirmed);
      setCartItems([]);
      setShowCartDrawer(false);

      if (navigate) {
        setTimeout(() => {
          navigate('tracking', confirmed);
        }, 500);
      }
    } catch (err) {
      console.warn('Fallback local order:', err);
      const fallback = {
        id: 'PL-' + Math.floor(100000 + Math.random() * 900000),
        orderId: 'PL-' + Math.floor(100000 + Math.random() * 900000),
        type: 'delivery',
        items: cartItems,
        total: total,
        address: deliveryAddress,
        deliveryAddress: deliveryAddress,
        status: 'pending',
        pinOTP: pin,
        time: '15-25 min',
        dateToken: 'Hoy',
        timeToken: '15-25 min',
        proName: 'Juan Carlos M. (Mándame Rider)',
        proSpecialty: 'Delivery & Reparto Express',
        proAvatar: '🛵',
        proPhone: '809-555-0192',
        riderName: 'Juan Carlos M. (Mándame Rider)',
        riderPhone: '809-555-0192',
        coords: { lat: 18.4861, lng: -69.9312 }
      };
      setActiveTrackingOrder(fallback);
      setCartItems([]);
      setShowCartDrawer(false);

      if (navigate) {
        setTimeout(() => {
          navigate('tracking', fallback);
        }, 500);
      }
    }
  };

  const handleRequestMandame = async (e) => {
    e.preventDefault();
    if (!mandameDropOff.trim()) {
      alert('Por favor ingresa la dirección de entrega para el envío Mándame.');
      return;
    }
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const orderData = {
      orderId: 'MD-' + Math.floor(100000 + Math.random() * 900000),
      type: 'delivery',
      clientId: auth.currentUser?.uid || 'guest_client',
      clientName: auth.currentUser?.displayName || 'Cliente Listo',
      clientEmail: auth.currentUser?.email || '',
      clientPhone: auth.currentUser?.phoneNumber || '809-555-9988',
      items: [{ name: `Envío Mándame: ${mandameType}`, price: 120, qty: 1 }],
      total: 120 + 20,
      deliveryAddress: mandameDropOff,
      address: mandameDropOff,
      status: 'pending',
      pinOTP: pin,
      createdAt: serverTimestamp(),
      dateToken: 'Hoy',
      timeToken: '10-20 min',
      proName: 'Pedro Rodríguez (Mándame Express)',
      proSpecialty: 'Courier & Encomiendas',
      proAvatar: '🛵',
      proPhone: '809-555-9988',
      estimatedTime: 15,
      coords: { lat: 18.4861, lng: -69.9312 }
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      await addDoc(collection(db, 'notificaciones'), {
        userId: auth.currentUser?.uid || 'guest_client',
        orderId: docRef.id,
        type: 'new_order',
        title: '📦 ¡Envío Mándame Asignado!',
        text: `Tu mensajero va en camino a ${mandameDropOff}. PIN de entrega: ${pin}`,
        read: false,
        icon: '📦',
        createdAt: serverTimestamp()
      });
      const confirmed = { ...orderData, id: docRef.id };
      setActiveTrackingOrder(confirmed);
      setShowMandameModal(false);
      setMandameDropOff('');
      if (navigate) {
        setTimeout(() => {
          navigate('tracking', confirmed);
        }, 800);
      }
    } catch (err) {
      console.error('Error guardando envío:', err);
      const fallback = {
        id: 'MD-' + Math.floor(100000 + Math.random() * 900000),
        items: [{ name: `Envío Mándame: ${mandameType}`, price: 120, qty: 1 }],
        total: 120 + 20,
        address: mandameDropOff,
        status: 'confirmado',
        pinOTP: pin,
        time: '10-20 min',
        riderName: 'Pedro Rodríguez (Mándame Express)',
        riderPhone: '809-555-9988'
      };
      setActiveTrackingOrder(fallback);
      setShowMandameModal(false);
      setMandameDropOff('');
    }
  };

  const handleDualAction = (action) => {
    if (action === 'sub') {
      alert('🎉 ¡Te has suscrito a Listo Plus! Disfruta 6 meses Gratis de envíos a 0 costo.');
    } else if (action === 'combo') {
      const comboItem = { id: 'combo_pechuga', name: 'RD$ 299 Combo Pechuguitas + Tostones + Refresco', price: 299 };
      addToCart(comboItem);
      setShowCartDrawer(true);
    } else if (action === 'market') {
      setSelectedCat('market');
    } else if (action === 'mandame') {
      setShowMandameModal(true);
    }
  };

  const currentDual = DUAL_SLIDES[dualSlideIndex];

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
          <button className="pl-search-icon-right" onClick={() => alert('Búsqueda por voz activada')}>🎤</button>
        </div>
      </div>

      {/* 2. BANNER OFERTA RELÁMPAGO AMARILLO (CON RELOJ EN VIVO 39:47) */}
      <div className="pl-yellow-flash-card">
        <div>
          <div className="pl-flash-timer-pill">
            <span>⏱️</span>
            <span>{formatCountdown(secondsLeft)}</span>
          </div>
          <h2 className="pl-yellow-title">Ahorra hasta RD$ 300</h2>
          <p className="pl-yellow-desc">Prueba nuevos sabores y disfruta Descuentos fugaces.</p>
          <button className="pl-yellow-btn" onClick={() => setSelectedCat('restaurantes')}>
            Descubrir locales
          </button>
        </div>
        <div className="pl-clock-graphic-wrap">
          ⏰
        </div>
      </div>

      {/* 3. CARRUSEL DE BANNERS DOBLES INTERACTIVOS (PURPLE & MAMEY COMBOS) */}
      <div className="pl-dual-carousel-wrapper">
        <div className="pl-dual-grid">
          {/* BANNER IZQUIERDO (PURPLE) */}
          <div className="pl-card-purple" style={{ background: currentDual.left.bg }}>
            <div>
              <span className="pl-mini-badge">{currentDual.left.badge}</span>
              <h3 className="pl-dual-title">{currentDual.left.title}</h3>
              <p className="pl-dual-desc">{currentDual.left.desc}</p>
            </div>
            <button className={currentDual.left.btnClass} onClick={() => handleDualAction(currentDual.left.action)}>
              {currentDual.left.btnText}
            </button>
          </div>

          {/* BANNER DERECHO (RED/MAMEY COMBO) */}
          <div className="pl-card-mamey-combo" style={{ background: currentDual.right.bg }}>
            <div>
              <span className="pl-mini-badge">{currentDual.right.badge}</span>
              <h3 className="pl-dual-title">{currentDual.right.title}</h3>
              <p className="pl-dual-desc">{currentDual.right.desc}</p>
            </div>
            <button className={currentDual.right.btnClass} onClick={() => handleDualAction(currentDual.right.action)}>
              {currentDual.right.btnText}
            </button>
          </div>
        </div>

        {/* PUNTOS INDICADORES DE CARRUSEL DOBLE */}
        <div className="pl-dual-dots">
          {DUAL_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`pl-dual-dot ${idx === dualSlideIndex ? 'active' : ''}`}
              onClick={() => setDualSlideIndex(idx)}
            />
          ))}
        </div>
      </div>

      {/* 4. HERO BANNERS CAROUSEL (MAMEY BRAND) */}
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
                <button className="pl-banner-btn" onClick={() => {
                  if (banner.catId === 'mandame') setShowMandameModal(true);
                  else setSelectedCat(banner.catId);
                }}>
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

      {/* 5. MOSAICO DE CATEGORÍAS (QUICK-COMMERCE GRID) */}
      <div className="pl-grid-title-row">
        <h3 className="pl-section-title">Servicios Pedidos Listo</h3>
        {selectedCat !== 'todos' && (
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--mamey-primary)', cursor: 'pointer' }} onClick={() => setSelectedCat('todos')}>
            ✕ Ver Todos
          </span>
        )}
      </div>

      <div className="pl-grid-categories">
        {CATEGORIES.map(cat => (
          <div
            key={cat.id}
            className={`pl-cat-card ${selectedCat === cat.id ? 'active' : ''}`}
            onClick={() => {
              if (cat.id === 'mandame') setShowMandameModal(true);
              else setSelectedCat(cat.id === selectedCat ? 'todos' : cat.id);
            }}
          >
            {cat.badge && <span className="pl-cat-badge">{cat.badge}</span>}
            <div className="pl-cat-icon-box" style={{ background: cat.bg }}>
              {cat.icon}
            </div>
            <span className="pl-cat-name">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* 6. CARRUSEL DE PRODUCTOS DE LISTO MARKET */}
      <div className="pl-horizontal-section">
        <div className="pl-grid-title-row">
          <h3 className="pl-section-title">🛒 Listo Market - Entrega en 15 min</h3>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--mamey-primary)', cursor: 'pointer' }} onClick={() => setSelectedCat('market')}>
            Explorar súper
          </span>
        </div>

        <div className="pl-horiz-scroll">
          {MARKET_PRODUCTS.map(prod => (
            <div key={prod.id} className="pl-product-card" onClick={() => addToCart(prod)}>
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

      {/* 7. LOCALE & RESTAURANTES DESTACADOS */}
      <div className="pl-horizontal-section">
        <div className="pl-grid-title-row">
          <h3 className="pl-section-title">🔥 Restaurantes & Locales Populares</h3>
        </div>

        <div className="pl-horiz-scroll">
          {filteredStores.map(store => (
            <div key={store.id} className="pl-store-card" onClick={() => setSelectedStore(store)}>
              <div className="pl-store-banner" style={{ backgroundImage: `url(${store.img})` }}>
                <span className="pl-store-tag">{store.bannerTag}</span>
                <span className="pl-store-time">⏱️ {store.time}</span>
              </div>
              <div className="pl-store-body">
                <h4 className="pl-store-name">{store.name}</h4>
                <p className="pl-store-sub">{store.sub}</p>
                <div className="pl-store-meta">
                  <span className="pl-store-rating">★ {store.rating} ({store.reviews})</span>
                  <span className="pl-store-delivery">🛵 {store.delivery}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. BOTÓN FLOTANTE DEL CARRITO */}
      {cartItems.length > 0 && (
        <div className="pl-floating-cart" onClick={() => setShowCartDrawer(true)}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="pl-cart-badge">{cartItems.reduce((a,b) => a + b.qty, 0)}</span>
            <span className="pl-cart-text">Ver Mi Pedido Listo</span>
          </div>
          <span className="pl-cart-total">RD$ {total.toLocaleString()} →</span>
        </div>
      )}

      {/* 9. MODAL DETALLE DE TIENDA / MENÚ CON PORTADA, LOGO, DIRECCIÓN, TELÉFONO Y REDES SOCIALES */}
      {selectedStore && (
        <div 
          className="pl-modal-overlay" 
          onClick={() => setSelectedStore(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(10, 14, 26, 0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            boxSizing: 'border-box',
            overflowY: 'auto'
          }}
        >
          <div 
            className="pl-store-modal-card" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              display: 'block',
              borderRadius: '24px', 
              maxHeight: '92vh', 
              overflowY: 'auto', 
              overflowX: 'hidden', 
              padding: 0,
              width: '100%',
              maxWidth: 480,
              margin: 'auto',
              background: '#FFFFFF',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1.5px solid rgba(255,107,0,0.2)',
              boxSizing: 'border-box'
            }}
          >
            
            {/* 1. PORTADA DEL RESTAURANTE (COMPLETA Y ESPACIOSA SIN CORTAR) */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: 190,
              overflow: 'hidden',
              background: '#0F172A',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24
            }}>
              <img
                src={selectedStore.cover || selectedStore.img || 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&w=1000&q=80'}
                alt={selectedStore.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block'
                }}
              />
              {/* GRADIENTE SUPERIOR SUTIL PARA BOTONES */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: '12px 14px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 2
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ background: '#FF6000', color: '#FFF', padding: '4px 10px', borderRadius: 12, fontSize: 10.5, fontWeight: 900, boxShadow: '0 4px 10px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                    {selectedStore.bannerTag || '🌭 #1 en Santiago 🇩🇴'}
                  </span>
                  <button
                    onClick={() => setShowConfigModal(true)}
                    style={{
                      background: 'rgba(0,0,0,0.65)',
                      color: '#FFF',
                      border: '1px solid rgba(255,255,255,0.4)',
                      padding: '4px 10px',
                      borderRadius: 12,
                      fontSize: 10.5,
                      fontWeight: 900,
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ⚙️ Configurar
                  </button>
                </div>
                <button
                  onClick={() => setSelectedStore(null)}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 15, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', flexShrink: 0 }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* CONTENIDO INTERNO */}
            <div style={{ padding: '0 16px 24px', boxSizing: 'border-box', width: '100%' }}>
              
              {/* 2. FILA DE PERFIL: LOGO FLOTANTE + NOMBRE + BOTÓN CONFIGURAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -38, marginBottom: 14, position: 'relative', zIndex: 3, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 200px' }}>
                  <img
                    src={selectedStore.logo || selectedStore.img}
                    alt={selectedStore.name}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 20,
                      objectFit: 'cover',
                      border: '4px solid #FFFFFF',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                      background: '#FFFFFF',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: '#0F172A', lineHeight: 1.2, wordBreak: 'break-word' }}>
                      {selectedStore.name}
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: 11.5, color: '#64748B', fontWeight: 700, wordBreak: 'break-word' }}>
                      {selectedStore.sub}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowConfigModal(true)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: 12,
                    background: '#FFF7ED',
                    color: '#EA580C',
                    border: '1.5px solid #FFEDD5',
                    fontSize: 11.5,
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(234,88,12,0.1)'
                  }}
                >
                  ⚙️ Configurar Local
                </button>
              </div>
              
              {/* BADGES METADATA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                <span style={{ fontSize: 11.5, fontWeight: 900, background: '#FFF7ED', color: '#EA580C', padding: '4px 8px', borderRadius: 10, border: '1px solid #FFEDD5' }}>
                  ⭐ {selectedStore.rating || '5.0'} ({selectedStore.reviews || 'Opiniones'})
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 800, background: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: 10 }}>
                  ⏱️ {selectedStore.time || '10-20 min'}
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 800, background: '#ECFDF5', color: '#059669', padding: '4px 8px', borderRadius: 10 }}>
                  🛵 {selectedStore.delivery || 'Envío GRATIS'}
                </span>
              </div>

              {/* 3. ESPACIO PARA LA DIRECCIÓN DEL RESTAURANTE */}
              <div style={{
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: 14,
                padding: '10px 12px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: '1 1 200px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#2563EB', flexShrink: 0 }}>
                    📍
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                      DIRECCIÓN DEL RESTAURANTE
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: '#1E293B', lineHeight: 1.3, wordBreak: 'break-word', display: 'block' }}>
                      {selectedStore.address || 'Av. 27 de Febrero esq. Estrella Sadhalá, Santiago, RD'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStore.address || selectedStore.name)}`, '_blank')}
                  style={{ padding: '6px 12px', borderRadius: 10, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontSize: 11, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  🗺️ Mapa
                </button>
              </div>

              {/* 4. ESPACIO PARA EL NÚMERO DE TELÉFONO */}
              <div style={{
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: 14,
                padding: '10px 12px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: '1 1 180px' }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#10B981', flexShrink: 0 }}>
                    📞
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                      NÚMERO DE TELÉFONO
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#1E293B', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {selectedStore.phone || '809-583-1020'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                  {selectedStore.phone && (
                    <a
                      href={`tel:${selectedStore.phone.replace(/[^0-9]/g, '')}`}
                      style={{ padding: '6px 10px', borderRadius: 10, background: '#10B981', color: '#FFF', textDecoration: 'none', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 6px rgba(16,185,129,0.3)', whiteSpace: 'nowrap' }}
                    >
                      📞 Llamar
                    </a>
                  )}
                  {selectedStore.whatsapp && (
                    <a
                      href={`https://wa.me/${selectedStore.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: '6px 10px', borderRadius: 10, background: '#25D366', color: '#FFF', textDecoration: 'none', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 6px rgba(37,211,102,0.3)', whiteSpace: 'nowrap' }}
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* 5. ESPACIO PARA REDES SOCIALES */}
              <div style={{
                background: '#FFF7ED',
                border: '1.5px solid #FFEDD5',
                borderRadius: 14,
                padding: '10px 12px',
                marginBottom: 14,
                boxSizing: 'border-box'
              }}>
                <span style={{ fontSize: 9.5, fontWeight: 900, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                  🌐 REDES SOCIALES DEL RESTAURANTE
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <a
                    href={`https://instagram.com/${(selectedStore.socials?.instagram || 'lafierahotdog.rd').replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '5px 10px',
                      borderRadius: 10,
                      background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)',
                      color: '#FFF',
                      textDecoration: 'none',
                      fontSize: 10.5,
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0 2px 6px rgba(221,42,123,0.3)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    📸 {selectedStore.socials?.instagram || '@lafierahotdog.rd'}
                  </a>
                  {selectedStore.socials?.facebook && (
                    <a
                      href={selectedStore.socials.facebook.startsWith('http') ? selectedStore.socials.facebook : `https://${selectedStore.socials.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '5px 10px',
                        borderRadius: 10,
                        background: '#1877F2',
                        color: '#FFF',
                        textDecoration: 'none',
                        fontSize: 10.5,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      👥 Facebook
                    </a>
                  )}
                  {selectedStore.socials?.tiktok && (
                    <a
                      href={`https://tiktok.com/@${selectedStore.socials.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '5px 10px',
                        borderRadius: 10,
                        background: '#000000',
                        color: '#FFF',
                        textDecoration: 'none',
                        fontSize: 10.5,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      🎵 {selectedStore.socials.tiktok}
                    </a>
                  )}
                </div>
              </div>


              {/* SEPARADOR DE MENÚ */}
              <div style={{ margin: '14px 0 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#1E293B' }}>🍽️ Menú & Especialidades</h4>
                <span style={{ fontSize: 12, color: 'var(--mamey-primary)', fontWeight: 800 }}>{selectedStore.menu?.length || 0} platillos</span>
              </div>

              {/* LISTADO DE PLATILLOS */}
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {selectedStore.menu?.map(item => (
                  <div key={item.id} className="pl-cart-item-row" style={{ padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div className="pl-cart-item-info">
                      <img src={item.img} alt={item.name} style={{ width: 62, height: 62, borderRadius: 14, objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                        <p className="pl-cart-item-name" style={{ fontSize: 14, fontWeight: 900, margin: '0 0 3px' }}>{item.name}</p>
                        <p className="pl-cart-item-sub" style={{ fontSize: 11, color: '#64748B', margin: '0 0 6px', lineHeight: 1.3 }}>{item.desc}</p>
                        <span style={{ fontSize: 15, fontWeight: 900, color: 'var(--mamey-primary)' }}>RD$ {item.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      className="pl-product-add-btn"
                      style={{ width: 36, height: 36, borderRadius: 12, fontSize: 18 }}
                      onClick={() => {
                        addToCart(item);
                      }}
                    >+</button>
                  </div>
                ))}
              </div>

              {/* BOTÓN IR AL CARRITO SI TIENE ITEMS */}
              {cartItems.length > 0 && (
                <button
                  className="pl-order-confirm-btn"
                  style={{ marginTop: 16 }}
                  onClick={() => {
                    setSelectedStore(null);
                    setShowCartDrawer(true);
                  }}
                >
                  🛒 Ver Mi Pedido (RD$ {total.toLocaleString()})
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL DE SOLICITUD MÁNDAME EXPRESS */}
      {showMandameModal && (
        <div className="pl-modal-overlay" onClick={() => setShowMandameModal(false)}>
          <div className="pl-cart-drawer" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '28px 28px 0 0' }}>
            <div className="pl-drawer-header">
              <h3 className="pl-drawer-title">🛵 Mándame Express - Envío Instantáneo</h3>
              <button className="pl-close-btn" onClick={() => setShowMandameModal(false)}>✕</button>
            </div>

            <form onSubmit={handleRequestMandame} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#666' }}>PUNTO DE RECOGIDA</label>
                <input
                  type="text"
                  className="pl-search-input"
                  style={{ marginTop: 4 }}
                  value={mandamePickUp}
                  onChange={(e) => setMandamePickUp(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#666' }}>PUNTO DE ENTREGA (DESTINO)</label>
                <input
                  type="text"
                  className="pl-search-input"
                  style={{ marginTop: 4 }}
                  placeholder="Ej: Ensanche Naco, Calle 2 #4"
                  value={mandameDropOff}
                  onChange={(e) => setMandameDropOff(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#666' }}>TIPO DE PAQUETE</label>
                <select
                  className="pl-search-input"
                  style={{ marginTop: 4 }}
                  value={mandameType}
                  onChange={(e) => setMandameType(e.target.value)}
                >
                  <option value="Documentos">📄 Documentos / Llaves</option>
                  <option value="Paquete Pequeño">📦 Paquete Pequeño</option>
                  <option value="Comida / Regalo">🎁 Comida / Regalo</option>
                </select>
              </div>

              <div style={{ background: '#FFF4EE', border: '1.5px solid #FFE4D6', borderRadius: 14, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#1A1A2E' }}>Costo estimado del envío:</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--mamey-primary)' }}>RD$ 120</span>
              </div>

              <button type="submit" className="pl-order-confirm-btn">
                🛵 Solicitar Mándame Rider Ahora
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 11. MODAL DRAWER DE CARRITO & CHECKOUT */}
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

      {/* 12. MODAL DE SEGUIMIENTO EN TIEMPO REAL (RASTREO EN VIVO) */}
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
      {/* 13. MODAL DE CONFIGURACIÓN DEL RESTAURANTE */}
      {showConfigModal && selectedStore && (
        <ConfigurarRestauranteModal
          store={selectedStore}
          onClose={() => setShowConfigModal(false)}
          onSave={(updated) => {
            setSelectedStore(updated);
            setDbStores(prev => prev.map(s => s.id === updated.id ? updated : s));
          }}
        />
      )}
    </div>
  );
}
