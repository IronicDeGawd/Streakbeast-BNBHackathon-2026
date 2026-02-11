import React from 'react';
import Card from '../components/ui/Card';

/**
 * Leaderboard page component
 * 
 * Displays the competitive leaderboard showing rankings of users based on their habit streaks.
 * Top performers earn the biggest rewards.
 */
function Leaderboard(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        Leaderboard
      </h1>
      <Card>
        <p className="text-white/70">
          See how you rank against other habit builders. Top performers earn the biggest rewards.
        </p>
      </Card>
    </div>
  );
}

export default Leaderboard;