/**
 * STUB: Team Organiser UI (Agent 2)
 *
 * TODO:
 * - Add a button that triggers POST /api/teams
 * - Display team assignments in a grid
 * - Show each team as a card: team name + members with roles
 * - Allow re-running if people drop out
 */
export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">🧩</div>
        <h1 className="text-3xl font-bold text-white mb-3">Team Organiser</h1>
        <p className="text-gray-400">
          Coming soon — team assignments will appear here once the team organiser agent is implemented.
        </p>
        <p className="text-gray-600 text-sm mt-4">
          See <code className="text-gray-400">app/teams/page.tsx</code> and{' '}
          <code className="text-gray-400">app/api/teams/route.ts</code> for implementation notes.
        </p>
      </div>
    </main>
  )
}
