import React from 'react'
import { cn } from '../../lib/utils'

const Loading = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-spin rounded-full h-8 w-8 border-b-2 border-primary",
        className
      )}
      {...props}
    />
  )
}

const LoadingSpinner = ({ size = "md", className }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  }
  
  return (
    <div className={cn("animate-spin rounded-full border-b-2 border-primary", sizeClasses[size], className)} />
  )
}

const LoadingSkeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  )
}

const LoadingCard = () => {
  return (
    <div className="animate-pulse">
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-8 bg-muted rounded w-1/2"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    </div>
  )
}

export { Loading, LoadingSpinner, LoadingSkeleton, LoadingCard }