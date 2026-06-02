import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { AgendaBlockEditor } from '../form/AgendaBlockEditor'
import { RepeaterField } from '../form/FileUploadBox'
import type { UseEventFormReturn } from '../../hooks/useEventForm'

interface AgendaSectionProps {
  form: UseEventFormReturn
}

export function AgendaSection({ form }: AgendaSectionProps) {
  const { formData, updateAgendaBlock, addAgendaBlock, removeAgendaBlock } = form

  return (
    <section id="agenda" className="scroll-mt-28">
      <Card>
        <SectionHeader
          number={3}
          title="Agenda"
          description="Build your schedule session by session."
        />

        <RepeaterField onAdd={addAgendaBlock} addLabel="Add session">
          {formData.agenda.map((block, index) => (
            <AgendaBlockEditor
              key={block.id}
              block={block}
              index={index}
              canRemove={formData.agenda.length > 1}
              onChange={(updates) => updateAgendaBlock(block.id, updates)}
              onRemove={() => removeAgendaBlock(block.id)}
            />
          ))}
        </RepeaterField>
      </Card>
    </section>
  )
}
