import { useFormContext } from 'react-hook-form'
import { Input } from '../../ui/Input'
import { Label } from '../../ui/Label'
import { Select } from '../../ui/Select'
import type { EventoFormData } from './EventoWizard'

export function Step1Basicos() {
  const { register, formState: { errors } } = useFormContext<EventoFormData>()

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre del evento *</Label>
        <Input
          id="name"
          placeholder="ej. Boda García-López"
          {...register('name')}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="type">Tipo de evento *</Label>
        <Select id="type" {...register('type')}>
          <option value="boda">Boda</option>
          <option value="cumpleanos">Cumpleaños</option>
          <option value="corporativo">Corporativo</option>
          <option value="social">Social</option>
          <option value="otro">Otro</option>
        </Select>
        {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date">Fecha *</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="time">Hora</Label>
          <Input id="time" type="time" {...register('time')} />
        </div>
      </div>
    </div>
  )
}
