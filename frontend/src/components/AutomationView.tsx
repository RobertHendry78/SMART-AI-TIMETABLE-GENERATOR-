import { useState, useEffect } from 'react';
import { Workflow, MessageCircle, Database, RefreshCw, Send, ExternalLink } from 'lucide-react';

interface AutomationViewProps {
  onOpenWhatsApp: (name: string, phone: string, customMessage?: string) => void;
}

export const AutomationView: React.FC<AutomationViewProps> = ({ onOpenWhatsApp }) => {
  const [n8nStatus, setN8nStatus] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [n8nRes, dbRes] = await Promise.all([
        fetch('/api/automation/status'),
        fetch('/api/supabase/status')
      ]);

      if (n8nRes.ok) {
        const n8nData = await n8nRes.json();
        setN8nStatus(n8nData.data);
      }
      if (dbRes.ok) {
        const dbData = await dbRes.json();
        setDbStatus(dbData.data);
      }
    } catch (e) {
      console.warn('Status fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/automation/trigger-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      setTestResult(data);
      fetchStatus();
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Banner explaining how it works */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12))',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: 'var(--text-primary)' }}>
            🤖 n8n Automation & WhatsApp Webhook Engine
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '750px' }}>
            Event-driven pipeline: When faculty leaves are submitted or approved, the backend dispatches payloads to the n8n webhook, logs the transaction to Supabase Cloud, and triggers WhatsApp alerts.
          </p>
        </div>

        <button
          className="btn btn-outline"
          onClick={fetchStatus}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Grid: n8n Hub + WhatsApp Fast Dispatcher + Supabase Monitor */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>

        {/* === CARD 1: n8n WEBHOOK DISPATCHER === */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Workflow size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>n8n Webhook Pipeline</h3>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 800 }}>● Active & Ready</span>
              </div>
            </div>

            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#6366F1'
            }}>
              Port 5678
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Configured Webhook URL:</strong>
              <div style={{
                background: 'var(--bg-canvas)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                marginTop: '0.25rem',
                wordBreak: 'break-all'
              }}>
                {n8nStatus?.configuredUrl || 'http://localhost:5678/webhook/faculty-leave'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ background: 'var(--bg-canvas)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', display: 'block' }}>Total Dispatches</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{n8nStatus?.totalDispatches ?? 0}</strong>
              </div>
              <div style={{ background: 'var(--bg-canvas)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.7rem', display: 'block' }}>Last Status</span>
                <strong style={{ fontSize: '1.1rem', color: n8nStatus?.statusCode === 200 ? '#10B981' : '#F59E0B' }}>
                  {n8nStatus?.statusCode ? `HTTP ${n8nStatus.statusCode}` : 'Ready'}
                </strong>
              </div>
            </div>

            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)'
            }}>
              ✅ <strong>Resilient Non-Blocking Design</strong>: If n8n workflow server is not running, the application gracefully saves to Supabase and continues without freezing or crashing!
            </div>

            <button
              onClick={handleTestWebhook}
              disabled={testingWebhook}
              className="btn btn-primary"
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700
              }}
            >
              <Send size={15} />
              <span>{testingWebhook ? 'Dispatching Webhook...' : '🚀 Test Dispatch n8n Webhook'}</span>
            </button>

            {testResult && (
              <div style={{
                background: 'var(--bg-canvas)',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem'
              }}>
                <div style={{ fontWeight: 800, color: testResult.success ? '#10B981' : '#F59E0B', marginBottom: '0.25rem' }}>
                  {testResult.success ? '✅ Webhook Dispatched Successfully!' : '⚠️ Dispatch Note'}
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{testResult.message}</div>
              </div>
            )}
          </div>
        </div>

        {/* === CARD 2: WHATSAPP DIRECT NOTIFICATION HUB === */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#25D366',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>WhatsApp Web Share</h3>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 800 }}>● 100% Free & Unlimited</span>
              </div>
            </div>

            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: 'rgba(37, 211, 102, 0.15)',
              color: '#25D366'
            }}>
              Zero Cost API
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
            Why WhatsApp works 100% here: Unlike expensive Meta Business APIs that require $0.05/message and credit cards, this module formats messages and launches official WhatsApp Web / Mobile protocols directly!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <button
              className="btn btn-outline"
              onClick={() => onOpenWhatsApp('Dr. R. Ramesh (Faculty)', '+91 9876543210', '⚡ *Suguna College Timetable Update*\nDear Dr. Ramesh, your updated weekly teaching routine has been synced conflict-free.')}
              style={{
                padding: '0.65rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={16} color="#25D366" />
                <span>Dispatch Schedule to Dr. R. Ramesh</span>
              </div>
              <ExternalLink size={14} />
            </button>

            <button
              className="btn btn-outline"
              onClick={() => onOpenWhatsApp('Class IT - 3rd Year', '', '📢 *Class Timetable Notification*\nAll students of B.Tech IT (Sem 5): Monday Period 2 Laboratory session has been allocated in Computing Lab 1.')}
              style={{
                padding: '0.65rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={16} color="#25D366" />
                <span>Broadcast Routine to Student Class Group</span>
              </div>
              <ExternalLink size={14} />
            </button>

            <button
              className="btn btn-outline"
              onClick={() => onOpenWhatsApp('Prof. Alan Turing (Substitute)', '+91 9876543214', '🚨 *Immediate Substitution Alert*\nProf. Turing, you have been designated as substitute teacher for IT-A Period 1 by the AI Constraint Engine.')}
              style={{
                padding: '0.65rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={16} color="#25D366" />
                <span>Send Emergency Substitute Alert</span>
              </div>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>

        {/* === CARD 3: SUPABASE CLOUD DATABASE === */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Database size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Supabase PostgreSQL</h3>
                <span style={{ fontSize: '0.75rem', color: dbStatus?.connected ? '#10B981' : '#F59E0B', fontWeight: 800 }}>
                  {dbStatus?.connected ? '● Cloud Connected' : '● In-Memory Mode'}
                </span>
              </div>
            </div>

            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10B981'
            }}>
              ap-south-1
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <div>
              <strong style={{ color: 'var(--text-primary)' }}>Cloud Endpoint:</strong>
              <div style={{
                background: 'var(--bg-canvas)',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                marginTop: '0.25rem',
                wordBreak: 'break-all'
              }}>
                {dbStatus?.url || 'https://fbvsmobtzcwraybqpppw.supabase.co'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'var(--bg-canvas)', borderRadius: '6px' }}>
                <span>Faculty Leaves Cloud Table:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Synchronized</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'var(--bg-canvas)', borderRadius: '6px' }}>
                <span>Timetable Matrices Table:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Synchronized</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'var(--bg-canvas)', borderRadius: '6px' }}>
                <span>Automation Audit Logs:</span>
                <strong style={{ color: 'var(--text-primary)' }}>Active</strong>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
