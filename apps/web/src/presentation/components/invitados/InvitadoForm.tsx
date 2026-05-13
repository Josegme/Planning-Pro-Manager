import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'
import { DietaryRestrictionsSelect } from './DietaryRestrictionsSelect'
import type { Invitado } from '../../../core/domain/invitado/Invitado'
import type { CreateInvitadoData, UpdateInvitadoData } from '../../../core/ports/IInvitadoRepository'

const schema = z.object({
  nombre:               z.string().min(1, 'Obligatorio'),
  apellido:             z.string().min(1, 'Obligatorio'),
  dni:                  z.string().optional(),
  email:                z.string().email('Email inválido').or(z.literal('')).optional(),
  whatsapp:             z.string().optional(),
  grupo:                z.string().optional(),
  acompanantesEsperados: z.coerce.number().min(0, 'Mínimo 0').default(0),
  dietaryRestrictions:  z.array(z.string()).default([]),
})

type FormData = z.infer<typeof schema>

interface InvitadoFormProps {
  invitado?: Invitado
  onSubmit: (data: Omit<CreateInvitadoData, 'eventoId'> | UpdateInvitadoData) => Promise<void>
  onCancel: () => void
}

export function InvitadoForm({ invitado, onSubmit, onCancel }: InvitadoFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: invitado
      ? {
          nombre: invitado.nombre,
          apellido: invitado.apellido,
          dni: invitado.dni ?? '',
          email: invitado.email ?? '',
          whatsapp: invitado.whatsapp ?? '',
          grupo: invitado.grupo ?? '',
          acompanantesEsperados: invitado.acompanantesEsperados,
          dietaryRestrictions: invitado.dietaryRestrictions,
        }
      : { acompanantesEsperados: 0, dietaryRestrictions: [] },
  })

  const submit = async (data: FormData) => {
    await onSubmit({
      nombre:               data.nombre,
      apellido:             data.apellido,
      dni:                  data.dni?.trim() || undefined,
      email:                data.email?.trim() || undefined,
      whatsapp:             data.whatsapp?.trim() || undefined,
      grupo:                data.grupo?.trim() || undefined,
      acompanantesEsperados: data.acompanantesEsperados,
      dietaryRestrictions:  data.dietaryRestrictions,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input id="nombre" {...register('nombre')} />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="apellido">Apellido *</Label>
          <Input id="apellido" {...register('apellido')} />
          {errors.apellido && <p className="text-xs text-destructive">{errors.apellido.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="dni">DNI</Label>
          <Input id="dni" placeholder="ej. 30123456" {...register('dni')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="grupo">Grupo / Familia</Label>
          <Input id="grupo" placeholder="ej. Mesa del novio" {...register('grupo')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" placeholder="+5491112345678" {...register('whatsapp')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="acompanantes">Acompañantes esperados</Label>
        <Select id="acompanantes" {...register('acompanantesEsperados')}>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Restricciones dietarias</Label>
        <Controller
          name="dietaryRestrictions"
          control={control}
          render={({ field }) => (
            <DietaryRestrictionsSelect value={field.value} onChange={field.onChange} />
          )}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : invitado ? 'Guardar cambios' : 'Agregar invitado'}
        </Button>
      </div>
    </form>
  )
}
