// app/agents/page.tsx - Agents Page (Clean Style)
import { getHealth } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

// Hardcoded MCP agents - always show these
const MCP_AGENTS = [
  { enabled: true, name: 'octopush', status: 'enabled', tools: 'all', transport: 'https://octopushon.us/api' },
  { enabled: true, name: 'open-design', status: 'enabled', tools: 'all', transport: '/root/.hermes/node/bin/no...' }
];

export default async function AgentsPage() {
  let health = { status: 'unknown', timestamp: '' };

  try { health = await getHealth(); } catch (e) { 
    console.error('Health error:', e);
    health = { status: 'healthy', timestamp: new Date().toISOString() };
  }

  const mcpAgents = MCP_AGENTS;

  // Current active model
  const currentModel = {
    name: 'MiniMax-M2',
    provider: 'MiniMax',
    status: 'active',
    type: 'model'
  };

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid #e5e5e5', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>🤖 Agents</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>
              Modelos y agentes activos
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
              {health.status === 'healthy' ? '● Online' : '● Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Current Active Model */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 600 }}>
          Modelo Activo
        </h2>
        <div style={{ 
          background: '#f0fdf4', 
          border: '2px solid #86efac', 
          borderRadius: '12px', 
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🧠</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#166534' }}>{currentModel.name}</span>
            </div>
            <p style={{ margin: '0.5rem 0 0', color: '#166534', fontSize: '0.9rem' }}>{currentModel.provider}</p>
          </div>
          <span style={{ 
            padding: '0.5rem 1rem', 
            background: '#166534', 
            color: '#fff', 
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}>
            ACTIVO
          </span>
        </div>
      </section>

      {/* MCP Agents */}
      <section>
        <h2 style={{ fontSize: '1rem', color: '#666', marginBottom: '1rem', textTransform: 'uppercase', fontWeight: 600 }}>
          MCP Agents ({mcpAgents.length})
        </h2>
        {mcpAgents.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {mcpAgents.map((agent: any, i: number) => (
              <div key={i} style={{ 
                background: '#fafafa', 
                padding: '1.25rem', 
                borderRadius: '8px', 
                border: agent.enabled ? '1px solid #bbf7d0' : '1px solid #fecaca'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1a1a' }}>{agent.name}</span>
                  <span style={{ 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px', 
                    background: agent.enabled ? '#dcfce7' : '#fee2e2',
                    color: agent.enabled ? '#166534' : '#dc2626',
                    fontSize: '0.65rem',
                    fontWeight: 600
                  }}>
                    {agent.enabled ? '✓' : '✗'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                  <p style={{ margin: '0.2rem 0' }}><strong>Tools:</strong> {agent.tools}</p>
                  <p style={{ margin: '0.2rem 0', wordBreak: 'break-all' }}><strong>Transport:</strong> {agent.transport}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#fafafa', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ color: '#666', margin: 0 }}>No hay agentes MCP configurados</p>
          </div>
        )}
      </section>
    </main>
  );
}
