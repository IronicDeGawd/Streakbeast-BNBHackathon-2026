/**
 * Home / Dashboard — Main page with prototype design + blockchain data.
 *
 * The page renders inside the scaled canvas (App.tsx handles
 * PageShell, Sidebar, and viewport scaling).
 */
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { HiCodeBracket, HiBookOpen, HiStar, HiLanguage } from 'react-icons/hi2';
import { LuDumbbell, LuBrain } from 'react-icons/lu';
import PetCanvas from '../components/PetCanvas';
import { MainCard, MetricCard, ActivityCard } from '../components/cards';
import { slideUp, typography } from '../styles/theme';
import { STATUS_DONE, STATUS_ACTIVE, EASE_SPRING, FONT_HEADING } from '../utils/tokens';
import { useStreakBeastCore, Habit } from '../hooks/useStreakBeastCore';
import { useWallet } from '../contexts/WalletContext';
import { useNotifications } from '../hooks/useNotifications';
import { useCountdown } from '../hooks/useCountdown';
import type { ActivityTheme } from '../styles/theme';

/* ── Habit type → display meta ── */
const HABIT_META: Record<number, { icon: React.ReactNode; theme: ActivityTheme }> = {
  0: { icon: <HiCodeBracket size={24} />, theme: 'purple' },
  1: { icon: <LuDumbbell size={24} />, theme: 'red' },
  2: { icon: <HiBookOpen size={24} />, theme: 'coral' },
  3: { icon: <LuBrain size={24} />, theme: 'purple' },
  4: { icon: <HiLanguage size={24} />, theme: 'red' },
  5: { icon: <HiStar size={24} />, theme: 'coral' },
};

const HABIT_TYPE_NAMES: Record<number, string> = {
  0: 'Coding', 1: 'Exercise', 2: 'Reading',
  3: 'Meditation', 4: 'Language', 5: 'Custom',
};

/* ── Carousel constants ── */
const CARD_GAP = 24;
const CARD_WIDTH = 390;
const CARDS_PER_PAGE = 3;
const VISIBLE_WIDTH = CARD_WIDTH * CARDS_PER_PAGE + CARD_GAP * (CARDS_PER_PAGE - 1);
const SCROLL_AMOUNT = VISIBLE_WIDTH + CARD_GAP;

/* ── Badge service URL (configurable via env) ── */
const BADGE_SERVICE_URL = (import.meta as any).env?.VITE_BADGE_SERVICE_URL || 'http://localhost:3001';

function Home(): React.ReactElement {
  const { account, isConnected } = useWallet();
  const { getUserHabits, getHabit, getPool, contract } = useStreakBeastCore();
  const { notify, scheduleStreakReminder } = useNotifications();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalStaked, setTotalStaked] = useState('0.00');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [rewardPool, setRewardPool] = useState('0.00');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* ── Blockchain data fetch ── */
  const fetchHabits = useCallback(async () => {
    if (!account || !isConnected) {
      setHabits([]); setCurrentStreak(0); setTotalStaked('0.00'); setRewardPool('0.00'); return;
    }
    setLoading(true);
    try {
      const habitIds = await getUserHabits(account);
      if (habitIds.length === 0) { setHabits([]); setCurrentStreak(0); setTotalStaked('0.00'); setRewardPool('0.00'); return; }
      const fetched = await Promise.all(habitIds.map((id) => getHabit(id)));
      setHabits(fetched);
      setCurrentStreak(fetched.reduce((m, h) => Math.max(m, h.currentStreak), 0));
      setTotalStaked(fetched.filter((h) => h.active).reduce((s, h) => s + parseFloat(h.stakeAmount), 0).toFixed(2));

      // Schedule daily streak reminder based on latest active check-in
      const activeHabits = fetched.filter((h) => h.active);
      if (activeHabits.length > 0) {
        const latestCheckIn = Math.max(...activeHabits.map((h) => h.lastCheckIn));
        scheduleStreakReminder(latestCheckIn);
      }

      // Fetch reward pool total from active pools
      if (contract) {
        try {
          const nextPoolId = await (contract as any).nextPoolId();
          const maxId = Number(nextPoolId);
          let poolTotal = 0;
          for (let i = 1; i < maxId; i++) {
            try {
              const pool = await getPool(i);
              if (!pool.distributed) {
                poolTotal += parseFloat(pool.totalStaked);
              }
            } catch { /* pool may not exist */ }
          }
          setRewardPool(poolTotal.toFixed(2));
        } catch { setRewardPool('0.00'); }
      }
    } catch (e) { console.error('Failed to fetch habits:', e); setHabits([]); setCurrentStreak(0); setTotalStaked('0.00'); setRewardPool('0.00'); }
    finally { setLoading(false); }
  }, [account, isConnected, getUserHabits, getHabit, getPool, contract, scheduleStreakReminder]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  /* ── Auto-mint badge check (fire-and-forget) ── */
  const badgeCheckDone = useRef(false);
  useEffect(() => {
    if (!account || !isConnected || habits.length === 0 || badgeCheckDone.current) return;
    badgeCheckDone.current = true;
    const longestStreak = habits.reduce((m, h) => Math.max(m, h.longestStreak ?? h.currentStreak), 0);
    if (longestStreak < 1) return;

    fetch(`${BADGE_SERVICE_URL}/api/check-badges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAddress: account, longestStreak }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.minted?.length > 0) {
          console.log('[AutoMint] Minted badges:', data.minted);
          notify('Badge Minted!', `You earned ${data.minted.length} new NFT badge${data.minted.length > 1 ? 's' : ''}! Check Achievements to view.`);
        }
      })
      .catch((err) => console.warn('[AutoMint] Badge service unavailable:', err.message));
  }, [account, isConnected, habits, notify]);

  /* ── Scroll helpers ── */
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const t = setTimeout(checkScroll, 1200);
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => { clearTimeout(t); el.removeEventListener('scroll', checkScroll); };
  }, [checkScroll]);

  const scroll = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * SCROLL_AMOUNT, behavior: 'smooth' });
  };

  const isVerifiedToday = (lastCheckIn: number) => {
    if (lastCheckIn === 0) return false;
    return (Math.floor(Date.now() / 1000) - lastCheckIn) < 86400;
  };

  const hasActiveHabit = habits.some((h) => h.active);

  /* ── Live countdown to next check-in ── */
  const nextCheckInTarget = useMemo(() => {
    const activeHabits = habits.filter((h) => h.active);
    if (activeHabits.length === 0) return 0;
    const latestCheckIn = Math.max(...activeHabits.map((h) => h.lastCheckIn));
    return latestCheckIn === 0 ? 1 : latestCheckIn + 86400;
  }, [habits]);
  const { text: nextIn } = useCountdown(nextCheckInTarget);

  /* ── Compute integrity status: % of active habits verified today ── */
  const integrityPct = useMemo(() => {
    const activeHabits = habits.filter((h) => h.active);
    if (activeHabits.length === 0) return 'N/A';
    const verified = activeHabits.filter((h) => isVerifiedToday(h.lastCheckIn)).length;
    return `${Math.round((verified / activeHabits.length) * 100)}%`;
  }, [habits]);

  /* ── Build missions from real habits (no mock fallback) ── */
  const missions = habits.filter((h) => h.active).map((h) => {
    const meta = HABIT_META[h.habitType] ?? { icon: <HiStar size={24} />, theme: 'coral' as const };
    const verified = isVerifiedToday(h.lastCheckIn);
    return {
      theme: meta.theme,
      icon: meta.icon,
      title: HABIT_TYPE_NAMES[h.habitType] ?? 'Custom',
      streak: h.currentStreak,
      status: verified ? 'Done' : 'Active',
      statusColor: verified ? STATUS_DONE : STATUS_ACTIVE,
    };
  });

  const showArrows = missions.length > 3;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* MainCard with PetCanvas inside */}
      <div style={{ position: 'absolute', left: 90, top: 111, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MainCard streakCount={currentStreak} nextIn={nextIn}>
          {/* PetCanvas rendered inside MainCard */}
          <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, height: 250, pointerEvents: 'none' }}>
            <PetCanvas streakDays={currentStreak} isActive={hasActiveHabit} />
          </div>
        </MainCard>
      </div>

      {/* BNB at Risk */}
      <div style={{ position: 'absolute', left: 749, top: 101, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="red" title="BNB at Risk" value={totalStaked} delay={0.3} />
      </div>

      {/* Reward Pool */}
      <div style={{ position: 'absolute', left: 830, top: 304, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="orange" title="Reward Pool" value={`${rewardPool} BNB`} delay={0.5} />
      </div>

      {/* Integrity Status */}
      <div style={{ position: 'absolute', left: 771, top: 500, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
        <MetricCard theme="purple" title="Integrity Status" value={integrityPct} delay={0.7} />
      </div>

      {/* ── Daily Missions Section ── */}
      <div style={{ position: 'absolute', left: 97, top: 665, width: VISIBLE_WIDTH, transform: 'scale(0.9)', transformOrigin: 'top left', overflow: 'hidden' }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16, paddingRight: 8, animation: slideUp(0.8),
          }}
        >
          <h2 style={{ ...typography.heading3, margin: 0 }}>Daily Missions</h2>

          {showArrows && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: "'Inter'", fontWeight: 600, fontSize: 14, color: 'rgba(255,255,255,0.45)', marginRight: 4 }}>
                {missions.length} missions
              </span>
              {/* Chevron buttons */}
              {([-1, 1] as const).map((dir) => {
                const can = dir === -1 ? canScrollLeft : canScrollRight;
                return (
                  <button
                    key={dir}
                    onClick={() => scroll(dir)}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.12)',
                      background: can ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                      color: can ? '#fff' : 'rgba(255,255,255,0.2)',
                      cursor: can ? 'pointer' : 'default',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, transition: 'all 0.2s ease',
                      pointerEvents: can ? 'auto' : 'none',
                    }}
                  >
                    {dir === -1 ? '‹' : '›'}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable card strip */}
        <div
          ref={scrollRef}
          className="missions-scroll"
          style={{
            display: 'flex', gap: CARD_GAP,
            overflowX: 'scroll', scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth', paddingBottom: 12,
            msOverflowStyle: 'none', scrollbarWidth: 'none',
          }}
        >
          <style>{`.missions-scroll::-webkit-scrollbar { display: none; }`}</style>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: 40 }}>
              <span style={{ fontFamily: FONT_HEADING, fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Loading habits…</span>
            </div>
          ) : missions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: 40 }}>
              <span style={{ fontFamily: FONT_HEADING, fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>
                {isConnected ? 'No active habits. Stake to get started!' : 'Connect wallet to view habits'}
              </span>
            </div>
          ) : (
            missions.map((m, i) => (
              <div
                key={m.title}
                style={{
                  flex: `0 0 ${CARD_WIDTH}px`,
                  scrollSnapAlign: i % CARDS_PER_PAGE === 0 ? 'start' : 'none',
                  animation: `cardSlideUp 0.7s ${EASE_SPRING} ${0.9 + i * 0.1}s both`,
                }}
              >
                <ActivityCard
                  theme={m.theme}
                  icon={m.icon}
                  title={m.title}
                  streak={m.streak}
                  status={m.status}
                  statusColor={m.statusColor}
                  delay={0}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;