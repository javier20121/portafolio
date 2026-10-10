import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CartelSection from './cartel/files/CartelSection'
import GallerySection from './components/GallerySection'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <CartelSection src="/cartel.glb" scrollLength={4.5} />
      <GallerySection />
    </>
  </StrictMode>,
)