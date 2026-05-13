import { Check } from 'lucide-react'
import type { TimelineEtapa } from '../../../core/domain/timeline/TimelineEtapa'
import { getAcumuladoMinutos } from '../../../core/domain/timeline/TimelineEtapa'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface Props {
  etapas: TimelineEtapa[]
  onComplete: (id: string) => void
}

export function ProgressCard({ etapas, onComplete }: Props) {
  const completed = etapas.filter((e) => e.status === 'completada').length
  const total     = etapas.length
  const progress  = total > 0 ? (completed / total) * 100 : 0
  const acumulado = getAcumuladoMinutos(etapas)
  const current   = etapas.find((e) => e.status === 'en_curso')
  const hasStarted = etapas.some((e) => e.horaInicioReal !== null)

  return (
    <div className="rounded-lg border bg-white p-5 mb-5">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm text-muted-foreground">Progreso del evento</span>
            {hasStarted && (
              <Badge variant={Math.abs(acumulado) > 10 ? 'warning' : 'success'}>
                {acumulado >= 0 ? '+' : ''}{acumulado} min acumulado
              </Badge>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-semibold">
              {completed}
              <span className="text-base text-muted-foreground font-normal">/{total}</span>
            </span>
            <span className="text-sm text-muted-foreground">etapas completadas</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {current && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 min-w-[240px]">
            <div className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wide">
              En curso ahora
            </div>
            <div className="font-semibold">{current.nombre}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Inicio: {current.horaPlanificada}
              {current.duracionEstimada !== null && ` · Duración: ${current.duracionEstimada} min`}
            </div>
            <Button size="sm" className="mt-3" onClick={() => onComplete(current.id)}>
              <Check className="h-3 w-3" />
              Marcar como completada
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
