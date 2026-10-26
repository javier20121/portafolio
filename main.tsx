import { StrictMode, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import About from './components/About.tsx'
import CartelSection from './cartel/files/CartelSection.tsx'
import GallerySection from './components/GallerySection.tsx'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Componente Wrapper para manejar el Bloqueo (Pinning) del Cartel
function CartelWrapper({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = wrapperRef.current
    if (!element) return

    // Bloqueamos la sección del cartel mientras se construye
    ScrollTrigger.create({
      trigger: element,
      start: 'top top',
      end: `+=${window.innerHeight * 4.5}`, // Coincide con el scrollLength del cartel
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return <div ref={wrapperRef}>{children}</div>
}

const lenis = new Lenis()

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="relative w-full h-full">
      <main className="relative z-10">
        <About photoSrc="/cami.jpeg" />
        <CartelWrapper>
          <CartelSection src="/cartel.glb" scrollLength={4.5} pin={false} />
        </CartelWrapper>
        <GallerySection />
      </main>
    </div>
  </StrictMode>,
)
