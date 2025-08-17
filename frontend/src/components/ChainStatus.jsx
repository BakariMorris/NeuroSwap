import React from 'react'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Zap, 
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react'

const ChainStatus = () => {
  const chains = [
    {
      id: 'zircuit',
      name: 'Zircuit',
      status: 'operational',
      latency: 89,
      gasPrice: 12.5,
      blockTime: 2.1,
      liquidity: 6750000,
      volume24h: 875000,
      color: '#3b82f6',
      isPrimary: true
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      status: 'operational',
      latency: 125,
      gasPrice: 8.3,
      blockTime: 1.8,
      liquidity: 4625000,
      volume24h: 642000,
      color: '#8b5cf6'
    },
    {
      id: 'optimism',
      name: 'Optimism',
      status: 'warning',
      latency: 156,
      gasPrice: 15.7,
      blockTime: 2.3,
      liquidity: 3700000,
      volume24h: 521000,
      color: '#ef4444'
    },
    {
      id: 'base',
      name: 'Base',
      status: 'operational',
      latency: 98,
      gasPrice: 9.8,
      blockTime: 2.0,
      liquidity: 2220000,
      volume24h: 315000,
      color: '#10b981'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      status: 'operational',
      latency: 203,
      gasPrice: 45.2,
      blockTime: 2.8,
      liquidity: 1480000,
      volume24h: 195000,
      color: '#f59e0b'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'operational':
        return 'Operational'
      case 'warning':
        return 'Degraded'
      case 'error':
        return 'Offline'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Activity className="h-5 w-5 text-blue-600" />
        <span>Chain Status</span>
      </h3>
      
      <div className="space-y-4">
        {chains.map((chain) => (
          <div 
            key={chain.id} 
            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: chain.color }}
                ></div>
                <span className="font-medium text-gray-900">
                  {chain.name}
                  {chain.isPrimary && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      Primary
                    </span>
                  )}
                </span>
              </div>
              
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                getStatusColor(chain.status)
              }`}>
                {getStatusIcon(chain.status)}
                <span>{getStatusText(chain.status)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Latency</span>
                  </span>
                  <span className="font-medium">{chain.latency}ms</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center space-x-1">
                    <Zap className="h-3 w-3" />
                    <span>Gas Price</span>
                  </span>
                  <span className="font-medium">{chain.gasPrice} gwei</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Liquidity</span>
                  <span className="font-medium">${(chain.liquidity / 1000000).toFixed(1)}M</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>24h Volume</span>
                  </span>
                  <span className="font-medium">${(chain.volume24h / 1000).toFixed(0)}K</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Cross-chain synchronization: <span className="font-medium text-green-600">Operational</span>
        </div>
      </div>
    </div>
  )
}

export default ChainStatus