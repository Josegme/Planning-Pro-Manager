import { useFormContext } from 'react-hook-form'
import { Input } from '../../ui/Input'
import { Label } from '../../ui/Label'
import type { EventoFormData } from './EventoWizard'

export function Step2Lugar() {
  const { register, formState: { errors } } = useFormContext<EventoFormData>()

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="venueName">Nombre del salón / venue</Label>
        <Input
          id="venueName"
          placeholder="ej. Salón Versailles"
          {...register('venueName')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">Dirección</Label>
        <Input
          id="location"
          placeholder="ej. Av. Corrientes 1234, Buenos Aires"
          {...register('location')}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="capacity">Capacidad total *</Label>
        <Input
          id="capacity"
          type="number"
          min={1}
          placeholder="ej. 200"
          {...register('capacity', { valueAsNumber: true })}
        />
        {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
      </div>
    </div>
  )
}
