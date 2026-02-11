/**
 * Contract addresses configuration for StreakBeast
 * Maps chain IDs to deployed contract addresses
 */

/**
 * Mapping of chain IDs to contract addresses
 * Contains core contract and badge NFT contract addresses for each supported network
 */
export const CONTRACT_ADDRESSES: Record<number, { core: string; badge: string }> = {
  // opBNB Testnet
  5611: {
    core: '0x1C95958de2aB2b876609F052F239cFA72CEF87DC',
    badge: '0x7ED2D07847eff93fB00F12FE2F48cB7c1cb9C634',
  },
  // opBNB Mainnet
  204: {
    core: '0x0000000000000000000000000000000000000000',
    badge: '0x0000000000000000000000000000000000000000',
  },
  // Hardhat Local
  31337: {
    core: '0x0000000000000000000000000000000000000000',
    badge: '0x0000000000000000000000000000000000000000',
  },
};

/**
 * List of supported chain IDs
 */
export const SUPPORTED_CHAINS = [5611, 204] as const;

/**
 * Type definition for supported chain IDs
 */
export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number];

/**
 * Chain configuration mapping
 * Contains network metadata including name, RPC URL, and block explorer URL
 */
export const CHAIN_CONFIG: Record<number, { name: string; rpcUrl: string; explorer: string }> = {
  5611: {
    name: 'opBNB Testnet',
    rpcUrl: 'https://opbnb-testnet-rpc.bnbchain.org',
    explorer: 'https://testnet.opbnbscan.com',
  },
  204: {
    name: 'opBNB Mainnet',
    rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
    explorer: 'https://opbnbscan.com',
  },
};