/**
 * TopBar component
 * 
 * Displays the application top bar with wallet connection controls and balance display.
 * Features wallet connect/disconnect button, balance display, and truncated address view.
 */

import React from 'react';
import { useWallet } from '../contexts/WalletContext';

/**
 * Truncate ethereum address to show first and last 4 characters
 * @param address - Full ethereum address
 * @returns Truncated address in format 0x1234...abcd
 */
function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * TopBar component
 * 
 * Renders the application top bar with:
 * - Empty left section (reserved for page title)
 * - Right section with BNB balance display and wallet connection button
 * - Glassmorphism styling for connected state
 * - Pulse animation during connection
 */
function TopBar(): React.ReactElement {
  const { account, balance, isConnecting, isConnected, connect, disconnect } = useWallet();

  return (
    <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#0F0F1A]">
      {/* Left side - reserved for page title */}
      <div></div>

      {/* Right side - wallet controls */}
      <div className="flex items-center gap-4">
        {/* BNB Balance Display - only show when connected */}
        {isConnected && (
          <div className="text-sm text-white/60">
            {parseFloat(balance).toFixed(4)} BNB
          </div>
        )}

        {/* Wallet Connection Button */}
        {isConnecting ? (
          <div className="text-sm text-white/60 animate-pulse">
            Connecting...
          </div>
        ) : isConnected && account ? (
          <button
            onClick={disconnect}
            className="bg-white/5 backdrop-blur border border-white/10 px-4 py-2 rounded-full text-sm hover:bg-white/10 transition-colors"
          >
            {truncateAddress(account)}
          </button>
        ) : (
          <button
            onClick={connect}
            style={{
              background: '#6C3CE1',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#8B5CF6';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(108,60,225,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#6C3CE1';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default TopBar;