import type { AgentResult, EventConfig, Participant, SendEmailFn, SendWhatsAppFn } from '@/lib/types'
import { briefingEmailContent, briefingWhatsAppContent } from '@/lib/messages'

export interface CheckinDeps {
  findParticipant: (query: string) => Promise<Participant | null>
  updateCheckedIn: (id: string) => Promise<void>
  getEventConfig: () => Promise<EventConfig>
  sendEmail: SendEmailFn
  sendWhatsApp: SendWhatsAppFn
}

export async function checkInParticipant(query: string, deps: CheckinDeps): Promise<AgentResult> {
  const participant = await deps.findParticipant(query)

  if (!participant) {
    return { success: false, message: 'Participant not found. Check your email or ask at the desk.' }
  }

  if (participant.checked_in) {
    return { success: true, message: 'Already checked in!', data: { name: participant.full_name } }
  }

  await deps.updateCheckedIn(participant.id)

  const config = await deps.getEventConfig()
  const { subject, html } = briefingEmailContent(participant, config)
  const whatsappBody = briefingWhatsAppContent(participant, config)

  await Promise.allSettled([
    deps.sendEmail(participant.email, subject, html),
    deps.sendWhatsApp(participant.phone, whatsappBody),
  ])

  return {
    success: true,
    message: 'Checked in successfully!',
    data: { name: participant.full_name },
  }
}
