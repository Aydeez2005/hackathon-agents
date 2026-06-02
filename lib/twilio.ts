import twilio from 'twilio'

let _client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (!_client) {
    const sid = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    if (!sid || !token) throw new Error('Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN')
    _client = twilio(sid, token)
  }
  return _client
}

export async function sendWhatsApp(to: string, body: string): Promise<void> {
  const from = process.env.TWILIO_WHATSAPP_FROM
  if (!from) throw new Error('Missing TWILIO_WHATSAPP_FROM')
  const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
  await getClient().messages.create({ from, to: toWhatsApp, body })
}
