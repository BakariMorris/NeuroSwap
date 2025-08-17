#!/usr/bin/env node

/**
 * Simple test for data source integration
 * Tests core functionality without heavy external dependencies
 */

import { testnetDataService } from './frontend/src/services/testnetData.js';

async function testDataSources() {
    console.log('🔄 Testing NeuroSwap Data Sources...\n');
    
    try {
        // Test testnet data service initialization
        console.log('1. Testing testnet data service...');
        const systemData = await testnetDataService.initialize();
        
        if (systemData) {
            console.log('✅ Testnet data service initialized');
            console.log(`   - Networks: ${systemData.deployments?.totalNetworks || 0}`);
            console.log(`   - TVL: $${(systemData.metrics?.totalValueLocked || 0).toLocaleString()}`);
            console.log(`   - Volume: $${(systemData.metrics?.dailyVolume || 0).toLocaleString()}`);
            console.log(`   - AI Confidence: ${(systemData.metrics?.aiConfidence || 0).toFixed(1)}%`);
        } else {
            console.log('❌ Failed to initialize testnet data service');
        }
        
        // Test metrics calculation
        console.log('\n2. Testing metrics calculations...');
        const metrics = systemData?.metrics;
        if (metrics) {
            console.log('✅ Metrics data available:');
            console.log(`   - Capital Efficiency: ${metrics.capitalEfficiency?.toFixed(1)}%`);
            console.log(`   - Average Slippage: ${(metrics.avgSlippage * 100)?.toFixed(2)}%`);
            console.log(`   - System Uptime: ${metrics.systemUptime?.toFixed(2)}%`);
            console.log(`   - Cross-chain Connections: ${metrics.crossChainConnections}`);
        }
        
        // Test chain data
        console.log('\n3. Testing chain data...');
        const chains = systemData?.chains;
        if (chains && chains.length > 0) {
            console.log('✅ Chain data available:');
            for (const chain of chains.slice(0, 3)) { // Show first 3 chains
                console.log(`   - ${chain.name}: ${chain.status} (${chain.latency}ms)`);
                console.log(`     TVL: $${chain.liquidity?.toLocaleString()}`);
                console.log(`     Gas: ${chain.gasPrice?.toFixed(1)} gwei`);
            }
        }
        
        // Test AI data
        console.log('\n4. Testing AI orchestrator data...');
        const ai = systemData?.ai;
        if (ai) {
            console.log('✅ AI data available:');
            console.log(`   - Orchestrator: ${ai.orchestrator?.status}`);
            console.log(`   - Market Analyzer: ${ai.marketAnalyzer?.status}`);
            console.log(`   - Parameter Optimizer: ${ai.parameterOptimizer?.status}`);
            console.log(`   - Emergency Manager: ${ai.emergencyManager?.status}`);
        }
        
        // Test transaction data
        console.log('\n5. Testing transaction data...');
        const transactions = systemData?.transactions;
        if (transactions && transactions.length > 0) {
            console.log(`✅ Transaction data available: ${transactions.length} transactions`);
            const recentTx = transactions[0];
            console.log(`   Latest: ${recentTx.type} - $${recentTx.amount} ${recentTx.tokens?.join('/')} on ${recentTx.chain}`);
        }
        
        // Test data consistency
        console.log('\n6. Testing data consistency...');
        let consistencyScore = 0;
        
        // Check if metrics are realistic
        if (metrics?.totalValueLocked > 0 && metrics?.totalValueLocked < 10000000) {
            consistencyScore += 20; // Realistic testnet TVL
        }
        
        if (metrics?.capitalEfficiency > 50 && metrics?.capitalEfficiency < 100) {
            consistencyScore += 20; // Realistic efficiency
        }
        
        if (chains && chains.every(c => c.gasPrice > 0 && c.gasPrice < 1000)) {
            consistencyScore += 20; // Realistic gas prices
        }
        
        if (ai && Object.values(ai).every(module => module.status)) {
            consistencyScore += 20; // All AI modules have status
        }
        
        if (transactions && transactions.length > 0) {
            consistencyScore += 20; // Transaction data present
        }
        
        console.log(`✅ Data consistency score: ${consistencyScore}/100`);
        
        if (consistencyScore >= 80) {
            console.log('🎉 Excellent data quality!');
        } else if (consistencyScore >= 60) {
            console.log('✅ Good data quality');
        } else {
            console.log('⚠️  Data quality needs improvement');
        }
        
        // Test real-time updates
        console.log('\n7. Testing real-time updates...');
        const updatePromise = new Promise((resolve) => {
            const unsubscribe = testnetDataService.subscribe((updatedData) => {
                console.log('✅ Real-time update received');
                console.log(`   Timestamp: ${new Date(updatedData.timestamp).toISOString()}`);
                unsubscribe();
                resolve();
            });
            
            // Trigger an update
            setTimeout(() => {
                testnetDataService.updateRealTimeData();
            }, 1000);
        });
        
        await Promise.race([
            updatePromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Update timeout')), 5000))
        ]);
        
        console.log('\n✅ All data source tests completed successfully!');
        
        return {
            success: true,
            consistencyScore,
            dataPoints: {
                networks: systemData.deployments?.totalNetworks || 0,
                tvl: systemData.metrics?.totalValueLocked || 0,
                transactions: transactions?.length || 0,
                chains: chains?.length || 0
            }
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    } finally {
        // Cleanup
        testnetDataService.destroy();
        console.log('\n🧹 Cleanup completed');
    }
}

// Test data accuracy and realism
function validateDataRealism(systemData) {
    console.log('\n🎯 Validating data realism...');
    
    const issues = [];
    const metrics = systemData?.metrics;
    
    // Check TVL range for testnet
    if (metrics?.totalValueLocked > 10000000) {
        issues.push('TVL too high for testnet');
    }
    
    // Check volume vs TVL ratio
    if (metrics?.totalValueLocked > 0 && metrics?.dailyVolume > 0) {
        const volumeRatio = metrics.dailyVolume / metrics.totalValueLocked;
        if (volumeRatio > 1) {
            issues.push('Daily volume higher than TVL (unusual)');
        }
    }
    
    // Check AI confidence
    if (metrics?.aiConfidence > 99) {
        issues.push('AI confidence unrealistically high');
    }
    
    // Check slippage
    if (metrics?.avgSlippage > 0.5) {
        issues.push('Average slippage too high');
    }
    
    if (issues.length === 0) {
        console.log('✅ All data appears realistic');
    } else {
        console.log('⚠️  Potential issues found:');
        issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    return issues.length === 0;
}

// Main execution
async function main() {
    console.log('🚀 NeuroSwap Data Sources Test\n');
    
    const result = await testDataSources();
    
    if (result.success) {
        console.log('\n📊 Test Summary:');
        console.log(`   ✅ Success: ${result.success}`);
        console.log(`   📈 Consistency Score: ${result.consistencyScore}/100`);
        console.log(`   🌐 Networks: ${result.dataPoints.networks}`);
        console.log(`   💰 TVL: $${result.dataPoints.tvl.toLocaleString()}`);
        console.log(`   📋 Transactions: ${result.dataPoints.transactions}`);
        console.log(`   ⛓️  Chains: ${result.dataPoints.chains}`);
    } else {
        console.log(`\n❌ Test failed: ${result.error}`);
        process.exit(1);
    }
    
    console.log('\n🎉 Testing completed!');
}

// Error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error.message);
    process.exit(1);
});

// Run the tests
main().catch(console.error);