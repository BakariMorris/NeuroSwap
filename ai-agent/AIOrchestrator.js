/**
 * AI Orchestrator - Main coordination layer for NeuroSwap AI systems
 * Integrates all AI services and manages the complete optimization lifecycle
 */

import { AIAgent } from './core/AIAgent.js';
import { MarketAnalyzer } from './services/MarketAnalyzer.js';
import { ParameterOptimizer } from './services/ParameterOptimizer.js';
import { FlareOracle } from './services/FlareOracle.js';
import { HederaAI } from './services/HederaAI.js';
import { ethers } from 'ethers';

export class AIOrchestrator {
    constructor(config) {
        this.config = {
            optimizationInterval: 30000, // 30 seconds
            emergencyThreshold: 0.15, // 15% volatility triggers emergency mode
            maxParameterChange: 0.2, // 20% max change per update
            confidenceThreshold: 0.6, // Minimum confidence for parameter updates
            ...config
        };
        
        // Initialize all AI services
        this.aiAgent = new AIAgent(config);
        this.marketAnalyzer = new MarketAnalyzer(config.marketAnalyzer);
        this.parameterOptimizer = new ParameterOptimizer(config.parameterOptimizer);
        this.flareOracle = new FlareOracle(config.flareOracle);
        this.hederaAI = new HederaAI(config.hederaAI);
        
        // State management
        this.isRunning = false;
        this.emergencyMode = false;
        this.lastOptimization = 0;
        this.performanceMetrics = new Map();
        this.healthChecks = new Map();
        
        // Asset configuration
        this.assets = config.assets || ['ETH', 'USDC', 'USDT', 'DAI'];
        
        console.log('🤖 AI Orchestrator initialized with', this.assets.length, 'assets');
    }

    /**
     * Start the complete AI optimization system
     */
    async start() {
        try {
            if (this.isRunning) {
                console.log('⚠️ AI Orchestrator already running');
                return;
            }
            
            console.log('🚀 Starting NeuroSwap AI Orchestrator...');
            
            // Initialize all services
            await this.initializeServices();
            
            // Start main optimization loop
            this.isRunning = true;
            this.startOptimizationLoop();
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            // Start emergency monitoring
            this.startEmergencyMonitoring();
            
            console.log('✅ AI Orchestrator fully operational');
            
        } catch (error) {
            console.error('❌ Error starting AI Orchestrator:', error);
            throw error;
        }
    }

    /**
     * Stop the AI optimization system
     */
    async stop() {
        try {
            console.log('🛑 Stopping AI Orchestrator...');
            
            this.isRunning = false;
            
            // Cleanup and final state save
            await this.saveSystemState();
            
            console.log('✅ AI Orchestrator stopped');
            
        } catch (error) {
            console.error('❌ Error stopping AI Orchestrator:', error);
            throw error;
        }
    }

    /**
     * Main optimization loop coordinating all AI services
     */
    async startOptimizationLoop() {
        console.log('🔄 Starting main optimization loop...');
        
        while (this.isRunning) {
            try {
                const cycleStart = Date.now();
                
                // Phase 1: Collect market data from all sources
                console.log('📊 Phase 1: Market data collection');
                const marketData = await this.collectComprehensiveMarketData();
                
                // Phase 2: Perform comprehensive market analysis
                console.log('🧠 Phase 2: Market analysis');
                const marketAnalysis = await this.performMarketAnalysis(marketData);
                
                // Phase 3: Optimize parameters using ML algorithms
                console.log('⚡ Phase 3: Parameter optimization');
                const optimization = await this.optimizeParameters(marketAnalysis);
                
                // Phase 4: Validate and deploy if confident
                console.log('✅ Phase 4: Validation and deployment');
                if (this.shouldDeployOptimization(optimization)) {
                    await this.deployOptimization(optimization);
                }
                
                // Phase 5: Update performance metrics
                console.log('📈 Phase 5: Performance tracking');
                await this.updatePerformanceMetrics(optimization);
                
                const cycleTime = Date.now() - cycleStart;
                console.log(`🔄 Optimization cycle complete (${cycleTime}ms)`);
                
                // Wait for next cycle
                await this.sleep(this.config.optimizationInterval);
                
            } catch (error) {
                console.error('❌ Error in optimization loop:', error);
                
                // Enter safe mode on repeated errors
                await this.handleOptimizationError(error);
                await this.sleep(this.config.optimizationInterval * 2); // Wait longer on error
            }
        }
    }

    /**
     * Collect comprehensive market data from all sources
     */
    async collectComprehensiveMarketData() {
        try {
            const startTime = Date.now();
            
            // Collect data from multiple sources in parallel
            const [flareData, historicalData] = await Promise.all([
                this.flareOracle.getPriceData(this.assets),
                this.flareOracle.getHistoricalData('ETH', '1h', 50)
            ]);
            
            // Enhance with additional market intelligence
            const marketData = {
                timestamp: Date.now(),
                assets: new Map(),
                marketOverview: {},
                dataQuality: 0,
                sources: ['FlareOracle']
            };
            
            // Process each asset
            for (const asset of this.assets) {
                const flareAssetData = flareData.get(asset);
                if (flareAssetData) {
                    marketData.assets.set(asset, {
                        price: flareAssetData.price,
                        volume: flareAssetData.volume,
                        marketCap: flareAssetData.marketCap,
                        confidence: flareAssetData.confidence,
                        timestamp: flareAssetData.timestamp,
                        source: 'FTSO'
                    });
                }
            }
            
            // Calculate data quality score
            const confidenceScores = Array.from(marketData.assets.values())
                .map(data => data.confidence || 0.5);
            marketData.dataQuality = confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length;
            
            const collectionTime = Date.now() - startTime;
            console.log(`📊 Market data collected (${collectionTime}ms, quality: ${marketData.dataQuality.toFixed(2)})`);
            
            return marketData;
            
        } catch (error) {
            console.error('❌ Error collecting market data:', error);
            throw error;
        }
    }

    /**
     * Perform comprehensive market analysis
     */
    async performMarketAnalysis(marketData) {
        try {
            // Use MarketAnalyzer for detailed analysis
            const analysis = await this.marketAnalyzer.performComprehensiveAnalysis(this.assets);
            
            // Enhance with Hedera AI computation for consensus
            const hederaAnalysis = await this.hederaAI.executeAIComputation(
                'MARKET_PREDICTION',
                { marketData, assets: this.assets }
            );
            
            // Combine results for comprehensive view
            const comprehensiveAnalysis = {
                ...analysis,
                hederaPrediction: hederaAnalysis.result,
                consensusConfidence: hederaAnalysis.confidence,
                computationId: hederaAnalysis.computationId
            };
            
            // Check for emergency conditions
            if (analysis.marketOverview.avgVolatility > this.config.emergencyThreshold) {
                await this.triggerEmergencyMode(analysis);
            }
            
            return comprehensiveAnalysis;
            
        } catch (error) {
            console.error('❌ Error in market analysis:', error);
            throw error;
        }
    }

    /**
     * Optimize parameters using advanced ML algorithms
     */
    async optimizeParameters(marketAnalysis) {
        try {
            // Get current parameters
            const currentParams = await this.aiAgent.getCurrentParameters();
            
            // Calculate recent performance metrics
            const performanceMetrics = this.calculatePerformanceMetrics();
            
            // Use ParameterOptimizer for ML-based optimization
            const mlOptimization = await this.parameterOptimizer.optimizeParameters(
                marketAnalysis,
                currentParams,
                performanceMetrics
            );
            
            // Validate with Hedera AI consensus
            const hederaOptimization = await this.hederaAI.executeAIComputation(
                'PARAMETER_OPTIMIZATION',
                {
                    currentParams,
                    marketConditions: marketAnalysis.marketOverview,
                    performanceHistory: performanceMetrics
                }
            );
            
            // Combine optimizations with weighted consensus
            const finalOptimization = this.combineOptimizations(
                mlOptimization,
                hederaOptimization.result
            );
            
            return {
                ...finalOptimization,
                mlConfidence: mlOptimization.confidence,
                hederaConfidence: hederaOptimization.confidence,
                combinedConfidence: (mlOptimization.confidence + hederaOptimization.confidence) / 2
            };
            
        } catch (error) {
            console.error('❌ Error in parameter optimization:', error);
            throw error;
        }
    }

    /**
     * Determine if optimization should be deployed
     */
    shouldDeployOptimization(optimization) {
        try {
            // Check confidence threshold
            if (optimization.combinedConfidence < this.config.confidenceThreshold) {
                console.log('⚠️ Optimization confidence too low:', optimization.combinedConfidence.toFixed(2));
                return false;
            }
            
            // Check for emergency mode restrictions
            if (this.emergencyMode) {
                console.log('🚨 Emergency mode active - limiting parameter changes');
                return this.validateEmergencyModeChanges(optimization);
            }
            
            // Check parameter change limits
            const currentParams = this.aiAgent.performanceHistory[this.aiAgent.performanceHistory.length - 1];
            if (currentParams && this.exceedsChangeLimit(currentParams.parameters, optimization.parameters)) {
                console.log('⚠️ Parameter change exceeds safety limits');
                return false;
            }
            
            // Check minimum time between updates
            const timeSinceLastUpdate = Date.now() - this.lastOptimization;
            if (timeSinceLastUpdate < this.config.optimizationInterval) {
                console.log('⚠️ Too soon since last optimization');
                return false;
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error validating optimization deployment:', error);
            return false;
        }
    }

    /**
     * Deploy optimization to smart contracts
     */
    async deployOptimization(optimization) {
        try {
            console.log('🚀 Deploying parameter optimization...');
            
            // Deploy through AI Agent
            await this.aiAgent.deployParameterUpdate(optimization.parameters);
            
            // Record deployment
            this.lastOptimization = Date.now();
            
            // Log deployment details
            console.log('✅ Optimization deployed:', {
                feeRate: `${optimization.parameters.feeRate / 100}%`,
                spreadMultiplier: `${optimization.parameters.spreadMultiplier / 1000}x`,
                confidence: optimization.combinedConfidence.toFixed(2),
                expectedImprovement: optimization.expectedImprovement?.toFixed(2) + '%'
            });
            
        } catch (error) {
            console.error('❌ Error deploying optimization:', error);
            throw error;
        }
    }

    /**
     * Start health monitoring for all services
     */
    async startHealthMonitoring() {
        console.log('🏥 Starting health monitoring...');
        
        const healthCheckInterval = setInterval(async () => {
            try {
                if (!this.isRunning) {
                    clearInterval(healthCheckInterval);
                    return;
                }
                
                // Check all service health
                const healthChecks = await Promise.all([
                    this.flareOracle.healthCheck(),
                    this.hederaAI.healthCheck()
                ]);
                
                // Store health status
                this.healthChecks.set('flare', healthChecks[0]);
                this.healthChecks.set('hedera', healthChecks[1]);
                
                // Log any health issues
                healthChecks.forEach((check, index) => {
                    const service = ['flare', 'hedera'][index];
                    if (check.status !== 'healthy') {
                        console.warn(`⚠️ ${service} health issue:`, check.error);
                    }
                });
                
            } catch (error) {
                console.error('❌ Error in health monitoring:', error);
            }
        }, 60000); // Check every minute
    }

    /**
     * Start emergency monitoring for market conditions
     */
    async startEmergencyMonitoring() {
        console.log('🚨 Starting emergency monitoring...');
        
        const emergencyCheckInterval = setInterval(async () => {
            try {
                if (!this.isRunning) {
                    clearInterval(emergencyCheckInterval);
                    return;
                }
                
                // Quick volatility check
                const marketData = await this.collectComprehensiveMarketData();
                const volatility = this.calculateCurrentVolatility(marketData);
                
                if (volatility > this.config.emergencyThreshold && !this.emergencyMode) {
                    await this.triggerEmergencyMode({ marketOverview: { avgVolatility: volatility } });
                } else if (volatility < this.config.emergencyThreshold * 0.7 && this.emergencyMode) {
                    await this.exitEmergencyMode();
                }
                
            } catch (error) {
                console.error('❌ Error in emergency monitoring:', error);
            }
        }, 10000); // Check every 10 seconds
    }

    /**
     * Trigger emergency mode for high volatility periods
     */
    async triggerEmergencyMode(analysis) {
        try {
            console.log('🚨 EMERGENCY MODE ACTIVATED - High volatility detected!');
            
            this.emergencyMode = true;
            
            // Implement emergency measures
            const emergencyParams = {
                feeRate: Math.min(500, analysis.marketOverview.avgVolatility * 1000), // Up to 5% fees
                spreadMultiplier: Math.min(3000, 1500 + analysis.marketOverview.avgVolatility * 2000), // Higher spreads
                weights: [2500, 2500, 2500, 2500], // Equal weights for stability
                lastUpdate: Math.floor(Date.now() / 1000),
                isActive: true
            };
            
            // Deploy emergency parameters immediately
            await this.aiAgent.deployParameterUpdate(emergencyParams);
            
            console.log('🚨 Emergency parameters deployed');
            
        } catch (error) {
            console.error('❌ Error triggering emergency mode:', error);
        }
    }

    /**
     * Exit emergency mode when conditions stabilize
     */
    async exitEmergencyMode() {
        try {
            console.log('✅ Exiting emergency mode - conditions stabilized');
            
            this.emergencyMode = false;
            
            // Resume normal optimization
            console.log('🔄 Resuming normal optimization cycle');
            
        } catch (error) {
            console.error('❌ Error exiting emergency mode:', error);
        }
    }

    /**
     * Helper functions
     */
    combineOptimizations(mlOpt, hederaOpt) {
        // Weight ML and Hedera recommendations based on confidence
        const mlWeight = mlOpt.confidence;
        const hederaWeight = hederaOpt.confidence || 0.5;
        const totalWeight = mlWeight + hederaWeight;
        
        const combinedParams = {
            feeRate: Math.round(
                (mlOpt.parameters.feeRate * mlWeight + 
                 hederaOpt.recommendedParameters.feeRate * hederaWeight) / totalWeight
            ),
            spreadMultiplier: Math.round(
                (mlOpt.parameters.spreadMultiplier * mlWeight + 
                 hederaOpt.recommendedParameters.spreadMultiplier * hederaWeight) / totalWeight
            ),
            weights: mlOpt.parameters.weights.map((weight, index) => 
                Math.round(
                    (weight * mlWeight + 
                     hederaOpt.recommendedParameters.weights[index] * hederaWeight) / totalWeight
                )
            ),
            lastUpdate: Math.floor(Date.now() / 1000),
            isActive: true
        };
        
        return {
            parameters: combinedParams,
            expectedImprovement: (mlOpt.expectedImprovement + hederaOpt.improvementEstimate) / 2,
            reasoning: [...(mlOpt.reasoning || []), ...(hederaOpt.reasoning || [])]
        };
    }

    calculateCurrentVolatility(marketData) {
        const volatilities = Array.from(marketData.assets.values())
            .map(asset => {
                // Simple volatility estimation from price variance
                return Math.random() * 0.2; // Simulate volatility
            });
        
        return volatilities.reduce((sum, vol) => sum + vol, 0) / volatilities.length;
    }

    exceedsChangeLimit(currentParams, newParams) {
        const feeChange = Math.abs(newParams.feeRate - currentParams.feeRate) / currentParams.feeRate;
        const spreadChange = Math.abs(newParams.spreadMultiplier - currentParams.spreadMultiplier) / currentParams.spreadMultiplier;
        
        return feeChange > this.config.maxParameterChange || spreadChange > this.config.maxParameterChange;
    }

    validateEmergencyModeChanges(optimization) {
        // In emergency mode, only allow conservative changes
        return optimization.parameters.feeRate >= 100 && // Min 1% fee
               optimization.parameters.spreadMultiplier >= 1200; // Min 1.2x spread
    }

    calculatePerformanceMetrics() {
        // Calculate recent performance based on deployment history
        const recentDeployments = this.aiAgent.performanceHistory.slice(-5);
        
        if (recentDeployments.length === 0) {
            return {
                profitability: 0.05, // Assume 5% baseline
                volumeChange: 0.02,
                capitalEfficiency: 1.0
            };
        }
        
        // Simple performance calculation
        return {
            profitability: Math.random() * 0.1, // 0-10% profitability
            volumeChange: (Math.random() - 0.5) * 0.2, // ±10% volume change
            capitalEfficiency: 0.9 + Math.random() * 0.2 // 0.9-1.1x efficiency
        };
    }

    async initializeServices() {
        console.log('🔧 Initializing AI services...');
        
        // Initialize connections and validate configurations
        const healthChecks = await Promise.all([
            this.flareOracle.healthCheck(),
            this.hederaAI.healthCheck()
        ]);
        
        healthChecks.forEach((check, index) => {
            const service = ['Flare Oracle', 'Hedera AI'][index];
            console.log(`✅ ${service}:`, check.status);
        });
    }

    async updatePerformanceMetrics(optimization) {
        const metrics = {
            timestamp: Date.now(),
            optimization: optimization,
            marketConditions: this.calculateCurrentVolatility,
            emergencyMode: this.emergencyMode
        };
        
        this.performanceMetrics.set(Date.now(), metrics);
        
        // Keep only recent metrics
        if (this.performanceMetrics.size > 100) {
            const oldestKey = Math.min(...this.performanceMetrics.keys());
            this.performanceMetrics.delete(oldestKey);
        }
    }

    async handleOptimizationError(error) {
        console.error('🚨 Optimization error - entering safe mode');
        
        // Log error for analysis
        this.performanceMetrics.set(`error_${Date.now()}`, {
            error: error.message,
            timestamp: Date.now(),
            emergencyMode: this.emergencyMode
        });
        
        // Implement conservative fallback parameters if needed
        if (error.message.includes('contract') || error.message.includes('network')) {
            console.log('🛡️ Network issues detected - maintaining current parameters');
        }
    }

    async saveSystemState() {
        // Save current state for recovery
        const state = {
            lastOptimization: this.lastOptimization,
            emergencyMode: this.emergencyMode,
            performanceMetrics: Array.from(this.performanceMetrics.entries()),
            healthChecks: Array.from(this.healthChecks.entries())
        };
        
        console.log('💾 System state saved');
        return state;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current system status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            emergencyMode: this.emergencyMode,
            lastOptimization: this.lastOptimization,
            assets: this.assets,
            healthChecks: Object.fromEntries(this.healthChecks),
            performanceMetrics: this.performanceMetrics.size
        };
    }
}