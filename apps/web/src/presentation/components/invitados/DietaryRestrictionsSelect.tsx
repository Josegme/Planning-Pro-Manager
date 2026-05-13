import { DIETARY_OPTIONS } from '../../../core/domain/invitado/Invitado'

interface DietaryRestrictionsSelectProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function DietaryRestrictionsSelect({ value, onChange }: DietaryRestrictionsSelectProps) {
  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {DIETARY_OPTIONS.map(({ id, label }) => (
        <label
          key={id}
          className="flex items-center gap-2 text-sm cursor-pointer select-none"
        >
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            checked={value.includes(id)}
            onChange={() => toggle(id)}
          />
          {label}
        </label>
      ))}
    </div>
  )
}
