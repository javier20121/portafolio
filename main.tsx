import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CartelSection from './cartel/files/CartelSection'
import './app.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartelSection src="/cartel.glb" scrollLength={3.2} />
  </StrictMode>,
)