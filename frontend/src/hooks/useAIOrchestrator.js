import { useState, useEffect, useCallback } from 'react'
import { testnetDataService } from '../services/testnetData'

export const useAIOrchestrator = () => {
  const [aiStatus, setAiStatus] = useState({
    orchestrator: { status: 'disconnected', confidence: 0 },
    marketAnalyzer: { status: 'disconnected', accuracy: 0 },
    parameterOptimizer: { status: 'disconnected', convergenceRate: 0 },
    emergencyManager: { status: 'disconnected', riskLevel: 'unknown' },
    performanceMonitor: { status: 'disconnected', systemHealth: 0 }
  })
  
  const [isConnected, setIsConnected] = useState(false)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [lastOptimization, setLastOptimization] = useState(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)

  const connectAI = useCallback(async () => {
    try {
      setConnectionAttempts(prev => prev + 1)
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Initialize AI status from testnet service
      await testnetDataService.initialize()
      const systemData = testnetDataService.getSystemData()
      
      if (systemData?.ai) {
        setAiStatus(systemData.ai)
        setIsConnected(true)
        
        // Set last optimization timestamp
        setLastOptimization({
          timestamp: Date.now() - Math.random() * 300000, // Last 5 minutes
          type: 'Parameter Adjustment',
          impact: '+$2,400',
          confidence: 94.2
        })
        
        // Subscribe to real-time updates
        const unsubscribe = testnetDataService.subscribe((data) => {
          if (data?.ai) {
            setAiStatus(data.ai)
            
            // Check for emergency conditions
            const riskScore = data.ai.emergencyManager?.riskScore || 0
            const shouldTriggerEmergency = riskScore > 0.8 || Math.random() < 0.01 // 1% random chance
            
            if (shouldTriggerEmergency && !emergencyMode) {
              setEmergencyMode(true)
              setTimeout(() => setEmergencyMode(false), 10000) // Auto-resolve after 10s
            }
          }
        })
        
        return unsubscribe
      }
      
      throw new Error('Failed to initialize AI systems')
      
    } catch (error) {
      console.error('AI connection failed:', error)
      setIsConnected(false)
      throw error
    }
  }, [])

  const disconnectAI = useCallback(() => {
    setIsConnected(false)
    setEmergencyMode(false)
    setAiStatus({
      orchestrator: { status: 'disconnected', confidence: 0 },
      marketAnalyzer: { status: 'disconnected', accuracy: 0 },
      parameterOptimizer: { status: 'disconnected', convergenceRate: 0 },
      emergencyManager: { status: 'disconnected', riskLevel: 'unknown' },
      performanceMonitor: { status: 'disconnected', systemHealth: 0 }
    })
  }, [])

  const triggerOptimization = useCallback(async (type = 'Manual') => {
    if (!isConnected) {
      throw new Error('AI not connected')
    }
    
    try {
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const optimization = {
        timestamp: Date.now(),
        type,
        impact: `+$${(Math.random() * 5000 + 1000).toFixed(0)}`,
        confidence: 85 + Math.random() * 12
      }
      
      setLastOptimization(optimization)
      
      // Update AI confidence slightly
      setAiStatus(prev => ({
        ...prev,
        orchestrator: {
          ...prev.orchestrator,
          confidence: Math.min(98, prev.orchestrator.confidence + Math.random() * 2)
        }
      }))
      
      return optimization
      
    } catch (error) {
      console.error('Optimization failed:', error)
      throw error
    }
  }, [isConnected])

  const getSystemHealth = useCallback(() => {
    if (!isConnected) return 0
    
    const components = Object.values(aiStatus)
    const healthScores = components.map(component => {
      if (component.status === 'operational') return 100
      if (component.status === 'warning') return 75
      if (component.status === 'error') return 25
      return 0
    })
    
    return healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length
  }, [isConnected, aiStatus])

  const getOptimizationStatus = useCallback(() => {
    if (!isConnected) return { status: 'disconnected', nextOptimization: null }
    
    const lastOptTime = lastOptimization?.timestamp || Date.now() - 300000
    const timeSinceOpt = Date.now() - lastOptTime
    const optimizationInterval = 300000 // 5 minutes
    
    return {
      status: timeSinceOpt > optimizationInterval ? 'due' : 'scheduled',
      nextOptimization: lastOptTime + optimizationInterval,
      timeSinceLastOptimization: timeSinceOpt
    }
  }, [isConnected, lastOptimization])

  // Auto-reconnect on failure
  useEffect(() => {
    if (!isConnected && connectionAttempts > 0 && connectionAttempts < 3) {
      const timer = setTimeout(() => {
        connectAI().catch(() => {
          // Silent fail for auto-reconnect
        })
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [isConnected, connectionAttempts, connectAI])

  // Periodic optimization simulation
  useEffect(() => {
    if (!isConnected) return
    
    const interval = setInterval(() => {
      const shouldOptimize = Math.random() < 0.3 // 30% chance every 30 seconds
      if (shouldOptimize) {
        triggerOptimization('Automatic').catch(() => {
          // Silent fail for auto-optimization
        })
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [isConnected, triggerOptimization])

  return {
    aiStatus,
    isConnected,
    emergencyMode,
    lastOptimization,
    connectionAttempts,
    connectAI,
    disconnectAI,
    triggerOptimization,
    getSystemHealth,
    getOptimizationStatus
  }
}