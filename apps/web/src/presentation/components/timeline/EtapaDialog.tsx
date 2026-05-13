import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import type { TimelineEtapa } from '../../../core/domain/timeline/TimelineEtapa'
import type { UpdateEtapaData } from '../../../core/ports/ITimelineRepository'

const schema = z.object({
  nombre:           z.string().min(1, 'El nombre es requerido').trim(),
  horaPlanificada:  z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  duracionEstimada: z.union([z.coerce.number().int().min(1), z.literal('')]).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  etapa?: TimelineEtapa | null
  onClose: () => void
  onCreate: (data: { nombre: string; horaPlanificada: string; duracionEstimada?: number }) => Promise<void>
  onUpdate: (id: string, data: UpdateEtapaData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function EtapaDialog({ open, etapa, onClose, onCreate, onUpdate, onDelete }: Props) {
  const isEdit = !!etapa

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre:           etapa?.nombre ?? '',
      horaPlanificada:  etapa?.horaPlanificada ?? '09:00',
      duracionEstimada: etapa?.duracionEstimada ?? '',
    },
  })

  useEffect(() => {
    reset({
      nombre:           etapa?.nombre ?? '',
      horaPlanificada:  etapa?.horaPlanificada ?? '09:00',
      duracionEstimada: etapa?.duracionEstimada ?? '',
    })
  }, [etapa, reset])

  const onSubmit = async (values: FormValues) => {
    const duracion =
      values.duracionEstimada === '' || values.duracionEstimada === undefined
        ? undefined
        : Number(values.duracionEstimada)

    if (isEdit && etapa) {
      await onUpdate(etapa.id, {
        nombre:           values.nombre,
        horaPlanificada:  values.horaPlanificada,
        duracionEstimada: duracion ?? null,
      })
    } else {
      await onCreate({
        nombre:           values.nombre,
        horaPlanificada:  values.horaPlanificada,
        duracionEstimada: duracion,
      })
    }
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar etapa' : 'Nueva etapa'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre de la etapa</Label>
          <Input
            id="nombre"
            placeholder="Ej. Apertura de puertas, Primer plato..."
            {...register('nombre')}
          />
          {errors.nombre && (
            <p className="text-xs text-destructive">{errors.nombre.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="horaPlanificada">Hora planificada</Label>
            <Input id="horaPlanificada" type="time" {...register('horaPlanificada')} />
            {errors.horaPlanificada && (
              <p className="text-xs text-destructive">{errors.horaPlanificada.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="duracionEstimada">
              Duración{' '}
              <span className="text-muted-foreground font-normal">(min, opcional)</span>
            </Label>
            <Input
              id="duracionEstimada"
              type="number"
              min={1}
              placeholder="Ej. 30"
              {...register('duracionEstimada')}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {isEdit && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => { onDelete(etapa!.id); onClose() }}
            >
              Eliminar etapa
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear etapa'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
