import { Link } from 'react-router-dom'
import { Calendar, Users, MapPin } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { EventoStatusBadge } from './EventoStatusBadge'
import { Badge } from '../ui/Badge'
import type { Evento } from '../../../core/domain/evento/Evento'
import { EVENTO_TYPE_LABEL } from '../../../core/domain/evento/Evento'

interface EventoCardProps {
  evento: Evento
}

export function EventoCard({ evento }: EventoCardProps) {
  const dateLabel = (() => {
    try {
      return format(parseISO(evento.date), "d 'de' MMMM yyyy", { locale: es })
    } catch {
      return evento.date
    }
  })()

  return (
    <Link to={`/eventos/${evento.id}`} className="block group">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug">{evento.name}</CardTitle>
            <EventoStatusBadge status={evento.status} />
          </div>
          <Badge variant="outline" className="w-fit text-xs">
            {EVENTO_TYPE_LABEL[evento.type]}
          </Badge>
        </CardHeader>
        <CardContent>
          <dl className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{dateLabel}{evento.time ? ` · ${evento.time}` : ''}</span>
            </div>
            {evento.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{evento.venueName ?? evento.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{evento.capacity} personas</span>
            </div>
          </dl>
        </CardContent>
      </Card>
    </Link>
  )
}
