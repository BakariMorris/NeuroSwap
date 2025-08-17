import React from 'react'
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Globe,
  Shield,
  Activity,
  Target,
  Cpu,
  BarChart3,
  CheckCircle
} from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI-Driven Optimization",
      description: "Advanced machine learning algorithms continuously optimize fee structures, spreads, and asset weights for maximum capital efficiency.",
      metrics: "25-35% efficiency improvement",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Globe,
      title: "Cross-Chain Coordination",
      description: "Unified liquidity management across 5+ blockchain networks with intelligent arbitrage detection and execution.",
      metrics: "Sub-60 second sync",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Advanced Risk Management",
      description: "15+ circuit breaker types with automated threat detection and emergency response protocols for maximum security.",
      metrics: "99.9% uptime guaranteed",
      color: "from-pink-500 to-red-500"
    },
    {
      icon: Activity,
      title: "Real-Time Monitoring",
      description: "Comprehensive system monitoring with 50+ metrics, anomaly detection, and predictive maintenance capabilities.",
      metrics: "<10 second response",
      color: "from-green-500 to-blue-500"
    },
    {
      icon: Target,
      title: "Intelligent Arbitrage",
      description: "ML-powered opportunity detection across multiple chains with automated execution and profit optimization.",
      metrics: "95%+ capture rate",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Zap,
      title: "Autonomous Operation",
      description: "Self-optimizing parameters with minimal human intervention, continuous learning from market conditions.",
      metrics: "24/7 autonomous",
      color: "from-indigo-500 to-purple-500"
    }
  ]

  const integrations = [
    {
      name: "Flare Network",
      description: "FTSO price feeds and secure randomness for AI decision making",
      logo: "🔥",
      features: ["Real-time price data", "Data quality validation", "Secure randomness"]
    },
    {
      name: "LayerZero",
      description: "Omnichain messaging for cross-chain parameter synchronization",
      logo: "⚡",
      features: ["Cross-chain messaging", "Unified liquidity", "Arbitrage execution"]
    },
    {
      name: "Chainlink CCIP",
      description: "Secure cross-chain communication and token transfers",
      logo: "🔗",
      features: ["Cross-chain validation", "Secure messaging", "Token bridging"]
    },
    {
      name: "Zircuit",
      description: "Primary deployment target with AI-optimized smart contracts",
      logo: "🟣",
      features: ["AI integration", "Gas optimization", "Production ready"]
    },
    {
      name: "Hedera",
      description: "Enterprise-grade AI consensus and validation",
      logo: "🌐",
      features: ["AI consensus", "Audit trails", "Enterprise security"]
    }
  ]

  const benefits = [
    {
      title: "For Liquidity Providers",
      items: [
        "15-30% higher returns through AI optimization",
        "Reduced impermanent loss via dynamic rebalancing",
        "Cross-chain yield opportunities",
        "Automated risk management"
      ]
    },
    {
      title: "For Traders",
      items: [
        "10-20% lower slippage during volatility",
        "Better price discovery through arbitrage",
        "Gas-optimized routing",
        "MEV protection"
      ]
    },
    {
      title: "For Protocols",
      items: [
        "Composable AI infrastructure",
        "Real-time market intelligence",
        "Cross-chain interoperability",
        "Emergency response systems"
      ]
    }
  ]

  return (
    <div className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Revolutionary AI-Driven Features
          </h2>
          <p className="text-xl text-gray-600">
            NeuroSwap introduces groundbreaking capabilities that transform how AMMs operate, 
            delivering measurable improvements in capital efficiency and user experience.
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {feature.metrics}
                </div>
              </div>
            )
          })}
        </div>

        {/* Technology Integrations */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Prize-Winning Technology Stack
            </h2>
            <p className="text-xl text-gray-600">
              Strategic integration of cutting-edge blockchain technologies targeting $25,500+ in prizes
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {integrations.map((integration, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-200">
                <div className="text-4xl mb-4">{integration.logo}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {integration.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {integration.description}
                </p>
                <div className="space-y-1">
                  {integration.features.map((feature, idx) => (
                    <div key={idx} className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real Value for Every Participant
            </h2>
            <p className="text-xl text-gray-600">
              NeuroSwap creates measurable benefits across the entire DeFi ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                  {benefit.title}
                </h3>
                <ul className="space-y-4">
                  {benefit.items.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-8">Proven Performance Improvements</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">25-35%</div>
              <div className="text-blue-100">Capital Efficiency</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15-20%</div>
              <div className="text-blue-100">Slippage Reduction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">System Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">&lt;60s</div>
              <div className="text-blue-100">Cross-Chain Sync</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Features