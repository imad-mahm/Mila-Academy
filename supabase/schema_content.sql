-- Content tables for the public marketing site (Programs, Testimonials,
-- Gallery, Stats/site info) + the Contact form's enrollment inquiries.
-- Run this once in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- ── Programs ─────────────────────────────────────────────────────────────────
create table if not exists programs (
  id          uuid primary key default gen_random_uuid(),
  sport       text not null check (sport in ('football', 'basketball')),
  name        text not null,
  subtitle    text not null default '',
  age_range   text not null default '',
  frequency   text not null default '',
  price_month numeric not null default 0,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table programs enable row level security;
create policy "Public can read programs" on programs
  for select using (true);

-- ── Testimonials ─────────────────────────────────────────────────────────────
create table if not exists testimonials (
  id         uuid primary key default gen_random_uuid(),
  quote      text not null,
  name       text not null,
  initials   text not null,
  role       text not null default '',
  rating     int not null default 5 check (rating between 1 and 5),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table testimonials enable row level security;
create policy "Public can read testimonials" on testimonials
  for select using (true);

-- ── Gallery photos ───────────────────────────────────────────────────────────
create table if not exists gallery_photos (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  category   text not null check (category in ('football', 'basketball', 'events')),
  caption    text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table gallery_photos enable row level security;
create policy "Public can read gallery_photos" on gallery_photos
  for select using (true);

-- ── Site settings (Stats numbers + contact info, as key/value rows) ─────────
create table if not exists site_settings (
  key        text primary key,
  value      text not null
);

alter table site_settings enable row level security;
create policy "Public can read site_settings" on site_settings
  for select using (true);

insert into site_settings (key, value) values
  ('players_trained',  '500+'),
  ('years_excellence', '8'),
  ('academies_count',  '2'),
  ('success_rate',     '98%'),
  ('phone_display',    '+961 70 000 000'),
  ('whatsapp_number',  '96170000000'),
  ('email',            'info@milaacademy.com'),
  ('location',         'Lebanon · Baissour / Beirut'),
  ('hours',            'Mon – Sat  4PM – 8PM'),
  ('instagram_url',    '#'),
  ('facebook_url',     '#'),
  ('youtube_url',      '#')
on conflict (key) do nothing;

-- ── Enrollment inquiries (Contact form submissions) ──────────────────────────
create table if not exists enrollment_inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text not null default '',
  child_age  int,
  academy    text not null default '',
  message    text,
  created_at timestamptz not null default now()
);

alter table enrollment_inquiries enable row level security;
-- Anyone can submit an inquiry, but nobody (via the public key) can read,
-- edit, or delete them back out — only the admin API route (service key) can.
create policy "Public can submit enrollment_inquiries" on enrollment_inquiries
  for insert with check (true);

-- No RLS write/select policies for programs, testimonials, gallery_photos,
-- or site_settings on purpose: all writes go through the admin API route
-- using the service role key, which bypasses RLS entirely and does its own
-- session check — the public key stays strictly read-only on those tables.
