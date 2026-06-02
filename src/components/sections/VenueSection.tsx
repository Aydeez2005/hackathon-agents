import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { SectionHeader } from '../ui/SectionHeader'
import type { UseEventFormReturn } from '../../hooks/useEventForm'

interface VenueSectionProps {
  form: UseEventFormReturn
}

export function VenueSection({ form }: VenueSectionProps) {
  const { formData, updateVenue, touchField, getError } = form
  const { venue } = formData

  return (
    <section id="venue-location" className="scroll-mt-28">
      <Card>
        <SectionHeader
          number={2}
          title="Venue & Location"
          description="Help participants find and navigate the venue with ease."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Venue name"
            name="venueName"
            required
            placeholder="Berlin Innovation Center"
            value={venue.venueName}
            error={getError('venue.venueName')}
            onBlur={() => touchField('venue.venueName')}
            onChange={(event) => updateVenue('venueName', event.target.value)}
            className="sm:col-span-2"
          />
          <TextArea
            label="Full address"
            name="fullAddress"
            required
            placeholder="Friedrichstraße 123, 10117 Berlin, Germany"
            value={venue.fullAddress}
            error={getError('venue.fullAddress')}
            onBlur={() => touchField('venue.fullAddress')}
            onChange={(event) => updateVenue('fullAddress', event.target.value)}
            rows={2}
            className="sm:col-span-2"
          />
          <Input
            label="Room / floor / entrance details"
            name="roomDetails"
            placeholder="3rd floor, Room 3B — use the east entrance"
            value={venue.roomDetails}
            onChange={(event) => updateVenue('roomDetails', event.target.value)}
            className="sm:col-span-2"
          />
          <TextArea
            label="Public transport information"
            name="publicTransport"
            placeholder="U-Bahn: Friedrichstraße (U6). S-Bahn: Friedrichstraße (S1, S2, S25)."
            value={venue.publicTransport}
            onChange={(event) => updateVenue('publicTransport', event.target.value)}
            rows={3}
          />
          <TextArea
            label="Parking information"
            name="parking"
            placeholder="Underground parking available at €5/day. Street parking limited after 6 PM."
            value={venue.parking}
            onChange={(event) => updateVenue('parking', event.target.value)}
            rows={3}
          />
          <TextArea
            label="Accessibility information"
            name="accessibility"
            placeholder="Wheelchair accessible entrance on the ground floor. Elevator access to all floors."
            value={venue.accessibility}
            onChange={(event) => updateVenue('accessibility', event.target.value)}
            rows={3}
            className="sm:col-span-2"
          />
          <TextArea
            label="Check-in instructions"
            name="checkInInstructions"
            placeholder="Please check in at the registration desk in the main lobby. Bring your confirmation email or ID."
            value={venue.checkInInstructions}
            onChange={(event) => updateVenue('checkInInstructions', event.target.value)}
            rows={3}
            className="sm:col-span-2"
          />
          <TextArea
            label="WiFi information"
            name="wifiInfo"
            placeholder="Network: InnovationCenter-Guest | Password: Welcome2026"
            value={venue.wifiInfo}
            onChange={(event) => updateVenue('wifiInfo', event.target.value)}
            rows={2}
            className="sm:col-span-2"
          />
        </div>
      </Card>
    </section>
  )
}
