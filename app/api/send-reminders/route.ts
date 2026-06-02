import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'
import { sendWhatsApp } from '@/lib/twilio'
import { sendReminders } from '@/lib/agents/reminders'

export async function POST() {
  try {
    const supabase = createSupabaseServerClient()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

    const result = await sendReminders({
      getUnconfirmedParticipants: async () => {
        const { data } = await supabase
          .from('participants')
          .select('*')
          .eq('attendance_confirmed', false)
        return data ?? []
      },
      saveConfirmationToken: async (participantId, token) => {
        await supabase
          .from('participants')
          .update({ confirmation_token: token })
          .eq('id', participantId)
      },
      sendEmail,
      sendWhatsApp,
      baseUrl,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[send-reminders]', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
