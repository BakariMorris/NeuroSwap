/**
 * Advanced Parameter Optimization Engine
 * Uses reinforcement learning and genetic algorithms for AMM optimization
 * Integrated with ROI Maximization Strategy
 */

import { Matrix } from 'ml-matrix';
import { round, evaluate } from 'mathjs';
import ROIMaximizationStrategy from './ROIMaximizationStrategy.js';

export class ParameterOptimizer {
    constructor(config = {}) {
        this.config = {
            learningRate: 0.01,
            explorationRate: 0.1,
            maxFeeRate: 1000, // 10%
            minFeeRate: 5,    // 0.05%
            maxSpreadMultiplier: 5000, // 5.0x
            minSpreadMultiplier: 1000, // 1.0x
            populationSize: 50,
            mutationRate: 0.1,
            ...config
        };
        
        this.qTable = new Map(); // Q-learning table
        this.performanceHistory = [];
        this.bestParameters = null;
        this.currentGeneration = 0;
        
        // Initialize ROI Maximization Strategy
        this.roiStrategy = new ROIMaximizationStrategy();
        this.roiStrategy.on('optimization', (result) => {
            this.handleROIOptimization(result);
        });
        
        console.log('🧠 Parameter Optimizer initialized with ML algorithms and ROI Strategy');
    }

    /**
     * Main optimization method using reinforcement learning + ROI maximization
     */
    async optimizeParameters(marketAnalysis, currentParams, performanceMetrics) {
        try {
            console.log('⚡ Starting parameter optimization with ROI maximization...');
            
            // Phase 1: ROI Strategy Optimization
            const poolState = {
                reserveX: currentParams.reserveX || 1000000,
                reserveY: currentParams.reserveY || 1000000,
                ...currentParams
            };
            
            const liquidityPositions = currentParams.liquidityPositions || [];
            const roiOptimization = this.roiStrategy.optimizeROI(marketAnalysis, poolState, liquidityPositions);
            
            console.log(`🎯 ROI optimization complete: ${roiOptimization.expectedImprovement.improvementPercentage.toFixed(2)}% improvement expected`);
            
            // Phase 2: Traditional ML optimization (enhanced with ROI insights)
            const state = this.createStateVector(marketAnalysis, roiOptimization);
            
            // Use Q-learning to determine optimal action (incorporating ROI strategy)
            const action = await this.selectOptimalAction(state, currentParams, roiOptimization);
            
            // Apply genetic algorithm for fine-tuning
            const optimizedParams = await this.applyGeneticOptimization(
                action.parameters,
                marketAnalysis,
                performanceMetrics,
                roiOptimization
            );
            
            // Validate parameters against constraints
            const validatedParams = this.validateParameters(optimizedParams);
            
            // Update Q-table with performance feedback
            this.updateQLearning(state, action, performanceMetrics);
            
            console.log('✅ Parameter optimization complete:', {
                feeRate: `${validatedParams.feeRate / 100}%`,
                spreadMultiplier: `${validatedParams.spreadMultiplier / 1000}x`,
                expectedImprovement: `${action.expectedImprovement?.toFixed(2)}%`
            });
            
            return {
                parameters: validatedParams,
                confidence: action.confidence,
                reasoning: action.reasoning,
                expectedImprovement: action.expectedImprovement
            };
            
        } catch (error) {
            console.error('❌ Error in parameter optimization:', error);
            throw error;
        }
    }

    /**
     * Create state vector from market analysis for ML algorithms
     */
    createStateVector(marketAnalysis) {
        const state = {
            volatility: marketAnalysis.marketOverview.avgVolatility || 0,
            trend: this.encodeTrend(marketAnalysis.marketOverview.trend),
            bullishRatio: marketAnalysis.marketOverview.bullishAssets / 
                         (marketAnalysis.assets.size || 1),
            riskScore: marketAnalysis.riskMetrics.riskScore || 0,
            confidence: marketAnalysis.confidence || 0.5
        };
        
        // Normalize state values to [0, 1] range
        return {
            volatility: Math.min(state.volatility * 10, 1), // Assume max 10% volatility
            trend: state.trend,
            bullishRatio: state.bullishRatio,
            riskScore: state.riskScore,
            confidence: state.confidence
        };
    }

    /**
     * Q-learning action selection with epsilon-greedy exploration
     */
    async selectOptimalAction(state, currentParams) {
        const stateKey = this.stateToKey(state);
        
        // Initialize Q-values for new states
        if (!this.qTable.has(stateKey)) {
            this.qTable.set(stateKey, this.initializeQValues());
        }
        
        const qValues = this.qTable.get(stateKey);
        
        // Epsilon-greedy action selection
        let selectedAction;
        if (Math.random() < this.config.explorationRate) {
            // Exploration: random action
            selectedAction = this.generateRandomAction(currentParams);
        } else {
            // Exploitation: best known action
            selectedAction = this.selectBestAction(qValues, currentParams);
        }
        
        return {
            parameters: selectedAction.parameters,
            confidence: selectedAction.confidence,
            reasoning: selectedAction.reasoning,
            expectedImprovement: qValues[selectedAction.actionIndex] || 0
        };
    }

    /**
     * Genetic algorithm for parameter fine-tuning
     */
    async applyGeneticOptimization(baseParams, marketAnalysis, performanceMetrics) {
        try {
            // Create initial population around base parameters
            let population = this.createInitialPopulation(baseParams);
            
            // Run genetic algorithm for multiple generations
            for (let generation = 0; generation < 10; generation++) {
                // Evaluate fitness of each individual
                const fitnessScores = population.map(individual => 
                    this.calculateFitness(individual, marketAnalysis, performanceMetrics)
                );
                
                // Selection: keep top 50%
                const sortedIndices = fitnessScores
                    .map((fitness, index) => ({ fitness, index }))
                    .sort((a, b) => b.fitness - a.fitness)
                    .slice(0, this.config.populationSize / 2)
                    .map(item => item.index);
                
                const survivors = sortedIndices.map(index => population[index]);
                
                // Crossover and mutation to create new generation
                population = this.createNextGeneration(survivors);
            }
            
            // Return best individual from final population
            const finalFitness = population.map(individual => 
                this.calculateFitness(individual, marketAnalysis, performanceMetrics)
            );
            
            const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
            return population[bestIndex];
            
        } catch (error) {
            console.error('❌ Error in genetic optimization:', error);
            return baseParams; // Return base parameters on error
        }
    }

    /**
     * Calculate fitness score for genetic algorithm
     */
    calculateFitness(parameters, marketAnalysis, performanceMetrics) {
        let fitness = 0.5; // Base fitness
        
        // Reward parameters that match market conditions
        const volatility = marketAnalysis.marketOverview.avgVolatility || 0;
        
        // Fee rate fitness
        const optimalFeeRate = this.calculateOptimalFeeRate(volatility);
        const feeDeviation = Math.abs(parameters.feeRate - optimalFeeRate) / optimalFeeRate;
        fitness += Math.max(0, 0.3 - feeDeviation);
        
        // Spread multiplier fitness
        const optimalSpread = this.calculateOptimalSpread(volatility);
        const spreadDeviation = Math.abs(parameters.spreadMultiplier - optimalSpread) / optimalSpread;
        fitness += Math.max(0, 0.2 - spreadDeviation);
        
        // Historical performance bonus
        if (performanceMetrics && performanceMetrics.profitability > 0) {
            fitness += performanceMetrics.profitability * 0.1;
        }
        
        // Risk adjustment
        if (marketAnalysis.riskMetrics.riskScore > 0.7) {
            fitness -= 0.1; // Penalty for high risk environments
        }
        
        return Math.max(0, Math.min(1, fitness));
    }

    /**
     * Create initial population for genetic algorithm
     */
    createInitialPopulation(baseParams) {
        const population = [];
        
        for (let i = 0; i < this.config.populationSize; i++) {
            const individual = {
                feeRate: this.mutateValue(baseParams.feeRate, 0.2, this.config.minFeeRate, this.config.maxFeeRate),
                spreadMultiplier: this.mutateValue(baseParams.spreadMultiplier, 0.2, this.config.minSpreadMultiplier, this.config.maxSpreadMultiplier),
                weights: baseParams.weights.map(weight => 
                    this.mutateValue(weight, 0.1, 1000, 6000)
                ),
                lastUpdate: Math.floor(Date.now() / 1000),
                isActive: true
            };
            
            // Ensure weights sum to 10000 (100%)
            individual.weights = this.normalizeWeights(individual.weights);
            population.push(individual);
        }
        
        return population;
    }

    /**
     * Create next generation through crossover and mutation
     */
    createNextGeneration(survivors) {
        const newGeneration = [...survivors]; // Keep survivors
        
        // Create offspring through crossover
        while (newGeneration.length < this.config.populationSize) {
            const parent1 = survivors[Math.floor(Math.random() * survivors.length)];
            const parent2 = survivors[Math.floor(Math.random() * survivors.length)];
            
            const offspring = this.crossover(parent1, parent2);
            const mutatedOffspring = this.mutate(offspring);
            
            newGeneration.push(mutatedOffspring);
        }
        
        return newGeneration;
    }

    /**
     * Crossover operation for genetic algorithm
     */
    crossover(parent1, parent2) {
        const crossoverPoint = Math.random();
        
        return {
            feeRate: crossoverPoint < 0.5 ? parent1.feeRate : parent2.feeRate,
            spreadMultiplier: crossoverPoint < 0.5 ? parent1.spreadMultiplier : parent2.spreadMultiplier,
            weights: parent1.weights.map((weight, index) => 
                crossoverPoint < 0.5 ? weight : parent2.weights[index]
            ),
            lastUpdate: Math.floor(Date.now() / 1000),
            isActive: true
        };
    }

    /**
     * Mutation operation for genetic algorithm
     */
    mutate(individual) {
        const mutated = { ...individual };
        
        if (Math.random() < this.config.mutationRate) {
            mutated.feeRate = this.mutateValue(
                individual.feeRate, 0.1, 
                this.config.minFeeRate, this.config.maxFeeRate
            );
        }
        
        if (Math.random() < this.config.mutationRate) {
            mutated.spreadMultiplier = this.mutateValue(
                individual.spreadMultiplier, 0.1,
                this.config.minSpreadMultiplier, this.config.maxSpreadMultiplier
            );
        }
        
        // Mutate weights
        mutated.weights = individual.weights.map(weight => {
            if (Math.random() < this.config.mutationRate) {
                return this.mutateValue(weight, 0.05, 1000, 6000);
            }
            return weight;
        });
        
        mutated.weights = this.normalizeWeights(mutated.weights);
        
        return mutated;
    }

    /**
     * Update Q-learning table with performance feedback
     */
    updateQLearning(state, action, performanceMetrics) {
        const stateKey = this.stateToKey(state);
        const qValues = this.qTable.get(stateKey);
        
        if (qValues && performanceMetrics) {
            // Calculate reward based on performance improvement
            const reward = this.calculateReward(performanceMetrics);
            
            // Q-learning update rule: Q(s,a) = Q(s,a) + α[r + γ*max(Q(s',a')) - Q(s,a)]
            const actionIndex = action.actionIndex || 0;
            const learningRate = this.config.learningRate;
            const discountFactor = 0.9;
            
            const currentQ = qValues[actionIndex] || 0;
            const maxFutureQ = Math.max(...Object.values(qValues));
            
            qValues[actionIndex] = currentQ + learningRate * 
                (reward + discountFactor * maxFutureQ - currentQ);
            
            this.qTable.set(stateKey, qValues);
        }
    }

    /**
     * Helper functions
     */
    encodeTrend(trend) {
        const trendMap = {
            'BULLISH': 1.0,
            'NEUTRAL': 0.5,
            'BEARISH': 0.0
        };
        return trendMap[trend] || 0.5;
    }

    stateToKey(state) {
        return Object.values(state).map(v => round(v, 2)).join(',');
    }

    initializeQValues() {
        const actions = {};
        for (let i = 0; i < 9; i++) { // 9 possible actions
            actions[i] = Math.random() * 0.1; // Small random initialization
        }
        return actions;
    }

    generateRandomAction(currentParams) {
        return {
            parameters: {
                feeRate: Math.floor(Math.random() * (this.config.maxFeeRate - this.config.minFeeRate)) + this.config.minFeeRate,
                spreadMultiplier: Math.floor(Math.random() * (this.config.maxSpreadMultiplier - this.config.minSpreadMultiplier)) + this.config.minSpreadMultiplier,
                weights: this.normalizeWeights([2500, 2500, 2500, 2500]),
                lastUpdate: Math.floor(Date.now() / 1000),
                isActive: true
            },
            confidence: 0.1,
            reasoning: ['Random exploration action'],
            actionIndex: Math.floor(Math.random() * 9)
        };
    }

    selectBestAction(qValues, currentParams) {
        const bestActionIndex = Object.keys(qValues).reduce((a, b) => 
            qValues[a] > qValues[b] ? a : b
        );
        
        return {
            parameters: this.actionToParameters(parseInt(bestActionIndex), currentParams),
            confidence: 0.8,
            reasoning: ['Q-learning optimal action'],
            actionIndex: parseInt(bestActionIndex)
        };
    }

    actionToParameters(actionIndex, currentParams) {
        const actions = [
            { feeChange: 0, spreadChange: 0 },      // Hold
            { feeChange: 10, spreadChange: 0 },     // Increase fee
            { feeChange: -10, spreadChange: 0 },    // Decrease fee
            { feeChange: 0, spreadChange: 100 },    // Increase spread
            { feeChange: 0, spreadChange: -100 },   // Decrease spread
            { feeChange: 10, spreadChange: 100 },   // Increase both
            { feeChange: -10, spreadChange: -100 }, // Decrease both
            { feeChange: 20, spreadChange: 0 },     // Strong fee increase
            { feeChange: -20, spreadChange: 0 }     // Strong fee decrease
        ];
        
        const action = actions[actionIndex] || actions[0];
        
        return {
            feeRate: Math.max(this.config.minFeeRate, 
                     Math.min(this.config.maxFeeRate, 
                     currentParams.feeRate + action.feeChange)),
            spreadMultiplier: Math.max(this.config.minSpreadMultiplier,
                             Math.min(this.config.maxSpreadMultiplier,
                             currentParams.spreadMultiplier + action.spreadChange)),
            weights: [...currentParams.weights],
            lastUpdate: Math.floor(Date.now() / 1000),
            isActive: true
        };
    }

    calculateOptimalFeeRate(volatility) {
        // Higher volatility suggests higher optimal fees
        return Math.max(this.config.minFeeRate, 
               Math.min(this.config.maxFeeRate, 
               30 + volatility * 500)); // Base 0.3% + volatility premium
    }

    calculateOptimalSpread(volatility) {
        // Higher volatility suggests higher optimal spread
        return Math.max(this.config.minSpreadMultiplier,
               Math.min(this.config.maxSpreadMultiplier,
               1000 + volatility * 2000)); // Base 1.0x + volatility premium
    }

    calculateReward(performanceMetrics) {
        let reward = 0;
        
        // Reward based on profitability
        if (performanceMetrics.profitability) {
            reward += performanceMetrics.profitability * 0.5;
        }
        
        // Reward based on volume
        if (performanceMetrics.volumeChange > 0) {
            reward += 0.2;
        } else if (performanceMetrics.volumeChange < -0.1) {
            reward -= 0.3;
        }
        
        // Reward based on capital efficiency
        if (performanceMetrics.capitalEfficiency > 1.0) {
            reward += 0.3;
        }
        
        return Math.max(-1, Math.min(1, reward));
    }

    mutateValue(value, mutationStrength, min, max) {
        const mutation = (Math.random() - 0.5) * 2 * mutationStrength * value;
        return Math.max(min, Math.min(max, Math.round(value + mutation)));
    }

    normalizeWeights(weights) {
        const sum = weights.reduce((a, b) => a + b, 0);
        if (sum === 0) return [2500, 2500, 2500, 2500]; // Default equal weights
        
        const normalized = weights.map(w => Math.round((w / sum) * 10000));
        
        // Adjust for rounding errors
        const newSum = normalized.reduce((a, b) => a + b, 0);
        if (newSum !== 10000) {
            normalized[0] += 10000 - newSum;
        }
        
        return normalized;
    }

    validateParameters(params) {
        return {
            feeRate: Math.max(this.config.minFeeRate, 
                     Math.min(this.config.maxFeeRate, params.feeRate)),
            spreadMultiplier: Math.max(this.config.minSpreadMultiplier,
                             Math.min(this.config.maxSpreadMultiplier, params.spreadMultiplier)),
            weights: this.normalizeWeights(params.weights),
            lastUpdate: params.lastUpdate,
            isActive: params.isActive
        };
    }

    /**
     * Handle ROI optimization results and integrate with ML optimization
     */
    handleROIOptimization(roiResult) {
        console.log(`💰 ROI Strategy updated: ${roiResult.riskAdjustedROI.totalROI.toFixed(4)} total ROI`);
        
        // Update learning rate based on ROI confidence
        if (roiResult.strategyConfidence > 0.8) {
            this.config.learningRate = Math.min(0.02, this.config.learningRate * 1.05);
        } else if (roiResult.strategyConfidence < 0.5) {
            this.config.learningRate = Math.max(0.005, this.config.learningRate * 0.95);
        }
        
        // Store ROI insights for future optimizations
        this.lastROIResult = roiResult;
        
        // Execute high-priority recommendations immediately
        for (const rec of roiResult.recommendations) {
            if (rec.priority === 'HIGH' && rec.confidence > 0.7) {
                console.log(`🎯 Executing recommendation: ${rec.action}`);
                this.executeRecommendation(rec);
            }
        }
    }

    /**
     * Enhanced state vector creation incorporating ROI optimization data
     */
    createStateVector(marketAnalysis, roiOptimization = null) {
        const baseState = [
            marketAnalysis.marketOverview.avgVolatility || 0,
            marketAnalysis.marketOverview.totalVolume || 0,
            marketAnalysis.liquidityMetrics.concentrationRatio || 0,
            marketAnalysis.riskMetrics.riskScore || 0,
            marketAnalysis.arbitrageSignals.signalStrength || 0,
            marketAnalysis.marketEfficiency.efficiencyScore || 0,
            marketAnalysis.priceData ? marketAnalysis.priceData.length : 0
        ];

        // Add ROI optimization data if available
        if (roiOptimization) {
            const roiState = [
                roiOptimization.riskAdjustedROI.totalROI || 0,
                roiOptimization.strategyConfidence || 0,
                roiOptimization.optimalParams.confidence || 0,
                roiOptimization.liquidityStrategy.totalExpectedAPY || 0,
                roiOptimization.feeStrategy.totalFee * 10000 || 0, // Convert to bps
                roiOptimization.arbitrageOps.length || 0,
                roiOptimization.expectedImprovement.relativeImprovement || 0
            ];
            
            return [...baseState, ...roiState];
        }

        return baseState;
    }

    /**
     * Enhanced action selection incorporating ROI strategy insights
     */
    async selectOptimalAction(state, currentParams, roiOptimization = null) {
        const stateKey = this.getStateKey(state);
        
        // Get base action from Q-learning
        let action = await this.getQAction(stateKey, currentParams);
        
        // Enhance action with ROI strategy insights
        if (roiOptimization && roiOptimization.strategyConfidence > 0.6) {
            // Apply ROI-optimized parameters
            action.parameters.feeRate = Math.round(roiOptimization.feeStrategy.totalFee * 10000);
            
            if (roiOptimization.optimalParams.amplificationCoeff) {
                action.parameters.amplificationCoeff = roiOptimization.optimalParams.amplificationCoeff;
            }
            
            if (roiOptimization.optimalParams.concentrationGamma) {
                action.parameters.concentrationGamma = roiOptimization.optimalParams.concentrationGamma;
            }
            
            // Adjust spread multiplier based on market regime
            const regimeMultiplier = this.getRegimeMultiplier(roiOptimization.marketRegime);
            action.parameters.spreadMultiplier = Math.round(
                action.parameters.spreadMultiplier * regimeMultiplier
            );
            
            console.log(`🔗 Action enhanced with ROI insights: fee=${action.parameters.feeRate}bps, regime=${roiOptimization.marketRegime}`);
        }
        
        return action;
    }

    /**
     * Enhanced genetic algorithm incorporating ROI fitness
     */
    async applyGeneticOptimization(baseParams, marketAnalysis, performanceMetrics, roiOptimization = null) {
        console.log('🧬 Applying genetic optimization with ROI fitness...');
        
        let population = this.createInitialPopulation(baseParams);
        
        for (let generation = 0; generation < 10; generation++) {
            // Calculate fitness with ROI enhancement
            const fitnessScores = population.map(individual => {
                let fitness = this.calculateFitness(individual, marketAnalysis, performanceMetrics);
                
                // Add ROI fitness component
                if (roiOptimization) {
                    const roiFitness = this.calculateROIFitness(individual, roiOptimization);
                    fitness = fitness * 0.7 + roiFitness * 0.3; // 70% traditional, 30% ROI
                }
                
                return fitness;
            });
            
            // Select best performers
            const sortedPopulation = population
                .map((individual, index) => ({ individual, fitness: fitnessScores[index] }))
                .sort((a, b) => b.fitness - a.fitness);
            
            // Create next generation
            const nextGeneration = [];
            
            // Keep top 20% (elitism)
            const eliteCount = Math.floor(this.config.populationSize * 0.2);
            for (let i = 0; i < eliteCount; i++) {
                nextGeneration.push({ ...sortedPopulation[i].individual });
            }
            
            // Generate rest through crossover and mutation
            while (nextGeneration.length < this.config.populationSize) {
                const parent1 = this.selectParent(sortedPopulation);
                const parent2 = this.selectParent(sortedPopulation);
                const child = this.crossover(parent1, parent2);
                
                if (Math.random() < this.config.mutationRate) {
                    this.mutate(child);
                }
                
                nextGeneration.push(child);
            }
            
            population = nextGeneration;
        }
        
        // Return best individual
        const finalFitness = population.map(individual => 
            this.calculateFitness(individual, marketAnalysis, performanceMetrics)
        );
        const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));
        
        console.log(`🎯 Genetic optimization complete: fitness=${finalFitness[bestIndex].toFixed(4)}`);
        return population[bestIndex];
    }

    /**
     * Calculate ROI-based fitness for genetic algorithm
     */
    calculateROIFitness(parameters, roiOptimization) {
        let fitness = 0;
        
        // Fee rate alignment with ROI strategy
        const targetFeeRate = roiOptimization.feeStrategy.totalFee * 10000;
        const feeDeviation = Math.abs(parameters.feeRate - targetFeeRate) / targetFeeRate;
        fitness += Math.max(0, 0.4 - feeDeviation);
        
        // Expected improvement bonus
        if (roiOptimization.expectedImprovement.meetsTarget) {
            fitness += 0.3;
        }
        
        // Confidence bonus
        fitness += roiOptimization.strategyConfidence * 0.2;
        
        // Market regime appropriateness
        const regimeBonus = this.getRegimeFitnessBonus(parameters, roiOptimization.marketRegime);
        fitness += regimeBonus * 0.1;
        
        return Math.max(0, Math.min(1, fitness));
    }

    /**
     * Execute high-priority recommendations from ROI strategy
     */
    executeRecommendation(recommendation) {
        switch (recommendation.type) {
            case 'PARAMETER_UPDATE':
                if (recommendation.params) {
                    console.log('🔧 Updating parameters based on ROI recommendation');
                    // Parameters would be applied to the actual AMM contracts
                }
                break;
                
            case 'LIQUIDITY_REBALANCE':
                console.log('⚖️ Triggering liquidity rebalance');
                // Would trigger rebalancing logic
                break;
                
            case 'RISK_MANAGEMENT':
                console.log('🛡️ Activating risk management protocols');
                // Would activate risk management measures
                break;
                
            default:
                console.log(`ℹ️ Recommendation noted: ${recommendation.action}`);
        }
    }

    /**
     * Get regime-specific multiplier for parameters
     */
    getRegimeMultiplier(regime) {
        const multipliers = {
            'TRENDING_HIGH_VOLATILITY': 1.5,
            'TRENDING_MODERATE': 1.2,
            'NEUTRAL': 1.0,
            'RANGING_MODERATE': 0.8,
            'RANGING_LOW_VOLATILITY': 0.6
        };
        
        return multipliers[regime] || 1.0;
    }

    /**
     * Get fitness bonus based on regime appropriateness
     */
    getRegimeFitnessBonus(parameters, regime) {
        // Higher fees should be rewarded in volatile regimes
        if (regime.includes('HIGH_VOLATILITY') && parameters.feeRate > 30) {
            return 0.3;
        }
        
        // Lower fees should be rewarded in stable regimes
        if (regime.includes('LOW_VOLATILITY') && parameters.feeRate < 15) {
            return 0.3;
        }
        
        return 0;
    }

    /**
     * Get current ROI strategy status
     */
    getROIStrategyStatus() {
        return this.roiStrategy ? this.roiStrategy.getStrategyStatus() : null;
    }

    /**
     * Force ROI strategy update from performance data
     */
    updateROIStrategy() {
        if (this.roiStrategy) {
            this.roiStrategy.updateStrategyFromPerformance();
        }
    }
}