/**
 * useStreakBadge - Custom hook for interacting with StreakBadge smart contract
 * Provides typed wrappers for badge NFT functions using ethers.js v6
 */

import { useMemo, useCallback } from 'react';
import { Contract } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import StreakBadgeABI from '../contracts/StreakBadge.json';

/**
 * Badge information interface
 */
export interface BadgeInfo {
  tokenId: number;
  badgeType: number;
  mintedAt: number;
  habitId: number;
  recipient: string;
  tokenURI: string;
}

/**
 * Badge thresholds (streak days required for each badge type)
 */
export const BADGE_THRESHOLDS = [1, 7, 30, 100, 365] as const;

/**
 * Badge names corresponding to each threshold
 */
export const BADGE_NAMES = [
  'First Flame',
  'Week Warrior',
  'Monthly Master',
  'Century Club',
  'Iron Will',
] as const;

/**
 * Hook return type
 */
export interface UseStreakBadgeReturn {
  /** Read-only contract instance */
  contract: Contract | null;
  /** Contract is ready to use */
  isReady: boolean;
  /** Get badge token IDs for a user */
  getBadgesByUser: (address?: string) => Promise<number[]>;
  /** Get badge details by token ID */
  getBadge: (tokenId: number) => Promise<BadgeInfo>;
  /** Get all badge details for a user */
  getAllUserBadges: (address?: string) => Promise<BadgeInfo[]>;
  /** Check if user has a specific badge type */
  hasBadge: (badgeType: number, address?: string) => Promise<boolean>;
  /** Badge thresholds constant */
  thresholds: readonly [1, 7, 30, 100, 365];
  /** Badge names constant */
  badgeNames: readonly ['First Flame', 'Week Warrior', 'Monthly Master', 'Century Club', 'Iron Will'];
}

/**
 * useStreakBadge hook
 * Provides access to StreakBadge contract functions
 */
export function useStreakBadge(): UseStreakBadgeReturn {
  const { provider, chainId, account } = useWallet();

  /**
   * Create read-only contract instance (with provider)
   */
  const contract = useMemo(() => {
    if (!provider || !chainId) return null;

    const contractAddress = CONTRACT_ADDRESSES[chainId]?.badge;
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      return null;
    }

    return new Contract(contractAddress, StreakBadgeABI.abi, provider);
  }, [provider, chainId]);

  /**
   * Check if contract is ready
   */
  const isReady = useMemo(() => contract !== null, [contract]);

  /**
   * Get badge token IDs for a user
   * @param address - User address (optional, defaults to connected account)
   * @returns Array of token IDs
   */
  const getBadgesByUser = useCallback(
    async (address?: string): Promise<number[]> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const userAddress = address || account;
      if (!userAddress) {
        throw new Error('No address provided and wallet not connected');
      }

      const tokenIds = await contract.getBadgesByUser(userAddress);
      return tokenIds.map((id: bigint) => Number(id));
    },
    [contract, account],
  );

  /**
   * Get badge details by token ID
   * @param tokenId - Badge token ID
   * @returns Badge information object
   */
  const getBadge = useCallback(
    async (tokenId: number): Promise<BadgeInfo> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const badgeData = await contract.getBadge(tokenId);
      const tokenURI = await contract.tokenURI(tokenId);

      return {
        tokenId,
        badgeType: Number(badgeData.badgeType),
        mintedAt: Number(badgeData.mintedAt),
        habitId: Number(badgeData.habitId),
        recipient: badgeData.recipient,
        tokenURI,
      };
    },
    [contract],
  );

  /**
   * Get all badge details for a user
   * Convenience function that combines getBadgesByUser and getBadge
   * @param address - User address (optional, defaults to connected account)
   * @returns Array of badge information objects
   */
  const getAllUserBadges = useCallback(
    async (address?: string): Promise<BadgeInfo[]> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const userAddress = address || account;
      if (!userAddress) {
        throw new Error('No address provided and wallet not connected');
      }

      // Get all token IDs for the user
      const tokenIds = await getBadgesByUser(userAddress);

      // Fetch badge details for each token ID
      const badgePromises = tokenIds.map((tokenId) => getBadge(tokenId));
      const badges = await Promise.all(badgePromises);

      return badges;
    },
    [contract, account, getBadgesByUser, getBadge],
  );

  /**
   * Check if user has a specific badge type
   * @param badgeType - Badge type (0-4)
   * @param address - User address (optional, defaults to connected account)
   * @returns True if user has the badge type
   */
  const hasBadge = useCallback(
    async (badgeType: number, address?: string): Promise<boolean> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const userAddress = address || account;
      if (!userAddress) {
        throw new Error('No address provided and wallet not connected');
      }

      const hasIt = await contract.hasBadge(userAddress, badgeType);
      return hasIt;
    },
    [contract, account],
  );

  return {
    contract,
    isReady,
    getBadgesByUser,
    getBadge,
    getAllUserBadges,
    hasBadge,
    thresholds: BADGE_THRESHOLDS,
    badgeNames: BADGE_NAMES,
  };
}