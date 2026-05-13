import type { StructuralElement } from '../../../core/domain/layout/EventLayout'

const VP = { W: 1000, H: 640 }

interface Props {
  el: StructuralElement
}

export function StructuralEl({ el }: Props) {
  const x = el.x * VP.W
  const y = el.y * VP.H
  const w = el.w * VP.W
  const h = el.h * VP.H
  const cx = x + w / 2
  const cy = y + h / 2

  if (el.type === 'stage') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={4} fill="#1e293b" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="white" style={{ fontSize: 11, fontWeight: 600 }}>
          {el.label}
        </text>
      </g>
    )
  }

  if (el.type === 'dance') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={6} fill="#f8fafc" stroke="#cbd5e1" strokeDasharray="4 3" strokeWidth={1.5} />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#475569" style={{ fontSize: 11, fontWeight: 600 }}>
          {el.label}
        </text>
      </g>
    )
  }

  if (el.type === 'bar' || el.type === 'buffet') {
    const color = el.type === 'bar' ? '#7c3aed' : '#0891b2'
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={4} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={1.5} />
        <text x={cx} y={cy + 4} textAnchor="middle" fill={color} style={{ fontSize: 10, fontWeight: 600 }}>
          {el.label}
        </text>
      </g>
    )
  }

  if (el.type === 'entry') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} fill="#10b981" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#059669" style={{ fontSize: 10, fontWeight: 600 }}>
          {el.label}
        </text>
      </g>
    )
  }

  return null
}
