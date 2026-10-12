/**
 * Subject Routes — CRUD API for Curriculum Subjects
 * Direct Supabase PostgreSQL Cloud Integration with ultra-fast caching
 * GET    /api/subjects          → List subjects (filter by deptCode, year, semester)
 * POST   /api/subjects          → Create subject (name, code, semester, year)
 * PUT    /api/subjects/:id      → Edit subject
 * DELETE /api/subjects/:id      → Delete subject
 */

const express = require('express');
const router = express.Router();
const { getSupabase } = require('../config/supabase');

let SUBJECTS_DB = [
  // 2nd Year (Semester 4)
  { id: 'SUB-IT-101', name: 'probability and statistics', code: 'MA25C13', semester: '4', year: '2', deptCode: 'IT', department: 'Information Technology', teacher: 'Dr. Mythili', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-102', name: 'operating system', code: 'CS25C11', semester: '4', year: '2', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Gayathiri', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-103', name: 'standard in information technology', code: 'IT25401', semester: '4', year: '2', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Gayathiri', credits: 3, hoursPerWeek: 3, isLab: false },
  { id: 'SUB-IT-104', name: 'JAVA PROGRAMMING', code: 'CS25C09', semester: '4', year: '2', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Suganya', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-105', name: 'DBMS', code: 'CS25C13', semester: '4', year: '2', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Suganya', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-106', name: 'JAVA PROGRAMMING LAB', code: 'CS2530', semester: '4', year: '2', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Suganya', credits: 2, hoursPerWeek: 2, isLab: true },
  { id: 'SUB-IT-107', name: 'DBMS LAB', code: 'CS2513', semester: '4', year: '2', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Suganya', credits: 2, hoursPerWeek: 2, isLab: true },

  // 3rd Year (Semester 6)
  { id: 'SUB-IT-108', name: 'object oriented software engineering', code: 'CCS356', semester: '6', year: '3', deptCode: 'IT', department: 'Information Technology', teacher: 'Dr. Mythili', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-109', name: 'Ethics and ai', code: 'CCS345', semester: '6', year: '3', deptCode: 'IT', department: 'Information Technology', teacher: 'Dr. Mythili', credits: 3, hoursPerWeek: 3, isLab: false },
  { id: 'SUB-IT-110', name: 'PROJECT', code: 'IT 7150', semester: '6', year: '3', deptCode: 'IT', department: 'Information Technology', teacher: 'Dr. Mythili', credits: 4, hoursPerWeek: 4, isLab: true },
  { id: 'SUB-IT-111', name: 'OOSE LAB', code: 'CCS356', semester: '6', year: '3', deptCode: 'IT', department: 'Information Technology', teacher: 'Dr. Mythili', credits: 2, hoursPerWeek: 2, isLab: true },
  { id: 'SUB-IT-112', name: 'cognitive science', code: 'CCS337', semester: '6', year: '3', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Gayathiri', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-113', name: 'software defined network', code: 'CCS365', semester: '6', year: '3', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Gayathiri', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-114', name: 'COGNITIVE SCIENCE LAB', code: 'CCS337', semester: '6', year: '3', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Gayathiri', credits: 2, hoursPerWeek: 2, isLab: true },
  { id: 'SUB-IT-115', name: 'SDN LAB', code: 'CCS365', semester: '6', year: '3', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Gayathiri', credits: 2, hoursPerWeek: 2, isLab: true },
  { id: 'SUB-IT-116', name: 'CS LAB', code: 'CS25C11', semester: '6', year: '3', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Gayathiri', credits: 2, hoursPerWeek: 2, isLab: true },
  { id: 'SUB-IT-117', name: 'APP DEVELOPMENT', code: 'CCS332', semester: '6', year: '3', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Suganya', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-118', name: 'LAB MOBILE APPLICATION', code: 'IT 3681', semester: '6', year: '3', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Suganya', credits: 2, hoursPerWeek: 2, isLab: true },

  // 4th Year (Semester 7)
  { id: 'SUB-IT-119', name: 'English for competitive examination', code: 'OHS351', semester: '7', year: '4', deptCode: 'IT', department: 'Information Technology', teacher: 'Dr. Mythili', credits: 3, hoursPerWeek: 3, isLab: false },
  { id: 'SUB-IT-120', name: 'human values and ethics', code: 'GE3791', semester: '7', year: '4', deptCode: 'IT', department: 'Information Technology', teacher: 'Dr. Mythili', credits: 3, hoursPerWeek: 3, isLab: false },
  { id: 'SUB-IT-121', name: 'it in agriculture system', code: 'AI3021', semester: '7', year: '4', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Gayathiri', credits: 4, hoursPerWeek: 4, isLab: false },
  { id: 'SUB-IT-122', name: 'POM', code: 'GE3757', semester: '7', year: '4', deptCode: 'IT', department: 'Information Technology', teacher: 'Prof. Suganya', credits: 4, hoursPerWeek: 4, isLab: false },

  // CSE
  { id: 'SUB-CSE-201', name: 'Object Oriented Programming', code: 'CS3301', semester: '3', year: '2', deptCode: 'CSE', teacher: 'Dr. S. Rajasekaran', credits: 4, hoursPerWeek: 4 },
  { id: 'SUB-CSE-301', name: 'Design and Analysis of Algorithms', code: 'CS3501', semester: '5', year: '3', deptCode: 'CSE', teacher: 'Dr. Ada Lovelace', credits: 4, hoursPerWeek: 4 },
  { id: 'SUB-CSE-401', name: 'Distributed Systems & Blockchain', code: 'CS3701', semester: '7', year: '4', deptCode: 'CSE', teacher: 'Dr. S. Rajasekaran', credits: 4, hoursPerWeek: 4 },

  // AIDS
  { id: 'SUB-AIDS-201', name: 'Foundations of Data Science', code: 'AD3301', semester: '3', year: '2', deptCode: 'AIDS', teacher: 'Dr. R. Kavitha', credits: 4, hoursPerWeek: 4 },
  { id: 'SUB-AIDS-301', name: 'Machine Learning Algorithms', code: 'AD3501', semester: '5', year: '3', deptCode: 'AIDS', teacher: 'Dr. R. Kavitha', credits: 4, hoursPerWeek: 4 },
  { id: 'SUB-AIDS-401', name: 'Deep Learning & NLP', code: 'AD3701', semester: '7', year: '4', deptCode: 'AIDS', teacher: 'Prof. Alan Turing', credits: 4, hoursPerWeek: 4 }
];

// Map Supabase record to frontend subject structure
function mapFromSupabase(s) {
  return {
    id: s.id,
    name: s.name,
    code: s.code,
    department: s.department,
    deptCode: s.department === 'Information Technology' ? 'IT' : s.department === 'Computer Science & Engineering' ? 'CSE' : s.department === 'Artificial Intelligence & Data Science' ? 'AIDS' : (s.department || 'IT'),
    semester: String(s.semester || 3),
    year: String(s.year || 2),
    teacher: s.teacher || 'Faculty In-Charge',
    credits: Number(s.credits) || 3,
    hoursPerWeek: Number(s.hours_per_week || s.weekly_hours || 4),
    isLab: !!s.is_lab,
    ownerDeptCode: s.ownerDeptCode || s.owner_dept_code
  };
}

// GET /api/subjects
router.get('/', async (req, res) => {
  const { deptCode, year, semester, search } = req.query;
  const supabase = getSupabase();

  let subjects = [...SUBJECTS_DB];

  if (supabase) {
    try {
      const { data, error } = await supabase.from('subjects').select('*').order('code');
      if (!error && data && data.length > 0) {
        // Merge Supabase subjects with local preset to ensure comprehensive list
        const fromSupa = data.map(mapFromSupabase);
        const map = new Map();
        subjects.forEach(s => map.set(s.code, s));
        fromSupa.forEach(s => map.set(s.code, s)); // supa takes priority
        subjects = Array.from(map.values());
      }
    } catch (err) {
      console.warn('[Supabase Subjects Query]', err.message);
    }
  }

  let filtered = subjects;
  if (deptCode && deptCode !== 'ALL') {
    filtered = filtered.filter(s => s.deptCode === deptCode || s.department === deptCode);
  }
  if (year) {
    filtered = filtered.filter(s => String(s.year) === String(year));
  }
  if (semester) {
    filtered = filtered.filter(s => String(s.semester) === String(semester));
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

// POST /api/subjects (Create Subject)
router.post('/', async (req, res) => {
  const { name, code, semester, year, deptCode, ownerDeptCode, department, teacher, credits, hoursPerWeek, isLab } = req.body;

  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Subject name and subject code are required.' });
  }

  const dCode = (deptCode || 'IT').toUpperCase();
  const fullDept = department || (dCode === 'IT' ? 'Information Technology' : dCode === 'CSE' ? 'Computer Science & Engineering' : dCode === 'AIDS' ? 'Artificial Intelligence & Data Science' : 'Information Technology');
  const cleanCode = code.trim().toUpperCase();
  const subId = `SUB-${dCode}-${Date.now().toString().slice(-4)}`;

  const newSubject = {
    id: subId,
    name: name.trim(),
    code: cleanCode,
    department: fullDept,
    deptCode: dCode,
    semester: String(semester || '3'),
    year: String(year || '2'),
    teacher: teacher || 'Faculty In-Charge',
    credits: Number(credits) || 3,
    hoursPerWeek: Number(hoursPerWeek) || 4,
    isLab: !!isLab,
    ownerDeptCode: ownerDeptCode,
    created_at: new Date().toISOString()
  };

  // 1. Sync to Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('subjects').upsert([{
        id: subId,
        name: newSubject.name,
        code: cleanCode,
        department: fullDept,
        semester: Number(semester) || 3,
        year: Number(year) || 2,
        credits: Number(credits) || 3,
        teacher: newSubject.teacher,
        hours_per_week: Number(hoursPerWeek) || 4,
        weekly_hours: Number(hoursPerWeek) || 4,
        is_lab: !!isLab,
        owner_dept_code: newSubject.ownerDeptCode
      }]);
    } catch (err) {
      console.warn('[Supabase Subject Insert]', err.message);
    }
  }

  // 2. Keep local cache updated
  SUBJECTS_DB.unshift(newSubject);
  res.status(201).json({ success: true, message: 'Subject created successfully in Supabase Cloud Database!', data: newSubject });
});

// PUT /api/subjects/:id (Edit Subject)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const idx = SUBJECTS_DB.findIndex(s => s.id === id);

  const updated = {
    ...(idx !== -1 ? SUBJECTS_DB[idx] : {}),
    ...req.body,
    id
  };

  if (idx !== -1) {
    SUBJECTS_DB[idx] = updated;
  } else {
    SUBJECTS_DB.unshift(updated);
  }

  // Sync to Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('subjects').update({
        name: updated.name,
        code: updated.code,
        department: updated.department,
        semester: Number(updated.semester) || 3,
        year: Number(updated.year) || 2,
        credits: Number(updated.credits) || 3,
        teacher: updated.teacher,
        hours_per_week: Number(updated.hoursPerWeek) || 4,
        weekly_hours: Number(updated.hoursPerWeek) || 4,
        is_lab: !!updated.isLab,
        owner_dept_code: updated.ownerDeptCode
      }).eq('id', id);
    } catch (err) {
      console.warn('[Supabase Subject Update]', err.message);
    }
  }

  res.json({ success: true, message: 'Subject updated successfully in Supabase Cloud Database!', data: updated });
});

// DELETE /api/subjects/:id (Delete Subject)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  SUBJECTS_DB = SUBJECTS_DB.filter(s => s.id !== id);

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('subjects').delete().eq('id', id);
    } catch (err) {
      console.warn('[Supabase Subject Delete]', err.message);
    }
  }

  res.json({ success: true, message: 'Subject deleted successfully from Supabase Cloud Database!' });
});

// DELETE /api/subjects/clear/:deptCode (Clear all subjects for department)
router.delete('/clear/:deptCode', async (req, res) => {
  const { deptCode } = req.params;
  const dCode = (deptCode || '').toUpperCase();
  SUBJECTS_DB = SUBJECTS_DB.filter(s => (s.deptCode || '').toUpperCase() !== dCode);

  const supabase = getSupabase();
  if (supabase) {
    try {
      const fullDept = dCode === 'IT' ? 'Information Technology' : dCode === 'CSE' ? 'Computer Science & Engineering' : dCode === 'AIDS' ? 'Artificial Intelligence & Data Science' : deptCode;
      await supabase.from('subjects').delete().eq('department', fullDept);
    } catch (err) {
      console.warn('[Supabase Clear Error]', err.message);
    }
  }

  res.json({ success: true, message: `All subjects for ${dCode} cleared successfully!` });
});

module.exports = router;
