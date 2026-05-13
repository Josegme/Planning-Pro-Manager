import type { Invitado, InvitadoStatus } from '../domain/invitado/Invitado'

export interface CreateInvitadoData {
  eventoId: string
  nombre: string
  apellido: string
  dni?: string
  email?: string
  whatsapp?: string
  grupo?: string
  acompanantesEsperados?: number
  dietaryRestrictions?: string[]
  mesaId?: string
}

export interface UpdateInvitadoData {
  nombre?: string
  apellido?: string
  dni?: string | null
  email?: string | null
  whatsapp?: string | null
  grupo?: string | null
  acompanantesEsperados?: number
  acompanantesPresentes?: number | null
  dietaryRestrictions?: string[]
  mesaId?: string | null
  status?: InvitadoStatus
  qrToken?: string | null
  checkinAt?: string | null
}

export interface ImportResult {
  created: number
  errors: Array<{ row: number; message: string }>
}

export interface IInvitadoRepository {
  findByEvento(eventoId: string): Promise<Invitado[]>
  findById(id: string): Promise<Invitado | null>
  isDniTaken(eventoId: string, dni: string, excludeId?: string): Promise<boolean>
  create(data: CreateInvitadoData): Promise<Invitado>
  update(id: string, data: UpdateInvitadoData): Promise<Invitado>
  delete(id: string): Promise<void>
  importBatch(rows: CreateInvitadoData[]): Promise<ImportResult>
  generateQrToken(id: string): Promise<Invitado>
}
