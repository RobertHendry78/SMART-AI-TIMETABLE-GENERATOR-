import React, { useState } from 'react';
import type { User, Department } from '../types/timetable';
import { X, Check, User as UserIcon, Phone, Mail, GraduationCap, Calendar, MapPin, Building } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSaveUser: (updatedUser: User) => void;
  departments: Department[];
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
  departments
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [degree, setDegree] = useState(currentUser.degree || '');
  const [collegeId, setCollegeId] = useState(currentUser.collegeId || '');
  const [dob, setDob] = useState(currentUser.dob || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated: User = {
      ...currentUser,
      name,
      phone,
      email,
      degree,
      collegeId,
      dob,
      address,
      department
    };

    try {
      await fetch(`/api/auth/user/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {
      // Local fallback
    }

    onSaveUser(updated);
    setIsSaving(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: 'var(--bg-surface, #1e1e38)',
        border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
        borderRadius: '20px',
        padding: '1.75rem',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        color: 'var(--text-primary, #fff)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Edit Personal Details</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #94a3b8)' }}>
              Update your registered credentials & contact details
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px 9px 30px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'inherit',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px 9px 30px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'inherit',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                Mail ID
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px 9px 30px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'inherit',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                Degree / Qualification
              </label>
              <div style={{ position: 'relative' }}>
                <GraduationCap size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  value={degree}
                  onChange={e => setDegree(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px 9px 30px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'inherit',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                College ID No
              </label>
              <input
                type="text"
                value={collegeId}
                onChange={e => setCollegeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'inherit',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                Date of Birth
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px 9px 30px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'inherit',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                Department
              </label>
              <div style={{ position: 'relative' }}>
                <Building size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 10px 9px 30px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'inherit',
                    fontSize: '0.88rem',
                    boxSizing: 'border-box'
                  }}
                >
                  {departments.map(d => (
                    <option key={d.code} value={d.name} style={{ background: '#1e1e38', color: '#fff' }}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
              Address
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px 9px 30px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'inherit',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
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
              disabled={isSaving}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
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
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
