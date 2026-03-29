'use client'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
}

export function Toggle({ checked, onChange, disabled = false, label, description }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 disabled:opacity-50">
      <span
        className={[
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200',
          checked ? 'bg-orange-600' : 'bg-surface-alt',
          disabled ? 'cursor-not-allowed' : '',
        ].join(' ')}>
        <span
          className={[
            'pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
            checked ? 'translate-x-5.5' : 'translate-x-0.5',
          ].join(' ')}
        />
      </span>
      {(label || description) && (
        <span className="text-left">
          {label && <span className="text-sm font-medium text-text">{label}</span>}
          {description && <span className="block text-xs text-text-secondary">{description}</span>}
        </span>
      )}
    </button>
  )
}
