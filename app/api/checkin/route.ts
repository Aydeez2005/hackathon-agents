import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'
import { sendWhatsApp } from '@/lib/twilio'
import { checkInParticipant } from '@/lib/agents/checkin'

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, message: 'query is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const result = await checkInParticipant(query.trim(), {
      findParticipant: async (q) => {
        // Try exact email match first, then partial name match
        const { data: byEmail } = await supabase
          .from('participants')
          .select('*')
          .eq('email', q)
          .maybeSingle()
        if (byEmail) return byEmail

        // Partial case-insensitive name match — returns closest first
        const { data: byName } = await supabase
          .from('participants')
          .select('*')
          .ilike('full_name', `%${q}%`)
          .limit(1)
          .maybeSingle()
        return byName ?? null
      },
      updateCheckedIn: async (id) => {
        await supabase
          .from('participants')
          .update({ checked_in: true, checked_in_at: new Date().toISOString() })
          .eq('id', id)
      },
      getEventConfig: async () => {
        const { data } = await supabase.from('event_config').select('*').eq('id', 1).single()
        return data
      },
      sendEmail,
      sendWhatsApp,
    })

    return NextResponse.json(result, { status: result.success ? 200 : 404 })
  } catch (err) {
    console.error('[checkin]', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
