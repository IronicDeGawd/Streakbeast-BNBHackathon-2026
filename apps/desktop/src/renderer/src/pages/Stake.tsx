import React from 'react';
import Card from '../components/ui/Card';

/**
 * Stake & Commit page component
 * 
 * This page allows users to commit BNB to their habits.
 * Users can choose a habit type, set their stake amount, and start their streak.
 */
function Stake(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        Stake & Commit
      </h1>
      
      <Card>
        <p className="text-white/70">
          Commit BNB to your habits. Choose a habit type, set your stake, and start your streak.
        </p>
      </Card>
    </div>
  );
}

export default Stake;