/**
 * Stake — Habit commitment page with real blockchain staking.
 * Renders inside the scaled canvas (App.tsx handles PageShell, Sidebar, scaling).
 */
import { useState } from 'react';
import { MetricCard, ActivityCard } from '../components/cards';
import { MainCardBlob } from '../components/blobs';
import { abs } from '../utils/styles';
import { cardBackground, cardBackdrop, slideUp, slideIn, typography } from '../styles/theme';
import { CARD_SHADOW, FONT_HEADING, FONT_BODY, COLOR_PURPLE_ACCENT, STATUS_DONE, STATUS_ACTIVE } from '../utils/tokens';
import { useStreakBeastCore } from '../hooks/useStreakBeastCore';
import { useWallet } from '../contexts/WalletContext';

const HABIT_TYPES = [
  { id: 0, name: 'Coding', icon: '</>', theme: 'purple' as const },
  { id: 1, name: 'Exercise', icon: '🏃', theme: 'red' as const },
  { id: 2, name: 'Reading', icon: '📚', theme: 'coral' as const },
  { id: 3, name: 'Meditation', icon: '🧘', theme: 'purple' as const },
  { id: 4, name: 'Language', icon: '🗣', theme: 'red' as const },
  { id: 5, name: 'Custom', icon: '⭐', theme: 'coral' as const },
];

const DURATION_OPTIONS = [7, 14, 30, 60, 90];

export default function Stake() {
  const { isConnected, balance } = useWallet();
  const { stake, isReady } = useStreakBeastCore();

  const [selectedHabit, setSelectedHabit] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState('0.05');
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [isStaking, setIsStaking] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [txMessage, setTxMessage] = useState('');

  const selectedHabitName = selectedHabit !== null
    ? HABIT_TYPES.find((h) => h.id === selectedHabit)?.name ?? 'Not selected'
    : 'Not selected';

  // Cap max stake to wallet balance (or 1 BNB)
  const maxStake = Math.min(parseFloat(balance || '0') || 1, 1);

  const handleStake = async () => {
    if (selectedHabit === null || !isConnected || !isReady) return;
    setIsStaking(true);
    setTxStatus('pending');
    setTxMessage('Submitting transaction…');
    try {
      const receipt = await stake(selectedHabit, selectedDuration, stakeAmount);
      setTxStatus('success');
      setTxMessage(`Staked successfully! Tx: ${receipt?.hash ? `${(receipt.hash as string).slice(0, 10)}…` : 'confirmed'}`);
    } catch (e: any) {
      setTxStatus('error');
      const raw = e?.reason || e?.message || 'Transaction failed';
      // Map common blockchain errors to user-friendly messages
      if (/insufficient funds/i.test(raw)) {
        setTxMessage('Insufficient balance. Please add more tBNB to your wallet.');
      } else if (/user rejected|user denied/i.test(raw)) {
        setTxMessage('Transaction cancelled.');
      } else if (/nonce/i.test(raw)) {
        setTxMessage('Transaction conflict. Please try again.');
      } else if (/gas/i.test(raw)) {
        setTxMessage('Not enough gas to complete the transaction.');
      } else if (raw.length > 80) {
        setTxMessage('Transaction failed. Please try again.');
      } else {
        setTxMessage(raw);
      }
    } finally {
      setIsStaking(false);
    }
  };

  const canStake = isConnected && isReady && selectedHabit !== null && !isStaking && parseFloat(stakeAmount) > 0 && parseFloat(stakeAmount) <= maxStake;

  if (!isConnected) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <h1 style={{ position: 'absolute', left: 40, top: 70, ...typography.heading1, animation: slideUp(0.1) }}>Stake & Commit</h1>
        <div style={{ position: 'absolute', left: 40, top: 130, width: 780, height: 540, animation: slideUp(0.2) }}>
          <div style={{ position: 'relative', width: 780, height: 540 }}>
            <MainCardBlob idPrefix="stake_hero" top={-10} />
            <div style={abs({ width: 200, height: 200, top: -24, left: -24, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,80,.3), transparent 60%)', filter: 'blur(16px)', pointerEvents: 'none' })} />
            <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 85, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
              <div style={abs({ inset: 0, ...cardBackground })} />
              <div style={abs({ inset: 0, ...cardBackdrop })} />
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, textAlign: 'center', padding: '0 60px' }}>
                <span style={{ fontSize: 56 }}>🔗</span>
                <h3 style={{ fontFamily: FONT_HEADING, fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Connect Your Wallet</h3>
                <p style={{ fontFamily: FONT_BODY, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0, maxWidth: 400 }}>
                  Connect your BNB wallet to stake on your habits. Your commitment is secured onchain — put skin in the game and earn rewards for consistency.
                </p>
                <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
                  Click "Connect" in the top right to get started.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Page Title */}
      <h1 style={{ position: 'absolute', left: 40, top: 70, ...typography.heading1, animation: slideUp(0.1) }}>Stake & Commit</h1>


      {/* Main hero card — Stake form with blob + glow */}
      <div style={{ position: 'absolute', left: 40, top: 130, width: 720, height: 540, animation: slideUp(0.2) }}>
        <div style={{ position: 'relative', width: 720, height: 540 }}>
          <MainCardBlob idPrefix="stake_hero" top={-10} />
          <div style={abs({ width: 200, height: 200, top: -24, left: -24, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,80,.3), transparent 60%)', filter: 'blur(16px)', pointerEvents: 'none' })} />
          <div style={abs({ width: 176, height: 176, bottom: -16, right: -20, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,40,.4), transparent 60%)', filter: 'blur(20px)', pointerEvents: 'none' })} />

          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 85, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
            <div style={abs({ inset: 0, ...cardBackground })} />
            <div style={abs({ inset: 0, ...cardBackdrop })} />

            <div style={{ position: 'relative', padding: '48px 60px', display: 'flex', flexDirection: 'column', gap: 32, height: '100%' }}>
              {/* Stake Amount */}
              <div>
                <h2 style={{ ...typography.heading3, marginBottom: 20 }}>Stake Amount</h2>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <span style={{ fontFamily: FONT_HEADING, fontSize: 64, fontWeight: 800, color: '#fff', lineHeight: '78px' }}>{stakeAmount}</span>
                  <span style={{ fontFamily: FONT_HEADING, fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>BNB</span>
                </div>
                <div style={{ position: 'relative', height: 8, marginBottom: 8 }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(parseFloat(stakeAmount) / maxStake) * 100}%`, background: `linear-gradient(90deg, ${COLOR_PURPLE_ACCENT}, #A78BFA)`, borderRadius: 4 }} />
                  <input type="range" min="0.001" max={maxStake.toString()} step="0.001" value={stakeAmount} onChange={(e) => setStakeAmount(parseFloat(e.target.value).toFixed(3))} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: FONT_HEADING, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>0.001 BNB</span>
                  <span style={{ fontFamily: FONT_HEADING, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{maxStake.toFixed(3)} BNB</span>
                </div>
              </div>

              {/* Duration */}
              <div>
                <h2 style={{ ...typography.heading3, marginBottom: 16 }}>Commitment Duration</h2>
                <div style={{ display: 'flex', gap: 10 }}>
                  {DURATION_OPTIONS.map((dur, i) => {
                    const isActive = selectedDuration === dur;
                    return (
                      <button
                        key={dur}
                        onClick={() => setSelectedDuration(dur)}
                        style={{
                          border: 'none', borderRadius: 20, padding: '10px 20px',
                          fontFamily: FONT_HEADING, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          background: isActive ? COLOR_PURPLE_ACCENT : 'rgba(255,255,255,0.07)',
                          color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                          animation: slideIn(0.4 + i * 0.05),
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                      >
                        {dur} days
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Habit selection label */}
      <h2 style={{ position: 'absolute', left: 800, top: 180, ...typography.heading3, animation: slideUp(0.3) }}>Choose Your Habit</h2>

      {/* Habit cards — 2×3 grid */}
      {HABIT_TYPES.map((habit, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const isSelected = selectedHabit === habit.id;
        return (
          <div
            key={habit.id}
            style={{
              position: 'absolute',
              left: 780 + col * 240,
              top: 230 + row * 165,
              transform: `scale(0.65)${isSelected ? ' translateY(-4px)' : ''}`,
              transformOrigin: 'top left', cursor: 'pointer',
              opacity: isSelected ? 1 : 0.75, transition: 'all 0.25s ease',
              filter: isSelected ? 'brightness(1.15)' : 'brightness(1)',
            }}
            onClick={() => setSelectedHabit(habit.id)}
          >
            <ActivityCard
              theme={habit.theme} icon={habit.icon} title={habit.name}
              streak={0} status={isSelected ? 'Selected' : 'Select'}
              statusColor={isSelected ? STATUS_DONE : STATUS_ACTIVE} delay={0.4 + i * 0.08}
            />
          </div>
        );
      })}

      {/* Summary */}
      <div style={{ position: 'absolute', left: 40, top: 700, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="orange" title="Summary" value={`${selectedHabitName} · ${stakeAmount} BNB · ${selectedDuration}d`} delay={0.8} valueFontSize={22} />
      </div>

      {/* Stake button */}
      <div style={{ position: 'absolute', left: 440, top: 740, animation: slideUp(0.9), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <button
          onClick={handleStake}
          disabled={!canStake}
          style={{
            border: 'none', borderRadius: 30, padding: '18px 48px',
            fontFamily: FONT_HEADING, fontWeight: 800, fontSize: 22,
            cursor: canStake ? 'pointer' : 'not-allowed',
            background: canStake ? `linear-gradient(135deg, ${COLOR_PURPLE_ACCENT}, #A78BFA)` : 'rgba(255,255,255,0.1)',
            color: canStake ? '#fff' : 'rgba(255,255,255,0.3)',
            boxShadow: canStake ? '0 8px 32px rgba(139,92,246,0.35)' : 'none',
            transition: 'all 0.25s ease',
            opacity: isStaking ? 0.7 : 1,
          }}
          onMouseEnter={(e) => { if (canStake) { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(139,92,246,0.5)'; } }}
          onMouseLeave={(e) => { if (canStake) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,92,246,0.35)'; } }}
        >
          {isStaking ? '⏳ Staking...' : '🔥 Stake & Commit'}
        </button>

        {/* Transaction status message */}
        {txStatus !== 'idle' && (
          <span style={{
            fontFamily: FONT_BODY, fontSize: 16, fontWeight: 600, maxWidth: 400, textAlign: 'center', lineHeight: 1.5,
            color: txStatus === 'success' ? '#90B171' : txStatus === 'error' ? '#FF6B6B' : 'rgba(255,255,255,0.5)',
          }}>
            {txMessage}
          </span>
        )}

      </div>
    </div>
  );
}