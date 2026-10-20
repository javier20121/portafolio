const ROOT = '#70009b'
const FRAME_MS = 33
const IDLE_AFTER_MS = 5000
const IDLE_SPEED = 0.1
const GRAIN_DELAY_MS = 3000

const HUE_COLD = 200
const HUE_WARM = 30

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function easeOut(t) {
  return 1 - (1 - clamp(t, 0, 1)) ** 3
}

function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return s - Math.floor(s)
}

function noise(x, y) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const u = fx * fx * (3 - 2 * fx)
  const v = fy * fy * (3 - 2 * fy)
  return lerp(
    lerp(hash(ix, iy), hash(ix + 1, iy), u),
    lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), u),
    v,
  )
}

function hslToRgb(h, s, l) {
  const hue = ((h % 360) + 360) % 360 / 360
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const toRgb = (t) => {
    let tone = t
    if (tone < 0) tone += 1
    if (tone > 1) tone -= 1
    if (tone < 1 / 6) return p + (q - p) * 6 * tone
    if (tone < 1 / 2) return q
    if (tone < 2 / 3) return p + (q - p) * (2 / 3 - tone) * 6
    return p
  }
  return [
    Math.round(toRgb(hue + 1 / 3) * 255),
    Math.round(toRgb(hue) * 255),
    Math.round(toRgb(hue - 1 / 3) * 255),
  ]
}

function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h * 360, s, l]
}

function parseHex(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function makeGrainUrl() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(size, size)
  const bayer = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5],
  ]
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * 4
      const dither = (bayer[y & 3][x & 3] / 16) * 48
      const v = Math.min(255, Math.random() * 210 + dither)
      image.data[i] = v
      image.data[i + 1] = v
      image.data[i + 2] = v
      image.data[i + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  return canvas.toDataURL('image/png')
}

const BLOBS = [
  { layer: 'far', hex: '#a8ddd0', x: 0.16, y: 0.78, size: 0.72, alpha: 0.15, wander: 0.12, seed: 1.1, intro: 'mint' },
  { layer: 'far', hex: '#ae87ff', x: 0.72, y: 0.18, size: 0.58, alpha: 0.12, wander: 0.1, seed: 2.4, intro: 'late' },
  { layer: 'mid', hex: '#ff9c70', x: 0.82, y: 0.44, size: 0.34, alpha: 0.25, wander: 0.16, seed: 3.7, intro: 'coral' },
  { layer: 'mid', hex: '#a8ddd0', x: 0.38, y: 0.52, size: 0.3, alpha: 0.2, wander: 0.14, seed: 4.2, intro: 'late' },
  { layer: 'mid', hex: '#ae87ff', x: 0.58, y: 0.72, size: 0.28, alpha: 0.18, wander: 0.15, seed: 5.9, intro: 'late' },
  { layer: 'near', hex: '#ff9c70', x: 0.28, y: 0.32, size: 0.16, alpha: 0.32, wander: 0.18, seed: 6.3, intro: 'late' },
  { layer: 'near', hex: '#a8ddd0', x: 0.7, y: 0.62, size: 0.14, alpha: 0.28, wander: 0.2, seed: 7.8, intro: 'late' },
  { layer: 'near', hex: '#ae87ff', x: 0.48, y: 0.22, size: 0.12, alpha: 0.26, wander: 0.17, seed: 8.1, intro: 'late' },
]

function introT(kind, elapsed) {
  if (kind === 'mint') return easeOut((elapsed - 0) / 2000)
  if (kind === 'coral') return easeOut((elapsed - 1000) / 2000)
  return easeOut((elapsed - 1600) / 1800)
}

function introOffset(kind, t) {
  const k = 1 - t
  if (kind === 'mint') return { x: 0, y: k * 0.38 }
  if (kind === 'coral') return { x: k * 0.32, y: 0 }
  return { x: 0, y: k * 0.08 }
}

function sceneMix() {
  const cartel = document.querySelector('.cartel')
  const gallery = document.querySelector('.gallery-section')
  const vh = window.innerHeight
  const cartelTop = cartel?.getBoundingClientRect().top ?? vh * 2
  const galleryTop = gallery?.getBoundingClientRect().top ?? vh * 3

  if (galleryTop < vh * 0.55) {
    const t = clamp((vh * 0.55 - galleryTop) / (vh * 0.5), 0, 1)
    return lerp(0.7, 0.85, t)
  }
  if (cartelTop < vh * 0.62) {
    const t = clamp((vh * 0.62 - cartelTop) / (vh * 0.7), 0, 1)
    return lerp(1, 0.7, t)
  }
  return 1
}

function scrollAmount() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  return clamp(window.scrollY / max, 0, 1)
}

function createAtmosphere() {
  const canvas = document.getElementById('atmosphere')
  const grain = document.getElementById('atmosphere-grain')
  if (!canvas) return

  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  const coarse = window.matchMedia('(pointer: coarse)')
  const far = document.createElement('canvas')
  const farCtx = far.getContext('2d')

  let width = 0
  let height = 0
  let scale = 1
  let raf = 0
  let lastDraw = 0
  let lastStamp = performance.now()
  let start = performance.now()
  let lastInput = performance.now()
  let lastBake = 0
  let lastHue = 0
  let motion = 0
  let hueShift = 0
  let grainOn = false

  if (grain) grain.style.backgroundImage = `url("${makeGrainUrl()}")`

  const markInput = () => {
    lastInput = performance.now()
  }

  const colorFor = (blob) => {
    const [r, g, b] = parseHex(blob.hex)
    const [h, s, l] = rgbToHsl(r, g, b)
    return hslToRgb(h + hueShift, s * 0.86, l * 0.72)
  }

  const blobPoint = (blob, elapsed, motion, w, h) => {
    const appear = introT(blob.intro, elapsed)
    const offset = introOffset(blob.intro, appear)
    const t = motion * 0.00008
    const nx = noise(blob.seed, t) - 0.5
    const ny = noise(blob.seed + 11, t * 0.94) - 0.5
    return {
      appear,
      x: (blob.x + offset.x + nx * blob.wander) * w,
      y: (blob.y + offset.y + ny * blob.wander) * h,
      radius: blob.size * Math.min(w, h),
    }
  }

  const paintBlobs = (target, list, elapsed, motion, w, h) => {
    list.forEach((blob) => {
      const point = blobPoint(blob, elapsed, motion, w, h)
      if (point.appear <= 0) return
      const [r, g, b] = colorFor(blob)
      const gradient = target.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${blob.alpha * point.appear})`)
      gradient.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${blob.alpha * 0.45 * point.appear})`)
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
      target.fillStyle = gradient
      target.fillRect(0, 0, w, h)
    })
  }

  const bakeFar = (elapsed, motion) => {
    if (!farCtx) return
    const pad = 1.45
    far.width = Math.max(1, Math.round(width * pad))
    far.height = Math.max(1, Math.round(height * pad))
    farCtx.fillStyle = ROOT
    farCtx.fillRect(0, 0, far.width, far.height)
    farCtx.filter = `blur(${Math.round(40 * scale)}px)`
    paintBlobs(farCtx, BLOBS.filter((blob) => blob.layer === 'far'), elapsed, motion, far.width, far.height)
    farCtx.filter = 'none'
  }

  const resize = () => {
    const mobile = coarse.matches || window.innerWidth < 768
    scale = mobile ? 0.5 : 1
    width = Math.max(1, Math.round(window.innerWidth * scale))
    height = Math.max(1, Math.round(window.innerHeight * scale))
    canvas.width = width
    canvas.height = height
    lastBake = 0
    bakeFar(performance.now() - start, motion)
    draw(performance.now(), !reduced.matches)
  }

  const maybeBakeFar = (elapsed, now) => {
    const intro = elapsed < 4200
    const hueMoved = Math.abs(hueShift - lastHue) > 1.5
    const due = now - lastBake > (intro ? 90 : 480)
    if (!far.width || intro || hueMoved || due) {
      bakeFar(elapsed, motion)
      lastBake = now
      lastHue = hueShift
    }
  }

  const draw = (now, animate) => {
    const elapsed = reduced.matches ? 4000 : now - start
    hueShift = (lerp(HUE_COLD, HUE_WARM, scrollAmount()) - HUE_COLD) * 0.42
    canvas.style.opacity = String(sceneMix())

    if (grain && (reduced.matches || elapsed >= GRAIN_DELAY_MS) && !grainOn) {
      grain.classList.add('is-on')
      grainOn = true
    }

    maybeBakeFar(elapsed, now)

    ctx.fillStyle = ROOT
    ctx.fillRect(0, 0, width, height)
    ctx.save()
    const breath = animate ? Math.sin(motion * 0.00012) * 0.05 + 1 : 1
    ctx.translate(width / 2, height / 2)
    ctx.scale(breath, breath)
    ctx.translate(-width / 2, -height / 2)

    const parallax = window.scrollY * 0.2 * scale
    const farX = (width - far.width) / 2
    const farY = (height - far.height) / 2 - parallax * 0.2
    if (far.width) ctx.drawImage(far, farX, farY)

    ctx.translate(0, -parallax * 0.12)
    paintBlobs(ctx, BLOBS.filter((blob) => blob.layer === 'mid'), elapsed, motion, width, height)
    ctx.translate(0, -parallax * 0.06)
    paintBlobs(ctx, BLOBS.filter((blob) => blob.layer === 'near'), elapsed, motion, width, height)
    ctx.restore()
  }

  const tick = (now) => {
    if (document.hidden || reduced.matches) return
    const idle = now - lastInput > IDLE_AFTER_MS
    const interval = idle ? FRAME_MS / IDLE_SPEED : FRAME_MS
    if (now - lastDraw >= interval) {
      motion += (now - lastStamp) * (idle ? IDLE_SPEED : 1)
      lastStamp = now
      lastDraw = now
      draw(now, true)
    }
    raf = requestAnimationFrame(tick)
  }

  const startLoop = () => {
    cancelAnimationFrame(raf)
    lastStamp = performance.now()
    if (document.hidden || reduced.matches) {
      draw(performance.now(), false)
      return
    }
    raf = requestAnimationFrame(tick)
  }

  resize()
  draw(performance.now(), !reduced.matches)
  startLoop()

  window.addEventListener('resize', resize, { passive: true })
  window.addEventListener('scroll', () => {
    markInput()
    if (reduced.matches) draw(performance.now(), false)
  }, { passive: true })
  window.addEventListener('pointermove', markInput, { passive: true })
  document.addEventListener('visibilitychange', startLoop)
  reduced.addEventListener('change', () => {
    resize()
    startLoop()
  })
}

createAtmosphere()
