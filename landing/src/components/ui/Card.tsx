import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  highlighted?: boolean
}

export function Card({ children, className = '', highlighted = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border bg-white p-6 shadow-sm sm:p-8 ${
        highlighted
          ? 'border-brand-200 shadow-md shadow-indigo-100/60 ring-1 ring-brand-100'
          : 'border-gray-100'
      } ${className}`}
    >
      {children}
    </div>
  )
}
