import type { IMenuCourseRepository } from '../../ports/IMenuCourseRepository'

export class DeleteMenuCourseUseCase {
  constructor(private readonly repo: IMenuCourseRepository) {}
  execute(id: string): Promise<void> {
    return this.repo.delete(id)
  }
}
