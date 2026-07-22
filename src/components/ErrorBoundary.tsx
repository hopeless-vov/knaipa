import React from 'react';
import { logError } from '../utils/logger';
import ErrorFallback from './ErrorFallback';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render/lifecycle errors anywhere below it so a single thrown
 * component doesn't blank the whole app. Shows a recoverable fallback and logs
 * the error (single seam for a crash reporter later).
 */
export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    logError('Unhandled UI error', error);
  }

  private reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) return <ErrorFallback onRetry={this.reset} />;
    return this.props.children;
  }
}
