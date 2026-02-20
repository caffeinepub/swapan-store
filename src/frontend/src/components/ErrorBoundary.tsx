import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const timestamp = new Date().toISOString();
    console.error(`[ErrorBoundary ${timestamp}] Caught error:`, error);
    console.error(`[ErrorBoundary ${timestamp}] Error name:`, error.name);
    console.error(`[ErrorBoundary ${timestamp}] Error message:`, error.message);
    console.error(`[ErrorBoundary ${timestamp}] Error stack:`, error.stack);
    console.error(`[ErrorBoundary ${timestamp}] Component stack:`, errorInfo.componentStack);
    console.error(`[ErrorBoundary ${timestamp}] Error info:`, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    console.log('[ErrorBoundary] Resetting error state');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    console.log('[ErrorBoundary] Reloading page');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="w-full max-w-2xl space-y-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Something went wrong</h1>
            </div>
            
            <div className="space-y-4 rounded-lg border border-destructive/50 bg-destructive/10 p-6">
              <div>
                <h2 className="mb-2 font-semibold">Error Details:</h2>
                <p className="text-sm font-mono text-destructive">
                  {this.state.error?.name}: {this.state.error?.message}
                </p>
              </div>
              
              {this.state.error?.stack && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Stack Trace:</h3>
                  <pre className="max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}
              
              {this.state.errorInfo?.componentStack && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold">Component Stack:</h3>
                  <pre className="max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={this.handleReset} variant="default">
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline">
                Reload Page
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              If this problem persists, please check the browser console for more details or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
