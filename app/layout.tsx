// app/layout.tsx - Mission Control Layout with Sidebar
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
        {/* Sidebar */}
        <nav style={{ 
          width: '220px', 
          background: '#141414', 
          borderRight: '1px solid #333',
          padding: '1rem 0',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          height: '100vh'
        }}>
          {/* Logo */}
          <div style={{ padding: '0 1rem 1.5rem', borderBottom: '1px solid #333', marginBottom: '1rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>🎯 Mission Control</h1>
            <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.7rem' }}>Hermes Operations</p>
          </div>
          
          {/* Nav Items */}
          <div style={{ flex: 1 }}>
            <a href="/" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#e0e0e0', 
              textDecoration: 'none',
              borderLeft: '3px solid transparent',
              fontSize: '0.9rem'
            }}>
              📊 Overview
            </a>
            <a href="/agents" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#888', 
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}>
              🤖 Agents
            </a>
            <a href="/tasks" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#888', 
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}>
              📋 Tasks
            </a>
            <a href="/schedule" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#888', 
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}>
              ⏰ Schedule
            </a>
            <a href="/system" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#888', 
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}>
              ⚙️ System
            </a>
            <a href="/code" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#888', 
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}>
              💻 Code
            </a>
            <a href="/skills" style={{ 
              display: 'block', 
              padding: '0.75rem 1rem', 
              color: '#888', 
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}>
              🔧 Skills
            </a>
          </div>
          
          {/* Footer */}
          <div style={{ padding: '1rem', borderTop: '1px solid #333', color: '#444', fontSize: '0.7rem' }}>
            v1.0 - Hermes Bridge
          </div>
        </nav>
        
        {/* Main Content */}
        <main style={{ 
          marginLeft: '220px', 
          flex: 1, 
          padding: '1.5rem',
          minHeight: '100vh'
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}
