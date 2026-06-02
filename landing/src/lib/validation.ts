import type { EventFormData } from '../types/eventForm'

export type FormErrors = Record<string, string>

export interface ValidationResult {
  isValid: boolean
  errors: FormErrors
}

export function validateEventForm(data: EventFormData): ValidationResult {
  const errors: FormErrors = {}

  if (!data.basics.eventName.trim()) {
    errors['basics.eventName'] = 'Event name is required'
  }

  if (!data.basics.eventDate) {
    errors['basics.eventDate'] = 'Event date is required'
  }

  if (!data.basics.startTime) {
    errors['basics.startTime'] = 'Start time is required'
  }

  if (
    data.basics.expectedParticipants === '' ||
    Number(data.basics.expectedParticipants) <= 0
  ) {
    errors['basics.expectedParticipants'] = 'Expected participants is required'
  }

  if (!data.venue.venueName.trim()) {
    errors['venue.venueName'] = 'Venue name is required'
  }

  if (!data.venue.fullAddress.trim()) {
    errors['venue.fullAddress'] = 'Full address is required'
  }

  if (!data.finalNotes.confirmedComplete) {
    errors['finalNotes.confirmedComplete'] =
      'Please confirm that the information is complete'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function getFirstErrorSection(errors: FormErrors): string | null {
  const fieldToSection: Record<string, string> = {
    'basics.eventName': 'event-basics',
    'basics.eventDate': 'event-basics',
    'basics.startTime': 'event-basics',
    'basics.expectedParticipants': 'event-basics',
    'venue.venueName': 'venue-location',
    'venue.fullAddress': 'venue-location',
    'finalNotes.confirmedComplete': 'final-notes',
  }

  for (const field of Object.keys(errors)) {
    const section = fieldToSection[field]
    if (section) return section
  }

  return null
}
