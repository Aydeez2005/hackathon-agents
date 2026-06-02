import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Checkbox } from '../ui/Checkbox'
import { TextArea } from '../ui/TextArea'
import { FieldError } from '../ui/FieldError'
import { SectionHeader } from '../ui/SectionHeader'
import type { UseEventFormReturn } from '../../hooks/useEventForm'

interface FinalNotesSectionProps {
  form: UseEventFormReturn
}

export function FinalNotesSection({ form }: FinalNotesSectionProps) {
  const { formData, updateFinalNotes, touchField, getError, validateAndSubmit } = form
  const { finalNotes } = formData

  return (
    <section id="final-notes" className="scroll-mt-28">
      <Card>
        <SectionHeader
          number={9}
          title="Final Notes"
          description="Anything else the AI agents should know before getting started."
        />

        <div className="space-y-6">
          <TextArea
            label="Additional context"
            name="additionalContext"
            placeholder="VIP guests arriving at 08:00 need escort to the green room. Press interviews scheduled during lunch break."
            value={finalNotes.additionalContext}
            onChange={(event) => updateFinalNotes('additionalContext', event.target.value)}
            rows={5}
          />

          <div>
            <Checkbox
              name="confirmedComplete"
              label="I confirm that the information is complete and ready to be processed."
              checked={finalNotes.confirmedComplete}
              onChange={(event) => {
                updateFinalNotes('confirmedComplete', event.target.checked)
                touchField('finalNotes.confirmedComplete')
              }}
            />
            <FieldError message={getError('finalNotes.confirmedComplete')} />
          </div>

          <Button
            size="lg"
            className="w-full sm:w-auto"
            disabled={!finalNotes.confirmedComplete}
            onClick={validateAndSubmit}
          >
            Submit event information
          </Button>
        </div>
      </Card>
    </section>
  )
}
