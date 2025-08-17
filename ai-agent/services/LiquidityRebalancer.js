/**
 * Dynamic Liquidity Rebalancing System
 * Automatically rebalances liquidity across multiple chains for optimal capital efficiency
 */

import { ethers } from 'ethers';
import { evaluate, round } from 'mathjs';

export class LiquidityRebalancer {
    constructor(config) {
        this.config = {
            rebalanceThreshold: 0.15, // 15% imbalance trigger
            minLiquidityRatio: 0.05, // 5% minimum liquidity per chain
            maxLiquidityRatio: 0.4, // 40% maximum liquidity per chain
            rebalanceInterval: 300000, // 5 minutes
            emergencyThreshold: 0.5, // 50% emergency rebalance trigger
            gasOptimizationFactor: 0.02, // 2% gas cost consideration
            ...config
        };

        // Chain and liquidity tracking
        this.chains = new Map();
        this.liquidityPools = new Map();
        this.rebalanceHistory = [];
        this.targetAllocations = new Map();
        this.currentAllocations = new Map();
        
        // Performance metrics
        this.efficiencyMetrics = new Map();
        this.rebalanceStats = {
            totalRebalances: 0,
            successfulRebalances: 0,
            totalGasSaved: 0,
            capitalEfficiencyGain: 0
        };

        // Real-time monitoring
        this.volumeTrackers = new Map();
        this.utilizationRates = new Map();
        this.priceImpactTrackers = new Map();
        
        // Cross-chain infrastructure
        this.bridgeProviders = new Map();
        this.routingOptimizer = new Map();
        
        console.log('💧 Dynamic Liquidity Rebalancer initialized');
    }

    /**
     * Initialize rebalancing system with chain configurations
     */
    async initialize(chainConfigs, bridgeConfigs) {
        try {
            console.log('🔄 Initializing dynamic liquidity rebalancing system...');
            
            // Setup chains
            for (const [chainId, config] of Object.entries(chainConfigs)) {
                await this.setupChain(chainId, config);
            }
            
            // Setup bridge providers
            for (const [bridge, config] of Object.entries(bridgeConfigs)) {
                await this.setupBridgeProvider(bridge, config);
            }
            
            // Initialize target allocations based on historical data
            await this.calculateInitialTargetAllocations();
            
            // Start monitoring systems
            await this.startLiquidityMonitoring();
            await this.startVolumeTracking();
            await this.startUtilizationMonitoring();
            
            // Start rebalancing loop
            await this.startRebalancingLoop();
            
            console.log('✅ Liquidity rebalancing system initialized for', this.chains.size, 'chains');
            
        } catch (error) {
            console.error('❌ Error initializing liquidity rebalancer:', error);
            throw error;
        }
    }

    /**
     * Setup individual chain for liquidity management
     */
    async setupChain(chainId, config) {
        try {
            this.chains.set(chainId, {
                name: config.name,
                chainId: parseInt(chainId),
                nativeToken: config.nativeToken,
                totalValueLocked: 0,
                utilizationRate: 0,
                avgVolume24h: 0,
                avgSlippage: 0,
                gasPrice: config.gasPrice || 20000000000,
                bridgeCost: config.bridgeCost || 0.001, // 0.1% bridge cost
                isActive: true
            });
            
            // Initialize liquidity tracking for supported assets
            const supportedAssets = ['ETH', 'USDC', 'USDT', 'DAI', 'LINK'];
            for (const asset of supportedAssets) {
                const poolKey = `${asset}-${chainId}`;
                this.liquidityPools.set(poolKey, {
                    asset: asset,
                    chainId: chainId,
                    totalLiquidity: 0,
                    availableLiquidity: 0,
                    utilizationRate: 0,
                    volume24h: 0,
                    fees24h: 0,
                    priceImpact: new Map(), // Size -> impact mapping
                    lastUpdated: Date.now()
                });
            }
            
            console.log(`✅ Chain ${config.name} (${chainId}) configured for liquidity management`);
            
        } catch (error) {
            console.error(`❌ Error setting up chain ${chainId}:`, error);
            throw error;
        }
    }

    /**
     * Setup bridge providers for cross-chain liquidity movement
     */
    async setupBridgeProvider(bridgeName, config) {
        try {
            this.bridgeProviders.set(bridgeName, {
                name: bridgeName,
                type: config.type, // 'layerzero', 'chainlink', 'native'
                supportedChains: config.supportedChains || [],
                baseCost: config.baseCost || 0.001,
                timeToFinality: config.timeToFinality || 300, // 5 minutes
                maxAmount: config.maxAmount || 1000000, // $1M max
                reliability: config.reliability || 0.99,
                isActive: true
            });
            
            console.log(`✅ Bridge provider ${bridgeName} configured`);
            
        } catch (error) {
            console.error(`❌ Error setting up bridge provider ${bridgeName}:`, error);
            throw error;
        }
    }

    /**
     * Main rebalancing analysis and execution
     */
    async analyzeAndRebalance() {
        try {
            console.log('🔍 Analyzing liquidity distribution for rebalancing opportunities...');
            
            // Get current state across all chains
            const currentState = await this.getCurrentLiquidityState();
            const targetState = await this.calculateOptimalTargetState(currentState);
            
            // Calculate rebalancing requirements
            const rebalanceActions = await this.calculateRebalanceActions(currentState, targetState);
            
            if (rebalanceActions.length === 0) {
                console.log('✅ Liquidity distribution is optimal, no rebalancing needed');
                return { status: 'no_action_needed', currentState, targetState };
            }
            
            // Validate and optimize rebalancing plan
            const optimizedPlan = await this.optimizeRebalancePlan(rebalanceActions);
            
            // Execute rebalancing if beneficial
            if (optimizedPlan.netBenefit > 0) {
                const execution = await this.executeRebalancePlan(optimizedPlan);
                this.updateRebalanceStats(execution);
                return { status: 'executed', execution, plan: optimizedPlan };
            } else {
                console.log('⚠️ Rebalancing would not be profitable, skipping');
                return { status: 'not_profitable', plan: optimizedPlan };
            }
            
        } catch (error) {
            console.error('❌ Error in liquidity rebalancing analysis:', error);
            return { status: 'error', error: error.message };
        }
    }

    /**
     * Get current liquidity state across all chains
     */
    async getCurrentLiquidityState() {
        try {
            const state = {
                totalLiquidity: new Map(),
                chainDistribution: new Map(),
                assetDistribution: new Map(),
                utilizationRates: new Map(),
                volumeMetrics: new Map(),
                timestamp: Date.now()
            };
            
            const assets = ['ETH', 'USDC', 'USDT', 'DAI', 'LINK'];
            const chains = Array.from(this.chains.keys());
            
            // Collect current liquidity data
            for (const asset of assets) {
                let totalAssetLiquidity = 0;
                const chainBreakdown = new Map();
                
                for (const chainId of chains) {
                    const poolKey = `${asset}-${chainId}`;
                    const pool = this.liquidityPools.get(poolKey);
                    
                    if (pool) {
                        const liquidity = await this.getPoolLiquidity(asset, chainId);
                        const utilization = await this.getPoolUtilization(asset, chainId);
                        const volume = await this.getPool24hVolume(asset, chainId);
                        
                        chainBreakdown.set(chainId, {
                            liquidity: liquidity,
                            utilization: utilization,
                            volume: volume,
                            efficiency: this.calculateChainEfficiency(chainId, liquidity, utilization, volume)
                        });
                        
                        totalAssetLiquidity += liquidity;
                    }
                }
                
                state.totalLiquidity.set(asset, totalAssetLiquidity);
                state.chainDistribution.set(asset, chainBreakdown);
                
                // Calculate current allocation percentages
                const allocations = new Map();
                for (const [chainId, data] of chainBreakdown) {
                    allocations.set(chainId, totalAssetLiquidity > 0 ? data.liquidity / totalAssetLiquidity : 0);
                }
                state.assetDistribution.set(asset, allocations);
            }
            
            return state;
            
        } catch (error) {
            console.error('❌ Error getting current liquidity state:', error);
            throw error;
        }
    }

    /**
     * Calculate optimal target state based on market conditions
     */
    async calculateOptimalTargetState(currentState) {
        try {
            const targetState = {
                targetAllocations: new Map(),
                expectedImprovement: new Map(),
                riskAdjustments: new Map(),
                timestamp: Date.now()
            };
            
            const assets = Array.from(currentState.totalLiquidity.keys());
            const chains = Array.from(this.chains.keys());
            
            for (const asset of assets) {
                const allocations = new Map();
                const chainData = currentState.chainDistribution.get(asset);
                
                // Calculate base allocations using volume-weighted approach
                let totalVolumeWeight = 0;
                const volumeWeights = new Map();
                
                for (const chainId of chains) {
                    const data = chainData.get(chainId);
                    if (data) {
                        const volumeWeight = data.volume * data.efficiency;
                        volumeWeights.set(chainId, volumeWeight);
                        totalVolumeWeight += volumeWeight;
                    }
                }
                
                // Apply constraints and optimizations
                for (const chainId of chains) {
                    const volumeWeight = volumeWeights.get(chainId) || 0;
                    let targetAllocation = totalVolumeWeight > 0 ? volumeWeight / totalVolumeWeight : 1 / chains.length;
                    
                    // Apply min/max constraints
                    targetAllocation = Math.max(targetAllocation, this.config.minLiquidityRatio);
                    targetAllocation = Math.min(targetAllocation, this.config.maxLiquidityRatio);
                    
                    // Risk adjustments based on chain reliability
                    const chainInfo = this.chains.get(chainId);
                    if (chainInfo) {
                        const riskMultiplier = this.calculateChainRiskMultiplier(chainId);
                        targetAllocation *= riskMultiplier;
                    }
                    
                    allocations.set(chainId, targetAllocation);
                }
                
                // Normalize allocations to sum to 1.0
                const totalAllocation = Array.from(allocations.values()).reduce((sum, val) => sum + val, 0);
                if (totalAllocation > 0) {
                    for (const [chainId, allocation] of allocations) {
                        allocations.set(chainId, allocation / totalAllocation);
                    }
                }
                
                targetState.targetAllocations.set(asset, allocations);
                
                // Calculate expected improvement
                const expectedImprovement = this.calculateExpectedImprovement(
                    currentState.assetDistribution.get(asset),
                    allocations,
                    chainData
                );
                targetState.expectedImprovement.set(asset, expectedImprovement);
            }
            
            return targetState;
            
        } catch (error) {
            console.error('❌ Error calculating optimal target state:', error);
            throw error;
        }
    }

    /**
     * Calculate specific rebalancing actions needed
     */
    async calculateRebalanceActions(currentState, targetState) {
        try {
            const actions = [];
            const assets = Array.from(currentState.totalLiquidity.keys());
            
            for (const asset of assets) {
                const currentAllocations = currentState.assetDistribution.get(asset);
                const targetAllocations = targetState.targetAllocations.get(asset);
                const totalLiquidity = currentState.totalLiquidity.get(asset);
                
                if (!currentAllocations || !targetAllocations || totalLiquidity === 0) continue;
                
                for (const [chainId, targetRatio] of targetAllocations) {
                    const currentRatio = currentAllocations.get(chainId) || 0;
                    const difference = targetRatio - currentRatio;
                    
                    // Only rebalance if difference exceeds threshold
                    if (Math.abs(difference) > this.config.rebalanceThreshold) {
                        const amount = Math.abs(difference * totalLiquidity);
                        
                        if (difference > 0) {
                            // Need to add liquidity to this chain
                            const sourceChains = this.findLiquiditySourceChains(
                                asset, amount, currentAllocations, targetAllocations
                            );
                            
                            for (const source of sourceChains) {
                                actions.push({
                                    type: 'rebalance',
                                    asset: asset,
                                    sourceChain: source.chainId,
                                    targetChain: chainId,
                                    amount: source.amount,
                                    currentSourceRatio: currentAllocations.get(source.chainId),
                                    currentTargetRatio: currentAllocations.get(chainId),
                                    targetSourceRatio: targetAllocations.get(source.chainId),
                                    targetTargetRatio: targetAllocations.get(chainId),
                                    urgency: this.calculateActionUrgency(difference),
                                    estimatedCost: await this.estimateRebalanceCost(asset, source.chainId, chainId, source.amount),
                                    estimatedBenefit: this.estimateRebalanceBenefit(asset, chainId, source.amount, difference)
                                });
                            }
                        }
                    }
                }
            }
            
            // Sort actions by urgency and benefit
            actions.sort((a, b) => {
                const aScore = (a.estimatedBenefit - a.estimatedCost.total) / a.amount;
                const bScore = (b.estimatedBenefit - b.estimatedCost.total) / b.amount;
                return bScore - aScore;
            });
            
            console.log(`📋 Calculated ${actions.length} rebalancing actions`);
            
            return actions;
            
        } catch (error) {
            console.error('❌ Error calculating rebalance actions:', error);
            return [];
        }
    }

    /**
     * Optimize rebalancing plan for maximum efficiency
     */
    async optimizeRebalancePlan(actions) {
        try {
            const plan = {
                actions: [],
                totalCost: 0,
                totalBenefit: 0,
                netBenefit: 0,
                executionTime: 0,
                riskScore: 0,
                optimization: 'efficiency'
            };
            
            // Group actions by asset and optimize routing
            const actionsByAsset = new Map();
            for (const action of actions) {
                if (!actionsByAsset.has(action.asset)) {
                    actionsByAsset.set(action.asset, []);
                }
                actionsByAsset.get(action.asset).push(action);
            }
            
            for (const [asset, assetActions] of actionsByAsset) {
                const optimizedActions = await this.optimizeAssetRebalancing(asset, assetActions);
                plan.actions.push(...optimizedActions);
            }
            
            // Calculate totals
            plan.totalCost = plan.actions.reduce((sum, action) => sum + action.estimatedCost.total, 0);
            plan.totalBenefit = plan.actions.reduce((sum, action) => sum + action.estimatedBenefit, 0);
            plan.netBenefit = plan.totalBenefit - plan.totalCost;
            plan.executionTime = Math.max(...plan.actions.map(action => action.estimatedCost.timeToComplete || 300));
            plan.riskScore = this.calculatePlanRiskScore(plan.actions);
            
            console.log(`🎯 Optimized rebalancing plan: ${plan.actions.length} actions, net benefit: $${plan.netBenefit.toFixed(2)}`);
            
            return plan;
            
        } catch (error) {
            console.error('❌ Error optimizing rebalance plan:', error);
            return { actions: [], netBenefit: 0 };
        }
    }

    /**
     * Execute the optimized rebalancing plan
     */
    async executeRebalancePlan(plan) {
        try {
            console.log(`⚡ Executing liquidity rebalancing plan with ${plan.actions.length} actions...`);
            
            const execution = {
                planId: ethers.id(`rebalance-${Date.now()}`),
                startTime: Date.now(),
                status: 'executing',
                completedActions: [],
                failedActions: [],
                totalGasUsed: 0,
                actualCost: 0,
                actualBenefit: 0,
                errors: []
            };
            
            // Execute actions in parallel where possible, sequential where dependencies exist
            const executionBatches = this.groupActionsIntoBatches(plan.actions);
            
            for (const batch of executionBatches) {
                console.log(`   📦 Executing batch of ${batch.length} actions...`);
                
                const batchPromises = batch.map(action => this.executeRebalanceAction(action));
                const batchResults = await Promise.allSettled(batchPromises);
                
                for (let i = 0; i < batchResults.length; i++) {
                    const result = batchResults[i];
                    const action = batch[i];
                    
                    if (result.status === 'fulfilled') {
                        execution.completedActions.push({
                            ...action,
                            result: result.value,
                            completedAt: Date.now()
                        });
                        execution.actualCost += result.value.actualCost || action.estimatedCost.total;
                        execution.totalGasUsed += result.value.gasUsed || 0;
                    } else {
                        execution.failedActions.push({
                            ...action,
                            error: result.reason.message,
                            failedAt: Date.now()
                        });
                        execution.errors.push(`Action ${action.asset} ${action.sourceChain}->${action.targetChain}: ${result.reason.message}`);
                    }
                }
            }
            
            // Calculate final metrics
            execution.endTime = Date.now();
            execution.duration = execution.endTime - execution.startTime;
            execution.status = execution.failedActions.length === 0 ? 'completed' : 'partial';
            execution.successRate = execution.completedActions.length / (execution.completedActions.length + execution.failedActions.length);
            
            // Estimate actual benefit based on completed actions
            execution.actualBenefit = await this.calculateActualBenefit(execution.completedActions);
            execution.netBenefit = execution.actualBenefit - execution.actualCost;
            
            // Update tracking
            this.rebalanceHistory.push(execution);
            
            console.log(`✅ Rebalancing execution ${execution.status}:`);
            console.log(`   Completed: ${execution.completedActions.length}/${execution.completedActions.length + execution.failedActions.length} actions`);
            console.log(`   Net benefit: $${execution.netBenefit.toFixed(2)}`);
            console.log(`   Duration: ${execution.duration}ms`);
            
            return execution;
            
        } catch (error) {
            console.error('❌ Error executing rebalance plan:', error);
            execution.status = 'failed';
            execution.errors.push(error.message);
            execution.endTime = Date.now();
            this.rebalanceHistory.push(execution);
            throw error;
        }
    }

    /**
     * Execute individual rebalancing action
     */
    async executeRebalanceAction(action) {
        try {
            console.log(`   🔄 Rebalancing ${action.amount.toFixed(2)} ${action.asset} from ${this.chains.get(action.sourceChain).name} to ${this.chains.get(action.targetChain).name}`);
            
            // Select optimal bridge
            const bridge = await this.selectOptimalBridge(action.sourceChain, action.targetChain, action.asset, action.amount);
            
            // Execute bridge transaction
            const bridgeResult = await this.executeBridgeTransaction(
                action.asset,
                action.sourceChain,
                action.targetChain,
                action.amount,
                bridge
            );
            
            // Update pool states
            await this.updatePoolLiquidity(action.asset, action.sourceChain, -action.amount);
            await this.updatePoolLiquidity(action.asset, action.targetChain, action.amount);
            
            return {
                status: 'success',
                txHash: bridgeResult.txHash,
                actualCost: bridgeResult.cost,
                gasUsed: bridgeResult.gasUsed,
                bridge: bridge.name,
                completionTime: bridgeResult.completionTime
            };
            
        } catch (error) {
            console.error(`❌ Error executing rebalance action ${action.asset} ${action.sourceChain}->${action.targetChain}:`, error);
            throw error;
        }
    }

    /**
     * Select optimal bridge for cross-chain transfer
     */
    async selectOptimalBridge(sourceChain, targetChain, asset, amount) {
        try {
            const availableBridges = [];
            
            for (const [name, bridge] of this.bridgeProviders) {
                if (bridge.isActive && 
                    bridge.supportedChains.includes(sourceChain) && 
                    bridge.supportedChains.includes(targetChain) &&
                    amount <= bridge.maxAmount) {
                    
                    const cost = await this.estimateBridgeCost(bridge, sourceChain, targetChain, amount);
                    availableBridges.push({
                        ...bridge,
                        estimatedCost: cost,
                        score: this.calculateBridgeScore(bridge, cost, amount)
                    });
                }
            }
            
            if (availableBridges.length === 0) {
                throw new Error(`No available bridges for ${sourceChain} -> ${targetChain}`);
            }
            
            // Select bridge with best score (lowest cost + highest reliability)
            availableBridges.sort((a, b) => b.score - a.score);
            return availableBridges[0];
            
        } catch (error) {
            console.error('❌ Error selecting optimal bridge:', error);
            throw error;
        }
    }

    /**
     * Execute bridge transaction (simulated)
     */
    async executeBridgeTransaction(asset, sourceChain, targetChain, amount, bridge) {
        try {
            // Simulate bridge execution
            const baseCost = bridge.estimatedCost || (amount * bridge.baseCost);
            const gasUsed = 250000 + Math.floor(Math.random() * 100000); // 250k-350k gas
            
            const result = {
                txHash: `0x${ethers.randomBytes(32).toString('hex')}`,
                cost: baseCost,
                gasUsed: gasUsed,
                completionTime: bridge.timeToFinality * 1000,
                bridge: bridge.name
            };
            
            // Simulate network delay
            await this.sleep(2000 + Math.random() * 3000);
            
            console.log(`     ✅ Bridge transaction completed via ${bridge.name}`);
            return result;
            
        } catch (error) {
            console.error('❌ Error executing bridge transaction:', error);
            throw error;
        }
    }

    /**
     * Start automated rebalancing loop
     */
    async startRebalancingLoop() {
        console.log('🔄 Starting automated rebalancing loop...');
        
        setInterval(async () => {
            try {
                await this.analyzeAndRebalance();
            } catch (error) {
                console.error('❌ Error in rebalancing loop:', error);
            }
        }, this.config.rebalanceInterval);
    }

    /**
     * Start liquidity monitoring across all chains
     */
    async startLiquidityMonitoring() {
        console.log('💧 Starting cross-chain liquidity monitoring...');
        
        setInterval(async () => {
            try {
                const assets = ['ETH', 'USDC', 'USDT', 'DAI', 'LINK'];
                const chains = Array.from(this.chains.keys());
                
                for (const asset of assets) {
                    for (const chainId of chains) {
                        await this.updatePoolMetrics(asset, chainId);
                    }
                }
            } catch (error) {
                console.error('❌ Error in liquidity monitoring:', error);
            }
        }, 60000); // Update every minute
    }

    /**
     * Start volume tracking for demand analysis
     */
    async startVolumeTracking() {
        console.log('📊 Starting volume tracking...');
        
        setInterval(async () => {
            try {
                await this.updateVolumeMetrics();
            } catch (error) {
                console.error('❌ Error in volume tracking:', error);
            }
        }, 30000); // Update every 30 seconds
    }

    /**
     * Start utilization monitoring
     */
    async startUtilizationMonitoring() {
        console.log('⚡ Starting utilization monitoring...');
        
        setInterval(async () => {
            try {
                await this.updateUtilizationMetrics();
            } catch (error) {
                console.error('❌ Error in utilization monitoring:', error);
            }
        }, 45000); // Update every 45 seconds
    }

    /**
     * Helper functions for calculations and utilities
     */
    
    async getPoolLiquidity(asset, chainId) {
        // Simulate getting pool liquidity
        const poolKey = `${asset}-${chainId}`;
        const pool = this.liquidityPools.get(poolKey);
        
        if (!pool) return 0;
        
        // Simulate realistic liquidity with some variation
        const baseLiquidity = {
            'ETH': 1000000,
            'USDC': 2000000,
            'USDT': 1500000,
            'DAI': 800000,
            'LINK': 500000
        }[asset] || 100000;
        
        const chainMultiplier = {
            '1': 1.0,    // Ethereum
            '137': 0.3,  // Polygon
            '42161': 0.5, // Arbitrum
            '10': 0.4,   // Optimism
            '56': 0.6    // BSC
        }[chainId] || 0.2;
        
        const liquidity = baseLiquidity * chainMultiplier * (0.8 + Math.random() * 0.4);
        pool.totalLiquidity = liquidity;
        pool.lastUpdated = Date.now();
        
        return liquidity;
    }

    async getPoolUtilization(asset, chainId) {
        // Simulate utilization rate (0-1)
        return 0.3 + Math.random() * 0.4; // 30-70% utilization
    }

    async getPool24hVolume(asset, chainId) {
        // Simulate 24h volume
        const poolLiquidity = await this.getPoolLiquidity(asset, chainId);
        return poolLiquidity * (0.1 + Math.random() * 0.5); // 10-60% of liquidity
    }

    calculateChainEfficiency(chainId, liquidity, utilization, volume) {
        const chainInfo = this.chains.get(chainId);
        if (!chainInfo) return 0.5;
        
        const utilizationScore = Math.min(utilization / 0.7, 1.0); // Optimal at 70%
        const volumeScore = Math.min(volume / liquidity, 1.0);
        const gasCostScore = 1.0 - Math.min(chainInfo.gasPrice / 100000000000, 1.0); // Lower gas = better
        
        return (utilizationScore * 0.4 + volumeScore * 0.4 + gasCostScore * 0.2);
    }

    calculateChainRiskMultiplier(chainId) {
        // Risk adjustments based on chain characteristics
        const riskFactors = {
            '1': 1.0,    // Ethereum - lowest risk
            '137': 0.9,  // Polygon - medium risk
            '42161': 0.95, // Arbitrum - low risk
            '10': 0.95,   // Optimism - low risk
            '56': 0.8     // BSC - higher risk
        };
        
        return riskFactors[chainId] || 0.7;
    }

    findLiquiditySourceChains(asset, amount, currentAllocations, targetAllocations) {
        const sources = [];
        let remainingAmount = amount;
        
        // Find chains with excess liquidity
        const excessChains = [];
        for (const [chainId, currentRatio] of currentAllocations) {
            const targetRatio = targetAllocations.get(chainId) || 0;
            const excess = currentRatio - targetRatio;
            
            if (excess > this.config.rebalanceThreshold) {
                excessChains.push({ chainId, excess });
            }
        }
        
        // Sort by excess amount
        excessChains.sort((a, b) => b.excess - a.excess);
        
        // Allocate from excess chains
        for (const chain of excessChains) {
            if (remainingAmount <= 0) break;
            
            const currentLiquidity = this.liquidityPools.get(`${asset}-${chain.chainId}`)?.totalLiquidity || 0;
            const maxTransfer = currentLiquidity * chain.excess * 0.8; // Leave some buffer
            const transferAmount = Math.min(remainingAmount, maxTransfer);
            
            if (transferAmount > 0) {
                sources.push({
                    chainId: chain.chainId,
                    amount: transferAmount
                });
                remainingAmount -= transferAmount;
            }
        }
        
        return sources;
    }

    calculateActionUrgency(difference) {
        const absDiff = Math.abs(difference);
        if (absDiff > this.config.emergencyThreshold) return 'emergency';
        if (absDiff > this.config.rebalanceThreshold * 2) return 'high';
        if (absDiff > this.config.rebalanceThreshold * 1.5) return 'medium';
        return 'low';
    }

    async estimateRebalanceCost(asset, sourceChain, targetChain, amount) {
        // Get gas costs for both chains
        const sourceGasPrice = this.chains.get(sourceChain)?.gasPrice || 20000000000;
        const targetGasPrice = this.chains.get(targetChain)?.gasPrice || 20000000000;
        
        // Estimate bridge cost
        const bridgeCost = amount * 0.001; // 0.1% bridge fee
        const gasCost = (250000 * sourceGasPrice) + (100000 * targetGasPrice); // Gas for bridge + confirm
        
        return {
            bridgeFee: bridgeCost,
            gasCost: gasCost,
            total: bridgeCost + gasCost,
            timeToComplete: 300 // 5 minutes average
        };
    }

    estimateRebalanceBenefit(asset, chainId, amount, allocationDifference) {
        // Estimate benefit from improved capital efficiency
        const chainInfo = this.chains.get(chainId);
        if (!chainInfo) return 0;
        
        // Higher utilization chains provide more benefit
        const utilizationBonus = Math.abs(allocationDifference) * amount * 0.001; // 0.1% benefit per allocation point
        const efficiencyGain = amount * 0.0005; // 0.05% base efficiency gain
        
        return utilizationBonus + efficiencyGain;
    }

    async optimizeAssetRebalancing(asset, actions) {
        // Combine actions where possible and optimize routing
        const optimized = [];
        const processed = new Set();
        
        for (const action of actions) {
            if (processed.has(action)) continue;
            
            // Look for actions that can be combined or optimized
            let optimizedAction = { ...action };
            
            // Mark as processed
            processed.add(action);
            optimized.push(optimizedAction);
        }
        
        return optimized;
    }

    calculateExpectedImprovement(currentAllocations, targetAllocations, chainData) {
        let improvement = 0;
        
        for (const [chainId, targetRatio] of targetAllocations) {
            const currentRatio = currentAllocations.get(chainId) || 0;
            const data = chainData.get(chainId);
            
            if (data) {
                const allocationChange = targetRatio - currentRatio;
                improvement += allocationChange * data.efficiency * data.volume;
            }
        }
        
        return Math.max(0, improvement);
    }

    calculatePlanRiskScore(actions) {
        let totalRisk = 0;
        
        for (const action of actions) {
            const sourceRisk = this.calculateChainRiskMultiplier(action.sourceChain);
            const targetRisk = this.calculateChainRiskMultiplier(action.targetChain);
            const amountRisk = Math.min(action.amount / 100000, 1.0); // Higher amounts = higher risk
            
            totalRisk += (2 - sourceRisk - targetRisk + amountRisk) / 3;
        }
        
        return actions.length > 0 ? totalRisk / actions.length : 0;
    }

    groupActionsIntoBatches(actions) {
        // Group actions that can be executed in parallel
        const batches = [];
        const usedChains = new Set();
        let currentBatch = [];
        
        for (const action of actions) {
            // Check if this action conflicts with current batch
            if (usedChains.has(action.sourceChain) || usedChains.has(action.targetChain)) {
                // Start new batch
                if (currentBatch.length > 0) {
                    batches.push(currentBatch);
                    currentBatch = [];
                    usedChains.clear();
                }
            }
            
            currentBatch.push(action);
            usedChains.add(action.sourceChain);
            usedChains.add(action.targetChain);
        }
        
        if (currentBatch.length > 0) {
            batches.push(currentBatch);
        }
        
        return batches;
    }

    async calculateActualBenefit(completedActions) {
        // Calculate actual benefit from completed rebalancing actions
        let totalBenefit = 0;
        
        for (const action of completedActions) {
            const estimatedBenefit = this.estimateRebalanceBenefit(
                action.asset, 
                action.targetChain, 
                action.amount, 
                action.targetTargetRatio - action.currentTargetRatio
            );
            
            // Apply efficiency factor based on execution success
            const efficiencyFactor = action.result?.status === 'success' ? 1.0 : 0.5;
            totalBenefit += estimatedBenefit * efficiencyFactor;
        }
        
        return totalBenefit;
    }

    async updatePoolLiquidity(asset, chainId, deltaAmount) {
        const poolKey = `${asset}-${chainId}`;
        const pool = this.liquidityPools.get(poolKey);
        
        if (pool) {
            pool.totalLiquidity = Math.max(0, pool.totalLiquidity + deltaAmount);
            pool.lastUpdated = Date.now();
        }
    }

    async updatePoolMetrics(asset, chainId) {
        // Update comprehensive pool metrics
        const poolKey = `${asset}-${chainId}`;
        const pool = this.liquidityPools.get(poolKey);
        
        if (pool) {
            pool.totalLiquidity = await this.getPoolLiquidity(asset, chainId);
            pool.utilizationRate = await this.getPoolUtilization(asset, chainId);
            pool.volume24h = await this.getPool24hVolume(asset, chainId);
            pool.lastUpdated = Date.now();
        }
    }

    async updateVolumeMetrics() {
        // Update volume tracking across all pools
        const assets = ['ETH', 'USDC', 'USDT', 'DAI', 'LINK'];
        const chains = Array.from(this.chains.keys());
        
        for (const asset of assets) {
            for (const chainId of chains) {
                const volume = await this.getPool24hVolume(asset, chainId);
                this.volumeTrackers.set(`${asset}-${chainId}`, {
                    volume: volume,
                    timestamp: Date.now()
                });
            }
        }
    }

    async updateUtilizationMetrics() {
        // Update utilization tracking
        const assets = ['ETH', 'USDC', 'USDT', 'DAI', 'LINK'];
        const chains = Array.from(this.chains.keys());
        
        for (const asset of assets) {
            for (const chainId of chains) {
                const utilization = await this.getPoolUtilization(asset, chainId);
                this.utilizationRates.set(`${asset}-${chainId}`, {
                    rate: utilization,
                    timestamp: Date.now()
                });
            }
        }
    }

    async calculateInitialTargetAllocations() {
        // Set initial target allocations based on historical data or defaults
        const assets = ['ETH', 'USDC', 'USDT', 'DAI', 'LINK'];
        const chains = Array.from(this.chains.keys());
        
        for (const asset of assets) {
            const allocations = new Map();
            const evenSplit = 1.0 / chains.length;
            
            for (const chainId of chains) {
                allocations.set(chainId, evenSplit);
            }
            
            this.targetAllocations.set(asset, allocations);
        }
    }

    async estimateBridgeCost(bridge, sourceChain, targetChain, amount) {
        return amount * bridge.baseCost;
    }

    calculateBridgeScore(bridge, cost, amount) {
        const costScore = 1.0 - Math.min(cost / (amount * 0.01), 1.0); // Lower cost = better
        const reliabilityScore = bridge.reliability;
        const speedScore = 1.0 - Math.min(bridge.timeToFinality / 3600, 1.0); // Faster = better
        
        return (costScore * 0.4 + reliabilityScore * 0.4 + speedScore * 0.2);
    }

    updateRebalanceStats(execution) {
        this.rebalanceStats.totalRebalances++;
        if (execution.status === 'completed') {
            this.rebalanceStats.successfulRebalances++;
            this.rebalanceStats.capitalEfficiencyGain += execution.netBenefit;
        }
        this.rebalanceStats.totalGasSaved += Math.max(0, execution.actualBenefit - execution.actualCost);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get comprehensive rebalancing statistics
     */
    getRebalancingStats() {
        const recentExecutions = this.rebalanceHistory.slice(-10);
        const successRate = this.rebalanceStats.totalRebalances > 0 ? 
            this.rebalanceStats.successfulRebalances / this.rebalanceStats.totalRebalances : 0;
        
        return {
            totalRebalances: this.rebalanceStats.totalRebalances,
            successfulRebalances: this.rebalanceStats.successfulRebalances,
            successRate: successRate,
            totalCapitalEfficiencyGain: this.rebalanceStats.capitalEfficiencyGain,
            totalGasSaved: this.rebalanceStats.totalGasSaved,
            averageExecutionTime: recentExecutions.length > 0 ? 
                recentExecutions.reduce((sum, ex) => sum + (ex.duration || 0), 0) / recentExecutions.length : 0,
            activeChains: this.chains.size,
            activePools: this.liquidityPools.size,
            lastRebalance: this.rebalanceHistory.length > 0 ? 
                this.rebalanceHistory[this.rebalanceHistory.length - 1].startTime : null,
            currentTargetAllocations: Object.fromEntries(this.targetAllocations)
        };
    }
}