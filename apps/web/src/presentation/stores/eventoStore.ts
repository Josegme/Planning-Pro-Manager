import { create } from 'zustand'
import type { Evento } from '../../core/domain/evento/Evento'

interface EventoStore {
  eventos: Evento[]
  activeEvento: Evento | null
  upsertEvento: (evento: Evento) => void
  removeEvento: (id: string) => void
  setActiveEvento: (evento: Evento | null) => void
  setEventos: (eventos: Evento[]) => void
}

export const useEventoStore = create<EventoStore>((set) => ({
  eventos: [],
  activeEvento: null,

  upsertEvento: (evento) =>
    set((state) => {
      const idx = state.eventos.findIndex((e) => e.id === evento.id)
      if (idx === -1) return { eventos: [...state.eventos, evento] }
      const updated = [...state.eventos]
      updated[idx] = evento
      return { eventos: updated }
    }),

  removeEvento: (id) =>
    set((state) => ({
      eventos: state.eventos.filter((e) => e.id !== id),
      activeEvento: state.activeEvento?.id === id ? null : state.activeEvento,
    })),

  setActiveEvento: (evento) => set({ activeEvento: evento }),

  setEventos: (eventos) => set({ eventos }),
}))
