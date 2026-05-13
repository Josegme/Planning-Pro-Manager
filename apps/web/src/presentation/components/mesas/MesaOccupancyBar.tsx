import { cn } from '@/lib/utils'
import type { MesaOccupancyStatus } from '../../../core/domain/mesa/Mesa'

interface Props {
  occupied: number
  capacity: number
  status: MesaOccupancyStatus
}

const barColor: Record<MesaOccupancyStatus, string> = {
  empty:   'bg-slate-300',
  partial: 'bg-amber-400',
  full:    'bg-orange-500',
  checkin: 'bg-blue-500',
}

export function MesaOccupancyBar({ occupied, capacity, status }: Props) {
  const pct = Math.min(100, (occupied / capacity) * 100)
  return (
    <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={cn('h-full transition-all', barColor[status])}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
