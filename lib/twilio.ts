import twilio from 'twilio'

let _client: ReturnType<typeof twilio> | null = null

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) return null
  if (!_client) _client = twilio(sid, token)
  return _client
}

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const client = getClient()
  if (!client) { console.warn('[twilio] Twilio not configured, skipping WhatsApp to', to); return }
  const from = process.env.TWILIO_WHATSAPP_FROM!
  const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  await client.messages.create({ from, to: toWhatsApp, body })
}
