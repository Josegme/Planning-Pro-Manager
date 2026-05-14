import type { IReportRepository } from '../../ports/IReportRepository'
import type { EventReport } from '../../domain/report/EventReport'

export class GetEventReportUseCase {
  constructor(private repo: IReportRepository) {}

  execute(eventoId: string): Promise<EventReport> {
    return this.repo.getEventReport(eventoId)
  }
}
