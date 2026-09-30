import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { collectLeds, letterRanges, prepareBorder, type Led } from './geometry'
import {
  LETTER_COUNT_MAX,
  bakeLightMap,
  createBordeMaterial,
  createFondoMaterial,
  createFrenteMaterial,
  createLedMaterials,
  type Shared,
} from './materials'

gsap.registerPlugin(ScrollTrigger)

export interface CartelOptions {
  /** Sección que se fija (pin) durante el scroll; recibe clases y variables CSS. */
  root: HTMLElement
  /** Contenedor donde se agrega el canvas. */
  stage: HTMLElement
  /** URL del .glb o su contenido ya descargado. */
  source: string | ArrayBuffer
  /** Largo del scroll en alturas de viewport. */
  scrollLength?: number
  /** Texto alternativo del canvas. */
  label?: string
  /** Se llama cuando cambia la etapa visible: 0 base, 1 bordes, 2 frente, 3 luz. */
  onStage?: (stage: number) => void
  /** Cancela la carga (por ejemplo, al desmontar el componente antes de terminar). */
  signal?: AbortSignal
}

/** Color de la pared. Calibrado para que, tras el tone mapping, se vea como #1b1c1e. */
const WALL = 0x343538
/** Intensidad de emisión de los módulos LED cuando están al 100 %. */
const LED_GAIN = 3
/** Progreso del timeline (0..1) a partir del cual se encienden las luces. */
const LIGHTS_AT = 0.895

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

interface State {
  fondo: number
  leds: number
  front: number
  borde: number[]
  letters: number[]
  cam: { yaw: number; pitch: number; k: number; tx: number }
}

export class CartelScroll {
  static async create(o: CartelOptions): Promise<CartelScroll> {
    o.root.classList.add('is-loading')
    const loader = new GLTFLoader()
    const gltf =
      typeof o.source === 'string' ? await loader.loadAsync(o.source) : await loader.parseAsync(o.source, '')
    if (o.signal?.aborted) {
      o.root.classList.remove('is-loading')
      throw new DOMException('Carga cancelada', 'AbortError')
    }
    return new CartelScroll(o, gltf.scene)
  }

  private readonly renderer: THREE.WebGLRenderer
  private readonly composer: EffectComposer
  private readonly bloom: UnrealBloomPass
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 5, 800)
  private readonly lightMap: THREE.Texture
  private readonly tl: gsap.core.Timeline
  private readonly st?: ScrollTrigger
  private readonly ro: ResizeObserver
  private readonly io: IntersectionObserver

  private readonly frente: THREE.Mesh
  private readonly fondo: THREE.Mesh
  private readonly borde: THREE.Mesh
  private readonly leds: Led[]
  private readonly ledMats: THREE.MeshStandardMaterial[]
  private readonly frontZ: number
  private readonly fondoU: { uFondo: { value: number } }
  private readonly frenteU: { uFront: { value: number } }
  private readonly bordeU: { uGlow: { value: number } }

  private readonly center = new THREE.Vector3()
  private readonly size = new THREE.Vector2()
  private readonly s: State
  private readonly nLetters: number
  private readonly reduced: boolean

  private fit = 80
  private visible = true
  private lightsOn = false
  private flicker: gsap.core.Tween | gsap.core.Timeline | null = null
  private stage = -1
  private cssCache = new Map<string, string>()
  private mouse = { x: 0, y: 0, tx: 0, ty: 0 }

  private constructor(private readonly o: CartelOptions, model: THREE.Group) {
    const { root, stage } = o
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // --- Piezas del modelo -------------------------------------------------
    model.updateMatrixWorld(true)
    const frente = model.getObjectByName('frente') as THREE.Mesh | undefined
    const fondo = model.getObjectByName('fondo') as THREE.Mesh | undefined
    const borde = model.getObjectByName('borde') as THREE.Mesh | undefined
    const ledGroup = model.children.find((c) => c.name.startsWith('led'))
    if (!frente || !fondo || !borde || !ledGroup)
      throw new Error('El modelo necesita las piezas "frente", "fondo", "borde" y "led_modulo*".')
    this.frente = frente
    this.fondo = fondo
    this.borde = borde

    const ranges = letterRanges(frente.geometry).slice(0, LETTER_COUNT_MAX)
    this.nLetters = ranges.length

    const box = new THREE.Box3().setFromObject(frente)
    const whole = new THREE.Box3().setFromObject(model)
    this.size.set(box.max.x - box.min.x, box.max.y - box.min.y)
    whole.getCenter(this.center)
    const boundsMin = new THREE.Vector2(box.min.x - 0.6, box.min.y - 0.6)
    const boundsSize = new THREE.Vector2(this.size.x + 1.2, this.size.y + 1.2)

    const shared: Shared = {
      boundsMin,
      boundsSize,
      borde: Array.from({ length: LETTER_COUNT_MAX }, () => 0),
      letters: Array.from({ length: LETTER_COUNT_MAX }, () => 0),
      ranges,
    }

    // --- Materiales --------------------------------------------------------
    this.leds = collectLeds(ledGroup, ranges)
    this.lightMap = bakeLightMap(
      this.leds.map((l) => l.world),
      boundsMin,
      boundsSize,
    )
    const fo = createFondoMaterial(shared)
    const bo = createBordeMaterial(shared)
    const fr = createFrenteMaterial(shared, this.lightMap)
    this.ledMats = createLedMaterials(ranges.length)

    fondo.material = fo.material
    borde.geometry = prepareBorder(borde.geometry, ranges)
    borde.material = bo.material
    frente.material = fr.material
    frente.renderOrder = 10
    this.leds.forEach((l) => (l.mesh.material = this.ledMats[l.letter]))
    this.fondoU = fo.uniforms
    this.bordeU = bo.uniforms
    this.frenteU = fr.uniforms
    this.frontZ = frente.position.z

    fondo.visible = borde.visible = frente.visible = false
    this.leds.forEach((l) => l.mesh.scale.setScalar(0.0001))

    this.s = {
      fondo: 0,
      leds: 0,
      front: 0,
      borde: shared.borde,
      letters: shared.letters,
      cam: { yaw: -0.5, pitch: 0.2, k: 0.92, tx: -6 },
    }

    // --- Escena, luces, render --------------------------------------------
    this.scene.background = new THREE.Color(WALL)
    this.scene.add(model)

    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1
    const canvas = this.renderer.domElement
    canvas.classList.add('cartel__canvas')
    canvas.setAttribute('role', 'img')
    canvas.setAttribute('aria-label', o.label ?? 'Cartel corpóreo LED con la palabra CAMILA')
    stage.prepend(canvas)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 1.05
    pmrem.dispose()

    const key = new THREE.DirectionalLight(0xfff2e2, 1.5)
    key.position.set(this.center.x - 26, this.center.y + 40, this.center.z + 70)
    key.target.position.copy(this.center)
    this.scene.add(key, key.target)

    const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 })
    this.composer = new EffectComposer(this.renderer, target)
    this.composer.addPass(new RenderPass(this.scene, this.camera))
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0, 0.42, 1.0)
    this.composer.addPass(this.bloom)
    this.composer.addPass(new OutputPass())

    this.resize()
    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(stage)
    this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting))
    this.io.observe(root)

    if (!this.reduced) {
      stage.addEventListener('pointermove', this.onPointer)
      stage.addEventListener('pointerleave', this.onLeave)
    }

    // --- Timeline (0..10) --------------------------------------------------
    const S = this.s
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
    tl.to(S, { fondo: 1, duration: 3.0, ease: 'power1.inOut' }, 0.25)
    tl.to(S, { leds: 1, duration: 2.6 }, 1.5)
    for (let k = 0; k < this.nLetters; k++)
      tl.to(S.borde, { [k]: 1, duration: 1.2, ease: 'power1.inOut' } as gsap.TweenVars, 3.1 + k * 0.5)
    tl.to(S, { front: 1, duration: 2.0, ease: 'power2.inOut' }, 6.5)
    // Mientras se arman base y bordes la cámara queda de costado (así se ve la
    // profundidad); recién con el frente vuelve a mirar de frente.
tl.to(S.cam, { yaw: -0.36, pitch: 0.12, k: 0.98, tx: 0, duration: 6.6 }, 0)
tl.to(S.cam, { yaw: 0, pitch: 0, k: 1, tx: 0, duration: 2.4, ease: 'power2.inOut' }, 6.6)
    tl.to({}, { duration: 0.1 }, 9.9)
    this.tl = tl

    if (this.reduced) {
      tl.progress(1)
      this.setLights(true, true)
    } else {
      this.st = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * (o.scrollLength ?? 4.5))}`,
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        animation: tl,
        onUpdate: (self) => root.classList.toggle('is-started', self.progress > 0.015),
      })
      void document.fonts?.ready.then(() => ScrollTrigger.refresh())
    }

    this.update()
    this.composer.render()
    root.classList.remove('is-loading')
    root.classList.add('is-ready')
    if (this.reduced) root.classList.add('is-static')
    gsap.ticker.add(this.tick)
  }

  // ---------------------------------------------------------------------------

  /** Estado interno, útil para depurar y para tests. */
  get debug() {
    return {
      progress: this.tl.progress(),
      lightsOn: this.lightsOn,
      stage: this.stage,
      letters: [...this.s.letters].slice(0, this.nLetters),
      state: this.s,
    }
  }

  destroy() {
    gsap.ticker.remove(this.tick)
    this.st?.kill(true)
    this.tl.kill()
    this.flicker?.kill()
    this.ro.disconnect()
    this.io.disconnect()
    this.o.stage.removeEventListener('pointermove', this.onPointer)
    this.o.stage.removeEventListener('pointerleave', this.onLeave)

    this.scene.traverse((obj) => {
      const m = obj as THREE.Mesh
      if (!m.isMesh) return
      m.geometry.dispose()
      ;(Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose())
    })
    this.lightMap.dispose()
    this.scene.environment?.dispose()
    this.composer.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.renderer.domElement.remove()
    this.o.root.classList.remove('is-loading', 'is-ready', 'is-started', 'is-static')
  }

  // --- Luz ------------------------------------------------------------------

  private setLights(on: boolean, instant = false) {
    this.lightsOn = on
    this.flicker?.kill()
    const L = this.s.letters
    const n = this.nLetters
    if (instant) {
      for (let k = 0; k < n; k++) L[k] = on ? 1 : 0
      return
    }
    if (!on) {
      const to: Record<string, number> = { duration: 0.3 }
      for (let k = 0; k < n; k++) to[k] = 0
      this.flicker = gsap.to(L, { ...to, ease: 'power2.out' } as gsap.TweenVars)
      return
    }

    // Corto eléctrico: tres destellos cada vez más largos y luego queda fija.
    // Cada letra arranca con un pequeño desfase para que no parpadee en bloque.
    const offsets = [0, 0.035, 0.012, 0.06, 0.024, 0.045, 0.03, 0.05]
    const steps: [number, number][] = [
      [0.0, 0],
      [0.05, 0.6],
      [0.12, 0.04],
      [0.33, 0.9],
      [0.39, 0.0],
      [0.66, 1.0],
      [0.78, 0.08],
      [1.02, 1.14],
    ]
    const tl = gsap.timeline()
    for (let k = 0; k < n; k++) {
      const o = offsets[k % offsets.length]
      steps.forEach(([t, v]) => tl.set(L, { [k]: v } as gsap.TweenVars, o + t))
      tl.to(L, { [k]: 1, duration: 0.7, ease: 'power2.out' } as gsap.TweenVars, o + 1.04)
    }
    this.flicker = tl
  }

  // --- Render ----------------------------------------------------------------

  private readonly tick = () => {
    if (!this.visible) return
    const p = this.tl.progress()
    if (!this.lightsOn && p >= LIGHTS_AT) this.setLights(true)
    else if (this.lightsOn && p < LIGHTS_AT - 0.04) this.setLights(false)

    this.mouse.x += (this.mouse.tx - this.mouse.x) * 0.06
    this.mouse.y += (this.mouse.ty - this.mouse.y) * 0.06
    this.update()
    this.composer.render()
  }

  private update() {
    const s = this.s
    const n = this.nLetters

    // Fondo
    this.fondo.visible = s.fondo > 0.001
    this.fondoU.uFondo.value = s.fondo

    // Bordes: el uniform apunta al mismo array que tweenea el timeline.
    let bordeSum = 0
    for (let k = 0; k < n; k++) bordeSum += s.borde[k]
    const bordeAvg = bordeSum / n
    this.borde.visible = bordeAvg > 0.001

    // Módulos LED: aparecen de izquierda a derecha, escalando desde su centro.
    for (const led of this.leds) {
      const t = clamp01((s.leds - led.order * 0.72) / 0.28)
      led.mesh.visible = t > 0
      led.mesh.scale.setScalar(Math.max(easeOutCubic(t), 0.0001))
    }

    // Frente: se acerca desde adelante mientras se vuelve opaco.
    this.frente.visible = s.front > 0.001
    this.frente.position.z = this.frontZ + (1 - easeOutCubic(s.front)) * 4.5
    this.frenteU.uFront.value = s.front

    // Luz
    let lit = 0
    for (let k = 0; k < n; k++) {
      this.ledMats[k].emissiveIntensity = s.letters[k] * LED_GAIN
      lit += s.letters[k]
    }
    const light = clamp01(lit / n)
    this.bordeU.uGlow.value = light
    this.bloom.strength = 0.4 * light

    // Cámara
    this.applyCamera()

    // HUD (variables CSS, sin pasar por React)
    this.css('--p-base', s.fondo)
    this.css('--p-bordes', bordeAvg)
    this.css('--p-frente', s.front)
    this.css('--p-luz', light)
    this.css('--glow', light)

    const stage = this.lightsOn ? 3 : s.front > 0.02 ? 2 : bordeAvg > 0.01 ? 1 : 0
    if (stage !== this.stage) {
      this.stage = stage
      this.o.onStage?.(stage)
    }
  }

  private css(name: string, value: number) {
    const v = value.toFixed(3)
    if (this.cssCache.get(name) === v) return
    this.cssCache.set(name, v)
    this.o.root.style.setProperty(name, v)
  }

  private applyCamera() {
    const { yaw, pitch, k, tx } = this.s.cam
    const dist = this.fit * k
    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const viewH = 2 * dist * tan
    const y = yaw + this.mouse.x * 0.05
    const p = pitch + this.mouse.y * 0.03
    // El cartel queda un poco por encima del centro para dejar lugar al texto.
    const tx3 = new THREE.Vector3(this.center.x + tx, this.center.y - viewH * 0.055, this.center.z)
    this.camera.position.set(
      tx3.x + Math.sin(y) * Math.cos(p) * dist,
      tx3.y + Math.sin(p) * dist,
      tx3.z + Math.cos(y) * Math.cos(p) * dist,
    )
    this.camera.lookAt(tx3)
  }

  private resize() {
    const { stage } = this.o
    const w = Math.max(stage.clientWidth, 1)
    const h = Math.max(stage.clientHeight, 1)
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(w, h, false)
    this.composer.setPixelRatio(dpr)
    this.composer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()

    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2))
    const margin = this.camera.aspect > 1.3 ? 1.34 : 1.12
    const byWidth = (this.size.x * margin) / 2 / (tan * this.camera.aspect)
    const byHeight = (this.size.y * 3) / 2 / tan
    this.fit = Math.max(byWidth, byHeight)
  }

  private readonly onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = this.o.stage.getBoundingClientRect()
    this.mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1
    this.mouse.ty = ((e.clientY - r.top) / r.height) * 2 - 1
  }

  private readonly onLeave = () => {
    this.mouse.tx = this.mouse.ty = 0
  }
}
