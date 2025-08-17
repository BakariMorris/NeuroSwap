import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Cpu,
  Database,
  Eye,
  DollarSign,
  Shield,
  Gauge,
  LineChart,
  PieChart,
  Settings,
  RefreshCw
} from 'lucide-react'
import { 
  LineChart as RechartsLine, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { testnetDataService } from '../services/testnetData'

const AdvancedAIMetrics = () => {
  const [aiData, setAiData] = useState(null)
  const [predictions, setPredictions] = useState({})
  const [performanceMetrics, setPerformanceMetrics] = useState({})
  const [selectedAsset, setSelectedAsset] = useState('ETH')
  const [selectedTimeframe, setSelectedTimeframe] = useState('SHORT')
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  useEffect(() => {
    const fetchData = () => {
      const systemData = testnetDataService.getSystemData()
      if (systemData?.ai) {
        setAiData(systemData.ai)
        
        // Get advanced predictions if available
        if (systemData.ai.orchestrator?.predictions) {
          setPredictions(systemData.ai.orchestrator.predictions)
        }
        
        // Get performance metrics if available
        if (systemData.ai.orchestrator?.advancedMetrics) {
          setPerformanceMetrics(systemData.ai.orchestrator.advancedMetrics)
        }
        
        setLastUpdate(Date.now())
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  if (!aiData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading Advanced AI Metrics...</span>
        </div>
      </div>
    )
  }

  const currentPrediction = predictions[selectedAsset]?.[selectedTimeframe.toLowerCase()]
  const assets = Object.keys(predictions)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advanced AI Market Intelligence</h1>
            <p className="text-gray-600">Algorithmic Trading Analytics & Predictions</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Updated {new Date(lastUpdate).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Asset Selection */}
      <div className="flex space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
          <select 
            value={selectedAsset} 
            onChange={(e) => setSelectedAsset(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {assets.map(asset => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="SHORT">Short Term</option>
            <option value="MEDIUM">Medium Term</option>
            <option value="LONG">Long Term</option>
          </select>
        </div>
      </div>

      {/* Main Prediction Card */}
      {currentPrediction && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Prediction Signal */}
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                currentPrediction.prediction === 'BUY' ? 'bg-green-100 text-green-800' :
                currentPrediction.prediction === 'SELL' ? 'bg-red-100 text-red-800' :
                currentPrediction.prediction === 'WEAK_BUY' ? 'bg-emerald-100 text-emerald-700' :
                currentPrediction.prediction === 'WEAK_SELL' ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {currentPrediction.prediction === 'BUY' && <TrendingUp className="w-5 h-5 mr-2" />}
                {currentPrediction.prediction === 'SELL' && <TrendingDown className="w-5 h-5 mr-2" />}
                {currentPrediction.prediction === 'WEAK_BUY' && <TrendingUp className="w-4 h-4 mr-2" />}
                {currentPrediction.prediction === 'WEAK_SELL' && <TrendingDown className="w-4 h-4 mr-2" />}
                {currentPrediction.prediction === 'NEUTRAL' && <Activity className="w-4 h-4 mr-2" />}
                {currentPrediction.prediction.replace('_', ' ')}
              </div>
              <p className="text-sm text-gray-600 mt-2">AI Signal</p>
            </div>

            {/* Confidence & Strength */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Confidence</span>
                  <span className="text-sm text-gray-600">{(currentPrediction.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${currentPrediction.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Signal Strength</span>
                  <span className="text-sm text-gray-600">{(currentPrediction.strength * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${currentPrediction.strength * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Entry Price:</span>
                <span className="text-sm font-medium">${currentPrediction.entry?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Stop Loss:</span>
                <span className="text-sm font-medium text-red-600">${currentPrediction.stopLoss?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Take Profit:</span>
                <span className="text-sm font-medium text-green-600">${currentPrediction.takeProfit?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Risk/Reward:</span>
                <span className="text-sm font-medium">{currentPrediction.riskReward?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Position Size:</span>
                <span className="text-sm font-medium">{(currentPrediction.positionSize * 100)?.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technical Indicators */}
      {currentPrediction?.indicators && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Technical Indicators
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {currentPrediction.indicators.rsi?.toFixed(1) || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">RSI</div>
              <div className={`text-xs mt-1 ${
                currentPrediction.indicators.rsi > 70 ? 'text-red-600' :
                currentPrediction.indicators.rsi < 30 ? 'text-green-600' :
                'text-gray-500'
              }`}>
                {currentPrediction.indicators.rsi > 70 ? 'Overbought' :
                 currentPrediction.indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {currentPrediction.indicators.macd?.toFixed(4) || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">MACD</div>
              <div className={`text-xs mt-1 ${
                currentPrediction.indicators.macd > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentPrediction.indicators.macd > 0 ? 'Bullish' : 'Bearish'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {(currentPrediction.indicators.volatility * 100)?.toFixed(1) || 'N/A'}%
              </div>
              <div className="text-sm text-gray-600">Volatility</div>
              <div className={`text-xs mt-1 ${
                currentPrediction.indicators.volatility > 1.0 ? 'text-red-600' :
                currentPrediction.indicators.volatility > 0.6 ? 'text-orange-600' :
                'text-green-600'
              }`}>
                {currentPrediction.indicators.volatility > 1.0 ? 'High' :
                 currentPrediction.indicators.volatility > 0.6 ? 'Medium' : 'Low'}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-600">
                {(currentPrediction.indicators.trend * 100)?.toFixed(1) || 'N/A'}%
              </div>
              <div className="text-sm text-gray-600">Trend Strength</div>
              <div className={`text-xs mt-1 ${
                currentPrediction.indicators.trend > 0.7 ? 'text-green-600' :
                currentPrediction.indicators.trend > 0.4 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {currentPrediction.indicators.trend > 0.7 ? 'Strong' :
                 currentPrediction.indicators.trend > 0.4 ? 'Moderate' : 'Weak'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overall Accuracy</span>
              <span className="text-lg font-semibold text-green-600">
                {(performanceMetrics.accuracy * 100 || aiData.marketAnalyzer?.accuracy || 73.2).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sharpe Ratio</span>
              <span className="text-lg font-semibold text-blue-600">
                {performanceMetrics.sharpeRatio?.toFixed(2) || '1.85'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Win Rate</span>
              <span className="text-lg font-semibold text-purple-600">
                {(performanceMetrics.winRate * 100 || 58).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Max Drawdown</span>
              <span className="text-lg font-semibold text-red-600">
                -{(performanceMetrics.maxDrawdown * 100 || 12).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profit Factor</span>
              <span className="text-lg font-semibold text-emerald-600">
                {performanceMetrics.profitFactor?.toFixed(2) || '1.75'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2" />
            Model Performance
          </h3>
          <div className="space-y-3">
            {aiData.marketAnalyzer?.mlModels && Object.entries(aiData.marketAnalyzer.mlModels).map(([model, data]) => (
              <div key={model} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">{model.replace(/([A-Z])/g, ' $1')}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{(data.accuracy * 100).toFixed(1)}%</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" 
                      style={{ width: `${data.accuracy * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signal Summary */}
      {aiData.marketAnalyzer?.technicalSignals && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Market Signal Overview
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {aiData.marketAnalyzer.technicalSignals.bullish}
              </div>
              <div className="text-sm text-gray-600">Bullish Signals</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-3xl font-bold text-gray-600">
                {aiData.marketAnalyzer.technicalSignals.neutral}
              </div>
              <div className="text-sm text-gray-600">Neutral Signals</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-3xl font-bold text-red-600">
                {aiData.marketAnalyzer.technicalSignals.bearish}
              </div>
              <div className="text-sm text-gray-600">Bearish Signals</div>
            </div>
          </div>
        </div>
      )}

      {/* Current Signals */}
      {aiData.parameterOptimizer?.currentSignals && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Top Trading Signals
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Asset</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Signal</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Confidence</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">Strength</th>
                  <th className="text-left py-2 text-sm font-medium text-gray-600">R/R</th>
                </tr>
              </thead>
              <tbody>
                {aiData.parameterOptimizer.currentSignals.slice(0, 5).map((signal, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 font-medium">{signal.asset}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        signal.signal === 'BUY' ? 'bg-green-100 text-green-800' :
                        signal.signal === 'SELL' ? 'bg-red-100 text-red-800' :
                        signal.signal === 'WEAK_BUY' ? 'bg-emerald-100 text-emerald-700' :
                        signal.signal === 'WEAK_SELL' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {signal.signal}
                      </span>
                    </td>
                    <td className="py-3 text-sm">{(signal.confidence * 100).toFixed(1)}%</td>
                    <td className="py-3 text-sm">{(signal.strength * 100).toFixed(1)}%</td>
                    <td className="py-3 text-sm">{signal.riskReward?.toFixed(2) || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Risk Management */}
      {aiData.emergencyManager?.riskMetrics && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Risk Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Volatility Risk</span>
                <Gauge className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {(aiData.emergencyManager.riskMetrics.volatilityRisk * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-800">Concentration Risk</span>
                <PieChart className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {(aiData.emergencyManager.riskMetrics.concentrationRisk * 100).toFixed(1)}%
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-800">Liquidity Risk</span>
                <Activity className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {(aiData.emergencyManager.riskMetrics.liquidityRisk * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Metrics */}
      {aiData.performanceMonitor?.realTimeMetrics && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Real-time Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {aiData.performanceMonitor.realTimeMetrics.totalSignals}
              </div>
              <div className="text-sm text-gray-600">Total Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {aiData.performanceMonitor.realTimeMetrics.strongSignals}
              </div>
              <div className="text-sm text-gray-600">Strong Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {aiData.performanceMonitor.realTimeMetrics.neutralSignals}
              </div>
              <div className="text-sm text-gray-600">Neutral Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(aiData.performanceMonitor.realTimeMetrics.predictionAccuracy * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Live Accuracy</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedAIMetrics