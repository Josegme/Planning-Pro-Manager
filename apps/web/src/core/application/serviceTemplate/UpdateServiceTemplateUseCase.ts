import type { ServiceTemplate } from '../../domain/serviceTemplate/ServiceTemplate'
import type { IServiceTemplateRepository, UpdateServiceTemplateData } from '../../ports/IServiceTemplateRepository'

export class UpdateServiceTemplateUseCase {
  constructor(private readonly repo: IServiceTemplateRepository) {}
  execute(id: string, data: UpdateServiceTemplateData): Promise<ServiceTemplate> {
    return this.repo.update(id, data)
  }
}
