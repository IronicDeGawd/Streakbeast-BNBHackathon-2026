import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * @notice Main deployment script for StreakBeast contracts
 * @dev Deploys StreakBeastCore and StreakBadge, wires them together, and saves deployment info
 */
async function main() {
  try {
    console.log("Starting StreakBeast deployment...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Get agent address from environment or use deployer as fallback
    const agentAddress = process.env.AGENT_ADDRESS || deployer.address;
    console.log("Agent address:", agentAddress);

    // Validate agent address
    if (!ethers.isAddress(agentAddress)) {
      throw new Error(`Invalid agent address: ${agentAddress}`);
    }

    // Get deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(balance), "BNB\n");

    // Deploy StreakBeastCore
    console.log("Deploying StreakBeastCore...");
    const StreakBeastCore = await ethers.getContractFactory("StreakBeastCore");
    const streakBeastCore = await StreakBeastCore.deploy(agentAddress);
    await streakBeastCore.waitForDeployment();
    const streakBeastCoreAddress = await streakBeastCore.getAddress();
    console.log("✓ StreakBeastCore deployed to:", streakBeastCoreAddress);

    // Deploy StreakBadge
    console.log("\nDeploying StreakBadge...");
    const StreakBadge = await ethers.getContractFactory("StreakBadge");
    const streakBadge = await StreakBadge.deploy(agentAddress);
    await streakBadge.waitForDeployment();
    const streakBadgeAddress = await streakBadge.getAddress();
    console.log("✓ StreakBadge deployed to:", streakBadgeAddress);

    // Wire contracts together
    console.log("\nWiring contracts together...");
    const setCoreTx = await streakBadge.setCore(streakBeastCoreAddress);
    await setCoreTx.wait();
    console.log("✓ StreakBadge.setCore() called successfully");

    // Get network information
    const network = await ethers.provider.getNetwork();
    const blockNumber = await ethers.provider.getBlockNumber();

    // Prepare deployment information
    const deploymentInfo = {
      network: {
        name: network.name,
        chainId: Number(network.chainId),
      },
      deployer: deployer.address,
      agent: agentAddress,
      contracts: {
        StreakBeastCore: {
          address: streakBeastCoreAddress,
          blockNumber: blockNumber,
        },
        StreakBadge: {
          address: streakBadgeAddress,
          blockNumber: blockNumber,
        },
      },
      timestamp: new Date().toISOString(),
      blockNumber: blockNumber,
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
      console.log("\n✓ Created deployments directory");
    }

    // Save deployment info to JSON file
    const deploymentPath = path.join(deploymentsDir, "deployment.json");
    fs.writeFileSync(
      deploymentPath,
      JSON.stringify(deploymentInfo, null, 2),
      "utf-8"
    );
    console.log("✓ Deployment info saved to:", deploymentPath);

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("DEPLOYMENT SUMMARY");
    console.log("=".repeat(60));
    console.log("Network:", network.name);
    console.log("Chain ID:", network.chainId);
    console.log("Block Number:", blockNumber);
    console.log("\nContracts:");
    console.log("  StreakBeastCore:", streakBeastCoreAddress);
    console.log("  StreakBadge:", streakBadgeAddress);
    console.log("\nConfiguration:");
    console.log("  Deployer:", deployer.address);
    console.log("  Agent:", agentAddress);
    console.log("=".repeat(60));
    console.log("\n✓ Deployment completed successfully!");
  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  }
}

// Execute main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });