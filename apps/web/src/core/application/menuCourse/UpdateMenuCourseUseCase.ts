import type { MenuCourse } from '../../domain/menuCourse/MenuCourse'
import type { IMenuCourseRepository, UpdateMenuCourseData } from '../../ports/IMenuCourseRepository'

export class UpdateMenuCourseUseCase {
  constructor(private readonly repo: IMenuCourseRepository) {}
  execute(id: string, data: UpdateMenuCourseData): Promise<MenuCourse> {
    return this.repo.update(id, data)
  }
}
