import React, { useState, useEffect } from 'react'
import { 
  ArrowUpDown, 
  Zap, 
  Settings, 
  Info,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { cn } from '../lib/utils'
import { realTimeTradingService } from '../services/realTimeTradingService'
import { livePriceService } from '../services/livePriceService'
import { testnetDataService } from '../services/testnetData'

const TradingInterface = () => {
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('USDC')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [selectedChain, setSelectedChain] = useState('zircuit')
  const [slippageTolerance, setSlippageTolerance] = useState(0.5)
  const [isLoading, setIsLoading] = useState(false)
  const [priceData, setPriceData] = useState(null)
  const [aiOptimization, setAiOptimization] = useState(null)
  const [tokens, setTokens] = useState([])
  const [userBalances, setUserBalances] = useState({})
  const [serviceInitialized, setServiceInitialized] = useState(false)
  const [livePrices, setLivePrices] = useState({})
  const [priceServiceReady, setPriceServiceReady] = useState(false)


  const chains = [
    { id: 'zircuit', name: 'Zircuit', color: '#3b82f6' },
    { id: 'arbitrumSepolia', name: 'Arbitrum Sepolia', color: '#8b5cf6' },
    { id: 'optimismSepolia', name: 'Optimism Sepolia', color: '#ef4444' },
    { id: 'baseSepolia', name: 'Base Sepolia', color: '#10b981' },
    { id: 'polygonMumbai', name: 'Polygon Mumbai', color: '#f59e0b' }
  ]

  const fromTokenData = tokens.find(t => t.symbol === fromToken)
  const toTokenData = tokens.find(t => t.symbol === toToken)

  // Initialize trading service and load tokens
  useEffect(() => {
    const initService = async () => {
      try {
        // Initialize both services in parallel
        const [tradingResult, priceResult] = await Promise.all([
          realTimeTradingService.initialize(),
          livePriceService.initialize()
        ])
        
        const tokenList = await realTimeTradingService.getTokenList(selectedChain)
        setTokens(tokenList)
        setServiceInitialized(true)
        setPriceServiceReady(priceResult)
        
        // Get initial prices
        const prices = livePriceService.getAllPrices()
        setLivePrices(prices)
        
        // Subscribe to real-time updates
        const tradingUnsubscribe = realTimeTradingService.subscribe((event) => {
          if (event.type === 'price_update') {
            // Refresh quotes if there's an active trade calculation
            if (fromAmount && fromToken && toToken) {
              updateQuote()
            }
          }
        })
        
        const priceUnsubscribe = livePriceService.subscribe((event) => {
          if (event.type === 'price_update') {
            setLivePrices(event.prices)
            // Refresh USD calculations
            if (fromAmount && fromToken && toToken) {
              updateQuote()
            }
          }
        })
        
        return () => {
          tradingUnsubscribe()
          priceUnsubscribe()
        }
      } catch (error) {
        console.error('Failed to initialize trading service:', error)
        // Fallback to basic token list
        setTokens([
          { symbol: 'ETH', name: 'Ethereum', decimals: 18, isNative: true },
          { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
          { symbol: 'USDT', name: 'Tether', decimals: 6 },
          { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
          { symbol: 'LINK', name: 'Chainlink', decimals: 18 },
          { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 }
        ])
      }
    }
    
    initService()
  }, [selectedChain])

  // Load user balances when chain or tokens change
  useEffect(() => {
    const loadBalances = async () => {
      if (serviceInitialized && tokens.length > 0) {
        try {
          // Get real user address from testnet data service
          await testnetDataService.initialize()
          const systemData = testnetDataService.getSystemData()
          const userAddress = systemData?.userAddress || systemData?.connectedWallet?.address
          
          if (!userAddress) {
            console.warn('No connected wallet address found')
            setUserBalances({})
            return
          }
          
          const balances = await realTimeTradingService.getTokenBalances(selectedChain, userAddress)
          setUserBalances(balances)
        } catch (error) {
          console.warn('Could not load token balances:', error.message)
          // Set empty balances instead of random ones
          const fallbackBalances = {}
          tokens.forEach(token => {
            fallbackBalances[token.symbol] = {
              formatted: '0.0000',
              raw: '0'
            }
          })
          setUserBalances(fallbackBalances)
        }
      }
    }
    
    loadBalances()
  }, [serviceInitialized, tokens, selectedChain])

  // Update quote when trading parameters change
  const updateQuote = async () => {
    if (!fromAmount || !fromTokenData || !toTokenData || !serviceInitialized) {
      setToAmount('')
      setPriceData(null)
      setAiOptimization(null)
      return
    }

    setIsLoading(true)
    
    try {
      // Get comprehensive quote with AI optimization
      const quoteData = await realTimeTradingService.getComprehensiveQuote(
        selectedChain,
        fromToken,
        toToken,
        fromAmount
      )
      
      setToAmount(quoteData.quote.amountOut)
      
      // Set AI optimization data with live USD calculations
      const fromTokenPrice = livePrices[fromToken]?.price || 2340.50
      setAiOptimization({
        enabled: quoteData.aiOptimization.isRealOptimization,
        savingsPercent: quoteData.aiOptimization.feeOptimization,
        savingsUsd: parseFloat(fromAmount) * quoteData.aiOptimization.feeOptimization * 0.01 * fromTokenPrice,
        optimalRoute: quoteData.route.routeType,
        confidenceScore: quoteData.aiOptimization.confidence,
        estimatedGas: quoteData.gasCost.gasLimit,
        priceImpact: quoteData.route.priceImpact * 100 || 0.1,
        source: quoteData.aiOptimization.source
      })
      
      // Set price data
      setPriceData({
        rate: parseFloat(quoteData.quote.amountOut) / parseFloat(fromAmount),
        priceImpact: quoteData.route.priceImpact * 100 || 0.1,
        minimumReceived: parseFloat(quoteData.quote.amountOut) * (1 - slippageTolerance / 100),
        gasFee: quoteData.gasCost.gasCostUSD,
        isRealData: quoteData.quote.isRealQuote,
        routeInfo: {
          path: quoteData.route.path || [fromToken, toToken],
          routeType: quoteData.route.routeType || 'Direct',
          hops: quoteData.route.hops || 1,
          slippageProtection: quoteData.route.slippageProtection || slippageTolerance / 100,
          gasEstimate: quoteData.route.gasEstimate || quoteData.gasCost.gasLimit
        }
      })
      
    } catch (error) {
      console.error('Error getting quote:', error)
      toast.error('Unable to get quote. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Debounce quote updates
    const timeoutId = setTimeout(() => {
      updateQuote()
    }, 800) // 800ms debounce
    
    return () => clearTimeout(timeoutId)
  }, [fromAmount, fromToken, toToken, slippageTolerance, selectedChain, serviceInitialized])

  const handleSwapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount(toAmount)
    setToAmount('')
  }

  const handleTrade = async () => {
    if (!fromAmount || !toAmount) {
      toast.error('Please enter an amount to trade')
      return
    }

    setIsLoading(true)
    
    try {
      toast.loading('Executing AI-optimized trade...', { id: 'trade' })
      
      // Get real user address and contract data
      await testnetDataService.initialize()
      const systemData = testnetDataService.getSystemData()
      const userAddress = systemData?.userAddress || systemData?.connectedWallet?.address
      
      if (!userAddress) {
        throw new Error('No wallet connected. Please connect your wallet to trade.')
      }
      
      // Get trading contract for selected chain
      const tradingContract = systemData?.contracts?.trading?.[selectedChain]
      if (!tradingContract) {
        throw new Error(`Trading contract not available for ${selectedChain}`)
      }
      
      // Prepare real transaction data
      const tradeParams = {
        chainId: selectedChain,
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        slippageTolerance,
        userAddress,
        aiOptimization: aiOptimization || {},
        deadline: Math.floor(Date.now() / 1000) + 1800 // 30 minutes
      }
      
      // Execute trade through trading service
      const result = await realTimeTradingService.executeTrade(tradeParams)
      
      if (result.success) {
        toast.success(
          `Trade submitted! ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`,
          { id: 'trade' }
        )
        
        // Store transaction in system data
        try {
          await testnetDataService.addTransaction({
            id: result.txHash || `trade_${Date.now()}`,
            type: 'swap',
            tokens: [fromToken, toToken],
            amounts: [fromAmount, toAmount],
            chain: selectedChain,
            status: 'pending',
            timestamp: Date.now(),
            txHash: result.txHash,
            aiOptimized: aiOptimization?.enabled || false,
            savings: aiOptimization?.savingsUsd || 0,
            gasUsed: aiOptimization?.estimatedGas || 0,
            slippage: priceData?.priceImpact || 0,
            usdValue: parseFloat(fromAmount) * (livePrices[fromToken]?.price || 1)
          })
        } catch (error) {
          console.warn('Failed to store transaction:', error)
        }
        
        // Reset form
        setFromAmount('')
        setToAmount('')
        setPriceData(null)
        setAiOptimization(null)
      } else {
        throw new Error(result.error || 'Trade execution failed')
      }
      
    } catch (error) {
      console.error('Trade execution error:', error)
      toast.error(`Trade failed: ${error.message}`, { id: 'trade' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-3">
          <ArrowUpDown className="h-8 w-8 text-blue-600" />
          <span>AI-Optimized Trading</span>
        </h1>
        <p className="text-gray-600 mt-2">Trade with the power of AI for optimal pricing and routes</p>
      </div>

      {/* Chain Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Network</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {chains.map((chain) => (
              <Button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id)}
                variant={selectedChain === chain.id ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-center"
              >
                <div 
                  className="w-4 h-4 rounded-full mb-2" 
                  style={{ backgroundColor: chain.color }}
                ></div>
                <span className="text-sm font-medium">{chain.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Interface */}
      <Card>
        <CardContent className="p-6">
          {/* From Token */}
          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">From</label>
            <span className="text-sm text-gray-500">
              Balance: {userBalances[fromToken]?.formatted || '0.0000'} {fromToken}
            </span>
          </div>
          
          <div className="flex space-x-3">
            <select 
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="input-field w-32"
            >
              {tokens.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="input-field flex-1 text-lg"
            />
          </div>
          
          {fromAmount && (
            <div className="text-sm text-gray-600">
              ≈ ${(parseFloat(fromAmount) * (livePrices[fromToken]?.price || 2340.50)).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} {priceServiceReady && livePrices[fromToken]?.source === 'live' && (
                <Badge variant="outline" className="ml-1 text-xs bg-green-50 text-green-700">
                  Live
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center my-6">
          <button
            onClick={handleSwapTokens}
            className="p-3 rounded-full border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
          >
            <ArrowUpDown className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* To Token */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">To</label>
            <span className="text-sm text-gray-500">
              Balance: {userBalances[toToken]?.formatted || '0.0000'} {toToken}
            </span>
          </div>
          
          <div className="flex space-x-3">
            <select 
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="input-field w-32"
            >
              {tokens.map(token => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
            
            <div className="input-field flex-1 text-lg bg-gray-50 flex items-center">
              {isLoading ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Calculating...</span>
                </div>
              ) : (
                <span className="text-gray-900">
                  {toAmount || '0.0'}
                </span>
              )}
            </div>
          </div>
          
          {toAmount && (
            <div className="text-sm text-gray-600">
              ≈ ${(parseFloat(toAmount) * (livePrices[toToken]?.price || 1.00)).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} {priceServiceReady && livePrices[toToken]?.source === 'live' && (
                <Badge variant="outline" className="ml-1 text-xs bg-green-50 text-green-700">
                  Live
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* AI Optimization Display */}
        {aiOptimization && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">
                {aiOptimization.enabled ? 'AI Optimization Active' : 'AI Optimization (Fallback)'}
              </span>
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                <CheckCircle className="h-3 w-3" />
                <span>{aiOptimization.confidenceScore.toFixed(1)}% Confidence</span>
              </div>
              {aiOptimization.source && (
                <Badge variant="outline" className="text-xs">
                  {aiOptimization.source}
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Estimated Savings:</span>
                <div className="font-semibold text-green-600">
                  ${aiOptimization.savingsUsd.toFixed(2)} ({aiOptimization.savingsPercent.toFixed(2)}%)
                </div>
              </div>
              <div>
                <span className="text-gray-600">Optimal Route:</span>
                <div className="font-semibold text-gray-900">{aiOptimization.optimalRoute}</div>
              </div>
            </div>
          </div>
        )}

        {/* Price Information */}
        {priceData && (
          <div className="mt-6 space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Exchange Rate</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">1 {fromToken} = {priceData.rate.toFixed(4)} {toToken}</span>
                {priceData.isRealData && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                    Live
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Price Impact</span>
              <span className={`font-medium ${
                priceData.priceImpact > 1 ? 'text-red-600' : 'text-green-600'
              }`}>
                {priceData.priceImpact.toFixed(3)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Minimum Received</span>
              <span className="font-medium">{priceData.minimumReceived.toFixed(4)} {toToken}</span>
            </div>
            
            {priceData.routeInfo && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Route</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">
                      {priceData.routeInfo.path.join(' → ')} ({priceData.routeInfo.hops} hop{priceData.routeInfo.hops !== 1 ? 's' : ''})
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {priceData.routeInfo.routeType}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Recommended Slippage</span>
                  <span className="font-medium text-blue-600">
                    {(priceData.routeInfo.slippageProtection * 100).toFixed(2)}%
                  </span>
                </div>
              </>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Network Fee</span>
              <span className="font-medium">~${priceData.gasFee.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="mt-6">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Advanced Settings</span>
              </div>
              <span className="text-xs text-gray-500">Slippage: {slippageTolerance}%</span>
            </summary>
            
            <div className="mt-4 p-4 border border-gray-200 rounded-lg space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slippage Tolerance
                </label>
                <div className="flex space-x-2">
                  {[0.1, 0.5, 1.0].map(value => (
                    <button
                      key={value}
                      onClick={() => setSlippageTolerance(value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        slippageTolerance === value
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50"
                    value={slippageTolerance}
                    onChange={(e) => setSlippageTolerance(parseFloat(e.target.value) || 0.5)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          </details>
        </div>

          {/* Trade Button */}
          <Button
            onClick={handleTrade}
            disabled={!fromAmount || !toAmount || isLoading}
            variant="gradient"
            size="lg"
            className="w-full mt-6"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Execute AI-Optimized Trade
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Information Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-600" />
            <span>AI Trading Benefits</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center bg-blue-50">
              <CardContent className="p-4">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">Better Pricing</div>
                <div className="text-sm text-muted-foreground">AI finds optimal routes for maximum output</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-green-50">
              <CardContent className="p-4">
                <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">Lower Fees</div>
                <div className="text-sm text-muted-foreground">Smart routing reduces gas costs by 15-30%</div>
              </CardContent>
            </Card>
            
            <Card className="text-center bg-purple-50">
              <CardContent className="p-4">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold text-gray-900">Faster Execution</div>
                <div className="text-sm text-muted-foreground">Real-time optimization for instant trades</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TradingInterface