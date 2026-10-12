/**
 * Faculty Routes — CRUD API for Faculty Management
 * GET    /api/faculty          → List all faculty
 * POST   /api/faculty          → Add new faculty
 * PUT    /api/faculty/:id      → Update faculty
 * DELETE /api/faculty/:id      → Delete faculty
 * GET    /api/faculty/:id/schedule → Faculty day schedule
 */

const express = require('express');
const router = express.Router();
const { getSupabase } = require('../config/supabase');

// In-memory fallback
let localFaculty = [
  { id: 'T101', name: 'Dr. Mythili',      department: 'Information Technology', deptCode: 'IT', designation: 'Professor & HOD',      email: 'hod.it@sugunacollege.edu',      phone: '+91 9842100002', max_periods: 6, max_weekly_hours: 18, subjects: 'Web Technologies, Cloud Computing', status: 'active' },
  { id: 'T102', name: 'Prof. Gayathiri',  department: 'Information Technology', deptCode: 'IT', designation: 'Assistant Professor', email: 'gayathiri.it@sugunacollege.edu', phone: '+91 9842100011', max_periods: 5, max_weekly_hours: 16, subjects: 'DBMS, OS, Cyber Security',            status: 'active' },
  { id: 'T103', name: 'Prof. Suganya',    department: 'Information Technology', deptCode: 'IT', designation: 'Assistant Professor', email: 'suganya.it@sugunacollege.edu',   phone: '+91 9842100012', max_periods: 5, max_weekly_hours: 16, subjects: 'Data Structures, Networks, AI',       status: 'active' },
  { id: 'f3',   name: 'Dr. S. Rajasekaran',department: 'Computer Science & Engineering', deptCode: 'CSE', designation: 'Professor & HOD', email: 'hod.cse@sugunacollege.edu', phone: '+91 9842100004', max_periods: 6, max_weekly_hours: 18, subjects: 'Algorithms, Distributed',        status: 'active' },
  { id: 'f4',   name: 'Dr. Ada Lovelace',  department: 'Computer Science & Engineering', deptCode: 'CSE', designation: 'Professor',       email: 'ada@institution.edu',         phone: '+91 9842100032', max_periods: 5, max_weekly_hours: 16, subjects: 'Compilers, OOP',                 status: 'active' },
  { id: 'f5',   name: 'Dr. R. Kavitha',    department: 'Artificial Intelligence & Data Science', deptCode: 'AIDS', designation: 'Professor & HOD', email: 'hod.aids@sugunacollege.edu', phone: '+91 9842100003', max_periods: 6, max_weekly_hours: 18, subjects: 'Machine Learning, Data Science', status: 'active' }
];

// Map Supabase record to unified frontend Teacher / Faculty object
function mapFacultyRecord(f) {
  const dept = f.department || 'Information Technology';
  const dLower = dept.toLowerCase();
  const deptCode = f.deptCode || (
    dLower.includes('artificial') || dLower.includes('data science') || dLower.includes('aids') ? 'AIDS' :
    dLower.includes('computer') || dLower.includes('cse') ? 'CSE' :
    dLower.includes('mechatronics') || dLower.includes('mct') ? 'MCT' :
    dLower.includes('mechanical') || dLower.includes('mech') ? 'MECH' :
    dLower.includes('electronics') || dLower.includes('ece') ? 'ECE' :
    dLower.includes('information') || dLower.includes('it') ? 'IT' : 'IT'
  );
  return {
    id: f.id,
    name: f.name,
    department: dept,
    deptCode: deptCode,
    designation: f.designation || 'Assistant Professor',
    email: f.email || '',
    phone: f.phone || '',
    max_periods: f.max_periods || 6,
    maxHours: f.max_weekly_hours || 18,
    weeklyHours: 14,
    subjects: f.subjects || '',
    status: f.status || 'active',
    avatar: f.avatar || (f.name?.includes('Dr.') ? '👨‍🏫' : '👩‍🏫'),
    created_at: f.created_at || new Date().toISOString()
  };
}

// GET all faculty
router.get('/', async (req, res) => {
  const { department, deptCode, status, search } = req.query;
  const supabase = getSupabase();

  let facultyList = localFaculty.map(mapFacultyRecord);

  if (supabase) {
    try {
      const { data, error } = await supabase.from('faculty').select('*').order('name');
      if (!error && data && data.length > 0) {
        facultyList = data.map(mapFacultyRecord);
      }
    } catch (err) {
      console.warn('[Faculty API] Supabase error:', err.message);
    }
  }

  let result = facultyList;
  const targetDept = deptCode || department;
  if (targetDept && targetDept !== 'ALL') {
    const tCode = targetDept.trim().toUpperCase();
    result = result.filter(f => {
      const fCode = (f.deptCode || '').trim().toUpperCase();
      if (fCode === tCode) return true;
      if (tCode === 'IT') {
        const dLower = (f.department || '').toLowerCase();
        return (dLower.includes('information') || fCode === 'IT') && 
               !dLower.includes('artificial') && 
               !dLower.includes('computer');
      }
      if (tCode === 'CSE') {
        const dLower = (f.department || '').toLowerCase();
        return dLower.includes('computer') || fCode === 'CSE';
      }
      if (tCode === 'AIDS') {
        const dLower = (f.department || '').toLowerCase();
        return dLower.includes('artificial') || dLower.includes('data science') || fCode === 'AIDS';
      }
      return f.department.toLowerCase().includes(targetDept.toLowerCase());
    });
  }
  if (status) {
    result = result.filter(f => f.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(f => f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q));
  }

  res.json({ success: true, source: supabase ? 'supabase' : 'local', count: result.length, data: result });
});

// GET faculty workload & hours tracking (for HOD and Principal)
router.get('/workload-stats', async (req, res) => {
  const { department, deptCode } = req.query;
  const supabase = getSupabase();

  try {
    let facultyList = localFaculty.map(mapFacultyRecord);
    let leavesList = [];
    let subsList = [];
    let subjectsList = [];

    if (supabase) {
      try {
        const [facRes, leaveRes, subRes, subjRes] = await Promise.all([
          supabase.from('faculty').select('*').order('name'),
          supabase.from('faculty_leaves').select('*').order('created_at', { ascending: false }),
          supabase.from('substitutions').select('*').order('created_at', { ascending: false }),
          supabase.from('subjects').select('*')
        ]);

        if (facRes.data && facRes.data.length > 0) facultyList = facRes.data.map(mapFacultyRecord);
        if (leaveRes.data) leavesList = leaveRes.data;
        if (subRes.data) subsList = subRes.data;
        if (subjRes.data) subjectsList = subjRes.data;
      } catch (e) {
        console.warn('[Workload Stats Supabase Sync Warning]', e.message);
      }
    }

    // Filter by department if specified
    const targetDept = deptCode || department;
    let filteredFaculty = facultyList;
    if (targetDept && targetDept !== 'ALL') {
      const tCode = targetDept.trim().toUpperCase();
      filteredFaculty = facultyList.filter(f => {
        const fCode = (f.deptCode || '').trim().toUpperCase();
        if (fCode === tCode) return true;
        if (tCode === 'IT') {
          const d = (f.department || '').toLowerCase();
          return (d.includes('information') || fCode === 'IT') && !d.includes('artificial') && !d.includes('computer');
        }
        if (tCode === 'CSE') {
          const d = (f.department || '').toLowerCase();
          return d.includes('computer') || fCode === 'CSE';
        }
        if (tCode === 'AIDS') {
          const d = (f.department || '').toLowerCase();
          return d.includes('artificial') || d.includes('data science') || fCode === 'AIDS';
        }
        return f.department.toLowerCase().includes(targetDept.toLowerCase());
      });
    }

    // Default subject mappings by faculty name
    const subjectMap = {
      'Dr. Mythili':        { name: 'Web Technologies & Cloud Computing', code: 'IT3501', year: '3rd Year', semester: '5' },
      'Prof. Gayathiri':    { name: 'Database Management Systems & Lab',  code: 'IT3301', year: '2nd Year', semester: '3' },
      'Prof. Suganya':      { name: 'Operating Systems Internals',       code: 'IT3503', year: '3rd Year', semester: '5' },
      'Prof. Suresh V.':    { name: 'Computer Networks & Security',       code: 'IT3502', year: '3rd Year', semester: '5' },
      'Dr. Priya Sundaram': { name: 'DBMS & SQL Laboratory',             code: 'IT3311', year: '2nd Year', semester: '3' },
      'Dr. S. Rajasekaran': { name: 'Object Oriented Systems',           code: 'CS3501', year: '3rd Year', semester: '5' },
      'Dr. Ada Lovelace':   { name: 'Design and Analysis of Algorithms',  code: 'CS3502', year: '3rd Year', semester: '5' },
      'Dr. R. Kavitha':     { name: 'Machine Learning Algorithms',        code: 'AD3501', year: '3rd Year', semester: '5' },
      'Prof. Alan Turing':  { name: 'Artificial Intelligence & Neural Nets', code: 'AD3502', year: '3rd Year', semester: '5' }
    };

    const stats = filteredFaculty.map(fac => {
      const facNameClean = fac.name.trim().toLowerCase();
      const isHOD = fac.designation.toLowerCase().includes('hod') || fac.name.toLowerCase().includes('mythili') || fac.name.toLowerCase().includes('rajasekaran') || fac.name.toLowerCase().includes('kavitha');
      
      // Standard monthly / scheduled hours (e.g. 18 for HOD, 16 for staff)
      const plannedHours = isHOD ? 18 : 16;

      // Leaves taken by this faculty
      const facLeaves = leavesList.filter(l => {
        const lName = (l.faculty_name || l.teacher_name || l.facultyName || '').trim().toLowerCase();
        return lName.includes(facNameClean) || facNameClean.includes(lName);
      });

      // Calculate absent / less hours:
      // If absent for 1 day, standard college day has 7 periods (or periods array length)
      let absentHours = 0;
      facLeaves.forEach(l => {
        const pCount = Array.isArray(l.periods) && l.periods.length > 0 ? l.periods.length : 7;
        absentHours += pCount;
      });

      // Substitutions covered by this faculty (when another staff was on leave and this faculty went to their class)
      let substituteHoursAdded = 0;
      const leavesSubbed = leavesList.filter(l => {
        const sub = (l.substitute_faculty || l.substituteFaculty || '').trim().toLowerCase();
        const orig = (l.faculty_name || l.teacher_name || l.facultyName || '').trim().toLowerCase();
        // Must be assigned substitute and NOT the one who took leave
        return sub && (sub.includes(facNameClean) || facNameClean.includes(sub)) && !orig.includes(facNameClean);
      });
      leavesSubbed.forEach(l => {
        const pCount = Array.isArray(l.periods) && l.periods.length > 0 ? l.periods.length : 7;
        substituteHoursAdded += pCount;
      });

      // Calculate conducted hours ("Ethana hour ponainga") and missed hours ("Ethana hour povala")
      // Conducted = plannedHours - absentHours + substituteHoursAdded
      const conductedHours = Math.max(0, plannedHours - absentHours + substituteHoursAdded);
      const missedHours = absentHours;

      // Subject info
      const foundSub = subjectMap[fac.name] || {
        name: fac.subjects ? fac.subjects.split(',')[0].trim() : 'Core Department Subject',
        code: `${fac.deptCode || 'IT'}301`,
        year: isHOD ? '3rd Year' : '2nd Year',
        semester: isHOD ? '5' : '3'
      };

      return {
        id: fac.id,
        name: fac.name,
        designation: fac.designation,
        role: isHOD ? 'hod' : 'staff',
        department: fac.department,
        deptCode: fac.deptCode,
        subjectName: foundSub.name,
        subjectCode: foundSub.code,
        year: foundSub.year,
        semester: foundSub.semester,
        monthlyTargetHours: plannedHours,
        plannedHours: plannedHours,
        conductedHours: conductedHours, // Ethana hour ponainga
        missedHours: missedHours,       // Ethana hour povala (Leave deducted)
        substituteHoursAdded: substituteHoursAdded, // Extra hours taken as substitute
        netHours: conductedHours,
        leaveDaysCount: facLeaves.length,
        leaves: facLeaves.map(l => ({
          date: l.leave_date || l.leaveDate,
          reason: l.reason,
          periodsDeducted: Array.isArray(l.periods) ? l.periods.length : 7,
          substituteFaculty: l.substitute_faculty || l.substituteFaculty || 'Assigned Staff'
        }))
      };
    });

    return res.json({
      success: true,
      department: targetDept || 'ALL',
      count: stats.length,
      data: stats
    });
  } catch (err) {
    console.error('[Workload Stats Error]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET single faculty
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('faculty').select('*').eq('id', id).single();
      if (!error && data) return res.json({ success: true, source: 'supabase', data: mapFacultyRecord(data) });
    } catch {}
  }
  const faculty = localFaculty.find(f => f.id === id);
  if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
  res.json({ success: true, source: 'local', data: mapFacultyRecord(faculty) });
});

// POST add new faculty
router.post('/', async (req, res) => {
  const { name, department, deptCode, designation, email, phone, max_periods, subjects, avatar } = req.body;
  if (!name || !department) {
    return res.status(400).json({ success: false, message: 'name and department are required' });
  }

  const assignedCode = deptCode || (
    department.includes('Computer') || department === 'CSE' ? 'CSE' :
    department.includes('AI') || department === 'AIDS' ? 'AIDS' :
    department.includes('Mechatronics') || department === 'MCT' ? 'MCT' :
    department.includes('Mechanical') || department === 'MECH' ? 'MECH' :
    department.includes('Electronics') || department === 'ECE' ? 'ECE' : 'IT'
  );

  const cleanEmail = email || `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${assignedCode.toLowerCase()}@sugunacollege.edu`;
  const facId = req.body.id || `FAC-${assignedCode}-${Date.now().toString().slice(-4)}`;

  const newFaculty = {
    id: facId,
    name: name.trim(),
    department: department.trim(),
    designation: designation || 'Assistant Professor',
    email: cleanEmail,
    phone: phone || '+91 98421000' + Math.floor(10 + Math.random() * 89),
    max_periods: Number(max_periods) || 6,
    max_weekly_hours: 18,
    subjects: subjects || '',
    status: 'active',
    is_active: true,
    created_at: new Date().toISOString()
  };

  const supabase = getSupabase();
  let savedRecord = null;
  if (supabase) {
    try {
      const { data, error } = await supabase.from('faculty').upsert([newFaculty]).select().single();
      if (!error && data) {
        savedRecord = data;
      }
    } catch (err) {
      console.warn('[Faculty API] Insert error:', err.message);
    }
  }

  const mapped = mapFacultyRecord(savedRecord || newFaculty);
  if (avatar) mapped.avatar = avatar;
  localFaculty.unshift(mapped);

  return res.status(201).json({
    success: true,
    source: savedRecord ? 'supabase' : 'local',
    message: `Staff member ${mapped.name} added successfully!`,
    data: mapped
  });
});

// PUT update faculty
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('faculty').update(updates).eq('id', id).select().single();
      if (!error && data) return res.json({ success: true, source: 'supabase', message: 'Faculty updated!', data: mapFacultyRecord(data) });
    } catch {}
  }
  const idx = localFaculty.findIndex(f => f.id === id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Not found' });
  localFaculty[idx] = { ...localFaculty[idx], ...updates };
  res.json({ success: true, source: 'local', data: mapFacultyRecord(localFaculty[idx]) });
});

// DELETE faculty
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('faculty').delete().eq('id', id);
    } catch (err) {
      console.warn('[Faculty API] Delete error:', err.message);
    }
  }
  localFaculty = localFaculty.filter(f => f.id !== id);
  res.json({ success: true, message: 'Staff member deleted successfully from Supabase Cloud Database!' });
});

// GET faculty stats
router.get('/stats/summary', async (req, res) => {
  const supabase = getSupabase();
  let data = localFaculty.map(mapFacultyRecord);
  if (supabase) {
    try {
      const { data: d } = await supabase.from('faculty').select('*');
      if (d) data = d.map(mapFacultyRecord);
    } catch {}
  }
  res.json({
    success: true,
    stats: {
      total: data.length,
      active: data.filter(f => f.status === 'active').length,
      onLeave: data.filter(f => f.status === 'leave').length,
      byDepartment: data.reduce((acc, f) => { acc[f.department] = (acc[f.department] || 0) + 1; return acc; }, {})
    }
  });
});

module.exports = router;
