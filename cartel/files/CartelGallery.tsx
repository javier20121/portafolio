import './cartel-gallery.css'

const IMAGES = [
  { src: '/img/cami.png', alt: 'Imagen de prueba 1' },
  { src: '/img/silueta.jpeg', alt: 'Imagen de prueba 2' },
  { src: '/img/back.jpg', alt: 'Imagen de prueba 3' },
  { src: '/img/cami.png', alt: 'Imagen de prueba 4' },
  { src: '/img/silueta.jpeg', alt: 'Imagen de prueba 5' },
  { src: '/img/back.jpg', alt: 'Imagen de prueba 6' },
  { src: '/img/cami.png', alt: 'Imagen de prueba 7' },
  { src: '/img/silueta.jpeg', alt: 'Imagen de prueba 8' },
]

export default function CartelGallery() {
  return (
    <div className="cartel-gallery" aria-hidden="true">
      <div className="cartel-gallery__track">
        {IMAGES.map((image, index) => (
          <figure className="cartel-gallery__card" key={`${image.src}-${index}`}>
            <img src={image.src} alt="" draggable="false" />
          </figure>
        ))}
      </div>
    </div>
  )
}
