/**
 * Advanced Market Analysis Service
 * Implements volatility prediction, sentiment analysis, and trend detection
 */

import axios from 'axios';
import { Matrix } from 'ml-matrix';
import { evaluate, round } from 'mathjs';

export class MarketAnalyzer {
    constructor(config = {}) {
        this.config = {
            historicalDataPoints: 100,
            volatilityWindow: 20,
            trendAnalysisWindow: 50,
            sentimentSources: ['coingecko', 'defipulse'],
            updateInterval: 30000, // 30 seconds
            ...config
        };
        
        this.marketData = new Map();
        this.volatilityHistory = new Map();
        this.sentimentData = new Map();
        this.trendIndicators = new Map();
        
        console.log('🔍 Market Analyzer initialized with advanced analytics');
    }

    /**
     * Comprehensive market analysis combining multiple factors
     */
    async performComprehensiveAnalysis(assets) {
        const analysis = {
            timestamp: Date.now(),
            assets: new Map(),
            marketOverview: {},
            recommendations: new Map(),
            riskMetrics: {},
            confidence: 0
        };

        try {
            console.log('📊 Starting comprehensive market analysis...');
            
            for (const asset of assets) {
                const assetAnalysis = await this.analyzeAsset(asset);
                analysis.assets.set(asset, assetAnalysis);
            }
            
            // Generate market overview
            analysis.marketOverview = this.generateMarketOverview(analysis.assets);
            
            // Create trading recommendations
            analysis.recommendations = this.generateRecommendations(analysis.assets);
            
            // Calculate risk metrics
            analysis.riskMetrics = this.calculateRiskMetrics(analysis.assets);
            
            // Compute overall confidence
            analysis.confidence = this.calculateConfidence(analysis);
            
            console.log('✅ Comprehensive analysis complete:', {
                assets: assets.length,
                marketTrend: analysis.marketOverview.trend,
                avgVolatility: analysis.marketOverview.avgVolatility?.toFixed(4),
                confidence: analysis.confidence.toFixed(2)
            });
            
            return analysis;
            
        } catch (error) {
            console.error('❌ Error in comprehensive analysis:', error);
            throw error;
        }
    }

    /**
     * Deep analysis of individual asset
     */
    async analyzeAsset(asset) {
        const assetData = {
            symbol: asset,
            price: 0,
            volatility: 0,
            trend: 'NEUTRAL',
            sentiment: 0,
            volume: 0,
            technicalIndicators: {},
            prediction: {}
        };

        try {
            // Fetch current price and volume data
            const priceData = await this.fetchPriceData(asset);
            assetData.price = priceData.price;
            assetData.volume = priceData.volume;
            
            // Calculate volatility metrics
            assetData.volatility = await this.calculateVolatility(asset, priceData.history);
            
            // Determine price trend
            assetData.trend = this.analyzeTrend(priceData.history);
            
            // Fetch sentiment data
            assetData.sentiment = await this.analyzeSentiment(asset);
            
            // Calculate technical indicators
            assetData.technicalIndicators = this.calculateTechnicalIndicators(priceData.history);
            
            // Generate price prediction
            assetData.prediction = this.predictPriceMovement(asset, priceData.history);
            
            return assetData;
            
        } catch (error) {
            console.error(`❌ Error analyzing asset ${asset}:`, error);
            return assetData; // Return default data
        }
    }

    /**
     * Fetch real-time price data (simulated for demo)
     */
    async fetchPriceData(asset) {
        try {
            // In production, this would fetch from real APIs like CoinGecko, Chainlink, etc.
            const basePrice = this.getBasePrice(asset);
            const history = this.generatePriceHistory(asset, basePrice);
            
            return {
                price: history[history.length - 1],
                volume: Math.random() * 10000000 + 1000000,
                history: history,
                marketCap: basePrice * (Math.random() * 1000000000 + 100000000)
            };
            
        } catch (error) {
            console.error(`❌ Error fetching price data for ${asset}:`, error);
            throw error;
        }
    }

    /**
     * Calculate asset volatility using multiple methods
     */
    async calculateVolatility(asset, priceHistory) {
        if (priceHistory.length < 2) return 0;
        
        try {
            // Standard deviation method
            const returns = [];
            for (let i = 1; i < priceHistory.length; i++) {
                const returnRate = (priceHistory[i] - priceHistory[i-1]) / priceHistory[i-1];
                returns.push(returnRate);
            }
            
            const mean = returns.reduce((a, b) => a + b) / returns.length;
            const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
            const volatility = Math.sqrt(variance);
            
            // Store in history for trend analysis
            if (!this.volatilityHistory.has(asset)) {
                this.volatilityHistory.set(asset, []);
            }
            this.volatilityHistory.get(asset).push({
                value: volatility,
                timestamp: Date.now()
            });
            
            // Keep only recent data
            const history = this.volatilityHistory.get(asset);
            if (history.length > this.config.historicalDataPoints) {
                history.shift();
            }
            
            return volatility;
            
        } catch (error) {
            console.error(`❌ Error calculating volatility for ${asset}:`, error);
            return 0;
        }
    }

    /**
     * Analyze price trend using multiple timeframes
     */
    analyzeTrend(priceHistory) {
        if (priceHistory.length < 3) return 'NEUTRAL';
        
        try {
            const shortTerm = priceHistory.slice(-5); // Last 5 points
            const mediumTerm = priceHistory.slice(-20); // Last 20 points
            const longTerm = priceHistory.slice(-50); // Last 50 points
            
            const shortTrend = this.calculateLinearTrend(shortTerm);
            const mediumTrend = this.calculateLinearTrend(mediumTerm);
            const longTrend = this.calculateLinearTrend(longTerm);
            
            // Weighted trend decision
            const trendScore = (shortTrend * 0.5) + (mediumTrend * 0.3) + (longTrend * 0.2);
            
            if (trendScore > 0.02) return 'BULLISH';
            if (trendScore < -0.02) return 'BEARISH';
            return 'NEUTRAL';
            
        } catch (error) {
            console.error('❌ Error analyzing trend:', error);
            return 'NEUTRAL';
        }
    }

    /**
     * Sentiment analysis from multiple sources
     */
    async analyzeSentiment(asset) {
        try {
            // Simulated sentiment data (would integrate with real sentiment APIs)
            const sentimentSources = [
                Math.random() * 2 - 1, // Social media sentiment (-1 to 1)
                Math.random() * 2 - 1, // News sentiment
                Math.random() * 2 - 1  // Technical sentiment
            ];
            
            const avgSentiment = sentimentSources.reduce((a, b) => a + b) / sentimentSources.length;
            
            // Store sentiment history
            if (!this.sentimentData.has(asset)) {
                this.sentimentData.set(asset, []);
            }
            this.sentimentData.get(asset).push({
                value: avgSentiment,
                timestamp: Date.now()
            });
            
            return round(avgSentiment, 3);
            
        } catch (error) {
            console.error(`❌ Error analyzing sentiment for ${asset}:`, error);
            return 0;
        }
    }

    /**
     * Calculate technical indicators (RSI, MACD, Bollinger Bands)
     */
    calculateTechnicalIndicators(priceHistory) {
        const indicators = {
            rsi: 50,
            macd: 0,
            bollingerBands: { upper: 0, middle: 0, lower: 0 },
            movingAverages: { ma20: 0, ma50: 0 }
        };

        try {
            if (priceHistory.length < 20) return indicators;
            
            // RSI calculation
            indicators.rsi = this.calculateRSI(priceHistory);
            
            // Moving averages
            indicators.movingAverages.ma20 = this.calculateMA(priceHistory, 20);
            if (priceHistory.length >= 50) {
                indicators.movingAverages.ma50 = this.calculateMA(priceHistory, 50);
            }
            
            // Bollinger Bands
            indicators.bollingerBands = this.calculateBollingerBands(priceHistory);
            
            return indicators;
            
        } catch (error) {
            console.error('❌ Error calculating technical indicators:', error);
            return indicators;
        }
    }

    /**
     * Predict price movement using simple machine learning
     */
    predictPriceMovement(asset, priceHistory) {
        const prediction = {
            direction: 'NEUTRAL',
            confidence: 0,
            targetPrice: 0,
            timeframe: '1h'
        };

        try {
            if (priceHistory.length < 10) return prediction;
            
            const currentPrice = priceHistory[priceHistory.length - 1];
            const features = this.extractFeatures(priceHistory);
            
            // Simple prediction based on trends and volatility
            const trendStrength = features.trend;
            const volatility = features.volatility;
            
            if (trendStrength > 0.01) {
                prediction.direction = 'UP';
                prediction.confidence = Math.min(trendStrength * 10, 0.9);
                prediction.targetPrice = currentPrice * (1 + trendStrength);
            } else if (trendStrength < -0.01) {
                prediction.direction = 'DOWN';
                prediction.confidence = Math.min(Math.abs(trendStrength) * 10, 0.9);
                prediction.targetPrice = currentPrice * (1 + trendStrength);
            } else {
                prediction.direction = 'NEUTRAL';
                prediction.confidence = 0.3;
                prediction.targetPrice = currentPrice;
            }
            
            return prediction;
            
        } catch (error) {
            console.error(`❌ Error predicting price movement for ${asset}:`, error);
            return prediction;
        }
    }

    /**
     * Helper functions
     */
    generateMarketOverview(assetsAnalysis) {
        const overview = {
            trend: 'NEUTRAL',
            avgVolatility: 0,
            bullishAssets: 0,
            bearishAssets: 0,
            neutralAssets: 0,
            highRiskAssets: []
        };

        let totalVolatility = 0;
        let assetCount = 0;

        for (const [asset, data] of assetsAnalysis) {
            totalVolatility += data.volatility;
            assetCount++;

            switch (data.trend) {
                case 'BULLISH':
                    overview.bullishAssets++;
                    break;
                case 'BEARISH':
                    overview.bearishAssets++;
                    break;
                default:
                    overview.neutralAssets++;
            }

            if (data.volatility > 0.1) {
                overview.highRiskAssets.push(asset);
            }
        }

        overview.avgVolatility = totalVolatility / assetCount;

        // Determine overall market trend
        if (overview.bullishAssets > overview.bearishAssets * 1.5) {
            overview.trend = 'BULLISH';
        } else if (overview.bearishAssets > overview.bullishAssets * 1.5) {
            overview.trend = 'BEARISH';
        }

        return overview;
    }

    generateRecommendations(assetsAnalysis) {
        const recommendations = new Map();

        for (const [asset, data] of assetsAnalysis) {
            let recommendation = 'HOLD';
            let reasoning = [];

            // Trend-based recommendation
            if (data.trend === 'BULLISH' && data.sentiment > 0.3) {
                recommendation = 'INCREASE_WEIGHT';
                reasoning.push('Strong bullish trend with positive sentiment');
            } else if (data.trend === 'BEARISH' && data.sentiment < -0.3) {
                recommendation = 'DECREASE_WEIGHT';
                reasoning.push('Bearish trend with negative sentiment');
            }

            // Volatility-based recommendation
            if (data.volatility > 0.15) {
                recommendation = 'INCREASE_FEES';
                reasoning.push('High volatility detected');
            } else if (data.volatility < 0.05) {
                recommendation = 'DECREASE_FEES';
                reasoning.push('Low volatility environment');
            }

            recommendations.set(asset, {
                action: recommendation,
                reasoning: reasoning,
                confidence: this.calculateRecommendationConfidence(data)
            });
        }

        return recommendations;
    }

    calculateRiskMetrics(assetsAnalysis) {
        const metrics = {
            portfolioVolatility: 0,
            maxDrawdown: 0,
            riskScore: 0,
            diversificationRatio: 0
        };

        const volatilities = Array.from(assetsAnalysis.values()).map(data => data.volatility);
        
        // Portfolio volatility (simplified)
        metrics.portfolioVolatility = Math.sqrt(
            volatilities.reduce((sum, vol) => sum + vol * vol, 0) / volatilities.length
        );

        // Risk score based on multiple factors
        metrics.riskScore = Math.min(metrics.portfolioVolatility * 10, 1.0);

        return metrics;
    }

    calculateConfidence(analysis) {
        let confidence = 0.5; // Base confidence
        
        // Increase confidence based on data quality
        const dataQuality = analysis.assets.size / 10; // More assets = higher confidence
        confidence += dataQuality * 0.2;
        
        // Adjust based on market volatility
        const avgVolatility = analysis.marketOverview.avgVolatility || 0;
        if (avgVolatility < 0.05) {
            confidence += 0.2; // More confident in low volatility
        } else if (avgVolatility > 0.2) {
            confidence -= 0.1; // Less confident in high volatility
        }
        
        return Math.min(Math.max(confidence, 0), 1);
    }

    // Technical indicator calculations
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;
        
        let gains = 0, losses = 0;
        for (let i = prices.length - period; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    calculateMA(prices, period) {
        if (prices.length < period) return prices[prices.length - 1];
        
        const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }

    calculateBollingerBands(prices, period = 20) {
        const ma = this.calculateMA(prices, period);
        const variance = prices.slice(-period).reduce((sum, price) => {
            return sum + Math.pow(price - ma, 2);
        }, 0) / period;
        const stdDev = Math.sqrt(variance);
        
        return {
            upper: ma + (2 * stdDev),
            middle: ma,
            lower: ma - (2 * stdDev)
        };
    }

    calculateLinearTrend(prices) {
        if (prices.length < 2) return 0;
        
        const n = prices.length;
        const x = Array.from({length: n}, (_, i) => i);
        const y = prices;
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope / (sumY / n); // Normalize by average price
    }

    extractFeatures(priceHistory) {
        return {
            trend: this.calculateLinearTrend(priceHistory.slice(-10)),
            volatility: this.calculateVolatility('temp', priceHistory),
            momentum: (priceHistory[priceHistory.length - 1] - priceHistory[priceHistory.length - 5]) / priceHistory[priceHistory.length - 5]
        };
    }

    calculateRecommendationConfidence(assetData) {
        let confidence = 0.5;
        
        // Higher confidence with strong trends
        if (Math.abs(assetData.sentiment) > 0.5) confidence += 0.2;
        
        // Lower confidence with high volatility
        if (assetData.volatility > 0.1) confidence -= 0.2;
        
        return Math.min(Math.max(confidence, 0), 1);
    }

    getBasePrice(asset) {
        const basePrices = {
            'ETH': 3000,
            'BTC': 45000,
            'USDC': 1.00,
            'USDT': 1.00,
            'DAI': 1.00,
            'LINK': 15,
            'UNI': 8
        };
        return basePrices[asset] || 100;
    }

    generatePriceHistory(asset, basePrice, points = 100) {
        const history = [];
        let price = basePrice;
        
        for (let i = 0; i < points; i++) {
            // Random walk with slight trend
            const change = (Math.random() - 0.48) * 0.05; // Slight upward bias
            price = price * (1 + change);
            history.push(price);
        }
        
        return history;
    }
}