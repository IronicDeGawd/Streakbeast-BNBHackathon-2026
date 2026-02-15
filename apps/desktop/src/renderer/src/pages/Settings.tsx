/**
 * Settings — User preferences page with real wallet data.
 * Renders inside the scaled canvas (App.tsx handles PageShell, Sidebar, scaling).
 */
import { useState, useEffect, useCallback } from 'react';
import { MetricCard, WalletStatusCard } from '../components/cards';
import { MainCardBlob } from '../components/blobs';
import { abs } from '../utils/styles';
import { cardBackground, cardBackdrop, slideUp, slideIn, typography } from '../styles/theme';
import { CARD_SHADOW, FONT_HEADING, COLOR_PURPLE_ACCENT } from '../utils/tokens';
import { useWallet } from '../contexts/WalletContext';

const LINKED_ACCOUNTS = [
  { name: 'Strava', icon: '🏃', status: 'Not connected' },
  { name: 'GitHub', icon: '💙', status: 'Not connected' },
  { name: 'Duolingo', icon: '🦉', status: 'Not connected' },
];

/* ── Network name from chainId ── */
function getNetworkName(chainId: number | null): string {
  if (!chainId) return 'Not connected';
  switch (chainId) {
    case 5611: return 'opBNB Testnet';
    case 97: return 'BNB Testnet';
    default: return `Chain ${chainId}`;
  }
}

/* ── Preferences persistence keys ── */
const PREF_KEYS = {
  notifications: 'streakbeast_pref_notifications',
  soundEffects: 'streakbeast_pref_sound_effects',
  autoVerify: 'streakbeast_pref_auto_verify',
};

function loadPref(key: string, defaultVal: boolean): boolean {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === 'true' : defaultVal;
  } catch { return defaultVal; }
}

export default function Settings() {
  const { account, isConnected, balance, chainId, disconnect } = useWallet();

  const [notifications, setNotifications] = useState(() => loadPref(PREF_KEYS.notifications, true));
  const [soundEffects, setSoundEffects] = useState(() => loadPref(PREF_KEYS.soundEffects, false));
  const [autoVerify, setAutoVerify] = useState(() => loadPref(PREF_KEYS.autoVerify, true));

  // Persist prefs to localStorage
  useEffect(() => { try { localStorage.setItem(PREF_KEYS.notifications, String(notifications)); } catch { } }, [notifications]);
  useEffect(() => { try { localStorage.setItem(PREF_KEYS.soundEffects, String(soundEffects)); } catch { } }, [soundEffects]);
  useEffect(() => { try { localStorage.setItem(PREF_KEYS.autoVerify, String(autoVerify)); } catch { } }, [autoVerify]);

  const handleDisconnect = useCallback(async () => {
    try { await disconnect(); } catch (e) { console.error('Failed to disconnect:', e); }
  }, [disconnect]);

  const toggleStyle = (on: boolean) => ({
    width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
    position: 'relative' as const, transition: 'background 0.25s ease',
    background: on ? COLOR_PURPLE_ACCENT : 'rgba(255,255,255,0.15)', flexShrink: 0,
  });

  const knobStyle = (on: boolean) => ({
    position: 'absolute' as const, top: 3, transition: 'left 0.25s ease',
    left: on ? 24 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff',
  });

  const shortenAddr = (addr: string | null) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '0x0000...0000';

  // Format balance — show up to 4 decimal places
  const formattedBalance = isConnected && balance
    ? `${parseFloat(balance).toFixed(4)} BNB`
    : 'N/A';

  const networkName = getNetworkName(chainId);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Page Title */}
      <h1 style={{ position: 'absolute', left: 40, top: 30, ...typography.heading1, animation: slideUp(0.1) }}>Settings</h1>

      {/* Wallet Status — top right */}
      <div style={{ position: 'absolute', right: 80, top: 15, transform: 'scale(0.9)', transformOrigin: 'top right', zIndex: 5 }}>
        <WalletStatusCard />
      </div>

      {/* Wallet card */}
      <div style={{ position: 'absolute', left: 40, top: 90, width: 650, height: 350, animation: slideUp(0.2) }}>
        <div style={{ position: 'relative', width: 650, height: 350 }}>
          <div style={abs({ width: 250, height: 250, top: -30, left: -30, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,80,.3), transparent 60%)', filter: 'blur(20px)', pointerEvents: 'none' })} />
          <div style={abs({ width: 220, height: 220, bottom: -20, right: -25, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,40,.4), transparent 60%)', filter: 'blur(25px)', pointerEvents: 'none' })} />

          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 85, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
            <div style={abs({ inset: 0, ...cardBackground })} />
            <div style={abs({ inset: 0, ...cardBackdrop })} />

            <div style={{ position: 'relative', padding: '48px 60px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ ...typography.heading2, marginBottom: 8 }}>Wallet</h2>

              {[
                { label: 'Connected Address', value: isConnected ? shortenAddr(account) : 'Not connected', mono: true },
                { label: 'Network', value: networkName, dot: isConnected ? '#90B171' : '#FF6B6B' },
                { label: 'Balance', value: formattedBalance },
              ].map((row, i) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: slideIn(0.3 + i * 0.06) }}>
                  <span style={{ fontFamily: FONT_HEADING, fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{row.label}</span>
                  <span style={{ fontFamily: row.mono ? 'monospace' : FONT_HEADING, fontSize: 16, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {row.dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.dot, display: 'inline-block' }} />}
                    {row.value}
                  </span>
                </div>
              ))}

              <button
                onClick={handleDisconnect}
                disabled={!isConnected}
                style={{
                  alignSelf: 'flex-start', marginTop: 8, border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 16, padding: '10px 24px', fontFamily: FONT_HEADING, fontWeight: 700,
                  fontSize: 14, cursor: isConnected ? 'pointer' : 'not-allowed',
                  background: 'rgba(255,255,255,0.05)',
                  color: isConnected ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
                  transition: 'all 0.2s ease', animation: slideIn(0.5),
                }}
                onMouseEnter={(e) => { if (isConnected) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={(e) => { if (isConnected) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Accounts card */}
      <div style={{ position: 'absolute', left: 730, top: 140, width: 510, height: 350, animation: slideUp(0.3) }}>
        <div style={{ position: 'relative', width: 510, height: 350 }}>
          <MainCardBlob idPrefix="set_linked" scale={0.7} top={-100} left={-150} />
          <div style={abs({ width: 200, height: 200, top: -25, left: -25, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,80,.25), transparent 60%)', filter: 'blur(18px)', pointerEvents: 'none' })} />
          <div style={abs({ width: 180, height: 180, bottom: -18, right: -20, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,40,.3), transparent 60%)', filter: 'blur(22px)', pointerEvents: 'none' })} />

          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 85, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
            <div style={abs({ inset: 0, ...cardBackground })} />
            <div style={abs({ inset: 0, ...cardBackdrop })} />

            <div style={{ position: 'relative', padding: '48px 50px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h2 style={{ ...typography.heading2, marginBottom: 8 }}>Linked Accounts</h2>

              {LINKED_ACCOUNTS.map((acc, i) => (
                <div key={acc.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < LINKED_ACCOUNTS.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', animation: slideIn(0.4 + i * 0.08) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 28 }}>{acc.icon}</span>
                    <div>
                      <div style={{ fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 16, color: '#fff' }}>{acc.name}</div>
                      <div style={{ fontFamily: FONT_HEADING, fontWeight: 500, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{acc.status}</div>
                    </div>
                  </div>
                  <button
                    style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '8px 20px', fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 12, cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${COLOR_PURPLE_ACCENT}22`; e.currentTarget.style.borderColor = `${COLOR_PURPLE_ACCENT}44`; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* OpenClaw Agent */}
      <div style={{ position: 'absolute', left: 40, top: 470, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="purple" title="OpenClaw Agent" value="● Active" delay={0.5} />
      </div>

      {/* Preferences card */}
      <div style={{ position: 'absolute', left: 420, top: 540, width: 820, height: 320, animation: slideUp(0.5) }}>
        <div style={{ position: 'relative', width: 820, height: 320 }}>
          <div style={abs({ width: 220, height: 220, top: -25, left: -25, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,80,.25), transparent 60%)', filter: 'blur(18px)', pointerEvents: 'none' })} />
          <div style={abs({ width: 200, height: 200, bottom: -18, right: -20, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,40,.35), transparent 60%)', filter: 'blur(22px)', pointerEvents: 'none' })} />

          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 85, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
            <div style={abs({ inset: 0, ...cardBackground })} />
            <div style={abs({ inset: 0, ...cardBackdrop })} />

            <div style={{ position: 'relative', padding: '48px 60px', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h2 style={{ ...typography.heading2, marginBottom: 8 }}>Preferences</h2>

              {[
                { label: 'Desktop Notifications', value: notifications, toggle: () => setNotifications(!notifications) },
                { label: 'Sound Effects', value: soundEffects, toggle: () => setSoundEffects(!soundEffects) },
                { label: 'Auto-verify Habits', value: autoVerify, toggle: () => setAutoVerify(!autoVerify) },
              ].map((pref, i) => (
                <div key={pref.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', animation: slideIn(0.6 + i * 0.06) }}>
                  <span style={{ fontFamily: FONT_HEADING, fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{pref.label}</span>
                  <button onClick={pref.toggle} style={toggleStyle(pref.value)}>
                    <div style={knobStyle(pref.value)} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Verification */}
      <div style={{ position: 'absolute', left: 40, top: 660, animation: slideUp(0.7) }}>
        <MetricCard theme="red" title="Verification" value="Daily 11 PM UTC" delay={0.7} />
      </div>
    </div>
  );
}
