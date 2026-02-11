import React from 'react';
import Button from './ui/Button';
import Card from './ui/Card';

/**
 * Props for the ConnectWallet component
 */
interface ConnectWalletProps {
  onConnect: () => void;
  isConnecting?: boolean;
}

/**
 * ConnectWallet component
 * 
 * Full-page centered view displayed when no wallet is connected.
 * Prompts the user to connect their wallet via WalletConnect to start using the app.
 * 
 * @param onConnect - Callback function to initiate wallet connection
 * @param isConnecting - Optional loading state for connection process
 */
function ConnectWallet({ onConnect, isConnecting = false }: ConnectWalletProps): React.ReactElement {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="max-w-md w-full text-center p-8">
        {/* Wallet Icon */}
        <svg
          className="w-16 h-16 mx-auto mb-4 text-accent"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>

        {/* Title */}
        <h2 className="text-xl font-display font-bold text-white mb-2">
          Connect Your Wallet
        </h2>

        {/* Description */}
        <p className="text-white/60 text-sm mb-6">
          Connect your wallet to start tracking habits and earning rewards on opBNB.
        </p>

        {/* Connect Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={onConnect}
          loading={isConnecting}
        >
          Connect Wallet
        </Button>

        {/* Footer */}
        <p className="mt-4 text-xs text-white/30">
          Powered by WalletConnect
        </p>
      </Card>
    </div>
  );
}

export default ConnectWallet;