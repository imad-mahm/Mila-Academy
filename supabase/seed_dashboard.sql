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
