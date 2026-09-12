// app/agents/page.tsx - Agents Page
import { getSessions, getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  let health = { status: 'unknown', timestamp: '' };
  let sessions = { sessions: [] };

  try { health = await getHealth(); } catch (e) {}
  try { sessions = await getSessions(); } catch (e) {}

  return (
    <main style={{ color: '#e0e0e0' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>🤖 Agents & Sessions</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.85rem' }}>
          Active and recent Hermes sessions
        </p>
      </header>

      <div style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '1rem', color: '#888', fontWeight: 500 }}>Title</th>
              <th style={{ textAlign: 'left', padding: '1rem', color: '#888', fontWeight: 500 }}>Workspace</th>
              <th style={{ textAlign: 'right', padding: '1rem', color: '#888', fontWeight: 500 }}>Last Active</th>
            </tr>
          </thead>
          <tbody>
            {sessions.sessions?.map((s: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem' }}>{s.title}</td>
                <td style={{ padding: '1rem', color: '#888' }}>{s.workspace}</td>
                <td style={{ textAlign: 'right', padding: '1rem', color: '#666' }}>{s.last_active}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!sessions.sessions || sessions.sessions.length === 0) && (
          <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No sessions found</p>
        )}
      </div>
    </main>
  );
}
