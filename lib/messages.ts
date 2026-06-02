import type { Participant, EventConfig } from '@/lib/types'

function firstName(p: Participant): string {
  return p.full_name.split(' ')[0]
}

export function briefingEmailContent(
  participant: Participant,
  config: EventConfig
): { subject: string; html: string } {
  const name = firstName(participant)
  return {
    subject: "You're checked in! Here's your event briefing",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="color:#111;">Hey ${name}, you're in! 🎉</h1>
        <p>Welcome to the <strong>Cursor x Antler Hackathon</strong>. Here's everything you need for tonight.</p>
        <h2 style="color:#333;margin-top:32px;">Agenda</h2>
        <pre style="background:#f5f5f5;padding:16px;border-radius:8px;white-space:pre-wrap;">${config.agenda}</pre>
        <h2 style="color:#333;margin-top:32px;">Location & Getting Around</h2>
        <p>${config.location}</p>
        <h2 style="color:#333;margin-top:32px;">Food, Drinks & Prizes</h2>
        <p>${config.extras}</p>
        <p style="margin-top:40px;color:#888;font-size:14px;">Good luck and have fun!</p>
      </div>
    `,
  }
}

export function briefingWhatsAppContent(participant: Participant, config: EventConfig): string {
  const name = firstName(participant)
  return [
    `Hey ${name}, you're checked in! 🎉`,
    '',
    `*Cursor x Antler Hackathon — Tonight's Agenda*`,
    config.agenda,
    '',
    `*Location & Getting Around*`,
    config.location,
    '',
    `*Food, Drinks & Prizes*`,
    config.extras,
    '',
    `Good luck and have fun!`,
  ].join('\n')
}

export function reminderEmailContent(
  participant: Participant,
  magicLink: string
): { subject: string; html: string } {
  const name = firstName(participant)
  return {
    subject: 'Confirm your spot at the Cursor x Antler Hackathon',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="color:#111;">Hey ${name}!</h1>
        <p>You're registered for the <strong>Cursor x Antler Hackathon</strong>.</p>
        <p>Please confirm your attendance so we can plan for you:</p>
        <a href="${magicLink}" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">
          Confirm my spot
        </a>
        <p style="margin-top:32px;color:#888;font-size:14px;">If the button doesn't work: ${magicLink}</p>
      </div>
    `,
  }
}

export function reminderWhatsAppContent(participant: Participant, magicLink: string): string {
  const name = firstName(participant)
  return [
    `Hey ${name}! You're registered for the *Cursor x Antler Hackathon* 🚀`,
    '',
    `Confirm your attendance here:`,
    magicLink,
    '',
    `See you soon!`,
  ].join('\n')
}
