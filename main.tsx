import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CartelSection from './cartel/files/CartelSection.tsx'
import GallerySection from './components/GallerySection.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="relative bg-[#0a0a0a] text-white min-h-screen selection:bg-lime-400 selection:text-black" style={{ position: 'relative', zIndex: 20 }}>
      {/* Capas de fondo estilo Norris */}
      <div className="ambient-glow" />
      <div className="grain-overlay" />

      <main className="relative z-10">
        <CartelSection src="/cartel.glb" scrollLength={4.5} />
        <GallerySection />
      </main>
    </div>
  </StrictMode>,
)