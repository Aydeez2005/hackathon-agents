import { CheckCircle2 } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface SuccessStateProps {
  onEdit: () => void
  checkinUrl?: string
}

export function SuccessState({ onEdit, checkinUrl }: SuccessStateProps) {
  const url = checkinUrl ?? `${window.location.origin}/checkin`

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 space-y-6">
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

      <Card className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Check-in QR Code</h3>
        <p className="text-sm text-gray-500 mb-6">
          Display this at the entrance — participants scan to check in.
        </p>
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-xl border border-gray-200 inline-block">
            <QRCodeCanvas value={url} size={200} />
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-400 font-mono break-all">{url}</p>
      </Card>
    </div>
  )
}
