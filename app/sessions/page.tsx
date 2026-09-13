// app/sessions/page.tsx - Sessions Page (Clean Style)
import { getSessions, getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

function timeAgo(ts: string): string {
  if (!ts) return 'N/A';
  // If already a relative string (e.g. "5m ago", "2h ago"), return as-is
  if (/^\d+\s*[mhd]\s*ago$/i.test(ts.trim())) return ts.trim();
  const date = new Date(ts.includes('_') ? ts.replace(/_/g, ' ') : ts);
  if (isNaN(date.getTime())) return ts.substring(0, 12);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default async function SessionsPage() {
  let health = { status: 'unknown', timestamp: '' };
  let sessions = { sessions: [] };

  try { health = await getHealth(); } catch (e) { console.error(e); }
  try { sessions = await getSessions(); } catch (e) { console.error(e); }

  const allSessions = sessions.sessions || [];

  // Sort by recency
  const sortedSessions = [...allSessions].sort((a: any, b: any) => {
    const parseTime = (t: string) => {
      if (!t) return 0;
      if (/^\d+\s*[mhd]\s*ago$/i.test(t.trim())) {
        const match = t.match(/(\d+)\s*([mhd])/i);
        if (!match) return 0;
        const val = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const now = Date.now();
        if (unit === 'm') return now - val * 60000;
        if (unit === 'h') return now - val * 3600000;
        if (unit === 'd') return now - val * 86400000;
      }
      const date = new Date(t.includes('_') ? t.replace(/_/g, ' ') : t);
      return isNaN(date.getTime()) ? 0 : date.getTime();
    };
    return parseTime(b.last_active) - parseTime(a.last_active);
  });

  const platformSet = new Set(allSessions.map((s: any) => s.platform).filter(Boolean));
  const platforms = Array.from(platformSet);

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
              display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '6px',
              background: health.status === 'healthy' ? '#dcfce7' : '#fee2e2',
              color: health.status === 'healthy' ? '#166534' : '#dc2626',
              fontSize: '0.85rem', fontWeight: 600
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
                  <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#1a1a1a' }}>{s.title || 'Untitled'}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: '4px',
                      background: s.platform === 'telegram' ? '#e0f2fe' : s.platform === 'discord' ? '#f3e8ff' : '#f1f5f9',
                      color: s.platform === 'telegram' ? '#0369a1' : s.platform === 'discord' ? '#7c3aed' : '#475569',
                      fontSize: '0.7rem', fontWeight: 600
                    }}>
                      {s.platform?.toUpperCase() || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', color: '#666', fontFamily: 'monospace' }}>{s.chat_id || 'N/A'}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: '#666', background: '#f0f0f0', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {timeAgo(s.last_active)}
                    </span>
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
