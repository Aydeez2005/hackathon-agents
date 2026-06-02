import type { TextareaHTMLAttributes } from 'react'
import { FieldError } from './FieldError'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export function TextArea({
  label,
  error,
  hint,
  required,
  className = '',
  id,
  rows = 4,
  ...props
}: TextAreaProps) {
  const inputId = id ?? props.name

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-brand-600">*</span>}
      </label>
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        className={`w-full resize-y rounded-xl border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
          error ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-gray-200'
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      <FieldError message={error} />
    </div>
  )
}
