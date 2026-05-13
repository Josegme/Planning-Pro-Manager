import { create } from 'zustand'
import type { Mesa } from '../../core/domain/mesa/Mesa'

interface MesaStore {
  mesasByEvento: Record<string, Mesa[]>
  setMesas: (eventoId: string, list: Mesa[]) => void
  upsertMesa: (eventoId: string, mesa: Mesa) => void
  removeMesa: (eventoId: string, id: string) => void
  getMesas: (eventoId: string) => Mesa[]
}

export const useMesaStore = create<MesaStore>((set, get) => ({
  mesasByEvento: {},

  setMesas: (eventoId, list) =>
    set((s) => ({ mesasByEvento: { ...s.mesasByEvento, [eventoId]: list } })),

  upsertMesa: (eventoId, mesa) =>
    set((s) => {
      const list = s.mesasByEvento[eventoId] ?? []
      const idx = list.findIndex((m) => m.id === mesa.id)
      const updated =
        idx === -1 ? [...list, mesa] : list.map((m, i) => (i === idx ? mesa : m))
      const sorted = [...updated].sort((a, b) => a.number - b.number)
      return { mesasByEvento: { ...s.mesasByEvento, [eventoId]: sorted } }
    }),

  removeMesa: (eventoId, id) =>
    set((s) => {
      const list = (s.mesasByEvento[eventoId] ?? []).filter((m) => m.id !== id)
      return { mesasByEvento: { ...s.mesasByEvento, [eventoId]: list } }
    }),

  getMesas: (eventoId) => get().mesasByEvento[eventoId] ?? [],
}))
