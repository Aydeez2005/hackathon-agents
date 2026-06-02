import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { SectionHeader } from '../ui/SectionHeader'
import type { UseEventFormReturn } from '../../hooks/useEventForm'

interface LogisticsSectionProps {
  form: UseEventFormReturn
}

export function LogisticsSection({ form }: LogisticsSectionProps) {
  const { formData, updateLogistics } = form
  const { logistics } = formData

  return (
    <section id="logistics" className="scroll-mt-28">
      <Card>
        <SectionHeader
          number={5}
          title="Logistics & Facilities"
          description="Practical on-site information for a smooth event experience."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Toilet location"
            name="toiletLocation"
            placeholder="Ground floor near reception, and on every floor near elevators"
            value={logistics.toiletLocation}
            onChange={(event) => updateLogistics('toiletLocation', event.target.value)}
          />
          <Input
            label="Cloakroom information"
            name="cloakroom"
            placeholder="Coat check available at the main entrance — free of charge"
            value={logistics.cloakroom}
            onChange={(event) => updateLogistics('cloakroom', event.target.value)}
          />
          <Input
            label="Emergency contact"
            name="emergencyContact"
            placeholder="+49 30 1234 5678 (venue security)"
            value={logistics.emergencyContact}
            onChange={(event) => updateLogistics('emergencyContact', event.target.value)}
          />
          <Input
            label="On-site contact person"
            name="onSiteContact"
            placeholder="Maria Schmidt, Event Manager — maria@example.com"
            value={logistics.onSiteContact}
            onChange={(event) => updateLogistics('onSiteContact', event.target.value)}
          />
          <Input
            label="Lost & found information"
            name="lostAndFound"
            placeholder="Report lost items to the registration desk"
            value={logistics.lostAndFound}
            onChange={(event) => updateLogistics('lostAndFound', event.target.value)}
          />
          <Input
            label="Charging stations"
            name="chargingStations"
            placeholder="USB charging stations in the lounge area and breakout rooms"
            value={logistics.chargingStations}
            onChange={(event) => updateLogistics('chargingStations', event.target.value)}
          />
          <TextArea
            label="Quiet room / prayer room / nursing room"
            name="quietRoom"
            placeholder="Quiet room on the 2nd floor, Room 2A. Nursing room available on request at reception."
            value={logistics.quietRoom}
            onChange={(event) => updateLogistics('quietRoom', event.target.value)}
            rows={3}
          />
          <TextArea
            label="Restricted areas"
            name="restrictedAreas"
            placeholder="Staff-only areas on the 4th floor. Participants should remain in designated event spaces."
            value={logistics.restrictedAreas}
            onChange={(event) => updateLogistics('restrictedAreas', event.target.value)}
            rows={3}
          />
          <TextArea
            label="Special house rules"
            name="houseRules"
            placeholder="No smoking inside the building. Photography allowed in public areas only."
            value={logistics.houseRules}
            onChange={(event) => updateLogistics('houseRules', event.target.value)}
            rows={3}
            className="sm:col-span-2"
          />
        </div>
      </Card>
    </section>
  )
}
