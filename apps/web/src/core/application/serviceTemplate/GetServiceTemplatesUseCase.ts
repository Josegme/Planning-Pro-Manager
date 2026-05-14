import type { ServiceTemplate } from '../../domain/serviceTemplate/ServiceTemplate'
import type { IServiceTemplateRepository } from '../../ports/IServiceTemplateRepository'

export class GetServiceTemplatesUseCase {
  constructor(private readonly repo: IServiceTemplateRepository) {}
  execute(): Promise<ServiceTemplate[]> {
    return this.repo.findByOrg()
  }
}
