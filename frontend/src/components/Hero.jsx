import React from 'react'
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Globe,
  ArrowRight,
  Play
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Card, CardContent } from './ui/card'

const Hero = ({ setCurrentPage }) => {
  return (
    <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="text-center max-w-5xl mx-auto">
          {/* Badge */}
          <Badge variant="ai" className="mb-8 px-4 py-2 text-sm font-medium bg-white/10 backdrop-blur-md border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>
            🏆 ETHGlobal NYC 2025 - Live Demo
          </Badge>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="flex items-center justify-center space-x-4 mb-2">
              <Brain className="h-16 w-16 md:h-20 md:w-20 text-blue-400" />
              <span className="text-gradient bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                NeuroSwap
              </span>
            </span>
            <span className="text-3xl md:text-4xl text-blue-100 font-light">
              AI-Driven Autonomous Market Maker
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            The world's first truly autonomous cross-chain AMM that uses advanced AI to optimize liquidity parameters in real-time, delivering 
            <span className="text-green-400 font-semibold"> 25-35% better capital efficiency</span> than traditional AMMs.
          </p>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">25-35%</div>
              <div className="text-sm text-blue-200">Capital Efficiency Gain</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">5+</div>
              <div className="text-sm text-blue-200">Blockchain Networks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400">99.9%</div>
              <div className="text-sm text-blue-200">Autonomous Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">$25K+</div>
              <div className="text-sm text-blue-200">Prize Target</div>
            </div>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              onClick={() => setCurrentPage('dashboard')}
              variant="gradient"
              size="xl"
              className="transform hover:scale-105"
            >
              <Play className="h-5 w-5 mr-2" />
              View Live Demo
            </Button>
            
            <Button
              onClick={() => setCurrentPage('ai-metrics')}
              variant="outline"
              size="xl"
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 text-white hover:text-white"
            >
              <Brain className="h-5 w-5 mr-2" />
              AI Performance
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {/* Technology Showcase */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { emoji: '🔥', name: 'Flare Network', desc: 'FTSO Oracles' },
              { emoji: '⚡', name: 'LayerZero', desc: 'Omnichain' },
              { emoji: '🔗', name: 'Chainlink', desc: 'CCIP' },
              { emoji: '🟣', name: 'Zircuit', desc: 'AI-Optimized' },
              { emoji: '🌐', name: 'Hedera', desc: 'AI Consensus' }
            ].map((tech, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20 text-center">
                <CardContent className="p-4">
                  <div className="text-2xl mb-2">{tech.emoji}</div>
                  <div className="text-sm font-medium text-white">{tech.name}</div>
                  <div className="text-xs text-blue-200">{tech.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default Hero