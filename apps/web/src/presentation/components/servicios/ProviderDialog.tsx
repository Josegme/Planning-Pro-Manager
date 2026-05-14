import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '../ui/Dialog'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Button } from '../ui/Button'
import type { Provider } from '../../../core/domain/provider/Provider'

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  phone: z.string().nullable(),
  email: z.string().email('Email inválido').nullable().or(z.literal('')),
  address: z.string().nullable(),
  notes: z.string().nullable(),
})

type FormData = z.infer<typeof schema>

interface ProviderDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: FormData) => Promise<void>
  provider?: Provider | null
}

export function ProviderDialog({ open, onClose, onSave, provider }: ProviderDialogProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: null, email: null, address: null, notes: null },
  })

  useEffect(() => {
    if (open) {
      reset(
        provider
          ? { name: provider.name, phone: provider.phone, email: provider.email, address: provider.address, notes: provider.notes }
          : { name: '', phone: null, email: null, address: null, notes: null },
      )
    }
  }, [open, provider, reset])

  const onSubmit = async (data: FormData) => {
    await onSave({
      ...data,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
    })
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={provider ? 'Editar proveedor' : 'Nuevo proveedor'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label>Nombre *</Label>
          <Input {...register('name')} placeholder="Ej: Sabores del Campo" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Teléfono</Label>
            <Input {...register('phone')} placeholder="+54 9 11 XXXX-XXXX" />
          </div>

          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" {...register('email')} placeholder="proveedor@ejemplo.com" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <Label>Dirección</Label>
          <Input {...register('address')} placeholder="Calle, número, ciudad" />
        </div>

        <div className="space-y-1">
          <Label>Notas</Label>
          <Input {...register('notes')} placeholder="Observaciones, condiciones, contacto…" />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : provider ? 'Guardar cambios' : 'Crear proveedor'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
