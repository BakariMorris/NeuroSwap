import { expect } from "chai";
import { ethers } from "hardhat";

describe("Cross-Chain Integration Tests", function () {
    let aimm, layerZeroAMM, chainlinkCCIPAMM;
    let deployer, aiAgent, user1;
    let tokenA, tokenB;
    
    beforeEach(async function () {
        [deployer, aiAgent, user1] = await ethers.getSigners();
        
        // Deploy test tokens
        const TestToken = await ethers.getContractFactory("TestERC20");
        tokenA = await TestToken.deploy("Token A", "TKA", ethers.parseEther("1000000"));
        tokenB = await TestToken.deploy("Token B", "TKB", ethers.parseEther("1000000"));
        
        // Deploy AIMM
        const AIMM = await ethers.getContractFactory("AIMM");
        aimm = await AIMM.deploy(aiAgent.address);
        
        // Deploy LayerZero AMM
        const LayerZeroAMM = await ethers.getContractFactory("LayerZeroAMM");
        layerZeroAMM = await LayerZeroAMM.deploy(
            deployer.address, // Mock endpoint
            deployer.address, // Delegate
            aimm.address
        );
        
        // Deploy Chainlink CCIP AMM
        const ChainlinkCCIPAMM = await ethers.getContractFactory("ChainlinkCCIPAMM");
        chainlinkCCIPAMM = await ChainlinkCCIPAMM.deploy(
            deployer.address, // Mock router
            aimm.address
        );
    });
    
    describe("LayerZero Integration", function () {
        it("Should deploy LayerZero AMM successfully", async function () {
            expect(await layerZeroAMM.aimm()).to.equal(aimm.address);
            expect(await layerZeroAMM.layerZeroEndpoint()).to.equal(deployer.address);
        });
        
        it("Should add trusted chains", async function () {
            const chainId = 40161; // Sepolia EID
            
            await expect(layerZeroAMM.addTrustedChain(chainId))
                .to.emit(layerZeroAMM, "TrustedChainAdded")
                .withArgs(chainId);
            
            expect(await layerZeroAMM.trustedChains(chainId)).to.be.true;
        });
        
        it("Should set remote peers", async function () {
            const chainId = 40161;
            const peerAddress = user1.address;
            
            await layerZeroAMM.setPeer(chainId, peerAddress);
            expect(await layerZeroAMM.remotePeers(chainId)).to.equal(peerAddress);
        });
        
        it("Should sync parameters", async function () {
            const poolParams = {
                feeRate: 500,
                spreadMultiplier: 10500,
                weights: [4000, 6000],
                lastUpdate: Math.floor(Date.now() / 1000),
                isActive: true
            };
            
            const pairAddress = await aimm.getPairAddress(tokenA.address, tokenB.address);
            const messageHash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256", "uint256[]", "uint256"],
                [pairAddress, poolParams.feeRate, poolParams.spreadMultiplier, poolParams.weights, poolParams.lastUpdate]
            );
            
            const signature = await aiAgent.signMessage(ethers.getBytes(messageHash));
            
            await expect(layerZeroAMM.syncParameters(
                40161, // Mock destination EID
                pairAddress,
                poolParams,
                signature
            )).to.emit(layerZeroAMM, "ParametersSynced");
        });
        
        it("Should initiate cross-chain swap", async function () {
            const swapAmount = ethers.parseEther("10");
            
            await tokenA.mint(user1.address, swapAmount);
            await tokenA.connect(user1).approve(layerZeroAMM.address, swapAmount);
            
            await expect(layerZeroAMM.connect(user1).crossChainSwap(
                40161, // Mock destination EID
                tokenA.address,
                tokenB.address,
                swapAmount,
                0,
                user1.address
            )).to.emit(layerZeroAMM, "CrossChainSwapInitiated");
        });
        
        it("Should reject unauthorized chain operations", async function () {
            await expect(layerZeroAMM.connect(user1).addTrustedChain(40161))
                .to.be.revertedWithCustomError(layerZeroAMM, "OwnableUnauthorizedAccount");
        });
    });
    
    describe("Chainlink CCIP Integration", function () {
        it("Should deploy Chainlink CCIP AMM successfully", async function () {
            expect(await chainlinkCCIPAMM.aimm()).to.equal(aimm.address);
            expect(await chainlinkCCIPAMM.ccipRouter()).to.equal(deployer.address);
        });
        
        it("Should allowlist destination chains", async function () {
            const chainSelector = "16015286601757825753"; // Sepolia
            
            await chainlinkCCIPAMM.allowlistDestinationChain(chainSelector, true);
            expect(await chainlinkCCIPAMM.allowlistedChains(chainSelector)).to.be.true;
        });
        
        it("Should allowlist senders", async function () {
            await chainlinkCCIPAMM.allowlistSender(user1.address, true);
            expect(await chainlinkCCIPAMM.allowlistedSenders(user1.address)).to.be.true;
        });
        
        it("Should send parameter updates", async function () {
            const chainSelector = "16015286601757825753";
            await chainlinkCCIPAMM.allowlistDestinationChain(chainSelector, true);
            
            const poolParams = {
                feeRate: 400,
                spreadMultiplier: 10200,
                weights: [5500, 4500],
                lastUpdate: Math.floor(Date.now() / 1000),
                isActive: true
            };
            
            const pairAddress = await aimm.getPairAddress(tokenA.address, tokenB.address);
            const messageHash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256", "uint256[]", "uint256"],
                [pairAddress, poolParams.feeRate, poolParams.spreadMultiplier, poolParams.weights, poolParams.lastUpdate]
            );
            
            const signature = await aiAgent.signMessage(ethers.getBytes(messageHash));
            
            await expect(chainlinkCCIPAMM.sendParameterUpdate(
                chainSelector,
                user1.address,
                pairAddress,
                poolParams,
                signature
            )).to.emit(chainlinkCCIPAMM, "MessageSent");
        });
        
        it("Should reject unauthorized chain operations", async function () {
            await expect(chainlinkCCIPAMM.connect(user1).allowlistDestinationChain("12345", true))
                .to.be.revertedWithCustomError(chainlinkCCIPAMM, "OwnableUnauthorizedAccount");
        });
        
        it("Should reject sends to non-allowlisted chains", async function () {
            const poolParams = {
                feeRate: 400,
                spreadMultiplier: 10200,
                weights: [5500, 4500],
                lastUpdate: Math.floor(Date.now() / 1000),
                isActive: true
            };
            
            const pairAddress = await aimm.getPairAddress(tokenA.address, tokenB.address);
            const messageHash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256", "uint256[]", "uint256"],
                [pairAddress, poolParams.feeRate, poolParams.spreadMultiplier, poolParams.weights, poolParams.lastUpdate]
            );
            
            const signature = await aiAgent.signMessage(ethers.getBytes(messageHash));
            
            await expect(chainlinkCCIPAMM.sendParameterUpdate(
                "123456789", // Non-allowlisted chain
                user1.address,
                pairAddress,
                poolParams,
                signature
            )).to.be.revertedWithCustomError(chainlinkCCIPAMM, "DestinationChainNotAllowed");
        });
    });
    
    describe("Integration Testing", function () {
        it("Should maintain parameter consistency across integrations", async function () {
            const baseTime = Math.floor(Date.now() / 1000);
            
            const poolParams = {
                feeRate: 350,
                spreadMultiplier: 10100,
                weights: [4800, 5200],
                lastUpdate: baseTime,
                isActive: true
            };
            
            const pairAddress = await aimm.getPairAddress(tokenA.address, tokenB.address);
            const messageHash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256", "uint256[]", "uint256"],
                [pairAddress, poolParams.feeRate, poolParams.spreadMultiplier, poolParams.weights, poolParams.lastUpdate]
            );
            
            const signature = await aiAgent.signMessage(ethers.getBytes(messageHash));
            
            // Update via direct AIMM call
            await aimm.updateParameters(pairAddress, poolParams, signature);
            
            // Verify parameters are stored correctly
            const storedParams = await aimm.poolParameters(pairAddress);
            expect(storedParams.feeRate).to.equal(poolParams.feeRate);
            expect(storedParams.spreadMultiplier).to.equal(poolParams.spreadMultiplier);
            expect(storedParams.isActive).to.equal(poolParams.isActive);
            
            // Test cross-chain integrations with newer timestamps  
            await layerZeroAMM.addTrustedChain(40161);
            
            const lzPoolParams = {
                ...poolParams,
                lastUpdate: baseTime + 100
            };
            
            const lzMessageHash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256", "uint256[]", "uint256"],
                [pairAddress, lzPoolParams.feeRate, lzPoolParams.spreadMultiplier, lzPoolParams.weights, lzPoolParams.lastUpdate]
            );
            
            const lzSignature = await aiAgent.signMessage(ethers.getBytes(lzMessageHash));
            await layerZeroAMM.syncParameters(40161, pairAddress, lzPoolParams, lzSignature);
            
            await chainlinkCCIPAMM.allowlistDestinationChain("16015286601757825753", true);
            
            const ccipPoolParams = {
                ...poolParams,
                lastUpdate: baseTime + 200
            };
            
            const ccipMessageHash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256", "uint256[]", "uint256"],
                [pairAddress, ccipPoolParams.feeRate, ccipPoolParams.spreadMultiplier, ccipPoolParams.weights, ccipPoolParams.lastUpdate]
            );
            
            const ccipSignature = await aiAgent.signMessage(ethers.getBytes(ccipMessageHash));
            await chainlinkCCIPAMM.sendParameterUpdate(
                "16015286601757825753",
                user1.address,
                pairAddress,
                ccipPoolParams,
                ccipSignature
            );
        });
    });
});