/**
 * Mock Data Service for NeuroSwap Frontend Demo
 * Provides realistic data for all dashboard components
 */

class MockDataService {
  constructor() {
    this.isInitialized = false
    this.dataCache = new Map()
    this.updateInterval = null
    this.subscribers = new Set()
  }

  async initialize() {
    if (this.isInitialized) return this.getSystemData()

    console.log('🔄 Initializing mock data service...')

    // Simulate initialization delay
    await this.sleep(1000)

    // Initialize all data sets
    const systemData = {
      deployments: this.generateDeploymentData(),
      metrics: this.generateMetricsData(),
      chains: this.generateChainData(),
      ai: this.generateAIData(),
      transactions: this.generateTransactionData(),
      performance: this.generatePerformanceData(),
      emergency: this.generateEmergencyData(),
      timestamp: Date.now()
    }

    this.dataCache.set('system', systemData)
    this.isInitialized = true

    // Start real-time updates
    this.startRealTimeUpdates()

    console.log('✅ Mock data service initialized')
    return systemData
  }

  generateDeploymentData() {
    return {
      totalNetworks: 5,
      totalContracts: 25,
      totalGasUsed: 32852665,
      successRate: 100,
      verificationRate: 80,
      primaryChain: {
        name: 'Zircuit Testnet',
        chainId: 48899,
        aimmContract: '0x131931e2bddf544430c44ead369605668f83747c',
        explorerUrl: 'https://explorer.testnet.zircuit.com'
      },
      networks: [
        {
          name: 'Zircuit Testnet',
          chainId: 48899,
          status: 'operational',
          contracts: { aimm: '0x131931e2bddf544430c44ead369605668f83747c' },
          isPrimary: true
        },
        {
          name: 'Arbitrum Sepolia',
          chainId: 421614,
          status: 'operational',
          contracts: { aimm: '0xa1f03b62dd99645c846838d5826f1ab7e6948be0' }
        },
        {
          name: 'Optimism Sepolia',
          chainId: 11155420,
          status: 'operational',
          contracts: { aimm: '0xb1fb441738e51e31725cc62351ca9dd36ffeebdb' }
        },
        {
          name: 'Base Sepolia',
          chainId: 84532,
          status: 'operational',
          contracts: { aimm: '0x8a5a61eb174fbdb300c6c92ef03b4cba668385b3' }
        },
        {
          name: 'Polygon Mumbai',
          chainId: 80001,
          status: 'operational',
          contracts: { aimm: '0xe04b16721afd0a232231aa14b7b0b47a4ff7b92e' }
        }
      ]
    }
  }

  generateMetricsData() {
    return {
      totalValueLocked: 18500000 + Math.random() * 2000000,
      dailyVolume: 2100000 + Math.random() * 400000,
      capitalEfficiency: 87.3 + Math.random() * 5,
      activeUsers: 1247 + Math.floor(Math.random() * 100),
      totalTrades: 15623 + Math.floor(Math.random() * 1000),
      avgSlippage: 0.12 + Math.random() * 0.05,
      aiConfidence: 94.2 + Math.random() * 4,
      systemUptime: 99.9 + Math.random() * 0.1,
      crossChainConnections: 10,
      lastUpdate: Date.now()
    }
  }

  generateChainData() {
    const chains = [
      { id: 'zircuit', name: 'Zircuit', color: '#3b82f6', share: 35 },
      { id: 'arbitrum', name: 'Arbitrum', color: '#8b5cf6', share: 25 },
      { id: 'optimism', name: 'Optimism', color: '#ef4444', share: 20 },
      { id: 'base', name: 'Base', color: '#10b981', share: 12 },
      { id: 'polygon', name: 'Polygon', color: '#f59e0b', share: 8 }
    ]

    return chains.map(chain => ({
      ...chain,
      status: Math.random() > 0.1 ? 'operational' : 'warning',
      latency: 50 + Math.random() * 200,
      gasPrice: Math.random() * 50 + 10,
      blockTime: chain.id === 'ethereum' ? 12 : Math.random() * 5 + 1,
      liquidity: Math.random() * 5000000 + 1000000,
      volume24h: Math.random() * 500000 + 100000,
      lastUpdate: Date.now()
    }))
  }

  generateAIData() {
    return {
      orchestrator: {
        status: 'operational',
        confidence: 94.2 + Math.random() * 4,
        lastOptimization: Date.now() - Math.random() * 300000,
        optimizationInterval: 300000,
        totalOptimizations: 1247 + Math.floor(Math.random() * 50)
      },
      marketAnalyzer: {
        status: 'operational',
        accuracy: 87.5 + Math.random() * 8,
        predictionLatency: 150 + Math.random() * 100,
        dataQuality: 0.95 + Math.random() * 0.05,
        lastAnalysis: Date.now() - Math.random() * 60000
      },
      parameterOptimizer: {
        status: 'operational',
        convergenceRate: 0.82 + Math.random() * 0.15,
        improvementRate: 0.15 + Math.random() * 0.1,
        learningRate: 0.01,
        generation: 156 + Math.floor(Math.random() * 10)
      },
      emergencyManager: {
        status: 'operational',
        riskLevel: 'low',
        riskScore: 0.2 + Math.random() * 0.3,
        activeCircuitBreakers: 0,
        totalCircuitBreakers: 15,
        lastRiskAssessment: Date.now() - Math.random() * 30000
      },
      performanceMonitor: {
        status: 'operational',
        totalMetrics: 52,
        activeAlerts: 0,
        averageLatency: 89 + Math.random() * 50,
        systemHealth: 0.99 + Math.random() * 0.01
      }
    }
  }

  generateTransactionData() {
    const transactions = []
    const types = ['swap', 'add_liquidity', 'remove_liquidity', 'bridge']
    const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'LINK']
    const chains = ['Zircuit', 'Arbitrum', 'Optimism', 'Base', 'Polygon']

    for (let i = 0; i < 50; i++) {
      const type = types[Math.floor(Math.random() * types.length)]
      const token0 = tokens[Math.floor(Math.random() * tokens.length)]
      let token1 = tokens[Math.floor(Math.random() * tokens.length)]
      while (token1 === token0) {
        token1 = tokens[Math.floor(Math.random() * tokens.length)]
      }
      
      const chain = chains[Math.floor(Math.random() * chains.length)]
      const amount = Math.random() * 10000 + 100
      const timestamp = Date.now() - Math.random() * 86400000 // Last 24 hours

      transactions.push({
        id: `0x${Math.random().toString(16).substr(2, 8)}`,
        type,
        tokens: type === 'bridge' ? [token0] : [token0, token1],
        amount: amount.toFixed(2),
        chain,
        user: `0x${Math.random().toString(16).substr(2, 8)}...`,
        timestamp,
        status: Math.random() > 0.05 ? 'completed' : 'pending',
        gasUsed: Math.floor(Math.random() * 200000 + 50000),
        aiOptimized: Math.random() > 0.3
      })
    }

    return transactions.sort((a, b) => b.timestamp - a.timestamp)
  }

  generatePerformanceData() {
    const data = []
    const now = Date.now()
    
    for (let i = 24; i >= 0; i--) {
      const timestamp = now - (i * 3600000) // Hourly data for 24 hours
      
      data.push({
        timestamp,
        efficiency: 78 + Math.random() * 15,
        volume: 1200000 + Math.random() * 800000,
        tvl: 15000000 + Math.random() * 5000000,
        aiConfidence: 70 + Math.random() * 25,
        slippage: 0.05 + Math.random() * 0.15,
        gasOptimization: 15 + Math.random() * 10,
        arbitrageOpportunities: Math.floor(Math.random() * 20),
        liquidityRebalances: Math.floor(Math.random() * 5)
      })
    }

    return data
  }

  generateEmergencyData() {
    return {
      systemStatus: 'operational',
      emergencyMode: false,
      riskLevel: 'low',
      riskScore: 0.25,
      circuitBreakers: {
        total: 15,
        active: 0,
        triggered: 0
      },
      threats: {
        detected: 0,
        mitigated: 12,
        falsePositives: 3
      },
      protocols: {
        total: 4,
        enabled: 4,
        lastActivation: null
      },
      lastAssessment: Date.now() - 30000
    }
  }

  startRealTimeUpdates() {
    // Update data every 5 seconds
    this.updateInterval = setInterval(() => {
      this.updateRealTimeData()
      this.notifySubscribers()
    }, 5000)
  }

  updateRealTimeData() {
    const systemData = this.dataCache.get('system')
    if (!systemData) return

    // Update metrics with small variations
    systemData.metrics.totalValueLocked += (Math.random() - 0.5) * 100000
    systemData.metrics.dailyVolume += (Math.random() - 0.5) * 50000
    systemData.metrics.capitalEfficiency += (Math.random() - 0.5) * 0.5
    systemData.metrics.aiConfidence += (Math.random() - 0.5) * 1
    systemData.metrics.avgSlippage += (Math.random() - 0.5) * 0.01
    systemData.metrics.lastUpdate = Date.now()

    // Update AI data
    systemData.ai.orchestrator.confidence += (Math.random() - 0.5) * 1
    systemData.ai.marketAnalyzer.accuracy += (Math.random() - 0.5) * 0.5
    systemData.ai.parameterOptimizer.convergenceRate += (Math.random() - 0.5) * 0.02

    // Ensure values stay within realistic bounds
    systemData.metrics.capitalEfficiency = Math.max(70, Math.min(95, systemData.metrics.capitalEfficiency))
    systemData.metrics.aiConfidence = Math.max(85, Math.min(98, systemData.metrics.aiConfidence))
    systemData.ai.orchestrator.confidence = Math.max(85, Math.min(98, systemData.ai.orchestrator.confidence))

    systemData.timestamp = Date.now()
  }

  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  notifySubscribers() {
    const systemData = this.getSystemData()
    this.subscribers.forEach(callback => {
      try {
        callback(systemData)
      } catch (error) {
        console.error('Error notifying subscriber:', error)
      }
    })
  }

  getSystemData() {
    return this.dataCache.get('system')
  }

  getMetrics() {
    return this.getSystemData()?.metrics
  }

  getChainData() {
    return this.getSystemData()?.chains
  }

  getAIData() {
    return this.getSystemData()?.ai
  }

  getTransactions() {
    return this.getSystemData()?.transactions
  }

  getPerformanceData() {
    return this.getSystemData()?.performance
  }

  generateArbitrageOpportunities() {
    const opportunities = []
    const assets = ['ETH', 'USDC', 'USDT', 'DAI', 'LINK']
    const chains = this.getChainData()

    for (let i = 0; i < Math.floor(Math.random() * 10); i++) {
      const asset = assets[Math.floor(Math.random() * assets.length)]
      const sourceChain = chains[Math.floor(Math.random() * chains.length)]
      const targetChain = chains[Math.floor(Math.random() * chains.length)]
      
      if (sourceChain.id === targetChain.id) continue

      opportunities.push({
        id: `arb_${Date.now()}_${i}`,
        asset,
        sourceChain: sourceChain.name,
        targetChain: targetChain.name,
        profitPercent: Math.random() * 2 + 0.5, // 0.5-2.5%
        amount: Math.random() * 50000 + 10000,
        confidence: Math.random() * 0.3 + 0.7, // 70-100%
        timestamp: Date.now(),
        status: 'detected'
      })
    }

    return opportunities
  }

  generateLiquidityRebalanceActions() {
    const actions = []
    const chains = this.getChainData()

    if (Math.random() > 0.7) { // 30% chance of rebalance needed
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        const sourceChain = chains[Math.floor(Math.random() * chains.length)]
        const targetChain = chains[Math.floor(Math.random() * chains.length)]
        
        if (sourceChain.id === targetChain.id) continue

        actions.push({
          id: `rebalance_${Date.now()}_${i}`,
          type: 'rebalance',
          sourceChain: sourceChain.name,
          targetChain: targetChain.name,
          amount: Math.random() * 100000 + 50000,
          efficiency: Math.random() * 10 + 5, // 5-15% efficiency gain
          estimatedTime: Math.floor(Math.random() * 300 + 60), // 1-5 minutes
          timestamp: Date.now(),
          status: 'pending'
        })
      }
    }

    return actions
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.subscribers.clear()
    this.dataCache.clear()
    this.isInitialized = false
  }
}

// Export singleton instance
export const mockDataService = new MockDataService()