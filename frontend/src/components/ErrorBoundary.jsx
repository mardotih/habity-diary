import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-ink-50 dark:bg-ink-950">
          <div className="text-center max-w-md animate-fade-in">
            <div className="text-6xl mb-6">💥</div>
            <h1 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100 mb-3">
              Algo correu mal
            </h1>
            <p className="text-ink-500 dark:text-ink-400 font-body text-sm mb-8">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button onClick={() => window.location.reload()}
              className="btn-primary inline-flex items-center gap-2">
              🔄 Recarregar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
