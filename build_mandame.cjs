const fs = require('fs');

let content = fs.readFileSync('E:/Listo Mandame/src/App.jsx', 'utf8');

// Insert import './MandamePage.css'; right after the first import line
content = content.replace(
  "import React, { useState, useEffect, useRef } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';\nimport './MandamePage.css';"
);

// Replace export default function App() with MandamePage
content = content.replace('export default function App() {', 'export default function MandamePage({ navigate, userData, userRole, lang }) {');

// Inject back button in header
const backBtn = `
        {/* BOTÓN REGRESAR A INICIO PEDIDOS LISTO */}
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
            ← Volver a Inicio
          </button>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#ff6b00', background: 'rgba(255,107,0,0.15)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255,107,0,0.3)' }}>
            🛵 PEDIDOS LISTO & MÁNDAME EXPRESS
          </div>
        </div>
`;

content = content.replace('<div className="brand-row">', backBtn + '\n        <div className="brand-row">');

fs.writeFileSync('E:/Listo/src/pages/MandamePage.jsx', content, 'utf8');
fs.writeFileSync('D:/Listo/src/pages/MandamePage.jsx', content, 'utf8');
console.log('MandamePage.jsx updated successfully!');
