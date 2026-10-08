import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PortfolioJourney from './components/PortfolioJourney'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortfolioJourney />
  </StrictMode>,
)