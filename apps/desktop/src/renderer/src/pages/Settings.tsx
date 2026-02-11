import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useWallet } from '../contexts/WalletContext';
import { CHAIN_CONFIG } from '../contracts/addresses';

/**
 * Format address as 0x1234...5678
 */
function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Settings page component
 *
 * Displays user settings including wallet management, linked accounts,
 * OpenClaw agent status, and user preferences.
 */
function Settings(): React.ReactElement {
  const { account, balance, chainId, isConnected, disconnect } = useWallet();

  const [notifications, setNotifications] = useState<boolean>(true);
  const [soundEffects, setSoundEffects] = useState<boolean>(false);
  const [autoVerify, setAutoVerify] = useState<boolean>(true);

  const networkName = chainId !== null ? CHAIN_CONFIG[chainId]?.name ?? 'Unknown Network' : 'Not connected';
  const isOnSupportedNetwork = chainId !== null && CHAIN_CONFIG[chainId] !== undefined;

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
            <span className="text-white font-mono text-sm">
              {isConnected && account ? formatAddress(account) : 'Not connected'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Network</span>
            <span className="text-white text-sm flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full inline-block ${
                isConnected && isOnSupportedNetwork ? 'bg-green-400' : isConnected ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              {networkName}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Balance</span>
            <span className="text-white text-sm">
              {isConnected && balance ? `${parseFloat(balance).toFixed(4)} BNB` : '—'}
            </span>
          </div>
          <div className="pt-2">
            {isConnected ? (
              <Button variant="secondary" size="sm" onClick={disconnect}>
                Disconnect Wallet
              </Button>
            ) : (
              <span className="text-sm text-white/40">Connect via the top bar</span>
            )}
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
                <div className="text-white/40 text-xs">Not connected</div>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Connect
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
            <span className="text-sm text-white/60">Verification Schedule</span>
            <span className="text-white text-sm">Daily at 11:00 PM UTC</span>
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
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                notifications ? 'bg-accent' : 'bg-white/20'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                notifications ? 'right-0.5' : 'left-0.5'
              }`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Sound Effects</span>
            <button
              onClick={() => setSoundEffects(!soundEffects)}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                soundEffects ? 'bg-accent' : 'bg-white/20'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                soundEffects ? 'right-0.5' : 'left-0.5'
              }`}></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">Auto-verify Habits</span>
            <button
              onClick={() => setAutoVerify(!autoVerify)}
              className={`w-10 h-5 rounded-full relative transition-colors ${
                autoVerify ? 'bg-accent' : 'bg-white/20'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                autoVerify ? 'right-0.5' : 'left-0.5'
              }`}></div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Settings;
