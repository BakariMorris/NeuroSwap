import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react'

const AIInsights = () => {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate AI insights generation
    const generateInsights = () => {
      const insightTypes = [
        {
          type: 'optimization',
          icon: Zap,
          color: 'text-yellow-600 bg-yellow-100',
          title: 'Fee Structure Optimization',
          description: 'AI detected suboptimal fee rates on Arbitrum. Recommended 15% increase could boost LP returns by $12,000/day.',
          confidence: 94,
          impact: 'high',
          action: 'Implement fee adjustment',
          timeToImplement: '2 minutes'
        },
        {
          type: 'opportunity',
          icon: Target,
          color: 'text-green-600 bg-green-100',
          title: 'Cross-Chain Arbitrage',
          description: 'Profitable arbitrage opportunity detected between Optimism and Base. Estimated profit: $8,400.',
          confidence: 87,
          impact: 'medium',
          action: 'Execute arbitrage',
          timeToImplement: '45 seconds'
        },
        {
          type: 'prediction',
          icon: TrendingUp,
          color: 'text-blue-600 bg-blue-100',
          title: 'Volume Surge Prediction',
          description: 'ML models predict 35% volume increase in next 2 hours. Pre-positioning liquidity on high-demand pairs.',
          confidence: 82,
          impact: 'high',
          action: 'Rebalance liquidity',
          timeToImplement: '5 minutes'
        },
        {
          type: 'risk',
          icon: AlertTriangle,
          color: 'text-orange-600 bg-orange-100',
          title: 'MEV Risk Detected',
          description: 'Unusual sandwich attack patterns on Base. Adjusting spread parameters to mitigate risk.',
          confidence: 91,
          impact: 'medium',
          action: 'Auto-mitigation active',
          timeToImplement: 'Immediate'
        },
        {
          type: 'efficiency',
          icon: Activity,
          color: 'text-purple-600 bg-purple-100',
          title: 'Capital Efficiency Gain',
          description: 'Dynamic weight adjustments increased capital efficiency by 3.2% across all pools in the last hour.',
          confidence: 96,
          impact: 'high',
          action: 'Continue monitoring',
          timeToImplement: 'Ongoing'
        }
      ]

      // Randomly select 3-4 insights
      const selectedInsights = insightTypes
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 2) + 3)
        .map((insight, index) => ({
          ...insight,
          id: `insight_${Date.now()}_${index}`,
          timestamp: Date.now() - Math.random() * 1800000, // Last 30 minutes
          status: Math.random() > 0.3 ? 'active' : 'implemented'
        }))

      return selectedInsights.sort((a, b) => b.timestamp - a.timestamp)
    }

    // Simulate loading
    setTimeout(() => {
      setInsights(generateInsights())
      setLoading(false)
    }, 1000)

    // Update insights every 30 seconds
    const interval = setInterval(() => {
      setInsights(generateInsights())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getImpactBadge = (impact) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[impact]}`}>
        {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
      </span>
    )
  }

  const getStatusBadge = (status) => {
    if (status === 'implemented') {
      return (
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span className="text-xs font-medium">Implemented</span>
        </div>
      )
    }
    
    return (
      <div className="flex items-center space-x-1 text-blue-600">
        <Clock className="h-3 w-3" />
        <span className="text-xs font-medium">Active</span>
      </div>
    )
  }

  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    
    if (minutes === 0) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  if (loading) {
    return (
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <span>AI Insights</span>
        </h3>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <span>AI Insights</span>
        </h3>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live Analysis</span>
        </div>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {insights.map((insight) => {
          const Icon = insight.icon
          
          return (
            <div 
              key={insight.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${insight.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {insight.title}
                    </h4>
                    {getImpactBadge(insight.impact)}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-4 text-gray-500">
                      <span>Confidence: {insight.confidence}%</span>
                      <span>Action: {insight.action}</span>
                      <span>ETA: {insight.timeToImplement}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(insight.status)}
                      <span className="text-gray-500">
                        {formatTime(insight.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Confidence Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>AI Confidence</span>
                      <span>{insight.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          insight.confidence >= 90 ? 'bg-green-500' :
                          insight.confidence >= 80 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${insight.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {insights.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Brain className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p>AI is analyzing market conditions...</p>
        </div>
      )}
    </div>
  )
}

export default AIInsights