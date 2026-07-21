import React from 'react';
import { Logger } from '../utils/logger';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Explicitly return clean fallback state
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Isolate crash and utilize structured logging
    Logger.error('ErrorBoundary:componentDidCatch', error, { errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh', 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: 'var(--bg-dark)' 
        }}>
          <h2 style={{ color: 'var(--error-red)', marginBottom: '16px' }}>Game State Interrupted</h2>
          <p style={{ color: 'var(--color-text)', marginBottom: '24px' }}>A critical error occurred. The diagnostic details have been securely logged.</p>
          <button 
            className="btn-primary" 
            onClick={() => window.location.reload()}
            style={{ backgroundColor: 'var(--accent-purple)' }}
          >
            Restart Game Session
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
