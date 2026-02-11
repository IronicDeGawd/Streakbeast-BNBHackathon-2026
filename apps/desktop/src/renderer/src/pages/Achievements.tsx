import React, { useEffect, useState, useCallback } from 'react';
import Card from '../components/ui/Card';
import { cardReveal } from '../animations/cardReveal';
import { useStreakBadge, BADGE_THRESHOLDS, BADGE_NAMES } from '../hooks/useStreakBadge';
import { useStreakBeastCore, Habit } from '../hooks/useStreakBeastCore';
import { useWallet } from '../contexts/WalletContext';
import { CHAIN_CONFIG } from '../contracts/addresses';

/**
 * Badge display data
 */
interface BadgeDisplay {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress: number;
  txHash: string | null;
}

const BADGE_ICONS = ['🔥', '⚔️', '👑', '💎', '🛡️'];
const BADGE_DESCRIPTIONS = [
  'Complete your first day',
  'Maintain a 7-day streak',
  'Maintain a 30-day streak',
  'Maintain a 100-day streak',
  'Maintain a 365-day streak',
];

/**
 * Achievements page component
 *
 * Displays the user's NFT badge collection earned by hitting streak milestones.
 * Shows earned badges with transaction hashes and locked badges with progress.
 */
function Achievements(): React.ReactElement {
  const { account, isConnected, chainId } = useWallet();
  const { hasBadge } = useStreakBadge();
  const { getUserHabits, getHabit } = useStreakBeastCore();

  const [badges, setBadges] = useState<BadgeDisplay[]>([]);
  const [totalStreakDays, setTotalStreakDays] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAchievements = useCallback(async () => {
    if (!account || !isConnected) {
      // Default badges (all locked, 0 progress)
      setBadges(BADGE_NAMES.map((name, i) => ({
        id: i,
        name,
        description: BADGE_DESCRIPTIONS[i] ?? '',
        icon: BADGE_ICONS[i] ?? '⭐',
        earned: false,
        progress: 0,
        txHash: null,
      })));
      setTotalStreakDays(0);
      setLongestStreak(0);
      return;
    }

    setLoading(true);
    try {
      // Fetch user habits for streak data
      let maxStreak = 0;
      let totalDays = 0;

      try {
        const habitIds = await getUserHabits(account);
        const habits: Habit[] = await Promise.all(habitIds.map((id) => getHabit(id)));
        maxStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);
        totalDays = habits.reduce((sum, h) => sum + h.currentStreak, 0);
      } catch {
        // Contract may not be available
      }

      setLongestStreak(maxStreak);
      setTotalStreakDays(totalDays);

      // Check which badges are earned on-chain
      const badgeResults: BadgeDisplay[] = [];
      for (let i = 0; i < BADGE_NAMES.length; i++) {
        let earned = false;
        try {
          earned = await hasBadge(i, account);
        } catch {
          // Contract may not be available
        }

        const threshold = BADGE_THRESHOLDS[i] ?? 1;
        const progress = earned ? 100 : Math.min(100, Math.floor((maxStreak / threshold) * 100));

        badgeResults.push({
          id: i,
          name: BADGE_NAMES[i] ?? '',
          description: BADGE_DESCRIPTIONS[i] ?? '',
          icon: BADGE_ICONS[i] ?? '⭐',
          earned,
          progress,
          txHash: null, // Would need event indexing for actual tx hashes
        });
      }

      setBadges(badgeResults);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [account, isConnected, hasBadge, getUserHabits, getHabit]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const earnedCount = badges.filter(b => b.earned).length;
  const totalBadges = badges.length;

  const explorerUrl = chainId ? CHAIN_CONFIG[chainId]?.explorer : null;

  useEffect(() => {
    if (badges.length > 0 && !loading) {
      setTimeout(() => {
        cardReveal('.badge-grid > div');
      }, 100);
    }
  }, [badges, loading]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        Achievements
      </h1>

      {/* Stats summary row */}
      <div className="flex gap-4 mb-6">
        <Card className="flex-1">
          <div className="text-center">
            <div className="text-sm text-white/60 mb-2">Badges Earned</div>
            <div className="text-3xl font-display font-bold text-accent">
              {earnedCount} / {totalBadges}
            </div>
          </div>
        </Card>
        <Card className="flex-1">
          <div className="text-center">
            <div className="text-sm text-white/60 mb-2">Total Streak Days</div>
            <div className="text-3xl font-display font-bold text-white">{totalStreakDays}</div>
          </div>
        </Card>
        <Card className="flex-1">
          <div className="text-center">
            <div className="text-sm text-white/60 mb-2">Longest Streak</div>
            <div className="text-3xl font-display font-bold text-green-400">{longestStreak} days</div>
          </div>
        </Card>
      </div>

      {/* Badge grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 badge-grid">
          {badges.map((badge) => (
            <Card key={badge.id}>
              <div className="space-y-3">
                {/* Icon */}
                <div className="text-center">
                  {badge.earned ? (
                    <div
                      className="text-4xl inline-block"
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(108,60,225,0.5))'
                      }}
                    >
                      {badge.icon}
                    </div>
                  ) : (
                    <div className="text-4xl inline-block grayscale opacity-40">
                      {badge.icon}
                    </div>
                  )}
                </div>

                {/* Name and description */}
                <div className="text-center">
                  <h3
                    className={`text-lg font-display font-bold ${
                      badge.earned ? 'text-white' : 'text-white/40'
                    }`}
                  >
                    {badge.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      badge.earned ? 'text-white/60' : 'text-white/30'
                    }`}
                  >
                    {badge.description}
                  </p>
                </div>

                {/* Earned badge */}
                {badge.earned && (
                  <div className="flex justify-center">
                    <span className="inline-flex items-center gap-1 bg-green-400/20 text-green-400 text-xs rounded-full px-2 py-0.5">
                      <span>✓</span>
                      <span>Earned</span>
                    </span>
                  </div>
                )}

                {/* Transaction hash */}
                {badge.earned && badge.txHash && explorerUrl && (
                  <div className="text-center">
                    <a
                      href={`${explorerUrl}/tx/${badge.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent/60 hover:text-accent cursor-pointer transition-colors"
                    >
                      Tx: {badge.txHash}
                    </a>
                  </div>
                )}

                {/* Progress bar for locked badges */}
                {!badge.earned && (
                  <div className="space-y-2">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/40">
                        {badge.progress}% complete
                      </span>
                      <span className="text-white/20">🔒</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Achievements;
