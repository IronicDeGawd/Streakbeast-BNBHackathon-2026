# StreakBeast

Gamified onchain habit tracker with AI-powered verification, NFT achievement badges, and staking incentives. Built on opBNB.

Users stake BNB on habits (coding, exercise, reading, meditation, language learning), and an autonomous AI agent verifies completions via GitHub, Strava, and Duolingo APIs. Maintained streaks earn proportional rewards from the staking pool, while milestone achievements mint soulbound NFT badges.

## Architecture

```
apps/desktop/       Electron + React + Vite desktop app (Reown AppKit wallet)
apps/auth/          Next.js OAuth handler (Vercel) for GitHub/Strava/Duolingo
apps/badge-service/ Express API (Vercel) for automatic NFT badge minting
contracts/          Solidity smart contracts (Hardhat, opBNB testnet)
skill/              Python AI agent for autonomous habit verification
```

## Deployed Contracts (opBNB Testnet)

| Contract | Address |
|---|---|
| StreakBeastCore | [`0x1C95958de2aB2b876609F052F239cFA72CEF87DC`](https://opbnb-testnet.bscscan.com/address/0x1C95958de2aB2b876609F052F239cFA72CEF87DC) |
| StreakBadge (ERC-721) | [`0x7ED2D07847eff93fB00F12FE2F48cB7c1cb9C634`](https://opbnb-testnet.bscscan.com/address/0x7ED2D07847eff93fB00F12FE2F48cB7c1cb9C634) |

## Live Services

| Service | URL |
|---|---|
| Auth (OAuth flows) | https://streakbeast-bnb-hackathon-2026-auth.vercel.app |
| Badge Service (NFT minting API) | https://streakbeast-bnb-hackathon-2026-badg.vercel.app |

## Quick Start

**Prerequisites:** Node.js >= 20, pnpm >= 8

```bash
# Install dependencies
pnpm install

# Run the desktop app
pnpm dev

# Or run individual services
pnpm --filter @streakbeast/desktop dev    # Desktop app
pnpm --filter @streakbeast/auth dev       # Auth server (localhost:3002)
pnpm --filter badge-service dev           # Badge API (localhost:3001)
```

### Environment Setup

Copy the example env for the desktop app:

```bash
cp apps/desktop/.env.example apps/desktop/.env
```

Edit `apps/desktop/.env` with your service URLs (production defaults are in `.env.example`).

### Build Desktop App

```bash
pnpm --filter @streakbeast/desktop build:mac    # macOS (.dmg)
pnpm --filter @streakbeast/desktop build:win    # Windows (.exe)
pnpm --filter @streakbeast/desktop build:linux  # Linux (.AppImage)
```

Builds output to `apps/desktop/release/`.

### Compile & Deploy Contracts

```bash
cd contracts
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.ts --network opbnbTestnet
```

## How It Works

1. **Stake** - User connects wallet, picks a habit type, stakes BNB into a pool
2. **Track** - AI agent autonomously checks GitHub commits, Strava activities, or Duolingo lessons daily
3. **Verify** - Agent submits verified check-ins onchain, updating the user's streak
4. **Earn** - At pool end, rewards distribute proportionally to streak lengths (+10% bonus per perfect week)
5. **Collect** - Milestone streaks (1, 7, 30, 100, 365 days) auto-mint soulbound NFT badges

## AI Agent

The Python-based agent (`skill/`) runs autonomously to:

- **Verify habits** via GitHub API, Strava API, and Duolingo API
- **Submit check-ins** onchain with cryptographic proof
- **Mint badges** when users hit streak milestones
- **Distribute rewards** from staking pools at the end of each period
- **Coach users** with personalized habit guidance

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop | Electron, React 18, Vite, Tailwind CSS, Three.js |
| Wallet | Reown AppKit + Ethers.js |
| Contracts | Solidity, Hardhat, OpenZeppelin |
| Blockchain | opBNB Testnet (Chain ID 5611) |
| Auth | Next.js 15 on Vercel |
| Badge API | Express on Vercel Serverless |
| AI Agent | Python, web3.py |

## License

MIT
