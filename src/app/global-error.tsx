"use client"

// Global error boundary for the App Router.
// This replaces Next's builtin global-error to avoid the RSC client-manifest issue
// and gives us a graceful fallback with a reset action.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body style={{ background: '#000', color: '#fff' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 480 }}>
            <div style={{
              padding: 16,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, marginBottom: 8 }}>Une erreur est survenue</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 0 }}>Désolé, un problème est survenu lors du chargement de la page.</p>
              {process.env.NODE_ENV !== 'production' && (
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 12 }}>{String(error?.message || '')}</pre>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  onClick={() => reset()}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'linear-gradient(135deg, #FF6B9D 0%, #B794F6 100%)',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  Réessayer
                </button>
                <a href="/" style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}>Accueil</a>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

