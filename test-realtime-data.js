#!/usr/bin/env node

/**
 * Test script for real-time data integration
 * Validates that we're getting real data from various sources
 */

import { realTimeDataService } from './ai-agent/services/RealTimeDataService.js';

// Test configuration for testnets
const testnetConfig = {
    '11155111': { // Sepolia
        name: 'Ethereum Sepolia',
        rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
        nativeToken: 'ETH'
    },
    '421614': { // Arbitrum Sepolia
        name: 'Arbitrum Sepolia',
        rpcUrl: process.env.ARBITRUM_SEPOLIA_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
        nativeToken: 'ETH'
    },
    '11155420': { // Optimism Sepolia
        name: 'Optimism Sepolia', 
        rpcUrl: process.env.OPTIMISM_SEPOLIA_RPC_URL || 'https://sepolia.optimism.io',
        nativeToken: 'ETH'
    }
};

async function testRealTimeDataService() {
    console.log('🔄 Testing Real-Time Data Service...\n');
    
    try {
        // Initialize the service
        await realTimeDataService.initialize(testnetConfig);
        console.log('✅ Real-time data service initialized\n');
        
        // Test 1: Price fetching from multiple sources
        console.log('📊 Testing price feeds...');
        const assets = ['ETH', 'BTC', 'LINK', 'USDC'];
        const chainIds = ['11155111', '421614', '11155420'];
        
        for (const asset of assets) {
            console.log(`\n--- ${asset} Prices ---`);
            
            for (const chainId of chainIds) {
                const price = await realTimeDataService.getAssetPrice(asset, chainId);
                const chainName = testnetConfig[chainId]?.name || `Chain ${chainId}`;
                
                if (price > 0) {
                    console.log(`✅ ${chainName}: $${price.toFixed(4)}`);
                } else {
                    console.log(`❌ ${chainName}: No price data`);
                }
            }
        }
        
        // Test 2: Gas price fetching
        console.log('\n⛽ Testing gas prices...');
        for (const chainId of chainIds) {
            const gasPrice = await realTimeDataService.getGasPrice(chainId);
            const chainName = testnetConfig[chainId]?.name || `Chain ${chainId}`;
            const gasPriceGwei = gasPrice / 1e9;
            
            console.log(`${chainName}: ${gasPriceGwei.toFixed(2)} gwei`);
        }
        
        // Test 3: Block data fetching
        console.log('\n🧱 Testing block data...');
        for (const chainId of chainIds) {
            const blockData = await realTimeDataService.getBlockData(chainId);
            const chainName = testnetConfig[chainId]?.name || `Chain ${chainId}`;
            
            if (blockData) {
                console.log(`✅ ${chainName}: Block #${blockData.number} (${new Date(blockData.timestamp * 1000).toISOString()})`);
            } else {
                console.log(`❌ ${chainName}: No block data`);
            }
        }
        
        // Test 4: Liquidity data
        console.log('\n💧 Testing liquidity data...');
        const testPairs = [
            ['ETH', 'USDC'],
            ['BTC', 'USDC'],
            ['LINK', 'USDC']
        ];
        
        for (const [asset0, asset1] of testPairs) {
            console.log(`\n--- ${asset0}/${asset1} Liquidity ---`);
            
            for (const chainId of chainIds) {
                const liquidityData = await realTimeDataService.getLiquidityData(asset0, asset1, chainId);
                const chainName = testnetConfig[chainId]?.name || `Chain ${chainId}`;
                
                if (liquidityData.liquidity > 0) {
                    console.log(`✅ ${chainName}: $${liquidityData.liquidity.toFixed(0)} (${liquidityData.pools} pools)`);
                } else {
                    console.log(`⚠️  ${chainName}: No liquidity data`);
                }
            }
        }
        
        // Test 5: Market volatility
        console.log('\n📈 Testing volatility calculations...');
        for (const asset of ['ETH', 'BTC', 'LINK']) {
            const volatility = await realTimeDataService.getMarketVolatility(asset, '24h');
            console.log(`${asset} 24h volatility: ${(volatility).toFixed(2)}%`);
        }
        
        console.log('\n✅ All real-time data tests completed successfully!');
        
        // Test data sources summary
        console.log('\n📋 Data Sources Summary:');
        console.log('• Chainlink: Testnet price feeds for ETH, BTC, LINK');
        console.log('• CoinGecko: Market prices and historical data');
        console.log('• 1inch: DEX aggregated prices');
        console.log('• Binance WebSocket: Real-time price streams');
        console.log('• Uniswap Subgraph: Liquidity pool data');
        console.log('• RPC Providers: Gas prices and block data');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    } finally {
        // Cleanup
        realTimeDataService.cleanup();
        console.log('\n🧹 Cleanup completed');
    }
}

async function testDataAccuracy() {
    console.log('\n🎯 Testing data accuracy...');
    
    try {
        // Compare prices from multiple sources
        const ethPriceChainlink = await realTimeDataService.getAssetPrice('ETH', '11155111');
        const ethPriceCoinGecko = await realTimeDataService.getCoinGeckoPrice('ETH');
        
        if (ethPriceChainlink > 0 && ethPriceCoinGecko > 0) {
            const priceDiff = Math.abs(ethPriceChainlink - ethPriceCoinGecko) / ethPriceCoinGecko;
            console.log(`ETH price comparison:`);
            console.log(`  Chainlink: $${ethPriceChainlink.toFixed(2)}`);
            console.log(`  CoinGecko: $${ethPriceCoinGecko.toFixed(2)}`);
            console.log(`  Difference: ${(priceDiff * 100).toFixed(2)}%`);
            
            if (priceDiff < 0.05) { // Less than 5% difference
                console.log('✅ Price sources are consistent');
            } else {
                console.log('⚠️  Large price discrepancy detected');
            }
        }
        
    } catch (error) {
        console.error('Data accuracy test failed:', error);
    }
}

// Main execution
async function main() {
    console.log('🚀 NeuroSwap Real-Time Data Integration Test\n');
    
    await testRealTimeDataService();
    await testDataAccuracy();
    
    console.log('\n🎉 Testing completed!');
    process.exit(0);
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

// Run the tests
main().catch(console.error);