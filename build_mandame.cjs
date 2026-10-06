const fs = require('fs');

let content = fs.readFileSync('E:/Listo Mandame/src/App.jsx', 'utf8');

// Insert import './MandamePage.css'; right after the first import line
content = content.replace(
  "import React, { useState, useEffect, useRef } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';\nimport './MandamePage.css';"
);

// Replace export default function App() with MandamePage
content = content.replace('export default function App() {', 'export default function MandamePage({ navigate, userData, userRole, lang }) {');

// Inject isMerchantUser logic & custom event listener
const merchantUserLogicInject = `
  const isMerchantUser = Boolean(
    userData?.role === 'merchant' ||
    userData?.role === 'comercio' ||
    userData?.type === 'comercio' ||
    userData?.isMerchant === true ||
    userData?.email === 'listopatron.app@gmail.com' ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('force_listo_merchant_mode') === 'true')
  );

  // Escuchar cambios de pestaña desde la barra de navegación global (Ej: Mercado, Buscar, Pedidos)
  useEffect(() => {
    const handleSwitch = (e) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('mandame-switch-tab', handleSwitch);
    return () => window.removeEventListener('mandame-switch-tab', handleSwitch);
  }, []);
`;

content = content.replace("const [activeTab, setActiveTab] = useState('inicio');", "const [activeTab, setActiveTab] = useState('inicio');\n" + merchantUserLogicInject);

// Make mode switcher conditional on isMerchantUser
const oldModeBlock = `{/* Mode Switcher Pill Header */}
      <div style={{ background: '#0a0e1a', color: 'white', padding: '8px 16px', display: 'flex', justifyContent: spaceBetween, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontWeight: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>🍔</span>
          <span style={{ color: '#ff6b00', fontWeight: 900 }}>PEDIDOS LISTO</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setViewMode('client')} style={{ background: viewMode === 'client' ? '#ff6b00' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
            📱 App Cliente
          </button>
          <button onClick={() => setViewMode('merchant')} style={{ background: viewMode === 'merchant' ? '#ff6b00' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
            🏪 Comercio Partner
          </button>
        </div>
      </div>`;

const newModeBlock = `{/* Mode Switcher Pill Header - Solo para Comercio Partner / Admin */}
      {isMerchantUser && (
        <div style={{ background: '#0a0e1a', color: 'white', padding: '8px 16px', display: 'flex', justifyContent: spaceBetween, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: 11, fontWeight: 800 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>🍔</span>
            <span style={{ color: '#ff6b00', fontWeight: 900 }}>PEDIDOS LISTO</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setViewMode('client')} style={{ background: viewMode === 'client' ? '#ff6b00' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
              📱 App Cliente
            </button>
            <button onClick={() => setViewMode('merchant')} style={{ background: viewMode === 'merchant' ? '#ff6b00' : 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 900, cursor: 'pointer' }}>
              🏪 Comercio Partner
            </button>
          </div>
        </div>
      )}`;

content = content.replace(oldModeBlock, newModeBlock);

// Header Mamey con Menú Deslizable
const headerMameyHtml = `<header className="py-app-header" style={{ background: 'linear-gradient(135deg, #121829 0%, #0a0e1a 100%)', borderBottom: '3px solid #ff6b00', padding: '16px 16px 18px' }}>
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
          </header>`;

content = content.replace(/<header className="py-app-header">[\s\S]*?<\/header>/, headerMameyHtml);

// Remove internal floating bottom navbar
content = content.replace(/<nav className="custom-bottom-nav">[\s\S]*?<\/nav>/, '{/* Custom Bottom Nav Removed for Global BottomNav */}');

const targetMercadoChunk = `{activeTab === 'mercado' && (
              <div style={{ padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 18, marginBottom: 12 }}>🛒 Pedidos Listo Market & Víveres</h3>
                <div style={{ background: '#f8fafc', padding: 16, borderRadius: 20, border: '1px solid #e2e8f0' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Encuentra plátanos criollos, víveres frescos, bebidas y supermercado directo a tu cocina.</p>
                </div>
              </div>
            )}`;

const searchAndMercadoHtml = `{activeTab === 'buscar' && (
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
            )}`;

content = content.replace(targetMercadoChunk, searchAndMercadoHtml);

fs.writeFileSync('E:/Listo/src/pages/MandamePage.jsx', content, 'utf8');
fs.writeFileSync('D:/Listo/src/pages/MandamePage.jsx', content, 'utf8');
console.log('MandamePage.jsx updated with conditional merchant mode switcher!');
