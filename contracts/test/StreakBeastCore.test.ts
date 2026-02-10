import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { StreakBeastCore } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("StreakBeastCore", function () {
  // Fixture for deploying the contract
  async function deployStreakBeastCoreFixture() {
    const [owner, agent, user1, user2, user3] = await ethers.getSigners();

    const StreakBeastCore = await ethers.getContractFactory("StreakBeastCore");
    const streakBeast = await StreakBeastCore.deploy(agent.address);

    return { streakBeast, owner, agent, user1, user2, user3 };
  }

  describe("Deployment", function () {
    it("Should set the owner correctly", async function () {
      const { streakBeast, owner } = await loadFixture(deployStreakBeastCoreFixture);
      expect(await streakBeast.owner()).to.equal(owner.address);
    });

    it("Should set the agent correctly", async function () {
      const { streakBeast, agent } = await loadFixture(deployStreakBeastCoreFixture);
      expect(await streakBeast.agent()).to.equal(agent.address);
    });

    it("Should revert with invalid agent address", async function () {
      const StreakBeastCore = await ethers.getContractFactory("StreakBeastCore");
      await expect(
        StreakBeastCore.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid agent address");
    });

    it("Should initialize nextHabitId to 1", async function () {
      const { streakBeast } = await loadFixture(deployStreakBeastCoreFixture);
      expect(await streakBeast.nextHabitId()).to.equal(1);
    });

    it("Should initialize nextPoolId to 1", async function () {
      const { streakBeast } = await loadFixture(deployStreakBeastCoreFixture);
      expect(await streakBeast.nextPoolId()).to.equal(1);
    });
  });

  describe("Staking", function () {
    it("Should allow user to stake BNB with valid habitType and duration", async function () {
      const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await expect(
        streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount })
      ).to.not.be.reverted;
    });

    it("Should revert when staking with 0 value", async function () {
      const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const habitType = 0;
      const durationDays = 7;

      await expect(
        streakBeast.connect(user1).stake(habitType, durationDays, { value: 0 })
      ).to.be.revertedWith("Stake amount must be greater than 0");
    });

    it("Should revert when duration is less than 7 days", async function () {
      const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 6;

      await expect(
        streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount })
      ).to.be.revertedWith("Duration must be at least 7 days");
    });

    it("Should create habit with correct data", async function () {
      const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

      const habit = await streakBeast.getHabit(1);
      expect(habit.user).to.equal(user1.address);
      expect(habit.habitType).to.equal(habitType);
      expect(habit.stakeAmount).to.equal(stakeAmount);
      expect(habit.duration).to.equal(durationDays * 24 * 60 * 60);
      expect(habit.currentStreak).to.equal(0);
      expect(habit.longestStreak).to.equal(0);
      expect(habit.lastCheckIn).to.equal(0);
      expect(habit.active).to.be.true;
      expect(habit.claimed).to.be.false;
    });

    it("Should add habit to user's habits list", async function () {
      const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

      const userHabits = await streakBeast.getUserHabits(user1.address);
      expect(userHabits.length).to.equal(1);
      expect(userHabits[0]).to.equal(1);
    });

    it("Should add stake to pool", async function () {
      const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

      const pool = await streakBeast.getPool(1);
      expect(pool.totalStaked).to.equal(stakeAmount);
      expect(pool.habitType).to.equal(habitType);
    });

    it("Should emit Staked event", async function () {
      const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await expect(
        streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount })
      )
        .to.emit(streakBeast, "Staked")
        .withArgs(user1.address, 1, habitType, stakeAmount, durationDays);
    });

    it("Should add multiple habits to same pool if same type and duration", async function () {
      const { streakBeast, user1, user2 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount1 = ethers.parseEther("1.0");
      const stakeAmount2 = ethers.parseEther("2.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount1 });
      await streakBeast.connect(user2).stake(habitType, durationDays, { value: stakeAmount2 });

      const pool = await streakBeast.getPool(1);
      expect(pool.totalStaked).to.equal(stakeAmount1 + stakeAmount2);
      expect(pool.participants.length).to.equal(2);
    });
  });

  describe("Check-In", function () {
    it("Should allow agent to check in a habit", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

      await expect(
        streakBeast.connect(agent).checkIn(1, "0x")
      ).to.not.be.reverted;
    });

    it("Should increment streak on check-in", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      await streakBeast.connect(agent).checkIn(1, "0x");

      const streak = await streakBeast.getStreak(1);
      expect(streak).to.equal(1);
    });

    it("Should revert if not called by agent", async function () {
      const { streakBeast, user1, user2 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

      await expect(
        streakBeast.connect(user2).checkIn(1, "0x")
      ).to.be.revertedWith("Only agent can call this function");
    });

    it("Should revert if checked in too recently (< 20 hours)", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      await streakBeast.connect(agent).checkIn(1, "0x");

      // Try to check in again immediately
      await expect(
        streakBeast.connect(agent).checkIn(1, "0x")
      ).to.be.revertedWith("Already checked in today");
    });

    it("Should allow check-in after 20 hours", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      await streakBeast.connect(agent).checkIn(1, "0x");

      // Advance time by 20 hours
      await time.increase(20 * 60 * 60);

      await expect(
        streakBeast.connect(agent).checkIn(1, "0x")
      ).to.not.be.reverted;

      const streak = await streakBeast.getStreak(1);
      expect(streak).to.equal(2);
    });

    it("Should detect broken streak after 48 hours of no check-in", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      await streakBeast.connect(agent).checkIn(1, "0x");

      // Advance time by more than 48 hours
      await time.increase(49 * 60 * 60);

      await expect(
        streakBeast.connect(agent).checkIn(1, "0x")
      ).to.emit(streakBeast, "StreakBroken")
        .withArgs(1, 1);

      const habit = await streakBeast.getHabit(1);
      expect(habit.active).to.be.false;
    });

    it("Should update longestStreak when current streak exceeds it", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 30;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

      // Check in 3 times
      for (let i = 0; i < 3; i++) {
        await streakBeast.connect(agent).checkIn(1, "0x");
        await time.increase(24 * 60 * 60);
      }

      const habit = await streakBeast.getHabit(1);
      expect(habit.longestStreak).to.equal(3);
    });

    it("Should emit CheckedIn event", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

      await expect(
        streakBeast.connect(agent).checkIn(1, "0x")
      )
        .to.emit(streakBeast, "CheckedIn")
        .withArgs(1, 1);
    });

    it("Should revert if habit is not active", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      await streakBeast.connect(agent).checkIn(1, "0x");

      // Break the streak
      await time.increase(49 * 60 * 60);
      await streakBeast.connect(agent).checkIn(1, "0x");

      // Try to check in again
      await expect(
        streakBeast.connect(agent).checkIn(1, "0x")
      ).to.be.revertedWith("Habit is not active");
    });
  });

  describe("Distribution", function () {
    it("Should allow agent to distribute pool after end time", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      
      // Complete some check-ins
      await streakBeast.connect(agent).checkIn(1, "0x");
      await time.increase(24 * 60 * 60);
      await streakBeast.connect(agent).checkIn(1, "0x");

      // Advance time to end of pool duration
      await time.increase(6 * 24 * 60 * 60);

      await expect(
        streakBeast.connect(agent).distribute(1)
      ).to.not.be.reverted;
    });

    it("Should calculate rewards correctly with weekly bonus", async function () {
      const { streakBeast, agent, user1, user2 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount1 = ethers.parseEther("1.0");
      const stakeAmount2 = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 14;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount1 });
      await streakBeast.connect(user2).stake(habitType, durationDays, { value: stakeAmount2 });

      // User1 completes 7 days (1 week)
      for (let i = 0; i < 7; i++) {
        await streakBeast.connect(agent).checkIn(1, "0x");
        await time.increase(24 * 60 * 60);
      }

      // User2 completes 14 days (2 weeks)
      for (let i = 0; i < 14; i++) {
        await streakBeast.connect(agent).checkIn(2, "0x");
        if (i < 13) await time.increase(24 * 60 * 60);
      }

      // Advance to end of pool
      await time.increase(1 * 24 * 60 * 60);

      await streakBeast.connect(agent).distribute(1);

      // User1: 7 streaks, 1 week bonus (10%)
      // User2: 14 streaks, 2 week bonus (20%)
      const totalPool = stakeAmount1 + stakeAmount2;
      const totalStreaks = 7n + 14n;

      const user1BaseShare = (7n * totalPool) / totalStreaks;
      const user1Bonus = (1n * 10n); // 1 week * 10%
      const user1ExpectedReward = user1BaseShare + (user1BaseShare * user1Bonus) / 100n;

      const user2BaseShare = (14n * totalPool) / totalStreaks;
      const user2Bonus = (2n * 10n); // 2 weeks * 10%
      const user2ExpectedReward = user2BaseShare + (user2BaseShare * user2Bonus) / 100n;

      const user1Reward = await streakBeast.getRewardBalance(1, user1.address);
      const user2Reward = await streakBeast.getRewardBalance(1, user2.address);

      expect(user1Reward).to.equal(user1ExpectedReward);
      expect(user2Reward).to.equal(user2ExpectedReward);
    });

    it("Should revert if pool not ended", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

      await expect(
        streakBeast.connect(agent).distribute(1)
      ).to.be.revertedWith("Pool period not ended");
    });

    it("Should revert if already distributed", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      await streakBeast.connect(agent).checkIn(1, "0x");

      // Advance to end of pool
      await time.increase(8 * 24 * 60 * 60);

      await streakBeast.connect(agent).distribute(1);

      await expect(
        streakBeast.connect(agent).distribute(1)
      ).to.be.revertedWith("Pool already distributed");
    });

    it("Should emit Distributed event", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      await streakBeast.connect(agent).checkIn(1, "0x");

      await time.increase(8 * 24 * 60 * 60);

      await expect(
        streakBeast.connect(agent).distribute(1)
      )
        .to.emit(streakBeast, "Distributed")
        .withArgs(1, stakeAmount);
    });

    it("Should revert if not called by agent", async function () {
      const { streakBeast, user1, user2 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

      await time.increase(8 * 24 * 60 * 60);

      await expect(
        streakBeast.connect(user2).distribute(1)
      ).to.be.revertedWith("Only agent can call this function");
    });
  });

  describe("Claim Rewards", function () {
    it("Should allow user to claim rewards", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      await streakBeast.connect(agent).checkIn(1, "0x");

      await time.increase(8 * 24 * 60 * 60);
      await streakBeast.connect(agent).distribute(1);

      await expect(
        streakBeast.connect(user1).claimReward(1)
      ).to.not.be.reverted;
    });

    it("Should revert if no rewards to claim", async function () {
      const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);

      await expect(
        streakBeast.connect(user1).claimReward(1)
      ).to.be.revertedWith("No reward to claim");
    });

    it("Should zero balance after claim", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      await streakBeast.connect(agent).checkIn(1, "0x");

      await time.increase(8 * 24 * 60 * 60);
      await streakBeast.connect(agent).distribute(1);

      await streakBeast.connect(user1).claimReward(1);

      const balance = await streakBeast.getRewardBalance(1, user1.address);
      expect(balance).to.equal(0);
    });

    it("Should emit RewardClaimed event", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      await streakBeast.connect(agent).checkIn(1, "0x");

      await time.increase(8 * 24 * 60 * 60);
      await streakBeast.connect(agent).distribute(1);

      const rewardBalance = await streakBeast.getRewardBalance(1, user1.address);

      await expect(
        streakBeast.connect(user1).claimReward(1)
      )
        .to.emit(streakBeast, "RewardClaimed")
        .withArgs(user1.address, 1, rewardBalance);
    });

    it("Should transfer correct amount to user", async function () {
      const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
      const stakeAmount = ethers.parseEther("1.0");
      const habitType = 0;
      const durationDays = 7;

      await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
      await streakBeast.connect(agent).checkIn(1, "0x");

      await time.increase(8 * 24 * 60 * 60);
      await streakBeast.connect(agent).distribute(1);

      const rewardBalance = await streakBeast.getRewardBalance(1, user1.address);
      const balanceBefore = await ethers.provider.getBalance(user1.address);

      const tx = await streakBeast.connect(user1).claimReward(1);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(user1.address);

      expect(balanceAfter).to.equal(balanceBefore + rewardBalance - gasUsed);
    });
  });

  describe("View Functions", function () {
    describe("getStreak", function () {
      it("Should return correct streak count", async function () {
        const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
        const stakeAmount = ethers.parseEther("1.0");
        const habitType = 0;
        const durationDays = 7;

        await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
        
        expect(await streakBeast.getStreak(1)).to.equal(0);

        await streakBeast.connect(agent).checkIn(1, "0x");
        expect(await streakBeast.getStreak(1)).to.equal(1);

        await time.increase(24 * 60 * 60);
        await streakBeast.connect(agent).checkIn(1, "0x");
        expect(await streakBeast.getStreak(1)).to.equal(2);
      });
    });

    describe("getUserHabits", function () {
      it("Should return all habit IDs for a user", async function () {
        const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);
        const stakeAmount = ethers.parseEther("1.0");
        const habitType = 0;
        const durationDays = 7;

        await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
        await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
        await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

        const userHabits = await streakBeast.getUserHabits(user1.address);
        expect(userHabits.length).to.equal(3);
        expect(userHabits[0]).to.equal(1);
        expect(userHabits[1]).to.equal(2);
        expect(userHabits[2]).to.equal(3);
      });

      it("Should return empty array for user with no habits", async function () {
        const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);

        const userHabits = await streakBeast.getUserHabits(user1.address);
        expect(userHabits.length).to.equal(0);
      });
    });

    describe("getLeaderboard", function () {
      it("Should return participants sorted by streak descending", async function () {
        const { streakBeast, agent, user1, user2, user3 } = await loadFixture(deployStreakBeastCoreFixture);
        const stakeAmount = ethers.parseEther("1.0");
        const habitType = 0;
        const durationDays = 14;

        await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
        await streakBeast.connect(user2).stake(habitType, durationDays, { value: stakeAmount });
        await streakBeast.connect(user3).stake(habitType, durationDays, { value: stakeAmount });

        // User1: 3 streaks
        for (let i = 0; i < 3; i++) {
          await streakBeast.connect(agent).checkIn(1, "0x");
          await time.increase(24 * 60 * 60);
        }

        // User2: 7 streaks
        for (let i = 0; i < 7; i++) {
          await streakBeast.connect(agent).checkIn(2, "0x");
          await time.increase(24 * 60 * 60);
        }

        // User3: 5 streaks
        for (let i = 0; i < 5; i++) {
          await streakBeast.connect(agent).checkIn(3, "0x");
          await time.increase(24 * 60 * 60);
        }

        const leaderboard = await streakBeast.getLeaderboard(1);
        
        expect(leaderboard.length).to.equal(3);
        expect(leaderboard[0]).to.equal(user2.address); // 7 streaks
        expect(leaderboard[1]).to.equal(user3.address); // 5 streaks
        expect(leaderboard[2]).to.equal(user1.address); // 3 streaks
      });

      it("Should handle users with same streak count", async function () {
        const { streakBeast, agent, user1, user2 } = await loadFixture(deployStreakBeastCoreFixture);
        const stakeAmount = ethers.parseEther("1.0");
        const habitType = 0;
        const durationDays = 7;

        await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
        await streakBeast.connect(user2).stake(habitType, durationDays, { value: stakeAmount });

        // Both users: 5 streaks
        for (let i = 0; i < 5; i++) {
          await streakBeast.connect(agent).checkIn(1, "0x");
          await streakBeast.connect(agent).checkIn(2, "0x");
          await time.increase(24 * 60 * 60);
        }

        const leaderboard = await streakBeast.getLeaderboard(1);
        
        expect(leaderboard.length).to.equal(2);
        // Both should be in leaderboard
        expect(leaderboard).to.include(user1.address);
        expect(leaderboard).to.include(user2.address);
      });

      it("Should return empty array for pool with no participants", async function () {
        const { streakBeast } = await loadFixture(deployStreakBeastCoreFixture);

        const leaderboard = await streakBeast.getLeaderboard(999);
        expect(leaderboard.length).to.equal(0);
      });
    });

    describe("getHabit", function () {
      it("Should return complete habit data", async function () {
        const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);
        const stakeAmount = ethers.parseEther("1.0");
        const habitType = 1;
        const durationDays = 14;

        await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

        const habit = await streakBeast.getHabit(1);
        
        expect(habit.user).to.equal(user1.address);
        expect(habit.habitType).to.equal(habitType);
        expect(habit.stakeAmount).to.equal(stakeAmount);
        expect(habit.duration).to.equal(durationDays * 24 * 60 * 60);
        expect(habit.currentStreak).to.equal(0);
        expect(habit.longestStreak).to.equal(0);
        expect(habit.lastCheckIn).to.equal(0);
        expect(habit.active).to.be.true;
        expect(habit.claimed).to.be.false;
      });
    });

    describe("getPool", function () {
      it("Should return complete pool data", async function () {
        const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);
        const stakeAmount = ethers.parseEther("1.0");
        const habitType = 2;
        const durationDays = 7;

        await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

        const pool = await streakBeast.getPool(1);
        
        expect(pool.habitType).to.equal(habitType);
        expect(pool.totalStaked).to.equal(stakeAmount);
        expect(pool.duration).to.equal(durationDays * 24 * 60 * 60);
        expect(pool.totalSuccessfulStreaks).to.equal(0);
        expect(pool.distributed).to.be.false;
        expect(pool.participants.length).to.equal(1);
        expect(pool.participants[0]).to.equal(user1.address);
      });
    });

    describe("getRewardBalance", function () {
      it("Should return 0 before distribution", async function () {
        const { streakBeast, user1 } = await loadFixture(deployStreakBeastCoreFixture);
        const stakeAmount = ethers.parseEther("1.0");
        const habitType = 0;
        const durationDays = 7;

        await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });

        const balance = await streakBeast.getRewardBalance(1, user1.address);
        expect(balance).to.equal(0);
      });

      it("Should return correct balance after distribution", async function () {
        const { streakBeast, agent, user1 } = await loadFixture(deployStreakBeastCoreFixture);
        const stakeAmount = ethers.parseEther("1.0");
        const habitType = 0;
        const durationDays = 7;

        await streakBeast.connect(user1).stake(habitType, durationDays, { value: stakeAmount });
        await streakBeast.connect(agent).checkIn(1, "0x");

        await time.increase(8 * 24 * 60 * 60);
        await streakBeast.connect(agent).distribute(1);

        const balance = await streakBeast.getRewardBalance(1, user1.address);
        expect(balance).to.be.greaterThan(0);
      });
    });
  });

  describe("Agent Management", function () {
    it("Should allow owner to set new agent", async function () {
      const { streakBeast, owner, user1 } = await loadFixture(deployStreakBeastCoreFixture);

      await streakBeast.connect(owner).setAgent(user1.address);
      expect(await streakBeast.agent()).to.equal(user1.address);
    });

    it("Should revert if non-owner tries to set agent", async function () {
      const { streakBeast, user1, user2 } = await loadFixture(deployStreakBeastCoreFixture);

      await expect(
        streakBeast.connect(user1).setAgent(user2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should revert when setting zero address as agent", async function () {
      const { streakBeast, owner } = await loadFixture(deployStreakBeastCoreFixture);

      await expect(
        streakBeast.connect(owner).setAgent(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid agent address");
    });
  });
});