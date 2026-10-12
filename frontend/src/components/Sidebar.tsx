import { Calendar, LayoutDashboard, Users, CalendarCheck2, FileText, Zap, BookOpen, MessageCircle, Award, ShieldAlert, LogOut } from 'lucide-react';
import type { User, Department } from '../types/timetable';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenRoleModal: () => void;
  departments: Department[];
  activeDept: Department;
  onSelectDept: (dept: Department) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenRoleModal,
  departments,
  activeDept,
  onSelectDept,
  onLogout
}) => {
  const portalLabel =
    currentUser.role === 'staff' ? '👨‍🏫 Staff Portal' :
    currentUser.role === 'hod' ? '⚡ HOD Portal' :
    '🏛️ Principal Portal';

  const navItems = [
    { id: 'portal', label: portalLabel, icon: ShieldAlert, badge: 'Active Portal', isPrimary: true },
    { id: 'generator', label: 'AI Timetable Studio', icon: Calendar, badge: 'OR-Tools' },
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'faculty', label: 'Staff Management', icon: Users },
    { id: 'subjects', label: 'Subject Curriculum', icon: BookOpen },
    { id: 'leaves', label: 'Leaves & Substitutes', icon: CalendarCheck2 },
    { id: 'automation', label: 'WhatsApp Timetable Share', icon: MessageCircle, badge: 'WhatsApp' },
    { id: 'team', label: 'Team & 4-Member Split', icon: Award, badge: '4 Devs' },
    { id: 'reports', label: 'Reports & Audit', icon: FileText },
  ];

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand-icon">
          <Zap size={20} />
        </div>
        <div className="sidebar-brand-info">
          <h2>SmartTimetable</h2>
          <p>Suguna College of Engineering</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="sidebar-nav-container">
        <div className="sidebar-section-title">Core Modules</div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              style={item.isPrimary ? {
                background: isActive ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(99, 102, 241, 0.12)',
                color: isActive ? '#fff' : '#c7d2fe',
                fontWeight: 800,
                border: '1px solid rgba(99, 102, 241, 0.3)'
              } : undefined}
            >
              <Icon size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '999px',
                  background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(79, 70, 229, 0.2)',
                  color: isActive ? '#fff' : '#818cf8',
                  fontWeight: 700
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Department Portals (HOD Workspaces) */}
        <div className="sidebar-section-title" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Department Portals</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 800 }}>{departments.length} Depts</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {departments.map(dept => {
            const isDeptActive = activeDept.id === dept.id;
            return (
              <button
                key={dept.id}
                className={`sidebar-link ${isDeptActive ? 'active' : ''}`}
                onClick={() => onSelectDept(dept)}
                title={`Switch workspace to ${dept.name} (HOD: ${dept.hod})`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 0.65rem',
                  fontSize: '0.8rem',
                  borderRadius: '8px'
                }}
              >
                <span style={{ fontSize: '1.05rem' }}>{dept.icon}</span>
                <div style={{ flex: 1, textAlign: 'left', lineHeight: 1.25 }}>
                  <div style={{ fontWeight: isDeptActive ? 800 : 600 }}>{dept.code}</div>
                  <div style={{ fontSize: '0.68rem', color: isDeptActive ? '#e0e7ff' : 'var(--text-secondary)' }}>
                    HOD: {dept.hod}
                  </div>
                </div>
                {isDeptActive && (
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#10B981',
                    boxShadow: '0 0 6px #10B981'
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Footer Profile Card */}
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="user-badge-sidebar" onClick={onOpenRoleModal} title="Click to Switch Role">
          <div className="user-avatar-circle">{currentUser.avatar}</div>
          <div className="user-sidebar-details">
            <span className="user-sidebar-name">{currentUser.name}</span>
            <span className="user-sidebar-role">{currentUser.roleLabel || currentUser.role}</span>
          </div>
        </div>

        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            padding: '7px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <LogOut size={14} />
          <span>Switch / Log Out</span>
        </button>
      </div>
    </aside>
  );
};
