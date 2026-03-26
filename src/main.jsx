import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
)
