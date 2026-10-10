import { useEffect } from 'react'
import logoBlanco from '../assets/logo-blanco.png'
import pedidosListoLogo from '../assets/pedidos-listo-blanco.png'
import './SplashScreen.css'

export default function SplashScreen({ onFinish, lang }) {
  useEffect(() => {
    // 2 segundos de splash screen elegante
    const t = setTimeout(() => {
      onFinish()
    }, 2000)
    return () => clearTimeout(t)
  }, [onFinish])

  return (
    <div className="splash-screen">
      <div className="splash-logo-wrap">
        <img src={logoBlanco} alt="Pedidos Listo" className="splash-logo" />
      </div>
      <img src={pedidosListoLogo} alt="Pedidos Listo" className="splash-letras" />
      <div className="splash-loader">
        <div className="splash-bar" />
      </div>
    </div>
  )
}