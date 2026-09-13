// app/page.tsx - Mission Control Dashboard (Tailwind)
import { getHealth, getSessions, getCron, getKanbanBoards, getKanbanTasks, getSkills } from '../lib/connectors/HermesConnector';
import PageHeader from './components/PageHeader';
import StatCard from './components/StatCard';
import Card from './components/Card';
import { timeAgo } from '../lib/utils/time';
import { categorizeSkills, CAT_LABELS } from '../lib/utils/skills';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let health = { status: 'unknown', timestamp: '' };
  let sessions = { sessions: [] as any[] };
  let cron = { cron_jobs: [] as any[] };
  let kanbanBoards = { boards: [] as any[] };
  let kanbanTasks = { tasks: [] as any[] };
  let skills = { skills: [] as string[] };

  const safe = async (fn: () => Promise<any>, fallback: any) => {
    try { return (await fn()) || fallback; } catch { return fallback; }
  };

  [health, sessions, cron, kanbanBoards, kanbanTasks, skills] = await Promise.all([
    safe(getHealth, health),
    safe(getSessions, sessions),
    safe(getCron, cron),
    safe(getKanbanBoards, kanbanBoards),
    safe(getKanbanTasks, kanbanTasks),
    safe(getSkills, skills),
  ]);

  // Task counts
  const counts: Record<string, number> = { todo: 0, ready: 0, running: 0, blocked: 0, review: 0, done: 0 };
  kanbanTasks.tasks?.forEach((t: any) => {
    const s = t.status?.toLowerCase() || 'todo';
    if (counts[s] !== undefined) counts[s]++;
  });

  // Board stats
  const boardStats: Record<string, { done: number; total: number }> = {};
  kanbanTasks.tasks?.forEach((t: any) => {
    const board = t.board?.name || t.boardName || 'unknown';
    if (!boardStats[board]) boardStats[board] = { done: 0, total: 0 };
    boardStats[board].total++;
    if (t.status?.toLowerCase() === 'done') boardStats[board].done++;
  });

  const recentSessions = sessions.sessions?.slice(0, 8) || [];
  const categorized = categorizeSkills(skills.skills || []);
  const sortedCats = Object.keys(categorized).sort();

  return (
    <div>
      <PageHeader
        title="Mission Control"
        subtitle="Hermes Operations Dashboard"
        status={health.status === 'healthy' ? 'online' : 'offline'}
        statusTimestamp={health.timestamp}
      />

      {/* FAB */}
      <Link href="/kanban" title="Add Task" className="fixed bottom-6 right-6 bg-gray-900 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl z-50 text-2xl font-light hover:bg-gray-700 transition-colors no-underline">
        +
      </Link>

      {/* Stats Grid */}
      <section className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <StatCard label="Total Tasks" value={kanbanTasks.tasks?.length || 0} />
          <StatCard label="Ready" value={counts.ready} variant="blue" />
          <StatCard
            label="⚡ Blocked"
            value={counts.blocked}
            variant={counts.blocked > 0 ? 'alert' : 'red'}
            alertLabel={counts.blocked > 0 ? 'Alert' : undefined}
            subtext={counts.blocked > 0 ? 'needs attention' : undefined}
          />
          {counts.running > 0 && (
            <StatCard label="Running" value={counts.running} variant="yellow" subtext="in progress" />
          )}
          {counts.done > 0 && (
            <StatCard label="Done" value={counts.done} variant="green" subtext="completed" />
          )}
          <StatCard label="Todo" value={counts.todo} />
        </div>
      </section>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Sessions */}
        <Card title="Recent Sessions">
          <div className="max-h-72 overflow-auto">
            {recentSessions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {recentSessions.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                    <span className="text-sm text-gray-900 truncate mr-3">{s.title?.substring(0, 40) || 'Untitled'}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                      {timeAgo(s.last_active)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No sessions</p>
            )}
          </div>
        </Card>

        {/* Cron Jobs */}
        <Card title="Scheduled Jobs">
          <div className="max-h-72 overflow-auto">
            {cron.cron_jobs?.length > 0 ? (
              <div className="flex flex-col gap-2">
                {cron.cron_jobs.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                    <span className="text-sm text-gray-900">{c.name}</span>
                    <span className="text-xs text-gray-500 font-mono">{c.schedule}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">⏰</div>
                <p className="text-gray-400 mb-3">No scheduled jobs yet</p>
                <Link href="/schedule" className="inline-block bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors no-underline">
                  Schedule your first job →
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Kanban Boards */}
        <Card title="Kanban Boards">
          <div className="grid grid-cols-2 gap-2">
            {kanbanBoards.boards?.map((b: any, i: number) => {
              const stats = boardStats[b.name] || { done: 0, total: b.total || 0 };
              const pct = stats.total > 0 ? (stats.done / stats.total) * 100 : 0;
              const barColor = pct === 100 ? 'bg-green-500' : pct > 50 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={i} className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{b.name}</p>
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 rounded">{stats.total}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[0.65rem] text-gray-400">Done: {stats.done}</span>
                    <span className="text-[0.65rem] text-gray-400">{Math.round(pct)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Skills */}
        <Card title="Installed Skills">
          <div className="max-h-80 overflow-auto">
            {sortedCats.map(cat => (
              <details key={cat} className="border border-gray-200 rounded-md mb-1.5 bg-white">
                <summary className="px-3 py-2 text-sm font-semibold text-gray-600 cursor-pointer select-none hover:bg-gray-50">
                  {CAT_LABELS[cat] || cat} ({categorized[cat].length})
                </summary>
                <div className="flex gap-1.5 flex-wrap px-3 pb-3 pt-1">
                  {categorized[cat].map((s: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                      {s}
                    </span>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
