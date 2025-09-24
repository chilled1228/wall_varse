"use client"

import React from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; errorInfo: React.ErrorInfo; retry: () => void }>
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)

    // Log error to analytics or monitoring service if available
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Add error logging to your preferred service here
      console.error('Error occurred:', error.message, errorInfo.componentStack)
    }

    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state

      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={error!} errorInfo={errorInfo!} retry={this.handleRetry} />
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full text-center brutalist-border brutalist-shadow bg-card p-8">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-2xl font-black text-card-foreground mb-4">
              SOMETHING WENT WRONG!
            </h2>
            <p className="text-lg font-bold text-muted-foreground mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-left mb-6">
                <summary className="cursor-pointer text-sm font-bold text-muted-foreground mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p><strong>Error:</strong> {error.message}</p>
                  {errorInfo && (
                    <p><strong>Component Stack:</strong></p>
                  )}
                  <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                    {errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}

            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full brutalist-border brutalist-shadow font-black"
              >
                TRY AGAIN
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full brutalist-border font-black"
              >
                GO HOME
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary