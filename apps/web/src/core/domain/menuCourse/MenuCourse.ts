export type MenuCourseTipo =
  | 'entrada_fria'
  | 'entrada_caliente'
  | 'principal'
  | 'guarnicion'
  | 'postre'
  | 'otro'

export type MenuCourseStatus = 'pendiente' | 'preparacion' | 'listo' | 'servido'

export interface MenuCourse {
  id: string
  eventoId: string
  nombre: string
  tipo: MenuCourseTipo
  horaSalida: string | null
  displayOrder: number
  notasCocina: string | null
  status: MenuCourseStatus
  createdAt: string
  updatedAt: string
}

export const MENU_TIPO_LABEL: Record<MenuCourseTipo, string> = {
  entrada_fria:     'Entrada fría',
  entrada_caliente: 'Entrada caliente',
  principal:        'Plato principal',
  guarnicion:       'Guarnición',
  postre:           'Postre',
  otro:             'Otro',
}

export const MENU_STATUS_CONFIG: Record<
  MenuCourseStatus,
  { label: string; bgClass: string; textClass: string }
> = {
  pendiente:   { label: 'Pendiente',        bgClass: 'bg-slate-100',   textClass: 'text-slate-600' },
  preparacion: { label: 'En preparación',   bgClass: 'bg-amber-100',   textClass: 'text-amber-700' },
  listo:       { label: 'Listo para salir', bgClass: 'bg-blue-100',    textClass: 'text-blue-700'  },
  servido:     { label: 'Servido',          bgClass: 'bg-emerald-100', textClass: 'text-emerald-700' },
}
