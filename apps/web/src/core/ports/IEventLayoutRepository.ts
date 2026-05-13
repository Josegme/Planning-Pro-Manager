import type { EventLayout, StructuralElement } from '../domain/layout/EventLayout'

export interface IEventLayoutRepository {
  findByEvento(eventoId: string): Promise<EventLayout | null>
  save(eventoId: string, elements: StructuralElement[]): Promise<EventLayout>
}
