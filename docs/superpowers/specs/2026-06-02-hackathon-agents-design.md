# Hackathon Agents — Design Spec

**Date:** 2026-06-02
**Project:** Cursor x Antler Hackathon Management Platform
**Scope:** Agent 1 (Check-in + Briefing), Agent 2 (Team Organiser — stub), Agent 3 (Attendance Confirmation)

---

## Overview

A Next.js application deployed on Vercel that powers a multi-agent hackathon management platform. The landing page (handled separately) uploads a participant Excel file and event config. This repo owns the agent logic: check-in, team organisation, and attendance confirmation.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Hosting | Vercel |
| Database | Supabase (hosted Postgres) |
| Email | Resend |
| WhatsApp | Twilio WhatsApp Sandbox |
| Styling | Tailwind CSS |

---

## Data Model

### `participants` table

| column | type | notes |
|---|---|---|
| `id` | uuid | primary key, default gen_random_uuid() |
| `full_name` | text | not null |
| `email` | text | unique, not null |
| `phone` | text | E.164 format e.g. +49... |
| `linkedin` | text | |
| `role` | text | developer, founder, marketing, designer, etc. |
| `attendance_confirmed` | boolean | default false |
| `checked_in` | boolean | default false |
| `checked_in_at` | timestamptz | nullable |
| `confirmation_token` | uuid | unique, used for magic link |
| `team_id` | text | nullable, filled by Agent 2 |
| `created_at` | timestamptz | default now() |

### `event_config` table

Single-row table populated by the landing page.

| column | type | notes |
|---|---|---|
| `id` | int | always 1 |
| `agenda` | text | natural language agenda from landing page |
| `location` | text | venue/room details |
| `extras` | text | food, drinks, prizes, toilets, etc. |
| `updated_at` | timestamptz | default now() |

---

## Project Structure

```
hackathon-agents/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                     # Root redirect or status page
│   ├── checkin/
│   │   └── page.tsx                 # Check-in form UI (Agent 1)
│   ├── confirm/
│   │   └── page.tsx                 # Magic link confirmation UI (Agent 3)
│   └── teams/
│       └── page.tsx                 # Team organiser UI stub (Agent 2)
├── app/api/
│   ├── checkin/
│   │   └── route.ts                 # POST: look up participant, mark checked-in, send briefing
│   ├── send-reminders/
│   │   └── route.ts                 # POST: send confirmation messages to unconfirmed participants
│   ├── confirm/
│   │   └── route.ts                 # GET: validate token, mark attendance_confirmed = true
│   └── teams/
│       └── route.ts                 # STUB: team organisation logic (Agent 2)
├── lib/
│   ├── supabase.ts                  # Supabase client singleton
│   ├── resend.ts                    # Resend email sender helper
│   ├── twilio.ts                    # Twilio WhatsApp sender helper
│   └── messages.ts                  # Message templates: briefing, reminder, confirmation
├── supabase/
│   └── schema.sql                   # Full schema — share with landing page team
├── .env.local                       # Local secrets (not committed)
├── .env.example                     # Committed template with all required keys
└── docs/
    └── superpowers/specs/
        └── 2026-06-02-hackathon-agents-design.md
```

---

## Agent 1: Check-in + Briefing

### Check-in Page (`/checkin`)

- Simple form: name or email input + submit button
- No authentication required (public, QR code points here)
- On success: shows "You're checked in, [name]! Briefing sent to your phone and email."
- On not found: shows friendly error — "We couldn't find you. Check your email address or ask at the desk."

### API: `POST /api/checkin`

**Request body:**
```json
{ "query": "alice@example.com" }
```

**Logic:**
1. Look up participant in Supabase by email (exact match) or full_name (case-insensitive)
2. If not found: return 404 with error message
3. If already checked in: return 200 with "already checked in" message (idempotent)
4. Set `checked_in = true`, `checked_in_at = now()`
5. Fetch event config from `event_config` (id = 1)
6. Send briefing email via Resend
7. Send briefing WhatsApp message via Twilio
8. Return 200 with participant name

**Briefing message content:**
- Greeting with participant's first name
- Full agenda (from event_config.agenda)
- Location details (from event_config.location)
- Food, drinks, prizes, etc. (from event_config.extras)

---

## Agent 2: Team Organiser (Stub)

### Teams Page (`/teams`)
Placeholder page with a "Coming soon" message and a clear comment block indicating where the team organiser UI should be implemented.

### API: `POST /api/teams`
Empty route handler with a comment block describing the expected behaviour:
- Read all participants from Supabase
- Group by role into balanced teams of 4 (1 developer, 1 founder, 1 marketer, 1 wildcard)
- Handle uneven numbers by redistributing
- Write `team_id` back to each participant row
- Return team assignments

---

## Agent 3: Attendance Confirmation

### Confirm Page (`/confirm?token=<uuid>`)
- Reads `token` from query param
- Calls `/api/confirm?token=<uuid>` on load
- Shows "You're confirmed! See you there, [name]." on success
- Shows friendly error if token is invalid or already used

### API: `POST /api/send-reminders`

**Logic:**
1. Fetch all participants where `attendance_confirmed = false`
2. For each: generate a uuid `confirmation_token`, save to Supabase
3. Send reminder email via Resend with magic link
4. Send reminder WhatsApp message via Twilio with magic link
5. Return count of messages sent
6. Idempotent: skips participants who are already confirmed

**Reminder message content:**
- "Hey [name], you're registered for the Cursor x Antler Hackathon!"
- "Confirm your spot here: [magic link]"
- Event date/location teaser

### API: `GET /api/confirm?token=<uuid>`

**Logic:**
1. Look up participant by `confirmation_token`
2. If not found: return 404
3. If already confirmed: return 200 (idempotent)
4. Set `attendance_confirmed = true`
5. Return participant name for the confirmation page

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

NEXT_PUBLIC_BASE_URL=
```

---

## Error Handling

- All API routes return structured JSON: `{ success: boolean, message: string, data?: any }`
- Messaging failures (Resend/Twilio) are logged but do not block the check-in or confirmation response — the DB write succeeds regardless
- Supabase errors surface as 500 with a generic message (no internals leaked)

---

## Out of Scope

- Agent 4 (post-event thank-you) — not in this build
- Landing page (handled by separate team)
- Admin dashboard / participant management UI
- WhatsApp inbound message handling (chatbot FAQ)
