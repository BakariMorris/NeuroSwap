/**
 * Real-Time Trading Service for NeuroSwap
 * Provides live testnet data for AI-optimized trading
 */

import { ethers } from 'ethers'
import { testnetDataService, TESTNET_CONFIG } from './testnetData'

// Real testnet token addresses (these would be actual deployed tokens)
const TESTNET_TOKENS = {
  zircuit: {
    ETH: { address: ethers.ZeroAddress, decimals: 18, isNative: true },
    USDC: { address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', decimals: 6 },
    USDT: { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6 },
    DAI: { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18 },
    LINK: { address: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6', decimals: 18 },
    WBTC: { address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095', decimals: 8 }
  },
  arbitrumSepolia: {
    ETH: { address: ethers.ZeroAddress, decimals: 18, isNative: true },
    USDC: { address: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', decimals: 6 },
    USDT: { address: '0x3f3f5dF88dC9F13eac63DF89EC16ef6e7E25DdE7', decimals: 6 },
    DAI: { address: '0x57F1c63497AEe0bE305B8852b354CEc793da43bB', decimals: 18 },
    LINK: { address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', decimals: 18 },
    WBTC: { address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', decimals: 8 }
  },
  optimismSepolia: {
    ETH: { address: ethers.ZeroAddress, decimals: 18, isNative: true },
    USDC: { address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', decimals: 6 },
    USDT: { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6 },
    DAI: { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', decimals: 18 },
    LINK: { address: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6', decimals: 18 },
    WBTC: { address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095', decimals: 8 }
  },
  baseSepolia: {
    ETH: { address: ethers.ZeroAddress, decimals: 18, isNative: true },
    USDC: { address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
    USDT: { address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2', decimals: 6 },
    DAI: { address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', decimals: 18 },
    LINK: { address: '0x88Fb150BDc53A65fe94Dea0c9BA0a6dAf8C6e196', decimals: 18 },
    WBTC: { address: '0x1C9491865a1DE77C5b6e19d2E6a5F1D7a6F2b25F', decimals: 8 }
  },
  polygonMumbai: {
    ETH: { address: ethers.ZeroAddress, decimals: 18, isNative: true },
    USDC: { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
    USDT: { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
    DAI: { address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18 },
    LINK: { address: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39', decimals: 18 },
    WBTC: { address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', decimals: 8 }
  }
}

// ERC20 Token ABI for balance and info queries
const ERC20_ABI = [
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function totalSupply() view returns (uint256)'
]

// AIMM Contract ABI for trading functions
const AIMM_TRADING_ABI = [
  'function getAmountOut(uint256 amountIn, address tokenIn, address tokenOut) view returns (uint256)',
  'function quote(address tokenA, address tokenB, uint256 amountA) view returns (uint256)',
  'function getReserves(address tokenA, address tokenB) view returns (uint256, uint256)',
  'function calculateOptimalRoute(address tokenIn, address tokenOut, uint256 amountIn) view returns (tuple(address[] path, uint256 expectedOut, uint256 priceImpact))',
  'function getAIOptimization(address tokenIn, address tokenOut, uint256 amountIn) view returns (tuple(uint256 confidence, uint256 slippageReduction, uint256 feeOptimization, bool isOptimal))',
  'function estimateGas(address tokenIn, address tokenOut, uint256 amountIn) view returns (uint256)',
  'function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOutMin, address to) external returns (uint256)'
]

class RealTimeTradingService {
  constructor() {
    this.providers = new Map()
    this.contracts = new Map()
    this.tokenContracts = new Map()
    this.priceCache = new Map()
    this.updateInterval = null
    this.subscribers = new Set()
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) return

    console.log('🔄 Initializing real-time trading service...')

    try {
      // Get providers from testnet data service
      await testnetDataService.initialize()
      
      // Initialize trading contracts for each chain
      for (const [chainKey, provider] of testnetDataService.providers) {
        this.providers.set(chainKey, provider)
        
        const chainConfig = this.getChainConfig(chainKey)
        if (chainConfig?.aimmContract) {
          const contract = new ethers.Contract(
            chainConfig.aimmContract,
            AIMM_TRADING_ABI,
            provider
          )
          this.contracts.set(chainKey, contract)
        }
      }

      // Initialize token contracts
      await this.initializeTokenContracts()

      // Start real-time price updates
      this.startRealTimePriceUpdates()

      this.isInitialized = true
      console.log('✅ Real-time trading service initialized')

    } catch (error) {
      console.error('❌ Failed to initialize trading service:', error)
      throw error
    }
  }

  async initializeTokenContracts() {
    for (const [chainKey, tokens] of Object.entries(TESTNET_TOKENS)) {
      const provider = this.providers.get(chainKey)
      if (!provider) continue

      const chainTokens = new Map()
      
      for (const [symbol, tokenInfo] of Object.entries(tokens)) {
        if (!tokenInfo.isNative) {
          try {
            const contract = new ethers.Contract(tokenInfo.address, ERC20_ABI, provider)
            chainTokens.set(symbol, {
              contract,
              ...tokenInfo
            })
          } catch (error) {
            console.warn(`Failed to initialize ${symbol} on ${chainKey}:`, error.message)
          }
        } else {
          chainTokens.set(symbol, tokenInfo)
        }
      }
      
      this.tokenContracts.set(chainKey, chainTokens)
    }
  }

  async getTokenBalances(chainKey, userAddress) {
    const tokens = this.tokenContracts.get(chainKey)
    const provider = this.providers.get(chainKey)
    
    if (!tokens || !provider) return {}

    const balances = {}
    
    for (const [symbol, tokenInfo] of tokens) {
      try {
        let balance
        
        if (tokenInfo.isNative) {
          // Native ETH balance
          balance = await provider.getBalance(userAddress)
        } else {
          // ERC20 token balance
          balance = await tokenInfo.contract.balanceOf(userAddress)
        }
        
        balances[symbol] = {
          raw: balance.toString(),
          formatted: ethers.formatUnits(balance, tokenInfo.decimals),
          decimals: tokenInfo.decimals,
          address: tokenInfo.address
        }
        
      } catch (error) {
        console.warn(`Failed to get ${symbol} balance:`, error.message)
        balances[symbol] = {
          raw: '0',
          formatted: '0.0',
          decimals: tokenInfo.decimals,
          address: tokenInfo.address
        }
      }
    }
    
    return balances
  }

  async getQuote(chainKey, fromToken, toToken, amountIn) {
    const contract = this.contracts.get(chainKey)
    if (!contract) {
      console.warn(`No AIMM contract for ${chainKey}, using fallback pricing`)
      return this.getFallbackQuote(fromToken, toToken, amountIn)
    }

    try {
      const fromTokenInfo = this.getTokenInfo(chainKey, fromToken)
      const toTokenInfo = this.getTokenInfo(chainKey, toToken)
      
      if (!fromTokenInfo || !toTokenInfo) {
        throw new Error('Token info not found')
      }

      const amountInWei = ethers.parseUnits(amountIn.toString(), fromTokenInfo.decimals)
      
      // Try to get quote from AIMM contract
      const quote = await contract.getAmountOut(
        amountInWei,
        fromTokenInfo.address,
        toTokenInfo.address
      )
      
      return {
        amountOut: ethers.formatUnits(quote, toTokenInfo.decimals),
        isRealQuote: true,
        source: 'AIMM Contract'
      }
      
    } catch (error) {
      console.warn(`Contract quote failed for ${chainKey}:`, error.message)
      return this.getFallbackQuote(fromToken, toToken, amountIn)
    }
  }

  async getAIOptimization(chainKey, fromToken, toToken, amountIn) {
    const contract = this.contracts.get(chainKey)
    
    if (!contract) {
      return this.getFallbackAIOptimization(fromToken, toToken, amountIn)
    }

    try {
      const fromTokenInfo = this.getTokenInfo(chainKey, fromToken)
      const toTokenInfo = this.getTokenInfo(chainKey, toToken)
      
      if (!fromTokenInfo || !toTokenInfo) {
        throw new Error('Token info not found')
      }

      const amountInWei = ethers.parseUnits(amountIn.toString(), fromTokenInfo.decimals)
      
      // Get AI optimization from contract
      const optimization = await contract.getAIOptimization(
        fromTokenInfo.address,
        toTokenInfo.address,
        amountInWei
      )
      
      return {
        confidence: Number(optimization.confidence),
        slippageReduction: Number(optimization.slippageReduction) / 100,
        feeOptimization: Number(optimization.feeOptimization) / 100,
        isOptimal: optimization.isOptimal,
        isRealOptimization: true,
        source: 'AIMM Contract'
      }
      
    } catch (error) {
      console.warn(`AI optimization failed for ${chainKey}:`, error.message)
      return this.getFallbackAIOptimization(fromToken, toToken, amountIn)
    }
  }

  async getOptimalRoute(chainKey, fromToken, toToken, amountIn) {
    const contract = this.contracts.get(chainKey)
    
    if (!contract) {
      return this.calculateFallbackRoute(chainKey, fromToken, toToken, amountIn)
    }

    try {
      const fromTokenInfo = this.getTokenInfo(chainKey, fromToken)
      const toTokenInfo = this.getTokenInfo(chainKey, toToken)
      
      if (!fromTokenInfo || !toTokenInfo) {
        throw new Error('Token info not found')
      }

      const amountInWei = ethers.parseUnits(amountIn.toString(), fromTokenInfo.decimals)
      
      const route = await contract.calculateOptimalRoute(
        fromTokenInfo.address,
        toTokenInfo.address,
        amountInWei
      )
      
      return {
        path: route.path,
        expectedOut: ethers.formatUnits(route.expectedOut, toTokenInfo.decimals),
        priceImpact: Number(route.priceImpact) / 10000, // Assuming basis points
        routeType: route.path.length > 2 ? 'Multi-hop' : 'Direct',
        hops: route.path.length - 1,
        slippageProtection: this.calculateSlippageProtection(route.priceImpact),
        gasEstimate: Number(route.gasEstimate || 150000),
        isRealRoute: true,
        source: 'AIMM Contract'
      }
      
    } catch (error) {
      console.warn(`Route calculation failed for ${chainKey}:`, error.message)
      return this.calculateFallbackRoute(chainKey, fromToken, toToken, amountIn)
    }
  }

  calculateFallbackRoute(chainKey, fromToken, toToken, amountIn) {
    // Advanced fallback routing logic
    const routingPairs = this.getCommonRoutingPairs(chainKey)
    const bestRoute = this.findBestRoute(fromToken, toToken, amountIn, routingPairs)
    
    return {
      path: bestRoute.path,
      expectedOut: bestRoute.expectedOut,
      priceImpact: bestRoute.priceImpact,
      routeType: bestRoute.path.length > 2 ? 'Multi-hop' : 'Direct',
      hops: bestRoute.path.length - 1,
      slippageProtection: this.calculateSlippageProtection(bestRoute.priceImpact),
      gasEstimate: this.estimateRouteGas(bestRoute.path),
      isRealRoute: false,
      source: 'Fallback Routing'
    }
  }

  getCommonRoutingPairs(chainKey) {
    // Common routing pairs for different chains
    const routingPairs = {
      zircuit: ['ETH', 'USDC', 'USDT'],
      arbitrumSepolia: ['ETH', 'USDC', 'DAI'],
      optimismSepolia: ['ETH', 'USDC', 'DAI'],
      baseSepolia: ['ETH', 'USDC'],
      polygonMumbai: ['ETH', 'USDC', 'USDT']
    }
    
    return routingPairs[chainKey] || ['ETH', 'USDC']
  }

  findBestRoute(fromToken, toToken, amountIn, routingPairs) {
    const amount = parseFloat(amountIn)
    
    // Direct route
    const directRoute = {
      path: [fromToken, toToken],
      expectedOut: this.calculateDirectSwap(fromToken, toToken, amount),
      priceImpact: this.calculatePriceImpact(amount, fromToken, toToken)
    }
    
    // Try routing through common pairs
    let bestRoute = directRoute
    let bestOutput = parseFloat(directRoute.expectedOut)
    
    for (const intermediateToken of routingPairs) {
      if (intermediateToken === fromToken || intermediateToken === toToken) continue
      
      try {
        const firstHop = this.calculateDirectSwap(fromToken, intermediateToken, amount)
        const secondHop = this.calculateDirectSwap(intermediateToken, toToken, parseFloat(firstHop))
        
        const totalOutput = parseFloat(secondHop)
        const totalPriceImpact = this.calculateMultiHopPriceImpact(amount, [fromToken, intermediateToken, toToken])
        
        // Add routing benefit (multi-hop often has better liquidity)
        const routingBonus = 1.002 // 0.2% bonus for better liquidity
        const adjustedOutput = totalOutput * routingBonus
        
        if (adjustedOutput > bestOutput) {
          bestRoute = {
            path: [fromToken, intermediateToken, toToken],
            expectedOut: adjustedOutput.toFixed(6),
            priceImpact: totalPriceImpact
          }
          bestOutput = adjustedOutput
        }
      } catch (error) {
        // Skip this route if calculation fails
        continue
      }
    }
    
    return bestRoute
  }

  calculateDirectSwap(fromToken, toToken, amount) {
    const prices = this.getCurrentMarketPrices()
    const fromPrice = prices[fromToken] || 1
    const toPrice = prices[toToken] || 1
    
    const rate = fromPrice / toPrice
    const slippageAdjustment = 0.997 // 0.3% slippage
    const feeAdjustment = 0.997 // 0.3% fee
    
    return (amount * rate * slippageAdjustment * feeAdjustment).toFixed(6)
  }

  calculatePriceImpact(amount, fromToken, toToken) {
    const prices = this.getCurrentMarketPrices()
    const fromPrice = prices[fromToken] || 1
    
    // Estimate price impact based on trade size
    const tradeValueUSD = amount * fromPrice
    
    if (tradeValueUSD < 1000) return 0.01 + Math.random() * 0.02 // 0.01-0.03%
    if (tradeValueUSD < 10000) return 0.05 + Math.random() * 0.05 // 0.05-0.1%
    if (tradeValueUSD < 100000) return 0.1 + Math.random() * 0.15 // 0.1-0.25%
    
    return 0.25 + Math.random() * 0.25 // 0.25-0.5% for large trades
  }

  calculateMultiHopPriceImpact(amount, path) {
    // Multi-hop typically has lower impact due to better liquidity distribution
    const singleHopImpact = this.calculatePriceImpact(amount, path[0], path[path.length - 1])
    return singleHopImpact * 0.8 // 20% reduction in price impact
  }

  calculateSlippageProtection(priceImpact) {
    // Calculate recommended slippage tolerance based on price impact
    const baseSlippage = priceImpact * 2 // 2x the price impact
    const minSlippage = 0.001 // 0.1% minimum
    const maxSlippage = 0.05 // 5% maximum
    
    return Math.max(minSlippage, Math.min(maxSlippage, baseSlippage))
  }

  estimateRouteGas(path) {
    const baseGas = 50000
    const hopGas = 40000
    
    return baseGas + ((path.length - 1) * hopGas)
  }

  async estimateGasCost(chainKey, fromToken, toToken, amountIn) {
    const contract = this.contracts.get(chainKey)
    const provider = this.providers.get(chainKey)
    
    if (!contract || !provider) {
      return this.getFallbackGasEstimate(chainKey)
    }

    try {
      const fromTokenInfo = this.getTokenInfo(chainKey, fromToken)
      const toTokenInfo = this.getTokenInfo(chainKey, toToken)
      
      if (!fromTokenInfo || !toTokenInfo) {
        throw new Error('Token info not found')
      }

      const amountInWei = ethers.parseUnits(amountIn.toString(), fromTokenInfo.decimals)
      
      // Get gas estimate from contract
      const gasEstimate = await contract.estimateGas(
        fromTokenInfo.address,
        toTokenInfo.address,
        amountInWei
      )
      
      // Get current gas price
      const gasPrice = await provider.getFeeData()
      
      const gasCostWei = gasEstimate * (gasPrice.gasPrice || gasPrice.maxFeePerGas)
      const gasCostETH = ethers.formatEther(gasCostWei)
      
      return {
        gasLimit: Number(gasEstimate),
        gasPriceGwei: Number(ethers.formatUnits(gasPrice.gasPrice || gasPrice.maxFeePerGas, 'gwei')),
        gasCostETH: Number(gasCostETH),
        gasCostUSD: Number(gasCostETH) * (await this.getETHPrice()),
        isRealEstimate: true
      }
      
    } catch (error) {
      console.warn(`Gas estimation failed for ${chainKey}:`, error.message)
      return this.getFallbackGasEstimate(chainKey)
    }
  }

  // Fallback methods for when contracts aren't available
  getFallbackQuote(fromToken, toToken, amountIn) {
    const prices = this.getCurrentMarketPrices()
    const fromPrice = prices[fromToken] || 1
    const toPrice = prices[toToken] || 1
    
    const rate = fromPrice / toPrice
    const variation = 0.995 + Math.random() * 0.01 // ±0.5% variation
    const amountOut = (parseFloat(amountIn) * rate * variation).toFixed(6)
    
    return {
      amountOut,
      isRealQuote: false,
      source: 'Fallback Market Prices'
    }
  }

  getFallbackAIOptimization(fromToken, toToken, amountIn) {
    return {
      confidence: 85 + Math.random() * 12,
      slippageReduction: Math.random() * 1.5 + 0.5,
      feeOptimization: Math.random() * 1.0 + 0.5,
      isOptimal: Math.random() > 0.2,
      isRealOptimization: false,
      source: 'Simulated AI'
    }
  }

  getFallbackGasEstimate(chainKey) {
    const baseGas = {
      zircuit: 120000,
      arbitrumSepolia: 150000,
      optimismSepolia: 130000,
      baseSepolia: 125000,
      polygonMumbai: 140000
    }
    
    return {
      gasLimit: baseGas[chainKey] || 120000,
      gasPriceGwei: 2 + Math.random() * 10,
      gasCostETH: 0.003 + Math.random() * 0.002,
      gasCostUSD: 7.5 + Math.random() * 5,
      isRealEstimate: false
    }
  }

  getCurrentMarketPrices() {
    // Fallback market prices for calculation
    return {
      ETH: 2340.50,
      USDC: 1.00,
      USDT: 1.00,
      DAI: 1.00,
      LINK: 14.25,
      WBTC: 43250.00,
      UNI: 6.80
    }
  }

  async getETHPrice() {
    // Simple ETH price for gas calculations
    return 2340.50
  }

  getTokenInfo(chainKey, symbol) {
    const tokens = this.tokenContracts.get(chainKey)
    return tokens?.get(symbol)
  }

  startRealTimePriceUpdates() {
    // Update prices every 10 seconds
    this.updateInterval = setInterval(async () => {
      try {
        await this.updateLivePrices()
        this.notifySubscribers({ type: 'price_update', timestamp: Date.now() })
      } catch (error) {
        console.error('Error updating live prices:', error)
      }
    }, 10000)
  }

  async updateLivePrices() {
    // Update live price data from various sources
    for (const [chainKey, contract] of this.contracts) {
      try {
        // Get latest reserves and pricing data
        // This would fetch real price data from the AMM pools
        const priceData = await this.fetchChainPrices(chainKey, contract)
        this.priceCache.set(chainKey, priceData)
      } catch (error) {
        console.warn(`Failed to update prices for ${chainKey}:`, error.message)
      }
    }
  }

  async fetchChainPrices(chainKey, contract) {
    // Implementation for fetching real price data from AMM pools
    // This would call contract methods to get current reserves and calculate prices
    return {
      timestamp: Date.now(),
      chainId: chainKey,
      tokens: {}
    }
  }

  // Subscription management
  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  notifySubscribers(event) {
    this.subscribers.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error notifying subscriber:', error)
      }
    })
  }

  // Public API methods
  async getComprehensiveQuote(chainKey, fromToken, toToken, amountIn) {
    if (!this.isInitialized) {
      await this.initialize()
    }

    const [quote, aiOptimization, route, gasCost] = await Promise.all([
      this.getQuote(chainKey, fromToken, toToken, amountIn),
      this.getAIOptimization(chainKey, fromToken, toToken, amountIn),
      this.getOptimalRoute(chainKey, fromToken, toToken, amountIn),
      this.estimateGasCost(chainKey, fromToken, toToken, amountIn)
    ])

    return {
      quote,
      aiOptimization,
      route,
      gasCost,
      timestamp: Date.now(),
      chainKey
    }
  }

  async getTokenList(chainKey) {
    const tokens = this.tokenContracts.get(chainKey)
    if (!tokens) return []

    const tokenList = []
    for (const [symbol, tokenInfo] of tokens) {
      tokenList.push({
        symbol,
        name: this.getTokenName(symbol),
        address: tokenInfo.address,
        decimals: tokenInfo.decimals,
        isNative: tokenInfo.isNative || false
      })
    }

    return tokenList
  }

  getTokenName(symbol) {
    const names = {
      ETH: 'Ethereum',
      USDC: 'USD Coin',
      USDT: 'Tether',
      DAI: 'Dai Stablecoin',
      LINK: 'Chainlink',
      WBTC: 'Wrapped Bitcoin',
      UNI: 'Uniswap'
    }
    return names[symbol] || symbol
  }

  getChainConfig(chainKey) {
    return TESTNET_CONFIG?.chains?.[chainKey]
  }

  // Cleanup
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.subscribers.clear()
    this.priceCache.clear()
    this.providers.clear()
    this.contracts.clear()
    this.tokenContracts.clear()
    this.isInitialized = false
  }
}

// Export singleton instance
export const realTimeTradingService = new RealTimeTradingService()
export { TESTNET_TOKENS }