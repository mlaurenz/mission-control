// app/layout.tsx - Mission Control Layout (Clean Style - White bg)
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>{`
          @keyframes blockedPulse {
            0%, 100% { box-shadow: 0 0 0 1px #dc2626, 0 4px 12px rgba(220,38,38,0.15); }
            50% { box-shadow: 0 0 0 4px rgba(220,38,38,0.2), 0 4px 20px rgba(220,38,38,0.3); }
          }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, display: 'flex', minHeight: '100vh', background: '#ffffff' }}>
        {/* Sidebar - Clean */}
        <nav style={{ 
          width: '220px', 
          background: '#fafafa', 
          borderRight: '1px solid #e5e5e5',
          padding: '1.5rem 0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh'
        }}>
          {/* Logo */}
          <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #e5e5e5', marginBottom: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#1a1a1a', fontWeight: 600 }}>🎯 Mission Control</h1>
            <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.7rem' }}>Hermes Operations</p>
            <p style={{ margin: '0.35rem 0 0', color: '#999', fontSize: '0.65rem', fontFamily: 'monospace' }}>
              v{process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev'} · {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
          
          {/* Nav Items */}
          <div style={{ flex: 1, padding: '0 0.75rem' }}>
            <a href="/" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#1a1a1a', 
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: '0.25rem'
            }}>
              📊 Overview
            </a>
            <a href="/agents" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#1a1a1a', 
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: '0.25rem'
            }}>
              🤖 Agents
            </a>
            <a href="/sessions" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#1a1a1a', 
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: '0.25rem'
            }}>
              💬 Sessions
            </a>
            <a href="/tasks" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#1a1a1a', 
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: '0.25rem'
            }}>
              📋 Tasks
            </a>
            <a href="/schedule" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#1a1a1a', 
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: '0.25rem'
            }}>
              ⏰ Schedule
            </a>
            <a href="/kanban" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#1a1a1a', 
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: '0.25rem'
            }}>
              📋 Kanban
            </a>
            <a href="/system" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#1a1a1a', 
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: '0.25rem'
            }}>
              ⚙️ System
            </a>
            <a href="/code" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#1a1a1a', 
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: '0.25rem'
            }}>
              💻 Code
            </a>
            <a href="/skills" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#1a1a1a', 
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 500,
              marginBottom: '0.25rem'
            }}>
              🔧 Skills
            </a>
          </div>
          
          {/* Footer */}
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e5e5e5', color: '#999', fontSize: '0.7rem' }}>
            v1.0 - Hermes Bridge
          </div>
        </nav>
        
        {/* Main Content */}
        <main style={{ 
          flex: 1, 
          marginLeft: '220px', 
          padding: '2rem',
          background: '#ffffff',
          minHeight: '100vh'
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}
