const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('No Supabase credentials');
  process.exit(1);
}

const supabase = createClient(url, key);

async function run() {
  console.log('⚡ Updating IT Department faculty in Supabase Cloud Database...');

  // 1. Fetch current IT faculty
  const { data: currentIT } = await supabase.from('faculty').select('*').eq('department', 'Information Technology');
  
  // Delete any IT faculty that is NOT Dr. Mythili, Prof. Gayathiri, or Prof. Suganya
  if (currentIT && currentIT.length > 0) {
    for (const f of currentIT) {
      if (!f.name.includes('Mythili') && !f.name.includes('Gayathiri') && !f.name.includes('Suganya')) {
        console.log('Removing old IT faculty:', f.name, f.id);
        await supabase.from('faculty').delete().eq('id', f.id);
      }
    }
  }

  // 2. Upsert the exact 3 IT faculty members
  const itFaculty = [
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
      status: 'active',
      is_active: true
    },
    {
      id: 'T102',
      name: 'Prof. Gayathiri',
      department: 'Information Technology',
      designation: 'Assistant Professor',
      email: 'gayathiri.it@sugunacollege.edu',
      phone: '+91 9842100011',
      max_weekly_hours: 16,
      max_periods: 5,
      subjects: 'Database Systems, Operating Systems, Cyber Security',
      status: 'active',
      is_active: true
    },
    {
      id: 'T103',
      name: 'Prof. Suganya',
      department: 'Information Technology',
      designation: 'Assistant Professor',
      email: 'suganya.it@sugunacollege.edu',
      phone: '+91 9842100012',
      max_weekly_hours: 16,
      max_periods: 5,
      subjects: 'Data Structures, Computer Networks, AI Foundations',
      status: 'active',
      is_active: true
    }
  ];

  for (const f of itFaculty) {
    const { error } = await supabase.from('faculty').upsert([f], { onConflict: 'id' });
    if (error) {
      console.warn('Upsert warning for', f.name, error.message);
    } else {
      console.log('✅ Upserted:', f.name, `(${f.designation})`);
    }
  }

  // 3. Update subjects in Supabase for IT department so they only assign these 3 teachers
  const { data: subs } = await supabase.from('subjects').select('*').eq('department', 'Information Technology');
  if (subs) {
    for (const s of subs) {
      let teacherName = 'Prof. Gayathiri';
      let prefId = 'T102';

      if (s.code === 'IT3501' || s.code === 'IT3511' || s.code === 'IT3701' || s.code === 'IT3711') {
        teacherName = 'Dr. Mythili';
        prefId = 'T101';
      } else if (s.code === 'IT3302' || s.code === 'IT3502' || s.code === 'IT3702') {
        teacherName = 'Prof. Suganya';
        prefId = 'T103';
      }

      await supabase.from('subjects').update({ teacher: teacherName, preferred_faculty_id: prefId }).eq('id', s.id);
    }
  }

  console.log('✅ IT Faculty and Subjects updated in Supabase Cloud Database successfully!');
}

run().catch(console.error);
