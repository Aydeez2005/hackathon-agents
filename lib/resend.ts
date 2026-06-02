import { Resend } from 'resend'

let _client: Resend | null = null

function getClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY)
  return _client
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const client = getClient()
  if (!client) { console.warn('[resend] RESEND_API_KEY not set, skipping email to', to); return }
  const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@example.com'
  const { error } = await client.emails.send({ from, to, subject, html })
  if (error) throw new Error(`Resend error: ${error.message}`)
}
