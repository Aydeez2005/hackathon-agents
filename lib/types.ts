export interface Participant {
  id: string
  full_name: string
  email: string
  phone: string
  linkedin: string | null
  role: string
  attendance_confirmed: boolean
  checked_in: boolean
  checked_in_at: string | null
  confirmation_token: string | null
  team_id: string | null
  created_at: string
}

export interface EventConfig {
  id: number
  agenda: string
  location: string
  extras: string
  updated_at: string
}

export interface AgentResult {
  success: boolean
  message: string
  data?: Record<string, unknown>
}

export type SendEmailFn = (to: string, subject: string, html: string) => Promise<void>
export type SendWhatsAppFn = (to: string, body: string) => Promise<void>
