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

  const tokens = [
    { symbol: 'ETH', name: 'Ethereum', balance: '2.4567', price: 2340.50 },
    { symbol: 'USDC', name: 'USD Coin', balance: '5420.32', price: 1.00 },
    { symbol: 'USDT', name: 'Tether', balance: '1250.00', price: 1.00 },
    { symbol: 'DAI', name: 'Dai Stablecoin', balance: '890.45', price: 1.00 },
    { symbol: 'LINK', name: 'Chainlink', balance: '125.67', price: 14.25 },
    { symbol: 'UNI', name: 'Uniswap', balance: '45.23', price: 6.80 },
    { symbol: 'WBTC', name: 'Wrapped Bitcoin', balance: '0.125', price: 43250.00 }
  ]

  const chains = [
    { id: 'zircuit', name: 'Zircuit', color: '#3b82f6' },
    { id: 'arbitrum', name: 'Arbitrum', color: '#8b5cf6' },
    { id: 'optimism', name: 'Optimism', color: '#ef4444' },
    { id: 'base', name: 'Base', color: '#10b981' },
    { id: 'polygon', name: 'Polygon', color: '#f59e0b' }
  ]

  const fromTokenData = tokens.find(t => t.symbol === fromToken)
  const toTokenData = tokens.find(t => t.symbol === toToken)

  useEffect(() => {
    // Simulate price calculation and AI optimization
    if (fromAmount && fromTokenData && toTokenData) {
      setIsLoading(true)
      
      setTimeout(() => {
        const baseRate = fromTokenData.price / toTokenData.price
        const randomVariation = 0.995 + Math.random() * 0.01 // ±0.5% variation
        const calculatedAmount = (parseFloat(fromAmount) * baseRate * randomVariation).toFixed(6)
        
        setToAmount(calculatedAmount)
        
        // Generate AI optimization data
        const optimization = {
          enabled: true,
          savingsPercent: Math.random() * 1.5 + 0.5, // 0.5-2%
          savingsUsd: parseFloat(fromAmount) * fromTokenData.price * 0.01 * (Math.random() * 1.5 + 0.5),
          optimalRoute: Math.random() > 0.5 ? 'Direct' : 'Multi-hop',
          confidenceScore: 85 + Math.random() * 12,
          estimatedGas: Math.floor(Math.random() * 100000 + 80000),
          priceImpact: Math.random() * 0.3 + 0.1
        }
        
        setAiOptimization(optimization)
        
        setPriceData({
          rate: baseRate * randomVariation,
          priceImpact: optimization.priceImpact,
          minimumReceived: parseFloat(calculatedAmount) * (1 - slippageTolerance / 100),
          gasFee: optimization.estimatedGas * 0.000000015 * 2340 // Rough ETH gas calculation
        })
        
        setIsLoading(false)
      }, 1500)
    }
  }, [fromAmount, fromToken, toToken, slippageTolerance])

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
      // Simulate transaction
      toast.loading('Executing AI-optimized trade...', { id: 'trade' })
      
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success(
        `Successfully swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}!`,
        { id: 'trade' }
      )
      
      // Reset form
      setFromAmount('')
      setToAmount('')
      setPriceData(null)
      setAiOptimization(null)
      
    } catch (error) {
      toast.error('Transaction failed. Please try again.', { id: 'trade' })
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
              Balance: {fromTokenData?.balance || '0.00'} {fromToken}
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
          
          {fromTokenData && fromAmount && (
            <div className="text-sm text-gray-600">
              ≈ ${(parseFloat(fromAmount) * fromTokenData.price).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
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
              Balance: {toTokenData?.balance || '0.00'} {toToken}
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
          
          {toTokenData && toAmount && (
            <div className="text-sm text-gray-600">
              ≈ ${(parseFloat(toAmount) * toTokenData.price).toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
          )}
        </div>

        {/* AI Optimization Display */}
        {aiOptimization && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-gray-900">AI Optimization Active</span>
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                <CheckCircle className="h-3 w-3" />
                <span>{aiOptimization.confidenceScore.toFixed(1)}% Confidence</span>
              </div>
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
              <span className="font-medium">1 {fromToken} = {priceData.rate.toFixed(4)} {toToken}</span>
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