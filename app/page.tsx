// app/page.tsx - Mission Control Dashboard
import { getHealth, getSessions, getCron, getKanbanBoards, getKanbanTasks, getSkills, getLogs, getGatewayStatus, getMCP } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

// Helper to format time ago
function timeAgo(dateStr: string): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default async function Home() {
  // Fetch all data
  let health = { status: 'unknown', timestamp: '' };
  let sessions = { sessions: [] };
  let cron = { cron_jobs: [] };
  let kanbanBoards = { boards: [] };
  let kanbanTasks = { tasks: [] };
  let skills = { skills: [] };
  let logs = { logs: [] };
  let gateway = { raw: '' };
  let mcp = { mcp_servers: '' };

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
    fetchWithErr(getLogs, (v: any) => logs = v),
  ]);

  // Aggregate task counts by status
  const taskCounts = { todo: 0, ready: 0, running: 0, blocked: 0, review: 0, done: 0 };
  kanbanTasks.tasks?.forEach((t: any) => {
    const status = t.status?.toLowerCase() || 'todo';
    if (taskCounts[status as keyof typeof taskCounts] !== undefined) {
      taskCounts[status as keyof typeof taskCounts]++;
    }
  });

  // Aggregate session counts
  const recentSessions = sessions.sessions?.slice(0, 10) || [];

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e0e0e0', padding: '1rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #333' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>🎯 Mission Control</h1>
          <p style={{ margin: '0.25rem 0 0', color: '#888', fontSize: '0.85rem' }}>Hermes Operations Dashboard</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ 
            display: 'inline-block', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '4px', 
            background: health.status === 'healthy' ? '#1a4d1a' : '#4d1a1a',
            color: health.status === 'healthy' ? '#4f4' : '#f44',
            fontSize: '0.8rem'
          }}>
            {health.status === 'healthy' ? '● ONLINE' : '● OFFLINE'}
          </span>
          <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.75rem' }}>
            Last sync: {health.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
          </p>
        </div>
      </header>

      {/* Overview Grid */}
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '0.9rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.75rem' }}>Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
          
          {/* Sessions */}
          <div style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Sessions</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{sessions.sessions?.length || 0}</p>
            <p style={{ margin: 0, color: '#444', fontSize: '0.7rem' }}>last 24h</p>
          </div>

          {/* Tasks */}
          <div style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Tasks</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{kanbanTasks.tasks?.length || 0}</p>
            <p style={{ margin: 0, color: '#444', fontSize: '0.7rem' }}>total across boards</p>
          </div>

          {/* Ready Tasks */}
          <div style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Ready</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', color: '#4af' }}>{taskCounts.ready}</p>
            <p style={{ margin: 0, color: '#444', fontSize: '0.7rem' }}>to work on</p>
          </div>

          {/* Blocked */}
          <div style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Blocked</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', color: '#f44' }}>{taskCounts.blocked}</p>
            <p style={{ margin: 0, color: '#444', fontSize: '0.7rem' }}>needs attention</p>
          </div>

          {/* Cron Jobs */}
          <div style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Cron Jobs</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{cron.cron_jobs?.length || 0}</p>
            <p style={{ margin: 0, color: '#444', fontSize: '0.7rem' }}>scheduled</p>
          </div>

          {/* Skills */}
          <div style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Skills</p>
            <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{skills.skills?.length || 0}</p>
            <p style={{ margin: 0, color: '#444', fontSize: '0.7rem' }}>installed</p>
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        
        {/* Sessions / Agents */}
        <section style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
          <h2 style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Recent Sessions</span>
            <span style={{ color: '#666' }}>{sessions.sessions?.length || 0}</span>
          </h2>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {recentSessions.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333', color: '#666' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Title</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((s: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '0.5rem 0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.title?.substring(0, 40)}...
                      </td>
                      <td style={{ textAlign: 'right', padding: '0.5rem 0', color: '#888' }}>
                        {s.last_active}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No sessions</p>
            )}
          </div>
        </section>

        {/* Cron Jobs */}
        <section style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
          <h2 style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Scheduled Jobs</span>
            <span style={{ color: '#666' }}>{cron.cron_jobs?.length || 0}</span>
          </h2>
          <div style={{ maxHeight: '300px', overflow: 'auto' }}>
            {cron.cron_jobs && cron.cron_jobs.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333', color: '#666' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Job</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem 0' }}>Schedule</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Next</th>
                  </tr>
                </thead>
                <tbody>
                  {cron.cron_jobs.map((c: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '0.5rem 0' }}>{c.name}</td>
                      <td style={{ textAlign: 'center', padding: '0.5rem 0', color: '#666', fontFamily: 'monospace' }}>{c.schedule}</td>
                      <td style={{ textAlign: 'right', padding: '0.5rem 0', color: '#4af' }}>
                        {c.next_run ? new Date(c.next_run).toLocaleTimeString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No cron jobs</p>
            )}
          </div>
        </section>

        {/* Kanban Tasks by Status */}
        <section style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
          <h2 style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem' }}>Tasks by Status</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {Object.entries(taskCounts).map(([status, count]) => (
              <div key={status} style={{ 
                padding: '0.5rem 0.75rem', 
                background: '#222', 
                borderRadius: '4px',
                borderLeft: status === 'ready' ? '3px solid #4af' :
                           status === 'blocked' ? '3px solid #f44' :
                           status === 'done' ? '3px solid #4a4' :
                           status === 'running' ? '3px solid #fa4' : '3px solid #666'
              }}>
                <span style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase' }}>{status}</span>
                <p style={{ margin: 0, fontSize: '1.25rem', color: '#fff' }}>{count}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Kanban Boards */}
        <section style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
          <h2 style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem' }}>Kanban Boards</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {kanbanBoards.boards?.map((b: any, i: number) => (
              <div key={i} style={{ 
                padding: '0.5rem 0.75rem', 
                background: '#222', 
                borderRadius: '4px',
                minWidth: '100px'
              }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#fff' }}>{b.name}</p>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#666' }}>{b.total} tasks</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Skills */}
      <section style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333', marginTop: '1rem' }}>
        <h2 style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.75rem' }}>Installed Skills ({skills.skills?.length || 0})</h2>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {skills.skills?.map((s: string, i: number) => (
            <span key={i} style={{ 
              padding: '0.25rem 0.5rem', 
              background: '#222', 
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: '#aaa'
            }}>{s}</span>
          ))}
        </div>
      </section>

    </main>
  );
}
