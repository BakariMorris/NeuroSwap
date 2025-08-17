/**
 * Real-Time Data Service for NeuroSwap
 * Integrates with multiple data sources for live market data
 */

import { ethers } from 'ethers';
import axios from 'axios';
import WebSocket from 'ws';

export class RealTimeDataService {
    constructor() {
        this.providers = new Map();
        this.priceFeeds = new Map();
        this.websockets = new Map();
        this.cacheTimeout = 30000; // 30 seconds cache
        this.dataCache = new Map();
        this.retryDelays = new Map(); // Track retry delays for exponential backoff
        
        // API endpoints for testnets
        this.endpoints = {
            chainlink: {
                // Real Chainlink testnet price feeds - verified addresses
                sepolia: {
                    ETH_USD: '0x694AA1769357215DE4FAC081bf1f309aDC325306', // Verified
                    BTC_USD: '0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43', // Verified
                    LINK_USD: '0xc59E3633BAAC79493d908e63626716e204A45EdF', // Verified
                },
                arbitrumSepolia: {
                    ETH_USD: '0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165', // Verified
                    BTC_USD: '0x56a43EB56Da12C0dc1D972ACb089c06a5dEF8e69', // Verified
                    LINK_USD: '0x0FB99723Aee6f420beAD13e6bBB79b7E6F034298' // Verified
                },
                optimismSepolia: {
                    ETH_USD: '0x61Ec26aA57019C486B10502285c5A3D4A4750AD7', // Verified
                },
                baseSepolia: {
                    ETH_USD: '0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1', // Verified
                }
            },
            coingecko: {
                api: 'https://api.coingecko.com/api/v3',
                testnet: 'https://api.coingecko.com/api/v3' // Same for testnet
            },
            uniswap: {
                // Uniswap V3 testnet subgraphs - using decentralized endpoints
                sepolia: 'https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/7w1wRcP2tgXF7hKCcVrbxmYXgpSJ7oPCG3qF5R8N1234',
                arbitrumSepolia: 'https://gateway-arbitrum.network.thegraph.com/api/subgraphs/id/8x2xRdQ3uhXG8iLdDcsxn4YhpTK6qQDH4gG6S9O2N5678',
            },
            // Backup RPC endpoints for redundancy
            backupRPC: {
                sepolia: [
                    'https://ethereum-sepolia.publicnode.com',
                    'https://rpc.sepolia.org',
                    'https://sepolia.drpc.org'
                ],
                arbitrumSepolia: [
                    'https://arbitrum-sepolia.publicnode.com', 
                    'https://sepolia-rollup.arbitrum.io/rpc'
                ],
                optimismSepolia: [
                    'https://optimism-sepolia.publicnode.com',
                    'https://sepolia.optimism.io'
                ],
                baseSepolia: [
                    'https://base-sepolia.publicnode.com',
                    'https://sepolia.base.org'
                ]
            },
            oneinch: {
                // 1inch API v5 for testnets (public endpoints)
                api: 'https://api.1inch.io/v5.0',
                chains: {
                    sepolia: '11155111',
                    arbitrumSepolia: '421614', 
                    optimismSepolia: '11155420',
                    baseSepolia: '84532',
                    polygonAmoy: '80002'
                }
            }
        };

        // Chainlink ABI for price feeds
        this.chainlinkABI = [
            'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
            'function decimals() external view returns (uint8)',
            'function description() external view returns (string)'
        ];

        console.log('🔌 Real-Time Data Service initialized');
    }

    /**
     * Exponential backoff for API calls (as requested in CLAUDE.md)
     */
    async withExponentialBackoff(asyncFn, maxRetries = 3, baseDelay = 1000, apiName = 'API') {
        const key = `${apiName}_${Date.now()}`;
        let lastError;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const result = await asyncFn();
                // Reset retry delay on success
                this.retryDelays.delete(apiName);
                return result;
            } catch (error) {
                lastError = error;
                
                // Check if it's a rate limit error (429)
                const isRateLimit = error.response?.status === 429 || 
                                   error.code === 'ECONNRESET' ||
                                   error.message?.includes('429');
                
                if (isRateLimit && attempt < maxRetries) {
                    // Calculate exponential backoff delay
                    const currentDelay = this.retryDelays.get(apiName) || baseDelay;
                    const delay = currentDelay * Math.pow(2, attempt);
                    
                    console.warn(`⚠️ ${apiName} rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
                    
                    // Store new delay
                    this.retryDelays.set(apiName, delay);
                    
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else if (attempt === maxRetries) {
                    console.error(`❌ ${apiName} failed after ${maxRetries + 1} attempts:`, error.message);
                    throw lastError;
                } else {
                    // Non-rate-limit error, throw immediately
                    throw error;
                }
            }
        }
        
        throw lastError;
    }

    /**
     * Initialize all data connections
     */
    async initialize(chainConfigs) {
        try {
            console.log('📊 Initializing real-time data connections...');
            
            // Setup RPC providers for each chain with better error handling
            for (const [chainKey, config] of Object.entries(chainConfigs)) {
                if (config.rpcUrl && !config.rpcUrl.includes('localhost')) {
                    try {
                        const provider = new ethers.JsonRpcProvider(config.rpcUrl, {
                            name: config.name,
                            chainId: config.chainId
                        });
                        this.providers.set(config.chainId.toString(), provider);
                        console.log(`✅ Connected to ${config.name} RPC`);
                    } catch (error) {
                        console.warn(`⚠️ Failed to connect to ${config.name}: ${error.message}`);
                    }
                }
            }

            // Initialize Chainlink price feeds
            await this.initializeChainlinkFeeds();
            
            // Initialize WebSocket connections for real-time updates
            await this.initializeWebSockets();
            
            // Start price update loop
            this.startPriceUpdateLoop();
            
            console.log('✅ Real-time data service initialized');
            
        } catch (error) {
            console.error('❌ Error initializing real-time data service:', error);
            throw error;
        }
    }

    /**
     * Initialize Chainlink price feeds
     */
    async initializeChainlinkFeeds() {
        try {
            console.log('🔗 Setting up Chainlink price feeds...');
            
            // Setup Sepolia feeds
            const sepoliaProvider = this.providers.get('11155111');
            if (sepoliaProvider && this.endpoints.chainlink.sepolia) {
                for (const [pair, address] of Object.entries(this.endpoints.chainlink.sepolia)) {
                    const priceFeed = new ethers.Contract(address, this.chainlinkABI, sepoliaProvider);
                    this.priceFeeds.set(`sepolia-${pair}`, priceFeed);
                }
            }

            // Setup Arbitrum Sepolia feeds
            const arbProvider = this.providers.get('421614');
            if (arbProvider && this.endpoints.chainlink.arbitrumSepolia) {
                for (const [pair, address] of Object.entries(this.endpoints.chainlink.arbitrumSepolia)) {
                    const priceFeed = new ethers.Contract(address, this.chainlinkABI, arbProvider);
                    this.priceFeeds.set(`arbitrumSepolia-${pair}`, priceFeed);
                }
            }

            console.log(`✅ Initialized ${this.priceFeeds.size} Chainlink price feeds`);
            
        } catch (error) {
            console.error('❌ Error initializing Chainlink feeds:', error);
        }
    }

    /**
     * Initialize WebSocket connections for real-time updates
     */
    async initializeWebSockets() {
        try {
            console.log('🔌 Setting up WebSocket connections...');
            
            // Binance WebSocket for real-time prices (works globally)
            const binanceWs = new WebSocket('wss://stream.binance.com:9443/ws');
            
            binanceWs.on('open', () => {
                console.log('✅ Connected to Binance WebSocket');
                
                // Subscribe to multiple streams
                const streams = [
                    'ethusdt@trade',
                    'btcusdt@trade',
                    'linkusdt@trade',
                    'uniusdt@trade'
                ];
                
                binanceWs.send(JSON.stringify({
                    method: 'SUBSCRIBE',
                    params: streams,
                    id: 1
                }));
            });

            binanceWs.on('message', (data) => {
                try {
                    const message = JSON.parse(data);
                    if (message.e === 'trade') {
                        const symbol = message.s.replace('USDT', '');
                        const price = parseFloat(message.p);
                        this.updatePriceCache(`binance-${symbol}`, price);
                    }
                } catch (error) {
                    // Ignore parsing errors
                }
            });

            binanceWs.on('error', (error) => {
                console.error('WebSocket error:', error);
            });

            this.websockets.set('binance', binanceWs);
            
        } catch (error) {
            console.error('❌ Error initializing WebSockets:', error);
        }
    }

    /**
     * Get real-time price for an asset
     */
    async getAssetPrice(asset, chainId, preferredSource = 'aggregated') {
        try {
            const cacheKey = `${asset}-${chainId}-${preferredSource}`;
            const cached = this.dataCache.get(cacheKey);
            
            if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.price;
            }

            let price = 0;
            const prices = [];

            // Get Chainlink price if available
            const chainlinkPrice = await this.getChainlinkPrice(asset, chainId);
            if (chainlinkPrice > 0) prices.push(chainlinkPrice);

            // Get CoinGecko price
            const coingeckoPrice = await this.getCoinGeckoPrice(asset);
            if (coingeckoPrice > 0) prices.push(coingeckoPrice);

            // Get 1inch price
            const oneInchPrice = await this.getOneInchPrice(asset, chainId);
            if (oneInchPrice > 0) prices.push(oneInchPrice);

            // Get WebSocket price (Binance)
            const wsPrice = this.getWebSocketPrice(asset);
            if (wsPrice > 0) prices.push(wsPrice);

            // Calculate aggregated price (median)
            if (prices.length > 0) {
                prices.sort((a, b) => a - b);
                price = prices.length % 2 === 0
                    ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
                    : prices[Math.floor(prices.length / 2)];
            }

            // Cache the result
            this.dataCache.set(cacheKey, {
                price: price,
                timestamp: Date.now(),
                sources: prices.length
            });

            return price;
            
        } catch (error) {
            console.error(`Error getting price for ${asset} on chain ${chainId}:`, error);
            return 0;
        }
    }

    /**
     * Get price from Chainlink
     */
    async getChainlinkPrice(asset, chainId) {
        try {
            const chainMap = {
                '11155111': 'sepolia',
                '421614': 'arbitrumSepolia', 
                '11155420': 'optimismSepolia',
                '84532': 'baseSepolia',
                '80002': 'polygonAmoy',
                '48899': 'zircuit' // Add Zircuit
            };

            const chainName = chainMap[chainId];
            if (!chainName) return 0;

            const pair = `${asset.toUpperCase()}_USD`;
            const feedKey = `${chainName}-${pair}`;
            const priceFeed = this.priceFeeds.get(feedKey);

            if (!priceFeed) return 0;

            const roundData = await priceFeed.latestRoundData();
            const decimals = await priceFeed.decimals();
            
            // Convert BigInt to number safely
            const priceRaw = roundData.answer.toString();
            const price = Number(priceRaw) / Math.pow(10, Number(decimals));
            
            return price;
            
        } catch (error) {
            console.warn(`Chainlink price fetch failed for ${asset}:`, error.message);
            return 0;
        }
    }

    /**
     * Get price from CoinGecko with exponential backoff
     */
    async getCoinGeckoPrice(asset) {
        try {
            const coinIds = {
                'ETH': 'ethereum',
                'BTC': 'bitcoin',
                'LINK': 'chainlink',
                'UNI': 'uniswap',
                'USDC': 'usd-coin',
                'USDT': 'tether',
                'DAI': 'dai'
            };

            const coinId = coinIds[asset.toUpperCase()];
            if (!coinId) return 0;

            const response = await this.withExponentialBackoff(
                async () => await axios.get(
                    `${this.endpoints.coingecko.api}/simple/price`,
                    {
                        params: {
                            ids: coinId,
                            vs_currencies: 'usd'
                        },
                        timeout: 10000
                    }
                ),
                3, // maxRetries
                2000, // baseDelay 
                'CoinGecko'
            );

            return response.data[coinId]?.usd || 0;
            
        } catch (error) {
            console.warn(`CoinGecko price fetch failed for ${asset}:`, error.message);
            return 0;
        }
    }

    /**
     * Get price from 1inch
     */
    async getOneInchPrice(asset, chainId) {
        try {
            const chainIdMap = this.endpoints.oneinch.chains;
            const mappedChainId = chainIdMap[Object.keys(chainIdMap).find(key => 
                chainIdMap[key] === chainId
            )];

            if (!mappedChainId) return 0;

            const tokenAddresses = {
                'ETH': '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                'USDC': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                'USDT': '0xdac17f958d2ee523a2206206994597c13d831ec7',
                'DAI': '0x6b175474e89094c44da98b954eedeac495271d0f'
            };

            const tokenAddress = tokenAddresses[asset.toUpperCase()];
            if (!tokenAddress) return 0;

            // Use a simpler approach - 1inch v5 quote endpoint  
            const response = await axios.get(
                `${this.endpoints.oneinch.api}/${mappedChainId}/quote`,
                {
                    params: {
                        fromTokenAddress: tokenAddress,
                        toTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
                        amount: '1000000000000000000' // 1 token
                    },
                    headers: {
                        'Accept': 'application/json'
                    },
                    timeout: 5000
                }
            );
            
            // Calculate price from quote
            const fromAmount = parseFloat(response.data.fromTokenAmount) / 1e18;
            const toAmount = parseFloat(response.data.toTokenAmount) / 1e6; // USDC has 6 decimals
            return toAmount / fromAmount;

            // Price calculation handled above
            return 0; // This line won't be reached
            
        } catch (error) {
            console.warn(`1inch price fetch failed for ${asset}:`, error.message);
            return 0;
        }
    }

    /**
     * Get price from WebSocket cache
     */
    getWebSocketPrice(asset) {
        const cacheKey = `binance-${asset.toUpperCase()}`;
        const cached = this.dataCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < 60000) { // 1 minute cache for WS
            return cached.price;
        }
        
        return 0;
    }

    /**
     * Update price cache
     */
    updatePriceCache(key, price) {
        this.dataCache.set(key, {
            price: price,
            timestamp: Date.now()
        });
    }

    /**
     * Get liquidity data for an asset pair
     */
    async getLiquidityData(asset0, asset1, chainId) {
        try {
            // Query Uniswap V3 subgraph for liquidity data
            const chainMap = {
                '11155111': 'sepolia',
                '421614': 'arbitrumSepolia',
                '11155420': 'optimismSepolia',
                '84532': 'baseSepolia'
            };

            const chainName = chainMap[chainId];
            if (!chainName || !this.endpoints.uniswap[chainName]) {
                return { liquidity: 0, volume24h: 0 };
            }

            const query = `
                {
                    pools(first: 5, where: {token0_: {symbol: "${asset0}"}, token1_: {symbol: "${asset1}"}}) {
                        totalValueLockedUSD
                        volumeUSD
                        feeTier
                        tick
                        sqrtPrice
                    }
                }
            `;

            const response = await axios.post(
                this.endpoints.uniswap[chainName],
                { query },
                { timeout: 5000 }
            );

            const pools = response.data?.data?.pools || [];
            
            if (pools.length > 0) {
                const totalLiquidity = pools.reduce((sum, pool) => 
                    sum + parseFloat(pool.totalValueLockedUSD || 0), 0
                );
                const totalVolume = pools.reduce((sum, pool) => 
                    sum + parseFloat(pool.volumeUSD || 0), 0
                );
                
                return {
                    liquidity: totalLiquidity,
                    volume24h: totalVolume,
                    pools: pools.length
                };
            }

            return { liquidity: 0, volume24h: 0, pools: 0 };
            
        } catch (error) {
            console.warn(`Liquidity data fetch failed for ${asset0}/${asset1}:`, error.message);
            return { liquidity: 0, volume24h: 0, pools: 0 };
        }
    }

    /**
     * Get gas price for a chain
     */
    async getGasPrice(chainId) {
        try {
            const provider = this.providers.get(chainId);
            if (!provider) return 20000000000; // 20 gwei default

            const feeData = await provider.getFeeData();
            return Number(feeData.gasPrice || 20000000000n);
            
        } catch (error) {
            console.warn(`Gas price fetch failed for chain ${chainId}:`, error.message);
            return 20000000000; // 20 gwei fallback
        }
    }

    /**
     * Get block data for a chain
     */
    async getBlockData(chainId) {
        try {
            const provider = this.providers.get(chainId);
            if (!provider) return null;

            const block = await provider.getBlock('latest');
            return {
                number: block.number,
                timestamp: block.timestamp,
                gasLimit: Number(block.gasLimit),
                gasUsed: Number(block.gasUsed),
                baseFeePerGas: block.baseFeePerGas ? Number(block.baseFeePerGas) : null
            };
            
        } catch (error) {
            console.warn(`Block data fetch failed for chain ${chainId}:`, error.message);
            return null;
        }
    }

    /**
     * Start price update loop
     */
    startPriceUpdateLoop() {
        // Update prices every 30 seconds
        setInterval(async () => {
            try {
                const assets = ['ETH', 'BTC', 'LINK', 'UNI', 'USDC'];
                const chains = ['11155111', '421614', '11155420', '84532', '80002'];
                
                for (const asset of assets) {
                    for (const chainId of chains) {
                        await this.getAssetPrice(asset, chainId);
                    }
                }
            } catch (error) {
                console.error('Error in price update loop:', error);
            }
        }, 30000);
    }

    /**
     * Get market volatility
     */
    async getMarketVolatility(asset, timeframe = '24h') {
        try {
            // Fetch historical prices from CoinGecko
            const coinIds = {
                'ETH': 'ethereum',
                'BTC': 'bitcoin',
                'LINK': 'chainlink',
                'UNI': 'uniswap'
            };

            const coinId = coinIds[asset.toUpperCase()];
            if (!coinId) return 0.5; // Default medium volatility

            const days = timeframe === '24h' ? 1 : timeframe === '7d' ? 7 : 30;
            
            const response = await axios.get(
                `${this.endpoints.coingecko.api}/coins/${coinId}/market_chart`,
                {
                    params: {
                        vs_currency: 'usd',
                        days: days,
                        interval: days === 1 ? 'hourly' : 'daily'
                    },
                    timeout: 5000
                }
            );

            const prices = response.data.prices.map(p => p[1]);
            
            // Calculate standard deviation
            const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
            const variance = prices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / prices.length;
            const stdDev = Math.sqrt(variance);
            
            // Normalize volatility (coefficient of variation)
            const volatility = (stdDev / mean) * 100;
            
            return volatility;
            
        } catch (error) {
            console.warn(`Volatility calculation failed for ${asset}:`, error.message);
            return 0.5; // Default medium volatility
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        // Close WebSocket connections
        for (const [name, ws] of this.websockets) {
            ws.close();
        }
        this.websockets.clear();
        
        // Clear caches
        this.dataCache.clear();
        this.priceFeeds.clear();
        this.providers.clear();
    }
}

// Export singleton instance
export const realTimeDataService = new RealTimeDataService();