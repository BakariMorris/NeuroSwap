import React, { useState, useEffect } from 'react'
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  Zap,
  CheckCircle,
  Clock,
  ExternalLink,
  Filter
} from 'lucide-react'

const RecentTransactions = () => {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('timestamp')

  useEffect(() => {
    // Generate mock transaction data
    const generateTransactions = () => {
      const types = ['swap', 'add_liquidity', 'remove_liquidity', 'bridge']
      const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'LINK', 'UNI', 'WBTC']
      const chains = ['Zircuit', 'Arbitrum', 'Optimism', 'Base', 'Polygon']
      const mockTxs = []

      for (let i = 0; i < 20; i++) {
        const type = types[Math.floor(Math.random() * types.length)]
        const token0 = tokens[Math.floor(Math.random() * tokens.length)]
        let token1 = tokens[Math.floor(Math.random() * tokens.length)]
        while (token1 === token0) {
          token1 = tokens[Math.floor(Math.random() * tokens.length)]
        }
        
        const chain = chains[Math.floor(Math.random() * chains.length)]
        const amount = Math.random() * 10000 + 100
        const timestamp = Date.now() - Math.random() * 3600000 // Last hour
        const aiOptimized = Math.random() > 0.3
        
        mockTxs.push({
          id: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
          type,
          tokens: type === 'bridge' ? [token0] : [token0, token1],
          amount: amount.toFixed(2),
          usdValue: (amount * (Math.random() * 2000 + 500)).toFixed(0),
          chain,
          fromChain: type === 'bridge' ? chain : null,
          toChain: type === 'bridge' ? chains[Math.floor(Math.random() * chains.length)] : null,
          user: `0x${Math.random().toString(16).substr(2, 6)}...${Math.random().toString(16).substr(2, 4)}`,
          timestamp,
          status: Math.random() > 0.1 ? 'completed' : 'pending',
          gasUsed: Math.floor(Math.random() * 200000 + 50000),
          gasPrice: Math.random() * 50 + 10,
          aiOptimized,
          savings: aiOptimized ? Math.random() * 20 + 5 : 0,
          slippage: Math.random() * 0.5 + 0.1
        })
      }

      return mockTxs.sort((a, b) => b.timestamp - a.timestamp)
    }

    setTransactions(generateTransactions())
  }, [])

  const getTypeIcon = (type) => {
    switch (type) {
      case 'swap':
        return <ArrowLeftRight className="h-4 w-4" />
      case 'add_liquidity':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'remove_liquidity':
        return <ArrowDownLeft className="h-4 w-4 text-red-500" />
      case 'bridge':
        return <ArrowLeftRight className="h-4 w-4 text-purple-500" />
      default:
        return <ArrowLeftRight className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'swap':
        return 'Swap'
      case 'add_liquidity':
        return 'Add Liquidity'
      case 'remove_liquidity':
        return 'Remove Liquidity'
      case 'bridge':
        return 'Bridge'
      default:
        return 'Transaction'
    }
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
            <Clock className="h-3 w-3 animate-spin" />
            <span className="text-xs font-medium">Pending</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-1 text-gray-600">
            <span className="text-xs font-medium">Unknown</span>
          </div>
        )
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    if (filter === 'ai_optimized') return tx.aiOptimized
    return tx.type === filter
  })

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <ArrowLeftRight className="h-5 w-5 text-blue-600" />
          <span>Recent Transactions</span>
        </h3>
        
        <div className="flex items-center space-x-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto text-sm"
          >
            <option value="all">All Types</option>
            <option value="swap">Swaps</option>
            <option value="add_liquidity">Add Liquidity</option>
            <option value="remove_liquidity">Remove Liquidity</option>
            <option value="bridge">Bridge</option>
            <option value="ai_optimized">AI Optimized</option>
          </select>
          
          <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTransactions.map((tx) => (
          <div 
            key={tx.id} 
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  tx.type === 'swap' ? 'bg-blue-100 text-blue-600' :
                  tx.type === 'add_liquidity' ? 'bg-green-100 text-green-600' :
                  tx.type === 'remove_liquidity' ? 'bg-red-100 text-red-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {getTypeIcon(tx.type)}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {getTypeLabel(tx.type)}
                    </span>
                    {tx.aiOptimized && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        <Zap className="h-3 w-3" />
                        <span>AI</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {tx.type === 'bridge' ? (
                      <span>{tx.tokens[0]} • {tx.fromChain} → {tx.toChain}</span>
                    ) : (
                      <span>{tx.tokens.join(' / ')} • {tx.chain}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  ${parseFloat(tx.usdValue).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  {formatTime(tx.timestamp)}
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>Gas: {tx.gasUsed.toLocaleString()}</span>
                <span>Slippage: {tx.slippage.toFixed(2)}%</span>
                {tx.aiOptimized && (
                  <span className="text-green-600 font-medium">
                    Saved ${tx.savings.toFixed(0)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusBadge(tx.status)}
                <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTransactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No transactions found for the selected filter.
        </div>
      )}
    </div>
  )
}

export default RecentTransactions