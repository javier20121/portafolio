import { useEffect, useRef, useState } from 'react'
import CartelSection from '../cartel/files/CartelSection'
import Skiper52, { galleryCardCount } from './skiper52'
import './portfolio-journey.css'

const CARTEL_SCROLL_LENGTH = 3.2

export default function PortfolioJourney() {
  const sectionRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cartelPanelRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const cartelScrollRef = useRef(0)
  const horizontalScrollRef = useRef(0)
  const sectionStartRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    const viewport = viewportRef.current
    const track = trackRef.current
    const cartelPanel = cartelPanelRef.current
    const gallery = galleryRef.current
    if (!section || !viewport || !track || !cartelPanel || !gallery) return

    let frame = 0
    let galleryStep = 1
    let galleryStart = 0

    const updatePosition = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const elapsed = Math.max(0, window.scrollY - sectionStartRef.current)
        const horizontal = Math.min(
          horizontalScrollRef.current,
          Math.max(0, elapsed - cartelScrollRef.current),
        )
        track.style.transform = `translate3d(${-horizontal}px, 0, 0)`

        const imageProgress = Math.max(0, horizontal - galleryStart)
        const nextIndex = Math.min(
          galleryCardCount - 1,
          Math.floor((imageProgress + galleryStep / 2) / galleryStep),
        )
        setActiveIndex((current) => (current === nextIndex ? current : nextIndex))
      })
    }

    const updateLayout = () => {
      const firstCard = gallery.querySelector<HTMLElement>('.skiper52__card')
      if (!firstCard) return

      const styles = getComputedStyle(gallery)
      const gap = Number.parseFloat(styles.columnGap) || 0
      const paddingLeft = Number.parseFloat(styles.paddingLeft) || 0
      galleryStep = firstCard.getBoundingClientRect().width + gap
      galleryStart = gallery.offsetLeft + paddingLeft
      cartelScrollRef.current = Math.round(window.innerHeight * CARTEL_SCROLL_LENGTH)
      horizontalScrollRef.current = Math.max(0, track.scrollWidth - viewport.clientWidth)
      sectionStartRef.current = section.getBoundingClientRect().top + window.scrollY
      section.style.height = `${window.innerHeight + cartelScrollRef.current + horizontalScrollRef.current}px`
      updatePosition()
    }

    const resizeObserver = new ResizeObserver(updateLayout)
    resizeObserver.observe(viewport)
    resizeObserver.observe(track)
    updateLayout()
    window.addEventListener('scroll', updatePosition, { passive: true })
    window.addEventListener('resize', updateLayout)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', updatePosition)
      window.removeEventListener('resize', updateLayout)
    }
  }, [])

  return (
    <section ref={sectionRef} className="portfolio-journey" aria-label="Cartel y galería">
      <div ref={viewportRef} className="portfolio-journey__viewport">
        <div ref={trackRef} className="portfolio-journey__track">
          <div ref={cartelPanelRef} className="portfolio-journey__cartel">
            <CartelSection src="/cartel.glb" scrollLength={CARTEL_SCROLL_LENGTH} pin={false} />
          </div>
          <div ref={galleryRef} className="portfolio-journey__gallery">
            <Skiper52 activeIndex={activeIndex} />
          </div>
        </div>
      </div>
    </section>
  )
}
