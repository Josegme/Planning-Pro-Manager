import { useFormContext } from 'react-hook-form'
import { cn } from '@/lib/utils'
import type { EventoFormData } from './EventoWizard'

export function Step3Opciones() {
  const { register, watch } = useFormContext<EventoFormData>()
  const hasTables = watch('hasTables')

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Configuración de mesas</h3>
        <label
          className={cn(
            'flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
            hasTables ? 'border-primary bg-primary/5' : 'border-input hover:bg-accent/50',
          )}
        >
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-input"
            {...register('hasTables')}
          />
          <div>
            <p className="text-sm font-medium">Gestionar mesas numeradas</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Activá esta opción si el evento tiene asignación de mesas por invitado.
              Podés configurarlas en detalle luego de crear el evento.
            </p>
          </div>
        </label>
      </div>

      <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Próximos pasos</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Configurar el formulario RSVP y publicar el evento</li>
          {hasTables && <li>Crear y organizar las mesas del salón</li>}
          <li>Agregar invitados y gestionar confirmaciones</li>
        </ul>
      </div>
    </div>
  )
}
