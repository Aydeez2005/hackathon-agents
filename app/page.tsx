'use client'

import { QRCodeCanvas } from 'qrcode.react'

export default function Home() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  const checkinUrl = `${baseUrl}/checkin`

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Cursor x Antler Hackathon</h1>
        <p className="text-gray-400 text-lg">Scan to check in</p>
      </div>
      <div className="bg-white p-6 rounded-2xl">
        <QRCodeCanvas value={checkinUrl} size={220} />
      </div>
      <p className="text-gray-600 text-sm font-mono">{checkinUrl}</p>
      <div className="flex gap-4 mt-2 text-sm">
        <a href="/checkin" className="text-gray-400 hover:text-white transition underline">Check In</a>
        <span className="text-gray-700">|</span>
        <a href="/teams" className="text-gray-400 hover:text-white transition underline">Teams</a>
      </div>
    </main>
  )
}
