import type { IMesaRepository } from '../../ports/IMesaRepository'

export class DeleteMesaUseCase {
  constructor(private readonly repo: IMesaRepository) {}

  async execute(id: string): Promise<void> {
    const mesa = await this.repo.findById(id)
    if (!mesa) throw new Error('Mesa no encontrada')
    await this.repo.delete(id)
  }
}
