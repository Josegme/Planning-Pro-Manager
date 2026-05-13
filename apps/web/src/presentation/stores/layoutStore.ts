import { create } from 'zustand'
import type { EventLayout } from '../../core/domain/layout/EventLayout'

interface LayoutStore {
  layoutByEvento: Record<string, EventLayout | null>
  setLayout: (eventoId: string, layout: EventLayout | null) => void
  getLayout: (eventoId: string) => EventLayout | null
}

export const useLayoutStore = create<LayoutStore>((set, get) => ({
  layoutByEvento: {},

  setLayout: (eventoId, layout) =>
    set((s) => ({ layoutByEvento: { ...s.layoutByEvento, [eventoId]: layout } })),

  getLayout: (eventoId) => get().layoutByEvento[eventoId] ?? null,
}))
