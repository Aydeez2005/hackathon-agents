import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { FileUploadBox } from '../form/FileUploadBox'
import { PARTICIPANT_FILE_ACCEPT } from '../../constants/options'
import type { UseEventFormReturn } from '../../hooks/useEventForm'

interface ParticipantUploadSectionProps {
  form: UseEventFormReturn
}

export function ParticipantUploadSection({ form }: ParticipantUploadSectionProps) {
  const { formData, setParticipantList } = form

  return (
    <section id="participants" className="scroll-mt-28">
      <Card highlighted>
        <SectionHeader
          number={7}
          title="Participant List Upload"
          description="Upload your participant list so AI agents can personalize communication and prepare event materials."
        />

        <FileUploadBox
          label="Participant list"
          helperText="Upload your participant list so AI agents can personalize communication and prepare event materials."
          accept={PARTICIPANT_FILE_ACCEPT}
          file={formData.participantList}
          onChange={setParticipantList}
        />
      </Card>
    </section>
  )
}
