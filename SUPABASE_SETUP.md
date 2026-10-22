# Supabase setup for Mila Academy

Follow these steps in order. No secret keys are in this file; the keys come in the `.env.local` file sent separately.

## 1. Get the project running locally

```bash
git pull
npm install
```

## 2. Create `.env.local`

Put `.env.local` in the project root, next to `package.json`. Use the file Reema sent you, or copy `.env.example` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://siagymxloetdryzkcqre.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key, sb_publishable_...>
SUPABASE_SECRET_KEY=<secret key, sb_secret_...>
# optional but recommended: 32+ random characters, signs login sessions
SESSION_SECRET=<random string>
```

- Keys are at https://supabase.com/dashboard/project/siagymxloetdryzkcqre/settings/api
- Leaving any `xxx` or `your-project-ref` placeholder makes the app treat Supabase as "not configured".
- `.env.local` is gitignored. Never commit it.

## 3. Run the SQL (Supabase dashboard, SQL Editor, New query)

**Already done on the shared project `siagymxloetdryzkcqre`** (verified 2026-10-22: all tables, the `gallery` and `site-assets` buckets and an admin user exist). If you use that project, skip steps 3 and 4 and go to step 5. Only follow them for a fresh Supabase project.

Run these files from the `supabase/` folder, in this order. Paste each file's contents and click Run:

1. `schema_content.sql`
2. `seed_content.sql`
3. `migration_gallery_storage_path.sql`
4. `schema_dashboard.sql`
5. `seed_dashboard.sql`
6. `migration_admin_cms.sql`

Until these run, the dashboard shows no data and nobody can log in.

Also check that Storage has a **public bucket named `gallery`** (Storage in the left menu). The SQL should create it, but create it if it's missing.

## 4. Create an admin login

```bash
npm run create-admin
```

Follow the prompts. The script needs the `.env.local` values from step 2.

## 5. Start the app

```bash
npm run dev
```

Open http://localhost:3000, then http://localhost:3000/dashboard/login and sign in with the admin you just created.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Homepage shows default or placeholder content | Placeholder keys in `.env.local`, or SQL steps 1-3 not run |
| `fetch failed` in the terminal | URL or keys wrong or still placeholders; restart `npm run dev` |
| Dashboard is empty | SQL steps 4-6 not run |
| Cannot log in | No admin created (step 4), or `SUPABASE_SECRET_KEY` missing |
| Changed `.env.local` but nothing changed | Restart the dev server |

## Known open items

- Next.js 16.3.5 has security advisories: run `npm audit fix` and re-test.
- Attendance, matches, ratings and payment history are still stored in browser localStorage, not Supabase.
- Coach-level data scoping is only enforced in the UI, not in `/api/admin/students`.
- Rotate the Supabase secret key once setup is done (it was pasted in a chat).
