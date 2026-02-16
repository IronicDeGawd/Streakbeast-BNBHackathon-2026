/**
 * Leaderboard — Competitive ranking page.
 * Renders inside the scaled canvas (App.tsx handles PageShell, Sidebar, scaling).
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { RankCard, LeaderboardMainCard } from '../components/cards';
import { useStreakBeastCore, type LeaderboardEntry } from '../hooks/useStreakBeastCore';
import { useWallet } from '../contexts/WalletContext';
import { FONT_HEADING } from '../utils/tokens';

const HABIT_TYPE_NAMES: Record<number, string> = {
  0: 'Coding', 1: 'Exercise', 2: 'Reading',
  3: 'Meditation', 4: 'Language', 5: 'Custom',
};

function shortenAddr(addr: string): string {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '0x0000...0000';
}

export default function Leaderboard() {
  const { isConnected } = useWallet();
  const { contract, getPool, getLeaderboard } = useStreakBeastCore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [allEntries, setAllEntries] = useState<(LeaderboardEntry & { habitType?: string; earned?: string })[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    if (!contract) {
      setAllEntries([]);
      return;
    }
    setLoading(true);
    try {
      const nextPoolId = await (contract as any).nextPoolId();
      const maxId = Number(nextPoolId);
      const entries: (LeaderboardEntry & { habitType?: string; earned?: string })[] = [];
      const seenAddresses = new Map<string, number>();

      for (let poolId = 1; poolId < maxId; poolId++) {
        try {
          const pool = await getPool(poolId);
          const poolEntries = await getLeaderboard(poolId);
          const habitTypeName = HABIT_TYPE_NAMES[pool.habitType] ?? 'Custom';

          for (const entry of poolEntries) {
            const existing = seenAddresses.get(entry.address);
            if (existing !== undefined) {
              // Keep highest streak
              if (entry.streak > allEntries[existing]?.streak) {
                entries[existing] = {
                  ...entry,
                  habitType: habitTypeName,
                  earned: `${(parseFloat(pool.totalStaked) / Math.max(pool.totalSuccessfulStreaks, 1) * (entry.streak > 0 ? 1 : 0)).toFixed(2)} BNB`,
                };
              }
            } else {
              seenAddresses.set(entry.address, entries.length);
              entries.push({
                ...entry,
                habitType: habitTypeName,
                earned: `${(parseFloat(pool.totalStaked) / Math.max(pool.totalSuccessfulStreaks, 1) * (entry.streak > 0 ? 1 : 0)).toFixed(2)} BNB`,
              });
            }
          }
        } catch { /* pool may not exist */ }
      }

      // Sort by streak descending
      entries.sort((a, b) => b.streak - a.streak);
      setAllEntries(entries);
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
      setAllEntries([]);
    } finally {
      setLoading(false);
    }
  }, [contract, getPool, getLeaderboard]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const filtered = useMemo(() => {
    if (activeFilter === 'All') return allEntries;
    return allEntries.filter((e) => e.habitType === activeFilter);
  }, [activeFilter, allEntries]);

  const top3 = filtered.slice(0, 3);
  const remaining = filtered.slice(3).map((entry, idx) => ({
    ...entry,
    rank: idx + 4,
    address: shortenAddr(entry.address),
  }));

  if (loading) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: FONT_HEADING, fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>Loading leaderboard…</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: FONT_HEADING, fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>Connect wallet to view leaderboard</span>
      </div>
    );
  }

  if (allEntries.length === 0 && !loading) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: FONT_HEADING, fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>No participants yet. Be the first to stake!</span>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* Rank 2 — Purple, left */}
      {top3[1] && (
        <div style={{ position: 'absolute', left: 34, top: 100, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
          <RankCard rank={2} address={shortenAddr(top3[1].address)} earned={top3[1].earned ?? '0 BNB'} delay={0.3} />
        </div>
      )
      }

      {/* Rank 1 — Orange, center */}
      {
        top3[0] && (
          <div style={{ position: 'absolute', left: 436, top: -34, zIndex: 2, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
            <RankCard rank={1} address={shortenAddr(top3[0].address)} earned={top3[0].earned ?? '0 BNB'} delay={0.2} />
          </div>
        )
      }

      {/* Rank 3 — Red, right */}
      {
        top3[2] && (
          <div style={{ position: 'absolute', left: 781, top: 105, transform: 'scale(0.9)', transformOrigin: 'top left' }}>
            <RankCard rank={3} address={shortenAddr(top3[2].address)} earned={top3[2].earned ?? '0 BNB'} delay={0.4} />
          </div>
        )
      }

      {/* Main Leaderboard Card */}
      <div
        style={{
          position: 'absolute',
          left: 150,
          top: 350,
          width: 1161,
          height: 590,
          transform: 'scale(0.8)',
          transformOrigin: 'top left',
        }}
      >
        <LeaderboardMainCard
          delay={0.5}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          rankData={remaining}
        />
      </div>
    </div >
  );
}
