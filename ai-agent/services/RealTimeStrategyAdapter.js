/**
 * Real-Time Strategy Adaptation System
 * Continuously monitors market conditions and adapts ROI strategy in real-time
 */

import { EventEmitter } from 'events'
import ROIMaximizationStrategy from './ROIMaximizationStrategy.js'

export class RealTimeStrategyAdapter extends EventEmitter {
  constructor(config = {}) {
    super()
    
    this.config = {
      adaptationInterval: 15000,    // 15 seconds
      emergencyInterval: 1000,     // 1 second for emergency situations
      performanceWindow: 300000,   // 5 minutes for performance evaluation
      confidenceThreshold: 0.7,    // Minimum confidence for strategy changes
      maxAdaptationsPerHour: 20,   // Rate limiting
      ...config
    }
    
    this.roiStrategy = new ROIMaximizationStrategy()
    this.adaptationHistory = []
    this.marketConditions = null
    this.currentStrategy = null
    this.isAdapting = false
    this.emergencyMode = false
    this.adaptationCount = 0
    this.lastAdaptation = Date.now()
    
    // Performance tracking
    this.performanceMetrics = {
      totalAdaptations: 0,
      successfulAdaptations: 0,
      avgImprovementPerAdaptation: 0,
      totalROIGain: 0,
      emergencyActivations: 0
    }
    
    this.setupEventListeners()
    console.log('🔄 Real-Time Strategy Adapter initialized')
  }

  /**
   * Start real-time adaptation monitoring
   */
  start() {
    console.log('🚀 Starting real-time strategy adaptation...')
    
    // Main adaptation loop
    this.adaptationTimer = setInterval(() => {
      this.executeAdaptationCycle()
    }, this.config.adaptationInterval)
    
    // Emergency monitoring loop
    this.emergencyTimer = setInterval(() => {
      this.checkEmergencyConditions()
    }, this.config.emergencyInterval)
    
    this.isRunning = true
    this.emit('started')
  }

  /**
   * Stop adaptation monitoring
   */
  stop() {
    console.log('⏹️ Stopping real-time strategy adaptation...')
    
    if (this.adaptationTimer) {
      clearInterval(this.adaptationTimer)
      this.adaptationTimer = null
    }
    
    if (this.emergencyTimer) {
      clearInterval(this.emergencyTimer)
      this.emergencyTimer = null
    }
    
    this.isRunning = false
    this.emit('stopped')
  }

  /**
   * Main adaptation cycle - called every 15 seconds
   */
  async executeAdaptationCycle() {
    if (this.isAdapting) return // Prevent concurrent adaptations
    
    try {
      this.isAdapting = true
      const startTime = Date.now()
      
      // Check rate limiting
      if (!this.canAdapt()) {
        console.log('⏳ Adaptation rate limited - skipping cycle')
        return
      }
      
      // Phase 1: Gather current market data
      const marketData = await this.gatherMarketData()
      if (!this.isValidMarketData(marketData)) {
        console.log('⚠️ Invalid market data - skipping adaptation')
        return
      }
      
      // Phase 2: Detect regime changes
      const regimeChange = this.detectRegimeChange(marketData)
      
      // Phase 3: Evaluate current strategy performance
      const performanceEval = this.evaluateCurrentPerformance()
      
      // Phase 4: Determine if adaptation is needed
      const adaptationNeeded = this.shouldAdapt(regimeChange, performanceEval, marketData)
      
      if (adaptationNeeded) {
        // Phase 5: Generate new strategy
        const newStrategy = await this.generateAdaptedStrategy(marketData, regimeChange)
        
        // Phase 6: Validate and apply strategy
        if (newStrategy && newStrategy.confidence > this.config.confidenceThreshold) {
          await this.applyStrategy(newStrategy)
          this.recordAdaptation(newStrategy, startTime)
          
          console.log(`✅ Strategy adapted: ${newStrategy.regime} -> ROI: ${newStrategy.expectedROI.toFixed(4)}`)
        } else {
          console.log('❌ New strategy failed validation - keeping current strategy')
        }
      } else {
        console.log('📊 Current strategy performing well - no adaptation needed')
      }
      
    } catch (error) {
      console.error('❌ Adaptation cycle error:', error.message)
      this.handleAdaptationError(error)
    } finally {
      this.isAdapting = false
    }
  }

  /**
   * Emergency condition monitoring - called every second
   */
  async checkEmergencyConditions() {
    if (!this.marketConditions) return
    
    const emergencySignals = []
    
    // Check for sudden volatility spikes
    if (this.marketConditions.volatility > 0.15) {
      emergencySignals.push({
        type: 'HIGH_VOLATILITY',
        severity: this.marketConditions.volatility > 0.25 ? 'CRITICAL' : 'HIGH',
        value: this.marketConditions.volatility
      })
    }
    
    // Check for large price movements
    if (this.marketConditions.priceChange1m && Math.abs(this.marketConditions.priceChange1m) > 0.05) {
      emergencySignals.push({
        type: 'PRICE_SHOCK',
        severity: Math.abs(this.marketConditions.priceChange1m) > 0.1 ? 'CRITICAL' : 'HIGH',
        value: this.marketConditions.priceChange1m
      })
    }
    
    // Check for liquidity drain
    if (this.marketConditions.liquidityChange && this.marketConditions.liquidityChange < -0.3) {
      emergencySignals.push({
        type: 'LIQUIDITY_DRAIN',
        severity: this.marketConditions.liquidityChange < -0.5 ? 'CRITICAL' : 'HIGH',
        value: this.marketConditions.liquidityChange
      })
    }
    
    // Check for MEV attack patterns
    if (this.marketConditions.toxicityScore && this.marketConditions.toxicityScore > 0.9) {
      emergencySignals.push({
        type: 'MEV_ATTACK',
        severity: 'CRITICAL',
        value: this.marketConditions.toxicityScore
      })
    }
    
    // Handle emergency signals
    if (emergencySignals.length > 0) {
      await this.handleEmergencySignals(emergencySignals)
    } else if (this.emergencyMode) {
      // Check if we can exit emergency mode
      await this.checkEmergencyExit()
    }
  }

  /**
   * Handle emergency situations with immediate strategy changes
   */
  async handleEmergencySignals(signals) {
    const highestSeverity = signals.reduce((max, signal) => 
      signal.severity === 'CRITICAL' ? 'CRITICAL' : (max === 'CRITICAL' ? 'CRITICAL' : 'HIGH'), 'LOW'
    )
    
    if (highestSeverity === 'CRITICAL' && !this.emergencyMode) {
      console.log('🚨 CRITICAL EMERGENCY DETECTED - Activating emergency protocols')
      await this.activateEmergencyMode(signals)
    } else if (highestSeverity === 'HIGH' && !this.emergencyMode) {
      console.log('⚠️ HIGH RISK DETECTED - Implementing defensive measures')
      await this.implementDefensiveMeasures(signals)
    }
    
    this.emit('emergency', { signals, severity: highestSeverity, timestamp: Date.now() })
  }

  /**
   * Activate emergency mode with conservative parameters
   */
  async activateEmergencyMode(signals) {
    this.emergencyMode = true
    this.performanceMetrics.emergencyActivations++
    
    const emergencyStrategy = {
      regime: 'EMERGENCY',
      parameters: {
        feeRate: 100, // 1% emergency fee
        spreadMultiplier: 2000, // 2x spread multiplier
        amplificationCoeff: 50, // Conservative amplification
        concentrationGamma: 0.2, // Wide concentration
        toxicityThreshold: 0.3, // Very sensitive to toxic flow
        rebalanceThreshold: 0.02, // Frequent rebalancing
        maxSlippageAllowed: 0.01, // 1% max slippage
        pauseNewPositions: true
      },
      confidence: 1.0, // Emergency mode always has high confidence
      expectedROI: 0.05, // Conservative 5% ROI target
      reason: `Emergency activated due to: ${signals.map(s => s.type).join(', ')}`,
      duration: 300000 // 5 minutes minimum
    }
    
    await this.applyStrategy(emergencyStrategy)
    
    // Set emergency exit timer
    setTimeout(() => {
      if (this.emergencyMode) {
        this.checkEmergencyExit()
      }
    }, emergencyStrategy.duration)
    
    console.log('🛡️ Emergency mode activated with conservative parameters')
  }

  /**
   * Implement defensive measures for high-risk situations
   */
  async implementDefensiveMeasures(signals) {
    const defensiveAdjustments = {
      feeIncrease: 0,
      spreadIncrease: 0,
      amplificationDecrease: 0,
      concentrationWidening: 0
    }
    
    // Adjust based on signal types
    for (const signal of signals) {
      switch (signal.type) {
        case 'HIGH_VOLATILITY':
          defensiveAdjustments.feeIncrease += 20 // +20 bps
          defensiveAdjustments.spreadIncrease += 500 // +0.5x
          break
        case 'PRICE_SHOCK':
          defensiveAdjustments.amplificationDecrease += 25
          defensiveAdjustments.concentrationWidening += 0.1
          break
        case 'LIQUIDITY_DRAIN':
          defensiveAdjustments.feeIncrease += 15 // +15 bps
          defensiveAdjustments.concentrationWidening += 0.15
          break
        case 'MEV_ATTACK':
          defensiveAdjustments.feeIncrease += 50 // +50 bps emergency fee
          break
      }
    }
    
    // Apply defensive adjustments to current strategy
    if (this.currentStrategy) {
      const adjustedStrategy = this.applyDefensiveAdjustments(this.currentStrategy, defensiveAdjustments)
      await this.applyStrategy(adjustedStrategy)
      console.log('🛡️ Defensive measures implemented')
    }
  }

  /**
   * Check if emergency mode can be exited
   */
  async checkEmergencyExit() {
    if (!this.emergencyMode) return
    
    // Check if conditions have stabilized
    const marketData = await this.gatherMarketData()
    
    const isStable = (
      (marketData.volatility || 0) < 0.08 &&
      Math.abs(marketData.priceChange1m || 0) < 0.02 &&
      (marketData.liquidityChange || 0) > -0.1 &&
      (marketData.toxicityScore || 0) < 0.6
    )
    
    if (isStable) {
      console.log('✅ Market conditions stabilized - Exiting emergency mode')
      this.emergencyMode = false
      
      // Return to normal strategy optimization
      const normalStrategy = await this.generateAdaptedStrategy(marketData, null)
      if (normalStrategy) {
        await this.applyStrategy(normalStrategy)
      }
      
      this.emit('emergency-exit', { timestamp: Date.now() })
    }
  }

  /**
   * Gather current market data from multiple sources
   */
  async gatherMarketData() {
    try {
      // This would integrate with real data sources
      // For now, simulate realistic market data
      const mockData = {
        price: 2000 + Math.random() * 100,
        volatility: 0.02 + Math.random() * 0.05,
        volume24h: 1000000 + Math.random() * 2000000,
        liquidityDepth: 5000000 + Math.random() * 10000000,
        priceChange1m: (Math.random() - 0.5) * 0.02,
        priceChange5m: (Math.random() - 0.5) * 0.05,
        priceChange1h: (Math.random() - 0.5) * 0.1,
        volumeVelocity: 0.8 + Math.random() * 0.4,
        liquidityChange: (Math.random() - 0.5) * 0.2,
        toxicityScore: Math.random() * 0.8,
        crossChainPrices: {
          ethereum: 2000,
          arbitrum: 2001,
          optimism: 1999,
          base: 2000.5,
          polygon: 1998
        },
        timestamp: Date.now()
      }
      
      this.marketConditions = mockData
      return mockData
      
    } catch (error) {
      console.error('❌ Failed to gather market data:', error.message)
      return null
    }
  }

  /**
   * Detect regime changes in market conditions
   */
  detectRegimeChange(marketData) {
    if (!this.currentStrategy) return null
    
    const currentRegime = this.currentStrategy.regime
    const newRegime = this.classifyMarketRegime(marketData)
    
    if (currentRegime !== newRegime) {
      const confidence = this.calculateRegimeChangeConfidence(marketData, currentRegime, newRegime)
      
      return {
        from: currentRegime,
        to: newRegime,
        confidence,
        triggers: this.identifyRegimeChangeTriggers(marketData, currentRegime, newRegime)
      }
    }
    
    return null
  }

  /**
   * Classify market regime based on current conditions
   */
  classifyMarketRegime(marketData) {
    const { volatility, volumeVelocity, priceChange1h, liquidityDepth } = marketData
    
    // High volatility regimes
    if (volatility > 0.08) {
      return volumeVelocity > 2.0 ? 'TRENDING_HIGH_VOLATILITY' : 'RANGING_HIGH_VOLATILITY'
    }
    
    // Moderate volatility regimes
    if (volatility > 0.03) {
      const istrending = Math.abs(priceChange1h) > 0.05
      return istrending ? 'TRENDING_MODERATE' : 'RANGING_MODERATE'
    }
    
    // Low volatility regimes
    if (volatility < 0.015) {
      return 'RANGING_LOW_VOLATILITY'
    }
    
    return 'NEUTRAL'
  }

  /**
   * Evaluate current strategy performance
   */
  evaluateCurrentPerformance() {
    if (!this.currentStrategy || this.adaptationHistory.length < 2) {
      return { score: 0.5, trend: 'UNKNOWN' }
    }
    
    const recentAdaptations = this.adaptationHistory.slice(-5)
    const avgROI = recentAdaptations.reduce((sum, adapt) => sum + adapt.actualROI, 0) / recentAdaptations.length
    const roiTrend = this.calculateROITrend(recentAdaptations)
    
    const performanceScore = Math.min(1.0, Math.max(0.0, avgROI / 0.15)) // Normalize against 15% target
    
    return {
      score: performanceScore,
      trend: roiTrend,
      avgROI,
      consistency: this.calculateConsistency(recentAdaptations),
      timeInRegime: Date.now() - this.lastAdaptation
    }
  }

  /**
   * Determine if strategy adaptation is needed
   */
  shouldAdapt(regimeChange, performanceEval, marketData) {
    const reasons = []
    
    // Regime change trigger
    if (regimeChange && regimeChange.confidence > 0.7) {
      reasons.push(`Regime change: ${regimeChange.from} -> ${regimeChange.to}`)
    }
    
    // Poor performance trigger
    if (performanceEval.score < 0.4) {
      reasons.push(`Poor performance: ${(performanceEval.score * 100).toFixed(1)}%`)
    }
    
    // Declining trend trigger
    if (performanceEval.trend === 'DECLINING' && performanceEval.timeInRegime > 180000) {
      reasons.push('Declining ROI trend detected')
    }
    
    // Market opportunity trigger
    const opportunityScore = this.calculateOpportunityScore(marketData)
    if (opportunityScore > 0.8) {
      reasons.push(`High opportunity score: ${(opportunityScore * 100).toFixed(1)}%`)
    }
    
    if (reasons.length > 0) {
      console.log(`🔄 Adaptation triggered: ${reasons.join(', ')}`)
      return true
    }
    
    return false
  }

  /**
   * Generate new adapted strategy
   */
  async generateAdaptedStrategy(marketData, regimeChange) {
    try {
      // Use ROI strategy to generate optimized parameters
      const poolState = {
        reserveX: 1000000,
        reserveY: 1000000 // Would be actual pool reserves
      }
      
      const roiOptimization = this.roiStrategy.optimizeROI(marketData, poolState, [])
      
      if (roiOptimization.strategyConfidence < this.config.confidenceThreshold) {
        return null
      }
      
      const adaptedStrategy = {
        regime: roiOptimization.marketRegime,
        parameters: {
          feeRate: Math.round(roiOptimization.feeStrategy.totalFee * 10000),
          spreadMultiplier: Math.round(roiOptimization.feeStrategy.volatilityComponent * 10000 + 1000),
          amplificationCoeff: roiOptimization.optimalParams.amplificationCoeff,
          concentrationGamma: roiOptimization.optimalParams.concentrationGamma,
          toxicityThreshold: 0.7,
          rebalanceThreshold: 0.05
        },
        confidence: roiOptimization.strategyConfidence,
        expectedROI: roiOptimization.riskAdjustedROI.totalROI,
        recommendations: roiOptimization.recommendations,
        marketData: {
          volatility: marketData.volatility,
          volume: marketData.volume24h,
          regime: roiOptimization.marketRegime
        },
        timestamp: Date.now()
      }
      
      return adaptedStrategy
      
    } catch (error) {
      console.error('❌ Strategy generation failed:', error.message)
      return null
    }
  }

  /**
   * Apply new strategy
   */
  async applyStrategy(strategy) {
    try {
      console.log(`🎯 Applying strategy: ${strategy.regime} (confidence: ${(strategy.confidence * 100).toFixed(1)}%)`)
      
      // Validate strategy parameters
      if (!this.validateStrategy(strategy)) {
        throw new Error('Strategy validation failed')
      }
      
      // Apply to ROI strategy
      this.roiStrategy.strategyParams.dynamic = {
        ...this.roiStrategy.strategyParams.dynamic,
        ...strategy.parameters
      }
      
      // Store current strategy
      this.currentStrategy = strategy
      this.lastAdaptation = Date.now()
      
      // Emit strategy change event
      this.emit('strategy-applied', strategy)
      
      console.log(`✅ Strategy applied: Fee=${strategy.parameters.feeRate}bps, Expected ROI=${(strategy.expectedROI * 100).toFixed(2)}%`)
      
    } catch (error) {
      console.error('❌ Strategy application failed:', error.message)
      throw error
    }
  }

  /**
   * Validate strategy before application
   */
  validateStrategy(strategy) {
    const { parameters } = strategy
    
    // Check parameter bounds
    if (parameters.feeRate < 1 || parameters.feeRate > 1000) return false
    if (parameters.amplificationCoeff < 10 || parameters.amplificationCoeff > 1000) return false
    if (parameters.concentrationGamma < 0.1 || parameters.concentrationGamma > 2.0) return false
    if (strategy.confidence < 0.1 || strategy.confidence > 1.0) return false
    
    return true
  }

  /**
   * Record adaptation for performance tracking
   */
  recordAdaptation(strategy, startTime) {
    const adaptation = {
      timestamp: Date.now(),
      executionTime: Date.now() - startTime,
      strategy: { ...strategy },
      previousStrategy: this.currentStrategy ? { ...this.currentStrategy } : null,
      actualROI: null, // Will be updated later
      success: true
    }
    
    this.adaptationHistory.push(adaptation)
    
    // Keep only last 100 adaptations
    if (this.adaptationHistory.length > 100) {
      this.adaptationHistory = this.adaptationHistory.slice(-100)
    }
    
    this.performanceMetrics.totalAdaptations++
    this.adaptationCount++
    
    // Update performance metrics
    this.updatePerformanceMetrics()
  }

  /**
   * Setup event listeners for monitoring
   */
  setupEventListeners() {
    this.roiStrategy.on('optimization', (result) => {
      this.emit('roi-optimization', result)
    })
    
    // Update ROI history for completed adaptations
    this.on('strategy-applied', (strategy) => {
      setTimeout(() => {
        this.updateAdaptationROI(strategy)
      }, 60000) // Update ROI after 1 minute
    })
  }

  /**
   * Update actual ROI for completed adaptations
   */
  updateAdaptationROI(strategy) {
    const recentAdaptation = this.adaptationHistory
      .find(adapt => adapt.timestamp === strategy.timestamp)
    
    if (recentAdaptation) {
      // Simulate ROI measurement (would be actual performance data)
      const measuredROI = strategy.expectedROI * (0.8 + Math.random() * 0.4) // ±20% variance
      recentAdaptation.actualROI = measuredROI
      
      // Update success metrics
      if (measuredROI > strategy.expectedROI * 0.8) {
        this.performanceMetrics.successfulAdaptations++
      }
      
      this.updatePerformanceMetrics()
    }
  }

  /**
   * Update overall performance metrics
   */
  updatePerformanceMetrics() {
    const completedAdaptations = this.adaptationHistory.filter(adapt => adapt.actualROI !== null)
    
    if (completedAdaptations.length > 0) {
      const totalROI = completedAdaptations.reduce((sum, adapt) => sum + adapt.actualROI, 0)
      this.performanceMetrics.avgImprovementPerAdaptation = totalROI / completedAdaptations.length
      this.performanceMetrics.totalROIGain = totalROI
    }
  }

  // Helper methods
  
  canAdapt() {
    const hourAgo = Date.now() - 3600000
    const recentAdaptations = this.adaptationHistory.filter(adapt => adapt.timestamp > hourAgo)
    return recentAdaptations.length < this.config.maxAdaptationsPerHour
  }

  isValidMarketData(data) {
    return data && typeof data.volatility === 'number' && data.timestamp
  }

  calculateRegimeChangeConfidence(marketData, oldRegime, newRegime) {
    // Calculate confidence based on strength of regime indicators
    let confidence = 0.5
    
    if (marketData.volatility > 0.1) confidence += 0.3
    if (Math.abs(marketData.priceChange1h) > 0.08) confidence += 0.2
    if (marketData.volumeVelocity > 2.0) confidence += 0.2
    
    return Math.min(1.0, confidence)
  }

  identifyRegimeChangeTriggers(marketData, oldRegime, newRegime) {
    const triggers = []
    
    if (marketData.volatility > 0.08) triggers.push('HIGH_VOLATILITY')
    if (Math.abs(marketData.priceChange1h) > 0.05) triggers.push('PRICE_MOMENTUM')
    if (marketData.volumeVelocity > 2.0) triggers.push('VOLUME_SURGE')
    if (marketData.liquidityChange < -0.2) triggers.push('LIQUIDITY_CHANGE')
    
    return triggers
  }

  calculateROITrend(adaptations) {
    if (adaptations.length < 3) return 'UNKNOWN'
    
    const rois = adaptations.map(a => a.actualROI).filter(roi => roi !== null)
    if (rois.length < 3) return 'UNKNOWN'
    
    const recent = rois.slice(-3)
    const trend = (recent[2] - recent[0]) / recent[0]
    
    if (trend > 0.05) return 'IMPROVING'
    if (trend < -0.05) return 'DECLINING'
    return 'STABLE'
  }

  calculateConsistency(adaptations) {
    const rois = adaptations.map(a => a.actualROI).filter(roi => roi !== null)
    if (rois.length < 2) return 0.5
    
    const avg = rois.reduce((sum, roi) => sum + roi, 0) / rois.length
    const variance = rois.reduce((sum, roi) => sum + Math.pow(roi - avg, 2), 0) / rois.length
    
    return Math.max(0, 1 - Math.sqrt(variance) / avg)
  }

  calculateOpportunityScore(marketData) {
    let score = 0
    
    // Cross-chain arbitrage opportunities
    if (marketData.crossChainPrices) {
      const prices = Object.values(marketData.crossChainPrices)
      const maxPrice = Math.max(...prices)
      const minPrice = Math.min(...prices)
      const spread = (maxPrice - minPrice) / minPrice
      
      if (spread > 0.01) score += Math.min(0.4, spread * 20) // Up to 40% for arbitrage
    }
    
    // High volume opportunities
    if (marketData.volumeVelocity > 1.5) {
      score += Math.min(0.3, (marketData.volumeVelocity - 1) * 0.6)
    }
    
    // Volatility opportunities
    if (marketData.volatility > 0.03 && marketData.volatility < 0.12) {
      score += 0.3 // Sweet spot for fee optimization
    }
    
    return Math.min(1.0, score)
  }

  applyDefensiveAdjustments(strategy, adjustments) {
    return {
      ...strategy,
      parameters: {
        ...strategy.parameters,
        feeRate: Math.min(1000, strategy.parameters.feeRate + adjustments.feeIncrease),
        spreadMultiplier: Math.min(5000, strategy.parameters.spreadMultiplier + adjustments.spreadIncrease),
        amplificationCoeff: Math.max(10, strategy.parameters.amplificationCoeff - adjustments.amplificationDecrease),
        concentrationGamma: Math.min(2.0, strategy.parameters.concentrationGamma + adjustments.concentrationWidening)
      },
      confidence: Math.max(0.5, strategy.confidence - 0.1), // Reduce confidence for defensive mode
      reason: `Defensive adjustments applied: ${strategy.reason || 'Risk mitigation'}`
    }
  }

  handleAdaptationError(error) {
    console.error('🚨 Adaptation error - entering safe mode')
    
    // Apply safe default strategy
    const safeStrategy = {
      regime: 'SAFE_MODE',
      parameters: {
        feeRate: 30, // 30 bps safe fee
        spreadMultiplier: 1200, // 1.2x spread
        amplificationCoeff: 100,
        concentrationGamma: 0.5,
        toxicityThreshold: 0.8,
        rebalanceThreshold: 0.1
      },
      confidence: 0.3,
      expectedROI: 0.08,
      reason: `Error recovery: ${error.message}`,
      timestamp: Date.now()
    }
    
    this.applyStrategy(safeStrategy)
  }

  // Public interface methods
  
  getStatus() {
    return {
      isRunning: this.isRunning,
      isAdapting: this.isAdapting,
      emergencyMode: this.emergencyMode,
      currentStrategy: this.currentStrategy,
      lastAdaptation: this.lastAdaptation,
      adaptationCount: this.adaptationCount,
      performanceMetrics: this.performanceMetrics,
      marketConditions: this.marketConditions
    }
  }

  getAdaptationHistory(limit = 10) {
    return this.adaptationHistory.slice(-limit)
  }

  forceAdaptation() {
    if (!this.isAdapting) {
      console.log('🔄 Forcing strategy adaptation...')
      this.executeAdaptationCycle()
    }
  }

  resetPerformanceMetrics() {
    this.performanceMetrics = {
      totalAdaptations: 0,
      successfulAdaptations: 0,
      avgImprovementPerAdaptation: 0,
      totalROIGain: 0,
      emergencyActivations: 0
    }
    console.log('📊 Performance metrics reset')
  }
}

export default RealTimeStrategyAdapter