// app/code/page.tsx - Code Stats Page
import { getCodeStats, getActivity } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function CodePage() {
  let codeStats = { code_stats: [] };
  let activity = { activity: [] };

  try { codeStats = await getCodeStats(); } catch (e) { console.error(e); }
  try { activity = await getActivity(); } catch (e) { console.error(e); }

  const totalLines = codeStats.code_stats?.reduce((acc: number, p: any) => acc + (p.lines || 0), 0) || 0;
  const totalFiles = codeStats.code_stats?.reduce((acc: number, p: any) => acc + (p.files || 0), 0) || 0;

  return (
    <main style={{ color: '#e0e0e0' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>💻 Code & Activity</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.85rem' }}>
          Lines of code and recent activity
        </p>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#141414', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Lines</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#fff' }}>{totalLines.toLocaleString()}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Total Files</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#fff' }}>{totalFiles}</p>
        </div>
        <div style={{ background: '#141414', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '0.75rem', textTransform: 'uppercase' }}>Projects</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '2rem', color: '#fff' }}>{codeStats.code_stats?.length || 0}</p>
        </div>
      </div>

      {/* Code by Project */}
      <div style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Code by Project</h2>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '1rem', color: '#888', fontWeight: 500, fontSize: '0.85rem' }}>Project</th>
              <th style={{ textAlign: 'right', padding: '1rem', color: '#888', fontWeight: 500, fontSize: '0.85rem' }}>Files</th>
              <th style={{ textAlign: 'right', padding: '1rem', color: '#888', fontWeight: 500, fontSize: '0.85rem' }}>Lines</th>
            </tr>
          </thead>
          <tbody>
            {codeStats.code_stats?.map((p: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '1rem', color: '#fff' }}>{p.project}</td>
                <td style={{ textAlign: 'right', padding: '1rem', color: '#888' }}>{p.files}</td>
                <td style={{ textAlign: 'right', padding: '1rem', color: '#4af' }}>{p.lines?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Activity */}
      <div style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Recent Activity</h2>
        </div>
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          {activity.activity?.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {activity.activity.map((a: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '0.75rem 1rem', width: '80px' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        background: a.type === 'session' ? '#1a1a3a' : '#1a3a1a', 
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        color: a.type === 'session' ? '#7a7aff' : '#4af'
                      }}>
                        {a.type}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#fff', fontSize: '0.85rem' }}>{a.description}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#666', fontSize: '0.8rem' }}>{a.timestamp || a.status || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No recent activity</p>
          )}
        </div>
      </div>
    </main>
  );
}
