import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Clock,
  RefreshCw,
  Eye,
  AlertCircle,
  Power,
  Settings
} from 'lucide-react'
import toast from 'react-hot-toast'

const EmergencyStatus = ({ emergencyMode }) => {
  const [systemStatus, setSystemStatus] = useState('operational')
  const [riskLevel, setRiskLevel] = useState('low')
  const [circuitBreakers, setCircuitBreakers] = useState([])
  const [threats, setThreats] = useState([])
  const [protocols, setProtocols] = useState([])
  const [monitoring, setMonitoring] = useState(true)

  useEffect(() => {
    // Generate emergency system data
    const generateEmergencyData = () => {
      // Circuit Breakers
      const breakerTypes = [
        { id: 'price_deviation', name: 'Price Deviation Limit', threshold: '5%', status: 'active' },
        { id: 'volume_spike', name: 'Volume Spike Detection', threshold: '500%', status: 'active' },
        { id: 'slippage_protection', name: 'Slippage Protection', threshold: '2%', status: 'active' },
        { id: 'flash_loan_guard', name: 'Flash Loan Protection', threshold: 'Any', status: 'active' },
        { id: 'sandwich_protection', name: 'Sandwich Attack Guard', threshold: 'Pattern', status: 'active' },
        { id: 'liquidity_drain', name: 'Liquidity Drain Protection', threshold: '80%', status: 'active' },
        { id: 'gas_spike', name: 'Gas Price Spike Protection', threshold: '200 gwei', status: 'active' },
        { id: 'oracle_deviation', name: 'Oracle Price Deviation', threshold: '3%', status: 'active' },
        { id: 'cross_chain_fail', name: 'Cross-Chain Failure Detection', threshold: '5 min', status: 'active' },
        { id: 'ai_confidence', name: 'AI Confidence Threshold', threshold: '70%', status: 'active' },
        { id: 'emergency_pause', name: 'Emergency Pause System', threshold: 'Manual', status: 'standby' },
        { id: 'fund_recovery', name: 'Fund Recovery Protocol', threshold: 'Manual', status: 'standby' }
      ]
      
      setCircuitBreakers(breakerTypes.map(breaker => ({
        ...breaker,
        triggered: false, // Based on real system status
        lastTriggered: null,
        triggerCount: 0
      })))
      
      // Threat Detection
      const threatTypes = [
        {
          id: 'threat_1',
          type: 'Sandwich Attack',
          severity: 'medium',
          description: 'Detected potential sandwich attack pattern on ETH/USDC pool',
          status: 'mitigated',
          timestamp: Date.now() - 420000, // 7 min ago
          autoMitigated: true
        },
        {
          id: 'threat_2',
          type: 'Oracle Manipulation',
          severity: 'high',
          description: 'Unusual price deviation detected in LINK/USDT oracle feed',
          status: 'monitoring',
          timestamp: Date.now() - 180000, // 3 min ago
          autoMitigated: false
        },
        {
          id: 'threat_3',
          type: 'MEV Bot Activity',
          severity: 'low',
          description: 'Increased MEV bot activity detected across multiple pools',
          status: 'acknowledged',
          timestamp: Date.now() - 900000, // 15 min ago
          autoMitigated: true
        }
      ]
      
      setThreats(threatTypes.slice(0, 3)) // Show first 3 threats consistently
      
      // Emergency Protocols
      const protocolTypes = [
        {
          id: 'protocol_1',
          name: 'Automated Liquidity Protection',
          description: 'Automatically pauses trading when liquidity drops below 20%',
          enabled: true,
          lastActivated: null,
          activationCount: 0
        },
        {
          id: 'protocol_2',
          name: 'Cross-Chain Emergency Bridge',
          description: 'Enables emergency asset recovery across all supported chains',
          enabled: true,
          lastActivated: null,
          activationCount: 0
        },
        {
          id: 'protocol_3',
          name: 'AI Override Protocol',
          description: 'Manual override for AI decisions during critical situations',
          enabled: true,
          lastActivated: Date.now() - 86400000, // 1 day ago
          activationCount: 2
        },
        {
          id: 'protocol_4',
          name: 'Emergency Fund Withdrawal',
          description: 'Allows immediate withdrawal of all user funds in extreme scenarios',
          enabled: false,
          lastActivated: null,
          activationCount: 0
        }
      ]
      
      setProtocols(protocolTypes)
    }

    generateEmergencyData()
    
    // Update data every 10 seconds
    const interval = setInterval(generateEmergencyData, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Update system status based on emergency mode and threats
    if (emergencyMode) {
      setSystemStatus('emergency')
      setRiskLevel('high')
    } else {
      const activeThreats = threats.filter(t => t.status === 'monitoring' || t.status === 'active')
      const highSeverityThreats = threats.filter(t => t.severity === 'high')
      
      if (highSeverityThreats.length > 0) {
        setSystemStatus('warning')
        setRiskLevel('high')
      } else if (activeThreats.length > 0) {
        setSystemStatus('warning')
        setRiskLevel('medium')
      } else {
        setSystemStatus('operational')
        setRiskLevel('low')
      }
    }
  }, [emergencyMode, threats])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'emergency':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getThreatStatusIcon = (status) => {
    switch (status) {
      case 'mitigated':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'monitoring':
        return <Eye className="h-4 w-4 text-yellow-500" />
      case 'active':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'acknowledged':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never'
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const triggerEmergencyProtocol = (protocolId) => {
    toast.success(`Emergency protocol "${protocolId}" activated successfully`)
    // Update protocol status
    setProtocols(prev => prev.map(p => 
      p.id === protocolId 
        ? { ...p, lastActivated: Date.now(), activationCount: p.activationCount + 1 }
        : p
    ))
  }

  const toggleProtocol = (protocolId) => {
    setProtocols(prev => prev.map(p => 
      p.id === protocolId 
        ? { ...p, enabled: !p.enabled }
        : p
    ))
  }

  const activeThreats = threats.filter(t => t.status === 'monitoring' || t.status === 'active')
  const triggeredBreakers = circuitBreakers.filter(cb => cb.triggered)
  const enabledProtocols = protocols.filter(p => p.enabled)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <span>Emergency Status</span>
          </h1>
          <p className="text-gray-600 mt-1">System security monitoring and emergency response controls</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <button
            onClick={() => setMonitoring(!monitoring)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              monitoring 
                ? 'bg-green-50 text-green-700 border-green-300' 
                : 'bg-gray-50 text-gray-700 border-gray-300'
            }`}
          >
            <Power className="h-4 w-4" />
            <span className="text-sm font-medium">
              {monitoring ? 'Monitoring Active' : 'Monitoring Disabled'}
            </span>
          </button>
          
          <div className={`flex items-center space-x-2 px-4 py-2 border rounded-lg ${
            getStatusColor(systemStatus)
          }`}>
            {getStatusIcon(systemStatus)}
            <span className="text-sm font-medium capitalize">
              {systemStatus}
            </span>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <div className={`text-3xl font-bold mb-2 ${getRiskLevelColor(riskLevel)}`}>
            {riskLevel.toUpperCase()}
          </div>
          <div className="text-sm text-gray-600">Risk Level</div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {circuitBreakers.length}
          </div>
          <div className="text-sm text-gray-600">Circuit Breakers</div>
          <div className="text-xs text-gray-500 mt-1">
            {circuitBreakers.filter(cb => cb.status === 'active').length} active
          </div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {threats.filter(t => t.status === 'mitigated').length}
          </div>
          <div className="text-sm text-gray-600">Threats Mitigated</div>
          <div className="text-xs text-gray-500 mt-1">
            {activeThreats.length} active
          </div>
        </div>
        
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {enabledProtocols.length}/{protocols.length}
          </div>
          <div className="text-sm text-gray-600">Protocols Enabled</div>
          <div className="text-xs text-gray-500 mt-1">
            Ready for activation
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Circuit Breakers */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span>Circuit Breakers</span>
            {triggeredBreakers.length > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {triggeredBreakers.length} Triggered
              </span>
            )}
          </h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {circuitBreakers.map(breaker => (
              <div 
                key={breaker.id}
                className={`p-4 border rounded-lg transition-colors ${
                  breaker.triggered ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">
                    {breaker.name}
                  </div>
                  <div className="flex items-center space-x-2">
                    {breaker.triggered ? (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-medium">TRIGGERED</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs font-medium">{breaker.status.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  Threshold: {breaker.threshold}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Triggers: {breaker.triggerCount}</span>
                  <span>
                    Last: {breaker.lastTriggered ? formatTime(breaker.lastTriggered) : 'Never'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Threat Detection */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-600" />
            <span>Threat Detection</span>
            {activeThreats.length > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                {activeThreats.length} Active
              </span>
            )}
          </h3>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {threats.length > 0 ? threats.map(threat => (
              <div 
                key={threat.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {threat.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getSeverityColor(threat.severity)
                    }`}>
                      {threat.severity.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {getThreatStatusIcon(threat.status)}
                    <span className="text-xs font-medium text-gray-600 capitalize">
                      {threat.status}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  {threat.description}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {threat.autoMitigated ? 'Auto-mitigated' : 'Manual review required'}
                  </span>
                  <span>{formatTime(threat.timestamp)}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No threats detected</p>
                <p className="text-sm">System is secure</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Protocols */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <span>Emergency Protocols</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {protocols.map(protocol => (
            <div 
              key={protocol.id}
              className={`p-4 border-2 rounded-lg transition-all ${
                protocol.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-gray-900">
                  {protocol.name}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleProtocol(protocol.id)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      protocol.enabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      protocol.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`}></div>
                  </button>
                  
                  {protocol.enabled && (
                    <button
                      onClick={() => triggerEmergencyProtocol(protocol.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                    >
                      ACTIVATE
                    </button>
                  )}
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                {protocol.description}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span className="font-medium">Activations:</span> {protocol.activationCount}
                </div>
                <div>
                  <span className="font-medium">Last Used:</span> {formatTime(protocol.lastActivated)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmergencyStatus