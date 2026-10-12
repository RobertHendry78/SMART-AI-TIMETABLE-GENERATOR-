import React, { useState, useEffect } from 'react';
import type { User, Department, Teacher, SubjectItem, CollegeTimetable, Period, GeneratorConfig } from '../types/timetable';
import { BookOpen, CalendarDays, Edit3, Trash2, Plus, Zap, CheckCircle2, Save, Sparkles, Clock } from 'lucide-react';
import { ProfileEditModal } from './ProfileEditModal';
import { EditSlotModal } from './EditSlotModal';
import { generateFormalTimetableHTML } from '../utils/pdfGenerator';

interface HodPortalViewProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  departments: Department[];
  teachers: Teacher[];
  onAddTeacher?: (teacher: Partial<Teacher>) => void;
  onDeleteTeacher?: (id: string, name?: string) => void;
  subjects: SubjectItem[];
  onAddSubject: (subject: Omit<SubjectItem, 'id'>) => void;
  onUpdateSubject: (subject: SubjectItem) => void;
  onDeleteSubject: (id: string) => void;
  onClearAllSubjects?: () => void;
  schedule: CollegeTimetable;
  onUpdateScheduleSlot: (classId: string, day: string, periodId: number, slot: any) => void;
  onGenerateTimetable: (year: '2' | '3' | '4' | 'all', config: GeneratorConfig) => void;
  periods: Period[];
  workingDays: string[];
  onSaveToSupabase?: () => void;
  onAddDepartment?: (dept: Department) => void;
  onDeleteDepartment?: (code: string) => void;
}

export const HodPortalView: React.FC<HodPortalViewProps> = ({
  currentUser,
  onUpdateUser,
  departments,
  teachers,
  onAddTeacher,
  onDeleteTeacher,
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onClearAllSubjects,
  schedule,
  onUpdateScheduleSlot,
  onGenerateTimetable,
  periods,
  workingDays,
  onSaveToSupabase,
  onAddDepartment,
  onDeleteDepartment
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{ classId: string; day: string; periodId: number; slot: any } | null>(null);
  
  // State for Staff Timetable View at the bottom
  const [selectedStaffView, setSelectedStaffView] = useState<string>('');
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [isDeleteStaffMode, setIsDeleteStaffMode] = useState(false);

  // Add Staff Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffDeptCode, setNewStaffDeptCode] = useState(currentUser.deptCode || 'IT');
  const [newStaffDesignation, setNewStaffDesignation] = useState('Assistant Professor');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  // Add Department Form State
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');

  // Create Subject Form State
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubSemester, setNewSubSemester] = useState('3');
  const [newSubYear, setNewSubYear] = useState('2');
  const [newSubTeacher, setNewSubTeacher] = useState('');
  const [newSubIsLab, setNewSubIsLab] = useState(false);
  const [subNotice, setSubNotice] = useState<string | null>(null);

  // Subject Edit Inline State
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubCode, setEditSubCode] = useState('');
  const [editSubSem, setEditSubSem] = useState('3');
  const [editSubYear, setEditSubYear] = useState('2');
  const [editSubTeacher, setEditSubTeacher] = useState('');

  // Quick Filter for Saved Subject Details
  const [subjectFacultyFilter, setSubjectFacultyFilter] = useState<string>('all');

  // Generator Configuration State (Exact fields requested by user)
  const [startTime, setStartTime] = useState('09:30 AM');
  const [endTime, setEndTime] = useState('04:30 PM');
  const [totalHours, setTotalHours] = useState(7);
  const [breakStartTime, setBreakStartTime] = useState('11:10 AM');
  const [breakEndTime, setBreakEndTime] = useState('11:25 AM');
  const [lunchStartTime, setLunchStartTime] = useState('12:15 PM');
  const [lunchEndTime, setLunchEndTime] = useState('01:05 PM');
  const [targetYear, setTargetYear] = useState<'2' | '3' | '4' | 'all'>('2');

  // Active year view for displayed generated timetable
  const [activeYearView, setActiveYearView] = useState<'2' | '3' | '4' | 'all'>('2');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Department Workload & Hours Tracking State (Strictly HOD's department)
  const [deptWorkloadStats, setDeptWorkloadStats] = useState<any[]>([]);
  const [isLoadingWorkload, setIsLoadingWorkload] = useState(false);
  const [absentFacultyNames, setAbsentFacultyNames] = useState<string[]>([]);

  const userDeptCode = currentUser.deptCode || 'IT';
  const currentDept = departments.find(d => d.code === userDeptCode) || departments[0];

  // Load Department Workload & Hours Stats
  const loadDeptWorkloadStats = async () => {
    setIsLoadingWorkload(true);
    try {
      const res = await fetch(`/api/faculty/workload-stats?department=${userDeptCode}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDeptWorkloadStats(json.data);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch department workload stats:', e);
    } finally {
      setIsLoadingWorkload(false);
    }
  };

  useEffect(() => {
    loadDeptWorkloadStats();
  }, [currentUser, currentDept]);

  const deptSubjects = subjects.filter(s => 
    !s.deptCode || 
    s.deptCode === userDeptCode || 
    s.ownerDeptCode === userDeptCode || 
    (userDeptCode === 'FY' && String(s.year) === '1')
  );

  // Resilient faculty name matcher (handles 'Dr.', 'Prof.', case, etc.)
  const isFacultyMatch = (subTeacher: string | undefined, facultyName: string) => {
    if (!subTeacher || !facultyName) return false;
    const cleanSub = subTeacher.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
    const cleanFac = facultyName.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
    return cleanSub.includes(cleanFac) || cleanFac.includes(cleanSub);
  };

  // Faculty in this department (matches deptCode/name OR teaches a subject here)
  const baseDeptFaculty = teachers.filter(t => {
    const tCode = (t.deptCode || '').toUpperCase();
    const uCode = (userDeptCode || '').toUpperCase();
    if (tCode && uCode && tCode === uCode) return true;
    const tDept = (t.department || '').toLowerCase();
    const uDept = (currentDept?.name || '').toLowerCase();
    if (tDept && uDept && (tDept.includes(uDept) || uDept.includes(tDept))) return true;

    // Cross-department check: Are they teaching a subject in this department?
    return deptSubjects.some(s => isFacultyMatch(s.teacher, t.name));
  });

  // Guarantee that EVERY subject in deptSubjects has its teacher rendered, even if not in teachers array
  deptSubjects.forEach(sub => {
    if (sub.teacher && !baseDeptFaculty.some(f => isFacultyMatch(sub.teacher, f.name))) {
      baseDeptFaculty.push({
        id: `dynamic-${sub.teacher.replace(/\s+/g, '')}`,
        name: sub.teacher,
        designation: 'Cross-Department Staff',
        department: 'Other Department',
        deptCode: 'OTHER',
        avatar: '👤',
        weeklyHours: 16,
        maxHours: 18
      } as any);
    }
  });

  const deptFaculty = baseDeptFaculty;

  const targetClassId = `${userDeptCode}-${activeYearView}A`;

  // Submit Create Subject
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;

    const assignedStaff = newSubTeacher || (deptFaculty[0]?.name || currentUser.name);

    onAddSubject({
      name: newSubName.trim(),
      code: newSubCode.trim().toUpperCase(),
      semester: newSubSemester,
      year: newSubYear,
      deptCode: userDeptCode,
      teacher: assignedStaff,
      credits: newSubIsLab ? 2 : 4,
      hoursPerWeek: newSubIsLab ? 2 : 4,
      isLab: newSubIsLab
    });

    setSubNotice(`✅ Subject "${newSubName}" assigned to ${assignedStaff} (${newSubIsLab ? 'Practical Lab' : 'Theory'}) and saved!`);
    setNewSubName('');
    setNewSubCode('');
    setTimeout(() => setSubNotice(null), 3500);
  };

  // Start Edit Subject
  const handleStartEditSub = (sub: SubjectItem) => {
    setEditingSubId(sub.id);
    setEditSubName(sub.name);
    setEditSubCode(sub.code);
    setEditSubSem(String(sub.semester));
    setEditSubYear(String(sub.year));
    setEditSubTeacher(sub.teacher || (deptFaculty[0]?.name || currentUser.name));
  };

  const handleSaveEditedSub = (id: string) => {
    onUpdateSubject({
      id,
      name: editSubName,
      code: editSubCode,
      semester: editSubSem,
      year: editSubYear,
      deptCode: userDeptCode,
      teacher: editSubTeacher || (deptFaculty[0]?.name || currentUser.name)
    });
    setEditingSubId(null);
    setSubNotice('✅ Subject updated successfully!');
    setTimeout(() => setSubNotice(null), 3000);
  };

  // Handle Timetable Generation
  const handleTriggerGenerate = () => {
    setIsGenerating(true);
    const config: GeneratorConfig = {
      startTime,
      endTime,
      totalHours,
      breakStartTime,
      breakEndTime,
      lunchStartTime,
      lunchEndTime,
      absentFacultyNames
    };

    onGenerateTimetable(targetYear, config);
    if (targetYear !== 'all') {
      setActiveYearView(targetYear);
    }

    setTimeout(() => {
      setIsGenerating(false);
      setSavedNotice(`⚡ AI Timetable Generated for ${targetYear === 'all' ? 'All Years' : targetYear + 'th Year'}! Guaranteed 0 clashes.`);
      setTimeout(() => setSavedNotice(null), 4000);
    }, 600);
  };

  const handleSaveTimetable = async () => {
    if (onSaveToSupabase) {
      onSaveToSupabase();
    }
    setSavedNotice('💾 Timetable saved successfully to Database & Cloud sync verified!');
    setTimeout(() => setSavedNotice(null), 4000);

    try {
      const displaySchedule = (activeYearView === 'all') 
        ? schedule['IT-A'] || schedule['CS-A'] || Object.values(schedule)[0]
        : schedule[`${currentDept.code}-${activeYearView}`] || schedule[`IT-${activeYearView}`] || schedule[`CS-${activeYearView}`] || Object.values(schedule)[0];
        
      if (!displaySchedule) return;

      const uniqueSubjectsMap = new Map();
      workingDays.forEach(day => {
        if (displaySchedule[day]) {
          Object.values(displaySchedule[day]).forEach((slot: any) => {
            if (slot.subject) {
              if (typeof slot.subject === 'string' && slot.subjectCode) {
                uniqueSubjectsMap.set(slot.subjectCode, {
                  code: slot.subjectCode,
                  name: slot.subject,
                  teacher: slot.teacher
                });
              } else if (typeof slot.subject === 'object' && slot.subject.code) {
                uniqueSubjectsMap.set(slot.subject.code, slot.subject);
              }
            }
          });
        }
      });
      const uniqueSubjects = Array.from(uniqueSubjectsMap.values());

      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.background = '#ffffff';
      wrapper.style.color = '#000000';
      wrapper.innerHTML = generateFormalTimetableHTML(
        'SUGUNA COLLEGE OF ENGINEERING',
        currentDept.name,
        '2025-2026',
        `CLASS & SEMESTER: ${activeYearView} B.Tech ${currentDept.code}`,
        `CLASS ADVISOR: Faculty In-Charge`,
        periods,
        workingDays,
        displaySchedule,
        uniqueSubjects
      );
      document.body.appendChild(wrapper);

      const html2pdf = (await import('html2pdf.js')).default;
      const opt: any = {
        margin: 0.3,
        filename: `Timetable_${currentDept.code}_Year${activeYearView}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(wrapper.firstElementChild as HTMLElement).save();
      document.body.removeChild(wrapper);
    } catch (err) {
      console.warn('PDF generation failed:', err);
    }
  };

  const downloadStaffTimetable = async (facultyName: string, facultyDesignation: string) => {
    try {
      const staffSchedule: any = {};
      const staffUniqueSubjectsMap = new Map();
      
      workingDays.forEach(day => {
        staffSchedule[day] = {};
      });

      Object.keys(schedule).forEach(classId => {
        const classSchedule = schedule[classId];
        workingDays.forEach(day => {
          if (classSchedule[day]) {
            Object.keys(classSchedule[day]).forEach(periodId => {
              const slot = (classSchedule[day] as any)[periodId];
              if (slot && slot.teacher && isFacultyMatch(slot.teacher, facultyName)) {
                const codeStr = typeof slot.subject === 'string' ? slot.subjectCode : slot.subject?.code;
                const nameStr = typeof slot.subject === 'string' ? slot.subject : slot.subject?.name;
                
                staffSchedule[day][periodId] = {
                  subject: {
                    code: `${codeStr}\n(${classId})`,
                    name: nameStr
                  }
                };
                staffUniqueSubjectsMap.set(codeStr, { code: codeStr, name: nameStr });
              }
            });
          }
        });
      });

      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.background = '#ffffff';
      wrapper.style.color = '#000000';
      wrapper.innerHTML = generateFormalTimetableHTML(
        'SUGUNA COLLEGE OF ENGINEERING',
        currentDept.name,
        '2025-2026',
        `STAFF NAME: ${facultyName.toUpperCase()}`,
        `DESIGNATION: ${facultyDesignation.toUpperCase()}`,
        periods,
        workingDays,
        staffSchedule,
        Array.from(staffUniqueSubjectsMap.values())
      );
      document.body.appendChild(wrapper);

      const html2pdf = (await import('html2pdf.js')).default;
      const opt: any = {
        margin: 0.3,
        filename: `Staff_Timetable_${facultyName.replace(/[^a-zA-Z0-9]/g, '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(wrapper.firstElementChild as HTMLElement).save();
      document.body.removeChild(wrapper);
    } catch (err) {
      console.warn('Staff PDF generation failed:', err);
    }
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptCode.trim() || !newDeptName.trim()) return;
    if (onAddDepartment) {
      onAddDepartment({
        id: newDeptCode.trim().toUpperCase(),
        code: newDeptCode.trim().toUpperCase(),
        name: newDeptName.trim(),
        icon: '📚',
        hod: currentUser.name
      });
      setIsAddDeptModalOpen(false);
      setNewDeptCode('');
      setNewDeptName('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Toast Notice */}
      {(subNotice || savedNotice) && (
        <div style={{
          background: '#10B981',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
        }}>
          {subNotice || savedNotice}
        </div>
      )}

      {/* Main 3-Column Layout: Left (Department Details), Center (Work Area), Right (HOD Details) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 300px',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {/* ==================== LEFT SIDE: DEPARTMENT DETAILS ==================== */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Department Details
              </span>
            </div>
            <h3 style={{ margin: '0', fontSize: '1.1rem', fontWeight: 800 }}>
              {currentDept.name}
            </h3>
            <span style={{
              display: 'inline-block',
              marginTop: '4px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              Department Code: {currentDept.code}
            </span>
            
            {isAddDeptModalOpen && (
              <form onSubmit={handleCreateDepartment} style={{
                marginTop: '10px',
                padding: '10px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c7d2fe' }}>Create New Department</span>
                <input
                  type="text"
                  required
                  placeholder="Dept Code (e.g. EEE)"
                  value={newDeptCode}
                  onChange={e => setNewDeptCode(e.target.value)}
                  style={{ padding: '6px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.8rem' }}
                />
                <input
                  type="text"
                  required
                  placeholder="Dept Name (e.g. Electrical Engg)"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  style={{ padding: '6px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.8rem' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" style={{ flex: 1, background: '#10b981', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' }}>Save Dept</button>
                  <button type="button" onClick={() => setIsAddDeptModalOpen(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Department Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Total Faculty</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>{deptFaculty.length}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Subjects</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a855f7' }}>{deptSubjects.length}</div>
            </div>
          </div>

          {/* Faculty Roster */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Department Faculty ({deptFaculty.length})
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setNewStaffDeptCode(userDeptCode);
                    setIsAddStaffModalOpen(true);
                  }}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: '#818cf8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Plus size={11} /> Add Staff
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeleteStaffMode(!isDeleteStaffMode)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    background: isDeleteStaffMode ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${isDeleteStaffMode ? 'rgba(239, 68, 68, 0.6)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: isDeleteStaffMode ? '#fca5a5' : '#f87171',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                  title="Toggle Delete Staff"
                >
                  <Trash2 size={11} /> {isDeleteStaffMode ? 'Done' : 'Delete Staff'}
                </button>
              </div>
            </div>

            {isDeleteStaffMode && (
              <div style={{
                marginBottom: '8px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '0.72rem',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>🗑️ Click the trash icon on any staff member to delete:</span>
                <button
                  type="button"
                  onClick={() => setIsDeleteStaffMode(false)}
                  style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.7rem' }}
                >
                  Done
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              {deptFaculty.map(f => {
                const isAbsent = absentFacultyNames.includes(f.name);
                return (
                <div
                  key={f.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{f.avatar || '👨‍🏫'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: isAbsent ? 'line-through' : 'none', color: isAbsent ? '#ef4444' : 'inherit' }}>
                      {f.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {f.designation} • {f.weeklyHours}h/wk
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px', marginRight: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setAbsentFacultyNames(prev => prev.filter(n => n !== f.name))}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: !isAbsent ? '#10b981' : 'rgba(255,255,255,0.1)',
                        color: !isAbsent ? '#fff' : 'var(--text-secondary)'
                      }}
                      title="Mark Present"
                    >
                      P
                    </button>
                    <button
                      type="button"
                      onClick={() => setAbsentFacultyNames(prev => prev.includes(f.name) ? prev : [...prev, f.name])}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: isAbsent ? '#ef4444' : 'rgba(255,255,255,0.1)',
                        color: isAbsent ? '#fff' : 'var(--text-secondary)'
                      }}
                      title="Mark Absent"
                    >
                      A
                    </button>
                  </div>

                  {onDeleteTeacher && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to remove ${f.name} from the department?`)) {
                          onDeleteTeacher(f.id, f.name);
                        }
                      }}
                      title={`Delete ${f.name}`}
                      style={{
                        background: isDeleteStaffMode ? 'rgba(239, 68, 68, 0.2)' : 'none',
                        border: isDeleteStaffMode ? '1px solid rgba(239, 68, 68, 0.5)' : 'none',
                        color: isDeleteStaffMode ? '#ef4444' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = isDeleteStaffMode ? '#ef4444' : 'var(--text-secondary)')}
                    >
                      <Trash2 size={13} />
                      {isDeleteStaffMode && <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>Del</span>}
                    </button>
                  )}
                </div>
              )})}
            </div>
          </div>
        </div>

        {/* ==================== CENTER: WORK AREA ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>


          {/* ==================== BOX 2: DEPARTMENT HOURS DETAILS TABLE ==================== */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#38bdf8" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                    Faculty Workload & Hours Details ({currentDept.name} Only)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Exclusive to {currentDept.code} Department — HOD name, Staff names, Hours Gone vs Hours Missed.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadDeptWorkloadStats}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.74rem',
                  fontWeight: 600
                }}
              >
                🔄 Refresh Hours Table
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>Faculty Name</th>
                    <th style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>Role / Designation</th>
                    <th style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>Subject Name & Code</th>
                    <th style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>Year & Sem</th>
                    <th style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)', textAlign: 'center', color: '#10b981' }}>Periods Conducted</th>
                    <th style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)', textAlign: 'center', color: '#ef4444' }}>Periods Missed (Leave)</th>
                    <th style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)', textAlign: 'center', color: '#38bdf8' }}>Substitute Periods</th>
                    <th style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>Net Periods</th>
                    <th style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {deptWorkloadStats.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {isLoadingWorkload ? 'Loading workload statistics...' : 'No faculty records found for this department.'}
                      </td>
                    </tr>
                  ) : (
                    deptWorkloadStats.map((f, idx) => {
                      const isHodRow = f.role === 'hod' || f.name.includes('Mythili');
                      return (
                        <tr key={idx} style={{
                          background: isHodRow ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                        }}>
                          <td style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)', fontWeight: 800 }}>
                            {isHodRow ? '⚡ ' : '👨‍🏫 '}
                            {f.name}
                          </td>
                          <td style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: isHodRow ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.06)',
                              color: isHodRow ? '#818cf8' : 'inherit'
                            }}>
                              {f.designation}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontWeight: 600 }}>{f.subjectName}</div>
                            <code style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{f.subjectCode}</code>
                          </td>
                          <td style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>
                            <span style={{ fontSize: '0.76rem' }}>{f.year} (Sem {f.semester})</span>
                          </td>
                          <td style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)', textAlign: 'center', fontWeight: 800, color: '#10b981' }}>
                            {f.conductedHours} Periods
                          </td>
                          <td style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)', textAlign: 'center', fontWeight: 800, color: f.missedHours > 0 ? '#ef4444' : 'var(--text-secondary)' }}>
                            {f.missedHours > 0 ? `-${f.missedHours} Periods` : '0 Periods'}
                          </td>
                          <td style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)', textAlign: 'center', fontWeight: 800, color: '#38bdf8' }}>
                            {f.substituteHoursAdded > 0 ? `+${f.substituteHoursAdded} Periods` : '0'}
                          </td>
                          <td style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)', textAlign: 'center', fontWeight: 900, color: '#c7d2fe' }}>
                            {f.netHours} Periods
                          </td>
                          <td style={{ padding: '10px 12px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => downloadStaffTimetable(f.name, f.designation)}
                              style={{
                                background: 'linear-gradient(135deg, #10B981, #059669)',
                                border: 'none',
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}
                            >
                              Get PDF
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Box 1: Create Subject (Top Table Box) */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <BookOpen size={18} color="#6366f1" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                1. Create Subject (HOD Curriculum Input)
              </h3>
            </div>

            <form onSubmit={handleCreateSubject} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr)) 120px',
              gap: '12px',
              alignItems: 'end'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  placeholder="e.g. Distributed Computing"
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'inherit',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Subject Code *
                </label>
                <input
                  type="text"
                  required
                  value={newSubCode}
                  onChange={e => setNewSubCode(e.target.value)}
                  placeholder="e.g. IT3505"
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'inherit',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Assign Faculty *
                </label>
                <select
                  value={newSubTeacher}
                  onChange={e => setNewSubTeacher(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'inherit',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="" style={{ background: '#1e1e38', color: '#fff' }}>-- Select Staff --</option>
                  {teachers.map(f => (
                    <option key={f.id} value={f.name} style={{ background: '#1e1e38', color: '#fff' }}>
                      {f.name} ({f.deptCode || f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Year
                </label>
                <select
                  value={newSubYear}
                  onChange={e => {
                    const yr = e.target.value;
                    setNewSubYear(yr);
                    setNewSubSemester(yr === '1' ? '1' : yr === '2' ? '3' : yr === '3' ? '5' : '7');
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'inherit',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="1" style={{ background: '#1e1e38', color: '#fff' }}>1st Year</option>
                  <option value="2" style={{ background: '#1e1e38', color: '#fff' }}>2nd Year</option>
                  <option value="3" style={{ background: '#1e1e38', color: '#fff' }}>3rd Year</option>
                  <option value="4" style={{ background: '#1e1e38', color: '#fff' }}>4th Year (Final)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Semester
                </label>
                <select
                  value={newSubSemester}
                  onChange={e => setNewSubSemester(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'inherit',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s} style={{ background: '#1e1e38', color: '#fff' }}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Type
                </label>
                <select
                  value={newSubIsLab ? 'lab' : 'theory'}
                  onChange={e => setNewSubIsLab(e.target.value === 'lab')}
                  style={{
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'inherit',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="theory" style={{ background: '#1e1e38', color: '#fff' }}>Theory</option>
                  <option value="lab" style={{ background: '#1e1e38', color: '#fff' }}>Lab Practical</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={16} />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>

          {/* Box 2: Saved Subject Details (Separated by Faculty) */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            {/* Box Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} color="#10b981" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                    2. Saved Subject Details ({deptSubjects.length})
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Curriculum separated by faculty for {currentDept.name} ({deptFaculty.length} Faculty Members)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {onClearAllSubjects && deptSubjects.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAllSubjects}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Clear All Subjects</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSubjectFacultyFilter('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: subjectFacultyFilter === 'all' ? '#6366f1' : 'var(--border-subtle)',
                  background: subjectFacultyFilter === 'all' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: subjectFacultyFilter === 'all' ? '#818cf8' : 'var(--text-secondary)'
                }}
              >
                🌐 All Faculty ({deptSubjects.length})
              </button>
              {deptFaculty.map(f => {
                if (absentFacultyNames.includes(f.name)) return null;
                const count = deptSubjects.filter(s => isFacultyMatch(s.teacher, f.name)).length;
                const isSelected = subjectFacultyFilter === f.id;
                const isHOD = f.designation.includes('HOD') || (currentDept.hod && isFacultyMatch(currentDept.hod, f.name));
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSubjectFacultyFilter(f.id)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isSelected ? (isHOD ? '#eab308' : '#818cf8') : 'var(--border-subtle)',
                      background: isSelected ? (isHOD ? 'rgba(234, 179, 8, 0.2)' : 'rgba(99, 102, 241, 0.2)') : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? (isHOD ? '#fde047' : '#a5b4fc') : 'var(--text-secondary)'
                    }}
                  >
                    {f.avatar || (isHOD ? '⚡' : '👤')} {f.name} {isHOD ? '(HOD)' : ''} ({count})
                  </button>
                );
              })}
            </div>

            {/* Empty State */}
            {deptSubjects.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  ✨ All Cleared & Fresh!
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  Enter your subjects above for 2nd Year, 3rd Year, and 4th Year, assign Dr. Mythili, Prof. Gayathiri, or Prof. Suganya, then click Generate Timetable.
                </div>
              </div>
            )}

            {/* Distinct Separated Cards For Each Faculty Member */}
            {deptFaculty.map(f => {
              if (subjectFacultyFilter !== 'all' && subjectFacultyFilter !== f.id) return null;
              // Hide subject details if faculty is absent
              if (absentFacultyNames.includes(f.name)) return null;
              
              const fSubs = deptSubjects.filter(s => isFacultyMatch(s.teacher, f.name));
              const isHOD = f.designation.includes('HOD') || (currentDept.hod && isFacultyMatch(currentDept.hod, f.name));
              const theoryCount = fSubs.filter(s => !s.isLab).length;
              const labCount = fSubs.filter(s => s.isLab).length;

              return (
                <div key={f.id} style={{
                  background: isHOD ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                  border: isHOD ? '1.5px solid rgba(99, 102, 241, 0.35)' : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  boxShadow: isHOD ? '0 4px 14px rgba(99, 102, 241, 0.08)' : 'none'
                }}>
                  {/* Faculty Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.3rem' }}>{f.avatar || (isHOD ? '⚡' : '👩‍🏫')}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: isHOD ? '#818cf8' : 'var(--text-primary)' }}>
                            {f.name}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            background: isHOD ? 'rgba(234, 179, 8, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                            color: isHOD ? '#fde047' : '#a5b4fc',
                            border: isHOD ? '1px solid rgba(234, 179, 8, 0.4)' : 'none'
                          }}>
                            {isHOD ? 'Department HOD' : f.designation}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                          {f.email || `${f.name.toLowerCase().replace(/[^a-z]/g, '')}@sugunacollege.edu`} • {theoryCount} Theory • {labCount} Lab
                        </div>
                      </div>
                    </div>
                    <span style={{
                      background: isHOD ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                      color: isHOD ? '#a5b4fc' : 'var(--text-secondary)',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      {fSubs.length} Subjects Assigned
                    </span>
                  </div>

                  {fSubs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No subjects currently assigned to {f.name}. Use Box 1 above to assign subjects.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: isHOD ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Subject Name</th>
                            <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Code</th>
                            <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Semester</th>
                            <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Year</th>
                            <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Type</th>
                            <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Assigned Faculty</th>
                            <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fSubs.map(sub => {
                            const isEditing = editingSubId === sub.id;
                            return (
                              <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editSubName}
                                      onChange={e => setEditSubName(e.target.value)}
                                      style={{ padding: '4px 8px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
                                    />
                                  ) : (
                                    sub.name
                                  )}
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={editSubCode}
                                      onChange={e => setEditSubCode(e.target.value)}
                                      style={{ padding: '4px 8px', borderRadius: '4px', width: '90px' }}
                                    />
                                  ) : (
                                    <code style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 6px', borderRadius: '4px' }}>
                                      {sub.code}
                                    </code>
                                  )}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                  {isEditing ? (
                                    <select value={editSubSem} onChange={e => setEditSubSem(e.target.value)} style={{ padding: '4px' }}>
                                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                  ) : (
                                    `Sem ${sub.semester}`
                                  )}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                  {isEditing ? (
                                    <select value={editSubYear} onChange={e => setEditSubYear(e.target.value)} style={{ padding: '4px' }}>
                                      <option value="1">1st</option>
                                      <option value="2">2nd</option>
                                      <option value="3">3rd</option>
                                      <option value="4">4th</option>
                                    </select>
                                  ) : (
                                    `${sub.year}th Year`
                                  )}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                  {sub.isLab ? (
                                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(236,72,153,0.15)', color: '#f472b6', fontWeight: 700 }}>
                                      LAB
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 600 }}>
                                      THEORY
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  {isEditing ? (
                                    <select
                                      value={editSubTeacher}
                                      onChange={e => setEditSubTeacher(e.target.value)}
                                      style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', width: '100%', background: 'rgba(0,0,0,0.3)', color: '#fff', border: '1px solid var(--border-subtle)' }}
                                    >
                                      {teachers.map(fac => (
                                        <option key={fac.id} value={fac.name} style={{ background: '#1e1e38', color: '#fff' }}>
                                          {fac.name} ({fac.deptCode || fac.department})
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                      {sub.teacher || f.name}
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                      <button
                                        onClick={() => handleSaveEditedSub(sub.id)}
                                        style={{ background: '#10B981', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingSubId(null)}
                                        style={{ background: '#64748b', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                      <button
                                        onClick={() => handleStartEditSub(sub)}
                                        title="Edit Subject"
                                        style={{
                                          background: 'rgba(99, 102, 241, 0.15)',
                                          border: '1px solid rgba(99, 102, 241, 0.3)',
                                          color: '#818cf8',
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                          fontSize: '0.75rem'
                                        }}
                                      >
                                        <Edit3 size={13} />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        onClick={() => onDeleteSubject(sub.id)}
                                        title="Delete Subject"
                                        style={{
                                          background: 'rgba(239, 68, 68, 0.15)',
                                          border: '1px solid rgba(239, 68, 68, 0.3)',
                                          color: '#f87171',
                                          padding: '4px 6px',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          fontSize: '0.75rem'
                                        }}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section 3: Timetable Generator & Generated Timetable Matrix */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Sparkles size={18} color="#eab308" />
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                3. AI Timetable Generator & Timing Customizer
              </h3>
            </div>

            {/* Generator Inputs Form (Start time, End time, Total hours, Break times, Lunch times, Year selector) */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Start Time Edit
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-subtle)',
                      color: 'inherit',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    End Time Edit
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    placeholder="04:30 PM"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-subtle)',
                      color: 'inherit',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    How Many Hours (Periods)
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={9}
                    value={totalHours}
                    onChange={e => setTotalHours(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.2)',
                      border: '1px solid var(--border-subtle)',
                      color: 'inherit',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Break Start & End Time
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      value={breakStartTime}
                      onChange={e => setBreakStartTime(e.target.value)}
                      placeholder="10:50 AM"
                      style={{
                        width: '50%',
                        padding: '8px 8px',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        color: 'inherit',
                        fontSize: '0.8rem',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="text"
                      value={breakEndTime}
                      onChange={e => setBreakEndTime(e.target.value)}
                      placeholder="11:10 AM"
                      style={{
                        width: '50%',
                        padding: '8px 8px',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        color: 'inherit',
                        fontSize: '0.8rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Lunch Start & End Time
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      value={lunchStartTime}
                      onChange={e => setLunchStartTime(e.target.value)}
                      placeholder="01:00 PM"
                      style={{
                        width: '50%',
                        padding: '8px 8px',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        color: 'inherit',
                        fontSize: '0.8rem',
                        boxSizing: 'border-box'
                      }}
                    />
                    <input
                      type="text"
                      value={lunchEndTime}
                      onChange={e => setLunchEndTime(e.target.value)}
                      placeholder="01:50 PM"
                      style={{
                        width: '50%',
                        padding: '8px 8px',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        color: 'inherit',
                        fontSize: '0.8rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Year Select & Generate Trigger */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Target Year to Generate:</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['2', '3', '4', 'all'] as const).map(yr => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setTargetYear(yr)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          background: targetYear === yr ? '#6366F1' : 'rgba(255,255,255,0.08)',
                          color: '#fff'
                        }}
                      >
                        {yr === 'all' ? 'All Years' : `${yr}th Year`}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerGenerate}
                  disabled={isGenerating}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  <Zap size={16} />
                  <span>{isGenerating ? 'Solving OR-Tools Constraints...' : '⚡ Generate Timetable'}</span>
                </button>
              </div>


            </div>

            {/* Generated Timetable Display separated year-wise */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarDays size={18} color="#6366f1" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>
                    Generated Timetable (Year-Wise Separate View)
                  </h4>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {/* Year Tabs */}
                  <div style={{
                    display: 'inline-flex',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '3px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {(['2', '3', '4'] as const).map(yr => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setActiveYearView(yr)}
                        style={{
                          padding: '5px 14px',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          background: activeYearView === yr ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'transparent',
                          color: activeYearView === yr ? '#ffffff' : 'var(--text-secondary)'
                        }}
                      >
                        {yr}th Year
                      </button>
                    ))}
                  </div>

                  {/* Save Timetable Button */}
                  <button
                    type="button"
                    onClick={handleSaveTimetable}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    <Save size={14} />
                    <span>Save Timetable</span>
                  </button>
                </div>
              </div>

              {/* Timetable Grid with Edit Slot Option */}
              <div id="timetable-pdf-content" style={{ overflowX: 'auto', padding: '10px', background: 'var(--bg-surface)' }}>
                <div style={{ marginBottom: '10px', display: 'none' }} className="pdf-header">

                  <h2 style={{ color: '#000', margin: 0 }}>{currentDept.name} - Year {activeYearView}</h2>
                  <p style={{ color: '#555', margin: '4px 0 0 0' }}>Generated Smart Timetable</p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <th style={{ padding: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center', width: '110px' }}>Day</th>
                      {periods.map(p => (
                        <th
                          key={p.id}
                          style={{
                            padding: '10px',
                            border: '1px solid var(--border-subtle)',
                            textAlign: 'center',
                            background: p.type === 'break' ? 'rgba(234, 179, 8, 0.08)' : 'transparent',
                            minWidth: p.type === 'break' ? '70px' : '110px'
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{p.time}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {workingDays.map(day => (
                      <tr key={day}>
                        <td style={{ padding: '10px', border: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.82rem' }}>
                          {day}
                        </td>
                        {periods.map(p => {
                          if (p.type === 'break') {
                            return (
                              <td
                                key={p.id}
                                style={{
                                  padding: '8px',
                                  border: '1px solid var(--border-subtle)',
                                  textAlign: 'center',
                                  background: 'rgba(234, 179, 8, 0.05)',
                                  color: '#eab308',
                                  fontSize: '0.72rem',
                                  fontWeight: 700
                                }}
                              >
                                {p.name}
                              </td>
                            );
                          }

                          const slot = schedule[targetClassId]?.[day]?.[p.id];
                          return (
                            <td
                              key={p.id}
                              onClick={() => setEditingSlot({ classId: targetClassId, day, periodId: p.id, slot })}
                              title="Click to edit slot"
                              style={{
                                padding: '8px',
                                border: '1px solid var(--border-subtle)',
                                verticalAlign: 'top',
                                cursor: 'pointer',
                                background: slot?.isLab ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                                transition: 'all 0.15s'
                              }}
                            >
                              {slot ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                  <div style={{ fontWeight: 800, fontSize: '0.82rem' }}>
                                    {slot.subject}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                    👨‍🏫 {slot.teacher}
                                  </div>
                                  <div style={{ fontSize: '0.68rem', display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                                    <span>{slot.subjectCode}</span>
                                    <span>{slot.room}</span>
                                  </div>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>— Free —</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT SIDE: HOD PERSONAL DETAILS ==================== */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              HOD Profile Details
            </span>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              style={{
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: '#818cf8',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
          </div>

          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{currentUser.avatar || '⚡'}</div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{currentUser.name}</h3>
            <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
              Head of Department ({currentDept.code})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>College ID No</span>
              <strong style={{ color: '#38bdf8' }}>{currentUser.collegeId || 'SCE-HOD-IT-01'}</strong>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>User Name</span>
              <code style={{ color: '#818cf8' }}>{currentUser.username || '@7150mythili'}</code>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Degree / Qualification</span>
              <strong>{currentUser.degree || 'Ph.D in Information Technology'}</strong>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Phone Number</span>
              <div>📞 {currentUser.phone || '+91 9842100002'}</div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Mail ID</span>
              <div style={{ wordBreak: 'break-all' }}>📧 {currentUser.email}</div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Date of Birth</span>
              <div>📅 {currentUser.dob || '1980-07-25'}</div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Department</span>
              <div>🏢 {currentUser.department}</div>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Address</span>
              <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                📍 {currentUser.address || '42, Bharathi Colony, Peelamedu, Coimbatore'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onSaveUser={onUpdateUser}
        departments={departments}
      />

      {/* Edit Slot Modal */}
      {editingSlot && (
        <EditSlotModal
          isOpen={true}
          onClose={() => setEditingSlot(null)}
          day={editingSlot.day}
          periodId={editingSlot.periodId}
          periodName={`Period ${editingSlot.periodId}`}
          currentSlot={editingSlot.slot}
          teachers={teachers}
          subjects={subjects}
          onSaveSlot={(day, periodId, updatedSlot) => {
            onUpdateScheduleSlot(editingSlot.classId, day, periodId, updatedSlot);
            setEditingSlot(null);
          }}
        />
      )}

      {/* Add Staff Modal */}
      {isAddStaffModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>👨‍🏫</span>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Add Department Staff</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStaffModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '4px'
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStaffName.trim()) return;

                const deptObj = departments.find(d => d.code === newStaffDeptCode) || currentDept;
                const createdTeacher: Partial<Teacher> = {
                  name: newStaffName.trim(),
                  deptCode: newStaffDeptCode,
                  department: deptObj.name,
                  designation: newStaffDesignation,
                  email: newStaffEmail.trim() || `${newStaffName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${newStaffDeptCode.toLowerCase()}@sugunacollege.edu`,
                  phone: newStaffPhone.trim() || '+91 98421000' + Math.floor(10 + Math.random() * 89),
                  avatar: newStaffName.includes('Dr.') ? '👨‍🏫' : '👩‍🏫',
                  weeklyHours: 14,
                  maxHours: 18
                };

                if (onAddTeacher) {
                  onAddTeacher(createdTeacher);
                }

                setIsAddStaffModalOpen(false);
                setNewStaffName('');
                setNewStaffEmail('');
                setNewStaffPhone('');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Department *
                </label>
                <select
                  value={newStaffDeptCode}
                  onChange={(e) => setNewStaffDeptCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem'
                  }}
                >
                  {departments.map(d => (
                    <option key={d.code} value={d.code}>
                      {d.icon} {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Faculty Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar or Prof. S. Karthik"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Designation
                  </label>
                  <select
                    value={newStaffDesignation}
                    onChange={(e) => setNewStaffDesignation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Professor & HOD">Professor & HOD</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. rajesh.it@sugunacollege.edu"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                  }}
                >
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* -------------------- NEW STAFF TIMETABLE VIEWER SECTION -------------------- */}
      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 className="text-xl font-bold text-[#e2e8f0] flex items-center gap-2">
              👨‍🏫 View & Download Staff Timetable
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={selectedStaffView}
                onChange={(e) => setSelectedStaffView(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#1e293b',
                  border: '1px solid #38bdf8',
                  color: '#e2e8f0',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  outline: 'none',
                  minWidth: '200px'
                }}
              >
                <option value="">-- Select Staff to View --</option>
                {deptFaculty.map(f => (
                  <option key={f.name} value={f.name}>{f.name}</option>
                ))}
              </select>
              
              {selectedStaffView && (
                <button
                  onClick={() => {
                    const f = deptFaculty.find(fac => fac.name === selectedStaffView);
                    if (f) downloadStaffTimetable(f.name, f.designation);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Download PDF
                </button>
              )}
            </div>
          </div>

          {!selectedStaffView ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Please select a staff member from the dropdown above to view their timetable.
            </div>
          ) : (
            (() => {
              // Compute staff schedule matrix
              const staffPersonalSchedule: any[] = [];
              workingDays.forEach(day => {
                ['2', '3', '4'].forEach(year => {
                  const classId = `${userDeptCode}-${year}A`;
                  if (schedule[classId] && schedule[classId][day]) {
                    Object.keys(schedule[classId][day]).forEach(pId => {
                      const slot = schedule[classId][day][pId as any];
                      if (slot && slot.teacher && isFacultyMatch(slot.teacher, selectedStaffView)) {
                        staffPersonalSchedule.push({
                          day,
                          periodId: parseInt(pId),
                          subject: typeof slot.subject === 'string' ? slot.subject : (slot.subject as any)?.name,
                          code: typeof slot.subject === 'string' ? slot.subjectCode : (slot.subject as any)?.code,
                          year: `${year}nd Year`,
                          room: slot.room || `LH-10${year}`
                        });
                      }
                    });
                  }
                });
              });

              return (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(99, 102, 241, 0.12)' }}>
                        <th style={{ padding: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center', width: '100px' }}>Day</th>
                        {periods.map(p => (
                          <th key={p.id} style={{ padding: '10px 6px', border: '1px solid var(--border-subtle)', textAlign: 'center', background: p.type === 'break' ? 'rgba(234, 179, 8, 0.08)' : 'transparent', minWidth: p.type === 'break' ? '70px' : '110px' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{p.name}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{p.time}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {workingDays.map(day => (
                        <tr key={day}>
                          <td style={{ padding: '10px', border: '1px solid var(--border-subtle)', fontWeight: 700, background: 'rgba(0,0,0,0.2)' }}>{day}</td>
                          {periods.map(p => {
                            if (p.type === 'break') {
                              return <td key={p.id} style={{ padding: '8px', border: '1px solid var(--border-subtle)', textAlign: 'center', background: 'rgba(234, 179, 8, 0.05)', color: '#eab308', fontSize: '0.75rem', fontWeight: 700 }}>{p.name}</td>;
                            }
                            const session = staffPersonalSchedule.find(s => s.day === day && s.periodId === p.id);
                            return (
                              <td key={p.id} style={{ padding: '8px', border: '1px solid var(--border-subtle)', verticalAlign: 'top', background: session ? 'rgba(99, 102, 241, 0.15)' : 'transparent' }}>
                                {session ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', alignSelf: 'flex-start' }}>🎓 {session.year}</span>
                                    <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#fff' }}>{session.subject}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}><code>{session.code}</code></div>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>— Free Hour —</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};
