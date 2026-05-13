import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  name: string
  size?: number
  className?: string
}

export function InvitadoAvatar({ name, size = 24, className }: Props) {
  const initials = useMemo(() => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('')
  }, [name])

  const hue = useMemo(() => {
    let h = 0
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360
    return h
  }, [name])

  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full font-medium shrink-0', className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `hsl(${hue} 60% 92%)`,
        color: `hsl(${hue} 60% 35%)`,
      }}
    >
      {initials || '?'}
    </span>
  )
}
