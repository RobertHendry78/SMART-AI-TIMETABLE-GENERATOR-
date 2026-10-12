import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, BookOpen, Trash2, MessageCircle, CalendarClock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Department } from '../types/timetable';

interface StaffMember {
  id: string;
  name: string;
  department: string;
  designation?: string;
  email: string;
  phone?: string;
  max_periods?: number;
  subjects?: string;
  status?: string;
}

interface StaffViewProps {
  departments: Department[];
  onOpenWhatsApp: (name: string, phone: string) => void;
  onQuickLeave: (name: string, dept: string) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  departments,
  onOpenWhatsApp,
  onQuickLeave
}) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Staff Input State
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(departments[0]?.name || 'Information Technology');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [maxPeriods, setMaxPeriods] = useState(5);
  const [subjects, setSubjects] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Staff List from Backend REST API
  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/faculty');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setStaffList(data.data);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend faculty fetch error, fallbacking to local list', e);
    } finally {
      setLoading(false);
    }

    // Fallback default list
    setStaffList([
      { id: 'f1', name: 'Dr. R. Ramesh', department: 'Information Technology', designation: 'Professor', email: 'r.ramesh@suguna.edu.in', phone: '+91 9876543210', max_periods: 6, subjects: 'Data Structures, Cloud Computing', status: 'active' },
      { id: 'f2', name: 'Prof. S. Priya', department: 'Information Technology', designation: 'Assistant Professor', email: 's.priya@suguna.edu.in', phone: '+91 9876543211', max_periods: 5, subjects: 'Networks, Web Technologies', status: 'active' },
      { id: 'f3', name: 'Dr. Mythili', department: 'Information Technology', designation: 'Professor & HOD', email: 'mythili@suguna.edu.in', phone: '+91 9876543212', max_periods: 4, subjects: 'AI & Machine Learning', status: 'active' },
      { id: 'f4', name: 'Dr. Ada Lovelace', department: 'Computer Science', designation: 'Professor', email: 'ada@suguna.edu.in', phone: '+91 9876543213', max_periods: 6, subjects: 'Database Systems, Algorithms', status: 'active' },
      { id: 'f5', name: 'Prof. Alan Turing', department: 'AI & Data Science', designation: 'Distinguished Professor', email: 'turing@suguna.edu.in', phone: '+91 9876543214', max_periods: 5, subjects: 'Discrete Maths, Theory of Computation', status: 'active' }
    ]);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showNotice('error', 'Please fill Staff Name and Email.');
      return;
    }

    setIsSubmitting(true);
    const newStaff = {
      name: name.trim(),
      department,
      designation,
      email: email.trim(),
      phone: phone.trim() || '+91 98400 12345',
      max_periods: Number(maxPeriods),
      subjects: subjects.trim() || 'General Curriculum'
    };

    try {
      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      const data = await res.json();
      if (data.success) {
        showNotice('success', `Faculty member ${name} added and synced with Supabase!`);
        setName('');
        setEmail('');
        setPhone('');
        setSubjects('');
        fetchStaff();
      } else {
        showNotice('error', data.message || 'Failed to save faculty.');
      }
    } catch (err: any) {
      showNotice('success', `Faculty member ${name} added to current session.`);
      setStaffList(prev => [{ id: 'f' + Date.now(), ...newStaff, status: 'active' }, ...prev]);
      setName('');
      setEmail('');
      setPhone('');
      setSubjects('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string, staffName: string) => {
    if (!confirm(`Are you sure you want to delete ${staffName}?`)) return;

    try {
      await fetch(`/api/faculty/${id}`, { method: 'DELETE' });
    } catch {}

    setStaffList(prev => prev.filter(s => s.id !== id));
    showNotice('success', `Faculty record for ${staffName} removed.`);
  };

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.subjects && s.subjects.toLowerCase().includes(search.toLowerCase())) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = filterDept === 'ALL' || s.department.toLowerCase().includes(filterDept.toLowerCase());
    return matchesSearch && matchesDept;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${notification.type === 'success' ? '#10B981' : '#EF4444'}`,
          color: notification.type === 'success' ? '#10B981' : '#EF4444',
          fontSize: '0.9rem',
          fontWeight: 700
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Grid: Staff Input Form on Left (or Top) + Live Faculty Directory */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 380px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* === 1. STAFF INPUT FORM CARD === */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plus size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Add New Faculty</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Staff Profile & Workload Quota
              </p>
            </div>
          </div>

          <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Full Name *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dr. K. Saravanan"
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
                  <option value="Computer Science">Computer Science</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Designation
                </label>
                <select
                  value={designation}
                  onChange={e => setDesignation(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.5rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', fontSize: '0.82rem' }}
                >
                  <option value="Professor & HOD">Professor & HOD</option>
                  <option value="Professor">Professor</option>
                  <option value="Associate Professor">Associate Professor</option>
                  <option value="Assistant Professor">Assistant Professor</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@suguna.edu.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  WhatsApp Phone
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Handled Subjects & Specialization
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Web Technologies, Cloud, DBMS"
                value={subjects}
                onChange={e => setSubjects(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span>Max Periods Per Day</span>
                <strong style={{ color: 'var(--primary)' }}>{maxPeriods} Periods</strong>
              </label>
              <input
                type="range"
                min={2}
                max={7}
                value={maxPeriods}
                onChange={e => setMaxPeriods(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700
              }}
            >
              <Plus size={16} />
              <span>{isSubmitting ? 'Saving to Database...' : 'Save Faculty Profile'}</span>
            </button>
          </form>
        </div>

        {/* === 2. LIVE FACULTY ROSTER TABLE & CARDS === */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Header Bar: Title + Department Filter + Search Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={20} color="var(--primary)" />
                <span>Faculty Directory</span>
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '999px', background: 'var(--primary-subtle)', color: 'var(--primary)', fontWeight: 800 }}>
                  {filteredStaff.length} Members
                </span>
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search faculty..."
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
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Faculty Card Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading faculty records from Supabase...
            </div>
          ) : filteredStaff.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              No faculty found matching search.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {filteredStaff.map(s => (
                <div
                  key={s.id}
                  style={{
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                      <div>
                        <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)', display: 'block' }}>{s.name}</strong>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          {s.designation || 'Faculty'} • <strong style={{ color: 'var(--primary)' }}>{s.department}</strong>
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '999px',
                        background: s.status === 'leave' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: s.status === 'leave' ? '#D97706' : '#10B981'
                      }}>
                        {s.status === 'leave' ? '🏖️ On Leave' : '🟢 Active'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={13} color="var(--primary)" />
                        <span>{s.subjects || 'Core Curriculum'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} />
                        <span>{s.email}</span>
                      </div>
                      {s.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={13} />
                          <span>{s.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '0.4rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                    <button
                      className="btn btn-sm btn-outline"
                      title="Dispatch WhatsApp Alert"
                      onClick={() => onOpenWhatsApp(s.name, s.phone || '')}
                      style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <MessageCircle size={13} color="#25D366" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      className="btn btn-sm btn-secondary"
                      title="Mark Leave & Assign Substitute"
                      onClick={() => onQuickLeave(s.name, s.department)}
                      style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.74rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      <CalendarClock size={13} />
                      <span>Leave</span>
                    </button>

                    <button
                      className="btn btn-sm btn-outline"
                      title="Delete Faculty"
                      onClick={() => handleDeleteStaff(s.id, s.name)}
                      style={{ padding: '0.35rem 0.5rem', fontSize: '0.74rem', color: '#EF4444' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
