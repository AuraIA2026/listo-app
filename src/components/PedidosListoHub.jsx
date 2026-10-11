// src/components/PedidosListoHub.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import './PedidosListoHub.css';

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
    id: 'st1',
    name: 'Burger Mamey House',
    cat: 'restaurantes',
    sub: 'Hamburguesas, Alitas & Grill',
    time: '20-30 min',
    rating: '4.9',
    reviews: '340',
    delivery: 'RD$ 75',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
    address: 'Av. 27 de Febrero esq. Winston Churchill, Ensanche Naco, Santo Domingo',
    phone: '809-583-2020',
    whatsapp: '18095832020',
    socials: {
      instagram: '@burgermamey.rd',
      facebook: 'facebook.com/burgermameyrd',
      tiktok: '@burgermameydo'
    },
    bannerTag: '🔥 2x1 Martes',
    menu: [
      { id: 'm1', name: 'Burger Mamey Especial', price: 390, desc: 'Doble carne angus, queso cheddar fundido, tocineta crujiente y salsa secreta mamey.', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80' },
      { id: 'm2', name: 'Papas Supremos Mamey', price: 180, desc: 'Papas rizadas crujientes con queso derretido, tocineta y cebollín.', img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=200&q=80' }
    ]
  },
  {
    id: 'st2',
    name: 'Listo Market - Súper Express',
    cat: 'market',
    sub: 'Supermercado, Frescos & Despensa',
    time: '12-18 min',
    rating: '5.0',
    reviews: '890',
    delivery: 'GRATIS',
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
    address: 'Calle Del Sol #45, Santiago Centro, República Dominicana',
    phone: '809-582-8800',
    whatsapp: '18095828800',
    socials: {
      instagram: '@listomarket.rd',
      facebook: 'facebook.com/listomarketdo',
      tiktok: '@listomarket'
    },
    bannerTag: '⚡ Entrega en 15m',
    menu: [
      { id: 'p1', name: 'Leche Entera 1L', price: 110, desc: '1 Litro fresca grado A pasteurizada.', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=200&q=80' },
      { id: 'p2', name: 'Cerveza Presidente 6-Pack', price: 650, desc: 'Lata 12oz bien fría como la ceniza.', img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=200&q=80' }
    ]
  },
  {
    id: 'st3',
    name: 'Pizzeria Don Mamey',
    cat: 'restaurantes',
    sub: 'Pizza Artesanal, Calzones & Pastas',
    time: '25-35 min',
    rating: '4.8',
    reviews: '520',
    delivery: 'RD$ 50',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80',
    address: 'Av. Juan Pablo Duarte #12, Villa Olga, Santiago',
    phone: '809-241-1122',
    whatsapp: '18092411122',
    socials: {
      instagram: '@pizzeriadonmamey',
      facebook: 'facebook.com/donmameypizza',
      tiktok: '@donmameypizza'
    },
    bannerTag: '🍕 Masa Madre',
    menu: [
      { id: 'm3', name: 'Pizza Pepperoni Mamey Grande', price: 650, desc: 'Queso mozzarella premium, pepperoni italiano y salsa pomodoro artesanal.', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80' }
    ]
  },
  {
    id: 'st4',
    name: 'Comida Criolla Doña Rosa',
    cat: 'restaurantes',
    sub: 'Sancocho, Mofongo, Chivo & Pollo',
    time: '15-25 min',
    rating: '4.9',
    reviews: '610',
    delivery: 'RD$ 60',
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
    address: 'Calle Restauración #77, Los Jardines Metropolitanos, Santiago',
    phone: '809-581-9933',
    whatsapp: '18095819933',
    socials: {
      instagram: '@donarosa.criollo',
      facebook: 'facebook.com/donarosacriollo',
      tiktok: '@donarosafood'
    },
    bannerTag: '🇩🇴 Sabor Dominicano',
    menu: [
      { id: 'm4', name: 'Mofongo Especial con Chicharrón', price: 420, desc: 'Mofongo de plátano verde con chicharrón crujiente, ajo asado y caldo caliente.', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80' }
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

  const allAvailableStores = [...dbStores, ...STORES];

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

      {/* 9. MODAL DETALLE DE TIENDA / MENÚ */}
      {/* 9. MODAL DETALLE DE TIENDA / MENÚ CON PORTADA, LOGO, DIRECCIÓN, TELÉFONO Y REDES SOCIALES */}
      {selectedStore && (
        <div className="pl-modal-overlay" onClick={() => setSelectedStore(null)}>
          <div className="pl-cart-drawer" onClick={(e) => e.stopPropagation()} style={{ borderRadius: '28px 28px 0 0', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}>
            
            {/* 1. PORTADA DEL RESTAURANTE */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: 170,
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.75) 100%), url(${selectedStore.cover || selectedStore.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ background: '#FF6000', color: '#FFF', padding: '5px 12px', borderRadius: 14, fontSize: 11, fontWeight: 900, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                  {selectedStore.bannerTag || '👑 Restaurante Verificado 🇩🇴'}
                </span>
                <button
                  onClick={() => setSelectedStore(null)}
                  style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', color: '#FFF', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                >
                  ✕
                </button>
              </div>

              {/* 2. LOGO DEL RESTAURANTE SUPERPUESTO */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
                <img
                  src={selectedStore.logo || selectedStore.img}
                  alt={selectedStore.name}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 22,
                    objectFit: 'cover',
                    border: '3px solid #FFF',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                    background: '#FFF'
                  }}
                />
                <div style={{ color: '#FFF', textShadow: '0 2px 8px rgba(0,0,0,0.85)' }}>
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>{selectedStore.name}</h3>
                  <p style={{ margin: '3px 0 0', fontSize: 12, opacity: 0.95, fontWeight: 700 }}>{selectedStore.sub}</p>
                </div>
              </div>
            </div>

            {/* CONTENIDO INTERNO */}
            <div style={{ padding: '16px 20px 28px' }}>
              
              {/* BADGES METADATA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 900, background: '#FFF7ED', color: '#EA580C', padding: '4px 10px', borderRadius: 12, border: '1px solid #FFEDD5' }}>
                  ⭐ {selectedStore.rating} ({selectedStore.reviews} opiniones)
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: 12 }}>
                  ⏱️ {selectedStore.time}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, background: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: 12 }}>
                  🛵 {selectedStore.delivery}
                </span>
              </div>

              {/* 3. ESPACIO PARA LA DIRECCIÓN DEL RESTAURANTE */}
              <div style={{
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: 16,
                padding: '12px 14px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#2563EB', flexShrink: 0 }}>
                    📍
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                      DIRECCIÓN DEL RESTAURANTE
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1E293B', lineHeight: 1.3 }}>
                      {selectedStore.address || 'Av. 27 de Febrero, Santiago, República Dominicana'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStore.address || selectedStore.name)}`, '_blank')}
                  style={{ padding: '6px 12px', borderRadius: 10, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontSize: 11, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  🗺️ Mapa
                </button>
              </div>

              {/* 4. ESPACIO PARA EL NÚMERO DE TELÉFONO */}
              <div style={{
                background: '#F8FAFC',
                border: '1.5px solid #E2E8F0',
                borderRadius: 16,
                padding: '12px 14px',
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#10B981', flexShrink: 0 }}>
                    📞
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                      NÚMERO DE TELÉFONO
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: '#1E293B', fontFamily: 'monospace' }}>
                      {selectedStore.phone || '809-583-2020'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {selectedStore.phone && (
                    <a
                      href={`tel:${selectedStore.phone.replace(/[^0-9]/g, '')}`}
                      style={{ padding: '7px 12px', borderRadius: 10, background: '#10B981', color: '#FFF', textDecoration: 'none', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 6px rgba(16,185,129,0.3)' }}
                    >
                      📞 Llamar
                    </a>
                  )}
                  {selectedStore.whatsapp && (
                    <a
                      href={`https://wa.me/${selectedStore.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: '7px 12px', borderRadius: 10, background: '#25D366', color: '#FFF', textDecoration: 'none', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 6px rgba(37,211,102,0.3)' }}
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
                borderRadius: 16,
                padding: '12px 14px',
                marginBottom: 16
              }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 8 }}>
                  🌐 REDES SOCIALES DEL RESTAURANTE
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedStore.socials?.instagram ? (
                    <a
                      href={`https://instagram.com/${selectedStore.socials.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)',
                        color: '#FFF',
                        textDecoration: 'none',
                        fontSize: 11,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        boxShadow: '0 2px 8px rgba(221,42,123,0.3)'
                      }}
                    >
                      📸 {selectedStore.socials.instagram}
                    </a>
                  ) : (
                    <span style={{ padding: '6px 12px', borderRadius: 10, background: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)', color: '#FFF', fontSize: 11, fontWeight: 800 }}>
                      📸 @{selectedStore.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.rd
                    </span>
                  )}
                  {selectedStore.socials?.facebook && (
                    <a
                      href={selectedStore.socials.facebook.startsWith('http') ? selectedStore.socials.facebook : `https://${selectedStore.socials.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: '#1877F2',
                        color: '#FFF',
                        textDecoration: 'none',
                        fontSize: 11,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        boxShadow: '0 2px 8px rgba(24,119,242,0.3)'
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
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: '#000000',
                        color: '#FFF',
                        textDecoration: 'none',
                        fontSize: 11,
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5
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
    </div>
  );
}
