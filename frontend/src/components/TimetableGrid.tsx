import React, { useState } from 'react';
import type { Department, ClassSection, Period, ClassTimetable } from '../types/timetable';
import { Search, MapPin, User, Sparkles } from 'lucide-react';

interface TimetableGridProps {
  departments: Department[];
  classes: ClassSection[];
  periods: Period[];
  workingDays: string[];
  activeDept: Department;
  setActiveDept: (d: Department) => void;
  activeClass: ClassSection;
  setActiveClass: (c: ClassSection) => void;
  schedule: ClassTimetable;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  classes,
  periods,
  workingDays,
  activeDept,
  activeClass,
  setActiveClass,
  schedule
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightSubject, setHighlightSubject] = useState<string | null>(null);

  const deptClasses = classes
    .filter(c => c.deptCode === activeDept.code)
    .sort((a, b) => b.yearLevel - a.yearLevel);

  const isMatch = (slot: any) => {
    if (!slot) return false;
    if (highlightSubject && slot.subject === highlightSubject) return true;
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      slot.subject?.toLowerCase().includes(q) ||
      slot.teacher?.toLowerCase().includes(q) ||
      slot.room?.toLowerCase().includes(q)
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Department & Batch Selector Card */}
      <div className="control-bar-card">
        {/* Department Banner & HOD Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>{activeDept.icon}</span>
            <div>
              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{activeDept.name} ({activeDept.code})</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Department Workspace • Room Allocation LH-101 to LH-103
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '0.35rem 0.75rem',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: 'var(--primary)'
          }}>
            <span>🎓 HOD:</span>
            <span>{activeDept.hod}</span>
          </div>
        </div>

        {/* Section / Year Batch Selector (Final Year -> 3rd Year -> 2nd Year) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '0.25rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Year / Batch:
          </span>
          <div className="pills-group">
            {deptClasses.map(cls => (
              <button
                key={cls.id}
                className={`pill-item ${activeClass.id === cls.id ? 'active' : ''}`}
                onClick={() => setActiveClass(cls)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: activeClass.id === cls.id ? 800 : 600 }}
              >
                <span>{cls.yearLevel === 4 ? '🎓' : cls.yearLevel === 3 ? '📘' : '📗'}</span>
                <span>{cls.name}</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>({cls.room})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar & Quick Helpers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search teacher, subject, room..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.4rem',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Sparkles size={16} color="var(--primary)" />
          <span>Click any subject slot to highlight its distribution across all 5 working days.</span>
        </div>
      </div>

      {/* Timetable Grid Card */}
      <div className="timetable-card">
        <table className="timetable-table">
          <thead>
            <tr>
              <th style={{ width: '110px' }}>Day / Period</th>
              {periods.map(p => (
                <th key={p.id}>
                  <div>{p.name}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)' }}>{p.time}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workingDays.map(day => {
              const daySlots = schedule[day] || {};
              return (
                <tr key={day}>
                  <td className="day-cell">{day}</td>
                  {periods.map(period => {
                    if (period.type === 'break') {
                      return (
                        <td key={period.id} className="slot-break-box">
                          {period.name.toUpperCase()}
                        </td>
                      );
                    }

                    const slot = daySlots[period.id];
                    const highlighted = isMatch(slot);

                    if (!slot) {
                      return (
                        <td key={period.id} style={{ opacity: 0.45 }}>
                          <div className="slot-box" style={{ background: 'transparent', borderStyle: 'dashed' }}>
                            <span style={{ fontSize: '0.74rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>Free Period</span>
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td key={period.id}>
                        <div
                          className={`slot-box ${slot.isLab ? 'is-lab' : ''}`}
                          style={{
                            borderColor: highlighted ? 'var(--amber)' : undefined,
                            boxShadow: highlighted ? '0 0 12px rgba(245, 158, 11, 0.4)' : undefined
                          }}
                          onClick={() => setHighlightSubject(highlightSubject === slot.subject ? null : slot.subject)}
                        >
                          {slot.isLab && <span className="slot-tag-lab">🧪 Lab Practical</span>}
                          <div className="slot-subject-title">{slot.subject}</div>
                          <div className="slot-teacher-name">
                            <User size={12} />
                            <span>{slot.teacher}</span>
                          </div>
                          {slot.room && (
                            <div className="slot-room-badge">
                              <MapPin size={11} style={{ display: 'inline', marginRight: '2px' }} />
                              {slot.room}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
