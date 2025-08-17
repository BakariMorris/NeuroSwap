import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { cn } from '../lib/utils'

const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue', 
  subtitle,
  isInverse = false 
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    indigo: 'text-indigo-600 bg-indigo-100',
    emerald: 'text-emerald-600 bg-emerald-100',
    red: 'text-red-600 bg-red-100',
  }

  const isPositiveChange = isInverse ? change < 0 : change > 0
  const changeColor = isPositiveChange ? 'text-green-600' : 'text-red-600'
  const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={cn("p-3 rounded-full", colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        {change !== undefined && (
          <div className="flex items-center space-x-1 mt-4">
            <TrendIcon className={cn("h-4 w-4", changeColor)} />
            <span className={cn("text-sm font-medium", changeColor)}>
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-sm text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MetricCard