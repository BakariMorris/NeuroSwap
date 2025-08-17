# NeuroSwap Frontend

A modern, responsive React frontend showcasing the AI-driven autonomous market maker (AIMM) capabilities of NeuroSwap.

## 🎨 Design System

### UI Component Library
Built with **shadcn/ui** components for consistent, accessible, and modern design:

- **Button**: Multiple variants (default, outline, ghost, gradient, success, warning, danger)
- **Card**: Structured content containers with headers, content, and footers
- **Badge**: Status indicators and labels with variant styles
- **Input**: Form inputs with consistent styling and focus states
- **Select**: Dropdown selectors with proper accessibility
- **Progress**: Loading and progress indicators
- **Loading**: Spinners, skeletons, and loading states

### Styling Approach
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Responsive Design**: Mobile-first approach with breakpoint-specific layouts
- **Dark Mode Ready**: Theme system prepared for future dark mode implementation
- **Accessibility**: WCAG 2.1 compliant components with proper ARIA attributes

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── badge.jsx
│   │   ├── input.jsx
│   │   ├── select.jsx
│   │   ├── progress.jsx
│   │   └── loading.jsx
│   ├── Dashboard.jsx       # Main dashboard with AI metrics
│   ├── AIMetrics.jsx       # AI performance monitoring
│   ├── TradingInterface.jsx # AI-optimized trading UI
│   ├── CrossChainBridge.jsx # Cross-chain asset bridging
│   ├── PerformanceMonitor.jsx # System monitoring
│   ├── EmergencyStatus.jsx # Risk management interface
│   ├── Hero.jsx           # Landing page hero section
│   ├── Features.jsx       # Feature showcase
│   └── Footer.jsx         # Site footer
├── lib/
│   └── utils.js           # Utility functions and cn() helper
├── services/
│   └── mockData.js        # Real-time data simulation
└── hooks/
    └── useAIOrchestrator.js # AI system integration hook
```

## 📱 Pages & Features

### Dashboard
- **Real-time Metrics**: TVL, volume, efficiency with live updates
- **AI Performance Charts**: Capital efficiency and trading volume trends
- **Chain Distribution**: Cross-chain liquidity visualization
- **System Status**: All systems operational indicators

### AI Metrics
- **AI Confidence Tracking**: 94.2% average performance
- **Prediction Accuracy**: Breakdown by category (87.5% average)
- **Optimization History**: Recent AI improvements with impact tracking
- **System Resources**: CPU, memory, network monitoring

### Trading Interface
- **AI-Optimized Swaps**: Intelligent routing with price impact reduction
- **Multi-Chain Support**: Trade across 5 blockchain networks
- **Slippage Protection**: Dynamic adjustment based on market conditions
- **Gas Optimization**: 15-30% savings through smart routing

### Cross-Chain Bridge
- **Seamless Asset Bridging**: Move assets across supported networks
- **AI Route Optimization**: Save $1-4 per transaction
- **Real-time Status**: Network health and bridge fee monitoring
- **LayerZero & CCIP Integration**: Dual bridge infrastructure

### Performance Monitor
- **50+ Real-time Metrics**: Comprehensive system monitoring
- **Anomaly Detection**: Statistical analysis with alerts
- **Component Health**: Individual system status tracking
- **Resource Usage**: Predictive maintenance capabilities

### Emergency Status
- **15+ Circuit Breaker Types**: Multi-layer protection systems
- **Threat Detection**: Automated response to security risks
- **Emergency Protocols**: Governance-controlled safety measures
- **Risk Assessment**: Multi-dimensional risk scoring

## 🎯 Design Principles

### Visual Hierarchy
- **Typography Scale**: Consistent font sizes and weights
- **Color System**: Semantic color tokens for status and actions
- **Spacing**: 8px grid system for consistent layouts
- **Elevation**: Shadow layers for depth and focus

### Interaction Design
- **Hover States**: Subtle animations for interactive elements
- **Loading States**: Skeleton screens and spinners for better UX
- **Feedback**: Toast notifications and status indicators
- **Transitions**: Smooth animations for state changes

### Performance
- **Code Splitting**: Lazy-loaded components for faster initial load
- **Optimized Assets**: Compressed images and efficient font loading
- **Caching**: Intelligent data caching and real-time updates
- **Bundle Size**: Minimal dependencies and tree-shaking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm package manager
- Modern browser with ES2022 support

### Installation
```bash
pnpm install
```

### Development
```bash
pnpm run dev
```

### Build
```bash
pnpm run build
```

### Preview
```bash
pnpm run preview
```

## 🎨 Customization

### Theme Configuration
Modify `tailwind.config.js` to customize:
- Color palette and semantic tokens
- Typography scale and font families
- Spacing and sizing scales
- Animation and transition timing

### Component Variants
Extend shadcn/ui components by:
- Adding new variants to `buttonVariants` and `badgeVariants`
- Creating custom component compositions
- Implementing theme-aware color schemes

### Responsive Breakpoints
Configure breakpoints in Tailwind config:
- `sm`: 640px - Mobile landscape
- `md`: 768px - Tablet portrait
- `lg`: 1024px - Tablet landscape / Desktop
- `xl`: 1280px - Large desktop
- `2xl`: 1400px - Extra large desktop

## 📊 Real-time Features

### Live Data Updates
- **5-second intervals**: Metrics refresh every 5 seconds
- **WebSocket Ready**: Architecture prepared for real-time connections
- **Optimistic Updates**: Immediate UI feedback for user actions
- **Error Handling**: Graceful degradation on data fetch failures

### Interactive Charts
- **Recharts Integration**: Responsive, accessible chart components
- **Multiple Chart Types**: Area, line, pie, and bar charts
- **Custom Tooltips**: Rich data visualization on hover
- **Time Range Selection**: 24h, 7d, 30d data periods

## 🔧 Technical Implementation

### State Management
- **React Hooks**: useState, useEffect for local state
- **Custom Hooks**: Reusable logic for AI orchestrator integration
- **Context API**: Global state for theme and user preferences
- **Local Storage**: Persistent user settings and preferences

### Data Fetching
- **Mock Data Service**: Realistic data simulation for demo
- **Error Boundaries**: Graceful error handling and recovery
- **Loading States**: Skeleton screens and progress indicators
- **Retry Logic**: Automatic retry on failed requests

### Accessibility
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: WCAG AA compliant color combinations
- **Focus Management**: Visible focus indicators and logical tab order

## 🏆 ETHGlobal Integration

### Prize Track Showcase
- **Flare Network**: FTSO oracle data integration
- **LayerZero**: Cross-chain messaging demonstration
- **Chainlink CCIP**: Cross-chain communication UI
- **Zircuit**: Primary blockchain integration
- **Hedera**: AI consensus visualization

### Demo Features
- **Interactive Elements**: Live demonstration of AI capabilities
- **Performance Metrics**: Real-world improvement showcases
- **Professional Design**: Institution-ready interface
- **Mobile Responsive**: Works across all device sizes

## 📱 Mobile Experience

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Touch Interactions**: Large touch targets and swipe gestures
- **Collapsed Navigation**: Space-efficient mobile menu
- **Readable Typography**: Optimized font sizes for mobile screens

### Progressive Web App
- **Offline Support**: Service worker for offline functionality
- **App-like Experience**: Native app feel in browser
- **Push Notifications**: Real-time alerts and updates
- **Install Prompt**: Add to home screen capability

---

Built with ❤️ for ETHGlobal NYC 2025 using React, Vite, Tailwind CSS, and shadcn/ui.