import React from 'react';
import Card from '../components/ui/Card';

/**
 * Home page component
 * 
 * Main dashboard view for StreakBeast where users can track their habits,
 * view their pet, and monitor overall progress.
 */
function Home(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        Dashboard
      </h1>
      <Card>
        <p className="text-white/70">
          Your habit dashboard will appear here. Track streaks, view your pet, and monitor progress.
        </p>
      </Card>
    </div>
  );
}

export default Home;