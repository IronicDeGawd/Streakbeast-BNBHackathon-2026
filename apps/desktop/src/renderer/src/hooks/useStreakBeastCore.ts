/**
 * useStreakBeastCore - Custom hook for interacting with StreakBeastCore smart contract
 * Provides typed wrappers for all contract functions using ethers.js v6
 */

import { useMemo, useCallback } from 'react';
import { Contract, parseEther, formatEther } from 'ethers';
import { useWallet } from '../contexts/WalletContext';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import StreakBeastCoreABI from '../contracts/StreakBeastCore.json';

/**
 * Typed wrapper for StreakBeastCore contract.
 * ethers v6 Contract uses runtime dispatch; we define explicit method signatures.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
interface StreakBeastCoreContract {
  stake(habitType: number, durationDays: number, overrides?: any): Promise<any>;
  claimReward(poolId: number): Promise<any>;
  getStreak(habitId: number): Promise<any>;
  getHabit(habitId: number | any): Promise<any>;
  getUserHabits(address: string): Promise<any[]>;
  getPool(poolId: number): Promise<any>;
  getRewardBalance(poolId: number, address: string): Promise<any>;
  nextPoolId(): Promise<any>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Habit struct from contract
 */
export interface Habit {
  user: string;
  habitType: number;
  stakeAmount: string;
  startTime: number;
  duration: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: number;
  active: boolean;
  claimed: boolean;
}

/**
 * Pool struct from contract
 */
export interface Pool {
  habitType: number;
  totalStaked: string;
  startTime: number;
  duration: number;
  totalSuccessfulStreaks: number;
  distributed: boolean;
  participants: string[];
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  address: string;
  streak: number;
}

/**
 * Hook return type
 */
export interface UseStreakBeastCoreReturn {
  /** Read-only contract instance */
  contract: StreakBeastCoreContract | null;
  /** Contract is ready to use */
  isReady: boolean;
  /** Stake BNB to create a habit */
  stake: (habitType: number, durationDays: number, amountBnb: string) => Promise<any>;
  /** Claim rewards for a pool */
  claimReward: (poolId: number) => Promise<any>;
  /** Get current streak for a habit */
  getStreak: (habitId: number) => Promise<number>;
  /** Get habit details */
  getHabit: (habitId: number) => Promise<Habit>;
  /** Get user's habit IDs */
  getUserHabits: (address?: string) => Promise<number[]>;
  /** Get pool details */
  getPool: (poolId: number) => Promise<Pool>;
  /** Get reward balance for an address in a pool */
  getRewardBalance: (poolId: number, address?: string) => Promise<string>;
  /** Get leaderboard for a pool */
  getLeaderboard: (poolId: number) => Promise<LeaderboardEntry[]>;
}

/**
 * useStreakBeastCore hook
 * Provides access to StreakBeastCore contract functions
 */
export function useStreakBeastCore(): UseStreakBeastCoreReturn {
  const { provider, signer, chainId, account } = useWallet();

  /**
   * Create read-only contract instance (with provider)
   */
  const contract = useMemo((): StreakBeastCoreContract | null => {
    if (!provider || !chainId) return null;

    const contractAddress = CONTRACT_ADDRESSES[chainId]?.core;
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      return null;
    }

    return new Contract(contractAddress, StreakBeastCoreABI.abi, provider) as unknown as StreakBeastCoreContract;
  }, [provider, chainId]);

  /**
   * Create write contract instance (with signer)
   */
  const writeContract = useMemo((): StreakBeastCoreContract | null => {
    if (!signer || !chainId) return null;

    const contractAddress = CONTRACT_ADDRESSES[chainId]?.core;
    if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
      return null;
    }

    return new Contract(contractAddress, StreakBeastCoreABI.abi, signer) as unknown as StreakBeastCoreContract;
  }, [signer, chainId]);

  /**
   * Check if contract is ready
   */
  const isReady = useMemo(() => contract !== null, [contract]);

  /**
   * Stake BNB to create a habit
   * @param habitType - Type of habit (0-4)
   * @param durationDays - Duration in days
   * @param amountBnb - Amount of BNB to stake
   * @returns Transaction receipt
   */
  const stake = useCallback(
    async (habitType: number, durationDays: number, amountBnb: string): Promise<any> => {
      if (!writeContract) {
        throw new Error('Wallet not connected');
      }

      const tx = await writeContract.stake(habitType, durationDays, {
        value: parseEther(amountBnb),
      });

      return await tx.wait();
    },
    [writeContract],
  );

  /**
   * Claim rewards for a pool
   * @param poolId - Pool ID
   * @returns Transaction receipt
   */
  const claimReward = useCallback(
    async (poolId: number): Promise<any> => {
      if (!writeContract) {
        throw new Error('Wallet not connected');
      }

      const tx = await writeContract.claimReward(poolId);
      return await tx.wait();
    },
    [writeContract],
  );

  /**
   * Get current streak for a habit
   * @param habitId - Habit ID
   * @returns Current streak count
   */
  const getStreak = useCallback(
    async (habitId: number): Promise<number> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const streak = await contract.getStreak(habitId);
      return Number(streak);
    },
    [contract],
  );

  /**
   * Get habit details
   * @param habitId - Habit ID
   * @returns Habit object
   */
  const getHabit = useCallback(
    async (habitId: number): Promise<Habit> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const habitData = await contract.getHabit(habitId);

      return {
        user: habitData.user,
        habitType: Number(habitData.habitType),
        stakeAmount: formatEther(habitData.stakeAmount),
        startTime: Number(habitData.startTime),
        duration: Number(habitData.duration),
        currentStreak: Number(habitData.currentStreak),
        longestStreak: Number(habitData.longestStreak),
        lastCheckIn: Number(habitData.lastCheckIn),
        active: habitData.active,
        claimed: habitData.claimed,
      };
    },
    [contract],
  );

  /**
   * Get user's habit IDs
   * @param address - User address (optional, defaults to connected account)
   * @returns Array of habit IDs
   */
  const getUserHabits = useCallback(
    async (address?: string): Promise<number[]> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const userAddress = address || account;
      if (!userAddress) {
        throw new Error('No address provided and wallet not connected');
      }

      const habitIds = await contract.getUserHabits(userAddress);
      return habitIds.map((id: bigint) => Number(id));
    },
    [contract, account],
  );

  /**
   * Get pool details
   * @param poolId - Pool ID
   * @returns Pool object
   */
  const getPool = useCallback(
    async (poolId: number): Promise<Pool> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const poolData = await contract.getPool(poolId);

      return {
        habitType: Number(poolData.habitType),
        totalStaked: formatEther(poolData.totalStaked),
        startTime: Number(poolData.startTime),
        duration: Number(poolData.duration),
        totalSuccessfulStreaks: Number(poolData.totalSuccessfulStreaks),
        distributed: poolData.distributed,
        participants: poolData.participants,
      };
    },
    [contract],
  );

  /**
   * Get reward balance for an address in a pool
   * @param poolId - Pool ID
   * @param address - User address (optional, defaults to connected account)
   * @returns Formatted BNB balance
   */
  const getRewardBalance = useCallback(
    async (poolId: number, address?: string): Promise<string> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      const userAddress = address || account;
      if (!userAddress) {
        throw new Error('No address provided and wallet not connected');
      }

      const balance = await contract.getRewardBalance(poolId, userAddress);
      return formatEther(balance);
    },
    [contract, account],
  );

  /**
   * Get leaderboard for a pool
   * @param poolId - Pool ID
   * @returns Array of leaderboard entries
   */
  const getLeaderboard = useCallback(
    async (poolId: number): Promise<LeaderboardEntry[]> => {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      // Get pool participants
      const poolData = await contract.getPool(poolId);
      const participants = poolData.participants;

      // Get habit IDs for the pool
      const leaderboard: LeaderboardEntry[] = [];

      for (const participant of participants) {
        // Get user's habits
        const habitIds = await contract.getUserHabits(participant);

        // Find habits in this pool and get max streak
        let maxStreak = 0;
        for (const habitId of habitIds) {
          const habit = await contract.getHabit(habitId);

          // Check if habit belongs to this pool by comparing type, start time, and duration
          const habitPoolId = await findPoolIdForHabit(
            contract,
            Number(habit.habitType),
            Number(habit.startTime),
            Number(habit.duration),
          );

          if (habitPoolId === poolId) {
            const streak = Number(habit.currentStreak);
            if (streak > maxStreak) {
              maxStreak = streak;
            }
          }
        }

        leaderboard.push({
          address: participant,
          streak: maxStreak,
        });
      }

      // Sort by streak descending
      return leaderboard.sort((a, b) => b.streak - a.streak);
    },
    [contract],
  );

  return {
    contract,
    isReady,
    stake,
    claimReward,
    getStreak,
    getHabit,
    getUserHabits,
    getPool,
    getRewardBalance,
    getLeaderboard,
  };
}

/**
 * Helper function to find pool ID for a habit
 * Iterates through pools to find matching one
 */
async function findPoolIdForHabit(
  contract: StreakBeastCoreContract,
  habitType: number,
  startTime: number,
  duration: number,
): Promise<number> {
  // Get next pool ID to determine range
  const nextPoolId = await contract.nextPoolId();
  const maxPoolId = Number(nextPoolId);

  // Search through pools
  for (let poolId = 1; poolId < maxPoolId; poolId++) {
    try {
      const pool = await contract.getPool(poolId);

      if (
        Number(pool.habitType) === habitType &&
        Number(pool.startTime) === startTime &&
        Number(pool.duration) === duration
      ) {
        return poolId;
      }
    } catch (error) {
      // Pool might not exist, continue
      continue;
    }
  }

  return 0; // Pool not found
}