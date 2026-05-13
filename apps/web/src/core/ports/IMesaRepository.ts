import type { Mesa } from '../domain/mesa/Mesa'

export interface CreateMesaData {
  eventoId: string
  number: number
  name?: string
  capacity: number
  menuEspecial?: string
}

export interface UpdateMesaData {
  number?: number
  name?: string | null
  capacity?: number
  menuEspecial?: string | null
  position?: { x: number; y: number } | null
}

export interface IMesaRepository {
  findByEvento(eventoId: string): Promise<Mesa[]>
  findById(id: string): Promise<Mesa | null>
  isNumberTaken(eventoId: string, number: number, excludeId?: string): Promise<boolean>
  create(data: CreateMesaData): Promise<Mesa>
  update(id: string, data: UpdateMesaData): Promise<Mesa>
  delete(id: string): Promise<void>
  assignInvitado(invitadoId: string, mesaId: string | null): Promise<void>
  bulkAssign(assignments: { invitadoId: string; mesaId: string }[]): Promise<void>
}
