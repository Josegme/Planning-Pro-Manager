import { Badge } from '../ui/Badge'
import type { InvitadoStatus } from '../../../core/domain/invitado/Invitado'
import { INVITADO_STATUS_LABEL } from '../../../core/domain/invitado/Invitado'

type BadgeVariant = 'outline' | 'secondary' | 'default' | 'success' | 'warning' | 'destructive'

const statusVariant: Record<InvitadoStatus, BadgeVariant> = {
  pendiente:  'outline',
  invitado:   'secondary',
  visto:      'warning',
  confirmado: 'default',
  checkin:    'success',
  rechazo:    'destructive',
}

export function InvitadoStatusBadge({ status }: { status: InvitadoStatus }) {
  return (
    <Badge variant={statusVariant[status]}>
      {INVITADO_STATUS_LABEL[status]}
    </Badge>
  )
}
