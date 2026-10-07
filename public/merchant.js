/* ==========================================================================
   PEDIDOS LISTO - PORTAL DE COMERCIOS ENGINE MASTER PRO (MERCHANT.JS)
   ========================================================================== */

const defaultMerchantState = {
  storeName: 'KFC Las Colinas Santiago',
  address: 'Av. Juan Pablo Duarte #10, Santiago',
  phone: '809-555-0192',
  logoImage: '',
  status: 'open', // 'open', 'busy', 'closed'
  prepTime: '25-35 min',
  todaySales: 4850,
  todayOrdersCount: 6,
  products: [
    {
      id: 'p-bucket-kfc',
      name: 'Bucket Familiar KFC (8 Pzs)',
      price: 999,
      category: 'bocado',
      description: '8 piezas de pollo crujiente receta secreta con papas.',
      inStock: true,
      isFlash: false,
      image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'p-yaroa-especial',
      name: 'Combo Yaroa Especial Mándame',
      price: 330,
      category: 'bocado',
      description: 'Yaroa de papa con pollo, carne molida y extra queso fundido.',
      inStock: true,
      isFlash: true,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'p-refresco-cola',
      name: 'Refresco Cola 2L',
      price: 55,
      category: 'licor',
      description: 'Refresco sabor cola bien frío 2 Litros.',
      inStock: true,
      isFlash: true,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
    }
  ],
  orders: [
    {
      id: 'ORD-7719',
      clientName: 'Arte',
      phone: '809-555-0192',
      items: '1x Bucket Familiar KFC (8 Pzs)',
      total: 1054,
      pinOTP: '7492',
      status: 'pending',
      time: 'Hace 5 mins'
    }
  ],
  coupons: [
    { code: 'SOCIO20', discount: 150, minSpend: 500, usageCount: 24 }
  ],
  reviews: [
    { id: 'rev-1', clientName: 'Arte', rating: 5, date: 'Ayer', comment: '¡Excelente comida y la Yaroa estaba súper caliente! Llegó en 15 mins.', reply: '¡Muchas gracias por elegirnos, Arte! 🧡' },
    { id: 'rev-2', clientName: 'Laura M.', rating: 5, date: 'Hace 2 días', comment: 'El bucket familiar estuvo crujiente y fresco. Muy recomendado.', reply: '' }
  ],
  bankAccount: {
    bank: 'Banco Popular Dominicano',
    number: '7829-1092-4912',
    holder: 'KFC Las Colinas SRL / Arte'
  },
  settings: {
    radiusKm: '5 km',
    minSpend: 500,
    hours: '08:00 AM - 11:00 PM'
  }
};

// Load persistent state from localStorage
function getMerchantState() {
  const saved = localStorage.getItem('pedidos_listo_merchant_state');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { ...defaultMerchantState, ...parsed };
    } catch (e) {}
  }
  return defaultMerchantState;
}

function saveMerchantState(state) {
  localStorage.setItem('pedidos_listo_merchant_state', JSON.stringify(state));
  window.dispatchEvent(new Event('pedidos_listo_state_updated'));
}

let merchantState = getMerchantState();

// Session State & Authentication System
function getUserSession() {
  const saved = localStorage.getItem('pedidos_listo_user_session');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch(e){}
  }
  return {
    isLoggedIn: true,
    ownerName: 'Juan Pérez',
    email: 'socio@pedidoslisto.com',
    phone: '809-555-0192',
    role: 'merchant'
  };
}

function saveUserSession(session) {
  localStorage.setItem('pedidos_listo_user_session', JSON.stringify(session));
  window.dispatchEvent(new Event('pedidos_listo_session_updated'));
}

let userSession = getUserSession();

window.renderSessionBar = function() {
  const statusEl = document.getElementById('user-session-status');
  const loginBtn = document.getElementById('btn-session-login');
  const logoutBtn = document.getElementById('btn-session-logout');

  if (userSession && userSession.isLoggedIn) {
    if (statusEl) statusEl.innerText = `🟢 Sesión: ${userSession.ownerName || 'Propietario'} (${merchantState.storeName || 'Comercio Registrado'})`;
    if (loginBtn) loginBtn.innerText = '⚙️ Mi Cuenta Partner';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
  } else {
    if (statusEl) statusEl.innerText = '⚪ Sesión no iniciada (Invitado)';
    if (loginBtn) loginBtn.innerText = '🔑 Iniciar Sesión / Registrar Mi Negocio';
    if (logoutBtn) logoutBtn.style.display = 'none';
  }
};

window.openPartnerLoginModal = function() {
  document.getElementById('modal-partner-login')?.classList.add('active');
};

window.switchToRegisterModal = function() {
  document.getElementById('modal-partner-login')?.classList.remove('active');
  document.getElementById('modal-register-merchant')?.classList.add('active');
};

window.handlePartnerLoginSubmit = function(event) {
  event.preventDefault();
  const email = document.getElementById('login-email')?.value || 'socio@pedidoslisto.com';
  
  userSession = {
    isLoggedIn: true,
    ownerName: email.split('@')[0].toUpperCase(),
    email: email,
    phone: merchantState.phone || '809-555-0192',
    role: 'merchant'
  };

  saveUserSession(userSession);
  renderSessionBar();
  document.getElementById('modal-partner-login')?.classList.remove('active');
  alert(`🔑 ¡SESIÓN INICIADA EN PEDIDOS LISTO PARTNER!\n\nBienvenido, ${userSession.ownerName}.\nAcceso concedido al Portal de Comercio & Impresión POS.`);
};

window.handleRegisterMerchantSubmit = function(event) {
  event.preventDefault();

  const ownerName = document.getElementById('reg-owner-name')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim();
  const ownerPhone = document.getElementById('reg-owner-phone')?.value.trim();

  const storeName = document.getElementById('reg-store-name')?.value.trim();
  const storeCat = document.getElementById('reg-store-cat')?.value;
  const storeRnc = document.getElementById('reg-store-rnc')?.value.trim();
  const storeAddress = document.getElementById('reg-store-address')?.value.trim();
  const storePhone = document.getElementById('reg-store-phone')?.value.trim();

  const bankName = document.getElementById('reg-bank-name')?.value;
  const bankNumber = document.getElementById('reg-bank-number')?.value.trim();
  const bankHolder = document.getElementById('reg-bank-holder')?.value.trim();

  userSession = {
    isLoggedIn: true,
    ownerName,
    email,
    phone: ownerPhone,
    role: 'merchant'
  };
  saveUserSession(userSession);

  merchantState.storeName = storeName;
  merchantState.address = storeAddress;
  merchantState.phone = storePhone;
  merchantState.bankAccount = {
    bank: bankName,
    number: bankNumber,
    holder: bankHolder
  };

  saveMerchantState(merchantState);
  renderMerchantDashboard();
  renderSessionBar();

  document.getElementById('modal-register-merchant')?.classList.remove('active');

  alert(`✨ ¡REGISTRO EXITOSO EN PEDIDOS LISTO!\n\n🏪 Comercio: "${storeName}"\n👤 Propietario: ${ownerName}\n📍 Dirección: ${storeAddress}\n🏦 Banco Depósitos: ${bankName}\n\n¡Tu negocio ya está activo para vender, publicar platos e imprimir comandas!`);
};

window.handlePartnerLogout = function() {
  if (confirm('¿Deseas cerrar sesión en Pedidos Listo Partner?')) {
    userSession = { isLoggedIn: false, ownerName: '', email: '', phone: '', role: 'client' };
    saveUserSession(userSession);
    renderSessionBar();
    alert('🚪 Sesión cerrada con éxito.');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderSessionBar();
  renderMerchantDashboard();
  renderMerchantInventory();
  renderMerchantOrders();
  renderMerchantCoupons();
  renderMerchantReviews();
  if (window.updateLiveMenuPreview) window.updateLiveMenuPreview();

  // Populate Bank form
  const bankAccountNum = document.getElementById('bank-account-num');
  const bankAccountHolder = document.getElementById('bank-account-holder');
  const bankSelect = document.getElementById('bank-name-select');

  if (bankAccountNum) bankAccountNum.value = merchantState.bankAccount.number || '';
  if (bankAccountHolder) bankAccountHolder.value = merchantState.bankAccount.holder || '';
  if (bankSelect) bankSelect.value = merchantState.bankAccount.bank || 'Banco Popular Dominicano';

  // Populate Settings form
  const settingHours = document.getElementById('setting-hours');
  const settingRadius = document.getElementById('setting-radius');
  const settingMinSpend = document.getElementById('setting-min-spend');

  if (settingHours) settingHours.value = merchantState.settings.hours || '08:00 AM - 11:00 PM';
  if (settingRadius) settingRadius.value = merchantState.settings.radiusKm || '5 km';
  if (settingMinSpend) settingMinSpend.value = merchantState.settings.minSpend || 500;

  // Listen for real-time updates from app.js (e.g. client places order)
  window.addEventListener('storage', () => {
    merchantState = getMerchantState();
    renderMerchantDashboard();
    renderMerchantInventory();
    renderMerchantOrders();
    renderMerchantCoupons();
    renderMerchantReviews();
  });
});

function renderMerchantDashboard() {
  const salesEl = document.getElementById('dash-today-sales');
  if (salesEl) salesEl.innerText = `RD$ ${merchantState.todaySales.toLocaleString()}`;

  const ordersCountEl = document.getElementById('dash-today-orders');
  if (ordersCountEl) ordersCountEl.innerText = `${merchantState.todayOrdersCount} Completados`;

  const titleEl = document.getElementById('merchant-store-title');
  if (titleEl) titleEl.innerText = merchantState.storeName || 'KFC Las Colinas Santiago';

  const cardTitleEl = document.getElementById('card-store-name');
  if (cardTitleEl) cardTitleEl.innerText = merchantState.storeName || 'KFC Las Colinas Santiago';

  const cardAddressEl = document.getElementById('card-store-address');
  if (cardAddressEl) cardAddressEl.innerText = merchantState.address || 'Av. Juan Pablo Duarte #10, Santiago';

  const bankTextEl = document.getElementById('dash-bank-account-text');
  if (bankTextEl) bankTextEl.innerText = `Depositado a ${merchantState.bankAccount.bank} ***** ${merchantState.bankAccount.number.slice(-4)}`;

  const statusDot = document.getElementById('store-status-dot');
  const statusLabel = document.getElementById('store-status-label');
  const statusSelect = document.getElementById('select-store-status');

  if (statusSelect) statusSelect.value = merchantState.status;

  if (statusDot && statusLabel) {
    if (merchantState.status === 'open') {
      statusDot.style.background = '#00e699';
      statusLabel.innerText = 'Abierto & Recibiendo Pedidos';
    } else if (merchantState.status === 'busy') {
      statusDot.style.background = '#ffc107';
      statusLabel.innerText = '🟡 Alta Demanda (Pausa 15m)';
    } else {
      statusDot.style.background = '#ef4444';
      statusLabel.innerText = '🔴 Cerrado Temporalmente';
    }
  }

  const prepSelect = document.getElementById('select-prep-time');
  if (prepSelect) prepSelect.value = merchantState.prepTime;

  const badgeCount = document.getElementById('badge-pedidos-count');
  if (badgeCount) badgeCount.innerText = merchantState.orders.length;
}

/* ==========================================================================
   PRODUCT & INVENTORY ENGINE
   ========================================================================== */

let uploadedImageDataUrl = '';

window.handleProductImageUpload = function(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
      uploadedImageDataUrl = e.target.result;
      const previewContainer = document.getElementById('prod-img-preview-container');
      const previewImg = document.getElementById('prod-img-preview');
      if (previewContainer && previewImg) {
        previewImg.src = uploadedImageDataUrl;
        previewContainer.style.display = 'flex';
      }
      if (window.updateLiveMenuPreview) window.updateLiveMenuPreview();
    };

    reader.readAsDataURL(file);
  }
};

window.removeUploadedImage = function() {
  uploadedImageDataUrl = '';
  const fileInput = document.getElementById('prod-file-input');
  if (fileInput) fileInput.value = '';
  const previewContainer = document.getElementById('prod-img-preview-container');
  if (previewContainer) previewContainer.style.display = 'none';
  if (window.updateLiveMenuPreview) window.updateLiveMenuPreview();
};

window.quickEditMerchantPrice = function(prodId) {
  const prod = merchantState.products.find(p => p.id === prodId);
  if (!prod) return;

  const newPriceStr = prompt(`✏️ Editar precio para "${prod.name}" (RD$):`, prod.price);
  if (newPriceStr !== null) {
    const newPrice = parseFloat(newPriceStr);
    if (!isNaN(newPrice) && newPrice > 0) {
      prod.price = newPrice;
      saveMerchantState(merchantState);
      renderMerchantInventory();
      try { window.dispatchEvent(new Event('storage')); } catch(e) {}
      alert(`✅ ¡Precio actualizado a RD$ ${newPrice} para "${prod.name}"!`);
    } else {
      alert('⚠️ Ingresa un precio válido.');
    }
  }
};

function renderMerchantInventory() {
  const container = document.getElementById('merchant-inventory-list');
  const countEl = document.getElementById('merchant-product-count');

  if (countEl) countEl.innerText = `${merchantState.products.length} Productos`;
  if (!container) return;

  if (merchantState.products.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">No hay productos registrados en el catálogo.</p>`;
    return;
  }

  container.innerHTML = merchantState.products.map(prod => `
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 14px; border-radius: 14px; margin-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 10px; flex-grow: 1; min-width: 0;">
        <img src="${prod.image}" style="width: 48px; height: 48px; border-radius: 10px; object-fit: cover; flex-shrink: 0; border: 1px solid #cbd5e1;">
        <div style="min-width: 0;">
          <div style="font-weight: 800; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${prod.name} ${prod.isFlash ? '<span style="color: var(--brand-mamey); font-size: 10px; font-weight: 900;">⚡ FLASH</span>' : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
            <span style="font-family: var(--font-heading); font-weight: 900; color: var(--brand-mamey); font-size: 14px;">RD$ ${prod.price}</span>
            <button type="button" style="background: #e2e8f0; color: #475569; border: none; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer;" onclick="quickEditMerchantPrice('${prod.id}')">✏️ Precio</button>
          </div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
        <span class="stock-badge ${prod.inStock ? 'stock-in' : 'stock-out'}" style="padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; background: ${prod.inStock ? '#dcfce7' : '#fee2e2'}; color: ${prod.inStock ? '#15803d' : '#b91c1c'}; cursor: pointer;" onclick="toggleStockStatus('${prod.id}')">
          ${prod.inStock ? '✓ En Stock' : '❌ Agotado'}
        </span>
        <button style="background: #fee2e2; color: #ef4444; border: none; padding: 6px 8px; border-radius: 8px; font-weight: 800; font-size: 11px; cursor: pointer;" onclick="deleteMerchantProduct('${prod.id}')">
          🗑️
        </button>
      </div>
    </div>
  `).join('');
}

window.handleAddNewProduct = function(event) {
  if (event) event.preventDefault();

  const nameInput = document.getElementById('prod-name');
  const priceInput = document.getElementById('prod-price');
  const catInput = document.getElementById('prod-category');
  const descInput = document.getElementById('prod-desc');
  const flashInput = document.getElementById('prod-is-flash');

  const name = (nameInput && nameInput.value.trim() !== '') ? nameInput.value.trim() : 'Yaroa de Pollo & Queso Mofongo';
  const price = (priceInput && priceInput.value !== '') ? parseFloat(priceInput.value) : 450;
  const category = catInput ? catInput.value : 'bocado';
  const description = (descInput && descInput.value.trim() !== '') ? descInput.value.trim() : 'Platillo especial preparado fresco al momento con sazón criollo.';
  
  const urlFallback = document.getElementById('prod-img') ? document.getElementById('prod-img').value : '';
  const image = uploadedImageDataUrl || urlFallback || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
  
  const isFlash = flashInput ? flashInput.checked : false;

  // Gather checked guarniciones, bebidas and extras
  const guarniciones = Array.from(document.querySelectorAll('input[name="opt-guarnicion"]:checked')).map(c => c.value);
  const bebidas = Array.from(document.querySelectorAll('input[name="opt-bebida"]:checked')).map(c => c.value);
  const extras = Array.from(document.querySelectorAll('input[name="opt-extra"]:checked')).map(c => c.value);

  const newProd = {
    id: 'prod-' + Date.now(),
    name,
    price,
    category,
    description,
    image,
    inStock: true,
    isFlash,
    guarniciones,
    bebidas,
    extras
  };

  if (!merchantState.products) merchantState.products = [];
  merchantState.products.unshift(newProd);
  saveMerchantState(merchantState);

  // Instant Storage Sync to Client App
  try {
    window.dispatchEvent(new Event('storage'));
  } catch(e) {}

  renderMerchantDashboard();
  renderMerchantInventory();

  // Reset form inputs
  if (nameInput) nameInput.value = '';
  if (priceInput) priceInput.value = '';
  if (descInput) descInput.value = '';
  removeUploadedImage();

  alert(`✨ ¡PRODUCTO PUBLICADO EN VIVO!\n\nPlatillo: "${name}"\nPrecio: RD$ ${price}\nEstado: 🟢 Activo en Pedidos Listo\n\n¡Los clientes ya pueden ver y ordenar este producto en la app!`);
};

window.toggleStockStatus = function(prodId) {
  const prod = merchantState.products.find(p => p.id === prodId);
  if (prod) {
    prod.inStock = !prod.inStock;
    saveMerchantState(merchantState);
    renderMerchantInventory();
  }
};

window.deleteMerchantProduct = function(prodId) {
  if (confirm('¿Seguro que deseas eliminar este producto del catálogo del comercio?')) {
    merchantState.products = merchantState.products.filter(p => p.id !== prodId);
    saveMerchantState(merchantState);
    renderMerchantInventory();
  }
};

/* ==========================================================================
   ORDERS & KDS ENGINE
   ========================================================================== */

function renderMerchantOrders() {
  const container = document.getElementById('merchant-orders-list');
  if (!container) return;

  if (merchantState.orders.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px; font-size: 13px;">No hay pedidos pendientes en este momento.</p>`;
    return;
  }

  container.innerHTML = merchantState.orders.map(ord => `
    <div style="background: #ffffff; border-left: 5px solid ${ord.status === 'accepted' ? '#00b0ff' : '#00e699'}; padding: 16px; border-radius: 16px; margin-bottom: 14px; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(0,0,0,0.06);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-weight: 900; font-size: 18px; color: var(--text-primary);">Orden #${ord.id}</span>
        <span style="background: #0a0e1a; color: #00e699; font-size: 12px; font-weight: 900; padding: 5px 10px; border-radius: 8px;">
          ${ord.status === 'accepted' ? '🧑‍🍳 EN PREPARACIÓN' : '🛵 NUEVO PEDIDO'}
        </span>
      </div>

      <p style="font-size: 15px; font-weight: 800; color: var(--text-primary); margin-bottom: 8px; line-height: 1.4;">${ord.items}</p>
      <div style="font-size: 13px; color: var(--text-muted); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
        <span>Cliente: <strong style="color: #0f172a;">${ord.clientName}</strong> (${ord.phone})</span>
        <span style="font-family: var(--font-heading); font-weight: 900; color: var(--brand-mamey); font-size: 18px;">RD$ ${ord.total}</span>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${ord.status === 'pending' ? `
          <button style="flex-grow: 1; min-height: 48px; background: var(--brand-mamey); color: white; border: none; padding: 12px 14px; border-radius: 12px; font-weight: 900; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(255,107,0,0.3);" onclick="acceptMerchantOrder('${ord.id}')">
            👨‍🍳 Aceptar y Cocinar
          </button>
        ` : `
          <button style="flex-grow: 1; min-height: 48px; background: #00b0ff; color: white; border: none; padding: 12px 14px; border-radius: 12px; font-weight: 900; font-size: 14px; cursor: pointer;" onclick="alert('🛵 Delivery notificado. En camino a recoger.')">
            🛵 Listo para Delivery
          </button>
        `}
        <button style="min-height: 48px; background: #121829; color: white; border: none; padding: 12px 14px; border-radius: 12px; font-weight: 900; font-size: 13px; cursor: pointer;" onclick="printPosTicket('${ord.id}')">
          🖨️ Ticket POS
        </button>
        <button style="min-height: 48px; background: #25D366; color: white; border: none; padding: 12px 14px; border-radius: 12px; font-weight: 900; font-size: 13px; cursor: pointer;" onclick="window.open('https://api.whatsapp.com/send?phone=${ord.phone}&text=Hola%20${ord.clientName},%20tu%20pedido%20${ord.id}%20esta%20siendo%20procesado%20en%20${merchantState.storeName}', '_blank')">
          💬 WhatsApp
        </button>
      </div>
    </div>
  `).join('');
}

window.acceptMerchantOrder = function(orderId) {
  const ord = merchantState.orders.find(o => o.id === orderId);
  if (ord) {
    ord.status = 'accepted';
    saveMerchantState(merchantState);
    renderMerchantOrders();
    alert(`👨‍🍳 Orden #${orderId} ACEPTADA.\n\nNotificación enviada al cliente. Tiempo estimado de cocina: ${merchantState.prepTime}`);
  }
};

window.handleVerifyPin = function() {
  const pinInput = document.getElementById('verify-pin-input');
  if (!pinInput) return;

  const pin = pinInput.value.trim();
  if (!pin) {
    alert('Ingresa el PIN de 4 dígitos del cliente.');
    return;
  }

  const matchingOrder = merchantState.orders.find(o => o.pinOTP === pin);
  if (matchingOrder) {
    matchingOrder.status = 'delivered';
    merchantState.todaySales += matchingOrder.total;
    merchantState.todayOrdersCount += 1;
    merchantState.orders = merchantState.orders.filter(o => o.id !== matchingOrder.id);

    saveMerchantState(merchantState);
    renderMerchantDashboard();
    renderMerchantOrders();

    pinInput.value = '';
    alert(`🔓 ¡PIN OTP ${pin} VALIDADO CON ÉXITO!\n\n✅ Fondos de RD$ ${matchingOrder.total} liberados al comercio.\n✅ Pedido entregado satisfactoriamente.`);
  } else {
    alert(`❌ PIN Incorrecto (${pin}). Pide al cliente el PIN OTP de 4 dígitos que aparece en su pantalla de la app.`);
  }
};

/* ==========================================================================
   POS TICKET THERMAL PRINTER SIMULATOR
   ========================================================================== */

window.printPosTicket = function(orderId) {
  const ord = merchantState.orders.find(o => o.id === orderId) || merchantState.orders[0];
  if (!ord) return;

  const ticketContainer = document.getElementById('pos-ticket-content');
  if (ticketContainer) {
    ticketContainer.innerHTML = `
      <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px;">
        <h4 style="margin: 0; font-size: 16px; font-weight: 900;">${merchantState.storeName}</h4>
        <span style="font-size: 11px;">${merchantState.address}</span><br>
        <span style="font-size: 11px;">Tel: ${merchantState.phone}</span>
      </div>
      <div style="font-size: 11px; margin-bottom: 8px;">
        <strong>ORDEN #: ${ord.id}</strong><br>
        Fecha: ${new Date().toLocaleDateString('es-DO')} ${new Date().toLocaleTimeString('es-DO')}<br>
        Cliente: ${ord.clientName}<br>
        Tel: ${ord.phone}
      </div>
      <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 8px 0; margin-bottom: 8px; font-size: 12px;">
        ${ord.items}
      </div>
      <div style="text-align: right; font-size: 14px; font-weight: 900; margin-bottom: 8px;">
        TOTAL: RD$ ${ord.total}
      </div>
      <div style="text-align: center; font-size: 11px; border-top: 1px dashed #000; padding-top: 8px;">
        <strong>PIN OTP DE SEGURIDAD: ${ord.pinOTP}</strong><br>
        *** Gracias por preferirnos ***
      </div>
    `;
  }

  document.getElementById('modal-pos-ticket')?.classList.add('active');
  window.executeThermalPrintEngine(ord);
};

let isPrintingNow = false;

window.executeThermalPrintEngine = function(customOrder) {
  if (isPrintingNow) {
    console.warn('Impresión en curso, ignorando duplicado.');
    return;
  }
  isPrintingNow = true;
  setTimeout(() => { isPrintingNow = false; }, 1500);

  try {
    const ord = customOrder || (merchantState.orders && merchantState.orders.length > 0 ? merchantState.orders[0] : null);
    const storeName = merchantState.storeName || 'KFC Las Colinas Santiago';
    const address = merchantState.address || 'Av. Juan Pablo Duarte #10, Santiago';
    const phone = merchantState.phone || '809-555-0192';

    const orderId = ord ? ord.id : 'ORD-7719';
    const clientName = ord ? ord.clientName : 'Juan Pérez';
    const clientPhone = ord ? ord.phone : '809-555-0192';
    const itemsText = ord ? ord.items : '1x Bucket Familiar KFC (8 Pzs)\n1x Refresco Cola 2L';
    const total = ord ? ord.total : 1054;
    const pinOTP = ord ? ord.pinOTP : '7492';
    const dateStr = `${new Date().toLocaleDateString('es-DO')} ${new Date().toLocaleTimeString('es-DO')}`;

    const plainTextReceipt = `
================================
${storeName.toUpperCase()}
${address}
Tel: ${phone}
================================
ORDEN #: ${orderId}
FECHA: ${dateStr}
CLIENTE: ${clientName} (${clientPhone})
--------------------------------
${itemsText}
--------------------------------
TOTAL: RD$ ${total}
--------------------------------
PIN OTP SEGURIDAD: ${pinOTP}
*** GRACIAS POR PREFERIRNOS ***
================================
\n\n\n`;

    let printedViaNative = false;

    if (window.Android) {
      if (typeof window.Android.printTicket === 'function') {
        try { window.Android.printTicket(plainTextReceipt); printedViaNative = true; } catch(e){}
      } else if (typeof window.Android.printString === 'function') {
        try { window.Android.printString(plainTextReceipt); printedViaNative = true; } catch(e){}
      } else if (typeof window.Android.print === 'function') {
        try { window.Android.print(); printedViaNative = true; } catch(e){}
      }
    }

    if (!printedViaNative && window.SunmiPrinter) {
      if (typeof window.SunmiPrinter.printTicket === 'function') {
        try { window.SunmiPrinter.printTicket(plainTextReceipt); printedViaNative = true; } catch(e){}
      } else if (typeof window.SunmiPrinter.printString === 'function') {
        try { window.SunmiPrinter.printString(plainTextReceipt); printedViaNative = true; } catch(e){}
      }
    }

    if (!printedViaNative && window.sunmiInnerPrinter) {
      if (typeof window.sunmiInnerPrinter.printText === 'function') {
        try { window.sunmiInnerPrinter.printText(plainTextReceipt); printedViaNative = true; } catch(e){}
      } else if (typeof window.sunmiInnerPrinter.print === 'function') {
        try { window.sunmiInnerPrinter.print(plainTextReceipt); printedViaNative = true; } catch(e){}
      }
    }

    if (printedViaNative) {
      console.log('Printed via Native Android/Sunmi Interface');
      return;
    }

    const currentTicketEl = document.getElementById('pos-ticket-content');
    const ticketInnerHtml = currentTicketEl ? currentTicketEl.innerHTML : `
      <div style="text-align:center;">
        <h3 style="margin:0;">${storeName}</h3>
        <p style="margin:2px 0;">${address}</p>
        <p style="margin:2px 0;">Tel: ${phone}</p>
        <hr style="border:none;border-bottom:1px dashed #000;margin:6px 0;">
        <p style="text-align:left;"><strong>ORDEN #: ${orderId}</strong><br>Cliente: ${clientName}</p>
        <hr style="border:none;border-bottom:1px dashed #000;margin:6px 0;">
        <div style="text-align:left;">${itemsText}</div>
        <hr style="border:none;border-bottom:1px dashed #000;margin:6px 0;">
        <p style="text-align:right;font-size:15px;font-weight:bold;">TOTAL: RD$ ${total}</p>
        <hr style="border:none;border-bottom:1px dashed #000;margin:6px 0;">
        <p style="text-align:center;"><strong>PIN OTP DE SEGURIDAD: ${pinOTP}</strong><br>*** GRACIAS POR PREFERIRNOS ***</p>
      </div>
    `;

    let printDiv = document.getElementById('thermal-receipt-print-area');
    if (!printDiv) {
      printDiv = document.createElement('div');
      printDiv.id = 'thermal-receipt-print-area';
      document.body.appendChild(printDiv);
    }
    printDiv.innerHTML = `
      <div style="font-family:'Courier New',Courier,monospace;width:58mm;max-width:58mm;margin:0 auto;padding:4px;color:#000;background:#fff;font-size:12px;font-weight:bold;line-height:1.2;">
        ${ticketInnerHtml}
      </div>
    `;

    setTimeout(() => {
      try {
        window.print();
      } catch(err) {
        console.error('Print error:', err);
      }
    }, 100);

  } catch (globalErr) {
    console.error('Print Engine Global Error:', globalErr);
  }
};

/* ==========================================================================
   COUPONS & PROMOTIONS CONTROLLER
   ========================================================================== */

function renderMerchantCoupons() {
  const container = document.getElementById('merchant-coupons-list');
  if (!container) return;

  if (merchantState.coupons.length === 0) {
    container.innerHTML = `<p style="font-size: 12px; color: var(--text-muted);">No has creado cupones propios aún.</p>`;
    return;
  }

  container.innerHTML = merchantState.coupons.map(c => `
    <div style="background: #fff3e6; border: 1px solid #ffe0b2; padding: 12px; border-radius: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="font-family: var(--font-heading); font-weight: 900; font-size: 14px; color: var(--brand-mamey);">${c.code}</span>
        <span style="font-size: 11px; color: var(--text-muted); display: block;">RD$ ${c.discount} OFF en compras > RD$ ${c.minSpend}</span>
      </div>
      <span style="font-size: 10px; background: var(--brand-mamey); color: white; padding: 4px 8px; border-radius: 6px; font-weight: 800;">Usado ${c.usageCount || 0} veces</span>
    </div>
  `).join('');
}

window.handleCreateStoreCoupon = function(event) {
  event.preventDefault();
  const code = document.getElementById('coupon-code').value.toUpperCase().trim();
  const discount = parseFloat(document.getElementById('coupon-discount').value);
  const minSpend = parseFloat(document.getElementById('coupon-min-spend').value);

  const newCoupon = { code, discount, minSpend, usageCount: 0 };
  merchantState.coupons.unshift(newCoupon);
  saveMerchantState(merchantState);

  renderMerchantCoupons();
  event.target.reset();
  alert(`✨ ¡Cupón "${code}" activado con éxito en tu local!`);
};

/* ==========================================================================
   REVIEWS & RATINGS CONTROLLER
   ========================================================================== */

function renderMerchantReviews() {
  const container = document.getElementById('merchant-reviews-list');
  if (!container) return;

  container.innerHTML = merchantState.reviews.map(rev => `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 12px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-weight: 800; font-size: 13px;">${rev.clientName}</span>
        <span style="color: var(--accent-gold); font-size: 12px; font-weight: 800;">${'⭐'.repeat(rev.rating)}</span>
      </div>
      <p style="font-size: 12px; color: var(--text-primary); margin-bottom: 6px;">"${rev.comment}"</p>
      
      ${rev.reply ? `
        <div style="background: #fff3e6; border-left: 3px solid var(--brand-mamey); padding: 8px 10px; border-radius: 6px; font-size: 11px; margin-top: 6px;">
          <strong>Respuesta del Local:</strong> ${rev.reply}
        </div>
      ` : `
        <div style="margin-top: 8px; display: flex; gap: 6px;">
          <input type="text" id="reply-input-${rev.id}" placeholder="Escribe tu respuesta..." style="flex-grow: 1; padding: 6px 10px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 11px;">
          <button onclick="handleReplyReview('${rev.id}')" style="background: var(--brand-mamey); color: white; border: none; padding: 6px 10px; border-radius: 8px; font-weight: 800; font-size: 11px; cursor: pointer;">Responder</button>
        </div>
      `}
    </div>
  `).join('');
}

window.handleReplyReview = function(reviewId) {
  const input = document.getElementById(`reply-input-${reviewId}`);
  if (!input || !input.value.trim()) return;

  const rev = merchantState.reviews.find(r => r.id === reviewId);
  if (rev) {
    rev.reply = input.value.trim();
    saveMerchantState(merchantState);
    renderMerchantReviews();
    alert('💬 Respuesta publicada con éxito.');
  }
};

/* ==========================================================================
   BANK ACCOUNT & STORE SETTINGS HANDLERS
   ========================================================================== */

window.handleSaveBankAccount = function(event) {
  event.preventDefault();
  const bank = document.getElementById('bank-name-select').value;
  const number = document.getElementById('bank-account-num').value;
  const holder = document.getElementById('bank-account-holder').value;

  merchantState.bankAccount = { bank, number, holder };
  saveMerchantState(merchantState);
  renderMerchantDashboard();

  alert(`🏦 Datos bancarios de ${bank} guardados con éxito.`);
};

window.handleSaveStoreSettings = function(event) {
  event.preventDefault();
  const hours = document.getElementById('setting-hours').value;
  const radiusKm = document.getElementById('setting-radius').value;
  const minSpend = parseFloat(document.getElementById('setting-min-spend').value);

  merchantState.settings = { hours, radiusKm, minSpend };
  saveMerchantState(merchantState);

  alert(`⚙️ Horarios (${hours}) y Radio de Entrega (${radiusKm}) guardados con éxito.`);
};

/* ==========================================================================
   TAB NAVIGATION CONTROLLER
   ========================================================================== */

window.switchMerchantTab = function(tabId) {
  document.querySelectorAll('.merchant-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.merchant-tab-content').forEach(content => content.classList.remove('active'));

  const activeBtn = document.querySelector(`.merchant-tab-btn[data-tab="${tabId}"]`);
  if (activeBtn) activeBtn.classList.add('active');

  const activeContent = document.getElementById(`tab-${tabId}`);
  if (activeContent) activeContent.classList.add('active');
};

window.playNotificationSoundSim = function() {
  alert('🔔 [ALERTA AUDIBLE EN VIVO]\n\n¡Simulación de Alerta de Sonido Partner: Nuevo pedido recibido!');
};

let uploadedStoreLogoUrl = '';

window.openEditStoreModal = function() {
  const nameInput = document.getElementById('edit-store-name');
  const addrInput = document.getElementById('edit-store-address');
  const phoneInput = document.getElementById('edit-store-phone');

  if (nameInput) nameInput.value = merchantState.storeName || 'KFC Las Colinas Santiago';
  if (addrInput) addrInput.value = merchantState.address || 'Av. Juan Pablo Duarte #10, Santiago';
  if (phoneInput) phoneInput.value = merchantState.phone || '809-555-0192';

  document.getElementById('modal-edit-store')?.classList.add('active');
};

window.handleStoreLogoUpload = function(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedStoreLogoUrl = e.target.result;
      const previewBox = document.getElementById('store-logo-preview-box');
      const previewImg = document.getElementById('store-logo-preview');
      if (previewBox && previewImg) {
        previewImg.src = uploadedStoreLogoUrl;
        previewBox.style.display = 'flex';
      }
    };
    reader.readAsDataURL(file);
  }
};

window.handleSaveStoreProfile = function(event) {
  event.preventDefault();
  const name = document.getElementById('edit-store-name').value;
  const address = document.getElementById('edit-store-address').value;
  const phone = document.getElementById('edit-store-phone').value;

  merchantState.storeName = name;
  merchantState.address = address;
  merchantState.phone = phone;
  if (uploadedStoreLogoUrl) {
    merchantState.logoImage = uploadedStoreLogoUrl;
  }

  saveMerchantState(merchantState);
  renderMerchantDashboard();
  document.getElementById('modal-edit-store')?.classList.remove('active');

  alert(`✅ ¡Nombre de tu comercio actualizado a "${name}" con éxito!`);
};

window.handleStoreStatusChange = function(newStatus) {
  merchantState.status = newStatus;
  saveMerchantState(merchantState);
  renderMerchantDashboard();
};

window.handlePrepTimeChange = function(newPrepTime) {
  merchantState.prepTime = newPrepTime;
  saveMerchantState(merchantState);
};

/* ==========================================================================
   ULTRA STUDIO PHOTO EDITOR ENGINE (CANVAS BASED)
   ========================================================================== */

let rawEditorImg = new Image();
let editorState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  rotation: 0,
  watermark: null
};

window.openPhotoEditorStudio = function() {
  const currentPreview = document.getElementById('prod-img-preview');
  if (!currentPreview || !currentPreview.src) {
    alert('Primero sube una foto desde tu equipo.');
    return;
  }

  rawEditorImg = new Image();
  rawEditorImg.crossOrigin = 'anonymous';
  rawEditorImg.onload = function() {
    resetEditorControls();
    document.getElementById('modal-photo-editor')?.classList.add('active');
    renderEditorCanvas();
  };
  rawEditorImg.src = uploadedImageDataUrl || currentPreview.src;
};

window.closePhotoEditorStudio = function() {
  document.getElementById('modal-photo-editor')?.classList.remove('active');
};

window.resetEditorControls = function() {
  editorState = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    rotation: 0,
    watermark: null
  };

  const bSlider = document.getElementById('slider-brightness');
  const sSlider = document.getElementById('slider-saturation');
  const cSlider = document.getElementById('slider-contrast');

  if (bSlider) bSlider.value = 100;
  if (sSlider) sSlider.value = 100;
  if (cSlider) cSlider.value = 100;

  renderEditorCanvas();
};

window.updateEditorFromSliders = function() {
  const b = document.getElementById('slider-brightness')?.value || 100;
  const s = document.getElementById('slider-saturation')?.value || 100;
  const c = document.getElementById('slider-contrast')?.value || 100;

  editorState.brightness = parseFloat(b);
  editorState.saturation = parseFloat(s);
  editorState.contrast = parseFloat(c);

  renderEditorCanvas();
};

window.applyFoodFilterPreset = function(preset) {
  if (preset === 'criollo') {
    editorState.brightness = 110;
    editorState.saturation = 145;
    editorState.contrast = 120;
  } else if (preset === 'hd') {
    editorState.brightness = 105;
    editorState.saturation = 130;
    editorState.contrast = 135;
  } else if (preset === 'parrilla') {
    editorState.brightness = 95;
    editorState.saturation = 125;
    editorState.contrast = 140;
  } else if (preset === 'fresco') {
    editorState.brightness = 115;
    editorState.saturation = 135;
    editorState.contrast = 110;
  } else if (preset === 'dark') {
    editorState.brightness = 85;
    editorState.saturation = 120;
    editorState.contrast = 145;
  } else {
    editorState.brightness = 100;
    editorState.saturation = 100;
    editorState.contrast = 100;
  }

  const bSlider = document.getElementById('slider-brightness');
  const sSlider = document.getElementById('slider-saturation');
  const cSlider = document.getElementById('slider-contrast');

  if (bSlider) bSlider.value = editorState.brightness;
  if (sSlider) sSlider.value = editorState.saturation;
  if (cSlider) cSlider.value = editorState.contrast;

  renderEditorCanvas();
};

window.setEditorWatermark = function(badgeType) {
  editorState.watermark = badgeType;
  renderEditorCanvas();
};

window.rotateEditorImage = function() {
  editorState.rotation = (editorState.rotation + 90) % 360;
  renderEditorCanvas();
};

function renderEditorCanvas() {
  const canvas = document.getElementById('editor-canvas');
  if (!canvas || !rawEditorImg.width) return;

  const ctx = canvas.getContext('2d');
  
  const width = rawEditorImg.width;
  const height = rawEditorImg.height;

  if (editorState.rotation === 90 || editorState.rotation === 270) {
    canvas.width = height;
    canvas.height = width;
  } else {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  // Filters
  ctx.filter = `brightness(${editorState.brightness}%) contrast(${editorState.contrast}%) saturate(${editorState.saturation}%)`;

  // Rotation & Drawing
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((editorState.rotation * Math.PI) / 180);
  ctx.drawImage(rawEditorImg, -width / 2, -height / 2, width, height);

  ctx.restore();

  // Watermark / Sticker Badge Overlay
  const badgeToDraw = editorState.sticker || editorState.watermark;
  if (badgeToDraw) {
    let text = '';
    let bg = '#ff6b00';

    if (badgeToDraw === 'CHEF' || badgeToDraw === 'CHEF_STAR') { text = '⭐ RECOMENDADO DEL CHEF'; bg = '#121829'; }
    else if (badgeToDraw === 'CRIOLLO' || badgeToDraw === 'FIRE' || badgeToDraw === 'SAZON') { text = '🔥 100% CRIOLLO DOMINICANO'; bg = '#ff6b00'; }
    else if (badgeToDraw === 'FLASH' || badgeToDraw === 'FLASH_DELIVERY') { text = '⚡ OFERTA MÁNDAME FLASH'; bg = '#ef4444'; }
    else if (badgeToDraw === 'TOP' || badgeToDraw === 'TOP_SELLER') { text = '👑 PATRÓN TOP SELLER'; bg = '#8b5cf6'; }
    else if (badgeToDraw === 'CHEESE') { text = '🧀 EXTRA QUESO FUNDIDO'; bg = '#f59e0b'; }
    else { text = '🔥 ' + badgeToDraw; bg = '#ff6b00'; }

    ctx.save();
    const fontSize = Math.max(16, Math.floor(canvas.width / 20));
    ctx.font = `900 ${fontSize}px sans-serif`;

    const padding = fontSize * 0.8;
    const textWidth = ctx.measureText(text).width;
    const rectW = textWidth + padding * 2;
    const rectH = fontSize * 1.8;
    const x = canvas.width - rectW - 20;
    const y = canvas.height - rectH - 20;

    // Draw Badge Background Pill
    ctx.fillStyle = bg;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, rectW, rectH, rectH / 2);
    } else {
      ctx.rect(x, y, rectW, rectH);
    }
    ctx.fill();

    // Draw Badge Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + rectW / 2, y + rectH / 2);
    ctx.restore();
  }
}

window.saveEditorResult = function() {
  const canvas = document.getElementById('editor-canvas');
  if (!canvas) return;

  uploadedImageDataUrl = canvas.toDataURL('image/jpeg', 0.92);

  const previewImg = document.getElementById('prod-img-preview');
  if (previewImg) previewImg.src = uploadedImageDataUrl;

  if (window.updateLiveMenuPreview) window.updateLiveMenuPreview();

  closePhotoEditorStudio();
  alert('✨ ¡Edición Ultra aplicada con éxito al platillo!');
};

/* ==========================================================================
   MERCHANT QUICK ACTION BUTTONS ENGINE
   ========================================================================== */
window.requestExpressRiderAlert = function() {
  document.getElementById('modal-express-rider')?.classList.add('active');
};

window.confirmExpressRiderOrder = function() {
  document.getElementById('modal-express-rider')?.classList.remove('active');
  alert('🛵 ¡MOTOR DE APOYO CONFIRMADO!\n\nRepartidor Kelvin Santos en camino a tu cocina. Llegada estimada en 4 minutos.');
};

window.openPushBroadcastModal = function() {
  document.getElementById('modal-push-broadcast')?.classList.add('active');
};

window.sendPushBroadcastAlert = function() {
  const msg = document.getElementById('input-push-msg')?.value || 'Promoción activa';
  document.getElementById('modal-push-broadcast')?.classList.remove('active');
  alert(`🚀 ¡Notificación Push Enviada con Éxito!\n\nMensaje enviado a 142 clientes cercanos:\n"${msg}"`);
};

window.openQuickFlashModal = function() {
  document.getElementById('modal-quick-flash')?.classList.add('active');
};

window.submitQuickFlashDeal = function() {
  const prodSelect = document.getElementById('select-flash-product');
  const discountSelect = document.getElementById('select-flash-discount');
  const prodName = prodSelect ? prodSelect.options[prodSelect.selectedIndex].text : 'Platillo';
  const discount = discountSelect ? discountSelect.value : '50';

  document.getElementById('modal-quick-flash')?.classList.remove('active');
  alert(`⚡ ¡Oferta Flash Activada!\n\nEl plato "${prodName}" ahora se muestra destacado en el inicio del cliente con ${discount}% OFF.`);
};

window.testThermalPrinterSimulator = function() {
  printPosTicket('ORD-7719');
};

window.openSalesReportModal = function() {
  document.getElementById('modal-sales-report')?.classList.add('active');
};

window.downloadPdfReportSimulator = function() {
  document.getElementById('modal-sales-report')?.classList.remove('active');
  alert('📥 Descargando Reporte Contable de Ventas Pedidos Listo Partner (Formato PDF / Excel)...');
};

window.openPinConfigModal = function() {
  document.getElementById('modal-pin-config')?.classList.add('active');
};

window.saveNewMerchantPin = function() {
  const newPin = document.getElementById('input-new-merchant-pin')?.value;
  if (!newPin || newPin.length !== 4) {
    alert('⚠️ Ingresa un PIN de exactamente 4 dígitos.');
    return;
  }

  try {
    merchantState.employeePin = newPin;
    merchantState.pinRequired = true;
    saveMerchantState(merchantState);
  } catch(e) {}

  document.getElementById('modal-pin-config')?.classList.remove('active');
  alert(`🔒 ¡PIN de Seguridad Actualizado!\n\nEl nuevo PIN de acceso para empleados es: ${newPin}`);
};

window.focusNewProductForm = function() {
  const cardEl = document.getElementById('card-form-add-product');
  if (cardEl) {
    cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    document.getElementById('prod-name')?.focus();
  }
};

window.triggerEditorPhotoSelect = function() {
  const fileInput = document.getElementById('prod-file-input');
  if (fileInput) {
    fileInput.click();
  }
};

/* ==========================================================================
   ANIMATED STICKERS & LIVE MENU PREVIEW ENGINE
   ========================================================================== */
window.setEditorSticker = function(stickerType) {
  editorState.sticker = stickerType;
  renderEditorCanvas();
};

window.updateLiveMenuPreview = function() {
  const name = document.getElementById('prod-name')?.value || 'Yaroa de Pollo & Queso Mofongo';
  const price = document.getElementById('prod-price')?.value || '450';
  const desc = document.getElementById('prod-desc')?.value || 'Plátano majado con ajo criollo, chicharrón crocante y salsa especial.';
  
  let currentImg = uploadedImageDataUrl;
  if (!currentImg) {
    const previewEl = document.getElementById('prod-img-preview');
    if (previewEl && previewEl.src && !previewEl.src.endsWith('#') && previewEl.style.display !== 'none') {
      currentImg = previewEl.src;
    }
  }
  if (!currentImg) {
    currentImg = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80';
  }

  const titleEl = document.getElementById('preview-live-title');
  const priceEl = document.getElementById('preview-live-price');
  const descEl = document.getElementById('preview-live-desc');
  const imgEl = document.getElementById('preview-live-img');
  const tagsEl = document.getElementById('preview-live-options-tags');

  if (titleEl) titleEl.innerText = name;
  if (priceEl) priceEl.innerText = `RD$ ${price}`;
  if (descEl) descEl.innerText = desc;
  if (imgEl) imgEl.src = currentImg;

  // Count checked options
  const guarniciones = document.querySelectorAll('input[name="opt-guarnicion"]:checked').length;
  const bebidas = document.querySelectorAll('input[name="opt-bebida"]:checked').length;
  const extras = document.querySelectorAll('input[name="opt-extra"]:checked').length;
  const dietaryTags = Array.from(document.querySelectorAll('input[name="tag-dietary"]:checked')).map(c => c.value);

  if (tagsEl) {
    let html = '';
    if (dietaryTags.length > 0) {
      html += dietaryTags.map(t => `<span style="font-size: 9px; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px;">${t}</span>`).join(' ') + ' ';
    }
    html += `
      <span style="font-size: 9px; font-weight: 800; background: #fff3e6; color: var(--brand-mamey); padding: 2px 6px; border-radius: 4px;">🍟 ${guarniciones} Guarniciones</span>
      <span style="font-size: 9px; font-weight: 800; background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px;">🥤 ${bebidas} Bebidas</span>
      <span style="font-size: 9px; font-weight: 800; background: #fef3c7; color: #d97706; padding: 2px 6px; border-radius: 4px;">🥓 ${extras} Extras</span>
    `;
    tagsEl.innerHTML = html;
  }
};

window.simulateClientModalClick = function() {
  const name = document.getElementById('prod-name')?.value || 'Yaroa de Pollo & Queso Mofongo';
  const price = document.getElementById('prod-price')?.value || '450';
  const desc = document.getElementById('prod-desc')?.value || 'Plátano majado con ajo criollo, chicharrón crocante y salsa especial.';

  const guarniciones = Array.from(document.querySelectorAll('input[name="opt-guarnicion"]:checked')).map(c => c.value);
  const bebidas = Array.from(document.querySelectorAll('input[name="opt-bebida"]:checked')).map(c => c.value);
  const extras = Array.from(document.querySelectorAll('input[name="opt-extra"]:checked')).map(c => c.value);

  alert(`📱 VISTA PREVIA DEL MODAL DE PERSONALIZACIÓN DEL CLIENTE:\n\n🍔 Platillo: ${name}\n💰 Precio Base: RD$ ${price}\n📝 Nota: ${desc}\n\n🍟 Guarniciones Elegibles:\n- ${guarniciones.join('\n- ') || 'Ninguna'}\n\n🥤 Bebidas Disponibles:\n- ${bebidas.join('\n- ') || 'Ninguna'}\n\n🥓 Extras & Salsas:\n- ${extras.join('\n- ') || 'Ninguno'}\n\n¡Así es como tus clientes personalizarán su pedido al ordenar en Pedidos Listo!`);
};

/* ==========================================================================
   VIEW MODES ENGINE: VISTA EXCLUSIVA RESTAURANTE vs VISTA MARKETPLACE
   ========================================================================== */
window.openSingleStoreView = function() {
  localStorage.setItem('pedidos_listo_active_view_mode', 'single_store');
  window.location.href = 'index.html?view=single_store';
};

window.openFullAppView = function() {
  localStorage.setItem('pedidos_listo_active_view_mode', 'marketplace');
  window.location.href = 'index.html?view=marketplace';
};

