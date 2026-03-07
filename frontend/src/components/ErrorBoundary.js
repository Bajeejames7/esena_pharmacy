import { Component } from 'react';
import GlassCard from './GlassCard';
import GlassButton from './forms/GlassButton';

/**
 * Error Boundary component for React error handling
 * Implements Requirements 24.2, 24.5
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error,
      errorInfo
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // Create error report
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      errorId: this.state.errorId
    };

    // In a real application, you would send this to your error tracking service
    // For now, we'll just log it
    console.error('Error Report:', errorReport);

    // You could also store it in localStorage for later transmission
    try {
      const existingErrors = JSON.parse(localStorage.getItem('errorReports') || '[]');
      existingErrors.push(errorReport);
      // Keep only the last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('errorReports', JSON.stringify(recentErrors));
    } catch (storageError) {
      console.error('Failed to store error report:', storageError);
    }
  };

  getUserId = () => {
    // Try to get user ID from localStorage or context
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      }
    } catch (e) {
      // Ignore errors when parsing token
    }
    return null;
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Create mailto link for error reporting
    const subject = encodeURIComponent(`Error Report - ${this.state.errorId}`);
    const body = encodeURIComponent(`
Error Details:
- Error ID: ${errorDetails.errorId}
- Message: ${errorDetails.message}
- Timestamp: ${errorDetails.timestamp}
- URL: ${errorDetails.url}
- Browser: ${errorDetails.userAgent}

Please describe what you were doing when this error occurred:
[Your description here]
    `);

    window.open(`mailto:support@esena-pharmacy.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-glass-blue/10 to-glass-green/10">
          <GlassCard className="max-w-lg w-full p-8 text-center">
            <div className="mb-6">
              <svg 
                className="w-16 h-16 text-red-500 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
                />
              </svg>
              
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Oops! Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-4">
                We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-red-50 p-4 rounded-lg mb-4">
                  <summary className="cursor-pointer font-semibold text-red-700 mb-2">
                    Error Details (Development Mode)
                  </summary>
                  <div className="text-sm text-red-600 font-mono">
                    <p className="mb-2"><strong>Error:</strong> {this.state.error.message}</p>
                    <p className="mb-2"><strong>Error ID:</strong> {this.state.errorId}</p>
                    {this.state.error.stack && (
                      <pre className="whitespace-pre-wrap text-xs bg-red-100 p-2 rounded">
                        {this.state.error.stack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="text-sm text-gray-500 mb-6">
                Error ID: {this.state.errorId}
              </div>
            </div>

            <div className="space-y-3">
              <GlassButton 
                onClick={this.handleReload}
                className="w-full"
                aria-label="Reload the page to try again"
              >
                Try Again
              </GlassButton>
              
              <GlassButton 
                variant="secondary"
                onClick={this.handleGoHome}
                className="w-full"
                aria-label="Go back to the home page"
              >
                Go to Home
              </GlassButton>
              
              <GlassButton 
                variant="outline"
                onClick={this.handleReportError}
                className="w-full"
                aria-label="Report this error to support"
              >
                Report Error
              </GlassButton>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              If this problem persists, please contact our support team.
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;