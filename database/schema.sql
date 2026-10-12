-- ============================================================
-- Smart AI Timetable Generator — Complete Supabase Schema
-- Project: smart-timetable-generator | Region: ap-south-1
-- Run this in: https://fbvsmobtzcwraybqpppw.supabase.co → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. FACULTY ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faculty (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  department    TEXT NOT NULL,
  designation   TEXT DEFAULT 'Assistant Professor',
  email         TEXT UNIQUE NOT NULL,
  phone         TEXT,
  max_periods   INTEGER DEFAULT 6,
  subjects      TEXT,
  status        TEXT DEFAULT 'active' CHECK (status IN ('active', 'leave', 'inactive')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. SUBJECTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subjects (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  department    TEXT NOT NULL,
  semester      INTEGER,
  credits       INTEGER DEFAULT 3,
  is_lab        BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. CLASSROOMS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.classrooms (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  capacity      INTEGER DEFAULT 60,
  type          TEXT DEFAULT 'classroom' CHECK (type IN ('classroom', 'lab', 'seminar_hall', 'auditorium')),
  department    TEXT,
  floor         INTEGER DEFAULT 1,
  is_available  BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. STUDENT CLASSES ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_classes (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name          TEXT NOT NULL,
  department    TEXT NOT NULL,
  semester      INTEGER NOT NULL,
  section       TEXT DEFAULT 'A',
  strength      INTEGER DEFAULT 60,
  room_id       UUID REFERENCES public.classrooms(id),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. TIMETABLES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.timetables (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  institution_name  TEXT DEFAULT 'Suguna College of Engineering',
  academic_preset   TEXT DEFAULT 'college',
  academic_year     TEXT DEFAULT '2025-2026',
  department        TEXT,
  semester          INTEGER,
  schedule_data     JSONB NOT NULL DEFAULT '{}',
  conflict_count    INTEGER DEFAULT 0,
  fitness_score     NUMERIC(5,2) DEFAULT 100.00,
  is_published      BOOLEAN DEFAULT FALSE,
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. FACULTY LEAVES ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faculty_leaves (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  faculty_name      TEXT NOT NULL,
  faculty_id        UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
  department        TEXT NOT NULL,
  leave_date        DATE NOT NULL,
  leave_type        TEXT DEFAULT 'Casual Leave' CHECK (leave_type IN ('Sick Leave','Casual Leave','Earned Leave','Emergency Leave','Medical Leave')),
  reason            TEXT,
  periods           INTEGER[] DEFAULT ARRAY[1],
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  auto_substitute   BOOLEAN DEFAULT TRUE,
  send_whatsapp     BOOLEAN DEFAULT TRUE,
  approved_by       TEXT,
  approved_at       TIMESTAMPTZ,
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. SUBSTITUTIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.substitutions (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  leave_id              UUID REFERENCES public.faculty_leaves(id) ON DELETE CASCADE,
  original_faculty      TEXT NOT NULL,
  substitute_faculty    TEXT NOT NULL,
  subject               TEXT,
  class_name            TEXT,
  period                INTEGER,
  substitution_date     DATE NOT NULL,
  status                TEXT DEFAULT 'assigned' CHECK (status IN ('assigned','confirmed','completed','cancelled')),
  whatsapp_sent         BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. AUTOMATION LOGS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type        TEXT NOT NULL,
  webhook_url       TEXT,
  payload           JSONB DEFAULT '{}',
  response_status   INTEGER DEFAULT 200,
  response_body     TEXT,
  execution_time_ms INTEGER DEFAULT 0,
  status            TEXT DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS','FAILED','PENDING')),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 9. USERS (Auth) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  role        TEXT DEFAULT 'faculty' CHECK (role IN ('admin','hod','faculty')),
  department  TEXT,
  faculty_id  UUID REFERENCES public.faculty(id),
  is_active   BOOLEAN DEFAULT TRUE,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 10. NOTIFICATIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  recipient   TEXT,
  department  TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) — Allow anon read/write for dev
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.faculty         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetables      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_leaves  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitutions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;

-- Allow all operations for anon/authenticated (dev mode)
CREATE POLICY "allow_all" ON public.faculty         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.subjects        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.classrooms      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.student_classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.timetables      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.faculty_leaves  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.substitutions   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.automation_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.users           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON public.notifications   FOR ALL USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
-- SEED DATA — Sample faculty and subjects
-- ────────────────────────────────────────────────────────────
INSERT INTO public.faculty (name, department, designation, email, phone, max_periods, subjects, status) VALUES
  ('Dr. R. Ramesh',  'IT',   'Professor',           'r.ramesh@suguna.edu.in',  '+91 9876543210', 6, 'Data Structures, DBMS',    'active'),
  ('Prof. S. Priya', 'IT',   'Assistant Professor',  's.priya@suguna.edu.in',   '+91 9876543211', 5, 'Networks, OS',             'active'),
  ('Dr. K. Kumar',   'CSE',  'Associate Professor',  'k.kumar@suguna.edu.in',   '+91 9876543212', 6, 'Algorithms, Maths',        'active'),
  ('Prof. M. Devi',  'ECE',  'Assistant Professor',  'm.devi@suguna.edu.in',    '+91 9876543213', 5, 'Digital Electronics',      'active'),
  ('Dr. P. Selvam',  'MECH', 'Professor',            'p.selvam@suguna.edu.in',  '+91 9876543214', 6, 'Thermodynamics, FM',       'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.subjects (code, name, department, semester, credits, is_lab) VALUES
  ('CS301', 'Data Structures & Algorithms', 'IT',   3, 4, false),
  ('CS302', 'Database Management Systems',  'IT',   3, 4, false),
  ('CS303', 'Computer Networks',            'IT',   3, 3, false),
  ('CS304', 'Operating Systems',            'CSE',  3, 3, false),
  ('CS305', 'DBMS Lab',                     'IT',   3, 2, true)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.classrooms (name, capacity, type, department, floor) VALUES
  ('IT Block - Room 301', 65, 'classroom', 'IT',   3),
  ('IT Block - Room 302', 65, 'classroom', 'IT',   3),
  ('Computer Lab A',      40, 'lab',       'IT',   2),
  ('CSE Seminar Hall',    80, 'seminar_hall', 'CSE', 1)
ON CONFLICT DO NOTHING;
