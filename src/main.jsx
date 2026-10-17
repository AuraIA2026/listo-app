import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { UserProvider } from './useUserData'

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
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fff', color: '#EF4444', minHeight: '100vh', fontFamily: 'monospace', overflow: 'auto' }}>
          <h1 style={{fontSize: '24px', fontWeight: 'bold'}}>💥 FATAL CRASH REPORT🔌</h1>
          <p style={{fontSize: '16px', fontWeight: 'bold', margin: '10px 0'}}>{this.state.error && this.state.error.toString()}</p>
          <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '12px', color: '#333', background: '#f5f5f5', padding: '10px', borderRadius: '8px'}}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <p style={{marginTop: '20px', color: '#000', fontWeight: 'bold'}}>Por favor, envíale una foto de esta pantalla al programador.</p>
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
