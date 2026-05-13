import { EventoWizard } from '../../components/eventos/wizard/EventoWizard'

export function NuevoEventoPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Nuevo evento</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Completá los datos básicos — podés editar todo luego.
        </p>
      </div>
      <EventoWizard />
    </div>
  )
}
