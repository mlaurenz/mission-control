// app/schedule/page.tsx - Schedule / Cron Page (Clean Style)
import { getCron } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  let cron = { jobs: [] };

  try { cron = await getCron(); } catch (e) {}

  const jobs = cron.jobs || [];

  return (
    <main style={{ color: '#1a1a1a', background: '#ffffff' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>⏰ Schedule</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>Cron jobs scheduled in Hermes</p>
      </header>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Jobs</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>{jobs.length}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#16a34a', fontWeight: 600 }}>{jobs.filter((j: any) => j.status === 'active').length}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paused</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#d97706', fontWeight: 600 }}>{jobs.filter((j: any) => j.status === 'paused').length}</p>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {jobs.map((job: any, i: number) => (
            <div key={i} style={{ 
              background: '#fafafa', 
              borderRadius: '8px', 
              border: '1px solid #e5e5e5',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#1a1a1a', fontSize: '0.95rem', fontWeight: 500 }}>{job.name || job.job || 'Unnamed'}</span>
                  <span style={{ 
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    background: job.status === 'active' ? '#dcfce7' : '#fef3c7',
                    color: job.status === 'active' ? '#16a34a' : '#d97706',
                    fontWeight: 500
                  }}>
                    {job.status || 'unknown'}
                  </span>
                </div>
                <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {job.schedule || job.cron || 'No schedule'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 500 }}>{job.next_run || job.next || 'N/A'}</div>
                <div style={{ color: '#999', fontSize: '0.7rem' }}>next</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5', padding: '3rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#666' }}>No cron jobs configured</p>
        </div>
      )}
    </main>
  );
}
