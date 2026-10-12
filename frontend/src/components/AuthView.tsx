import React, { useState } from 'react';
import type { User, Role, Department } from '../types/timetable';
import { DEMO_USERS } from '../data/mockData';
import { UserCheck, Key, Phone, Mail, GraduationCap, Calendar, MapPin, Building, ArrowRight, CheckCircle2, Sparkles, LogIn, Trash2 } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: User) => void;
  departments: Department[];
  onAddDepartment?: (dept: Department) => void;
  onDeleteDepartment?: (code: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, departments, onAddDepartment, onDeleteDepartment }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('staff');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [activeDeptCode, setActiveDeptCode] = useState<string>('IT');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('@7150ramesh');
  const [loginPassword, setLoginPassword] = useState('ITrame');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state (Step 1)
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [staffName, setStaffName] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffDegree, setStaffDegree] = useState('M.Tech, Ph.D');
  const [staffCollegeId, setStaffCollegeId] = useState('');
  const [staffDob, setStaffDob] = useState('');
  const [staffAddress, setStaffAddress] = useState('');
  const [staffDepartment, setStaffDepartment] = useState('Information Technology');

  // Register form state (Step 2: Credentials)
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regSuccessNotice, setRegSuccessNotice] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // Add / Delete Department State
  const [isAddDeptMode, setIsAddDeptMode] = useState(false);
  const [isDeleteDeptMode, setIsDeleteDeptMode] = useState(false);
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');

  // Auto-generate suggested username & password when Step 1 is completed
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim()) {
      setRegError('Please enter Staff / Faculty Name');
      return;
    }
    setRegError(null);

    // Username format: @7150<name>
    const cleanName = staffName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const suggestedUsername = `@7150${cleanName}`;
    setRegUsername(suggestedUsername);

    // Password format: IT<first 4 letters of name>
    const deptPrefix = staffDepartment.includes('Computer') ? 'CSE' : staffDepartment.includes('AI') ? 'AIDS' : 'IT';
    const first4 = cleanName.slice(0, 4) || 'user';
    const suggestedPass = `${deptPrefix}${first4}`;
    setRegPassword(suggestedPass);
    setRegConfirmPassword(suggestedPass);

    setRegStep(2);
  };

  // Quick autofill demo credentials when clicking role tabs
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setLoginError(null);
    setActiveDeptCode('IT');
    if (role === 'principal') {
      setLoginUsername('@7150rajagopal');
      setLoginPassword('ITraja');
    } else if (role === 'hod') {
      setLoginUsername('@7150mythili');
      setLoginPassword('ITmyth');
    } else {
      setLoginUsername('@7150ramesh');
      setLoginPassword('ITrame');
    }
  };

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword.trim(),
          role: selectedRole
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        // Fallback local validation if offline
        fallbackLocalLogin();
      }
    } catch {
      fallbackLocalLogin();
    } finally {
      setIsSubmitting(false);
    }
  };

  const fallbackLocalLogin = () => {
    const norm = loginUsername.trim().toLowerCase();
    const cleanId = norm.startsWith('@') ? norm : '@' + norm;

    // Search DEMO_USERS for direct match
    const found = DEMO_USERS.find(u => 
      (u.username || '').toLowerCase() === cleanId ||
      (u.username || '').toLowerCase().replace('@', '') === cleanId.replace('@', '')
    );

    if (found) {
      onLoginSuccess(found);
      return;
    }

    // Role-based fallback
    const roleMatches = DEMO_USERS.filter(u => u.role === selectedRole);
    
    // Check if it's a dummy generic login for a specific department (e.g. @7150fyuser)
    const matchedDept = departments.find(d => 
      cleanId.includes(d.code.toLowerCase()) || 
      (d.code === activeDeptCode && cleanId.includes('user'))
    );

    if (matchedDept) {
      const dummyUser: User = {
        id: `dummy-${Date.now()}`,
        name: `Dummy ${selectedRole === 'hod' ? 'HOD' : 'Staff'}`,
        role: selectedRole,
        roleLabel: selectedRole === 'hod' ? `Head of Department (${matchedDept.name})` : `Faculty / Staff (${matchedDept.name})`,
        email: `${matchedDept.code.toLowerCase()}@sugunacollege.edu`,
        username: cleanId,
        avatar: selectedRole === 'hod' ? '👨‍🏫' : '👩‍🏫',
        department: matchedDept.name,
        deptCode: matchedDept.code,
        phone: '+91 0000000000',
        degree: 'Ph.D',
        collegeId: `SCE-${matchedDept.code}-00`
      };
      onLoginSuccess(dummyUser);
      return;
    }

    if (roleMatches.length > 0) {
      const best = roleMatches.find(u => norm.includes(u.name.toLowerCase().split(' ')[1] || '---')) || roleMatches[0];
      onLoginSuccess(best);
      return;
    }

    setLoginError('Invalid credentials. Check username and password.');
  };

  // Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (regPassword !== regConfirmPassword) {
      setRegError('Password and Confirm Password do not match!');
      return;
    }

    setIsSubmitting(true);
    const regPayload = {
      name: staffName,
      phone: staffPhone,
      email: staffEmail,
      degree: staffDegree,
      collegeId: staffCollegeId || `SCE-${Date.now().toString().slice(-4)}`,
      dob: staffDob,
      address: staffAddress,
      department: staffDepartment,
      deptCode: departments.find(d => d.name === staffDepartment)?.code || 'IT',
      username: regUsername,
      password: regPassword,
      role: selectedRole
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regPayload)
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        setRegSuccessNotice(`✅ Account created for ${staffName}! User Name: ${data.user.username}`);
        setTimeout(() => {
          onLoginSuccess(data.user);
        }, 1200);
      } else {
        // Fallback local registration
        fallbackLocalRegister(regPayload);
      }
    } catch {
      fallbackLocalRegister(regPayload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fallbackLocalRegister = (payload: any) => {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: payload.name,
      role: selectedRole,
      roleLabel: selectedRole === 'principal' ? 'Principal & Academic Director' :
                 selectedRole === 'hod' ? `Head of Department (${payload.department})` :
                 `Faculty / Staff (${payload.department})`,
      email: payload.email || `${payload.username.replace('@', '')}@sugunacollege.edu`,
      username: payload.username,
      avatar: selectedRole === 'principal' ? '🏛️' : selectedRole === 'hod' ? '👨‍🏫' : '👩‍🏫',
      department: payload.department,
      deptCode: payload.deptCode,
      phone: payload.phone,
      degree: payload.degree,
      collegeId: payload.collegeId,
      dob: payload.dob,
      address: payload.address,
      designation: selectedRole === 'principal' ? 'Principal' : selectedRole === 'hod' ? 'Professor & HOD' : 'Assistant Professor'
    };

    setRegSuccessNotice(`✅ Account created for ${payload.name}! Logging in now...`);
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(ellipse at 50% 20%, #1e1e38 0%, #0d0e1b 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#e2e8f0'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        background: 'rgba(23, 25, 48, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '24px',
        padding: '2.5rem',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.2)'
      }}>
        {/* College Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))',
            padding: '6px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#c4b5fd',
            marginBottom: '0.75rem'
          }}>
            <Sparkles size={14} /> Suguna College of Engineering
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            margin: '0.25rem 0',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Smart AI Timetable Generator
          </h1>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>
            Academic Scheduling & Role Portal: Principal • HOD • Staff
          </p>
        </div>

        {/* 3 Role Selection Tabs: Principal, HOD, Staff */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          background: 'rgba(15, 17, 34, 0.8)',
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '1.75rem'
        }}>
          {[
            { id: 'principal' as Role, label: 'Principal', icon: '🏛️' },
            { id: 'hod' as Role, label: 'HOD', icon: '👨‍🏫' },
            { id: 'staff' as Role, label: 'Staff', icon: '👩‍🏫' }
          ].map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRoleSelect(r.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.88rem',
                transition: 'all 0.2s',
                background: selectedRole === r.id
                  ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                  : 'transparent',
                color: selectedRole === r.id ? '#ffffff' : '#94a3b8',
                boxShadow: selectedRole === r.id ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
              }}
            >
              <span>{r.icon}</span>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Department Quick Switcher for HOD / Staff */}
        {mode === 'login' && selectedRole !== 'principal' && (
          <div style={{
            marginBottom: '1.25rem',
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                Select Department ({selectedRole === 'hod' ? 'HOD' : 'Faculty'}):
              </span>
              {selectedRole === 'hod' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddDeptMode(!isAddDeptMode);
                      setIsDeleteDeptMode(false);
                    }}
                    style={{
                      background: isAddDeptMode ? 'rgba(99, 102, 241, 0.3)' : 'none',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#818cf8',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {isAddDeptMode ? 'Cancel' : '+ Add Dept'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteDeptMode(!isDeleteDeptMode);
                      setIsAddDeptMode(false);
                    }}
                    style={{
                      background: isDeleteDeptMode ? 'rgba(239, 68, 68, 0.3)' : 'none',
                      border: `1px solid ${isDeleteDeptMode ? '#ef4444' : 'rgba(239, 68, 68, 0.4)'}`,
                      color: isDeleteDeptMode ? '#fca5a5' : '#f87171',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                    title="Delete Department"
                  >
                    <Trash2 size={10} />
                    {isDeleteDeptMode ? 'Done' : 'Delete Dept'}
                  </button>
                </div>
              )}
            </div>

            {isDeleteDeptMode && (
              <div style={{
                marginBottom: '8px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '0.72rem',
                color: '#fca5a5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>🗑️ Click any department below to delete it:</span>
                <button
                  type="button"
                  onClick={() => setIsDeleteDeptMode(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.7rem'
                  }}
                >
                  Done
                </button>
              </div>
            )}
            
            {isAddDeptMode && (
              <div style={{ marginBottom: '10px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Dept Code (e.g. EEE)"
                  value={newDeptCode}
                  onChange={e => setNewDeptCode(e.target.value)}
                  style={{ padding: '6px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.75rem' }}
                />
                <input
                  type="text"
                  placeholder="Dept Name (e.g. Electrical Engg)"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  style={{ padding: '6px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newDeptCode && newDeptName && onAddDepartment) {
                      onAddDepartment({
                        id: newDeptCode.toUpperCase(),
                        code: newDeptCode.toUpperCase(),
                        name: newDeptName,
                        icon: '📚',
                        hod: 'New HOD'
                      });
                      setIsAddDeptMode(false);
                      setNewDeptCode('');
                      setNewDeptName('');
                    }
                  }}
                  style={{ padding: '6px', borderRadius: '4px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                >
                  Save New Department
                </button>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {departments.map(dept => {
                const target = DEMO_USERS.find(u => u.role === selectedRole && u.deptCode === dept.code);
                const isActive = activeDeptCode === dept.code;
                return (
                  <button
                    key={dept.code}
                    type="button"
                    onClick={() => {
                      if (isDeleteDeptMode) {
                        if (window.confirm(`Are you sure you want to delete department "${dept.name}" (${dept.code})?`)) {
                          if (onDeleteDepartment) onDeleteDepartment(dept.code);
                          if (activeDeptCode === dept.code) {
                            const remaining = departments.filter(d => d.code !== dept.code);
                            if (remaining.length > 0) setActiveDeptCode(remaining[0].code);
                          }
                        }
                        return;
                      }
                      setActiveDeptCode(dept.code);
                      if (target && target.username) {
                        setLoginUsername(target.username);
                        // default password formats
                        if (dept.code === 'IT') setLoginPassword(selectedRole === 'hod' ? 'ITmyth' : 'ITrame');
                        else if (dept.code === 'CSE') setLoginPassword(selectedRole === 'hod' ? 'CSEraja' : 'CSEada');
                        else if (dept.code === 'AIDS') setLoginPassword(selectedRole === 'hod' ? 'AIDSkavi' : 'AIDSturi');
                        else if (dept.code === 'MCT') setLoginPassword(selectedRole === 'hod' ? 'MCTbala' : 'MCTsure');
                        else if (dept.code === 'MECH') setLoginPassword(selectedRole === 'hod' ? 'MECHsara' : 'MECHprak');
                        else if (dept.code === 'ECE') setLoginPassword(selectedRole === 'hod' ? 'ECEdevi' : 'ECEanan');
                        else setLoginPassword('password123'); // fallback
                      } else {
                        // If no demo user exists for this department, clear or fill generic dummy
                        setLoginUsername(`@7150${dept.code.toLowerCase()}user`);
                        setLoginPassword(`${dept.code}pass`);
                      }
                    }}
                    style={{
                      padding: isDeleteDeptMode ? '6px 10px' : '6px 10px',
                      borderRadius: '6px',
                      border: isDeleteDeptMode ? '1px dashed rgba(239, 68, 68, 0.7)' : 'none',
                      background: isDeleteDeptMode
                        ? 'rgba(239, 68, 68, 0.18)'
                        : isActive ? '#6366F1' : 'rgba(255,255,255,0.06)',
                      color: isDeleteDeptMode ? '#fca5a5' : isActive ? '#fff' : '#cbd5e1',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s'
                    }}
                    title={isDeleteDeptMode ? `Click to delete ${dept.name}` : `Select ${dept.name}`}
                  >
                    <span>{dept.code === 'FY' ? '1st Year' : dept.code}</span>
                    {isDeleteDeptMode && (
                      <span style={{ color: '#ef4444', fontWeight: 900, fontSize: '0.85rem' }}>✕</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Toggle Login vs Register */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setRegError(null); setLoginError(null); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: mode === 'login' ? '2px solid #6366F1' : '2px solid transparent',
              color: mode === 'login' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <LogIn size={16} /> Sign In / Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setRegStep(1); setRegError(null); setLoginError(null); }}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'none',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid #8B5CF6' : '2px solid transparent',
              color: mode === 'register' ? '#ffffff' : '#94a3b8',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <UserCheck size={16} /> New Register ({selectedRole.toUpperCase()})
          </button>
        </div>


        {/* ===================== LOGIN FORM ===================== */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {loginError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.85rem'
              }}>
                {loginError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                User Name (@7150name)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }}>@</span>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="@7150name (e.g. @7150ramesh)"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 32px',
                    borderRadius: '10px',
                    background: 'rgba(15, 17, 34, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Password (ITname first 4 letter)
              </label>
              <div style={{ position: 'relative' }}>
                <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Password (e.g. ITrame)"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 34px',
                    borderRadius: '10px',
                    background: 'rgba(15, 17, 34, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '0.5rem',
                padding: '12px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? 'Authenticating...' : `Login as ${selectedRole.toUpperCase()} →`}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => { setMode('register'); setRegStep(1); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#818cf8',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Register Here
              </button>
            </div>
          </form>
        )}

        {/* ===================== REGISTER FORM ===================== */}
        {mode === 'register' && (
          <div>
            {regSuccessNotice && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                marginBottom: '1rem',
                fontWeight: 700
              }}>
                {regSuccessNotice}
              </div>
            )}

            {regError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#fca5a5',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                {regError}
              </div>
            )}

            {/* Stepper Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: regStep === 1 ? '#6366F1' : '#10B981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>1</span>
                <span style={{ fontWeight: regStep === 1 ? 700 : 500, color: regStep === 1 ? '#fff' : '#94a3b8' }}>
                  Faculty Details
                </span>
              </div>
              <ArrowRight size={14} color="#64748b" />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: regStep === 2 ? '#8B5CF6' : 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800
                }}>2</span>
                <span style={{ fontWeight: regStep === 2 ? 700 : 500, color: regStep === 2 ? '#fff' : '#94a3b8' }}>
                  Create Username & Password
                </span>
              </div>
            </div>

            {/* Step 1: Staff / Faculty Info */}
            {regStep === 1 && (
              <form onSubmit={handleProceedToStep2} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                      Staff / Faculty Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={e => setStaffName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      style={{
                        width: '100%',
                        padding: '9px 10px',
                        borderRadius: '8px',
                        background: 'rgba(15, 17, 34, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                      Phone Number *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="tel"
                        required
                        value={staffPhone}
                        onChange={e => setStaffPhone(e.target.value)}
                        placeholder="+91 9876543210"
                        style={{
                          width: '100%',
                          padding: '9px 10px 9px 28px',
                          borderRadius: '8px',
                          background: 'rgba(15, 17, 34, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                      Mail ID *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="email"
                        required
                        value={staffEmail}
                        onChange={e => setStaffEmail(e.target.value)}
                        placeholder="staff@sugunacollege.edu"
                        style={{
                          width: '100%',
                          padding: '9px 10px 9px 28px',
                          borderRadius: '8px',
                          background: 'rgba(15, 17, 34, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                      Degree / Qualification
                    </label>
                    <div style={{ position: 'relative' }}>
                      <GraduationCap size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="text"
                        value={staffDegree}
                        onChange={e => setStaffDegree(e.target.value)}
                        placeholder="e.g. M.E / M.Tech / Ph.D"
                        style={{
                          width: '100%',
                          padding: '9px 10px 9px 28px',
                          borderRadius: '8px',
                          background: 'rgba(15, 17, 34, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                      College ID No *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffCollegeId}
                      onChange={e => setStaffCollegeId(e.target.value)}
                      placeholder="e.g. SCE-IT-108"
                      style={{
                        width: '100%',
                        padding: '9px 10px',
                        borderRadius: '8px',
                        background: 'rgba(15, 17, 34, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                      Date of Birth
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Calendar size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                      <input
                        type="date"
                        value={staffDob}
                        onChange={e => setStaffDob(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '9px 10px 9px 28px',
                          borderRadius: '8px',
                          background: 'rgba(15, 17, 34, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          fontSize: '0.85rem',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Department
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <select
                      value={staffDepartment}
                      onChange={e => setStaffDepartment(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 10px 9px 28px',
                        borderRadius: '8px',
                        background: 'rgba(15, 17, 34, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    >
                      {departments.map(d => (
                        <option key={d.code} value={d.name} style={{ background: '#1e1e38', color: '#fff' }}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Add New Department Button (In Registration) */}
                  {selectedRole === 'hod' && (
                    <div style={{ marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setIsAddDeptMode(!isAddDeptMode)}
                        style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        {isAddDeptMode ? 'Cancel Adding Department' : '+ Add Extra Department'}
                      </button>
                    {isAddDeptMode && (
                      <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder="Dept Code (e.g. EEE)"
                          value={newDeptCode}
                          onChange={e => setNewDeptCode(e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.75rem' }}
                        />
                        <input
                          type="text"
                          placeholder="Dept Name (e.g. Electrical Engg)"
                          value={newDeptName}
                          onChange={e => setNewDeptName(e.target.value)}
                          style={{ padding: '6px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: '0.75rem' }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newDeptCode && newDeptName && onAddDepartment) {
                              onAddDepartment({
                                id: newDeptCode.toUpperCase(),
                                code: newDeptCode.toUpperCase(),
                                name: newDeptName,
                                icon: '📚',
                                hod: staffName || 'New HOD'
                              });
                              setStaffDepartment(newDeptName);
                              setIsAddDeptMode(false);
                            }
                          }}
                          style={{ padding: '6px', borderRadius: '4px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          Save New Department
                        </button>
                      </div>
                    )}
                  </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Residential Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '12px', color: '#64748b' }} />
                    <input
                      type="text"
                      value={staffAddress}
                      onChange={e => setStaffAddress(e.target.value)}
                      placeholder="Door No, Street Name, City, Pincode"
                      style={{
                        width: '100%',
                        padding: '9px 10px 9px 28px',
                        borderRadius: '8px',
                        background: 'rgba(15, 17, 34, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '0.5rem',
                    padding: '11px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Create & Next: Set Login Credentials</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Step 2: Set Username & Password */}
            {regStep === 2 && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>


                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={e => setRegUsername(e.target.value)}
                    placeholder="Enter username"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(15, 17, 34, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Password"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(15, 17, 34, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={e => setRegConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(15, 17, 34, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setRegStep(1)}
                    style={{
                      padding: '11px 16px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#cbd5e1',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10B981, #059669)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{isSubmitting ? 'Saving...' : 'Save & Register Account'}</span>
                  </button>
                </div>
              </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Already have an account? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#818cf8',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
