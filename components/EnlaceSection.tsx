import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import enlaceImg from '../img/optimized/BRANDBOARD ENLACE_page-0001.jpg';
import './EnlaceSection.css';

gsap.registerPlugin(ScrollTrigger);

export default function EnlaceSection() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const q = (sel: string) => root.querySelector<HTMLElement>(sel)!;
    const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);

    // Loop continuo para los 3 puntos del isotipo ("escribiendo en vivo...")
    const dotsTween = gsap.to(qa('.enlace-iso-dot'), {
      y: -3.5,
      scale: 1.18,
      transformOrigin: 'center center',
      duration: 0.45,
      stagger: 0.14,
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
          end: () => `+=${window.innerHeight * 6.2}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // ── 1. Transición desde el fondo oscuro (#0e0f0c) al Universo Morado Enlace + Hero 3D ──
      tl.fromTo(
        q('.enlace-stage'),
        { backgroundColor: '#0e0f0c' },
        { backgroundColor: '#371089', duration: 0.5, ease: 'power1.out' },
        0
      )
        .fromTo(
          q('.enlace-section-pill'),
          { y: -40, opacity: 0, scale: 0.85 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5 },
          0.1
        )
        .from(q('.enlace-hero-iso'), { yPercent: -90, scale: 0.55, opacity: 0, duration: 0.7 }, 0.15)
        .from(
          q('.enlace-hero-lockup'),
          { scale: 0.8, yPercent: 35, rotate: -8, opacity: 0, duration: 0.75, ease: 'back.out(1.4)' },
          '<0.15'
        )
        .from(q('.enlace-hero-subtitle'), { opacity: 0, y: 25, duration: 0.6 }, '<0.25')
        .to({}, { duration: 0.65 });

      // ── 2. Despliegue de Paleta Cromática ──
      tl.to(q('.enlace-hero-scene'), { yPercent: -35, opacity: 0, duration: 0.65 })
        .to(
          q('.enlace-section-pill'),
          { backgroundColor: '#111019', color: '#2EE590', borderColor: '#2EE590', duration: 0.3 },
          '<'
        )
        .to(
          qa('.enlace-color-col'),
          { yPercent: 0, duration: 0.85, stagger: 0.09, ease: 'power3.out' },
          '<0.15'
        )
        .from(
          qa('.enlace-color-swatch'),
          { scale: 0, rotate: -25, duration: 0.55, stagger: 0.08, ease: 'back.out(1.7)' },
          '<0.25'
        )
        .to({}, { duration: 0.85 });

      // ── 3. Tipografía: Pantalla Partida 50/50 (Verde CHIDO / Naranja CAIRO) ──
      tl.to(qa('.enlace-color-col'), {
        yPercent: -100,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.in',
      })
        .set(q('.enlace-type-scene'), { opacity: 1 }, '<0.2')
        .to(
          q('.enlace-section-pill'),
          { backgroundColor: '#FFFFFF', color: '#111019', borderColor: '#111019', duration: 0.3 },
          '<'
        )
        .fromTo(
          q('.enlace-type-half--constructiva'),
          { xPercent: -100 },
          { xPercent: 0, duration: 0.85, ease: 'power3.out' },
          '<0.1'
        )
        .fromTo(
          q('.enlace-type-half--corporativa'),
          { xPercent: 100 },
          { xPercent: 0, duration: 0.85, ease: 'power3.out' },
          '<'
        )
        .from(
          qa('.enlace-type-specimen'),
          { y: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' },
          '<0.3'
        )
        .to({}, { duration: 0.95 });

      // ── 4. Iconos & Stickers Die-Cut sobre Fondo Mostaza (#E4BD13) ──
      tl.to(q('.enlace-type-half--constructiva'), { xPercent: -100, duration: 0.65, ease: 'power3.in' })
        .to(q('.enlace-type-half--corporativa'), { xPercent: 100, duration: 0.65, ease: 'power3.in' }, '<')
        .to(q('.enlace-stage'), { backgroundColor: '#E4BD13', duration: 0.5 }, '<0.15')
        .set(q('.enlace-stickers-scene'), { pointerEvents: 'auto' })
        .fromTo(
          q('.enlace-sticker--live'),
          { y: -220, rotate: -25, scale: 0.5, opacity: 0 },
          { y: 0, rotate: -4, scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)' },
          '<0.15'
        )
        .fromTo(
          q('.enlace-sticker--mic'),
          { y: 240, rotate: -30, scale: 0.5, opacity: 0 },
          { y: 0, rotate: -6, scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)' },
          '<0.1'
        )
        .fromTo(
          q('.enlace-sticker--headphones'),
          { y: -220, rotate: 30, scale: 0.5, opacity: 0 },
          { y: 0, rotate: -10, scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)' },
          '<0.1'
        )
        .fromTo(
          q('.enlace-sticker--chat'),
          { y: 240, rotate: 28, scale: 0.5, opacity: 0 },
          { y: 0, rotate: 6, scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)' },
          '<0.1'
        )
        .fromTo(
          q('.enlace-sticker--calendar'),
          { x: 260, rotate: 25, scale: 0.5, opacity: 0 },
          { x: 0, rotate: -5, scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.8)' },
          '<0.1'
        )
        .to({}, { duration: 0.9 });

      // ── 5. Ecosistema Digital & Merch (Instagram Card + Tazas + Mic 3D) ──
      tl.set(q('.enlace-stickers-scene'), { pointerEvents: 'none' })
        .to(qa('.enlace-flying-sticker'), {
          scale: 0.25,
          opacity: 0,
          y: -60,
          duration: 0.55,
          stagger: 0.04,
          ease: 'power2.in',
        })
        .to(q('.enlace-stage'), { backgroundColor: '#371089', duration: 0.55 }, '<0.1')
        .to(
          q('.enlace-section-pill'),
          { backgroundColor: '#FF4612', color: '#FFFFFF', borderColor: '#111019', duration: 0.3 },
          '<'
        )
        .to(q('.enlace-ecosystem-scene'), { opacity: 1, pointerEvents: 'auto', duration: 0.5 }, '<0.2')
        .from(
          q('.enlace-ig-card'),
          { x: -90, y: 40, rotate: -3, opacity: 0, duration: 0.75, ease: 'power3.out' },
          '<'
        )
        .from(
          qa('.enlace-ig-story'),
          { scale: 0, opacity: 0, duration: 0.45, stagger: 0.07, ease: 'back.out(1.8)' },
          '<0.25'
        )
        .from(
          qa('.enlace-merch-card'),
          { x: 90, y: 40, opacity: 0, duration: 0.75, stagger: 0.15, ease: 'power3.out' },
          '<0.05'
        )
        .to({}, { duration: 1.0 });

      // ── 6. Clímax: Brandboard Completo + CTA ──
      tl.to(q('.enlace-ecosystem-scene'), {
        scale: 0.9,
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.6,
      })
        .to(q('.enlace-section-pill'), { opacity: 0, y: -30, duration: 0.3 }, '<')
        .to(q('.enlace-climax-scene'), { opacity: 1, pointerEvents: 'auto', duration: 0.7 }, '<0.2')
        .from(
          q('.enlace-climax-sheet'),
          { scale: 0.85, y: 70, duration: 0.75, ease: 'power3.out' },
          '<'
        )
        .from(
          q('.enlace-cta-button'),
          { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' },
          '+=0.15'
        )
        .to({}, { duration: 0.9 });
    });

    // ── MOBILE: Secuencia ágil y optimizada ──
    mm.add('(max-width: 767px)', () => {
      const tlM = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight * 4.2}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      tlM
        .fromTo(q('.enlace-stage'), { backgroundColor: '#0e0f0c' }, { backgroundColor: '#371089', duration: 0.4 })
        .from(q('.enlace-hero-iso'), { scale: 0.6, opacity: 0, duration: 0.8 }, '<0.1')
        .from(q('.enlace-hero-lockup'), { scale: 0.85, opacity: 0, duration: 0.8 }, '<0.15')
        .from(q('.enlace-hero-subtitle'), { y: 20, opacity: 0, duration: 0.6 }, '<0.2')
        .to({}, { duration: 0.5 })
        .to(q('.enlace-hero-scene'), { opacity: 0, yPercent: -25, duration: 0.7 })
        .to(qa('.enlace-color-col'), { yPercent: 0, duration: 1, stagger: 0.1 }, '<0.1')
        .to({}, { duration: 0.5 })
        .to(qa('.enlace-color-col'), { yPercent: -100, duration: 0.8 })
        .to(q('.enlace-ecosystem-scene'), { opacity: 1, pointerEvents: 'auto', duration: 0.8 }, '<0.2')
        .from(q('.enlace-ig-card'), { scale: 0.9, y: 30, opacity: 0, duration: 0.8 }, '<')
        .to({}, { duration: 0.6 })
        .to(q('.enlace-ecosystem-scene'), { opacity: 0, pointerEvents: 'none', duration: 0.6 })
        .to(q('.enlace-climax-scene'), { opacity: 1, pointerEvents: 'auto', duration: 0.8 })
        .from(q('.enlace-climax-sheet'), { scale: 0.88, opacity: 0, duration: 0.8 }, '<');
    });

    return () => {
      dotsTween.kill();
      mm.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="enlace-scroll-section" id="enlace-brand" aria-label="Brandboard Enlace">
      <div className="enlace-stage">
        {/* Marca de agua gigante de fondo */}
        <div className="enlace-watermark" aria-hidden="true">
          ENLACE
        </div>

        {/* Píldora divisoria flotante estilo Brandboard */}
        <div className="enlace-section-pill" aria-hidden="true">
          <span className="enlace-section-pill__dot" />
          CASO DE ESTUDIO #01 · IDENTIDAD ENLACE
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 1: Hero Logo 3D Extruido + Isotipo Nube
            ══════════════════════════════════════════════════ */}
        <div className="enlace-hero-scene">
          {/* Isotipo oficial: Nube con sombra 3D negra + Globo verde con 3 puntos */}
          <svg className="enlace-hero-iso" viewBox="0 0 175 118" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Extrusión negra trasera */}
            <path
              d="M114 38C110 20 94 8 74 8C56 8 41 19 36 36C18 38 4 53 4 72C4 93 21 110 42 110H118C139 110 156 93 156 72C156 55 145 41 129 38Z"
              fill="#111019"
            />
            {/* Cuerpo blanco de la nube con borde negro grueso */}
            <path
              d="M122 30C118 12 102 4 82 4C64 4 49 15 44 32C26 34 14 49 14 68C14 89 31 102 52 102H124C145 102 162 87 162 66C162 49 150 33 122 30Z"
              fill="#FFFFFF"
              stroke="#111019"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            {/* Globo de diálogo verde superpuesto */}
            <g transform="translate(82, 24)">
              <path
                d="M38 4C18.1 4 2 18.8 2 37C2 45.4 5.4 53 11.2 58.8L6 72L21.5 66.2C26.6 68.6 32.1 70 38 70C57.9 70 74 55.2 74 37C74 18.8 57.9 4 38 4Z"
                fill="#2EE590"
                stroke="#111019"
                strokeWidth="6"
                strokeLinejoin="round"
              />
              <circle className="enlace-iso-dot" cx="24" cy="37" r="5" fill="#FFFFFF" stroke="#111019" strokeWidth="3.2" />
              <circle className="enlace-iso-dot" cx="38" cy="37" r="5" fill="#FFFFFF" stroke="#111019" strokeWidth="3.2" />
              <circle className="enlace-iso-dot" cx="52" cy="37" r="5" fill="#FFFFFF" stroke="#111019" strokeWidth="3.2" />
            </g>
          </svg>

          {/* Lockup inclinado con extrusión 3D sólida como en el Brandboard */}
          <div className="enlace-hero-lockup">
            <h2 className="enlace-hero-title">ENLACE</h2>
            <div className="enlace-hero-capsule">
              RADIO - STREAMING - EVENTOS - VIVO
            </div>
          </div>

          <p className="enlace-hero-subtitle">
            Identidad visual integral para multiplataforma digital. Conectividad en la nube y conversación comunitaria con estética pop neo-brutalista.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 2: Paleta Cromática + Círculos del Brandboard
            ══════════════════════════════════════════════════ */}
        <div className="enlace-palette-scene" aria-hidden="true">
          <div className="enlace-color-col enlace-color-col--green">
            <div className="enlace-color-swatch" style={{ backgroundColor: '#2EE590' }} />
            <span className="enlace-color-num">01</span>
            <div className="enlace-color-name">Verde En Vivo</div>
            <div className="enlace-color-hex">#2EE590</div>
            <div className="enlace-color-role">Señal en directo &amp; Acentos</div>
          </div>

          <div className="enlace-color-col enlace-color-col--purple">
            <div className="enlace-color-swatch" style={{ backgroundColor: '#371089' }} />
            <span className="enlace-color-num">02</span>
            <div className="enlace-color-name">Morado Streaming</div>
            <div className="enlace-color-hex">#371089</div>
            <div className="enlace-color-role">Color Institucional Master</div>
          </div>

          <div className="enlace-color-col enlace-color-col--orange">
            <div className="enlace-color-swatch" style={{ backgroundColor: '#FF4612' }} />
            <span className="enlace-color-num">03</span>
            <div className="enlace-color-name">Naranja Acción</div>
            <div className="enlace-color-hex">#FF4612</div>
            <div className="enlace-color-role">Variaciones &amp; Dinamismo</div>
          </div>

          <div className="enlace-color-col enlace-color-col--yellow">
            <div className="enlace-color-swatch" style={{ backgroundColor: '#E4BD13' }} />
            <span className="enlace-color-num">04</span>
            <div className="enlace-color-name">Amarillo Energía</div>
            <div className="enlace-color-hex">#E4BD13</div>
            <div className="enlace-color-role">Universo de Iconos &amp; Stickers</div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 3: Pantalla Partida 50/50 Tipografía Oficial
            ══════════════════════════════════════════════════ */}
        <div className="enlace-type-scene" aria-hidden="true">
          {/* Mitad Izquierda: Verde — Tipografía Constructiva CHIDO */}
          <div className="enlace-type-half enlace-type-half--constructiva">
            <div className="enlace-type-pill">TIPOGRAFÍA CONSTRUCTIVA</div>
            <div className="enlace-type-specimen">
              <div className="enlace-type-aa enlace-type-aa--chido">
                <span>Aa</span>
                <small>CHIDO</small>
              </div>
              <div className="enlace-type-alphabet enlace-type-alphabet--chido">
                <div>ABCDEFGHIJKLMN</div>
                <div>OPQRSTUVWXYZ</div>
                <div>abcdefghijklmnopq</div>
                <div>rstuvwxyz</div>
              </div>
            </div>
          </div>

          {/* Mitad Derecha: Naranja — Tipografía Corporativa Cairol Now Extended */}
          <div className="enlace-type-half enlace-type-half--corporativa">
            <div className="enlace-type-pill">TIPOGRAFÍA CORPORATIVA</div>
            <div className="enlace-type-specimen">
              <div className="enlace-type-aa enlace-type-aa--cairo">
                <span>Aa</span>
                <small>
                  Cairol now
                  <br />
                  extended
                </small>
              </div>
              <div className="enlace-type-alphabet enlace-type-alphabet--cairo">
                <div>ABCDEFGHIJKLMN</div>
                <div>OPQRSTUVWXYZ</div>
                <div>abcdefghijklmnopq</div>
                <div>rstuvwxyz</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 4: Stickers Die-Cut sobre Fondo Mostaza
            ══════════════════════════════════════════════════ */}
        <div className="enlace-stickers-scene" aria-hidden="true">
          <div className="enlace-stickers-header-pill">ICONOS</div>

          {/* Sticker 1: "Estamos en vivo" fiel al brandboard */}
          <div className="enlace-flying-sticker enlace-sticker--live">
            <div className="enlace-live-top">Estamos en</div>
            <div className="enlace-live-pill">
              <span className="enlace-live-dot" />
              vivo
            </div>
          </div>

          {/* Sticker 2: Micrófono Die-Cut */}
          <div className="enlace-flying-sticker enlace-sticker--mic">
            <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="30" y="10" width="40" height="66" rx="20" fill="#FFFFFF" stroke="#111019" strokeWidth="7" />
              <path d="M30 44H70" stroke="#111019" strokeWidth="6" />
              <path d="M30 56H70" stroke="#2EE590" strokeWidth="8" />
              <path
                d="M18 52V60C18 77.6731 32.3269 92 50 92C67.6731 92 82 77.6731 82 60V52"
                stroke="#2EE590"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M18 52V60C18 77.6731 32.3269 92 50 92C67.6731 92 82 77.6731 82 60V52"
                stroke="#111019"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path d="M50 92V114" stroke="#111019" strokeWidth="8" strokeLinecap="round" />
              <path d="M28 114H72" stroke="#111019" strokeWidth="9" strokeLinecap="round" />
            </svg>
          </div>

          {/* Sticker 3: Auriculares Die-Cut */}
          <div className="enlace-flying-sticker enlace-sticker--headphones">
            <svg viewBox="0 0 120 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 62V52C18 28.804 36.804 10 60 10C83.196 10 102 28.804 102 52V62"
                stroke="#111019"
                strokeWidth="9"
                strokeLinecap="round"
              />
              <rect x="10" y="54" width="22" height="40" rx="10" fill="#2EE590" stroke="#111019" strokeWidth="6" />
              <rect x="26" y="58" width="12" height="32" rx="5" fill="#371089" stroke="#111019" strokeWidth="5" />
              <rect x="88" y="54" width="22" height="40" rx="10" fill="#2EE590" stroke="#111019" strokeWidth="6" />
              <rect x="82" y="58" width="12" height="32" rx="5" fill="#371089" stroke="#111019" strokeWidth="5" />
            </svg>
          </div>

          {/* Sticker 4: Globo de Chat Verde Die-Cut */}
          <div className="enlace-flying-sticker enlace-sticker--chat">
            <svg viewBox="0 0 110 105" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14 18C14 12.4772 18.4772 8 24 8H86C91.5228 8 96 12.4772 96 18V66C96 71.5228 91.5228 76 86 76H54L34 94V76H24C18.4772 76 14 71.5228 14 66V18Z"
                fill="#2EE590"
                stroke="#111019"
                strokeWidth="6.5"
                strokeLinejoin="round"
              />
              <circle cx="37" cy="42" r="5.5" fill="#FFFFFF" stroke="#111019" strokeWidth="3.5" />
              <circle cx="55" cy="42" r="5.5" fill="#FFFFFF" stroke="#111019" strokeWidth="3.5" />
              <circle cx="73" cy="42" r="5.5" fill="#FFFFFF" stroke="#111019" strokeWidth="3.5" />
            </svg>
          </div>

          {/* Sticker 5: Calendario Die-Cut */}
          <div className="enlace-flying-sticker enlace-sticker--calendar">
            <svg viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="14" y="22" width="82" height="74" rx="14" fill="#2EE590" stroke="#111019" strokeWidth="6.5" />
              <path d="M14 44H96" stroke="#111019" strokeWidth="6.5" />
              <rect x="30" y="10" width="12" height="22" rx="6" fill="#FF4612" stroke="#111019" strokeWidth="5" />
              <rect x="68" y="10" width="12" height="22" rx="6" fill="#FF4612" stroke="#111019" strokeWidth="5" />
            </svg>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 5: Ecosistema Digital (Instagram UI + Merch)
            ══════════════════════════════════════════════════ */}
        <div className="enlace-ecosystem-scene">
          {/* Tarjeta Izquierda: Perfil de Instagram Oficial reconstruido en UI real */}
          <div className="enlace-ig-card">
            <div className="enlace-ig-topbar">
              <span>&lt;</span>
              <span className="enlace-ig-dots">•••</span>
            </div>

            <div className="enlace-ig-header">
              <div className="enlace-ig-avatar">
                <svg viewBox="0 0 80 60" width="44" height="34">
                  <path
                    d="M52 16C50 8 42 2 32 2C24 2 17 7 14 15C6 16 0 23 0 32C0 42 8 50 18 50H54C64 50 72 42 72 32C72 24 66 17 52 16Z"
                    fill="#FFFFFF"
                    stroke="#111019"
                    strokeWidth="4"
                  />
                  <circle cx="54" cy="32" r="15" fill="#2EE590" stroke="#111019" strokeWidth="4" />
                </svg>
              </div>

              <div className="enlace-ig-stats">
                <div>
                  <strong>25</strong>
                  <span>Posts</span>
                </div>
                <div>
                  <strong>6K</strong>
                  <span>Followers</span>
                </div>
                <div>
                  <strong>1,411</strong>
                  <span>Following</span>
                </div>
              </div>
            </div>

            <div className="enlace-ig-bio">
              <h4>Enlace</h4>
              <p>🎥 Casa de Enlace Digital 🎙️</p>
              <p>🔗 Streaming | Eventos | Radio en vivo</p>
              <p>⚡ Donde todo se enlaza, 24/7</p>
              <p>🎧 ¡Sumate a la conexión! ⬇️</p>
            </div>

            <div className="enlace-ig-highlights">
              <div className="enlace-ig-story">
                <div className="enlace-ig-ring" style={{ background: '#371089' }}>
                  <span className="enlace-ig-mini-live">● vivo</span>
                </div>
                <small>En vivo</small>
              </div>
              <div className="enlace-ig-story">
                <div className="enlace-ig-ring" style={{ background: '#E4BD13' }}>
                  🎧
                </div>
                <small>Radio digital</small>
              </div>
              <div className="enlace-ig-story">
                <div className="enlace-ig-ring" style={{ background: '#2EE590' }}>
                  🎙️
                </div>
                <small>Streaming</small>
              </div>
              <div className="enlace-ig-story">
                <div className="enlace-ig-ring" style={{ background: '#E4BD13' }}>
                  📅
                </div>
                <small>Eventos</small>
              </div>
              <div className="enlace-ig-story">
                <div className="enlace-ig-ring" style={{ background: '#FF4612' }}>
                  💬
                </div>
                <small>Contacto</small>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Aplicaciones de Marca (Merch + Micrófono Estudio) */}
          <div className="enlace-merch-col">
            <div className="enlace-merch-card enlace-merch-card--mugs">
              <div className="enlace-merch-tag">MERCH OFICIAL</div>
              <h5>Presencia Física &amp; Cotidiana</h5>
              <p>Aplicación de isotipo y logotipo 3D sobre tazas corporativas en contraste bicolor (#2EE590 / #371089).</p>
            </div>

            <div className="enlace-merch-card enlace-merch-card--studio">
              <div className="enlace-merch-tag enlace-merch-tag--green">ESTUDIO 24/7</div>
              <h5>Identidad en Cabina</h5>
              <p>Branding aplicado a micrófonos de condensador y escenografía para transmisión en vivo multiplataforma.</p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            ESCENA 6: Lámina Completa (Clímax) + CTA
            ══════════════════════════════════════════════════ */}
        <div className="enlace-climax-scene">
          <div className="enlace-climax-sheet">
            <img src={enlaceImg} alt="Brandboard Enlace Oficial" />
          </div>

          <div className="enlace-climax-footer">
            <div className="enlace-climax-footer__top">
              <div>
                Caso de Estudio <strong>#01 ENLACE</strong>
              </div>
              <div>
                Diseño por <span>Criatto Estudio Creativo</span>
              </div>
            </div>
            <a
              className="enlace-cta-button"
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