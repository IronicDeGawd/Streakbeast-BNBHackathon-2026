/**
 * Badge metadata and image mappings for StreakBeast NFT badges.
 * Used both for on-chain tokenURI (as Base64-encoded JSON) and for
 * rendering badge images in the Achievements UI.
 */

/**
 * Badge image paths (relative to public/)
 */
export const BADGE_IMAGES: Record<number, string> = {
  0: '/badges/first-flame.png',
  1: '/badges/week-warrior.png',
  2: '/badges/monthly-master.png',
  3: '/badges/century-club.png',
  4: '/badges/iron-will.png',
};

/**
 * Badge metadata definitions
 */
const BADGE_METADATA: Record<number, { name: string; description: string }> = {
  0: {
    name: 'First Flame',
    description: 'Earned by completing your first day of a habit streak. The journey begins with a single step!',
  },
  1: {
    name: 'Week Warrior',
    description: 'Earned by maintaining a 7-day streak. A full week of dedication and discipline!',
  },
  2: {
    name: 'Monthly Master',
    description: 'Earned by maintaining a 30-day streak. An entire month of unwavering commitment!',
  },
  3: {
    name: 'Century Club',
    description: 'Earned by maintaining a 100-day streak. Welcome to the elite century club!',
  },
  4: {
    name: 'Iron Will',
    description: 'Earned by maintaining a 365-day streak. A full year of iron-willed dedication!',
  },
};

/**
 * CDN base URL for badge images (configurable via env)
 */
const CDN_URL = (import.meta as any).env?.VITE_CDN_URL || 'https://d3k7wdnxvmqaxj.cloudfront.net';

/**
 * Generate a Base64-encoded JSON metadata URI for on-chain minting.
 * Follows the ERC-721 metadata standard with name, description, and image.
 * @param badgeType - Badge type (0-4)
 * @returns data:application/json;base64,... URI string
 */
export function getBadgeMetadataURI(badgeType: number): string {
  const meta = BADGE_METADATA[badgeType];
  const image = BADGE_IMAGES[badgeType];

  if (!meta || !image) {
    throw new Error(`Invalid badge type: ${badgeType}`);
  }

  const metadata = {
    name: meta.name,
    description: meta.description,
    image: `${CDN_URL}${image.replace('/badges', '')}`,
    attributes: [
      { trait_type: 'Badge Type', value: meta.name },
      { trait_type: 'Badge Tier', value: badgeType },
    ],
  };

  const json = JSON.stringify(metadata);
  const base64 = btoa(json);
  return `data:application/json;base64,${base64}`;
}
