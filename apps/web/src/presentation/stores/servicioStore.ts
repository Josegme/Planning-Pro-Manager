import { create } from 'zustand'
import type { Servicio } from '../../core/domain/servicio/Servicio'
import type { Provider } from '../../core/domain/provider/Provider'

interface ServicioStore {
  serviciosByEvento: Record<string, Servicio[]>
  providers: Provider[]

  getServicios: (eventoId: string) => Servicio[]
  setServicios: (eventoId: string, list: Servicio[]) => void
  upsertServicio: (eventoId: string, s: Servicio) => void
  removeServicio: (eventoId: string, id: string) => void

  setProviders: (list: Provider[]) => void
  upsertProvider: (p: Provider) => void
  removeProvider: (id: string) => void
}

export const useServicioStore = create<ServicioStore>((set, get) => ({
  serviciosByEvento: {},
  providers: [],

  getServicios: (eventoId) => get().serviciosByEvento[eventoId] ?? [],

  setServicios: (eventoId, list) =>
    set((s) => ({ serviciosByEvento: { ...s.serviciosByEvento, [eventoId]: list } })),

  upsertServicio: (eventoId, item) =>
    set((s) => {
      const current = s.serviciosByEvento[eventoId] ?? []
      const idx = current.findIndex((x) => x.id === item.id)
      const next = idx === -1 ? [...current, item] : current.map((x) => (x.id === item.id ? item : x))
      return { serviciosByEvento: { ...s.serviciosByEvento, [eventoId]: next } }
    }),

  removeServicio: (eventoId, id) =>
    set((s) => ({
      serviciosByEvento: {
        ...s.serviciosByEvento,
        [eventoId]: (s.serviciosByEvento[eventoId] ?? []).filter((x) => x.id !== id),
      },
    })),

  setProviders: (list) => set({ providers: list }),

  upsertProvider: (p) =>
    set((s) => {
      const idx = s.providers.findIndex((x) => x.id === p.id)
      return {
        providers: idx === -1 ? [...s.providers, p] : s.providers.map((x) => (x.id === p.id ? p : x)),
      }
    }),

  removeProvider: (id) =>
    set((s) => ({ providers: s.providers.filter((x) => x.id !== id) })),
}))
