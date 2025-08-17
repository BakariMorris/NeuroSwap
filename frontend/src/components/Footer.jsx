import React from 'react'
import { 
  Brain, 
  Github, 
  Twitter, 
  Globe,
  Mail,
  ExternalLink
} from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const links = {
    project: [
      { name: 'Documentation', href: '#' },
      { name: 'Whitepaper', href: '#' },
      { name: 'GitHub Repository', href: '#' },
      { name: 'Audit Reports', href: '#' }
    ],
    technology: [
      { name: 'AI Architecture', href: '#' },
      { name: 'Cross-Chain Bridge', href: '#' },
      { name: 'Smart Contracts', href: '#' },
      { name: 'Risk Management', href: '#' }
    ],
    community: [
      { name: 'Discord', href: '#' },
      { name: 'Telegram', href: '#' },
      { name: 'Twitter', href: '#' },
      { name: 'Medium Blog', href: '#' }
    ],
    sponsors: [
      { name: 'Flare Network', href: 'https://flare.network' },
      { name: 'LayerZero', href: 'https://layerzero.network' },
      { name: 'Chainlink', href: 'https://chain.link' },
      { name: 'Zircuit', href: 'https://zircuit.com' },
      { name: 'Hedera', href: 'https://hedera.com' }
    ]
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Brain className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">NeuroSwap</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The world's first AI-driven autonomous market maker, delivering 25-35% better capital efficiency 
              through advanced machine learning and cross-chain optimization.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Project Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Project</h3>
            <ul className="space-y-2">
              {links.project.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Technology Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Technology</h3>
            <ul className="space-y-2">
              {links.technology.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              {links.community.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sponsor Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Powered By</h3>
            <ul className="space-y-2">
              {links.sponsors.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center space-x-1"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ETHGlobal Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-2">🏆 ETHGlobal NYC 2025 Submission</h3>
            <p className="text-blue-100 mb-4">
              Targeting $25,500+ in prizes across Flare, LayerZero, Chainlink CCIP, Zircuit, and Hedera tracks
            </p>
            <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-xs">Flare</div>
                <div className="text-xs text-blue-200">$8,000</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs">LayerZero</div>
                <div className="text-xs text-blue-200">$6,000</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🔗</div>
                <div className="text-xs">Chainlink</div>
                <div className="text-xs text-blue-200">$6,000</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🟣</div>
                <div className="text-xs">Zircuit</div>
                <div className="text-xs text-blue-200">$5,500</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🌐</div>
                <div className="text-xs">Hedera</div>
                <div className="text-xs text-blue-200">$3,500</div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-green-400 mb-1">25-35%</div>
              <div className="text-sm text-gray-400">Capital Efficiency Improvement</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-1">5+</div>
              <div className="text-sm text-gray-400">Blockchain Networks</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-1">99.9%</div>
              <div className="text-sm text-gray-400">Autonomous Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">24/7</div>
              <div className="text-sm text-gray-400">AI Optimization</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} NeuroSwap. Built for ETHGlobal NYC 2025. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Risk Disclosure</a>
            </div>
          </div>
        </div>

        {/* Development Notice */}
        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
          <div className="text-center text-yellow-300 text-sm">
            ⚠️ <strong>Demo Version</strong> - This is a prototype developed for ETHGlobal NYC 2025. 
            Not intended for production use with real funds.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer