import { StrictMode, Component } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@/i18n'
import './index.css'
import { App } from './App'

// ── Top-level error boundary ─────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Miniso Demo] Uncaught error:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ fontFamily: 'monospace', padding: 40, maxWidth: 700 }}>
          <h1 style={{ color: '#e31c1c', fontSize: 24 }}>⚠️ Demo crashed during startup</h1>
          <p style={{ marginTop: 12, color: '#666' }}>Open the browser console for the full stack trace.</p>
          <pre style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8, overflow: 'auto', fontSize: 13 }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button
            style={{ marginTop: 16, padding: '8px 16px', background: '#e31c1c', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}
            onClick={() => { localStorage.clear(); window.location.reload() }}
          >
            Clear localStorage and Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── QueryClient ──────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
})

// ── Mount ────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
)
