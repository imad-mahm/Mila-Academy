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

## What's NOT done — pick up here

**The actual admin screens don't exist yet.** The API is ready; nobody can use it without writing raw `fetch()` calls. This is the main remaining work:

1. `app/dashboard/content/programs/page.tsx` — list/add/edit/delete Programs. Mid-edit in `app/dashboard/layout.tsx`: nav items for "Programs", "Testimonials", "Gallery" were just added (pointing to `/dashboard/content/programs`, `/dashboard/content/testimonials`, `/dashboard/content/gallery`) — **these routes don't exist yet, so those nav links currently 404.**
2. `app/dashboard/content/testimonials/page.tsx` — same, for testimonials.
3. `app/dashboard/content/gallery/page.tsx` — same, for gallery photos, needs a file `<input>` posting `multipart/form-data` to `/api/admin/gallery/upload`.
4. `app/dashboard/settings/page.tsx` — the nav already links here (`Settings`, pre-existing nav item) but the page was never built. Should be a simple form editing the `site_settings` key/value pairs (Stats numbers, phone/email/location/hours, social URLs) via `PATCH /api/admin/settings`.

Match the existing dashboard's visual style — look at `app/dashboard/students/page.tsx` or `app/dashboard/coaches/page.tsx` for the established table/card patterns and CSS variables (`var(--bg-card)`, `var(--border)`, `var(--text-primary)`, `var(--accent-gold)`, etc., defined in `app/globals.css`).

## Known issues / flagged, not fixed

- **`lib/auth.ts` is not real auth.** Login checks credentials against a hardcoded plaintext array (`SEED_USERS`, e.g. `admin@milaacademy.com` / `admin123`) and the session is an unsigned, forgeable cookie (`mila_session`). The new admin API routes trust this same cookie — consistent with the rest of the app's current security model, but **not real security**. Anyone who knows the cookie format could forge admin access. Replacing this with real Supabase Auth should be a priority before this is treated as production-ready for a real business.
- **The repo was briefly public** with those plaintext passwords visible before this session made it private and invited a collaborator. If it's ever made public again, rotate `lib/auth.ts`'s passwords first.
- **Two separate program catalogs exist and are out of sync**: the new `programs` Supabase table (6 simple entries, powers the homepage) vs. `lib/programs.ts` (a richer, still-hardcoded 20-program catalog with level/gender/sessions, powers `/football` and `/basketball`'s `ProgramsExplorer`). Whether these should be unified into one schema is a design decision nobody's made yet — flagged, not resolved.
- **Students/Teams/Coaches/Matches/Attendance/Ratings/Payments** (the rest of the existing `/dashboard`) still run entirely on `localStorage` mock data (`app/dashboard/students/data.ts` etc.), not Supabase. This was explicitly scoped out as "phase 2" — a separate, larger migration from the content-CMS work done this session.
- Pre-existing, unrelated to this session: several `react-hooks/set-state-in-effect` ESLint errors in `app/dashboard/**` (a background task was already spawned earlier to track this — search for it or just re-run `npx eslint app/dashboard` to see current state).
- `metadataBase` isn't set in `app/layout.tsx`'s metadata export (cosmetic Next.js warning, needs a real production domain — none exists yet).

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
