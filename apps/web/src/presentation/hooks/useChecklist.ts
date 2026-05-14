import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../infrastructure/supabase/client'
import { SupabaseServicioRepository } from '../../infrastructure/supabase/SupabaseServicioRepository'
import { SupabaseServiceTemplateRepository } from '../../infrastructure/supabase/SupabaseServiceTemplateRepository'
import { GetServiciosByEventoUseCase } from '../../core/application/servicio/GetServiciosByEventoUseCase'
import { CreateServicioUseCase } from '../../core/application/servicio/CreateServicioUseCase'
import { UpdateServicioUseCase } from '../../core/application/servicio/UpdateServicioUseCase'
import { DeleteServicioUseCase } from '../../core/application/servicio/DeleteServicioUseCase'
import { GetServiceTemplatesUseCase } from '../../core/application/serviceTemplate/GetServiceTemplatesUseCase'
import { CreateServiceTemplateUseCase } from '../../core/application/serviceTemplate/CreateServiceTemplateUseCase'
import { DeleteServiceTemplateUseCase } from '../../core/application/serviceTemplate/DeleteServiceTemplateUseCase'
import { useServicioStore } from '../stores/servicioStore'
import type { ServiceTemplate } from '../../core/domain/serviceTemplate/ServiceTemplate'
import type { Servicio } from '../../core/domain/servicio/Servicio'

const svcRepo  = new SupabaseServicioRepository()
const tplRepo  = new SupabaseServiceTemplateRepository()
const getSvcUC    = new GetServiciosByEventoUseCase(svcRepo)
const createSvcUC = new CreateServicioUseCase(svcRepo)
const updateSvcUC = new UpdateServicioUseCase(svcRepo)
const deleteSvcUC = new DeleteServicioUseCase(svcRepo)
const getTplUC    = new GetServiceTemplatesUseCase(tplRepo)
const createTplUC = new CreateServiceTemplateUseCase(tplRepo)
const deleteTplUC = new DeleteServiceTemplateUseCase(tplRepo)

export interface ChecklistEntry {
  template: ServiceTemplate
  servicio: Servicio | null
}

export interface ChecklistSummary {
  total: number
  applied: number
  confirmados: number
  pendientes: number
  problemas: number
}

export function useChecklist(eventoId: string) {
  const { getServicios, setServicios, upsertServicio, removeServicio } = useServicioStore()
  const servicios = getServicios(eventoId)

  const [templates, setTemplates] = useState<ServiceTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [svcList, tplList] = await Promise.all([
        getSvcUC.execute(eventoId),
        getTplUC.execute(),
      ])
      setServicios(eventoId, svcList)
      setTemplates(tplList)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar checklist')
    } finally {
      setIsLoading(false)
    }
  }, [eventoId, setServicios])

  useEffect(() => {
    load()

    const channel = supabase
      .channel(`checklist-${eventoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'servicios', filter: `evento_id=eq.${eventoId}` },
        () => load(),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventoId, load])

  // Entries: one per template, with the matching servicio (or null)
  const entries = useMemo<ChecklistEntry[]>(() => {
    return templates.map((tpl) => ({
      template: tpl,
      servicio: servicios.find((s) => s.templateId === tpl.id) ?? null,
    }))
  }, [templates, servicios])

  // Entries grouped by category, preserving display_order within each group
  const byCategory = useMemo<Record<string, ChecklistEntry[]>>(() => {
    return entries.reduce<Record<string, ChecklistEntry[]>>((acc, entry) => {
      const cat = entry.template.category
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(entry)
      return acc
    }, {})
  }, [entries])

  const summary = useMemo<ChecklistSummary>(() => {
    const applied = entries.filter((e) => e.servicio !== null)
    return {
      total: templates.length,
      applied: applied.length,
      confirmados: applied.filter((e) => e.servicio?.checklistStatus === 'confirmado').length,
      pendientes:  applied.filter((e) => e.servicio?.checklistStatus === 'pendiente').length,
      problemas:   applied.filter((e) => e.servicio?.checklistStatus === 'problema').length,
    }
  }, [entries, templates])

  async function applyTemplate(tpl: ServiceTemplate): Promise<void> {
    const svc = await createSvcUC.execute({
      eventoId,
      nombre: tpl.name,
      // templateId stored via the repo — pass it through a cast since port doesn't expose it
      // We patch via update immediately after to set template_id
      costoUnitario: 0,
      cantidad: 1,
      moneda: 'ARS',
      estado: 'cotizado',
    })
    // Set template_id via update (IServicioRepository.UpdateServicioData supports templateId implicitly
    // through the raw DB row — we call update with a raw patch via the repo directly)
    const { data, error } = await supabase
      .from('servicios')
      .update({ template_id: tpl.id })
      .eq('id', svc.id)
      .select()
      .single()
    if (error) throw error
    upsertServicio(eventoId, { ...svc, templateId: tpl.id })
    void data
  }

  async function unapplyTemplate(svcId: string): Promise<void> {
    await deleteSvcUC.execute(svcId)
    removeServicio(eventoId, svcId)
  }

  async function updateStatus(
    svcId: string,
    status: 'pendiente' | 'confirmado' | 'problema',
  ): Promise<void> {
    const updated = await updateSvcUC.execute(svcId, { checklistStatus: status })
    upsertServicio(eventoId, updated)
  }

  async function updateNote(svcId: string, note: string): Promise<void> {
    const updated = await updateSvcUC.execute(svcId, { checklistNote: note || null })
    upsertServicio(eventoId, updated)
  }

  async function applyAllRequired(): Promise<void> {
    const unapplied = entries.filter((e) => e.template.isRequired && e.servicio === null)
    await Promise.all(unapplied.map((e) => applyTemplate(e.template)))
  }

  async function addTemplateAndApply(name: string, category: string): Promise<void> {
    const tpl = await createTplUC.execute({ name, category })
    setTemplates((prev) => [...prev, tpl])
    await applyTemplate(tpl)
  }

  async function deleteTemplate(tplId: string): Promise<void> {
    await deleteTplUC.execute(tplId)
    setTemplates((prev) => prev.filter((t) => t.id !== tplId))
  }

  return {
    entries,
    byCategory,
    summary,
    templates,
    isLoading,
    error,
    applyTemplate,
    unapplyTemplate,
    updateStatus,
    updateNote,
    applyAllRequired,
    addTemplateAndApply,
    deleteTemplate,
    reload: load,
  }
}
