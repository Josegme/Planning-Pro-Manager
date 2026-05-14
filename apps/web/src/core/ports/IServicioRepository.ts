import type { Servicio, ServicioEstado, ServicioMoneda } from '../domain/servicio/Servicio'

export interface CreateServicioData {
  eventoId: string
  providerId?: string | null
  nombre: string
  descripcion?: string | null
  costoUnitario: number
  cantidad?: number
  moneda?: ServicioMoneda
  montoPagado?: number
  vencimiento?: string | null
  estado?: ServicioEstado
}

export interface UpdateServicioData {
  providerId?: string | null
  nombre?: string
  descripcion?: string | null
  costoUnitario?: number
  cantidad?: number
  moneda?: ServicioMoneda
  montoPagado?: number
  vencimiento?: string | null
  estado?: ServicioEstado
  checklistStatus?: 'pendiente' | 'confirmado' | 'problema'
  checklistNote?: string | null
}

export interface IServicioRepository {
  findByEvento(eventoId: string): Promise<Servicio[]>
  findById(id: string): Promise<Servicio | null>
  create(data: CreateServicioData): Promise<Servicio>
  update(id: string, data: UpdateServicioData): Promise<Servicio>
  delete(id: string): Promise<void>
}
