import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/ui/Card';
import { cardReveal } from '../animations/cardReveal';
import { useStreakBeastCore, Habit } from '../hooks/useStreakBeastCore';
import { useWallet } from '../contexts/WalletContext';

/**
 * Leaderboard entry type
 */
interface LeaderboardEntry {
  rank: number;
  address: string;
  streak: number;
  earned: string;
  habitType: string;
}

/**
 * Habit type names mapping
 */
const HABIT_TYPE_NAMES: Record<number, string> = {
  0: 'Coding',
  1: 'Exercise',
  2: 'Reading',
  3: 'Meditation',
  4: 'Language',
  5: 'Custom',
};

/**
 * Filter tabs for habit types
 */
const filterTabs = ['All', 'Coding', 'Exercise', 'Reading', 'Meditation', 'Language'];

/**
 * Format address as 0x1234...5678
 */
function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Leaderboard page component
 *
 * Displays the competitive leaderboard showing rankings of users based on their habit streaks.
 * Features a podium display for top 3 performers and a scrollable list for remaining ranks.
 * Includes filtering by habit type and card reveal animations.
 */
function Leaderboard(): React.ReactElement {
  const { isConnected } = useWallet();
  const { contract, getPool, getHabit } = useStreakBeastCore();

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Fetch leaderboard data from all pools on-chain
   */
  const fetchLeaderboard = useCallback(async () => {
    if (!contract) {
      setEntries([]);
      return;
    }

    setLoading(true);
    try {
      // Get total number of pools
      const nextPool = await contract.nextPoolId();
      const totalPools = Number(nextPool);

      // Aggregate user streaks across all pools
      const userStreaks: Map<string, { streak: number; habitType: number; stakeAmount: string }> = new Map();

      for (let poolId = 1; poolId < totalPools; poolId++) {
        try {
          const pool = await getPool(poolId);

          // Get habits in this pool via participants
          for (const participant of pool.participants) {
            try {
              const habitIds = await contract.getUserHabits(participant);
              for (const habitId of habitIds) {
                try {
                  const habit: Habit = {
                    user: '',
                    habitType: 0,
                    stakeAmount: '0',
                    startTime: 0,
                    duration: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    lastCheckIn: 0,
                    active: false,
                    claimed: false,
                  };

                  const raw = await getHabit(Number(habitId));
                  Object.assign(habit, raw);

                  const key = `${participant}-${habit.habitType}`;
                  const existing = userStreaks.get(key);

                  if (!existing || habit.currentStreak > existing.streak) {
                    userStreaks.set(key, {
                      streak: habit.currentStreak,
                      habitType: habit.habitType,
                      stakeAmount: habit.stakeAmount,
                    });
                  }
                } catch {
                  // Skip individual habit errors
                }
              }
            } catch {
              // Skip participant errors
            }
          }
        } catch {
          // Skip pool errors
        }
      }

      // Convert map to sorted leaderboard
      const allEntries: LeaderboardEntry[] = [];
      userStreaks.forEach((value, key) => {
        const address = key.split('-')[0] ?? '';
        allEntries.push({
          rank: 0,
          address,
          streak: value.streak,
          earned: `${value.stakeAmount} BNB`,
          habitType: HABIT_TYPE_NAMES[value.habitType] ?? 'Custom',
        });
      });

      // Sort by streak descending
      allEntries.sort((a, b) => b.streak - a.streak);

      // Assign ranks
      allEntries.forEach((entry, i) => {
        entry.rank = i + 1;
      });

      setEntries(allEntries);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [contract, getPool, getHabit]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  // Filter leaderboard data based on active filter
  const filteredData = activeFilter === 'All'
    ? entries
    : entries.filter(entry => entry.habitType === activeFilter);

  // Re-rank filtered data
  const rankedData = filteredData.map((entry, i) => ({ ...entry, rank: i + 1 }));

  // Get top 3 and remaining entries
  const top3 = rankedData.slice(0, 3);
  const remaining = rankedData.slice(3);

  // Animate rank cards on mount and filter change
  useEffect(() => {
    if (!loading && rankedData.length > 0) {
      const timer = setTimeout(() => {
        cardReveal('.rank-list > div');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeFilter, loading, rankedData.length]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        Leaderboard
      </h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {filterTabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeFilter === tab
                ? 'bg-accent text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : !isConnected ? (
        <div className="text-center py-12">
          <div className="text-white/60">Connect wallet to view leaderboard</div>
        </div>
      ) : rankedData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-white/60">No leaderboard data yet</div>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {top3.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-8 h-[200px]">
              {/* 2nd Place */}
              <Card className="w-40 text-center h-36 bg-gradient-to-t from-white/5 to-white/10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-400 text-black font-bold flex items-center justify-center mx-auto text-sm">
                    2
                  </div>
                  <p className="text-white/60 text-sm">{formatAddress(top3[1]!.address)}</p>
                  <p className="text-xl font-display font-bold text-white">{top3[1]!.streak} days</p>
                  <p className="text-white/60 text-xs">{top3[1]!.earned}</p>
                </div>
              </Card>

              {/* 1st Place */}
              <Card className="w-40 text-center h-48 bg-gradient-to-t from-white/5 to-white/10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center mx-auto text-sm">
                    1
                  </div>
                  <p className="text-white/60 text-sm">{formatAddress(top3[0]!.address)}</p>
                  <p className="text-2xl font-display font-bold text-white">{top3[0]!.streak} days</p>
                  <p className="text-white/60 text-sm">{top3[0]!.earned}</p>
                </div>
              </Card>

              {/* 3rd Place */}
              <Card className="w-40 text-center h-28 bg-gradient-to-t from-white/5 to-white/10">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-black font-bold flex items-center justify-center mx-auto text-sm">
                    3
                  </div>
                  <p className="text-white/60 text-sm">{formatAddress(top3[2]!.address)}</p>
                  <p className="text-lg font-display font-bold text-white">{top3[2]!.streak} days</p>
                  <p className="text-white/60 text-xs">{top3[2]!.earned}</p>
                </div>
              </Card>
            </div>
          )}

          {/* Remaining Ranks */}
          {remaining.length > 0 && (
            <div className="space-y-2 rank-list">
              {remaining.map(entry => (
                <Card key={`${entry.address}-${entry.rank}`} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-display font-bold text-white/60">
                      #{entry.rank}
                    </span>
                    <span className="text-white font-medium">{formatAddress(entry.address)}</span>
                    <span className="text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/60">
                      {entry.habitType}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-display font-bold text-accent">
                      {entry.streak} days
                    </span>
                    <span className="text-white/60 text-sm">{entry.earned}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Leaderboard;
