import { Component } from 'react';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ShopOra render error boundary caught an error.', error, info);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ padding: '4rem 1.5rem' }}>
          <div className="empty-state" role="alert">
            <h1>ShopOra hit an error</h1>
            <p>Something in the page render failed, but the app stayed mounted.</p>
            {this.state.error?.message ? <p className="auth-message auth-message-error">{this.state.error.message}</p> : null}
            <button type="button" className="btn btn-dark" onClick={this.handleRetry}>
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
