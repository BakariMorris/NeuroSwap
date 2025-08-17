/**
 * Comprehensive tests for AI Orchestrator
 */

import { expect } from 'chai';
import { AIOrchestrator } from '../AIOrchestrator.js';
import { ethers } from 'ethers';

describe('AI Orchestrator Tests', function() {
    let orchestrator;
    let mockConfig;
    
    beforeEach(function() {
        // Create mock configuration
        mockConfig = {
            provider: null,
            signer: { 
                address: '0x123...', 
                signMessage: async () => '0xSignature...' 
            },
            aimmContract: {
                getAddress: async () => '0xContract...',
                updateParameters: async () => ({ 
                    hash: '0xTx...', 
                    wait: async () => {} 
                }),
                getPoolParameters: async () => ({
                    feeRate: 30,
                    spreadMultiplier: 1000,
                    weights: [2500, 2500, 2500, 2500],
                    lastUpdate: Math.floor(Date.now() / 1000),
                    isActive: true
                })
            },
            
            optimizationInterval: 1000, // Fast for testing
            emergencyThreshold: 0.15,
            maxParameterChange: 0.2,
            confidenceThreshold: 0.6,
            
            marketAnalyzer: { updateInterval: 1000 },
            parameterOptimizer: { learningRate: 0.01 },
            flareOracle: { updateInterval: 1000 },
            hederaAI: { network: 'test' },
            
            assets: ['ETH', 'USDC']
        };
        
        orchestrator = new AIOrchestrator(mockConfig);
    });
    
    afterEach(async function() {
        if (orchestrator.isRunning) {
            await orchestrator.stop();
        }
    });
    
    describe('Initialization', function() {
        it('should initialize with correct configuration', function() {
            expect(orchestrator.config.assets).to.deep.equal(['ETH', 'USDC']);
            expect(orchestrator.config.optimizationInterval).to.equal(1000);
            expect(orchestrator.emergencyMode).to.be.false;
            expect(orchestrator.isRunning).to.be.false;
        });
        
        it('should have all required AI services', function() {
            expect(orchestrator.aiAgent).to.not.be.null;
            expect(orchestrator.marketAnalyzer).to.not.be.null;
            expect(orchestrator.parameterOptimizer).to.not.be.null;
            expect(orchestrator.flareOracle).to.not.be.null;
            expect(orchestrator.hederaAI).to.not.be.null;
        });
    });
    
    describe('Market Data Collection', function() {
        it('should collect comprehensive market data', async function() {
            const marketData = await orchestrator.collectComprehensiveMarketData();
            
            expect(marketData).to.have.property('timestamp');
            expect(marketData).to.have.property('assets');
            expect(marketData).to.have.property('dataQuality');
            expect(marketData.assets.size).to.be.greaterThan(0);
            expect(marketData.dataQuality).to.be.within(0, 1);
        });
        
        it('should handle data collection errors gracefully', async function() {
            // Mock service to throw error
            orchestrator.flareOracle.getPriceData = async () => {
                throw new Error('Connection failed');
            };
            
            try {
                await orchestrator.collectComprehensiveMarketData();
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Connection failed');
            }
        });
    });
    
    describe('Market Analysis', function() {
        it('should perform comprehensive market analysis', async function() {
            const mockMarketData = {
                timestamp: Date.now(),
                assets: new Map([
                    ['ETH', { price: 3000, volume: 1000000, confidence: 0.8 }],
                    ['USDC', { price: 1.0, volume: 2000000, confidence: 0.9 }]
                ]),
                dataQuality: 0.85
            };
            
            const analysis = await orchestrator.performMarketAnalysis(mockMarketData);
            
            expect(analysis).to.have.property('marketOverview');
            expect(analysis).to.have.property('assets');
            expect(analysis).to.have.property('riskMetrics');
            expect(analysis).to.have.property('hederaPrediction');
            expect(analysis).to.have.property('consensusConfidence');
        });
    });
    
    describe('Parameter Optimization', function() {
        it('should optimize parameters using ML algorithms', async function() {
            const mockAnalysis = {
                marketOverview: {
                    avgVolatility: 0.05,
                    trend: 'BULLISH',
                    bullishAssets: 1,
                    bearishAssets: 0
                },
                riskMetrics: {
                    riskScore: 0.3
                },
                confidence: 0.8
            };
            
            const optimization = await orchestrator.optimizeParameters(mockAnalysis);
            
            expect(optimization).to.have.property('parameters');
            expect(optimization).to.have.property('mlConfidence');
            expect(optimization).to.have.property('hederaConfidence');
            expect(optimization).to.have.property('combinedConfidence');
            expect(optimization.parameters).to.have.property('feeRate');
            expect(optimization.parameters).to.have.property('spreadMultiplier');
            expect(optimization.parameters).to.have.property('weights');
        });
    });
    
    describe('Deployment Validation', function() {
        it('should validate optimization before deployment', function() {
            const highConfidenceOpt = {
                combinedConfidence: 0.8,
                parameters: { feeRate: 30, spreadMultiplier: 1000 }
            };
            
            const lowConfidenceOpt = {
                combinedConfidence: 0.4,
                parameters: { feeRate: 30, spreadMultiplier: 1000 }
            };
            
            expect(orchestrator.shouldDeployOptimization(highConfidenceOpt)).to.be.true;
            expect(orchestrator.shouldDeployOptimization(lowConfidenceOpt)).to.be.false;
        });
        
        it('should reject deployments with excessive parameter changes', function() {
            // Add a previous deployment to history
            orchestrator.aiAgent.performanceHistory = [{
                parameters: { feeRate: 30, spreadMultiplier: 1000 }
            }];
            
            const excessiveChangeOpt = {
                combinedConfidence: 0.9,
                parameters: { 
                    feeRate: 60, // 100% increase
                    spreadMultiplier: 2000 // 100% increase
                }
            };
            
            expect(orchestrator.shouldDeployOptimization(excessiveChangeOpt)).to.be.false;
        });
    });
    
    describe('Emergency Mode', function() {
        it('should trigger emergency mode on high volatility', async function() {
            const highVolatilityAnalysis = {
                marketOverview: {
                    avgVolatility: 0.25 // Above 15% threshold
                }
            };
            
            await orchestrator.triggerEmergencyMode(highVolatilityAnalysis);
            
            expect(orchestrator.emergencyMode).to.be.true;
        });
        
        it('should exit emergency mode when conditions stabilize', async function() {
            orchestrator.emergencyMode = true;
            
            await orchestrator.exitEmergencyMode();
            
            expect(orchestrator.emergencyMode).to.be.false;
        });
        
        it('should validate emergency mode changes', function() {
            orchestrator.emergencyMode = true;
            
            const validEmergencyOpt = {
                combinedConfidence: 0.8,
                parameters: {
                    feeRate: 150, // 1.5% - valid
                    spreadMultiplier: 1300 // 1.3x - valid
                }
            };
            
            const invalidEmergencyOpt = {
                combinedConfidence: 0.8,
                parameters: {
                    feeRate: 50, // 0.5% - too low for emergency
                    spreadMultiplier: 800 // 0.8x - too low for emergency
                }
            };
            
            expect(orchestrator.shouldDeployOptimization(validEmergencyOpt)).to.be.true;
            expect(orchestrator.shouldDeployOptimization(invalidEmergencyOpt)).to.be.false;
        });
    });
    
    describe('System Lifecycle', function() {
        it('should start and stop gracefully', async function() {
            expect(orchestrator.isRunning).to.be.false;
            
            // Start with short interval for testing
            orchestrator.config.optimizationInterval = 100;
            const startPromise = orchestrator.start();
            
            // Give it time to initialize
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(orchestrator.isRunning).to.be.true;
            
            // Stop the orchestrator
            await orchestrator.stop();
            expect(orchestrator.isRunning).to.be.false;
        });
        
        it('should handle start errors gracefully', async function() {
            // Mock a service to fail initialization
            orchestrator.flareOracle.healthCheck = async () => {
                throw new Error('Service unavailable');
            };
            
            try {
                await orchestrator.start();
                expect.fail('Should have thrown error');
            } catch (error) {
                expect(error.message).to.include('Service unavailable');
                expect(orchestrator.isRunning).to.be.false;
            }
        });
    });
    
    describe('Performance Metrics', function() {
        it('should calculate performance metrics', function() {
            const metrics = orchestrator.calculatePerformanceMetrics();
            
            expect(metrics).to.have.property('profitability');
            expect(metrics).to.have.property('volumeChange');
            expect(metrics).to.have.property('capitalEfficiency');
            expect(metrics.profitability).to.be.within(0, 1);
            expect(metrics.capitalEfficiency).to.be.greaterThan(0);
        });
        
        it('should update performance metrics', async function() {
            const mockOptimization = {
                parameters: { feeRate: 30, spreadMultiplier: 1000 },
                combinedConfidence: 0.8
            };
            
            await orchestrator.updatePerformanceMetrics(mockOptimization);
            
            expect(orchestrator.performanceMetrics.size).to.be.greaterThan(0);
        });
    });
    
    describe('Status Reporting', function() {
        it('should provide comprehensive status', function() {
            const status = orchestrator.getStatus();
            
            expect(status).to.have.property('isRunning');
            expect(status).to.have.property('emergencyMode');
            expect(status).to.have.property('lastOptimization');
            expect(status).to.have.property('assets');
            expect(status).to.have.property('healthChecks');
            expect(status).to.have.property('performanceMetrics');
        });
    });
    
    describe('Error Handling', function() {
        it('should handle optimization errors gracefully', async function() {
            const error = new Error('Network connection failed');
            
            await orchestrator.handleOptimizationError(error);
            
            // Should log error and continue
            expect(orchestrator.performanceMetrics.size).to.be.greaterThan(0);
        });
        
        it('should save system state on shutdown', async function() {
            const state = await orchestrator.saveSystemState();
            
            expect(state).to.have.property('lastOptimization');
            expect(state).to.have.property('emergencyMode');
            expect(state).to.have.property('performanceMetrics');
            expect(state).to.have.property('healthChecks');
        });
    });
    
    describe('Integration Tests', function() {
        it('should run a complete optimization cycle', async function() {
            this.timeout(10000); // Longer timeout for integration test
            
            // Start orchestrator with very short intervals
            orchestrator.config.optimizationInterval = 100;
            orchestrator.config.confidenceThreshold = 0.1; // Lower threshold for testing
            
            const startPromise = orchestrator.start();
            
            // Let it run for a few cycles
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Check that optimization occurred
            expect(orchestrator.lastOptimization).to.be.greaterThan(0);
            
            // Stop the orchestrator
            await orchestrator.stop();
        });
    });
});