import React, { useEffect } from 'react';
import Card from '../components/ui/Card';
import { cardReveal } from '../animations/cardReveal';

/**
 * Badge data interface
 */
interface Badge {
  id: number;
  name: string;
  description: string;
  requirement: string;
  icon: string;
  earned: boolean;
  progress: number;
  txHash: string | null;
}

/**
 * Achievements page component
 * 
 * Displays the user's NFT badge collection earned by hitting streak milestones.
 * Shows earned badges with transaction hashes and locked badges with progress.
 */
function Achievements(): React.ReactElement {
  const badges: Badge[] = [
    {
      id: 0,
      name: 'First Flame',
      description: 'Complete your first day',
      requirement: '1 day streak',
      icon: '🔥',
      earned: true,
      progress: 100,
      txHash: '0xabc...123'
    },
    {
      id: 1,
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      requirement: '7 day streak',
      icon: '⚔️',
      earned: true,
      progress: 100,
      txHash: '0xdef...456'
    },
    {
      id: 2,
      name: 'Monthly Master',
      description: 'Maintain a 30-day streak',
      requirement: '30 day streak',
      icon: '👑',
      earned: false,
      progress: 23,
      txHash: null
    },
    {
      id: 3,
      name: 'Century Club',
      description: 'Maintain a 100-day streak',
      requirement: '100 day streak',
      icon: '💎',
      earned: false,
      progress: 7,
      txHash: null
    },
    {
      id: 4,
      name: 'Iron Will',
      description: 'Maintain a 365-day streak',
      requirement: '365 day streak',
      icon: '🛡️',
      earned: false,
      progress: 2,
      txHash: null
    }
  ];

  const earnedCount = badges.filter(b => b.earned).length;
  const totalBadges = badges.length;

  useEffect(() => {
    cardReveal('.badge-grid > div');
  }, []);

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
            <div className="text-3xl font-display font-bold text-white">7</div>
          </div>
        </Card>
        <Card className="flex-1">
          <div className="text-center">
            <div className="text-sm text-white/60 mb-2">Longest Streak</div>
            <div className="text-3xl font-display font-bold text-green-400">7 days</div>
          </div>
        </Card>
      </div>

      {/* Badge grid */}
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
              {badge.earned && badge.txHash && (
                <div className="text-center">
                  <a
                    href="#"
                    className="text-xs text-accent/60 hover:text-accent cursor-pointer transition-colors"
                    onClick={(e) => e.preventDefault()}
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
    </div>
  );
}

export default Achievements;