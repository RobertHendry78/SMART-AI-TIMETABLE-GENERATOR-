/**
 * Smart AI Timetable Generator — Supabase Cloud Database Seeder
 * Populates Supabase PostgreSQL with Suguna College of Engineering dataset:
 * - Faculty (IT, CSE, AIDS, ECE, MECH)
 * - Subjects (Core subjects & Labs with credits and hours)
 * - Classrooms & Specialized Labs
 * - Student Classes
 * - Initial Faculty Leaves & Substitutions
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Supabase credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function seedSupabase() {
  console.log('⚡ Starting Supabase Cloud Database Seeding for Suguna College of Engineering...');

  // 1. Faculty
  const facultyData = [
    {
      id: 'T101',
      name: 'Dr. Mythili',
      department: 'Information Technology',
      designation: 'Professor & HOD',
      email: 'hod.it@sugunacollege.edu',
      phone: '+91 9842100002',
      max_weekly_hours: 18,
      max_periods: 6,
      subjects: 'Web Technologies, Cloud Computing',
      is_active: true,
      status: 'active'
    },
    {
      id: 'T102',
      name: 'Dr. Priya Sundaram',
      department: 'Information Technology',
      designation: 'Associate Professor',
      email: 'priya.it@sugunacollege.edu',
      phone: '+91 9842100012',
      max_weekly_hours: 18,
      max_periods: 5,
      subjects: 'Database Systems, DBMS Lab',
      is_active: true,
      status: 'active'
    },
    {
      id: 'T103',
      name: 'Dr. R. Ramesh',
      department: 'Information Technology',
      designation: 'Professor',
      email: 'r.ramesh@suguna.edu.in',
      phone: '+91 9876543210',
      max_weekly_hours: 18,
      max_periods: 6,
      subjects: 'Data Structures, OS Internals',
      is_active: true,
      status: 'active'
    },
    {
      id: 'T104',
      name: 'Prof. A. Raja',
      department: 'Information Technology',
      designation: 'Assistant Professor',
      email: 'a.raja@suguna.edu.in',
      phone: '+91 9876543215',
      max_weekly_hours: 16,
      max_periods: 5,
      subjects: 'Digital Logic, Python Programming',
      is_active: true,
      status: 'active'
    },
    {
      id: 'T105',
      name: 'Prof. Suresh V.',
      department: 'Information Technology',
      designation: 'Assistant Professor',
      email: 'suresh.it@sugunacollege.edu',
      phone: '+91 9842100015',
      max_weekly_hours: 16,
      max_periods: 5,
      subjects: 'Computer Networks, Network Security',
      is_active: true,
      status: 'active'
    },
    {
      id: 'T201',
      name: 'Dr. R. Kavitha',
      department: 'Artificial Intelligence & Data Science',
      designation: 'Professor & HOD',
      email: 'hod.aids@sugunacollege.edu',
      phone: '+91 9842100003',
      max_weekly_hours: 18,
      max_periods: 6,
      subjects: 'Foundations of Data Science, Machine Learning',
      is_active: true,
      status: 'active'
    },
    {
      id: 'T202',
      name: 'Prof. Alan Turing',
      department: 'Artificial Intelligence & Data Science',
      designation: 'Associate Professor',
      email: 'turing@institution.edu',
      phone: '+91 9842100022',
      max_weekly_hours: 18,
      max_periods: 5,
      subjects: 'Deep Learning, NLP',
      is_active: true,
      status: 'active'
    },
    {
      id: 'T301',
      name: 'Dr. S. Rajasekaran',
      department: 'Computer Science & Engineering',
      designation: 'Professor & HOD',
      email: 'hod.cse@sugunacollege.edu',
      phone: '+91 9842100004',
      max_weekly_hours: 18,
      max_periods: 6,
      subjects: 'Object Oriented Programming, Distributed Systems',
      is_active: true,
      status: 'active'
    },
    {
      id: 'T302',
      name: 'Dr. Ada Lovelace',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      email: 'ada@institution.edu',
      phone: '+91 9842100032',
      max_weekly_hours: 16,
      max_periods: 5,
      subjects: 'Design and Analysis of Algorithms, Compilers',
      is_active: true,
      status: 'active'
    }
  ];

  console.log('Inserting faculty members...');
  for (const f of facultyData) {
    const { error } = await supabase.from('faculty').upsert([f], { onConflict: 'id' });
    if (error) console.warn('Faculty upsert warning:', f.id, error.message);
  }

  // 2. Subjects
  const subjectsData = [
    { id: 'SUB-IT-201', code: 'IT3301', name: 'Database Management Systems', department: 'Information Technology', semester: 3, year: 2, credits: 4, hours_per_week: 4, weekly_hours: 4, is_lab: false, teacher: 'Dr. Priya Sundaram', preferred_faculty_id: 'T102' },
    { id: 'SUB-IT-202', code: 'IT3302', name: 'Data Structures & Algorithms', department: 'Information Technology', semester: 3, year: 2, credits: 4, hours_per_week: 4, weekly_hours: 4, is_lab: false, teacher: 'Dr. R. Ramesh', preferred_faculty_id: 'T103' },
    { id: 'SUB-IT-203', code: 'IT3303', name: 'Digital Logic & Computer Design', department: 'Information Technology', semester: 3, year: 2, credits: 3, hours_per_week: 3, weekly_hours: 3, is_lab: false, teacher: 'Prof. A. Raja', preferred_faculty_id: 'T104' },
    { id: 'SUB-IT-204', code: 'IT3311', name: 'DBMS & SQL Laboratory', department: 'Information Technology', semester: 3, year: 2, credits: 2, hours_per_week: 3, weekly_hours: 3, is_lab: true, teacher: 'Dr. Priya Sundaram', preferred_faculty_id: 'T102' },
    { id: 'SUB-IT-301', code: 'IT3501', name: 'Web Technologies & Cloud Computing', department: 'Information Technology', semester: 5, year: 3, credits: 4, hours_per_week: 4, weekly_hours: 4, is_lab: false, teacher: 'Dr. Mythili', preferred_faculty_id: 'T101' },
    { id: 'SUB-IT-302', code: 'IT3502', name: 'Computer Networks & Security', department: 'Information Technology', semester: 5, year: 3, credits: 4, hours_per_week: 4, weekly_hours: 4, is_lab: false, teacher: 'Prof. Suresh V.', preferred_faculty_id: 'T105' },
    { id: 'SUB-IT-303', code: 'IT3503', name: 'Operating Systems Internals', department: 'Information Technology', semester: 5, year: 3, credits: 3, hours_per_week: 3, weekly_hours: 3, is_lab: false, teacher: 'Dr. R. Ramesh', preferred_faculty_id: 'T103' },
    { id: 'SUB-IT-304', code: 'IT3511', name: 'Web Technologies Laboratory', department: 'Information Technology', semester: 5, year: 3, credits: 2, hours_per_week: 3, weekly_hours: 3, is_lab: true, teacher: 'Dr. Mythili', preferred_faculty_id: 'T101' },
    { id: 'SUB-CSE-301', code: 'CS3501', name: 'Design and Analysis of Algorithms', department: 'Computer Science & Engineering', semester: 5, year: 3, credits: 4, hours_per_week: 4, weekly_hours: 4, is_lab: false, teacher: 'Dr. Ada Lovelace', preferred_faculty_id: 'T302' },
    { id: 'SUB-AIDS-301', code: 'AD3501', name: 'Machine Learning Algorithms', department: 'Artificial Intelligence & Data Science', semester: 5, year: 3, credits: 4, hours_per_week: 4, weekly_hours: 4, is_lab: false, teacher: 'Dr. R. Kavitha', preferred_faculty_id: 'T201' }
  ];

  console.log('Inserting curriculum subjects...');
  for (const s of subjectsData) {
    const { error } = await supabase.from('subjects').upsert([s], { onConflict: 'id' });
    if (error) console.warn('Subject upsert warning:', s.id, error.message);
  }

  // 3. Classrooms
  const classroomsData = [
    { id: 'LH-301', name: 'Lecture Hall 301', room_number: 'LH-301', capacity: 70, is_lab: false, type: 'classroom', department: 'Information Technology', floor: 3, is_available: true },
    { id: 'LH-302', name: 'Lecture Hall 302', room_number: 'LH-302', capacity: 70, is_lab: false, type: 'classroom', department: 'Information Technology', floor: 3, is_available: true },
    { id: 'LH-201', name: 'Lecture Hall 201', room_number: 'LH-201', capacity: 65, is_lab: false, type: 'classroom', department: 'Computer Science & Engineering', floor: 2, is_available: true },
    { id: 'LAB-01', name: 'Cloud Computing Lab', room_number: 'LAB-01', capacity: 60, is_lab: true, type: 'lab', department: 'Information Technology', floor: 2, is_available: true },
    { id: 'LAB-02', name: 'AI & Data Science Lab', room_number: 'LAB-02', capacity: 60, is_lab: true, type: 'lab', department: 'Artificial Intelligence & Data Science', floor: 1, is_available: true }
  ];

  console.log('Inserting classrooms & laboratories...');
  for (const c of classroomsData) {
    const { error } = await supabase.from('classrooms').upsert([c], { onConflict: 'id' });
    if (error) console.warn('Classroom upsert warning:', c.id, error.message);
  }

  // 4. Student Classes
  const studentClassesData = [
    { id: 'IT-3A', name: 'B.Tech IT - Year 3 - Sec A', department: 'Information Technology', year: 3, semester: 5, section: 'A', student_count: 58 },
    { id: 'IT-2A', name: 'B.Tech IT - Year 2 - Sec A', department: 'Information Technology', year: 2, semester: 3, section: 'A', student_count: 62 },
    { id: 'CSE-3A', name: 'B.E CSE - Year 3 - Sec A', department: 'Computer Science & Engineering', year: 3, semester: 5, section: 'A', student_count: 64 },
    { id: 'AIDS-3A', name: 'B.Tech AIDS - Year 3 - Sec A', department: 'Artificial Intelligence & Data Science', year: 3, semester: 5, section: 'A', student_count: 60 }
  ];

  console.log('Inserting student classes...');
  for (const sc of studentClassesData) {
    const { error } = await supabase.from('student_classes').upsert([sc], { onConflict: 'id' });
    if (error) console.warn('Student class upsert warning:', sc.id, error.message);
  }

  // 5. Initial Faculty Leaves
  const leavesData = [
    {
      faculty_name: 'Prof. Suresh V.',
      faculty_id: 'T105',
      department: 'Information Technology',
      leave_date: new Date().toISOString().split('T')[0],
      leave_type: 'Casual Leave',
      reason: 'Academic Conference Presentation',
      periods: [2, 3],
      status: 'approved',
      auto_substitute: true,
      send_whatsapp: true,
      approved_by: 'Dr. Mythili (HOD)'
    },
    {
      faculty_name: 'Dr. Priya Sundaram',
      faculty_id: 'T102',
      department: 'Information Technology',
      leave_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      leave_type: 'Sick Leave',
      reason: 'Medical Consultation',
      periods: [1],
      status: 'pending',
      auto_substitute: true,
      send_whatsapp: true
    }
  ];

  console.log('Inserting initial faculty leaves...');
  for (const l of leavesData) {
    await supabase.from('faculty_leaves').insert([l]);
  }

  console.log('✅ Supabase Seeding completed successfully for Suguna College of Engineering!');
}

seedSupabase().catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
