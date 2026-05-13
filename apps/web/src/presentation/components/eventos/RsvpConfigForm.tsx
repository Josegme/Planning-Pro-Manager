import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link2, Eye } from 'lucide-react'
import { Label } from '../ui/Label'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import { SupabaseEventoRepository } from '../../../infrastructure/supabase/SupabaseEventoRepository'
import { ConfigureRsvpUseCase } from '../../../core/application/evento/ConfigureRsvpUseCase'
import {
  DEFAULT_RSVP_FIELDS,
  RSVP_FIELD_LABEL,
  type Evento,
  type RsvpFieldConfig,
  type RsvpFieldKey,
} from '../../../core/domain/evento/Evento'

const repo    = new SupabaseEventoRepository()
const configUC = new ConfigureRsvpUseCase(repo)

const schema = z.object({
  welcomeMessage: z.string().max(400).optional(),
  bannerUrl:      z.string().url('URL inválida').or(z.literal('')).optional(),
  publishNow:     z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

interface RsvpConfigFormProps {
  evento: Evento
  onSaved: (updated: Evento) => void
  onCancel: () => void
}

export function RsvpConfigForm({ evento, onSaved, onCancel }: RsvpConfigFormProps) {
  const [fields, setFields] = useState<RsvpFieldConfig[]>(
    evento.rsvpFields ?? DEFAULT_RSVP_FIELDS,
  )

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      welcomeMessage: evento.rsvpWelcomeMessage ?? '',
      bannerUrl:      evento.rsvpBannerUrl ?? '',
      publishNow:     evento.status === 'draft',
    },
  })

  const toggleShown = (key: RsvpFieldKey) =>
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, shown: !f.shown, required: !f.shown ? f.required : false } : f)),
    )

  const toggleRequired = (key: RsvpFieldKey) =>
    setFields((prev) =>
      prev.map((f) => (f.key === key && f.shown ? { ...f, required: !f.required } : f)),
    )

  const onSubmit = async (data: FormData) => {
    const updated = await configUC.execute({
      eventoId:       evento.id,
      fields,
      welcomeMessage: data.welcomeMessage?.trim() || undefined,
      bannerUrl:      data.bannerUrl?.trim()      || undefined,
      publishNow:     data.publishNow,
    })
    onSaved(updated)
  }

  const frontendUrl = import.meta.env.VITE_APP_URL ?? window.location.origin
  const previewSlug = evento.rsvpSlug ?? 'mi-evento-2026-xxxx'
  const previewLink = `${frontendUrl}/rsvp/${previewSlug}`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Field config */}
      <div>
        <p className="text-sm font-medium mb-3">Campos del formulario</p>
        <p className="text-xs text-muted-foreground mb-3">
          Nombre y apellido siempre son obligatorios.
        </p>
        <div className="space-y-2">
          {fields.map((field) => (
            <div
              key={field.key}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="text-sm">{RSVP_FIELD_LABEL[field.key]}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded"
                    checked={field.shown}
                    onChange={() => toggleShown(field.key)}
                  />
                  Mostrar
                </label>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded"
                    checked={field.required}
                    disabled={!field.shown}
                    onChange={() => toggleRequired(field.key)}
                  />
                  Obligatorio
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Welcome message */}
      <div className="space-y-1.5">
        <Label htmlFor="welcomeMessage">Mensaje de bienvenida</Label>
        <Textarea
          id="welcomeMessage"
          placeholder="Ej. Estamos muy felices de invitarlos a celebrar con nosotros..."
          rows={3}
          {...register('welcomeMessage')}
        />
        {errors.welcomeMessage && (
          <p className="text-xs text-destructive">{errors.welcomeMessage.message}</p>
        )}
      </div>

      {/* Banner URL */}
      <div className="space-y-1.5">
        <Label htmlFor="bannerUrl">URL de imagen de banner</Label>
        <Input
          id="bannerUrl"
          placeholder="https://..."
          {...register('bannerUrl')}
        />
        {errors.bannerUrl && (
          <p className="text-xs text-destructive">{errors.bannerUrl.message}</p>
        )}
      </div>

      {/* Link preview */}
      <div className="rounded-lg bg-muted/50 p-4 space-y-2">
        <p className="text-sm font-medium flex items-center gap-1.5">
          <Link2 className="h-4 w-4" /> Link RSVP
        </p>
        <code className="text-xs break-all text-muted-foreground block">{previewLink}</code>
        {evento.rsvpSlug && (
          <a
            href={previewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Eye className="h-3 w-3" /> Previsualizar formulario
          </a>
        )}
      </div>

      {/* Publish toggle */}
      {evento.status === 'draft' && (
        <label className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded"
            {...register('publishNow')}
          />
          <div>
            <p className="text-sm font-medium">Publicar evento al guardar</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Genera el link RSVP y lo hace accesible al público.
            </p>
          </div>
        </label>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar configuración'}
        </Button>
      </div>
    </form>
  )
}
