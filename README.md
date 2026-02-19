# StreakBeast

Gamified onchain habit tracker with AI-powered verification, NFT achievement badges, and staking incentives. Built on opBNB.

Users stake BNB on habits (coding, exercise, reading, meditation, language learning), and an autonomous AI agent verifies completions via GitHub, Strava, and Duolingo APIs. Maintained streaks earn proportional rewards from the staking pool, while milestone achievements mint soulbound NFT badges.

## Screenshots

| |
|---|
| <img width="1206" height="757" alt="Screenshot 2026-02-20 at 4 47 57 AM" src="https://github.com/user-attachments/assets/ec43014e-5061-47e1-ad1e-9c7a4d0ec92b" /> |

| | |
|---|---|
| <img width="1203" height="757" alt="Screenshot 2026-02-20 at 4 48 55 AM" src="https://github.com/user-attachments/assets/64c13b48-6ea9-4a6e-92d3-f0ca95aa17ff" /> | <img width="1205" height="757" alt="Screenshot 2026-02-20 at 4 48 48 AM" src="https://github.com/user-attachments/assets/0edb8590-cf1b-430d-9a1a-747fe9cfbc19" /> |

| | |
|---|---|
| <img width="1210" height="754" alt="Screenshot 2026-02-20 at 4 48 07 AM" src="https://github.com/user-attachments/assets/db1504a4-4749-4658-808b-ec6ae3a96c3e" /> | <img width="1204" height="755" alt="Screenshot 2026-02-20 at 4 48 19 AM" src="https://github.com/user-attachments/assets/a838c3c5-8c95-4cec-ac6e-75a5ceafdf64" /> |

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

## Running Unsigned Releases

**macOS** — remove the quarantine flag after installing:
```bash
xattr -cr /Applications/StreakBeast.app
```

**Windows** — SmartScreen will block the unsigned installer. Click **More info** → **Run anyway**.

**Linux** — make the AppImage executable and run:
```bash
chmod +x StreakBeast-*.AppImage
./StreakBeast-*.AppImage
```

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

## OpenClaw Integration

StreakBeast is built on [OpenClaw](https://github.com/OpenClaw), an open framework for building autonomous AI agents that act and transact onchain. The desktop app communicates with the OpenClaw daemon over a local OpenAI-compatible API.

### How It Connects

> **Desktop App** &rarr; `HTTP` &rarr; **OpenClaw Daemon** (`localhost:18789`) &rarr; `agent:streakbeast` &rarr; **skill/scripts/** &rarr; **opBNB**

| Step | Component | What Happens |
|---|---|---|
| 1 | Desktop App | Sends chat message to OpenClaw via `POST /v1/chat/completions` |
| 2 | OpenClaw Daemon | Routes request to the `agent:streakbeast` model |
| 3 | Agent (skill/) | Reads `SKILL.md` instructions, executes Python scripts |
| 4 | Python Scripts | Calls GitHub/Strava/Duolingo APIs, submits transactions to opBNB |
| 5 | Desktop App | Receives streamed response, updates UI in real-time |

The daemon also exposes `GET /v1/models` as a health check, polled every 30 seconds by the app to show connection status.

### Running OpenClaw Locally

1. **Install OpenClaw** following the [official docs](https://github.com/OpenClaw)

2. **Register the StreakBeast skill:**
   ```bash
   openclaw skill register ./skill
   ```

3. **Set the agent environment variables:**
   ```bash
   # In your OpenClaw daemon config
   OPBNB_RPC_URL=https://opbnb-testnet-rpc.bnbchain.org
   WALLET_PRIVATE_KEY=<agent-wallet-private-key>
   GITHUB_TOKEN=<github-personal-access-token>
   STRAVA_CLIENT_ID=<strava-client-id>
   STRAVA_CLIENT_SECRET=<strava-client-secret>
   ```

4. **Start the daemon:**
   ```bash
   openclaw daemon start
   ```
   The daemon runs on `http://localhost:18789` by default.

5. **Configure the desktop app** (optional — defaults to localhost):
   ```bash
   # In apps/desktop/.env
   VITE_OPENCLAW_URL=http://localhost:18789
   VITE_OPENCLAW_TOKEN=<optional-bearer-token>
   ```

### Agent Capabilities

The StreakBeast agent (`skill/`) runs autonomously via OpenClaw to:

| Script | Purpose |
|---|---|
| `verify_habit.py` | Checks GitHub commits, Strava activities, or Duolingo XP for daily completion |
| `submit_checkin.py` | Submits verified check-ins onchain with cryptographic proof |
| `mint_badge.py` | Auto-mints soulbound NFT badges at streak milestones (1, 7, 30, 100, 365 days) |
| `distribute_rewards.py` | Calculates and distributes proportional rewards from staking pools |
| `coaching.py` | Generates personalized habit coaching based on user streak patterns |

### Verification Methods

| Habit Type | API | Proof |
|---|---|---|
| Coding | GitHub Events API | Commit SHA or event ID |
| Exercise | Strava Activities API | Activity ID |
| Reading/Language | Duolingo profile API | XP snapshot hash |
| Meditation/Custom | Self-reported | Timestamp proof |

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop | Electron, React 18, Vite, Tailwind CSS, Three.js |
| Wallet | Reown AppKit + Ethers.js |
| Contracts | Solidity, Hardhat, OpenZeppelin |
| Blockchain | opBNB Testnet (Chain ID 5611) |
| Auth | Next.js 15 on Vercel |
| Badge API | Express on Vercel Serverless |
| AI Agent | OpenClaw, Python, web3.py |

## License

MIT
