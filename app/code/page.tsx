// app/code/page.tsx - Code Stats & Activity Page (Clean Style)
import { getCodeStats, getActivity } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function CodePage() {
  let codeStats = { code_stats: [] };
  let activity = { activity: [] };

  try { codeStats = await getCodeStats(); } catch (e) { console.error(e); }
  try { activity = await getActivity(); } catch (e) { console.error(e); }

  const totalLines = codeStats.code_stats?.reduce((acc: number, p: any) => acc + (p.lines || 0), 0) || 0;
  const totalFiles = codeStats.code_stats?.reduce((acc: number, p: any) => acc + (p.files || 0), 0) || 0;

  const sortedActivity = [...(activity.activity || [])].sort((a: any, b: any) => {
    if (a.type === 'session' && b.type !== 'session') return -1;
    if (a.type !== 'session' && b.type === 'session') return 1;
    return 0;
  });

  return (
    <main style={{ color: '#1a1a1a', background: '#ffffff' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>💻 Code & Activity</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>Project stats and activity</p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Lines</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>{totalLines.toLocaleString()}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Files</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>{totalFiles}</p>
        </div>
        <div style={{ background: '#fafafa', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Projects</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>{codeStats.code_stats?.length || 0}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Left: Code by Project */}
        <div style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', color: '#1a1a1a', fontWeight: 600 }}>📁 Code by Project</h2>
          </div>
          <div style={{ padding: '0.5rem' }}>
            {codeStats.code_stats?.length > 0 ? codeStats.code_stats.map((p: any, i: number) => (
              <div key={i} style={{ 
                padding: '0.875rem 1rem',
                borderRadius: '6px',
                marginBottom: '0.25rem',
                background: '#ffffff',
                border: '1px solid #e5e5e5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: '#1a1a1a', fontSize: '0.9rem', fontWeight: 500 }}>{p.project}</div>
                  <div style={{ color: '#666', fontSize: '0.75rem' }}>{p.files} files</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#2563eb', fontSize: '1.1rem', fontWeight: 600 }}>{p.lines?.toLocaleString()}</div>
                  <div style={{ color: '#999', fontSize: '0.65rem' }}>lines</div>
                </div>
              </div>
            )) : (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No data</p>
            )}
          </div>
        </div>

        {/* Right: Recent Activity */}
        <div style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', color: '#1a1a1a', fontWeight: 600 }}>⚡ Recent Activity</h2>
            <span style={{ fontSize: '0.7rem', color: '#666' }}>{sortedActivity.length} events</span>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
            {sortedActivity.length > 0 ? sortedActivity.map((a: any, i: number) => (
              <div key={i} style={{ 
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '0.25rem',
                background: '#ffffff',
                borderLeft: a.type === 'session' ? '3px solid #16a34a' : '3px solid #d97706',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ 
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.65rem',
                  background: a.type === 'session' ? '#dcfce7' : '#fef3c7',
                  color: a.type === 'session' ? '#16a34a' : '#d97706',
                  textTransform: 'uppercase',
                  fontWeight: 500
                }}>
                  {a.type}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#1a1a1a', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
