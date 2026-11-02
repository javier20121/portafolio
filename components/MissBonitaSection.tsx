import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import missBonitaImg from '../img/optimized/BRANDBOARD Miss bonita-01.jpg';
import './MissBonitaSection.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Monograma MB entrelazado con corona para Miss Bonita
 */
function MissBonitaMonogram({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Corona superior de 5 puntas */}
      <path d="M52 24L58 12L65 20L72 12L78 24H52Z" fill="#E3C16F" stroke="#2A111B" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="58" cy="10" r="1.5" fill="#E3C16F" />
      <circle cx="65" cy="17" r="1.5" fill="#E3C16F" />
      <circle cx="72" cy="10" r="1.5" fill="#E3C16F" />

      {/* Monograma M y B entrelazados */}
      <path d="M35 90V35L50 65L65 35V90" stroke="#E3C16F" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M78 35H95C108 35 112 48 102 58C114 68 110 88 92 90H78V35Z" fill="none" stroke="#E3C16F" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MissBonitaSection() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = (sel: string) => root.querySelector<HTMLElement>(sel)!;
    const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);

    // Animación continua flotante del monograma principal
    const floatTween = gsap.to(q('.mb-hero-logo'), {
      y: -8,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight * 6.4}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // ── ESCENA 1: Apertura en Borgoña Coquette + Monograma MB ──
      tl.fromTo(
        q('.mb-stage'),
        { backgroundColor: '#0C4A42' },
        { backgroundColor: '#8B264D', duration: 0.5, ease: 'power1.out' },
        0
      )
        .fromTo(
          q('.mb-section-pill'),
          { y: -40, opacity: 0, scale: 0.85 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5 },
          0.1
        )
        .from(q('.mb-hero-logo'), { scale: 0.4, rotate: -15, opacity: 0, duration: 0.75, ease: 'back.out(1.7)' }, 0.15)
        .from(q('.mb-hero-title'), { yPercent: 40, opacity: 0, duration: 0.7 }, '<0.15')
        .from(q('.mb-hero-subtitle'), { opacity: 0, y: 20, duration: 0.6 }, '<0.2')
        .to({}, { duration: 0.65 });

      // ── ESCENA 2: Franja Tripartita + 3 Variaciones de Marca ──
      tl.to(q('.mb-hero-scene'), { opacity: 0, scale: 0.92, duration: 0.6 })
        .to(q('.mb-section-pill'), { backgroundColor: '#F5E6DF', color: '#2A111B', duration: 0.3 }, '<')
        .set(q('.mb-variations-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(qa('.mb-swatch-bar'), { scaleX: 0, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '<')
        .from(qa('.mb-variation-box'), { y: 40, opacity: 0, duration: 0.7, stagger: 0.15, ease: 'back.out(1.4)' }, '<0.2')
        .to({}, { duration: 0.9 });

      // ── ESCENA 3: Bento Grid Editorial de 4 Paneles ──
      tl.to(q('.mb-variations-scene'), { opacity: 0, yPercent: -15, pointerEvents: 'none', duration: 0.6 })
        .to(q('.mb-stage'), { backgroundColor: '#FAF8F7', duration: 0.5 }, '<0.1')
        .to(q('.mb-section-pill'), { backgroundColor: '#8B264D', color: '#FFFFFF', duration: 0.3 }, '<')
        .set(q('.mb-bento-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(qa('.mb-bento-panel'), { scale: 0.8, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'back.out(1.4)' }, '<')
        .to({}, { duration: 1.0 });

      // ── ESCENA 4: Packaging de Boutique en 3D (Bolsas sobre Pedestal) ──
      tl.to(q('.mb-bento-scene'), { opacity: 0, scale: 0.92, pointerEvents: 'none', duration: 0.6 })
        .to(q('.mb-stage'), { backgroundColor: '#FAF8F7', duration: 0.5 }, '<0.1')
        .to(q('.mb-section-pill'), { backgroundColor: '#E3C16F', color: '#2A111B', duration: 0.3 }, '<')
        .set(q('.mb-packaging-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(q('.mb-bag-burgundy'), { x: -80, y: 30, rotate: -4, opacity: 0, duration: 0.75, ease: 'power3.out' }, '<')
        .from(q('.mb-bag-cream'), { x: 80, y: -30, rotate: 5, opacity: 0, duration: 0.75, ease: 'power3.out' }, '<0.15')
        .to({}, { duration: 1.0 });

      // ── ESCENA 5: Universo de Etiquetas Colgantes (Hangtags P/M/G) ──
      tl.to(q('.mb-packaging-scene'), { opacity: 0, yPercent: -15, pointerEvents: 'none', duration: 0.6 })
        .to(q('.mb-stage'), { backgroundColor: '#2A111B', duration: 0.5 }, '<0.1')
        .to(q('.mb-section-pill'), { backgroundColor: '#F5E6DF', color: '#2A111B', duration: 0.3 }, '<')
        .set(q('.mb-tags-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(qa('.mb-hangtag'), {
          x: (i) => [0, 70, 0, -70][i % 4],
          y: (i) => [70, 0, -70, 0][i % 4],
          scale: 0.7,
          rotate: (i) => (i === 0 ? -12 : i === 2 ? 12 : 0),
          opacity: 0,
          duration: 0.75,
          stagger: 0.12,
          ease: 'back.out(1.5)',
        }, '<')
        .to({}, { duration: 1.0 });

      // ── ESCENA 6: Clímax — Brandboard Oficial Completo + CTA ──
      tl.to(q('.mb-tags-scene'), { scale: 0.9, opacity: 0, pointerEvents: 'none', duration: 0.6 })
        .to(q('.mb-stage'), { backgroundColor: '#8B264D', duration: 0.4 }, '<')
        .to(q('.mb-section-pill'), { opacity: 0, y: -30, duration: 0.3 }, '<')
        .to(q('.mb-climax-scene'), { opacity: 1, pointerEvents: 'auto', duration: 0.7 }, '<0.2')
        .from(q('.mb-climax-sheet'), { scale: 0.85, x: -70, duration: 0.75, ease: 'power3.out' }, '<')
        .from(q('.mb-climax-footer'), { opacity: 0, y: 70, duration: 0.6, ease: 'power2.out' }, '<0.2')
        .from(q('.mb-cta-button'), { opacity: 0, x: 70, duration: 0.5, ease: 'power2.out' }, '<0.15')
        .to({}, { duration: 0.9 });
    });

    mm.add('(max-width: 767px)', () => {
      const tlM = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight * 4.4}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      tlM
        .fromTo(q('.mb-stage'), { backgroundColor: '#064840' }, { backgroundColor: '#8B264D', duration: 0.4 })
        .from(q('.mb-hero-logo'), { scale: 0.5, opacity: 0, duration: 0.7 }, '<0.1')
        .from(q('.mb-hero-title'), { y: 20, opacity: 0, duration: 0.7 }, '<0.15')
        .to({}, { duration: 0.5 })
        .to(q('.mb-hero-scene'), { opacity: 0, duration: 0.6 })
        .set(q('.mb-packaging-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(q('.mb-bag-burgundy'), { y: 30, opacity: 0, duration: 0.7 }, '<0.1')
        .to({}, { duration: 0.6 })
        .to(q('.mb-packaging-scene'), { opacity: 0, pointerEvents: 'none', duration: 0.6 })
        .to(q('.mb-climax-scene'), { opacity: 1, pointerEvents: 'auto', duration: 0.8 })
        .from(q('.mb-climax-sheet'), { scale: 0.88, y: 70, opacity: 0, duration: 0.8 }, '<')
        .from(q('.mb-climax-footer'), { x: 70, opacity: 0, duration: 0.6 }, '<0.2')
        .from(q('.mb-cta-button'), { y: -30, opacity: 0, duration: 0.5 }, '<0.15');
    });

    return () => {
      floatTween.kill();
      mm.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="miss-bonita-scroll-section" id="miss-bonita-brand" aria-label="Brandboard Miss Bonita">
      <div className="mb-stage">
        <div className="mb-section-pill" aria-hidden="true">
          <span className="mb-section-pill__dot" />
          CASO DE ESTUDIO #04 · MISS BONITA BOUTIQUE
        </div>

        {/* ── ESCENA 1: Hero Editorial ── */}
        <div className="mb-hero-scene">
          <MissBonitaMonogram className="mb-hero-logo" />
          <h2 className="mb-hero-title">MISS BONITA</h2>
          <p className="mb-hero-subtitle">Alta Costura &amp; Coquette Elegance</p>
          <p className="mb-hero-desc">
            Identidad visual sofisticada inspirada en la alta gama femenina. Líneas depuradas, coronas de distinción y texturas de seda perlada.
          </p>
        </div>

        {/* ── ESCENA 2: Variaciones de Marca ── */}
        <div className="mb-variations-scene" aria-hidden="true">
          <div className="mb-swatch-bars">
            <div className="mb-swatch-bar" style={{ backgroundColor: '#F5E6DF' }} />
            <div className="mb-swatch-bar" style={{ backgroundColor: '#8B264D' }} />
            <div className="mb-swatch-bar" style={{ backgroundColor: '#9E4266' }} />
          </div>
          <div className="mb-variations-grid">
            <div className="mb-variation-box">
              <MissBonitaMonogram className="mb-var-iso" />
              <span>MISS BONITA</span>
            </div>
            <div className="mb-variation-box">
              <span className="mb-var-text">MISS BONITA</span>
            </div>
            <div className="mb-variation-box mb-var-oval">
              <div className="mb-oval-ring">
                <MissBonitaMonogram className="mb-var-iso-mini" />
              </div>
            </div>
          </div>
        </div>

        {/* ── ESCENA 3: Bento Grid 4 Paneles ── */}
        <div className="mb-bento-scene" aria-hidden="true">
          <div className="mb-bento-grid">
            <div className="mb-bento-panel mb-bento-panel--vert">
              <span>MISS BONITA</span>
            </div>
            <div className="mb-bento-panel mb-bento-panel--pattern">
              <div className="mb-mini-pattern-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <MissBonitaMonogram key={i} className="mb-mini-pat-svg" />
                ))}
              </div>
            </div>
            <div className="mb-bento-panel mb-bento-panel--dark">
              <div className="mb-oval-ring mb-oval-ring--gold">
                <MissBonitaMonogram className="mb-var-iso-mini" />
              </div>
            </div>
            <div className="mb-bento-panel mb-bento-panel--mauve">
              <MissBonitaMonogram className="mb-var-iso" />
              <span>MISS BONITA</span>
            </div>
          </div>
        </div>

        {/* ── ESCENA 4: Packaging en 3D (Bolsas) ── */}
        <div className="mb-packaging-scene">
          <div className="mb-bag-card mb-bag-burgundy">
            <div className="mb-bag-handle" />
            <div className="mb-bag-content">
              <MissBonitaMonogram className="mb-bag-iso" />
              <h4>MISS BONITA</h4>
            </div>
          </div>
          <div className="mb-bag-card mb-bag-cream">
            <div className="mb-bag-handle mb-bag-handle--ribbon" />
            <div className="mb-bag-content">
              <div className="mb-oval-ring">
                <MissBonitaMonogram className="mb-var-iso-mini" />
              </div>
            </div>
          </div>
        </div>

        {/* ── ESCENA 5: Hangtags Circulares (P / M / G) ── */}
        <div className="mb-tags-scene">
          <div className="mb-hangtag">
            <div className="mb-tag-hole" />
            <h5>MISS BONITA</h5>
            <div className="mb-tag-price">$ ............</div>
            <div className="mb-tag-sizes">
              <span>P</span><span>M</span><span>G</span>
            </div>
          </div>
          <div className="mb-hangtag mb-hangtag--center">
            <div className="mb-tag-hole" />
            <MissBonitaMonogram className="mb-tag-iso-big" />
          </div>
          <div className="mb-hangtag">
            <div className="mb-tag-hole" />
            <h5>MISS BONITA</h5>
            <div className="mb-tag-price">$ ............</div>
            <div className="mb-tag-sizes">
              <span>P</span><span>M</span><span>G</span>
            </div>
          </div>
        </div>

        {/* ── ESCENA 6: Clímax Brandboard Completo + CTA ── */}
        <div className="mb-climax-scene">
          <div className="mb-climax-sheet">
            <img src={missBonitaImg} alt="Brandboard Miss Bonita Oficial" />
          </div>
          <div className="mb-climax-footer">
            <div className="mb-climax-footer__top">
              <div>Caso de Estudio <strong>#04 MISS BONITA</strong></div>
              <div>Diseño por <span>Criatto Estudio Creativo</span></div>
            </div>
            <a
              className="mb-cta-button"
              href="#gallery"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('.gallery-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Ver más trabajos →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}