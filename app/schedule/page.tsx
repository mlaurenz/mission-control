// app/schedule/page.tsx - Schedule / Cron Page
import { getCron } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  let cron = { jobs: [] };

  try { cron = await getCron(); } catch (e) {}

  const jobs = cron.jobs || [];

  return (
    <main style={{ color: '#e0e0e0' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>⏰ Schedule</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.85rem' }}>
          Cron jobs scheduled in Hermes
        </p>
      </header>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Jobs</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{jobs.length}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Active</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#4ade80' }}>{jobs.filter((j: any) => j.status === 'active').length}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Paused</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#f59e0b' }}>{jobs.filter((j: any) => j.status === 'paused').length}</p>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {jobs.map((job: any, i: number) => (
            <div key={i} style={{ 
              background: '#141414', 
              borderRadius: '8px', 
              border: '1px solid #333',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}>{job.name || job.job || 'Unnamed'}</span>
                  <span style={{ 
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    background: job.status === 'active' ? '#1a3a1a' : '#3a2a1a',
                    color: job.status === 'active' ? '#4ade80' : '#f59e0b'
                  }}>
                    {job.status || 'unknown'}
                  </span>
                </div>
                <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {job.schedule || job.cron || 'No schedule'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#60a5fa', fontSize: '0.8rem' }}>{job.next_run || job.next || 'N/A'}</div>
                <div style={{ color: '#444', fontSize: '0.7rem' }}>next</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333', padding: '3rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>No cron jobs configured</p>
        </div>
      )}
    </main>
  );
}
