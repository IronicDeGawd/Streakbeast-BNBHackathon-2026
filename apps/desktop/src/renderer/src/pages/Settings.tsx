import React from 'react';
import Card from '../components/ui/Card';

/**
 * Settings page component
 * 
 * Displays user settings including wallet management, linked accounts, and preferences.
 */
function Settings(): React.ReactElement {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        Settings
      </h1>
      
      <Card>
        <p className="text-white/70">
          Manage your wallet, linked accounts, and preferences.
        </p>
      </Card>
    </div>
  );
}

export default Settings;