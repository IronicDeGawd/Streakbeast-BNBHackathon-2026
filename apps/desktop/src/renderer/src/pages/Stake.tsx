import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useStreakBeastCore } from '../hooks/useStreakBeastCore';
import { useWallet } from '../contexts/WalletContext';

/**
 * Habit types configuration
 */
const HABIT_TYPES = [
  { id: 0, name: 'Coding', icon: '</>' },
  { id: 1, name: 'Exercise', icon: '🏃' },
  { id: 2, name: 'Reading', icon: '📚' },
  { id: 3, name: 'Meditation', icon: '🧘' },
  { id: 4, name: 'Language', icon: '🗣' },
  { id: 5, name: 'Custom', icon: '⭐' }
];

/**
 * Duration options in days
 */
const DURATION_OPTIONS = [7, 14, 30, 60, 90];

/**
 * Stake & Commit page component
 * 
 * This page allows users to commit BNB to their habits.
 * Users can choose a habit type, set their stake amount, and start their streak.
 */
function Stake(): React.ReactElement {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { stake } = useStreakBeastCore();

  const [selectedHabit, setSelectedHabit] = useState<number | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('0.01');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle stake button click — calls StreakBeastCore.stake()
   */
  const handleStake = async (): Promise<void> => {
    if (selectedHabit === null || !isConnected) return;

    setIsStaking(true);
    setError(null);
    try {
      await stake(selectedHabit, selectedDuration, stakeAmount);
      navigate('/');
    } catch (err) {
      console.error('Stake failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        Stake & Commit
      </h1>

      {/* Step 1 - Choose Habit */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-semibold text-white mb-4">
          Choose Your Habit
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {HABIT_TYPES.map((habit) => (
            <Card
              key={habit.id}
              hover={true}
              onClick={() => setSelectedHabit(habit.id)}
              className={`text-center ${
                selectedHabit === habit.id
                  ? 'border-accent/50 bg-accent/10'
                  : ''
              }`}
            >
              <div className="text-2xl mb-2">{habit.icon}</div>
              <div className="text-sm text-white/80">{habit.name}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Step 2 - Stake Amount */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-semibold text-white mb-4">
          Stake Amount
        </h2>
        <Card>
          <div className="text-center mb-4">
            <span className="text-3xl font-display font-bold text-accent">
              {stakeAmount}
            </span>
            <span className="text-lg text-white/60"> BNB</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="1"
            step="0.001"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none accent-[#6C3CE1]"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-white/40">0.001 BNB</span>
            <span className="text-xs text-white/40">1.0 BNB</span>
          </div>
        </Card>
      </div>

      {/* Step 3 - Duration */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-semibold text-white mb-4">
          Commitment Duration
        </h2>
        <div className="flex gap-2">
          {DURATION_OPTIONS.map((duration) => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedDuration === duration
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {duration} days
            </button>
          ))}
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-white/60">Habit:</span>
              <span className="text-white font-medium">
                {selectedHabit !== null
                  ? HABIT_TYPES.find((h) => h.id === selectedHabit)?.name
                  : 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Stake:</span>
              <span className="text-white font-medium">{stakeAmount} BNB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Duration:</span>
              <span className="text-white font-medium">{selectedDuration} days</span>
            </div>
          </div>
          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={selectedHabit === null || isStaking || !isConnected}
            loading={isStaking}
            onClick={handleStake}
          >
            {!isConnected ? 'Connect Wallet First' : 'Stake & Commit'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Stake;