import React from 'react';

/**
 * Main application component for StreakBeast
 */
function App(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-display font-bold text-purple-500 mb-4">
          StreakBeast
        </h1>
        <p className="text-xl font-body text-gray-300">
          Your AI-powered Web3 companion
        </p>
      </div>
    </div>
  );
}

export default App;