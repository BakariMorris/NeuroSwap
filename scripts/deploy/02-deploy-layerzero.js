import { ethers } from "hardhat";
import { writeFileSync, readFileSync, existsSync } from "fs";

const LZ_ENDPOINTS = {
    sepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    baseSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    arbitrumSepolia: "0x6EDCE65403992e310A62460808c4b910D972f10f",
    zircuitTestnet: "0x6EDCE65403992e310A62460808c4b910D972f10f"
};

async function main() {
    console.log("🌉 Deploying LayerZero AMM integration...");
    
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
    
    const lzEndpoint = LZ_ENDPOINTS[network];
    if (!lzEndpoint) {
        throw new Error(`LayerZero endpoint not configured for ${network}`);
    }
    
    console.log("📄 Deploying LayerZeroAMM contract...");
    console.log("AIMM Address:", aimmAddress);
    console.log("LZ Endpoint:", lzEndpoint);
    
    const LayerZeroAMM = await ethers.getContractFactory("LayerZeroAMM");
    const layerZeroAMM = await LayerZeroAMM.deploy(
        lzEndpoint,
        deployer.address,
        aimmAddress
    );
    
    await layerZeroAMM.waitForDeployment();
    const layerZeroAMMAddress = await layerZeroAMM.getAddress();
    
    console.log("✅ LayerZeroAMM deployed to:", layerZeroAMMAddress);
    
    const trustedChains = [
        { name: "sepolia", eid: 40161 },
        { name: "baseSepolia", eid: 40245 },
        { name: "arbitrumSepolia", eid: 40231 }
    ];
    
    console.log("🔗 Configuring trusted chains...");
    for (const chain of trustedChains) {
        if (chain.name !== network) {
            try {
                const tx = await layerZeroAMM.addTrustedChain(chain.eid);
                await tx.wait();
                console.log(`✅ Added trusted chain: ${chain.name} (EID: ${chain.eid})`);
            } catch (error) {
                console.log(`⚠️  Failed to add ${chain.name}:`, error.message);
            }
        }
    }
    
    coreDeployment.contracts.LayerZeroAMM = layerZeroAMMAddress;
    coreDeployment.contracts.LayerZeroEndpoint = lzEndpoint;
    coreDeployment.layerzero = {
        endpoint: lzEndpoint,
        contract: layerZeroAMMAddress,
        trustedChains: trustedChains.filter(c => c.name !== network)
    };
    
    writeFileSync(coreDeploymentPath, JSON.stringify(coreDeployment, null, 2));
    
    console.log("💾 Updated deployment info");
    console.log("\n🎉 LayerZero integration deployed successfully!");
    console.log("Next steps:");
    console.log("1. Deploy on other chains");
    console.log("2. Configure peer addresses");
    console.log("3. Test cross-chain messaging");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });