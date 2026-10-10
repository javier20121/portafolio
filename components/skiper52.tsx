import enlaceImage from '../img/optimized/BRANDBOARD ENLACE_page-0001.jpg'
import merakiImage from '../img/optimized/BRANDBOARD MERAKI.jpg'
import missBonitaImage from '../img/optimized/BRANDBOARD Miss bonita-01.jpg'
import brandboardImage from '../img/Brandboard.jpg'
import eveluImage from '../img/optimized/EVELU BRANDBOARD.jpg'
import feImage from '../img/Fe y puntos brand-01.png'
import marcaImage from '../img/optimized/Marca_KC_BRANDBOARD-2.jpg'
import fiorelaImage from '../img/optimized/brandboard fiorela_page-0001.jpg'
import './skiper52.css'

const images = [
  { src: enlaceImage, alt: 'Brandboard Enlace', code: '# 01' },
  { src: merakiImage, alt: 'Brandboard Meraki', code: '# 02' },
  { src: missBonitaImage, alt: 'Brandboard Miss Bonita', code: '# 03' },
  { src: brandboardImage, alt: 'Brandboard', code: '# 04' },
  { src: eveluImage, alt: 'Brandboard Evelu', code: '# 05' },
  { src: feImage, alt: 'Brandboard Fe y puntos', code: '# 06' },
  { src: marcaImage, alt: 'Brandboard Marca KC', code: '# 07' },
  { src: fiorelaImage, alt: 'Brandboard Fiorela', code: '# 08' },
]

export const galleryCardCount = images.length

export default function Skiper52() {
  return (
    <div className="skiper52" role="list" aria-label="Galería horizontal de imágenes">
      <div className="skiper52__gallery">
        {images.map((image) => (
          <article
            className="skiper52__card"
            key={image.code}
            role="listitem"
          >
            <span className="skiper52__gradient" aria-hidden="true" />
            <span className="skiper52__code">{image.code}</span>
            <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
          </article>
        ))}
      </div>
    </div>
  )
}
