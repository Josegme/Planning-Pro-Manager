import type { Mesa } from '../../domain/mesa/Mesa'
import type { IMesaRepository, CreateMesaData } from '../../ports/IMesaRepository'

export class CreateMesaUseCase {
  constructor(private readonly repo: IMesaRepository) {}

  async execute(data: CreateMesaData): Promise<Mesa> {
    if (data.number < 1) throw new Error('El número de mesa debe ser mayor a 0')
    if (data.capacity < 1) throw new Error('La capacidad mínima es 1')

    const taken = await this.repo.isNumberTaken(data.eventoId, data.number)
    if (taken) throw new Error(`Ya existe una Mesa ${data.number} en este evento`)

    return this.repo.create(data)
  }
}
