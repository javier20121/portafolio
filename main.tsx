import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import About from './components/About.tsx'
import CartelSection from './cartel/files/CartelSection.tsx'
import EnlaceSection from './components/EnlaceSection.tsx'
import EveluSection from './components/EveluSection.tsx'
import FiorelaSection from './components/FiorelaSection.tsx'
import MissBonitaSection from './components/MissBonitaSection.tsx'
import GallerySection from './components/GallerySection.tsx'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis()

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

function App() {
  const [cartelReady, setCartelReady] = useState(false)

  useEffect(() => {
    if (cartelReady) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          lenis.resize()
          ScrollTrigger.sort()
          ScrollTrigger.refresh(true)
        })
      })
    }
  }, [cartelReady])

  return (
    <div className="relative w-full h-full">
      <main className="relative z-10">
        <About photoSrc="/cami.jpeg" />
        <CartelSection
          src="/cartel.glb"
          scrollLength={6.5}
          pin={true}
          onReady={() => setCartelReady(true)}
        />
        {cartelReady && (
          <>
            <EnlaceSection />
            <EveluSection />
            <FiorelaSection />
            <MissBonitaSection />
            <GallerySection />
          </>
        )}
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)