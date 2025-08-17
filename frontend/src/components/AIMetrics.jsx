import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Cpu,
  Database,
  Eye
} from 'lucide-react'
import { 
  LineChart, 
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
  PieChart,
  Pie,
  Cell
} from 'recharts'

import MetricCard from './MetricCard'

const AIMetrics = ({ aiStatus, lastOptimization }) => {
  const [performanceData, setPerformanceData] = useState([])
  const [optimizationHistory, setOptimizationHistory] = useState([])
  const [predictionAccuracy, setPredictionAccuracy] = useState([])
  const [timeRange, setTimeRange] = useState('24h')

  useEffect(() => {
    // Generate mock AI performance data
    const generatePerformanceData = () => {
      const data = []
      const now = Date.now()
      const interval = timeRange === '24h' ? 3600000 : timeRange === '7d' ? 86400000 : 604800000
      const points = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 4
      
      for (let i = points; i >= 0; i--) {
        const timestamp = now - (i * interval)
        
        data.push({
          timestamp,
          time: new Date(timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            ...(timeRange !== '24h' && { month: 'short', day: 'numeric' })
          }),
          confidence: 85 + Math.random() * 12, // 85-97%
          accuracy: 78 + Math.random() * 18, // 78-96%
          efficiency: 82 + Math.random() * 15, // 82-97%
          learningRate: 0.85 + Math.random() * 0.12, // 0.85-0.97
          optimizations: Math.floor(Math.random() * 5),
          predictions: Math.floor(Math.random() * 20 + 10)
        })
      }
      return data
    }

    // Generate optimization history
    const generateOptimizationHistory = () => {
      const optimizations = [
        { type: 'Fee Adjustment', impact: '+$12,400', time: '2m ago', status: 'completed' },
        { type: 'Liquidity Rebalance', impact: '+$8,200', time: '15m ago', status: 'completed' },
        { type: 'Spread Optimization', impact: '+$5,600', time: '32m ago', status: 'completed' },
        { type: 'Cross-Chain Sync', impact: '+$3,100', time: '45m ago', status: 'completed' },
        { type: 'Risk Mitigation', impact: '-$1,200', time: '1h ago', status: 'completed' }
      ]
      return optimizations
    }

    // Generate prediction accuracy data
    const generatePredictionAccuracy = () => {
      return [
        { name: 'Volume Prediction', value: 94, color: '#3b82f6' },
        { name: 'Price Movement', value: 87, color: '#10b981' },
        { name: 'Volatility Forecast', value: 91, color: '#8b5cf6' },
        { name: 'Arbitrage Detection', value: 96, color: '#f59e0b' },
        { name: 'Risk Assessment', value: 89, color: '#ef4444' }
      ]
    }

    setPerformanceData(generatePerformanceData())
    setOptimizationHistory(generateOptimizationHistory())
    setPredictionAccuracy(generatePredictionAccuracy())
  }, [timeRange])

  const aiMetrics = {
    confidence: 94.2,
    accuracy: 87.5,
    totalOptimizations: 1247,
    activePredictions: 15,
    learningRate: 0.92,
    efficiency: 89.1,
    uptime: 99.97,
    dataQuality: 0.94
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <span>AI Metrics & Performance</span>
          </h1>
          <p className="text-gray-600 mt-1">Real-time AI orchestrator performance and analytics</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">AI Active</span>
          </div>
        </div>
      </div>

      {/* AI Status Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <MetricCard
          title="AI Confidence"
          value={`${aiMetrics.confidence}%`}
          change={+1.3}
          icon={Brain}
          color="blue"
        />
        
        <MetricCard
          title="Prediction Accuracy"
          value={`${aiMetrics.accuracy}%`}
          change={+2.1}
          icon={Target}
          color="green"
        />
        
        <MetricCard
          title="Total Optimizations"
          value={aiMetrics.totalOptimizations.toLocaleString()}
          change={+5.7}
          icon={Zap}
          color="purple"
        />
        
        <MetricCard
          title="Active Predictions"
          value={aiMetrics.activePredictions}
          change={+12.0}
          icon={Eye}
          color="orange"
        />
        
        <MetricCard
          title="Learning Rate"
          value={aiMetrics.learningRate.toFixed(2)}
          change={+0.8}
          icon={TrendingUp}
          color="indigo"
        />
        
        <MetricCard
          title="System Uptime"
          value={`${aiMetrics.uptime}%`}
          change={+0.1}
          icon={Activity}
          color="emerald"
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Confidence Trend */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">AI Confidence Trend</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Brain className="h-4 w-4 text-blue-500" />
              <span>Real-time Analysis</span>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  domain={[80, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Confidence']}
                />
                <Area 
                  type="monotone" 
                  dataKey="confidence" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#confidenceGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Accuracy */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Prediction Accuracy</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Target className="h-4 w-4 text-green-500" />
              <span>87.5% Average</span>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  domain={[70, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Accuracy']}
                />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prediction Categories */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Prediction Categories</span>
          </h3>
          
          <div className="space-y-4">
            {predictionAccuracy.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {category.name}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {category.value}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${category.value}%`,
                      backgroundColor: category.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Optimizations */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>Recent Optimizations</span>
          </h3>
          
          <div className="space-y-4">
            {optimizationHistory.map((opt, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{opt.type}</div>
                  <div className="text-sm text-gray-600">{opt.time}</div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${
                    opt.impact.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {opt.impact}
                  </div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-xs">Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Resources */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Cpu className="h-5 w-5 text-blue-600" />
            <span>System Resources</span>
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                <span className="text-sm font-bold text-gray-900">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: '23%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Memory</span>
                <span className="text-sm font-bold text-gray-900">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Network I/O</span>
                <span className="text-sm font-bold text-gray-900">34%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="h-2 bg-purple-500 rounded-full" style={{ width: '34%' }}></div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-2 mb-1">
                  <Database className="h-4 w-4" />
                  <span>Data Quality: {(aiMetrics.dataQuality * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Last Update: Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIMetrics