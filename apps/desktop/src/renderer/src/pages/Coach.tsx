import React from 'react';
import Card from '../components/ui/Card';

/**
 * Coach page component
 * 
 * Displays the AI coach interface where users can chat with their AI coach
 * for motivation, tips, and habit-building insights.
 */
function Coach(): React.ReactElement {
  return (
    <div className="container space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        AI Coach
      </h1>
      <Card>
        <p className="text-white/70">
          Chat with your AI coach for motivation, tips, and habit insights.
        </p>
      </Card>
    </div>
  );
}

export default Coach;