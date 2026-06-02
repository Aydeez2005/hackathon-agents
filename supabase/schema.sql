-- Full schema for hackathon-agents platform.
-- Run this in your Supabase SQL editor.
-- Safe to re-run — uses IF NOT EXISTS / on conflict do nothing.

create extension if not exists "pgcrypto";

-- ─── participants ──────────────────────────────────────────────────────────────
create table if not exists participants (
  id                   uuid        primary key default gen_random_uuid(),
  full_name            text        not null,
  email                text        unique not null,
  phone                text        not null default '',
  linkedin             text,
  role                 text        not null default '',
  attendance_confirmed boolean     not null default false,
  checked_in           boolean     not null default false,
  checked_in_at        timestamptz,
  confirmation_token   uuid        unique,
  team_id              text,
  created_at           timestamptz not null default now()
);

-- ─── event_config ─────────────────────────────────────────────────────────────
-- Single-row table. Row id=1 always.
-- text columns (agenda / location / extras) are used by the check-in briefing agent.
-- All rich form data lives in the `config` jsonb column.
create table if not exists event_config (
  id                    int         primary key default 1,

  -- used by check-in briefing agent
  agenda                text        not null default '',
  location              text        not null default '',
  extras                text        not null default '',

  -- event basics
  event_name            text        not null default '',
  event_type            text        not null default '',
  event_date            text        not null default '',
  start_time            text        not null default '',
  end_time              text        not null default '',
  timezone              text        not null default 'Europe/Berlin',
  expected_participants int,
  language              text        not null default 'English',
  description           text        not null default '',

  -- venue
  venue_name            text        not null default '',
  full_address          text        not null default '',
  room_details          text        not null default '',
  public_transport      text        not null default '',
  parking               text        not null default '',
  accessibility         text        not null default '',
  check_in_instructions text        not null default '',
  wifi_info             text        not null default '',

  -- structured data as jsonb
  agenda_blocks         jsonb       not null default '[]',
  food_drinks           jsonb       not null default '{}',
  logistics_info        jsonb       not null default '{}',
  faqs                  jsonb       not null default '[]',

  -- full raw form snapshot
  config                jsonb       not null default '{}',

  updated_at            timestamptz not null default now()
);

create unique index if not exists event_config_singleton on event_config ((id));

insert into event_config (id) values (1) on conflict (id) do nothing;

-- ─── migrations: add columns if upgrading from old schema ─────────────────────
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name='event_config' and column_name='event_name') then
    alter table event_config
      add column event_name            text not null default '',
      add column event_type            text not null default '',
      add column event_date            text not null default '',
      add column start_time            text not null default '',
      add column end_time              text not null default '',
      add column timezone              text not null default 'Europe/Berlin',
      add column expected_participants int,
      add column language              text not null default 'English',
      add column description           text not null default '',
      add column venue_name            text not null default '',
      add column full_address          text not null default '',
      add column room_details          text not null default '',
      add column public_transport      text not null default '',
      add column parking               text not null default '',
      add column accessibility         text not null default '',
      add column check_in_instructions text not null default '',
      add column wifi_info             text not null default '',
      add column agenda_blocks         jsonb not null default '[]',
      add column food_drinks           jsonb not null default '{}',
      add column logistics_info        jsonb not null default '{}',
      add column faqs                  jsonb not null default '[]',
      add column config                jsonb not null default '{}';
  end if;
end $$;
