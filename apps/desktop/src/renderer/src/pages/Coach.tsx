/**
 * Coach — AI chat interface page powered by OpenClaw.
 * Renders inside the scaled canvas (App.tsx handles PageShell, Sidebar, scaling).
 */
import { useState, useRef, useEffect } from 'react';
import { MetricCard } from '../components/cards';
import { MainCardBlob } from '../components/blobs';
import { abs } from '../utils/styles';
import { cardBackground, cardBackdrop, slideUp, slideIn, typography } from '../styles/theme';
import { CARD_SHADOW, FONT_HEADING, FONT_BODY, COLOR_PURPLE_ACCENT } from '../utils/tokens';
import { useOpenClaw, type OpenClawMessage } from '../hooks/useOpenClaw';
import { useOpenClawStatus } from '../contexts/OpenClawContext';
import { useWallet } from '../contexts/WalletContext';
import { useStreakBeastCore } from '../hooks/useStreakBeastCore';

interface DisplayMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const QUICK_ACTIONS = ['How am I doing?', 'Motivation tips', 'Streak analysis', 'Habit suggestions'];

const WELCOME_MSG = "Hey there! I'm your AI coach powered by OpenClaw. Ask me anything about your habits, streaks, or get motivation tips! 🚀";

export default function Coach() {
  const { account, isConnected: walletConnected } = useWallet();
  const { getUserHabits, getHabit } = useStreakBeastCore();
  const { isConnected: daemonOnline } = useOpenClawStatus();

  const { sendMessage: openClawSend, messages: openClawMessages, isStreaming, error } = useOpenClaw({
    model: 'agent:streakbeast',
    systemPrompt: `You are the StreakBeast AI Coach. The user's wallet address is ${account || 'not connected'}. Help them with habit tracking, motivation, and streak analysis. Be encouraging but concise.`,
    userId: account || undefined,
  });

  const [inputValue, setInputValue] = useState('');
  const [currentStreak, setCurrentStreak] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);

  // Fetch real streak from contract
  useEffect(() => {
    if (!account || !walletConnected) return;
    getUserHabits(account).then(async (ids) => {
      if (ids.length === 0) return;
      const habits = await Promise.all(ids.map(id => getHabit(id)));
      const maxStreak = habits.reduce((m, h) => Math.max(m, h.currentStreak), 0);
      setCurrentStreak(maxStreak);
    }).catch(() => {});
  }, [account, walletConnected, getUserHabits, getHabit]);

  // Map OpenClaw messages to display format
  const displayMessages: DisplayMessage[] = [
    { id: 0, text: WELCOME_MSG, sender: 'ai' },
    ...openClawMessages.map((m: OpenClawMessage, i: number) => ({
      id: i + 1,
      text: m.content,
      sender: (m.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
    })),
  ];

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [displayMessages.length, isStreaming]);

  const sendMessage = (text?: string) => {
    const msg = text || inputValue.trim();
    if (!msg || isStreaming) return;
    setInputValue('');
    openClawSend(msg);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Page Title */}
      <h1 style={{ position: 'absolute', left: 40, top: 70, ...typography.heading1, animation: slideUp(0.1) }}>AI Coach</h1>


      {/* AI Status */}
      <div style={{ position: 'absolute', left: 840, top: 140, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="purple" title="Coach Status" value={daemonOnline ? "✨ Active" : "⚡ Offline"} delay={0.3} />
      </div>

      {/* Main chat card with blob + glow */}
      <div style={{ position: 'absolute', left: 40, top: 130, width: 780, height: 810, animation: slideUp(0.2) }}>
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
                  <span style={{ fontFamily: FONT_BODY, fontSize: 14, color: daemonOnline ? '#90B171' : '#FF6B6B', fontWeight: 600 }}>
                    {daemonOnline ? '● Online' : '● Offline'}
                  </span>
                </div>
              </div>

              {/* Setup messages when services unavailable */}
              {!walletConnected && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center', padding: '0 40px' }}>
                  <span style={{ fontSize: 56 }}>🔗</span>
                  <h3 style={{ fontFamily: FONT_HEADING, fontSize: 22, fontWeight: 600, color: '#fff', margin: 0 }}>Connect Your Wallet</h3>
                  <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0, maxWidth: 380 }}>
                    Connect your BNB wallet to access the AI Coach. Your streak data and habits are stored onchain — the coach needs your wallet to give personalized advice.
                  </p>
                  <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                    Click "Connect" in the top right to get started.
                  </p>
                </div>
              )}

              {walletConnected && !daemonOnline && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, textAlign: 'center', padding: '0 40px' }}>
                  <span style={{ fontSize: 56 }}>⚡</span>
                  <h3 style={{ fontFamily: FONT_HEADING, fontSize: 22, fontWeight: 600, color: '#fff', margin: 0 }}>OpenClaw Not Running</h3>
                  <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0, maxWidth: 420 }}>
                    The AI Coach requires the OpenClaw gateway running locally. Install it and register the StreakBeast skill to enable coaching and streak analysis.
                  </p>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '16px 24px', textAlign: 'left', width: '100%', maxWidth: 440 }}>
                    <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px' }}>1. Install OpenClaw &amp; start the gateway:</p>
                    <code style={{ fontFamily: 'monospace', fontSize: 13, color: '#A78BFA', display: 'block', lineHeight: 1.8, marginBottom: 14 }}>
                      curl -fsSL https://openclaw.ai/install.sh | bash<br/>
                      openclaw onboard --install-daemon
                    </code>
                    <p style={{ fontFamily: FONT_BODY, fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: '0 0 10px' }}>2. Copy the skill into OpenClaw:</p>
                    <code style={{ fontFamily: 'monospace', fontSize: 13, color: '#A78BFA', display: 'block', lineHeight: 1.8 }}>
                      cp -r ./skill ~/.openclaw/skills/streakbeast
                    </code>
                  </div>
                  <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                    Checking connection every 30 seconds...
                  </p>
                </div>
              )}

              {/* Chat UI — only when both wallet and daemon are ready */}
              {walletConnected && daemonOnline && (
                <>
                  {/* Messages area */}
                  <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', gap: 14, paddingRight: 8 }}>
                    {displayMessages.map((msg) => (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: msg.sender === 'ai' ? 'flex-start' : 'flex-end' }}>
                        <div style={{
                          maxWidth: '70%', padding: '14px 20px',
                          borderRadius: msg.sender === 'ai' ? '24px 24px 24px 6px' : '24px 24px 6px 24px',
                          background: msg.sender === 'ai' ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${COLOR_PURPLE_ACCENT}33, ${COLOR_PURPLE_ACCENT}22)`,
                          border: msg.sender === 'ai' ? '1px solid rgba(255,255,255,0.08)' : `1px solid ${COLOR_PURPLE_ACCENT}44`,
                          fontFamily: FONT_BODY, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: '1.5',
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {isStreaming && displayMessages[displayMessages.length - 1]?.sender !== 'ai' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{ padding: '14px 24px', borderRadius: '24px 24px 24px 6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 6, alignItems: 'center' }}>
                          {[0, 1, 2].map((i) => (
                            <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR_PURPLE_ACCENT, opacity: 0.6, animation: `streakPulse 1.2s ease-in-out ${i * 0.15}s infinite` }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error banner */}
                  {error && (
                    <div style={{ padding: '8px 16px', borderRadius: 12, background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)', fontFamily: FONT_BODY, fontSize: 12, color: '#FF6B6B', marginTop: 8 }}>
                      {error}
                    </div>
                  )}

                  {/* Input area */}
                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      placeholder="Ask your coach..."
                      style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '14px 24px', fontFamily: FONT_BODY, fontSize: 16, color: '#fff', outline: 'none' }}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={isStreaming}
                      style={{ width: 52, height: 52, borderRadius: '50%', border: 'none', background: `linear-gradient(135deg, ${COLOR_PURPLE_ACCENT}, #A78BFA)`, cursor: isStreaming ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s ease', boxShadow: '0 4px 16px rgba(139,92,246,0.3)', opacity: isStreaming ? 0.6 : 1 }}
                      onMouseEnter={(e) => { if (!isStreaming) e.currentTarget.style.transform = 'scale(1.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions (right side) */}
      <h3 style={{ position: 'absolute', left: 860, top: 320, ...typography.heading3, animation: slideUp(0.4) }}>Quick Actions</h3>
      {QUICK_ACTIONS.map((action, i) => (
        <div key={action} style={{ position: 'absolute', left: 860, top: 380 + i * 72, animation: slideIn(0.5 + i * 0.08) }}>
          <button
            onClick={() => sendMessage(action)}
            disabled={isStreaming}
            style={{
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '16px 28px',
              fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 14, cursor: isStreaming ? 'wait' : 'pointer',
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

      {/* Streak info card — real data */}
      <div style={{ position: 'absolute', left: 860, top: 690, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="orange" title="Your Streak" value={`🔥 ${currentStreak} days`} delay={0.6} />
      </div>
    </div>
  );
}
