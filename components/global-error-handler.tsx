"use client"

import { useEffect } from 'react'

export default function GlobalErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)

      // Prevent the default handling (which would normally log the error to the console)
      event.preventDefault()

      // You could add additional error reporting here
      if (process.env.NODE_ENV === 'production') {
        // Send error to monitoring service
        console.error('Global error handler caught:', event.reason)
      }
    }

    const handleUnhandledError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error)

      // Prevent the default handling
      event.preventDefault()

      // You could add additional error reporting here
      if (process.env.NODE_ENV === 'production') {
        // Send error to monitoring service
        console.error('Global error handler caught:', event.error)
      }
    }

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleUnhandledError)

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleUnhandledError)
    }
  }, [])

  return null
}