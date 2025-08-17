import { ethers } from "hardhat";
import { writeFileSync, readFileSync, existsSync } from "fs";

const CCIP_ROUTERS = {
    sepolia: "0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59",
    baseSepolia: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
    arbitrumSepolia: "0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165",
};

const PRICE_FEEDS = {
    sepolia: {
        "ETH/USD": "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    baseSepolia: {
        "ETH/USD": "0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1"
    },
    arbitrumSepolia: {
        "ETH/USD": "0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165"
    }
};

async function main() {
    console.log("🔗 Deploying Chainlink CCIP AMM integration...");
    
    const [deployer] = await ethers.getSigners();
    const network = hre.network.name;
    
    console.log("Network:", network);
    console.log("Deployer:", deployer.address);
    
    const coreDeploymentPath = `./deployments/${network}.json`;
    if (!existsSync(coreDeploymentPath)) {
        throw new Error(`Core deployment not found for ${network}`);
    }
    
    const coreDeployment = JSON.parse(readFileSync(coreDeploymentPath, 'utf8'));
    const aimmAddress = coreDeployment.contracts.AIMM;
    
    const ccipRouter = CCIP_ROUTERS[network];
    if (!ccipRouter) {
        throw new Error(`CCIP router not configured for ${network}`);
    }
    
    console.log("📄 Deploying ChainlinkCCIPAMM contract...");
    console.log("AIMM Address:", aimmAddress);
    console.log("CCIP Router:", ccipRouter);
    
    const ChainlinkCCIPAMM = await ethers.getContractFactory("ChainlinkCCIPAMM");
    const chainlinkCCIPAMM = await ChainlinkCCIPAMM.deploy(
        ccipRouter,
        aimmAddress
    );
    
    await chainlinkCCIPAMM.waitForDeployment();
    const chainlinkCCIPAMMAddress = await chainlinkCCIPAMM.getAddress();
    
    console.log("✅ ChainlinkCCIPAMM deployed to:", chainlinkCCIPAMMAddress);
    
    const priceFeeds = PRICE_FEEDS[network];
    if (priceFeeds) {
        console.log("📊 Configuring price feeds...");
        for (const [pair, feedAddress] of Object.entries(priceFeeds)) {
            try {
                const dummyToken = ethers.ZeroAddress;
                const tx = await chainlinkCCIPAMM.setPriceFeed(dummyToken, feedAddress);
                await tx.wait();
                console.log(`✅ Set price feed for ${pair}: ${feedAddress}`);
            } catch (error) {
                console.log(`⚠️  Failed to set price feed for ${pair}:`, error.message);
            }
        }
    }
    
    const chainSelectors = {
        sepolia: "16015286601757825753",
        baseSepolia: "10344971235874465080", 
        arbitrumSepolia: "3478487238524512106"
    };
    
    console.log("🔗 Configuring allowlisted chains...");
    for (const [chainName, selector] of Object.entries(chainSelectors)) {
        if (chainName !== network) {
            try {
                const tx = await chainlinkCCIPAMM.allowlistDestinationChain(selector, true);
                await tx.wait();
                console.log(`✅ Allowlisted chain: ${chainName} (${selector})`);
            } catch (error) {
                console.log(`⚠️  Failed to allowlist ${chainName}:`, error.message);
            }
        }
    }
    
    coreDeployment.contracts.ChainlinkCCIPAMM = chainlinkCCIPAMMAddress;
    coreDeployment.contracts.CCIPRouter = ccipRouter;
    coreDeployment.chainlink = {
        ccipRouter: ccipRouter,
        ccipContract: chainlinkCCIPAMMAddress,
        priceFeeds: priceFeeds || {},
        chainSelector: chainSelectors[network] || "unknown"
    };
    
    writeFileSync(coreDeploymentPath, JSON.stringify(coreDeployment, null, 2));
    
    console.log("💾 Updated deployment info");
    console.log("\n🎉 Chainlink CCIP integration deployed successfully!");
    console.log("Next steps:");
    console.log("1. Fund contract with LINK tokens");
    console.log("2. Configure sender allowlist");
    console.log("3. Test cross-chain messaging");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });