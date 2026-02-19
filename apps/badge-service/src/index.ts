import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { config } from './config';
import { checkAndMintBadges, fetchUserLongestStreak } from './mint';

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Health check endpoint
 */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'badge-service' });
});

/**
 * POST /api/check-badges
 * Check and auto-mint any earned badges for a user.
 *
 * Body: { userAddress: string, longestStreak?: number }
 *   - If longestStreak is provided, use it directly
 *   - If not, fetch it from the StreakBeastCore contract
 *
 * Response: { success: boolean, minted: MintResult[], error?: string }
 */
app.post('/api/check-badges', async (req, res) => {
  try {
    const { userAddress, longestStreak: providedStreak } = req.body;

    // Validate address
    if (!userAddress || !ethers.isAddress(userAddress)) {
      res.status(400).json({ success: false, error: 'Invalid or missing userAddress' });
      return;
    }

    console.log(`\n[check-badges] User: ${userAddress}`);

    // Get longest streak — use provided value or fetch from chain
    let longestStreak: number;
    if (typeof providedStreak === 'number' && providedStreak >= 0) {
      longestStreak = providedStreak;
      console.log(`[check-badges] Using provided streak: ${longestStreak}`);
    } else {
      longestStreak = await fetchUserLongestStreak(userAddress);
      console.log(`[check-badges] Fetched streak from chain: ${longestStreak}`);
    }

    // Check and mint badges
    const minted = await checkAndMintBadges(userAddress, longestStreak);

    console.log(`[check-badges] Minted ${minted.length} badge(s)`);
    res.json({ success: true, minted, longestStreak });
  } catch (err: any) {
    console.error('[check-badges] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/mint-badge
 * Mint a specific badge type for a user.
 *
 * Body: { userAddress: string, badgeType: number, habitId?: number }
 *
 * Response: { success: boolean, txHash?: string, error?: string }
 */
app.post('/api/mint-badge', async (req, res) => {
  try {
    const { userAddress, badgeType, habitId = 0 } = req.body;

    if (!userAddress || !ethers.isAddress(userAddress)) {
      res.status(400).json({ success: false, error: 'Invalid or missing userAddress' });
      return;
    }

    if (typeof badgeType !== 'number' || badgeType < 0 || badgeType > 4) {
      res.status(400).json({ success: false, error: 'badgeType must be 0-4' });
      return;
    }

    console.log(`\n[mint-badge] User: ${userAddress}, Badge: ${badgeType}, Habit: ${habitId}`);

    // Delegate to checkAndMintBadges with a high streak to ensure the badge is eligible
    // This also handles duplicate prevention via hasBadge() check
    const minted = await checkAndMintBadges(userAddress, 999);

    const result = minted.find((m) => m.badgeType === badgeType);
    if (result) {
      res.json({ success: true, txHash: result.txHash });
    } else {
      res.json({ success: false, error: 'Badge already owned or minting failed' });
    }
  } catch (err: any) {
    console.error('[mint-badge] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Start the server (local dev only — Vercel uses the export)
 */
if (!process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`\n🏅 Badge Service running on http://localhost:${config.port}`);
    console.log(`   Badge Contract: ${config.badgeContractAddress}`);
    console.log(`   Core Contract:  ${config.coreContractAddress}`);
    console.log(`   Agent key set:  ${config.agentPrivateKey ? 'Yes' : 'NO — minting will fail!'}\n`);
  });
}

export default app;
