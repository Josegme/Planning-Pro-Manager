import type { Mesa } from '../../domain/mesa/Mesa'
import type { IMesaRepository, UpdateMesaData } from '../../ports/IMesaRepository'

export class UpdateMesaUseCase {
  constructor(private readonly repo: IMesaRepository) {}

  async execute(id: string, data: UpdateMesaData): Promise<Mesa> {
    if (data.capacity !== undefined && data.capacity < 1)
      throw new Error('La capacidad mínima es 1')

    const mesa = await this.repo.findById(id)
    if (!mesa) throw new Error('Mesa no encontrada')

    if (data.number !== undefined && data.number !== mesa.number) {
      const taken = await this.repo.isNumberTaken(mesa.eventoId, data.number, id)
      if (taken) throw new Error(`Ya existe una Mesa ${data.number} en este evento`)
    }

    return this.repo.update(id, data)
  }
}
