import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { FaqItemEditor } from '../form/FaqItemEditor'
import { RepeaterField } from '../form/FileUploadBox'
import type { UseEventFormReturn } from '../../hooks/useEventForm'

interface FaqSectionProps {
  form: UseEventFormReturn
}

export function FaqSection({ form }: FaqSectionProps) {
  const { formData, updateFaqItem, addFaqItem, removeFaqItem, addSuggestedFaqs } = form

  return (
    <section id="faq" className="scroll-mt-28">
      <Card>
        <SectionHeader
          number={6}
          title="FAQ"
          description="Anticipate participant questions before they ask them."
        />

        <RepeaterField
          onAdd={() => addFaqItem()}
          addLabel="Add FAQ"
          secondaryAction={
            <Button variant="ghost" size="sm" onClick={addSuggestedFaqs}>
              Add suggested FAQs
            </Button>
          }
        >
          {formData.faqs.map((item, index) => (
            <FaqItemEditor
              key={item.id}
              item={item}
              index={index}
              canRemove={formData.faqs.length > 1}
              onChange={(updates) => updateFaqItem(item.id, updates)}
              onRemove={() => removeFaqItem(item.id)}
            />
          ))}
        </RepeaterField>
      </Card>
    </section>
  )
}
