import React, { useState } from 'react';
import type { User, Department } from '../types/timetable';
import { DEMO_USERS, DEPARTMENTS } from '../data/mockData';
import { X, Check, ShieldCheck, KeyRound, LogIn } from 'lucide-react';

interface RoleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User, dept?: Department) => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser
}) => {
  const [roleFilter, setRoleFilter] = useState<'all' | 'hod' | 'staff' | 'principal'>('all');

  if (!isOpen) return null;

  const filteredUsers = DEMO_USERS.filter((u: User) => {
    if (roleFilter === 'all') return true;
    if (roleFilter === 'principal') return u.role === 'principal';
    if (roleFilter === 'hod') return u.role === 'hod';
    if (roleFilter === 'staff') return u.role === 'staff' || u.role === 'student';
    return true;
  });

  const handlePickUser = (user: User) => {
    const matchedDept = DEPARTMENTS.find((d: Department) => d.code === user.deptCode);
    onSelectUser(user, matchedDept);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        maxWidth: '560px',
        width: '100%',
        padding: '1.75rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0 }}>Suguna College Auth & Role Portal</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                Secure 1-Click Role Login for Principal, HODs, & Staff
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Role Category Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px',
          background: 'var(--bg-canvas)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1rem'
        }}>
          {[
            { id: 'all', label: 'All Accounts' },
            { id: 'principal', label: '🏛️ Principal' },
            { id: 'hod', label: '🎓 HODs (7)' },
            { id: 'staff', label: '👨‍🏫 Faculty' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as any)}
              style={{
                padding: '0.5rem 0.25rem',
                borderRadius: '8px',
                border: 'none',
                background: roleFilter === tab.id ? 'var(--primary)' : 'transparent',
                color: roleFilter === tab.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* User Account Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredUsers.map((user: User) => {
            const isSelected = currentUser.id === user.id;
            return (
              <div
                key={user.id}
                onClick={() => handlePickUser(user)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-canvas)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '1.6rem' }}>{user.avatar}</span>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                      {user.roleLabel}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {user.email} • <strong style={{ color: 'var(--text-primary)' }}>{user.department}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isSelected ? (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: '#10B981',
                      background: 'rgba(16, 185, 129, 0.15)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '999px'
                    }}>
                      <Check size={14} /> Active
                    </span>
                  ) : (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-surface)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <LogIn size={13} /> Login
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info note */}
        <div style={{
          marginTop: '1rem',
          padding: '0.65rem 0.85rem',
          borderRadius: '8px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          fontSize: '0.74rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ShieldCheck size={16} color="var(--primary)" />
          <span>Role Isolation Active: Logging in as an HOD automatically loads their department workspace and prevents cross-department data conflicts.</span>
        </div>
      </div>
    </div>
  );
};
