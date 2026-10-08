import { useEffect, useRef, useState } from 'react'
import { CartelScroll } from './engine'
import './cartel.css'

export interface CartelSectionProps {
  /** URL del .glb (por ejemplo "/cartel.glb") o su contenido. */
  src: string | ArrayBuffer
  /** Largo del scroll en alturas de pantalla. */
  scrollLength?: number
  /** Desactiva el pin interno al anidar el cartel en una escena fijada. */
  pin?: boolean
  /** Recibe la instancia del motor cuando está listo (útil para depurar). */
  onReady?: (engine: CartelScroll) => void
}

export default function CartelSection({ src, scrollLength = 4.5, pin = true, onReady }: CartelSectionProps) {
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    const host = stageRef.current
    if (!root || !host) return

    const ctrl = new AbortController()
    let engine: CartelScroll | undefined

    CartelScroll.create({ root, stage: host, source: src, scrollLength, pin, signal: ctrl.signal })
      .then((e) => {
        engine = e
        onReady?.(e)
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        console.error('[CartelSection] Error al iniciar:', err)
        if (err instanceof Error) console.error('[CartelSection] Stack:', err.stack)
        setFailed(true)
      })

    return () => {
      ctrl.abort()
      engine?.destroy()
    }
    // onReady no debe reiniciar la escena.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, scrollLength, pin])

  return (
    <section ref={rootRef} className="cartel" aria-labelledby="cartel-title">
      <h2 id="cartel-title" className="cartel__sr">
        Cómo se fabrica el cartel CAMILA
      </h2>

      <div ref={stageRef} className="cartel__stage">
        <div className="cartel__spill" aria-hidden="true" />
        <div className="cartel__vignette" aria-hidden="true" />
      </div>

      {failed && (
        <p className="cartel__fallback">No se pudo iniciar el visor 3D en este dispositivo.</p>
      )}
    </section>
  )
}
