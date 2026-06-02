import type { SelectHTMLAttributes } from 'react'
import { FieldError } from './FieldError'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: readonly SelectOption[] | SelectOption[]
  error?: string
  placeholder?: string
}

export function Select({
  label,
  options,
  error,
  required,
  placeholder = 'Select an option',
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name

  return (
    <div className="w-full">
      <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-brand-600">*</span>}
      </label>
      <select
        id={selectId}
        required={required}
        className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
          error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200'
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </div>
  )
}
