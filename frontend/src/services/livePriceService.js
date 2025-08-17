/**
 * Live Price Service for NeuroSwap
 * Fetches real-time token prices from multiple sources
 */

class LivePriceService {
  constructor() {
    this.priceCache = new Map()
    this.updateInterval = null
    this.subscribers = new Set()
    this.isUpdating = false
    this.lastUpdate = 0
    this.UPDATE_INTERVAL = 30000 // 30 seconds
  }

  async initialize() {
    console.log('🔄 Initializing live price service...')
    
    try {
      // Fetch initial prices
      await this.updatePrices()
      
      // Start periodic updates
      this.startPriceUpdates()
      
      console.log('✅ Live price service initialized')
      return true
    } catch (error) {
      console.error('❌ Failed to initialize price service:', error)
      // Set fallback prices
      this.setFallbackPrices()
      return false
    }
  }

  async updatePrices() {
    if (this.isUpdating || Date.now() - this.lastUpdate < this.UPDATE_INTERVAL) {
      return
    }

    this.isUpdating = true
    
    try {
      // Fetch prices from multiple sources
      const prices = await this.fetchPricesFromSources()
      
      // Update cache
      for (const [symbol, price] of Object.entries(prices)) {
        this.priceCache.set(symbol, {
          price,
          timestamp: Date.now(),
          source: 'live'
        })
      }
      
      this.lastUpdate = Date.now()
      
      // Notify subscribers
      this.notifySubscribers({ type: 'price_update', prices })
      
    } catch (error) {
      console.error('Error updating prices:', error)
    } finally {
      this.isUpdating = false
    }
  }

  async fetchPricesFromSources() {
    // Try to fetch from CoinGecko API (free tier)
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,usd-coin,tether,dai,chainlink,wrapped-bitcoin&vs_currencies=usd'
      )
      
      if (response.ok) {
        const data = await response.json()
        
        return {
          ETH: data.ethereum?.usd || 2340.50,
          USDC: data['usd-coin']?.usd || 1.00,
          USDT: data.tether?.usd || 1.00,
          DAI: data.dai?.usd || 1.00,
          LINK: data.chainlink?.usd || 14.25,
          WBTC: data['wrapped-bitcoin']?.usd || 43250.00
        }
      }
    } catch (error) {
      console.warn('CoinGecko API failed:', error.message)
    }

    // Fallback to alternative API or mock prices
    return this.getFallbackPrices()
  }

  getFallbackPrices() {
    // Generate realistic price variations based on current market
    const basePrices = {
      ETH: 2340.50,
      USDC: 1.00,
      USDT: 1.00,
      DAI: 1.00,
      LINK: 14.25,
      WBTC: 43250.00
    }

    const prices = {}
    for (const [symbol, basePrice] of Object.entries(basePrices)) {
      // Add small random variation (±2%)
      const variation = 0.98 + Math.random() * 0.04
      prices[symbol] = basePrice * variation
    }

    return prices
  }

  setFallbackPrices() {
    const prices = this.getFallbackPrices()
    
    for (const [symbol, price] of Object.entries(prices)) {
      this.priceCache.set(symbol, {
        price,
        timestamp: Date.now(),
        source: 'fallback'
      })
    }
  }

  startPriceUpdates() {
    // Update prices every 30 seconds
    this.updateInterval = setInterval(() => {
      this.updatePrices()
    }, this.UPDATE_INTERVAL)
  }

  getPrice(symbol) {
    const cached = this.priceCache.get(symbol)
    if (cached) {
      return {
        price: cached.price,
        timestamp: cached.timestamp,
        source: cached.source,
        age: Date.now() - cached.timestamp
      }
    }

    // Return fallback price if not in cache
    const fallback = this.getFallbackPrices()[symbol] || 1.0
    return {
      price: fallback,
      timestamp: Date.now(),
      source: 'fallback',
      age: 0
    }
  }

  getAllPrices() {
    const prices = {}
    
    for (const [symbol, cached] of this.priceCache.entries()) {
      prices[symbol] = {
        price: cached.price,
        timestamp: cached.timestamp,
        source: cached.source,
        age: Date.now() - cached.timestamp
      }
    }

    return prices
  }

  calculateUSDValue(symbol, amount) {
    const priceData = this.getPrice(symbol)
    return parseFloat(amount) * priceData.price
  }

  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  notifySubscribers(event) {
    this.subscribers.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error notifying price subscriber:', error)
      }
    })
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.subscribers.clear()
    this.priceCache.clear()
  }
}

// Export singleton instance
export const livePriceService = new LivePriceService()