import { create } from 'zustand'
import type { Invitado } from '../../core/domain/invitado/Invitado'

interface InvitadoStore {
  invitadosByEvento: Record<string, Invitado[]>
  setInvitados: (eventoId: string, list: Invitado[]) => void
  upsertInvitado: (eventoId: string, inv: Invitado) => void
  removeInvitado: (eventoId: string, id: string) => void
  getInvitados: (eventoId: string) => Invitado[]
}

export const useInvitadoStore = create<InvitadoStore>((set, get) => ({
  invitadosByEvento: {},

  setInvitados: (eventoId, list) =>
    set((s) => ({ invitadosByEvento: { ...s.invitadosByEvento, [eventoId]: list } })),

  upsertInvitado: (eventoId, inv) =>
    set((s) => {
      const list = s.invitadosByEvento[eventoId] ?? []
      const idx = list.findIndex((i) => i.id === inv.id)
      const updated = idx === -1 ? [...list, inv] : list.map((i, n) => (n === idx ? inv : i))
      return { invitadosByEvento: { ...s.invitadosByEvento, [eventoId]: updated } }
    }),

  removeInvitado: (eventoId, id) =>
    set((s) => {
      const list = (s.invitadosByEvento[eventoId] ?? []).filter((i) => i.id !== id)
      return { invitadosByEvento: { ...s.invitadosByEvento, [eventoId]: list } }
    }),

  getInvitados: (eventoId) => get().invitadosByEvento[eventoId] ?? [],
}))
