import type { ServiceTemplate } from '../../domain/serviceTemplate/ServiceTemplate'
import type { IServiceTemplateRepository, CreateServiceTemplateData } from '../../ports/IServiceTemplateRepository'

export class CreateServiceTemplateUseCase {
  constructor(private readonly repo: IServiceTemplateRepository) {}
  execute(data: CreateServiceTemplateData): Promise<ServiceTemplate> {
    return this.repo.create(data)
  }
}
