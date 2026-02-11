import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { cardReveal } from '../animations/cardReveal';

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
 * Mock leaderboard data
 */
const mockLeaderboardData: LeaderboardEntry[] = [
  { rank: 1, address: '0x1234...5678', streak: 45, earned: '2.5 BNB', habitType: 'Coding' },
  { rank: 2, address: '0xABCD...EFGH', streak: 38, earned: '1.8 BNB', habitType: 'Exercise' },
  { rank: 3, address: '0x9876...5432', streak: 30, earned: '1.2 BNB', habitType: 'Reading' },
  { rank: 4, address: '0xFEDC...BA98', streak: 25, earned: '0.9 BNB', habitType: 'Meditation' },
  { rank: 5, address: '0x1111...2222', streak: 22, earned: '0.7 BNB', habitType: 'Coding' },
  { rank: 6, address: '0x3333...4444', streak: 18, earned: '0.5 BNB', habitType: 'Language' },
  { rank: 7, address: '0x5555...6666', streak: 15, earned: '0.4 BNB', habitType: 'Exercise' },
  { rank: 8, address: '0x7777...8888', streak: 12, earned: '0.3 BNB', habitType: 'Reading' },
  { rank: 9, address: '0x9999...AAAA', streak: 8, earned: '0.2 BNB', habitType: 'Coding' },
  { rank: 10, address: '0xBBBB...CCCC', streak: 5, earned: '0.1 BNB', habitType: 'Custom' }
];

/**
 * Filter tabs for habit types
 */
const filterTabs = ['All', 'Coding', 'Exercise', 'Reading', 'Meditation', 'Language'];

/**
 * Leaderboard page component
 * 
 * Displays the competitive leaderboard showing rankings of users based on their habit streaks.
 * Features a podium display for top 3 performers and a scrollable list for remaining ranks.
 * Includes filtering by habit type and card reveal animations.
 */
function Leaderboard(): React.ReactElement {
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Filter leaderboard data based on active filter
  const filteredData = activeFilter === 'All' 
    ? mockLeaderboardData 
    : mockLeaderboardData.filter(entry => entry.habitType === activeFilter);

  // Get top 3 and remaining entries
  const top3 = filteredData.slice(0, 3);
  const remaining = filteredData.slice(3);

  // Animate rank cards on mount and filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      cardReveal('.rank-list > div');
    }, 100);
    return () => clearTimeout(timer);
  }, [activeFilter]);

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

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="flex items-end justify-center gap-4 mb-8 h-[200px]">
          {/* 2nd Place */}
          <Card className="w-40 text-center h-36 bg-gradient-to-t from-white/5 to-white/10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-400 text-black font-bold flex items-center justify-center mx-auto text-sm">
                2
              </div>
              <p className="text-white/60 text-sm">{top3[1]!.address}</p>
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
              <p className="text-white/60 text-sm">{top3[0]!.address}</p>
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
              <p className="text-white/60 text-sm">{top3[2]!.address}</p>
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
            <Card key={entry.rank} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <span className="w-8 text-center font-display font-bold text-white/60">
                  #{entry.rank}
                </span>
                <span className="text-white font-medium">{entry.address}</span>
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
    </div>
  );
}

export default Leaderboard;