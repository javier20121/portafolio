# Cartel CAMILA con scroll

Dependencias: `npm i three@0.170 gsap` (y `@types/three@0.170` en dev).

1. Copiar `src/cartel/` a tu proyecto y `public/cartel.glb`.
2. Cargar la tipografía (ver comentario al inicio de `cartel.css`).
3. Usar:

```tsx
import { CartelSection } from './cartel'
<CartelSection src="/cartel.glb" scrollLength={4.5} />
```

Ajustes rápidos en `engine.ts`: `LIGHTS_AT` (cuándo enciende), `LED_GAIN` (brillo),
timeline (tiempos de cada etapa) y `setLights` (secuencia del parpadeo).
Textos de las etapas: `stages.ts`.
