import React, { useState, useEffect } from 'react';
import type { User, Department, Teacher, SubjectItem, CollegeTimetable, Period } from '../types/timetable';
import { Building2, Edit3, Layers, Printer, Download, Clock, CalendarDays } from 'lucide-react';
import { ProfileEditModal } from './ProfileEditModal';
import { EditSlotModal } from './EditSlotModal';
import * as XLSX from 'xlsx';

interface PrincipalPortalViewProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  departments: Department[];
  teachers: Teacher[];
  subjects: SubjectItem[];
  schedule: CollegeTimetable;
  onUpdateScheduleSlot: (classId: string, day: string, periodId: number, slot: any) => void;
  periods: Period[];
  workingDays: string[];
}

export const PrincipalPortalView: React.FC<PrincipalPortalViewProps> = ({
  currentUser,
  onUpdateUser,
  departments,
  teachers,
  subjects,
  schedule,
  onUpdateScheduleSlot,
  periods,
  workingDays
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{ classId: string; day: string; periodId: number; slot: any } | null>(null);

  // Selected Department (defaults to B.Tech IT)
  const [selectedDept, setSelectedDept] = useState<Department>(departments[0]);

  // Selected Year Tab for the active department: 2nd, 3rd, 4th
  const [selectedYear, setSelectedYear] = useState<'2' | '3' | '4'>('2');

  // Overall timetable filter (All, or by Year)
  const [overallYearFilter, setOverallYearFilter] = useState<'all' | '2' | '3' | '4'>('all');

  // Academic Year State (Requested by user: 2024-2025 default)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');

  // Track absent faculty visually
  const [absentFacultyNames, setAbsentFacultyNames] = useState<string[]>([]);

  // Workload & Hours details for selected department (HOD & Staff)
  const [deptWorkloadStats, setDeptWorkloadStats] = useState<any[]>([]);
  const [isLoadingWorkload, setIsLoadingWorkload] = useState(false);

  const loadDeptWorkload = async (deptCode: string) => {
    setIsLoadingWorkload(true);
    try {
      const res = await fetch(`/api/faculty/workload-stats?department=${deptCode}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDeptWorkloadStats(json.data);
        }
      }
    } catch (e) {
      console.warn('Failed to load workload for principal:', e);
    } finally {
      setIsLoadingWorkload(false);
    }
  };

  useEffect(() => {
    loadDeptWorkload(selectedDept.code);
  }, [selectedDept]);

  const isFacultyMatch = (subTeacher: string | undefined, facultyName: string) => {
    if (!subTeacher || !facultyName) return false;
    const cleanSub = subTeacher.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
    const cleanFac = facultyName.toLowerCase().replace(/^(dr\.|prof\.|mr\.|mrs\.|ms\.)\s*/i, '').trim();
    return cleanSub.includes(cleanFac) || cleanFac.includes(cleanSub);
  };

  const deptSubjects = subjects.filter(s => 
    s.deptCode === selectedDept.code || 
    (selectedDept.code === 'FY' && String(s.year) === '1')
  );

  const baseDeptFaculty = teachers.filter(t => {
    if (t.deptCode === selectedDept.code) return true;
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
    name: selectedDept.hod || 'Dr. Mythili',
    designation: 'Professor & HOD',
    email: `hod.${selectedDept.code.toLowerCase()}@sugunacollege.edu`,
    phone: '+91 9842100002'
  };

  const activeClassId = `${selectedDept.code}-${selectedYear}A`;

  // Export Overall Timetable to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    departments.forEach(dept => {
      (['2', '3', '4'] as const).forEach(yr => {
        const clsId = `${dept.code}-${yr}A`;
        const clsSchedule = schedule[clsId];
        if (!clsSchedule) return;

        const rows: any[] = [];
        workingDays.forEach(day => {
          const rowData: any = { Day: day };
          periods.forEach(p => {
            if (p.type === 'break') {
              rowData[p.name] = 'Break';
            } else {
              const slot = clsSchedule[day]?.[p.id];
              rowData[`${p.name} (${p.time})`] = slot ? `${slot.subject} [${slot.teacher}]` : '—';
            }
          });
          rows.push(rowData);
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, `${dept.code}-${yr}Yr`);
      });
    });

    XLSX.writeFile(wb, `Suguna_College_Master_Timetable_${Date.now()}.xlsx`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* 3-Column Layout: Left (College Departments Full Directory), Center (Work Area & Overall Timetable), Right (Principal Profile Details) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '290px 1fr 300px',
        gap: '1.25rem',
        alignItems: 'start'
      }}>
        {/* ==================== LEFT SIDE: COLLEGE DEPARTMENTS FULL DIRECTORY ==================== */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Institutional Hierarchy
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.05rem', fontWeight: 800 }}>
              College Departments
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Click a department (e.g. B.Tech IT) to view its HOD, staff details, and timetables.
            </p>
          </div>

          {/* Department List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {departments.map(d => {
              const isSelected = selectedDept.code === d.code;
              return (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => setSelectedDept(d)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: isSelected ? '1px solid #6366F1' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    color: isSelected ? '#ffffff' : 'inherit',
                    transition: 'all 0.15s',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem' }}>{d.icon || '🏢'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        {d.code === 'IT' ? 'B.Tech IT' :
                         d.code === 'CSE' ? 'B.E CSE' :
                         d.code === 'AIDS' ? 'B.Tech AIDS' :
                         d.code === 'ECE' ? 'B.E ECE' :
                         d.code === 'MECH' ? 'B.E MECH' :
                         d.code === 'MCT' ? 'B.Tech MCT' : d.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {d.name}
                      </div>
                    </div>
                  </div>
                  {isSelected && <span style={{ color: '#818cf8', fontWeight: 800, fontSize: '0.75rem' }}>Active</span>}
                </button>
              );
            })}
          </div>

          {/* Selected Department HOD & Staff Details Card (Requested by User) */}
          <div style={{
            background: 'var(--bg-card, rgba(255,255,255,0.03))',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} color="#6366f1" />
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#818cf8' }}>
                {selectedDept.name} Administration
              </span>
            </div>

            {/* HOD info */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 10px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700 }}>
                HOD Name:
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#38bdf8' }}>
                {deptHOD.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                📧 {deptHOD.email}
              </div>
            </div>

            {/* Staff list */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Faculty & Staff Details ({deptFaculty.length}):
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {deptFaculty.map(f => {
                  const isAbsent = absentFacultyNames.includes(f.name);
                  return (
                  <div
                    key={f.id}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, textDecoration: isAbsent ? 'line-through' : 'none', color: isAbsent ? '#ef4444' : 'inherit' }}>{f.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>
                        {f.designation} • {f.phone || '+91 9876543210'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setAbsentFacultyNames(prev => prev.filter(n => n !== f.name))}
                        style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: 'none',
                          fontSize: '0.7rem',
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
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: 'none',
                          fontSize: '0.7rem',
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
                  </div>
                )})}
              </div>
            </div>
          </div>
        </div>

        {/* ==================== CENTER: DEPARTMENT TIMETABLE & OVERALL TIMETABLE ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* ==================== BOX 1: DEPARTMENT HOURS DETAILS TABLE ==================== */}
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
                    Faculty Hours Details — {selectedDept.name} ({selectedDept.code})
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                    Exclusive breakdown for {selectedDept.name}: HOD & Staff teaching hours, Conducted vs Missed.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => loadDeptWorkload(selectedDept.code)}
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
                      const isHodRow = f.role === 'hod' || f.name.includes('Mythili') || f.name.includes('Rajasekaran') || f.name.includes('Kavitha');
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
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ==================== BOX 2: TIMETABLE VIEWER WITH TOP SELECTOR BOX (KUTI BOX) ==================== */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Top Selector Box (Kuti Box for Year, Semester, and 2024 Academic Year) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05))',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarDays size={18} color="#818cf8" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#c7d2fe' }}>
                    {selectedDept.name} Timetable Control Box
                  </span>
                </div>

                {/* Academic Year Selector (2024-2025 default as requested) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Academic Year:</span>
                  <select
                    value={selectedAcademicYear}
                    onChange={e => setSelectedAcademicYear(e.target.value)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                  >
                    <option value="2024-2025">2024 - 2025</option>
                    <option value="2025-2026">2025 - 2026</option>
                    <option value="2026-2027">2026 - 2027</option>
                  </select>
                </div>
              </div>

              {/* 2nd, 3rd, and 4th Year Selector Pills with Semesters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {[
                  { yr: '2' as const, label: '2nd Year', sem: 'Semester 3 & 4', batch: 'Batch 2024' },
                  { yr: '3' as const, label: '3rd Year', sem: 'Semester 5 & 6', batch: 'Batch 2023' },
                  { yr: '4' as const, label: '4th Year', sem: 'Semester 7 & 8', batch: 'Batch 2022' }
                ].map(item => {
                  const isCurYr = selectedYear === item.yr;
                  return (
                    <button
                      key={item.yr}
                      type="button"
                      onClick={() => setSelectedYear(item.yr)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: isCurYr ? '1.5px solid #6366F1' : '1px solid var(--border-subtle)',
                        background: isCurYr ? 'rgba(99, 102, 241, 0.25)' : 'rgba(0,0,0,0.2)',
                        color: isCurYr ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        boxShadow: isCurYr ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: isCurYr ? '#c7d2fe' : 'inherit' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: isCurYr ? '#818cf8' : 'var(--text-secondary)' }}>
                        {item.sem} • {item.batch}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Timetable Matrix for Selected Department & Year */}
            <div style={{ overflowX: 'auto' }}>
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

                        const slot = schedule[activeClassId]?.[day]?.[p.id];
                        return (
                          <td
                            key={p.id}
                            onClick={() => setEditingSlot({ classId: activeClassId, day, periodId: p.id, slot })}
                            title="Click to edit slot parameters"
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
                                {/* Subject Name */}
                                <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#ffffff' }}>
                                  {slot.subject}
                                </div>
                                {/* Staff Name Underneath (Exact requirement) */}
                                <div style={{
                                  fontSize: '0.74rem',
                                  color: '#38bdf8',
                                  fontWeight: 700,
                                  background: 'rgba(56, 189, 248, 0.1)',
                                  padding: '1px 4px',
                                  borderRadius: '4px',
                                  display: 'inline-block'
                                }}>
                                  👨‍🏫 {slot.teacher}
                                </div>
                                <div style={{ fontSize: '0.68rem', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginTop: '2px' }}>
                                  <code>{slot.subjectCode}</code>
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

          {/* OVERALL TIMETABLE SECTION: Master Matrix across all college departments */}
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
              gap: '12px',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="#6366f1" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                    Master Institutional Timetable (Overall College-Wide Matrix)
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Aggregated schedule across all departments and academic years
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {/* Year filter */}
                <select
                  value={overallYearFilter}
                  onChange={e => setOverallYearFilter(e.target.value as any)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    color: 'inherit',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="all" style={{ background: '#1e1e38', color: '#fff' }}>All Academic Years</option>
                  <option value="2" style={{ background: '#1e1e38', color: '#fff' }}>2nd Year Batches</option>
                  <option value="3" style={{ background: '#1e1e38', color: '#fff' }}>3rd Year Batches</option>
                  <option value="4" style={{ background: '#1e1e38', color: '#fff' }}>4th Year Batches</option>
                </select>

                <button
                  type="button"
                  onClick={handleExportExcel}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#6ee7b7',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} />
                  <span>Export Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid var(--border-subtle)',
                    color: 'inherit',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Overall Timetable Multi-Department Accordion / Matrix */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {departments
                .filter(d => d.code !== 'FY')
                .map(dept => {
                  const yearsToRender = overallYearFilter === 'all'
                    ? (['2', '3', '4'] as const)
                    : ([overallYearFilter] as const);

                  return (
                    <div
                      key={dept.code}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        padding: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{dept.icon || '🏢'}</span>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>
                          {dept.name} ({dept.code}) — HOD: {dept.hod}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {yearsToRender.map(yr => {
                          const clsId = `${dept.code}-${yr}A`;
                          const clsSchedule = schedule[clsId];
                          if (!clsSchedule) return null;

                          return (
                            <div key={clsId} style={{ overflowX: 'auto' }}>
                              <div style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#a5b4fc',
                                background: 'rgba(99, 102, 241, 0.1)',
                                padding: '4px 8px',
                                borderRadius: '6px 6px 0 0',
                                display: 'inline-block'
                              }}>
                                Batch: {yr}th Year ({clsId})
                              </div>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', minWidth: '650px' }}>
                                <thead>
                                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <th style={{ padding: '6px', border: '1px solid var(--border-subtle)', width: '80px' }}>Day</th>
                                    {periods.filter(p => p.type !== 'break').map(p => (
                                      <th key={p.id} style={{ padding: '6px', border: '1px solid var(--border-subtle)' }}>
                                        {p.name}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {workingDays.slice(0, 3).map(day => (
                                    <tr key={day}>
                                      <td style={{ padding: '6px', border: '1px solid var(--border-subtle)', fontWeight: 700 }}>
                                        {day.slice(0, 3)}
                                      </td>
                                      {periods.filter(p => p.type !== 'break').map(p => {
                                        const slot = clsSchedule[day]?.[p.id];
                                        return (
                                          <td
                                            key={p.id}
                                            style={{
                                              padding: '6px',
                                              border: '1px solid var(--border-subtle)',
                                              background: slot ? 'rgba(99, 102, 241, 0.05)' : 'transparent'
                                            }}
                                          >
                                            {slot ? (
                                              <div>
                                                <div style={{ fontWeight: 700, color: '#fff' }}>{slot.subject}</div>
                                                <div style={{ color: '#38bdf8', fontSize: '0.68rem' }}>{slot.teacher}</div>
                                              </div>
                                            ) : (
                                              <span style={{ color: 'var(--text-secondary)' }}>—</span>
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
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* ==================== RIGHT SIDE: PRINCIPAL PERSONAL DETAILS ==================== */}
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
              Principal Profile Details
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
            <div style={{ fontSize: '2.5rem', marginBottom: '4px' }}>{currentUser.avatar || '🏛️'}</div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{currentUser.name}</h3>
            <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
              Principal & Academic Director
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>College ID No</span>
              <strong style={{ color: '#38bdf8' }}>{currentUser.collegeId || 'SCE-PRIN-001'}</strong>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>User Name</span>
              <code style={{ color: '#818cf8' }}>{currentUser.username || '@7150rajagopal'}</code>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Degree / Qualification</span>
              <strong>{currentUser.degree || 'Ph.D in Computer Science'}</strong>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Phone Number</span>
              <div>📞 {currentUser.phone || '+91 9842100001'}</div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Mail ID</span>
              <div style={{ wordBreak: 'break-all' }}>📧 {currentUser.email}</div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Date of Birth</span>
              <div>📅 {currentUser.dob || '1974-04-12'}</div>
            </div>

            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Designation</span>
              <div>🏛️ Principal & Superadmin</div>
            </div>

            <div>
              <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.72rem' }}>Address</span>
              <div style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                📍 {currentUser.address || 'Suguna Campus Quarters, Coimbatore - 641014'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
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
    </div>
  );
};
