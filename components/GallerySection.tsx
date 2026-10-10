import { useEffect, useRef } from 'react'
import Skiper52, { galleryCardCount } from './skiper52'
import './gallery-section.css'

export default function GallerySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    if (!section || !stage) return

    const cards = [...stage.querySelectorAll<HTMLElement>('.skiper52__card')]
    const viewportsPerCard = 0.85
    let scrollDistance = 0
    let frame = 0

    const updateProgress = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const sectionStart = section.getBoundingClientRect().top + window.scrollY
        const distance = Math.max(0, window.scrollY - sectionStart)
        const progress = Math.min(1, distance / scrollDistance)
        const activeProgress = progress * (cards.length - 1)

        cards.forEach((card, index) => {
          const focus = Math.max(0, 1 - Math.abs(activeProgress - index))
          card.style.setProperty('--card-focus', String(focus))
          card.style.flexGrow = String(1 + focus * 8)
        })
      })
    }
    const updateLayout = () => {
      scrollDistance = window.innerHeight * (galleryCardCount - 1) * viewportsPerCard
      section.style.height = `${window.innerHeight + scrollDistance}px`
      updateProgress()
    }

    updateLayout()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateLayout)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateLayout)
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
