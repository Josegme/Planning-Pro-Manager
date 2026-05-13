import { Check, Play, MoreHorizontal, Clock } from 'lucide-react'
import type { TimelineEtapa } from '../../../core/domain/timeline/TimelineEtapa'
import { getDesvioMinutos, getSemaphore, SEMAPHORE_COLOR } from '../../../core/domain/timeline/TimelineEtapa'
import { Button } from '../ui/Button'

interface Props {
  etapa: TimelineEtapa
  index: number
  isLast: boolean
  onStart: (id: string) => void
  onComplete: (id: string) => void
  onEdit: (etapa: TimelineEtapa) => void
}

const STATUS_STYLE = {
  completada: { dot: 'bg-emerald-500',                           border: 'border-emerald-200', bg: 'bg-emerald-50/40' },
  en_curso:   { dot: 'bg-blue-500 ring-4 ring-blue-100',         border: 'border-blue-300',    bg: 'bg-blue-50/60'    },
  pendiente:  { dot: 'bg-slate-300',                             border: 'border-border',      bg: ''                 },
}

export function TimelineItem({ etapa, index, isLast, onStart, onComplete, onEdit }: Props) {
  const style    = STATUS_STYLE[etapa.status]
  const desvio   = getDesvioMinutos(etapa)
  const semaphore = desvio !== null ? getSemaphore(desvio) : null

  const realTime = etapa.horaInicioReal
    ? new Date(etapa.horaInicioReal).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="relative flex gap-4 pb-5 last:pb-0">
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border" />
      )}

      {/* Status dot */}
      <div className="relative shrink-0">
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm text-white shadow-sm ${style.dot}`}
        >
          {etapa.status === 'completada' ? (
            <Check className="h-4 w-4" strokeWidth={3} />
          ) : etapa.status === 'en_curso' ? (
            <Play className="h-3 w-3" />
          ) : (
            <span>{index + 1}</span>
          )}
        </div>
      </div>

      {/* Content card */}
      <div className={`flex-1 rounded-md border p-3 ${style.border} ${style.bg}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-medium flex items-center gap-2">
              {etapa.nombre}
              {semaphore && (
                <span className={`inline-block w-2 h-2 rounded-full ${SEMAPHORE_COLOR[semaphore]}`} />
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1 font-mono flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {etapa.horaPlanificada}
              </span>
              {etapa.duracionEstimada !== null && (
                <span>{etapa.duracionEstimada} min</span>
              )}
              {realTime && (
                <span className="text-foreground">Real: {realTime}</span>
              )}
              {desvio !== null && desvio !== 0 && (
                <span className={desvio > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {desvio > 0 ? '+' : ''}{desvio} min
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {etapa.status === 'pendiente' && (
              <Button size="sm" variant="outline" onClick={() => onStart(etapa.id)}>
                <Play className="h-3 w-3" />
                Iniciar
              </Button>
            )}
            {etapa.status === 'en_curso' && (
              <Button size="sm" onClick={() => onComplete(etapa.id)}>
                <Check className="h-3 w-3" />
                Completar
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={() => onEdit(etapa)}>
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
