// app/code/page.tsx - Code & Activity Page with Tailwind
import { getCodeStats, getActivity } from '../../lib/connectors/HermesConnector';
import PageHeader from '../components/PageHeader';

export const dynamic = 'force-dynamic';

export default async function CodePage() {
  let codeStats = { code_stats: [] as any[] };
  let activity = { activity: [] as any[] };

  try { codeStats = (await getCodeStats()) || codeStats; } catch {}
  try { activity = (await getActivity()) || activity; } catch {}

  const totalLines = codeStats.code_stats?.reduce((acc: number, p: any) => acc + (p.lines || 0), 0) || 0;
  const totalFiles = codeStats.code_stats?.reduce((acc: number, p: any) => acc + (p.files || 0), 0) || 0;

  const sortedActivity = [...(activity.activity || [])].sort((a: any, b: any) => {
    if (a.type === 'session' && b.type !== 'session') return -1;
    if (a.type !== 'session' && b.type === 'session') return 1;
    return 0;
  });

  return (
    <div>
      <PageHeader title="Code & Activity" icon="💻" subtitle="Project stats and activity" />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Lines</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{totalLines.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Total Files</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{totalFiles}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Projects</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{codeStats.code_stats?.length || 0}</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Code by Project */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">📁 Code by Project</h2>
          </div>
          <div className="p-2">
            {codeStats.code_stats?.length > 0 ? codeStats.code_stats.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-3 py-3 bg-white rounded-md border border-gray-200 mb-1">
                <div>
                  <div className="text-sm font-medium text-gray-900">{p.project}</div>
                  <div className="text-xs text-gray-500">{p.files} files</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">{p.lines?.toLocaleString()}</div>
                  <div className="text-[0.65rem] text-gray-400">lines</div>
                </div>
              </div>
            )) : (
              <p className="p-8 text-center text-gray-400">No data</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">⚡ Recent Activity</h2>
            <span className="text-xs text-gray-500">{sortedActivity.length} events</span>
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {sortedActivity.length > 0 ? sortedActivity.map((a: any, i: number) => (
              <div key={i} className={`
                flex items-center gap-3 px-3 py-2 bg-white rounded-md mb-1
                border-l-[3px] ${a.type === 'session' ? 'border-l-green-500' : 'border-l-yellow-500'}
              `}>
                <span className={`
                  px-2 py-0.5 rounded text-[0.65rem] uppercase font-medium
                  ${a.type === 'session' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}
                `}>
                  {a.type}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 truncate">{a.description}</div>
                </div>
                <div className="text-xs text-gray-400 whitespace-nowrap">
                  {a.timestamp ? new Date(a.timestamp).toLocaleDateString('es-AR') : a.status || ''}
                </div>
              </div>
            )) : (
              <p className="p-8 text-center text-gray-400">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
