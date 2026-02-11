import React, { useEffect, useRef, useState } from 'react';
import Card from '../components/ui/Card';
import PetCanvas from '../components/PetCanvas';
import { cardReveal } from '../animations/cardReveal';

/**
 * Home page component
 * 
 * Main dashboard view for StreakBeast where users can track their habits,
 * view their pet, and monitor overall progress.
 */
function Home(): React.ReactElement {
  const [currentStreak] = useState(7);
  const streakRef = useRef<HTMLDivElement>(null);
  const habitsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate habit cards on mount
    cardReveal('.habit-card');
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        Dashboard
      </h1>

      {/* Main grid layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left column - Pet Canvas */}
        <div className="col-span-2">
          <Card className="h-[400px] p-0 overflow-hidden">
            <PetCanvas streakDays={currentStreak} isActive={true} />
          </Card>
        </div>

        {/* Right column - Info cards */}
        <div className="col-span-1 space-y-4">
          {/* Streak counter card */}
          <Card>
            <div className="text-center">
              <div className="text-sm text-white/60 mb-2">Current Streak</div>
              <div ref={streakRef} className="text-5xl font-display font-bold text-accent mb-1">
                {currentStreak}
              </div>
              <div className="text-sm text-white/60">days</div>
            </div>
          </Card>

          {/* Staked amount card */}
          <Card>
            <div className="text-center">
              <div className="text-sm text-white/60 mb-2">Total Staked</div>
              <div className="text-2xl font-display font-bold text-white">0.5 BNB</div>
            </div>
          </Card>

          {/* Rewards card */}
          <Card>
            <div className="text-center">
              <div className="text-sm text-white/60 mb-2">Rewards Earned</div>
              <div className="text-2xl font-display font-bold text-white">0.00 BNB</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Today's Habits section */}
      <div>
        <h2 className="text-lg font-display font-semibold text-white mb-4">
          Today's Habits
        </h2>
        
        <div ref={habitsContainerRef} className="grid grid-cols-3 gap-4">
          {/* Coding habit */}
          <Card hover={true} className="habit-card">
            <div className="space-y-2">
              <div className="font-medium text-white">Coding</div>
              <div className="text-sm text-white/60">7 days</div>
              <div className="text-sm text-green-400">Verified today</div>
            </div>
          </Card>

          {/* Exercise habit */}
          <Card hover={true} className="habit-card">
            <div className="space-y-2">
              <div className="font-medium text-white">Exercise</div>
              <div className="text-sm text-white/60">3 days</div>
              <div className="text-sm text-yellow-400">Pending verification</div>
            </div>
          </Card>

          {/* Reading habit */}
          <Card hover={true} className="habit-card">
            <div className="space-y-2">
              <div className="font-medium text-white">Reading</div>
              <div className="text-sm text-white/60">12 days</div>
              <div className="text-sm text-green-400">Verified today</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Home;