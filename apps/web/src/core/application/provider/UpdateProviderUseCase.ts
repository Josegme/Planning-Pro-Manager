import type { Provider } from '../../domain/provider/Provider'
import type { IProviderRepository, UpdateProviderData } from '../../ports/IProviderRepository'

export class UpdateProviderUseCase {
  constructor(private readonly repo: IProviderRepository) {}
  execute(id: string, data: UpdateProviderData): Promise<Provider> {
    return this.repo.update(id, data)
  }
}
