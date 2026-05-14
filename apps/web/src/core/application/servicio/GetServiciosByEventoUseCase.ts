import type { Servicio } from '../../domain/servicio/Servicio'
import type { IServicioRepository } from '../../ports/IServicioRepository'

export class GetServiciosByEventoUseCase {
  constructor(private readonly repo: IServicioRepository) {}
  execute(eventoId: string): Promise<Servicio[]> {
    return this.repo.findByEvento(eventoId)
  }
}
