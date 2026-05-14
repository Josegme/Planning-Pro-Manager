import type { IReportRepository } from '../../ports/IReportRepository'
import type { HistoricoItem } from '../../domain/report/EventReport'

export class GetHistoricoUseCase {
  constructor(private repo: IReportRepository) {}

  execute(eventoId: string): Promise<HistoricoItem[]> {
    return this.repo.getHistorico(eventoId)
  }
}
