-- ============================================================================
-- Mila Academy — apply everything the live database is still missing.
--
-- Paste this whole file into the Supabase SQL Editor and press Run.
-- Safe to run more than once: every statement is idempotent, and the seed
-- rows are skipped if the tables already have data.
--
-- It is the equivalent of running, in order:
--   migration_gallery_storage_path.sql
--   schema_dashboard.sql
--   seed_dashboard.sql
--   migration_admin_cms.sql
--
-- Assumes schema_content.sql + seed_content.sql have already been applied
-- (they have: programs, testimonials, site_settings and enrollment_inquiries
-- all exist and are populated).
-- ============================================================================


-- ████ 1 / 4 ─ migration_gallery_storage_path.sql ████████████████████████████

-- Adds a column to track each photo's storage path, so deleting a row can
-- also clean up the actual file in the 'gallery' storage bucket.
alter table gallery_photos add column if not exists storage_path text;


-- ████ 2 / 4 ─ schema_dashboard.sql ██████████████████████████████████████████

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

do $$ begin
  alter table teams add constraint teams_coach_id_fkey
    foreign key (coach_id) references coaches(id) on delete set null;
exception when duplicate_object then null; end $$;

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


-- ████ 3 / 4 ─ seed_dashboard.sql ████████████████████████████████████████████

-- Seeds Teams, Coaches, and Students with the existing mock/demo data so the
-- dashboard isn't empty once wired to Supabase. Run after schema_dashboard.sql.
-- Fixed UUIDs are used (instead of gen_random_uuid()) so students/coaches can
-- reference the right team in the same script.

-- ── Teams ────────────────────────────────────────────────────────────────────
insert into teams (id, name, academy, age_group) values
  ('11111111-1111-1111-1111-111111111111', 'MFA U-17', 'MFA', 'U-17'),
  ('22222222-2222-2222-2222-222222222222', 'MFA U-14', 'MFA', 'U-14'),
  ('33333333-3333-3333-3333-333333333333', 'MBA U-16', 'MBA', 'U-16')
on conflict (id) do nothing;

-- ── Coaches ──────────────────────────────────────────────────────────────────
insert into coaches (id, name, session_name, specialty, team_ids, experience, bio, phone, email, nationality, certifications, languages, joined, salary, contract_end) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Ahmad Nader', 'Coach Nader', 'Attack & Finishing',
    array['11111111-1111-1111-1111-111111111111']::uuid[], 8,
    'Former professional midfielder in the Lebanese Premier League. Joined Mila in 2019. Known for high-intensity attack drills and exceptional finishing technique training.',
    '+961 70 100 200', 'ahmad.nader@milaacademy.com', 'Lebanese',
    '["UEFA B License", "LFF Level 2 Coaching Certificate"]'::jsonb,
    '["Arabic", "French", "English"]'::jsonb,
    '2019-09-01', '$1,400/month', '2027-06-30'),

  ('aaaaaaaa-0000-0000-0000-000000000002', 'Bilal Akar', 'Coach Bilal', 'Youth Development',
    array['22222222-2222-2222-2222-222222222222']::uuid[], 5,
    'Specialist in youth football development with a degree in Sports Science from LAU. Focuses on building fundamental skills and tactical awareness in younger age groups.',
    '+961 76 200 300', 'bilal.akar@milaacademy.com', 'Lebanese',
    '["LFF Level 1 Coaching Certificate", "FIFA Grassroots Certificate"]'::jsonb,
    '["Arabic", "English"]'::jsonb,
    '2021-01-15', '$1,100/month', '2026-12-31'),

  ('aaaaaaaa-0000-0000-0000-000000000003', 'Samer Khalil', 'Coach Samer', 'Basketball — Guard Play',
    array['33333333-3333-3333-3333-333333333333']::uuid[], 3,
    'Former FIBA referee turned coach. Deep knowledge of basketball rules and mechanics. Specialises in guard play, dribbling circuits, and team coordination.',
    '+961 70 300 400', 'samer.khalil@milaacademy.com', 'Lebanese',
    '["FIBA Level 1 Coach", "Lebanese Basketball Federation Certificate"]'::jsonb,
    '["Arabic", "English", "Spanish"]'::jsonb,
    '2023-09-01', '$1,000/month', '2026-08-31'),

  ('aaaaaaaa-0000-0000-0000-000000000004', 'Nadia Frem', 'Coach Nadia', 'Fitness & Conditioning',
    array['11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222']::uuid[], 6,
    'Certified sports physiotherapist and strength coach. Works with all MFA teams on conditioning, injury prevention, and athletic performance optimisation.',
    '+961 71 400 500', 'nadia.frem@milaacademy.com', 'Lebanese',
    '["NSCA Certified Strength Coach", "Sports Physiotherapy Certificate"]'::jsonb,
    '["Arabic", "French"]'::jsonb,
    '2020-03-01', '$1,200/month', '2027-03-31')
on conflict (id) do nothing;

-- Now that coaches exist, point each team at its head coach.
update teams set coach_id = 'aaaaaaaa-0000-0000-0000-000000000001' where id = '11111111-1111-1111-1111-111111111111';
update teams set coach_id = 'aaaaaaaa-0000-0000-0000-000000000002' where id = '22222222-2222-2222-2222-222222222222';
update teams set coach_id = 'aaaaaaaa-0000-0000-0000-000000000003' where id = '33333333-3333-3333-3333-333333333333';

-- ── Students ─────────────────────────────────────────────────────────────────
-- Skipped entirely if students already exist (no fixed ids to conflict on).
-- Guarded so a re-run does not duplicate: these rows have no fixed ids.
do $$ begin
if not exists (select 1 from students) then
insert into students (name, dob, nationality, position, jersey_number, team_id, academy, blood_type, allergies, injuries, doctor_contact, parent_name, parent_phone, parent_whatsapp, emergency_contact, payment_status, payment_amount, payment_due_date, notes, awards, created_at) values
  ('Karim Nassar', '2008-03-15', 'Lebanese', 'Forward', 10, '11111111-1111-1111-1111-111111111111', 'MFA', 'A+', 'None', 'Right knee sprain (2025)', 'Dr. Hassan Khalil · +961 70 111 000', 'Hassan Nassar', '+961 70 222 333', '96170222333', 'Layla Nassar · +961 70 444 555', 'paid', 150, '2026-07-01', '', '["⚽ Top Scorer", "🌟 Player of the Month — May"]'::jsonb, '2024-09-01'),
  ('Omar Khalil', '2009-06-22', 'Lebanese', 'Midfielder', 8, '11111111-1111-1111-1111-111111111111', 'MFA', 'O+', 'Penicillin', 'None', 'Dr. Rami Saad · +961 71 222 000', 'Khalil Omar', '+961 76 333 444', '96176333444', '', 'paid', 150, '2026-07-01', '', '["🎖️ Best Midfielder"]'::jsonb, '2024-09-01'),
  ('Ahmad Hamdan', '2008-11-09', 'Lebanese', 'Defender', 4, '11111111-1111-1111-1111-111111111111', 'MFA', 'B+', 'None', 'None', 'Dr. Nadia Frem · +961 70 555 000', 'Nabil Hamdan', '+961 70 666 777', '96170666777', 'Rita Hamdan · +961 70 888 999', 'partial', 75, '2026-07-01', '', '[]'::jsonb, '2024-10-01'),
  ('Rami Fares', '2008-07-30', 'Lebanese', 'Goalkeeper', 1, '11111111-1111-1111-1111-111111111111', 'MFA', 'AB+', 'None', 'Shoulder strain (2024)', 'Dr. Hassan Khalil · +961 70 111 000', 'George Fares', '+961 71 888 999', '96171888999', '', 'unpaid', 0, '2026-07-01', '', '["🧤 Best Goalkeeper"]'::jsonb, '2024-09-01'),

  ('Youssef Aoun', '2011-02-14', 'Lebanese', 'Forward', 9, '22222222-2222-2222-2222-222222222222', 'MFA', 'A-', 'None', 'None', 'Dr. Sami Khoury · +961 70 100 200', 'Elie Aoun', '+961 70 300 400', '96170300400', 'Mary Aoun · +961 70 500 600', 'paid', 150, '2026-07-01', '', '["⚽ Top Scorer U-14", "🏅 Most Improved Player"]'::jsonb, '2024-09-01'),
  ('Ali Hassan', '2011-08-05', 'Lebanese', 'Midfielder', 7, '22222222-2222-2222-2222-222222222222', 'MFA', 'O-', 'Dust allergy', 'None', 'Dr. Sami Khoury · +961 70 100 200', 'Hassan Ali', '+961 78 500 600', '96178500600', '', 'paid', 150, '2026-07-01', '', '["🎯 Best Accuracy"]'::jsonb, '2024-09-15'),
  ('Tarek Moussa', '2012-01-20', 'Lebanese', 'Defender', 5, '22222222-2222-2222-2222-222222222222', 'MFA', 'B-', 'None', 'Ankle sprain (2025)', 'Dr. Nadia Frem · +961 70 555 000', 'Moussa Tarek', '+961 70 700 800', '96170700800', '', 'unpaid', 0, '2026-07-01', '', '[]'::jsonb, '2024-10-15'),
  ('Bilal Khoury', '2011-12-11', 'Lebanese', 'Winger', 11, '22222222-2222-2222-2222-222222222222', 'MFA', 'A+', 'None', 'None', 'Dr. Rami Saad · +961 71 222 000', 'Khoury Bilal', '+961 76 900 100', '96176900100', 'Mira Khoury · +961 76 200 300', 'paid', 150, '2026-07-01', '', '[]'::jsonb, '2024-09-01'),

  ('Nour Saleh', '2009-04-18', 'Lebanese', 'Point Guard', 3, '33333333-3333-3333-3333-333333333333', 'MBA', 'O+', 'None', 'None', 'Dr. Leila Nassar · +961 70 200 300', 'Saleh Nour', '+961 71 400 500', '96171400500', '', 'paid', 150, '2026-07-01', '', '["🏀 Top Assist Leader", "🌟 Player of the Month — June"]'::jsonb, '2024-09-01'),
  ('Lara Haddad', '2010-09-25', 'Lebanese', 'Small Forward', 6, '33333333-3333-3333-3333-333333333333', 'MBA', 'A+', 'Pollen allergy', 'None', 'Dr. Leila Nassar · +961 70 200 300', 'George Haddad', '+961 70 600 700', '96170600700', 'May Haddad · +961 70 800 900', 'partial', 75, '2026-07-01', '', '[]'::jsonb, '2024-09-15'),
  ('Sara Mansour', '2010-06-08', 'Lebanese', 'Center', 12, '33333333-3333-3333-3333-333333333333', 'MBA', 'B+', 'None', 'Left knee contusion (2025)', 'Dr. Sami Khoury · +961 70 100 200', 'Nadim Mansour', '+961 76 800 900', '96176800900', '', 'unpaid', 0, '2026-07-01', '', '[]'::jsonb, '2024-10-01'),
  ('Maya Rizk', '2009-12-03', 'Lebanese', 'Shooting Guard', 15, '33333333-3333-3333-3333-333333333333', 'MBA', 'AB-', 'None', 'None', 'Dr. Leila Nassar · +961 70 200 300', 'Antoine Rizk', '+961 70 100 200', '96170100200', 'Claire Rizk · +961 70 300 400', 'paid', 150, '2026-07-01', '', '["🏀 Best Shooter"]'::jsonb, '2024-09-01');
end if; end $$;


-- ████ 4 / 4 ─ migration_admin_cms.sql ███████████████████████████████████████

-- Admin CMS + user management.
-- Run once in the Supabase SQL Editor, after schema_content.sql and
-- schema_dashboard.sql. Safe to re-run: every statement is idempotent.
--
--   1. app_users            — dashboard accounts, managed by admins
--   2. programs             — one catalog for the homepage and the academy pages
--   3. site_settings        — unchanged table, now also holds every editable
--                             text/image on the public site (see
--                             lib/content-schema.ts for the keys)
--   4. storage bucket       — `site-assets`, for logos and images uploaded from
--                             the Website editor
--   5. enrollment_inquiries — adds a `handled` flag for the Inquiries page

-- ── 1. Dashboard users ──────────────────────────────────────────────────────
-- Replaces the hardcoded SEED_USERS list that used to live in lib/auth.ts.
--
-- Built so a later move to Supabase Auth is a data migration, not a redesign:
-- the profile columns (role, academies, team_id, student_id) are exactly what
-- a `profiles` table keyed on auth.users.id would hold, and only
-- password_hash + session_version are specific to the current login.
create table if not exists app_users (
  id                   uuid primary key default gen_random_uuid(),
  email                text not null,
  password_hash        text not null,
  role                 text not null check (role in ('admin', 'coach', 'parent', 'student')),
  name                 text not null default '',
  academies            text[] not null default '{MFA,MBA}',
  team_id              uuid references teams(id) on delete set null,
  student_id           uuid references students(id) on delete set null,
  disabled             boolean not null default false,
  must_change_password boolean not null default false,
  -- Bumped on password change / reset / disable / role change. Sessions carry
  -- the version they were issued with, so bumping it signs the user out
  -- everywhere at once.
  session_version      int not null default 0,
  last_login_at        timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create unique index if not exists app_users_email_key on app_users (lower(email));

-- No policies: nobody can read this table with the public key. Only the
-- server (secret key) touches it, via /api/auth/* and /api/admin/users/*.
alter table app_users enable row level security;

-- ── 2. Programs: one catalog ────────────────────────────────────────────────
-- The homepage used `programs` (6 rows, free-text age/frequency) while the
-- /football and /basketball pages used a separate hardcoded 20-row list in
-- lib/programs.ts. Both now read this table: the academy pages show every
-- active program for their sport, the homepage shows the `featured` ones.
alter table programs add column if not exists age_min           int     not null default 0;
alter table programs add column if not exists age_max           int     not null default 99;
alter table programs add column if not exists level             text    not null default 'Beginner';
alter table programs add column if not exists gender            text    not null default 'Mixed';
alter table programs add column if not exists sessions_per_week int     not null default 2;
alter table programs add column if not exists image_url         text    not null default '';
alter table programs add column if not exists featured          boolean not null default false;
alter table programs add column if not exists active            boolean not null default true;

do $$ begin
  alter table programs add constraint programs_level_check
    check (level in ('Beginner', 'Intermediate', 'Elite', 'Pro'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table programs add constraint programs_gender_check
    check (gender in ('Boys', 'Girls', 'Mixed'));
exception when duplicate_object then null; end $$;

-- The old free-text columns are no longer written; keep them nullable so new
-- rows don't need them, and so nothing that still reads them breaks.
alter table programs alter column age_range drop not null;
alter table programs alter column frequency drop not null;

-- Replace the six original placeholder rows (seed_content.sql) with the
-- 20-program catalog. Only rows still carrying their original seed names are
-- removed, so anything an admin has already added or renamed is kept.
delete from programs
 where name in ('Under 8', 'Under 12', 'Under 16', 'Adult Academy', 'Basketball U14', 'Basketball Adult')
   and not exists (select 1 from programs p2 where p2.level <> 'Beginner' or p2.featured);

insert into programs (sport, name, subtitle, age_min, age_max, level, gender, price_month, sessions_per_week, featured, sort_order)
select * from (values
  ('football',   'U6 Mixed',     'Little Kickers',   4,  6,  'Beginner',     'Mixed', 40,  2, false, 1),
  ('football',   'U8 Boys',      'Little Champions', 6,  8,  'Beginner',     'Boys',  50,  2, true,  2),
  ('football',   'U8 Girls',     'Little Stars',     6,  8,  'Beginner',     'Girls', 50,  2, false, 3),
  ('football',   'U10 Boys',     'Junior Eagles',    8,  10, 'Beginner',     'Boys',  60,  2, false, 4),
  ('football',   'U12 Boys',     'Rising Stars',     9,  12, 'Intermediate', 'Boys',  70,  3, true,  5),
  ('football',   'U12 Girls',    'Rising Stars',     9,  12, 'Intermediate', 'Girls', 70,  3, false, 6),
  ('football',   'U14 Boys',     'Young Guns',       12, 14, 'Intermediate', 'Boys',  80,  3, false, 7),
  ('football',   'U16 Boys',     'Elite Youth',      13, 16, 'Elite',        'Boys',  90,  4, true,  8),
  ('football',   'U16 Girls',    'Elite Youth',      13, 16, 'Elite',        'Girls', 90,  4, false, 9),
  ('football',   'U18 Boys',     'Academy Elite',    16, 18, 'Elite',        'Boys',  100, 4, false, 10),
  ('football',   'Adult Squad',  'Pro Level',        17, 99, 'Pro',          'Mixed', 110, 5, true,  11),
  ('basketball', 'U8 Mixed',     'Mini Ballers',     6,  8,  'Beginner',     'Mixed', 50,  2, false, 12),
  ('basketball', 'U10 Mixed',    'Court Kids',       8,  10, 'Beginner',     'Mixed', 55,  2, false, 13),
  ('basketball', 'U12 Boys',     'Junior Hoops',     10, 12, 'Beginner',     'Boys',  60,  2, false, 14),
  ('basketball', 'U12 Girls',    'Junior Hoops',     10, 12, 'Beginner',     'Girls', 60,  2, false, 15),
  ('basketball', 'U14 Boys',     'Court Kings',      11, 14, 'Intermediate', 'Boys',  65,  3, true,  16),
  ('basketball', 'U14 Girls',    'Court Queens',     11, 14, 'Intermediate', 'Girls', 65,  3, false, 17),
  ('basketball', 'U16 Boys',     'Slam Academy',     14, 16, 'Elite',        'Boys',  75,  3, false, 18),
  ('basketball', 'U18 Boys',     'Elite Hoops',      15, 18, 'Elite',        'Boys',  80,  4, false, 19),
  ('basketball', 'U18 Girls',    'Elite Hoops',      15, 18, 'Elite',        'Girls', 80,  4, false, 20),
  ('basketball', 'Adult League', 'Hoop Masters',     18, 99, 'Pro',          'Mixed', 85,  4, true,  21)
) as v(sport, name, subtitle, age_min, age_max, level, gender, price_month, sessions_per_week, featured, sort_order)
where not exists (select 1 from programs where featured);

-- ── 3. Site content ─────────────────────────────────────────────────────────
-- No schema change: site_settings is already a public-read key/value table.
-- Every key the Website editor can write is listed in lib/content-schema.ts,
-- along with the default shown until an admin changes it — so no seed rows
-- are needed here.

-- ── 4. Storage bucket for site images ───────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('site-assets', 'site-assets', true, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'])
on conflict (id) do nothing;

-- ── 5. Enrollment inquiries: triage flag ────────────────────────────────────
alter table enrollment_inquiries add column if not exists handled boolean not null default false;


-- ████ done ██████████████████████████████████████████████████████████████████
-- Next: create the first admin from a terminal in the project root:
--   npm run create-admin -- you@example.com "Your Name" <password>
