import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../infrastructure/supabase/client'
import { SupabaseMenuCourseRepository } from '../../infrastructure/supabase/SupabaseMenuCourseRepository'
import { GetMenuCoursesByEventoUseCase } from '../../core/application/menuCourse/GetMenuCoursesByEventoUseCase'
import { CreateMenuCourseUseCase } from '../../core/application/menuCourse/CreateMenuCourseUseCase'
import { UpdateMenuCourseUseCase } from '../../core/application/menuCourse/UpdateMenuCourseUseCase'
import { DeleteMenuCourseUseCase } from '../../core/application/menuCourse/DeleteMenuCourseUseCase'
import type { MenuCourse, MenuCourseStatus } from '../../core/domain/menuCourse/MenuCourse'
import type { CreateMenuCourseData, UpdateMenuCourseData } from '../../core/ports/IMenuCourseRepository'
import { DIETARY_OPTIONS } from '../../core/domain/invitado/Invitado'

const repo       = new SupabaseMenuCourseRepository()
const getUC      = new GetMenuCoursesByEventoUseCase(repo)
const createUC   = new CreateMenuCourseUseCase(repo)
const updateUC   = new UpdateMenuCourseUseCase(repo)
const deleteUC   = new DeleteMenuCourseUseCase(repo)

export interface DietarySummary {
  total: number
  byRestriction: Record<string, number>
  kosherMesaNumbers: number[]
}

export interface MiseEnPlaceItem {
  item: string
  base: number
  repuesto: number
  total: number
}

function buildMiseEnPlace(total: number): MiseEnPlaceItem[] {
  const repuesto = (n: number) => Math.ceil(n * 0.1)
  const item = (label: string, multiplier: number): MiseEnPlaceItem => {
    const base = Math.ceil(total * multiplier)
    const rep = repuesto(base)
    return { item: label, base, repuesto: rep, total: base + rep }
  }
  return [
    item('Copas de vino tinto',   1),
    item('Copas de vino blanco',  1),
    item('Copas de champagne',    1),
    item('Vasos de agua',         1),
    item('Platos de entrada',     2),
    item('Platos principales',    1),
    item('Platos de postre',      1),
    item('Cuchillos de carne',    1),
    item('Tenedores',             2),
    item('Cucharas de postre',    1),
    { item: 'Servilletas', base: total + 30, repuesto: repuesto(total + 30), total: total + 30 + repuesto(total + 30) },
  ]
}

export function useComanda(eventoId: string) {
  const [courses, setCourses]           = useState<MenuCourse[]>([])
  const [dietary, setDietary]           = useState<DietarySummary>({ total: 0, byRestriction: {}, kosherMesaNumbers: [] })
  const [isLoading, setIsLoading]       = useState(true)
  const [error, setError]               = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!eventoId) return
    try {
      setIsLoading(true)
      setError(null)

      const [courseList, invitadosResp, mesasResp] = await Promise.all([
        getUC.execute(eventoId),
        supabase
          .from('invitados')
          .select('acompanantes_esperados, dietary_restrictions, mesa_id, status')
          .eq('evento_id', eventoId)
          .eq('status', 'confirmado'),
        supabase
          .from('mesas')
          .select('id, number, menu_especial')
          .eq('evento_id', eventoId),
      ])

      setCourses(courseList)

      // Build dietary summary from confirmed invitados
      const invitados = invitadosResp.data ?? []
      const mesas = mesasResp.data ?? []

      let total = 0
      const byRestriction: Record<string, number> = {}
      const kosherMesaIds = new Set<string>()

      for (const inv of invitados) {
        const head = 1 + (inv.acompanantes_esperados ?? 0)
        total += head
        const mesa = mesas.find((m) => m.id === inv.mesa_id)
        if (mesa?.menu_especial === 'kosher') kosherMesaIds.add(mesa.id)
        for (const r of (inv.dietary_restrictions as string[] ?? [])) {
          byRestriction[r] = (byRestriction[r] ?? 0) + head
        }
      }

      const kosherMesaNumbers = mesas
        .filter((m) => kosherMesaIds.has(m.id))
        .map((m) => m.number)
        .sort((a, b) => a - b)

      setDietary({ total, byRestriction, kosherMesaNumbers })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar la comanda')
    } finally {
      setIsLoading(false)
    }
  }, [eventoId])

  useEffect(() => {
    load()

    const channel = supabase
      .channel(`comanda-${eventoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu_courses', filter: `evento_id=eq.${eventoId}` },
        () => load(),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventoId, load])

  const miseEnPlace = useMemo(() => buildMiseEnPlace(dietary.total), [dietary.total])

  // Dietary breakdown labels for display
  const dietaryLabels = useMemo(() => {
    return DIETARY_OPTIONS
      .filter((opt) => dietary.byRestriction[opt.id] !== undefined)
      .map((opt) => ({ id: opt.id, label: opt.label, count: dietary.byRestriction[opt.id] }))
  }, [dietary.byRestriction])

  // Standard count = those with no dietary restrictions (approximate)
  const standardCount = useMemo(() => {
    const restricted = new Set<string>()
    // We don't have invitado IDs here — use the total minus distinct restriction holders
    // The byRestriction values can overlap, so standard is: total that have NO restrictions
    // This is approximate based on the prototype approach
    const totalRestricted = Object.values(dietary.byRestriction).reduce((a, b) => a + b, 0)
    return Math.max(0, dietary.total - totalRestricted)
    void restricted
  }, [dietary])

  async function createCourse(data: Omit<CreateMenuCourseData, 'eventoId'>): Promise<MenuCourse> {
    const nextOrder = courses.length > 0 ? Math.max(...courses.map((c) => c.displayOrder)) + 1 : 0
    const course = await createUC.execute({ ...data, eventoId, displayOrder: nextOrder })
    setCourses((prev) => [...prev, course])
    return course
  }

  async function updateCourse(id: string, data: UpdateMenuCourseData): Promise<MenuCourse> {
    const updated = await updateUC.execute(id, data)
    setCourses((prev) => prev.map((c) => (c.id === id ? updated : c)))
    return updated
  }

  async function updateStatus(id: string, status: MenuCourseStatus): Promise<void> {
    await updateCourse(id, { status })
  }

  async function deleteCourse(id: string): Promise<void> {
    await deleteUC.execute(id)
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  return {
    courses,
    dietary,
    dietaryLabels,
    standardCount,
    miseEnPlace,
    isLoading,
    error,
    reload: load,
    createCourse,
    updateCourse,
    updateStatus,
    deleteCourse,
  }
}
