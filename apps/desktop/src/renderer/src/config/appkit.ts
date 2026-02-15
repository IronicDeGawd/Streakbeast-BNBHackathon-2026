import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { defineChain, type AppKitNetwork } from '@reown/appkit/networks';

/**
 * opBNB Testnet chain definition (chainId 5611)
 */
export const opBNBTestnet: AppKitNetwork = defineChain({
  id: 5611,
  caipNetworkId: 'eip155:5611',
  chainNamespace: 'eip155',
  name: 'opBNB Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'tBNB',
    symbol: 'tBNB',
  },
  rpcUrls: {
    default: { http: ['https://opbnb-testnet-rpc.bnbchain.org'] },
  },
  blockExplorers: {
    default: { name: 'opBNBScan', url: 'https://testnet.opbnbscan.com' },
  },
});

/**
 * Initialize Reown AppKit with EthersAdapter
 * This must run once before any React component renders
 */
createAppKit({
  adapters: [new EthersAdapter()],
  networks: [opBNBTestnet],
  defaultNetwork: opBNBTestnet,
  projectId: 'f4466d6b6afcca9abc283f0cc3712313',
  metadata: {
    name: 'StreakBeast',
    description: 'Gamified habit tracker on opBNB',
    url: 'https://streakbeast.xyz',
    icons: [],
  },
  features: {
    analytics: false,
  },
  allowUnsupportedChain: false,
});
