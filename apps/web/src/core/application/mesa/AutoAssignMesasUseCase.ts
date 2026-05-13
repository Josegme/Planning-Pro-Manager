import type { Mesa } from '../../domain/mesa/Mesa'

export interface AssignableInvitado {
  id: string
  acompanantesEsperados: number
}

export interface AutoAssignResult {
  assignments: { invitadoId: string; mesaId: string }[]
  unplaced: string[]
}

export class AutoAssignMesasUseCase {
  execute(
    unassigned: AssignableInvitado[],
    mesas: Pick<Mesa, 'id' | 'capacity'>[],
    currentOccupied: Record<string, number>,
  ): AutoAssignResult {
    const occupied = { ...currentOccupied }
    const assignments: { invitadoId: string; mesaId: string }[] = []
    const unplaced: string[] = []

    let mIdx = 0
    for (const inv of unassigned) {
      const need = 1 + inv.acompanantesEsperados
      let placed = false

      while (mIdx < mesas.length) {
        const mesa = mesas[mIdx]
        const free = mesa.capacity - (occupied[mesa.id] ?? 0)
        if (free >= need) {
          assignments.push({ invitadoId: inv.id, mesaId: mesa.id })
          occupied[mesa.id] = (occupied[mesa.id] ?? 0) + need
          placed = true
          break
        }
        mIdx++
      }

      if (!placed) unplaced.push(inv.id)
    }

    return { assignments, unplaced }
  }
}
