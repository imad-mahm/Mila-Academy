# Handoff — Mila Academy site

Repo: https://github.com/reeemaridi/mila-academy (private, `main` branch, everything pushed as of commit `b4e4ca0`)

## Context: what this project is

A Next.js 16 (App Router) marketing site for two sports academies (football + basketball) in Lebanon, with a `/dashboard` admin area. Originally a hardcoded template; this session's work moved the public-site content (Programs, Testimonials, Gallery, Stats/contact info) off hardcoded arrays and onto a real Supabase database, and built the server-side foundation for an admin CMS.

## Environment setup (do this first)

1. Copy `.env.example` to `.env.local`.
2. Get the three Supabase values from the project dashboard (Settings → API) — ask the project owner for access, or they're already in the live `.env.local` on the original machine (not committed, by design):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the "publishable" key)
   - `SUPABASE_SECRET_KEY` (the "secret" key — server-only, never expose client-side)
3. `npm install && npm run dev`

The Supabase project is already live and has real content in it (see "Database" below) — no setup needed there, just the env vars.

## What's done and working

### Public site — fully live on Supabase
- `lib/site-data.ts` — server-side fetch helpers (`getPrograms`, `getTestimonials`, `getGalleryPhotos`, `getSiteSettings`), used by `app/page.tsx`, `app/football/page.tsx`, `app/basketball/page.tsx` (all Server Components, fetch on request, `revalidate = 60`).
- `Programs.tsx`, `Testimonials.tsx`, `Gallery.tsx`, `Stats.tsx`, `Contact.tsx`, `Footer.tsx`, `WhatsAppButton.tsx`, `AcademyLanding.tsx` — all now receive data as props instead of hardcoded arrays. Verified end-to-end (data renders correctly, Contact form really inserts into `enrollment_inquiries`).
- `lib/site-config.ts` is deleted — fully superseded by the `site_settings` table.

### Admin API — built, working, but has no UI yet
- `lib/supabase-admin.ts` — server-only Supabase client using the secret key (bypasses RLS). Uses the `server-only` package as a hard guard against accidental client-side import.
- `lib/api-auth.ts` — `isAdminRequest()` checks the existing `mila_session` cookie (the same one `lib/auth.ts`'s client-side login already sets) for `role === 'admin'`.
- `app/api/admin/programs/route.ts` + `[id]/route.ts` — full CRUD, admin-gated.
- `app/api/admin/testimonials/route.ts` + `[id]/route.ts` — full CRUD, admin-gated.
- `app/api/admin/gallery/route.ts` (list), `upload/route.ts` (multipart upload → Supabase Storage `gallery` bucket + DB row in one call), `[id]/route.ts` (update/delete, delete also removes the storage file).
- `app/api/admin/settings/route.ts` — GET all as `{key: value}`, PATCH to upsert any subset of keys.
- Verified: unauthenticated requests get 401 on all of the above; the storage bucket (`gallery`, public, 5MB limit, image types only) already exists in the live project.

### Database (Supabase project `siagymxloetdryzkcqre`)
SQL migration files are in `supabase/` for reference/reproducibility — **already run** against the live project, no need to re-run unless setting up a fresh project:
- `schema_content.sql` — tables: `programs`, `testimonials`, `gallery_photos`, `site_settings`, `enrollment_inquiries`, with RLS (public read-only on content tables, public insert-only on inquiries, no public write anywhere else — writes go through the admin API using the secret key).
- `seed_content.sql` — seeded `programs` (6 rows) and `testimonials` (6 rows) with the site's original hardcoded content, so the live site isn't blank.
- `migration_gallery_storage_path.sql` — adds `gallery_photos.storage_path` (tracks the file for cleanup on delete).
- `gallery_photos` is currently **empty** — no photos uploaded yet (there's no upload UI; the API exists, see below).

## Admin CMS + user accounts (done)

### One-time setup
1. Run `supabase/migration_admin_cms.sql` in the Supabase SQL Editor (after the two schema files). It adds `app_users`, merges the two program catalogs into the `programs` table, creates the `site-assets` storage bucket, and adds `enrollment_inquiries.handled`.
2. Create the first admin: `npm run create-admin -- you@example.com "Your Name" <password>`. The same command recovers access if every admin is locked out (it resets that account to an enabled admin).
3. Everything else is done from the dashboard.

### What the admin can edit (dashboard sidebar)
- **Website → Site Content** (`/dashboard/website`): every text and image on the public site — brand name, SEO title/description, tab icon, share image, nav labels, hero, stats, headings, contact details, social links, footer, and each academy's name/tagline/logo/banner/CTA. Driven by `lib/content-schema.ts`: add a field there and it appears in the editor; components read `content.<key>`. Values live in `site_settings`; a missing row shows the schema default.
- **Website → Programs / Testimonials / Gallery**: full CRUD, reordering, show-on-homepage (programs `featured`), hide without deleting (programs `active`), image uploads.
- **Website → Inquiries**: enquiry-form submissions, mark handled, delete.
- **Admin → Users** (`/dashboard/users`): create/edit/disable/delete accounts, set role and academies, link coaches to a team and parents/students to a student, reset passwords (temporary password shown once; user must change it on first sign-in). Guards: you can't demote/disable/delete yourself, and the last active admin can't be removed.
- **My Account**: every user can change their own password.

Saves call `revalidatePath('/', 'layout')` (`lib/server/revalidate.ts`), so changes are live immediately.

### Auth architecture (built to swap for Supabase Auth later)
- Users in `app_users` with scrypt password hashes (`lib/server/passwords.ts`). No hardcoded accounts remain.
- Login runs on the server (`app/api/auth/*`) and sets an **HMAC-signed, httpOnly** `mila_session` cookie (`lib/session-token.ts`). Forged cookies are rejected by `proxy.ts` and by every API route.
- `lib/api-auth.ts` `getSession()` is the single server-side source of truth: it verifies the cookie, then re-reads the user so disabling, role changes and password resets take effect on the next request (`session_version`).
- The browser keeps only a display copy of the user in localStorage (`lib/auth.ts`), refreshed from `/api/auth/me` on each dashboard visit.
- Migrating to Supabase Auth later = replace `lib/api-auth.ts` + `app/api/auth/*`, and move `app_users` profile columns to a `profiles` table keyed on `auth.users.id`. Pages and admin routes don't change.

## Still not done

- **Students/Teams/Coaches/Matches/Attendance/Ratings/Payments**: Students, Teams and Coaches have real APIs; Attendance, Matches, Ratings and Payments still run on `localStorage` mock data. Coaches linked to a real team (uuid) won't match the mock data's team ids on those pages until they're migrated.
- The dashboard's own chrome (sidebar logos, "MILA ACADEMY", login subtitle) is not part of Site Content.

## Useful commands

```bash
npx tsc --noEmit -p tsconfig.json   # typecheck
npx eslint app lib                   # lint
npm run dev                          # dev server, localhost:3000
```

GitHub: `reeemaridi` account is the repo owner (not `reemaridii` — this project's remote uses the *personal* account, opposite of other projects on this machine). If pushes fail with "Repository not found," run:
```bash
gh auth switch --hostname github.com --user reeemaridi && gh auth setup-git
```
