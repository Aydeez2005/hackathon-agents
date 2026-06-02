# Hackathon Agents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js app with a QR-based check-in agent, attendance confirmation agent, and a team organiser stub, backed by Supabase and delivering briefings via Resend (email) + Twilio (WhatsApp).

**Architecture:** Business logic lives in `lib/agents/` as pure dependency-injected functions, making them fully testable without HTTP. API routes in `app/api/` are thin wrappers that wire real deps. UI pages are minimal Tailwind forms/screens.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase, Resend, Twilio, Jest + ts-jest

---

## File Map

| File | Purpose |
|---|---|
| `lib/types.ts` | Shared TypeScript interfaces (Participant, EventConfig, AgentResult) |
| `lib/supabase.ts` | Supabase server client factory |
| `lib/messages.ts` | Pure template functions: briefing email/WA, reminder email/WA |
| `lib/resend.ts` | Thin wrapper: sendEmail(to, subject, html) |
| `lib/twilio.ts` | Thin wrapper: sendWhatsApp(to, body) |
| `lib/agents/checkin.ts` | checkInParticipant(query, deps) — Agent 1 logic |
| `lib/agents/reminders.ts` | sendReminders(deps) — Agent 3 reminder logic |
| `lib/agents/confirm.ts` | confirmAttendance(token, deps) — Agent 3 confirm logic |
| `app/api/checkin/route.ts` | POST /api/checkin |
| `app/api/send-reminders/route.ts` | POST /api/send-reminders |
| `app/api/confirm/route.ts` | GET /api/confirm?token= |
| `app/api/teams/route.ts` | POST /api/teams (stub) |
| `app/checkin/page.tsx` | Check-in form UI |
| `app/confirm/page.tsx` | Magic link confirmation UI |
| `app/teams/page.tsx` | Team organiser stub UI |
| `app/page.tsx` | Root page with QR code display |
| `app/layout.tsx` | Root layout |
| `supabase/schema.sql` | Full DB schema for sharing with landing page team |
| `.env.example` | All required env var keys |
| `jest.config.ts` | Jest config with ts-jest |
| `__tests__/lib/messages.test.ts` | Tests for message templates |
| `__tests__/lib/agents/checkin.test.ts` | Tests for check-in agent |
| `__tests__/lib/agents/reminders.test.ts` | Tests for reminders agent |
| `__tests__/lib/agents/confirm.test.ts` | Tests for confirm agent |

---

## Task 1: Bootstrap Next.js project

**Files:**
- Create: `package.json`, `next.config.js`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.js`
- Create: `jest.config.ts`
- Create: `.env.example`

- [ ] **Step 1: Initialize Next.js inside existing repo**

From the repo root:
```bash
cd "/Users/alice/Desktop/develop/Hackathon/Cursor x Antler/hackathon-agents"
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```
If it asks about overwriting README.md, say yes. The docs/ folder will be preserved.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install @supabase/supabase-js resend twilio qrcode.react
npm install --save-dev jest @types/jest ts-jest jest-environment-node @types/node
```

- [ ] **Step 3: Create jest.config.ts**

```typescript
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react' } }],
  },
}

export default config
```

- [ ] **Step 4: Add test script to package.json**

Open `package.json` and ensure `scripts` includes:
```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 5: Create .env.example**

```bash
cat > .env.example << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend (email)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=hackathon@yourdomain.com

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF
```

- [ ] **Step 6: Verify dev server starts**

```bash
npm run dev
```
Expected: server starts on http://localhost:3000 with no errors. Ctrl+C to stop.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Next.js project with deps and Jest config"
```

---

## Task 2: Supabase schema + shared types

**Files:**
- Create: `supabase/schema.sql`
- Create: `lib/types.ts`

- [ ] **Step 1: Create supabase/schema.sql**

```bash
mkdir -p supabase
```

Create `supabase/schema.sql`:
```sql
-- Run this in your Supabase SQL editor to set up the database.
-- Share this file with the landing page team so they use the same schema.

create extension if not exists "pgcrypto";

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text unique not null,
  phone text not null,
  linkedin text,
  role text not null,
  attendance_confirmed boolean not null default false,
  checked_in boolean not null default false,
  checked_in_at timestamptz,
  confirmation_token uuid unique,
  team_id text,
  created_at timestamptz not null default now()
);

create table if not exists event_config (
  id int primary key default 1,
  agenda text not null default '',
  location text not null default '',
  extras text not null default '',
  updated_at timestamptz not null default now()
);

-- Ensure only one event_config row exists
create unique index if not exists event_config_singleton on event_config ((id));

-- Insert default event config row if not present
insert into event_config (id, agenda, location, extras)
values (1, '', '', '')
on conflict (id) do nothing;
```

- [ ] **Step 2: Create lib/types.ts**

```typescript
export interface Participant {
  id: string
  full_name: string
  email: string
  phone: string
  linkedin: string | null
  role: string
  attendance_confirmed: boolean
  checked_in: boolean
  checked_in_at: string | null
  confirmation_token: string | null
  team_id: string | null
  created_at: string
}

export interface EventConfig {
  id: number
  agenda: string
  location: string
  extras: string
  updated_at: string
}

export interface AgentResult {
  success: boolean
  message: string
  data?: Record<string, unknown>
}

export interface SendEmailFn {
  (to: string, subject: string, html: string): Promise<void>
}

export interface SendWhatsAppFn {
  (to: string, body: string): Promise<void>
}
```

- [ ] **Step 3: Commit**

```bash
git add supabase/schema.sql lib/types.ts
git commit -m "feat: add Supabase schema and shared TypeScript types"
```

---

## Task 3: Supabase client

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Step 1: Create lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

export function createSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  return createClient(url, key)
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/supabase.ts
git commit -m "feat: add Supabase server client"
```

---

## Task 4: Message templates

**Files:**
- Create: `lib/messages.ts`
- Create: `__tests__/lib/messages.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/messages.test.ts`:
```typescript
import {
  briefingEmailContent,
  briefingWhatsAppContent,
  reminderEmailContent,
  reminderWhatsAppContent,
} from '@/lib/messages'
import type { Participant, EventConfig } from '@/lib/types'

const participant: Participant = {
  id: 'abc',
  full_name: 'Alice Zhai',
  email: 'alice@example.com',
  phone: '+491234567890',
  linkedin: null,
  role: 'developer',
  attendance_confirmed: false,
  checked_in: false,
  checked_in_at: null,
  confirmation_token: null,
  team_id: null,
  created_at: new Date().toISOString(),
}

const config: EventConfig = {
  id: 1,
  agenda: '18:00 Doors open\n19:00 Keynote\n20:00 Hacking begins',
  location: 'TU Berlin, Main Hall, Room 101. Toilets on the left.',
  extras: 'Free pizza and drinks. Prizes: 1st place €5000 cash.',
  updated_at: new Date().toISOString(),
}

describe('briefingEmailContent', () => {
  it('includes participant first name', () => {
    const { html } = briefingEmailContent(participant, config)
    expect(html).toContain('Alice')
  })

  it('includes agenda', () => {
    const { html } = briefingEmailContent(participant, config)
    expect(html).toContain('18:00 Doors open')
  })

  it('includes location', () => {
    const { html } = briefingEmailContent(participant, config)
    expect(html).toContain('TU Berlin')
  })

  it('includes extras', () => {
    const { html } = briefingEmailContent(participant, config)
    expect(html).toContain('pizza')
  })

  it('returns a subject', () => {
    const { subject } = briefingEmailContent(participant, config)
    expect(subject.length).toBeGreaterThan(0)
  })
})

describe('briefingWhatsAppContent', () => {
  it('includes participant first name', () => {
    const msg = briefingWhatsAppContent(participant, config)
    expect(msg).toContain('Alice')
  })

  it('includes agenda', () => {
    const msg = briefingWhatsAppContent(participant, config)
    expect(msg).toContain('18:00 Doors open')
  })
})

describe('reminderEmailContent', () => {
  it('includes magic link', () => {
    const { html } = reminderEmailContent(participant, 'https://app.com/confirm?token=abc')
    expect(html).toContain('https://app.com/confirm?token=abc')
  })

  it('includes participant first name', () => {
    const { html } = reminderEmailContent(participant, 'https://app.com/confirm?token=abc')
    expect(html).toContain('Alice')
  })
})

describe('reminderWhatsAppContent', () => {
  it('includes magic link', () => {
    const msg = reminderWhatsAppContent(participant, 'https://app.com/confirm?token=abc')
    expect(msg).toContain('https://app.com/confirm?token=abc')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest __tests__/lib/messages.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '@/lib/messages'`

- [ ] **Step 3: Create lib/messages.ts**

```typescript
import type { Participant, EventConfig } from '@/lib/types'

function firstName(participant: Participant): string {
  return participant.full_name.split(' ')[0]
}

export function briefingEmailContent(
  participant: Participant,
  config: EventConfig
): { subject: string; html: string } {
  const name = firstName(participant)
  return {
    subject: "You're checked in! Here's your event briefing",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #111;">Hey ${name}, you're in!</h1>
        <p>Welcome to the <strong>Cursor x Antler Hackathon</strong>. Here's everything you need for tonight.</p>

        <h2 style="color: #333; margin-top: 32px;">Agenda</h2>
        <pre style="background: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${config.agenda}</pre>

        <h2 style="color: #333; margin-top: 32px;">Location & Getting Around</h2>
        <p>${config.location}</p>

        <h2 style="color: #333; margin-top: 32px;">Food, Drinks & Prizes</h2>
        <p>${config.extras}</p>

        <p style="margin-top: 40px; color: #888; font-size: 14px;">Good luck and have fun!</p>
      </div>
    `,
  }
}

export function briefingWhatsAppContent(
  participant: Participant,
  config: EventConfig
): string {
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
    subject: "Confirm your spot at the Cursor x Antler Hackathon",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #111;">Hey ${name}!</h1>
        <p>You're registered for the <strong>Cursor x Antler Hackathon</strong>.</p>
        <p>Please confirm your attendance so we can plan for you:</p>
        <a href="${magicLink}" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #000; color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Confirm my spot
        </a>
        <p style="margin-top: 32px; color: #888; font-size: 14px;">
          If the button doesn't work, copy this link: ${magicLink}
        </p>
      </div>
    `,
  }
}

export function reminderWhatsAppContent(
  participant: Participant,
  magicLink: string
): string {
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
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest __tests__/lib/messages.test.ts --no-coverage
```
Expected: PASS — 9 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/messages.ts __tests__/lib/messages.test.ts
git commit -m "feat: add message templates with tests"
```

---

## Task 5: Resend email helper

**Files:**
- Create: `lib/resend.ts`

- [ ] **Step 1: Create lib/resend.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add lib/resend.ts
git commit -m "feat: add Resend email helper"
```

---

## Task 6: Twilio WhatsApp helper

**Files:**
- Create: `lib/twilio.ts`

- [ ] **Step 1: Create lib/twilio.ts**

```typescript
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

  // Ensure E.164 number is prefixed for WhatsApp
  const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`

  await getClient().messages.create({ from, to: toWhatsApp, body })
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/twilio.ts
git commit -m "feat: add Twilio WhatsApp helper"
```

---

## Task 7: Check-in agent + tests

**Files:**
- Create: `lib/agents/checkin.ts`
- Create: `__tests__/lib/agents/checkin.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/agents/checkin.test.ts`:
```typescript
import { checkInParticipant } from '@/lib/agents/checkin'
import type { Participant, EventConfig, SendEmailFn, SendWhatsAppFn } from '@/lib/types'

const mockParticipant: Participant = {
  id: 'p1',
  full_name: 'Alice Zhai',
  email: 'alice@example.com',
  phone: '+491234567890',
  linkedin: null,
  role: 'developer',
  attendance_confirmed: true,
  checked_in: false,
  checked_in_at: null,
  confirmation_token: null,
  team_id: null,
  created_at: new Date().toISOString(),
}

const mockConfig: EventConfig = {
  id: 1,
  agenda: '18:00 Doors open',
  location: 'Main Hall',
  extras: 'Free pizza',
  updated_at: new Date().toISOString(),
}

function makeDeps(overrides: Partial<{
  participant: Participant | null
  config: EventConfig
  sendEmail: SendEmailFn
  sendWhatsApp: SendWhatsAppFn
}> = {}) {
  const participant = 'participant' in overrides ? overrides.participant : mockParticipant
  const config = overrides.config ?? mockConfig

  return {
    findParticipant: jest.fn().mockResolvedValue(participant),
    updateCheckedIn: jest.fn().mockResolvedValue(undefined),
    getEventConfig: jest.fn().mockResolvedValue(config),
    sendEmail: overrides.sendEmail ?? jest.fn().mockResolvedValue(undefined),
    sendWhatsApp: overrides.sendWhatsApp ?? jest.fn().mockResolvedValue(undefined),
  }
}

describe('checkInParticipant', () => {
  it('returns 404 result when participant not found', async () => {
    const deps = makeDeps({ participant: null })
    const result = await checkInParticipant('unknown@example.com', deps)
    expect(result.success).toBe(false)
    expect(result.message).toContain('not found')
  })

  it('marks participant as checked in', async () => {
    const deps = makeDeps()
    await checkInParticipant('alice@example.com', deps)
    expect(deps.updateCheckedIn).toHaveBeenCalledWith('p1')
  })

  it('sends briefing email', async () => {
    const deps = makeDeps()
    await checkInParticipant('alice@example.com', deps)
    expect(deps.sendEmail).toHaveBeenCalledWith(
      'alice@example.com',
      expect.any(String),
      expect.stringContaining('Alice')
    )
  })

  it('sends briefing WhatsApp', async () => {
    const deps = makeDeps()
    await checkInParticipant('alice@example.com', deps)
    expect(deps.sendWhatsApp).toHaveBeenCalledWith(
      '+491234567890',
      expect.stringContaining('Alice')
    )
  })

  it('returns success with participant name', async () => {
    const deps = makeDeps()
    const result = await checkInParticipant('alice@example.com', deps)
    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Alice Zhai')
  })

  it('is idempotent: returns success without re-updating if already checked in', async () => {
    const alreadyIn = { ...mockParticipant, checked_in: true }
    const deps = makeDeps({ participant: alreadyIn })
    const result = await checkInParticipant('alice@example.com', deps)
    expect(result.success).toBe(true)
    expect(result.message).toContain('already')
    expect(deps.updateCheckedIn).not.toHaveBeenCalled()
  })

  it('succeeds even if messaging throws', async () => {
    const deps = makeDeps({
      sendEmail: jest.fn().mockRejectedValue(new Error('Resend down')),
      sendWhatsApp: jest.fn().mockRejectedValue(new Error('Twilio down')),
    })
    const result = await checkInParticipant('alice@example.com', deps)
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest __tests__/lib/agents/checkin.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '@/lib/agents/checkin'`

- [ ] **Step 3: Create lib/agents/checkin.ts**

```typescript
import type { AgentResult, EventConfig, Participant, SendEmailFn, SendWhatsAppFn } from '@/lib/types'
import { briefingEmailContent, briefingWhatsAppContent } from '@/lib/messages'

export interface CheckinDeps {
  findParticipant: (query: string) => Promise<Participant | null>
  updateCheckedIn: (id: string) => Promise<void>
  getEventConfig: () => Promise<EventConfig>
  sendEmail: SendEmailFn
  sendWhatsApp: SendWhatsAppFn
}

export async function checkInParticipant(
  query: string,
  deps: CheckinDeps
): Promise<AgentResult> {
  const participant = await deps.findParticipant(query)

  if (!participant) {
    return { success: false, message: 'Participant not found. Check your email or ask at the desk.' }
  }

  if (participant.checked_in) {
    return { success: true, message: 'Already checked in!', data: { name: participant.full_name } }
  }

  await deps.updateCheckedIn(participant.id)

  const config = await deps.getEventConfig()
  const { subject, html } = briefingEmailContent(participant, config)
  const whatsappBody = briefingWhatsAppContent(participant, config)

  // Fire messages — failures don't block check-in
  await Promise.allSettled([
    deps.sendEmail(participant.email, subject, html),
    deps.sendWhatsApp(participant.phone, whatsappBody),
  ])

  return {
    success: true,
    message: `Checked in successfully!`,
    data: { name: participant.full_name },
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest __tests__/lib/agents/checkin.test.ts --no-coverage
```
Expected: PASS — 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/agents/checkin.ts __tests__/lib/agents/checkin.test.ts
git commit -m "feat: add check-in agent with tests"
```

---

## Task 8: Reminders agent + tests

**Files:**
- Create: `lib/agents/reminders.ts`
- Create: `__tests__/lib/agents/reminders.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/agents/reminders.test.ts`:
```typescript
import { sendReminders } from '@/lib/agents/reminders'
import type { Participant, SendEmailFn, SendWhatsAppFn } from '@/lib/types'

const makeParticipant = (id: string, name: string): Participant => ({
  id,
  full_name: name,
  email: `${id}@example.com`,
  phone: '+491234567890',
  linkedin: null,
  role: 'developer',
  attendance_confirmed: false,
  checked_in: false,
  checked_in_at: null,
  confirmation_token: null,
  team_id: null,
  created_at: new Date().toISOString(),
})

function makeDeps(participants: Participant[] = [makeParticipant('p1', 'Alice Zhai')]) {
  return {
    getUnconfirmedParticipants: jest.fn().mockResolvedValue(participants),
    saveConfirmationToken: jest.fn().mockResolvedValue(undefined),
    sendEmail: jest.fn().mockResolvedValue(undefined) as SendEmailFn,
    sendWhatsApp: jest.fn().mockResolvedValue(undefined) as SendWhatsAppFn,
    baseUrl: 'https://app.com',
  }
}

describe('sendReminders', () => {
  it('returns count of messages sent', async () => {
    const deps = makeDeps([makeParticipant('p1', 'Alice'), makeParticipant('p2', 'Bob')])
    const result = await sendReminders(deps)
    expect(result.success).toBe(true)
    expect(result.data?.sent).toBe(2)
  })

  it('saves a confirmation token per participant', async () => {
    const deps = makeDeps()
    await sendReminders(deps)
    expect(deps.saveConfirmationToken).toHaveBeenCalledTimes(1)
    expect(deps.saveConfirmationToken).toHaveBeenCalledWith('p1', expect.any(String))
  })

  it('sends email with magic link', async () => {
    const deps = makeDeps()
    await sendReminders(deps)
    expect(deps.sendEmail).toHaveBeenCalledWith(
      'p1@example.com',
      expect.any(String),
      expect.stringContaining('https://app.com/confirm?token=')
    )
  })

  it('sends WhatsApp with magic link', async () => {
    const deps = makeDeps()
    await sendReminders(deps)
    expect(deps.sendWhatsApp).toHaveBeenCalledWith(
      '+491234567890',
      expect.stringContaining('https://app.com/confirm?token=')
    )
  })

  it('returns 0 sent when no unconfirmed participants', async () => {
    const deps = makeDeps([])
    const result = await sendReminders(deps)
    expect(result.success).toBe(true)
    expect(result.data?.sent).toBe(0)
  })

  it('continues sending to other participants if one message fails', async () => {
    const participants = [makeParticipant('p1', 'Alice'), makeParticipant('p2', 'Bob')]
    const deps = makeDeps(participants)
    deps.sendEmail = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue(undefined)
    const result = await sendReminders(deps)
    expect(result.success).toBe(true)
    expect(result.data?.sent).toBe(2)
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest __tests__/lib/agents/reminders.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '@/lib/agents/reminders'`

- [ ] **Step 3: Create lib/agents/reminders.ts**

```typescript
import { randomUUID } from 'crypto'
import type { AgentResult, Participant, SendEmailFn, SendWhatsAppFn } from '@/lib/types'
import { reminderEmailContent, reminderWhatsAppContent } from '@/lib/messages'

export interface RemindersDeps {
  getUnconfirmedParticipants: () => Promise<Participant[]>
  saveConfirmationToken: (participantId: string, token: string) => Promise<void>
  sendEmail: SendEmailFn
  sendWhatsApp: SendWhatsAppFn
  baseUrl: string
}

export async function sendReminders(deps: RemindersDeps): Promise<AgentResult> {
  const participants = await deps.getUnconfirmedParticipants()

  if (participants.length === 0) {
    return { success: true, message: 'No unconfirmed participants.', data: { sent: 0 } }
  }

  let sent = 0

  await Promise.allSettled(
    participants.map(async (participant) => {
      const token = randomUUID()
      await deps.saveConfirmationToken(participant.id, token)

      const magicLink = `${deps.baseUrl}/confirm?token=${token}`
      const { subject, html } = reminderEmailContent(participant, magicLink)
      const whatsappBody = reminderWhatsAppContent(participant, magicLink)

      await Promise.allSettled([
        deps.sendEmail(participant.email, subject, html),
        deps.sendWhatsApp(participant.phone, whatsappBody),
      ])

      sent++
    })
  )

  return {
    success: true,
    message: `Reminders sent to ${sent} participant(s).`,
    data: { sent },
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest __tests__/lib/agents/reminders.test.ts --no-coverage
```
Expected: PASS — 6 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/agents/reminders.ts __tests__/lib/agents/reminders.test.ts
git commit -m "feat: add reminders agent with tests"
```

---

## Task 9: Confirm agent + tests

**Files:**
- Create: `lib/agents/confirm.ts`
- Create: `__tests__/lib/agents/confirm.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/lib/agents/confirm.test.ts`:
```typescript
import { confirmAttendance } from '@/lib/agents/confirm'
import type { Participant } from '@/lib/types'

const mockParticipant: Participant = {
  id: 'p1',
  full_name: 'Alice Zhai',
  email: 'alice@example.com',
  phone: '+491234567890',
  linkedin: null,
  role: 'developer',
  attendance_confirmed: false,
  checked_in: false,
  checked_in_at: null,
  confirmation_token: 'token-abc',
  team_id: null,
  created_at: new Date().toISOString(),
}

function makeDeps(participant: Participant | null = mockParticipant) {
  return {
    findByToken: jest.fn().mockResolvedValue(participant),
    markConfirmed: jest.fn().mockResolvedValue(undefined),
  }
}

describe('confirmAttendance', () => {
  it('returns not found for invalid token', async () => {
    const deps = makeDeps(null)
    const result = await confirmAttendance('bad-token', deps)
    expect(result.success).toBe(false)
    expect(result.message).toContain('not found')
  })

  it('marks participant as confirmed', async () => {
    const deps = makeDeps()
    await confirmAttendance('token-abc', deps)
    expect(deps.markConfirmed).toHaveBeenCalledWith('p1')
  })

  it('returns success with participant name', async () => {
    const deps = makeDeps()
    const result = await confirmAttendance('token-abc', deps)
    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Alice Zhai')
  })

  it('is idempotent: returns success without re-marking if already confirmed', async () => {
    const alreadyConfirmed = { ...mockParticipant, attendance_confirmed: true }
    const deps = makeDeps(alreadyConfirmed)
    const result = await confirmAttendance('token-abc', deps)
    expect(result.success).toBe(true)
    expect(result.message).toContain('already')
    expect(deps.markConfirmed).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx jest __tests__/lib/agents/confirm.test.ts --no-coverage
```
Expected: FAIL — `Cannot find module '@/lib/agents/confirm'`

- [ ] **Step 3: Create lib/agents/confirm.ts**

```typescript
import type { AgentResult } from '@/lib/types'

export interface ConfirmDeps {
  findByToken: (token: string) => Promise<{ id: string; full_name: string; attendance_confirmed: boolean } | null>
  markConfirmed: (id: string) => Promise<void>
}

export async function confirmAttendance(token: string, deps: ConfirmDeps): Promise<AgentResult> {
  const participant = await deps.findByToken(token)

  if (!participant) {
    return { success: false, message: 'Confirmation link not found or expired.' }
  }

  if (participant.attendance_confirmed) {
    return { success: true, message: 'Already confirmed!', data: { name: participant.full_name } }
  }

  await deps.markConfirmed(participant.id)

  return {
    success: true,
    message: 'Attendance confirmed!',
    data: { name: participant.full_name },
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npx jest __tests__/lib/agents/confirm.test.ts --no-coverage
```
Expected: PASS — 4 tests pass

- [ ] **Step 5: Run all tests**

```bash
npx jest --no-coverage
```
Expected: PASS — all tests pass across messages, checkin, reminders, confirm

- [ ] **Step 6: Commit**

```bash
git add lib/agents/confirm.ts __tests__/lib/agents/confirm.test.ts
git commit -m "feat: add confirm agent with tests"
```

---

## Task 10: API routes

**Files:**
- Create: `app/api/checkin/route.ts`
- Create: `app/api/send-reminders/route.ts`
- Create: `app/api/confirm/route.ts`
- Create: `app/api/teams/route.ts`

- [ ] **Step 1: Create app/api/checkin/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'
import { sendWhatsApp } from '@/lib/twilio'
import { checkInParticipant } from '@/lib/agents/checkin'

export async function POST(request: Request) {
  try {
    const { query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ success: false, message: 'query is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const result = await checkInParticipant(query.trim(), {
      findParticipant: async (q) => {
        const { data } = await supabase
          .from('participants')
          .select('*')
          .or(`email.eq.${q},full_name.ilike.${q}`)
          .single()
        return data ?? null
      },
      updateCheckedIn: async (id) => {
        await supabase
          .from('participants')
          .update({ checked_in: true, checked_in_at: new Date().toISOString() })
          .eq('id', id)
      },
      getEventConfig: async () => {
        const { data } = await supabase.from('event_config').select('*').eq('id', 1).single()
        return data
      },
      sendEmail,
      sendWhatsApp,
    })

    const status = result.success ? 200 : 404
    return NextResponse.json(result, { status })
  } catch (err) {
    console.error('[checkin]', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create app/api/send-reminders/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/resend'
import { sendWhatsApp } from '@/lib/twilio'
import { sendReminders } from '@/lib/agents/reminders'

export async function POST() {
  try {
    const supabase = createSupabaseServerClient()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

    const result = await sendReminders({
      getUnconfirmedParticipants: async () => {
        const { data } = await supabase
          .from('participants')
          .select('*')
          .eq('attendance_confirmed', false)
        return data ?? []
      },
      saveConfirmationToken: async (participantId, token) => {
        await supabase
          .from('participants')
          .update({ confirmation_token: token })
          .eq('id', participantId)
      },
      sendEmail,
      sendWhatsApp,
      baseUrl,
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[send-reminders]', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create app/api/confirm/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { confirmAttendance } from '@/lib/agents/confirm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, message: 'token is required' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const result = await confirmAttendance(token, {
      findByToken: async (t) => {
        const { data } = await supabase
          .from('participants')
          .select('id, full_name, attendance_confirmed')
          .eq('confirmation_token', t)
          .single()
        return data ?? null
      },
      markConfirmed: async (id) => {
        await supabase
          .from('participants')
          .update({ attendance_confirmed: true })
          .eq('id', id)
      },
    })

    const status = result.success ? 200 : 404
    return NextResponse.json(result, { status })
  } catch (err) {
    console.error('[confirm]', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create app/api/teams/route.ts (stub)**

```typescript
import { NextResponse } from 'next/server'

/**
 * STUB: Team Organiser Agent (Agent 2)
 *
 * TODO for the team organiser implementation:
 * 1. Fetch all participants from Supabase
 * 2. Group by role into balanced teams of 4 (1 developer, 1 founder, 1 marketing, 1 wildcard)
 * 3. Handle uneven numbers by redistributing roles to fill teams
 * 4. Write team_id back to each participant row in Supabase
 * 5. Return the full team assignments as JSON
 *
 * Suggested Supabase query:
 *   const { data } = await supabase.from('participants').select('id, full_name, role, team_id')
 *
 * Suggested update:
 *   await supabase.from('participants').update({ team_id: 'team-1' }).eq('id', participantId)
 */
export async function POST() {
  return NextResponse.json(
    { success: false, message: 'Team organiser not yet implemented.' },
    { status: 501 }
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/
git commit -m "feat: add API routes for checkin, reminders, confirm, and teams stub"
```

---

## Task 11: Check-in UI

**Files:**
- Create: `app/checkin/page.tsx`

- [ ] **Step 1: Create app/checkin/page.tsx**

```tsx
'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error' | 'already'

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
          <h1 className="text-3xl font-bold text-white mb-3">You're checked in!</h1>
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
          <p className="text-gray-400 text-lg">
            Welcome back, {name.split(' ')[0]}. Enjoy the hackathon!
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Check In</h1>
          <p className="text-gray-400">Enter your name or email to check in</p>
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
```

- [ ] **Step 2: Commit**

```bash
git add app/checkin/
git commit -m "feat: add check-in UI page"
```

---

## Task 12: Confirmation UI

**Files:**
- Create: `app/confirm/page.tsx`

- [ ] **Step 1: Create app/confirm/page.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

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
          <h1 className="text-3xl font-bold text-white mb-3">You're confirmed!</h1>
          <p className="text-gray-400 text-lg">
            See you there, {name.split(' ')[0]}!
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
          <h1 className="text-3xl font-bold text-white mb-3">Already confirmed!</h1>
          <p className="text-gray-400 text-lg">You're all set, {name.split(' ')[0]}!</p>
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
```

- [ ] **Step 2: Commit**

```bash
git add app/confirm/
git commit -m "feat: add attendance confirmation UI page"
```

---

## Task 13: Root page, teams stub UI, layout

**Files:**
- Modify: `app/page.tsx`
- Create: `app/teams/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cursor x Antler Hackathon',
  description: 'Hackathon management platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Update app/page.tsx (root — shows QR code for check-in)**

```tsx
'use client'

import QRCode from 'qrcode.react'

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? (
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  )
  const checkinUrl = `${baseUrl}/checkin`

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Cursor x Antler Hackathon</h1>
        <p className="text-gray-400 text-lg">Scan to check in</p>
      </div>

      <div className="bg-white p-6 rounded-2xl">
        <QRCode value={checkinUrl} size={220} />
      </div>

      <p className="text-gray-600 text-sm font-mono">{checkinUrl}</p>

      <div className="flex gap-4 mt-4 text-sm">
        <a href="/checkin" className="text-gray-400 hover:text-white transition underline">
          Check In
        </a>
        <span className="text-gray-700">|</span>
        <a href="/teams" className="text-gray-400 hover:text-white transition underline">
          Teams
        </a>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Create app/teams/page.tsx (stub)**

```tsx
/**
 * STUB: Team Organiser UI (Agent 2)
 *
 * TODO for the team organiser implementation:
 * - Add a button that triggers POST /api/teams
 * - Display the resulting team assignments in a grid
 * - Show each team as a card: team name + member list with roles
 * - Allow re-running team organisation if people drop out
 */
export default function TeamsPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">🧩</div>
        <h1 className="text-3xl font-bold text-white mb-3">Team Organiser</h1>
        <p className="text-gray-400">
          Coming soon — this page will display team assignments once the team organiser agent is implemented.
        </p>
        <p className="text-gray-600 text-sm mt-4">
          See <code className="text-gray-400">app/teams/page.tsx</code> and{' '}
          <code className="text-gray-400">app/api/teams/route.ts</code> for implementation notes.
        </p>
      </div>
    </main>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/teams/ app/layout.tsx
git commit -m "feat: add root QR page, teams stub UI, and layout"
```

---

## Task 14: Final check + push

- [ ] **Step 1: Run the full test suite**

```bash
npx jest --no-coverage
```
Expected: all tests pass

- [ ] **Step 2: Run build to catch TypeScript errors**

```bash
npm run build
```
Expected: build succeeds with no errors. Fix any type errors before continuing.

- [ ] **Step 3: Update README.md**

Replace the content of `README.md` with:
```markdown
# hackathon-agents

Cursor x Antler Hackathon Management Platform.

## Agents

| Agent | Status | Description |
|---|---|---|
| Check-in + Briefing | ✅ Ready | QR scan → check-in form → briefing via email + WhatsApp |
| Team Organiser | 🔧 Stub | Grouped team assignments (implementation pending) |
| Attendance Confirmation | ✅ Ready | Magic link reminders + one-click confirm |

## Setup

1. Clone the repo and install deps:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in all values:
   ```bash
   cp .env.example .env.local
   ```

3. Run the Supabase schema in your project's SQL editor:
   ```
   supabase/schema.sql
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

## Pages

- `/` — Root page with QR code pointing to `/checkin`
- `/checkin` — Participant check-in form (share this as a QR code)
- `/confirm?token=<uuid>` — Magic link for attendance confirmation
- `/teams` — Team organiser (stub)

## API

| Endpoint | Method | Description |
|---|---|---|
| `/api/checkin` | POST | `{ query: string }` — check in by name or email |
| `/api/send-reminders` | POST | Send confirmation reminders to all unconfirmed participants |
| `/api/confirm?token=` | GET | Confirm attendance via magic link token |
| `/api/teams` | POST | Team organiser stub (not implemented) |

## Environment Variables

See `.env.example` for all required variables.

## Tests

```bash
npm test
```

## Deploy

Push to GitHub — connect repo to Vercel and add env vars in the Vercel dashboard.
```

- [ ] **Step 4: Final commit and push**

```bash
git add README.md
git commit -m "docs: update README with setup and API docs"
git push origin main
```
