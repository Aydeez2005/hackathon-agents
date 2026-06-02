import { CheckCircle2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface SuccessStateProps {
  onEdit: () => void
}

export function SuccessState({ onEdit }: SuccessStateProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Event information submitted successfully
        </h2>
        <p className="mx-auto mt-3 max-w-md text-gray-600">
          Your AI agents can now start preparing event materials.
        </p>
        <Button variant="secondary" className="mt-8" onClick={onEdit}>
          Edit event details
        </Button>
      </Card>
    </div>
  )
}
