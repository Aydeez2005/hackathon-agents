import * as XLSX from 'xlsx'
import { supabase } from './supabase'
import type { EventFormData, AgendaBlock } from '../types/eventForm'

// ─── helpers ──────────────────────────────────────────────────────────────────

function buildAgendaText(blocks: AgendaBlock[]): string {
  return blocks
    .filter((b) => b.time || b.title)
    .map((b) => {
      const parts = [b.time, b.title].filter(Boolean).join(' — ')
      const details = [b.speaker, b.description, b.location].filter(Boolean).join(' · ')
      return details ? `${parts}\n  ${details}` : parts
    })
    .join('\n')
}

function buildLocationText(venue: EventFormData['venue']): string {
  const parts: string[] = []
  if (venue.venueName) parts.push(venue.venueName)
  if (venue.fullAddress) parts.push(venue.fullAddress)
  if (venue.roomDetails) parts.push(`Room: ${venue.roomDetails}`)
  if (venue.checkInInstructions) parts.push(`Check-in: ${venue.checkInInstructions}`)
  if (venue.wifiInfo) parts.push(`WiFi: ${venue.wifiInfo}`)
  if (venue.publicTransport) parts.push(`Transport: ${venue.publicTransport}`)
  if (venue.parking) parts.push(`Parking: ${venue.parking}`)
  return parts.join('\n')
}

function buildExtrasText(
  food: EventFormData['foodDrinks'],
  logistics: EventFormData['logistics'],
): string {
  const parts: string[] = []
  if (food.snacksProvided) parts.push(food.snackDetails ? `Snacks: ${food.snackDetails}` : 'Snacks provided')
  if (food.drinksProvided) parts.push(food.drinkDetails ? `Drinks: ${food.drinkDetails}` : 'Drinks provided')
  if (food.mealInfo) parts.push(`Meals: ${food.mealInfo}`)
  if (food.dietaryOptions) parts.push(`Dietary options: ${food.dietaryOptions}`)
  if (logistics.toiletLocation) parts.push(`Toilets: ${logistics.toiletLocation}`)
  if (logistics.chargingStations) parts.push(`Charging: ${logistics.chargingStations}`)
  if (logistics.emergencyContact) parts.push(`Emergency: ${logistics.emergencyContact}`)
  return parts.join('\n')
}

// ─── Participant parser ────────────────────────────────────────────────────────

type ParticipantRow = {
  full_name: string
  email: string | null
  phone: string
  linkedin: string
  role: string
  job_title: string
  member_id: string
  meetup_profile_url: string
  rsvp_status: string
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[\s_\-?]/g, '')
}

type ParticipantField = keyof ParticipantRow

const COLUMN_MAP: Record<string, ParticipantField> = {
  // name
  name: 'full_name',
  fullname: 'full_name',
  participantname: 'full_name',
  // email
  email: 'email',
  emailaddress: 'email',
  // phone
  phone: 'phone',
  phonenumber: 'phone',
  mobile: 'phone',
  telephone: 'phone',
  tel: 'phone',
  // linkedin
  linkedin: 'linkedin',
  linkedinprofile: 'linkedin',
  linkedinurl: 'linkedin',
  linkedinlink: 'linkedin',
  whatisyourlinkedinprofile: 'linkedin',
  // role (general)
  role: 'role',
  // job title (specific)
  jobtitle: 'job_title',
  whatisyourjobtitle: 'job_title',
  title: 'job_title',
  position: 'job_title',
  // meetup-specific
  memberid: 'member_id',
  urlofmemberprofile: 'meetup_profile_url',
  rsvp: 'rsvp_status',
}

function isHiddenEmail(val: string): boolean {
  return val.toLowerCase().includes('email hidden') || val === ''
}

async function parseParticipantFile(file: File): Promise<ParticipantRow[]> {
  const buffer = await file.arrayBuffer()

  // Detect delimiter: use semicolon if first line contains semicolons
  const preview = new TextDecoder().decode(buffer.slice(0, 500))
  const delimiter = preview.includes(';') ? ';' : ','

  const wb = XLSX.read(buffer, { type: 'array', FS: delimiter })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })

  if (rows.length === 0) return []

  // Map headers → our fields
  const headers = Object.keys(rows[0])
  const colMapping: Partial<Record<string, ParticipantField>> = {}
  for (const h of headers) {
    const mapped = COLUMN_MAP[normalise(h)]
    if (mapped) colMapping[h] = mapped
  }

  return rows
    .map((row) => {
      const p: ParticipantRow = {
        full_name: '',
        email: null,
        phone: '',
        linkedin: '',
        role: '',
        job_title: '',
        member_id: '',
        meetup_profile_url: '',
        rsvp_status: '',
      }
      for (const [header, field] of Object.entries(colMapping)) {
        if (!field) continue
        const val = String(row[header] ?? '').trim()
        if (field === 'email') {
          p.email = isHiddenEmail(val) ? null : val
        } else {
          (p as Record<string, unknown>)[field] = val
        }
      }
      return p
    })
    .filter((p) => p.full_name) // must have at least a name
}

// ─── main submit function ─────────────────────────────────────────────────────

export async function submitEvent(formData: EventFormData): Promise<void> {
  const agendaText = buildAgendaText(formData.agenda)
  const locationText = buildLocationText(formData.venue)
  const extrasText = buildExtrasText(formData.foodDrinks, formData.logistics)

  // Save event config
  const { error: configError } = await supabase.from('event_config').upsert({
    id: 1,
    agenda: agendaText,
    location: locationText,
    extras: extrasText,
    event_name: formData.basics.eventName,
    event_type: formData.basics.eventType,
    event_date: formData.basics.eventDate,
    start_time: formData.basics.startTime,
    end_time: formData.basics.endTime,
    timezone: formData.basics.timezone,
    expected_participants: formData.basics.expectedParticipants || null,
    language: formData.basics.language,
    description: formData.basics.description,
    venue_name: formData.venue.venueName,
    full_address: formData.venue.fullAddress,
    room_details: formData.venue.roomDetails,
    public_transport: formData.venue.publicTransport,
    parking: formData.venue.parking,
    accessibility: formData.venue.accessibility,
    check_in_instructions: formData.venue.checkInInstructions,
    wifi_info: formData.venue.wifiInfo,
    agenda_blocks: formData.agenda,
    food_drinks: formData.foodDrinks,
    logistics_info: formData.logistics,
    faqs: formData.faqs,
    config: formData,
    updated_at: new Date().toISOString(),
  })

  if (configError) throw new Error(`Failed to save event config: ${configError.message}`)

  // Parse and upsert participants from Excel/CSV
  if (formData.participantList?.file) {
    const participants = await parseParticipantFile(formData.participantList.file)

    if (participants.length > 0) {
      // Clear existing participants and re-insert fresh from the uploaded file
      await supabase.from('participants').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      const { error: participantsError } = await supabase
        .from('participants')
        .insert(participants)

      if (participantsError) {
        throw new Error(`Failed to save participants: ${participantsError.message}`)
      }
    }
  }
}
