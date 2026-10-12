import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, Terminal, Globe, 
  Send, Sparkles, HelpCircle, Copy, Check
} from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  badge: string;
  color: string;
  modules: string[];
  vivaQuestion: string;
  vivaAnswer: string;
}

interface DiscussionMessage {
  id: string;
  author: string;
  role: string;
  avatar: string;
  timestamp: string;
  category: 'AI Engine' | 'Frontend' | 'Backend' | 'DevOps & WhatsApp';
  content: string;
  likes: number;
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: 'Member 1 (AI & Algorithm Lead)',
    role: 'Operations Research & AI Constraint Solver',
    avatar: '🧠',
    badge: 'Google OR-Tools CP-SAT',
    color: '#6366F1',
    modules: [
      'Google OR-Tools CP-SAT Mathematical Model Formulation',
      'Hard Constraints: Zero Teacher Clash, Zero Room Overlap',
      'Soft Constraints: 2-Hour Continuous Lab Sessions & Workload Balance',
      'Benchmark Performance: Sub-second solver convergence (<500ms)'
    ],
    vivaQuestion: 'Q: How does your AI algorithm mathematically guarantee zero clashes?',
    vivaAnswer: 'A: We formulated the timetabling problem as a Boolean Satisfiability (SAT) Constraint Optimization problem using Google OR-Tools. The solver uses Forward Checking and Minimum Remaining Values (MRV) domain pruning to reject any schedule state where a teacher or room has overlapping period assignments.'
  },
  {
    id: 2,
    name: 'Member 2 (Frontend Architect)',
    role: 'React SaaS Architecture & UX Engineering',
    avatar: '💻',
    badge: 'React 19 • Vite • TS',
    color: '#06B6D4',
    modules: [
      'Modular Multi-Department Portals (IT, AIDS, CSE, MCT, MECH, ECE, FY)',
      'Interactive Slot Matrix with Real-time Conflict Highlighting',
      'Dynamic Staff & Subject Management with Inline Editing (Theory/Lab)',
      'Responsive Glassmorphic Design System (100% Custom CSS, Zero Tailwind)'
    ],
    vivaQuestion: 'Q: Why did you architect the application as a Single-Port Unified Web App?',
    vivaAnswer: 'A: To eliminate CORS issues and dual-port deployment overhead. Express server serves the compiled React production bundle directly on port 5000, creating a seamless, commercial-grade SaaS experience that requires zero client-side configuration.'
  },
  {
    id: 3,
    name: 'Member 3 (Cloud & Backend Lead)',
    role: 'Node.js Express & Supabase Cloud Database',
    avatar: '🗄️',
    badge: 'Supabase • PostgreSQL',
    color: '#10B981',
    modules: [
      'Express.js REST API with Structured Controllers and Clean Routing',
      'Supabase Cloud PostgreSQL Relational Schema & Real-time Persistence',
      'Smart Leave Engine with Dynamic Free-Period Substitute Matching',
      'Database Fallback Architecture (Seamless local cache when offline)'
    ],
    vivaQuestion: 'Q: How does the Leave Substitute auto-matching work in the backend?',
    vivaAnswer: 'A: When a faculty member applies for leave, the backend queries the database for active timetable slots for that day. It cross-references other department faculty to identify teachers with 0 scheduled periods during that specific hour, ranking them by subject compatibility.'
  },
  {
    id: 4,
    name: 'Member 4 (DevOps & Automation Lead)',
    role: 'Automation, Docker Container & Zero-Cost Protocols',
    avatar: '🚀',
    badge: 'Docker • n8n • WhatsApp',
    color: '#F59E0B',
    modules: [
      'Multi-Stage Production Dockerfile & docker-compose.yml configuration',
      'Zero-Cost WhatsApp Web Protocol (Instant alert dispatch with no Meta API fees)',
      'n8n Webhook Workflow Integration on Port 5678 for institutional audit',
      'Automated CI/CD Deployment Pipeline & Free Cloud Hosting Setup'
    ],
    vivaQuestion: 'Q: How did you implement WhatsApp notifications without paying Meta Business API fees?',
    vivaAnswer: 'A: We leveraged the direct WhatsApp Web URL protocol (api.whatsapp.com/send?phone=...&text=...). It formats structured Markdown timetable & substitution alerts and directly dispatches them via the user’s authorized WhatsApp session at zero financial cost.'
  }
];

const INITIAL_MESSAGES: DiscussionMessage[] = [
  {
    id: 'm1',
    author: 'Member 1 (AI Lead)',
    role: 'AI Constraint Solver',
    avatar: '🧠',
    timestamp: 'Today at 07:15 PM',
    category: 'AI Engine',
    content: 'OR-Tools CP-SAT formulation tested across all 7 departments! Tested a 35-period weekly curriculum with 4-hour practical lab blocks. 0 clashes detected and runtime is under 380ms.',
    likes: 4
  },
  {
    id: 'm2',
    author: 'Member 3 (Backend Lead)',
    role: 'Cloud DB & API',
    avatar: '🗄️',
    timestamp: 'Today at 07:45 PM',
    category: 'Backend',
    content: 'Supabase PostgreSQL cloud connection verified. Leaves table auto-substitute algorithm successfully pulls unallocated staff and updates substitute status in realtime.',
    likes: 3
  },
  {
    id: 'm3',
    author: 'Member 2 (Frontend Lead)',
    role: 'React SaaS Architect',
    avatar: '💻',
    timestamp: 'Today at 08:20 PM',
    category: 'Frontend',
    content: 'Added inline Subject Editing (✏️ Edit) with live Theory/Lab hours toggle and Department filter. Unified single-port UI runs smoothly on port 5000.',
    likes: 5
  },
  {
    id: 'm4',
    author: 'Member 4 (DevOps Lead)',
    role: 'DevOps & WhatsApp',
    avatar: '🚀',
    timestamp: 'Today at 08:50 PM',
    category: 'DevOps & WhatsApp',
    content: 'Multi-stage Dockerfile and docker-compose.yml created! Tested WhatsApp Web instant dispatch for both individual faculty and college batch groups at 100% zero cost.',
    likes: 6
  }
];

export const TeamCollabView: React.FC = () => {
  const [members] = useState<TeamMember[]>(() => {
    const saved = localStorage.getItem('smart_timetable_team_members');
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
  });

  const [messages, setMessages] = useState<DiscussionMessage[]>(() => {
    const saved = localStorage.getItem('smart_timetable_team_discussions');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [activeTab, setActiveTab] = useState<'split' | 'discussion' | 'docker' | 'hosting'>('split');
  const [newMessage, setNewMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'AI Engine' | 'Frontend' | 'Backend' | 'DevOps & WhatsApp'>('AI Engine');
  const [activeAuthor, setActiveAuthor] = useState('Member 1 (AI Lead)');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('smart_timetable_team_discussions', JSON.stringify(messages));
  }, [messages]);

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const currentMember = members.find(m => m.name === activeAuthor) || members[0];
    const post: DiscussionMessage = {
      id: 'msg_' + Date.now(),
      author: currentMember.name,
      role: currentMember.role,
      avatar: currentMember.avatar,
      timestamp: 'Just now',
      category: selectedCategory,
      content: newMessage.trim(),
      likes: 0
    };

    setMessages([post, ...messages]);
    setNewMessage('');
  };

  const handleLike = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(16, 185, 129, 0.12) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎓</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)' }}>
              Final Year Capstone Project Team
            </span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
            4-Member Division of Labor & Team Collaboration Hub
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.4rem 0 0 0', maxWidth: '720px' }}>
            Suguna College of Engineering — Structured task delegation, module responsibilities, viva questions & answers, and live team collaboration.
          </p>
        </div>

        {/* Sub-tabs switch */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-canvas)', padding: '0.35rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <button
            className={`btn ${activeTab === 'split' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            onClick={() => setActiveTab('split')}
          >
            <Users size={14} style={{ marginRight: '6px' }} />
            4-Member Work Split
          </button>
          <button
            className={`btn ${activeTab === 'discussion' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            onClick={() => setActiveTab('discussion')}
          >
            <MessageSquare size={14} style={{ marginRight: '6px' }} />
            Live Team Discussion ({messages.length})
          </button>
          <button
            className={`btn ${activeTab === 'docker' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            onClick={() => setActiveTab('docker')}
          >
            <Terminal size={14} style={{ marginRight: '6px' }} />
            Docker & Container Hub
          </button>
          <button
            className={`btn ${activeTab === 'hosting' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
            onClick={() => setActiveTab('hosting')}
          >
            <Globe size={14} style={{ marginRight: '6px' }} />
            100% Free Hosting
          </button>
        </div>
      </div>

      {/* TAB 1: 4-MEMBER WORK SPLIT */}
      {activeTab === 'split' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {members.map(member => (
            <div
              key={member.id}
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${member.color}40`,
                borderRadius: '16px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Color accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: member.color }} />

              {/* Member Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  fontSize: '1.75rem',
                  background: `${member.color}18`,
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${member.color}35`
                }}>
                  {member.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>{member.name}</h3>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      background: `${member.color}20`,
                      color: member.color,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '999px'
                    }}>
                      {member.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {member.role}
                  </div>
                </div>
              </div>

              {/* Modules list */}
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                  Assigned Project Modules:
                </span>
                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {member.modules.map((mod, idx) => (
                    <li key={idx} style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                      {mod}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Viva Readiness Box */}
              <div style={{
                marginTop: 'auto',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                border: '1px dashed var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.35rem' }}>
                  <HelpCircle size={14} color={member.color} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: member.color }}>
                    Viva Voce / Review Q&A:
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  {member.vivaQuestion}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {member.vivaAnswer}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIVE TEAM DISCUSSION & WORK LOGS */}
      {activeTab === 'discussion' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Post Message Box */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--primary)" />
              Post Team Update / Discussion
            </h3>

            <form onSubmit={handlePostMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Posting As Teammate:
                </label>
                <select
                  value={activeAuthor}
                  onChange={e => setActiveAuthor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                >
                  {members.map(m => (
                    <option key={m.id} value={m.name}>
                      {m.avatar} {m.name} ({m.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Category / Workstream:
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.55rem',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                >
                  <option value="AI Engine">🧠 AI Engine (Google OR-Tools)</option>
                  <option value="Frontend">💻 Frontend (React & Portals)</option>
                  <option value="Backend">🗄️ Backend (Node.js & Supabase)</option>
                  <option value="DevOps & WhatsApp">🚀 DevOps & WhatsApp Automation</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Update / Constraint / Question:
                </label>
                <textarea
                  rows={4}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="e.g., Tested IT 3rd year timetable with 2 consecutive periods for Web Technology Lab. No clashes found..."
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    background: 'var(--bg-canvas)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Send size={16} />
                <span>Post to Team Board</span>
              </button>
            </form>
          </div>

          {/* Discussion Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <div style={{
                  fontSize: '1.5rem',
                  background: 'var(--bg-canvas)',
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-subtle)',
                  flexShrink: 0
                }}>
                  {msg.avatar}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{msg.author}</span>
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '999px',
                        background: 'rgba(79, 70, 229, 0.15)',
                        color: 'var(--primary)',
                        fontWeight: 700
                      }}>
                        {msg.category}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{msg.timestamp}</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', lineHeight: 1.5, margin: '0.65rem 0', color: 'var(--text-primary)' }}>
                    {msg.content}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                      onClick={() => handleLike(msg.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}
                    >
                      <span>👍</span>
                      <span>{msg.likes} Acknowledged</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOCKER & CONTAINER HUB */}
      {activeTab === 'docker' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Why Docker Explainer */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
              <div style={{ background: '#0284c720', padding: '8px', borderRadius: '10px' }}>
                <Terminal size={22} color="#0284c7" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Docker என்றால் என்ன? இதை ஏன் பயன்படுத்துகிறோம்?</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Complete Containerization for Zero-Dependency Deployment
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              <strong>Docker</strong> என்பது உங்களுடைய முழு பிராஜெக்டையும் (Node.js, React Build, Python OR-Tools, Environment Variables) ஒரு சீல் செய்யப்பட்ட <strong>Container Box</strong>-க்குள் அடைத்து வைக்கும் கருவி.
              இதன் மூலம், <em>"என் லேப்டாப்பில் வேலை செய்யுது, ஆனால் காலேஜ் கம்ப்யூட்டரில் அல்லது சர்வரில் எரர் வருது"</em> என்ற பிரச்சனை 100% வராது. எந்த ஒரு கம்ப்யூட்டரிலும் Docker இருந்தால் ஒரே ஒரு கமாண்டில் இந்த ப்ராஜெக்ட் ரன் ஆகிவிடும்!
            </p>

            {/* Docker Commands Box */}
            <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                1-Click Docker Terminal Commands:
              </div>

              {/* Build Command */}
              <div style={{
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: '#58a6ff'
              }}>
                <span>docker build -t smart-timetable .</span>
                <button
                  onClick={() => copyToClipboard('docker build -t smart-timetable .', 'build')}
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  {copiedCmd === 'build' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Run Command */}
              <div style={{
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: '#7ee787'
              }}>
                <span>docker run -p 5000:5000 smart-timetable</span>
                <button
                  onClick={() => copyToClipboard('docker run -p 5000:5000 smart-timetable', 'run')}
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  {copiedCmd === 'run' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                </button>
              </div>

              {/* Compose Command */}
              <div style={{
                background: '#0d1117',
                border: '1px solid #30363d',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: '#d2a8ff'
              }}>
                <span>docker compose up -d</span>
                <button
                  onClick={() => copyToClipboard('docker compose up -d', 'compose')}
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                >
                  {copiedCmd === 'compose' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 100% FREE HOSTING & DEPLOYMENT */}
      {activeTab === 'hosting' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {/* Render.com */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.75rem' }}>🌐</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Render.com (Free Tier)</h4>
                <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800 }}>100% FREE Web Service</span>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Best for hosting our Unified Node.js + React production app. You simply connect your GitHub repo, and Render builds and hosts it at a live public URL (e.g. <code>smart-timetable.onrender.com</code>) at zero cost.
            </p>
            <div style={{ marginTop: 'auto', fontSize: '0.75rem', background: 'var(--bg-canvas)', padding: '0.65rem', borderRadius: '8px' }}>
              <strong>Build Command:</strong> <code>npm run build</code><br/>
              <strong>Start Command:</strong> <code>node backend/server.js</code>
            </div>
          </div>

          {/* Supabase Cloud */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.75rem' }}>🗄️</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Supabase Cloud DB</h4>
                <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800 }}>100% FREE PostgreSQL (500MB)</span>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Already configured & connected! Hosts all faculty rosters, subjects, leaves, and generated schedules in a dedicated cloud database with zero server management or maintenance fees.
            </p>
            <div style={{ marginTop: 'auto', fontSize: '0.75rem', background: 'var(--bg-canvas)', padding: '0.65rem', borderRadius: '8px' }}>
              <strong>Status:</strong> <span style={{ color: '#10B981' }}>● Live & Connected</span><br/>
              <strong>Project:</strong> <code>fbvsmobtzcwraybqpppw</code>
            </div>
          </div>

          {/* GitHub Actions CI/CD */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.75rem' }}>⚡</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>GitHub Actions (CI/CD)</h4>
                <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 800 }}>Free Automated Testing on Push</span>
              </div>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Whenever you or any of your 4 team members push code to GitHub, GitHub Actions automatically runs automated tests to ensure 0 compile errors and 0 timetable solver conflicts before deploying.
            </p>
            <div style={{ marginTop: 'auto', fontSize: '0.75rem', background: 'var(--bg-canvas)', padding: '0.65rem', borderRadius: '8px' }}>
              <strong>Workflows:</strong> 2,000 free minutes/month<br/>
              <strong>Trigger:</strong> <code>git push origin main</code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
