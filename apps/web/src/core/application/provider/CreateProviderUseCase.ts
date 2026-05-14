import type { Provider } from '../../domain/provider/Provider'
import type { IProviderRepository, CreateProviderData } from '../../ports/IProviderRepository'

export class CreateProviderUseCase {
  constructor(private readonly repo: IProviderRepository) {}
  execute(data: CreateProviderData): Promise<Provider> {
    return this.repo.create(data)
  }
}
