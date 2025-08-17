import React, { useState, useEffect } from 'react'
import { 
  Globe, 
  ArrowRight, 
  Zap, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Activity,
  TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

const CrossChainBridge = () => {
  const [sourceChain, setSourceChain] = useState('arbitrum')
  const [targetChain, setTargetChain] = useState('optimism')
  const [selectedToken, setSelectedToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [bridgeQuote, setBridgeQuote] = useState(null)
  const [recentBridges, setRecentBridges] = useState([])

  const chains = [
    { 
      id: 'zircuit', 
      name: 'Zircuit', 
      color: '#3b82f6',
      icon: '🔷',
      status: 'operational',
      avgTime: '2-3 min'
    },
    { 
      id: 'arbitrum', 
      name: 'Arbitrum', 
      color: '#8b5cf6',
      icon: '🟣',
      status: 'operational',
      avgTime: '1-2 min'
    },
    { 
      id: 'optimism', 
      name: 'Optimism', 
      color: '#ef4444',
      icon: '🔴',
      status: 'operational',
      avgTime: '1-2 min'
    },
    { 
      id: 'base', 
      name: 'Base', 
      color: '#10b981',
      icon: '🟢',
      status: 'operational',
      avgTime: '1-2 min'
    },
    { 
      id: 'polygon', 
      name: 'Polygon', 
      color: '#f59e0b',
      icon: '🟡',
      status: 'operational',
      avgTime: '2-5 min'
    }
  ]

  const tokens = [
    { symbol: 'USDC', name: 'USD Coin', balances: { arbitrum: 1250, optimism: 890, base: 0, polygon: 340, zircuit: 125 }},
    { symbol: 'USDT', name: 'Tether', balances: { arbitrum: 750, optimism: 1200, base: 0, polygon: 500, zircuit: 80 }},
    { symbol: 'ETH', name: 'Ethereum', balances: { arbitrum: 2.5, optimism: 1.8, base: 0, polygon: 0.5, zircuit: 3.2 }},
    { symbol: 'DAI', name: 'Dai', balances: { arbitrum: 500, optimism: 750, base: 0, polygon: 300, zircuit: 200 }}
  ]

  const sourceChainData = chains.find(c => c.id === sourceChain)
  const targetChainData = chains.find(c => c.id === targetChain)
  const tokenData = tokens.find(t => t.symbol === selectedToken)
  const sourceBalance = tokenData?.balances[sourceChain] || 0
  const targetBalance = tokenData?.balances[targetChain] || 0

  useEffect(() => {
    // Generate mock recent bridge transactions
    const generateRecentBridges = () => {
      const mockBridges = [
        {
          id: 'bridge_1',
          token: 'USDC',
          amount: 500,
          from: 'Arbitrum',
          to: 'Optimism',
          status: 'completed',
          timestamp: Date.now() - 300000, // 5 min ago
          txHash: '0x123...abc',
          fee: 2.50
        },
        {
          id: 'bridge_2',
          token: 'ETH',
          amount: 0.5,
          from: 'Base',
          to: 'Arbitrum',
          status: 'pending',
          timestamp: Date.now() - 120000, // 2 min ago
          txHash: '0x456...def',
          fee: 8.75
        },
        {
          id: 'bridge_3',
          token: 'USDT',
          amount: 1000,
          from: 'Polygon',
          to: 'Zircuit',
          status: 'completed',
          timestamp: Date.now() - 900000, // 15 min ago
          txHash: '0x789...ghi',
          fee: 5.20
        }
      ]
      setRecentBridges(mockBridges)
    }

    generateRecentBridges()
  }, [])

  useEffect(() => {
    // Generate bridge quote when parameters change
    if (amount && sourceChain && targetChain && selectedToken && sourceChain !== targetChain) {
      setIsLoading(true)
      
      setTimeout(() => {
        const baseAmount = parseFloat(amount)
        const bridgeFee = baseAmount * 0.001 + Math.random() * 5 + 2 // 0.1% + $2-7 fixed fee
        const estimatedTime = Math.floor(Math.random() * 4 + 1) // 1-5 minutes
        const receivedAmount = baseAmount - bridgeFee
        
        setBridgeQuote({
          sourceAmount: baseAmount,
          receivedAmount: Math.max(0, receivedAmount),
          bridgeFee,
          estimatedTime,
          route: Math.random() > 0.5 ? 'LayerZero' : 'Chainlink CCIP',
          confidence: 85 + Math.random() * 12,
          savings: Math.random() * 3 + 1 // $1-4 savings vs other bridges
        })
        
        setIsLoading(false)
      }, 1000)
    } else {
      setBridgeQuote(null)
    }
  }, [amount, sourceChain, targetChain, selectedToken])

  const handleSwapChains = () => {
    const temp = sourceChain
    setSourceChain(targetChain)
    setTargetChain(temp)
  }

  const handleBridge = async () => {
    if (!amount || !bridgeQuote) {
      toast.error('Please enter an amount to bridge')
      return
    }

    setIsLoading(true)
    
    try {
      toast.loading('Initiating cross-chain bridge...', { id: 'bridge' })
      
      // Simulate bridge transaction
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success(
        `Successfully bridged ${amount} ${selectedToken} from ${sourceChainData.name} to ${targetChainData.name}!`,
        { id: 'bridge' }
      )
      
      // Add to recent bridges
      const newBridge = {
        id: `bridge_${Date.now()}`,
        token: selectedToken,
        amount: parseFloat(amount),
        from: sourceChainData.name,
        to: targetChainData.name,
        status: 'pending',
        timestamp: Date.now(),
        txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 6)}`,
        fee: bridgeQuote.bridgeFee
      }
      
      setRecentBridges(prev => [newBridge, ...prev.slice(0, 4)])
      
      // Reset form
      setAmount('')
      setBridgeQuote(null)
      
    } catch (error) {
      toast.error('Bridge transaction failed. Please try again.', { id: 'bridge' })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span className="text-xs font-medium">Completed</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center space-x-1 text-yellow-600">
            <Clock className="h-3 w-3 animate-pulse" />
            <span className="text-xs font-medium">Pending</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertTriangle className="h-3 w-3" />
            <span className="text-xs font-medium">Failed</span>
          </div>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-3">
          <Globe className="h-8 w-8 text-blue-600" />
          <span>Cross-Chain Bridge</span>
        </h1>
        <p className="text-gray-600 mt-2">Seamlessly move assets across blockchain networks with AI-optimized routing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bridge Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chain Selection */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Networks</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Source Chain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <select 
                  value={sourceChain}
                  onChange={(e) => setSourceChain(e.target.value)}
                  className="input-field w-full"
                >
                  {chains.map(chain => (
                    <option key={chain.id} value={chain.id} disabled={chain.id === targetChain}>
                      {chain.icon} {chain.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Target Chain */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <select 
                  value={targetChain}
                  onChange={(e) => setTargetChain(e.target.value)}
                  className="input-field w-full"
                >
                  {chains.map(chain => (
                    <option key={chain.id} value={chain.id} disabled={chain.id === sourceChain}>
                      {chain.icon} {chain.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Swap Button */}
            <div className="flex justify-center mt-4">
              <button
                onClick={handleSwapChains}
                className="p-2 rounded-full border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
              >
                <ArrowRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Token & Amount */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset & Amount</h3>
            
            <div className="space-y-4">
              {/* Token Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Token</label>
                <select 
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                  className="input-field w-full"
                >
                  {tokens.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol} - {token.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <span className="text-sm text-gray-500">
                    Balance: {sourceBalance.toLocaleString()} {selectedToken}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field flex-1 text-lg"
                    max={sourceBalance}
                  />
                  <button
                    onClick={() => setAmount(sourceBalance.toString())}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bridge Quote */}
          {bridgeQuote && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>AI-Optimized Route</span>
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Route: {bridgeQuote.route}
                    </div>
                    <div className="text-sm text-gray-600">
                      {bridgeQuote.confidence.toFixed(1)}% AI Confidence
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      Save ${bridgeQuote.savings.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">
                      vs other bridges
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">You Send:</span>
                    <span className="font-medium">{bridgeQuote.sourceAmount} {selectedToken}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">You Receive:</span>
                    <span className="font-medium">{bridgeQuote.receivedAmount.toFixed(4)} {selectedToken}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bridge Fee:</span>
                    <span className="font-medium">${bridgeQuote.bridgeFee.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Time:</span>
                    <span className="font-medium">{bridgeQuote.estimatedTime} minutes</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bridge Button */}
          <button
            onClick={handleBridge}
            disabled={!amount || !bridgeQuote || isLoading || sourceChain === targetChain}
            className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Globe className="h-5 w-5" />
                <span>Bridge Assets</span>
              </>
            )}
          </button>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Network Status */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Network Status</span>
            </h3>
            
            <div className="space-y-3">
              {chains.map(chain => (
                <div key={chain.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: chain.color }}
                    ></div>
                    <span className="font-medium text-gray-900">{chain.name}</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-green-600 text-xs">
                      <CheckCircle className="h-3 w-3" />
                      <span>Online</span>
                    </div>
                    <div className="text-xs text-gray-500">{chain.avgTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bridges */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>Recent Bridges</span>
            </h3>
            
            <div className="space-y-3">
              {recentBridges.map(bridge => (
                <div key={bridge.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">
                      {bridge.amount} {bridge.token}
                    </div>
                    {getStatusBadge(bridge.status)}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {bridge.from} → {bridge.to}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatTime(bridge.timestamp)}</span>
                    <button className="flex items-center space-x-1 hover:text-blue-600 transition-colors">
                      <ExternalLink className="h-3 w-3" />
                      <span>{bridge.txHash}</span>
                    </button>
                  </div>
                </div>
              ))}
              
              {recentBridges.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No recent bridge transactions
                </div>
              )}
            </div>
          </div>

          {/* Bridge Benefits */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Bridge Benefits</span>
            </h3>
            
            <div className="space-y-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-semibold text-gray-900">AI-Optimized</div>
                <div className="text-xs text-gray-600">Best routes and fees</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Clock className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <div className="text-sm font-semibold text-gray-900">Fast Settlement</div>
                <div className="text-xs text-gray-600">1-5 minute transfers</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <div className="text-sm font-semibold text-gray-900">Secure</div>
                <div className="text-xs text-gray-600">LayerZero + CCIP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrossChainBridge