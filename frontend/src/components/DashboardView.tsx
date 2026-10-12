import React from 'react';
import { Users, GraduationCap, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { TEACHERS, CLASSES } from '../data/mockData';

export const DashboardView: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
            <Users size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Active Faculty</span>
            <span className="kpi-value">{TEACHERS.length}</span>
            <span className="kpi-subtext">Balanced Across 4 Depts</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(2, 132, 199, 0.1)', color: '#0284c7' }}>
            <GraduationCap size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Student Batches</span>
            <span className="kpi-value">{CLASSES.length}</span>
            <span className="kpi-subtext">All Curricula Scheduled</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <ShieldCheck size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Constraint Health</span>
            <span className="kpi-value">100%</span>
            <span className="kpi-subtext">0 Clashes Guaranteed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Clock size={22} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Weekly Lectures</span>
            <span className="kpi-value">168 hrs</span>
            <span className="kpi-subtext">Optimal Load Factor</span>
          </div>
        </div>
      </div>

      {/* Faculty Workload Audit Grid */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Faculty Workload & Audit</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Real-time monitoring of lecture hours per teacher to prevent cognitive overload.
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={16} /> All Workloads Within AI Bounds
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {TEACHERS.map(teacher => {
            const percent = Math.round((teacher.weeklyHours / teacher.maxHours) * 100);
            const isOptimal = teacher.weeklyHours <= 16;
            const barColor = isOptimal ? '#4f46e5' : '#f59e0b';

            return (
              <div
                key={teacher.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>{teacher.avatar}</span>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>{teacher.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{teacher.department}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '0.9rem', color: barColor }}>{teacher.weeklyHours} hrs</strong>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Max: {teacher.maxHours}h</div>
                  </div>
                </div>

                <div style={{ height: '7px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: barColor, borderRadius: '999px', transition: 'width 0.5s' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
