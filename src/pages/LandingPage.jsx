import React from 'react';
import './LandingPage.css';
import useLandingLogic from '../useLandingLogic';
import ad15 from '../assets/landing/extracted_15.png';
import ad16 from '../assets/landing/extracted_16.png';
import ad17 from '../assets/landing/extracted_17.png';
import ad18 from '../assets/landing/extracted_18.png';
import pro20 from '../assets/landing/extracted_20.jpeg';
import pro21 from '../assets/landing/extracted_21.jpeg';
import pro22 from '../assets/landing/extracted_22.jpeg';
import pro23 from '../assets/landing/extracted_23.jpeg';
import pro24 from '../assets/landing/extracted_24.jpeg';
import pro25 from '../assets/landing/extracted_25.jpeg';

export default function LandingPage({ navigate, lang }) {
  useLandingLogic();

  const closeIntro = () => { if (window.closeIntro) window.closeIntro(); };
  const nextSlide = () => { if (window.nextSlide) window.nextSlide(); };
  const shiftSlider = (d) => { if (window.shiftSlider) window.shiftSlider(d); };
  const goSlide = (i) => { if (window.goSlide) window.goSlide(i); };
  const adSlide = (d) => { if (window.adSlide) window.adSlide(d); };
  const goAd = (i) => { if (window.goAd) window.goAd(i); };
  const switchTab = (t) => { if (window.switchTab) window.switchTab(t); };

  return (
    <div className="landing-page-container">

  {/*  INTRO VIDEO SPLASH MOVED TO PORTADA HEADER  */}

  
  {/*  PRELOADER ESTILO APP  */}
  <div className="splash-screen" id="preloader" role="status" aria-label="Cargando">
    <div className="splash-logo-wrap">
      <img src="./assets/logo_listo_blanco.png" alt="Listo" className="splash-logo" />
    </div>
    <div className="splash-tagline">Listo Patrón</div>
    <div className="splash-loader">
      <div className="splash-bar"></div>
    </div>
  </div>

  {/*  Google Tag Manager (noscript)  */}
  <noscript>
    <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0" width="0" 
            style={{"display": "none", "visibility": "visible"}}>
    </iframe>
  </noscript>
  {/*  End Google Tag Manager (noscript)  */}

  {/*  SKIP LINK PARA ACCESIBILIDAD  */}
  <a href="#main-content" className="skip-link">Saltar al contenido principal</a>

  {/*  BOTÓN FLOTANTE WHATSAPP  */}
  <a href="https://wa.me/18099090455" className="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
    <span className="whatsapp-tooltip">¿Necesitas ayuda? Escríbenos</span>
  </a>

  {/*  BOTÓN SCROLL TO TOP  */}
  <button className="scroll-top" id="scrollTop" aria-label="Volver arriba">
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4l-8 8h5v8h6v-8h5z"/>
    </svg>
  </button>

  <main id="main-content">

{/*  NAV  */}
<nav id="nav">
  <img className="nav-logo" src="./assets/logo_listo.png" alt="Listo Patrón" style={{"height": "40px", "objectFit": "contain"}} />
  <div className="nav-links" id="navLinks">
    <a href="#servicios">Servicios</a>
    <a href="#como-funciona">Cómo funciona</a>
    <a href="#profesionales">Para profesionales</a>
    <a href="#planes">Planes</a>
    <a href="#faq">FAQ</a>
    <a onClick={() => navigate('login')} className="nav-btn" style={{cursor: "pointer", "color": "#FFFFFF", "fontWeight": "bold"}}>Abrir app →</a>
  </div>
  <button className="burger" id="burger"><span></span><span></span><span></span></button>
</nav>


{/*  PORTADA PRINCIPAL / INTRO ESTATICO  */}
<div id="intro-portada-container" style={{"width": "100%", "background": "#F26000", "paddingTop": "70px", "display": "flex", "justifyContent": "center", "position": "relative"}}>
    <div style={{"position": "relative", "width": "100%", "maxWidth": "1000px", "boxShadow": "0 0 40px rgba(0,0,0,0.3)", "overflow": "hidden", "background": "#000", "borderRadius": "16px", "margin": "0 15px"}}>
      
      {/* La imagen principal (el banner naranja con las personas) - en auto proporciones para que no se corte */}
      <img src="./assets/portada_nueva.png" style={{"width": "100%", "height": "auto", "display": "block"}} alt="Portada Listo Patrón" />
      
      {/* El logo circular en la esquina superior derecha */}
      <img src="./assets/logo_esquina.png" style={{"position": "absolute", "top": "4%", "right": "4%", "width": "clamp(50px, 8vw, 90px)", "height": "auto", "objectFit": "contain", "zIndex": "2", "filter": "drop-shadow(0 4px 6px rgba(0,0,0,0.2))"}} alt="Logo Listo" />

      {/* Botones de App Store y Google Play */}
      <div style={{"position": "absolute", "top": "54%", "right": "5%", "display": "flex", "flexDirection": "column", "gap": "2vh", "zIndex": "5", "width": "clamp(120px, 18vw, 160px)"}}>
         <a href="https://play.google.com/store/apps" target="_blank" rel="noopener noreferrer" style={{"display": "block", "transition": "transform 0.2s"}} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
           <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Disponible en Google Play" style={{"width": "100%", "height": "auto", "display": "block"}} />
         </a>
         <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer" style={{"display": "block", "transition": "transform 0.2s"}} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
           <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Consíguelo en el App Store" style={{"width": "100%", "height": "auto", "display": "block"}} />
         </a>
      </div>
    </div>
</div>



{/*  CONTADOR DE ESTADÍSTICAS  */}
<section style={{"background": "#F26000", "padding": "50px 5%", "position": "relative", "overflow": "hidden"}}>

  {/*  Fondo decorativo  */}
  <div style={{"position": "absolute", "inset": "0", "backgroundImage": "radial-gradient(circle,rgba(255,255,255,0.08) 1.5px,transparent 1.5px)", "backgroundSize": "30px 30px", "pointerEvents": "none"}}></div>
  <div style={{"position": "absolute", "top": "-80px", "right": "-80px", "width": "300px", "height": "300px", "borderRadius": "50%", "background": "rgba(255,255,255,0.06)", "pointerEvents": "none"}}></div>
  <div style={{"position": "absolute", "bottom": "-60px", "left": "-60px", "width": "220px", "height": "220px", "borderRadius": "50%", "background": "rgba(0,0,0,0.06)", "pointerEvents": "none"}}></div>

  <div className="section-inner" style={{"position": "relative", "zIndex": "1"}}>

    <div style={{"textAlign": "center", "marginBottom": "36px"}}>
      <h2 style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "clamp(24px,4vw,42px)", "color": "#fff", "lineHeight": "1.1", "marginBottom": "8px"}}>
        Números que nos respaldan
      </h2>
      <p style={{"fontSize": "15px", "color": "rgba(255,255,255,0.8)", "maxWidth": "420px", "margin": "0 auto"}}>
        Creciendo cada día junto a profesionales y clientes de República Dominicana.
      </p>
    </div>

    <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(180px,1fr))", "gap": "20px", "maxWidth": "900px", "margin": "0 auto"}} id="statsGrid">

      {/*  Stat 1  */}
      <div style={{"background": "rgba(255,255,255,0.15)", "backdropFilter": "blur(10px)", "border": "1px solid rgba(255,255,255,0.25)", "borderRadius": "20px", "padding": "28px 20px", "textAlign": "center", "transition": "transform .3s,box-shadow .3s"}}
           onMouseOver={() => { this.style.transform='translateY(-6px)';this.style.boxShadow='0 16px 40px rgba(0,0,0,0.2)' }}
           onMouseOut={() => { this.style.transform='';this.style.boxShadow='' }}>
        <div style={{"fontSize": "36px", "marginBottom": "8px"}}>👷</div>
        <div style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "46px", "color": "#fff", "lineHeight": "1"}} className="stat-counter" data-target="500" data-suffix="+">0</div>
        <div style={{"fontSize": "13px", "color": "rgba(255,255,255,0.85)", "fontWeight": "700", "marginTop": "6px", "textTransform": "uppercase", "letterSpacing": ".8px"}}>Profesionales activos</div>
      </div>

      {/*  Stat 2  */}
      <div style={{"background": "rgba(255,255,255,0.15)", "backdropFilter": "blur(10px)", "border": "1px solid rgba(255,255,255,0.25)", "borderRadius": "20px", "padding": "28px 20px", "textAlign": "center", "transition": "transform .3s,box-shadow .3s"}}
           onMouseOver={() => { this.style.transform='translateY(-6px)';this.style.boxShadow='0 16px 40px rgba(0,0,0,0.2)' }}
           onMouseOut={() => { this.style.transform='';this.style.boxShadow='' }}>
        <div style={{"fontSize": "36px", "marginBottom": "8px"}}>✅</div>
        <div style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "46px", "color": "#fff", "lineHeight": "1"}} className="stat-counter" data-target="1200" data-suffix="+">0</div>
        <div style={{"fontSize": "13px", "color": "rgba(255,255,255,0.85)", "fontWeight": "700", "marginTop": "6px", "textTransform": "uppercase", "letterSpacing": ".8px"}}>Servicios completados</div>
      </div>

      {/*  Stat 3  */}
      <div style={{"background": "rgba(255,255,255,0.15)", "backdropFilter": "blur(10px)", "border": "1px solid rgba(255,255,255,0.25)", "borderRadius": "20px", "padding": "28px 20px", "textAlign": "center", "transition": "transform .3s,box-shadow .3s"}}
           onMouseOver={() => { this.style.transform='translateY(-6px)';this.style.boxShadow='0 16px 40px rgba(0,0,0,0.2)' }}
           onMouseOut={() => { this.style.transform='';this.style.boxShadow='' }}>
        <div style={{"fontSize": "36px", "marginBottom": "8px"}}>⭐</div>
        <div style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "46px", "color": "#fff", "lineHeight": "1"}} className="stat-counter" data-target="4.9" data-suffix="/5" data-decimal="true">0</div>
        <div style={{"fontSize": "13px", "color": "rgba(255,255,255,0.85)", "fontWeight": "700", "marginTop": "6px", "textTransform": "uppercase", "letterSpacing": ".8px"}}>Calificación promedio</div>
      </div>

      {/*  Stat 4  */}
      <div style={{"background": "rgba(255,255,255,0.15)", "backdropFilter": "blur(10px)", "border": "1px solid rgba(255,255,255,0.25)", "borderRadius": "20px", "padding": "28px 20px", "textAlign": "center", "transition": "transform .3s,box-shadow .3s"}}
           onMouseOver={() => { this.style.transform='translateY(-6px)';this.style.boxShadow='0 16px 40px rgba(0,0,0,0.2)' }}
           onMouseOut={() => { this.style.transform='';this.style.boxShadow='' }}>
        <div style={{"fontSize": "36px", "marginBottom": "8px"}}>⚡</div>
        <div style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "46px", "color": "#fff", "lineHeight": "1"}} className="stat-counter" data-target="15" data-suffix=" min">0</div>
        <div style={{"fontSize": "13px", "color": "rgba(255,255,255,0.85)", "fontWeight": "700", "marginTop": "6px", "textTransform": "uppercase", "letterSpacing": ".8px"}}>Tiempo de respuesta</div>
      </div>

      {/*  Stat 5  */}
      <div style={{"background": "rgba(255,255,255,0.15)", "backdropFilter": "blur(10px)", "border": "1px solid rgba(255,255,255,0.25)", "borderRadius": "20px", "padding": "28px 20px", "textAlign": "center", "transition": "transform .3s,box-shadow .3s"}}
           onMouseOver={() => { this.style.transform='translateY(-6px)';this.style.boxShadow='0 16px 40px rgba(0,0,0,0.2)' }}
           onMouseOut={() => { this.style.transform='';this.style.boxShadow='' }}>
        <div style={{"fontSize": "36px", "marginBottom": "8px"}}>🏙️</div>
        <div style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "46px", "color": "#fff", "lineHeight": "1"}} className="stat-counter" data-target="2" data-suffix=" ciudades">0</div>
        <div style={{"fontSize": "13px", "color": "rgba(255,255,255,0.85)", "fontWeight": "700", "marginTop": "6px", "textTransform": "uppercase", "letterSpacing": ".8px"}}>Ciudades activas</div>
      </div>

      {/*  Stat 6  */}
      <div style={{"background": "rgba(255,255,255,0.15)", "backdropFilter": "blur(10px)", "border": "1px solid rgba(255,255,255,0.25)", "borderRadius": "20px", "padding": "28px 20px", "textAlign": "center", "transition": "transform .3s,box-shadow .3s"}}
           onMouseOver={() => { this.style.transform='translateY(-6px)';this.style.boxShadow='0 16px 40px rgba(0,0,0,0.2)' }}
           onMouseOut={() => { this.style.transform='';this.style.boxShadow='' }}>
        <div style={{"fontSize": "36px", "marginBottom": "8px"}}>😊</div>
        <div style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "46px", "color": "#fff", "lineHeight": "1"}} className="stat-counter" data-target="94" data-suffix="%">0</div>
        <div style={{"fontSize": "13px", "color": "rgba(255,255,255,0.85)", "fontWeight": "700", "marginTop": "6px", "textTransform": "uppercase", "letterSpacing": ".8px"}}>Clientes satisfechos</div>
      </div>

    </div>
  </div>
</section>



{/*  SECCIÓN PROFESIONALES - SLIDER  */}
<section style={{"background": "#fff", "padding": "30px 5% 20px", "overflow": "hidden"}}>
  <div style={{"maxWidth": "1200px", "margin": "0 auto"}}>

    <div style={{"textAlign": "center", "marginBottom": "12px"}}>
      <div style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "background": "#FFF3EC", "color": "#F26000", "padding": "6px 16px", "borderRadius": "50px", "fontSize": "11px", "fontWeight": "800", "letterSpacing": "1.5px", "textTransform": "uppercase", "marginBottom": "10px"}}>
        👷 Nuestros profesionales
      </div>
      <h2 style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "clamp(26px,4vw,46px)", "color": "#F26000", "lineHeight": "1.1", "marginBottom": "10px"}}>
        Conoce a tu próximo <span style={{"color": "#C24D00"}}>experto</span>
      </h2>
      <p style={{"fontSize": "16px", "color": "#6B7280", "maxWidth": "460px", "margin": "0 auto", "lineHeight": "1.7"}}>
        Profesionales verificados, listos para servirte en República Dominicana.
      </p>
    </div>

    <div style={{"position": "relative"}}>
      <button onClick={() => { shiftSlider(-1) }} aria-label="Anterior" style={{"position": "absolute", "left": "-20px", "top": "50%", "transform": "translateY(-50%)", "width": "44px", "height": "44px", "borderRadius": "50%", "border": "none", "cursor": "pointer", "background": "#F26000", "color": "#fff", "fontSize": "22px", "zIndex": "10", "boxShadow": "0 4px 16px rgba(242,96,0,0.4)", "display": "flex", "alignItems": "center", "justifyContent": "center"}}>‹</button>

      <div id="proSliderTrack" style={{"display": "flex", "transition": "transform 0.5s ease-out", "gap": "20px"}}>
        <div className="pro-slide" style={{"flex": "0 0 calc(100% / 4 - 15px)", "minWidth": "220px"}}>
          <img src="./assets/extracted_6.png" alt="Mecánico" />
          <div className="pro-slide-label">🔧 Mecánico</div>
        </div>
        <div className="pro-slide" style={{"flex": "0 0 calc(100% / 4 - 15px)", "minWidth": "220px"}}>
          <img src="./assets/extracted_7.png" alt="Limpieza" />
          <div className="pro-slide-label">🧹 Limpieza</div>
        </div>
        <div className="pro-slide" style={{"flex": "0 0 calc(100% / 4 - 15px)", "minWidth": "220px"}}>
          <img src="./assets/extracted_8.png" alt="Limpieza 2" />
          <div className="pro-slide-label">🧹 Limpieza</div>
        </div>
        <div className="pro-slide" style={{"flex": "0 0 calc(100% / 4 - 15px)", "minWidth": "220px"}}>
          <img src="./assets/extracted_9.png" alt="Jardinero" />
          <div className="pro-slide-label">🌿 Jardinero</div>
        </div>
        <div className="pro-slide" style={{"flex": "0 0 calc(100% / 4 - 15px)", "minWidth": "220px"}}>
          <img src="./assets/extracted_10.png" alt="Jardinero 2" />
          <div className="pro-slide-label">🌿 Jardinero</div>
        </div>
        <div className="pro-slide" style={{"flex": "0 0 calc(100% / 4 - 15px)", "minWidth": "220px"}}>
          <img src="./assets/extracted_11.png" alt="Plomero" />
          <div className="pro-slide-label">🔩 Plomero</div>
        </div>
        <div className="pro-slide" style={{"flex": "0 0 calc(100% / 4 - 15px)", "minWidth": "220px"}}>
          <img src="./assets/extracted_12.png" alt="Enfermería" />
          <div className="pro-slide-label">🏥 Enfermería</div>
        </div>
        <div className="pro-slide" style={{"flex": "0 0 calc(100% / 4 - 15px)", "minWidth": "220px"}}>
          <img src="./assets/extracted_13.png" alt="Masajes" />
          <div className="pro-slide-label">💆 Masajes</div>
        </div>
        <div className="pro-slide" style={{"flex": "0 0 calc(100% / 4 - 15px)", "minWidth": "220px"}}>
          <img src="./assets/extracted_14.jpeg" alt="Pintor" />
          <div className="pro-slide-label">🎨 Pintor</div>
        </div>
      </div>

      {/*  Arrow right  */}
      <button onClick={() => { shiftSlider(1) }} aria-label="Siguiente" style={{"position": "absolute", "right": "-20px", "top": "50%", "transform": "translateY(-50%)", "width": "44px", "height": "44px", "borderRadius": "50%", "border": "none", "cursor": "pointer", "background": "#F26000", "color": "#fff", "fontSize": "22px", "zIndex": "10", "boxShadow": "0 4px 16px rgba(242,96,0,0.4)", "display": "flex", "alignItems": "center", "justifyContent": "center"}}>›</button>
    </div>

    <div style={{"display": "flex", "justifyContent": "center", "gap": "8px", "marginTop": "24px"}}>
        <button className="pro-dot  active" onClick={() => { goSlide(0) }}></button>
        <button className="pro-dot" onClick={() => { goSlide(1) }}></button>
        <button className="pro-dot" onClick={() => { goSlide(2) }}></button>
        <button className="pro-dot" onClick={() => { goSlide(3) }}></button>
        <button className="pro-dot" onClick={() => { goSlide(4) }}></button>
        <button className="pro-dot" onClick={() => { goSlide(5) }}></button>
        <button className="pro-dot" onClick={() => { goSlide(6) }}></button>
        <button className="pro-dot" onClick={() => { goSlide(7) }}></button>
        <button className="pro-dot" onClick={() => { goSlide(8) }}></button>
    </div>
  </div>
</section>

{/*  PUBLICIDAD  */}
<section style={{"background": "#f5f5f5", "padding": "24px 5%"}}>
  <div className="section-inner">
    <div style={{"textAlign": "center", "fontSize": "11px", "color": "#999", "letterSpacing": "1.5px", "textTransform": "uppercase", "marginBottom": "12px"}}>Publicidad</div>
    <div style={{"position": "relative", "maxWidth": "960px", "margin": "0 auto", "overflow": "hidden", "borderRadius": "16px", "boxShadow": "0 8px 30px rgba(0,0,0,0.1)"}}>
      <div id="ad-track" style={{"display": "flex", "transition": "transform .6s ease"}}>
        <div className="ad-slide"><img src={ad15} alt="Caney Discoteca" style={{"width": "100%", "display": "block", "objectFit": "cover", "maxHeight": "200px"}}/></div>
        <div className="ad-slide"><img src={ad16} alt="Arte Urbano" style={{"width": "100%", "display": "block", "objectFit": "cover", "maxHeight": "200px"}}/></div>
        <div className="ad-slide"><img src={ad17} alt="Arte Medios" style={{"width": "100%", "display": "block", "objectFit": "cover", "maxHeight": "200px"}}/></div>
        <div className="ad-slide"><img src={ad18} alt="FCO Ren Cars" style={{"width": "100%", "display": "block", "objectFit": "cover", "maxHeight": "200px"}}/></div>
      </div>
      <button onClick={() => { adSlide(-1) }} style={{"position": "absolute", "left": "10px", "top": "50%", "transform": "translateY(-50%)", "background": "rgba(0,0,0,0.4)", "color": "#fff", "border": "none", "borderRadius": "50%", "width": "36px", "height": "36px", "fontSize": "20px", "cursor": "pointer", "zIndex": "10"}}>‹</button>
      <button onClick={() => { adSlide(1) }} style={{"position": "absolute", "right": "10px", "top": "50%", "transform": "translateY(-50%)", "background": "rgba(0,0,0,0.4)", "color": "#fff", "border": "none", "borderRadius": "50%", "width": "36px", "height": "36px", "fontSize": "20px", "cursor": "pointer", "zIndex": "10"}}>›</button>
    </div>
    <div style={{"display": "flex", "justifyContent": "center", "gap": "8px", "marginTop": "12px"}} id="ad-dots">
      <span className="ad-dot active" onClick={() => { goAd(0) }}></span>
      <span className="ad-dot" onClick={() => { goAd(1) }}></span>
      <span className="ad-dot" onClick={() => { goAd(2) }}></span>
      <span className="ad-dot" onClick={() => { goAd(3) }}></span>
    </div>
  </div>
</section>
{/*  styles extracted  */}


{/*  styles extracted  */}



{/*  HERO  */}
<section className="hero" id="inicio" aria-label="Sección principal">
  <div className="hero-dots"></div>
  <div className="hero-blob1"></div>
  <div className="hero-blob2"></div>

  {/*  TETRIS LEFT/RIGHT ahora van dentro del phone-wrap  */}


  <div style={{"maxWidth": "1200px", "margin": "0 auto", "width": "100%"}}>
    <div className="hero-inner">
      <div className="hero-text">
        <div className="hero-badge"><span className="hero-dot"></span> República Dominicana · En línea ahora</div>
        <h1>El servicio que<br/>necesitas,<br/><span>cuando lo necesitas</span></h1>
        <p className="hero-sub">Conectamos clientes con los mejores profesionales independientes de RD. Sin esperas, sin complicaciones.</p>
        <div className="hero-btns">
          <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="btn-white">🔍 Buscar profesional</a>
          <a href="#profesionales" className="btn-ghost">🔧 Soy profesional</a>
        </div>
      </div>
      <div className="hero-phone">
        <div className="phone-wrap" style={{"position": "relative"}}>
          {/*  TETRIS IZQUIERDA: LISTO  */}
          <div className="tetris-side tetris-left" id="tetrisLeft"></div>
          {/*  TETRIS DERECHA: PATRON  */}
          <div className="tetris-side tetris-right" id="tetrisRight"></div>
          <div className="phone-frame">
            <div className="phone-notch"></div>
            <div className="phone-screen">
              <div className="phone-header" style={{"flexDirection": "column", "alignItems": "center", "gap": "6px", "padding": "16px 14px 10px"}}>
                <img src="./assets/extracted_19.png" alt="Listo Patrón" style={{"height": "28px", "width": "auto", "objectFit": "contain", "filter": "brightness(0) invert(1)"}}/>
                <span style={{"color": "rgba(255,255,255,0.9)", "fontSize": "10px", "fontWeight": "700", "letterSpacing": ".5px"}}>🇩🇴 República Dominicana</span>
              </div>
              <div className="phone-search">🔍 ¿Qué servicio necesitas?</div>
              <div className="phone-cats">
                <div className="phone-cat"><span className="phone-cat-icon">🔧</span>Mantenimiento</div>
                <div className="phone-cat"><span className="phone-cat-icon">🧹</span>Limpieza</div>
                <div className="phone-cat"><span className="phone-cat-icon">✂️</span>Cuidado personal</div>
                <div className="phone-cat"><span className="phone-cat-icon">🎉</span>Eventos</div>
              </div>
              <div style={{"fontSize": "11px", "fontWeight": "800", "color": "#888"}}>Profesionales cerca de ti</div>
              <div className="phone-card">
                <div className="phone-card-avatar">👨‍🔧</div>
                <div className="phone-card-info">
                  <div className="phone-card-name">Carlos Méndez</div>
                  <div className="phone-card-role">Electricista · 0.8km</div>
                  <div className="phone-card-stars">★★★★★ 4.9</div>
                </div>
                <div className="phone-card-btn">Contratar</div>
              </div>
              <div className="phone-card" style={{"background": "var(--orange-dark)"}}>
                <div className="phone-card-avatar">👩‍🔧</div>
                <div className="phone-card-info">
                  <div className="phone-card-name">Ana Rodríguez</div>
                  <div className="phone-card-role">Plomera · 1.2km</div>
                  <div className="phone-card-stars">★★★★★ 5.0</div>
                </div>
                <div className="phone-card-btn">Contratar</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/*  Stats bar  */}
    <div className="hero-stats">
      <div className="hero-stat">
        <span className="stat-num">500+</span>
        <span className="stat-label">Profesionales activos</span>
      </div>
      <div className="hero-stat">
        <span className="stat-num">20+</span>
        <span className="stat-label">Tipos de servicio</span>
      </div>
      <div className="hero-stat">
        <span className="stat-num">4.9★</span>
        <span className="stat-label">Calificación promedio</span>
      </div>
      <div className="hero-stat">
        <span className="stat-num">~15min</span>
        <span className="stat-label">Tiempo de respuesta</span>
      </div>
    </div>
  </div>


</section>


{/*  TICKER BANNER  */}
<div className="ticker-wrap">
  <div className="ticker">
    <span>⚡ Respuesta en 15 min</span>
    <span>✅ Profesionales verificados</span>
    <span>🇩🇴 República Dominicana</span>
    <span>🔧 +20 tipos de servicio</span>
    <span>⭐ 4.9 calificación promedio</span>
    <span>👷 +500 profesionales activos</span>
    <span>💬 Chat directo con el profesional</span>
    <span>📍 Tracking en tiempo real</span>
    <span>⚡ Respuesta en 15 min</span>
    <span>✅ Profesionales verificados</span>
    <span>🇩🇴 República Dominicana</span>
    <span>🔧 +20 tipos de servicio</span>
    <span>⭐ 4.9 calificación promedio</span>
    <span>👷 +500 profesionales activos</span>
    <span>💬 Chat directo con el profesional</span>
    <span>📍 Tracking en tiempo real</span>
  </div>
</div>

{/*  CATEGORIAS  */}
<section className="cats-section" id="servicios">
  <div className="section-inner">
    <div className="chip sr">✦ Servicios disponibles</div>
    <h2 className="section-title sr sr-delay-1">Todo lo que necesitas<br/><span>en un solo lugar</span></h2>
    <p className="section-sub">Desde plomería hasta niñeras — el profesional que buscas está a minutos de ti.</p>
    <div className="cats-grid">
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="cat-card"><span className="cat-icon"><img src="./assets/profesionales/MECANICO.png" alt="Mantenimiento" style={{"width": "48px", "height": "48px", "objectFit": "contain"}}/></span><span className="cat-name">Mantenimiento</span></a>
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="cat-card"><span className="cat-icon"><img src="./assets/profesionales/limpiesa.png" alt="Limpieza" style={{"width": "48px", "height": "48px", "objectFit": "contain"}}/></span><span className="cat-name">Limpieza</span></a>
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="cat-card"><span className="cat-icon"><img src="./assets/profesionales/masajes.png" alt="Cuidado personal" style={{"width": "48px", "height": "48px", "objectFit": "contain"}}/></span><span className="cat-name">Cuidado personal</span></a>
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="cat-card"><span className="cat-icon"><img src="./assets/profesionales/organisadora de boda.png" alt="Eventos" style={{"width": "48px", "height": "48px", "objectFit": "contain"}}/></span><span className="cat-name">Eventos</span></a>
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="cat-card"><span className="cat-icon"><img src="./assets/profesionales/Pintor.png" alt="Personalizado" style={{"width": "48px", "height": "48px", "objectFit": "contain"}}/></span><span className="cat-name">Personalizado</span></a>
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="cat-card"><span className="cat-icon"><img src="./assets/profesionales/electricista.png" alt="Electricista" style={{"width": "48px", "height": "48px", "objectFit": "contain"}}/></span><span className="cat-name">Electricista</span></a>
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="cat-card"><span className="cat-icon"><img src="./assets/profesionales/Plomero.png" alt="Plomero" style={{"width": "48px", "height": "48px", "objectFit": "contain"}}/></span><span className="cat-name">Plomero</span></a>
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="cat-card"><span className="cat-icon"><img src="./assets/profesionales/MECANICO.png" alt="Mec. Motos" style={{"width": "48px", "height": "48px", "objectFit": "contain"}}/></span><span className="cat-name">Mec. Motos</span></a>
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="cat-card"><span className="cat-icon"><img src="./assets/profesionales/niñera.png" alt="Niñera" style={{"width": "48px", "height": "48px", "objectFit": "contain"}}/></span><span className="cat-name">Niñera</span></a>
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="cat-card cta-cat"><span className="cat-icon" style={{"color": "#fff", "display": "flex", "alignItems": "center", "justifyContent": "center", "width": "48px", "height": "48px", "fontSize": "24px"}}>✦</span><span className="cat-name">Ver todos</span></a>
    </div>

    {/*  Profesionales destacados  */}
    <div style={{"marginTop": "64px"}}>
      <div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "marginBottom": "10px", "flexWrap": "wrap", "gap": "12px"}}>
        <h3 style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "28px", "color": "var(--orange)"}}>Profesionales destacados</h3>
        <a onClick={() => navigate('login')} style={{cursor: "pointer", "color": "var(--orange)", "fontWeight": "700", "fontSize": "14px", "textDecoration": "none"}}>Ver todos →</a>
      </div>
      <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fill,minmax(240px,1fr))", "gap": "16px"}}>

        <a onClick={() => navigate('login')} style={{cursor: "pointer", "textDecoration": "none", "background": "#fff", "borderRadius": "20px", "padding": "20px", "display": "flex", "alignItems": "center", "gap": "14px", "border": "2px solid transparent", "transition": "all .25s", "boxShadow": "0 2px 12px rgba(0,0,0,0.06)"}} className="pro-row-card">
          <div style={{"width": "52px", "height": "52px", "borderRadius": "50%", "background": "var(--orange)", "overflow": "hidden", "flexShrink": "0"}}><img src={pro20} style={{"width": "100%", "height": "100%", "objectFit": "cover"}} loading="lazy"/></div>
          <div style={{"flex": "1"}}>
            <div style={{"fontWeight": "800", "fontSize": "15px", "color": "#222"}}>Carlos Méndez</div>
            <div style={{"fontSize": "13px", "color": "#888", "marginTop": "2px"}}>Electricista · Santo Domingo</div>
            <div style={{"color": "#FFB800", "fontSize": "12px", "marginTop": "4px"}}>★★★★★ <span style={{"color": "#888"}}>4.9 · 127 trabajos</span></div>
          </div>
          <div style={{"background": "var(--orange-pale)", "color": "var(--orange)", "fontSize": "11px", "fontWeight": "800", "padding": "6px 12px", "borderRadius": "50px", "whiteSpace": "nowrap"}}>Disponible</div>
        </a>

        <a onClick={() => navigate('login')} style={{cursor: "pointer", "textDecoration": "none", "background": "#fff", "borderRadius": "20px", "padding": "20px", "display": "flex", "alignItems": "center", "gap": "14px", "border": "2px solid transparent", "transition": "all .25s", "boxShadow": "0 2px 12px rgba(0,0,0,0.06)"}} className="pro-row-card">
          <div style={{"width": "52px", "height": "52px", "borderRadius": "50%", "background": "var(--orange)", "overflow": "hidden", "flexShrink": "0"}}><img src={pro21} style={{"width": "100%", "height": "100%", "objectFit": "cover"}} loading="lazy"/></div>
          <div style={{"flex": "1"}}>
            <div style={{"fontWeight": "800", "fontSize": "15px", "color": "#222"}}>Ana Rodríguez</div>
            <div style={{"fontSize": "13px", "color": "#888", "marginTop": "2px"}}>Plomera · Santiago</div>
            <div style={{"color": "#FFB800", "fontSize": "12px", "marginTop": "4px"}}>★★★★★ <span style={{"color": "#888"}}>5.0 · 89 trabajos</span></div>
          </div>
          <div style={{"background": "var(--orange-pale)", "color": "var(--orange)", "fontSize": "11px", "fontWeight": "800", "padding": "6px 12px", "borderRadius": "50px", "whiteSpace": "nowrap"}}>Disponible</div>
        </a>

        <a onClick={() => navigate('login')} style={{cursor: "pointer", "textDecoration": "none", "background": "#fff", "borderRadius": "20px", "padding": "20px", "display": "flex", "alignItems": "center", "gap": "14px", "border": "2px solid transparent", "transition": "all .25s", "boxShadow": "0 2px 12px rgba(0,0,0,0.06)"}} className="pro-row-card">
          <div style={{"width": "52px", "height": "52px", "borderRadius": "50%", "background": "var(--orange)", "overflow": "hidden", "flexShrink": "0"}}><img src={pro22} style={{"width": "100%", "height": "100%", "objectFit": "cover"}} loading="lazy"/></div>
          <div style={{"flex": "1"}}>
            <div style={{"fontWeight": "800", "fontSize": "15px", "color": "#222"}}>José Fernández</div>
            <div style={{"fontSize": "13px", "color": "#888", "marginTop": "2px"}}>Mecánico · La Romana</div>
            <div style={{"color": "#FFB800", "fontSize": "12px", "marginTop": "4px"}}>★★★★☆ <span style={{"color": "#888"}}>4.7 · 203 trabajos</span></div>
          </div>
          <div style={{"background": "var(--orange-pale)", "color": "var(--orange)", "fontSize": "11px", "fontWeight": "800", "padding": "6px 12px", "borderRadius": "50px", "whiteSpace": "nowrap"}}>Disponible</div>
        </a>

        <a onClick={() => navigate('login')} style={{cursor: "pointer", "textDecoration": "none", "background": "#fff", "borderRadius": "20px", "padding": "20px", "display": "flex", "alignItems": "center", "gap": "14px", "border": "2px solid transparent", "transition": "all .25s", "boxShadow": "0 2px 12px rgba(0,0,0,0.06)"}} className="pro-row-card">
          <div style={{"width": "52px", "height": "52px", "borderRadius": "50%", "background": "var(--orange)", "overflow": "hidden", "flexShrink": "0"}}><img src={pro23} style={{"width": "100%", "height": "100%", "objectFit": "cover"}} loading="lazy"/></div>
          <div style={{"flex": "1"}}>
            <div style={{"fontWeight": "800", "fontSize": "15px", "color": "#222"}}>María Concepción</div>
            <div style={{"fontSize": "13px", "color": "#888", "marginTop": "2px"}}>Limpieza · Santo Domingo</div>
            <div style={{"color": "#FFB800", "fontSize": "12px", "marginTop": "4px"}}>★★★★★ <span style={{"color": "#888"}}>4.8 · 156 trabajos</span></div>
          </div>
          <div style={{"background": "var(--orange-pale)", "color": "var(--orange)", "fontSize": "11px", "fontWeight": "800", "padding": "6px 12px", "borderRadius": "50px", "whiteSpace": "nowrap"}}>Disponible</div>
        </a>

        <a onClick={() => navigate('login')} style={{cursor: "pointer", "textDecoration": "none", "background": "#fff", "borderRadius": "20px", "padding": "20px", "display": "flex", "alignItems": "center", "gap": "14px", "border": "2px solid transparent", "transition": "all .25s", "boxShadow": "0 2px 12px rgba(0,0,0,0.06)"}} className="pro-row-card">
          <div style={{"width": "52px", "height": "52px", "borderRadius": "50%", "background": "var(--orange)", "overflow": "hidden", "flexShrink": "0"}}><img src={pro24} style={{"width": "100%", "height": "100%", "objectFit": "cover"}} loading="lazy"/></div>
          <div style={{"flex": "1"}}>
            <div style={{"fontWeight": "800", "fontSize": "15px", "color": "#222"}}>Rafael Guzmán</div>
            <div style={{"fontSize": "13px", "color": "#888", "marginTop": "2px"}}>Pintor · Santiago</div>
            <div style={{"color": "#FFB800", "fontSize": "12px", "marginTop": "4px"}}>★★★★★ <span style={{"color": "#888"}}>4.9 · 74 trabajos</span></div>
          </div>
          <div style={{"background": "#E8F5E9", "color": "#2E7D32", "fontSize": "11px", "fontWeight": "800", "padding": "6px 12px", "borderRadius": "50px", "whiteSpace": "nowrap"}}>En servicio</div>
        </a>

        <a onClick={() => navigate('login')} style={{cursor: "pointer", "textDecoration": "none", "background": "#fff", "borderRadius": "20px", "padding": "20px", "display": "flex", "alignItems": "center", "gap": "14px", "border": "2px solid transparent", "transition": "all .25s", "boxShadow": "0 2px 12px rgba(0,0,0,0.06)"}} className="pro-row-card">
          <div style={{"width": "52px", "height": "52px", "borderRadius": "50%", "background": "var(--orange)", "overflow": "hidden", "flexShrink": "0"}}><img src={pro25} style={{"width": "100%", "height": "100%", "objectFit": "cover"}} loading="lazy"/></div>
          <div style={{"flex": "1"}}>
            <div style={{"fontWeight": "800", "fontSize": "15px", "color": "#222"}}>Pedro Santos</div>
            <div style={{"fontSize": "13px", "color": "#888", "marginTop": "2px"}}>Jardinero · San Cristóbal</div>
            <div style={{"color": "#FFB800", "fontSize": "12px", "marginTop": "4px"}}>★★★★☆ <span style={{"color": "#888"}}>4.6 · 98 trabajos</span></div>
          </div>
          <div style={{"background": "var(--orange-pale)", "color": "var(--orange)", "fontSize": "11px", "fontWeight": "800", "padding": "6px 12px", "borderRadius": "50px", "whiteSpace": "nowrap"}}>Disponible</div>
        </a>

      </div>
    </div>
  </div>
</section>
{/*  styles extracted  */}


{/*  BANNER DE CONFIANZA  */}
<div className="trust-banner sr">
  <div className="trust-inner">
    <div className="trust-item">
      <span className="trust-num">500+</span>
      <span className="trust-label">Profesionales</span>
    </div>
    <div className="trust-div"></div>
    <div className="trust-item">
      <span className="trust-num">4.9★</span>
      <span className="trust-label">Calificación</span>
    </div>
    <div className="trust-div"></div>
    <div className="trust-item">
      <span className="trust-num">15min</span>
      <span className="trust-label">Respuesta</span>
    </div>
    <div className="trust-div"></div>
    <div className="trust-item">
      <span className="trust-num">10+</span>
      <span className="trust-label">Categorías</span>
    </div>
  </div>
</div>

{/*  VERIFICACIÓN DE PROFESIONALES  */}
<section style={{"background": "#fff", "padding": "100px 5%"}} id="verificacion">
  <div className="section-inner">
    <div className="chip sr" style={{"margin": "0 auto 16px", "display": "table"}}>🛡️ Seguridad y confianza</div>
    <h2 className="section-title sr sr-delay-1" style={{"textAlign": "center"}}>¿Cómo <span>verificamos</span><br/>a nuestros profesionales?</h2>
    <p className="section-sub sr sr-delay-2" style={{"margin": "0 auto 56px", "textAlign": "center", "maxWidth": "560px"}}>Antes de que un profesional pueda aparecer en Listo, debe pasar por nuestro proceso de verificación de 4 pasos.</p>

    <div style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit,minmax(240px,1fr))", "gap": "16px", "marginBottom": "18px"}}>

      {/*  Paso 1  */}
      <div className="sr sr-delay-1" style={{"background": "var(--orange-pale)", "borderRadius": "24px", "padding": "20px 28px", "border": "2px solid transparent", "transition": "all .25s", "position": "relative", "overflow": "hidden"}}>
        <div style={{"width": "52px", "height": "52px", "background": "var(--orange)", "borderRadius": "16px", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontSize": "24px", "marginBottom": "12px"}}>🪪</div>
        <div style={{"position": "absolute", "top": "20px", "right": "24px", "fontFamily": "'Fredoka One',cursive", "fontSize": "52px", "color": "rgba(242,96,0,0.1)", "lineHeight": "1"}}>01</div>
        <h3 style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "20px", "color": "#222", "marginBottom": "10px"}}>Verificación de identidad</h3>
        <p style={{"fontSize": "14px", "color": "var(--gray)", "lineHeight": "1.7"}}>Cédula de identidad o pasaporte verificado con RD Identidad y cruzado con el Registro Civil.</p>
      </div>

      {/*  Paso 2  */}
      <div className="sr sr-delay-2" style={{"background": "var(--orange-pale)", "borderRadius": "24px", "padding": "20px 28px", "border": "2px solid transparent", "transition": "all .25s", "position": "relative", "overflow": "hidden"}}>
        <div style={{"width": "52px", "height": "52px", "background": "var(--orange)", "borderRadius": "16px", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontSize": "24px", "marginBottom": "12px"}}>📋</div>
        <div style={{"position": "absolute", "top": "20px", "right": "24px", "fontFamily": "'Fredoka One',cursive", "fontSize": "52px", "color": "rgba(242,96,0,0.1)", "lineHeight": "1"}}>02</div>
        <h3 style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "20px", "color": "#222", "marginBottom": "10px"}}>Antecedentes penales</h3>
        <p style={{"fontSize": "14px", "color": "var(--gray)", "lineHeight": "1.7"}}>Verificamos el récord policial actualizado ante la Policía Nacional Dominicana antes de activar el perfil.</p>
      </div>

      {/*  Paso 3  */}
      <div className="sr sr-delay-3" style={{"background": "var(--orange-pale)", "borderRadius": "24px", "padding": "20px 28px", "border": "2px solid transparent", "transition": "all .25s", "position": "relative", "overflow": "hidden"}}>
        <div style={{"width": "52px", "height": "52px", "background": "var(--orange)", "borderRadius": "16px", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontSize": "24px", "marginBottom": "12px"}}>🔧</div>
        <div style={{"position": "absolute", "top": "20px", "right": "24px", "fontFamily": "'Fredoka One',cursive", "fontSize": "52px", "color": "rgba(242,96,0,0.1)", "lineHeight": "1"}}>03</div>
        <h3 style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "20px", "color": "#222", "marginBottom": "10px"}}>Prueba de habilidades</h3>
        <p style={{"fontSize": "14px", "color": "var(--gray)", "lineHeight": "1.7"}}>Evaluamos los conocimientos técnicos del profesional con pruebas prácticas por especialidad.</p>
      </div>

      {/*  Paso 4  */}
      <div className="sr sr-delay-4" style={{"background": "var(--orange-pale)", "borderRadius": "24px", "padding": "20px 28px", "border": "2px solid transparent", "transition": "all .25s", "position": "relative", "overflow": "hidden"}}>
        <div style={{"width": "52px", "height": "52px", "background": "var(--orange)", "borderRadius": "16px", "display": "flex", "alignItems": "center", "justifyContent": "center", "fontSize": "24px", "marginBottom": "12px"}}>⭐</div>
        <div style={{"position": "absolute", "top": "20px", "right": "24px", "fontFamily": "'Fredoka One',cursive", "fontSize": "52px", "color": "rgba(242,96,0,0.1)", "lineHeight": "1"}}>04</div>
        <h3 style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "20px", "color": "#222", "marginBottom": "10px"}}>Sistema de reputación</h3>
        <p style={{"fontSize": "14px", "color": "var(--gray)", "lineHeight": "1.7"}}>Cada servicio genera una reseña. Los profesionales con calificación baja son suspendidos automáticamente.</p>
      </div>

    </div>



  </div>
</section>




{/*  COBERTURA  */}
<section style={{"background": "linear-gradient(135deg,#FFF3EC 0%,#FFE8D6 100%)", "padding": "40px 5%"}}>
  <div className="section-inner">

    <div style={{"textAlign": "center", "marginBottom": "28px"}}>
      <div style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "background": "#F26000", "color": "#fff", "padding": "6px 18px", "borderRadius": "50px", "fontSize": "11px", "fontWeight": "800", "letterSpacing": "1.5px", "textTransform": "uppercase", "marginBottom": "14px"}}>
        📍 Cobertura
      </div>
      <h2 style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "clamp(24px,4vw,42px)", "color": "#F26000", "lineHeight": "1.1", "marginBottom": "8px"}}>
        Estamos en toda <span style={{"color": "#C24D00"}}>República Dominicana</span>
      </h2>
      <p style={{"fontSize": "15px", "color": "#6B7280", "maxWidth": "460px", "margin": "0 auto"}}>
        Profesionales verificados en las principales ciudades del país.
      </p>
    </div>

    {/*  SVG MAP  */}
    <div style={{"position": "relative", "maxWidth": "780px", "margin": "0 auto 24px", "borderRadius": "20px", "overflow": "hidden", "boxShadow": "0 16px 50px rgba(242,96,0,0.25)"}}>
      <svg viewBox="0 0 792.71484 556.42358" xmlns="http://www.w3.org/2000/svg"
           style={{"width": "100%", "display": "block", "background": "linear-gradient(160deg,#F26000 0%,#FF7B2E 50%,#C24D00 100%)"}}>
        <defs>
          <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.25)"/>
          </filter>
          <filter id="mapglow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/*  Province paths filled  */}
        <path
     d="m 435.60609,341.41093 0.17,-2.24 2.37,-2.49 -0.13,-5.53 -1.32,-1.8 -5.01,-3.59 -1.32,-2.35 2.77,-1.52 0,-2.49 1.19,-2.76 1.72,-1.24 2.37,0.97 1.19,1.8 0.66,2.9 2.24,1.11 2.37,3.18 3.3,-1.38 7.65,-1.52 3.17,2.07 0,1.8 -1.85,3.46 0.3,2.37 0,0 -1.79,-0.25 -2.21,1.63 -4.24,1.57 -2.21,3.01 -2.45,1.25 -6.75,2.07 -2.19,0 z"
     title="Distrito Nacional"
     id="DO-01"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 250.54609,362.88093 0.18,0.38 -2.75,0.56 -2.45,3.69 0.06,-1.63 2.03,-2.44 2.93,-0.56 z m -10.75,-148.53 3.08,-1.13 1.16,-1.53 1.92,-0.76 1.54,0.78 3.46,4.24 -1.54,3.06 0.38,3.46 1.54,0.77 2.31,3.08 0,1.92 -1.54,-0.01 -1.15,1.15 0.38,9.59 3.46,4.24 -0.39,3.13 1.27,2.1 4.05,1.92 2.35,2.47 5.79,8.47 4.23,-0.36 1.47,1.09 4.3,0.53 4.83,4.11 1.31,3.98 0,6.58 -0.78,4.93 -2.71,2.18 0.42,0.42 0,0 2.31,1.16 3.08,2.7 2.31,3.84 0.38,6.51 -2.69,4.2 0.77,1.54 1.92,1.93 6.92,4.25 0.77,1.15 0,2.3 2.31,2.69 0.38,1.53 1.15,0.39 2.31,-1.14 1.54,0.01 1.15,2.69 5,1.18 1.15,1.16 1.15,-0.38 3.08,4.23 5.38,0.8 1.15,1.15 0,0.77 -1.15,0.76 0,2.3 1.92,1.16 0,2.3 1.92,3.07 -0.39,2.68 3.7,2.55 0,0 1.68,2.83 0,3.06 -4.24,5.71 -0.39,5.73 1.15,3.45 0,1.91 -2.31,5.34 -2.31,1.13 -3.85,-0.02 -2.69,1.51 -8.46,0.34 -1.11,1.05 0,0 -1.85,-1.44 0,-1.75 2.51,-5.51 1.79,-0.44 0.3,-2.63 -1.02,-4.13 0.24,-1.88 1.14,-1.94 -0.24,-2.82 -1.49,-1.88 -0.9,-6.2 -1.49,-1.56 -2.81,-1.31 -3.23,-0.63 -1.73,0.06 -3.76,-1.31 -2.93,0.19 -3.29,-1.13 -3.76,0.56 -1.38,3.07 -3.35,1.44 0.12,1.88 0.3,1.25 1.2,2.82 -1.79,3.13 -1.43,1.5 -1.19,0.31 -0.66,1.44 -3.76,1.94 -3.59,-0.63 -7.23,0.88 -0.18,-1.69 -1.97,-0.44 -1.79,1.06 0.36,1.88 -1.79,0.56 -2.15,2.07 -0.48,-0.44 0.72,-0.69 -1.49,-0.12 1.43,-1.75 -0.83,-0.19 -0.18,-0.75 -1.97,-0.19 -0.96,0.94 0.42,0.5 -1.67,0.13 -1.25,1.06 -1.79,2.69 -0.6,2.5 0.42,0.63 -1.91,1.75 -0.9,2 -7.35,7.01 -1.73,0.25 -1.85,1.69 -2.93,0.06 -2.57,1.44 -1.67,-0.56 -0.78,-1.66 0,0 1.18,0.04 1.16,-1.9 0,-2.29 1.16,-1.14 0.77,-3.44 -0.77,-3.44 -2.31,-2.31 -1.92,-3.83 1.15,-1.52 1.54,-0.76 0,-1.91 -1.15,-1.54 -1.92,-0.39 -2.31,1.14 -0.39,1.15 -1.54,1.14 -4.62,-1.56 -0.38,-1.91 -1.54,-1.92 -2.31,-0.4 -1.15,0.76 -0.77,-3.06 -1.92,-3.07 0,-0.76 5.39,-1.12 1.15,-0.76 1.16,-4.58 0.77,-0.76 0,-3.44 1.54,-0.75 2.31,0.01 1.54,-1.9 -0.38,-2.68 -0.77,-1.15 -5.77,-3.48 -1.92,-3.07 -1.15,-3.83 0,0 2.31,0.78 1.54,2.31 0.38,2.3 0.77,0.01 1.15,-1.52 3.85,-0.74 1.15,-1.14 -4.23,-4.23 -7.69,-2.72 -3.46,-0.4 -2.69,-1.93 -4.23,-0.79 -2.69,-1.93 -5.77,-1.56 -1.54,-1.15 -1.54,-2.69 -3.46,-2.32 -1.15,-2.56 0,0 5.49,-0.18 5.22,-5.41 2.26,0 2.55,-6.33 3.84,-0.1 2.19,-2.17 1.92,-0.37 -0.38,-2.68 -2.31,-2.31 0,-1.92 1.15,-1.14 1.54,0.01 0.77,-0.76 -0.38,-1.92 -1.15,-0.39 0,-1.53 -0.77,-0.77 -0.38,-6.13 1.15,-1.91 2.31,-1.52 2.69,0.02 1.54,1.16 0.77,3.07 1.92,3.84 1.54,0.01 0.77,-2.3 2.31,-2.29 0.77,-2.68 2.7,-4.58 0,-2.68 -2.69,-5.38 -1.54,-5.76 0.77,-1.15 1.54,-0.37 2.31,-4.59 0.38,-2.3 -0.77,-0.77 0,-1.15 3.08,-1.52 1.16,0.01 1.54,-2.68 5.39,-1.12 1.54,-2.29 -1.92,-4.61 6.54,-1.11 1.16,-1.53 0,-1.54 -0.77,-0.77 0.31,-1.65 z"
     title="Azua"
     id="DO-02"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 101.28609,290.65093 1.54,0.77 1.15,1.54 3.08,1.55 4.23,1.17 2.69,0.02 2.31,-1.14 2.69,0.4 5.77,3.1 1.16,2.3 1.53,0.01 1.54,-1.52 2.69,0.78 0.39,2.3 7.69,1.57 4.23,-3.04 1.93,0.01 1.15,-1.9 1.54,-1.14 2.69,0.01 3.08,1.17 7.31,0.04 8.85,-3.78 5,-1.12 5,1.56 0.77,0.77 0.38,2.43 0,0 1.15,2.55 3.47,2.32 1.53,2.69 1.54,1.16 5.77,1.56 2.69,1.93 4.24,0.79 2.69,1.93 3.46,0.4 7.69,2.73 4.23,4.23 -1.15,1.14 -3.85,0.75 -1.16,1.52 -0.77,0 -0.38,-2.3 -1.54,-2.31 -2.3,-0.78 0,0 -1.16,0.76 -0.38,1.53 1.92,1.93 0,1.53 -5.39,-0.42 0,1.15 1.54,0.78 0,2.68 -0.77,1.52 -1.92,-0.01 -0.77,0.76 -1.54,-0.39 -1.16,0.76 -0.77,1.14 0,2.68 -2.69,0.75 -1.92,-1.54 -1.16,0.76 -1.54,2.67 -1.15,-0.01 -1.16,1.14 -4.23,-0.4 0,0 -0.38,1.52 0,0 1.15,0.78 1.93,0.01 0.77,0.77 -0.39,1.52 -1.54,1.14 -2.31,-0.39 -0.77,1.52 -3.46,0.75 -4.23,1.89 -0.77,1.91 -2.31,1.9 0,1.91 0,0 0,1.15 0,0 -0.39,3.05 1.92,1.16 -0.77,1.91 0,0 -3.84,-0.02 -3.46,1.12 -1.93,-0.39 -3.07,-3.46 -0.39,-3.44 -1.92,-1.92 0.39,-1.92 -0.77,-1.91 -3.46,-2.32 -2.31,-3.83 -0.77,-0.39 -4.23,-0.03 -1.16,1.53 -8.46,4.16 -3.08,2.66 -1.92,-0.01 -7.31,-6.16 -2.31,-0.78 -0.76,-1.54 -6.16,-3.09 -4.61,-0.41 -4.23,-1.17 -24.229996,-12 -1.93,-3.07 -0.76,-8.05 0.77,-3.05 5,-10.31 0,-6.51 1.54,-0.76 6.93,-0.73 5,-1.5 z"
     title="Baoruco"
     id="DO-03"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 208.98609,318.82093 1.15,3.83 1.92,3.07 5.77,3.48 0.77,1.15 0.38,2.68 -1.54,1.9 -2.31,-0.01 -1.54,0.76 0,3.44 -0.77,0.76 -1.15,4.59 -1.15,0.76 -5.39,1.12 0,0.77 1.92,3.07 0.77,3.06 1.15,-0.76 2.31,0.4 1.54,1.92 0.38,1.91 4.62,1.56 1.54,-1.14 0.39,-1.14 2.31,-1.13 1.92,0.39 1.15,1.54 0,1.91 -1.54,0.76 -1.15,1.52 1.92,3.83 2.31,2.31 0.77,3.45 -0.77,3.44 -1.16,1.14 0,2.29 -1.16,1.9 -1.17,-0.04 0,0 -1.79,-1.47 0.06,-1.5 -1.26,-3.38 -2.27,-1.06 -1.13,-2.06 -5.38,-2.5 -2.39,0.69 -0.3,-1.19 -2.33,-1.06 -1.97,-0.06 -1.31,-1.44 -1.19,0.19 -1.91,0.69 -0.48,0.81 0.36,0.75 2.39,-1.38 0.72,0.13 0.24,0.81 -4.9,3.5 -3.88,4.32 -1.49,3.75 0,2.19 0.84,2.44 1.44,0.75 0.3,1.63 1.85,1.31 1.14,2.06 -1.91,2.06 2.75,3.75 1.38,0.63 1.32,4.75 2.51,2.75 -1.85,2.63 -0.24,3.88 -1.13,1.75 -0.42,2.31 -4.96,9.12 -0.84,0.75 -1.43,0.13 -2.45,3.12 0.12,1.94 -4.6,3.19 0.06,4.37 -1.49,0.19 -1.55,2.56 -1.2,0.31 -1.49,1.56 -2.87,5.62 -6.04,9.05 -1.49,0.75 -2.33,3.87 -2.99,1.62 -0.48,1.06 -4.42,3.37 -1.97,2.62 -1.43,3.56 -0.66,0.13 -0.58,-1.94 0,0 -0.31,-2.53 1.15,-1.52 -0.77,-4.96 -1.45,-1.06 -0.25,-3.25 -5.09,-6.38 -2.8,0 -1.27,4.25 -3.56,1.06 -4.04,-5.03 -2.31,-1.54 -1.79,0.3 0,-1.44 -1.02,-1.86 -2.54,-1.86 -4.58,0 -1.53,-1.86 -0.51,-1.59 0.76,-2.39 0,-4.78 0.51,-1.06 2.54,1.33 2.8,-0.8 4.07,-5.32 0.51,-2.39 -0.51,-4.52 -3.56,-5.85 4.58,-0.27 1.52,-1.86 -0.25,-1.06 -1.78,-1.6 -4.07,-2.66 -4.63,-0.51 0,0 0.64,-1.89 0,-4.97 1.92,-2.66 3.08,-0.75 3.08,1.55 3.46,-0.36 2.31,0.78 0.77,-0.76 -3.07,-10.33 -5.77,-11.11 0,-1.53 5.77,-7.61 6.15,4.62 8.85,1.96 5,0.03 9.23,-2.62 1.92,-1.9 1.54,-3.43 1.92,-1.52 0.77,-3.05 0,0 0.77,-1.91 -1.92,-1.16 0.39,-3.06 0,0 0,-1.15 0,0 0,-1.91 2.31,-1.9 0.77,-1.91 4.23,-1.89 3.46,-0.74 0.77,-1.53 2.31,0.4 1.54,-1.14 0.39,-1.53 -0.77,-0.77 -1.92,-0.01 -1.15,-0.77 0,0 0.39,-1.53 0,0 4.23,0.41 1.15,-1.14 1.15,0.01 1.54,-2.67 1.15,-0.76 1.92,1.54 2.69,-0.75 0,-2.68 0.77,-1.14 1.16,-0.76 1.54,0.39 0.77,-0.76 1.92,0.01 0.77,-1.53 0,-2.68 -1.54,-0.77 0,-1.15 5.39,0.41 0,-1.53 -1.92,-1.92 0.39,-1.53 1.09,-0.8 z"
     title="Barahona"
     id="DO-04"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 58.306094,65.27093 1.91,2.3 2.3,0.4 0.77,1.16 3.85,-0.36 12.31,5.07 7.69,0.05 5.4,-1.12 5.37,0.41 1.54,-1.53 2.309996,-0.76 5.38,0.41 1.16,3.09 -0.39,1.54 1.15,1.55 2.7,0.79 1.15,1.54 1.92,1.17 3.46,1.17 2.69,3.49 3.08,0.78 3.46,1.95 0,0 0,1.54 -5.77,6.13 -2.31,4.61 0,6.93 1.15,3.85 0,3.47 -1.16,1.92 -2.69,1.13 -0.38,0.77 0.76,5.4 -0.77,4.99 0.38,6.16 -5.77,1.12 -5.38,-1.18 0.77,3.85 4.23,3.1 0.77,1.92 0,0 -0.39,1.16 -2.69,1.52 -2.7,4.21 -2.69,-0.4 -1.15,-1.54 -2.689996,-0.78 -3.08,0.75 -4.23,-2.33 -1.93,1.91 -0.77,5.76 -0.77,0.77 -2.69,-0.79 -2.69,1.91 -2.31,3.06 -0.82,-0.27 -2.27,-0.46 -3.37,0.27 -0.43,-1.05 -2.28,-0.44 -1.18,-0.61 -1.6,0 -1.61,-1.32 -2.28,-1.84 0.42,-1.06 -0.42,-0.7 -3.47,-1.67 0.42,-0.79 -0.59,-1.5 -0.59,0.18 -0.84,3.44 -1.43,-1.5 -0.35,-1.93 -1.85,0.62 -0.17,-1.06 -1.27,-0.17 0.42,-2.12 -1.6,-0.44 0,-1.05 0.42,-1.68 -0.85,-0.88 -1.44,-3.17 -1.01,0.27 -1.19,-2.11 -1.43,-0.44 3.03,-1.68 4.22,-0.27 1.01,-3.35 2.7,-1.06 2.19,-1.68 1.43,0.79 0.76,-2.12 2.45,1.76 0.42,1.05 1.44,0 0.59,-0.7 -0.43,-1.41 0,-1.33 -1.02,-4.84 1.85,-2.56 0.17,-3.35 2.02,-2.56 -0.43,-1.23 0.68,-1.06 -0.26,-1.77 -1.44,-1.23 -0.59,-3.61 -1.17,-1.04 0.57,-1.08 -0.59,-1.67 0.76,-0.62 0.67,-2.38 -0.26,-2.47 -0.76,0.79 -1.68,-0.61 -0.77,-2.29 0.16,-2.38 -1.43,0.62 -0.76,-0.62 -0.01,-3.97 -1.43,-2.38 -5.24,-5.02 -0.44,-11.29 z"
     title="Dajabón"
     id="DO-05"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 385.24609,99.07093 1.92,2.32 3.46,0.79 1.16,1.16 1.53,0.01 1.16,0.78 0,1.15 0.77,0.78 2.69,-0.37 1.92,1.16 3.08,10.03 -1.16,7.69 1.54,1.16 1.15,4.24 4.23,8.49 1.54,0.77 6.92,-0.34 5.77,1.18 1.54,1.17 -0.77,4.22 0.38,2.7 2.31,2.32 10,1.98 8.08,3.5 13.07,3.54 1.54,0.78 1.54,1.93 5,3.1 6.15,1.57 5.77,0.03 0,0 2.31,-4.21 1.54,-0.76 3.85,0.02 2.69,1.55 4.23,0.41 3.46,-0.75 1.93,2.32 4.61,-0.74 1.93,0.78 -0.39,1.53 -1.54,-0.01 -1.92,2.3 -1.16,4.6 -1.54,-0.01 -0.38,1.54 -1.54,-0.01 -0.77,-0.77 -0.77,1.53 -1.92,0.37 0.77,1.54 -0.77,0.77 -3.47,2.28 -2.3,-0.01 0,2.31 2.3,2.7 1.54,4.62 -5,-0.03 -1.16,1.14 0,0 -2.69,-1.16 -3.85,-0.41 -1.15,0 -3.46,1.9 -6.54,-0.81 -4.23,1.9 -4.62,-1.57 0,10.37 -1.54,1.15 -7.31,-0.43 0,0 0.77,-6.14 2.31,-5.36 -0.38,-0.77 -2.7,-1.17 -3.84,-0.41 -2.69,-2.32 -4.62,-2.33 -1.92,-0.01 -2.7,2.68 -1.15,-0.01 -2.69,-1.94 -8.85,-2.35 -2.69,-2.32 -0.77,-0.01 -0.38,-1.15 -2.7,-0.02 -1.15,-2.31 -1.15,1.15 -2.7,0.75 -1.15,-0.77 0,-0.77 -2.69,-0.4 -0.77,1.53 -1.16,-0.39 -0.38,1.54 -1.16,-0.4 0.39,-2.3 -0.39,-0.77 -1.15,1.15 -1.15,-0.39 -1.93,3.44 0,-2.69 -0.77,0.77 -0.77,-0.77 -1.15,0.76 -1.54,-0.01 0.77,-2.69 -1.54,-0.39 -1.54,0.76 -2.69,3.06 -1.15,-1.54 -0.77,0.76 -0.39,1.92 -3.84,-1.18 -1.16,-1.92 -2.3,0.75 -0.77,-1.92 -0.77,0.76 -0.77,-0.77 -1.54,0.76 -1.54,-0.78 -1.54,0.38 -1.15,0.76 0,0.77 0.77,-0.38 -0.01,1.15 0,0 -1.53,-0.01 -1.54,-3.08 -3.08,-2.33 -2.69,-0.78 -3.84,-4.63 -1.93,-1.16 -2.3,-3.09 -0.77,-2.7 0,0 -0.77,-3.08 -1.15,-1.54 0,-3.08 1.15,-2.68 2.31,-1.53 1.54,-2.3 0,-3.84 1.93,-4.22 -0.39,-2.7 2.31,-6.52 1.16,-6.92 6.16,-4.59 1.54,-0.76 1.92,0.01 2.31,-2.29 4.62,-1.52 0,-1.15 -3.08,-1.17 -0.77,-1.93 1.15,-2.31 3.85,-1.9 1.54,0.01 1.54,-1.15 0.39,-3.07 -0.77,-1.55 -1.16,-0.39 0,0 z"
     title="Duarte"
     id="DO-06"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 616.04609,201.84093 1.79,0.57 4,6.72 3.47,0.19 0.78,2.64 2.03,1 0.6,-0.38 2.03,2.2 1.14,-0.25 1.2,0.75 4.48,-0.75 3.65,0.56 2.99,-0.69 1.56,-1.26 0.36,-1.44 -2.51,-2.51 0.06,-0.82 2.27,-1 1.49,1.19 2.33,0.06 1.26,-0.69 0.48,-1.07 -0.36,-0.75 2.15,-1.44 3.29,1.19 1.25,-1.26 1.38,0 2.75,1.01 2.81,0.19 11.24,7.85 1.73,-0.06 1.2,-1.07 3.17,0.32 4.78,3.27 1.67,-0.44 2.86,0.82 0,0 0,3.87 -1.92,-0.78 0.38,2.69 -0.77,0.76 -1.92,-0.78 -1.15,2.3 -3.08,0.37 -0.77,1.53 0.38,4.61 -1.54,0.38 -2.69,2.29 0,1.15 1.92,3.08 5.38,12.3 0.38,7.29 -0.77,2.68 -2.69,1.52 -3.08,4.2 -3.85,2.28 -3.46,6.5 -1.92,0.37 -3.46,-1.17 -5.38,0.35 -0.77,0.76 -0.77,2.68 0.38,3.45 -1.54,1.52 0.39,1.92 1.54,1.54 0,1.15 0,0 -3.85,-0.02 -2.69,-1.55 -0.77,0.38 -2.69,5.73 -1.54,1.91 -2.69,6.88 -3.46,4.58 -6.54,4.94 -0.77,2.68 -4.23,4.19 -4.62,1.51 0,0 1.16,-9.18 1.92,-0.75 -0.77,-1.53 -6.15,-0.04 -2.31,1.52 -2.31,0.37 -5.77,-3.09 -1.92,-4.61 -6.15,-4.25 -3.46,-1.17 -2.31,1.14 -2.31,-0.01 -1.15,-2.69 -3.07,-1.17 0,0 0.39,-3.83 1.15,0.01 1.15,-1.14 0.77,0 0.77,-1.14 0.77,-3.06 0,-4.6 2.31,-6.88 -0.38,-3.83 1.15,-2.68 0,-2.3 -1.92,-4.23 -6.53,-8.09 -1.92,-1.54 -5.38,-1.56 -1.15,-3.84 -1.92,-0.39 -1.54,-1.16 -2.69,-6.54 -2.31,-2.31 0,-2.3 1.15,-1.91 0.77,-7.67 1.92,-0.37 3.85,1.94 6.54,4.64 1.92,0.4 3.08,1.94 10.77,1.98 1.54,-0.37 1.16,-1.91 -0.38,-2.69 -3.85,-4.24 -4.23,-2.71 -3.08,-5.39 -0.38,-4.22 3.08,-0.75 2.3,-2.35 0,0 1.43,0.62 0,1.19 0.6,0.38 0.84,-0.69 1.91,0.25 1.32,-1.63 0.06,1.19 2.09,0.13 1.49,0.25 0.84,-0.75 1.91,0 0.36,1.19 0.78,0.13 -0.54,1.63 1.79,0.63 1.61,-2.45 -0.24,-5.47 -1.38,-1.82 -2.57,0.63 1.25,-1.19 1.42,-0.36 z"
     title="El Seibo"
     id="DO-08"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 351.47609,49.63093 0,0.89 3.23,3.97 9.68,7.89 3.53,2.02 5.68,1.95 8.9,0.26 2.33,1.26 6.04,1.64 1.37,-0.13 2.39,1.64 1.62,-0.38 3.76,0.51 11.42,-2.35 0,0 0.37,1.53 -0.77,2.31 0,3.85 -0.77,3.08 -1.16,1.15 -5.38,2.28 -3.47,3.06 -2.69,0.37 -2.69,1.53 -1.16,-0.78 -4.61,0.36 -1.54,-0.78 -1.15,0.76 0.76,5.79 -1.92,5.76 0,0 -4.62,-0.41 0,0 -2.69,-2.33 -2.69,-3.86 -0.77,-2.7 1.15,-1.54 -0.38,-1.16 -1.15,-1.16 -2.7,-0.78 -2.3,-0.02 -1.93,1.15 -2.69,0.37 -1.92,2.68 -2.31,0.76 -0.77,0.77 -2.7,8.07 -1.92,0.76 -2.31,-0.78 -1.15,-1.55 -0.39,-4.62 -0.77,-0.78 -4.23,-0.79 -1.92,-1.17 -1.92,-2.71 -0.77,0 -5,11.52 0.38,5.4 -1.93,3.07 0,3.08 0.77,1.92 2.31,2.71 0,2.7 -2.7,5.75 -2.69,11.15 -1.54,3.07 -0.01,1.92 0,0 -1.15,0.37 -0.39,2.31 -0.76,0.76 -5.01,-0.02 -0.76,-1.16 0,-6.92 -3.46,-6.56 -0.77,-0.01 -1.54,1.53 -1.54,2.69 -3.46,0.36 -10.39,-1.21 -1.15,-1.16 -0.39,-1.93 -0.77,-0.39 0,0 0.78,-1.92 1.54,-1.53 1.92,0.01 1.54,1.55 0.77,-0.38 0,-1.15 -1.16,-1.16 -1.15,-3.47 -0.38,-3.85 0,-1.54 2.69,-4.61 -0.38,-5.77 1.16,-1.54 3.07,-0.75 3.85,-3.06 0,-4.62 0,0 1.16,-1.53 1.15,-0.38 0.77,-8.86 3.47,-4.22 0,-1.92 -1.16,-1.93 0,-1.16 1.54,-2.69 0.01,-1.93 -0.77,-0.39 0,-1.15 2.3,-0.76 -0.76,-0.77 0.38,-1.16 1.92,-1.91 1.16,0.77 0.77,-0.38 1.15,1.16 1.16,-1.15 2.69,0.02 0,0.77 0.77,0.39 0.38,-2.7 3.47,0.41 1.54,-1.15 0.76,0.01 1.54,3.09 1.54,0.01 1.16,-1.92 1.53,1.55 0.39,-1.93 0.77,0.01 0.77,1.93 1.53,-0.38 -0.38,-1.16 -1.15,0 0,-1.16 5,-0.74 0.38,-0.77 0,-1.93 -1.53,-3.48 2.31,-5.31 0,0 z"
     title="Espaillat"
     id="DO-09"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 600.99609,207.88093 -2.3,2.35 -3.08,0.75 0.38,4.22 3.08,5.39 4.23,2.71 3.85,4.24 0.38,2.69 -1.15,1.91 -1.54,0.38 -10.77,-1.98 -3.08,-1.94 -1.92,-0.39 -6.54,-4.64 -3.85,-1.94 -1.92,0.37 -0.77,7.67 -1.15,1.91 0,2.3 2.31,2.31 2.69,6.54 1.54,1.16 1.92,0.4 1.15,3.84 5.38,1.56 1.92,1.55 6.54,8.09 1.92,4.23 0,2.3 -1.15,2.68 0.38,3.84 -2.31,6.89 0,4.6 -0.77,3.06 -0.77,1.15 -0.77,0 -1.15,1.14 -1.15,-0.01 -0.39,3.83 0,0 -1.93,2.67 -2.31,1.14 -5,0.36 -0.77,1.53 0,3.06 -1.15,1.53 0,4.21 0.77,1.15 -2.31,-0.01 -0.39,2.3 -3.85,2.28 -3.08,3.05 -1.54,3.44 -4.23,-6.91 -0.38,-2.3 -1.92,-3.46 -0.77,-4.22 -3.46,-2.32 -1.54,-3.46 -0.38,-3.07 -2.31,-2.69 -1.15,-3.07 -2.31,-1.16 -0.38,-1.53 2.7,-3.43 -1.54,-2.31 0,-6.13 -2.31,-4.23 0,-2.3 -1.15,-1.16 -2.31,-0.4 -0.77,-1.92 0.77,-6.13 0.77,-1.15 0,0 1.54,-1.14 0.39,-2.68 1.54,-0.37 3.47,-4.58 4.23,-1.13 1.54,-3.83 3.08,-0.37 1.54,-2.68 0,-2.3 -1.54,-1.16 -2.31,-0.01 -6.15,1.12 -3.85,-2.71 -5.77,-1.95 -4.23,-3.09 -3.85,-1.17 -3.84,-3.09 -2.31,-0.4 -1.92,-1.16 -1.15,-1.92 -1.54,-1.16 -5.38,-2.33 -3.84,-3.48 -2.31,-1.16 -3.85,-0.79 -1.92,-3.08 0,0 2.31,-5.36 2.75,-11.07 0,0 2.45,0.5 5.02,-1.26 0.42,-0.75 1.73,0.19 1.02,-1.07 1.55,1.32 1.55,-0.06 0.42,0.94 2.69,0 4,-1.26 2.03,-0.25 1.44,-0.25 1.85,1.82 -0.06,1.01 5.14,-0.25 0.48,-0.63 1.25,1.13 0.78,1.01 0.72,0.38 2.51,-1.26 0.72,-4.71 -2.21,-0.56 -0.54,1.07 -1.08,-0.88 -0.48,1.13 -1.43,-0.26 -2.63,0.76 -0.06,-0.63 6.1,-1.7 3.17,0.44 4.6,-0.82 2.45,1.19 2.75,2.64 1.37,0.38 -0.42,1.13 0.72,0.75 -0.78,0.82 0.06,1.13 1.31,2.14 5.44,1.32 2.45,2.01 6.87,-1.19 1.61,1.76 0.96,0.06 0.42,1.32 3.53,0.88 3.94,3.39 6.69,-2.64 1.61,0 2.33,2.34 z"
     title="Hato Mayor"
     id="DO-30"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 44.876094,282.67093 8.71,0.05 18.85,3.93 12.31,-0.31 4.23,1.94 10.77,1.59 1.539996,0.78 0,0 0,0 0,0 0,0 0,0 -1.539996,1.14 -5,1.5 -6.93,0.73 -1.54,0.76 0,6.51 -5,10.31 -0.77,3.05 0.76,8.05 1.93,3.07 24.229996,12 4.23,1.17 4.61,0.41 6.16,3.09 0.76,1.54 2.31,0.78 7.31,6.16 1.92,0.01 3.08,-2.66 8.46,-4.16 1.16,-1.53 4.23,0.03 0.77,0.39 2.31,3.83 3.46,2.32 0.77,1.91 -0.39,1.92 1.92,1.92 0.39,3.44 3.07,3.46 1.93,0.39 3.46,-1.12 3.84,0.02 0,0 -0.77,3.05 -1.92,1.52 -1.54,3.43 -1.92,1.9 -9.24,2.63 -5,-0.03 -8.85,-1.96 -6.15,-4.62 -5.77,7.61 0,1.53 5.77,11.11 3.07,10.34 -0.77,0.75 -2.31,-0.77 -3.46,0.36 -3.08,-1.54 -3.07,0.74 -1.93,2.67 0,4.96 -0.64,1.89 0,0 -3.5,-2.41 -4.07,-4.52 -8.14,-7.19 -8.39,-0.79 -4.599996,-1.33 -4.89,-3.03 -5.26,-1.5 -3.82,0 -2.79,-1.59 -2.29,-2.67 -5.46,-3.9 -2.69,-3.46 -2.16,-0.01 -1.39,-1.14 -4.57,-1.61 0,0 6.78,-11.4 -21.7,-8.63 -1.86,-3.15 -5.66,-1.22 -3.05,-6.91 -7.1,-3.84 -6.08,-2.45 -2.03,-6.3 7.25,-1.33 -0.17,-2.89 -16.06,-17.07 -2.6299998,-5.87 -1.77,0 -2.29,-3.15 -3.04,0.44 -1.77000001,-1.66 2.36000001,-1.5 3.29,-1.06 3.45,-4.65 4.6499998,1.92 3.63,2.89 1.44,-0.44 1.76,-2.73 1.86,0 4.48,2.71 0.76,2.1 1.44,-0.17 1,-2.11 3.63,0.43 1.69,1.49 3.63,-1.06 2.62,0.61 1.85,-1.06 -0.68,-5.88 1.43,-1.93 z"
     title="Independencia"
     id="DO-10"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 696.60609,392.53093 1.2,1.19 7.41,2.06 4.42,2.81 4.18,0.13 -0.66,-0.69 0.3,-0.5 3.35,0.56 1.14,2 2.45,0.38 1.44,1.06 4.06,-0.56 1.61,0.69 3.23,-1.13 1.91,0.44 3.35,2.5 2.09,2.69 1.14,2.56 -0.12,2.69 -1.79,1.13 -0.66,-1.19 -1.08,0.25 -0.54,-1 -1.85,0 -4.42,-1.62 -5.68,-1 -2.21,1.31 -1.43,-0.25 -2.81,0.81 -1.49,1.63 -1.61,0.13 -14.52,-5.06 0.54,-0.81 -0.42,-1.19 -3.52,-4.31 -2.63,-1.94 0.36,-3.63 1.38,-1.38 1.88,-0.76 z m -5.14,-176.05 2.33,1.19 1.26,-0.13 3.11,2.64 3.05,0.56 6.99,4.84 0.78,1.13 2.39,1 2.87,3.77 7.59,6.53 0.6,1.57 5.32,5.78 0.36,1.32 2.87,1.57 1.02,2.13 3.41,2.01 8.37,8.79 2.81,1.95 1.08,-0.06 0.66,-1.51 1.5,0.88 -0.24,0.75 0.78,1 6.99,6.21 2.15,1.13 2.21,0.25 2.21,2.89 2.69,2.26 0.06,1.13 1.02,1.38 4.12,2.19 1.61,3.07 2.99,2.51 2.03,1.32 0.84,0 0.96,-1.13 4,3.39 3.65,1.76 4,5.45 -0.78,1.32 1.32,0.82 -0.36,2.76 -1.37,0.13 1.2,1.69 -1.61,4.2 -1.61,1.88 -1.85,3.76 -2.99,3.51 -0.36,2.01 -0.9,0.63 -2.45,4.39 -2.63,0.69 0.06,2.32 -2.03,3.7 0,1.13 -3.35,2.76 -1.25,0.25 -1.49,2.51 -3.11,2.88 -1.07,3.76 -0.3,10.83 -3.11,3.82 -5.32,1.69 -14.7,-4.69 -1.79,-1.56 -1.67,-0.31 -2.39,-1.5 -2.03,-1.81 -3.64,1.75 -0.78,1.31 -0.12,2.13 2.75,3.44 0.3,2.32 -3.05,6.76 -2.51,2.57 -1.2,2.56 -0.95,4.76 -0.96,0.63 0.12,5.82 0.12,0.69 0.12,2.5 -0.54,1.38 -3.88,-1.75 -0.72,0.5 -3.17,-0.06 -2.33,1.31 -3.52,0.06 -2.87,-0.94 -0.84,1.06 -1.19,-0.19 -1.02,1.25 -1.02,0.19 -0.51,-0.31 0.34,-0.89 1.13,0.2 0.78,-2.06 -1.91,-1.38 -1.19,0.06 -0.9,1.13 0.36,1.44 1.25,0.31 -0.2,0.5 -2.66,1.19 0.78,-1.88 -0.84,-4.94 -2.51,-3.19 -3.52,-8.57 -4,-5.44 -2.69,-6.07 -4.84,-3.57 -1.55,-2.88 0.66,-1.31 -0.66,-0.81 -12.66,-5.94 0,0 0.63,-1.98 1.54,-1.9 0.39,-8.03 2.31,-1.14 -0.38,-1.53 1.54,-1.9 0.39,-1.91 1.54,-1.52 3.46,-6.87 -0.77,-0.77 0,-8.04 -5.77,-3.86 -4.23,-6.92 -1.92,-0.78 -0.38,-5.36 -0.77,-1.15 -1.92,-0.39 0,-2.3 -2.31,-1.54 -0.38,-1.92 0,0 0,-1.15 -1.54,-1.54 -0.38,-1.92 1.54,-1.52 -0.38,-3.45 0.77,-2.68 0.77,-0.76 5.38,-0.35 3.46,1.17 1.92,-0.37 3.47,-6.5 3.85,-2.28 3.08,-4.2 2.69,-1.52 0.77,-2.68 -0.38,-7.29 -5.38,-12.3 -1.92,-3.08 0,-1.15 2.7,-2.29 1.54,-0.37 -0.38,-4.61 0.77,-1.53 3.08,-0.37 1.15,-2.3 1.92,0.78 0.77,-0.76 -0.38,-2.69 1.92,0.78 0,-3.87 0,0 -0.04,0 z"
     title="La Altagracia"
     id="DO-11"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 111.34609,144.08093 1.92,0.79 1.92,-0.38 5,2.34 2.69,3.86 0.39,4.61 8.07,6.2 2.31,0.01 4.61,3.49 5,1.56 2.7,1.94 0,0 -0.39,0 0,0 -1.15,1.53 0,0 -1.16,10.37 0.77,2.69 -1.16,1.53 -2.69,1.52 -4.62,-0.02 -3.08,2.67 -1.53,-0.01 -0.39,-1.54 -2.69,-0.01 -3.84,-3.87 -7.31,-1.19 -2.31,0.75 -3.85,5.75 0.38,4.61 -2.69,4.2 -3.08,7.67 -0.39,4.99 -0.77,0.76 -2.31,0.37 -7.309996,-1.96 -1.92,0.37 -2.31,1.91 -8.08,9.93 0,1.15 0.77,0.78 1.54,0.39 -0.39,3.83 -3.46,5.74 -0.39,4.6 0.77,0.01 2.31,-2.29 0.77,0.38 -0.39,8.06 1.15,4.22 -1.54,1.91 -0.76,2.68 -1.16,0.76 3.08,1.94 0,1.53 1.53,1.93 3.08,1.55 1.54,0 0.38,1.16 2.7,1.55 0.38,1.91 -1.16,2.3 -1.15,0.76 -0.38,1.53 0.76,1.54 1.16,0.77 1.53,3.46 2.31,1.16 3.849996,-0.36 1.92,1.16 1.54,3.84 0,1.53 -1.54,5.74 -1.54,1.91 0,0 -1.539996,-0.78 -10.77,-1.59 -4.23,-1.94 -12.31,0.31 -18.85,-3.93 -8.71,-0.05 0,0 -0.35,-0.63 1.43,-1.49 1.77,0.7 0.84,-0.71 0.42,-3.16 9.87,-3.79 3.26,-18.53 0.32,-6.5 -1.18,-1.93 0,-1.67 0.16,-5.89 -0.34,-0.44 -2.28,-0.26 0.25,-1.67 -0.68,-1.22 -4.65,-3.42 -1.6,-0.17 -3.22,-9.31 0.33,-1.41 -2.02,-0.88 -0.76,1.24 -3.89,-1.4 -0.42,-1.32 -2.79,-0.79 -1.26,1.24 -0.76,-1.67 -1.6,1.67 -1.02,0.62 -1.26,1.32 0,-0.7 -1.44,-1.23 0.01,3.6 -1.6,0.18 -1.44,-0.61 -1.01,1.67 -0.59,-0.17 -0.6,-3.78 1.02,0.61 1.18,-0.26 -0.18,-3.17 2.03,-0.79 -0.17,-1.5 1.01,-0.44 0.17,1.49 1.43,-0.17 -0.25,-1.06 1.01,-1.06 -0.17,-1.31 1.6,0.43 0.84,-2.11 1.44,0 0.16,-1.23 0.59,0.35 0.6,2.37 4.72,-1.06 0.17,-1.06 1.44,-0.44 0.59,1.23 -0.42,0.7 1.43,0.79 0.85,-0.18 0.16,-0.88 -1.01,-0.79 0.17,-1.49 1.26,-1.06 0.76,0.44 1.27,-0.71 -1.61,-1.05 2.61,-3.17 0.59,0 0.59,1.32 0.85,-0.27 -0.6,-1.67 3.04,-2.91 2.02,1.06 0.59,-1.77 2.2,-0.35 1.01,-1.32 1.43,-0.62 0,-0.62 -1.01,-0.26 1.01,-1.67 1.43,1.05 1.77,-1.67 -2.36,-0.88 0.16,-1.41 2.02,0 1.02,-0.71 -0.42,-1.84 -1.61,-0.88 0.42,-1.06 1.6,-1.05 2.87,1.49 1.01,-1.5 -0.67,-1.85 1.26,0 1.18,0 1.61,0.78 2.02,-1.23 1.85,-3.79 -1.86,-1.31 3.04,-1.24 -1.61,-1.5 0.85,-0.17 0.17,-0.71 -0.18,-1.05 -0.84,-0.35 0.25,-1.06 2.2,0.35 0.59,-0.62 -3.04,-1.67 0.59,-0.88 1.43,0.44 0.59,-0.79 1.43,0.17 0.43,-1.06 -2.62,-1.49 0.16,-2.11 2.28,-1.06 0.59,0.88 0.59,-0.88 -1.44,-1.06 -1.78,-2.9 0.39,-0.59 2.31,-3.06 2.69,-1.91 2.69,0.79 0.77,-0.77 0.77,-5.76 1.93,-1.91 4.23,2.33 3.08,-0.75 2.689996,0.78 1.15,1.54 2.69,0.4 2.7,-4.21 2.69,-1.52 z"
     title="La Estrelleta"
     id="DO-07"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 644.19609,352.18093 3.17,3.69 0.9,2.82 0.24,0.94 -0.48,1.25 -4.78,-1.56 -2.09,-1.63 0,-0.81 1.02,0.19 0.72,-4.69 1.3,-0.2 z m -17.46,-33.69 4.62,-1.5 4.23,-4.19 0.77,-2.68 6.54,-4.94 3.46,-4.58 2.69,-6.88 1.54,-1.91 2.7,-5.73 0.77,-0.38 2.69,1.55 3.85,0.02 0,0 0.38,1.92 2.31,1.55 0,2.3 1.92,0.39 0.77,1.15 0.38,5.36 1.93,0.78 4.23,6.92 5.77,3.86 0,8.04 0.77,0.77 -3.46,6.87 -1.54,1.52 -0.39,1.91 -1.54,1.91 0.38,1.53 -2.31,1.14 -0.39,8.03 -1.54,1.9 -0.63,1.98 0,0 -2.1,-0.06 -4.24,-0.88 -2.03,-1.13 -1.31,0.81 -0.78,-1.57 -1.61,-0.37 -3.11,1.31 -0.36,1.25 -0.9,0.63 -4.3,-0.31 -3.7,1.44 -9.74,0.88 -4.79,-0.25 0,0 -1.54,-3.96 0.77,-2.67 -1.15,-1.92 0,-1.15 -3.46,-4.99 -1.15,-0.77 -1.54,-3.07 0,-1.91 1.54,-3.05 3.46,-3.43 1.14,-3.44 z"
     title="La Romana"
     id="DO-12"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 299.44609,128.22093 0.77,0.39 0.39,1.93 1.15,1.16 10.39,1.21 3.46,-0.36 1.54,-2.69 1.54,-1.53 0.77,0.01 3.46,6.56 0,6.92 0.76,1.16 5.01,0.02 0.76,-0.76 0.39,-2.31 1.15,-0.37 0,0 0.77,4.62 1.15,2.69 3.08,2.71 2.31,4.25 1.15,4.23 2.69,3.48 6.54,-1.12 4.62,0.41 0,0 0.77,2.7 2.3,3.09 1.93,1.16 3.84,4.63 2.69,0.78 3.08,2.33 1.54,3.08 1.53,0.01 0,0 1.16,0.39 -0.39,1.15 -0.77,0.38 -1.15,-1.16 -0.77,0 -1.15,3.45 -2.31,1.14 -4.62,0.36 -0.38,-0.77 -2.31,-0.02 -3.46,4.59 -1.54,-0.01 -3.08,1.52 -1.54,1.91 -1.54,3.84 0,0 0,-5 -2.69,-1.93 -6.15,-1.96 -3.08,1.91 -0.39,3.45 -3.85,3.05 -3.07,-1.55 -5.78,0.73 -2.69,1.52 -1.92,2.68 0,2.69 1.15,1.54 0.39,3.46 1.92,6.15 -0.01,5.76 -2.69,1.52 -1.54,-0.01 -1.54,1.15 -0.77,2.68 -3.85,3.43 -1.54,2.29 -6.15,3.42 -2.7,5.74 0.39,2.3 2.3,1.17 2.31,3.08 3.08,2.32 2.3,5.76 5,4.63 1.16,2.31 0,0 0,0 0,0 -1.16,1.53 0,1.15 1.15,5.37 -3.08,1.13 -1.15,1.15 -1.54,2.67 0.77,2.3 -0.39,1.15 -4.23,-0.02 -2.31,1.13 -1.92,1.91 0,4.6 -1.93,0.75 -3.84,-0.02 -1.54,-1.16 -3.46,-0.4 -6.16,1.5 -5,0.35 0,0 -0.41,-0.41 2.7,-2.18 0.79,-4.94 0,-6.57 -1.31,-3.98 -4.83,-4.11 -4.3,-0.52 -1.48,-1.1 -4.23,0.36 -5.79,-8.47 -2.35,-2.47 -4.04,-1.92 -1.27,-2.1 0.38,-3.14 -3.46,-4.23 -0.38,-9.6 1.15,-1.14 1.54,0.01 0,-1.92 -2.3,-3.09 -1.54,-0.77 -0.39,-3.46 1.55,-3.06 -3.47,-4.24 -1.54,-0.78 -1.92,0.76 -1.15,1.53 -3.08,1.13 0,0 -0.77,-3.07 -2.31,-3.85 -2.3,-1.55 0,0 1.54,-1.91 0,-1.54 -0.77,-3.46 -1.15,-1.93 0.38,-2.3 5.39,0.41 1.92,-1.52 1.15,-2.68 1.16,-0.76 3.46,0.4 3.08,-2.29 3.46,-0.75 1.16,-1.14 1.54,-4.6 3.46,0.02 4.23,-1.13 1.16,-1.15 0.77,0.01 0,-0.77 1.15,-0.76 2.31,-0.38 0.77,-1.14 2.3,-0.76 0.78,-4.99 1.54,-3.45 1.54,-1.53 1.15,0.39 1.15,3.08 2.69,0.4 1.54,1.16 1.93,-0.75 1.54,-1.92 0,-0.77 -1.54,-0.39 0.38,-2.69 -1.53,-1.16 1.54,-2.68 -0.77,-2.31 1.15,-1.53 -0.77,-0.39 -0.38,-1.93 1.15,-1.91 -1.53,-1.16 -5,-1.57 -8.47,-3.89 -0.77,-1.16 3.08,0.02 0,-1.16 -2.31,-1.17 -0.76,-3.08 3.07,0.02 0.77,-1.53 1.54,0.01 1.93,-1.53 5.38,0.41 0.77,-1.15 0,-1.92 0.77,-0.76 6.93,-1.89 4.23,-2.67 z"
     title="La Vega"
     id="DO-13"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 433.89609,56.76093 1.49,0.13 1.73,0.63 2.63,-0.19 1.97,1.45 1.32,-0.12 0.96,1.76 1.25,0.13 0.12,2.02 1.25,1.13 0.72,0.32 1.2,-0.88 1.43,1.7 3.11,0.63 3.05,6.31 0.48,2.77 -0.6,2.4 -1.8,2.77 -0.05,4.23 -2.1,3.91 1.68,3.91 1.73,2.08 2.57,0.81 1.79,1.77 -0.95,1.57 0,9.21 -0.72,1.44 0.78,3.22 2.45,5.73 3.16,4.91 0,3.21 1.98,2.9 4.72,3.78 0.24,2.01 1.73,1.2 0.12,1.32 1.73,2.39 5.16,4.91 0,0 0.4,3.09 3.46,3.1 -1.54,-0.01 -2.69,-1.55 -0.77,0.38 1.92,2.32 -0.38,1.15 -0.77,-0.01 -2.31,-1.93 -1.54,0.37 0.38,2.31 1.16,1.93 0,1.54 0.77,0 0.38,1.16 -0.77,0.38 0,1.54 -0.77,0.76 -1.54,-1.16 -1.15,0.38 -0.39,3.07 3.08,1.94 0.38,1.92 0,0 -5.77,-0.03 -6.15,-1.57 -5,-3.1 -1.54,-1.93 -1.54,-0.78 -13.07,-3.54 -8.08,-3.5 -10,-1.98 -2.31,-2.32 -0.38,-2.7 0.77,-4.22 -1.54,-1.17 -5.77,-1.18 -6.92,0.34 -1.54,-0.77 -4.23,-8.49 -1.15,-4.24 -1.54,-1.16 1.16,-7.69 -3.08,-10.03 -1.92,-1.16 -2.69,0.37 -0.77,-0.78 0,-1.15 -1.16,-0.78 -1.53,-0.01 -1.16,-1.16 -3.46,-0.79 -1.92,-2.32 0,0 1.92,-5.76 -0.76,-5.79 1.15,-0.76 1.54,0.78 4.61,-0.36 1.16,0.78 2.69,-1.53 2.69,-0.37 3.47,-3.06 5.38,-2.28 1.16,-1.15 0.77,-3.08 0,-3.85 0.77,-2.31 -0.37,-1.53 0,0 2.21,-1.63 1.49,-4.1 1.26,-1.51 2.8,-2.4 1.74,-0.06 1.67,-0.51 4.24,-1.26 0.9,0 0.66,0.82 4.12,-0.19 z"
     title="María Trinidad Sánchez"
     id="DO-14"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 316.71609,259.67093 -1.16,-2.31 -5,-4.63 -2.3,-5.76 -3.08,-2.32 -2.31,-3.08 -2.3,-1.17 -0.39,-2.3 2.7,-5.74 6.15,-3.42 1.54,-2.29 3.85,-3.43 0.77,-2.68 1.54,-1.15 1.54,0.01 2.69,-1.52 0.01,-5.76 -1.92,-6.15 -0.39,-3.46 -1.15,-1.54 0,-2.69 1.92,-2.68 2.69,-1.52 5.78,-0.73 3.07,1.55 3.85,-3.05 0.39,-3.45 3.08,-1.91 6.15,1.96 2.69,1.93 0,5 0,0 0.77,3.46 4.23,4.63 -0.77,6.14 0.38,3.07 0.77,0.77 4.23,0.79 2.69,1.17 0.77,1.16 0,3.45 6.15,4.64 -0.42,0.38 2.8,2.55 4.36,2.36 3.01,3.57 3.27,2.5 3.02,4.51 0.98,4.04 0,0 -2.02,1.66 -2.31,0.75 -0.77,1.15 0,6.52 -0.77,1.91 0,0 -1.93,1.52 -4.62,1.51 -2.69,1.9 -1.92,2.29 -0.39,1.92 1.15,1.54 0.39,2.68 -0.39,1.15 -3.08,2.66 -0.76,1.92 -2.31,1.9 -1.16,-0.01 -3.56,-2.56 0,0 -2.97,-0.92 -1.93,-1.16 -2.31,-2.7 -3.46,-1.55 -5.77,1.88 -4.23,-0.4 -1.15,1.14 -1.16,-0.01 -3.84,-3.85 -5,-1.95 -3.08,-4.23 -1.92,-1.16 z"
     title="Monseñor Nouel"
     id="DO-28"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 100.71609,4.8209298 0.78,0.62 7.17,1.1399999 2.57,-1.0099999 8.19,3.5399999 2.69,2.5300003 4.59,1.38 4.5,2.85 1.38,-0.13 2.39,1.52 7.83,1.64 5.08,0.76 0.55,-0.57 3.4,0.13 0.6,0.82 1.44,-0.01 0.12,1.08 1.86,0.64 1.85,1.13 4.9,0.89 1.99,-1.02 4.03,-0.69 0,0 1.29,0.65 0.37,1.14 -0.77,1.55 0,1.93 1.15,2.29 0.38,4.66 6.16,3.12 7.31,1.97 3.09,1.96 0,0 -2.32,9.61 -1.92,1.9 0,3.49 -0.77,1.15 0,1.55 1.92,4.63 0,6.18 -0.77,0 -0.77,-1.17 -1.14,1.17 -3.47,-0.81 -0.77,2.31 2.69,6.16 0.38,5.03 -0.77,1.54 0,1.93 -1.53,1.14 -1.55,3.08 0,0 -6.15,-2.35 -1.92,3.84 -2.31,0.37 -3.08,-2.71 -4.61,-0.01 -4.62,-4.67 -1.14,0.37 -1.55,2.31 -2.31,-0.4 -1.54,1.92 -5.38,2.67 -2.31,-0.01 -1.54,-1.16 -1.54,-0.01 -1.15,1.92 -0.77,0 0,-1.93 -5,-3.88 0.39,-1.92 -1.92,0.37 0.4,3.06 -1.17,0.4 0,0 -3.46,-1.94 -3.08,-0.79 -2.69,-3.48 -3.46,-1.17 -1.92,-1.17 -1.15,-1.55 -2.69,-0.79 -1.15,-1.55 0.39,-1.54 -1.15,-3.09 -5.38,-0.42 -2.309996,0.76 -1.54,1.53 -5.37,-0.41 -5.39,1.12 -7.69,-0.04 -12.31,-5.08 -3.85,0.36 -0.77,-1.16 -2.31,-0.4 -1.91,-2.3 0,0 0.79,-0.82 -0.63,-3.62 -2.41,-1.05 -1.35,-2.12 -0.84,-0.18 0.59,-2.12 -1.18,-0.44 -0.42,-1.06 0.18,-1.26 5.46,-1.2 1.79,-3.22 -0.11,-1.83 -1.03,-0.69 -0.18,-2.15 -1.19,0.76 -1.97,-4.04 -1.49,-2.72 1.26,-0.63 -0.54,-3.28 -1.43,-0.06 -0.42,1.58 -0.96,0.44 -0.23,0.95 -2.28,0.94 0,1.07 0.66,0.32 -0.4,0.89 -1.27,-0.64 0.66,-2.46 -0.24,-1.83 6.64,-5.87 0.48,-1.7 5.74,-1.07 5.44,-2.78 0.3,-2.08 3.11,-0.76 3.47,-2.9 1.14,-1.64 0.42,-1.98 -1.55,-5.4800002 1.14,0.24 0.06,-1.03 1.8,0.25 1.19,1.01 0.48,2.2100002 1.79,0.88 2.56,-1.77 -0.23,-2.0100002 0.78,-0.88 2.45,-0.5 0.78,0.57 1.91,-1.46 2.26,-0.76 3.96,0.89 5.369996,-1.38 z"
     title="Cristi"
     id="DO-15 Monte"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 484.06609,191.92093 0.77,0.01 1.54,1.93 1.92,1.16 1.16,0.01 1.92,1.16 4.61,4.25 2.31,3.47 9.23,3.51 1.93,2.31 0,0 1.92,3.08 3.84,0.79 2.31,1.17 3.85,3.47 5.38,2.34 1.54,1.16 1.15,1.92 1.93,1.16 2.3,0.4 3.85,3.09 3.84,1.17 4.23,3.1 5.77,1.95 3.85,2.7 6.16,-1.11 2.3,0.01 1.54,1.16 0,2.3 -1.54,2.68 -3.08,0.37 -1.54,3.82 -4.23,1.13 -3.46,4.58 -1.54,0.38 -0.39,2.68 -1.54,1.14 0,0 -0.38,-1.54 -1.92,-1.16 -1.16,0 -0.77,0.37 -3.08,4.97 -1.15,0.38 -2.31,4.59 -5,6.48 -3.86,12.63 -2.69,4.96 -2.68,3.17 0,0 -9.06,-3.26 -3.86,0 -1.55,3.25 -5.15,1.08 -2.06,1.35 -4.16,-0.33 -4.56,1.45 -2.31,-0.78 -4.62,3.42 0,1.92 -1.92,4.2 -3.08,1.52 -0.77,1.52 -3.08,1.9 -1.15,-3.07 0.38,-3.44 -1.15,-1.16 -0.77,-3.07 -3.85,-0.02 -0.76,-1.15 -0.39,-5.75 0.77,0.01 0,-0.77 -0.77,-0.77 -1.53,-0.01 -1.16,1.53 -0.77,-0.39 -0.77,-2.31 -3.07,-3.84 -0.39,-2.69 -1.53,-1.54 0,-1.15 -2.7,0.75 -2.69,-0.39 -4.23,2.65 -1.54,-0.01 -1.92,-1.54 -2.7,-0.01 -1.54,-1.16 -2.69,-0.78 -0.38,1.14 0.77,0.78 -0.01,2.29 -1.53,1.91 -2.7,0.37 -2.3,3.05 -1.93,-0.01 -1.15,-0.77 -3.85,-0.03 -2.31,1.91 -1.54,0.37 -5,-4.62 -3.07,-0.02 -2.7,0.75 -4.23,-0.79 -1.15,-0.77 -3.07,-6.15 -3.47,-4.62 -0.38,-1.53 -2.31,-0.4 -1.92,1.14 0,0 -1.16,-1.92 -4.22,-3.86 -5.01,-0.8 -1.15,-1.15 -0.77,-2.31 -5.76,-5.78 0,0 0.77,-1.91 0,-6.52 0.77,-1.15 2.31,-0.75 2.02,-1.66 0,0 1.05,-1.39 3.85,-1.9 4.62,0.79 5.77,-0.73 4.23,0.79 0.77,-0.76 0.77,-3.07 1.54,-1.52 4.23,0.02 4.23,-2.66 1.54,0.01 1.54,2.31 2.31,-0.37 1.92,0.78 1.15,-1.15 1.16,-3.44 1.15,-0.76 2.7,1.16 3.46,3.09 2.3,1.16 3.85,0.41 2.31,-2.29 1.54,-3.83 1.92,-1.91 3.47,-8.42 0.39,-5.75 -1.54,-1.16 -0.77,-3.46 3.85,-7.66 0,0 7.31,0.43 1.54,-1.15 0,-10.37 4.62,1.57 4.23,-1.9 6.54,0.81 3.46,-1.9 1.15,0 3.85,0.41 z"
     title="Monte Plata"
     id="DO-29"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 78.246094,553.84093 1.2,0.75 0.18,1.25 -1.79,0.31 -0.6,-0.81 -0.24,-1.12 1.25,-0.38 z m 26.119996,-30.96 1.25,1.43 2.57,0.19 1.32,0.94 1.49,3.8 1.44,1.43 2.99,0 -1.31,1.31 -0.24,1.56 -4.66,3.99 -6.45,2.43 -3.699996,0.31 -0.96,-0.5 -0.84,-2.37 1.37,-3.92 1.609996,-2.24 0.42,-3.12 2.15,-1.31 1.55,-3.93 z m -42.779996,-151.37 4.57,1.61 1.39,1.14 2.17,0.01 2.69,3.46 5.45,3.91 2.29,2.66 2.8,1.6 3.82,0 5.26,1.5 4.89,3.03 4.599996,1.33 8.39,0.8 8.14,7.18 4.07,4.52 3.51,2.42 0,0 4.63,0.51 4.07,2.66 1.78,1.6 0.25,1.06 -1.52,1.86 -4.58,0.27 3.56,5.85 0.51,2.66 -0.51,4.25 -4.07,5.32 -2.8,0.8 -2.54,-1.33 -0.51,1.06 0,4.78 -0.76,2.39 0.51,1.6 1.53,1.86 4.58,0 2.54,1.86 1.02,1.86 0,1.44 1.79,-0.3 2.31,1.54 4.04,5.03 3.56,-1.06 1.27,-4.25 2.8,0 5.09,6.38 0.26,3.25 1.45,1.06 0.77,4.96 -1.15,1.52 0.31,2.53 0,0 -0.91,0.38 -0.36,1.06 0.06,4.81 -2.09,1.69 -1.08,-1.06 -1.91,0.94 -3.88,5.24 -4.24,8.23 -2.45,11.66 -0.84,2.18 -1.25,0.69 0.18,2.74 -0.96,0.94 0.06,1.19 -1.26,2.24 -1.97,0.94 -0.06,1.62 -2.63,3.8 0.42,1.56 -1.55,2.62 -1.55,0 -2.03,3.12 -1.55,-2.49 -2.63,-1.99 -0.78,-1.93 0.18,-1.31 -5.98,-5.55 -2.87,-8.92 -2.51,-5.42 -2.09,-2.81 -1.61,-1.37 -2.99,-1.06 0.18,-0.87 -1.19,-0.81 -5.019996,-1.93 -9.92,-0.44 -8.67,2.5 -4.18,0.13 -0.48,-0.56 -1.61,0.19 -1.61,-1.87 -2.03,-0.56 0,-0.5 3.71,-0.87 2.45,-2.18 1.55,-5.93 2.15,0.87 1.67,-0.44 1.61,-2.99 0.06,-2.93 -1.14,-3.06 -2.69,-2.87 0.06,-1.69 -1.91,-3.99 -3.77,-2.5 -0.6,-1.25 0.72,-1 1.73,0.13 0.6,-0.56 1.37,-3.99 -0.12,-2.31 -1.91,-2.93 -0.42,-2.37 -1.31,-2.37 -5.86,-5.25 -4.48,-2.31 -3.71,-4.25 -3.51,-1.12 0.72,-0.86 0.25,-1.92 2.36,-1.67 0.42,-3.76 1.01,-0.61 0,-1.92 0.84,-0.44 -0.43,-2.1 -0.84,-0.17 1.01,-1.49 -0.59,-1.05 -1.44,0.27 -1.18,-2.8 0.84,-0.79 -0.01,-3.59 0.76,0 -0.59,-1.48 -1.01,0 0.42,-0.79 0.59,0.17 -0.17,-1.66 -0.42,-0.26 -1.01,1.75 -0.85,-2.36 -0.59,0 -1.86,-2.27 0.67,-1.49 -2.36,0.62 -2.37,-2.71 0,-1.66 1.26,-1.93 1.18,-0.18 0.84,-0.88 -0.42,-1.66 1.01,-3.33 2.44,-1.49 0,-2.71 6.7,-11.83 z"
     title="Pedernales"
     id="DO-16"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 354.82609,323.85093 4.92,0.19 2.95,1.55 0.54,1.76 2.31,0.78 0.77,0.77 0,1.53 2.69,0.78 0,0 0,1.53 0,0 0,1.91 0.77,1.15 5,-0.35 0,0 0,1.53 0,0 0.77,0.39 0,1.15 -0.77,0.38 0,0.77 1.54,0.39 -0.77,1.53 1.54,0.01 0.77,-2.29 0.77,-0.38 0,2.68 2.31,-0.75 3.08,1.55 0,0.77 -1.15,1.14 -0.77,0 -0.38,-1.53 -0.77,-0.39 0,3.06 0.77,0.39 -0.77,0.76 -4.23,3.04 -5,-0.41 -1.92,1.9 0,1.53 2.69,-0.75 0.77,1.53 -0.39,2.68 0.77,1.53 0.77,0.01 1.16,-1.52 3.08,0.78 0,2.68 1.15,4.21 2.69,1.55 0.38,1.53 2.69,1.93 0.77,1.15 0.38,3.44 0.77,0.77 3.08,0.78 1.54,1.16 -0.39,3.44 -0.77,0.76 0,3.06 1.92,1.57 0,0 -2.08,1 -4.24,-1.69 -6.04,3.06 -1.91,-1.56 -6.81,-2 -6.75,2.25 -5.02,0.44 -4.9,-1.19 -3.41,0.13 -2.75,-1.37 -1.91,-0.13 -7.95,2.63 -8.07,4.57 -4.24,0.81 -4.24,1.75 -4.54,-3 -2.33,-0.06 -1.55,0.63 -4.12,-0.75 1.43,-3.13 1.73,-0.69 0,1.31 -0.24,-0.94 -1.31,0.5 -0.72,2.06 1.2,0.56 -0.24,-1.12 1.25,0.31 -0.06,-1.13 0.48,1.06 1.97,0.62 0.9,-1.19 2.45,0.81 1.37,-0.87 2.87,-0.13 0.36,-0.94 -3.47,-2.06 -1.79,0 -1.31,0 -3.53,-3.63 -0.18,-1.06 -1.37,-0.38 -0.78,-1 -3.23,-0.56 -1.79,-2.56 0,0 1.11,-1.05 8.46,-0.33 2.69,-1.51 3.85,0.02 2.31,-1.13 2.31,-5.34 0,-1.91 -1.15,-3.45 0.39,-5.73 4.24,-5.71 0,-3.06 -1.68,-2.83 0,0 0.56,-4.47 1.47,-2.06 1.47,-1.03 2.7,0 7.13,-4.12 3.19,0 3.69,-1.29 1.97,-3.35 4.13,-4.12 z"
     title="Peravia"
     id="DO-17"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 213.60609,0.2509298 4.96,0.38 4.72,3.16 4.96,2.3999999 0.96,-0.13 1.79,-2.21 5.92,2.91 4,-0.32 0.3,0.95 0.78,0.25 1.37,-1.26 2.57,0.82 2.99,-1.45 0.6,0.88 1.49,-0.3099999 0.54,1.07 -0.42,1.71 0.66,0.88 2.39,1.6400002 2.75,-0.06 7.17,9.22 -1.37,2.02 0.59,0.95 1.2,-0.06 0.96,-1.58 1.61,0.5 1.49,-0.88 2.39,0 2.45,1.64 0.12,0.89 1.02,0.12 0.06,1.27 3.94,1.32 1.8,1.9 -0.78,0.69 0.78,1.07 1.37,-1.38 0.84,0.18 0.12,0.7 4.66,2.33 0.6,1.02 1.55,0.37 2.03,2.66 2.45,0 0.24,1.45 1.43,0.82 1.32,-0.19 1.2,-1.39 2.8,2.08 4.13,1.33 4.3,-2.08 1.26,0.37 1.01,-0.5 2.15,2.27 1.26,-0.5 1.43,0.06 2.63,0.44 1.08,-0.31 -0.54,-1.71 1.91,-3.72 5.8,-1.2 7.71,0.57 2.03,1.01 1.91,2.39 1.98,1.08 1.73,2.46 2.69,0.06 1.91,1.96 4.06,6.37 0,0 -2.31,5.31 1.53,3.48 0,1.93 -0.38,0.77 -5,0.74 0,1.16 1.15,0 0.38,1.16 -1.53,0.38 -0.77,-1.93 -0.77,-0.01 -0.39,1.93 -1.53,-1.55 -1.16,1.92 -1.54,-0.01 -1.54,-3.09 -0.76,-0.01 -1.54,1.15 -3.47,-0.41 -0.38,2.7 -0.77,-0.39 0,-0.77 -2.69,-0.02 -1.16,1.15 -1.15,-1.16 -0.77,0.38 -1.16,-0.77 -1.92,1.91 -0.38,1.16 0.76,0.77 -2.3,0.76 0,1.15 0.77,0.39 -0.01,1.93 -1.54,2.69 0,1.16 1.16,1.93 0,1.92 -3.47,4.22 -0.77,8.86 -1.15,0.38 -1.16,1.53 0,0 -5,-2.72 -5.38,-1.96 -8.46,-1.59 -1.54,-2.32 0,-1.92 2.31,-8.08 -0.77,-3.47 -5.77,-3.51 -2.31,-0.01 -1.53,-0.78 -6.16,-3.89 -0.77,0 0,1.93 1.92,8.1 -0.77,2.31 -1.54,1.92 -5.77,2.28 -1.15,-0.01 -0.77,-0.78 -0.77,-2.7 -0.77,-0.77 -3.46,-0.41 -3.85,-4.26 -4.61,-3.49 -0.77,-0.01 0,1.16 -0.77,0.38 -3.07,-1.56 -2.31,-0.01 -4.23,-1.95 0,0 -8.47,-0.44 -1.54,-0.39 -1.92,-1.94 -1.54,0.76 -3.46,-3.49 -0.38,-1.92 -1.54,-0.01 -4.62,-2.73 -4.61,-4.65 -1.92,-0.01 -1.93,1.15 -4.23,-0.03 -4.61,-1.95 -1.54,-4.64 -2.31,-1.17 -7.69,-0.81 -3.46,-1.18 -2.29,-1.54 0,0 -3.1,-1.96 -7.3,-1.97 -6.16,-3.12 -0.38,-4.67 -1.16,-2.29 0.01,-1.93 0.77,-1.55 -0.37,-1.14 -1.29,-0.64 0,0 1.93,-1.14 -0.18,-2.27 1.2,-1.77 -0.96,-0.63 0.24,-1.84 3.65,1.96 1.07,1.52 2.75,0.62 0.84,-1.13 0.96,-1.2 1.31,-0.06 1.61,1.07 5.08,0.32 1.74,-1.64 4.96,-1.01 2.21,-1.14 2.21,-2.15 -0.36,-3.8500002 1.49,-1.52 2.21,-0.95 0.6,-1.77 4.01,-1.07 3.88,-1.9 z"
     title="Puerto Plata"
     id="DO-18"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 330.98609,139.56093 0.01,-1.92 1.54,-3.07 2.69,-11.15 2.7,-5.75 0,-2.7 -2.31,-2.71 -0.77,-1.92 0,-3.08 1.93,-3.07 -0.38,-5.4 5,-11.52 0.77,0 1.92,2.71 1.92,1.17 4.23,0.79 0.77,0.78 0.39,4.62 1.15,1.55 2.31,0.78 1.92,-0.76 2.7,-8.07 0.77,-0.77 2.31,-0.76 1.92,-2.68 2.69,-0.37 1.93,-1.15 2.3,0.02 2.7,0.78 1.15,1.16 0.38,1.16 -1.15,1.54 0.77,2.7 2.69,3.86 2.69,2.33 0,0 1.16,0.39 0.77,1.55 -0.39,3.07 -1.54,1.15 -1.54,-0.01 -3.85,1.9 -1.15,2.31 0.77,1.93 3.08,1.17 0,1.15 -4.62,1.52 -2.31,2.29 -1.92,-0.01 -1.54,0.76 -6.16,4.59 -1.16,6.92 -2.31,6.52 0.39,2.7 -1.93,4.22 0,3.84 -1.54,2.3 -2.31,1.53 -1.15,2.68 0,3.08 1.15,1.54 0.77,3.08 0,0 -4.62,-0.41 -6.54,1.12 -2.69,-3.48 -1.15,-4.23 -2.31,-4.25 -3.08,-2.71 -1.15,-2.69 z"
     title="Hermanas Mirabal"
     id="DO-19"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 596.32609,129.38093 0.96,0.25 0.78,1.13 0.3,-0.57 1.79,-0.13 0.48,1.39 -1.37,3.21 -3.35,3.27 -3.05,4.85 -1.02,2.08 0.66,1.01 1.02,0.69 3.82,0.5 0.6,-0.57 1.97,0.25 2.45,-2.45 2.21,1.26 1.73,-0.25 3.88,-2.58 1.44,-0.06 0.18,0.88 2.21,-0.25 0.36,0.57 -0.18,3.34 -2.45,4.59 -5.98,4.15 -1.43,1.89 -2.51,1.2 -0.48,2.58 -1.14,1.89 0.18,3.21 -0.66,0.13 -0.12,2.2 -0.42,1.26 -2.39,0.88 -3.41,-0.69 -2.03,-0.31 -4.54,-0.06 -3.34,-2.45 -1.02,1.07 -2.21,-1.57 -1.14,0.88 -3.88,-2.14 -1.14,0.38 -0.54,1.01 -0.24,0.88 -6.04,-0.88 -7.17,0.38 -0.96,0.94 -0.06,1.57 -1.55,-0.63 -0.24,-1.32 -2.33,-0.25 -1.26,0.82 -2.15,-2.26 -1.85,-0.69 -2.21,0.13 -2.33,-1.13 -2.09,-0.19 -1.25,0.57 -1.13,-0.63 -0.84,0.44 -1.61,-1.45 -1.85,1.2 -0.6,-0.75 -2.15,-0.57 -1.55,0.57 -1.73,-0.69 -2.99,0.57 -4.78,-0.94 -1.02,-0.69 -2.09,0.44 -2.93,-1.76 -3.23,-0.13 -1.55,1.07 0.66,1.38 -0.48,7.86 -1.14,3.02 -1.19,6.67 -0.66,0.38 1.85,7.17 -1.13,1.26 1.73,3.14 3.11,0.57 0,0 -2.75,11.07 -2.31,5.36 0,0 -1.92,-2.31 -9.23,-3.51 -2.31,-3.47 -4.61,-4.25 -1.92,-1.16 -1.15,-0.01 -1.92,-1.16 -1.54,-1.93 -0.77,0 0,0 1.15,-1.15 5,0.03 -1.54,-4.62 -2.31,-2.7 0,-2.31 2.31,0.01 3.46,-2.29 0.77,-0.76 -0.77,-1.54 1.92,-0.37 0.77,-1.53 0.77,0.77 1.54,0.01 0.39,-1.53 1.54,0.01 1.16,-4.61 1.93,-2.29 1.54,0.01 0.39,-1.54 -1.92,-0.78 -4.62,0.74 -1.92,-2.32 -3.46,0.75 -4.23,-0.41 -2.69,-1.55 -3.85,-0.02 -1.54,0.76 -2.31,4.22 0,0 -0.38,-1.92 -3.08,-1.94 0.39,-3.07 1.15,-0.38 1.54,1.16 0.77,-0.76 0,-1.54 0.77,-0.38 -0.38,-1.16 -0.77,0 0,-1.54 -1.15,-1.93 -0.38,-2.31 1.54,-0.38 2.31,1.94 0.77,0 0.39,-1.15 -1.92,-2.32 0.77,-0.38 2.69,1.55 1.54,0.01 -3.46,-3.1 -0.4,-3.09 0,0 6.79,3.78 6.87,1.32 8.37,-1.95 3.59,-2.2 13.98,-0.94 2.93,-1.64 0.12,-2.33 2.45,0.31 0,-1.51 1.67,0.44 0.84,-1.51 1.2,-0.38 1.73,1.2 2.21,-1.13 0.54,0.63 2.39,-0.69 2.93,0.13 2.93,0.94 5.38,-1.13 1.79,0.19 0.9,1.39 0.96,-0.25 0.6,-1.07 0.78,0.13 0.96,1.57 1.85,1.2 1.97,-0.88 -0.12,-0.82 1.2,-0.31 0.84,1.2 1.08,0.06 2.57,1.95 0.66,0.13 0.42,-0.94 1.44,0.13 -0.06,0.82 1.85,1.01 1.73,0.5 1.97,-0.44 1.25,2.64 1.2,0.82 0.84,-0.31 0.42,1.2 1.56,0.13 0.84,-0.38 0.48,-2.96 -0.48,-0.88 0.96,-1.26 2.27,-1.26 1.08,-1.51 2.09,-0.5 1.61,-1.95 4.78,-0.82 -0.36,-1.32 1.61,-1.38 1.25,-0.19 0.78,1.2 2.57,-4.91 0.99,-0.19 z"
     title="Samaná"
     id="DO-20"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 377.49609,256.56093 5.76,5.78 0.77,2.31 1.15,1.15 5.01,0.8 4.22,3.86 1.16,1.92 0,0 -1.16,0.76 -0.77,1.53 0,2.3 3.46,5 0,2.68 1.16,1.92 -0.39,3.06 2.69,3.08 1.15,2.69 -0.38,1.53 -0.77,0 -1.15,-1.54 -1.54,0.37 -0.78,6.13 1.93,1.54 0.38,3.07 2.31,4.22 1.54,0.39 0,1.91 1.15,1.16 0.77,3.45 -0.39,1.53 0.77,1.53 2.31,0.4 3.08,-0.37 0,-1.53 1.15,-0.37 1.15,2.3 2.7,1.93 0.38,2.68 1.54,2.31 -0.77,0.76 -3.08,-0.02 0,0.76 0.39,1.15 3.07,0.02 -0.38,4.21 1.15,-0.38 0,-1.53 1.54,-1.14 1.92,0.01 1.54,2.31 1.92,0.39 3.08,-3.42 0.39,1.15 -0.77,3.05 1.15,-0.37 0.38,2.29 1.54,1.16 -1.05,3.41 0,0 -1.72,1.63 -0.24,-1 -0.72,0.43 0.3,1.44 -1.25,0.69 -3.11,6.26 -0.6,-0.31 -1.25,1.32 0.59,0.12 -0.83,1.13 -1.26,0.62 -6.75,13.21 -1.97,1.69 -1.5,-0.5 -1.67,1.87 -0.42,2.44 -2.27,3.13 -2.69,2.07 -3.41,6.69 -1.67,0.94 -2.27,-1.75 -2.34,0.93 0,0 -1.92,-1.57 0,-3.05 0.77,-0.76 0.39,-3.44 -1.54,-1.16 -3.08,-0.78 -0.77,-0.77 -0.38,-3.44 -0.77,-1.15 -2.69,-1.93 -0.39,-1.53 -2.69,-1.54 -1.15,-4.22 0,-2.67 -3.08,-0.78 -1.15,1.52 -0.77,-0.01 -0.77,-1.53 0.39,-2.67 -0.77,-1.54 -2.7,0.75 0,-1.53 1.93,-1.9 5,0.41 4.23,-3.04 0.77,-0.76 -0.77,-0.38 0.01,-3.06 0.76,0.38 0.39,1.54 0.77,0 1.15,-1.14 0,-0.77 -3.07,-1.54 -2.31,0.75 0,-2.68 -0.77,0.38 -0.77,2.29 -1.54,-0.01 0.77,-1.52 -1.54,-0.4 0,-0.76 0.77,-0.38 0,-1.15 -0.77,-0.38 0,0 0,-1.53 0,0 -5,0.35 -0.77,-1.15 0,-1.91 0,0 0,-1.53 0,0 -2.69,-0.79 0,-1.53 -0.77,-0.77 -2.3,-0.77 -0.55,-1.76 -2.95,-1.55 -4.91,-0.19 0,0 0,-1.87 -1.23,-2.06 -3.93,-4.38 0,-2.06 2.7,-6.7 0.49,-3.61 0,-5.67 -2.7,-4.38 0.24,-3.35 2.46,-3.36 0.49,-1.8 0.25,-5.16 2.63,-4.47 0,0 3.56,2.56 1.16,0.01 2.31,-1.9 0.76,-1.92 3.08,-2.66 0.39,-1.15 -0.39,-2.68 -1.15,-1.54 0.39,-1.92 1.92,-2.29 2.69,-1.9 4.62,-1.51 z"
     title="San Cristóbal"
     id="DO-21"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 316.71609,259.67093 2.69,0.4 1.92,1.16 3.08,4.23 5,1.95 3.84,3.85 1.16,0.01 1.15,-1.14 4.23,0.4 5.77,-1.88 3.46,1.55 2.31,2.7 1.93,1.16 2.97,0.92 0,0 -2.63,4.47 -0.25,5.16 -0.49,1.8 -2.46,3.36 -0.24,3.35 2.7,4.38 0,5.67 -0.49,3.61 -2.7,6.7 0,2.06 3.93,4.38 1.23,2.06 0,1.87 0,0 -4.18,4.05 -1.97,3.35 -3.68,1.29 -3.2,0 -7.12,4.12 -2.71,0 -1.47,1.03 -1.48,2.06 -0.56,4.47 0,0 -3.7,-2.55 0.39,-2.68 -1.92,-3.07 0,-2.29 -1.93,-1.16 0.01,-2.3 1.15,-0.76 0,-0.76 -1.15,-1.16 -5.39,-0.79 -3.07,-4.23 -1.16,0.38 -1.15,-1.16 -5,-1.18 -1.15,-2.68 -1.54,-0.01 -2.31,1.14 -1.16,-0.39 -0.38,-1.54 -2.31,-2.69 0,-2.3 -0.77,-1.15 -6.92,-4.25 -1.92,-1.93 -0.77,-1.53 2.7,-4.2 -0.39,-6.51 -2.3,-3.85 -3.08,-2.7 -2.31,-1.16 0,0 5,-0.35 6.16,-1.5 3.46,0.4 1.54,1.16 3.84,0.02 1.93,-0.75 0,-4.6 1.92,-1.91 2.31,-1.13 4.23,0.02 0.39,-1.15 -0.77,-2.3 1.54,-2.67 1.15,-1.15 3.08,-1.13 -1.15,-5.37 0,-1.15 z"
     title="San José de Ocoa"
     id="DO-31"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 145.95609,168.50093 0.77,0.39 1.15,3.08 1.15,0.78 2.7,-1.14 3.46,0.02 5.38,1.95 3.08,-1.14 3.08,0.79 0,0 3.84,3.1 5.77,0.8 6.54,2.72 2.31,3.47 3.84,1.95 0.77,3.46 0,4.99 3.08,3.09 2.69,1.55 2.31,0.01 7.3,3.12 1.54,2.69 0,1.92 0.77,0.78 1.92,0.01 1.54,0.77 0.77,-1.14 3.85,-1.52 0.77,-1.91 1.54,-0.76 3.07,1.17 0.77,0 1.16,-1.14 1.54,0 4.23,1.56 1.54,1.16 4.23,0.8 0,0 2.3,1.55 2.31,3.85 0.77,3.07 0,0 -0.39,1.54 0.77,0.77 0,1.53 -1.15,1.53 -6.54,1.12 1.92,4.61 -1.54,2.3 -5.39,1.12 -1.53,2.67 -1.16,0 -3.08,1.51 0,1.16 0.77,0.77 -0.38,2.3 -2.31,4.59 -1.54,0.37 -0.77,1.15 1.53,5.76 2.69,5.38 0,2.69 -2.69,4.58 -0.77,2.68 -2.31,2.29 -0.77,2.29 -1.54,0 -1.92,-3.85 -0.77,-3.07 -1.54,-1.16 -2.69,-0.02 -2.31,1.53 -1.15,1.91 0.38,6.13 0.77,0.77 0,1.53 1.15,0.4 0.39,1.91 -0.77,0.77 -1.54,-0.01 -1.16,1.14 0,1.92 2.31,2.31 0.38,2.68 -1.92,0.37 -2.19,2.17 -3.84,0.1 -2.55,6.32 -2.26,0 -5.22,5.42 -5.49,0.18 0,0 -0.38,-2.43 -0.77,-0.77 -5,-1.56 -5,1.12 -8.85,3.78 -7.31,-0.04 -3.08,-1.17 -2.69,-0.01 -1.54,1.14 -1.15,1.9 -1.93,-0.01 -4.23,3.04 -7.69,-1.57 -0.39,-2.3 -2.69,-0.78 -1.54,1.52 -1.53,-0.01 -1.16,-2.3 -5.77,-3.1 -2.69,-0.4 -2.31,1.14 -2.69,-0.02 -4.23,-1.17 -3.08,-1.55 -1.15,-1.54 -1.54,-0.77 0,0 0,0 0,0 1.54,-1.91 1.54,-5.74 0,-1.53 -1.54,-3.84 -1.92,-1.16 -3.849996,0.36 -2.31,-1.16 -1.53,-3.46 -1.16,-0.77 -0.76,-1.54 0.38,-1.53 1.15,-0.76 1.16,-2.3 -0.38,-1.91 -2.7,-1.55 -0.38,-1.16 -1.54,0 -3.08,-1.55 -1.53,-1.93 0,-1.53 -3.08,-1.94 1.16,-0.76 0.76,-2.68 1.54,-1.91 -1.15,-4.22 0.39,-8.06 -0.77,-0.38 -2.31,2.29 -0.77,-0.01 0.39,-4.6 3.46,-5.74 0.39,-3.83 -1.54,-0.39 -0.77,-0.78 0,-1.15 8.08,-9.93 2.31,-1.91 1.92,-0.37 7.309996,1.96 2.31,-0.37 0.77,-0.76 0.39,-4.99 3.08,-7.67 2.69,-4.2 -0.38,-4.61 3.85,-5.75 2.31,-0.75 7.31,1.19 3.84,3.87 2.69,0.01 0.39,1.54 1.53,0.01 3.08,-2.67 4.62,0.02 2.69,-1.52 1.16,-1.53 -0.77,-2.69 1.16,-10.37 0,0 1.15,-1.53 0,0 z"
     title="San Juan"
     id="DO-22"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 547.89609,256.37093 -0.77,1.15 -0.77,6.13 0.77,1.92 2.31,0.39 1.15,1.16 0,2.3 2.31,4.23 -0.01,6.13 1.54,2.3 -2.69,3.44 0.38,1.53 2.31,1.16 1.15,3.08 2.31,2.69 0.38,3.07 1.54,3.45 3.46,2.32 0.77,4.22 1.92,3.45 0.39,2.3 4.22,6.92 1.54,-3.44 3.08,-3.04 3.85,-2.28 0.39,-2.3 2.3,0.02 -0.76,-1.15 0,-4.22 1.15,-1.52 0,-3.07 0.77,-1.52 5,-0.36 2.31,-1.13 1.93,-2.68 0,0 3.07,1.17 1.16,2.69 2.3,0.01 2.31,-1.13 3.46,1.16 6.16,4.25 1.92,4.61 5.77,3.09 2.31,-0.37 2.3,-1.51 6.16,0.03 0.77,1.54 -1.93,0.75 -1.15,9.18 0,0 -1.16,3.44 -3.46,3.43 -1.54,3.05 0,1.91 1.54,3.07 1.15,0.77 3.46,5 0,1.14 1.15,1.92 -0.77,2.68 1.54,3.96 0,0 -7.58,-2.69 -3.82,-0.06 -4.01,-1.07 -6.09,-2.38 -3.11,-2.38 1.08,-0.5 -0.9,-3.19 -2.33,-1.25 -3.77,0.88 -1.91,1.37 -7.11,0.13 -6.1,1.94 -0.77,-0.06 0.41,-0.32 -0.36,-0.75 -2.74,-0.31 0.3,-1.38 -1.02,-0.25 -1.26,0.88 -0.05,1.31 1.01,0.44 -0.48,0.5 -0.6,-0.31 0,1.19 -1.97,1 -5.79,0.38 -7.89,-0.94 -5.32,0.37 -7.65,1.32 -11.53,3.57 -4.4,-0.07 0,0 -0.02,-9.89 0.39,-0.77 1.54,0.01 0.38,-3.82 -10,-0.83 -6.54,-3.86 -1.92,-4.99 -2.69,-1.54 0.77,-1.53 2.31,-1.13 1.92,-4.97 3.47,-5.72 0,-1.15 -1.93,-2.31 1.54,-4.2 0.01,-1.92 -0.78,-0.39 -1.92,1.53 -0.77,-2.31 4.25,-5.22 0,0 2.68,-3.17 2.69,-4.96 3.86,-12.63 5,-6.48 2.31,-4.59 1.15,-0.38 3.08,-4.97 0.77,-0.37 1.16,0 1.92,1.16 z"
     title="San Pedro de Macorís"
     id="DO-23"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 370.97609,178.61093 0.01,-1.15 -0.77,0.38 0,-0.77 1.15,-0.76 1.54,-0.38 1.54,0.78 1.54,-0.76 0.77,0.77 0.77,-0.76 0.77,1.92 2.3,-0.75 1.16,1.92 3.84,1.18 0.39,-1.92 0.77,-0.76 1.15,1.54 2.69,-3.06 1.54,-0.76 1.54,0.39 -0.77,2.69 1.54,0.01 1.15,-0.76 0.77,0.77 0.77,-0.77 0,2.69 1.93,-3.44 1.15,0.39 1.15,-1.15 0.39,0 -0.39,3.07 1.16,0.4 0.38,-1.54 1.16,0.39 0.77,-1.53 2.69,0.4 0,0.77 1.15,0.77 2.7,-0.75 1.15,-1.15 1.15,2.31 2.7,0.02 0.38,1.15 0.77,0.01 2.69,2.32 8.85,2.35 2.69,1.94 1.15,0.01 2.7,-2.68 1.92,0.01 4.62,2.33 2.69,2.32 3.84,0.41 2.7,1.17 0.38,0.77 -2.31,5.36 -0.77,6.14 0,0 -3.85,7.66 0.77,3.46 1.54,1.16 -0.39,5.75 -3.47,8.42 -1.92,1.91 -1.54,3.83 -2.31,2.29 -3.85,-0.41 -2.3,-1.16 -3.46,-3.09 -2.7,-1.16 -1.15,0.76 -1.16,3.44 -1.15,1.15 -1.92,-0.78 -2.31,0.37 -1.54,-2.31 -1.54,-0.01 -4.23,2.66 -4.23,-0.02 -1.54,1.52 -0.77,3.07 -0.77,0.76 -4.23,-0.79 -5.77,0.73 -4.62,-0.79 -3.85,1.9 -1.05,1.39 0,0 -0.98,-4.04 -3.02,-4.51 -3.27,-2.5 -3.01,-3.57 -4.36,-2.36 -2.8,-2.55 0.42,-0.38 -6.15,-4.64 0,-3.45 -0.77,-1.16 -2.69,-1.17 -4.23,-0.79 -0.77,-0.77 -0.38,-3.07 0.77,-6.14 -4.23,-4.63 -0.77,-3.46 0,0 1.54,-3.84 1.54,-1.91 3.08,-1.52 1.54,0.01 3.46,-4.59 2.31,0.02 0.38,0.77 4.62,-0.36 2.31,-1.14 1.15,-3.45 0.77,0 1.15,1.16 0.77,-0.38 0.39,-1.15 z"
     title="Sánchez Ramírez"
     id="DO-24"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 245.62609,66.31093 4.23,1.95 2.31,0.01 3.07,1.56 0.77,-0.38 0,-1.16 0.77,0.01 4.61,3.49 3.85,4.26 3.46,0.41 0.77,0.77 0.77,2.7 0.77,0.78 1.15,0.01 5.77,-2.28 1.54,-1.92 0.77,-2.31 -1.92,-8.1 0,-1.93 0.77,0 6.16,3.89 1.53,0.78 2.31,0.01 5.77,3.51 0.77,3.47 -2.31,8.08 0,1.92 1.54,2.32 8.46,1.59 5.38,1.96 5,2.72 0,0 0,4.62 -3.85,3.06 -3.07,0.75 -1.16,1.54 0.38,5.77 -2.69,4.61 0,1.54 0.38,3.85 1.15,3.47 1.16,1.16 0,1.15 -0.77,0.38 -1.54,-1.55 -1.92,-0.01 -1.54,1.53 -0.78,1.92 0,0 -3.84,-0.02 -4.23,2.67 -6.93,1.89 -0.77,0.76 0,1.92 -0.77,1.15 -5.38,-0.41 -1.93,1.53 -1.54,-0.01 -0.77,1.53 -3.07,-0.02 0.76,3.08 2.31,1.17 0,1.16 -3.08,-0.02 0.77,1.16 8.47,3.89 5,1.57 1.53,1.16 -1.15,1.91 0.38,1.93 0.77,0.39 -1.15,1.53 0.77,2.31 -1.54,2.68 1.53,1.16 -0.38,2.69 1.54,0.39 0,0.77 -1.54,1.92 -1.93,0.75 -1.54,-1.16 -2.69,-0.4 -1.15,-3.08 -1.15,-0.39 -1.54,1.53 -1.54,3.45 -0.78,4.99 -2.3,0.76 -0.77,1.14 -2.31,0.38 -1.15,0.76 0,0.77 -0.77,-0.01 -1.16,1.15 -4.23,1.13 -3.46,-0.02 -1.54,4.6 -1.16,1.14 -3.46,0.75 -3.08,2.29 -3.46,-0.4 -1.16,0.76 -1.15,2.68 -1.92,1.52 -5.39,-0.41 -0.38,2.3 1.15,1.93 0.77,3.46 0,1.54 -1.54,1.91 0,0 -4.23,-0.8 -1.54,-1.16 -4.23,-1.56 -1.54,0 -1.16,1.14 -0.77,0 -3.07,-1.17 -1.54,0.76 -0.77,1.91 -3.85,1.52 -0.77,1.14 -1.54,-0.77 -1.92,-0.01 -0.77,-0.78 0,-1.92 -1.54,-2.69 -7.3,-3.12 -2.31,-0.01 -2.69,-1.55 -3.08,-3.09 0,-4.99 -0.77,-3.46 -3.84,-1.95 -2.31,-3.47 -6.54,-2.72 -5.77,-0.8 -3.84,-3.1 0,0 -0.39,-2.31 1.54,-4.22 0.39,-5.38 -1.92,-4.23 -2.69,-0.79 -1.54,-3.47 0.77,-1.53 1.92,0.39 0.39,-0.76 -0.77,-5.01 1.16,-1.53 0,-3.08 -2.31,-2.7 0,-1.15 1.92,-0.38 1.16,-3.07 0.77,1.16 1.92,0.01 0.39,-1.54 -0.77,-3.46 1.15,-0.77 0.77,-1.53 3.46,-1.9 6.16,-1.51 1.54,3.09 2.69,0.01 0.77,-1.53 -0.38,-1.16 3.07,-0.37 0,-1.15 3.08,0.4 0.77,-0.76 0.77,-3.46 3.08,-1.52 3.84,0.4 1.93,-2.3 -2.69,-0.4 -0.77,-0.77 0.77,-2.69 -1.15,-1.93 -1.16,-0.01 0,-0.77 2.31,-0.75 1.54,-3.07 0,0 3.08,1.94 1.15,0 3.85,2.72 3.84,1.56 7.31,-0.34 1.92,-1.15 1.54,-3.07 2.31,3.09 3.85,0.41 1.54,1.16 3.07,-1.52 2.7,0.02 2.3,0.78 3.08,-0.37 2.31,-3.06 -5,-2.34 -2.3,-3.48 0,-3.08 1.92,-3.45 1.16,-5.39 -2.31,-1.17 -1.92,-0.01 -0.77,-1.93 -1.16,0.76 -2.69,-2.32 0.77,-2.69 -1.92,-1.94 0,-2.7 0.39,-0.38 1.53,0.78 6.54,5.04 1.15,0.01 1.16,-2.69 1.54,-1.15 0.38,-2.31 1.93,-2.68 0,-3.09 z"
     title="Santiago"
     id="DO-25"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 127.51609,88.37093 1.18,-0.4 -0.4,-3.06 1.92,-0.38 -0.39,1.93 5,3.88 0,1.92 0.77,0.01 1.16,-1.92 1.53,0.01 1.54,1.16 2.31,0.01 5.39,-2.66 1.54,-1.92 2.3,0.4 1.56,-2.31 1.14,-0.37 4.62,4.67 4.61,0 3.07,2.72 2.31,-0.38 1.93,-3.84 6.15,2.35 0,0 0,4.62 1.54,1.55 0.38,4.62 0.77,0.78 1.92,0.01 2.31,1.17 2.69,0.01 5,3.11 3.08,0.02 2.69,-0.76 3.08,0.41 0,0 -1.54,3.07 -2.31,0.75 0,0.77 1.16,0.01 1.15,1.93 -0.77,2.69 0.77,0.77 2.69,0.4 -1.93,2.3 -3.84,-0.4 -3.08,1.52 -0.77,3.46 -0.77,0.76 -3.08,-0.4 0,1.15 -3.07,0.37 0.38,1.16 -0.77,1.53 -2.69,-0.01 -1.54,-3.09 -6.16,1.51 -3.46,1.9 -0.77,1.53 -1.15,0.77 0.77,3.46 -0.39,1.54 -1.92,-0.01 -0.77,-1.16 -1.16,3.07 -1.92,0.38 0,1.15 2.31,2.7 0,3.08 -1.16,1.53 0.77,5.01 -0.39,0.76 -1.92,-0.39 -0.77,1.53 1.54,3.47 2.69,0.79 1.92,4.23 -0.39,5.38 -1.54,4.22 0.39,2.31 0,0 -3.08,-0.79 -3.08,1.14 -5.38,-1.95 -3.46,-0.02 -2.7,1.14 -1.15,-0.78 -1.15,-3.08 -0.77,-0.39 0,0 -2.7,-1.94 -5,-1.56 -4.61,-3.49 -2.31,-0.01 -8.07,-6.2 -0.39,-4.61 -2.69,-3.86 -5,-2.34 -1.92,0.38 -1.92,-0.79 0,0 -0.77,-1.92 -4.23,-3.1 -0.77,-3.85 5.38,1.18 5.77,-1.12 -0.38,-6.16 0.77,-4.99 -0.76,-5.4 0.38,-0.77 2.69,-1.13 1.16,-1.92 0,-3.47 -1.15,-3.85 0,-6.93 2.31,-4.61 5.77,-6.13 z"
     title="Santiago Rodríguez"
     id="DO-26"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 395.56609,272.38093 1.92,-1.14 2.31,0.4 0.38,1.53 3.47,4.62 3.07,6.15 1.15,0.77 4.23,0.79 2.7,-0.75 3.07,0.02 5,4.62 1.54,-0.37 2.31,-1.91 3.85,0.03 1.15,0.77 1.93,0.01 2.3,-3.05 2.7,-0.37 1.53,-1.91 0.01,-2.29 -0.77,-0.78 0.38,-1.14 2.69,0.78 1.54,1.16 2.7,0.01 1.92,1.54 1.54,0.01 4.23,-2.65 2.69,0.39 2.7,-0.75 0,1.15 1.53,1.54 0.39,2.69 3.07,3.84 0.77,2.31 0.77,0.39 1.16,-1.53 1.53,0.01 0.77,0.77 0,0.77 -0.77,-0.01 0.39,5.75 0.76,1.15 3.85,0.02 0.77,3.07 1.15,1.16 -0.38,3.44 1.15,3.07 3.08,-1.9 0.77,-1.52 3.08,-1.52 1.92,-4.2 0,-1.92 4.62,-3.42 2.31,0.78 4.56,-1.45 4.16,0.33 2.06,-1.35 5.15,-1.08 1.55,-3.25 3.86,0 9.06,3.26 0,0 -4.25,5.22 0.77,2.31 1.92,-1.53 0.78,0.39 -0.01,1.92 -1.54,4.2 1.93,2.31 0,1.15 -3.47,5.72 -1.92,4.97 -2.31,1.13 -0.77,1.53 2.69,1.54 1.92,4.99 6.54,3.86 10,0.83 -0.38,3.82 -1.54,-0.01 -0.39,0.77 0.02,9.89 0,0 -4.21,-1.19 -3.23,-2.63 -1.37,-2.25 -5.08,-3.51 -5.92,-0.25 -2.57,2.07 1.38,7.26 -0.96,1.38 -1.2,0.06 -7.05,-2.25 -2.39,-3.88 -0.42,-4.26 -3.64,-1.82 -3.35,-0.19 -4.72,-1.56 -10.34,-0.81 -6.93,0.37 -2.99,-1.06 -10.46,0.43 0,0 -0.3,-2.36 1.85,-3.46 0,-1.79 -3.17,-2.08 -7.65,1.52 -3.29,1.38 -2.38,-3.17 -2.24,-1.11 -0.66,-2.9 -1.18,-1.8 -2.37,-0.97 -1.72,1.25 -1.19,2.76 0,2.49 -2.76,1.52 1.31,2.35 5.01,3.59 1.32,1.8 0.13,5.53 -2.37,2.48 -0.17,2.24 0,0 -2.73,1.13 -3,-0.69 0,0 1.05,-3.41 -1.54,-1.16 -0.38,-2.29 -1.15,0.37 0.77,-3.05 -0.39,-1.15 -3.08,3.42 -1.92,-0.39 -1.54,-2.31 -1.92,-0.01 -1.54,1.14 0,1.53 -1.15,0.38 0.38,-4.21 -3.07,-0.02 -0.39,-1.15 0,-0.76 3.08,0.02 0.77,-0.76 -1.54,-2.31 -0.38,-2.68 -2.7,-1.93 -1.15,-2.3 -1.15,0.37 0,1.53 -3.08,0.37 -2.31,-0.4 -0.77,-1.53 0.39,-1.53 -0.77,-3.45 -1.15,-1.16 0,-1.91 -1.54,-0.39 -2.31,-4.22 -0.38,-3.07 -1.93,-1.54 0.78,-6.13 1.54,-0.37 1.15,1.54 0.77,0 0.38,-1.53 -1.15,-2.69 -2.69,-3.08 0.39,-3.06 -1.16,-1.92 0,-2.68 -3.46,-5 0,-2.3 0.77,-1.53 z"
     title="Santo Domingo"
     id="DO-32"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>
  <path
     d="m 187.56609,41.32093 2.29,1.54 3.46,1.18 7.69,0.81 2.31,1.17 1.54,4.64 4.61,1.95 4.23,0.03 1.93,-1.15 1.92,0.01 4.61,4.65 4.62,2.73 1.54,0.01 0.38,1.92 3.46,3.49 1.54,-0.76 1.92,1.94 1.54,0.39 8.47,0.44 0,0 -1.16,5.38 0,3.09 -1.93,2.68 -0.38,2.31 -1.54,1.15 -1.16,2.69 -1.15,-0.01 -6.54,-5.04 -1.53,-0.78 -0.39,0.38 0,2.7 1.92,1.94 -0.77,2.69 2.69,2.32 1.16,-0.76 0.77,1.93 1.92,0.01 2.31,1.17 -1.16,5.39 -1.92,3.45 0,3.08 2.3,3.48 5,2.34 -2.31,3.06 -3.08,0.37 -2.3,-0.78 -2.7,-0.02 -3.07,1.52 -1.54,-1.16 -3.85,-0.41 -2.31,-3.09 -1.54,3.07 -1.92,1.15 -7.31,0.34 -3.84,-1.56 -3.85,-2.72 -1.15,0 -3.08,-1.94 0,0 -3.08,-0.41 -2.69,0.76 -3.08,-0.02 -5,-3.11 -2.69,-0.01 -2.31,-1.17 -1.92,-0.01 -0.77,-0.78 -0.38,-4.62 -1.54,-1.55 0,-4.62 0,0 1.55,-3.08 1.53,-1.14 0,-1.93 0.77,-1.53 -0.38,-5.03 -2.69,-6.16 0.77,-2.31 3.47,0.81 1.14,-1.17 0.77,1.17 0.78,0 0,-6.19 -1.92,-4.63 0,-1.54 0.78,-1.15 0,-3.48 1.91,-1.91 z"
     title="Valverde"
     id="DO-27"  fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinejoin="round"/>

        {/*  City markers  */}
        
  {/*  Santo Domingo  */}
  <g>
    <circle cx="446.3" cy="326.8" r="24" fill="#F26000" opacity="0.2"><animate attributeName="r" values="22;30;22" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.25;0.05;0.25" dur="2s" repeatCount="indefinite"/></circle>
    <circle cx="446.3" cy="326.8" r="16" fill="#F26000" stroke="white" strokeWidth="2.5" filter="url(#dropshadow)"/>
    <circle cx="446.3" cy="326.8" r="6" fill="white"/>
    <rect x="391.3" y="270.8" width="110" height="32" rx="8" ry="8" fill="white" opacity="0.93" filter="url(#dropshadow)"/>
    <text x="446.3" y="283.8" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="10" fontWeight="800" fill="#C24D00">Santo Domingo</text>
    <text x="446.3" y="295.8" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="9" fontWeight="600" fill="#F26000">500+ profesionales</text>
  </g>
  {/*  Santiago  */}
  <g>
    <circle cx="282.4" cy="108.6" r="24" fill="#F26000" opacity="0.2"><animate attributeName="r" values="22;30;22" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.25;0.05;0.25" dur="2s" repeatCount="indefinite"/></circle>
    <circle cx="282.4" cy="108.6" r="16" fill="#F26000" stroke="white" strokeWidth="2.5" filter="url(#dropshadow)"/>
    <circle cx="282.4" cy="108.6" r="6" fill="white"/>
    <rect x="227.39999999999998" y="52.599999999999994" width="110" height="32" rx="8" ry="8" fill="white" opacity="0.93" filter="url(#dropshadow)"/>
    <text x="282.4" y="65.6" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="10" fontWeight="800" fill="#C24D00">Santiago</text>
    <text x="282.4" y="77.6" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="9" fontWeight="600" fill="#F26000">200+ profesionales</text>
  </g>
  {/*  La Vega  */}
  <g>
    
    <circle cx="317.4" cy="160.7" r="11" fill="#FF8C42" stroke="white" strokeWidth="2.5" filter="url(#dropshadow)"/>
    <circle cx="317.4" cy="160.7" r="4" fill="white"/>
    <rect x="262.4" y="104.69999999999999" width="110" height="32" rx="8" ry="8" fill="white" opacity="0.93" filter="url(#dropshadow)"/>
    <text x="317.4" y="117.69999999999999" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="10" fontWeight="800" fill="#C24D00">La Vega</text>
    <text x="317.4" y="129.7" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="9" fontWeight="600" fill="#F26000">En crecimiento</text>
  </g>
  {/*  La Romana  */}
  <g>
    
    <circle cx="652.8" cy="340.1" r="11" fill="#FF8C42" stroke="white" strokeWidth="2.5" filter="url(#dropshadow)"/>
    <circle cx="652.8" cy="340.1" r="4" fill="white"/>
    <rect x="597.8" y="284.1" width="110" height="32" rx="8" ry="8" fill="white" opacity="0.93" filter="url(#dropshadow)"/>
    <text x="652.8" y="297.1" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="10" fontWeight="800" fill="#C24D00">La Romana</text>
    <text x="652.8" y="309.1" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="9" fontWeight="600" fill="#F26000">En crecimiento</text>
  </g>
  {/*  Puerto Plata  */}
  <g>
    
    <circle cx="282.9" cy="31.4" r="11" fill="#FFB380" stroke="white" strokeWidth="2.5" filter="url(#dropshadow)"/>
    <circle cx="282.9" cy="31.4" r="4" fill="white"/>
    <rect x="227.89999999999998" y="61.4" width="110" height="32" rx="8" ry="8" fill="white" opacity="0.93" filter="url(#dropshadow)"/>
    <text x="282.9" y="74.4" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="10" fontWeight="800" fill="#C24D00">Puerto Plata</text>
    <text x="282.9" y="86.4" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="9" fontWeight="600" fill="#F26000">Próximamente</text>
  </g>
  {/*  Punta Cana  */}
  <g>
    
    <circle cx="775.0" cy="308.3" r="11" fill="#FFB380" stroke="white" strokeWidth="2.5" filter="url(#dropshadow)"/>
    <circle cx="775.0" cy="308.3" r="4" fill="white"/>
    <rect x="677" y="252.3" width="110" height="32" rx="8" ry="8" fill="white" opacity="0.93" filter="url(#dropshadow)"/>
    <text x="775.0" y="265.3" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="10" fontWeight="800" fill="#C24D00">Punta Cana</text>
    <text x="775.0" y="277.3" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="9" fontWeight="600" fill="#F26000">Próximamente</text>
  </g>
  {/*  San Pedro  */}
  <g>
    
    <circle cx="581.1" cy="332.7" r="11" fill="#FF8C42" stroke="white" strokeWidth="2.5" filter="url(#dropshadow)"/>
    <circle cx="581.1" cy="332.7" r="4" fill="white"/>
    <rect x="526.1" y="276.7" width="110" height="32" rx="8" ry="8" fill="white" opacity="0.93" filter="url(#dropshadow)"/>
    <text x="581.1" y="289.7" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="10" fontWeight="800" fill="#C24D00">San Pedro</text>
    <text x="581.1" y="301.7" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="9" fontWeight="600" fill="#F26000">En crecimiento</text>
  </g>

        {/*  Ocean labels  */}
        <text x="400" y="18" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="13" fill="rgba(255,255,255,0.45)" fontStyle={{}} fontWeight="600">Océano Atlántico</text>
        <text x="400" y="542" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="13" fill="rgba(255,255,255,0.45)" fontStyle={{}} fontWeight="600">Mar Caribe</text>

        {/*  North indicator  */}
        <g transform="translate(755,40)">
          <circle cx="0" cy="0" r="18" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
          <polygon points="0,-11 -5,6 0,3 5,6" fill="white"/>
          <text x="0" y="22" textAnchor="middle" fontFamily="Nunito,sans-serif" fontSize="10" fill="white" fontWeight="800">N</text>
        </g>
      </svg>
    </div>

    {/*  City badges  */}
    <div style={{"display": "flex", "gap": "10px", "justifyContent": "center", "flexWrap": "wrap", "marginBottom": "20px"}}>
      <span style={{"display": "inline-flex", "alignItems": "center", "gap": "7px", "background": "#F26000", "color": "#fff", "padding": "9px 18px", "borderRadius": "50px", "fontWeight": "800", "fontSize": "13px", "boxShadow": "0 4px 14px rgba(242,96,0,0.35)"}}>
        <span style={{"width": "9px", "height": "9px", "background": "#fff", "borderRadius": "50%", "animation": "pulse 1.5s infinite"}}></span>Santo Domingo
      </span>
      <span style={{"display": "inline-flex", "alignItems": "center", "gap": "7px", "background": "#F26000", "color": "#fff", "padding": "9px 18px", "borderRadius": "50px", "fontWeight": "800", "fontSize": "13px", "boxShadow": "0 4px 14px rgba(242,96,0,0.35)"}}>
        <span style={{"width": "9px", "height": "9px", "background": "#fff", "borderRadius": "50%", "animation": "pulse 1.5s infinite"}}></span>Santiago
      </span>
      <span style={{"display": "inline-flex", "alignItems": "center", "gap": "7px", "background": "#FF8C42", "color": "#fff", "padding": "9px 18px", "borderRadius": "50px", "fontWeight": "800", "fontSize": "13px"}}>
        <span style={{"width": "9px", "height": "9px", "background": "#fff", "borderRadius": "50%"}}></span>La Vega
      </span>
      <span style={{"display": "inline-flex", "alignItems": "center", "gap": "7px", "background": "#FF8C42", "color": "#fff", "padding": "9px 18px", "borderRadius": "50px", "fontWeight": "800", "fontSize": "13px"}}>
        <span style={{"width": "9px", "height": "9px", "background": "#fff", "borderRadius": "50%"}}></span>La Romana
      </span>
      <span style={{"display": "inline-flex", "alignItems": "center", "gap": "7px", "background": "#FF8C42", "color": "#fff", "padding": "9px 18px", "borderRadius": "50px", "fontWeight": "800", "fontSize": "13px"}}>
        <span style={{"width": "9px", "height": "9px", "background": "#fff", "borderRadius": "50%"}}></span>San Pedro de Macorís
      </span>
      <span style={{"display": "inline-flex", "alignItems": "center", "gap": "7px", "background": "#FFD4B8", "color": "#C24D00", "padding": "9px 18px", "borderRadius": "50px", "fontWeight": "800", "fontSize": "13px", "border": "2px dashed #F26000"}}>
        🚀 Puerto Plata
      </span>
      <span style={{"display": "inline-flex", "alignItems": "center", "gap": "7px", "background": "#FFD4B8", "color": "#C24D00", "padding": "9px 18px", "borderRadius": "50px", "fontWeight": "800", "fontSize": "13px", "border": "2px dashed #F26000"}}>
        🚀 Punta Cana
      </span>
    </div>

    {/*  Legend  */}
    <div style={{"display": "flex", "gap": "20px", "justifyContent": "center", "flexWrap": "wrap", "marginBottom": "18px", "fontSize": "12px", "fontWeight": "700", "color": "#888"}}>
      <span style={{"display": "flex", "alignItems": "center", "gap": "6px"}}><span style={{"width": "12px", "height": "12px", "background": "#F26000", "borderRadius": "50%", "border": "2px solid white", "boxShadow": "0 0 0 3px rgba(242,96,0,0.3)", "display": "inline-block"}}></span>Activo</span>
      <span style={{"display": "flex", "alignItems": "center", "gap": "6px"}}><span style={{"width": "12px", "height": "12px", "background": "#FF8C42", "borderRadius": "50%", "border": "2px solid white", "display": "inline-block"}}></span>En crecimiento</span>
      <span style={{"display": "flex", "alignItems": "center", "gap": "6px"}}><span style={{"width": "12px", "height": "12px", "background": "#FFB380", "borderRadius": "50%", "border": "2px dashed #F26000", "display": "inline-block"}}></span>Próximamente</span>
    </div>

    {/*  CTA  */}
    <div style={{"textAlign": "center", "background": "white", "borderRadius": "16px", "padding": "18px 24px", "boxShadow": "0 4px 20px rgba(242,96,0,0.1)"}}>
      <p style={{"fontSize": "14px", "color": "#444", "marginBottom": "12px"}}>
        ¿No está tu ciudad? <strong style={{"color": "#F26000"}}>¡Pronto llegamos!</strong> Escríbenos y te avisamos.
      </p>
      <a href="https://wa.me/18099090455?text=Hola%2C%20quiero%20que%20Listo%20Patr%C3%B3n%20llegue%20a%20mi%20ciudad" target="_blank"
        style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "background": "#25D366", "color": "#fff", "padding": "11px 24px", "borderRadius": "50px", "textDecoration": "none", "fontWeight": "800", "fontSize": "14px", "boxShadow": "0 4px 16px rgba(37,211,102,0.4)"}}>
        💬 Avísame cuando llegues
      </a>
    </div>

  </div>
</section>
{/*  COMO FUNCIONA  */}
<section className="how-section" id="como-funciona">
  <div className="section-inner">
    <div className="chip sr">⚡ Paso a paso</div>
    <h2 className="section-title sr sr-delay-1">¿Cómo <span>funciona</span>?</h2>
    <p className="section-sub">En minutos tienes un profesional verificado en camino a tu puerta.</p>
    <div className="steps-grid">
      <div className="step sr sr-delay-1">
        <div className="step-num">01</div>
        <span className="step-icon">🔍</span>
        <h3>Busca el servicio</h3>
        <p>Elige la categoría y explora profesionales verificados cerca de ti en tiempo real.</p>
      </div>
      <div className="step sr sr-delay-2">
        <div className="step-num">02</div>
        <span className="step-icon">📅</span>
        <h3>Reserva al instante</h3>
        <p>Selecciona fecha, hora y dirección. Sin llamadas, sin esperas innecesarias.</p>
      </div>
      <div className="step sr sr-delay-3">
        <div className="step-num">03</div>
        <span className="step-icon">📍</span>
        <h3>Seguimiento en vivo</h3>
        <p>Ve en el mapa cómo el profesional se dirige a tu ubicación en tiempo real.</p>
      </div>
      <div className="step sr sr-delay-4">
        <div className="step-num">04</div>
        <span className="step-icon">✅</span>
        <h3>¡Listo, patrón!</h3>
        <p>Confirma el trabajo, paga seguro y deja tu reseña al profesional.</p>
      </div>
    </div>
  </div>
</section>

{/*  PARA PROFESIONALES  */}
<section className="pro-section" id="profesionales">
  <div className="pro-bg-circle1"></div>
  <div className="pro-bg-circle2"></div>
  <div className="section-inner">
    <div className="pro-inner">
      <div>
        <div style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "background": "rgba(242,96,0,0.15)", "border": "1px solid rgba(242,96,0,0.3)", "color": "var(--orange)", "padding": "8px 20px", "borderRadius": "50px", "fontSize": "13px", "fontWeight": "700", "marginBottom": "16px", "animation": "blink 3s ease-in-out infinite"}}>
            <span style={{"width": "8px", "height": "8px", "borderRadius": "50%", "background": "var(--orange)", "display": "inline-block"}}></span>
            🔧 Para profesionales
          </div>
        <h2 className="pro-title">Gana más trabajando<br/>con Listo</h2>
        <p className="pro-sub">Únete a la red de profesionales más confiable de República Dominicana y consigue clientes todos los días.</p>
        <div className="free-tag">🎉 &nbsp;1 mes GRATIS · Plan Básico incluido</div>
        <div className="pro-perks">
          <div className="perk"><span className="perk-icon">📱</span><p><strong>Más clientes sin esfuerzo</strong> — ellos te encuentran a ti</p></div>
          <div className="perk"><span className="perk-icon">💬</span><p><strong>Chat y llamadas integradas</strong> — comunícate directo</p></div>
          <div className="perk"><span className="perk-icon">📍</span><p><strong>Tracking en vivo</strong> — el cliente sabe dónde estás</p></div>
          <div className="perk"><span className="perk-icon">💳</span><p><strong>Cobros seguros</strong> — efectivo o transferencia</p></div>
          <div className="perk"><span className="perk-icon">⭐</span><p><strong>Reputación verificada</strong> — tus reseñas te abren puertas</p></div>
        </div>
        <a onClick={() => navigate('login')} className="btn-white" style={{cursor: "pointer", "display": "inline-flex"}}>🚀 Postularme ahora — Es gratis</a>
      </div>
      <div className="pro-visual">
        <div className="pro-card">
          <div className="pro-card-av" style={{"overflow": "hidden"}}><img src="./assets/extracted_26.jpeg" style={{"width": "100%", "height": "100%", "objectFit": "cover", "borderRadius": "50%"}} loading="lazy"/></div>
          <div className="pro-card-info">
            <div className="pro-card-name">Carlos Méndez</div>
            <div className="pro-card-role">Electricista · Santo Domingo</div>
            <div className="pro-card-stars">★★★★★ 4.9 · 127 trabajos</div>
          </div>
          <div className="pro-card-earn">+RD$45k</div>
        </div>
        <div className="pro-card">
          <div className="pro-card-av" style={{"overflow": "hidden"}}><img src="./assets/extracted_27.jpeg" style={{"width": "100%", "height": "100%", "objectFit": "cover", "borderRadius": "50%"}} loading="lazy"/></div>
          <div className="pro-card-info">
            <div className="pro-card-name">Ana Rodríguez</div>
            <div className="pro-card-role">Plomera · Santiago</div>
            <div className="pro-card-stars">★★★★★ 5.0 · 89 trabajos</div>
          </div>
          <div className="pro-card-earn">+RD$38k</div>
        </div>
        <div className="pro-card">
          <div className="pro-card-av" style={{"overflow": "hidden"}}><img src="./assets/extracted_28.jpeg" style={{"width": "100%", "height": "100%", "objectFit": "cover", "borderRadius": "50%"}} loading="lazy"/></div>
          <div className="pro-card-info">
            <div className="pro-card-name">José Fernández</div>
            <div className="pro-card-role">Mecánico · La Romana</div>
            <div className="pro-card-stars">★★★★☆ 4.7 · 203 trabajos</div>
          </div>
          <div className="pro-card-earn">+RD$62k</div>
        </div>
        <div style={{"background": "#fff", "border": "1px solid rgba(255,255,255,0.9)", "borderRadius": "16px", "padding": "18px 20px", "display": "flex", "alignItems": "center", "gap": "14px"}}>
          <span style={{"fontSize": "28px"}}>🏆</span>
          <div>
            <div style={{"fontWeight": "800", "color": "#222", "fontSize": "14px"}}>Top profesionales del mes</div>
            <div style={{"color": "#666", "fontSize": "13px", "marginTop": "2px"}}>Ganan hasta RD$80,000+ mensuales</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/*  TESTIMONIOS  */}
<section className="testi-section" id="testimonios">
  <div className="section-inner">
    <div className="chip sr">💬 Testimonios reales</div>
    <h2 className="section-title">Lo que dicen<br/><span>nuestros usuarios</span></h2>
    <p className="section-sub">Más de 500 profesionales y clientes satisfechos en toda la República Dominicana.</p>

    {/*  Stats strip  */}
    <div style={{"display": "flex", "flexWrap": "wrap", "gap": "16px", "marginBottom": "10px", "justifyContent": "center"}}>
      <div style={{"display": "flex", "alignItems": "center", "gap": "10px", "background": "#fff", "border": "1.5px solid var(--orange-pale2)", "borderRadius": "14px", "padding": "12px 20px"}}>
        <span style={{"fontSize": "22px"}}>⭐</span>
        <div><div style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "22px", "color": "var(--orange)", "lineHeight": "1"}}>4.9/5</div><div style={{"fontSize": "11px", "color": "#888"}}>Calificación promedio</div></div>
      </div>
      <div style={{"display": "flex", "alignItems": "center", "gap": "10px", "background": "#fff", "border": "1.5px solid var(--orange-pale2)", "borderRadius": "14px", "padding": "12px 20px"}}>
        <span style={{"fontSize": "22px"}}>💬</span>
        <div><div style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "22px", "color": "var(--orange)", "lineHeight": "1"}}>1,200+</div><div style={{"fontSize": "11px", "color": "#888"}}>Reseñas verificadas</div></div>
      </div>
      <div style={{"display": "flex", "alignItems": "center", "gap": "10px", "background": "#fff", "border": "1.5px solid var(--orange-pale2)", "borderRadius": "14px", "padding": "12px 20px"}}>
        <span style={{"fontSize": "22px"}}>🔄</span>
        <div><div style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "22px", "color": "var(--orange)", "lineHeight": "1"}}>94%</div><div style={{"fontSize": "11px", "color": "#888"}}>Clientes regresan</div></div>
      </div>
    </div>
    <div className="testi-grid">
      <div className="testi-card">
        <div style={{"display": "flex", "gap": "6px", "marginBottom": "10px"}}>
          <span style={{"color": "var(--orange)", "fontSize": "18px"}}>★★★★★</span>
          <span style={{"background": "var(--orange-pale)", "color": "var(--orange)", "fontSize": "11px", "fontWeight": "800", "padding": "3px 10px", "borderRadius": "50px", "alignSelf": "center"}}>CLIENTE</span>
        </div>
        <p className="testi-text">"En menos de 20 minutos tenía un plomero en mi casa. La app es facilísima y el seguimiento en el mapa me dio mucha tranquilidad. 10/10."</p>
        <div className="testi-author">
          <div className="testi-av"><img src="./assets/extracted_29.jpeg" alt="María Altagracia" loading="lazy"/></div>
          <div>
            <div className="testi-name">María Altagracia</div>
            <div className="testi-role">Cliente · Santo Domingo</div>
            <div style={{"fontSize": "11px", "color": "#aaa", "marginTop": "2px"}}>hace 2 días</div>
          </div>
        </div>
      </div>
      <div className="testi-card">
        <div style={{"display": "flex", "gap": "6px", "marginBottom": "10px"}}>
          <span style={{"color": "var(--orange)", "fontSize": "18px"}}>★★★★★</span>
          <span style={{"background": "#E8F5E9", "color": "#2E7D32", "fontSize": "11px", "fontWeight": "800", "padding": "3px 10px", "borderRadius": "50px", "alignSelf": "center"}}>PROFESIONAL</span>
        </div>
        <p className="testi-text">"Desde que me uní tengo trabajo todos los días. La comisión es justa y el sistema de pagos es transparente. Gané RD$47,000 el mes pasado."</p>
        <div className="testi-author">
          <div className="testi-av"><img src="./assets/extracted_30.jpeg" alt="Juan Rosario" loading="lazy"/></div>
          <div>
            <div className="testi-name">Juan Rosario</div>
            <div className="testi-role">Albañil · Santiago ✓ Verificado</div>
            <div style={{"fontSize": "11px", "color": "#aaa", "marginTop": "2px"}}>hace 5 días</div>
          </div>
        </div>
      </div>
      <div className="testi-card">
        <div style={{"display": "flex", "gap": "6px", "marginBottom": "10px"}}>
          <span style={{"color": "var(--orange)", "fontSize": "18px"}}>★★★★★</span>
          <span style={{"background": "var(--orange-pale)", "color": "var(--orange)", "fontSize": "11px", "fontWeight": "800", "padding": "3px 10px", "borderRadius": "50px", "alignSelf": "center"}}>CLIENTE</span>
        </div>
        <p className="testi-text">"El chat con el profesional antes de que llegue es increíble. Todo queda acordado y sin sorpresas al pagar. Ya lo usé 3 veces."</p>
        <div className="testi-author">
          <div className="testi-av"><img src="./assets/extracted_31.jpeg" alt="Carmen Pérez" loading="lazy"/></div>
          <div>
            <div className="testi-name">Carmen Pérez</div>
            <div className="testi-role">Cliente · La Romana</div>
            <div style={{"fontSize": "11px", "color": "#aaa", "marginTop": "2px"}}>hace 1 semana</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

{/*  PLANES  */}
<section className="planes-section" id="planes">
  <div className="section-inner">
    <div className="chip sr" style={{"margin": "0 auto 16px", "display": "table"}}>💎 Planes para profesionales</div>
    <h2 className="section-title">Elige tu <span>plan</span></h2>
    <p className="section-sub" style={{"margin": "0 auto 24px"}}>Descarga la app, postúlate como profesional y elige el plan que más te convenga.</p>

    {/*  Banner descarga app  */}
    <div style={{"display": "inline-flex", "alignItems": "center", "gap": "14px", "background": "var(--orange-pale)", "border": "2px solid var(--orange-pale2)", "borderRadius": "18px", "padding": "16px 28px", "marginBottom": "10px", "flexWrap": "wrap", "justifyContent": "center"}}>
      <span style={{"fontSize": "28px"}}>📲</span>
      <div style={{"textAlign": "left"}}>
        <div style={{"fontWeight": "800", "fontSize": "15px", "color": "#222"}}>Los planes se contratan desde la app</div>
        <div style={{"fontSize": "13px", "color": "var(--gray)", "marginTop": "2px"}}>Descarga Listo Patrón, crea tu perfil de profesional y elige tu plan en segundos.</div>
      </div>
      <a onClick={() => navigate('login')} style={{cursor: "pointer", "background": "var(--orange)", "color": "#fff", "padding": "10px 22px", "borderRadius": "50px", "fontWeight": "800", "fontSize": "14px", "textDecoration": "none", "whiteSpace": "nowrap", "boxShadow": "0 4px 14px rgba(242,96,0,0.35)", "transition": "transform .2s,box-shadow .2s"}} onMouseOver={() => { this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(242,96,0,0.5)' }} onMouseOut={() => { this.style.transform='';this.style.boxShadow='0 4px 14px rgba(242,96,0,0.35)' }}>🚀 Descargar app</a>
    </div>
    <div className="planes-wrap" style={{"gridTemplateColumns": "repeat(auto-fit,minmax(220px,1fr))", "maxWidth": "1100px"}}>
    {/*  styles extracted  */}
    <div className="planes-wrap" style={{"gridTemplateColumns": "repeat(auto-fit,minmax(220px,1fr))", "maxWidth": "960px", "margin": "0 auto", "gap": "12px", "display": "grid"}}>

      {/*  PLAN 1: BÁSICO / ESTÁNDAR  */}
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="plan-3d-wrap plan-3d-standard">
        <div className="plan-3d-blur" style={{"position": "absolute", "bottom": "-7px", "left": "7px", "right": "-2px", "height": "100%", "borderRadius": "18px", "opacity": "0.28", "filter": "blur(5px)", "zIndex": "0"}}></div>
        <div className="plan-3d-inner">
          <div className="plan-3d-shine-top"></div>
          <div className="plan-3d-badge">BÁSICO</div>
          <div className="plan-3d-num">1</div>
          <div style={{"marginTop": "12px", "position": "relative"}}><span className="plan-3d-emoji">🔹</span></div>
          <p style={{"fontSize": "12px", "fontWeight": "800", "color": "white", "margin": "6px 0 0", "textShadow": "0 1px 4px rgba(0,0,0,0.4)", "textAlign": "center", "lineHeight": "1.2"}}>Plan Básico</p>
          <p style={{"fontSize": "10px", "color": "rgba(255,255,255,0.85)", "margin": "0", "fontWeight": "600"}}>⭐ 0-3.9 | 3 contratos</p>
          <div className="plan-3d-price-box"><p style={{"fontSize": "13px", "fontWeight": "900", "color": "white", "margin": "0", "textShadow": "0 1px 4px rgba(0,0,0,0.5)"}}>RD$500</p></div>
          <p style={{"fontSize": "8px", "color": "rgba(255,255,255,0.6)", "margin": "4px 0 0", "letterSpacing": "0.5px"}}>TAP PARA VER →</p>
        </div>
      </a>

      {/*  PLAN 2: GOLD  */}
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="plan-3d-wrap plan-3d-gold">
        <div className="plan-3d-blur" style={{"position": "absolute", "bottom": "-7px", "left": "7px", "right": "-2px", "height": "100%", "borderRadius": "18px", "opacity": "0.28", "filter": "blur(5px)", "zIndex": "0"}}></div>
        <div className="plan-3d-inner">
          <div className="plan-3d-shine-top"></div>
          <div className="plan-3d-badge">POPULAR</div>
          <div className="plan-3d-num">2</div>
          <div style={{"marginTop": "12px", "position": "relative"}}><span className="plan-3d-emoji">🥇</span></div>
          <p style={{"fontSize": "12px", "fontWeight": "800", "color": "white", "margin": "6px 0 0", "textShadow": "0 1px 4px rgba(0,0,0,0.4)", "textAlign": "center", "lineHeight": "1.2"}}>Plan Gold</p>
          <p style={{"fontSize": "10px", "color": "rgba(255,255,255,0.85)", "margin": "0", "fontWeight": "600"}}>⭐ 4.0-4.7 | 8 contratos</p>
          <div className="plan-3d-price-box"><p style={{"fontSize": "13px", "fontWeight": "900", "color": "white", "margin": "0", "textShadow": "0 1px 4px rgba(0,0,0,0.5)"}}>RD$1,000</p></div>
          <p style={{"fontSize": "8px", "color": "rgba(255,255,255,0.6)", "margin": "4px 0 0", "letterSpacing": "0.5px"}}>TAP PARA VER →</p>
        </div>
      </a>

      {/*  PLAN 3: PLATINUM  */}
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="plan-3d-wrap plan-3d-platinum">
        <div className="plan-3d-blur" style={{"position": "absolute", "bottom": "-7px", "left": "7px", "right": "-2px", "height": "100%", "borderRadius": "18px", "opacity": "0.28", "filter": "blur(5px)", "zIndex": "0"}}></div>
        <div className="plan-3d-inner">
          <div className="plan-3d-shine-top"></div>
          <div className="plan-3d-badge">ACTIVO</div>
          <div className="plan-3d-num">3</div>
          <div style={{"marginTop": "12px", "position": "relative"}}><span className="plan-3d-emoji">🥈</span></div>
          <p style={{"fontSize": "12px", "fontWeight": "800", "color": "white", "margin": "6px 0 0", "textShadow": "0 1px 4px rgba(0,0,0,0.4)", "textAlign": "center", "lineHeight": "1.2"}}>Plan Platinum</p>
          <p style={{"fontSize": "10px", "color": "rgba(255,255,255,0.85)", "margin": "0", "fontWeight": "600"}}>⭐ 4.5-4.7 | 15 contratos</p>
          <div className="plan-3d-price-box"><p style={{"fontSize": "13px", "fontWeight": "900", "color": "white", "margin": "0", "textShadow": "0 1px 4px rgba(0,0,0,0.5)"}}>RD$1,500</p></div>
          <p style={{"fontSize": "8px", "color": "rgba(255,255,255,0.6)", "margin": "4px 0 0", "letterSpacing": "0.5px"}}>TAP PARA VER →</p>
        </div>
      </a>

      {/*  PLAN 4: VIP  */}
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="plan-3d-wrap plan-3d-vip">
        <div className="plan-3d-blur" style={{"position": "absolute", "bottom": "-7px", "left": "7px", "right": "-2px", "height": "100%", "borderRadius": "18px", "opacity": "0.28", "filter": "blur(5px)", "zIndex": "0"}}></div>
        <div className="plan-3d-inner">
          <div className="plan-3d-shine-top"></div>
          <div className="plan-3d-badge">ÉLITE</div>
          <div className="plan-3d-num">4</div>
          <div style={{"marginTop": "12px", "position": "relative"}}>
            <span className="plan-3d-emoji">💎</span>
            <span style={{"position": "absolute", "top": "-8px", "right": "-13px", "fontSize": "13px", "animation": "twinkle 0.8s ease-in-out infinite alternate"}}>✨</span>
            <span style={{"position": "absolute", "bottom": "-5px", "left": "-11px", "fontSize": "11px", "animation": "twinkle 1.2s ease-in-out infinite alternate"}}>⭐</span>
          </div>
          <p style={{"fontSize": "12px", "fontWeight": "800", "color": "white", "margin": "6px 0 0", "textShadow": "0 1px 4px rgba(0,0,0,0.4)", "textAlign": "center", "lineHeight": "1.2"}}>Plan VIP</p>
          <p style={{"fontSize": "10px", "color": "rgba(255,255,255,0.85)", "margin": "0", "fontWeight": "600"}}>⭐ 4.8-5.0 | ∞ contratos</p>
          <div className="plan-3d-price-box"><p style={{"fontSize": "13px", "fontWeight": "900", "color": "white", "margin": "0", "textShadow": "0 1px 4px rgba(0,0,0,0.5)"}}>RD$2,500/mes</p></div>
          <p style={{"fontSize": "8px", "color": "rgba(255,255,255,0.6)", "margin": "4px 0 0", "letterSpacing": "0.5px"}}>TAP PARA VER →</p>
        </div>
      </a>
      </div>

    </div>

    {/*  Tabla comparativa  */}
    <div style={{"marginTop": "72px", "overflowX": "auto"}}>
      <h3 style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "28px", "textAlign": "center", "marginBottom": "18px", "color": "#222"}}>Compara todos los <span style={{"color": "var(--orange)"}}>beneficios</span></h3>
      <table style={{"width": "100%", "maxWidth": "900px", "margin": "0 auto", "borderCollapse": "separate", "borderSpacing": "0", "fontSize": "14px"}}>
        <thead>
          <tr>
            <th style={{"textAlign": "left", "padding": "14px 20px", "background": "#f9fafb", "borderRadius": "12px 0 0 0", "fontSize": "13px", "color": "#888", "fontWeight": "700", "borderBottom": "2px solid #f0f0f0"}}>Beneficio</th>
            <th style={{"textAlign": "center", "padding": "14px 16px", "background": "#f0fff4", "color": "#16a34a", "fontFamily": "'Fredoka One',cursive", "fontSize": "15px", "borderBottom": "2px solid #bbf7d0"}}>Básico ⚪<br /><span style={{"fontSize": "12px", "fontWeight": "600", "color": "#666"}}>⭐ 0-3.9</span></th>
            <th style={{"textAlign": "center", "padding": "14px 16px", "background": "#fffbeb", "color": "#B8860B", "fontFamily": "'Fredoka One',cursive", "fontSize": "15px", "borderBottom": "2px solid #fde68a"}}>Gold 🟡<br /><span style={{"fontSize": "12px", "fontWeight": "600", "color": "#666"}}>⭐ 4.0-4.7</span></th>
            <th style={{"textAlign": "center", "padding": "14px 16px", "background": "#f5f5f5", "color": "#555", "fontFamily": "'Fredoka One',cursive", "fontSize": "15px", "borderBottom": "2px solid #ddd"}}>Platinum ⚫<br /><span style={{"fontSize": "12px", "fontWeight": "600", "color": "#666"}}>⭐ 4.5-4.7</span></th>
            <th style={{"textAlign": "center", "padding": "14px 16px", "background": "linear-gradient(135deg,#F26000,#C24D00)", "color": "#fff", "fontFamily": "'Fredoka One',cursive", "fontSize": "15px", "borderRadius": "0 12px 0 0", "borderBottom": "2px solid rgba(255,255,255,0.3)"}}>VIP ⭐<br /><span style={{"fontSize": "12px", "fontWeight": "600", "color": "#fff", "textShadow": "0 1px 2px rgba(0,0,0,0.3)"}}>⭐ 4.8-5.0</span></th>
          </tr>
        </thead>
        <tbody>
          <tr style={{"borderBottom": "1px solid #f0f0f0"}}>
            <td style={{"padding": "14px 20px", "fontWeight": "700", "color": "#333"}}>Precio al mes</td>
            <td style={{"textAlign": "center", "padding": "14px", "color": "#16a34a", "fontWeight": "800"}}>RD$500</td>
            <td style={{"textAlign": "center", "padding": "14px", "color": "#B8860B", "fontWeight": "800"}}>RD$1,000</td>
            <td style={{"textAlign": "center", "padding": "14px", "color": "#555", "fontWeight": "800"}}>RD$1,500</td>
            <td style={{"textAlign": "center", "padding": "14px", "color": "var(--orange)", "fontWeight": "800"}}>RD$2,500</td>
          </tr>
          <tr style={{"background": "#fafafa", "borderBottom": "1px solid #f0f0f0"}}>
            <td style={{"padding": "14px 20px", "fontWeight": "700", "color": "#333"}}>Contratos al mes</td>
            <td style={{"textAlign": "center", "padding": "14px", "color": "#16a34a", "fontWeight": "800"}}>3</td>
            <td style={{"textAlign": "center", "padding": "14px", "color": "#B8860B", "fontWeight": "800"}}>8</td>
            <td style={{"textAlign": "center", "padding": "14px", "color": "#555", "fontWeight": "800"}}>15</td>
            <td style={{"textAlign": "center", "padding": "14px", "color": "var(--orange)", "fontWeight": "800"}}>∞ Ilimitados</td>
          </tr>
          <tr style={{"borderBottom": "1px solid #f0f0f0"}}>
            <td style={{"padding": "14px 20px", "fontWeight": "700", "color": "#333"}}>Visibilidad en búsquedas</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>Básica</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>Mejorada</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>Alta</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>Máxima N°1</td>
          </tr>
          <tr style={{"background": "#fafafa", "borderBottom": "1px solid #f0f0f0"}}>
            <td style={{"padding": "14px 20px", "fontWeight": "700", "color": "#333"}}>Etiquetas en perfil</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>❌</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>"Recomendado"</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>Badge Platinum</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>💎 VIP Exclusivo</td>
          </tr>
          <tr style={{"borderBottom": "1px solid #f0f0f0"}}>
            <td style={{"padding": "14px 20px", "fontWeight": "700", "color": "#333"}}>Soporte</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>Estándar</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>Estándar</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>Prioritario</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>⭐ VIP Inmediato</td>
          </tr>
          <tr style={{"background": "#fafafa", "borderBottom": "1px solid #f0f0f0"}}>
            <td style={{"padding": "14px 20px", "fontWeight": "700", "color": "#333"}}>Beneficios Extra</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>❌</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>❌</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>Clientes Premium</td>
            <td style={{"textAlign": "center", "padding": "14px"}}>Leads VIP y contacto directo</td>
          </tr>
        </tbody>
      </table>
      <p style={{"textAlign": "center", "marginTop": "24px", "fontSize": "13px", "color": "#aaa"}}>* Los contratos no vencen hasta ser usados (excepto VIP que es mensual)</p>
      <div style={{"display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "10px", "marginTop": "20px", "background": "#fff3ec", "borderRadius": "12px", "padding": "14px 24px", "maxWidth": "600px", "marginLeft": "auto", "marginRight": "auto", "border": "1.5px solid var(--orange-pale2)"}}>
        <span style={{"fontSize": "20px"}}>ℹ️</span>
        <p style={{"fontSize": "13px", "color": "#555", "margin": "0"}}>Para comprar un plan, descarga la app <strong style={{"color": "var(--orange)"}}>Listo Patrón</strong>, regístrate como profesional y selecciona el plan desde tu perfil.</p>
      </div>
    </div>

  </div>
</section>


{/*  PREGUNTAS CLIENTES VS PROFESIONALES  */}
<section style={{"background": "#fff", "padding": "40px 5%"}}>
  <div className="section-inner">

    <div style={{"textAlign": "center", "marginBottom": "28px"}}>
      <div style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "background": "#FFF3EC", "color": "#F26000", "padding": "6px 18px", "borderRadius": "50px", "fontSize": "11px", "fontWeight": "800", "letterSpacing": "1.5px", "textTransform": "uppercase", "marginBottom": "14px"}}>
        ❓ Resolvemos tus dudas
      </div>
      <h2 style={{"fontFamily": "'Fredoka One',cursive", "fontSize": "clamp(24px,4vw,42px)", "color": "#F26000", "lineHeight": "1.1", "marginBottom": "8px"}}>
        ¿Eres cliente o profesional?
      </h2>
      <p style={{"fontSize": "15px", "color": "#6B7280", "maxWidth": "460px", "margin": "0 auto"}}>
        Selecciona tu perfil y encuentra respuestas a tus preguntas.
      </p>
    </div>

    {/*  Tab buttons  */}
    <div style={{"display": "flex", "gap": "12px", "justifyContent": "center", "marginBottom": "28px"}}>
      <button id="tabCliente" onClick={() => { switchTab('cliente') }} style={{"display": "flex", "alignItems": "center", "gap": "8px", "background": "#F26000", "color": "#fff", "border": "none", "padding": "12px 28px", "borderRadius": "50px", "fontFamily": "'Nunito',sans-serif", "fontSize": "15px", "fontWeight": "800", "cursor": "pointer", "boxShadow": "0 4px 14px rgba(242,96,0,0.35)", "transition": "all .2s"}}>
        👤 Soy Cliente
      </button>
      <button id="tabPro" onClick={() => { switchTab('pro') }} style={{"display": "flex", "alignItems": "center", "gap": "8px", "background": "#FFF3EC", "color": "#F26000", "border": "2px solid #F26000", "padding": "12px 28px", "borderRadius": "50px", "fontFamily": "'Nunito',sans-serif", "fontSize": "15px", "fontWeight": "800", "cursor": "pointer", "transition": "all .2s"}}>
        🔧 Soy Profesional
      </button>
    </div>

    {/*  Cliente FAQs  */}
    <div id="faqCliente" style={{"maxWidth": "700px", "margin": "0 auto", "display": "flex", "flexDirection": "column", "gap": "12px"}}>
      
      <details style={{"background": "#FFF3EC", "borderRadius": "14px", "padding": "18px 20px", "border": "1px solid #FFD4B8", "cursor": "pointer"}}>
        <summary style={{"fontWeight": "800", "fontSize": "15px", "color": "#C24D00", "listStyle": "none", "display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
          ¿Cómo pido un servicio? <span style={{"fontSize": "20px", "color": "#F26000"}}>+</span>
        </summary>
        <p style={{"marginTop": "12px", "color": "#555", "fontSize": "14px", "lineHeight": "1.7"}}>Descarga la app, regístrate, busca el servicio que necesitas, selecciona un profesional verificado y confirma tu solicitud. En minutos tendrás una respuesta.</p>
      </details>

      <details style={{"background": "#FFF3EC", "borderRadius": "14px", "padding": "18px 20px", "border": "1px solid #FFD4B8", "cursor": "pointer"}}>
        <summary style={{"fontWeight": "800", "fontSize": "15px", "color": "#C24D00", "listStyle": "none", "display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
          ¿Los profesionales están verificados? <span style={{"fontSize": "20px", "color": "#F26000"}}>+</span>
        </summary>
        <p style={{"marginTop": "12px", "color": "#555", "fontSize": "14px", "lineHeight": "1.7"}}>Sí. Todos pasan por verificación de identidad, antecedentes penales, prueba de habilidades y sistema de reputación antes de ser activados.</p>
      </details>

      <details style={{"background": "#FFF3EC", "borderRadius": "14px", "padding": "18px 20px", "border": "1px solid #FFD4B8", "cursor": "pointer"}}>
        <summary style={{"fontWeight": "800", "fontSize": "15px", "color": "#C24D00", "listStyle": "none", "display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
          ¿Cuánto tiempo tarda en llegar? <span style={{"fontSize": "20px", "color": "#F26000"}}>+</span>
        </summary>
        <p style={{"marginTop": "12px", "color": "#555", "fontSize": "14px", "lineHeight": "1.7"}}>El tiempo promedio de respuesta es de 15 minutos. Puedes ver en el mapa en tiempo real dónde está el profesional camino a tu ubicación.</p>
      </details>

      <details style={{"background": "#FFF3EC", "borderRadius": "14px", "padding": "18px 20px", "border": "1px solid #FFD4B8", "cursor": "pointer"}}>
        <summary style={{"fontWeight": "800", "fontSize": "15px", "color": "#C24D00", "listStyle": "none", "display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
          ¿Cómo pago el servicio? <span style={{"fontSize": "20px", "color": "#F26000"}}>+</span>
        </summary>
        <p style={{"marginTop": "12px", "color": "#555", "fontSize": "14px", "lineHeight": "1.7"}}>Puedes pagar en efectivo o por transferencia bancaria directamente al profesional. El pago se confirma después de completar el servicio.</p>
      </details>

      <details style={{"background": "#FFF3EC", "borderRadius": "14px", "padding": "18px 20px", "border": "1px solid #FFD4B8", "cursor": "pointer"}}>
        <summary style={{"fontWeight": "800", "fontSize": "15px", "color": "#C24D00", "listStyle": "none", "display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
          ¿Qué pasa si no estoy satisfecho? <span style={{"fontSize": "20px", "color": "#F26000"}}>+</span>
        </summary>
        <p style={{"marginTop": "12px", "color": "#555", "fontSize": "14px", "lineHeight": "1.7"}}>Puedes dejar una reseña y contactar a soporte directamente desde la app. Los profesionales con calificaciones bajas son suspendidos automáticamente.</p>
      </details>

    </div>

    {/*  Profesional FAQs  */}
    <div id="faqPro" style={{"maxWidth": "700px", "margin": "0 auto", "display": "none", "flexDirection": "column", "gap": "12px"}}>

      <details style={{"background": "#FFF3EC", "borderRadius": "14px", "padding": "18px 20px", "border": "1px solid #FFD4B8", "cursor": "pointer"}}>
        <summary style={{"fontWeight": "800", "fontSize": "15px", "color": "#C24D00", "listStyle": "none", "display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
          ¿Cómo me registro como profesional? <span style={{"fontSize": "20px", "color": "#F26000"}}>+</span>
        </summary>
        <p style={{"marginTop": "12px", "color": "#555", "fontSize": "14px", "lineHeight": "1.7"}}>Descarga la app, selecciona "Soy profesional", completa tu perfil con tus datos, especialidad y documentos requeridos. El equipo de Listo revisará tu solicitud en 24-48 horas.</p>
      </details>

      <details style={{"background": "#FFF3EC", "borderRadius": "14px", "padding": "18px 20px", "border": "1px solid #FFD4B8", "cursor": "pointer"}}>
        <summary style={{"fontWeight": "800", "fontSize": "15px", "color": "#C24D00", "listStyle": "none", "display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
          ¿Cuánto cuesta unirse a Listo Patrón? <span style={{"fontSize": "20px", "color": "#F26000"}}>+</span>
        </summary>
        <p style={{"marginTop": "12px", "color": "#555", "fontSize": "14px", "lineHeight": "1.7"}}>El primer mes es completamente gratis con el Plan Básico incluido. Después puedes elegir el plan que más te convenga según tu volumen de trabajo.</p>
      </details>

      <details style={{"background": "#FFF3EC", "borderRadius": "14px", "padding": "18px 20px", "border": "1px solid #FFD4B8", "cursor": "pointer"}}>
        <summary style={{"fontWeight": "800", "fontSize": "15px", "color": "#C24D00", "listStyle": "none", "display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
          ¿Cómo recibo los pagos? <span style={{"fontSize": "20px", "color": "#F26000"}}>+</span>
        </summary>
        <p style={{"marginTop": "12px", "color": "#555", "fontSize": "14px", "lineHeight": "1.7"}}>Los clientes pagan en efectivo o transferencia directamente a ti. Listo Patrón no cobra comisión por servicio — solo pagas tu plan mensual.</p>
      </details>

      <details style={{"background": "#FFF3EC", "borderRadius": "14px", "padding": "18px 20px", "border": "1px solid #FFD4B8", "cursor": "pointer"}}>
        <summary style={{"fontWeight": "800", "fontSize": "15px", "color": "#C24D00", "listStyle": "none", "display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
          ¿Puedo trabajar en mi horario? <span style={{"fontSize": "20px", "color": "#F26000"}}>+</span>
        </summary>
        <p style={{"marginTop": "12px", "color": "#555", "fontSize": "14px", "lineHeight": "1.7"}}>Sí, tú decides cuándo estás disponible. Puedes activar y desactivar tu disponibilidad desde la app en cualquier momento.</p>
      </details>

      <details style={{"background": "#FFF3EC", "borderRadius": "14px", "padding": "18px 20px", "border": "1px solid #FFD4B8", "cursor": "pointer"}}>
        <summary style={{"fontWeight": "800", "fontSize": "15px", "color": "#C24D00", "listStyle": "none", "display": "flex", "justifyContent": "space-between", "alignItems": "center"}}>
          ¿Qué documentos necesito para registrarme? <span style={{"fontSize": "20px", "color": "#F26000"}}>+</span>
        </summary>
        <p style={{"marginTop": "12px", "color": "#555", "fontSize": "14px", "lineHeight": "1.7"}}>Cédula de identidad vigente y récord policial actualizado. Dependiendo de tu especialidad puede requerirse algún certificado adicional.</p>
      </details>

    </div>

  </div>
</section>



{/*  FAQ  */}
<section className="faq-section" id="faq">
  <div className="section-inner">
    <div className="chip sr" style={{"margin": "0 auto 16px", "display": "table"}}>❓ Preguntas frecuentes</div>
    <h2 className="section-title sr sr-delay-1" style={{"textAlign": "center"}}>¿Tienes <span>dudas?</span></h2>
    <p className="section-sub sr sr-delay-2" style={{"margin": "0 auto 56px", "textAlign": "center"}}>Todo lo que necesitas saber sobre Listo.</p>

    <div className="faq-grid sr sr-delay-2">

      <div className="faq-item" onClick={() => { toggleFaq(this) }}>
        <div className="faq-q">
          <span>¿Cómo funciona Listo?</span>
          <span className="faq-arrow">▼</span>
        </div>
        <div className="faq-a">Busca el servicio que necesitas, elige un profesional verificado cerca de ti y coordina directamente. En minutos tienes a alguien en camino.</div>
      </div>

      <div className="faq-item" onClick={() => { toggleFaq(this) }}>
        <div className="faq-q">
          <span>¿Los profesionales están verificados?</span>
          <span className="faq-arrow">▼</span>
        </div>
        <div className="faq-a">Sí. Todos los profesionales pasan por un proceso de verificación antes de aparecer en la plataforma. También puedes ver sus calificaciones y reseñas de otros clientes.</div>
      </div>

      <div className="faq-item" onClick={() => { toggleFaq(this) }}>
        <div className="faq-q">
          <span>¿Cómo se realiza el pago?</span>
          <span className="faq-arrow">▼</span>
        </div>
        <div className="faq-a">El pago se coordina directamente con el profesional. Puedes pagar en efectivo o por transferencia bancaria según el acuerdo con el profesional.</div>
      </div>

      <div className="faq-item" onClick={() => { toggleFaq(this) }}>
        <div className="faq-q">
          <span>¿Qué pasa si tengo un problema con el servicio?</span>
          <span className="faq-arrow">▼</span>
        </div>
        <div className="faq-a">Puedes contactarnos directamente por WhatsApp o email. Nuestro equipo estará disponible para ayudarte a resolver cualquier inconveniente.</div>
      </div>

      <div className="faq-item" onClick={() => { toggleFaq(this) }}>
        <div className="faq-q">
          <span>¿En qué ciudades está disponible?</span>
          <span className="faq-arrow">▼</span>
        </div>
        <div className="faq-a">Listo está disponible en toda República Dominicana, con mayor cobertura en Santo Domingo, Santiago, La Romana y San Pedro de Macorís.</div>
      </div>

      <div className="faq-item" onClick={() => { toggleFaq(this) }}>
        <div className="faq-q">
          <span>¿Cómo me registro como profesional?</span>
          <span className="faq-arrow">▼</span>
        </div>
        <div className="faq-a">Entra a la app, selecciona "Soy profesional", completa tu perfil con tus datos y especialidad, y elige el plan que mejor se adapte a ti. El primer mes es gratis.</div>
      </div>

    </div>
  </div>
</section>

{/*  APP DOWNLOAD BANNER  */}
<div className="app-banner">
  <div className="app-banner-bg"></div>
  <div className="app-banner-inner sr">
    <div className="app-banner-text">
      <div className="chip" style={{"background": "rgba(242,96,0,0.1)", "color": "var(--orange)", "border": "1px solid rgba(242,96,0,0.3)"}}>📱 Disponible ahora</div>
      <h3>Descarga la app <span style={{"color": "var(--orange)"}}>y empieza hoy</span></h3>
      <p>Accede a todos los profesionales de RD desde tu teléfono. Rápido, fácil y seguro.</p>
    </div>
    <div className="app-banner-btns">

      {/*  Google Play  */}
      <a href="#" className="app-store-btn google">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M3.18 1.27C2.8 1.67 2.58 2.27 2.58 3.06v17.88c0 .79.22 1.39.6 1.79l.09.08 10.02-10.02v-.24L3.27 1.19l-.09.08z" fill="#EA4335"/>
          <path d="M16.6 15.61l-3.34-3.34v-.24l3.34-3.34.08.05 3.96 2.25c1.13.64 1.13 1.69 0 2.33l-3.96 2.25-.08.04z" fill="#FBBC04"/>
          <path d="M16.68 15.57L13.27 12.2 3.18 22.29c.37.39.98.44 1.66.05l11.84-6.77" fill="#34A853"/>
          <path d="M16.68 8.43L4.84 1.66C4.16 1.27 3.55 1.32 3.18 1.71l10.09 10.49 3.41-3.77z" fill="#EA4335"/>
        </svg>
        <div>
          <div className="store-badge-sub">Disponible en</div>
          <div className="store-badge-name">Google Play</div>
        </div>
      </a>

      {/*  App Store  */}
      <a href="#" className="app-store-btn apple">
        <svg width="26" height="28" viewBox="0 0 814 1000" fill="white">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.8-155.5-118.2C46.2 687 0 582.1 0 481.3c0-183 119.1-279.6 236.7-279.6 61.4 0 112.6 40.8 149.9 40.8 35.7 0 92.3-43.2 161.9-43.2 26.1 0 108.2 2.6 168.6 79.9zm-208-175.8c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
        </svg>
        <div>
          <div className="store-badge-sub">Descarga en</div>
          <div className="store-badge-name">App Store</div>
        </div>
      </a>

      {/*  Web App  */}
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="app-store-btn web">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#F26000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <div>
          <div className="store-badge-sub" style={{"color": "#888"}}>Accede desde</div>
          <div className="store-badge-name" style={{"color": "#222"}}>La Web App</div>
        </div>
      </a>

    </div>
    <div className="app-banner-phones">
      <div className="app-mini-phone">
        <div style={{"background": "var(--orange)", "padding": "8px 10px", "borderRadius": "10px", "display": "flex", "alignItems": "center", "gap": "6px", "marginBottom": "6px"}}>
          <span style={{"fontSize": "14px"}}>🔍</span>
          <span style={{"color": "#fff", "fontSize": "10px", "fontWeight": "700"}}>Buscar servicio</span>
        </div>
        <div style={{"background": "#fff", "padding": "8px 10px", "borderRadius": "10px", "display": "flex", "alignItems": "center", "gap": "6px"}}>
          <span style={{"fontSize": "14px"}}>👨‍🔧</span>
          <div><div style={{"fontSize": "9px", "fontWeight": "800"}}>Carlos M.</div><div style={{"fontSize": "8px", "color": "#888"}}>Electricista ⭐4.9</div></div>
          <div style={{"marginLeft": "auto", "background": "var(--orange)", "color": "#fff", "fontSize": "8px", "fontWeight": "800", "padding": "3px 8px", "borderRadius": "20px"}}>Contratar</div>
        </div>
      </div>
    </div>
  </div>
</div>

{/*  CTA FINAL  */}
<section className="cta-section" style={{"padding": "120px 5%"}}>
  <div className="cta-bg"></div>
  {/*  Círculos decorativos animados  */}
  <div style={{"position": "absolute", "top": "-100px", "left": "-100px", "width": "400px", "height": "400px", "borderRadius": "50%", "border": "2px solid rgba(255,255,255,0.1)", "pointerEvents": "none", "animation": "rotateOrb 25s linear infinite"}}></div>
  <div style={{"position": "absolute", "bottom": "-80px", "right": "-80px", "width": "300px", "height": "300px", "borderRadius": "50%", "border": "2px solid rgba(255,255,255,0.08)", "pointerEvents": "none", "animation": "rotateOrb 18s linear infinite reverse"}}></div>
  <div style={{"position": "absolute", "top": "50%", "left": "50%", "transform": "translate(-50%,-50%)", "width": "600px", "height": "600px", "borderRadius": "50%", "border": "1px solid rgba(255,255,255,0.05)", "pointerEvents": "none", "animation": "pulse 4s ease-in-out infinite"}}></div>

  <div style={{"position": "relative", "zIndex": "1", "textAlign": "center"}}>
    {/*  Badge animado  */}
    <div style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "background": "rgba(255,255,255,0.15)", "border": "1px solid rgba(255,255,255,0.3)", "color": "#fff", "padding": "8px 20px", "borderRadius": "50px", "fontSize": "13px", "fontWeight": "700", "marginBottom": "16px", "animation": "fadeIn 1s ease forwards"}}>
      <span style={{"width": "8px", "height": "8px", "borderRadius": "50%", "background": "#4ade80", "display": "inline-block", "animation": "blink 1.5s ease infinite"}}></span>
      Disponible ahora mismo
    </div>

    <h2 style={{"fontSize": "clamp(38px,7vw,80px)", "marginBottom": "12px"}}>¿Listo, patrón? 🤝</h2>
    <p style={{"fontSize": "18px", "marginBottom": "10px", "maxWidth": "520px", "marginLeft": "auto", "marginRight": "auto", "marginTop": "0"}}>Únete a la plataforma que está transformando los servicios a domicilio en República Dominicana.</p>

    <div className="cta-btns" style={{"marginBottom": "10px"}}>
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="btn-white">🔍 Buscar profesional</a>
      <a onClick={() => navigate('login')} style={{cursor: "pointer"}} className="btn-ghost">🔧 Postularme como pro</a>
    </div>

    {/*  Social proof mini  */}
    <div style={{"display": "flex", "alignItems": "center", "justifyContent": "center", "gap": "16px", "flexWrap": "wrap"}}>
      <div style={{"display": "flex", "alignItems": "center", "gap": "8px", "background": "rgba(255,255,255,0.1)", "padding": "10px 18px", "borderRadius": "50px", "border": "1px solid rgba(255,255,255,0.2)"}}>
        <span style={{"fontSize": "18px"}}>⭐</span>
        <span style={{"color": "#fff", "fontSize": "13px", "fontWeight": "700"}}>4.9/5 calificación</span>
      </div>
      <div style={{"display": "flex", "alignItems": "center", "gap": "8px", "background": "rgba(255,255,255,0.1)", "padding": "10px 18px", "borderRadius": "50px", "border": "1px solid rgba(255,255,255,0.2)"}}>
        <span style={{"fontSize": "18px"}}>👷</span>
        <span style={{"color": "#fff", "fontSize": "13px", "fontWeight": "700"}}>+500 profesionales</span>
      </div>
      <div style={{"display": "flex", "alignItems": "center", "gap": "8px", "background": "rgba(255,255,255,0.1)", "padding": "10px 18px", "borderRadius": "50px", "border": "1px solid rgba(255,255,255,0.2)"}}>
        <span style={{"fontSize": "18px"}}>🇩🇴</span>
        <span style={{"color": "#fff", "fontSize": "13px", "fontWeight": "700"}}>Hecho en RD</span>
      </div>
    </div>
  </div>
</section>

{/*  FOOTER  */}
{/*  SECCIÓN: ¿POR QUÉ DESCARGAR LA APP?  */}
  <section className="why-app" id="por-que-app" aria-label="Beneficios de la aplicación">
    <div className="container">
      <div className="section-header">
        <h2 className="section-title">¿Por qué descargar la app? 📱</h2>
        <p className="section-subtitle">La web es solo el comienzo. En la app tienes todo el poder.</p>
      </div>

      <div className="why-app-grid">
        <div className="why-app-card reveal stagger-1">
          <div className="why-app-icon">💬</div>
          <h3>Chat en tiempo real</h3>
          <p>Conversa directamente con los profesionales, negocia precios y coordina detalles al instante.</p>
        </div>

        <div className="why-app-card reveal stagger-2">
          <div className="why-app-icon">🔔</div>
          <h3>Notificaciones push</h3>
          <p>Recibe alertas cuando un profesional responda o cuando tu servicio esté confirmado.</p>
        </div>

        <div className="why-app-card reveal stagger-3">
          <div className="why-app-icon">📍</div>
          <h3>Geolocalización</h3>
          <p>Encuentra profesionales cerca de ti y comparte tu ubicación exacta para el servicio.</p>
        </div>

        <div className="why-app-card reveal stagger-4">
          <div className="why-app-icon">⭐</div>
          <h3>Calificaciones y reseñas</h3>
          <p>Revisa experiencias de otros usuarios y califica el servicio recibido.</p>
        </div>

        <div className="why-app-card reveal stagger-5">
          <div className="why-app-icon">💳</div>
          <h3>Pago seguro</h3>
          <p>Paga dentro de la app con tarjeta de crédito o débito. Protección garantizada.</p>
        </div>

        <div className="why-app-card reveal stagger-6">
          <div className="why-app-icon">🎯</div>
          <h3>Ofertas exclusivas</h3>
          <p>Accede a descuentos y promociones solo disponibles para usuarios de la app.</p>
        </div>
      </div>

      <div className="why-app-cta reveal">
        <h3>¿Listo para empezar?</h3>
        <div className="app-buttons" style={{"display": "flex", "gap": "14px", "flexWrap": "wrap", "justifyContent": "center"}}>
          <a href="https://play.google.com/store/apps/details?id=com.listopatron" data-platform="android" target="_blank" rel="noopener noreferrer" onClick={() => { trackAppDownload('android') }} style={{"display": "inline-flex", "alignItems": "center", "gap": "10px", "background": "#1a1a1a", "color": "#fff", "padding": "12px 22px", "borderRadius": "12px", "textDecoration": "none", "fontFamily": "'Nunito',sans-serif", "boxShadow": "0 4px 14px rgba(0,0,0,0.25)", "transition": "transform .2s,box-shadow .2s"}} onMouseOver={() => { this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.35)' }} onMouseOut={() => { this.style.transform='';this.style.boxShadow='0 4px 14px rgba(0,0,0,0.25)' }}>
            <svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/></svg>
            <div style={{"lineHeight": "1.2"}}>
              <div style={{"fontSize": "11px", "opacity": ".7"}}>Descargar en</div>
              <div style={{"fontSize": "15px", "fontWeight": "800"}}>Google Play</div>
            </div>
          </a>
          <a href="https://apps.apple.com/app/listopatron/id000000000" data-platform="ios" target="_blank" rel="noopener noreferrer" onClick={() => { trackAppDownload('ios') }} style={{"display": "inline-flex", "alignItems": "center", "gap": "10px", "background": "#1a1a1a", "color": "#fff", "padding": "12px 22px", "borderRadius": "12px", "textDecoration": "none", "fontFamily": "'Nunito',sans-serif", "boxShadow": "0 4px 14px rgba(0,0,0,0.25)", "transition": "transform .2s,box-shadow .2s"}} onMouseOver={() => { this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,0.35)' }} onMouseOut={() => { this.style.transform='';this.style.boxShadow='0 4px 14px rgba(0,0,0,0.25)' }}>
            <svg viewBox="0 0 24 24" fill="white" width="24" height="24"><path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"/></svg>
            <div style={{"lineHeight": "1.2"}}>
              <div style={{"fontSize": "11px", "opacity": ".7"}}>Descargar en</div>
              <div style={{"fontSize": "15px", "fontWeight": "800"}}>App Store</div>
            </div>
          </a>
        </div>
          {/*  Redes sociales  */}
          <div style={{"marginTop": "22px", "display": "flex", "alignItems": "center", "gap": "12px", "justifyContent": "center"}}>
            <span style={{"fontSize": "13px", "color": "#888", "fontWeight": "600"}}>Síguenos:</span>

            {/*  TikTok  */}
            <a href="https://www.tiktok.com/@listopatron?_r=1&_t=ZS-94ntViURmdQ" target="_blank" title="TikTok"
              style={{"width": "42px", "height": "42px", "borderRadius": "10px", "background": "#000", "display": "flex", "alignItems": "center", "justifyContent": "center", "textDecoration": "none", "boxShadow": "0 3px 10px rgba(0,0,0,0.2)", "transition": "transform .2s"}}
              onMouseOver={() => { this.style.transform='translateY(-3px)' }} onMouseOut={() => { this.style.transform='' }}>
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/></svg>
            </a>

            {/*  Instagram  */}
            <a href="https://www.instagram.com/listopatronofficial?igsh=OGQ5ZDc2ODk2ZA==" target="_blank" title="Instagram"
              style={{"width": "42px", "height": "42px", "borderRadius": "10px", "background": "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", "display": "flex", "alignItems": "center", "justifyContent": "center", "textDecoration": "none", "boxShadow": "0 3px 10px rgba(220,39,67,0.35)", "transition": "transform .2s"}}
              onMouseOver={() => { this.style.transform='translateY(-3px)' }} onMouseOut={() => { this.style.transform='' }}>
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>

            {/*  Facebook  */}
            <a href="https://www.facebook.com/ListoPatron" target="_blank" title="Facebook"
              style={{"width": "42px", "height": "42px", "borderRadius": "10px", "background": "#1877F2", "display": "flex", "alignItems": "center", "justifyContent": "center", "textDecoration": "none", "boxShadow": "0 3px 10px rgba(24,119,242,0.35)", "transition": "transform .2s"}}
              onMouseOver={() => { this.style.transform='translateY(-3px)' }} onMouseOut={() => { this.style.transform='' }}>
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>

            {/*  YouTube  */}
            <a href="https://www.youtube.com/@listopatron" target="_blank" title="YouTube"
              style={{"width": "42px", "height": "42px", "borderRadius": "10px", "background": "#FF0000", "display": "flex", "alignItems": "center", "justifyContent": "center", "textDecoration": "none", "boxShadow": "0 3px 10px rgba(255,0,0,0.35)", "transition": "transform .2s"}}
              onMouseOver={() => { this.style.transform='translateY(-3px)' }} onMouseOut={() => { this.style.transform='' }}>
              <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
          </div>
      </div>
    </div>
  </section>

</main>

  <footer role="contentinfo" aria-label="Pie de página" style={{"background": "#1D1E2C", "padding": "60px 20px 40px", "textAlign": "center"}}>
    <div style={{"maxWidth": "800px", "margin": "0 auto", "display": "flex", "flexDirection": "column", "alignItems": "center", "gap": "16px"}}>
      
      <div>
        <h3 style={{"color": "#fff", "fontSize": "22px", "fontWeight": "800", "marginBottom": "10px"}}>Listo Patrón SRL</h3>
        <p style={{"color": "#768bb1", "margin": "0 0 6px", "fontSize": "15px"}}>Barrio La Terrazita, Peatón 3 No. 18, Edificio de Arte</p>
        <p style={{"color": "#768bb1", "margin": "0", "fontSize": "15px"}}>Detrás Urb. La Terraza, Santiago de los Caballeros, Rep. Dom.</p>
      </div>

      <div style={{"display": "flex", "gap": "20px", "flexWrap": "wrap", "justifyContent": "center", "marginTop": "12px", "marginBottom": "8px"}}>
        <a href="/politicas.html" style={{"color": "#768bb1", "textDecoration": "underline", "textDecorationColor": "rgba(118, 139, 177, 0.4)", "textUnderlineOffset": "4px", "fontSize": "15px", "fontWeight": "500", "transition": "color 0.2s"}}>Privacidad</a>
        <a href="/politicas.html" style={{"color": "#768bb1", "textDecoration": "underline", "textDecorationColor": "rgba(118, 139, 177, 0.4)", "textUnderlineOffset": "4px", "fontSize": "15px", "fontWeight": "500", "transition": "color 0.2s"}}>Devoluciones y Cancelaciones</a>
        <a href="/politicas.html" style={{"color": "#768bb1", "textDecoration": "underline", "textDecorationColor": "rgba(118, 139, 177, 0.4)", "textUnderlineOffset": "4px", "fontSize": "15px", "fontWeight": "500", "transition": "color 0.2s"}}>Envíos / Entrega</a>
        <a href="/politicas.html" style={{"color": "#768bb1", "textDecoration": "underline", "textDecorationColor": "rgba(118, 139, 177, 0.4)", "textUnderlineOffset": "4px", "fontSize": "15px", "fontWeight": "500", "transition": "color 0.2s"}}>Seguridad</a>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '24px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
        {/* Network Logos */}
        <div style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', fontWeight: '900', color: '#1A1F71', fontStyle: 'italic', fontSize: '14px' }}>VISA</div>
        <div style={{ background: 'white', padding: '6px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
           <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#EB001B', marginRight: '-4px', mixBlendMode: 'multiply' }}></div>
           <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F79E1B', mixBlendMode: 'multiply' }}></div>
        </div>
        
        {/* 3D Secure Logos */}
        <div style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
          <svg viewBox="0 0 190 50" style={{ height: '20px' }}>
            <text x="0" y="38" fontFamily="sans-serif" fontSize="40" fontWeight="900" fontStyle="italic" fill="#1A1F71" letterSpacing="-2">VISA</text>
            <text x="115" y="38" fontFamily="sans-serif" fontSize="20" fontWeight="600" fill="#1A1F71">Secure</text>
          </svg>
        </div>
        <div style={{ background: 'white', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg viewBox="0 0 100 60" style={{ height: '22px' }}>
            <circle cx="35" cy="30" r="25" fill="#EB001B" />
            <circle cx="65" cy="30" r="25" fill="#F79E1B" opacity="0.8" />
          </svg>
          <span style={{ color: '#1A1A2E', fontSize: '11px', fontWeight: '900', fontFamily: 'sans-serif' }}>ID Check&trade;</span>
        </div>
      </div>

      <div style={{"color": "#4a5a75", "fontSize": "14px", "marginTop": "24px"}}>
        © 2026 Listo Patrón. Todos los derechos reservados.
      </div>
    </div>
  </footer>

    </div>
  );
}

