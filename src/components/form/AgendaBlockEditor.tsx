import { Trash2 } from 'lucide-react'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { TextArea } from '../ui/TextArea'
import { SESSION_TYPES } from '../../constants/options'
import type { AgendaBlock } from '../../types/eventForm'

interface AgendaBlockEditorProps {
  block: AgendaBlock
  index: number
  canRemove: boolean
  onChange: (updates: Partial<AgendaBlock>) => void
  onRemove: () => void
}

export function AgendaBlockEditor({
  block,
  index,
  canRemove,
  onChange,
  onRemove,
}: AgendaBlockEditorProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">Session {index + 1}</p>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Time"
          name={`agenda-time-${block.id}`}
          placeholder="09:00 – 09:30"
          value={block.time}
          onChange={(event) => onChange({ time: event.target.value })}
        />
        <Select
          label="Session type"
          name={`agenda-type-${block.id}`}
          options={SESSION_TYPES}
          placeholder="Select session type"
          value={block.sessionType}
          onChange={(event) => onChange({ sessionType: event.target.value })}
        />
        <Input
          label="Session title"
          name={`agenda-title-${block.id}`}
          placeholder="Opening keynote: The future of product leadership"
          value={block.title}
          onChange={(event) => onChange({ title: event.target.value })}
          className="sm:col-span-2"
        />
        <Input
          label="Speaker / host name"
          name={`agenda-speaker-${block.id}`}
          placeholder="Dr. Sarah Chen"
          value={block.speaker}
          onChange={(event) => onChange({ speaker: event.target.value })}
        />
        <Input
          label="Location / room"
          name={`agenda-location-${block.id}`}
          placeholder="Main hall, Room 3B"
          value={block.location}
          onChange={(event) => onChange({ location: event.target.value })}
        />
        <TextArea
          label="Short description"
          name={`agenda-description-${block.id}`}
          placeholder="A welcome address setting the tone for the day and introducing key themes."
          value={block.description}
          onChange={(event) => onChange({ description: event.target.value })}
          rows={3}
          className="sm:col-span-2"
        />
      </div>
    </div>
  )
}
