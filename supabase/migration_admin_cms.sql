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
