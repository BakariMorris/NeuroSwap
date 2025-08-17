/**
 * NeuroSwap AI Agent Entry Point
 * Initializes and starts the complete AI-driven AMM system
 */

import { AIOrchestrator } from './AIOrchestrator.js';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Main function to initialize and start NeuroSwap AI
 */
async function main() {
    try {
        console.log('🚀 Initializing NeuroSwap AI System...');
        console.log('=====================================');
        
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
        const privateKey = process.env.PRIVATE_KEY || ethers.Wallet.createRandom().privateKey;
        const signer = new ethers.Wallet(privateKey, provider);
        
        console.log('🔑 Wallet Address:', signer.address);
        
        // Contract addresses (from deployment)
        const contractAddresses = {
            aimm: process.env.AIMM_CONTRACT || '0x...', // Replace with actual addresses
            layerZero: process.env.LAYERZERO_CONTRACT || '0x...',
            chainlink: process.env.CHAINLINK_CONTRACT || '0x...'
        };
        
        // Load contract interfaces
        const aimmContract = new ethers.Contract(
            contractAddresses.aimm,
            [], // ABI would be loaded from artifacts
            signer
        );
        
        // AI Orchestrator configuration
        const config = {
            // Blockchain configuration
            provider: provider,
            signer: signer,
            aimmContract: aimmContract,
            layerZeroContract: null, // Will be initialized if deployed
            chainlinkContract: null, // Will be initialized if deployed
            
            // AI Agent configuration
            optimizationInterval: 30000, // 30 seconds
            emergencyThreshold: 0.15, // 15% volatility
            maxParameterChange: 0.2, // 20% max change
            confidenceThreshold: 0.6, // 60% minimum confidence
            
            // Market Analyzer configuration
            marketAnalyzer: {
                historicalDataPoints: 100,
                volatilityWindow: 20,
                trendAnalysisWindow: 50,
                updateInterval: 30000
            },
            
            // Parameter Optimizer configuration
            parameterOptimizer: {
                learningRate: 0.01,
                explorationRate: 0.1,
                populationSize: 50,
                mutationRate: 0.1
            },
            
            // Flare Oracle configuration
            flareOracle: {
                provider: provider,
                network: process.env.FLARE_NETWORK || 'songbird',
                updateInterval: 60000,
                maxDataAge: 300000
            },
            
            // Hedera AI configuration
            hederaAI: {
                network: process.env.HEDERA_NETWORK || 'testnet',
                accountId: process.env.HEDERA_ACCOUNT_ID,
                privateKey: process.env.HEDERA_PRIVATE_KEY,
                maxComputeTime: 30000
            },
            
            // Asset configuration
            assets: ['ETH', 'USDC', 'USDT', 'DAI', 'LINK']
        };
        
        // Initialize AI Orchestrator
        console.log('🤖 Creating AI Orchestrator...');
        const orchestrator = new AIOrchestrator(config);
        
        // Setup graceful shutdown
        setupGracefulShutdown(orchestrator);
        
        // Start the AI system
        console.log('🎯 Starting AI optimization system...');
        await orchestrator.start();
        
        // Display system status
        displaySystemStatus(orchestrator);
        
        // Keep the process running
        console.log('✅ NeuroSwap AI System is now operational!');
        console.log('📊 Monitor the logs for optimization updates...');
        
    } catch (error) {
        console.error('❌ Failed to start NeuroSwap AI System:', error);
        process.exit(1);
    }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(orchestrator) {
    const shutdownHandler = async (signal) => {
        console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
        
        try {
            await orchestrator.stop();
            console.log('✅ NeuroSwap AI System stopped gracefully');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    };
    
    process.on('SIGINT', () => shutdownHandler('SIGINT'));
    process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
    process.on('SIGQUIT', () => shutdownHandler('SIGQUIT'));
}

/**
 * Display system status information
 */
function displaySystemStatus(orchestrator) {
    console.log('\n🎯 NeuroSwap AI System Status');
    console.log('=============================');
    
    // Display status every 2 minutes
    setInterval(() => {
        try {
            const status = orchestrator.getStatus();
            
            console.log('\n📊 Current Status:');
            console.log(`   Running: ${status.isRunning ? '✅' : '❌'}`);
            console.log(`   Emergency Mode: ${status.emergencyMode ? '🚨' : '✅'}`);
            console.log(`   Last Optimization: ${status.lastOptimization ? new Date(status.lastOptimization).toLocaleTimeString() : 'Never'}`);
            console.log(`   Monitored Assets: ${status.assets.length}`);
            console.log(`   Performance Records: ${status.performanceMetrics}`);
            
            // Health status
            if (status.healthChecks.flare) {
                console.log(`   Flare Oracle: ${status.healthChecks.flare.status === 'healthy' ? '✅' : '⚠️'}`);
            }
            if (status.healthChecks.hedera) {
                console.log(`   Hedera AI: ${status.healthChecks.hedera.status === 'healthy' ? '✅' : '⚠️'}`);
            }
            
        } catch (error) {
            console.error('❌ Error displaying status:', error);
        }
    }, 120000); // Every 2 minutes
}

/**
 * Demo mode for testing without real contracts
 */
async function runDemo() {
    console.log('🎮 Running NeuroSwap AI in Demo Mode');
    console.log('===================================');
    
    try {
        // Create mock configuration for demo
        const config = {
            provider: null,
            signer: { address: '0xDemo123...', signMessage: async () => '0xSignature...' },
            aimmContract: {
                getAddress: async () => '0xDemoContract...',
                updateParameters: async () => ({ hash: '0xDemoTx...', wait: async () => {} }),
                getPoolParameters: async () => ({
                    feeRate: 30,
                    spreadMultiplier: 1000,
                    weights: [2500, 2500, 2500, 2500],
                    lastUpdate: Math.floor(Date.now() / 1000),
                    isActive: true
                })
            },
            
            optimizationInterval: 10000, // 10 seconds for demo
            emergencyThreshold: 0.15,
            maxParameterChange: 0.2,
            confidenceThreshold: 0.6,
            
            marketAnalyzer: { updateInterval: 10000 },
            parameterOptimizer: { learningRate: 0.01 },
            flareOracle: { updateInterval: 30000 },
            hederaAI: { network: 'demo' },
            
            assets: ['ETH', 'USDC', 'USDT']
        };
        
        const orchestrator = new AIOrchestrator(config);
        setupGracefulShutdown(orchestrator);
        
        await orchestrator.start();
        displaySystemStatus(orchestrator);
        
        console.log('✅ Demo mode active - AI system is optimizing parameters!');
        
    } catch (error) {
        console.error('❌ Demo mode failed:', error);
        process.exit(1);
    }
}

// Command line argument handling
const args = process.argv.slice(2);
if (args.includes('--demo')) {
    runDemo();
} else {
    main();
}

// Export for testing
export { main, runDemo };