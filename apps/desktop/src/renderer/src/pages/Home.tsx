import React, { useEffect, useRef, useState, useCallback } from 'react';
import Card from '../components/ui/Card';
import PetCanvas from '../components/PetCanvas';
import { cardReveal } from '../animations/cardReveal';
import { useStreakBeastCore, Habit } from '../hooks/useStreakBeastCore';
import { useWallet } from '../contexts/WalletContext';

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
 * Home page component
 * 
 * Main dashboard view for StreakBeast where users can track their habits,
 * view their pet, and monitor overall progress.
 */
function Home(): React.ReactElement {
  const { account, isConnected } = useWallet();
  const { getUserHabits, getHabit } = useStreakBeastCore();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalStaked, setTotalStaked] = useState<string>('0.00');
  const [totalRewards] = useState<string>('0.00'); // Keep as 0.00 for now
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  
  const streakRef = useRef<HTMLDivElement>(null);
  const habitsContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Fetch user habits from blockchain
   */
  const fetchHabits = useCallback(async () => {
    if (!account || !isConnected) {
      setHabits([]);
      setCurrentStreak(0);
      setTotalStaked('0.00');
      return;
    }

    setLoading(true);
    try {
      // Get user's habit IDs
      const habitIds = await getUserHabits(account);
      
      if (habitIds.length === 0) {
        setHabits([]);
        setCurrentStreak(0);
        setTotalStaked('0.00');
        return;
      }

      // Fetch details for each habit
      const habitPromises = habitIds.map((id) => getHabit(id));
      const fetchedHabits = await Promise.all(habitPromises);
      
      setHabits(fetchedHabits);

      // Calculate max streak across all habits
      const maxStreak = fetchedHabits.reduce((max, habit) => {
        return Math.max(max, habit.currentStreak);
      }, 0);
      setCurrentStreak(maxStreak);

      // Calculate total staked (sum of active habits only)
      const totalStake = fetchedHabits
        .filter((habit) => habit.active)
        .reduce((sum, habit) => {
          return sum + parseFloat(habit.stakeAmount);
        }, 0);
      setTotalStaked(totalStake.toFixed(2));
    } catch (error) {
      console.error('Failed to fetch habits:', error);
      setHabits([]);
      setCurrentStreak(0);
      setTotalStaked('0.00');
    } finally {
      setLoading(false);
    }
  }, [account, isConnected, getUserHabits, getHabit]);

  /**
   * Fetch habits on mount and when wallet connection changes
   */
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  /**
   * Animate habit cards after habits are loaded
   */
  useEffect(() => {
    if (habits.length > 0 && !loading) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        cardReveal('.habit-card');
      }, 100);
    }
  }, [habits, loading]);

  /**
   * Check if a habit was verified today
   */
  const isVerifiedToday = (lastCheckIn: number): boolean => {
    if (lastCheckIn === 0) return false;
    const now = Math.floor(Date.now() / 1000);
    const timeSinceCheckIn = now - lastCheckIn;
    return timeSinceCheckIn < 86400; // 24 hours in seconds
  };

  /**
   * Determine if any habit is active (for pet animation)
   */
  const hasActiveHabit = habits.some((habit) => habit.active);

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
            <PetCanvas streakDays={currentStreak} isActive={hasActiveHabit} />
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
              <div className="text-2xl font-display font-bold text-white">
                {totalStaked} BNB
              </div>
            </div>
          </Card>

          {/* Rewards card */}
          <Card>
            <div className="text-center">
              <div className="text-sm text-white/60 mb-2">Rewards Earned</div>
              <div className="text-2xl font-display font-bold text-white">
                {totalRewards} BNB
              </div>
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
          {loading ? (
            // Loading state
            <div className="col-span-3 flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : !isConnected ? (
            // Not connected state
            <div className="col-span-3 text-center py-12">
              <div className="text-white/60">Connect wallet to view habits</div>
            </div>
          ) : habits.length === 0 ? (
            // Empty state
            <div className="col-span-3 text-center py-12">
              <div className="text-white/60">No active habits</div>
            </div>
          ) : (
            // Render habit cards
            habits.map((habit, index) => {
              const habitName = HABIT_TYPE_NAMES[habit.habitType] || 'Custom';
              const verified = isVerifiedToday(habit.lastCheckIn);
              const verificationText = verified ? 'Verified today' : 'Pending verification';
              const verificationColor = verified ? 'text-green-400' : 'text-yellow-400';

              return (
                <Card key={index} hover={true} className="habit-card">
                  <div className="space-y-2">
                    <div className="font-medium text-white">{habitName}</div>
                    <div className="text-sm text-white/60">
                      {habit.currentStreak} {habit.currentStreak === 1 ? 'day' : 'days'}
                    </div>
                    <div className={`text-sm ${verificationColor}`}>
                      {verificationText}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;