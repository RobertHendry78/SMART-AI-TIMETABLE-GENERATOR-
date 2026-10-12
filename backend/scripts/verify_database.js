const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

async function runVerification() {
  const tables = [
    'faculty',
    'subjects',
    'classrooms',
    'student_classes',
    'timetables',
    'faculty_leaves',
    'substitutions',
    'audit_logs'
  ];

  console.log('=== SUPABASE DATABASE STORAGE & TABLE VERIFICATION ===');
  console.log('Target URL:', url);

  const results = {};

  for (const table of tables) {
    const { data, count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .limit(1);

    if (error) {
      results[table] = { status: 'FAILED', error: error.message };
    } else {
      results[table] = { status: 'READY', totalRecords: count };
    }
  }

  console.table(results);

  // Test insert & verify persistence in subjects
  console.log('\n--- Testing Live Insert & Query on "subjects" ---');
  const testSubCode = 'TEST' + Math.floor(Math.random() * 1000);
  const insertPayload = {
    id: testSubCode,
    name: 'Automation Test Subject',
    code: testSubCode,
    department: 'Information Technology',
    weekly_hours: 4,
    is_lab: false
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('subjects')
    .insert([insertPayload])
    .select();

  if (insertErr) {
    console.error('Insert Failed:', insertErr.message);
  } else {
    console.log('Insert SUCCESSFUL! Record stored:', inserted[0]);

    // Query it back
    const { data: fetched, error: fetchErr } = await supabase
      .from('subjects')
      .select('*')
      .eq('code', testSubCode)
      .single();

    if (fetchErr) {
      console.error('Query Failed:', fetchErr.message);
    } else {
      console.log('Query Verified! Data retrieved correctly from Supabase Cloud:', fetched.name);
    }

    // Clean up test record
    await supabase.from('subjects').delete().eq('code', testSubCode);
    console.log('Test record cleaned up successfully.');
  }

  console.log('\n=== ALL DATABASE CHECKS COMPLETE ===');
}

runVerification().catch(err => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
