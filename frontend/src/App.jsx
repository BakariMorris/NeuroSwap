import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Components
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import AIMetrics from './components/AIMetrics'
import TradingInterface from './components/TradingInterface'
import CrossChainBridge from './components/CrossChainBridge'
import PerformanceMonitor from './components/PerformanceMonitor'
import EmergencyStatus from './components/EmergencyStatus'
import Hero from './components/Hero'
import Features from './components/Features'
import Footer from './components/Footer'
import Test from './Test'

// Services
import { mockDataService } from './services/mockData'

// Hooks
import { useAIOrchestrator } from './hooks/useAIOrchestrator'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [systemData, setSystemData] = useState(null)
  
  const {
    aiStatus,
    isConnected,
    connectAI,
    disconnectAI,
    emergencyMode,
    lastOptimization
  } = useAIOrchestrator()

  useEffect(() => {
    // Initialize the application
    const initializeApp = async () => {
      try {
        setIsLoading(true)
        
        // Simulate loading time for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Initialize mock data service
        const initialData = await mockDataService.initialize()
        setSystemData(initialData)
        
        // Auto-connect to AI orchestrator
        await connectAI()
        
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize app:', error)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [connectAI])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-4">
              🧠 <span className="text-gradient">NeuroSwap</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              AI-Driven Autonomous Market Maker
            </p>
          </div>
          
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-400 border-b-transparent rounded-full animate-spin-slow mx-auto"></div>
          </div>
          
          <div className="space-y-2 text-blue-200">
            <p className="animate-pulse">🔗 Connecting to 5 blockchain networks...</p>
            <p className="animate-pulse delay-300">🤖 Initializing AI orchestrator...</p>
            <p className="animate-pulse delay-500">📊 Loading market data...</p>
            <p className="animate-pulse delay-700">⚡ Activating emergency protocols...</p>
            <p className="animate-pulse delay-1000">🚀 System ready!</p>
          </div>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard systemData={systemData} />
      case 'ai-metrics':
        return <AIMetrics aiStatus={aiStatus} lastOptimization={lastOptimization} />
      case 'trading':
        return <TradingInterface />
      case 'bridge':
        return <CrossChainBridge />
      case 'monitor':
        return <PerformanceMonitor systemData={systemData} />
      case 'emergency':
        return <EmergencyStatus emergencyMode={emergencyMode} />
      case 'test':
        return <Test />
      default:
        return <Dashboard systemData={systemData} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
        }}
      />
      
      <Navbar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isConnected={isConnected}
        aiStatus={aiStatus}
        emergencyMode={emergencyMode}
      />
      
      <main className="pt-16">
        {currentPage === 'home' ? (
          <>
            <Hero setCurrentPage={setCurrentPage} />
            <Features />
          </>
        ) : (
          <div className="container mx-auto px-4 py-6">
            {renderPage()}
          </div>
        )}
      </main>
      
      {currentPage === 'home' && <Footer />}
      
      {/* AI Status Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 transition-all duration-200 ${
          isConnected 
            ? emergencyMode 
              ? 'bg-red-100 text-red-800 border border-red-300' 
              : 'bg-green-100 text-green-800 border border-green-300'
            : 'bg-gray-100 text-gray-800 border border-gray-300'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            isConnected 
              ? emergencyMode 
                ? 'bg-red-500 animate-pulse' 
                : 'bg-green-500 animate-pulse'
              : 'bg-gray-400'
          }`}></div>
          <span>
            {isConnected 
              ? emergencyMode 
                ? 'Emergency Mode' 
                : 'AI Connected'
              : 'AI Disconnected'
            }
          </span>
        </div>
      </div>
    </div>
  )
}

export default App