import { create } from 'zustand'
import type { TimelineEtapa } from '../../core/domain/timeline/TimelineEtapa'

interface TimelineStore {
  etapasByEvento: Record<string, TimelineEtapa[]>
  setEtapas: (eventoId: string, list: TimelineEtapa[]) => void
  upsertEtapa: (eventoId: string, etapa: TimelineEtapa) => void
  removeEtapa: (eventoId: string, id: string) => void
  getEtapas: (eventoId: string) => TimelineEtapa[]
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  etapasByEvento: {},

  setEtapas: (eventoId, list) =>
    set((s) => ({ etapasByEvento: { ...s.etapasByEvento, [eventoId]: list } })),

  upsertEtapa: (eventoId, etapa) =>
    set((s) => {
      const list = s.etapasByEvento[eventoId] ?? []
      const idx  = list.findIndex((e) => e.id === etapa.id)
      const updated =
        idx === -1 ? [...list, etapa] : list.map((e, i) => (i === idx ? etapa : e))
      const sorted = [...updated].sort((a, b) => a.displayOrder - b.displayOrder)
      return { etapasByEvento: { ...s.etapasByEvento, [eventoId]: sorted } }
    }),

  removeEtapa: (eventoId, id) =>
    set((s) => {
      const list = (s.etapasByEvento[eventoId] ?? []).filter((e) => e.id !== id)
      return { etapasByEvento: { ...s.etapasByEvento, [eventoId]: list } }
    }),

  getEtapas: (eventoId) => get().etapasByEvento[eventoId] ?? [],
}))
