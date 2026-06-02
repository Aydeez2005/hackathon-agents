import { randomUUID } from 'crypto'
import type { AgentResult, Participant, SendEmailFn, SendWhatsAppFn } from '@/lib/types'
import { reminderEmailContent, reminderWhatsAppContent } from '@/lib/messages'

export interface RemindersDeps {
  getUnconfirmedParticipants: () => Promise<Participant[]>
  saveConfirmationToken: (participantId: string, token: string) => Promise<void>
  sendEmail: SendEmailFn
  sendWhatsApp: SendWhatsAppFn
  baseUrl: string
}

export async function sendReminders(deps: RemindersDeps): Promise<AgentResult> {
  const participants = await deps.getUnconfirmedParticipants()

  if (participants.length === 0) {
    return { success: true, message: 'No unconfirmed participants.', data: { sent: 0 } }
  }

  let sent = 0

  await Promise.allSettled(
    participants.map(async (participant) => {
      const token = randomUUID()
      await deps.saveConfirmationToken(participant.id, token)

      const magicLink = `${deps.baseUrl}/confirm?token=${token}`
      const { subject, html } = reminderEmailContent(participant, magicLink)
      const whatsappBody = reminderWhatsAppContent(participant, magicLink)

      await Promise.allSettled([
        deps.sendEmail(participant.email, subject, html),
        deps.sendWhatsApp(participant.phone, whatsappBody),
      ])

      sent++
    })
  )

  return {
    success: true,
    message: `Reminders sent to ${sent} participant(s).`,
    data: { sent },
  }
}
