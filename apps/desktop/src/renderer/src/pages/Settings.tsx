import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

/**
 * Settings page component
 * 
 * Displays user settings including wallet management, linked accounts, 
 * OpenClaw agent status, and user preferences.
 */
function Settings(): React.ReactElement {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-6">
        Settings
      </h1>
      
      {/* Wallet Section */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-white mb-4">
          Wallet
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Connected Address</span>
            <span className="text-white font-mono text-sm">0x1234...5678</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Network</span>
            <span className="text-white text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full inline-block"></div>
              opBNB Testnet
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Balance</span>
            <span className="text-white text-sm">1.25 BNB</span>
          </div>
          <div className="pt-2">
            <Button variant="secondary" size="sm">
              Disconnect Wallet
            </Button>
          </div>
        </div>
      </Card>

      {/* Linked Accounts Section */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-white mb-4">
          Linked Accounts
        </h2>
        <div>
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏃</span>
              <div>
                <div className="text-white text-sm font-medium">Strava</div>
                <div className="text-white/40 text-xs">Not connected</div>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Connect
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💙</span>
              <div>
                <div className="text-white text-sm font-medium">GitHub</div>
                <div className="text-green-400 text-xs">Connected as @ironicdegawd</div>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              Disconnect
            </Button>
          </div>
          <div className="flex items-center justify-between py-3 last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🦉</span>
              <div>
                <div className="text-white text-sm font-medium">Duolingo</div>
                <div className="text-white/40 text-xs">Not connected</div>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Connect
            </Button>
          </div>
        </div>
      </Card>

      {/* OpenClaw Agent Section */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-white mb-4">
          OpenClaw Agent
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Status</span>
            <span className="text-white text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full inline-block"></div>
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Last Verification</span>
            <span className="text-white text-sm">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Next Verification</span>
            <span className="text-white text-sm">Today at 11:00 PM UTC</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Skill Version</span>
            <span className="text-white text-sm">v1.0.0</span>
          </div>
        </div>
      </Card>

      {/* Preferences Section */}
      <Card>
        <h2 className="text-lg font-display font-semibold text-white mb-4">
          Preferences
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Desktop Notifications</span>
            <div className="w-10 h-5 bg-accent rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Sound Effects</span>
            <div className="w-10 h-5 bg-white/20 rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Auto-verify Habits</span>
            <div className="w-10 h-5 bg-accent rounded-full relative">
              <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Settings;