import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { UserProvider } from './useUserData'

// Auto-recargar cuando Vercel despliega una nueva versión y cambia el hash de los módulos dinámicos
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', () => {
    window.location.reload();
  });
}

class GlobalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
    const msg = String(error?.message || error || '');
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('dynamically imported module') ||
      msg.includes('Loading chunk')
    ) {
      const lastReload = sessionStorage.getItem('listo_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('listo_chunk_reload', String(now));
        window.location.reload();
      }
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px 20px', background: '#0F172A', color: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔄</div>
          <h1 style={{ fontSize: '22px', fontWeight: '900', margin: '0 0 8px' }}>Nueva actualización disponible</h1>
          <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '360px', margin: '0 0 20px', lineHeight: 1.5 }}>
            Acabamos de actualizar Listo Patrón con mejoras. Presiona el botón para cargar la versión más reciente.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ background: '#F26000', color: '#FFF', border: 'none', padding: '14px 28px', borderRadius: '14px', fontSize: '15px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 6px 20px rgba(242,96,0,0.4)' }}
          >
            🔄 Cargar Última Versión Ahora
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Resultado del pago con tarjeta (AZUL) al regresar a Pedidos Listo
try {
  const qp = new URLSearchParams(window.location.search);
  const estadoPago = qp.get('pedidoPago');
  if (estadoPago) {
    const orden = qp.get('orden') || '';
    const msgs = {
      aprobado: `\u2705 \u00a1Pago aprobado! Tu pedido #${orden} fue confirmado y ya est\u00e1 en preparaci\u00f3n. Revisa tus notificaciones para ver tu PIN.`,
      declinado: `\u274c El pago del pedido #${orden} fue declinado. Intenta con otra tarjeta o elige efectivo/transferencia.`,
      cancelado: `\u26a0\ufe0f Cancelaste el pago del pedido #${orden}. No se realiz\u00f3 ning\u00fan cargo.`,
      error: `\u26a0\ufe0f Hubo un problema verificando el pago del pedido #${orden}. Cont\u00e1ctanos si se hizo el cargo.`,
    };
    window.history.replaceState({}, '', window.location.pathname);
    setTimeout(() => alert(msgs[estadoPago] || msgs.error), 800);
  }
} catch (e) {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <UserProvider>
        <App />
      </UserProvider>
    </GlobalErrorBoundary>
  </StrictMode>,
)
