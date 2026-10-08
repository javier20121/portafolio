import enlaceImage from '../img/BRANDBOARD ENLACE_page-0001.jpg'
import merakiImage from '../img/BRANDBOARD MERAKI.png'
import missBonitaImage from '../img/BRANDBOARD Miss bonita-01.png'
import brandboardImage from '../img/Brandboard.jpg'
import eveluImage from '../img/EVELU BRANDBOARD.png'
import feImage from '../img/Fe y puntos brand-01.png'
import marcaImage from '../img/Marca_KC_BRANDBOARD-2.png'
import fiorelaImage from '../img/brandboard fiorela_page-0001.jpg'
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

export default function Skiper52({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="skiper52" role="list" aria-label="Galería horizontal de imágenes">
      {images.map((image, index) => (
        <article
          className={`skiper52__card${activeIndex === index ? ' is-active' : ''}`}
          key={index}
          role="listitem"
        >
          <img src={image.src} alt={image.alt} />
          <span className="skiper52__code" aria-hidden="true">
            {image.code}
          </span>
        </article>
      ))}
    </div>
  )
}
