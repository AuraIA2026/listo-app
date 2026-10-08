// src/locales/ListoMarketModule.jsx
import React, { useState } from 'react';
import './ListoMarketModule.css';

const DEPARTMENTS = [
  { id: 'todos', label: 'Todos', icon: '🛒' },
  { id: 'frutas', label: 'Frutas & Vegetales', icon: '🍎' },
  { id: 'lacteos', label: 'Lácteos & Huevos', icon: '🥛' },
  { id: 'bebidas', label: 'Cervezas & Bebidas', icon: '🍺' },
  { id: 'despensa', label: 'Despensa & Snacks', icon: '🍞' },
  { id: 'limpieza', label: 'Limpieza del Hogar', icon: '🧹' },
  { id: 'farmacia', label: 'Farmacia 24/7', icon: '💊' }
];

const MARKET_ITEMS = [
  { id: 'lm1', name: 'Leche Entera 1L', price: 110, unit: '1 Litro', dept: 'lacteos', badge: 'Popular', img: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80' },
  { id: 'lm2', name: 'Cerveza Presidente 6-Pack', price: 650, unit: 'Lata 12oz', dept: 'bebidas', badge: 'Frías', img: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=300&q=80' },
  { id: 'lm3', name: 'Aguacate Hass Premium', price: 85, unit: '1 unidad', dept: 'frutas', badge: 'Fresco', img: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&q=80' },
  { id: 'lm4', name: 'Huevos Frescos de Granja', price: 220, unit: 'Cartón 30 u', dept: 'lacteos', badge: 'Oferta', img: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=300&q=80' },
  { id: 'lm5', name: 'Pan de Agua Artesanal', price: 75, unit: 'Funda 10 u', dept: 'despensa', badge: 'Horneado hoy', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' },
  { id: 'lm6', name: 'Manzanas Red Delicious', price: 145, unit: 'Funda 3 lb', dept: 'frutas', badge: null, img: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80' },
  { id: 'lm7', name: 'Detergente Líquido 2L', price: 340, unit: 'Botella 2L', dept: 'limpieza', badge: 'Rinde mas', img: 'https://images.unsplash.com/photo-1585837575652-267c041d77d4?auto=format&fit=crop&w=300&q=80' },
  { id: 'lm8', name: 'Acetaminofén 500mg', price: 95, unit: 'Caja 10 tabletas', dept: 'farmacia', badge: '24/7', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80' }
];

export default function ListoMarketModule({ onAddToCart }) {
  const [activeDept, setActiveDept] = useState('todos');
  const [addedCount, setAddedCount] = useState({});

  const filteredItems = MARKET_ITEMS.filter(item => {
    return activeDept === 'todos' || item.dept === activeDept;
  });

  const handleAdd = (item) => {
    setAddedCount(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }));
    if (onAddToCart) onAddToCart(item);
    else alert(`Añadido al carrito: ${item.name} (RD$ ${item.price})`);
  };

  return (
    <div className="listo-market-container">
      {/* BANNER REPRODUCTOR MERCADO */}
      <div className="lm-banner">
        <div className="lm-banner-text">
          <h2>🛒 Listo Market</h2>
          <p>Supermercado Express • Entrega a tu puerta en 15 min</p>
        </div>
        <div className="lm-banner-emoji">🛍️</div>
      </div>

      {/* DEPARTAMENTOS PÍLDORAS */}
      <div className="lm-dept-scroll">
        {DEPARTMENTS.map(dept => (
          <button
            key={dept.id}
            className={`lm-dept-pill ${activeDept === dept.id ? 'active' : ''}`}
            onClick={() => setActiveDept(dept.id)}
          >
            <span>{dept.icon}</span>
            <span>{dept.label}</span>
          </button>
        ))}
      </div>

      {/* GRID DE PRODUCTOS */}
      <div className="lm-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="lm-card">
            {item.badge && <span className="lm-badge">{item.badge}</span>}
            <img src={item.img} alt={item.name} className="lm-img" />
            <div>
              <h4 className="lm-name">{item.name}</h4>
              <p className="lm-unit">{item.unit}</p>
            </div>
            <div className="lm-footer">
              <span className="lm-price">RD$ {item.price}</span>
              <button className="lm-add-btn" onClick={() => handleAdd(item)}>
                {addedCount[item.id] ? `+${addedCount[item.id]}` : '+ Agregar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
