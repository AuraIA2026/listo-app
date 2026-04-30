import { useEffect } from 'react';

export default function useListoLogic() {
  useEffect(() => {
    // ── PRELOADER con fallback de seguridad ──
    const hidePreloader = () => {
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.style.opacity = '0';
        preloader.style.transition = 'opacity 0.3s ease';
        setTimeout(() => { preloader.style.display = 'none'; }, 300);
      }
    };
    window.addEventListener('load', hidePreloader);
    setTimeout(hidePreloader, 4000);

    // ── Scroll to top button ──
    const scrollListener = function() {
      const scrollTop = document.getElementById('scrollTop');
      if (scrollTop) {
        if (window.pageYOffset > 500) {
          scrollTop.classList.add('visible');
        } else {
          scrollTop.classList.remove('visible');
        }
      }
    };
    window.addEventListener('scroll', scrollListener, { passive: true });

    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // ── Intersection Observer para animaciones ──
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .feature, .step, .pricing-card, .testimonial').forEach(el => {
      el.classList.add('reveal');
      revealObserver.observe(el);
    });

    // ── Mobile menu toggle ──
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks   = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
      const menuClickListener = function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('active');
      };
      menuToggle.addEventListener('click', menuClickListener);
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
          menuToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // ── Smooth scroll para enlaces de anclaje ──
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if(href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            const headerOffset = 80;
            const offsetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          }
        }
      });
    });

    // ── INTRO / ONBOARDING ──
    const slidesData = [
      { t: 'Todos los servicios en un solo lugar', s: 'Mecánicos, electricistas, plomeros, niñeras y más — cuando los necesitas.' },
      { t: 'Profesionales verificados', s: 'Cada profesional pasa por un proceso de verificación de identidad y experiencia.' },
      { t: 'Reserva en minutos', s: 'Selecciona, agenda y listo. Tu profesional llega a donde estás.' },
      { t: 'Trabajo de primera', s: 'Resultados impecables y garantizados. Estamos comprometidos con tu satisfacción.' },
      { t: 'Síguelo en el mapa', s: 'Observa en tiempo real cómo tu profesional llega directo a tu ubicación.' },
      { t: 'Paga sin complicaciones', s: 'Transacciones 100% seguras y al instante, directamente desde la app.' },
    ];

    let currentSlide = 0;
    const slideDuration = 8000;
    let slideTimer;
    let progressInterval;
    let startTime;

    function startOnboarding() {
      const splash = document.getElementById('splash-phase');
      const onboard = document.getElementById('onboarding-phase');
      if(splash) splash.style.opacity = '0';
      setTimeout(() => {
        if(splash) splash.style.display = 'none';
        if(onboard) {
          onboard.style.opacity = '1';
          onboard.style.pointerEvents = 'auto';
        }
        playSlide(0);
      }, 500);
    }

    function playSlide(index) {
      clearInterval(progressInterval);
      clearTimeout(slideTimer);
      
      const vids = document.querySelectorAll('.ob-video');
      vids.forEach((v, i) => {
        if (i === index) {
          v.classList.add('active');
          v.play().catch(()=>{});
        } else {
          v.classList.remove('active');
          v.pause();
        }
      });

      const content = document.getElementById('ob-content');
      if(content) {
        content.style.opacity = '0';
        content.style.transform = 'translateX(20px)';
        setTimeout(() => {
          const tTitle = document.getElementById('ob-title');
          const tSub = document.getElementById('ob-sub');
          if(tTitle && slidesData[index]) tTitle.innerText = slidesData[index].t;
          if(tSub && slidesData[index]) tSub.innerText = slidesData[index].s;
          content.style.transform = 'translateX(0)';
          content.style.opacity = '1';
        }, 300);
      }

      document.querySelectorAll('.ob-dot').forEach((d, i) => {
        d.className = i === index ? 'ob-dot active' : 'ob-dot';
      });

      const btn = document.getElementById('ob-btn');
      if(btn) btn.innerText = index === slidesData.length - 1 ? '¡Empezar! 🚀' : 'Siguiente →';

      const bar = document.getElementById('ob-progress-bar');
      if(bar) {
        bar.style.width = '0%';
        startTime = Date.now();
        progressInterval = setInterval(() => {
          let elapsed = Date.now() - startTime;
          let percent = (elapsed / slideDuration) * 100;
          if (percent > 100) percent = 100;
          bar.style.width = percent + '%';
        }, 50);
      }

      slideTimer = setTimeout(() => {
        window.nextSlide();
      }, slideDuration);
    }

    window.nextSlide = function() {
      if (currentSlide < slidesData.length - 1) {
        currentSlide++;
        playSlide(currentSlide);
      } else {
        window.closeIntro();
      }
    };

    window.closeIntro = function() {
      clearTimeout(slideTimer);
      clearInterval(progressInterval);
      
      const target = document.getElementById('servicios');
      if(target) {
        const offset = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    };

    const onboardingTimeout = setTimeout(() => {
      startOnboarding();
    }, 2500);

    // ── ANIMATE COUNTERS ──
    function animateCounter(el) {
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const isDecimal = el.dataset.decimal === 'true';
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;
      let current = 0;
      const increment = target / steps;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = isDecimal
          ? current.toFixed(1) + suffix
          : Math.floor(current) + suffix;
      }, stepTime);
    }

    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = 'true';
          entry.target.querySelectorAll('.stat-counter').forEach(animateCounter);
        }
      });
    }, { threshold: 0.3 });

    const grid = document.getElementById('statsGrid');
    if (grid) counterObs.observe(grid);

    // ── AD SLIDER ──
    let curAd = 0, totalAd = 4;
    function updateAd(){
      const adTrack = document.getElementById('ad-track');
      if(adTrack) adTrack.style.transform='translateX(-'+curAd*100+'%)';
      document.querySelectorAll('.ad-dot').forEach(function(d,i){d.classList.toggle('active',i===curAd)});
    }
    window.adSlide = function(d){curAd=(curAd+d+totalAd)%totalAd;updateAd()};
    window.goAd = function(i){curAd=i;updateAd()};
    const adInterval = setInterval(function(){window.adSlide(1)},5000);

    // ── PRO SLIDER ──
    const track = document.getElementById('proSliderTrack');
    let proInterval;
    if (track) {
      const slides = Array.from(track.querySelectorAll('.pro-slide'));
      const dots   = Array.from(document.querySelectorAll('.pro-dot'));
      const total  = slides.length;
      let cur = 0;

      function pp() {
        return window.innerWidth >= 900 ? 4 : window.innerWidth >= 580 ? 3 : 2;
      }

      function render() {
        const n = pp();
        slides.forEach((s, i) => {
          const show = Array.from({length: n}, (_, j) => (cur + j) % total).includes(i);
          s.style.display = show ? 'flex' : 'none';
        });
        dots.forEach((d, i) => d.classList.toggle('active', i === cur));
      }

      window.shiftSlider = function(d) {
        cur = (cur + d + total) % total;
        render();
      };
      window.goSlide = function(i) {
        cur = i; render();
      };

      render();
      window.addEventListener('resize', render);
      proInterval = setInterval(() => window.shiftSlider(1), 4500);
    }

    // ── NAV & SCROLL REVEAL ──
    const nav = document.getElementById('nav');
    const scrollNavListener = () => {
      if(nav) nav.classList.toggle('scrolled', window.scrollY > 20)
    };
    window.addEventListener('scroll', scrollNavListener);

    const burger = document.getElementById('burger');
    const navLinksEl = document.getElementById('navLinks');
    if (burger && navLinksEl) {
      burger.addEventListener('click', () => navLinksEl.classList.toggle('open'));
      navLinksEl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinksEl.classList.remove('open')));
    }

    const srObs = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); srObs.unobserve(e.target); }
    }), {threshold: 0.1});
    document.querySelectorAll('.sr').forEach(el => srObs.observe(el));

    // Tilt en tarjetas
    document.querySelectorAll('.pro-row-card, .testi-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) perspective(600px) rotateX(${-y*5}deg) rotateY(${x*5}deg) scale(1.02)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });

    // ── SWITCH TAB ──
    window.switchTab = function(tab) {
      const cliente = document.getElementById('faqCliente');
      const pro = document.getElementById('faqPro');
      const btnC = document.getElementById('tabCliente');
      const btnP = document.getElementById('tabPro');
      if(!cliente || !pro) return;
      if (tab === 'cliente') {
        cliente.style.display = 'flex';
        pro.style.display = 'none';
        btnC.style.background = '#F26000';
        btnC.style.color = '#fff';
        btnC.style.border = 'none';
        btnP.style.background = '#FFF3EC';
        btnP.style.color = '#F26000';
        btnP.style.border = '2px solid #F26000';
      } else {
        cliente.style.display = 'none';
        pro.style.display = 'flex';
        btnP.style.background = '#F26000';
        btnP.style.color = '#fff';
        btnP.style.border = 'none';
        btnC.style.background = '#FFF3EC';
        btnC.style.color = '#F26000';
        btnC.style.border = '2px solid #F26000';
      }
    };

    // Cleanup phase
    return () => {
      window.removeEventListener('load', hidePreloader);
      window.removeEventListener('scroll', scrollListener);
      window.removeEventListener('scroll', scrollNavListener);
      clearInterval(adInterval);
      if(proInterval) clearInterval(proInterval);
      clearTimeout(onboardingTimeout);
      clearTimeout(slideTimer);
      clearInterval(progressInterval);
    };
  }, []);
}
