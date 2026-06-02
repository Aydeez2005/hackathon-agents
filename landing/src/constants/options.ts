export const EVENT_TYPES = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'networking', label: 'Networking event' },
  { value: 'internal', label: 'Internal event' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'other', label: 'Other' },
] as const

export const SESSION_TYPES = [
  { value: 'keynote', label: 'Keynote' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'panel', label: 'Panel' },
  { value: 'break', label: 'Break' },
  { value: 'networking', label: 'Networking' },
  { value: 'registration', label: 'Registration' },
  { value: 'other', label: 'Other' },
] as const

export const TIMEZONES = [
  { value: 'Europe/Berlin', label: 'Central European Time (Berlin)' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (London)' },
  { value: 'Europe/Paris', label: 'Central European Time (Paris)' },
  { value: 'Europe/Amsterdam', label: 'Central European Time (Amsterdam)' },
  { value: 'Europe/Zurich', label: 'Central European Time (Zurich)' },
  { value: 'America/New_York', label: 'Eastern Time (New York)' },
  { value: 'America/Chicago', label: 'Central Time (Chicago)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (Tokyo)' },
  { value: 'Asia/Singapore', label: 'Singapore Time' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (Sydney)' },
  { value: 'UTC', label: 'UTC' },
] as const

export const LANGUAGES = [
  'English',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Dutch',
  'Portuguese',
  'Japanese',
  'Other',
] as const

export const PARTICIPANT_FILE_ACCEPT =
  '.csv,.xlsx,.xls,.pdf,.txt,.doc,.docx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/pdf,text/plain'

export const MATERIAL_FILE_ACCEPT =
  '.pdf,.doc,.docx,.ppt,.pptx,.xlsx,.xls,.csv,.txt,.png,.jpg,.jpeg,.svg,.zip,application/pdf,image/*'
