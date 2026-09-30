import * as THREE from 'three'
import type { Range } from './geometry'

export const LETTER_COUNT_MAX = 8

const NOISE = /* glsl */ `
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x), f.y);
}
`

const WARM = 'vec3(1.0, 0.93, 0.82)'

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
    color: 0xeeebe4,
    roughness: 0.62,
    metalness: 0.0,
    envMapIntensity: 0.8,
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
    color: 0xe2dfd8,
    roughness: 0.5,
    metalness: 0.0,
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
varying float vD; varying float vH;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vD = uBorde[int(aLetter + 0.5)] * 1.06 - aT;
vH = aH;`,
      )
    sh.fragmentShader = sh.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
uniform float uGlow;
varying float vD; varying float vH;`,
      )
      .replace(
        '#include <clipping_planes_fragment>',
        `#include <clipping_planes_fragment>
if (vD < 0.0) discard;
float riseB = smoothstep(0.0, 1.0, clamp(vD / 0.055, 0.0, 1.0));
if (vH > riseB) discard;
float frontier = (1.0 - smoothstep(0.0, 0.12, riseB - vH)) * (1.0 - smoothstep(0.75, 1.0, riseB));`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
totalEmissiveRadiance += ${WARM} * (frontier * 0.55 + uGlow * 0.12);`,
      )
  }
  return { material: mat, uniforms }
}

/**
 * Acrílico blanco opal. Deja pasar la luz de los módulos (que se ven apenas
 * como manchas difusas) y suma un resplandor propio a partir de un mapa de luz
 * horneado con la posición de cada LED.
 */
export function createFrenteMaterial(s: Shared, lightMap: THREE.Texture) {
  const uniforms = {
    uFront: u(0),
    uLetter: u(s.letters),
    uEdges: u(edgesFromRanges(s.ranges)),
    uLightMap: u(lightMap),
    uMin: u(s.boundsMin),
    uSize: u(s.boundsSize),
    uGain: u(1.0),
  }
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xece9e3,
    roughness: 0.46,
    metalness: 0.0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.4,
    transparent: true,
    opacity: 0.965,
    depthWrite: false,
    envMapIntensity: 0.7,
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
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
float lm = texture2D(uLightMap, (vSignXY - uMin) / uSize).r;
totalEmissiveRadiance += ${WARM} * (0.10 + lm * 0.95) * letterLight(vSignXY.x) * uGain;`,
      )
  }
  return { material: mat, uniforms }
}

/** Un material por letra: comparten color base y solo cambia la emisión. */
export function createLedMaterials(count: number): THREE.MeshStandardMaterial[] {
  return Array.from({ length: count }, () => {
    const m = new THREE.MeshStandardMaterial({
      color: 0xd9d6cf,
      roughness: 0.55,
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
  const radius = 1.7 * ppu
  for (const p of points) {
    const cx = (p.x - min.x) * ppu
    const cy = canvas.height - (p.y - min.y) * ppu
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
    g.addColorStop(0, 'rgba(255,255,255,0.26)')
    g.addColorStop(0.4, 'rgba(255,255,255,0.11)')
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
