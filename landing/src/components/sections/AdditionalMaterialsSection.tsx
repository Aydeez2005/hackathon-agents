import { Card } from '../ui/Card'
import { SectionHeader } from '../ui/SectionHeader'
import { FileUploadBox } from '../form/FileUploadBox'
import { MATERIAL_FILE_ACCEPT } from '../../constants/options'
import type { MaterialKey } from '../../types/eventForm'
import type { UseEventFormReturn } from '../../hooks/useEventForm'

const MATERIALS: { key: MaterialKey; label: string }[] = [
  { key: 'eventBrief', label: 'Event brief' },
  { key: 'speakerBios', label: 'Speaker bios' },
  { key: 'sponsorInfo', label: 'Sponsor information' },
  { key: 'brandAssets', label: 'Brand assets' },
  { key: 'venueMap', label: 'Venue map' },
  { key: 'presentationFiles', label: 'Presentation files' },
  { key: 'other', label: 'Other relevant documents' },
]

interface AdditionalMaterialsSectionProps {
  form: UseEventFormReturn
}

export function AdditionalMaterialsSection({ form }: AdditionalMaterialsSectionProps) {
  const { formData, setMaterialFile } = form

  return (
    <section id="materials" className="scroll-mt-28">
      <Card>
        <SectionHeader
          number={8}
          title="Additional Materials"
          description="Supporting documents that help AI agents create richer event assets."
        />

        <div className="grid gap-6 sm:grid-cols-2">
          {MATERIALS.map((material) => (
            <div
              key={material.key}
              className="rounded-xl border border-gray-100 bg-gray-50/40 p-4"
            >
              <FileUploadBox
                label={material.label}
                accept={MATERIAL_FILE_ACCEPT}
                file={formData.additionalMaterials[material.key]}
                onChange={(file) => setMaterialFile(material.key, file)}
                compact
              />
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
