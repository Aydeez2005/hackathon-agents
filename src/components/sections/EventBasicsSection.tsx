import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import { TextArea } from '../ui/TextArea'
import { SectionHeader } from '../ui/SectionHeader'
import { EVENT_TYPES, LANGUAGES, TIMEZONES } from '../../constants/options'
import type { UseEventFormReturn } from '../../hooks/useEventForm'

interface EventBasicsSectionProps {
  form: UseEventFormReturn
}

export function EventBasicsSection({ form }: EventBasicsSectionProps) {
  const { formData, updateBasics, touchField, getError } = form
  const { basics } = formData

  return (
    <section id="event-basics" className="scroll-mt-28">
      <Card>
        <SectionHeader
          number={1}
          title="Event Basics"
          description="Core details that define your event."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Event name"
            name="eventName"
            required
            placeholder="Product Leadership Summit 2026"
            value={basics.eventName}
            error={getError('basics.eventName')}
            onBlur={() => touchField('basics.eventName')}
            onChange={(event) => updateBasics('eventName', event.target.value)}
            className="sm:col-span-2"
          />
          <Select
            label="Event type / format"
            name="eventType"
            options={EVENT_TYPES}
            placeholder="Select event type"
            value={basics.eventType}
            onChange={(event) => updateBasics('eventType', event.target.value)}
          />
          <Select
            label="Event language"
            name="language"
            options={LANGUAGES.map((lang) => ({ value: lang, label: lang }))}
            placeholder="Select language"
            value={basics.language}
            onChange={(event) => updateBasics('language', event.target.value)}
          />
          <Input
            label="Event date"
            name="eventDate"
            type="date"
            required
            value={basics.eventDate}
            error={getError('basics.eventDate')}
            onBlur={() => touchField('basics.eventDate')}
            onChange={(event) => updateBasics('eventDate', event.target.value)}
          />
          <Select
            label="Time zone"
            name="timezone"
            options={TIMEZONES}
            value={basics.timezone}
            onChange={(event) => updateBasics('timezone', event.target.value)}
          />
          <Input
            label="Start time"
            name="startTime"
            type="time"
            required
            value={basics.startTime}
            error={getError('basics.startTime')}
            onBlur={() => touchField('basics.startTime')}
            onChange={(event) => updateBasics('startTime', event.target.value)}
          />
          <Input
            label="End time"
            name="endTime"
            type="time"
            value={basics.endTime}
            onChange={(event) => updateBasics('endTime', event.target.value)}
          />
          <Input
            label="Expected number of participants"
            name="expectedParticipants"
            type="number"
            min={1}
            required
            placeholder="120"
            value={basics.expectedParticipants}
            error={getError('basics.expectedParticipants')}
            onBlur={() => touchField('basics.expectedParticipants')}
            onChange={(event) =>
              updateBasics(
                'expectedParticipants',
                event.target.value === '' ? '' : Number(event.target.value),
              )
            }
          />
          <TextArea
            label="Short event description"
            name="description"
            placeholder="A one-day summit bringing together product leaders to share strategies, insights, and best practices."
            value={basics.description}
            onChange={(event) => updateBasics('description', event.target.value)}
            rows={4}
            className="sm:col-span-2"
          />
        </div>
      </Card>
    </section>
  )
}
