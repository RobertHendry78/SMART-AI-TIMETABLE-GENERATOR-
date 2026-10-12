import React, { useState } from 'react';
import type { TimetableSlot, Teacher, SubjectItem } from '../types/timetable';
import { X, Check, Sparkles, Calendar, Mail, Bell, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface EditSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: string;
  periodId: number;
  periodName: string;
  currentSlot: TimetableSlot | null;
  teachers: Teacher[];
  subjects: SubjectItem[];
  onSaveSlot: (day: string, periodId: number, slot: TimetableSlot) => void;
}

export const EditSlotModal: React.FC<EditSlotModalProps> = ({
  isOpen,
  onClose,
  day,
  periodId,
  periodName,
  currentSlot,
  teachers,
  subjects,
  onSaveSlot
}) => {
  if (!isOpen) return null;

  const [subjectName, setSubjectName] = useState(currentSlot?.subject || (subjects[0]?.name || 'Database Management Systems'));
  const [subjectCode, setSubjectCode] = useState(currentSlot?.subjectCode || (subjects[0]?.code || 'IT3301'));
  const [teacher, setTeacher] = useState(currentSlot?.teacher || (teachers[0]?.name || 'Dr. R. Ramesh'));
  const [room, setRoom] = useState(currentSlot?.room || 'LH-101');
  const [isLab, setIsLab] = useState(currentSlot?.isLab || false);

  const [isLoadingSubstitute, setIsLoadingSubstitute] = useState(false);
  const [automationResult, setAutomationResult] = useState<any>(null);

  const handleRunAiSubstitute = async () => {
    setIsLoadingSubstitute(true);
    try {
      const response = await fetch('/api/automation/allocate-substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faculty_name: teacher,
          department: 'IT',
          leave_date: new Date().toISOString().split('T')[0],
          periods: [periodId],
          subject_name: subjectName,
          subject_code: subjectCode,
          room_no: room,
          start_time: periodName.split(' - ')[0] || '10:20',
          end_time: periodName.split(' - ')[1] || '11:10'
        })
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data && resJson.data.match_verdict) {
        setAutomationResult(resJson.data);
        setTeacher(resJson.data.match_verdict.assigned_faculty_name);
      }
    } catch (err) {
      console.error('Failed to run AI substitute:', err);
    } finally {
      setIsLoadingSubstitute(false);
    }
  };

  const handleSubjectChange = (name: string) => {
    setSubjectName(name);
    const found = subjects.find(s => s.name === name);
    if (found) {
      setSubjectCode(found.code);
      if (found.teacher) setTeacher(found.teacher);
      if (found.isLab) {
        setIsLab(true);
        setRoom('Computing Lab 1');
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSlot: TimetableSlot = {
      subject: subjectName,
      subjectCode: subjectCode,
      teacher: teacher,
      room: room,
      isLab: isLab,
      color: isLab ? '#0284c7' : '#4f46e5'
    };
    onSaveSlot(day, periodId, updatedSlot);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: 'var(--bg-surface, #1e1e38)',
        border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        color: 'var(--text-primary, #fff)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Edit Timetable Slot</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
              {day} • {periodName} (Slot #{periodId})
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Presets: Library, Free Hour, Seminar */}
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => {
              setSubjectName('Library & Research Reading');
              setSubjectCode('LIB101');
              setTeacher('Chief Librarian');
              setRoom('Central Digital Library');
              setIsLab(false);
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📚 Library Hour
          </button>

          <button
            type="button"
            onClick={() => {
              setSubjectName('Free Hour / Remedial Study');
              setSubjectCode('FREE01');
              setTeacher('Self Managed');
              setRoom('LH-Class');
              setIsLab(false);
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.3)',
              color: '#facc15',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ☕ Free Hour
          </button>

          <button
            type="button"
            onClick={() => {
              setSubjectName('Technical Seminar & Mentoring');
              setSubjectCode('SEM301');
              setTeacher('Faculty Mentor');
              setRoom('Seminar Hall 1');
              setIsLab(false);
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              color: '#c084fc',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🗣️ Seminar
          </button>
        </div>

        {/* n8n Intelligent College Operations Engine Trigger */}
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            onClick={handleRunAiSubstitute}
            disabled={isLoadingSubstitute}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.3))',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              color: '#34d399',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
            }}
          >
            <Sparkles size={16} />
            {isLoadingSubstitute ? 'Calculating 0-Clash Substitute...' : '⚡ AI Smart Substitute (n8n Free Engine)'}
          </button>

          {automationResult && (
            <div style={{
              marginTop: '8px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.78rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Assigned: {automationResult.match_verdict.assigned_faculty_name} ({automationResult.match_verdict.duty_type})
                </span>
              </div>
              <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.72rem', lineHeight: 1.4 }}>
                {automationResult.match_verdict.selection_reason}
              </p>

              {/* Multi-Channel Feature Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                  <Mail size={12} /> Gmail Alert
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                  <Bell size={12} /> In-App Alert
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 600 }}>
                  <ShieldCheck size={12} /> HOD Audit +1hr
                </span>
                {automationResult.features?.google_calendar_event?.calendar_link && (
                  <a
                    href={automationResult.features.google_calendar_event.calendar_link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      background: '#2563eb',
                      color: '#fff',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      marginLeft: 'auto'
                    }}
                  >
                    <Calendar size={12} /> 📅 Add to Google Calendar
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
              Select Subject
            </label>
            <select
              value={subjectName}
              onChange={e => handleSubjectChange(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 10px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'inherit',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            >
              {subjects.map(s => (
                <option key={s.id} value={s.name} style={{ background: '#1e1e38', color: '#fff' }}>
                  {s.name} ({s.code}) - Year {s.year}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                Subject Code
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={e => setSubjectCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'inherit',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                Classroom / Lab Room
              </label>
              <input
                type="text"
                value={room}
                onChange={e => setRoom(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'inherit',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
              Allocated Teacher / Faculty
            </label>
            <select
              value={teacher}
              onChange={e => setTeacher(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 10px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'inherit',
                fontSize: '0.85rem',
                boxSizing: 'border-box'
              }}
            >
              {teachers.map(t => (
                <option key={t.id} value={t.name} style={{ background: '#1e1e38', color: '#fff' }}>
                  {t.name} ({t.designation})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="isLabCheck"
              checked={isLab}
              onChange={e => setIsLab(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="isLabCheck" style={{ fontSize: '0.82rem', cursor: 'pointer' }}>
              Is Practical / Laboratory Session
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Check size={16} />
              <span>Update Slot</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
