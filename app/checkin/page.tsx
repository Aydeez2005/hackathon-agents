'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'already' | 'error'

export default function CheckInPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [name, setName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setStatus('loading')

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.message ?? 'Something went wrong.')
        setStatus('error')
        return
      }

      setName(data.data?.name ?? '')
      setStatus(data.message?.includes('already') ? 'already' : 'success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-3">You&apos;re checked in!</h1>
          <p className="text-gray-400 text-lg">
            Hey {name.split(' ')[0]}, your briefing has been sent to your phone and email.
          </p>
        </div>
      </main>
    )
  }

  if (status === 'already') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-white mb-3">Already checked in!</h1>
          <p className="text-gray-400 text-lg">Welcome back, {name.split(' ')[0]}. Enjoy the hackathon!</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Check In</h1>
          <p className="text-gray-400">Enter your name or email</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Your name or email"
            className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white border border-gray-700 focus:border-white focus:outline-none text-lg placeholder:text-gray-600"
            disabled={status === 'loading'}
            autoFocus
          />
          {status === 'error' && (
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading' || !query.trim()}
            className="w-full py-3 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Checking in...' : 'Check In'}
          </button>
        </form>
      </div>
    </main>
  )
}
