import { ethers } from "hardhat";
import { writeFileSync, readFileSync } from "fs";

async function main() {
    console.log("🚀 Deploying AIMM to Zircuit Testnet...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)));
    
    const aiAgentAddress = deployer.address;
    
    console.log("📄 Deploying AIMM contract...");
    const AIMM = await ethers.getContractFactory("AIMM");
    const aimm = await AIMM.deploy(aiAgentAddress);
    await aimm.waitForDeployment();
    
    const aimmAddress = await aimm.getAddress();
    console.log("✅ AIMM deployed to:", aimmAddress);
    
    console.log("🪙 Deploying test tokens...");
    const TestToken = await ethers.getContractFactory("TestERC20");
    
    const tokenA = await TestToken.deploy("Test Token A", "TTA", ethers.parseEther("1000000"));
    await tokenA.waitForDeployment();
    const tokenAAddress = await tokenA.getAddress();
    
    const tokenB = await TestToken.deploy("Test Token B", "TTB", ethers.parseEther("1000000"));
    await tokenB.waitForDeployment();
    const tokenBAddress = await tokenB.getAddress();
    
    console.log("✅ Test Token A deployed to:", tokenAAddress);
    console.log("✅ Test Token B deployed to:", tokenBAddress);
    
    const deploymentInfo = {
        network: "zircuitTestnet",
        chainId: 48899,
        deployer: deployer.address,
        contracts: {
            AIMM: aimmAddress,
            TestTokenA: tokenAAddress,
            TestTokenB: tokenBAddress
        },
        timestamp: new Date().toISOString()
    };
    
    writeFileSync(
        "./deployments/zircuit-testnet.json",
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("💾 Deployment info saved to deployments/zircuit-testnet.json");
    
    console.log("🔧 Initializing pool parameters...");
    const poolParams = {
        feeRate: 300,
        spreadMultiplier: 10000,
        weights: [5000, 5000],
        lastUpdate: Math.floor(Date.now() / 1000),
        isActive: true
    };
    
    const pairAddress = await aimm.getPairAddress(tokenAAddress, tokenBAddress);
    console.log("📊 Pool pair address:", pairAddress);
    
    const messageHash = ethers.solidityPackedKeccak256(
        ["address", "uint256", "uint256", "uint256[]", "uint256"],
        [pairAddress, poolParams.feeRate, poolParams.spreadMultiplier, poolParams.weights, poolParams.lastUpdate]
    );
    
    const signature = await deployer.signMessage(ethers.getBytes(messageHash));
    
    try {
        const tx = await aimm.updateParameters(pairAddress, poolParams, signature);
        await tx.wait();
        console.log("✅ Pool parameters initialized");
    } catch (error) {
        console.log("⚠️  Parameter initialization failed:", error.message);
    }
    
    console.log("\n🎉 Core deployment completed successfully!");
    console.log("Next steps:");
    console.log("1. Verify contracts on Zircuit Explorer");
    console.log("2. Add initial liquidity");
    console.log("3. Deploy LayerZero integration");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });