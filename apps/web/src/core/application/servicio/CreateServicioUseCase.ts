import type { Servicio } from '../../domain/servicio/Servicio'
import type { IServicioRepository, CreateServicioData } from '../../ports/IServicioRepository'

export class CreateServicioUseCase {
  constructor(private readonly repo: IServicioRepository) {}
  execute(data: CreateServicioData): Promise<Servicio> {
    return this.repo.create(data)
  }
}
