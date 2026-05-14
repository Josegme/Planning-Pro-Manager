import type { MenuCourse } from '../../domain/menuCourse/MenuCourse'
import type { IMenuCourseRepository } from '../../ports/IMenuCourseRepository'

export class GetMenuCoursesByEventoUseCase {
  constructor(private readonly repo: IMenuCourseRepository) {}
  execute(eventoId: string): Promise<MenuCourse[]> {
    return this.repo.findByEvento(eventoId)
  }
}
