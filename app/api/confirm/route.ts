import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { confirmAttendance } from '@/lib/agents/confirm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, message: 'token is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const result = await confirmAttendance(token, {
      findByToken: async (t) => {
        const { data } = await supabase
          .from('participants')
          .select('id, full_name, attendance_confirmed')
          .eq('confirmation_token', t)
          .maybeSingle()
        return data ?? null
      },
      markConfirmed: async (id) => {
        await supabase
          .from('participants')
          .update({ attendance_confirmed: true })
          .eq('id', id)
      },
    })

    return NextResponse.json(result, { status: result.success ? 200 : 404 })
  } catch (err) {
    console.error('[confirm]', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
