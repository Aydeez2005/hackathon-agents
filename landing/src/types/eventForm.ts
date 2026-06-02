export type MaterialKey =
  | 'eventBrief'
  | 'speakerBios'
  | 'sponsorInfo'
  | 'brandAssets'
  | 'venueMap'
  | 'presentationFiles'
  | 'other'

export interface UploadedFile {
  file: File
  name: string
  size: number
  type: string
}

export interface AgendaBlock {
  id: string
  time: string
  title: string
  sessionType: string
  speaker: string
  description: string
  location: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface EventFormData {
  basics: {
    eventName: string
    eventType: string
    eventDate: string
    startTime: string
    endTime: string
    timezone: string
    expectedParticipants: number | ''
    language: string
    description: string
  }
  venue: {
    venueName: string
    fullAddress: string
    roomDetails: string
    publicTransport: string
    parking: string
    accessibility: string
    checkInInstructions: string
    wifiInfo: string
  }
  agenda: AgendaBlock[]
  foodDrinks: {
    snacksProvided: boolean | null
    snackDetails: string
    drinksProvided: boolean | null
    drinkDetails: string
    mealInfo: string
    dietaryOptions: string
    cateringTiming: string
    participantNotes: string
  }
  logistics: {
    toiletLocation: string
    cloakroom: string
    emergencyContact: string
    onSiteContact: string
    lostAndFound: string
    chargingStations: string
    quietRoom: string
    restrictedAreas: string
    houseRules: string
  }
  faqs: FaqItem[]
  participantList: UploadedFile | null
  additionalMaterials: Record<MaterialKey, UploadedFile | null>
  finalNotes: {
    additionalContext: string
    confirmedComplete: boolean
  }
}

export interface SerializedUploadedFile {
  name: string
  size: number
  type: string
}

export interface SerializedEventFormData
  extends Omit<EventFormData, 'participantList' | 'additionalMaterials'> {
  participantList: SerializedUploadedFile | null
  additionalMaterials: Record<MaterialKey, SerializedUploadedFile | null>
}

export const FORM_SECTIONS = [
  { id: 'event-basics', label: 'Event Basics', number: 1 },
  { id: 'venue-location', label: 'Venue & Location', number: 2 },
  { id: 'agenda', label: 'Agenda', number: 3 },
  { id: 'food-drinks', label: 'Food & Drinks', number: 4 },
  { id: 'logistics', label: 'Logistics & Facilities', number: 5 },
  { id: 'faq', label: 'FAQ', number: 6 },
  { id: 'participants', label: 'Participant List', number: 7 },
  { id: 'materials', label: 'Additional Materials', number: 8 },
  { id: 'final-notes', label: 'Final Notes', number: 9 },
] as const

export type FormSectionId = (typeof FORM_SECTIONS)[number]['id']

function createId(): string {
  return crypto.randomUUID()
}

export function createAgendaBlock(): AgendaBlock {
  return {
    id: createId(),
    time: '',
    title: '',
    sessionType: '',
    speaker: '',
    description: '',
    location: '',
  }
}

export function createFaqItem(question = '', answer = ''): FaqItem {
  return {
    id: createId(),
    question,
    answer,
  }
}

export function createInitialFormData(): EventFormData {
  return {
    basics: {
      eventName: '',
      eventType: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      timezone: 'Europe/Berlin',
      expectedParticipants: '',
      language: 'English',
      description: '',
    },
    venue: {
      venueName: '',
      fullAddress: '',
      roomDetails: '',
      publicTransport: '',
      parking: '',
      accessibility: '',
      checkInInstructions: '',
      wifiInfo: '',
    },
    agenda: [createAgendaBlock()],
    foodDrinks: {
      snacksProvided: null,
      snackDetails: '',
      drinksProvided: null,
      drinkDetails: '',
      mealInfo: '',
      dietaryOptions: '',
      cateringTiming: '',
      participantNotes: '',
    },
    logistics: {
      toiletLocation: '',
      cloakroom: '',
      emergencyContact: '',
      onSiteContact: '',
      lostAndFound: '',
      chargingStations: '',
      quietRoom: '',
      restrictedAreas: '',
      houseRules: '',
    },
    faqs: [createFaqItem()],
    participantList: null,
    additionalMaterials: {
      eventBrief: null,
      speakerBios: null,
      sponsorInfo: null,
      brandAssets: null,
      venueMap: null,
      presentationFiles: null,
      other: null,
    },
    finalNotes: {
      additionalContext: '',
      confirmedComplete: false,
    },
  }
}

function serializeFile(file: UploadedFile | null): SerializedUploadedFile | null {
  if (!file) return null
  return {
    name: file.name,
    size: file.size,
    type: file.type,
  }
}

export function serializeEventForm(data: EventFormData): SerializedEventFormData {
  return {
    ...data,
    participantList: serializeFile(data.participantList),
    additionalMaterials: Object.fromEntries(
      Object.entries(data.additionalMaterials).map(([key, value]) => [
        key,
        serializeFile(value),
      ]),
    ) as Record<MaterialKey, SerializedUploadedFile | null>,
  }
}
