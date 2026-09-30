import * as THREE from 'three'

export type Range = readonly [min: number, max: number]

/**
 * Rango en X de cada letra, a partir de las piezas conectadas del frente
 * (cada letra del frente es una pieza independiente).
 */
export function letterRanges(front: THREE.BufferGeometry): Range[] {
  const pos = front.getAttribute('position')
  const index = front.getIndex()
  const parent = Array.from({ length: pos.count }, (_, i) => i)
  const find = (a: number): number => {
    while (parent[a] !== a) {
      parent[a] = parent[parent[a]]
      a = parent[a]
    }
    return a
  }
  const union = (a: number, b: number) => {
    parent[find(a)] = find(b)
  }
  const tri = index ? index.count : pos.count
  for (let i = 0; i < tri; i += 3) {
    const a = index ? index.getX(i) : i
    const b = index ? index.getX(i + 1) : i + 1
    const c = index ? index.getX(i + 2) : i + 2
    union(a, b)
    union(a, c)
  }

  const boxes = new Map<number, [number, number]>()
  for (let v = 0; v < pos.count; v++) {
    const root = find(v)
    const x = pos.getX(v)
    const box = boxes.get(root)
    if (!box) boxes.set(root, [x, x])
    else {
      if (x < box[0]) box[0] = x
      if (x > box[1]) box[1] = x
    }
  }

  // Une piezas que se solapan en X (puntos, tildes) para que cuenten como una letra.
  const sorted = [...boxes.values()].sort((a, b) => a[0] - b[0])
  const merged: [number, number][] = []
  for (const r of sorted) {
    const last = merged[merged.length - 1]
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1])
    else merged.push([r[0], r[1]])
  }
  return merged
}

/** Índice de la letra cuyo rango en X está más cerca de `x`. */
export function letterOf(x: number, ranges: readonly Range[]): number {
  let best = 0
  let bestDist = Infinity
  ranges.forEach(([lo, hi], i) => {
    const d = x < lo ? lo - x : x > hi ? x - hi : 0
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  })
  return best
}

/**
 * Prepara la malla de bordes para "dibujarse" letra por letra.
 *
 * La malla es un conjunto de paredes verticales que forman contornos cerrados
 * (cada A tiene dos: exterior y triángulo interior). Se recorre cada contorno
 * y se guarda, por vértice:
 *   aT      posición 0..1 a lo largo del contorno (largo de arco)
 *   aH      altura 0..1 de la pared (para que "crezca" desde la base)
 *   aLetter índice de letra
 */
export function prepareBorder(
  source: THREE.BufferGeometry,
  ranges: readonly Range[],
): THREE.BufferGeometry {
  const geo = source.getIndex() ? source.toNonIndexed() : source.clone()
  const pos = geo.getAttribute('position') as THREE.BufferAttribute
  const count = pos.count
  const key = (i: number) => `${Math.round(pos.getX(i) * 500)},${Math.round(pos.getY(i) * 500)}`
  const eid = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

  const xy = new Map<string, [number, number]>()
  const adj = new Map<string, Set<string>>()
  const triKeys: string[][] = []
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set())
    if (!adj.has(b)) adj.set(b, new Set())
    adj.get(a)!.add(b)
    adj.get(b)!.add(a)
  }

  for (let t = 0; t < count; t += 3) {
    const keys = [...new Set([key(t), key(t + 1), key(t + 2)])]
    triKeys.push(keys)
    for (let v = t; v < t + 3; v++) {
      const k = key(v)
      if (!xy.has(k)) xy.set(k, [pos.getX(v), pos.getY(v)])
    }
    for (let i = 0; i < keys.length; i++)
      for (let j = i + 1; j < keys.length; j++) link(keys[i], keys[j])
  }

  interface Edge {
    a: string
    t0: number
    t1: number
    letter: number
  }
  const edges = new Map<string, Edge>()
  const seen = new Set<string>()

  for (const first of adj.keys()) {
    if (seen.has(first)) continue

    const comp: string[] = []
    const stack = [first]
    seen.add(first)
    while (stack.length) {
      const n = stack.pop()!
      comp.push(n)
      for (const m of adj.get(n)!)
        if (!seen.has(m)) {
          seen.add(m)
          stack.push(m)
        }
    }

    // Punto de partida: arriba a la izquierda del contorno.
    let start = comp[0]
    let best = Infinity
    for (const k of comp) {
      const [x, y] = xy.get(k)!
      const score = x * 0.5 - y
      if (score < best) {
        best = score
        start = k
      }
    }

    let order = [start]
    const visited = new Set(order)
    let cur = start
    for (;;) {
      const next = [...adj.get(cur)!].find((k) => !visited.has(k))
      if (!next) break
      visited.add(next)
      order.push(next)
      cur = next
    }
    for (const k of comp) if (!visited.has(k)) order.push(k)
    if (order.length < 3) continue

    // Sentido horario (Y hacia arriba => área negativa).
    let area = 0
    for (let i = 0; i < order.length; i++) {
      const [x0, y0] = xy.get(order[i])!
      const [x1, y1] = xy.get(order[(i + 1) % order.length])!
      area += x0 * y1 - x1 * y0
    }
    if (area > 0) order = [order[0], ...order.slice(1).reverse()]

    const cum = [0]
    for (let i = 0; i < order.length; i++) {
      const [x0, y0] = xy.get(order[i])!
      const [x1, y1] = xy.get(order[(i + 1) % order.length])!
      cum.push(cum[i] + Math.hypot(x1 - x0, y1 - y0))
    }
    const total = cum[order.length] || 1
    const meanX = order.reduce((s, k) => s + xy.get(k)![0], 0) / order.length
    const letter = letterOf(meanX, ranges)

    for (let i = 0; i < order.length; i++) {
      const a = order[i]
      const b = order[(i + 1) % order.length]
      edges.set(eid(a, b), { a, t0: cum[i] / total, t1: cum[i + 1] / total, letter })
    }
  }

  geo.computeBoundingBox()
  const zMin = geo.boundingBox!.min.z
  const zSize = Math.max(geo.boundingBox!.max.z - zMin, 1e-6)

  const aT = new Float32Array(count)
  const aH = new Float32Array(count)
  const aLetter = new Float32Array(count)

  for (let t = 0; t < count; t += 3) {
    const keys = triKeys[t / 3]
    const edge = keys.length === 2 ? edges.get(eid(keys[0], keys[1])) : undefined
    for (let v = t; v < t + 3; v++) {
      aH[v] = (pos.getZ(v) - zMin) / zSize
      if (edge) {
        aT[v] = key(v) === edge.a ? edge.t0 : edge.t1
        aLetter[v] = edge.letter
      } else {
        aT[v] = 0.5
        aLetter[v] = letterOf(pos.getX(v), ranges)
      }
    }
  }

  geo.setAttribute('aT', new THREE.BufferAttribute(aT, 1))
  geo.setAttribute('aH', new THREE.BufferAttribute(aH, 1))
  geo.setAttribute('aLetter', new THREE.BufferAttribute(aLetter, 1))
  return geo
}

export interface Led {
  mesh: THREE.Mesh
  letter: number
  /** Centro del módulo en coordenadas del cartel (XY). */
  world: THREE.Vector3
  /** 0..1 según la posición en X, con un poco de desorden para que no sea mecánico. */
  order: number
}

/**
 * Cada módulo LED viene como una primitiva con su propio material. Se recentra
 * la geometría en su propio origen para poder escalarlo desde el centro.
 */
export function collectLeds(group: THREE.Object3D, ranges: readonly Range[]): Led[] {
  group.updateWorldMatrix(true, true)
  const leds: Led[] = []

  group.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const geo = mesh.geometry
    geo.computeBoundingBox()
    const c = geo.boundingBox!.getCenter(new THREE.Vector3())
    geo.translate(-c.x, -c.y, -c.z)
    mesh.position.add(c)
    mesh.updateMatrix()

    const world = c.clone().applyMatrix4(group.matrixWorld)
    leds.push({ mesh, letter: letterOf(world.x, ranges), world, order: 0 })
  })

  const byX = [...leds].sort((a, b) => a.world.x - b.world.x)
  byX.forEach((led, i) => {
    const jitter = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1
    led.order = (i / Math.max(byX.length - 1, 1)) * 0.85 + jitter * 0.15
  })
  return leds
}
