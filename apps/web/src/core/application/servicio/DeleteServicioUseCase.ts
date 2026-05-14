import type { IServicioRepository } from '../../ports/IServicioRepository'

export class DeleteServicioUseCase {
  constructor(private readonly repo: IServicioRepository) {}
  execute(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
