import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '../ui/Dialog'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import type { Servicio, ServicioEstado, ServicioMoneda } from '../../../core/domain/servicio/Servicio'
import { costoTotal } from '../../../core/domain/servicio/Servicio'
import type { Provider } from '../../../core/domain/provider/Provider'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  providerId: z.string().nullable(),
  descripcion: z.string().nullable(),
  costoUnitario: z.coerce.number().min(0),
  cantidad: z.coerce.number().int().min(1),
  moneda: z.enum(['ARS', 'USD', 'EUR']),
  montoPagado: z.coerce.number().min(0),
  vencimiento: z.string().nullable(),
  estado: z.enum(['cotizado', 'contratado', 'pagado', 'cancelado']),
})

type FormData = z.infer<typeof schema>

interface ServicioDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: FormData) => Promise<void>
  servicio?: Servicio | null
  providers: Provider[]
}

export function ServicioDialog({ open, onClose, onSave, servicio, providers }: ServicioDialogProps) {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: '',
      providerId: null,
      descripcion: null,
      costoUnitario: 0,
      cantidad: 1,
      moneda: 'ARS',
      montoPagado: 0,
      vencimiento: null,
      estado: 'cotizado',
    },
  })

  useEffect(() => {
    if (open) {
      reset(
        servicio
          ? {
              nombre: servicio.nombre,
              providerId: servicio.providerId,
              descripcion: servicio.descripcion,
              costoUnitario: servicio.costoUnitario,
              cantidad: servicio.cantidad,
              moneda: servicio.moneda,
              montoPagado: servicio.montoPagado,
              vencimiento: servicio.vencimiento,
              estado: servicio.estado,
            }
          : {
              nombre: '', providerId: null, descripcion: null,
              costoUnitario: 0, cantidad: 1, moneda: 'ARS',
              montoPagado: 0, vencimiento: null, estado: 'cotizado',
            },
      )
    }
  }, [open, servicio, reset])

  const costoUnitario = watch('costoUnitario')
  const cantidad = watch('cantidad')
  const total = costoTotal({ costoUnitario: Number(costoUnitario), cantidad: Number(cantidad) })

  const onSubmit = async (data: FormData) => {
    await onSave({
      ...data,
      providerId: data.providerId || null,
      descripcion: data.descripcion || null,
      vencimiento: data.vencimiento || null,
    })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={servicio ? 'Editar servicio' : 'Nuevo servicio'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1">
            <Label>Nombre del servicio *</Label>
            <Input {...register('nombre')} placeholder="Ej: Catering, Fotógrafo, DJ…" />
            {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Proveedor</Label>
            <Select {...register('providerId')}>
              <option value="">Sin proveedor</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Estado</Label>
            <Select {...register('estado')}>
              {(['cotizado', 'contratado', 'pagado', 'cancelado'] as ServicioEstado[]).map((e) => (
                <option key={e} value={e}>
                  {e.charAt(0).toUpperCase() + e.slice(1)}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Costo unitario</Label>
            <Input type="number" min="0" step="0.01" {...register('costoUnitario')} />
          </div>

          <div className="space-y-1">
            <Label>Cantidad</Label>
            <Input type="number" min="1" step="1" {...register('cantidad')} />
          </div>

          <div className="space-y-1">
            <Label>Moneda</Label>
            <Select {...register('moneda')}>
              {(['ARS', 'USD', 'EUR'] as ServicioMoneda[]).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Monto pagado</Label>
            <Input type="number" min="0" step="0.01" {...register('montoPagado')} />
            {total > 0 && (
              <p className="text-xs text-muted-foreground">
                Total: {total.toLocaleString('es-AR')} — máx. pagado
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Vencimiento pago</Label>
            <Input type="date" {...register('vencimiento')} />
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Descripción (opcional)</Label>
            <Input {...register('descripcion')} placeholder="Notas adicionales sobre el servicio" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : servicio ? 'Guardar cambios' : 'Crear servicio'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
