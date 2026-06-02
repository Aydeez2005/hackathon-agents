'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

type Status = 'loading' | 'success' | 'already' | 'error'

function ConfirmContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>('loading')
  const [name, setName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setErrorMsg('Invalid confirmation link.')
      setStatus('error')
      return
    }

    fetch(`/api/confirm?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setErrorMsg(data.message ?? 'Something went wrong.')
          setStatus('error')
          return
        }
        setName(data.data?.name ?? '')
        setStatus(data.message?.includes('already') ? 'already' : 'success')
      })
      .catch(() => {
        setErrorMsg('Network error. Please try again.')
        setStatus('error')
      })
  }, [token])

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400 text-lg">Confirming your attendance...</p>
      </main>
    )
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🚀</div>
          <h1 className="text-3xl font-bold text-white mb-3">You&apos;re confirmed!</h1>
          <p className="text-gray-400 text-lg">See you there, {name.split(' ')[0]}!</p>
        </div>
      </main>
    )
  }

  if (status === 'already') {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-3xl font-bold text-white mb-3">Already confirmed!</h1>
          <p className="text-gray-400 text-lg">You&apos;re all set, {name.split(' ')[0]}!</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">❌</div>
        <h1 className="text-3xl font-bold text-white mb-3">Link not valid</h1>
        <p className="text-gray-400">{errorMsg}</p>
      </div>
    </main>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading...</p>
      </main>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
