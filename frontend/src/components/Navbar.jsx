import React, { useState } from 'react'
import { 
  Brain, 
  BarChart3, 
  Zap, 
  Shield, 
  Activity,
  Menu,
  X,
  Globe,
  ArrowLeftRight
} from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { cn } from '../lib/utils'

const Navbar = ({ currentPage, setCurrentPage, isConnected, aiStatus, emergencyMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'ai-metrics', label: 'AI Metrics', icon: Brain },
    { id: 'trading', label: 'Trading', icon: ArrowLeftRight },
    { id: 'bridge', label: 'Cross-Chain', icon: Globe },
    { id: 'monitor', label: 'Monitor', icon: Activity },
    { id: 'emergency', label: 'Emergency', icon: Shield },
    { id: 'test', label: 'CSS Test', icon: Zap },
  ]

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId)
    setIsMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className="relative">
              <Brain className="h-8 w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">NeuroSwap</h1>
              <p className="text-xs text-gray-500 -mt-1">AI-Driven AMM</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              const isEmergencyItem = item.id === 'emergency'
              
              return (
                <Button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex items-center space-x-2",
                    isEmergencyItem && emergencyMode && isActive && "bg-red-100 text-red-700 hover:bg-red-200",
                    isEmergencyItem && emergencyMode && !isActive && "text-red-600 hover:bg-red-50 hover:text-red-700"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4",
                    isEmergencyItem && emergencyMode && "animate-pulse"
                  )} />
                  <span className="hidden lg:block">{item.label}</span>
                  {isEmergencyItem && emergencyMode && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </Button>
              )
            })}
          </div>

          {/* AI Status & Connection */}
          <div className="hidden md:flex items-center space-x-4">
            {/* AI Status Indicator */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                isConnected 
                  ? emergencyMode 
                    ? 'bg-red-500 animate-pulse' 
                    : 'bg-green-500 animate-pulse'
                  : 'bg-gray-400'
              }`}></div>
              <span className="text-sm text-gray-600">
                {isConnected 
                  ? emergencyMode 
                    ? 'Emergency' 
                    : 'AI Active'
                  : 'Offline'
                }
              </span>
            </div>

            {/* Performance Indicator */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>{aiStatus?.optimization?.efficiency || 'N/A'}%</span>
            </div>

            {/* Demo Badge */}
            <Badge variant="ai" className="text-xs">
              🏆 ETHGlobal Demo
            </Badge>
          </div>

          {/* Mobile Menu Button */}
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant="ghost"
            size="icon"
            className="md:hidden"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                const isEmergencyItem = item.id === 'emergency'
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? isEmergencyItem && emergencyMode
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                        : isEmergencyItem && emergencyMode
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${
                      isEmergencyItem && emergencyMode ? 'animate-pulse' : ''
                    }`} />
                    <span className="font-medium">{item.label}</span>
                    {isEmergencyItem && emergencyMode && (
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Mobile Status */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isConnected 
                      ? emergencyMode 
                        ? 'bg-red-500 animate-pulse' 
                        : 'bg-green-500 animate-pulse'
                      : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    AI {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-medium rounded-full">
                  Demo
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar