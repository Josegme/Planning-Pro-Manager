import { Badge } from '../ui/Badge'
import type { EventoStatus } from '../../../core/domain/evento/Evento'
import { EVENTO_STATUS_LABEL } from '../../../core/domain/evento/Evento'

const statusVariant: Record<EventoStatus, 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'> = {
  draft: 'outline',
  published: 'default',
  active: 'success',
  completed: 'secondary',
  cancelled: 'destructive',
}

export function EventoStatusBadge({ status }: { status: EventoStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {EVENTO_STATUS_LABEL[status]}
    </Badge>
  )
}
