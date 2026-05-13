export type StructuralElementType = 'stage' | 'dance' | 'bar' | 'buffet' | 'entry'

export interface StructuralElement {
  id: string
  type: StructuralElementType
  x: number   // normalized 0-1
  y: number
  w: number
  h: number
  label: string
}

export interface EventLayout {
  id: string
  eventoId: string
  elements: StructuralElement[]
  createdAt: string
  updatedAt: string
}

export const DEFAULT_ELEMENTS: StructuralElement[] = [
  { id: 'stage',  type: 'stage',  x: 0.05, y: 0.03, w: 0.90, h: 0.10, label: 'ESCENARIO' },
  { id: 'dance',  type: 'dance',  x: 0.30, y: 0.18, w: 0.40, h: 0.22, label: 'PISTA DE BAILE' },
  { id: 'bar',    type: 'bar',    x: 0.03, y: 0.72, w: 0.12, h: 0.20, label: 'BAR' },
  { id: 'buffet', type: 'buffet', x: 0.85, y: 0.72, w: 0.12, h: 0.20, label: 'BUFET' },
  { id: 'entry',  type: 'entry',  x: 0.45, y: 0.90, w: 0.10, h: 0.06, label: 'ENTRADA' },
]

// Distribute mesas in a grid when no positions are saved
export function autoPositionMesas(
  count: number,
): { x: number; y: number }[] {
  if (count === 0) return []
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  return Array.from({ length: count }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return {
      x: 0.15 + col * (0.70 / Math.max(cols - 1, 1)),
      y: 0.42 + row * (0.38 / Math.max(rows - 1, 1)),
    }
  })
}
