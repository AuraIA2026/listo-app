import { useEffect } from 'react'
import listoPatronIntro from '../assets/listo-patron-intro.png'
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
        <img src={listoPatronIntro} alt="Listo Patrón" className="splash-intro-logo" />
      </div>
      <div className="splash-loader">
        <div className="splash-bar" />
      </div>
    </div>
  )
}