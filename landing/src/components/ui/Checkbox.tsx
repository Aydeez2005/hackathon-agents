import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
}

export function Checkbox({ label, description, className = '', id, ...props }: CheckboxProps) {
  const checkboxId = id ?? props.name

  return (
    <label
      htmlFor={checkboxId}
      className={`flex cursor-pointer items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-colors hover:border-gray-200 hover:bg-white ${className}`}
    >
      <input
        id={checkboxId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        {...props}
      />
      <span>
        <span className="block text-sm font-medium text-gray-800">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-gray-500">{description}</span>}
      </span>
    </label>
  )
}
