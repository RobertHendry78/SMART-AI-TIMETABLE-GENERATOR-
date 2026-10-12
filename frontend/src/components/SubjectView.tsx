import React, { useState } from 'react';
import { BookOpen, Plus, Search, Trash2, CheckCircle2, FlaskConical, Award, Edit3, X, Check } from 'lucide-react';
import type { Department } from '../types/timetable';

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  department: string;
  weeklyHours: number;
  isLab: boolean;
  semester: number;
}

interface SubjectViewProps {
  departments: Department[];
}

export const SubjectView: React.FC<SubjectViewProps> = ({ departments }) => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([
    { id: 's1', code: 'IT3501', name: 'Web Technologies & Cloud', department: 'Information Technology', weeklyHours: 4, isLab: false, semester: 5 },
    { id: 's2', code: 'IT3502', name: 'Database Management Systems', department: 'Information Technology', weeklyHours: 4, isLab: false, semester: 5 },
    { id: 's3', code: 'IT3503', name: 'Operating Systems & Security', department: 'Information Technology', weeklyHours: 4, isLab: false, semester: 5 },
    { id: 's4', code: 'IT3511', name: 'Cloud Computing Laboratory', department: 'Information Technology', weeklyHours: 3, isLab: true, semester: 5 },
    { id: 's5', code: 'CS3401', name: 'Design & Analysis of Algorithms', department: 'Computer Science & Engineering', weeklyHours: 4, isLab: false, semester: 3 },
    { id: 's6', code: 'AD3301', name: 'Machine Learning Foundations', department: 'AI & Data Science', weeklyHours: 4, isLab: false, semester: 3 },
    { id: 's7', code: 'MT3501', name: 'Robotics & Industrial Automation', department: 'Mechatronics Engineering', weeklyHours: 4, isLab: false, semester: 5 },
    { id: 's8', code: 'MT3511', name: 'Robotics & Sensors Lab', department: 'Mechatronics Engineering', weeklyHours: 3, isLab: true, semester: 5 },
    { id: 's9', code: 'ME3401', name: 'Thermodynamics & Heat Transfer', department: 'Mechanical Engineering', weeklyHours: 4, isLab: false, semester: 3 },
    { id: 's10', code: 'EC3501', name: 'Digital Signal Processing', department: 'Electronics & Communication', weeklyHours: 4, isLab: false, semester: 5 }
  ]);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(departments[0]?.name || 'Information Technology');
  const [weeklyHours, setWeeklyHours] = useState(4);
  const [isLab, setIsLab] = useState(false);
  const [semester, setSemester] = useState(5);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [notice, setNotice] = useState<string | null>(null);

  const startEdit = (s: SubjectItem) => {
    setEditingId(s.id);
    setCode(s.code);
    setName(s.name);
    setDepartment(s.department);
    setWeeklyHours(s.weeklyHours);
    setIsLab(s.isLab);
    setSemester(s.semester);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setCode('');
    setName('');
    setIsLab(false);
    setWeeklyHours(4);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    if (editingId) {
      // Edit Existing Subject
      setSubjects(prev => prev.map(s => s.id === editingId ? {
        ...s,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        department,
        weeklyHours: Number(weeklyHours),
        isLab,
        semester: Number(semester)
      } : s));
      setNotice(`✅ Subject ${code.toUpperCase()} updated successfully!`);
      cancelEdit();
    } else {
      // Add New Subject
      const newSub: SubjectItem = {
        id: 'sub-' + Date.now(),
        code: code.trim().toUpperCase(),
        name: name.trim(),
        department,
        weeklyHours: Number(weeklyHours),
        isLab,
        semester: Number(semester)
      };
      setSubjects(prev => [newSub, ...prev]);
      setCode('');
      setName('');
      setIsLab(false);
      setNotice(`✅ Subject ${newSub.code} - ${newSub.name} added to curriculum!`);
    }

    setTimeout(() => setNotice(null), 3500);
  };

  const handleDelete = (id: string, sName: string) => {
    if (!confirm(`Delete subject ${sName}?`)) return;
    setSubjects(prev => prev.filter(s => s.id !== id));
    if (editingId === id) cancelEdit();
  };

  const filtered = subjects.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === 'ALL' || s.department.toLowerCase().includes(filterDept.toLowerCase());
    return matchSearch && matchDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {notice && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10B981',
          color: '#10B981',
          fontSize: '0.9rem',
          fontWeight: 700
        }}>
          <CheckCircle2 size={18} />
          <span>{notice}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(330px, 370px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* === 1. SUBJECT INPUT & EDIT FORM === */}
        <div style={{
          background: 'var(--bg-surface)',
          border: editingId ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: editingId ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {editingId ? <Edit3 size={18} /> : <BookOpen size={20} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  {editingId ? 'Edit Subject' : 'Add Subject'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {editingId ? 'Modify course details & quota' : 'Course Code & Credit Hours'}
                </p>
              </div>
            </div>

            {editingId && (
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={cancelEdit}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSaveSubject} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Subject Code *
              </label>
              <input
                type="text"
                placeholder="e.g. IT3501 or CS3401"
                value={code}
                onChange={e => setCode(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Subject Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Web Technologies & Cloud"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Department
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', fontSize: '0.82rem' }}
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                  <option value="Mechatronics Engineering">Mechatronics</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Electronics & Communication">ECE</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={e => setSemester(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.6rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', fontSize: '0.82rem' }}
                >
                  <option value={1}>Sem 1 (1st Year)</option>
                  <option value={3}>Sem 3 (2nd Year)</option>
                  <option value={5}>Sem 5 (3rd Year)</option>
                  <option value={7}>Sem 7 (Final Year)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Weekly Hours Quota</span>
                <strong style={{ color: 'var(--primary)' }}>{weeklyHours} Hours/Week</strong>
              </label>
              <input
                type="range"
                min={1}
                max={6}
                value={weeklyHours}
                onChange={e => setWeeklyHours(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)'
            }}>
              <input
                type="checkbox"
                id="isLabCheck"
                checked={isLab}
                onChange={e => setIsLab(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="isLabCheck" style={{ fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', margin: 0 }}>
                🔬 Laboratory Practical (Consecutive 2-3 Period Block)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700
                }}
              >
                {editingId ? <Check size={16} /> : <Plus size={16} />}
                <span>{editingId ? 'Update Subject' : 'Add to Curriculum'}</span>
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="btn btn-outline"
                  style={{ padding: '0.75rem 1rem', borderRadius: '8px' }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* === 2. SUBJECT CATALOG TABLE WITH EDIT & DELETE === */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="var(--primary)" />
                <span>Curriculum Subjects Registry</span>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 800 }}>
                  {filtered.length} Subjects
                </span>
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search code or subject..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ padding: '0.45rem 0.75rem 0.45rem 2rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', fontSize: '0.82rem', width: '180px' }}
                />
              </div>

              <select
                value={filterDept}
                onChange={e => setFilterDept(e.target.value)}
                style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', fontSize: '0.82rem' }}
              >
                <option value="ALL">All Depts</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.75rem' }}>Code</th>
                  <th style={{ padding: '0.75rem' }}>Subject Name</th>
                  <th style={{ padding: '0.75rem' }}>Department</th>
                  <th style={{ padding: '0.75rem' }}>Type</th>
                  <th style={{ padding: '0.75rem' }}>Weekly Hours</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: editingId === s.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--primary)' }}>{s.code}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{s.department}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        background: s.isLab ? 'rgba(236, 72, 153, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                        color: s.isLab ? '#EC4899' : '#6366F1'
                      }}>
                        {s.isLab ? <FlaskConical size={12} /> : null}
                        {s.isLab ? 'Lab Practical' : 'Theory'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{s.weeklyHours} hrs/wk</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => startEdit(s)}
                          className="btn btn-sm btn-outline"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Edit Subject"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          className="btn btn-sm btn-outline"
                          style={{ padding: '0.3rem 0.5rem', color: '#EF4444' }}
                          title="Delete Subject"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
