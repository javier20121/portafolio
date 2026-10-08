import * as THREE from 'three'
import { letterOf, type Range } from './geometry'

export const LETTER_COUNT_MAX = 8

const NOISE = /* glsl */ `
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
`

const WARM = 'vec3(1.0, 0.78, 0.86)'
const LILAC = 'vec3(0.74, 0.52, 0.94)'
const BORDER = 'vec3(0.41176, 0.03529, 0.6)'

export interface Shared {
  /** Límites del cartel (XY) para normalizar coordenadas. */
  boundsMin: THREE.Vector2
  boundsSize: THREE.Vector2
  /** Progreso de dibujo de los bordes, uno por letra. */
  borde: number[]
  /** Intensidad de luz por letra (0..1, puede pasar de 1 en el "encendido"). */
  letters: number[]
  ranges: readonly Range[]
}

/** Límites entre letras (punto medio entre rangos), rellenado con un valor inalcanzable. */
export function edgesFromRanges(ranges: readonly Range[]): number[] {
  const edges = Array.from({ length: LETTER_COUNT_MAX }, () => 1e9)
  for (let i = 0; i < Math.min(ranges.length - 1, LETTER_COUNT_MAX - 1); i++)
    edges[i] = (ranges[i][1] + ranges[i + 1][0]) / 2
  return edges
}

/** Uniforms comunes; se comparten por referencia entre materiales. */
function u<T>(value: T) {
  return { value }
}

export function createFondoMaterial(s: Shared) {
  const uniforms = {
    uFondo: u(0),
    uMin: u(s.boundsMin),
    uSize: u(s.boundsSize),
  }
  const mat = new THREE.MeshStandardMaterial({
    color: 0xc9c4bb,
    roughness: 0.7,
    metalness: 0.02,
    envMapIntensity: 0.65,
  })
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms)
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLocal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLocal = position;')
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uFondo; uniform vec2 uMin; uniform vec2 uSize;
varying vec3 vLocal;
${NOISE}`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
float rx = (vLocal.x - uMin.x) / uSize.x;
float ry = (vLocal.y - uMin.y) / uSize.y;
float tN = (rx * 0.86 + vnoise(vLocal.xy * 4.5) * 0.10 + ry * 0.04) * 0.995;
float eF = uFondo - tN;
if (eF < 0.0) discard;
float bandF = (1.0 - smoothstep(0.0, 0.05, eF)) * (1.0 - smoothstep(0.9, 1.0, uFondo));`,
      )
  .replace(
    '#include <color_fragment>',
    `#include <color_fragment>
float foamGrain = vnoise(vLocal.xy * 34.0);
float foamSpeckle = vnoise(vLocal.xy * 79.0);
diffuseColor.rgb *= 0.978 + foamGrain * 0.035 + foamSpeckle * 0.018;`,
  )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
totalEmissiveRadiance += ${WARM} * bandF * 0.5;`,
      )
  }
  return { material: mat, uniforms }
}

export function createBordeMaterial(s: Shared) {
  const uniforms = {
    uBorde: u(s.borde),
    uGlow: u(0),
  }
  const mat = new THREE.MeshStandardMaterial({
    color: 0x690599,
    roughness: 0.56,
    metalness: 0.08,
    side: THREE.DoubleSide,
    envMapIntensity: 0.9,
  })
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms)
    sh.vertexShader = sh.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
attribute float aT; attribute float aH; attribute float aLetter;
uniform float uBorde[${LETTER_COUNT_MAX}];
varying float vD; varying float vH; varying vec3 vLocal;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vD = uBorde[int(aLetter + 0.5)] * 1.06 - aT;
vH = aH; vLocal = position;`,
      )
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uGlow;
varying float vD; varying float vH; varying vec3 vLocal;
${NOISE}`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
if (vD < 0.0) discard;
float riseB = smoothstep(0.0, 1.0, clamp(vD / 0.085, 0.0, 1.0));
if (vH > riseB) discard;
float frontier = (1.0 - smoothstep(0.0, 0.12, riseB - vH)) * (1.0 - smoothstep(0.75, 1.0, riseB));`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
    float foamGrain = vnoise(vLocal.xy * 34.0);
    float foamSpeckle = vnoise(vLocal.xy * 79.0);
    diffuseColor.rgb *= 0.982 + foamGrain * 0.032 + foamSpeckle * 0.02;`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
    totalEmissiveRadiance += ${BORDER} * (frontier * 0.28 + uGlow * 0.85);`,
      )
  }
  return { material: mat, uniforms }
}

/**
 * Frente opal perlado: difunde los LED y cambia de cálido a lila en los bordes.
 */
export function createFrenteMaterial(s: Shared, lightMap: THREE.Texture) {
  const uniforms = {
    uFront: u(0),
    uLetter: u(s.letters),
    uEdges: u(edgesFromRanges(s.ranges)),
    uLightMap: u(lightMap),
    uMin: u(s.boundsMin),
    uSize: u(s.boundsSize),
    uGain: u(0.9),
  }
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xf0ece8,
    roughness: 0.58,
    metalness: 0.0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.52,
    transparent: true,
    opacity: 1,
    depthWrite: true,
    envMapIntensity: 0.82,
  })
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms)
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vSignXY;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSignXY = position.xy;')
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uFront; uniform float uLetter[${LETTER_COUNT_MAX}]; uniform float uEdges[${LETTER_COUNT_MAX}];
uniform sampler2D uLightMap; uniform vec2 uMin; uniform vec2 uSize; uniform float uGain;
varying vec2 vSignXY;
${NOISE}
float letterLight(float x){
  int i = 0;
  for (int k = 0; k < ${LETTER_COUNT_MAX - 1}; k++) { if (x > uEdges[k]) i = k + 1; }
  return uLetter[i];
}`,
      )
      .replace(
        '#include <alphatest_fragment>',
        `#include <alphatest_fragment>
diffuseColor.a *= smoothstep(0.0, 1.0, uFront);`,
      )
  .replace(
    '#include <color_fragment>',
    `#include <color_fragment>
float pearlGrain = vnoise(vSignXY * 38.0);
float pearlSpeckle = vnoise(vSignXY * 83.0);
diffuseColor.rgb *= 0.988 + pearlGrain * 0.018 + pearlSpeckle * 0.012;`,
  )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
float lm = texture2D(uLightMap, (vSignXY - uMin) / uSize).r;
float warmth = smoothstep(0.12, 0.72, lm);
vec3 ledGlow = mix(${LILAC}, ${WARM}, warmth);
totalEmissiveRadiance += ledGlow * (0.35 + lm * 2.2) * letterLight(vSignXY.x) * uGain;`,
      )
  }
  return { material: mat, uniforms }
}

/** Un material por letra: comparten color base y solo cambia la emisión. */
export function createLedMaterials(count: number): THREE.MeshStandardMaterial[] {
  return Array.from({ length: count }, () => {
    const m = new THREE.MeshStandardMaterial({
      color: 0xd9d6cf,
      roughness: 0.48,
      emissive: new THREE.Color(1.0, 0.93, 0.82),
      emissiveIntensity: 0,
    })
    return m
  })
}

/**
 * Mapa de luz 2D: un halo suave por módulo LED, en coordenadas del cartel.
 * Se hornea una sola vez en un canvas.
 */
export function bakeLightMap(
  points: readonly THREE.Vector3[],
  min: THREE.Vector2,
  size: THREE.Vector2,
): THREE.CanvasTexture {
  const ppu = 22
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(size.x * ppu)
  canvas.height = Math.ceil(size.y * ppu)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalCompositeOperation = 'lighter'
  const radius = 2.6 * ppu
  for (const p of points) {
    const cx = (p.x - min.x) * ppu
    const cy = canvas.height - (p.y - min.y) * ppu
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    g.addColorStop(0, 'rgba(255,255,255,0.52)')
    g.addColorStop(0.38, 'rgba(255,255,255,0.22)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.NoColorSpace
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.generateMipmaps = false
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

export function bakeLetterShadows(
  front: THREE.Mesh,
  ranges: readonly Range[],
  min: THREE.Vector2,
  size: THREE.Vector2,
): THREE.CanvasTexture[] {
  const geometry = front.geometry
  const position = geometry.getAttribute('position')
  const index = geometry.getIndex()
  const pixelsPerUnit = 18
  const textures = ranges.map(() => {
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(size.x * pixelsPerUnit)
    canvas.height = Math.ceil(size.y * pixelsPerUnit)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return { canvas, context: canvas.getContext('2d')!, texture }
  })

  front.updateWorldMatrix(true, false)
  for (const { context } of textures) {
    context.fillStyle = 'rgba(24, 17, 32, 0.16)'
    context.shadowColor = 'rgba(18, 12, 28, 0.46)'
    context.shadowBlur = 16
    context.shadowOffsetX = 7
    context.shadowOffsetY = 9
    context.beginPath()
  }

  const vertexCount = index ? index.count : position.count
  for (let i = 0; i < vertexCount; i += 3) {
    const ia = index ? index.getX(i) : i
    const ib = index ? index.getX(i + 1) : i + 1
    const ic = index ? index.getX(i + 2) : i + 2
    const centerX = (position.getX(ia) + position.getX(ib) + position.getX(ic)) / 3
    const letter = letterOf(centerX, ranges)
    const ctx = textures[letter]?.context
    if (!ctx) continue

    ctx.moveTo(
      (front.localToWorld(new THREE.Vector3(position.getX(ia), position.getY(ia), position.getZ(ia))).x - min.x) * pixelsPerUnit,
      ctx.canvas.height - (front.localToWorld(new THREE.Vector3(position.getX(ia), position.getY(ia), position.getZ(ia))).y - min.y) * pixelsPerUnit,
    )
    for (const vertex of [ib, ic]) {
      const world = front.localToWorld(
        new THREE.Vector3(position.getX(vertex), position.getY(vertex), position.getZ(vertex)),
      )
      ctx.lineTo((world.x - min.x) * pixelsPerUnit, ctx.canvas.height - (world.y - min.y) * pixelsPerUnit)
    }
    ctx.closePath()
  }

  for (const { context, texture } of textures) {
    context.fill()
    texture.needsUpdate = true
  }
  return textures.map(({ texture }) => texture)
}
