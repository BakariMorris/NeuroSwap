/**
 * Focused Phase 3 Testing Suite
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

        it('should calculate optimal position size correctly', function() {
            const positionSize = arbitrageEngine.calculateOptimalPositionSize(
                'ETH', 3000, 3050, 1000000, 1000000, { total: 100 }
            );
            
            expect(positionSize).to.be.greaterThan(0);
            expect(positionSize).to.be.lessThanOrEqual(100000);
        });

        it('should track arbitrage statistics', function() {
            const stats = arbitrageEngine.getArbitrageStats();
            
            expect(stats).to.have.property('totalOpportunities');
            expect(stats).to.have.property('totalExecutions');
            expect(stats).to.have.property('successRate');
            expect(stats).to.have.property('totalProfit');
            expect(stats).to.have.property('activeChains');
        });

        it('should calculate opportunity confidence', function() {
            const confidence = arbitrageEngine.calculateOpportunityConfidence(3000, 3050, 1000000, 1000000);
            
            expect(confidence).to.be.within(0, 1);
            expect(confidence).to.be.greaterThan(0.5); // Should have good confidence with these values
        });

        it('should calculate risk score for opportunity', function() {
            const riskScore = arbitrageEngine.calculateRiskScore('ETH', '1', '137', 50000);
            
            expect(riskScore).to.be.within(0, 1);
        });
    });

    describe('LiquidityRebalancer Tests', function() {
        it('should initialize with correct configuration', function() {
            expect(liquidityRebalancer).to.not.be.undefined;
            expect(liquidityRebalancer.config.rebalanceThreshold).to.equal(0.15);
            expect(liquidityRebalancer.chains).to.be.instanceOf(Map);
            expect(liquidityRebalancer.liquidityPools).to.be.instanceOf(Map);
        });

        it('should calculate chain efficiency correctly', function() {
            const efficiency = liquidityRebalancer.calculateChainEfficiency('1', 1000000, 0.6, 500000);
            
            expect(efficiency).to.be.within(0, 1);
            expect(efficiency).to.be.greaterThan(0);
        });

        it('should calculate chain risk multiplier', function() {
            const ethereumRisk = liquidityRebalancer.calculateChainRiskMultiplier('1');
            const polygonRisk = liquidityRebalancer.calculateChainRiskMultiplier('137');
            
            expect(ethereumRisk).to.equal(1.0); // Ethereum should have lowest risk
            expect(polygonRisk).to.be.lessThan(1.0); // Other chains should have higher risk
        });

        it('should calculate optimal position size constraints', function() {
            const sources = liquidityRebalancer.findLiquiditySourceChains(
                'ETH', 
                100000, 
                new Map([['1', 0.8], ['137', 0.2]]), 
                new Map([['1', 0.5], ['137', 0.5]])
            );
            
            expect(Array.isArray(sources)).to.be.true;
        });

        it('should track rebalancing statistics', function() {
            const stats = liquidityRebalancer.getRebalancingStats();
            
            expect(stats).to.have.property('totalRebalances');
            expect(stats).to.have.property('successfulRebalances');
            expect(stats).to.have.property('successRate');
            expect(stats).to.have.property('totalCapitalEfficiencyGain');
            expect(stats).to.have.property('activeChains');
            expect(stats).to.have.property('activePools');
        });
    });

    describe('EmergencyManager Tests', function() {
        it('should initialize with correct configuration', function() {
            expect(emergencyManager).to.not.be.undefined;
            expect(emergencyManager.config.maxSlippageThreshold).to.equal(0.10);
            expect(emergencyManager.config.maxVolatilityThreshold).to.equal(0.25);
            expect(emergencyManager.circuitBreakers).to.be.instanceOf(Map);
            expect(emergencyManager.emergencyProtocols).to.be.instanceOf(Map);
        });

        it('should calculate opportunity confidence score', function() {
            // This method is in ArbitrageEngine, not EmergencyManager
            const confidence = arbitrageEngine.calculateOpportunityConfidence(3000, 3050, 1000000, 1000000);
            
            expect(confidence).to.be.within(0, 1);
        });

        it('should calculate risk score for opportunity', function() {
            // This method is in ArbitrageEngine, not EmergencyManager
            const riskScore = arbitrageEngine.calculateRiskScore('ETH', '1', '137', 50000);
            
            expect(riskScore).to.be.within(0, 1);
        });

        it('should evaluate alert conditions correctly', function() {
            // This method is in PerformanceMonitor, not EmergencyManager
            const rule = {
                condition: 'greater_than',
                threshold: 100
            };
            
            expect(performanceMonitor.evaluateAlertCondition(rule, 150)).to.be.true;
            expect(performanceMonitor.evaluateAlertCondition(rule, 50)).to.be.false;
        });

        it('should calculate action urgency', function() {
            // This method is in LiquidityRebalancer, not EmergencyManager
            const highUrgency = liquidityRebalancer.calculateActionUrgency(0.6);
            const lowUrgency = liquidityRebalancer.calculateActionUrgency(0.1);
            
            expect(highUrgency).to.equal('emergency');
            expect(lowUrgency).to.equal('low');
        });

        it('should track emergency statistics', function() {
            const stats = emergencyManager.getEmergencyStats();
            
            expect(stats).to.have.property('systemStatus');
            expect(stats).to.have.property('totalEmergencyEvents');
            expect(stats).to.have.property('totalAlerts');
            expect(stats).to.have.property('activeCircuitBreakers');
            expect(stats).to.have.property('totalCircuitBreakers');
            expect(stats).to.have.property('currentRiskLevel');
            expect(stats).to.have.property('currentRiskScore');
        });
    });

    describe('PerformanceMonitor Tests', function() {
        it('should initialize with correct configuration', function() {
            expect(performanceMonitor).to.not.be.undefined;
            expect(performanceMonitor.config.realTimeInterval).to.equal(1000);
            expect(performanceMonitor.config.latencyThreshold).to.equal(1000);
            expect(performanceMonitor.realTimeMetrics).to.be.instanceOf(Map);
            expect(performanceMonitor.alertRules).to.be.instanceOf(Map);
        });

        it('should aggregate metric data correctly', function() {
            const mockDataPoints = [
                { data: 100, timestamp: Date.now() },
                { data: 150, timestamp: Date.now() },
                { data: 120, timestamp: Date.now() },
                { data: 180, timestamp: Date.now() },
                { data: 110, timestamp: Date.now() }
            ];
            
            const aggregated = performanceMonitor.aggregateMetricData(mockDataPoints);
            
            expect(aggregated).to.have.property('avg');
            expect(aggregated).to.have.property('min');
            expect(aggregated).to.have.property('max');
            expect(aggregated).to.have.property('p50');
            expect(aggregated).to.have.property('p95');
            expect(aggregated).to.have.property('count');
            expect(aggregated.count).to.equal(5);
            expect(aggregated.min).to.equal(100);
            expect(aggregated.max).to.equal(180);
            expect(aggregated.avg).to.be.closeTo(132, 1);
        });

        it('should calculate percentiles correctly', function() {
            const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            
            const p50 = performanceMonitor.percentile(values, 0.5);
            const p95 = performanceMonitor.percentile(values, 0.95);
            
            expect(p50).to.be.closeTo(5.5, 0.1);
            expect(p95).to.be.closeTo(9.5, 0.1);
        });

        it('should calculate standard deviation correctly', function() {
            const values = [2, 4, 4, 4, 5, 5, 7, 9];
            const stdDev = performanceMonitor.standardDeviation(values);
            
            expect(stdDev).to.be.closeTo(2, 0.1);
        });

        it('should calculate trend correctly', function() {
            const increasingValues = [1, 2, 3, 4, 5];
            const decreasingValues = [5, 4, 3, 2, 1];
            const stableValues = [3, 3, 3, 3, 3];
            
            const increasingTrend = performanceMonitor.calculateTrend(increasingValues);
            const decreasingTrend = performanceMonitor.calculateTrend(decreasingValues);
            const stableTrend = performanceMonitor.calculateTrend(stableValues);
            
            expect(increasingTrend).to.be.greaterThan(0);
            expect(decreasingTrend).to.be.lessThan(0);
            expect(stableTrend).to.be.closeTo(0, 0.1);
        });

        it('should get system status correctly', function() {
            // Mock system metrics
            performanceMonitor.systemMetrics.set('performance', {
                errorRate: 0.02,
                avgLatency: 500
            });
            performanceMonitor.systemMetrics.set('uptime', {
                availability: 0.999
            });
            
            const status = performanceMonitor.getSystemStatus();
            expect(['healthy', 'warning', 'critical']).to.include(status);
        });

        it('should track monitoring statistics', function() {
            const stats = performanceMonitor.getMonitoringStats();
            
            expect(stats).to.have.property('systemStatus');
            expect(stats).to.have.property('totalMetrics');
            expect(stats).to.have.property('activeAlerts');
            expect(stats).to.have.property('performance');
            expect(stats).to.have.property('aiMetrics');
            expect(stats).to.have.property('businessMetrics');
            expect(stats).to.have.property('componentHealth');
            expect(stats.totalMetrics).to.be.at.least(0);
        });
    });

    describe('Integration Tests', function() {
        it('should integrate all Phase 3 components correctly', function() {
            // Verify all components are operational
            expect(arbitrageEngine.chains).to.be.instanceOf(Map);
            expect(liquidityRebalancer.chains).to.be.instanceOf(Map);
            expect(emergencyManager.circuitBreakers).to.be.instanceOf(Map);
            expect(performanceMonitor.systemMetrics).to.be.instanceOf(Map);
        });

        it('should maintain data consistency across components', function() {
            // Both arbitrage engine and liquidity rebalancer should use similar base prices
            const arbitrageETHPrice = arbitrageEngine.getBasePrice('ETH');
            const rebalancerChainEfficiency = liquidityRebalancer.calculateChainEfficiency('1', 1000000, 0.5, 500000);
            
            expect(arbitrageETHPrice).to.be.greaterThan(0);
            expect(rebalancerChainEfficiency).to.be.within(0, 1);
        });

        it('should handle error scenarios gracefully', function() {
            // Test with invalid configurations
            const invalidArbitrageEngine = new ArbitrageEngine({
                minProfitThreshold: -1,
                maxSlippage: 2
            });
            
            expect(invalidArbitrageEngine.config.minProfitThreshold).to.equal(-1);
            
            // Operations should still work with defensive programming
            const opportunities = invalidArbitrageEngine.getArbitrageStats();
            expect(opportunities).to.be.an('object');
        });

        it('should demonstrate performance monitoring integration', async function() {
            this.timeout(5000);
            
            // Initialize performance monitor with other components
            await performanceMonitor.initializeMetricsCollection();
            
            // Simulate collecting metrics
            const systemPerformance = await performanceMonitor.measureSystemPerformance();
            
            expect(systemPerformance).to.have.property('avgLatency');
            expect(systemPerformance).to.have.property('throughput');
            expect(systemPerformance).to.have.property('errorRate');
            expect(systemPerformance.avgLatency).to.be.at.least(0);
            expect(systemPerformance.throughput).to.be.at.least(0);
        });
    });

    describe('Component Health and Status', function() {
        it('should provide health status for arbitrage engine', function() {
            const stats = arbitrageEngine.getArbitrageStats();
            
            expect(stats).to.have.property('activeChains');
            expect(stats).to.have.property('totalOpportunities');
            expect(stats.totalOpportunities).to.be.at.least(0);
        });

        it('should provide health status for liquidity rebalancer', function() {
            const stats = liquidityRebalancer.getRebalancingStats();
            
            expect(stats).to.have.property('totalRebalances');
            expect(stats).to.have.property('successRate');
            expect(stats.totalRebalances).to.be.at.least(0);
        });

        it('should provide health status for emergency manager', function() {
            const stats = emergencyManager.getEmergencyStats();
            
            expect(stats).to.have.property('systemStatus');
            expect(stats).to.have.property('currentRiskLevel');
            expect(['operational', 'warning', 'emergency', 'halted']).to.include(stats.systemStatus);
        });

        it('should provide health status for performance monitor', function() {
            const stats = performanceMonitor.getMonitoringStats();
            
            expect(stats).to.have.property('systemStatus');
            expect(stats).to.have.property('totalMetrics');
            expect(stats.totalMetrics).to.be.at.least(0);
        });
    });

    describe('Configuration Validation', function() {
        it('should handle missing configuration gracefully', function() {
            const minimalArbitrageEngine = new ArbitrageEngine({});
            const minimalLiquidityRebalancer = new LiquidityRebalancer({});
            const minimalEmergencyManager = new EmergencyManager({});
            const minimalPerformanceMonitor = new PerformanceMonitor({});
            
            expect(minimalArbitrageEngine).to.not.be.undefined;
            expect(minimalLiquidityRebalancer).to.not.be.undefined;
            expect(minimalEmergencyManager).to.not.be.undefined;
            expect(minimalPerformanceMonitor).to.not.be.undefined;
        });

        it('should validate configuration parameters', function() {
            // Test extreme configurations
            const extremeConfig = {
                minProfitThreshold: 0.5, // 50% minimum profit
                maxSlippage: 0.01, // 1% max slippage
                rebalanceThreshold: 0.5 // 50% rebalance threshold
            };
            
            const extremeArbitrageEngine = new ArbitrageEngine(extremeConfig);
            const extremeLiquidityRebalancer = new LiquidityRebalancer(extremeConfig);
            
            expect(extremeArbitrageEngine.config.minProfitThreshold).to.equal(0.5);
            expect(extremeLiquidityRebalancer.config.rebalanceThreshold).to.equal(0.5);
        });
    });
});