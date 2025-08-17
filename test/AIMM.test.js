import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("AIMM Core Tests", function () {
    async function deployAIMMFixture() {
        const [owner, aiAgent, user1, user2] = await ethers.getSigners();
        
        // Deploy test tokens
        const TestToken = await ethers.getContractFactory("TestERC20");
        const tokenA = await TestToken.deploy("Token A", "TKA", ethers.parseEther("1000000"));
        const tokenB = await TestToken.deploy("Token B", "TKB", ethers.parseEther("1000000"));
        
        // Deploy AIMM
        const AIMM = await ethers.getContractFactory("AIMM");
        const aimm = await AIMM.deploy(aiAgent.address);
        
        return {
            aimm,
            tokenA,
            tokenB,
            owner,
            aiAgent,
            user1,
            user2
        };
    }
    
    describe("Parameter Management", function () {
        it("Should update parameters with valid AI signature", async function () {
            const { aimm, tokenA, tokenB, aiAgent } = await loadFixture(deployAIMMFixture);
            
            const poolParams = {
                feeRate: 300,
                spreadMultiplier: 10000,
                weights: [5000, 5000],
                lastUpdate: Math.floor(Date.now() / 1000),
                isActive: true
            };
            
            const pairAddress = await aimm.getPairAddress(tokenA.address, tokenB.address);
            
            const messageHash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256", "uint256[]", "uint256"],
                [pairAddress, poolParams.feeRate, poolParams.spreadMultiplier, poolParams.weights, poolParams.lastUpdate]
            );
            
            const signature = await aiAgent.signMessage(ethers.getBytes(messageHash));
            
            await expect(aimm.updateParameters(pairAddress, poolParams, signature))
                .to.emit(aimm, "ParametersUpdated");
            
            const storedParams = await aimm.poolParameters(pairAddress);
            expect(storedParams.feeRate).to.equal(poolParams.feeRate);
            expect(storedParams.isActive).to.equal(poolParams.isActive);
        });
        
        it("Should reject invalid AI signatures", async function () {
            const { aimm, tokenA, tokenB, user1 } = await loadFixture(deployAIMMFixture);
            
            const poolParams = {
                feeRate: 300,
                spreadMultiplier: 10000,
                weights: [5000, 5000],
                lastUpdate: Math.floor(Date.now() / 1000),
                isActive: true
            };
            
            const pairAddress = await aimm.getPairAddress(tokenA.address, tokenB.address);
            
            const messageHash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256", "uint256[]", "uint256"],
                [pairAddress, poolParams.feeRate, poolParams.spreadMultiplier, poolParams.weights, poolParams.lastUpdate]
            );
            
            const invalidSignature = await user1.signMessage(ethers.getBytes(messageHash));
            
            await expect(aimm.updateParameters(pairAddress, poolParams, invalidSignature))
                .to.be.revertedWith("Invalid AI signature");
        });
        
        it("Should reject parameters with fee rate too high", async function () {
            const { aimm, tokenA, tokenB, aiAgent } = await loadFixture(deployAIMMFixture);
            
            const poolParams = {
                feeRate: 1500, // 15% - above max
                spreadMultiplier: 10000,
                weights: [5000, 5000],
                lastUpdate: Math.floor(Date.now() / 1000),
                isActive: true
            };
            
            const pairAddress = await aimm.getPairAddress(tokenA.address, tokenB.address);
            
            const messageHash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256", "uint256[]", "uint256"],
                [pairAddress, poolParams.feeRate, poolParams.spreadMultiplier, poolParams.weights, poolParams.lastUpdate]
            );
            
            const signature = await aiAgent.signMessage(ethers.getBytes(messageHash));
            
            await expect(aimm.updateParameters(pairAddress, poolParams, signature))
                .to.be.revertedWith("Fee rate too high");
        });
    });
    
    describe("Liquidity Management", function () {
        it("Should add liquidity successfully", async function () {
            const { aimm, tokenA, tokenB, user1 } = await loadFixture(deployAIMMFixture);
            
            const liquidityAmount = ethers.parseEther("100");
            
            await tokenA.mint(user1.address, liquidityAmount);
            await tokenB.mint(user1.address, liquidityAmount);
            
            await tokenA.connect(user1).approve(aimm.address, liquidityAmount);
            await tokenB.connect(user1).approve(aimm.address, liquidityAmount);
            
            await expect(aimm.connect(user1).addLiquidity(
                tokenA.address,
                tokenB.address,
                liquidityAmount,
                liquidityAmount,
                user1.address
            )).to.emit(aimm, "LiquidityAdded");
            
            const reserveA = await aimm.reserves(tokenA.address, tokenB.address);
            const reserveB = await aimm.reserves(tokenB.address, tokenA.address);
            
            expect(reserveA).to.equal(liquidityAmount);
            expect(reserveB).to.equal(liquidityAmount);
        });
        
        it("Should reject zero amounts", async function () {
            const { aimm, tokenA, tokenB, user1 } = await loadFixture(deployAIMMFixture);
            
            await expect(aimm.connect(user1).addLiquidity(
                tokenA.address,
                tokenB.address,
                0,
                ethers.parseEther("100"),
                user1.address
            )).to.be.revertedWith("Amounts must be > 0");
        });
    });
    
    describe("Swapping", function () {
        it("Should execute swaps with AI-optimized parameters", async function () {
            const { aimm, tokenA, tokenB, user1, aiAgent } = await loadFixture(deployAIMMFixture);
            
            const liquidityAmount = ethers.parseEther("1000");
            const swapAmount = ethers.parseEther("10");
            
            // Setup liquidity first
            await tokenA.mint(user1.address, liquidityAmount + swapAmount);
            await tokenB.mint(user1.address, liquidityAmount);
            
            await tokenA.connect(user1).approve(aimm.address, liquidityAmount + swapAmount);
            await tokenB.connect(user1).approve(aimm.address, liquidityAmount);
            
            await aimm.connect(user1).addLiquidity(
                tokenA.address,
                tokenB.address,
                liquidityAmount,
                liquidityAmount,
                user1.address
            );
            
            // Set up AI parameters
            const poolParams = {
                feeRate: 300, // 3%
                spreadMultiplier: 10000,
                weights: [5000, 5000],
                lastUpdate: Math.floor(Date.now() / 1000),
                isActive: true
            };
            
            const pairAddress = await aimm.getPairAddress(tokenA.address, tokenB.address);
            
            const messageHash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256", "uint256[]", "uint256"],
                [pairAddress, poolParams.feeRate, poolParams.spreadMultiplier, poolParams.weights, poolParams.lastUpdate]
            );
            
            const signature = await aiAgent.signMessage(ethers.getBytes(messageHash));
            await aimm.updateParameters(pairAddress, poolParams, signature);
            
            // Execute swap
            const swapParams = {
                tokenIn: tokenA.address,
                tokenOut: tokenB.address,
                amountIn: swapAmount,
                minAmountOut: 0,
                to: user1.address,
                deadline: Math.floor(Date.now() / 1000) + 3600
            };
            
            const expectedOut = await aimm.getAmountOut(
                swapAmount,
                tokenA.address,
                tokenB.address
            );
            
            await expect(aimm.connect(user1).swap(swapParams))
                .to.emit(aimm, "Swap")
                .withArgs(
                    tokenA.address,
                    tokenB.address,
                    swapAmount,
                    expectedOut,
                    user1.address
                );
        });
        
        it("Should reject expired swaps", async function () {
            const { aimm, tokenA, tokenB, user1 } = await loadFixture(deployAIMMFixture);
            
            const swapParams = {
                tokenIn: tokenA.address,
                tokenOut: tokenB.address,
                amountIn: ethers.parseEther("10"),
                minAmountOut: 0,
                to: user1.address,
                deadline: Math.floor(Date.now() / 1000) - 3600 // Past deadline
            };
            
            await expect(aimm.connect(user1).swap(swapParams))
                .to.be.revertedWith("Deadline exceeded");
        });
        
        it("Should reject insufficient output amount", async function () {
            const { aimm, tokenA, tokenB, user1, aiAgent } = await loadFixture(deployAIMMFixture);
            
            const liquidityAmount = ethers.parseEther("1000");
            const swapAmount = ethers.parseEther("10");
            
            // Setup liquidity
            await tokenA.mint(user1.address, liquidityAmount + swapAmount);
            await tokenB.mint(user1.address, liquidityAmount);
            
            await tokenA.connect(user1).approve(aimm.address, liquidityAmount + swapAmount);
            await tokenB.connect(user1).approve(aimm.address, liquidityAmount);
            
            await aimm.connect(user1).addLiquidity(
                tokenA.address,
                tokenB.address,
                liquidityAmount,
                liquidityAmount,
                user1.address
            );
            
            // Set AI parameters
            const poolParams = {
                feeRate: 300,
                spreadMultiplier: 10000,
                weights: [5000, 5000],
                lastUpdate: Math.floor(Date.now() / 1000),
                isActive: true
            };
            
            const pairAddress = await aimm.getPairAddress(tokenA.address, tokenB.address);
            const messageHash = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256", "uint256[]", "uint256"],
                [pairAddress, poolParams.feeRate, poolParams.spreadMultiplier, poolParams.weights, poolParams.lastUpdate]
            );
            
            const signature = await aiAgent.signMessage(ethers.getBytes(messageHash));
            await aimm.updateParameters(pairAddress, poolParams, signature);
            
            const expectedOut = await aimm.getAmountOut(
                swapAmount,
                tokenA.address,
                tokenB.address
            );
            
            const swapParams = {
                tokenIn: tokenA.address,
                tokenOut: tokenB.address,
                amountIn: swapAmount,
                minAmountOut: expectedOut * 2n, // Unrealistic expectation
                to: user1.address,
                deadline: Math.floor(Date.now() / 1000) + 3600
            };
            
            await expect(aimm.connect(user1).swap(swapParams))
                .to.be.revertedWith("Insufficient output amount");
        });
    });
    
    describe("Access Control", function () {
        it("Should allow owner to set AI agent", async function () {
            const { aimm, owner, user1 } = await loadFixture(deployAIMMFixture);
            
            await expect(aimm.connect(owner).setAIAgent(user1.address))
                .to.emit(aimm, "AIAgentUpdated");
            
            expect(await aimm.aiAgent()).to.equal(user1.address);
        });
        
        it("Should reject non-owner setting AI agent", async function () {
            const { aimm, user1, user2 } = await loadFixture(deployAIMMFixture);
            
            await expect(aimm.connect(user1).setAIAgent(user2.address))
                .to.be.revertedWithCustomError(aimm, "OwnableUnauthorizedAccount");
        });
    });
});