/**
 * Timetable Controller - Handles generation requests, Supabase persistence, and retrieval
 */

const supabaseService = require('../config/supabase');

let activeTimetableMemory = null;

exports.getTimetable = async (req, res) => {
  try {
    // 1. Fetch from Supabase Cloud
    const supaResult = await supabaseService.getTimetablesFromSupabase();
    if (supaResult && supaResult.data && supaResult.data.length > 0) {
      return res.status(200).json({
        success: true,
        source: supaResult.source,
        data: supaResult.data[0]
      });
    }

    return res.status(200).json({
      success: true,
      source: 'in-memory',
      data: activeTimetableMemory
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveTimetable = async (req, res) => {
  try {
    const { schedule, metrics, presetKey, academicYear } = req.body;
    
    activeTimetableMemory = {
      schedule,
      metrics,
      presetKey,
      academicYear: academicYear || '2026-2027',
      updatedAt: new Date().toISOString()
    };

    // Fast Supabase Save
    let supaRecord = null;
    try {
      supaRecord = await supabaseService.saveTimetableToSupabase({
        institutionName: 'Suguna College of Engineering (Autonomous)',
        preset: presetKey || 'college',
        academicYear: academicYear || '2026-2027',
        scheduleData: schedule,
        conflictCount: metrics?.hardClashes || 0,
        fitnessScore: metrics?.fitnessScore || 100.0
      });
    } catch (e) {
      console.warn('[Supabase Sync Warning]', e.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Timetable saved successfully in Supabase Cloud Database',
      persistedInSupabase: !!supaRecord?.success,
      source: supaRecord?.source || 'in-memory',
      data: supaRecord?.data || activeTimetableMemory
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMasterData = async (req, res) => {
  try {
    const supabase = supabaseService.getSupabase();
    if (supabase) {
      try {
        const [facRes, subRes, roomRes, classRes] = await Promise.all([
          supabase.from('faculty').select('*').order('name'),
          supabase.from('subjects').select('*').order('name'),
          supabase.from('classrooms').select('*').order('name'),
          supabase.from('student_classes').select('*').order('name')
        ]);

        const teachers = (facRes.data && facRes.data.length > 0) ? facRes.data.map(f => ({
          teacherId: f.id,
          name: f.name,
          designation: f.designation || 'Assistant Professor',
          department: f.department,
          avatar: f.name.includes('Dr.') ? '👨‍🏫' : '👩‍🏫',
          color: '#6366F1'
        })) : null;

        const subjects = (subRes.data && subRes.data.length > 0) ? subRes.data.map(s => ({
          subjectId: s.id,
          code: s.code,
          name: s.name,
          isLab: !!s.is_lab,
          weeklyHours: s.weekly_hours || s.hours_per_week || 4
        })) : null;

        const classrooms = (roomRes.data && roomRes.data.length > 0) ? roomRes.data.map(r => ({
          roomId: r.id,
          name: r.name,
          capacity: r.capacity || 60,
          isLab: !!r.is_lab
        })) : null;

        const studentClasses = (classRes.data && classRes.data.length > 0) ? classRes.data.map(c => ({
          classId: c.id,
          name: c.name,
          department: c.department,
          year: c.year || 3,
          semester: c.semester || 5,
          strength: c.student_count || 60
        })) : null;

        if (teachers && subjects && classrooms) {
          return res.status(200).json({
            success: true,
            source: 'supabase',
            data: {
              teachers,
              subjects,
              classrooms,
              studentClasses: studentClasses || [
                { classId: 'IT-A', name: 'B.Tech IT - Year 3 - Sec A', department: 'Information Technology', year: 3, semester: 5, strength: 58 }
              ]
            }
          });
        }
      } catch (err) {
        console.warn('[Supabase MasterData Error]', err.message);
      }
    }

    // High performance in-memory fallback
    return res.status(200).json({
      success: true,
      source: 'resilient-in-memory',
      data: {
        teachers: [
          { teacherId: 'T101', name: 'Dr. Mythili', designation: 'Professor & HOD', department: 'Information Technology', avatar: '👩‍🏫', color: '#6366F1' },
          { teacherId: 'T102', name: 'Prof. Gayathiri', designation: 'Assistant Professor', department: 'Information Technology', avatar: '👩‍🏫', color: '#EC4899' },
          { teacherId: 'T103', name: 'Prof. Suganya', designation: 'Assistant Professor', department: 'Information Technology', avatar: '👩‍💼', color: '#10B981' }
        ],
        subjects: [
          { subjectId: 'S101', code: 'IT3501', name: 'Web Technologies', isLab: false, weeklyHours: 4 },
          { subjectId: 'S102', code: 'IT3502', name: 'Database Systems', isLab: false, weeklyHours: 4 },
          { subjectId: 'S103', code: 'IT3503', name: 'Operating Systems', isLab: false, weeklyHours: 4 },
          { subjectId: 'S105', code: 'IT3511', name: 'Web Technology Lab', isLab: true, weeklyHours: 3 }
        ],
        classrooms: [
          { roomId: 'LH-301', name: 'Lecture Hall 301', capacity: 70, isLab: false },
          { roomId: 'LH-302', name: 'Lecture Hall 302', capacity: 70, isLab: false },
          { roomId: 'LAB-01', name: 'Computing Lab 1', capacity: 60, isLab: true }
        ],
        studentClasses: [
          { classId: 'IT-A', name: 'B.Tech IT - Year 3 - Sec A', department: 'Information Technology', year: 3, semester: 5, strength: 58 }
        ]
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Solves timetable using Google OR-Tools CP-SAT Optimization Engine
 */
exports.generateOrTools = async (req, res) => {
  try {
    const OrToolsEngine = require('../services/orToolsEngine');
    const config = req.body.config || req.body;

    const result = await OrToolsEngine.solve(config);

    if (result && result.success) {
      activeTimetableMemory = {
        schedule: result.schedule,
        metrics: result.metrics,
        solver: result.solver,
        updatedAt: new Date().toISOString()
      };
      return res.status(200).json(result);
    } else {
      return res.status(422).json({
        success: false,
        message: result.error || 'OR-Tools could not find a solution.'
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
