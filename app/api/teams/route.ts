import { NextResponse } from 'next/server'

/**
 * STUB: Team Organiser Agent (Agent 2)
 *
 * TODO:
 * 1. Fetch all participants from Supabase
 * 2. Group by role into balanced teams of 4 (developer, founder, marketing, wildcard)
 * 3. Handle uneven numbers by redistributing
 * 4. Write team_id back to each participant row
 * 5. Return team assignments
 *
 * Supabase query:
 *   const { data } = await supabase.from('participants').select('id, full_name, role, team_id')
 *
 * Update:
 *   await supabase.from('participants').update({ team_id: 'team-1' }).eq('id', participantId)
 */
export async function POST() {
  return NextResponse.json(
    { success: false, message: 'Team organiser not yet implemented.' },
    { status: 501 }
  )
}
