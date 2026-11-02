import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import eveluImg from '../img/optimized/BRANDBOARD EVELU_page-0001.jpg';
import './EveluSection.css';

gsap.registerPlugin(ScrollTrigger);

/** Componente reutilizable del Corazón de Origami facetado real del Brandboard */
function OrigamiHeart({
  fill = '#C85A9E',
  className = '',
}: {
  fill?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 140 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Mitad Izquierda */}
      <polygon
        points="70,32 38,6 10,34 10,56 70,116"
        fill={fill}
        stroke="#1D1B1A"
        strokeWidth="3.8"
        strokeLinejoin="round"
      />
      {/* Sombra sutil de pliegue derecho */}
      <polygon
        points="70,32 102,6 130,34 130,56 70,116"
        fill={fill}
        stroke="#1D1B1A"
        strokeWidth="3.8"
        strokeLinejoin="round"
      />
      <polygon
        points="70,32 102,6 130,34 130,56 70,116"
        fill="rgba(0, 0, 0, 0.06)"
        pointerEvents="none"
      />
      {/* Línea central vertical de pliegue */}
      <line
        x1="70"
        y1="32"
        x2="70"
        y2="116"
        stroke="#1D1B1A"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Líneas punteadas de las solapas superiores (fiel al original) */}
      <line
        x1="70"
        y1="62"
        x2="25"
        y2="20"
        stroke="#1D1B1A"
        strokeWidth="3.2"
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
      <line
        x1="70"
        y1="62"
        x2="115"
        y2="20"
        stroke="#1D1B1A"
        strokeWidth="3.2"
        strokeDasharray="6 5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Tijera ilustrada del Brandboard */
function ScissorsIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 90 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hojas de la tijera */}
      <path
        d="M44 52L28 98C26 90 28 74 36 48L44 52Z"
        fill="#EFE5D8"
        stroke="#1D1B1A"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path
        d="M46 52L62 98C64 90 62 74 54 48L46 52Z"
        fill="#EFE5D8"
        stroke="#1D1B1A"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Mangos anillados */}
      <circle
        cx="24"
        cy="28"
        r="16"
        fill="none"
        stroke="#EFE5D8"
        strokeWidth="8"
      />
      <circle
        cx="24"
        cy="28"
        r="16"
        fill="none"
        stroke="#1D1B1A"
        strokeWidth="3.2"
      />
      <circle
        cx="24"
        cy="28"
        r="10"
        fill="none"
        stroke="#1D1B1A"
        strokeWidth="3"
      />

      <circle
        cx="66"
        cy="28"
        r="16"
        fill="none"
        stroke="#EFE5D8"
        strokeWidth="8"
      />
      <circle
        cx="66"
        cy="28"
        r="16"
        fill="none"
        stroke="#1D1B1A"
        strokeWidth="3.2"
      />
      <circle
        cx="66"
        cy="28"
        r="10"
        fill="none"
        stroke="#1D1B1A"
        strokeWidth="3"
      />

      {/* Tornillo central */}
      <circle cx="45" cy="54" r="3" fill="#1D1B1A" />
    </svg>
  );
}

export default function EveluSection() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = (sel: string) => root.querySelector<HTMLElement>(sel)!;
    const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);

    // Flotación suave del corazón principal y las tijeras
    const floatTween = gsap.to(q('.evelu-hero-origami'), {
      y: -10,
      rotate: 3,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    const mm = gsap.matchMedia();

    // ── DESKTOP: Scrollytelling completo de 6 escenas ──
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

      // ── ESCENA 1: Apertura en Crema Papel + Origami + Logo con Swash ──
      tl.fromTo(
        q('.evelu-stage'),
        { backgroundColor: '#371089' },
        { backgroundColor: '#EFE5D8', duration: 0.5, ease: 'power1.out' },
        0
      )
        .fromTo(
          q('.evelu-section-pill'),
          { y: -40, opacity: 0, scale: 0.85 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5 },
          0.1
        )
        .from(
          q('.evelu-hero-origami'),
          { scale: 0.3, y: -50, rotate: -20, opacity: 0, duration: 0.75, ease: 'back.out(1.7)' },
          0.15
        )
        .from(
          q('.evelu-logo-lockup'),
          { scale: 0.88, y: 35, opacity: 0, duration: 0.75, ease: 'power3.out' },
          '<0.15'
        )
        .from(q('.evelu-hero-desc'), { opacity: 0, y: 20, duration: 0.6 }, '<0.25')
        .to({}, { duration: 0.7 });

      // ── ESCENA 2: Variaciones de Marca (Split 50/50 Durazno y Turquesa) ──
      tl.to(q('.evelu-hero-scene'), { opacity: 0, scale: 0.92, duration: 0.6 })
        .to(
          q('.evelu-section-pill'),
          { backgroundColor: '#FAF5EE', color: '#1D1B1A', duration: 0.3 },
          '<'
        )
        .fromTo(
          q('.evelu-split-half--peach'),
          { xPercent: -102 },
          { xPercent: 0, duration: 0.85, ease: 'power3.out' },
          '<0.1'
        )
        .fromTo(
          q('.evelu-split-half--teal'),
          { xPercent: 102 },
          { xPercent: 0, duration: 0.85, ease: 'power3.out' },
          '<'
        )
        .from(
          qa('.evelu-split-inner'),
          { scale: 0.82, opacity: 0, duration: 0.65, stagger: 0.12, ease: 'back.out(1.4)' },
          '<0.25'
        )
        .to({}, { duration: 0.9 });

      // ── ESCENA 3: Las 4 Polaroids Colgadas + Tipografía Aa Bounty ──
      tl.to(q('.evelu-split-half--peach'), { yPercent: -100, duration: 0.7, ease: 'power3.in' })
        .to(q('.evelu-split-half--teal'), { yPercent: -100, duration: 0.7, ease: 'power3.in' }, '<0.06')
        .to(q('.evelu-stage'), { backgroundColor: '#FAF5EE', duration: 0.4 }, '<0.1')
        .to(
          q('.evelu-section-pill'),
          { backgroundColor: '#00B5AD', color: '#FFFFFF', duration: 0.3 },
          '<'
        )
        .set(q('.evelu-polaroid-type-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(
          qa('.evelu-polaroid-card'),
          {
            y: -90,
            rotate: (i) => (i % 2 === 0 ? -14 : 14),
            opacity: 0,
            duration: 0.75,
            stagger: 0.1,
            ease: 'back.out(1.5)',
          },
          '<0.2'
        )
        .from(
          q('.evelu-bounty-showcase'),
          { y: 50, opacity: 0, duration: 0.7, ease: 'power3.out' },
          '<0.25'
        )
        .to({}, { duration: 1.0 });

      // ── ESCENA 4: Trama de Papiroflexia sobre Fondo Durazno (#EE965B) ──
      tl.to(q('.evelu-polaroid-type-scene'), {
        opacity: 0,
        y: -40,
        pointerEvents: 'none',
        duration: 0.6,
      })
        .to(q('.evelu-stage'), { backgroundColor: '#EE965B', duration: 0.5 }, '<0.1')
        .to(
          q('.evelu-section-pill'),
          { backgroundColor: '#FAF5EE', color: '#1D1B1A', duration: 0.3 },
          '<'
        )
        .set(q('.evelu-craft-pattern-scene'), { opacity: 1 })
        .from(
          qa('.evelu-craft-item'),
          {
            scale: 0,
            rotate: (i) => (i % 2 === 0 ? -45 : 45),
            opacity: 0,
            duration: 0.65,
            stagger: 0.05,
            ease: 'back.out(1.7)',
          },
          '<0.15'
        )
        .from(
          q('.evelu-craft-center-card'),
          { scale: 0.8, y: 30, opacity: 0, duration: 0.7, ease: 'back.out(1.5)' },
          '<0.25'
        )
        .to({}, { duration: 0.9 });

      // ── ESCENA 5: Papelería Real (Sticker con Peel 3D + Tarjetas Evelin De Oliveira) ──
      tl.to(q('.evelu-craft-pattern-scene'), { opacity: 0, scale: 0.92, duration: 0.6 })
        .to(q('.evelu-stage'), { backgroundColor: '#FAF5EE', duration: 0.5 }, '<0.1')
        .to(
          q('.evelu-section-pill'),
          { backgroundColor: '#C85A9E', color: '#FFFFFF', duration: 0.3 },
          '<'
        )
        .set(q('.evelu-stationery-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(
          q('.evelu-peel-sticker'),
          { x: -90, rotate: -35, scale: 0.6, opacity: 0, duration: 0.8, ease: 'back.out(1.6)' },
          '<0.15'
        )
        .from(
          q('.evelu-bcard--white'),
          { x: 90, y: -30, rotate: -6, opacity: 0, duration: 0.75, ease: 'power3.out' },
          '<0.12'
        )
        .from(
          q('.evelu-bcard--pink'),
          { x: 110, y: 60, rotate: 14, opacity: 0, duration: 0.75, ease: 'power3.out' },
          '<0.15'
        )
        .to({}, { duration: 1.0 });

      // ── ESCENA 6: Clímax — Brandboard Oficial Completo + CTA ──
      tl.to(q('.evelu-stationery-scene'), {
        scale: 0.9,
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.6,
      })
        .to(q('.evelu-stage'), { backgroundColor: '#EFE5D8', duration: 0.4 }, '<')
        .to(q('.evelu-section-pill'), { opacity: 0, y: -30, duration: 0.3 }, '<')
        .to(q('.evelu-climax-scene'), { opacity: 1, pointerEvents: 'auto', duration: 0.7 }, '<0.2')
        .from(
          q('.evelu-climax-sheet'),
          { scale: 0.85, y: 70, duration: 0.75, ease: 'power3.out' },
          '<'
        )
        .from(
          q('.evelu-cta-button'),
          { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' },
          '+=0.15'
        )
        .to({}, { duration: 0.9 });
    });

    // ── MOBILE: Secuencia fluida sin cortes ──
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
        .fromTo(q('.evelu-stage'), { backgroundColor: '#371089' }, { backgroundColor: '#EFE5D8', duration: 0.4 })
        .from(q('.evelu-hero-origami'), { scale: 0.5, opacity: 0, duration: 0.7 }, '<0.1')
        .from(q('.evelu-logo-lockup'), { y: 25, opacity: 0, duration: 0.7 }, '<0.15')
        .to({}, { duration: 0.5 })
        .to(q('.evelu-hero-scene'), { opacity: 0, duration: 0.6 })
        .set(q('.evelu-polaroid-type-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(qa('.evelu-polaroid-card'), { y: 40, opacity: 0, stagger: 0.08, duration: 0.7 }, '<0.1')
        .to({}, { duration: 0.6 })
        .to(q('.evelu-polaroid-type-scene'), { opacity: 0, pointerEvents: 'none', duration: 0.6 })
        .set(q('.evelu-stationery-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(q('.evelu-bcard--white'), { y: 30, opacity: 0, duration: 0.7 }, '<0.1')
        .to({}, { duration: 0.6 })
        .to(q('.evelu-stationery-scene'), { opacity: 0, pointerEvents: 'none', duration: 0.6 })
        .to(q('.evelu-climax-scene'), { opacity: 1, pointerEvents: 'auto', duration: 0.8 })
        .from(q('.evelu-climax-sheet'), { scale: 0.88, opacity: 0, duration: 0.8 }, '<');
    });

    return () => {
      floatTween.kill();
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="evelu-scroll-section"
      id="evelu-brand"
      aria-label="Brandboard Evelu Corazón de Papel"
    >
      <div className="evelu-stage">
        {/* Etiqueta superior con pespunte de costura */}
        <div className="evelu-section-pill" aria-hidden="true">
          <span className="evelu-section-pill__dot" />
          CASO DE ESTUDIO #02 · EVELU CORAZÓN DE PAPEL
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 1: Hero — Corazón Origami + Logo con Cinta
            ══════════════════════════════════════════════════ */}
        <div className="evelu-hero-scene">
          <OrigamiHeart fill="#C85A9E" className="evelu-hero-origami" />

          {/* Logotipo Evelu recreando las cintas curvas de la "E" */}
          <div className="evelu-logo-lockup">
            <svg
              className="evelu-swash-top"
              viewBox="0 0 260 45"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 32C65 4 125 42 185 16C215 4 242 10 250 26C232 18 205 22 172 34C118 52 68 18 12 32Z"
                fill="#00B5AD"
                stroke="#1D1B1A"
                strokeWidth="3.2"
                strokeLinejoin="round"
              />
            </svg>

            <h2 className="evelu-hero-title">Evelu</h2>

            <div className="evelu-bottom-row">
              <svg
                className="evelu-swash-bottom"
                viewBox="0 0 230 50"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 12C58 4 115 46 178 32C200 26 216 14 224 4C214 28 190 46 154 46C98 46 54 16 6 12Z"
                  fill="#00B5AD"
                  stroke="#1D1B1A"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="evelu-hero-subtitle">CORAZÓN DE PAPEL</span>
            </div>
          </div>

          <p className="evelu-hero-desc">
            Regalería creativa y papelería personalizada. Una identidad nacida del pliegue preciso del origami, el corte artesanal y la calidez del papel.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 2: Variaciones de Marca (Split 50/50 Oficial)
            ══════════════════════════════════════════════════ */}
        <div className="evelu-split-scene" aria-hidden="true">
          {/* Mitad Izquierda: Fondo Durazno + Logo Crema con texto en arco */}
          <div className="evelu-split-half evelu-split-half--peach">
            <div className="evelu-split-inner">
              <div className="evelu-peach-lockup">
                <OrigamiHeart fill="#00B5AD" className="evelu-peach-heart" />
                <span className="evelu-peach-word">Evelu</span>
                {/* Arco "CORAZÓN DE PAPEL" a la derecha tal cual el brandboard */}
                <svg className="evelu-peach-arc" viewBox="0 0 140 140">
                  <path
                    id="peachArcPath"
                    d="M 22,38 A 55,55 0 0,1 108,118"
                    fill="transparent"
                  />
                  <text fontSize="13.5" fontWeight="700" fill="#1D1B1A" letterSpacing="2">
                    <textPath href="#peachArcPath">CORAZÓN DE PAPEL</textPath>
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Mitad Derecha: Fondo Turquesa + Sello Punteado con Tijera */}
          <div className="evelu-split-half evelu-split-half--teal">
            <div className="evelu-split-inner">
              <div className="evelu-teal-stamp">
                <svg className="evelu-teal-stamp-svg" viewBox="0 0 260 260">
                  {/* Círculo punteado de recorte */}
                  <circle
                    cx="130"
                    cy="135"
                    r="86"
                    fill="none"
                    stroke="#1D1B1A"
                    strokeWidth="2.8"
                    strokeDasharray="6 6"
                  />
                  {/* Arco inferior "CORAZÓN DE PAPEL" */}
                  <path
                    id="tealBottomArc"
                    d="M 52,155 A 82,82 0 0,0 208,155"
                    fill="transparent"
                  />
                  <text fontSize="13" fontWeight="700" fill="#1D1B1A" letterSpacing="2.8">
                    <textPath href="#tealBottomArc" startOffset="14%">
                      CORAZÓN DE PAPEL
                    </textPath>
                  </text>
                </svg>

                <div className="evelu-teal-stamp-title">Evelu</div>
                <OrigamiHeart fill="#C85A9E" className="evelu-teal-stamp-heart" />
                <ScissorsIcon className="evelu-teal-stamp-scissors" />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 3: Las 4 Polaroids + Tipografía Aa Bounty
            ══════════════════════════════════════════════════ */}
        <div className="evelu-polaroid-type-scene">
          {/* Fila superior: Las 4 Polaroids con el corazón de origami adentro */}
          <div className="evelu-polaroid-row">
            <div className="evelu-polaroid-card">
              <div className="evelu-polaroid-frame" style={{ backgroundColor: '#EE965B' }}>
                <OrigamiHeart fill="#EFE5D8" className="evelu-polaroid-origami" />
              </div>
              <span className="evelu-polaroid-caption">#EE965B · Durazno</span>
            </div>

            <div className="evelu-polaroid-card">
              <div className="evelu-polaroid-frame" style={{ backgroundColor: '#00B5AD' }}>
                <OrigamiHeart fill="#EE965B" className="evelu-polaroid-origami" />
              </div>
              <span className="evelu-polaroid-caption">#00B5AD · Turquesa</span>
            </div>

            <div className="evelu-polaroid-card">
              <div className="evelu-polaroid-frame" style={{ backgroundColor: '#EFE5D8' }}>
                <OrigamiHeart fill="#C85A9E" className="evelu-polaroid-origami" />
              </div>
              <span className="evelu-polaroid-caption">#EFE5D8 · Papel Crema</span>
            </div>

            <div className="evelu-polaroid-card">
              <div className="evelu-polaroid-frame" style={{ backgroundColor: '#C85A9E' }}>
                <OrigamiHeart fill="#00B5AD" className="evelu-polaroid-origami" />
              </div>
              <span className="evelu-polaroid-caption">#C85A9E · Orquídea</span>
            </div>
          </div>

          {/* Bloque inferior: Espécimen Tipográfico Aa Bounty */}
          <div className="evelu-bounty-showcase">
            <div className="evelu-bounty-left">
              <div className="evelu-bounty-aa">Aa</div>
              <div className="evelu-bounty-label">Bounty</div>
            </div>

            <div className="evelu-bounty-alphabet">
              <div>A B C D E F G H I J K L M N</div>
              <div>O P Q R S T U V W X Y Z</div>
              <div>a b c d e f g h i j k l m n</div>
              <div>o p q r s t u v w x y z</div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 4: Trama (Pattern) de Tijeras, Pliegues y Origami
            ══════════════════════════════════════════════════ */}
        <div className="evelu-craft-pattern-scene" aria-hidden="true">
          <div className="evelu-craft-grid">
            <div className="evelu-craft-item">
              <OrigamiHeart fill="#EFE5D8" className="evelu-craft-svg" />
            </div>
            <div className="evelu-craft-item">
              <ScissorsIcon className="evelu-craft-svg" />
            </div>
            <div className="evelu-craft-item">
              {/* Cuadrado de papel con pliegue diagonal punteado */}
              <svg className="evelu-craft-svg" viewBox="0 0 90 90">
                <rect
                  x="12"
                  y="12"
                  width="66"
                  height="66"
                  transform="rotate(15 45 45)"
                  fill="#EFE5D8"
                  stroke="#1D1B1A"
                  strokeWidth="3.2"
                />
                <line
                  x1="20"
                  y1="12"
                  x2="70"
                  y2="78"
                  stroke="#1D1B1A"
                  strokeWidth="2.8"
                  strokeDasharray="5 5"
                />
              </svg>
            </div>
            <div className="evelu-craft-item">
              {/* Triángulo de papel doblado */}
              <svg className="evelu-craft-svg" viewBox="0 0 90 90">
                <polygon
                  points="18,74 68,16 76,74"
                  fill="#EFE5D8"
                  stroke="#1D1B1A"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="evelu-craft-item">
              <OrigamiHeart fill="#EFE5D8" className="evelu-craft-svg" />
            </div>
            <div className="evelu-craft-item">
              {/* Línea de corte en rulo */}
              <svg className="evelu-craft-svg" viewBox="0 0 100 100" fill="none">
                <path
                  d="M20 85C30 45 80 65 70 30C62 8 30 22 42 52C52 76 85 60 88 20"
                  stroke="#1D1B1A"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="evelu-craft-item">
              <ScissorsIcon className="evelu-craft-svg" />
            </div>
            <div className="evelu-craft-item">
              <OrigamiHeart fill="#EFE5D8" className="evelu-craft-svg" />
            </div>
          </div>

          <div className="evelu-craft-center-card">
            <span className="evelu-craft-badge">TRAMA INSTITUCIONAL</span>
            <h4>El arte de doblar y crear</h4>
            <p>
              Un sistema gráfico versátil pensado para papel de seda, bolsas de regalo, cajas troqueladas y cintas de embalaje.
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 5: Papelería Real (Sticker Peel + Tarjetas)
            ══════════════════════════════════════════════════ */}
        <div className="evelu-stationery-scene">
          {/* Izquierda: Sticker Circular Turquesa con efecto Peel 3D real */}
          <div className="evelu-peel-sticker">
            <div className="evelu-peel-sticker__title">Evelu</div>
            <OrigamiHeart fill="#C85A9E" className="evelu-peel-sticker__heart" />
            <span className="evelu-peel-sticker__sub">CORAZÓN DE PAPEL</span>
            {/* Doblez 3D realista inferior derecho */}
            <div className="evelu-peel-sticker__fold" />
          </div>

          {/* Derecha: Las 2 Tarjetas Personales del Brandboard */}
          <div className="evelu-bcards-wrapper">
            {/* Tarjeta Blanca Frontal: Evelin De Oliveira */}
            <div className="evelu-bcard evelu-bcard--white">
              <div className="evelu-bcard__info">
                <div className="evelu-bcard__script">Evelin De Oliveira</div>
                <div className="evelu-bcard__role">Regalos originales/personalizados</div>
                <div className="evelu-bcard__meta">3754-509232</div>
                <div className="evelu-bcard__meta">Comandante Andresito</div>
              </div>
              {/* Lateral derecho con mini trama artesanal */}
              <div className="evelu-bcard__pattern">
                <ScissorsIcon className="evelu-bcard__mini-icon" />
                <OrigamiHeart fill="#EFE5D8" className="evelu-bcard__mini-icon" />
              </div>
            </div>

            {/* Tarjeta Rosa Dorso inclinada por encima */}
            <div className="evelu-bcard evelu-bcard--pink">
              <div className="evelu-bcard__pink-lockup">
                <OrigamiHeart fill="#00B5AD" className="evelu-bcard__pink-heart" />
                <span className="evelu-bcard__pink-name">Evelu</span>
                <small className="evelu-bcard__pink-arc">CORAZÓN DE PAPEL</small>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 6: Clímax — Brandboard Oficial Completo + CTA
            ══════════════════════════════════════════════════ */}
        <div className="evelu-climax-scene">
          <div className="evelu-climax-sheet">
            <img src={eveluImg} alt="Brandboard Evelu Oficial" />
          </div>

          <div className="evelu-climax-footer">
            <div className="evelu-climax-footer__top">
              <div>
                Caso de Estudio <strong>#02 EVELU</strong>
              </div>
              <div>
                Diseño por <span>Criatto Estudio Creativo</span>
              </div>
            </div>
            <a
              className="evelu-cta-button"
              href="#fiorela-brand"
              onClick={(e) => {
                e.preventDefault();
                const next =
                  document.querySelector('#fiorela-brand') ||
                  document.querySelector('.gallery-section');
                next?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Siguiente Caso de Estudio →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}