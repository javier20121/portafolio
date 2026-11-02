import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import fiorelaImg from '../img/optimized/brandboard fiorela_page-0001.jpg';
import './FiorelaSection.css';

gsap.registerPlugin(ScrollTrigger);

/**
 * Isotipo oficial de Farmacia Fiorela:
 * Cruz de cinta continua con esquinas redondeadas + estrella de 4 puntas con estela diagonal
 */
function FiorelaCrossLogo({
  crossColor = '#064840',
  starColor = '#C69C47',
  cutoutBg = 'transparent',
  className = '',
}: {
  crossColor?: string;
  starColor?: string;
  cutoutBg?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 130 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Trazo continuo de la cruz tipo lazo con esquinas redondeadas */}
      <path
        d="M 52 65 V 27 A 13 13 0 0 1 78 27 V 103 A 13 13 0 0 1 52 103 V 52 H 27 A 13 13 0 0 0 27 78 H 103 A 13 13 0 0 0 103 52 H 84"
        stroke={crossColor}
        strokeWidth="9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Recorte sutil para separar la estela de la estrella cuando aplica */}
      {cutoutBg !== 'transparent' && (
        <path
          d="M 56 72 L 88 32 L 96 40 Z"
          stroke={cutoutBg}
          strokeWidth="6"
          strokeLinejoin="round"
        />
      )}

      {/* Estela diagonal (rayo que nace del corazón de la cruz hacia la estrella) */}
      <path
        d="M 53 75 L 87 34 L 95 42 Z"
        fill={starColor}
      />

      {/* Estrella de 4 puntas en el extremo superior derecho */}
      <path
        d="M 99 14 L 103.5 26.5 L 116 31 L 103.5 35.5 L 99 48 L 94.5 35.5 L 82 31 L 94.5 26.5 Z"
        fill={starColor}
      />
    </svg>
  );
}

/** Logotipo tipográfico "Fiorela FARMACIA" con el firulete final de la "a" */
function FiorelaWordmark({
  wordColor = '#064840',
  subColor = '#181818',
  className = '',
}: {
  wordColor?: string;
  subColor?: string;
  className?: string;
}) {
  return (
    <div className={`f-wordmark ${className}`}>
      <div className="f-wordmark__main" style={{ color: wordColor }}>
        <span>Fiorela</span>
        {/* Rulo / swash caligráfico característico al final de la "a" */}
        <svg
          className="f-wordmark__swash"
          viewBox="0 0 44 36"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 22C12 32 34 30 38 16C40 8 32 4 25 10C19 15 24 24 32 22"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="f-wordmark__sub" style={{ color: subColor }}>
        FARMACIA
      </div>
    </div>
  );
}

export default function FiorelaSection() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = (sel: string) => root.querySelector<HTMLElement>(sel)!;
    const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);

    // Flotación suave del isotipo principal en el Hero
    const floatTween = gsap.to(q('.f-hero-logo-iso'), {
      y: -8,
      duration: 2.3,
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

      // ── ESCENA 1: Apertura en Blanco Papel Texturado + Marca Principal ──
      tl.fromTo(
        q('.f-stage'),
        { backgroundColor: '#EFE5D8' },
        { backgroundColor: '#F4F4F2', duration: 0.5, ease: 'power1.out' },
        0
      )
        .fromTo(
          q('.f-top-ribbon'),
          { x: -120, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5 },
          0.1
        )
        .from(
          q('.f-hero-logo-iso'),
          { scale: 0.4, rotate: -12, opacity: 0, duration: 0.75, ease: 'back.out(1.6)' },
          0.15
        )
        .from(
          q('.f-hero-wordmark'),
          { y: 35, opacity: 0, duration: 0.7, ease: 'power3.out' },
          '<0.15'
        )
        .from(q('.f-hero-desc'), { y: 20, opacity: 0, duration: 0.6 }, '<0.2')
        .to({}, { duration: 0.7 });

      // ── ESCENA 2: Variaciones de Marca (Split Ocre / Verde + 5 App Icons + 4 Círculos Paleta) ──
      tl.to(q('.f-hero-scene'), { opacity: 0, scale: 0.94, duration: 0.6 })
        .to(q('.f-top-ribbon'), { opacity: 0, x: -80, duration: 0.3 }, '<')
        .set(q('.f-system-scene'), { opacity: 1, pointerEvents: 'auto' })
        .fromTo(
          q('.f-sys-split--gold'),
          { xPercent: -100 },
          { xPercent: 0, duration: 0.8, ease: 'power3.out' },
          '<0.1'
        )
        .fromTo(
          q('.f-sys-split--green'),
          { xPercent: 100 },
          { xPercent: 0, duration: 0.8, ease: 'power3.out' },
          '<'
        )
        .from(
          q('.f-sys-center-pill'),
          { scale: 0.5, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' },
          '<0.3'
        )
        .from(
          qa('.f-app-tile'),
          { y: 50, scale: 0.6, opacity: 0, duration: 0.6, stagger: 0.07, ease: 'back.out(1.6)' },
          '<0.1'
        )
        .from(
          qa('.f-swatch-circle'),
          { scale: 0, opacity: 0, duration: 0.55, stagger: 0.08, ease: 'back.out(1.7)' },
          '<0.2'
        )
        .to({}, { duration: 0.95 });

      // ── ESCENA 3: Tipografía `Aa Andalia` (Negro) + Trama Institucional (Verde) ──
      tl.to(q('.f-system-scene'), {
        opacity: 0,
        yPercent: -15,
        pointerEvents: 'none',
        duration: 0.65,
      })
        .set(q('.f-type-pattern-scene'), { opacity: 1 })
        .fromTo(
          q('.f-tp-half--dark'),
          { xPercent: -100 },
          { xPercent: 0, duration: 0.85, ease: 'power3.out' },
          '<0.1'
        )
        .fromTo(
          q('.f-tp-half--pattern'),
          { xPercent: 100 },
          { xPercent: 0, duration: 0.85, ease: 'power3.out' },
          '<'
        )
        .from(
          q('.f-tp-specimen'),
          { y: 35, opacity: 0, duration: 0.65, ease: 'power2.out' },
          '<0.3'
        )
        .from(
          qa('.f-pattern-cell'),
          { scale: 0.4, opacity: 0, duration: 0.55, stagger: 0.04, ease: 'back.out(1.4)' },
          '<0.1'
        )
        .to({}, { duration: 0.95 });

      // ── ESCENA 4: Packaging & Identificación (Bolsa Mostaza + Credencial Andrea Dessbesel) ──
      tl.to(q('.f-tp-half--dark'), { xPercent: -100, duration: 0.65, ease: 'power3.in' })
        .to(q('.f-tp-half--pattern'), { xPercent: 100, duration: 0.65, ease: 'power3.in' }, '<')
        .set(q('.f-type-pattern-scene'), { opacity: 0 })
        .to(q('.f-stage'), { backgroundColor: '#064840', duration: 0.5 }, '<0.1')
        .set(q('.f-packaging-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(
          q('.f-bag-showcase'),
          { x: -90, y: 40, rotate: -4, opacity: 0, duration: 0.8, ease: 'power3.out' },
          '<0.2'
        )
        .from(
          q('.f-lanyard-showcase'),
          { x: 90, y: -40, rotate: 6, opacity: 0, duration: 0.8, ease: 'power3.out' },
          '<0.12'
        )
        .to({}, { duration: 1.0 });

      // ── ESCENA 5: Papelería Comercial & Fachada (Tarjetas + Cartel Luminoso) ──
      tl.to(q('.f-packaging-scene'), {
        opacity: 0,
        scale: 0.92,
        pointerEvents: 'none',
        duration: 0.6,
      })
        .to(q('.f-stage'), { backgroundColor: '#0E3A34', duration: 0.5 }, '<0.1')
        .set(q('.f-collateral-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(
          q('.f-bcard--gold'),
          { x: -100, y: -30, rotate: -22, opacity: 0, duration: 0.75, ease: 'back.out(1.4)' },
          '<0.15'
        )
        .from(
          q('.f-bcard--white'),
          { x: -60, y: 60, rotate: -38, opacity: 0, duration: 0.75, ease: 'back.out(1.4)' },
          '<0.12'
        )
        .from(
          q('.f-signage-box'),
          { x: 90, y: 40, scale: 0.88, opacity: 0, duration: 0.8, ease: 'power3.out' },
          '<0.1'
        )
        .to({}, { duration: 1.0 });

      // ── ESCENA 6: Clímax — Brandboard Oficial Completo + CTA ──
      tl.to(q('.f-collateral-scene'), {
        scale: 0.9,
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.6,
      })
        .to(q('.f-stage'), { backgroundColor: '#064840', duration: 0.4 }, '<')
        .to(q('.f-climax-scene'), { opacity: 1, pointerEvents: 'auto', duration: 0.7 }, '<0.2')
        .from(
          q('.f-climax-sheet'),
          { scale: 0.85, y: 70, duration: 0.75, ease: 'power3.out' },
          '<'
        )
        .from(
          q('.f-cta-button'),
          { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' },
          '+=0.15'
        )
        .to({}, { duration: 0.9 });
    });

    // ── MOBILE: Secuencia fluida y optimizada ──
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
        .fromTo(q('.f-stage'), { backgroundColor: '#EFE5D8' }, { backgroundColor: '#F4F4F2', duration: 0.4 })
        .from(q('.f-hero-logo-iso'), { scale: 0.5, opacity: 0, duration: 0.7 }, '<0.1')
        .from(q('.f-hero-wordmark'), { y: 25, opacity: 0, duration: 0.7 }, '<0.15')
        .to({}, { duration: 0.5 })
        .to(q('.f-hero-scene'), { opacity: 0, duration: 0.6 })
        .set(q('.f-system-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(qa('.f-app-tile'), { y: 30, opacity: 0, stagger: 0.06, duration: 0.6 }, '<0.1')
        .to({}, { duration: 0.5 })
        .to(q('.f-system-scene'), { opacity: 0, pointerEvents: 'none', duration: 0.6 })
        .to(q('.f-stage'), { backgroundColor: '#064840', duration: 0.4 }, '<')
        .set(q('.f-packaging-scene'), { opacity: 1, pointerEvents: 'auto' })
        .from(q('.f-lanyard-showcase'), { y: 35, opacity: 0, duration: 0.7 }, '<0.1')
        .to({}, { duration: 0.6 })
        .to(q('.f-packaging-scene'), { opacity: 0, pointerEvents: 'none', duration: 0.6 })
        .to(q('.f-climax-scene'), { opacity: 1, pointerEvents: 'auto', duration: 0.8 })
        .from(q('.f-climax-sheet'), { scale: 0.88, opacity: 0, duration: 0.8 }, '<');
    });

    return () => {
      floatTween.kill();
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="fiorela-scroll-section"
      id="fiorela-brand"
      aria-label="Brandboard Farmacia Fiorela"
    >
      <div className="f-stage">
        {/* Etiqueta lateral superior izquierda igual a "MARCA PRINCIPAL" del brandboard */}
        <div className="f-top-ribbon" aria-hidden="true">
          MARCA PRINCIPAL · CASO #03
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 1: Hero — Marca Principal sobre Papel Texturado
            ══════════════════════════════════════════════════ */}
        <div className="f-hero-scene">
          <FiorelaCrossLogo
            crossColor="#064840"
            starColor="#C69C47"
            cutoutBg="#F4F4F2"
            className="f-hero-logo-iso"
          />

          <FiorelaWordmark
            wordColor="#064840"
            subColor="#181818"
            className="f-hero-wordmark"
          />

          <p className="f-hero-desc">
            Rediseño integral de identidad farmacéutica. El equilibrio entre el rigor clínico de la cruz continua y la calidez humana de una estrella que guía hacia el bienestar.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 2: Variaciones de Marca + 5 App Icons + Paleta
            ══════════════════════════════════════════════════ */}
        <div className="f-system-scene" aria-hidden="true">
          {/* Mitad Superior: Split 50/50 Mostaza Ocre y Verde Petróleo */}
          <div className="f-sys-top-split">
            <div className="f-sys-CenterPillWrap">
              <span className="f-sys-center-pill">VARIACIONES DE MARCA</span>
            </div>

            <div className="f-sys-split f-sys-split--gold">
              <div className="f-sys-horizontal-lockup">
                <FiorelaCrossLogo
                  crossColor="#FFFFFF"
                  starColor="#064840"
                  cutoutBg="#C69C47"
                  className="f-sys-horiz-iso"
                />
                <FiorelaWordmark
                  wordColor="#064840"
                  subColor="#181818"
                  className="f-sys-horiz-word"
                />
              </div>
            </div>

            <div className="f-sys-split f-sys-split--green">
              <FiorelaCrossLogo
                crossColor="#FFFFFF"
                starColor="#C69C47"
                cutoutBg="#064840"
                className="f-sys-solo-iso"
              />
            </div>
          </div>

          {/* Fila Central: Los 5 App Icons redondeados que pisan la unión */}
          <div className="f-app-tiles-row">
            <div className="f-app-tile" style={{ backgroundColor: '#181818' }}>
              <FiorelaCrossLogo crossColor="#FFFFFF" starColor="#C69C47" cutoutBg="#181818" />
            </div>
            <div className="f-app-tile" style={{ backgroundColor: '#C69C47' }}>
              <FiorelaCrossLogo crossColor="#FFFFFF" starColor="#064840" cutoutBg="#C69C47" />
            </div>
            <div className="f-app-tile" style={{ backgroundColor: '#064840' }}>
              <FiorelaCrossLogo crossColor="#FFFFFF" starColor="#C69C47" cutoutBg="#064840" />
            </div>
            <div className="f-app-tile f-app-tile--light" style={{ backgroundColor: '#FFFFFF' }}>
              <FiorelaCrossLogo crossColor="#064840" starColor="#C69C47" cutoutBg="#FFFFFF" />
            </div>
            <div className="f-app-tile" style={{ backgroundColor: '#181818' }}>
              <FiorelaCrossLogo crossColor="#FFFFFF" starColor="#FFFFFF" cutoutBg="#181818" />
            </div>
          </div>

          {/* Mitad Inferior Blanca: Los 4 Círculos de Paleta de Colores */}
          <div className="f-sys-bottom-palette">
            <div className="f-swatches-row">
              <div className="f-swatch-circle" style={{ backgroundColor: '#C69C47' }} />
              <div className="f-swatch-circle" style={{ backgroundColor: '#181818' }} />
              <div className="f-swatch-circle" style={{ backgroundColor: '#064840' }} />
              <div className="f-swatch-circle f-swatch-circle--gradient" />
            </div>
            <div className="f-palette-caption">PALETA DE COLORES</div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 3: Pantalla Partida Tipografía Andalia + Trama
            ══════════════════════════════════════════════════ */}
        <div className="f-type-pattern-scene" aria-hidden="true">
          {/* Izquierda: Fondo Negro Carbón con Aa Andalia */}
          <div className="f-tp-half f-tp-half--dark">
            <div className="f-tp-pill">TIPOGRAFIA</div>
            <div className="f-tp-specimen">
              <div className="f-tp-aa-col">
                <span className="f-tp-aa">Aa</span>
                <small className="f-tp-fontname">Andalia</small>
              </div>
              <div className="f-tp-alphabet">
                <div>ABCDEFGHIJKLMN</div>
                <div>OPQRSTUVWXYZ</div>
                <div>abcdefghijklmnopq</div>
                <div>rstuvwxyz</div>
              </div>
            </div>
          </div>

          {/* Derecha: Fondo Verde Petróleo con el Pattern de Cruces y Estrellas */}
          <div className="f-tp-half f-tp-half--pattern">
            <div className="f-pattern-grid">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="f-pattern-cell">
                  <FiorelaCrossLogo
                    crossColor="#FFFFFF"
                    starColor="#C69C47"
                    cutoutBg="#064840"
                    className="f-pattern-cell__svg"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 4: Packaging (Bolsa Ocre + Credencial Andrea Dessbesel)
            ══════════════════════════════════════════════════ */}
        <div className="f-packaging-scene">
          {/* Izquierda: Bolsa de Papel Institucional con marca de agua gigante */}
          <div className="f-bag-showcase">
            <div className="f-bag-mockup">
              {/* Cordón blanco trenzado */}
              <div className="f-bag-handle" />
              {/* Marca de agua gigante de la cruz en el frente */}
              <FiorelaCrossLogo
                crossColor="rgba(255, 255, 255, 0.22)"
                starColor="rgba(255, 255, 255, 0.22)"
                className="f-bag-watermark"
              />
              {/* Logo frontal centrado */}
              <div className="f-bag-front-logo">
                <FiorelaCrossLogo
                  crossColor="#FFFFFF"
                  starColor="#064840"
                  cutoutBg="#D2AC57"
                  className="f-bag-iso"
                />
                <FiorelaWordmark
                  wordColor="#064840"
                  subColor="#FFFFFF"
                  className="f-bag-word"
                />
              </div>
            </div>
            <span className="f-MockupLabel">PACKAGING INSTITUCIONAL</span>
          </div>

          {/* Derecha: Credencial / Lanyard de Andrea Dessbesel */}
          <div className="f-lanyard-showcase">
            <div className="f-lanyard-card">
              {/* Cinta superior mostaza y gancho metálico */}
              <div className="f-lanyard-ribbon" />
              <div className="f-lanyard-clip" />
              <div className="f-lanyard-slot" />

              {/* Cabecera del carnet */}
              <div className="f-lanyard-logo">
                <FiorelaCrossLogo
                  crossColor="#FFFFFF"
                  starColor="#C69C47"
                  cutoutBg="#064840"
                  className="f-lanyard-iso"
                />
                <FiorelaWordmark
                  wordColor="#C69C47"
                  subColor="#FFFFFF"
                  className="f-lanyard-word"
                />
              </div>

              {/* Datos de la profesional */}
              <div className="f-lanyard-person">
                <div className="f-lanyard-firstname">Andrea</div>
                <div className="f-lanyard-lastname">DESSBESEL</div>
                <div className="f-lanyard-role">FARMACEUTICA</div>
              </div>

              {/* Franja inferior con mini trama de cruces */}
              <div className="f-lanyard-bottom-pattern">
                {Array.from({ length: 8 }).map((_, i) => (
                  <FiorelaCrossLogo
                    key={i}
                    crossColor="#FFFFFF"
                    starColor="#C69C47"
                    className="f-lanyard-mini-cross"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 5: Tarjetas Personales + Cartel Luminoso Exterior
            ══════════════════════════════════════════════════ */}
        <div className="f-collateral-scene">
          {/* Izquierda: Las 2 Tarjetas Personales en diagonal */}
          <div className="f-bcards-stack">
            {/* Tarjeta Dorso Mostaza con trama de cruces */}
            <div className="f-bcard f-bcard--gold">
              <FiorelaCrossLogo
                crossColor="rgba(255,255,255,0.45)"
                starColor="rgba(255,255,255,0.45)"
                className="f-bcard__bg-cross f-bcard__bg-cross--tl"
              />
              <FiorelaCrossLogo
                crossColor="rgba(255,255,255,0.45)"
                starColor="rgba(255,255,255,0.45)"
                className="f-bcard__bg-cross f-bcard__bg-cross--br"
              />
              <div className="f-bcard__center">
                <FiorelaCrossLogo
                  crossColor="#FFFFFF"
                  starColor="#064840"
                  cutoutBg="#D2AC57"
                  className="f-bcard__center-iso"
                />
                <FiorelaWordmark wordColor="#064840" subColor="#FFFFFF" />
              </div>
            </div>

            {/* Tarjeta Frente Blanca con datos de Comandante Andresito */}
            <div className="f-bcard f-bcard--white">
              <div className="f-bcard__white-top">
                <FiorelaCrossLogo
                  crossColor="#064840"
                  starColor="#C69C47"
                  cutoutBg="#FFFFFF"
                  className="f-bcard__white-iso"
                />
                <FiorelaWordmark wordColor="#064840" subColor="#181818" />
              </div>
              <div className="f-bcard__white-contact">
                <div>3757 650529</div>
                <div>
                  <strong>Andrea Dessbesel</strong>
                </div>
                <div>Comandante andresito</div>
              </div>
            </div>
          </div>

          {/* Derecha: Cartel Luminoso Exterior (Lightbox en fachada) */}
          <div className="f-signage-box">
            <div className="f-signage-wall">
              <div className="f-lightbox">
                <div className="f-lightbox__face">
                  <FiorelaCrossLogo
                    crossColor="#FFFFFF"
                    starColor="#064840"
                    cutoutBg="#D2AC57"
                    className="f-lightbox__iso"
                  />
                  <FiorelaWordmark wordColor="#064840" subColor="#181818" />
                </div>
                <div className="f-lightbox__side" />
              </div>
            </div>
            <div className="f-signage-caption">
              <span>SEÑALÉTICA EXTERIOR &amp; GUARDAPOLLO</span>
              <p>Presencia urbana cálida y fácilmente identificable de día y de noche.</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 6: Clímax — Brandboard Oficial Completo + CTA
            ══════════════════════════════════════════════════ */}
        <div className="f-climax-scene">
          <div className="f-climax-sheet">
            <img src={fiorelaImg} alt="Brandboard Farmacia Fiorela Oficial" />
          </div>

          <div className="f-climax-footer">
            <div className="f-climax-footer__top">
              <div>
                Caso de Estudio <strong>#03 FARMACIA FIORELA</strong>
              </div>
              <div>
                Diseño por <span>Criatto Estudio Creativo</span>
              </div>
            </div>
            <a
              className="f-cta-button"
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