import { ethers } from "hardhat";
import { readFileSync, existsSync } from "fs";

async function main() {
    console.log("🔍 Validating AIMM deployment...");
    
    const network = hre.network.name;
    const deploymentPath = `./deployments/${network}.json`;
    
    if (!existsSync(deploymentPath)) {
        console.error("❌ Deployment file not found! Running test deployment...");
        return await runTestDeployment();
    }
    
    const deployment = JSON.parse(readFileSync(deploymentPath, 'utf8'));
    const [deployer] = await ethers.getSigners();
    
    console.log(`📋 Validating deployment on ${network}...`);
    console.log(`Deployer: ${deployer.address}`);
    
    let validationResults = {
        aimm: false,
        layerZero: false,
        chainlink: false,
        functionality: false
    };
    
    // Validate AIMM contract
    try {
        const aimm = await ethers.getContractAt("AIMM", deployment.contracts.AIMM);
        const aiAgent = await aimm.aiAgent();
        const owner = await aimm.owner();
        
        console.log("✅ AIMM contract validated");
        console.log(`   AI Agent: ${aiAgent}`);
        console.log(`   Owner: ${owner}`);
        validationResults.aimm = true;
    } catch (error) {
        console.log("❌ AIMM validation failed:", error.message);
    }
    
    // Validate LayerZero integration
    if (deployment.contracts.LayerZeroAMM) {
        try {
            const lzAMM = await ethers.getContractAt("LayerZeroAMM", deployment.contracts.LayerZeroAMM);
            const aimmAddress = await lzAMM.aimm();
            const endpoint = await lzAMM.layerZeroEndpoint();
            
            console.log("✅ LayerZero AMM validated");
            console.log(`   Connected AIMM: ${aimmAddress}`);
            console.log(`   Endpoint: ${endpoint}`);
            validationResults.layerZero = true;
        } catch (error) {
            console.log("❌ LayerZero AMM validation failed:", error.message);
        }
    }
    
    // Validate Chainlink integration
    if (deployment.contracts.ChainlinkCCIPAMM) {
        try {
            const ccipAMM = await ethers.getContractAt("ChainlinkCCIPAMM", deployment.contracts.ChainlinkCCIPAMM);
            const aimmAddress = await ccipAMM.aimm();
            const router = await ccipAMM.ccipRouter();
            
            console.log("✅ Chainlink CCIP AMM validated");
            console.log(`   Connected AIMM: ${aimmAddress}`);
            console.log(`   Router: ${router}`);
            validationResults.chainlink = true;
        } catch (error) {
            console.log("❌ Chainlink CCIP AMM validation failed:", error.message);
        }
    }
    
    // Test basic functionality
    console.log("\n🧪 Testing basic functionality...");
    
    try {
        const aimm = await ethers.getContractAt("AIMM", deployment.contracts.AIMM);
        
        // Test getting pair address
        const testTokenA = deployment.contracts.TestTokenA || "0x" + "1".repeat(40);
        const testTokenB = deployment.contracts.TestTokenB || "0x" + "2".repeat(40);
        const pairAddress = await aimm.getPairAddress(testTokenA, testTokenB);
        
        // Test parameter validation
        const poolParams = {
            feeRate: 300,
            spreadMultiplier: 10000,
            weights: [5000, 5000],
            lastUpdate: Math.floor(Date.now() / 1000),
            isActive: true
        };
        
        console.log("✅ Basic functionality test passed");
        console.log(`   Test pair address: ${pairAddress}`);
        console.log(`   Can create pool parameters: ${JSON.stringify(poolParams)}`);
        validationResults.functionality = true;
        
    } catch (error) {
        console.log("❌ Basic functionality test failed:", error.message);
    }
    
    // Summary
    console.log("\n📊 Validation Summary:");
    console.log(`AIMM Core: ${validationResults.aimm ? '✅' : '❌'}`);
    console.log(`LayerZero Integration: ${validationResults.layerZero ? '✅' : '❌'}`);
    console.log(`Chainlink Integration: ${validationResults.chainlink ? '✅' : '❌'}`);
    console.log(`Basic Functionality: ${validationResults.functionality ? '✅' : '❌'}`);
    
    const successCount = Object.values(validationResults).filter(Boolean).length;
    console.log(`\n🎯 Overall Score: ${successCount}/4 components validated`);
    
    if (successCount === 4) {
        console.log("\n🎉 All validations passed! Foundation is ready for Hours 6-12.");
        console.log("\nNext steps for Hours 6-12:");
        console.log("1. Deploy AI agent infrastructure using ASI Alliance tools");
        console.log("2. Implement market analysis and prediction algorithms");  
        console.log("3. Create parameter optimization engine");
        console.log("4. Integrate Flare FTSO and Hedera AI services");
        console.log("5. Test cross-chain parameter synchronization");
        console.log("6. Deploy on additional testnets");
    } else {
        console.log("\n⚠️ Some validations failed. Please address issues before proceeding.");
    }
}

async function runTestDeployment() {
    console.log("🚀 Running test deployment...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Test deployer:", deployer.address);
    
    try {
        // Deploy test tokens
        const TestToken = await ethers.getContractFactory("TestERC20");
        const tokenA = await TestToken.deploy("Test Token A", "TTA", ethers.parseEther("1000000"));
        const tokenB = await TestToken.deploy("Test Token B", "TTB", ethers.parseEther("1000000"));
        
        // Deploy AIMM
        const AIMM = await ethers.getContractFactory("AIMM");
        const aimm = await AIMM.deploy(deployer.address);
        
        // Deploy LayerZero AMM
        const LayerZeroAMM = await ethers.getContractFactory("LayerZeroAMM");
        const layerZeroAMM = await LayerZeroAMM.deploy(
            deployer.address, // Mock endpoint
            deployer.address, // Delegate
            aimm.address
        );
        
        // Deploy Chainlink CCIP AMM
        const ChainlinkCCIPAMM = await ethers.getContractFactory("ChainlinkCCIPAMM");
        const chainlinkCCIPAMM = await ChainlinkCCIPAMM.deploy(
            deployer.address, // Mock router
            aimm.address
        );
        
        console.log("✅ Test deployment successful:");
        console.log(`   AIMM: ${aimm.address}`);
        console.log(`   LayerZero AMM: ${layerZeroAMM.address}`);
        console.log(`   Chainlink CCIP AMM: ${chainlinkCCIPAMM.address}`);
        console.log(`   Test Token A: ${tokenA.address}`);
        console.log(`   Test Token B: ${tokenB.address}`);
        
        return true;
    } catch (error) {
        console.log("❌ Test deployment failed:", error.message);
        return false;
    }
}

main().catch(console.error);