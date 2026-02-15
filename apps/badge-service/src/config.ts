import dotenv from 'dotenv';
dotenv.config();

/**
 * Badge service configuration from environment variables
 */
export const config = {
  agentPrivateKey: process.env.AGENT_PRIVATE_KEY || '',
  rpcUrl: process.env.RPC_URL || 'https://opbnb-testnet-rpc.bnbchain.org',
  badgeContractAddress: process.env.BADGE_CONTRACT_ADDRESS || '0x7ED2D07847eff93fB00F12FE2F48cB7c1cb9C634',
  coreContractAddress: process.env.CORE_CONTRACT_ADDRESS || '0x1C95958de2aB2b876609F052F239cFA72CEF87DC',
  cdnUrl: process.env.CDN_URL || 'https://d3k7wdnxvmqaxj.cloudfront.net',
  port: parseInt(process.env.PORT || '3001', 10),
};

/**
 * Badge thresholds (must match StreakBadge.sol)
 */
export const BADGE_THRESHOLDS = [1, 7, 30, 100, 365];

/**
 * Badge names for metadata
 */
export const BADGE_NAMES = ['First Flame', 'Week Warrior', 'Monthly Master', 'Century Club', 'Iron Will'];

/**
 * Generate a Base64-encoded ERC-721 metadata URI for on-chain storage
 */
export function getBadgeMetadataURI(badgeType: number): string {
  const descriptions = [
    'Earned by completing your first day of a habit streak.',
    'Earned by maintaining a 7-day streak.',
    'Earned by maintaining a 30-day streak.',
    'Earned by maintaining a 100-day streak.',
    'Earned by maintaining a 365-day streak.',
  ];

  const imageNames = ['first-flame', 'week-warrior', 'monthly-master', 'century-club', 'iron-will'];

  const metadata = {
    name: BADGE_NAMES[badgeType],
    description: descriptions[badgeType],
    image: `${config.cdnUrl}/${imageNames[badgeType]}.png`,
    attributes: [
      { trait_type: 'Badge Type', value: BADGE_NAMES[badgeType] },
      { trait_type: 'Badge Tier', value: badgeType },
    ],
  };

  const json = JSON.stringify(metadata);
  const base64 = Buffer.from(json).toString('base64');
  return `data:application/json;base64,${base64}`;
}

/**
 * Minimal StreakBadge ABI (only the functions we need)
 */
export const STREAK_BADGE_ABI = [
  'function mintBadge(address to, uint8 badgeType, uint256 habitId, string uri) external',
  'function hasBadge(address user, uint8 badgeType) external view returns (bool)',
  'function agent() external view returns (address)',
  'function getBadgesByUser(address user) external view returns (uint256[])',
  'function getBadge(uint256 tokenId) external view returns (tuple(uint8 badgeType, uint256 mintedAt, uint256 habitId, address recipient))',
  'function thresholds(uint8 badgeType) external view returns (uint256)',
];

/**
 * Minimal StreakBeastCore ABI (only the functions we need)
 */
export const STREAK_CORE_ABI = [
  'function getUserHabits(address user) external view returns (uint256[])',
  'function getHabit(uint256 habitId) external view returns (tuple(string name, address owner, uint256 stake, uint256 startDate, uint256 currentStreak, uint256 longestStreak, uint256 lastCheckIn, bool active, uint256 poolId))',
];
