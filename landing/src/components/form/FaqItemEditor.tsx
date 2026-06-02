import { Trash2 } from 'lucide-react'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import type { FaqItem } from '../../types/eventForm'

interface FaqItemEditorProps {
  item: FaqItem
  index: number
  canRemove: boolean
  onChange: (updates: Partial<FaqItem>) => void
  onRemove: () => void
}

export function FaqItemEditor({
  item,
  index,
  canRemove,
  onChange,
  onRemove,
}: FaqItemEditorProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">FAQ {index + 1}</p>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-gray-500 transition-colors hover:bg-white hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
          Remove
        </button>
      </div>

      <div className="space-y-4">
        <Input
          label="Question"
          name={`faq-question-${item.id}`}
          placeholder="Where should participants check in?"
          value={item.question}
          onChange={(event) => onChange({ question: event.target.value })}
        />
        <TextArea
          label="Answer"
          name={`faq-answer-${item.id}`}
          placeholder="Please check in at the registration desk in the main lobby upon arrival."
          value={item.answer}
          onChange={(event) => onChange({ answer: event.target.value })}
          rows={3}
        />
      </div>
    </div>
  )
}
