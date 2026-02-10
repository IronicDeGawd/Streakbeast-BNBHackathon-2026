import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { StreakBadge } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("StreakBadge", function () {
  // Fixture for deploying the contract
  async function deployStreakBadgeFixture() {
    const [owner, agent, user1, user2, user3] = await ethers.getSigners();

    const StreakBadge = await ethers.getContractFactory("StreakBadge");
    const streakBadge = await StreakBadge.deploy(agent.address);

    return { streakBadge, owner, agent, user1, user2, user3 };
  }

  describe("Deployment", function () {
    it("Should set the correct name 'StreakBeast Badge'", async function () {
      const { streakBadge } = await loadFixture(deployStreakBadgeFixture);
      expect(await streakBadge.name()).to.equal("StreakBeast Badge");
    });

    it("Should set the correct symbol 'SBB'", async function () {
      const { streakBadge } = await loadFixture(deployStreakBadgeFixture);
      expect(await streakBadge.symbol()).to.equal("SBB");
    });

    it("Should set the agent correctly", async function () {
      const { streakBadge, agent } = await loadFixture(deployStreakBadgeFixture);
      expect(await streakBadge.agent()).to.equal(agent.address);
    });

    it("Should set the owner correctly", async function () {
      const { streakBadge, owner } = await loadFixture(deployStreakBadgeFixture);
      expect(await streakBadge.owner()).to.equal(owner.address);
    });

    it("Should initialize nextTokenId to 1", async function () {
      const { streakBadge } = await loadFixture(deployStreakBadgeFixture);
      expect(await streakBadge.nextTokenId()).to.equal(1);
    });

    it("Should revert with invalid agent address", async function () {
      const StreakBadge = await ethers.getContractFactory("StreakBadge");
      await expect(
        StreakBadge.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid agent address");
    });
  });

  describe("Minting", function () {
    it("Should allow agent to mint badge", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 0; // FirstFlame
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await expect(
        streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri)
      ).to.not.be.reverted;
    });

    it("Should emit BadgeMinted event", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 0; // FirstFlame
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await expect(
        streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri)
      )
        .to.emit(streakBadge, "BadgeMinted")
        .withArgs(user1.address, 1, badgeType, habitId);
    });

    it("Should set correct tokenURI", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 0; // FirstFlame
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri);

      expect(await streakBadge.tokenURI(1)).to.equal(uri);
    });

    it("Should store Badge struct data correctly", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 1; // WeekWarrior
      const habitId = 42;
      const uri = "ipfs://QmTest1";

      const tx = await streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      const badge = await streakBadge.getBadge(1);

      expect(badge.badgeType).to.equal(badgeType);
      expect(badge.mintedAt).to.equal(block!.timestamp);
      expect(badge.habitId).to.equal(habitId);
      expect(badge.recipient).to.equal(user1.address);
    });

    it("Should add to userBadges array", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 0; // FirstFlame
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri);

      const userBadges = await streakBadge.getBadgesByUser(user1.address);
      expect(userBadges.length).to.equal(1);
      expect(userBadges[0]).to.equal(1);
    });

    it("Should increment nextTokenId", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 0; // FirstFlame
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      expect(await streakBadge.nextTokenId()).to.equal(1);

      await streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri);
      expect(await streakBadge.nextTokenId()).to.equal(2);

      await streakBadge.connect(agent).mintBadge(user1.address, 1, habitId, uri);
      expect(await streakBadge.nextTokenId()).to.equal(3);
    });

    it("Should set badge owner correctly", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 0; // FirstFlame
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri);

      expect(await streakBadge.ownerOf(1)).to.equal(user1.address);
    });
  });

  describe("Access Control", function () {
    it("Should revert when non-agent tries to mint", async function () {
      const { streakBadge, user1, user2 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 0; // FirstFlame
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await expect(
        streakBadge.connect(user1).mintBadge(user2.address, badgeType, habitId, uri)
      ).to.be.revertedWith("Only agent can mint badges");
    });

    it("Should allow owner to set new agent", async function () {
      const { streakBadge, owner, user1 } = await loadFixture(deployStreakBadgeFixture);

      await streakBadge.connect(owner).setAgent(user1.address);
      expect(await streakBadge.agent()).to.equal(user1.address);
    });

    it("Should revert when non-owner tries to set agent", async function () {
      const { streakBadge, user1, user2 } = await loadFixture(deployStreakBadgeFixture);

      await expect(
        streakBadge.connect(user1).setAgent(user2.address)
      ).to.be.revertedWithCustomError(streakBadge, "OwnableUnauthorizedAccount");
    });

    it("Should revert when setting zero address as agent", async function () {
      const { streakBadge, owner } = await loadFixture(deployStreakBadgeFixture);

      await expect(
        streakBadge.connect(owner).setAgent(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid agent address");
    });

    it("Should allow owner to set core address", async function () {
      const { streakBadge, owner, user1 } = await loadFixture(deployStreakBadgeFixture);

      await streakBadge.connect(owner).setCore(user1.address);
      expect(await streakBadge.core()).to.equal(user1.address);
    });

    it("Should revert when non-owner tries to set core", async function () {
      const { streakBadge, user1, user2 } = await loadFixture(deployStreakBadgeFixture);

      await expect(
        streakBadge.connect(user1).setCore(user2.address)
      ).to.be.revertedWithCustomError(streakBadge, "OwnableUnauthorizedAccount");
    });

    it("Should revert when setting zero address as core", async function () {
      const { streakBadge, owner } = await loadFixture(deployStreakBadgeFixture);

      await expect(
        streakBadge.connect(owner).setCore(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid core address");
    });

    it("Should allow new agent to mint after agent change", async function () {
      const { streakBadge, owner, user1, user2 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 0; // FirstFlame
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await streakBadge.connect(owner).setAgent(user1.address);

      await expect(
        streakBadge.connect(user1).mintBadge(user2.address, badgeType, habitId, uri)
      ).to.not.be.reverted;
    });
  });

  describe("Duplicate Prevention", function () {
    it("Should prevent minting same badge type for same user twice", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 0; // FirstFlame
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri);

      await expect(
        streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId + 1, uri)
      ).to.be.revertedWith("User already has this badge type");
    });

    it("Should allow same badge type for different users", async function () {
      const { streakBadge, agent, user1, user2 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 0; // FirstFlame
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri);

      await expect(
        streakBadge.connect(agent).mintBadge(user2.address, badgeType, habitId, uri)
      ).to.not.be.reverted;
    });

    it("Should set hasBadge mapping correctly", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 2; // MonthlyMaster
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      expect(await streakBadge.hasBadge(user1.address, badgeType)).to.be.false;

      await streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri);

      expect(await streakBadge.hasBadge(user1.address, badgeType)).to.be.true;
    });
  });

  describe("Validation", function () {
    it("Should revert with invalid badgeType (>= 5)", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 5; // Invalid
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await expect(
        streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri)
      ).to.be.revertedWith("Invalid badge type");
    });

    it("Should revert with badgeType = 6", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 6;
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await expect(
        streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri)
      ).to.be.revertedWith("Invalid badge type");
    });

    it("Should accept all valid badgeTypes (0-4)", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      for (let badgeType = 0; badgeType < 5; badgeType++) {
        await expect(
          streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri)
        ).to.not.be.reverted;
      }
    });

    it("Should revert when minting to zero address", async function () {
      const { streakBadge, agent } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 0;
      const habitId = 1;
      const uri = "ipfs://QmTest1";

      await expect(
        streakBadge.connect(agent).mintBadge(ethers.ZeroAddress, badgeType, habitId, uri)
      ).to.be.revertedWith("Cannot mint to zero address");
    });
  });

  describe("View Functions", function () {
    describe("getBadgesByUser", function () {
      it("Should return empty array for user with no badges", async function () {
        const { streakBadge, user1 } = await loadFixture(deployStreakBadgeFixture);

        const userBadges = await streakBadge.getBadgesByUser(user1.address);
        expect(userBadges.length).to.equal(0);
      });

      it("Should return correct array of badge token IDs", async function () {
        const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
        const uri = "ipfs://QmTest1";

        await streakBadge.connect(agent).mintBadge(user1.address, 0, 1, uri);
        await streakBadge.connect(agent).mintBadge(user1.address, 1, 2, uri);
        await streakBadge.connect(agent).mintBadge(user1.address, 2, 3, uri);

        const userBadges = await streakBadge.getBadgesByUser(user1.address);
        expect(userBadges.length).to.equal(3);
        expect(userBadges[0]).to.equal(1);
        expect(userBadges[1]).to.equal(2);
        expect(userBadges[2]).to.equal(3);
      });

      it("Should only return badges for specific user", async function () {
        const { streakBadge, agent, user1, user2 } = await loadFixture(deployStreakBadgeFixture);
        const uri = "ipfs://QmTest1";

        await streakBadge.connect(agent).mintBadge(user1.address, 0, 1, uri);
        await streakBadge.connect(agent).mintBadge(user2.address, 0, 2, uri);
        await streakBadge.connect(agent).mintBadge(user1.address, 1, 3, uri);

        const user1Badges = await streakBadge.getBadgesByUser(user1.address);
        const user2Badges = await streakBadge.getBadgesByUser(user2.address);

        expect(user1Badges.length).to.equal(2);
        expect(user1Badges[0]).to.equal(1);
        expect(user1Badges[1]).to.equal(3);

        expect(user2Badges.length).to.equal(1);
        expect(user2Badges[0]).to.equal(2);
      });
    });

    describe("getBadge", function () {
      it("Should return correct Badge struct", async function () {
        const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
        const badgeType = 3; // CenturyClub
        const habitId = 100;
        const uri = "ipfs://QmTest1";

        const tx = await streakBadge.connect(agent).mintBadge(user1.address, badgeType, habitId, uri);
        const receipt = await tx.wait();
        const block = await ethers.provider.getBlock(receipt!.blockNumber);

        const badge = await streakBadge.getBadge(1);

        expect(badge.badgeType).to.equal(badgeType);
        expect(badge.mintedAt).to.equal(block!.timestamp);
        expect(badge.habitId).to.equal(habitId);
        expect(badge.recipient).to.equal(user1.address);
      });

      it("Should revert for non-existent badge", async function () {
        const { streakBadge } = await loadFixture(deployStreakBadgeFixture);

        await expect(
          streakBadge.getBadge(999)
        ).to.be.revertedWith("Badge does not exist");
      });

      it("Should return correct data for multiple badges", async function () {
        const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
        const uri = "ipfs://QmTest1";

        await streakBadge.connect(agent).mintBadge(user1.address, 0, 1, uri);
        await streakBadge.connect(agent).mintBadge(user1.address, 1, 7, uri);

        const badge1 = await streakBadge.getBadge(1);
        const badge2 = await streakBadge.getBadge(2);

        expect(badge1.badgeType).to.equal(0);
        expect(badge1.habitId).to.equal(1);
        expect(badge2.badgeType).to.equal(1);
        expect(badge2.habitId).to.equal(7);
      });
    });

    describe("thresholds", function () {
      it("Should return correct threshold values", async function () {
        const { streakBadge } = await loadFixture(deployStreakBadgeFixture);

        expect(await streakBadge.thresholds(0)).to.equal(1);   // FirstFlame
        expect(await streakBadge.thresholds(1)).to.equal(7);   // WeekWarrior
        expect(await streakBadge.thresholds(2)).to.equal(30);  // MonthlyMaster
        expect(await streakBadge.thresholds(3)).to.equal(100); // CenturyClub
        expect(await streakBadge.thresholds(4)).to.equal(365); // IronWill
      });
    });
  });

  describe("Multiple Badges and Multi-User Scenarios", function () {
    it("Should allow user to have different badge types", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const uri = "ipfs://QmTest1";

      await streakBadge.connect(agent).mintBadge(user1.address, 0, 1, uri);  // FirstFlame
      await streakBadge.connect(agent).mintBadge(user1.address, 1, 2, uri);  // WeekWarrior
      await streakBadge.connect(agent).mintBadge(user1.address, 2, 3, uri);  // MonthlyMaster

      const userBadges = await streakBadge.getBadgesByUser(user1.address);
      expect(userBadges.length).to.equal(3);

      const badge1 = await streakBadge.getBadge(1);
      const badge2 = await streakBadge.getBadge(2);
      const badge3 = await streakBadge.getBadge(3);

      expect(badge1.badgeType).to.equal(0);
      expect(badge2.badgeType).to.equal(1);
      expect(badge3.badgeType).to.equal(2);
    });

    it("Should allow multiple users to have same badge type", async function () {
      const { streakBadge, agent, user1, user2, user3 } = await loadFixture(deployStreakBadgeFixture);
      const badgeType = 1; // WeekWarrior
      const uri = "ipfs://QmTest1";

      await streakBadge.connect(agent).mintBadge(user1.address, badgeType, 1, uri);
      await streakBadge.connect(agent).mintBadge(user2.address, badgeType, 2, uri);
      await streakBadge.connect(agent).mintBadge(user3.address, badgeType, 3, uri);

      expect(await streakBadge.hasBadge(user1.address, badgeType)).to.be.true;
      expect(await streakBadge.hasBadge(user2.address, badgeType)).to.be.true;
      expect(await streakBadge.hasBadge(user3.address, badgeType)).to.be.true;

      expect(await streakBadge.ownerOf(1)).to.equal(user1.address);
      expect(await streakBadge.ownerOf(2)).to.equal(user2.address);
      expect(await streakBadge.ownerOf(3)).to.equal(user3.address);
    });

    it("Should handle complex multi-user, multi-badge scenario", async function () {
      const { streakBadge, agent, user1, user2, user3 } = await loadFixture(deployStreakBadgeFixture);
      const uri = "ipfs://QmTest1";

      // User1: FirstFlame, WeekWarrior
      await streakBadge.connect(agent).mintBadge(user1.address, 0, 1, uri);
      await streakBadge.connect(agent).mintBadge(user1.address, 1, 2, uri);

      // User2: FirstFlame, MonthlyMaster, CenturyClub
      await streakBadge.connect(agent).mintBadge(user2.address, 0, 3, uri);
      await streakBadge.connect(agent).mintBadge(user2.address, 2, 4, uri);
      await streakBadge.connect(agent).mintBadge(user2.address, 3, 5, uri);

      // User3: WeekWarrior
      await streakBadge.connect(agent).mintBadge(user3.address, 1, 6, uri);

      const user1Badges = await streakBadge.getBadgesByUser(user1.address);
      const user2Badges = await streakBadge.getBadgesByUser(user2.address);
      const user3Badges = await streakBadge.getBadgesByUser(user3.address);

      expect(user1Badges.length).to.equal(2);
      expect(user2Badges.length).to.equal(3);
      expect(user3Badges.length).to.equal(1);

      // Verify each user has correct badge types
      expect(await streakBadge.hasBadge(user1.address, 0)).to.be.true;
      expect(await streakBadge.hasBadge(user1.address, 1)).to.be.true;
      expect(await streakBadge.hasBadge(user1.address, 2)).to.be.false;

      expect(await streakBadge.hasBadge(user2.address, 0)).to.be.true;
      expect(await streakBadge.hasBadge(user2.address, 2)).to.be.true;
      expect(await streakBadge.hasBadge(user2.address, 3)).to.be.true;
      expect(await streakBadge.hasBadge(user2.address, 1)).to.be.false;

      expect(await streakBadge.hasBadge(user3.address, 1)).to.be.true;
      expect(await streakBadge.hasBadge(user3.address, 0)).to.be.false;
    });

    it("Should correctly track nextTokenId across multiple users", async function () {
      const { streakBadge, agent, user1, user2 } = await loadFixture(deployStreakBadgeFixture);
      const uri = "ipfs://QmTest1";

      expect(await streakBadge.nextTokenId()).to.equal(1);

      await streakBadge.connect(agent).mintBadge(user1.address, 0, 1, uri);
      expect(await streakBadge.nextTokenId()).to.equal(2);

      await streakBadge.connect(agent).mintBadge(user2.address, 0, 2, uri);
      expect(await streakBadge.nextTokenId()).to.equal(3);

      await streakBadge.connect(agent).mintBadge(user1.address, 1, 3, uri);
      expect(await streakBadge.nextTokenId()).to.equal(4);
    });

    it("Should allow user to collect all 5 badge types", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const uri = "ipfs://QmTest1";

      for (let badgeType = 0; badgeType < 5; badgeType++) {
        await streakBadge.connect(agent).mintBadge(user1.address, badgeType, badgeType + 1, uri);
      }

      const userBadges = await streakBadge.getBadgesByUser(user1.address);
      expect(userBadges.length).to.equal(5);

      for (let badgeType = 0; badgeType < 5; badgeType++) {
        expect(await streakBadge.hasBadge(user1.address, badgeType)).to.be.true;
      }
    });
  });

  describe("ERC721 Standard Compliance", function () {
    it("Should return correct balance for user with badges", async function () {
      const { streakBadge, agent, user1 } = await loadFixture(deployStreakBadgeFixture);
      const uri = "ipfs://QmTest1";

      expect(await streakBadge.balanceOf(user1.address)).to.equal(0);

      await streakBadge.connect(agent).mintBadge(user1.address, 0, 1, uri);
      expect(await streakBadge.balanceOf(user1.address)).to.equal(1);

      await streakBadge.connect(agent).mintBadge(user1.address, 1, 2, uri);
      expect(await streakBadge.balanceOf(user1.address)).to.equal(2);
    });

    it("Should support ERC721 interface", async function () {
      const { streakBadge } = await loadFixture(deployStreakBadgeFixture);
      
      // ERC721 interface ID: 0x80ac58cd
      const erc721InterfaceId = "0x80ac58cd";
      expect(await streakBadge.supportsInterface(erc721InterfaceId)).to.be.true;
    });

    it("Should support ERC721Metadata interface", async function () {
      const { streakBadge } = await loadFixture(deployStreakBadgeFixture);
      
      // ERC721Metadata interface ID: 0x5b5e139f
      const erc721MetadataInterfaceId = "0x5b5e139f";
      expect(await streakBadge.supportsInterface(erc721MetadataInterfaceId)).to.be.true;
    });
  });
});