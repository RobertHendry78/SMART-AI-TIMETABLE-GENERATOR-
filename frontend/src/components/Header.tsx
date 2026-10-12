import React from 'react';
import { Sun, Moon, ShieldCheck, LogOut, RefreshCw, ArrowLeft } from 'lucide-react';
import type { User } from '../types/timetable';

interface HeaderProps {
  currentUser: User;
  theme: string;
  toggleTheme: () => void;
  onLogout: () => void;
  onOpenRoleModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  theme,
  toggleTheme,
  onLogout,
  onOpenRoleModal
}) => {
  const getRoleLabel = () => {
    if (currentUser.role === 'principal') return '🏛️ Principal & Academic Director Portal';
    if (currentUser.role === 'hod') return `⚡ Head of Department (HOD) Portal • ${currentUser.department || 'Information Technology'}`;
    return `👨‍🏫 Faculty Portal • ${currentUser.department || 'Information Technology'}`;
  };

  const handleBack = () => {
    // Navigate straight back to the login screen without annoying native browser alerts
    onLogout();
  };

  return (
    <header className="top-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.75rem',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Left: Navigation, Institution Branding & Active Portal Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '4px' }}>
          <button 
            onClick={handleBack}
            title="Go Back to Login"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.3rem',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
          }}>
            🎓
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '1.05rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 40%, #c7d2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Suguna College of Engineering
            </h1>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Autonomous Institution • Affiliated to Anna University, Chennai
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          padding: '0.35rem 0.85rem',
          borderRadius: '999px',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#a5b4fc'
        }}>
          <span>{getRoleLabel()}</span>
        </div>
      </div>

      {/* Right: Cloud DB status, Profile, Role Switch, Theme, Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Database Connected Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.74rem',
          color: '#10b981',
          fontWeight: 700,
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '0.35rem 0.75rem',
          borderRadius: '999px'
        }}>
          <ShieldCheck size={14} />
          <span>🟢 Supabase DB Connected</span>
        </div>

        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          padding: '0.3rem 0.75rem',
          borderRadius: '10px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>{currentUser.avatar || '👤'}</span>
          <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <div style={{ fontWeight: 800, fontSize: '0.82rem' }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.68rem', color: '#818cf8', fontWeight: 600 }}>
              {currentUser.username || `@7150${currentUser.name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)}`}
            </div>
          </div>
        </div>

        {/* Switch Role Button */}
        {onOpenRoleModal && (
          <button
            onClick={onOpenRoleModal}
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              borderRadius: '8px',
              fontWeight: 700
            }}
            title="Switch between Principal, HOD, and Staff portals"
          >
            <RefreshCw size={13} />
            <span>Switch Portal</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title="Toggle Light / Dark Mode"
          style={{
            padding: '6px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Log Out Button */}
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.4rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Log out and return to Login Screen"
        >
          <LogOut size={14} />
          <span>Log Out</span>
        </button>
      </div>
    </header>
  );
};
