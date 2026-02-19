/**
 * Achievements — Badge/milestone page.
 * Renders inside the scaled canvas (App.tsx handles PageShell, Sidebar, scaling).
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { MetricCard } from '../components/cards';
import { MainCardBlob } from '../components/blobs';
import { abs } from '../utils/styles';
import { cardBackground, cardBackdrop, slideUp, slideIn, typography } from '../styles/theme';
import { CARD_SHADOW, FONT_HEADING, FONT_BODY } from '../utils/tokens';
import { useStreakBeastCore, Habit } from '../hooks/useStreakBeastCore';
import { useStreakBadge, BADGE_THRESHOLDS, BADGE_NAMES } from '../hooks/useStreakBadge';
import { useWallet } from '../contexts/WalletContext';
import { BADGE_IMAGES } from '../contracts/badgeMetadata';


const BADGE_DESCRIPTIONS = [
  'Complete your first day',
  'Maintain a 7-day streak',
  'Maintain a 30-day streak',
  'Maintain a 100-day streak',
  'Maintain a 365-day streak',
];

export default function Achievements() {
  const { account, isConnected } = useWallet();
  const { getUserHabits, getHabit } = useStreakBeastCore();
  const { hasBadge, isReady: badgeReady } = useStreakBadge();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [badgeOwnership, setBadgeOwnership] = useState<boolean[]>([false, false, false, false, false]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!account || !isConnected) {
      setHabits([]);
      setBadgeOwnership([false, false, false, false, false]);
      return;
    }
    setLoading(true);
    try {
      // Fetch habits
      const habitIds = await getUserHabits(account);
      const fetched = habitIds.length > 0
        ? await Promise.all(habitIds.map((id) => getHabit(id)))
        : [];
      setHabits(fetched);

      // Fetch badge ownership
      if (badgeReady) {
        const ownership = await Promise.all(
          BADGE_THRESHOLDS.map((_, i) =>
            hasBadge(i, account).catch(() => false)
          )
        );
        setBadgeOwnership(ownership);
      }
    } catch (e) {
      console.error('Failed to fetch achievements:', e);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, [account, isConnected, getUserHabits, getHabit, hasBadge, badgeReady]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Computed values ── */
  const longestStreak = useMemo(() =>
    habits.reduce((m, h) => Math.max(m, h.longestStreak), 0),
    [habits]
  );

  const totalStreakDays = useMemo(() =>
    habits.reduce((s, h) => s + h.currentStreak, 0),
    [habits]
  );

  const earnedCount = badgeOwnership.filter(Boolean).length;

  const badges = BADGE_THRESHOLDS.map((threshold, i) => ({
    id: i,
    name: BADGE_NAMES[i],
    image: BADGE_IMAGES[i],
    description: BADGE_DESCRIPTIONS[i],
    threshold,
    progress: Math.min(100, Math.round((longestStreak / threshold) * 100)),
    earned: badgeOwnership[i],
  }));

  if (!isConnected) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <h1 style={{ position: 'absolute', left: 40, top: 100, ...typography.heading1, animation: slideUp(0.1) }}>Achievements</h1>
        <div style={{ position: 'absolute', left: 40, top: 360, width: 1200, height: 620, animation: slideUp(0.3) }}>
          <div style={{ position: 'relative', width: 1200, height: 620 }}>
            <MainCardBlob idPrefix="ach_badges" top={-50} />
            <div style={abs({ width: 250, height: 250, top: -30, left: -30, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,80,.3), transparent 60%)', filter: 'blur(20px)', pointerEvents: 'none' })} />
            <div style={{ position: 'relative', width: '100%', height: '85%', borderRadius: 85, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
              <div style={abs({ inset: 0, ...cardBackground })} />
              <div style={abs({ inset: 0, ...cardBackdrop })} />
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20, textAlign: 'center', padding: '0 60px' }}>
                <span style={{ fontSize: 56 }}>🔗</span>
                <h3 style={{ fontFamily: FONT_HEADING, fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Connect Your Wallet</h3>
                <p style={{ fontFamily: FONT_BODY, fontSize: 17, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: 0, maxWidth: 420 }}>
                  Connect your BNB wallet to view your NFT badge collection. Badges are minted onchain as you hit streak milestones — from your first day to a full year.
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
      <h1 style={{ position: 'absolute', left: 40, top: 100, ...typography.heading1, animation: slideUp(0.1) }}>
        Achievements
      </h1>



      {/* Badges Earned */}
      <div style={{ position: 'absolute', left: 40, top: 155, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="red" title="Badges Earned" value={`${earnedCount} / ${badges.length}`} delay={0.2} />
      </div>

      {/* Total Streak Days */}
      <div style={{ position: 'absolute', left: 430, top: 155, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="orange" title="Total Streak Days" value={isConnected ? `${totalStreakDays}` : 'N/A'} delay={0.3} />
      </div>

      {/* Longest Streak */}
      <div style={{ position: 'absolute', left: 820, top: 155, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="purple" title="Longest Streak" value={isConnected ? `${longestStreak} days` : 'N/A'} delay={0.4} />
      </div>

      {/* Badge grid — large card area with blob + glow */}
      <div style={{ position: 'absolute', left: 40, top: 360, width: 1200, height: 620, animation: slideUp(0.5) }}>
        <div style={{ position: 'relative', width: 1200, height: 620 }}>
          <MainCardBlob idPrefix="ach_badges" top={-50} />

          {/* Top-left edge glow */}
          <div style={abs({ width: 250, height: 250, top: -30, left: -30, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,80,.3), transparent 60%)', filter: 'blur(20px)', pointerEvents: 'none' })} />
          {/* Bottom-right corner glow */}
          <div style={abs({ width: 220, height: 220, bottom: -20, right: -25, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,40,.4), transparent 60%)', filter: 'blur(25px)', pointerEvents: 'none' })} />

          {/* Card body */}
          <div style={{ position: 'relative', width: '100%', height: '85%', borderRadius: 85, overflow: 'hidden', boxShadow: CARD_SHADOW }}>
            <div style={abs({ inset: 0, ...cardBackground })} />
            <div style={abs({ inset: 0, ...cardBackdrop })} />

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%', padding: '48px 80px' }}>
              <h2 style={{ ...typography.heading2, marginBottom: 32 }}>NFT Badge Collection</h2>

              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <span style={{ fontFamily: FONT_HEADING, fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Loading badges…</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24, flex: 1 }}>
                  {badges.map((badge, i) => (
                    <div
                      key={badge.id}
                      style={{
                        background: badge.earned ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                        borderRadius: 30, padding: '28px 20px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                        border: badge.earned ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.05)',
                        transition: 'transform 0.25s ease, background 0.25s ease',
                        cursor: 'pointer', animation: slideIn(0.6 + i * 0.08),
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = badge.earned ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'; }}
                    >
                      <img
                        src={badge.image}
                        alt={badge.name}
                        style={{
                          width: 80, height: 80, objectFit: 'contain',
                          filter: badge.earned ? 'drop-shadow(0 0 12px rgba(108,60,225,0.5))' : 'grayscale(100%)',
                          opacity: badge.earned ? 1 : 0.35,
                          transition: 'filter 0.3s ease, opacity 0.3s ease',
                        }}
                      />
                      <span style={{ fontFamily: FONT_HEADING, fontWeight: 800, fontSize: 18, color: badge.earned ? '#fff' : 'rgba(255,255,255,0.35)', textAlign: 'center' }}>{badge.name}</span>
                      <span style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 14, color: badge.earned ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: '1.4' }}>{badge.description}</span>

                      {badge.earned ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(144,177,113,0.2)', color: '#90B171', fontSize: 14, fontWeight: 700, fontFamily: FONT_HEADING, borderRadius: 20, padding: '5px 14px' }}>✓ Earned</span>
                      ) : (
                        <div style={{ width: '100%' }}>
                          <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                            <div style={{ height: '100%', width: `${badge.progress}%`, background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)', borderRadius: 3, transition: 'width 0.6s ease' }} />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: FONT_HEADING, fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>{badge.progress}%</span>
                            <span style={{ fontSize: 14, opacity: 0.3 }}>🔒</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
