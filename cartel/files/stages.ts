export interface Stage {
  id: 'base' | 'bordes' | 'frente' | 'luz'
  label: string
  title: string
  text: string
}

/** Orden real de armado. El índice coincide con `onStage(i)` del motor. */
export const STAGES: readonly Stage[] = [
  {
    id: 'base',
    label: 'Base',
    title: 'Base de PVC',
    text: 'Una placa trasera de PVC blanco de 3 mm por cada letra.',
  },
  {
    id: 'bordes',
    label: 'Bordes',
    title: 'Bordes',
    text: 'Los laterales levantan cada letra y le dan profundidad.',
  },
  {
    id: 'frente',
    label: 'Frente',
    title: 'Frente de acrílico',
    text: 'Acrílico blanco opal: difunde la luz y esconde los módulos.',
  },
  {
    id: 'luz',
    label: 'Luz',
    title: 'Iluminación',
    text: 'Módulos LED independientes detrás del acrílico.',
  },
] as const
