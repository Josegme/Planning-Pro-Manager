import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft, Plus, Sparkles, AlertTriangle,
  Pencil, Trash2, MoreHorizontal,
} from 'lucide-react'
import { useComanda } from '../../hooks/useComanda'
import { useAuth } from '../../providers/AuthProvider'
import { useEventoStore } from '../../stores/eventoStore'
import { useAssignedEvento } from '../../hooks/useAssignedEvento'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import { Dialog } from '../../components/ui/Dialog'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Select } from '../../components/ui/Select'
import { cn } from '@/lib/utils'
import type { MenuCourse, MenuCourseStatus, MenuCourseTipo } from '../../../core/domain/menuCourse/MenuCourse'
import {
  MENU_TIPO_LABEL,
  MENU_STATUS_CONFIG,
} from '../../../core/domain/menuCourse/MenuCourse'
import type { CreateMenuCourseData, UpdateMenuCourseData } from '../../../core/ports/IMenuCourseRepository'

// ── CourseDialog ───────────────────────────────────────────────────────────

const courseSchema = z.object({
  nombre:     z.string().min(1, 'El nombre es obligatorio'),
  tipo:       z.enum(['entrada_fria', 'entrada_caliente', 'principal', 'guarnicion', 'postre', 'otro']),
  horaSalida: z.string().nullable(),
  notasCocina: z.string().nullable(),
})
type CourseFormData = z.infer<typeof courseSchema>

function CourseDialog({
  open, onClose, onSave, course,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: CourseFormData) => Promise<void>
  course?: MenuCourse | null
}) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: { nombre: '', tipo: 'principal', horaSalida: null, notasCocina: null },
  })

  useEffect(() => {
    if (open) {
      reset(course
        ? { nombre: course.nombre, tipo: course.tipo, horaSalida: course.horaSalida, notasCocina: course.notasCocina }
        : { nombre: '', tipo: 'principal', horaSalida: null, notasCocina: null }
      )
    }
  }, [open, course, reset])

  const onSubmit = async (data: CourseFormData) => {
    await onSave({ ...data, horaSalida: data.horaSalida || null, notasCocina: data.notasCocina || null })
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title={course ? 'Editar plato' : 'Nuevo plato'} maxWidth="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label>Nombre del plato *</Label>
          <Input {...register('nombre')} placeholder="Ej: Risotto de hongos" autoFocus />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Tipo</Label>
            <Select {...register('tipo')}>
              {(Object.keys(MENU_TIPO_LABEL) as MenuCourseTipo[]).map((t) => (
                <option key={t} value={t}>{MENU_TIPO_LABEL[t]}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Hora de salida</Label>
            <Input type="time" {...register('horaSalida')} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Notas de cocina</Label>
          <Input {...register('notasCocina')} placeholder="Instrucciones especiales para el chef" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : course ? 'Guardar cambios' : 'Crear plato'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

// ── ComandaPage ────────────────────────────────────────────────────────────

export function ComandaPage() {
  const { eventoId: paramId } = useParams<{ eventoId?: string }>()
  const { role } = useAuth()
  const eventoFromStore = useEventoStore((s) => paramId ? s.eventos.find((e) => e.id === paramId) : undefined)

  // A-2: resolución del evento via hook, sin acceso directo a Supabase
  const { eventoId: assignedId, eventoName: assignedName } = useAssignedEvento('chef', !!paramId)
  const resolvedId   = paramId ?? assignedId ?? ''
  const eventoNombre = eventoFromStore?.name ?? assignedName

  const {
    courses, dietary, dietaryLabels, standardCount, miseEnPlace,
    isLoading, error,
    createCourse, updateCourse, updateStatus, deleteCourse,
  } = useComanda(resolvedId)

  const [editingCourse, setEditingCourse] = useState<MenuCourse | null | undefined>(undefined)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const isOrganizador = role === 'organizador'

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  async function handleSaveCourse(data: Omit<CreateMenuCourseData, 'eventoId'> & UpdateMenuCourseData) {
    if (editingCourse) {
      await updateCourse(editingCourse.id, data)
      showToast('Plato actualizado')
    } else {
      await createCourse(data as Omit<CreateMenuCourseData, 'eventoId'>)
      showToast('Plato creado')
    }
  }

  async function handleDelete(c: MenuCourse) {
    if (!confirm(`¿Eliminar "${c.nombre}"?`)) return
    await deleteCourse(c.id)
    showToast('Plato eliminado')
  }

  if (!resolvedId && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No hay ningún evento asignado a este chef.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="px-6 py-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {isOrganizador && (
            <Link
              to={`/eventos/${resolvedId}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Comanda del chef</h1>
            {eventoNombre && (
              <p className="text-sm text-muted-foreground mt-0.5">{eventoNombre}</p>
            )}
          </div>
        </div>
        {isOrganizador && (
          <Button onClick={() => setEditingCourse(null)}>
            <Plus className="h-4 w-4 mr-2" /> Nuevo plato
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

      {/* Auto-calculated quantities */}
      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Cantidades calculadas automáticamente</span>
            <Badge variant="secondary" className="ml-auto">
              {dietary.total} comensales confirmados
            </Badge>
          </div>
          {dietary.total === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin invitados confirmados aún. Las cantidades se calcularán automáticamente cuando confirmen asistencia.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              <QtyCard label="Estándar" value={standardCount} dot="bg-slate-700" />
              {dietaryLabels.map((d) => (
                <QtyCard key={d.id} label={d.label} value={d.count} dot="bg-amber-500" />
              ))}
            </div>
          )}
          {dietary.kosherMesaNumbers.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-900">
                <strong>
                  Mesa{dietary.kosherMesaNumbers.length > 1 ? 's' : ''}{' '}
                  {dietary.kosherMesaNumbers.join(', ')} — Menú kosher completo.
                </strong>{' '}
                Preparar separadamente con vajilla y utensilios independientes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu courses */}
      {courses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center space-y-3 mb-6">
          <p className="text-muted-foreground text-sm">No hay platos en la comanda.</p>
          {isOrganizador && (
            <Button variant="outline" size="sm" onClick={() => setEditingCourse(null)}>
              <Plus className="h-4 w-4 mr-1" /> Agregar primer plato
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {courses.map((course, idx) => {
            const statusCfg = MENU_STATUS_CONFIG[course.status]
            return (
              <Card key={course.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Order + time */}
                    <div className="text-center shrink-0 min-w-[64px]">
                      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">
                        Curso {idx + 1}
                      </div>
                      <div className="font-mono font-semibold text-lg mt-0.5">
                        {course.horaSalida ?? '—:—'}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground font-medium">
                        {MENU_TIPO_LABEL[course.tipo]}
                      </div>
                      <div className="font-semibold mt-0.5">{course.nombre}</div>
                      {course.notasCocina && (
                        <div className="text-xs text-muted-foreground italic mt-1">
                          "{course.notasCocina}"
                        </div>
                      )}
                      {/* Dietary badges */}
                      {dietary.total > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <Badge variant="secondary">
                            Estándar {standardCount}
                          </Badge>
                          {dietaryLabels.map((d) => (
                            <Badge key={d.id} variant="warning">
                              {d.label} {d.count}
                            </Badge>
                          ))}
                          {dietary.kosherMesaNumbers.length > 0 && (
                            <Badge variant="warning">
                              Kosher (Mesa {dietary.kosherMesaNumbers.join(', ')})
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status selector */}
                    <div className="shrink-0 flex items-center gap-2">
                      <select
                        value={course.status}
                        onChange={(e) => updateStatus(course.id, e.target.value as MenuCourseStatus)}
                        className={cn(
                          'rounded-md border-0 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer',
                          statusCfg.bgClass,
                          statusCfg.textClass,
                        )}
                      >
                        {(Object.entries(MENU_STATUS_CONFIG) as [MenuCourseStatus, typeof MENU_STATUS_CONFIG[MenuCourseStatus]][]).map(
                          ([val, cfg]) => (
                            <option key={val} value={val}>{cfg.label}</option>
                          ),
                        )}
                      </select>

                      {/* Context menu (organizador only) */}
                      {isOrganizador && (
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpenId(menuOpenId === course.id ? null : course.id)}
                            className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {menuOpenId === course.id && (
                            <div className="absolute right-0 z-10 mt-1 w-32 rounded-md border bg-popover shadow-md text-sm">
                              <button
                                onClick={() => { setEditingCourse(course); setMenuOpenId(null) }}
                                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-accent"
                              >
                                <Pencil className="h-3.5 w-3.5" /> Editar
                              </button>
                              <button
                                onClick={() => { handleDelete(course); setMenuOpenId(null) }}
                                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-accent text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Mise en place */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mise en place — Vajilla y cristalería</CardTitle>
          <CardDescription>
            {dietary.total > 0
              ? `Calculado para ${dietary.total} comensales · +10% de repuesto sugerido`
              : 'Sin comensales confirmados — las cantidades se actualizarán automáticamente'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dietary.total === 0 ? (
            <p className="text-sm text-muted-foreground">
              Las cantidades de vajilla y cristalería aparecerán aquí cuando haya invitados confirmados.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {miseEnPlace.map((x) => (
                <div key={x.item} className="border rounded-md p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{x.item}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      + {x.repuesto} de repuesto
                    </div>
                  </div>
                  <div className="font-mono font-semibold text-lg shrink-0">{x.total}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      {isOrganizador && (
        <CourseDialog
          open={editingCourse !== undefined}
          onClose={() => setEditingCourse(undefined)}
          onSave={handleSaveCourse}
          course={editingCourse}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-lg bg-slate-900 text-white text-sm px-4 py-2.5 shadow-lg">
          {toastMsg}
        </div>
      )}

      {/* Context menu backdrop */}
      {menuOpenId && (
        <div className="fixed inset-0 z-0" onClick={() => setMenuOpenId(null)} />
      )}
    </div>
  )
}

function QtyCard({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div className="bg-white rounded-md border p-3 text-center">
      <span className={cn('inline-block w-2 h-2 rounded-full mb-1', dot)} />
      <div className="text-2xl font-semibold font-mono tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider leading-tight">
        {label}
      </div>
    </div>
  )
}
