// app/page.tsx - Mission Control Dashboard (Clean Style)
import { getHealth, getSessions, getCron, getKanbanBoards, getKanbanTasks, getSkills } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

// Hardcoded profiles - always show these
const PROFILES = [
  { name: 'default', model: 'MiniMax-M2', status: 'active' },
  { name: 'automation', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'coder', model: 'openai/gpt-5.6-sol', status: 'stopped' },
  { name: 'consultant', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'creator', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'designer', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'editor', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'orchestrator', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'pm', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'research', model: 'MiniMax-M2', status: 'stopped' },
  { name: 'social', model: 'MiniMax-M2', status: 'stopped' },
];

// Hardcoded MCP agents - always show these
const MCP_AGENTS = [
  { enabled: true, name: 'octopush', status: 'enabled', tools: 'all', transport: 'https://octopushon.us/api' },
  { enabled: true, name: 'open-design', status: 'enabled', tools: 'all', transport: '/root/.hermes/node/bin/no...' }
];

export default async function Home() {
  // Fetch all data
  let health = { status: 'unknown', timestamp: '' };
  let sessions = { sessions: [] };
  let cron = { cron_jobs: [] };
  let kanbanBoards = { boards: [] };
  let kanbanTasks = { tasks: [] };
  let skills = { skills: [] };

  const fetchWithErr = async (fn: () => Promise<any>, setter: any) => {
    try { setter(await fn()); } catch (e) { console.error(e); }
  };

  await Promise.all([
    fetchWithErr(getHealth, (v: any) => health = v),
    fetchWithErr(getSessions, (v: any) => sessions = v),
    fetchWithErr(getCron, (v: any) => cron = v),
    fetchWithErr(getKanbanBoards, (v: any) => kanbanBoards = v),
    fetchWithErr(getKanbanTasks, (v: any) => kanbanTasks = v),
    fetchWithErr(getSkills, (v: any) => skills = v),
  ]);

  // Aggregate task counts by status
  const taskCounts = { todo: 0, ready: 0, running: 0, blocked: 0, review: 0, done: 0 };
  kanbanTasks.tasks?.forEach((t: any) => {
    const status = t.status?.toLowerCase() || 'todo';
    if (taskCounts[status as keyof typeof taskCounts] !== undefined) {
      taskCounts[status as keyof typeof taskCounts]++;
    }
  });

  // Recent sessions
  const recentSessions = sessions.sessions?.slice(0, 8) || [];

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', padding: '2rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid #e5e5e5', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>Mission Control</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>Hermes Operations Dashboard</p>
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
            <p style={{ margin: '0.5rem 0 0', color: '#999', fontSize: '0.75rem' }}>
              {health.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          
          {/* Model */}
          <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '8px', border: '2px solid #86efac', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#166534', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Active Model</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.2rem', color: '#166534', fontWeight: 700 }}>MiniMax-M2</p>
          </div>

          {/* Profiles */}
          <div style={{ background: '#fef3c7', padding: '1.25rem', borderRadius: '8px', border: '2px solid #fbbf24', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#92400e', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Profiles</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.2rem', color: '#92400e', fontWeight: 700 }}>{PROFILES.length}</p>
          </div>

          {/* MCP Agents */}
          <div style={{ background: '#f0f9ff', padding: '1.25rem', borderRadius: '8px', border: '2px solid #7dd3fc', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#0369a1', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>MCP Agents</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '1.2rem', color: '#0369a1', fontWeight: 700 }}>{MCP_AGENTS.length}</p>
           </div>

          {/* Total Tasks */}
          <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Total Tasks</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>{kanbanTasks.tasks?.length || 0}</p>
            <p style={{ margin: 0, color: '#999', fontSize: '0.7rem' }}>across boards</p>
          </div>

          {/* Ready */}
          <div style={{ background: '#eff6ff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#1e40af', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Ready</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#1e40af', fontWeight: 700 }}>{taskCounts.ready}</p>
            <p style={{ margin: 0, color: '#60a5fa', fontSize: '0.7rem' }}>to work on</p>
          </div>

          {/* Blocked */}
          <div style={{ background: '#fef2f2', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#dc2626', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Blocked</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#dc2626', fontWeight: 700 }}>{taskCounts.blocked}</p>
            <p style={{ margin: 0, color: '#f87171', fontSize: '0.7rem' }}>needs attention</p>
          </div>

          {/* Running */}
          <div style={{ background: '#fffbeb', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fde68a', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#d97706', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Running</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#d97706', fontWeight: 700 }}>{taskCounts.running}</p>
            <p style={{ margin: 0, color: '#fbbf24', fontSize: '0.7rem' }}>in progress</p>
          </div>

          {/* Done */}
          <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '8px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#16a34a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Done</p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#16a34a', fontWeight: 700 }}>{taskCounts.done}</p>
            <p style={{ margin: 0, color: '#4ade80', fontSize: '0.7rem' }}>completed</p>
          </div>
        </div>
      </section>

      {/* Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Recent Sessions */}
        <section style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <h2 style={{ fontSize: '1rem', color: '#1a1a1a', marginBottom: '1rem', fontWeight: 600 }}>Recent Sessions</h2>
          <div style={{ maxHeight: '280px', overflow: 'auto' }}>
            {recentSessions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentSessions.map((s: any, i: number) => (
                  <div key={i} style={{ 
                    padding: '0.75rem', 
                    background: '#fff', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e5e5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: '#1a1a1a' }}>{s.title?.substring(0, 35) || 'Untitled'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>{s.last_active || 'N/A'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No sessions</p>
            )}
          </div>
        </section>

        {/* Cron Jobs */}
        <section style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <h2 style={{ fontSize: '1rem', color: '#1a1a1a', marginBottom: '1rem', fontWeight: 600 }}>Scheduled Jobs</h2>
          <div style={{ maxHeight: '280px', overflow: 'auto' }}>
            {cron.cron_jobs && cron.cron_jobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {cron.cron_jobs.map((c: any, i: number) => (
                  <div key={i} style={{ 
                    padding: '0.75rem', 
                    background: '#fff', 
                    borderRadius: '6px', 
                    border: '1px solid #e5e5e5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: '#1a1a1a' }}>{c.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'monospace' }}>{c.schedule}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>No cron jobs</p>
            )}
          </div>
        </section>

        {/* Kanban Boards */}
        <section style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <h2 style={{ fontSize: '1rem', color: '#1a1a1a', marginBottom: '1rem', fontWeight: 600 }}>Kanban Boards</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {kanbanBoards.boards?.map((b: any, i: number) => (
              <div key={i} style={{ 
                padding: '0.75rem', 
                background: '#fff', 
                borderRadius: '6px', 
                border: '1px solid #e5e5e5'
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#1a1a1a', fontWeight: 500 }}>{b.name}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#666' }}>{b.total} tasks</p>
              </div>
            ))}
          </div>
        </section>

        {/* Skills */}
        <section style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <h2 style={{ fontSize: '1rem', color: '#1a1a1a', marginBottom: '1rem', fontWeight: 600 }}>Installed Skills</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {skills.skills?.map((s: string, i: number) => (
              <span key={i} style={{ 
                padding: '0.4rem 0.75rem', 
                background: '#fff', 
                borderRadius: '4px',
                border: '1px solid #e5e5e5',
                fontSize: '0.8rem',
                color: '#333'
              }}>{s}</span>
            ))}
          </div>
        </section>

        {/* MCP Agents */}
        <section style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '8px', border: '2px solid #7dd3fc' }}>
          <h2 style={{ fontSize: '1rem', color: '#0369a1', marginBottom: '1rem', fontWeight: 600 }}>🤖 MCP Agents</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {MCP_AGENTS.map((agent: any, i: number) => (
              <div key={i} style={{ 
                padding: '0.75rem', 
                background: '#fff', 
                borderRadius: '6px', 
                border: '1px solid #7dd3fc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0369a1' }}>{agent.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#16a34a', background: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>✓ {agent.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Profiles */}
        <section style={{ background: '#fef3c7', padding: '1.5rem', borderRadius: '8px', border: '2px solid #fbbf24' }}>
          <h2 style={{ fontSize: '1rem', color: '#92400e', marginBottom: '1rem', fontWeight: 600 }}>👤 Profiles ({PROFILES.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {PROFILES.map((profile: any, i: number) => (
              <div key={i} style={{ 
                padding: '0.5rem', 
                background: '#fff', 
                borderRadius: '6px', 
                border: profile.status === 'active' ? '2px solid #16a34a' : '1px solid #fbbf24',
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: profile.status === 'active' ? '#16a34a' : '#92400e' }}>
                  {profile.status === 'active' ? '● ' : '○ '}{profile.name}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#666', display: 'block' }}>{profile.model}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
