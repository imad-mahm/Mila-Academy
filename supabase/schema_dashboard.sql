-- Dashboard tables: Teams, Coaches, Students, Attendance, Ratings, Matches,
-- Payments, Student documents. Replaces the localStorage mock data system.
--
-- SECURITY: none of these are publicly readable — no public SELECT policies
-- at all. This is sensitive data (parent phone numbers, health info, payment
-- info). ALL access goes through the admin API routes (server-side, using
-- the secret key), which check the caller's role before responding.
-- RLS is enabled with no policies, which means: nobody can read/write these
-- tables via the public anon key, from anywhere — only the secret key
-- (server-only, used by /api/admin/* routes) can touch them.

create extension if not exists pgcrypto;

-- ── Teams ────────────────────────────────────────────────────────────────────
create table if not exists teams (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  academy    text not null check (academy in ('MFA', 'MBA')),
  age_group  text not null default '',
  coach_id   uuid, -- references coaches(id), added after coaches table exists
  created_at timestamptz not null default now()
);
alter table teams enable row level security;

-- ── Coaches ──────────────────────────────────────────────────────────────────
create table if not exists coaches (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  session_name   text not null default '', -- short form used on attendance/rating records, e.g. "Coach Nader"
  photo_url      text,
  specialty      text not null default '',
  team_ids       uuid[] not null default '{}',
  experience     int not null default 0, -- years
  bio            text not null default '',
  phone          text default '',
  email          text default '',
  nationality    text default '',
  certifications jsonb not null default '[]',
  languages      jsonb not null default '[]',
  joined         date,
  salary         text default '', -- kept free-form (e.g. "$1,400/month") to match existing display
  contract_end   date,
  archived_at    timestamptz, -- soft-archive; null = active
  created_at     timestamptz not null default now()
);
alter table coaches enable row level security;

alter table teams add constraint teams_coach_id_fkey
  foreign key (coach_id) references coaches(id) on delete set null;

-- ── Students ─────────────────────────────────────────────────────────────────
create table if not exists students (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  photo_url          text,
  dob                date,
  nationality        text not null default '',
  position           text not null default '',
  jersey_number      int,
  team_id            uuid references teams(id) on delete set null,
  academy            text not null check (academy in ('MFA', 'MBA')),
  blood_type         text default '',
  allergies          text default '',
  injuries           text default '',
  doctor_contact     text default '',
  parent_name        text not null default '',
  parent_phone       text not null default '',
  parent_whatsapp    text not null default '',
  emergency_contact  text default '',
  payment_type       text not null default 'monthly' check (payment_type in ('monthly', 'per_session')),
  payment_status     text not null default 'unpaid' check (payment_status in ('paid', 'unpaid', 'partial')),
  payment_amount     numeric not null default 0,
  payment_due_date   date,
  notes              text default '',
  awards             jsonb not null default '[]',
  archived_at        timestamptz, -- soft-archive; null = active
  created_at         timestamptz not null default now()
);
alter table students enable row level security;

-- ── Student documents (ID cards, papers, etc.) ────────────────────────────────
create table if not exists student_documents (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students(id) on delete cascade,
  label         text not null,
  file_url      text not null,
  storage_path  text not null,
  uploaded_at   timestamptz not null default now()
);
alter table student_documents enable row level security;

-- ── Attendance ─────────────────────────────────────────────────────────────
create table if not exists attendance_records (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  session_date date not null,
  status       text not null check (status in ('present', 'absent', 'late')),
  coach_id     uuid references coaches(id) on delete set null,
  team_id      uuid references teams(id) on delete set null
);
alter table attendance_records enable row level security;

-- ── Ratings ──────────────────────────────────────────────────────────────────
create table if not exists ratings (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  session_date date not null,
  coach_id     uuid references coaches(id) on delete set null,
  technique    int check (technique between 1 and 10),
  fitness      int check (fitness between 1 and 10),
  attitude     int check (attitude between 1 and 10),
  teamwork     int check (teamwork between 1 and 10),
  overall      numeric,
  notes        text default ''
);
alter table ratings enable row level security;

-- ── Matches ──────────────────────────────────────────────────────────────────
create table if not exists matches (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid references teams(id) on delete set null,
  opponent    text not null,
  date        date not null,
  location    text default '',
  home_score  int,
  away_score  int,
  result      text check (result in ('win', 'loss', 'draw')),
  lineup      jsonb not null default '[]',
  scorers     jsonb not null default '[]',
  notes       text default '',
  status      text not null default 'upcoming' check (status in ('upcoming', 'live', 'completed'))
);
alter table matches enable row level security;

-- ── Payments (supports both monthly and per-session billing) ────────────────
create table if not exists payments (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students(id) on delete cascade,
  period_type  text not null check (period_type in ('monthly', 'per_session')),
  period_label text not null, -- e.g. "June 2026" for monthly, or a session date for per-session
  amount       numeric not null default 0,
  status       text not null default 'unpaid' check (status in ('paid', 'unpaid', 'partial')),
  paid_date    date,
  method       text check (method in ('cash', 'bank', 'whatsapp')),
  notes        text default ''
);
alter table payments enable row level security;

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists idx_students_team_id       on students(team_id);
create index if not exists idx_attendance_student_id  on attendance_records(student_id);
create index if not exists idx_ratings_student_id     on ratings(student_id);
create index if not exists idx_matches_team_id        on matches(team_id);
create index if not exists idx_payments_student_id    on payments(student_id);
create index if not exists idx_documents_student_id   on student_documents(student_id);
