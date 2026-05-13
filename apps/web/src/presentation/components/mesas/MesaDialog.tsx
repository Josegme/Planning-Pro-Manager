import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '../ui/Dialog'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import type { Mesa } from '../../../core/domain/mesa/Mesa'

const schema = z.object({
  number:       z.coerce.number().int().min(1, 'Debe ser mayor a 0'),
  name:         z.string().optional(),
  capacity:     z.coerce.number().int().min(1, 'Mínimo 1'),
  menuEspecial: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  mesa?: Mesa | null
  nextNumber?: number
  onClose: () => void
  onCreate: (data: { number: number; name?: string; capacity: number; menuEspecial?: string }) => Promise<void>
  onUpdate: (id: string, data: { number?: number; name?: string | null; capacity?: number; menuEspecial?: string | null }) => Promise<void>
  onDelete?: (id: string) => Promise<void>
}

export function MesaDialog({ open, mesa, nextNumber, onClose, onCreate, onUpdate, onDelete }: Props) {
  const isEdit = !!mesa

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      number:       mesa?.number ?? nextNumber ?? 1,
      name:         mesa?.name ?? '',
      capacity:     mesa?.capacity ?? 10,
      menuEspecial: mesa?.menuEspecial ?? '',
    },
  })

  useEffect(() => {
    reset({
      number:       mesa?.number ?? nextNumber ?? 1,
      name:         mesa?.name ?? '',
      capacity:     mesa?.capacity ?? 10,
      menuEspecial: mesa?.menuEspecial ?? '',
    })
  }, [mesa, nextNumber, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = {
      number:       values.number,
      name:         values.name?.trim() || undefined,
      capacity:     values.capacity,
      menuEspecial: values.menuEspecial?.trim() || undefined,
    }
    if (isEdit && mesa) {
      await onUpdate(mesa.id, {
        ...payload,
        name:         payload.name ?? null,
        menuEspecial: payload.menuEspecial ?? null,
      })
    } else {
      await onCreate(payload)
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title={isEdit ? `Editar Mesa ${mesa?.number}` : 'Nueva mesa'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="number">Número</Label>
            <Input id="number" type="number" min={1} {...register('number')} />
            {errors.number && <p className="text-xs text-destructive">{errors.number.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="capacity">Capacidad</Label>
            <Input id="capacity" type="number" min={1} {...register('capacity')} />
            {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Nombre <span className="text-muted-foreground font-normal">(opcional)</span></Label>
          <Input id="name" placeholder="Ej. Mesa de novios, Mesa VIP..." {...register('name')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="menuEspecial">Menú especial <span className="text-muted-foreground font-normal">(opcional)</span></Label>
          <Input id="menuEspecial" placeholder="Ej. Kosher, Vegano, Sin TACC..." {...register('menuEspecial')} />
        </div>

        <div className="flex items-center justify-between pt-2">
          {isEdit && onDelete ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => { onDelete(mesa!.id); onClose() }}
            >
              Eliminar mesa
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear mesa'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
