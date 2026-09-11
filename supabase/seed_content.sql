-- One-time seed: moves the current hardcoded Programs/Testimonials content
-- into the new tables so the site has real starting data instead of blanks.
-- Run once in Supabase SQL Editor, after schema_content.sql.

insert into programs (sport, name, subtitle, age_range, frequency, price_month, sort_order) values
  ('football',   'Under 8',           'Little Champions', 'Ages 5–8',   '2× / week', 50,  1),
  ('football',   'Under 12',          'Rising Stars',      'Ages 9–12',  '3× / week', 70,  2),
  ('football',   'Under 16',          'Elite Youth',       'Ages 13–16', '4× / week', 90,  3),
  ('football',   'Adult Academy',     'Pro Level',         'Ages 17+',   '5× / week', 110, 4),
  ('basketball', 'Basketball U14',    'Court Kings',       'Ages 10–14', '3× / week', 65,  5),
  ('basketball', 'Basketball Adult',  'Hoop Masters',      'Ages 15+',   '4× / week', 85,  6);

-- NOTE: these are the same sample/placeholder quotes that were in the code
-- (not real customer reviews) — replace via the admin panel once it's live.
insert into testimonials (quote, name, initials, role, sort_order) values
  ('My son joined at age 7 and now at 11 he''s a completely different player. The coaches genuinely care about each child''s development.', 'Sara K.',   'SK', 'Parent of U8 player',      1),
  ('The structured training transformed my daughter''s passion into real skill. The discipline and professionalism here are unmatched.',    'Michel R.', 'MR', 'Parent of U12 player',     2),
  ('We switched from another academy and the difference was immediate. Mila Academy''s coaching methodology is on another level.',          'Lara H.',   'LH', 'Parent of U16 player',     3),
  ('My son begged us to enroll in Basketball U14. Three months in and he''s already competing in inter-school tournaments.',                'Tony M.',   'TM', 'Parent of U14 player',     4),
  ('The Adult Basketball program fits perfectly around my work schedule. The trainers push you hard but always know your limits.',          'Dina A.',   'DA', 'Adult Basketball member', 5),
  ('Both my kids train here — football and basketball. The facilities are exceptional and the community is like a second family.',          'Joe S.',    'JS', 'Parent of two players',   6);
