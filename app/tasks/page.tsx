'use client';
export const dynamic = 'force-dynamic';
// app/tasks/page.tsx - Tasks with auto-refresh, unified light theme
import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { useState } from 'react';

interface TasksData {
  kanbanBoards: any;
  kanbanTasks: any;
}

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'border-gray-400', badge: 'text-gray-600' },
  { key: 'ready', label: 'Ready', color: 'border-blue-500', badge: 'text-blue-600' },
  { key: 'running', label: 'In Progress', color: 'border-yellow-500', badge: 'text-yellow-600' },
  { key: 'blocked', label: 'Blocked', color: 'border-red-500', badge: 'text-red-600' },
  { key: 'review', label: 'In Review', color: 'border-orange-500', badge: 'text-orange-600' },
  { key: 'done', label: 'Done', color: 'border-green-500', badge: 'text-green-600' },
];

export default function TasksPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<TasksData>({
    url: '/api/tasks',
    interval: 10000,
  });

  const [activeBoard, setActiveBoard] = useState<string | null>(null);

  const tasksList = data?.kanbanTasks?.tasks || [];
  const boardsList = data?.kanbanBoards?.boards || [];
  const isOffline = data && !data.kanbanTasks;

  // Filter by active board
  const filteredTasks = activeBoard
    ? tasksList.filter((t: any) => (t.board || 'default') === activeBoard)
    : tasksList;

  const tasksByStatus: Record<string, any[]> = {};
  COLUMNS.forEach(col => { tasksByStatus[col.key] = []; });
  filteredTasks.forEach((t: any) => {
    const status = t.status?.toLowerCase() || 'todo';
    if (tasksByStatus[status]) tasksByStatus[status].push(t);
  });

  const blockedCount = tasksByStatus['blocked'].length;

  const visibleColumns = COLUMNS.filter(col => {
    if (col.key === 'running' || col.key === 'done') return tasksByStatus[col.key].length > 0;
    return true;
  });

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Team Tasks"
        icon="📋"
        subtitle={isOffline ? '⚠️ Bridge offline' : `${filteredTasks.length} tasks${activeBoard ? ` in ${activeBoard}` : ''}`}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-500">
          <span className="text-gray-900 font-medium">{filteredTasks.length}</span> total
        </div>
        {COLUMNS.slice(0, 4).map(col => (
          <div key={col.key} className="text-sm text-gray-500">
            <span className={`font-medium ${col.badge}`}>{tasksByStatus[col.key].length}</span> {col.label}
          </div>
        ))}
      </div>

      {/* Board columns */}
      <div className="grid gap-3 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${visibleColumns.length}, minmax(150px, 1fr))` }}>
        {visibleColumns.map(col => {
          const isBlocked = col.key === 'blocked';
          return (
            <div key={col.key}>
              <div className={`p-3 border-b-2 ${col.color} mb-3 rounded-t relative ${isBlocked && blockedCount > 0 ? 'bg-red-50 shadow-[0_0_12px_rgba(239,68,68,0.2)]' : ''}`}>
                {isBlocked && blockedCount > 0 && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded uppercase">⚠ Alert</span>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    {isBlocked && blockedCount > 0 ? `⚡ ${col.label}` : col.label}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{tasksByStatus[col.key].length}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 min-h-[200px]">
                {tasksByStatus[col.key].length > 0 ? (
                  tasksByStatus[col.key].map((task: any, i: number) => (
                    <div key={i} className={`p-3 bg-gray-50 rounded-md border ${isBlocked ? 'border-red-200' : 'border-gray-200'} hover:shadow-sm transition-shadow`}>
                      <div className="text-sm text-gray-900 leading-snug mb-2">{task.title || 'Untitled'}</div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">{task.board || 'default'}</span>
                        {task.assignee && <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{task.assignee}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-300 text-xs border border-dashed border-gray-200 rounded-md">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Board switcher */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <span className="text-sm text-gray-500 mr-3">Board:</span>
        <button
          onClick={() => setActiveBoard(null)}
          className={`mr-1.5 mb-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
            ${!activeBoard ? 'bg-blue-100 border border-blue-400 text-blue-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}
        >
          All
        </button>
        {boardsList.map((board: any) => (
          <button
            key={board.slug}
            onClick={() => setActiveBoard(board.slug)}
            className={`mr-1.5 mb-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
              ${activeBoard === board.slug ? 'bg-blue-100 border border-blue-400 text-blue-700' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'}`}
          >
            {board.name || board.slug}
          </button>
        ))}
      </div>
    </div>
  );
}
