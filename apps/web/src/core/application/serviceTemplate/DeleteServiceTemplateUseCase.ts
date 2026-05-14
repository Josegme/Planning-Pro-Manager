import type { IServiceTemplateRepository } from '../../ports/IServiceTemplateRepository'

export class DeleteServiceTemplateUseCase {
  constructor(private readonly repo: IServiceTemplateRepository) {}
  execute(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
