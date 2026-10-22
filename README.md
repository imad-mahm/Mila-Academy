# Mila Academy

Public marketing site + staff dashboard for Mila Football Academy and Mila Basket
Academy (Baissour / Beirut, Lebanon).

One Next.js 16 (App Router) application. **Supabase is the backend** — there is no
separate server to deploy. The public pages are Server Components that read
Supabase at request time, `proxy.ts` is the middleware, and all the API routes
live in the same build, so the whole thing deploys as a single unit.

## Setup

1. `cp .env.example .env.local` and fill in the three values from the Supabase
   dashboard (Settings → API):

   | Variable | What it is |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (`sb_publishable_…`) |
   | `SUPABASE_SECRET_KEY` | Secret key (`sb_secret_…`) — **server-only, never commit** |

   For a deployed instance also set `NEXT_PUBLIC_SITE_URL` to the public origin,
   or share/preview image URLs resolve against `localhost`.

2. Create the database. Paste **`supabase/apply_all.sql`** into the Supabase SQL
   Editor and run it. It is the four migration files concatenated in order and is
   safe to re-run — it guards the foreign key and only seeds example rows when
   `students` is empty.

   The individual files are kept alongside it for reference:
   `schema_content.sql` → `schema_dashboard.sql` → `seed_dashboard.sql` →
   `migration_admin_cms.sql` (plus `migration_gallery_storage_path.sql`).

3. Create the first admin:

   ```bash
   npm run create-admin -- you@example.com "Your Name" <password>
   ```

   The same command recovers access if every admin is locked out.

4. `npm install && npm run dev`

## Accounts

There is **no sign-up**. The only way an account comes into existence is an admin
creating it at `/dashboard/users`; the only entry point is `/dashboard/login`.
New accounts get a temporary password and must change it on first sign-in.

Supabase Auth's own email sign-up is unused by the app, but is a separate switch
in the Supabase dashboard (Authentication → Sign In / Providers → Email).

## Auth model

Built so it can be swapped for Supabase Auth later without touching the pages.

- Users live in `app_users` with scrypt password hashes (`lib/server/passwords.ts`).
- Login runs server-side (`app/api/auth/*`) and sets an HMAC-signed, httpOnly
  `mila_session` cookie (`lib/session-token.ts`). Forged cookies are rejected by
  `proxy.ts` and by every API route.
- `lib/api-auth.ts` `getSession()` is the single server-side source of truth: it
  verifies the cookie, then re-reads the user, so disabling an account, a role
  change or a password reset takes effect on the next request (`session_version`).
- The browser keeps only a display copy in localStorage (`lib/auth.ts`), refreshed
  from `/api/auth/me` on each dashboard visit.

## What an admin can edit

- **Website → Site Content** — every text and image on the public site. Driven by
  `lib/content-schema.ts`: add a field there and it appears in the editor;
  components read `content.<key>`. Values live in `site_settings`, and a missing
  row falls back to the schema default.
- **Website → Programs / Testimonials / Gallery** — full CRUD, reordering,
  show-on-homepage, hide-without-deleting, image uploads.
- **Website → Inquiries** — contact-form submissions; mark handled, delete.
- **Students / Teams / Coaches** — full CRUD against the real API, with archive.
- **Admin → Users** — create, edit, disable, delete; set role and academies; set
  or generate passwords. You cannot demote, disable or delete yourself, and the
  last active admin cannot be removed.

Saves call `revalidatePath('/', 'layout')`, so changes go live immediately.

All seeded content is example data and can be deleted or rewritten from the
dashboard.

## Known gaps

- **Attendance, Matches, Ratings and Payments still run on generated mock data**
  (`app/dashboard/*/data.ts`, plus `localStorage`). Students, Teams and Coaches
  are on the real API. Because of that split, a coach linked to a real team
  (a uuid) won't match the mock data's team ids on those pages.
- Attendance rates and overall ratings shown on student records are placeholders,
  not computed from real sessions.
- The dashboard's own chrome (sidebar logos, "MILA ACADEMY", login subtitle) is
  not part of Site Content.

## Commands

```bash
npm run dev                  # dev server on localhost:3000
npm run build && npm start   # production build
npx tsc --noEmit             # typecheck
npx eslint .                 # lint
npm run create-admin -- <email> "<name>" <password>
```

## Repo

Remote: `https://github.com/reeemaridi/mila-academy`

This project's remote uses the **`reeemaridi`** account (not `reemaridii`, which
other projects on this machine use). If a push fails with "Repository not found":

```bash
gh auth switch --hostname github.com --user reeemaridi && gh auth setup-git
```
