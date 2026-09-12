// app/code/page.tsx - Code Stats & Activity Page
import { getCodeStats, getActivity } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function CodePage() {
  let codeStats = { code_stats: [] };
  let activity = { activity: [] };

  try { codeStats = await getCodeStats(); } catch (e) { console.error(e); }
  try { activity = await getActivity(); } catch (e) { console.error(e); }

  const totalLines = codeStats.code_stats?.reduce((acc: number, p: any) => acc + (p.lines || 0), 0) || 0;
  const totalFiles = codeStats.code_stats?.reduce((acc: number, p: any) => acc + (p.files || 0), 0) || 0;

  // Sort activity: sessions first, then tasks
  const sortedActivity = [...(activity.activity || [])].sort((a: any, b: any) => {
    if (a.type === 'session' && b.type !== 'session') return -1;
    if (a.type !== 'session' && b.type === 'session') return 1;
    return 0;
  });

  return (
    <main style={{ color: '#e0e0e0' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>💻 Code & Activity</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.85rem' }}>
          Project stats and what Hermes está haciendo ahora
        </p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Lines</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{totalLines.toLocaleString()}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Files</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{totalFiles}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Projects</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#fff' }}>{codeStats.code_stats?.length || 0}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Left: Code by Project */}
        <div style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', color: '#fff' }}>📁 Code by Project</h2>
          </div>
          <div style={{ padding: '0.5rem' }}>
            {codeStats.code_stats?.length > 0 ? codeStats.code_stats.map((p: any, i: number) => (
              <div key={i} style={{ 
                padding: '0.875rem 1rem',
                borderRadius: '6px',
                marginBottom: '0.25rem',
                background: i === 0 ? '#1a1a2e' : '#1a1a1a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>{p.project}</div>
                  <div style={{ color: '#666', fontSize: '0.75rem' }}>{p.files} files</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#60a5fa', fontSize: '1.1rem', fontWeight: 600 }}>{p.lines?.toLocaleString()}</div>
                  <div style={{ color: '#444', fontSize: '0.65rem' }}>lines</div>
                </div>
              </div>
            )) : (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No data</p>
            )}
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', color: '#fff' }}>⚡ Recent Activity</h2>
            <span style={{ fontSize: '0.7rem', color: '#666' }}>{sortedActivity.length} events</span>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
            {sortedActivity.length > 0 ? sortedActivity.map((a: any, i: number) => (
              <div key={i} style={{ 
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '0.25rem',
                background: i === 0 ? '#1a2e1a' : '#1a1a1a',
                borderLeft: a.type === 'session' ? '3px solid #4ade80' : '3px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ 
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  background: a.type === 'session' ? '#1a3a1a' : '#3a2a1a',
                  color: a.type === 'session' ? '#4ade80' : '#f59e0b',
                  textTransform: 'uppercase'
                }}>
                  {a.type}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.description}
                  </div>
                </div>
              <div style={{ color: '#666', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
                  {a.timestamp ? new Date(a.timestamp).toLocaleDateString('es-AR') : a.status || ''}
                </div>
              </div>
            )) : (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
