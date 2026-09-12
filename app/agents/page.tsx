// app/agents/page.tsx - Agents Page (Clean Style)
import { getMCP, getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function AgentsPage() {
  let mcp = { servers: [] };
  let health = { status: 'unknown', timestamp: '' };

  try { mcp = await getMCP(); } catch (e) {}
  try { health = await getHealth(); } catch (e) {}

  const agents = mcp.servers || [];

  return (
    <main style={{ color: '#1a1a1a', background: '#ffffff' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>🤖 Agents</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>
          MCP agents and their last activity
        </p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Agents</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>{agents.length}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#16a34a', fontWeight: 600 }}>{agents.length}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gateway</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.5rem' }}>
            {health.status === 'healthy' ? '🟢' : '🔴'}
          </p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1rem', color: '#2563eb', fontWeight: 500 }}>MiniMax-M2</p>
        </div>
      </div>

      {/* Agents Table */}
      <div style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f0f0f0', borderBottom: '1px solid #e5e5e5' }}>
              <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#666', fontWeight: 500, fontSize: '0.8rem' }}>Agent</th>
              <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#666', fontWeight: 500, fontSize: '0.8rem' }}>Type</th>
              <th style={{ textAlign: 'center', padding: '0.875rem 1rem', color: '#666', fontWeight: 500, fontSize: '0.8rem' }}>Tools</th>
              <th style={{ textAlign: 'center', padding: '0.875rem 1rem', color: '#666', fontWeight: 500, fontSize: '0.8rem' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '0.875rem 1rem', color: '#666', fontWeight: 500, fontSize: '0.8rem' }}>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {agents.length > 0 ? agents.map((agent: any, i: number) => (
              <tr key={i} style={{ borderBottom: i < agents.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ color: '#1a1a1a', fontWeight: 500 }}>{agent.name || 'Unknown'}</div>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#666' }}>MCP</td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'center', color: '#666' }}>{agent.tools || 'all'}</td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    background: '#dcfce7',
                    color: '#16a34a'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }}/>
                    Enabled
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: '#666', fontSize: '0.85rem' }}>
                  {agent.last_active || 'N/A'}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                  No agents found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
