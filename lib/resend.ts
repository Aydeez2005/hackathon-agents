import { Resend } from 'resend'

let _client: Resend | null = null

function getClient(): Resend {
  if (!_client) {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error('Missing RESEND_API_KEY')
    _client = new Resend(key)
  }
  return _client
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL
  if (!from) throw new Error('Missing RESEND_FROM_EMAIL')
  const { error } = await getClient().emails.send({ from, to, subject, html })
  if (error) throw new Error(`Resend error: ${error.message}`)
}
