# Product

## Register

This project has two surfaces with different registers. Default is **brand** (the public site is the primary surface); the dashboard is treated as **product** per task.

- Public site (`app/page.tsx`, `app/football`, `app/basketball`, `app/components/*`): **brand**
- Dashboard (`app/dashboard/*`): **product**

## Users

**Public site**: Parents/guardians in Lebanon researching football or basketball training programs for their kids. They're evaluating credibility, program details, coaching quality, and how to get in touch or enroll. Their job to be done is deciding whether this academy is trustworthy and worth reaching out to.

**Dashboard**: Academy staff (coaches, admins/front-desk) managing day-to-day operations — attendance, payments, student records, match scheduling, player ratings, reports, and (as of the latest update) public-site content via a new admin CMS layer. Used in both desk contexts (reports, payments — denser data, mouse/keyboard) and on-the-go contexts (coaches checking attendance or entering ratings courtside on a phone). Design must hold up at both ends.

## Product Purpose

A football/basketball training academy (Mila Academy, Lebanon — Baissour/Beirut) with:
1. A public marketing site to build trust with parents and convert interest into contact/enrollment. Now backed by a real Supabase database (programs, testimonials, gallery, site settings, enrollment inquiries) instead of hardcoded placeholder content.
2. An internal dashboard for staff to run academy operations (attendance tracking, payments, student management, match results, coach/player ratings, reporting) — still on localStorage mock data, migration to Supabase scoped as a future phase — plus a new, partially-built admin CMS for managing the public site's content (programs/testimonials/gallery/settings) via API routes with no UI yet.

Success on the public site = a parent trusts the academy and reaches out (WhatsApp/contact). Success on the dashboard = staff can complete routine operational tasks quickly and accurately, on any device, including keeping the public site's content up to date without touching code.

## Brand Personality

Energetic, disciplined, elite. The academy should read as competitive and performance-driven — serious about training, not a casual rec-league feel. This tone applies to the public site; the dashboard should stay functional and calm (staff efficiency over brand theater), while still carrying the same color/type identity.

## Anti-references

None specified. No known bad-example sites to explicitly avoid; judge the public site against generic "modern SaaS/AI slop" patterns per the shared design laws, and judge the dashboard against generic admin-template clichés (identical stat cards, gradient accents, side-stripe borders already present in `.nav-item.active`).

## Design Principles

1. **Energy without chaos** — competitive, elite feel through typography and motion, not through visual noise or oversaturation.
2. **Trust reads first** — on the public site, credibility signals (programs, coaching, real results/testimonials, easy contact) should be legible before flash. Now that content is DB-backed, this also means: no dead links, no broken nav, no half-built admin screens exposed to staff.
3. **Two registers, one identity** — the dashboard is calmer and denser than the public site, but shares the same color and type system so it doesn't feel like a bolted-on separate product.
4. **Dual-context dashboard** — every dashboard screen must work at a front-desk monitor and one-handed on a phone; don't design for desktop and adapt down.
5. **Sport-differentiated, not sport-siloed** — football (green) and basketball (orange) need to read as distinct programs under one gold/dark academy brand, not two disconnected sub-brands.

## Accessibility & Inclusion

General WCAG AA best practices. No specific known user needs beyond standard practice. Existing code already enforces 44px minimum touch targets on mobile and light/dark theming — maintain both.
