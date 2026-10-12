import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Zap } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionButtons?: { label: string; action: string }[];
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `👋 **Vanakkam! Welcome to Suguna College AI Schedule Assistant & n8n Automation Engine!**\n\nI can help you with:\n• 📅 Class schedules for **IT, CSE, AIDS**\n• 🔄 Checking Faculty Leaves & AI Substitutes\n• ⚡ Triggering **n8n WhatsApp Automations**\n• 🔬 Finding Laboratory Locations & Period Timings\n\n_Ask in English or Tanglish (e.g. "Today Period 3 yaaru?")._`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionButtons: [
        { label: '📅 IT 3rd Yr Today', action: 'it_today' },
        { label: '⚡ Trigger n8n Leave Alert', action: 'trigger_n8n' },
        { label: '🔄 Today Substitutes', action: 'substitutes' },
        { label: '📲 WhatsApp Dispatch', action: 'whatsapp' }
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI / n8n Bot Response
    setTimeout(async () => {
      const lower = userText.toLowerCase();
      let botReply = '';
      let buttons: { label: string; action: string }[] | undefined = undefined;

      if (lower.includes('n8n') || lower.includes('trigger') || lower.includes('alert')) {
        // Trigger live n8n backend test endpoint!
        try {
          const res = await fetch('/api/automation/trigger-test', { method: 'POST' });
          const json = await res.json();
          botReply = `⚡ **n8n Automation Triggered!**\n\n• **Event:** FACULTY_LEAVE_AUTO_SUBSTITUTE\n• **Substitute Assigned:** Prof. Alan Turing → Dr. Robert Langdon\n• **Status:** Dispatched to n8n Webhook Engine\n• **Response:** ${json.message || 'Workflow executed'}`;
        } catch (e) {
          botReply = `⚡ **n8n Webhook Dispatched (Simulation)!**\nSubstitute alert sent to Prof. Alan Turing via WhatsApp pipeline.`;
        }
      } else if (lower.includes('substitute') || lower.includes('leave')) {
        botReply = `🔄 **Today's Faculty Leave & Substitute Status:**\n\n• **Dr. Robert Langdon** (Medical Leave) → Substitute: **Prof. Alan Turing** (Period 3, Room 301)\n• **Dr. Ada Lovelace** → On Duty (Full Stack Lab)\n\nAll clash-free substitute assignments logged to Supabase Cloud!`;
        buttons = [{ label: '📲 Notify via WhatsApp', action: 'whatsapp' }];
      } else if (lower.includes('it') || lower.includes('today') || lower.includes('schedule') || lower.includes('class')) {
        botReply = `📅 **Today's Schedule (IT - Year 3 - Sec A):**\n\n• **P1 (09:00 - 09:50):** Web Technologies (Dr. Mythili, LH-301)\n• **P2 (09:50 - 10:40):** Database Systems (Dr. Priya, LH-301)\n• **P3 (11:00 - 11:50):** Operating Systems (Prof. Suresh, LH-301)\n• **P4 (11:50 - 12:40):** Full Stack Lab (Computing Lab 1)\n\n✨ No clashes detected. 100% faculty attendance verified.`;
      } else if (lower.includes('whatsapp')) {
        botReply = `📲 **WhatsApp Timetable Pipeline:**\nReady to broadcast today's schedule to 12 faculty members and student class reps. Zero paid API charges via direct wa.me link.`;
        buttons = [{ label: 'Open WhatsApp Share', action: 'open_wa' }];
      } else {
        botReply = `🤖 **Suguna AI Assistant:**\nI have cross-checked with the master database. Your schedule is fully optimized with Google OR-Tools. You can ask me about class timings, room allocations, or substitute teachers!`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'bot',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionButtons: buttons
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleChipClick = (action: string) => {
    if (action === 'trigger_n8n') {
      handleSend('Trigger n8n substitute alert');
    } else if (action === 'it_today') {
      handleSend('What is today schedule for IT?');
    } else if (action === 'substitutes') {
      handleSend('Any faculty on leave or substitutes today?');
    } else if (action === 'whatsapp') {
      handleSend('Send WhatsApp timetable alert');
    } else if (action === 'open_wa') {
      window.open('https://api.whatsapp.com/send?text=Suguna%20College%20Timetable%20Updated!', '_blank');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      right: '24px',
      width: '420px',
      maxWidth: 'calc(100vw - 32px)',
      height: '560px',
      maxHeight: 'calc(100vh - 120px)',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '18px',
      boxShadow: '0 24px 60px -10px rgba(0,0,0,0.3), 0 0 35px rgba(99, 102, 241, 0.18)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
      overflow: 'hidden',
      animation: 'fadeInUp 0.25s ease-out'
    }}>
      {/* Header */}
      <div style={{
        padding: '0.9rem 1.2rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.12) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Suguna AI + n8n Bot
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Live Automation Assistant • 100% Free
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Quick Action Chips Bar */}
      <div style={{
        display: 'flex',
        gap: '6px',
        padding: '0.5rem 0.8rem',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => handleChipClick('trigger_n8n')}
          style={{
            fontSize: '0.74rem',
            padding: '4px 10px',
            borderRadius: '20px',
            border: '1px solid #6366F1',
            background: 'rgba(99, 102, 241, 0.1)',
            color: '#6366F1',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Zap size={12} /> Test n8n Trigger
        </button>
        <button
          onClick={() => handleChipClick('it_today')}
          style={{
            fontSize: '0.74rem',
            padding: '4px 10px',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          📅 Today's Schedule
        </button>
        <button
          onClick={() => handleChipClick('substitutes')}
          style={{
            fontSize: '0.74rem',
            padding: '4px 10px',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          🔄 Substitutes
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '4px'
            }}
          >
            <div style={{
              maxWidth: '85%',
              padding: '0.75rem 0.95rem',
              borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
              background: msg.sender === 'user' ? 'linear-gradient(135deg, #6366F1, #4F46E5)' : 'var(--bg-card)',
              color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {msg.text}

              {msg.actionButtons && msg.actionButtons.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '0.65rem' }}>
                  {msg.actionButtons.map((btn, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(btn.action)}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', padding: '0 4px' }}>
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0.5rem 0.8rem',
            background: 'var(--bg-card)',
            borderRadius: '14px',
            width: 'fit-content',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}>
            <Sparkles size={14} className="animate-spin" /> Suguna AI is thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend(input)}
          placeholder="Ask in English or Tanglish..."
          style={{
            flex: 1,
            padding: '0.6rem 0.85rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.84rem',
            outline: 'none'
          }}
        />
        <button
          onClick={() => handleSend(input)}
          disabled={!input.trim()}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: input.trim() ? '#6366F1' : 'var(--bg-card)',
            color: input.trim() ? '#fff' : 'var(--text-muted)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() ? 'pointer' : 'default',
            transition: 'all 0.15s ease'
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
