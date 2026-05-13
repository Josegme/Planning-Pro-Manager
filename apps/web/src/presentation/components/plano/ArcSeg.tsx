interface Props {
  cx: number
  cy: number
  r: number
  start: number  // radians
  end: number    // radians
  stroke: string
  sw: number
}

export function ArcSeg({ cx, cy, r, start, end, stroke, sw }: Props) {
  if (end - start >= Math.PI * 2 - 0.001) {
    return <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={sw} />
  }
  const a0 = start - Math.PI / 2
  const a1 = end - Math.PI / 2
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy + r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy + r * Math.sin(a1)
  const large = end - start > Math.PI ? 1 : 0
  return (
    <path
      d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`}
      fill="none"
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="butt"
    />
  )
}
