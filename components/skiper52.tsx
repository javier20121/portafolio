import previewImage from '../img/preview.png'
import './skiper52.css'

const images = [
  { src: previewImage, alt: 'Vista previa del portafolio', code: '# 23' },
  { src: previewImage, alt: 'Vista previa del portafolio', code: '# 23' },
  { src: previewImage, alt: 'Vista previa del portafolio', code: '# 23' },
  { src: previewImage, alt: 'Vista previa del portafolio', code: '# 23' },
  { src: previewImage, alt: 'Vista previa del portafolio', code: '# 23' },
  { src: previewImage, alt: 'Vista previa del portafolio', code: '# 23' },
  { src: previewImage, alt: 'Vista previa del portafolio', code: '# 23' },
  { src: previewImage, alt: 'Vista previa del portafolio', code: '# 23' },
  { src: previewImage, alt: 'Vista previa del portafolio', code: '# 23' },
]

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
