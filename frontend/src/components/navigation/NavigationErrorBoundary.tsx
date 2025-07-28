'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FallbackNavigation } from './FallbackNavigation';
import { UserData } from '@/utils/auth';

interface Props {
  children: ReactNode;
  user: UserData;
  onLogout: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class NavigationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Navigation Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when navigation fails
      return (
        <div className="min-h-screen bg-gray-50">
          <FallbackNavigation 
            user={this.props.user} 
            onLogout={this.props.onLogout} 
          />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Navigation System Temporarily Unavailable
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        The dynamic navigation system is currently experiencing issues. 
                        You can still navigate using the basic navigation above.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {this.props.children}
            </div>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
} 