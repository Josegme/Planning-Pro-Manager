import type { Provider } from '../../domain/provider/Provider'
import type { IProviderRepository } from '../../ports/IProviderRepository'

export class GetProvidersByOrgUseCase {
  constructor(private readonly repo: IProviderRepository) {}
  execute(): Promise<Provider[]> {
    return this.repo.findByOrg()
  }
}
