// Mission Control - Next.js app for monitoring Hermes
// Home page with overview dashboard

import { getHealth, getAgents, getCronJobs, getSkills, getKanban } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch real data from Hermes Bridge
  let health = { status: 'unknown', timestamp: '' };
  let agents = { agents: [] };
  let cron = { cron_jobs: [] };
  let skills = { skills: [] };
  let kanban = { boards: [] };

  let healthError = '';
  let agentsError = '';
  let cronError = '';
  let skillsError = '';
  let kanbanError = '';

  try {
    health = await getHealth();
  } catch (e: any) { 
    healthError = e.message || String(e);
    console.error('health:', e); 
  }

  try {
    agents = await getAgents();
  } catch (e: any) { 
    agentsError = e.message || String(e);
    console.error('agents:', e); 
  }

  try {
    cron = await getCronJobs();
  } catch (e: any) { 
    cronError = e.message || String(e);
    console.error('cron:', e); 
  }

  try {
    skills = await getSkills();
  } catch (e: any) { 
    skillsError = e.message || String(e);
    console.error('skills:', e); 
  }

  try {
    kanban = await getKanban();
  } catch (e: any) { 
    kanbanError = e.message || String(e);
    console.error('kanban:', e); 
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🚀 Mission Control</h1>
      <p style={{color: '#666', fontSize: '0.9rem'}}>Bridge: {process.env.HERMES_BRIDGE_URL || 'not set'}</p>
      
      {/* Health Status */}
      <section style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>System Status</h2>
        {healthError ? (
          <p style={{color: 'red'}}><strong>Error:</strong> {healthError}</p>
        ) : (
          <>
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>Last Update:</strong> {health.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}</p>
          </>
        )}
      </section>

      {/* Agents */}
      <section style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Agents / Sessions</h2>
        {agentsError ? (
          <p style={{color: 'red'}}><strong>Error:</strong> {agentsError}</p>
        ) : agents.agents?.length > 0 ? (
          <ul>
            {agents.agents.map((a: any, i: number) => (
              <li key={i}>{JSON.stringify(a)}</li>
            ))}
          </ul>
        ) : <p>No active agents</p>}
      </section>

      {/* Cron Jobs */}
      <section style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Cron Jobs ({cron.cron_jobs?.length || 0})</h2>
        {cronError ? (
          <p style={{color: 'red'}}><strong>Error:</strong> {cronError}</p>
        ) : cron.cron_jobs?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {cron.cron_jobs.map((c: any, i: number) => (
              <div key={i} style={{ padding: '0.75rem', background: '#f5f5f5', borderRadius: '6px' }}>
                <strong>{c.name || c.id}</strong>
                <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>{c.schedule || c.cron}</p>
              </div>
            ))}
          </div>
        ) : <p>No cron jobs</p>}
      </section>

      {/* Skills */}
      <section style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Skills ({skills.skills?.length || 0})</h2>
        {skillsError ? (
          <p style={{color: 'red'}}><strong>Error:</strong> {skillsError}</p>
        ) : skills.skills?.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {skills.skills.map((s: string, i: number) => (
              <span key={i} style={{ padding: '0.25rem 0.5rem', background: '#e0e0e0', borderRadius: '4px', fontSize: '0.85rem' }}>{s}</span>
            ))}
          </div>
        ) : <p>No skills</p>}
      </section>

      {/* Kanban */}
      <section style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Kanban Boards ({kanban.boards?.length || 0})</h2>
        {kanbanError ? (
          <p style={{color: 'red'}}><strong>Error:</strong> {kanbanError}</p>
        ) : kanban.boards?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {kanban.boards.map((b: any, i: number) => (
              <div key={i} style={{ padding: '0.75rem', background: '#f5f5f5', borderRadius: '6px' }}>
                <strong>{b.name}</strong>
                <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>Slug: {b.slug}</p>
                <p style={{ margin: 0, color: '#888', fontSize: '0.8rem' }}>Total: {b.total || 0}</p>
              </div>
            ))}
          </div>
        ) : <p>No boards</p>}
      </section>
    </main>
  );
}
