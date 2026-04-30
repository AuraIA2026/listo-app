import { useEffect } from 'react'
import logoBlanco from '../assets/logo listo blanco.png'
import letrasLogo from '../assets/letras_listo_patron.png'
import './SplashScreen.css'

export default function SplashScreen({ onFinish, lang }) {
  useEffect(() => {
    // 2 segundos de splash screen simple y elegante
    const t = setTimeout(() => {
      onFinish()
    }, 2000)
    return () => clearTimeout(t)
  }, [onFinish])

  return (
    <div className="splash-screen">
      <div className="splash-logo-wrap">
        <img src={logoBlanco} alt="Listo" className="splash-logo" />
      </div>
      <img src={letrasLogo} alt="Listo Patrón" className="splash-letras" />
      <div className="splash-loader">
        <div className="splash-bar" />
      </div>
    </div>
  )
}