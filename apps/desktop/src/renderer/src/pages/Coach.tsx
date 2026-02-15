/**
 * Coach — AI chat interface page.
 * Renders inside the scaled canvas (App.tsx handles PageShell, Sidebar, scaling).
 */
import { useState, useRef, useEffect } from 'react';
import { MetricCard } from '../components/cards';
import { MainCardBlob } from '../components/blobs';
import { abs } from '../utils/styles';
import { cardBackground, cardBackdrop, slideUp, slideIn, typography } from '../styles/theme';
import { CARD_SHADOW, FONT_HEADING, COLOR_PURPLE_ACCENT } from '../utils/tokens';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const QUICK_ACTIONS = ['How am I doing?', 'Motivation tips', 'Streak analysis', 'Habit suggestions'];

const AI_RESPONSES = [
  'Great job maintaining your streak! Your consistency in coding is impressive. Keep pushing! 🔥',
  "Here's a tip: Try to code at the same time every day. Consistency breeds habit formation. ⏰",
  'Your 7-day streak puts you in the top 20% of StreakBeast users. Amazing work! 🏆',
  'Consider adding a new habit to diversify your growth. Exercise pairs well with coding! 💪',
  'Remember: every day you show up is a victory. Your pet is thriving because of your dedication! ✨',
];

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "Hey there! I'm your AI coach powered by OpenClaw. Ask me anything about your habits, streaks, or get motivation tips! 🚀", sender: 'ai' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [messages, isTyping]);

  const sendMessage = (text?: string) => {
    const msg = text || inputValue.trim();
    if (!msg) return;
    const userMsg: Message = { id: messages.length, text: msg, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);
    setTimeout(() => {
      const resp = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      const aiMsg: Message = { id: messages.length + 1, text: resp ?? '', sender: 'ai' };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Page Title */}
      <h1 style={{ position: 'absolute', left: 40, top: 30, ...typography.heading1, animation: slideUp(0.1) }}>AI Coach</h1>

      {/* AI Status */}
      <div style={{ position: 'absolute', left: 840, top: 20, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="purple" title="Coach Status" value="✨ Active" delay={0.3} />
      </div>

      {/* Main chat card with blob + glow */}
      <div style={{ position: 'absolute', left: 40, top: 90, width: 780, height: 810, animation: slideUp(0.2) }}>
        <div style={{ position: 'relative', width: 780, height: 810 }}>
          <MainCardBlob idPrefix="coach_chat" top={10} />
          <div style={abs({ width: 250, height: 250, top: -30, left: -30, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,80,.3), transparent 60%)', filter: 'blur(20px)', pointerEvents: 'none' })} />
          <div style={abs({ width: 220, height: 220, bottom: -20, right: -25, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,40,.4), transparent 60%)', filter: 'blur(25px)', pointerEvents: 'none' })} />

          <div style={{ position: 'relative', width: '100%', height: '90%', borderRadius: 85, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
            <div style={abs({ inset: 0, ...cardBackground })} />
            <div style={abs({ inset: 0, ...cardBackdrop })} />

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: '48px 50px 30px' }}>
              {/* Chat header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, animation: slideIn(0.25) }}>
                <span style={{ fontSize: 40 }}>🤖</span>
                <div>
                  <h2 style={{ ...typography.heading3, margin: 0 }}>OpenClaw Coach</h2>
                  <span style={{ fontFamily: FONT_HEADING, fontSize: 14, color: '#90B171', fontWeight: 600 }}>● Online</span>
                </div>
              </div>

              {/* Messages area */}
              <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 8 }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'ai' ? 'flex-start' : 'flex-end' }}>
                    <div style={{
                      maxWidth: '70%', padding: '14px 20px',
                      borderRadius: msg.sender === 'ai' ? '24px 24px 24px 6px' : '24px 24px 6px 24px',
                      background: msg.sender === 'ai' ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${COLOR_PURPLE_ACCENT}33, ${COLOR_PURPLE_ACCENT}22)`,
                      border: msg.sender === 'ai' ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${COLOR_PURPLE_ACCENT}44`,
                      fontFamily: FONT_HEADING, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: '1.5',
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ padding: '14px 24px', borderRadius: '24px 24px 24px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 6, alignItems: 'center' }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR_PURPLE_ACCENT, opacity: 0.6, animation: `streakPulse 1.2s ease-in-out ${i * 0.15}s infinite` }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input area */}
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Ask your coach..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '14px 24px', fontFamily: FONT_HEADING, fontSize: 16, color: '#fff', outline: 'none' }}
                />
                <button
                  onClick={() => sendMessage()}
                  style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: `linear-gradient(135deg, ${COLOR_PURPLE_ACCENT}, #A78BFA)`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s ease', boxShadow: '0 4px 16px rgba(139,92,246,0.3)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions (right side) */}
      <h3 style={{ position: 'absolute', left: 860, top: 200, ...typography.heading3, animation: slideUp(0.4) }}>Quick Actions</h3>
      {QUICK_ACTIONS.map((action, i) => (
        <div key={action} style={{ position: 'absolute', left: 860, top: 260 + i * 72, animation: slideIn(0.5 + i * 0.08) }}>
          <button
            onClick={() => sendMessage(action)}
            style={{
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '16px 28px',
              fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 14, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
              transition: 'all 0.25s ease', width: 380, textAlign: 'left',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.borderColor = `${COLOR_PURPLE_ACCENT}44`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            💬 {action}
          </button>
        </div>
      ))}

      {/* Streak info card */}
      <div style={{ position: 'absolute', left: 860, top: 570, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="orange" title="Your Streak" value="🔥 7 days" delay={0.6} />
      </div>
    </div>
  );
}