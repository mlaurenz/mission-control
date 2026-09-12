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

  try {
    health = await getHealth();
  } catch (e) { console.error('health:', e); }

  try {
    agents = await getAgents();
  } catch (e) { console.error('agents:', e); }

  try {
    cron = await getCronJobs();
  } catch (e) { console.error('cron:', e); }

  try {
    skills = await getSkills();
  } catch (e) { console.error('skills:', e); }

  try {
    kanban = await getKanban();
  } catch (e) { console.error('kanban:', e); }

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🚀 Mission Control</h1>
      
      {/* Health Status */}
      <section style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>System Status</h2>
        <p><strong>Status:</strong> {health.status}</p>
        <p><strong>Last Update:</strong> {health.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A'}</p>
      </section>

      {/* Agents */}
      <section style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Agents / Sessions</h2>
        {agents.agents?.length > 0 ? (
          <ul>
            {agents.agents.map((a: any, i: number) => (
              <li key={i}>{JSON.stringify(a)}</li>
            ))}
          </ul>
        ) : <p>No active agents</p>}
      </section>

      {/* Cron Jobs */}
      <section style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Cron Jobs</h2>
        {cron.cron_jobs?.length > 0 ? (
          <ul>
            {cron.cron_jobs.map((c: any, i: number) => (
              <li key={i}>{JSON.stringify(c)}</li>
            ))}
          </ul>
        ) : <p>No cron jobs</p>}
      </section>

      {/* Skills */}
      <section style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Skills ({skills.skills?.length || 0})</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {skills.skills?.map((s: string, i: number) => (
            <span key={i} style={{ padding: '0.25rem 0.5rem', background: '#eee', borderRadius: '4px' }}>{s}</span>
          ))}
        </div>
      </section>

      {/* Kanban */}
      <section style={{ margin: '2rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Kanban Boards</h2>
        {kanban.boards?.length > 0 ? (
          <ul>
            {kanban.boards.map((b: any, i: number) => (
              <li key={i}>{b.slug} - {b.name}</li>
            ))}
          </ul>
        ) : <p>No boards (or parse error)</p>}
      </section>
    </main>
  );
}
