import { ethers } from 'ethers';
import { config, BADGE_THRESHOLDS, STREAK_BADGE_ABI, STREAK_CORE_ABI, getBadgeMetadataURI } from './config';

interface MintResult {
  badgeType: number;
  badgeName: string;
  txHash: string;
}

/**
 * Create provider and wallet from config
 */
function getWallet() {
  if (!config.agentPrivateKey) {
    throw new Error('AGENT_PRIVATE_KEY not set in environment');
  }
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.agentPrivateKey, provider);
  return { provider, wallet };
}

/**
 * Check user's longest streak and mint any earned but unclaimed badges.
 * @param userAddress - The user's wallet address
 * @param longestStreak - The user's longest streak (in days)
 * @returns Array of minted badges with tx hashes
 */
export async function checkAndMintBadges(
  userAddress: string,
  longestStreak: number,
): Promise<MintResult[]> {
  const { wallet } = getWallet();

  const badgeContract = new ethers.Contract(
    config.badgeContractAddress,
    STREAK_BADGE_ABI,
    wallet,
  );

  const results: MintResult[] = [];

  for (let badgeType = 0; badgeType < BADGE_THRESHOLDS.length; badgeType++) {
    const threshold = BADGE_THRESHOLDS[badgeType];

    // Skip if streak hasn't reached this threshold
    if (longestStreak < threshold) {
      console.log(`  [Skip] Badge ${badgeType}: streak ${longestStreak} < threshold ${threshold}`);
      continue;
    }

    // Check if user already has this badge
    const hasBadge = await badgeContract.hasBadge(userAddress, badgeType);
    if (hasBadge) {
      console.log(`  [Skip] Badge ${badgeType}: user already has it`);
      continue;
    }

    // Mint the badge
    console.log(`  [Mint] Badge ${badgeType}: minting for streak ${longestStreak} >= threshold ${threshold}`);
    const uri = getBadgeMetadataURI(badgeType);

    try {
      const tx = await badgeContract.mintBadge(userAddress, badgeType, 0, uri);
      console.log(`  [Tx] Sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`  [Tx] Confirmed in block ${receipt.blockNumber}`);

      results.push({
        badgeType,
        badgeName: BADGE_THRESHOLDS[badgeType] + '-day badge',
        txHash: tx.hash,
      });
    } catch (err: any) {
      console.error(`  [Error] Failed to mint badge ${badgeType}:`, err.message);
      // Continue trying other badges even if one fails
    }
  }

  return results;
}

/**
 * Fetch the user's longest streak directly from the StreakBeastCore contract.
 * @param userAddress - The user's wallet address
 * @returns The user's longest streak across all habits
 */
export async function fetchUserLongestStreak(userAddress: string): Promise<number> {
  const { provider } = getWallet();

  const coreContract = new ethers.Contract(
    config.coreContractAddress,
    STREAK_CORE_ABI,
    provider,
  );

  const habitIds: bigint[] = await coreContract.getUserHabits(userAddress);

  if (habitIds.length === 0) return 0;

  let longest = 0;
  for (const habitId of habitIds) {
    const habit = await coreContract.getHabit(habitId);
    const streak = Number(habit.longestStreak);
    if (streak > longest) longest = streak;
  }

  return longest;
}
