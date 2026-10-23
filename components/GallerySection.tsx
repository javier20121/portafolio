import { useEffect, useRef } from 'react'
import Skiper52, { galleryCardCount } from './skiper52'
import './gallery-section.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return

    const cards = [...stage.querySelectorAll<HTMLElement>('.skiper52__card')]

    // Aumentamos la distancia para compensar las pausas de "imagen completa"
    const viewportsPerCard = 1.2
    const scrollDistance = window.innerHeight * galleryCardCount * viewportsPerCard

    // Animación Maestra con Pinning (BLOQUEO DE SECCIÓN)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${scrollDistance}`,
        scrub: true,
        pin: true,
        invalidateOnRefresh: true,
      },
    })

    // Creamos la secuencia con pausas para que se vean completas
    cards.forEach((card, index) => {
      // 1. Entrada: la tarjeta se expande y gana el foco
      tl.to(card, {
        '--card-focus': 1,
        flexGrow: 9,
        ease: 'sine.inOut',
        duration: 1,
      })

      // 2. Pausa: la tarjeta se queda completa (estática al 100%)
      tl.to(card, {
        '--card-focus': 1,
        flexGrow: 9,
        duration: 0.5, // Tiempo de permanencia
      })

      // 3. Salida: la tarjeta pierde el foco para dar paso a la siguiente
      if (index < cards.length - 1) {
        tl.to(card, {
          '--card-focus': 0,
          flexGrow: 1,
          ease: 'sine.inOut',
          duration: 1,
        })
      }
    })

    // Efectos de Parallax y Escala Interna (se mantienen)
    cards.forEach((card) => {
      const img = card.querySelector('img')
      if (img) {
        gsap.to(img, {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })

        gsap.to(img, {
          scale: 1.1,
          ease: 'sine.inOut',
          scrollTrigger: {
            trigger: card,
            start: 'top center',
            end: 'center center',
            scrub: true,
          },
        })
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <section ref={sectionRef} className="gallery-section" aria-label="Galería de trabajos">
      <div ref={stageRef} className="gallery-section__stage">
        <Skiper52 />
      </div>
    </section>
  )
}
