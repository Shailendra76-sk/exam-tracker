import React, { Component, type ErrorInfo, type ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

type ErrorBoundaryState = {
  hasError: boolean
  message: string
}

class AppErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'Unknown application error',
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Field Log render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl">
            <h1 className="text-xl font-bold text-rose-300">
              Field Log could not render
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Application runtime error detect hua hai.
            </p>
            <pre className="mt-4 max-h-48 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-500 whitespace-pre-wrap">
              {this.state.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400"
            >
              Reload App
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
)
