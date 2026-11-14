// src/components/PedidosListoHub.jsx
import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';
import './PedidosListoHub.css';
import ConfigurarRestauranteModal from './ConfigurarRestauranteModal';
import CreditCardCheckoutForm, { validateCardDetails, saveCardTokenIfRequested } from './CreditCardCheckoutForm';
import BankTransferCheckoutBox from './BankTransferCheckoutBox';

const HERO_BANNERS = [
  {
    id: 1,
    tag: '🍔 Restaurantes',
    title: 'Los restaurantes de tu ciudad',
    desc: 'Pide a domicilio o pasa a recoger en el local.',
    btnText: 'Ver Restaurantes',
    bgGradient: 'linear-gradient(135deg, #E04E00 0%, #FF6000 100%)',
    emoji: '🍔',
    catId: 'restaurantes'
  },
  {
    id: 2,
    tag: '🛵 Listo Patrón',
    title: 'Envíos de paquetes',
    desc: 'Envía llaves, documentos o encargos por la ciudad.',
    btnText: 'Solicitar envío',
    bgGradient: 'linear-gradient(135deg, #D44200 0%, #FF731A 100%)',
    emoji: '🛵',
    catId: 'mandame'
  }
];

const CATEGORIES = [
  { id: 'restaurantes', name: 'Restaurantes', icon: '🍔', bg: '#FFF0E6' },
  { id: 'market', name: 'Listo Market', icon: '🛒', bg: '#E6F9F0' },
  { id: 'mandame', name: 'Listo Patrón', icon: '🛵', bg: '#EFF6FF' },
  { id: 'farmacias', name: 'Farmacias', icon: '💊', bg: '#FFF5F5' },
  { id: 'bebidas', name: 'Licores & Frías', icon: '🍺', bg: '#FFFBEB' },
  { id: 'mascotas', name: 'Mascotas', icon: '🐾', bg: '#F5F3FF' },
  { id: 'tiendas', name: 'Variedades', icon: '🛍️', bg: '#F0FDF4' }
];

const CART_KEY = 'pl_cart_v1';
const DELIVERY_FEE = 75;
const FREE_DELIVERY_FROM = 500;
const MANDAME_FEE = 120;

const parsePrice = (p) => {
  const n = parseFloat(String(p ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const mapCategory = (c = '') => {
  const s = c.toLowerCase();
  if (s.includes('market') || s.includes('super') || s.includes('colmado')) return 'market';
  if (s.includes('farmac')) return 'farmacias';
  if (s.includes('licor') || s.includes('bebida') || s.includes('drink')) return 'bebidas';
  if (s.includes('mascota') || s.includes('pet')) return 'mascotas';
  if (s.includes('tienda') || s.includes('variedad')) return 'tiendas';
  return 'restaurantes';
};

export default function PedidosListoHub({ navigate }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCat, setSelectedCat] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY));
      if (saved && Array.isArray(saved.items)) return saved;
    } catch (e) { /* ignore */ }
    return { store: null, items: [] };
  });
  const cartItems = cart.items;
  const cartStore = cart.store;
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showMandameModal, setShowMandameModal] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [hubFulfillmentType, setHubFulfillmentType] = useState('delivery'); // 'delivery' | 'pickup'
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [cardData, setCardData] = useState({ mode: 'inapp', number: '', holder: '', expiry: '', cvv: '', saveForLater: true });
  const [transferReceiptImage, setTransferReceiptImage] = useState(null);
  const [transferReference, setTransferReference] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const [loadingStores, setLoadingStores] = useState(true);

  // Mándame State
  const [mandamePickUp, setMandamePickUp] = useState('');
  const [mandameDropOff, setMandameDropOff] = useState('');
  const [mandameType, setMandameType] = useState('Documentos');

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* ignore */ }
  }, [cart]);

  // Auto-slide hero banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const [dbStores, setDbStores] = useState([]);

  useEffect(() => {
    let unsub = () => {};
    try {
      const q = query(collection(db, 'locales'));
      unsub = onSnapshot(q, (snap) => {
        const loaded = snap.docs.map(doc => {
          const d = doc.data();
          const menu = (d.servicios || [])
            .map((s, idx) => ({
              id: `db_${doc.id}_${idx}`,
              name: s.nombre,
              price: parsePrice(s.precio),
              desc: s.descripcion || '',
              img: s.fotoURL || ''
            }))
            .filter(item => item.name && item.price !== null);
          return {
            id: doc.id,
            activo: d.activo,
            proId: d.proId || '',
            name: d.nombre || '',
            cat: mapCategory(d.categoria),
            sub: d.categoria || '',
            time: d.horario || '',
            rating: d.rating ? Number(d.rating).toFixed(1) : '',
            reviews: d.totalResenas || 0,
            img: d.portadaURL || d.logoURL || '',
            cover: d.portadaURL || '',
            logo: d.logoURL || d.portadaURL || '',
            address: d.direccion || '',
            phone: d.telefono || d.phone || '',
            whatsapp: d.whatsapp || '',
            socials: {
              instagram: d.instagram || '',
              facebook: d.facebook || '',
              tiktok: d.tiktok || ''
            },
            menu
          };
        }).filter(st => st.activo !== false && st.name);
        setDbStores(loaded);
        setLoadingStores(false);
      }, (err) => {
        console.error('Error cargando locales:', err);
        setLoadingStores(false);
      });
    } catch (e) {
      console.error(e);
      setLoadingStores(false);
    }
    return () => unsub();
  }, []);

  const isOwner = (st) => !!user && !!st?.proId && st.proId === user.uid;

  // Filter stores by category
  const q = searchQuery.toLowerCase();
  const filteredStores = dbStores.filter(st => {
    const matchesCat = selectedCat === 'todos' || st.cat === selectedCat;
    const matchesSearch = st.name.toLowerCase().includes(q) || st.sub.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Cart functions (un pedido = una sola tienda)
  const addToCart = (item, store) => {
    if (cartStore && cartStore.id !== store.id && cartItems.length > 0) {
      const ok = window.confirm(`Tu carrito tiene productos de ${cartStore.name}. ¿Vaciarlo y empezar un pedido en ${store.name}?`);
      if (!ok) return;
      setCart({ store: { id: store.id, name: store.name, address: store.address, proId: store.proId }, items: [{ ...item, qty: 1 }] });
      return;
    }
    setCart(prev => {
      const existing = prev.items.find(i => i.id === item.id);
      const items = existing
        ? prev.items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev.items, { ...item, qty: 1 }];
      return { store: { id: store.id, name: store.name, address: store.address, proId: store.proId }, items };
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      const items = prev.items
        .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0);
      return { store: items.length ? prev.store : null, items };
    });
  };

  const isPickupHub = hubFulfillmentType === 'pickup';
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const freeDelivery = subtotal > FREE_DELIVERY_FROM;
  const deliveryFee = isPickupHub ? 0 : (freeDelivery ? 0 : DELIVERY_FEE);
  const serviceFee = isPickupHub ? 0 : Math.round(subtotal * 0.05);
  const tip = isPickupHub ? 0 : tipAmount;
  const total = subtotal + deliveryFee + serviceFee + tip;

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0 || submitting || !cartStore) return;
    setOrderError('');
    if (!user) {
      setOrderError('Debes iniciar sesión para hacer un pedido.');
      return;
    }
    if (!isPickupHub && !deliveryAddress.trim()) {
      setOrderError('Escribe tu dirección de entrega.');
      return;
    }
    let finalPaymentLabel = paymentMethod;
    let paymentStatusVal = paymentMethod === 'efectivo' ? 'contra_entrega' : 'por_verificar';
    if (paymentMethod === 'tarjeta') {
      const cardValidation = validateCardDetails(cardData);
      if (!cardValidation.valid) {
        setOrderError(cardValidation.error);
        return;
      }
      saveCardTokenIfRequested(cardData, cardValidation);
      finalPaymentLabel = `💳 Tarjeta ${cardValidation.brand} •••• ${cardValidation.last4} (Pagado)`;
      paymentStatusVal = 'pagado';
    }

    setSubmitting(true);
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const finalAddress = isPickupHub
      ? `Retiro en el local: ${cartStore.name}${cartStore.address ? ' - ' + cartStore.address : ''}`
      : deliveryAddress.trim();

    const orderData = {
      orderId: 'PL-' + Math.floor(100000 + Math.random() * 900000),
      type: 'delivery',
      fulfillmentType: isPickupHub ? 'pickup' : 'delivery',
      driverType: isPickupHub ? 'pickup' : 'mandame',
      storeId: cartStore.id,
      storeName: cartStore.name,
      storeOwnerId: cartStore.proId || '',
      clientId: user.uid,
      clientName: user.displayName || '',
      clientEmail: user.email || '',
      clientPhone: user.phoneNumber || '',
      items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
      subtotal,
      deliveryFee,
      serviceFee,
      tipAmount: tip,
      total,
      price: `RD$ ${total.toLocaleString()}`,
      deliveryAddress: finalAddress,
      address: finalAddress,
      paymentMethod: finalPaymentLabel,
      paymentStatus: paymentStatusVal,
      transferReceiptImage: paymentMethod === 'transferencia' ? (transferReceiptImage || null) : null,
      transferReference: paymentMethod === 'transferencia' ? (transferReference || '').trim() : '',
      pinOTP: pin,
      status: 'pending',
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      await addDoc(collection(db, 'notificaciones'), {
        userId: user.uid,
        orderId: docRef.id,
        type: 'new_order',
        title: isPickupHub ? '🛍️ Pedido registrado para retirar' : '🛵 Pedido recibido',
        text: `Tu pedido #${orderData.orderId} en ${cartStore.name} por RD$ ${total.toLocaleString()} fue enviado al local. PIN: ${pin}`,
        read: false,
        icon: isPickupHub ? '🛍️' : '🛵',
        createdAt: serverTimestamp()
      });

      if (cartStore.proId) {
        try {
          await addDoc(collection(db, 'notificaciones'), {
            userId: cartStore.proId,
            orderId: docRef.id,
            type: 'kitchen_order',
            title: '🚨 Nuevo pedido',
            text: `Pedido #${orderData.orderId} por RD$ ${total.toLocaleString()} recibido para preparar.`,
            read: false,
            icon: '🔔',
            createdAt: serverTimestamp()
          });
        } catch (eM) { console.warn('No se pudo notificar al local:', eM); }
      }

      const confirmed = { ...orderData, id: docRef.id };
      setCart({ store: null, items: [] });
      setShowCartDrawer(false);
      if (navigate) navigate('tracking', confirmed);
      else setConfirmedOrder(confirmed);
    } catch (err) {
      console.error('Error guardando pedido:', err);
      setOrderError('No se pudo enviar tu pedido. Revisa tu conexión e inténtalo de nuevo. No se te ha cobrado nada.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestMandame = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!user) {
      alert('Debes iniciar sesión para solicitar un envío.');
      return;
    }
    if (!mandamePickUp.trim() || !mandameDropOff.trim()) {
      alert('Ingresa la dirección de recogida y la de entrega.');
      return;
    }
    setSubmitting(true);
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const orderData = {
      orderId: 'MD-' + Math.floor(100000 + Math.random() * 900000),
      type: 'delivery',
      driverType: 'mandame',
      clientId: user.uid,
      clientName: user.displayName || '',
      clientEmail: user.email || '',
      clientPhone: user.phoneNumber || '',
      items: [{ name: `Envío Listo Patrón: ${mandameType}`, price: MANDAME_FEE, qty: 1 }],
      total: MANDAME_FEE,
      pickupAddress: mandamePickUp.trim(),
      deliveryAddress: mandameDropOff.trim(),
      address: mandameDropOff.trim(),
      packageType: mandameType,
      status: 'pending',
      pinOTP: pin,
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      await addDoc(collection(db, 'notificaciones'), {
        userId: user.uid,
        orderId: docRef.id,
        type: 'new_order',
        title: '📦 Solicitud de envío recibida',
        text: `Buscando mensajero para tu envío a ${orderData.deliveryAddress}. PIN de entrega: ${pin}`,
        read: false,
        icon: '📦',
        createdAt: serverTimestamp()
      });
      const confirmed = { ...orderData, id: docRef.id };
      setShowMandameModal(false);
      setMandameDropOff('');
      if (navigate) navigate('tracking', confirmed);
      else setConfirmedOrder(confirmed);
    } catch (err) {
      console.error('Error guardando envío:', err);
      alert('No se pudo enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
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
              <span className="pl-loc-address">{deliveryAddress || 'Toca para escribir tu dirección'} ▾</span>
            </div>
          </div>
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

      {/* 7. LOCALE & RESTAURANTES DESTACADOS */}
      <div className="pl-horizontal-section">
        <div className="pl-grid-title-row">
          <h3 className="pl-section-title">🏪 Locales</h3>
        </div>

        {loadingStores ? (
          <p style={{ textAlign: 'center', color: '#64748B', fontWeight: 700, padding: '24px 0' }}>Cargando locales...</p>
        ) : filteredStores.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748B', fontWeight: 700, padding: '24px 0' }}>
            {searchQuery ? 'No encontramos locales con esa búsqueda.' : 'Todavía no hay locales disponibles en esta categoría.'}
          </p>
        ) : (
        <div className="pl-horiz-scroll">
          {filteredStores.map(store => (
            <div key={store.id} className="pl-store-card" onClick={() => setSelectedStore(store)}>
              <div className="pl-store-banner" style={{ backgroundImage: store.img ? `url(${store.img})` : undefined, background: store.img ? undefined : '#FFF0E6' }}>
                {store.time && <span className="pl-store-time">⏱️ {store.time}</span>}
              </div>
              <div className="pl-store-body">
                <h4 className="pl-store-name">{store.name}</h4>
                <p className="pl-store-sub">{store.sub}</p>
                {store.rating && (
                  <div className="pl-store-meta">
                    <span className="pl-store-rating">★ {store.rating} ({store.reviews})</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
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
                src={selectedStore.cover || selectedStore.img || undefined}
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
                  {isOwner(selectedStore) && <button
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
                  </button>}
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

                {isOwner(selectedStore) && <button
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
                </button>}
              </div>
              
              {/* BADGES METADATA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {selectedStore.rating && (
                  <span style={{ fontSize: 11.5, fontWeight: 900, background: '#FFF7ED', color: '#EA580C', padding: '4px 8px', borderRadius: 10, border: '1px solid #FFEDD5' }}>
                    ⭐ {selectedStore.rating} ({selectedStore.reviews})
                  </span>
                )}
                {selectedStore.time && (
                  <span style={{ fontSize: 11.5, fontWeight: 800, background: '#F1F5F9', color: '#475569', padding: '4px 8px', borderRadius: 10 }}>
                    ⏱️ {selectedStore.time}
                  </span>
                )}
              </div>

              {/* 3. ESPACIO PARA LA DIRECCIÓN DEL RESTAURANTE */}
              {selectedStore.address && <div style={{
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
                      {selectedStore.address}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedStore.address)}`, '_blank')}
                  style={{ padding: '6px 12px', borderRadius: 10, background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontSize: 11, fontWeight: 900, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  🗺️ Mapa
                </button>
              </div>}

              {/* 4. ESPACIO PARA EL NÚMERO DE TELÉFONO */}
              {(selectedStore.phone || selectedStore.whatsapp) && <div style={{
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
                      {selectedStore.phone || selectedStore.whatsapp}
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
              </div>}

              {/* 5. ESPACIO PARA REDES SOCIALES */}
              {(selectedStore.socials?.instagram || selectedStore.socials?.facebook || selectedStore.socials?.tiktok) && <div style={{
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
                  {selectedStore.socials?.instagram && <a
                    href={`https://instagram.com/${selectedStore.socials.instagram.replace('@', '')}`}
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
                    📸 {selectedStore.socials.instagram}
                  </a>}
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
              </div>}


              {/* SEPARADOR DE MENÚ */}
              <div style={{ margin: '14px 0 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#1E293B' }}>🍽️ Menú & Especialidades</h4>
                <span style={{ fontSize: 12, color: 'var(--mamey-primary)', fontWeight: 800 }}>{selectedStore.menu?.length || 0} platillos</span>
              </div>

              {/* LISTADO DE PLATILLOS */}
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {(!selectedStore.menu || selectedStore.menu.length === 0) && (
                  <p style={{ textAlign: 'center', color: '#64748B', fontWeight: 700, padding: '16px 0' }}>Este local todavía no ha publicado su menú.</p>
                )}
                {selectedStore.menu?.map(item => (
                  <div key={item.id} className="pl-cart-item-row" style={{ padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <div className="pl-cart-item-info">
                      {item.img && <img src={item.img} alt={item.name} style={{ width: 62, height: 62, borderRadius: 14, objectFit: 'cover' }} />}
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
                        addToCart(item, selectedStore);
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
              <h3 className="pl-drawer-title">🛵 Listo Patrón Express - Envío Instantáneo</h3>
              <button className="pl-close-btn" onClick={() => setShowMandameModal(false)}>✕</button>
            </div>

            <form onSubmit={handleRequestMandame} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 800, color: '#666' }}>PUNTO DE RECOGIDA</label>
                <input
                  type="text"
                  className="pl-search-input"
                  style={{ marginTop: 4 }}
                  placeholder="Ej: Villa Olga, Calle 5 #12"
                  value={mandamePickUp}
                  onChange={(e) => setMandamePickUp(e.target.value)}
                  required
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
                <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--mamey-primary)' }}>RD$ {MANDAME_FEE}</span>
              </div>

              <button type="submit" className="pl-order-confirm-btn" disabled={submitting}>
                {submitting ? 'Enviando...' : '🛵 Solicitar envío'}
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

            {/* Modalidad de Pedido: Delivery vs Pasar por el Local */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => setHubFulfillmentType('delivery')}
                style={{
                  padding: '9px 6px',
                  borderRadius: 12,
                  border: hubFulfillmentType === 'delivery' ? '2px solid #F26000' : '1.5px solid #E2E8F0',
                  background: hubFulfillmentType === 'delivery' ? '#FFF4EE' : '#FFFFFF',
                  color: hubFulfillmentType === 'delivery' ? '#C2410C' : '#475569',
                  fontWeight: 800,
                  fontSize: 11.5,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <span style={{ fontSize: 16 }}>🛵</span>
                <span>Envío a Domicilio</span>
                <span style={{ fontSize: 10, color: '#F26000', fontWeight: 700 }}>{freeDelivery ? '¡GRATIS!' : `RD$ ${DELIVERY_FEE}`}</span>
              </button>

              <button
                type="button"
                onClick={() => setHubFulfillmentType('pickup')}
                style={{
                  padding: '9px 6px',
                  borderRadius: 12,
                  border: hubFulfillmentType === 'pickup' ? '2px solid #059669' : '1.5px solid #E2E8F0',
                  background: hubFulfillmentType === 'pickup' ? '#ECFDF5' : '#FFFFFF',
                  color: hubFulfillmentType === 'pickup' ? '#047857' : '#475569',
                  fontWeight: 800,
                  fontSize: 11.5,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <span style={{ fontSize: 16 }}>🛍️</span>
                <span>Pasar por el Local</span>
                <span style={{ fontSize: 10, color: '#059669', fontWeight: 900 }}>¡GRATIS!</span>
              </button>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 800, color: '#666', margin: '0 0 6px' }}>
                {isPickupHub ? '🏪 LOCAL DE RETIRO' : '📍 DIRECCIÓN DE ENTREGA'}
              </p>
              {isPickupHub ? (
                <div style={{ background: '#ECFDF5', padding: '10px 14px', borderRadius: 14, fontSize: 13, fontWeight: 700, color: '#047857', border: '1px solid #A7F3D0' }}>
                  🛍️ {cartStore?.name}{cartStore?.address ? ` - ${cartStore.address}` : ''}
                </div>
              ) : (
                <input
                  type="text"
                  className="pl-search-input"
                  placeholder="Calle, número, sector, referencia"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              )}
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
                <span>Costo de Envío {isPickupHub ? '🛍️' : '🛵'}</span>
                <span>{deliveryFee === 0 ? 'GRATIS' : `RD$ ${deliveryFee}`}</span>
              </div>
              <div className="pl-sum-row">
                <span>Tarifa de servicio</span>
                <span>RD$ {serviceFee}</span>
              </div>
              {!isPickupHub && (
                <div className="pl-sum-row" style={{ alignItems: 'center' }}>
                  <span>Propina (opcional)</span>
                  <span style={{ display: 'flex', gap: 4 }}>
                    {[0, 25, 50, 100].map(t => (
                      <button key={t} type="button" onClick={() => setTipAmount(t)}
                        style={{ padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer', border: tipAmount === t ? '2px solid #F26000' : '1px solid #E2E8F0', background: tipAmount === t ? '#FFF4EE' : '#FFF' }}>
                        {t === 0 ? 'No' : `RD$ ${t}`}
                      </button>
                    ))}
                  </span>
                </div>
              )}
              <div className="pl-sum-row" style={{ alignItems: 'center' }}>
                <span>Método de pago</span>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #E2E8F0', fontWeight: 700 }}>
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta">💳 Tarjeta de Crédito / Débito</option>
                  <option value="transferencia">🏦 Transferencia</option>
                </select>
              </div>
              {paymentMethod === 'tarjeta' && (
                <CreditCardCheckoutForm totalAmount={total} cardData={cardData} onChangeCardData={setCardData} />
              )}
              {paymentMethod === 'transferencia' && (
                <BankTransferCheckoutBox totalAmount={total} receiptImage={transferReceiptImage} onChangeReceiptImage={setTransferReceiptImage} referenceNumber={transferReference} onChangeReferenceNumber={setTransferReference} storeName={cartStore?.name || 'Restaurante'} />
              )}
              <div className="pl-sum-row total">
                <span>Total a Pagar</span>
                <span style={{ color: isPickupHub ? '#059669' : 'var(--mamey-primary)' }}>RD$ {total.toLocaleString()}</span>
              </div>
            </div>

            {orderError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 12, padding: '10px 12px', fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>
                {orderError}
              </div>
            )}

            <button 
              className="pl-order-confirm-btn" 
              onClick={handleConfirmOrder}
              disabled={submitting}
              style={{
                background: isPickupHub ? 'linear-gradient(135deg, #059669, #10B981)' : undefined,
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting
                ? 'Enviando pedido...'
                : isPickupHub ? `🛍️ Confirmar Retiro en Local (RD$ ${total.toLocaleString()})` : `🚀 Confirmar Pedido (RD$ ${total.toLocaleString()})`}
            </button>
          </div>
        </div>
      )}

      {/* 12. CONFIRMACIÓN DE PEDIDO (solo datos reales del pedido guardado) */}
      {confirmedOrder && (
        <div className="pl-modal-overlay" onClick={() => setConfirmedOrder(null)}>
          <div className="pl-cart-drawer" onClick={(e) => e.stopPropagation()} style={{ background: '#FFFFFF', borderRadius: '28px' }}>
            <div className="pl-drawer-header">
              <h3 className="pl-drawer-title">✅ Pedido enviado</h3>
              <button className="pl-close-btn" onClick={() => setConfirmedOrder(null)}>✕</button>
            </div>
            <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
              <p style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 900, color: '#1A1A2E' }}>Pedido #{confirmedOrder.orderId}</p>
              {confirmedOrder.storeName && <p style={{ margin: '0 0 6px', fontSize: 13, color: '#475569', fontWeight: 700 }}>{confirmedOrder.storeName}</p>}
              <p style={{ margin: '0 0 6px', fontSize: 13, color: '#475569', fontWeight: 700 }}>Total: RD$ {Number(confirmedOrder.total).toLocaleString()}</p>
              <p style={{ margin: '12px 0 0', fontSize: 13, color: '#777', fontWeight: 600 }}>Tu PIN de entrega: <strong style={{ fontSize: 18, color: '#1A1A2E' }}>{confirmedOrder.pinOTP}</strong></p>
              <p style={{ margin: '12px 0 0', fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>Te avisaremos cuando el local acepte tu pedido.</p>
            </div>
            <button className="pl-order-confirm-btn" style={{ background: '#1A1A2E' }} onClick={() => setConfirmedOrder(null)}>
              Cerrar
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
