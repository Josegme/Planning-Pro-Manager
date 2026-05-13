import type { Mesa } from '../../../core/domain/mesa/Mesa'
import type { Invitado } from '../../../core/domain/invitado/Invitado'
import { ArcSeg } from './ArcSeg'

interface Props {
  mesa: Mesa
  invitados: Invitado[]
  cx: number
  cy: number
  r: number
  onHover: (mesa: Mesa | null) => void
}

export function MesaRing({ mesa, invitados, cx, cy, r, onHover }: Props) {
  const occupied = invitados.reduce((s, i) => s + 1 + i.acompanantesEsperados, 0)
  const checkin = invitados
    .filter((i) => i.status === 'checkin')
    .reduce((s, i) => s + 1 + (i.acompanantesPresentes ?? 0), 0)

  const confPct    = Math.min(1, mesa.capacity > 0 ? occupied / mesa.capacity : 0)
  const checkinPct = Math.min(1, mesa.capacity > 0 ? checkin / mesa.capacity : 0)

  const baseColor   = occupied === 0 ? '#94a3b8' : confPct >= 1 ? '#fb923c' : '#f59e0b'
  const checkinColor = '#3b82f6'
  const stroke = 7

  return (
    <g
      onMouseEnter={() => onHover(mesa)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}
    >
      <circle cx={cx} cy={cy} r={r} fill="white" stroke="#e2e8f0" strokeWidth={stroke} />
      {confPct > 0 && (
        <ArcSeg cx={cx} cy={cy} r={r} start={0} end={confPct * Math.PI * 2} stroke={baseColor} sw={stroke} />
      )}
      {checkinPct > 0 && (
        <ArcSeg cx={cx} cy={cy} r={r} start={0} end={checkinPct * Math.PI * 2} stroke={checkinColor} sw={stroke} />
      )}
      <circle cx={cx} cy={cy} r={r - stroke / 2 - 1} fill="white" />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fill="#334155"
        fontWeight={600}
        style={{ fontSize: r * 0.7, userSelect: 'none' }}
      >
        {mesa.number}
      </text>
      <text
        x={cx}
        y={cy + r + 13}
        textAnchor="middle"
        fill="#64748b"
        style={{ fontSize: 10, userSelect: 'none' }}
      >
        {occupied}/{mesa.capacity}
      </text>
      {mesa.menuEspecial && (
        <circle
          cx={cx + r * 0.65}
          cy={cy - r * 0.65}
          r={5}
          fill="#f59e0b"
          stroke="white"
          strokeWidth={1.5}
        />
      )}
    </g>
  )
}
