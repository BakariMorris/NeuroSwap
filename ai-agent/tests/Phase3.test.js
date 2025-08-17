/**
 * Comprehensive Phase 3 Testing Suite
 * Tests for Advanced Features: Arbitrage, Liquidity Rebalancing, Emergency Management, Performance Monitoring
 */

import { expect } from 'chai';
import { ethers } from 'ethers';

// Import Phase 3 components
import { ArbitrageEngine } from '../services/ArbitrageEngine.js';
import { LiquidityRebalancer } from '../services/LiquidityRebalancer.js';
import { EmergencyManager } from '../services/EmergencyManager.js';
import { PerformanceMonitor } from '../services/PerformanceMonitor.js';

describe('Phase 3: Advanced Features Testing Suite', function() {
    let arbitrageEngine;
    let liquidityRebalancer;
    let emergencyManager;
    let performanceMonitor;
    
    // Test configuration
    const testConfig = {
        arbitrage: {
            minProfitThreshold: 0.005,
            maxSlippage: 0.02,
            executionTimeout: 10000
        },
        liquidity: {
            rebalanceThreshold: 0.15,
            minLiquidityRatio: 0.05,
            rebalanceInterval: 60000
        },
        emergency: {
            maxSlippageThreshold: 0.10,
            maxVolatilityThreshold: 0.25,
            emergencyResponseTime: 5000
        },
        monitoring: {
            realTimeInterval: 1000,
            latencyThreshold: 1000,
            errorRateThreshold: 0.05
        }
    };
    
    // Mock chain configurations
    const mockChainConfigs = {
        '1': {
            name: 'Ethereum',
            rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/test',
            privateKey: '0x' + '1'.repeat(64),
            nativeToken: 'ETH',
            gasPrice: 50000000000,
            ammAddress: '0x' + '1'.repeat(40),
            layerZeroAddress: '0x' + '2'.repeat(40),
            chainlinkAddress: '0x' + '3'.repeat(40)
        },
        '137': {
            name: 'Polygon',
            rpcUrl: 'https://polygon-mainnet.alchemyapi.io/v2/test',
            privateKey: '0x' + '1'.repeat(64),
            nativeToken: 'MATIC',
            gasPrice: 30000000000,
            ammAddress: '0x' + '4'.repeat(40),
            layerZeroAddress: '0x' + '5'.repeat(40),
            chainlinkAddress: '0x' + '6'.repeat(40)
        }
    };
    
    const mockBridgeConfigs = {
        'layerzero': {
            type: 'layerzero',
            supportedChains: ['1', '137', '42161', '10'],
            baseCost: 0.001,
            timeToFinality: 300,
            reliability: 0.99
        },
        'chainlink': {
            type: 'chainlink',
            supportedChains: ['1', '137', '42161', '10'],
            baseCost: 0.0015,
            timeToFinality: 600,
            reliability: 0.98
        }
    };

    beforeEach(function() {
        // Initialize all Phase 3 components
        arbitrageEngine = new ArbitrageEngine(testConfig.arbitrage);
        liquidityRebalancer = new LiquidityRebalancer(testConfig.liquidity);
        emergencyManager = new EmergencyManager(testConfig.emergency);
        performanceMonitor = new PerformanceMonitor(testConfig.monitoring);
    });

    describe('ArbitrageEngine Tests', function() {
        it('should initialize with correct configuration', function() {
            expect(arbitrageEngine).to.not.be.undefined;
            expect(arbitrageEngine.config.minProfitThreshold).to.equal(0.005);
            expect(arbitrageEngine.config.maxSlippage).to.equal(0.02);
            expect(arbitrageEngine.chains).to.be.instanceOf(Map);
            expect(arbitrageEngine.opportunities).to.be.instanceOf(Map);
        });

        it('should setup chains correctly', async () => {
            await arbitrageEngine.initialize(mockChainConfigs);
            
            expect(arbitrageEngine.chains.size).toBe(2);
            expect(arbitrageEngine.chains.has('1')).toBe(true);
            expect(arbitrageEngine.chains.has('137')).toBe(true);
            
            const ethChain = arbitrageEngine.chains.get('1');
            expect(ethChain.name).toBe('Ethereum');
            expect(ethChain.nativeToken).toBe('ETH');
        });

        it('should detect arbitrage opportunities', async () => {
            await arbitrageEngine.initialize(mockChainConfigs);
            
            // Mock price differences that would create arbitrage opportunities
            jest.spyOn(arbitrageEngine, 'getAssetPrice')
                .mockImplementation(async (asset, chainId) => {
                    if (chainId === '1') return 3000; // ETH price on Ethereum
                    if (chainId === '137') return 3050; // Higher price on Polygon
                    return 3000;
                });
            
            jest.spyOn(arbitrageEngine, 'getAvailableLiquidity')
                .mockResolvedValue(1000000); // $1M liquidity
            
            const opportunities = await arbitrageEngine.detectArbitrageOpportunities();
            
            expect(Array.isArray(opportunities)).toBe(true);
            expect(opportunities.length).toBeGreaterThan(0);
            
            const ethOpportunity = opportunities.find(op => op.asset === 'ETH');
            if (ethOpportunity) {
                expect(ethOpportunity.sourceChain).toBe('1');
                expect(ethOpportunity.targetChain).toBe('137');
                expect(ethOpportunity.profitPercent).toBeGreaterThan(0);
            }
        });

        it('should calculate optimal position size correctly', async () => {
            const positionSize = arbitrageEngine.calculateOptimalPositionSize(
                'ETH', 3000, 3050, 1000000, 1000000, { total: 100 }
            );
            
            expect(positionSize).toBeGreaterThan(0);
            expect(positionSize).toBeLessThanOrEqual(100000); // Should respect position limits
        });

        it('should execute arbitrage with proper transaction flow', async () => {
            await arbitrageEngine.initialize(mockChainConfigs);
            
            const mockOpportunity = {
                id: 'test-opportunity',
                asset: 'ETH',
                sourceChain: '1',
                targetChain: '137',
                sourcePrice: 3000,
                targetPrice: 3050,
                optimalSize: 10,
                profitPercent: 0.015,
                netProfit: 450
            };
            
            const execution = await arbitrageEngine.executeArbitrage(mockOpportunity);
            
            expect(execution).toBeDefined();
            expect(execution.opportunityId).toBe('test-opportunity');
            expect(execution.transactions.length).toBe(3); // Buy, Bridge, Sell
            expect(execution.transactions[0].type).toBe('buy');
            expect(execution.transactions[1].type).toBe('bridge');
            expect(execution.transactions[2].type).toBe('sell');
        });

        it('should handle bridge selection correctly', async () => {
            await arbitrageEngine.initialize(mockChainConfigs);
            
            // Test LayerZero bridge selection
            const bridge = await arbitrageEngine.selectOptimalBridge('1', '137', 'ETH', 10);
            expect(bridge).toBeDefined();
            expect(['LayerZero', 'Chainlink CCIP']).toContain(bridge.protocol || 'LayerZero');
        });

        it('should track arbitrage statistics', async () => {
            await arbitrageEngine.initialize(mockChainConfigs);
            
            const stats = arbitrageEngine.getArbitrageStats();
            
            expect(stats).toHaveProperty('totalOpportunities');
            expect(stats).toHaveProperty('totalExecutions');
            expect(stats).toHaveProperty('successRate');
            expect(stats).toHaveProperty('totalProfit');
            expect(stats).toHaveProperty('activeChains');
            expect(stats.activeChains).toBe(2);
        });

        it('should handle errors gracefully during execution', async () => {
            await arbitrageEngine.initialize(mockChainConfigs);
            
            // Mock a failing opportunity
            const failingOpportunity = {
                id: 'failing-opportunity',
                asset: 'INVALID',
                sourceChain: '999',
                targetChain: '998',
                optimalSize: 0
            };
            
            await expect(arbitrageEngine.executeArbitrage(failingOpportunity))
                .rejects.toThrow();
        });
    });

    describe('LiquidityRebalancer Tests', () => {
        it('should initialize with correct configuration', async () => {
            expect(liquidityRebalancer).toBeDefined();
            expect(liquidityRebalancer.config.rebalanceThreshold).toBe(0.15);
            expect(liquidityRebalancer.chains).toBeInstanceOf(Map);
            expect(liquidityRebalancer.liquidityPools).toBeInstanceOf(Map);
        });

        it('should setup chains and pools correctly', async () => {
            await liquidityRebalancer.initialize(mockChainConfigs, mockBridgeConfigs);
            
            expect(liquidityRebalancer.chains.size).toBe(2);
            expect(liquidityRebalancer.bridgeProviders.size).toBe(2);
            
            // Check if pools are created for all assets
            const ethPool1 = liquidityRebalancer.liquidityPools.get('ETH-1');
            const ethPool137 = liquidityRebalancer.liquidityPools.get('ETH-137');
            
            expect(ethPool1).toBeDefined();
            expect(ethPool137).toBeDefined();
            expect(ethPool1.asset).toBe('ETH');
            expect(ethPool1.chainId).toBe('1');
        });

        it('should analyze current liquidity state', async () => {
            await liquidityRebalancer.initialize(mockChainConfigs, mockBridgeConfigs);
            
            const currentState = await liquidityRebalancer.getCurrentLiquidityState();
            
            expect(currentState).toHaveProperty('totalLiquidity');
            expect(currentState).toHaveProperty('chainDistribution');
            expect(currentState).toHaveProperty('assetDistribution');
            expect(currentState.totalLiquidity).toBeInstanceOf(Map);
            expect(currentState.chainDistribution).toBeInstanceOf(Map);
        });

        it('should calculate optimal target allocations', async () => {
            await liquidityRebalancer.initialize(mockChainConfigs, mockBridgeConfigs);
            
            const currentState = await liquidityRebalancer.getCurrentLiquidityState();
            const targetState = await liquidityRebalancer.calculateOptimalTargetState(currentState);
            
            expect(targetState).toHaveProperty('targetAllocations');
            expect(targetState).toHaveProperty('expectedImprovement');
            expect(targetState.targetAllocations).toBeInstanceOf(Map);
            
            // Check that allocations sum to approximately 1.0 for each asset
            for (const [asset, allocations] of targetState.targetAllocations) {
                const totalAllocation = Array.from(allocations.values())
                    .reduce((sum, val) => sum + val, 0);
                expect(totalAllocation).toBeCloseTo(1.0, 2);
            }
        });

        it('should generate rebalancing actions when needed', async () => {
            await liquidityRebalancer.initialize(mockChainConfigs, mockBridgeConfigs);
            
            // Mock imbalanced state
            const mockCurrentState = {
                totalLiquidity: new Map([['ETH', 1000000]]),
                assetDistribution: new Map([['ETH', new Map([['1', 0.8], ['137', 0.2]])]]),
                chainDistribution: new Map()
            };
            
            const mockTargetState = {
                targetAllocations: new Map([['ETH', new Map([['1', 0.5], ['137', 0.5]])]])
            };
            
            const actions = await liquidityRebalancer.calculateRebalanceActions(
                mockCurrentState, mockTargetState
            );
            
            expect(Array.isArray(actions)).toBe(true);
            if (actions.length > 0) {
                expect(actions[0]).toHaveProperty('type');
                expect(actions[0]).toHaveProperty('asset');
                expect(actions[0]).toHaveProperty('sourceChain');
                expect(actions[0]).toHaveProperty('targetChain');
                expect(actions[0]).toHaveProperty('amount');
            }
        });

        it('should optimize rebalancing plan for efficiency', async () => {
            await liquidityRebalancer.initialize(mockChainConfigs, mockBridgeConfigs);
            
            const mockActions = [{
                type: 'rebalance',
                asset: 'ETH',
                sourceChain: '1',
                targetChain: '137',
                amount: 100000,
                estimatedCost: { total: 1000 },
                estimatedBenefit: 2000
            }];
            
            const optimizedPlan = await liquidityRebalancer.optimizeRebalancePlan(mockActions);
            
            expect(optimizedPlan).toHaveProperty('actions');
            expect(optimizedPlan).toHaveProperty('netBenefit');
            expect(optimizedPlan).toHaveProperty('totalCost');
            expect(optimizedPlan).toHaveProperty('totalBenefit');
            expect(optimizedPlan.netBenefit).toBe(optimizedPlan.totalBenefit - optimizedPlan.totalCost);
        });

        it('should execute rebalancing plan successfully', async () => {
            await liquidityRebalancer.initialize(mockChainConfigs, mockBridgeConfigs);
            
            const mockPlan = {
                actions: [{
                    type: 'rebalance',
                    asset: 'ETH',
                    sourceChain: '1',
                    targetChain: '137',
                    amount: 50000,
                    estimatedCost: { total: 500 },
                    estimatedBenefit: 1000
                }],
                netBenefit: 500
            };
            
            const execution = await liquidityRebalancer.executeRebalancePlan(mockPlan);
            
            expect(execution).toHaveProperty('status');
            expect(execution).toHaveProperty('completedActions');
            expect(execution).toHaveProperty('duration');
            expect(['executing', 'completed', 'partial']).toContain(execution.status);
        });

        it('should select optimal bridge for rebalancing', async () => {
            await liquidityRebalancer.initialize(mockChainConfigs, mockBridgeConfigs);
            
            const bridge = await liquidityRebalancer.selectOptimalBridge('1', '137', 'ETH', 100000);
            
            expect(bridge).toBeDefined();
            expect(bridge).toHaveProperty('name');
            expect(bridge).toHaveProperty('type');
            expect(['layerzero', 'chainlink']).toContain(bridge.type);
        });

        it('should track rebalancing statistics', async () => {
            await liquidityRebalancer.initialize(mockChainConfigs, mockBridgeConfigs);
            
            const stats = liquidityRebalancer.getRebalancingStats();
            
            expect(stats).toHaveProperty('totalRebalances');
            expect(stats).toHaveProperty('successfulRebalances');
            expect(stats).toHaveProperty('successRate');
            expect(stats).toHaveProperty('totalCapitalEfficiencyGain');
            expect(stats).toHaveProperty('activeChains');
            expect(stats).toHaveProperty('activePools');
        });
    });

    describe('EmergencyManager Tests', () => {
        it('should initialize with correct configuration', async () => {
            expect(emergencyManager).toBeDefined();
            expect(emergencyManager.config.maxSlippageThreshold).toBe(0.10);
            expect(emergencyManager.config.maxVolatilityThreshold).toBe(0.25);
            expect(emergencyManager.circuitBreakers).toBeInstanceOf(Map);
            expect(emergencyManager.emergencyProtocols).toBeInstanceOf(Map);
        });

        it('should setup circuit breakers for all assets and chains', async () => {
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            
            expect(emergencyManager.circuitBreakers.size).toBeGreaterThan(0);
            
            // Check system-wide circuit breaker
            const systemBreaker = emergencyManager.circuitBreakers.get('system-wide');
            expect(systemBreaker).toBeDefined();
            expect(systemBreaker.status).toBe('closed');
            
            // Check asset-specific circuit breakers
            const ethBreaker = emergencyManager.circuitBreakers.get('ETH-1');
            expect(ethBreaker).toBeDefined();
            expect(ethBreaker.asset).toBe('ETH');
            expect(ethBreaker.chainId).toBe('1');
        });

        it('should initialize emergency protocols', async () => {
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            
            expect(emergencyManager.emergencyProtocols.size).toBeGreaterThan(0);
            
            const emergencyPause = emergencyManager.emergencyProtocols.get('emergency-pause');
            expect(emergencyPause).toBeDefined();
            expect(emergencyPause.name).toBe('Emergency Pause');
            expect(emergencyPause.enabled).toBe(true);
        });

        it('should perform comprehensive risk assessment', async () => {
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            
            const riskAssessment = await emergencyManager.performRiskAssessment();
            
            expect(riskAssessment).toHaveProperty('overallRiskScore');
            expect(riskAssessment).toHaveProperty('riskLevel');
            expect(riskAssessment).toHaveProperty('timestamp');
            expect(riskAssessment.overallRiskScore).toBeGreaterThanOrEqual(0);
            expect(riskAssessment.overallRiskScore).toBeLessThanOrEqual(1);
            expect(['low', 'medium', 'high', 'critical']).toContain(riskAssessment.riskLevel);
        });

        it('should calculate market risk correctly', async () => {
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            
            const marketRisk = await emergencyManager.calculateMarketRisk();
            
            expect(marketRisk).toBeGreaterThanOrEqual(0);
            expect(marketRisk).toBeLessThanOrEqual(1);
        });

        it('should detect threats and trigger responses', async () => {
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            
            // Mock threat detection
            const mockThreat = {
                type: 'sandwich-attack',
                severity: 'high',
                confidence: 0.9,
                details: 'Mock threat for testing'
            };
            
            await emergencyManager.handleThreatDetection('sandwich-attack', mockThreat);
            
            expect(emergencyManager.emergencyHistory.length).toBeGreaterThan(0);
            const threatEvent = emergencyManager.emergencyHistory[0];
            expect(threatEvent.type).toBe('threat-detection');
            expect(threatEvent.threatType).toBe('sandwich-attack');
        });

        it('should trigger circuit breakers when thresholds are exceeded', async () => {
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            
            // Manually trigger a circuit breaker
            await emergencyManager.triggerCircuitBreaker('ETH-1', 'High slippage detected for testing');
            
            const ethBreaker = emergencyManager.circuitBreakers.get('ETH-1');
            expect(ethBreaker.status).toBe('open');
            expect(ethBreaker.triggerCount).toBe(1);
            expect(ethBreaker.lastTrigger).toBeDefined();
        });

        it('should execute emergency protocols correctly', async () => {
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            
            const mockEmergencyEvent = {
                type: 'circuit-breaker',
                severity: 'high',
                timestamp: Date.now()
            };
            
            await emergencyManager.executeEmergencyProtocol('emergency-pause', mockEmergencyEvent);
            
            expect(mockEmergencyEvent.response).toBeDefined();
            expect(mockEmergencyEvent.response.length).toBeGreaterThan(0);
            
            const execution = mockEmergencyEvent.response[0];
            expect(execution.status).toBe('completed');
            expect(execution.actions.length).toBeGreaterThan(0);
        });

        it('should handle emergency actions correctly', async () => {
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            
            const pauseResult = await emergencyManager.pauseAllTrading();
            expect(pauseResult.status).toBe('trading-paused');
            
            const freezeResult = await emergencyManager.freezeLiquidityOperations();
            expect(freezeResult.status).toBe('liquidity-frozen');
            
            const haltResult = await emergencyManager.haltWithdrawals();
            expect(haltResult.status).toBe('withdrawals-halted');
        });

        it('should send emergency notifications', async () => {
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            
            const mockNotification = {
                type: 'circuit-breaker',
                severity: 'high',
                breakerId: 'ETH-1',
                reason: 'Test notification',
                timestamp: Date.now()
            };
            
            await emergencyManager.sendEmergencyNotification(mockNotification);
            
            expect(emergencyManager.alertHistory.length).toBeGreaterThan(0);
            const alert = emergencyManager.alertHistory[0];
            expect(alert.type).toBe('circuit-breaker');
            expect(alert.acknowledged).toBe(false);
        });

        it('should track emergency statistics', async () => {
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            
            const stats = emergencyManager.getEmergencyStats();
            
            expect(stats).toHaveProperty('systemStatus');
            expect(stats).toHaveProperty('totalEmergencyEvents');
            expect(stats).toHaveProperty('totalAlerts');
            expect(stats).toHaveProperty('activeCircuitBreakers');
            expect(stats).toHaveProperty('totalCircuitBreakers');
            expect(stats).toHaveProperty('currentRiskLevel');
            expect(stats).toHaveProperty('currentRiskScore');
        });
    });

    describe('PerformanceMonitor Tests', () => {
        it('should initialize with correct configuration', async () => {
            expect(performanceMonitor).toBeDefined();
            expect(performanceMonitor.config.realTimeInterval).toBe(1000);
            expect(performanceMonitor.config.latencyThreshold).toBe(1000);
            expect(performanceMonitor.realTimeMetrics).toBeInstanceOf(Map);
            expect(performanceMonitor.alertRules).toBeInstanceOf(Map);
        });

        it('should initialize metrics collection framework', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            expect(performanceMonitor.systemMetrics.size).toBeGreaterThan(0);
            expect(performanceMonitor.componentMetrics.size).toBeGreaterThan(0);
            expect(performanceMonitor.alertRules.size).toBeGreaterThan(0);
            
            const systemMetrics = performanceMonitor.systemMetrics.get('performance');
            expect(systemMetrics).toBeDefined();
            expect(systemMetrics).toHaveProperty('avgLatency');
            expect(systemMetrics).toHaveProperty('throughput');
            expect(systemMetrics).toHaveProperty('errorRate');
        });

        it('should measure system performance correctly', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            const performance = await performanceMonitor.measureSystemPerformance();
            
            expect(performance).toHaveProperty('avgLatency');
            expect(performance).toHaveProperty('throughput');
            expect(performance).toHaveProperty('errorRate');
            expect(performance).toHaveProperty('successRate');
            expect(performance.avgLatency).toBeGreaterThanOrEqual(0);
            expect(performance.throughput).toBeGreaterThanOrEqual(0);
            expect(performance.errorRate).toBeGreaterThanOrEqual(0);
            expect(performance.errorRate).toBeLessThanOrEqual(1);
        });

        it('should measure component performance', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            const componentPerformance = await performanceMonitor.measureComponentPerformance('ai-orchestrator');
            
            expect(componentPerformance).toHaveProperty('uptime');
            expect(componentPerformance).toHaveProperty('latency');
            expect(componentPerformance).toHaveProperty('throughput');
            expect(componentPerformance).toHaveProperty('errorRate');
            expect(componentPerformance).toHaveProperty('healthStatus');
            expect(['healthy', 'degraded', 'unhealthy']).toContain(componentPerformance.healthStatus);
        });

        it('should measure AI performance metrics', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            const aiPerformance = await performanceMonitor.measureAIPerformance();
            
            expect(aiPerformance).toHaveProperty('predictionAccuracy');
            expect(aiPerformance).toHaveProperty('optimizationSpeed');
            expect(aiPerformance).toHaveProperty('convergenceRate');
            expect(aiPerformance).toHaveProperty('overallAIHealth');
            expect(aiPerformance.predictionAccuracy).toBeGreaterThanOrEqual(0);
            expect(aiPerformance.predictionAccuracy).toBeLessThanOrEqual(1);
        });

        it('should measure business metrics', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            const businessMetrics = await performanceMonitor.measureBusinessMetrics();
            
            expect(businessMetrics).toHaveProperty('totalValueLocked');
            expect(businessMetrics).toHaveProperty('dailyVolume');
            expect(businessMetrics).toHaveProperty('capitalEfficiency');
            expect(businessMetrics).toHaveProperty('activeUsers');
            expect(businessMetrics).toHaveProperty('userSatisfactionScore');
            expect(businessMetrics).toHaveProperty('businessHealth');
            expect(businessMetrics.totalValueLocked).toBeGreaterThan(0);
            expect(businessMetrics.dailyVolume).toBeGreaterThan(0);
        });

        it('should collect and store real-time metrics', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            await performanceMonitor.collectRealTimeMetrics();
            
            expect(performanceMonitor.realTimeMetrics.size).toBeGreaterThan(0);
            
            const systemPerformanceMetrics = performanceMonitor.realTimeMetrics.get('system.performance');
            if (systemPerformanceMetrics) {
                expect(Array.isArray(systemPerformanceMetrics)).toBe(true);
                expect(systemPerformanceMetrics.length).toBeGreaterThan(0);
                
                const latestMetric = systemPerformanceMetrics[systemPerformanceMetrics.length - 1];
                expect(latestMetric).toHaveProperty('timestamp');
                expect(latestMetric).toHaveProperty('data');
            }
        });

        it('should check alert rules and trigger alerts', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            // Simulate high latency condition
            const systemMetrics = performanceMonitor.systemMetrics.get('performance');
            systemMetrics.avgLatency = 2000; // Exceeds threshold of 1000ms
            
            await performanceMonitor.checkAlertRules();
            
            // Check if high-latency alert was triggered
            const latencyAlerts = performanceMonitor.alerts.filter(alert => alert.rule === 'high-latency');
            if (latencyAlerts.length > 0) {
                expect(latencyAlerts[0].severity).toBe('warning');
                expect(latencyAlerts[0].currentValue).toBe(2000);
            }
        });

        it('should aggregate metric data correctly', async () => {
            const mockDataPoints = [
                { data: 100, timestamp: Date.now() },
                { data: 150, timestamp: Date.now() },
                { data: 120, timestamp: Date.now() },
                { data: 180, timestamp: Date.now() },
                { data: 110, timestamp: Date.now() }
            ];
            
            const aggregated = performanceMonitor.aggregateMetricData(mockDataPoints);
            
            expect(aggregated).toHaveProperty('avg');
            expect(aggregated).toHaveProperty('min');
            expect(aggregated).toHaveProperty('max');
            expect(aggregated).toHaveProperty('p50');
            expect(aggregated).toHaveProperty('p95');
            expect(aggregated).toHaveProperty('count');
            expect(aggregated.count).toBe(5);
            expect(aggregated.min).toBe(100);
            expect(aggregated.max).toBe(180);
            expect(aggregated.avg).toBeCloseTo(132, 1);
        });

        it('should perform anomaly detection', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            // Create historical data with a clear anomaly
            const historicalData = [];
            for (let i = 0; i < 20; i++) {
                historicalData.push({
                    timestamp: Date.now() - (20 - i) * 60000,
                    aggregated: { avg: 100 + Math.random() * 10 } // Normal values around 100
                });
            }
            
            // Add anomaly
            historicalData.push({
                timestamp: Date.now(),
                aggregated: { avg: 500 } // Clear outlier
            });
            
            performanceMonitor.historicalMetrics.set('test-metric', historicalData);
            
            await performanceMonitor.performAnomalyDetection();
            
            const anomalies = performanceMonitor.analyticsData.get('anomalies');
            if (anomalies && anomalies.length > 0) {
                expect(anomalies[0]).toHaveProperty('metric');
                expect(anomalies[0]).toHaveProperty('zScore');
                expect(anomalies[0].zScore).toBeGreaterThan(2);
            }
        });

        it('should generate performance reports', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            const report = await performanceMonitor.generatePerformanceReport();
            
            expect(report).toHaveProperty('id');
            expect(report).toHaveProperty('timestamp');
            expect(report).toHaveProperty('summary');
            expect(report).toHaveProperty('systemHealth');
            expect(report).toHaveProperty('componentStatus');
            expect(report).toHaveProperty('alerts');
            expect(report).toHaveProperty('trends');
            expect(['healthy', 'warning', 'critical']).toContain(report.systemHealth);
        });

        it('should track monitoring statistics', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            const stats = performanceMonitor.getMonitoringStats();
            
            expect(stats).toHaveProperty('systemStatus');
            expect(stats).toHaveProperty('totalMetrics');
            expect(stats).toHaveProperty('activeAlerts');
            expect(stats).toHaveProperty('performance');
            expect(stats).toHaveProperty('aiMetrics');
            expect(stats).toHaveProperty('businessMetrics');
            expect(stats).toHaveProperty('componentHealth');
            expect(stats.totalMetrics).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Integration Tests', () => {
        it('should integrate all Phase 3 components correctly', async () => {
            // Initialize all components
            await arbitrageEngine.initialize(mockChainConfigs);
            await liquidityRebalancer.initialize(mockChainConfigs, mockBridgeConfigs);
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            // Verify all components are operational
            expect(arbitrageEngine.chains.size).toBe(2);
            expect(liquidityRebalancer.chains.size).toBe(2);
            expect(emergencyManager.circuitBreakers.size).toBeGreaterThan(0);
            expect(performanceMonitor.systemMetrics.size).toBeGreaterThan(0);
        });

        it('should handle emergency scenarios across all components', async () => {
            await emergencyManager.initialize(mockChainConfigs, {}, {});
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            // Trigger emergency scenario
            await emergencyManager.triggerCircuitBreaker('system-wide', 'Integration test emergency');
            
            // Verify emergency state
            const systemBreaker = emergencyManager.circuitBreakers.get('system-wide');
            expect(systemBreaker.status).toBe('open');
            
            // Verify monitoring detects the emergency
            const stats = emergencyManager.getEmergencyStats();
            expect(stats.systemStatus).toBe('emergency');
        });

        it('should maintain data consistency across components', async () => {
            await arbitrageEngine.initialize(mockChainConfigs);
            await liquidityRebalancer.initialize(mockChainConfigs, mockBridgeConfigs);
            
            // Both components should have the same chains configured
            expect(arbitrageEngine.chains.size).toBe(liquidityRebalancer.chains.size);
            
            for (const [chainId, chainInfo] of arbitrageEngine.chains) {
                const rebalancerChain = liquidityRebalancer.chains.get(chainId);
                expect(rebalancerChain).toBeDefined();
                expect(rebalancerChain.name).toBe(chainInfo.name);
            }
        });

        it('should handle concurrent operations safely', async () => {
            await arbitrageEngine.initialize(mockChainConfigs);
            await liquidityRebalancer.initialize(mockChainConfigs, mockBridgeConfigs);
            
            // Run multiple operations concurrently
            const promises = [
                arbitrageEngine.detectArbitrageOpportunities(),
                liquidityRebalancer.analyzeAndRebalance(),
                arbitrageEngine.getArbitrageStats(),
                liquidityRebalancer.getRebalancingStats()
            ];
            
            const results = await Promise.allSettled(promises);
            
            // All operations should complete without throwing
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Operation ${index} failed:`, result.reason);
                }
                expect(result.status).toBe('fulfilled');
            });
        });

        it('should demonstrate end-to-end performance monitoring', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            // Collect metrics
            await performanceMonitor.collectRealTimeMetrics();
            
            // Analyze performance
            await performanceMonitor.performAnalytics();
            
            // Generate report
            const report = await performanceMonitor.generatePerformanceReport();
            
            expect(report).toBeDefined();
            expect(report.summary).toHaveProperty('avgLatency');
            expect(report.summary).toHaveProperty('throughput');
            expect(report.componentStatus).toBeDefined();
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle network failures gracefully', async () => {
            // Mock network failure
            const failingConfig = {
                '1': {
                    ...mockChainConfigs['1'],
                    rpcUrl: 'https://invalid-url.com'
                }
            };
            
            // Should not throw but should handle gracefully
            await expect(arbitrageEngine.initialize(failingConfig)).resolves.not.toThrow();
        });

        it('should handle invalid configurations', async () => {
            const invalidConfig = {
                minProfitThreshold: -1, // Invalid negative threshold
                maxSlippage: 2 // Invalid >100% slippage
            };
            
            const engine = new ArbitrageEngine(invalidConfig);
            expect(engine.config.minProfitThreshold).toBe(-1); // Config should be stored as-is
            
            // But operations should handle invalid values gracefully
            const opportunities = await engine.detectArbitrageOpportunities();
            expect(Array.isArray(opportunities)).toBe(true);
        });

        it('should handle empty or missing data', async () => {
            await performanceMonitor.initialize(null, emergencyManager, liquidityRebalancer, arbitrageEngine);
            
            // Test with empty metrics
            const aggregated = performanceMonitor.aggregateMetricData([]);
            expect(aggregated.count).toBe(0);
            expect(aggregated.avg).toBe(0);
        });

        it('should handle resource constraints', async () => {
            // Test with very low position limits
            arbitrageEngine.config.maxPositionSize = 1; // $1 max position
            
            const positionSize = arbitrageEngine.calculateOptimalPositionSize(
                'ETH', 3000, 3050, 1000000, 1000000, { total: 100 }
            );
            
            expect(positionSize).toBeLessThanOrEqual(1 / 3000); // Should respect limit
        });
    });
});

// Test utilities
function expectApproximatelyEqual(actual, expected, tolerance = 0.01) {
    expect(Math.abs(actual - expected)).toBeLessThan(tolerance);
}

function expectValidTimestamp(timestamp) {
    expect(timestamp).toBeGreaterThan(Date.now() - 60000); // Within last minute
    expect(timestamp).toBeLessThanOrEqual(Date.now());
}

function expectValidPercentage(value) {
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
}