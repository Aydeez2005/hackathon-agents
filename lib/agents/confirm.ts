import type { AgentResult } from '@/lib/types'

export interface ConfirmDeps {
  findByToken: (token: string) => Promise<{ id: string; full_name: string; attendance_confirmed: boolean } | null>
  markConfirmed: (id: string) => Promise<void>
}

export async function confirmAttendance(token: string, deps: ConfirmDeps): Promise<AgentResult> {
  const participant = await deps.findByToken(token)

  if (!participant) {
    return { success: false, message: 'Confirmation link not found or expired.' }
  }

  if (participant.attendance_confirmed) {
    return { success: true, message: 'Already confirmed!', data: { name: participant.full_name } }
  }

  await deps.markConfirmed(participant.id)

  return {
    success: true,
    message: 'Attendance confirmed!',
    data: { name: participant.full_name },
  }
}
