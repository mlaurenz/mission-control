'use client';
export const dynamic = 'force-dynamic';
// app/tasks/page.tsx - Flat view of ALL tasks grouped by status
import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { useState } from 'react';

interface TasksData {
  kanbanBoards: any;
  kanbanTasks: any;
}

const STATUS_ORDER = ['blocked', 'ready', 'todo', 'done', 'archived'];
const STATUS_CONFIG: Record<string, { label: string; headerBg: string; badge: string; border: string }> = {
  blocked: { label: 'Blocked', headerBg: 'bg-red-500', badge: 'text-red-600', border: 'border-t-red-500' },
  ready: { label: 'Ready', headerBg: 'bg-blue-500', badge: 'text-blue-600', border: 'border-t-blue-500' },
  todo: { label: 'To Do', headerBg: 'bg-gray-400', badge: 'text-gray-600', border: 'border-t-gray-400' },
  done: { label: 'Done', headerBg: 'bg-green-500', badge: 'text-green-600', border: 'border-t-green-500' },
  archived: { label: 'Archived', headerBg: 'bg-gray-300', badge: 'text-gray-400', border: 'border-t-gray-300' },
};

export default function TasksPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<TasksData>({
    url: '/api/tasks',
    interval: 10000,
  });

  const [activeBoard, setActiveBoard] = useState<string | null>(null);

  const tasksList = data?.kanbanTasks?.tasks || [];
  const boardsList = data?.kanbanBoards?.boards || [];

  // Filter by active board
  const filteredTasks = activeBoard
    ? tasksList.filter((t: any) => (t.board || 'default') === activeBoard)
    : tasksList;

  // Group by status
  const tasksByStatus: Record<string, any[]> = {};
  STATUS_ORDER.forEach(s => { tasksByStatus[s] = []; });
  filteredTasks.forEach((t: any) => {
    const status = t.status?.toLowerCase() || 'todo';
    if (tasksByStatus[status]) tasksByStatus[status].push(t);
    else tasksByStatus['todo'].push(t);
  });

  // Board name lookup
  const boardNames: Record<string, string> = {};
  boardsList.forEach((b: any) => { boardNames[b.slug] = b.name; });

  const visibleStatuses = STATUS_ORDER.filter(s => tasksByStatus[s].length > 0);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  function formatDate(d: string) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
    catch { return d; }
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle={`${filteredTasks.length} tasks${activeBoard ? ` in ${boardNames[activeBoard] || activeBoard}` : ' across all projects'}`}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500">
          <span className="text-gray-900 font-semibold">{filteredTasks.length}</span> total
        </div>
        {STATUS_ORDER.map(s => {
          const count = tasksByStatus[s].length;
          if (count === 0) return null;
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="text-sm text-gray-500">
              <span className={`font-semibold ${cfg.badge}`}>{count}</span> {cfg.label}
            </div>
          );
        })}
      </div>

      {/* Board filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setActiveBoard(null)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
            ${!activeBoard ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          All
        </button>
        {boardsList.map((board: any) => (
          <button
            key={board.slug}
            onClick={() => setActiveBoard(board.slug)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
              ${activeBoard === board.slug ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {board.name || board.slug}
          </button>
        ))}
      </div>

      {/* Status columns */}
      {visibleStatuses.length > 0 ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(visibleStatuses.length, 5)}, minmax(180px, 1fr))` }}>
          {visibleStatuses.map(status => {
            const cfg = STATUS_CONFIG[status];
            const isBlocked = status === 'blocked';
            return (
              <div key={status}>
                <div className={`p-3 border-t-2 ${cfg.border} rounded-t mb-2 ${isBlocked ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">{cfg.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${isBlocked ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
                      {tasksByStatus[status].length}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  {tasksByStatus[status].map((task: any, i: number) => (
                    <div key={i} className={`p-3 rounded-md border transition-shadow hover:shadow-sm ${
                      isBlocked ? 'border-l-2 border-l-red-500 border-red-200 bg-white' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="text-sm text-gray-900 leading-snug mb-1.5">{task.title || 'Untitled'}</div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">{boardNames[task.board] || task.board || 'default'}</span>
                        {task.created_at && <span className="text-gray-400">{formatDate(task.created_at)}</span>}
                      </div>
                      {task.started_at && (
                        <div className="text-[0.6rem] text-gray-400 mt-1">Started {formatDate(task.started_at)}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
          <p className="text-gray-400">No tasks found</p>
        </div>
      )}
    </div>
  );
}
