import type { EventReport, HistoricoItem } from '../domain/report/EventReport'

export interface IReportRepository {
  getEventReport(eventoId: string): Promise<EventReport>
  getHistorico(eventoId: string): Promise<HistoricoItem[]>
}
