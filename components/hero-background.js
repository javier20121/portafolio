import * as THREE from 'three';

/**
 * Fondo interactivo estilo landonorris.com
 * Curvas de nivel topográficas de un campo de ruido suave que evoluciona lento:
 * las líneas se estiran, se juntan, se fusionan y se separan solas.
 * El cursor levanta una "colina" en el campo, así las líneas se curvan y se
 * fusionan con las demás al acercarse.
 *
 * Uso:
 *   const bg = initHeroBackground();
 *   // bg.destroy() para limpiar (SPA / hot reload)
 */

const CONFIG = {
  bg: '#670796',          // fondo base (violeta Criatto)
  lineColor: '#ffffff',   // líneas normales (blanco)
  accentColor: '#fa1b8c', // líneas de acento (rosa Criatto)
  levels: 7.0,            // cantidad de curvas de nivel (más = más líneas)
  lineAlpha: 0.13,        // opacidad de las líneas normales
  accentAlpha: 0.5,       // opacidad de las líneas de acento (rosa)
  accentEvery: 5,         // 1 de cada N líneas es de acento
  speed: 1.0,             // velocidad de evolución del campo
  cursorStrength: 1.1,    // altura de la colina del cursor (en niveles de campo)
  cursorSize: 0.045,      // ancho de la colina del cursor
  cursorFollow: 0.10,     // suavizado del cursor (0-1)
  maxPixelRatio: 1.75,
};

export function initHeroBackground() {
  let canvas = document.querySelector('#hero-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'hero-canvas';
    document.body.prepend(canvas);
  }

  Object.assign(canvas.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    zIndex: '0',
    pointerEvents: 'none',
    display: 'block',
    backgroundColor: CONFIG.bg,
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timeScale = (reducedMotion ? 0.25 : 1) * CONFIG.speed;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const drawSize = new THREE.Vector2();
  renderer.getDrawingBufferSize(drawSize);

  // Hex -> vec3 en sRGB tal cual (sin pasar por THREE.Color, que en versiones nuevas
  // convierte a lineal y el shader lo escribiría oscurecido).
  const toVec = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  };

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: drawSize.clone() }, // píxeles del drawing buffer (gl_FragCoord)
    uMouse: { value: new THREE.Vector3(0, 0, 0) }, // xy en espacio shader, z = intensidad 0..1
    uBg: { value: toVec(CONFIG.bg) },
    uLineColor: { value: toVec(CONFIG.lineColor) },
    uAccentColor: { value: toVec(CONFIG.accentColor) },
    uLevels: { value: CONFIG.levels },
    uLineAlpha: { value: CONFIG.lineAlpha },
    uAccentAlpha: { value: CONFIG.accentAlpha },
    uAccentEvery: { value: CONFIG.accentEvery },
    uCursorStrength: { value: CONFIG.cursorStrength },
    uCursorSize: { value: CONFIG.cursorSize },
  };

  const vertexShader = /* glsl */ `
    void main() {
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    precision highp float;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uMouse;
    uniform vec3 uBg;
    uniform vec3 uLineColor;
    uniform vec3 uAccentColor;
    uniform float uLevels;
    uniform float uLineAlpha;
    uniform float uAccentAlpha;
    uniform float uAccentEvery;
    uniform float uCursorStrength;
    uniform float uCursorSize;

    // ---- Simplex Noise 2D ----
    vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                         -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m * m;
      m = m * m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
      vec3 g;
      g.x  = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // Campo escalar suave con domain warping: sus curvas de nivel son las líneas.
    // Al evolucionar, las líneas se fusionan y se separan solas (saddles del campo).
    float field(vec2 p, float t) {
      vec2 q = vec2(
        snoise(p * 0.8 + vec2(t * 0.030, 4.0)),
        snoise(p * 0.8 + vec2(-t * 0.025, 9.0))
      );
      float n = snoise(p * 0.9 + q * 0.9 + vec2(0.0, t * 0.020));
      n += 0.35 * snoise(p * 2.0 - q * 0.6 + vec2(-t * 0.040, 17.0));
      return n;
    }

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      float m = min(uResolution.x, uResolution.y);
      vec2 st = (gl_FragCoord.xy - 0.5 * uResolution) / m;

      float f = field(st, uTime);

      // Colina del cursor: curva y fusiona las líneas cercanas
      vec2 md = st - uMouse.xy;
      f += uMouse.z * uCursorStrength * exp(-dot(md, md) / uCursorSize);

      // Bandas de nivel con grosor constante en píxeles y antialias
      float bands = f * uLevels;
      float d = abs(fract(bands + 0.5) - 0.5);
      float w = max(fwidth(bands), 1e-4);
      float line = 1.0 - smoothstep(w * 0.5, w * 1.3, d);
      line *= 1.0 - smoothstep(0.30, 0.50, w); // evita moiré donde el campo es muy empinado

      float id = floor(bands + 0.5);
      float accent = step(mod(id, uAccentEvery), 0.5);

      vec3 base = uBg;

      vec3 col = base;
      col = mix(col, uLineColor, line * (1.0 - accent) * uLineAlpha);
      col = mix(col, uAccentColor, line * accent * uAccentAlpha);

      // Viñeta muy suave
      vec2 uv = gl_FragCoord.xy / uResolution;
      float vig = smoothstep(1.2, 0.3, length(uv - 0.5) * 1.3);
      col *= mix(0.82, 1.0, vig);

      // Dither anti-banding
      col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    depthTest: false,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  // ---- Cursor ----
  const pointer = { tx: 0.5, ty: 0.5, x: 0.5, y: 0.5, inside: false, strength: 0, seen: false };

  function onPointerMove(e) {
    pointer.tx = e.clientX / window.innerWidth;
    pointer.ty = 1 - e.clientY / window.innerHeight;
    if (!pointer.seen) {
      pointer.x = pointer.tx;
      pointer.y = pointer.ty;
      pointer.seen = true;
    }
    pointer.inside = true;
  }
  function onPointerLeave() { pointer.inside = false; }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', onPointerLeave);
  window.addEventListener('blur', onPointerLeave);

  // ---- Loop ----
  let rafId = 0;
  let running = false;
  let t = 0;
  let last = 0;

  function frame(now) {
    rafId = requestAnimationFrame(frame);

    const dt = Math.min((now - last) / 1000, 0.05) * timeScale;
    last = now;
    t += dt;
    uniforms.uTime.value = t;

    pointer.x += (pointer.tx - pointer.x) * CONFIG.cursorFollow;
    pointer.y += (pointer.ty - pointer.y) * CONFIG.cursorFollow;
    pointer.strength += ((pointer.inside ? 1 : 0) - pointer.strength) * 0.06;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const m = Math.min(w, h);
    const s = pointer.strength;
    uniforms.uMouse.value.set(
      (pointer.x - 0.5) * w / m,
      (pointer.y - 0.5) * h / m,
      s * s * (3 - 2 * s)
    );

    renderer.render(scene, camera);
  }

  function start() {
    if (running) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function onVisibility() {
    document.hidden ? stop() : start();
  }
  document.addEventListener('visibilitychange', onVisibility);

  function onResize() {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.maxPixelRatio));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.getDrawingBufferSize(drawSize);
    uniforms.uResolution.value.copy(drawSize);
  }
  window.addEventListener('resize', onResize);

  start();

  return {
    destroy() {
      stop();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('blur', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}