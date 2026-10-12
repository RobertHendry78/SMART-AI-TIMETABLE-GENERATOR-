import React, { useState } from 'react';
import { X, Send, MessageCircle, CheckCircle2, Users, Copy, Check } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient?: string;
  defaultPhone?: string;
  defaultMessage?: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  defaultRecipient = 'Faculty / Student',
  defaultPhone = '',
  defaultMessage = ''
}) => {
  const [targetType, setTargetType] = useState<'individual' | 'group'>('individual');
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [groupName, setGroupName] = useState('Final Year - IT Batch Group');
  const [phone, setPhone] = useState(defaultPhone);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(
    defaultMessage ||
      `⚡ *Suguna College of Engineering — Smart AI Timetable Alert*\n\nHello,\nYour academic schedule has been published and verified conflict-free by Google OR-Tools AI.\n\n📅 Academic Year: 2026-2027 (Odd Semester)\n✅ Clashes: 0 (100% Conflict-Free)\n🏫 Campus: Suguna College of Engineering`
  );
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    // 1. Prepare WhatsApp URL
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(message);
    const waUrl = (targetType === 'individual' && cleanPhone)
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    // 2. Open WhatsApp window synchronously to prevent browser popup blockers!
    window.open(waUrl, '_blank', 'noopener,noreferrer');

    // 3. Fire-and-forget logging to backend
    fetch('/api/automation/whatsapp-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetType,
        recipient: targetType === 'individual' ? recipient : groupName,
        phone: targetType === 'individual' ? phone : null,
        message,
        timestamp: new Date().toISOString()
      })
    }).catch(e => console.warn('n8n webhook dispatch warning', e));

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '540px' }}>
        <div className="modal-header">
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
              <MessageCircle size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Dispatch WhatsApp Notification</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Direct Web Share + n8n Automation Webhook
              </p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1.25rem' }}>
          {sentSuccess ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 1rem auto' }} />
              <h4 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>WhatsApp Opened!</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Message prepared in WhatsApp and dispatched to the n8n automation pipeline.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Target Type Selector: Individual vs College Class Group */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--bg-canvas)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setTargetType('individual')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: targetType === 'individual' ? 'var(--primary)' : 'transparent',
                    color: targetType === 'individual' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <MessageCircle size={15} />
                  <span>Individual Contact</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetType('group')}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: targetType === 'group' ? 'var(--primary)' : 'transparent',
                    color: targetType === 'group' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Users size={15} />
                  <span>College Class Group</span>
                </button>
              </div>

              {targetType === 'individual' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      Faculty / Student Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={recipient}
                      onChange={e => setRecipient(e.target.value)}
                      placeholder="e.g. Dr. R. Ramesh"
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      WhatsApp Phone Number
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Select College WhatsApp Group
                  </label>
                  <select
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', fontSize: '0.84rem' }}
                  >
                    <option value="IT - Final Year Batch (Sem 7)">IT - Final Year Batch (Sem 7)</option>
                    <option value="IT - 3rd Year Batch (Sem 5)">IT - 3rd Year Batch (Sem 5)</option>
                    <option value="IT - 2nd Year Batch (Sem 3)">IT - 2nd Year Batch (Sem 3)</option>
                    <option value="CSE - 3rd Year Batch">CSE - 3rd Year Batch</option>
                    <option value="AIDS - 3rd Year Batch">AIDS - 3rd Year Batch</option>
                    <option value="Mechatronics - Official Class Group">Mechatronics - Official Class Group</option>
                    <option value="Suguna Faculty Official Group">Suguna Faculty Official Group</option>
                  </select>
                </div>
              )}

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Message Payload
                  </label>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                  >
                    {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  className="form-input"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)', fontFamily: 'monospace', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{
                background: 'rgba(37, 211, 102, 0.08)',
                border: '1px solid rgba(37, 211, 102, 0.3)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                📢 <strong>How it sends</strong>: Clicking Send opens WhatsApp Web directly. If a phone number is entered, it chats directly; if in Group Mode, WhatsApp prompts you to pick your class group and pastes this message with 1 click!
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button className="btn btn-outline" onClick={onClose} style={{ padding: '0.6rem 1.25rem', borderRadius: '8px' }}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSendWhatsApp}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    background: '#25D366',
                    borderColor: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700
                  }}
                >
                  <Send size={15} />
                  <span>Send on WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
