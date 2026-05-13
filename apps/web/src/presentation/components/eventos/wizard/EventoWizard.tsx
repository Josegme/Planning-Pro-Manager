import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Step1Basicos } from './Step1Basicos'
import { Step2Lugar } from './Step2Lugar'
import { Step3Opciones } from './Step3Opciones'
import { Button } from '../../ui/Button'
import { useEventos } from '../../../hooks/useEventos'

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(120),
  type: z.enum(['boda', 'cumpleanos', 'corporativo', 'social', 'otro']),
  date: z.string().min(1, 'La fecha es obligatoria'),
  time: z.string().optional(),
  venueName: z.string().optional(),
  location: z.string().optional(),
  capacity: z.number({ invalid_type_error: 'Ingresá la capacidad' }).min(1, 'Debe ser mayor a 0'),
  hasTables: z.boolean(),
})

export type EventoFormData = z.infer<typeof schema>

const STEP_TITLES = ['Datos básicos', 'Lugar y capacidad', 'Opciones']
const TOTAL_STEPS = 3

const STEP_FIELDS: (keyof EventoFormData)[][] = [
  ['name', 'type', 'date'],
  ['capacity'],
  [],
]

export function EventoWizard() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const { create } = useEventos()

  const methods = useForm<EventoFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      type: 'boda',
      date: '',
      time: '',
      venueName: '',
      location: '',
      capacity: 100,
      hasTables: false,
    },
    mode: 'onTouched',
  })

  const goNext = async () => {
    const fields = STEP_FIELDS[step - 1]
    const valid = await methods.trigger(fields)
    if (valid) setStep((s) => s + 1)
  }

  const goPrev = () => setStep((s) => s - 1)

  const onSubmit = async (data: EventoFormData) => {
    try {
      setIsSubmitting(true)
      const evento = await create({
        name: data.name,
        type: data.type,
        date: data.date,
        time: data.time || undefined,
        venueName: data.venueName || undefined,
        location: data.location || undefined,
        capacity: data.capacity,
        hasTables: data.hasTables,
      })
      navigate(`/eventos/${evento.id}`)
    } catch (e) {
      methods.setError('root', {
        message: e instanceof Error ? e.message : 'Error al crear el evento',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                s < step
                  ? 'bg-primary text-primary-foreground'
                  : s === step
                  ? 'border-2 border-primary text-primary'
                  : 'border-2 border-muted text-muted-foreground'
              }`}
            >
              {s < step ? '✓' : s}
            </div>
            <span className={`text-xs hidden sm:block ${s === step ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
              {STEP_TITLES[s - 1]}
            </span>
            {s < TOTAL_STEPS && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="min-h-[280px]">
            {step === 1 && <Step1Basicos />}
            {step === 2 && <Step2Lugar />}
            {step === 3 && <Step3Opciones />}
          </div>

          {methods.formState.errors.root && (
            <p className="text-sm text-destructive mt-4">
              {methods.formState.errors.root.message}
            </p>
          )}

          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? () => navigate('/eventos') : goPrev}
            >
              {step === 1 ? 'Cancelar' : 'Atrás'}
            </Button>

            {step < TOTAL_STEPS ? (
              <Button type="button" onClick={goNext}>
                Siguiente
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear evento'}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
