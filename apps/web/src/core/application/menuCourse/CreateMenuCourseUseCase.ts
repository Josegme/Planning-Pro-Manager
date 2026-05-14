import type { MenuCourse } from '../../domain/menuCourse/MenuCourse'
import type { IMenuCourseRepository, CreateMenuCourseData } from '../../ports/IMenuCourseRepository'

export class CreateMenuCourseUseCase {
  constructor(private readonly repo: IMenuCourseRepository) {}
  execute(data: CreateMenuCourseData): Promise<MenuCourse> {
    return this.repo.create(data)
  }
}
