import React from 'react';
import Card from '../components/ui/Card';

/**
 * Achievements page component
 * 
 * Displays the user's NFT badge collection earned by hitting streak milestones.
 * Future implementation will show actual achievement badges and progress.
 */
function Achievements(): React.ReactElement {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        Achievements
      </h1>
      
      <Card>
        <p className="text-white/70">
          Your NFT badge collection. Earn badges by hitting streak milestones.
        </p>
      </Card>
    </div>
  );
}

export default Achievements;