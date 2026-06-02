interface FieldErrorProps {
  message?: string
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null

  return <p className="mt-1.5 text-sm text-red-600">{message}</p>
}
