import type { MenuCourse, MenuCourseTipo, MenuCourseStatus } from '../domain/menuCourse/MenuCourse'

export interface CreateMenuCourseData {
  eventoId: string
  nombre: string
  tipo: MenuCourseTipo
  horaSalida?: string | null
  displayOrder?: number
  notasCocina?: string | null
}

export interface UpdateMenuCourseData {
  nombre?: string
  tipo?: MenuCourseTipo
  horaSalida?: string | null
  displayOrder?: number
  notasCocina?: string | null
  status?: MenuCourseStatus
}

export interface IMenuCourseRepository {
  findByEvento(eventoId: string): Promise<MenuCourse[]>
  create(data: CreateMenuCourseData): Promise<MenuCourse>
  update(id: string, data: UpdateMenuCourseData): Promise<MenuCourse>
  delete(id: string): Promise<void>
}
