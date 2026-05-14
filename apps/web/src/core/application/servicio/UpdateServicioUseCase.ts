import type { Servicio } from '../../domain/servicio/Servicio'
import type { IServicioRepository, UpdateServicioData } from '../../ports/IServicioRepository'

export class UpdateServicioUseCase {
  constructor(private readonly repo: IServicioRepository) {}
  execute(id: string, data: UpdateServicioData): Promise<Servicio> {
    return this.repo.update(id, data)
  }
}
