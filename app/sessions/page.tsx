// app/sessions/page.tsx - Sessions Page (Clean Style)
import { getSessions, getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function SessionsPage() {
  let health = { status: 'unknown', timestamp: '' };
  let sessions = { sessions: [] };

  try { health = await getHealth(); } catch (e) { console.error(e); }
  try { sessions = await getSessions(); } catch (e) { console.error(e); }

  const allSessions = sessions.sessions || [];
  
  // Sort by recency (most recent first)
  const sortedSessions = [...allSessions].sort((a: any, b: any) => {
    // Extract timestamp from last_active
    const parseTime = (t: string) => {
      if (!t) return 0;
      const now = new Date();
      if (t.includes('now')) return now.getTime();
      const match = t.match(/(\d+)\s*(m|h|d)\s*ago/);
      if (match) {
        const val = parseInt(match[1]);
        const unit = match[2];
        if (unit === 'm') return now.getTime() - val * 60 * 1000;
        if (unit === 'h') return now.getTime() - val * 60 * 60 * 1000;
        if (unit === 'd') return now.getTime() - val * 24 * 60 * 60 * 1000;
      }
      return 0;
    };
    return parseTime(b.last_active) - parseTime(a.last_active);
  });

  // Get unique platforms
  const platforms = [...new Set(allSessions.map((s: any) => s.platform).filter(Boolean))];

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid #e5e5e5', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>💬 Sessions</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>
              Recent conversations with Hermes
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ 
              display: 'inline-block', 
              padding: '0.5rem 1rem', 
              borderRadius: '6px', 
              background: health.status === 'healthy' ? '#dcfce7' : '#fee2e2',
              color: health.status === 'healthy' ? '#166534' : '#dc2626',
              fontSize: '0.85rem',
              fontWeight: 600
            }}>
              {health.status === 'healthy' ? '● Bridge Online' : '● Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Total</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>{allSessions.length}</p>
        </div>
        <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#1e40af', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Platforms</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#1e40af', fontWeight: 700 }}>{platforms.length}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Telegram</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', color: '#1a1a1a', fontWeight: 600 }}>{allSessions.filter((s: any) => s.platform === 'telegram').length}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Discord</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem', color: '#1a1a1a', fontWeight: 600 }}>{allSessions.filter((s: any) => s.platform === 'discord').length}</p>
        </div>
      </div>

      {/* Sessions Table */}
      <section>
        <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1rem', fontWeight: 600 }}>Recent Sessions (Most Recent ↑)</h2>
        <div style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #e5e5e5' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Title</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Platform</th>
                <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Chat ID</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {sortedSessions.slice(0, 20).map((s: any, i: number) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#1a1a1a' }}>
                    {s.title || 'Untitled'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px', 
                      background: s.platform === 'telegram' ? '#e0f2fe' : s.platform === 'discord' ? '#f3e8ff' : '#f1f5f9',
                      color: s.platform === 'telegram' ? '#0369a1' : s.platform === 'discord' ? '#7c3aed' : '#475569',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}>
                      {s.platform?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', color: '#666', fontFamily: 'monospace' }}>
                    {s.chat_id || 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.8rem', color: '#666' }}>
                    {s.last_active || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
