import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './About.css';

gsap.registerPlugin(ScrollTrigger);

/* ════════════════════════════════════════════════════
   Contenido — editá acá, el resto no se toca
   ════════════════════════════════════════════════════ */
export const CONTENT = {
  title: 'Sobre mí.',
  name: 'Camila Otto.',
  role: 'Diseñadora gráfica.',
  caption: 'Estudio Criatto, 2025',
  paragraph:
    'Soy diseñadora gráfica y me gusta convertir ideas en piezas visuales que se entienden a la primera y se recuerdan después. Trabajo identidad de marca, packaging y piezas para redes, siempre buscando que cada proyecto tenga voz propia. Disfruto el trabajo en equipo y acompañar a cada cliente desde el primer boceto hasta el archivo final.',
  skillsTitle: 'Habilidades.',
  skills: [
    { abbr: 'Ps', label: 'Photoshop', bg: '#001e36', fg: '#31a8ff' },
    { abbr: 'Ai', label: 'Illustrator', bg: '#330000', fg: '#ff9a00' },
    { abbr: 'Ae', label: 'After Effects', bg: '#00005b', fg: '#9999ff' },
    { abbr: 'Id', label: 'InDesign', bg: '#49021f', fg: '#ff3d8b' },
  ],
  contactTitle: 'Contacto.',
  // Datos de ejemplo: reemplazalos por los reales
  contact: [
    { icon: 'ig', text: '@estudio.criatto', href: 'https://instagram.com/estudio.criatto' },
    { icon: 'phone', text: '+54 9 000 000 0000', href: 'tel:+540000000000' },
    { icon: 'mail', text: 'hola@tudominio.com', href: 'mailto:hola@tudominio.com' },
  ],
} as const;

/* ── Iconos de contacto ── */
const ICONS = {
  ig: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
} as const;

type AboutProps = {
  /** Ruta de tu foto, ej. "/camila.jpg" (poné el archivo en /public). Sin foto muestra un placeholder. */
  photoSrc?: string;
  photoAlt?: string;
};

export default function About({ photoSrc, photoAlt = 'Retrato de la diseñadora' }: AboutProps) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const $ = <T extends Element>(sel: string) => root.querySelector(sel) as T;
    const $$ = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);

    const mm = gsap.matchMedia();

    /* ── Desktop: sección pinneada, el scroll dirige una sola línea de tiempo ── */
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: () => `+=${window.innerHeight * 3.2}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl
        // 1. Título: letras que suben desde su máscara
        .from($$('.about__ch'), { yPercent: 115, duration: 0.8, stagger: { amount: 0.6 } }, 0)
        // 2. Polaroid: entra desde la izquierda y se abre la pila de hojas
        .from('.polaroid', { xPercent: -120, rotate: -14, opacity: 0, duration: 1.2 }, 0.9)
        .from($$('.polaroid__sheet'), { rotate: 0, duration: 1, stagger: 0.1 }, 1.2)
        .from('.polaroid__tape', { y: -40, rotate: -22, opacity: 0, duration: 0.4 }, 1.9)
        // 3. Nombre y rol
        .from($$('.about__line-in'), { yPercent: 115, duration: 0.7, stagger: 0.15 }, 1.8)
        // 4. El párrafo se "lee" palabra por palabra con el scroll
        .fromTo(
          $$('.about__w'),
          { opacity: 0.16 },
          { opacity: 1, duration: 0.4, ease: 'none', stagger: { amount: 3 } },
          2.6
        )
        // 5. Herramientas: caen y rebotan
        .from('.about__skills-title', { opacity: 0, y: 16, duration: 0.5 }, 5.2)
        .from(
          $$('.about__tile'),
          {
            yPercent: -140,
            scale: 0.5,
            opacity: 0,
            rotate: (i: number) => [-16, 12, -10, 14][i % 4],
            duration: 0.7,
            ease: 'back.out(1.8)',
            stagger: 0.12,
          },
          5.4
        )
        // 6. Nota de contacto
        .from('.about__note', { yPercent: 130, rotate: 10, opacity: 0, duration: 0.9 }, 6.2)
        // pausa final para que se quede un momento completa antes de soltar el pin
        .to({}, { duration: 1.1 });
    });

    /* ── Mobile: sin pin, cada bloque se revela con su propio scrub ── */
    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      const st = (trigger: Element, start = 'top 88%', end = 'top 50%') => ({
        trigger,
        start,
        end,
        scrub: 0.5,
      });

      gsap.from($$('.about__ch'), { yPercent: 115, ease: 'none', stagger: { amount: 0.4 }, scrollTrigger: st($('.about__title')) });
      gsap.from('.polaroid', { y: 90, rotate: -12, opacity: 0, ease: 'none', scrollTrigger: st($('.polaroid')) });
      gsap.from($$('.about__line-in'), { yPercent: 115, ease: 'none', stagger: 0.15, scrollTrigger: st($('.about__head'), 'top 90%', 'top 60%') });
      gsap.fromTo(
        $$('.about__w'),
        { opacity: 0.16 },
        { opacity: 1, ease: 'none', stagger: { amount: 1 }, scrollTrigger: st($('.about__text'), 'top 80%', 'bottom 55%') }
      );
      gsap.from($$('.about__tile'), { y: -50, scale: 0.6, opacity: 0, ease: 'none', stagger: 0.12, scrollTrigger: st($('.about__tiles'), 'top 92%', 'top 65%') });
      gsap.from('.about__note', { y: 70, rotate: 9, opacity: 0, ease: 'none', scrollTrigger: st($('.about__note'), 'top 95%', 'top 70%') });
    });

    // Con prefers-reduced-motion: reduce no se crea nada y todo queda visible.

    // Las fuentes cambian el alto del texto: recalcular posiciones cuando carguen
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => mm.revert();
  }, []);

  const initials = CONTENT.name
    .replace('.', '')
    .split(' ')
    .map((p) => p[0])
    .join('');

  return (
    <section ref={rootRef} className="about" aria-labelledby="about-title">
      <div className="about__stage">
        <h2 id="about-title" className="about__title" aria-label={CONTENT.title}>
          {Array.from(CONTENT.title).map((ch, i, arr) => (
            <span className="about__ch-mask" key={i} aria-hidden="true">
              <span className={`about__ch${i === arr.length - 1 ? ' about__ch--dot' : ''}`}>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            </span>
          ))}
        </h2>

        <div className="about__left">
          <figure className="polaroid">
            <span className="polaroid__sheet polaroid__sheet--b" aria-hidden="true" />
            <span className="polaroid__sheet polaroid__sheet--c" aria-hidden="true" />
            <div className="polaroid__card">
              <span className="polaroid__tape" aria-hidden="true" />
              <div className="polaroid__photo">
                {photoSrc ? (
                  <img src={photoSrc} alt={photoAlt} loading="lazy" />
                ) : (
                  <span className="polaroid__ph" aria-hidden="true">{initials}</span>
                )}
              </div>
              <figcaption className="polaroid__caption">{CONTENT.caption}</figcaption>
            </div>
          </figure>
        </div>

        <div className="about__right">
          <header className="about__head">
            <h3 className="about__name">
              <span className="about__line"><span className="about__line-in">{CONTENT.name}</span></span>
            </h3>
            <p className="about__role">
              <span className="about__line"><span className="about__line-in">{CONTENT.role}</span></span>
            </p>
          </header>

          <p className="about__text">
            {CONTENT.paragraph.split(' ').map((w, i) => (
              <span key={i}>
                <span className="about__w">{w}</span>{' '}
              </span>
            ))}
          </p>

          <div className="about__bottom">
            <div className="about__skills">
              <h3 className="about__skills-title">{CONTENT.skillsTitle}</h3>
              <ul className="about__tiles">
                {CONTENT.skills.map((s) => (
                  <li className="about__tile" key={s.abbr}>
                    <span
                      className="about__tile-icon"
                      style={{ ['--tile-bg' as string]: s.bg, ['--tile-fg' as string]: s.fg }}
                      aria-hidden="true"
                    >
                      {s.abbr}
                    </span>
                    <span className="about__tile-label">{s.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="about__note" aria-label={CONTENT.contactTitle}>
              <h3>{CONTENT.contactTitle}</h3>
              <ul>
                {CONTENT.contact.map((c) => (
                  <li key={c.icon}>
                    <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                      {ICONS[c.icon]}
                      <span>{c.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
