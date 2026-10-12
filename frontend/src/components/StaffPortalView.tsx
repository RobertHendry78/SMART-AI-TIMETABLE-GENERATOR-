import React, { useState, useEffect } from 'react';
import type { User, Department, Teacher, SubjectItem, CollegeTimetable, Period } from '../types/timetable';
import { Edit3, Trash2, Plus, BookOpen, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';
import { ProfileEditModal } from './ProfileEditModal';
import { EditSlotModal } from './EditSlotModal';

interface StaffPortalViewProps {
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
  schedule: CollegeTimetable;
  onUpdateScheduleSlot: (classId: string, day: string, periodId: number, slot: any) => void;
  periods: Period[];
  workingDays: string[];
}

export const StaffPortalView: React.FC<StaffPortalViewProps> = ({
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
  schedule,
  onUpdateScheduleSlot,
  periods,
  workingDays
}) => {
  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{ classId: string; day: string; periodId: number; slot: any } | null>(null);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);

  // Add Staff Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffDeptCode, setNewStaffDeptCode] = useState(currentUser.deptCode || 'IT');
  const [newStaffDesignation, setNewStaffDesignation] = useState('Assistant Professor');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');

  // Create Subject Form State
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubSemester, setNewSubSemester] = useState('3');
  const [newSubYear, setNewSubYear] = useState('2');
  const [newSubSection, setNewSubSection] = useState('A');
  const [newSubTargetDept, setNewSubTargetDept] = useState(currentUser.deptCode || 'IT');
  const [subNotice, setSubNotice] = useState<string | null>(null);

  // Subject Edit inline state
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubCode, setEditSubCode] = useState('');
  const [editSubSem, setEditSubSem] = useState('3');
  const [editSubYear, setEditSubYear] = useState('2');
  const [editSubDept, setEditSubDept] = useState('');

  // Timetable view active year: 2nd, 3rd, 4th
  const [selectedYear, setSelectedYear] = useState<'2' | '3' | '4'>('2');

  // Filter state for Saved Subject Details (Separated by Faculty)
  const [myWorkloadStats, setMyWorkloadStats] = useState<{
    plannedHours: number;
    conductedHours: number;
    missedHours: number;
    substituteHoursAdded: number;
    netHours: number;
  }>({
    plannedHours: 16,
    conductedHours: 16,
    missedHours: 0,
    substituteHoursAdded: 0,
    netHours: 16
  });

  // Filter state for Saved Subject Details (Separated by Faculty)
  const [subjectFacultyFilter, setSubjectFacultyFilter] = useState<string>('all');
  
  // Delete Staff Mode State
  const [isDeleteStaffMode, setIsDeleteStaffMode] = useState(false);

  // Track absent faculty visually
  const [absentFacultyNames, setAbsentFacultyNames] = useState<string[]>([]);

  // Active department matching currentUser
  const userDeptCode = currentUser.deptCode || 'IT';
  const currentDept = departments.find(d => d.code === userDeptCode) || departments[0];

  // Saved subjects for this department (or overall)
  const deptSubjects = subjects.filter(s => 
    !s.deptCode || 
    s.deptCode === userDeptCode || 
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

  const deptHOD = deptFaculty.find(t => t.designation.includes('HOD')) || {
    name: currentDept.hod || 'Dr. Mythili',
    email: 'hod.it@sugunacollege.edu',
    phone: '+91 9842100002',
    designation: 'Professor & HOD'
  };

  // Separated subjects by faculty
  const mySubjects = subjects.filter(s => isFacultyMatch(s.teacher, currentUser.name));
  const otherDeptFaculty = deptFaculty.filter(f => !isFacultyMatch(f.name, currentUser.name));
  const unassignedSubjects = deptSubjects.filter(s => !isFacultyMatch(s.teacher, currentUser.name) && !deptFaculty.some(f => isFacultyMatch(s.teacher, f.name)));

  // Class ID for selected year
  const targetClassId = `${userDeptCode}-${selectedYear}A`;

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const isSpecialDept = userDeptCode === 'PLACEMENT' || userDeptCode === 'EXTRA';
    if (!newSubName.trim() || (!isSpecialDept && !newSubCode.trim())) return;

    const finalCode = isSpecialDept ? `N/A-${Date.now().toString().slice(-4)}` : newSubCode.trim().toUpperCase();

    onAddSubject({
      name: newSubName.trim(),
      code: finalCode,
      semester: newSubSemester,
      year: newSubYear,
      section: newSubSection,
      deptCode: newSubYear === '1' ? 'FY' : newSubTargetDept,
      ownerDeptCode: currentUser.deptCode,
      teacher: currentUser.name,
      credits: 4,
      hoursPerWeek: 4
    });

    setSubNotice(`✅ Subject "${newSubName}" created and assigned to ${currentUser.name}!`);
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
    setEditSubDept(sub.deptCode || userDeptCode);
  };

  // Save Edited Subject
  const handleSaveEditedSub = (id: string) => {
    const existing = subjects.find(s => s.id === id);
    onUpdateSubject({
      id,
      name: editSubName,
      code: editSubCode,
      semester: editSubSem,
      year: editSubYear,
      deptCode: editSubYear === '1' ? 'FY' : editSubDept,
      ownerDeptCode: existing?.ownerDeptCode || currentUser.deptCode,
      teacher: existing?.teacher || currentUser.name,
      section: existing?.section
    });
    setEditingSubId(null);
    setSubNotice('✅ Subject updated successfully!');
    setTimeout(() => setSubNotice(null), 3000);
  };

  // Load My Workload & Leaves from backend/database
  const loadMyWorkloadAndLeaves = async () => {
    try {
      const res = await fetch(`/api/faculty/workload-stats?department=${userDeptCode}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const myStat = json.data.find((f: any) => 
            f.name.toLowerCase().includes(currentUser.name.toLowerCase().replace('dr. ', '').replace('prof. ', '').trim()) ||
            currentUser.name.toLowerCase().includes(f.name.toLowerCase())
          );
          if (myStat) {
            setMyWorkloadStats({
              plannedHours: myStat.plannedHours || 16,
              conductedHours: myStat.conductedHours || 16,
              missedHours: myStat.missedHours || 0,
              substituteHoursAdded: myStat.substituteHoursAdded || 0,
              netHours: myStat.netHours || 16
            });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch workload stats:', e);
    }
  };

  useEffect(() => {
    loadMyWorkloadAndLeaves();
  }, [currentUser]);




  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Top Banner Notice */}
      {subNotice && (
        <div style={{
          background: '#10B981',
          color: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderRadius: '12px',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
        }}>
          {subNotice}
        </div>
      )}

      {/* Main 3-Column Layout: Left (Department Details), Center (Work Area), Right (Staff Details) */}
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
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Department Details
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 800 }}>
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
              Code: {currentDept.code}
            </span>
          </div>

          {/* HOD Details */}
          <div style={{
            background: 'var(--bg-card, rgba(255,255,255,0.03))',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>👨‍🏫</span>
              <div>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>
                  Head of Department (HOD)
                </span>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{deptHOD.name}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>📧 {deptHOD.email || 'hod.it@sugunacollege.edu'}</div>
              <div>📞 {deptHOD.phone || '+91 9842100002'}</div>
            </div>
          </div>

          {/* Department Faculty Directory (Current Department Staff Only) */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
              gap: '8px'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                {currentDept?.name || userDeptCode} Faculty ({deptFaculty.length})
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
              {deptFaculty.length === 0 ? (
                <div style={{
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-subtle)'
                }}>
                  No faculty found for {currentDept?.name || userDeptCode}. Click "+ Add Staff" to add members.
                </div>
              ) : (
                deptFaculty.map(f => {
                  const isAbsent = absentFacultyNames.includes(f.name);
                  return (
                    <div
                      key={f.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: f.name.includes(currentUser.name.replace('Dr. ', '').replace('Prof. ', '').trim())
                          ? 'rgba(99, 102, 241, 0.15)'
                          : 'rgba(255, 255, 255, 0.02)',
                        border: isDeleteStaffMode ? '1px dashed rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>{f.avatar || '👩‍🏫'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textDecoration: isAbsent ? 'line-through' : 'none',
                          color: isAbsent ? '#ef4444' : 'inherit'
                        }}>
                          {f.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                          {f.department}
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
                            if (window.confirm(`Are you sure you want to remove ${f.name}?`)) {
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
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ==================== CENTER: WORK AREA ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* ==================== BOX 2: MY HOURS & ATTENDANCE DETAILS ==================== */}
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
                    My Teaching Periods & Attendance Record
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Faculty: {currentUser.name} — Teaching periods conducted, leave deductions & substitute duties
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadMyWorkloadAndLeaves}
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
                🔄 Refresh Stats
              </button>
            </div>

            {/* Teaching Periods Cards: Conducted, Missed, Substitute Handled, Net Periods */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '1.25rem'
            }}>
              {/* Card 1: Periods Conducted */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#6ee7b7', fontWeight: 700 }}>Periods Conducted</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                  {myWorkloadStats.conductedHours} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Periods</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#34d399', marginTop: '4px' }}>Classes attended & taken</div>
              </div>

              {/* Card 2: Periods Missed (Leave) */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#fca5a5', fontWeight: 700 }}>Periods Missed (Leave)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ef4444', marginTop: '2px' }}>
                  {myWorkloadStats.missedHours} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Periods</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#f87171', marginTop: '4px' }}>Deducted due to absence</div>
              </div>

              {/* Card 3: Substitute Periods Handled */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '12px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#7dd3fc', fontWeight: 700 }}>Substitute Periods Handled</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
                  +{myWorkloadStats.substituteHoursAdded} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Periods</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#38bdf8', marginTop: '4px' }}>Proxy classes covered</div>
              </div>

              {/* Card 4: Net Teaching Periods */}
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '12px',
                padding: '12px'
              }}>
                <div style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700 }}>Net Teaching Periods</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#818cf8', marginTop: '2px' }}>
                  {myWorkloadStats.netHours} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Periods</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#a5b4fc', marginTop: '4px' }}>Total effective workload</div>
              </div>
            </div>


          </div>

          {/* Table Box 1: Create Subject */}
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
                1. Create Subject (Course Input)
              </h3>
            </div>

            <form onSubmit={handleCreateSubject} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 120px',
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
                  placeholder="e.g. Distributed Database Systems"
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

              {userDeptCode !== 'PLACEMENT' && userDeptCode !== 'EXTRA' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubCode}
                    onChange={e => setNewSubCode(e.target.value)}
                    placeholder="e.g. IT3305"
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
              )}

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
                  Year
                </label>
                <select
                  value={newSubYear}
                  onChange={e => setNewSubYear(e.target.value)}
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
                  <option value="4" style={{ background: '#1e1e38', color: '#fff' }}>4th Year</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Section
                </label>
                <select
                  value={newSubSection}
                  onChange={e => setNewSubSection(e.target.value)}
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
                  {['A', 'B', 'C', 'D', 'NON'].map(sec => (
                    <option key={sec} value={sec} style={{ background: '#1e1e38', color: '#fff' }}>
                      {sec === 'NON' ? 'NON' : `Section ${sec}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Target Department
                </label>
                <select
                  value={newSubTargetDept}
                  onChange={e => setNewSubTargetDept(e.target.value)}
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
                  {departments.map(d => (
                    <option key={d.code} value={d.code} style={{ background: '#1e1e38', color: '#fff' }}>
                      {d.name}
                    </option>
                  ))}
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

          {/* Table Box 2: Saved Subject Details (Separated by Faculty) */}
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
                    Curriculum separated by faculty for {currentDept.name}
                  </span>
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
                <button
                  type="button"
                  onClick={() => setSubjectFacultyFilter('mine')}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: subjectFacultyFilter === 'mine' ? '#10b981' : 'rgba(16, 185, 129, 0.35)',
                    background: subjectFacultyFilter === 'mine' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.08)',
                    color: '#10b981'
                  }}
                >
                  ⭐ My Subjects ({mySubjects.length})
                </button>
                {otherDeptFaculty.map(f => {
                  const count = deptSubjects.filter(s => isFacultyMatch(s.teacher, f.name)).length;
                  const isSelected = subjectFacultyFilter === f.id;
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
                        borderColor: isSelected ? '#a855f7' : 'var(--border-subtle)',
                        background: isSelected ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? '#c084fc' : 'var(--text-secondary)'
                      }}
                    >
                      {f.avatar || '👤'} {f.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 1: MY ASSIGNED SUBJECTS (TOP PROMINENT SECTION FOR LOGGED-IN STAFF) */}
            {(subjectFacultyFilter === 'all' || subjectFacultyFilter === 'mine') && (
              <div style={{
                background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
                border: '1.5px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '12px',
                padding: '1.1rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.25rem' }}>⭐</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: '#10b981' }}>
                        My Assigned Subjects — {currentUser.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        These are your direct teaching subjects. Click Edit to adjust subject details without confusion.
                      </div>
                    </div>
                  </div>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    {mySubjects.length} Subjects
                  </span>
                </div>

                {mySubjects.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    No subjects currently assigned to you. Use Box 1 above to add your subjects!
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(16, 185, 129, 0.12)', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>
                          <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Subject Name</th>
                          <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Code</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Semester</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Year</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Target Dept</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Type</th>
                          <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mySubjects.map(sub => {
                          const isEditing = editingSubId === sub.id;
                          return (
                            <tr key={sub.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
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
                                  <code style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 6px', borderRadius: '4px' }}>
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
                                  `${sub.year}${sub.year == '1' ? 'st' : sub.year == '2' ? 'nd' : sub.year == '3' ? 'rd' : 'th'} Year${sub.section ? ` - Sec ${sub.section}` : ''}`
                                )}
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                {isEditing ? (
                                  <select value={editSubDept} onChange={e => setEditSubDept(e.target.value)} style={{ padding: '4px' }} disabled={editSubYear === '1'}>
                                    {departments.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
                                  </select>
                                ) : (
                                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 600 }}>
                                    {sub.year === '1' ? 'FY' : sub.deptCode || 'IT'}
                                  </span>
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
            )}

            {/* SECTION 2: OTHER DEPARTMENT FACULTY (SEPARATED CARDS) */}
            {otherDeptFaculty.map(f => {
              if (subjectFacultyFilter !== 'all' && subjectFacultyFilter !== f.id) return null;
              const fSubs = deptSubjects.filter(s => isFacultyMatch(s.teacher, f.name));
              const isHOD = f.designation.includes('HOD') || (currentDept.hod && isFacultyMatch(currentDept.hod, f.name));

              return (
                <div key={f.id} style={{
                  background: isHOD ? 'rgba(99, 102, 241, 0.04)' : 'rgba(255, 255, 255, 0.02)',
                  border: isHOD ? '1px solid rgba(99, 102, 241, 0.25)' : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1.1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem' }}>{f.avatar || (isHOD ? '⚡' : '👩‍💼')}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.98rem', color: isHOD ? '#818cf8' : 'var(--text-primary)' }}>
                          {f.name} {isHOD ? '(Professor & HOD)' : `(${f.designation})`}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                          {isHOD ? 'Department Head Curriculum' : `${f.department || currentDept.name} Faculty`}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      background: isHOD ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                      color: isHOD ? '#818cf8' : 'var(--text-secondary)',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      fontWeight: 700
                    }}>
                      {fSubs.length} Subjects
                    </span>
                  </div>

                  {fSubs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      No subjects assigned to {f.name} yet.
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                            <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Subject Name</th>
                            <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Code</th>
                            <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Semester</th>
                            <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Year</th>
                            <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Target Dept</th>
                            <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Type</th>
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
                                    `${sub.year}${sub.year == '1' ? 'st' : sub.year == '2' ? 'nd' : sub.year == '3' ? 'rd' : 'th'} Year${sub.section ? ` - Sec ${sub.section}` : ''}`
                                  )}
                                </td>
                                <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                  {isEditing ? (
                                    <select value={editSubDept} onChange={e => setEditSubDept(e.target.value)} style={{ padding: '4px' }} disabled={editSubYear === '1'}>
                                      {departments.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
                                    </select>
                                  ) : (
                                    <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontWeight: 600 }}>
                                      {sub.year === '1' ? 'FY' : sub.deptCode || 'IT'}
                                    </span>
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

            {/* UNASSIGNED SUBJECTS (IF ANY) */}
            {unassignedSubjects.length > 0 && (subjectFacultyFilter === 'all' || subjectFacultyFilter === 'unassigned') && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: '12px',
                padding: '1.1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    📋 General / Unassigned Subjects
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {unassignedSubjects.length} Subjects
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Subject Name</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700 }}>Code</th>
                        <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Semester</th>
                        <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Year</th>
                        <th style={{ textAlign: 'center', padding: '8px 12px', fontWeight: 700 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unassignedSubjects.map(sub => (
                        <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{sub.name}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <code style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 6px', borderRadius: '4px' }}>
                              {sub.code}
                            </code>
                          </td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>Sem {sub.semester}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>{sub.year}th Year</td>
                          <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <button
                              onClick={() => onDeleteSubject(sub.id)}
                              style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '4px 6px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Timetable Section: 2nd Year, 3rd Year, 4th Year Separate Tabs */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
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
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                  3. Academic Timetable Matrix
                </h3>
              </div>

              {/* 2nd Year, 3rd Year, 4th Year Year Tabs */}
              <div style={{
                display: 'inline-flex',
                background: 'rgba(0,0,0,0.2)',
                padding: '4px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)'
              }}>
                {(['2', '3', '4'] as const).map(yr => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      background: selectedYear === yr ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'transparent',
                      color: selectedYear === yr ? '#ffffff' : 'var(--text-secondary)'
                    }}
                  >
                    {yr}th Year
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix View for Selected Year */}
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
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
                        const isCurrentStaffSlot =
                          slot &&
                          (slot.teacher?.toLowerCase().includes(currentUser.name.toLowerCase().replace('dr. ', '').replace('prof. ', '').trim()) ||
                           currentUser.name.toLowerCase().includes(slot.teacher?.toLowerCase() || '___'));

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
                              background: isCurrentStaffSlot
                                ? 'rgba(99, 102, 241, 0.22)'
                                : 'transparent',
                              transition: 'all 0.15s'
                            }}
                          >
                            {slot ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: isCurrentStaffSlot ? '#818cf8' : 'inherit' }}>
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

        {/* ==================== RIGHT SIDE: STAFF PERSONAL DETAILS ==================== */}
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
              Staff Profile Details
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
            <div style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{currentUser.avatar || '👨‍🏫'}</div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{currentUser.name}</h3>
            <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
              {currentUser.designation || 'Faculty / Staff'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>College ID No</span>
              <strong style={{ color: '#38bdf8' }}>{currentUser.collegeId || 'SCE-IT-101'}</strong>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>User Name</span>
              <code style={{ color: '#818cf8' }}>{currentUser.username || '@7150staff'}</code>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Degree / Qualification</span>
              <strong>{currentUser.degree || 'M.Tech, Ph.D'}</strong>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Phone Number</span>
              <div>📞 {currentUser.phone || '+91 9876543210'}</div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Mail ID</span>
              <div style={{ wordBreak: 'break-all' }}>📧 {currentUser.email}</div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Date of Birth</span>
              <div>📅 {currentUser.dob || '1985-03-10'}</div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Department</span>
              <div>🏢 {currentUser.department}</div>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Address</span>
              <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                📍 {currentUser.address || 'Suguna College Staff Quarters, Coimbatore'}
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

      {/* Edit Timetable Slot Modal */}
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
    </div>
  );
};
