import type { IProviderRepository } from '../../ports/IProviderRepository'

export class DeleteProviderUseCase {
  constructor(private readonly repo: IProviderRepository) {}
  execute(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
