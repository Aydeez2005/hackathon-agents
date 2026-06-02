-- Run this in your Supabase SQL editor.
-- Share with the landing page team so they use the same schema.

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

create unique index if not exists event_config_singleton on event_config ((id));

insert into event_config (id, agenda, location, extras)
values (1, '', '', '')
on conflict (id) do nothing;
