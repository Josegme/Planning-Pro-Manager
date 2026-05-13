import { Pencil, Trash2, Eye, Users } from 'lucide-react'
import { InvitadoStatusBadge } from './InvitadoStatusBadge'
import { Button } from '../ui/Button'
import type { Invitado } from '../../../core/domain/invitado/Invitado'
import { nombreCompleto, canDelete } from '../../../core/domain/invitado/Invitado'

interface InvitadoRowProps {
  invitado: Invitado
  onView: (inv: Invitado) => void
  onEdit: (inv: Invitado) => void
  onDelete: (inv: Invitado) => void
}

export function InvitadoRow({ invitado, onView, onEdit, onDelete }: InvitadoRowProps) {
  return (
    <tr className="border-b hover:bg-muted/40 transition-colors">
      <td className="py-3 px-4">
        <div>
          <button
            onClick={() => onView(invitado)}
            className="font-medium text-sm hover:underline text-left"
          >
            {nombreCompleto(invitado)}
          </button>
          {invitado.grupo && (
            <p className="text-xs text-muted-foreground mt-0.5">{invitado.grupo}</p>
          )}
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {invitado.dni ?? <span className="text-muted-foreground/50">—</span>}
      </td>
      <td className="py-3 px-4">
        <InvitadoStatusBadge status={invitado.status} />
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {invitado.acompanantesEsperados > 0 && (
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            +{invitado.acompanantesEsperados}
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-muted-foreground">
        {invitado.dietaryRestrictions.length > 0
          ? invitado.dietaryRestrictions.length === 1
            ? invitado.dietaryRestrictions[0]
            : `${invitado.dietaryRestrictions.length} restricciones`
          : <span className="text-muted-foreground/50">—</span>
        }
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => onView(invitado)} title="Ver detalle">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onEdit(invitado)} title="Editar">
            <Pencil className="h-4 w-4" />
          </Button>
          {canDelete(invitado) && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(invitado)}
              title="Eliminar"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
