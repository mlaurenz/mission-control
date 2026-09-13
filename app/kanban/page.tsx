'use client';
export const dynamic = 'force-dynamic';
// app/kanban/page.tsx - Projects view (boards = projects)
import PageHeader from '../components/PageHeader';
import RefreshIndicator from '../components/RefreshIndicator';
import { useAutoRefresh } from '../components/useAutoRefresh';
import { useState } from 'react';

interface ProjectsData {
  kanbanBoards: any;
  kanbanTasks: any;
}

const STATUS_ORDER = ['blocked', 'ready', 'todo', 'done', 'archived'];
const STATUS_COLORS: Record<string, string> = {
  blocked: 'bg-red-100 text-red-700 border-red-200',
  ready: 'bg-blue-100 text-blue-700 border-blue-200',
  todo: 'bg-gray-100 text-gray-700 border-gray-200',
  done: 'bg-green-100 text-green-700 border-green-200',
  archived: 'bg-gray-50 text-gray-400 border-gray-200',
};

export default function KanbanPage() {
  const { data, loading, lastUpdated, refetch } = useAutoRefresh<ProjectsData>({
    url: '/api/projects',
    interval: 10000,
  });

  const [expandedBoard, setExpandedBoard] = useState<string | null>(null);

  const boards = data?.kanbanBoards?.boards || [];
  const tasks = data?.kanbanTasks?.tasks || [];

  // Group tasks by board
  const tasksByBoard: Record<string, any[]> = {};
  tasks.forEach((t: any) => {
    const board = t.board || 'default';
    if (!tasksByBoard[board]) tasksByBoard[board] = [];
    tasksByBoard[board].push(t);
  });

  const activeBoards = boards.filter((b: any) => !b.archived);
  const archivedBoards = boards.filter((b: any) => b.archived);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  function formatDate(d: string) {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  }

  function renderBoard(board: any) {
    const c = board.counts || {};
    const total = board.total || 0;
    const isExpanded = expandedBoard === board.slug;
    const boardTasks = tasksByBoard[board.slug] || [];

    // Group board tasks by status
    const grouped: Record<string, any[]> = {};
    STATUS_ORDER.forEach(s => { grouped[s] = []; });
    boardTasks.forEach((t: any) => {
      const s = t.status?.toLowerCase() || 'todo';
      if (grouped[s]) grouped[s].push(t);
    });

    return (
      <div key={board.slug} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm">
        <button
          onClick={() => setExpandedBoard(isExpanded ? null : board.slug)}
          className="w-full text-left p-4 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">{board.name}</h3>
              {board.is_current && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[0.6rem] rounded font-medium uppercase">current</span>
              )}
              {board.archived && (
                <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 text-[0.6rem] rounded font-medium uppercase">archived</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{total} tasks</span>
              <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
            </div>
          </div>

          {/* Status distribution bar */}
          {total > 0 && (
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 mb-2">
              {(c.done || 0) > 0 && <div className="bg-green-500 transition-all" style={{ width: `${((c.done || 0) / total) * 100}%` }} />}
              {(c.ready || 0) > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${((c.ready || 0) / total) * 100}%` }} />}
              {(c.todo || 0) > 0 && <div className="bg-gray-400 transition-all" style={{ width: `${((c.todo || 0) / total) * 100}%` }} />}
              {(c.blocked || 0) > 0 && <div className="bg-red-500 transition-all" style={{ width: `${((c.blocked || 0) / total) * 100}%` }} />}
              {(c.archived || 0) > 0 && <div className="bg-gray-300 transition-all" style={{ width: `${((c.archived || 0) / total) * 100}%` }} />}
            </div>
          )}

          {/* Counts row */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            {(c.todo || 0) > 0 && <span>{c.todo} todo</span>}
            {(c.ready || 0) > 0 && <span className="text-blue-600">{c.ready} ready</span>}
            {(c.blocked || 0) > 0 && <span className="text-red-600 font-medium">{c.blocked} blocked</span>}
            {(c.done || 0) > 0 && <span className="text-green-600">{c.done} done</span>}
            {(c.archived || 0) > 0 && <span className="text-gray-400">{c.archived} archived</span>}
            {board.created_at && <span className="ml-auto text-gray-400">Created {formatDate(board.created_at)}</span>}
          </div>
        </button>

        {/* Expanded: tasks grouped by status */}
        {isExpanded && (
          <div className="border-t border-gray-200 p-4 bg-white">
            {boardTasks.length > 0 ? (
              <div className="space-y-4">
                {STATUS_ORDER.map(status => {
                  const statusTasks = grouped[status];
                  if (!statusTasks || statusTasks.length === 0) return null;
                  return (
                    <div key={status}>
                      <h4 className={`text-xs font-semibold uppercase mb-2 ${
                        status === 'blocked' ? 'text-red-600' : status === 'done' ? 'text-green-600' : status === 'ready' ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {status} ({statusTasks.length})
                      </h4>
                      <div className="space-y-1">
                        {statusTasks.map((task: any, i: number) => (
                          <div key={i} className={`p-2.5 rounded-md border text-sm ${
                            status === 'blocked' ? 'border-l-2 border-l-red-500 border-red-200 bg-red-50/50' : 'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-900">{task.title}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[0.6rem] font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
                                {status}
                              </span>
                            </div>
                            <div className="text-[0.65rem] text-gray-400 mt-1">
                              {task.created_at && <span>Created {formatDate(task.created_at)}</span>}
                              {task.started_at && <span className="ml-3">Started {formatDate(task.started_at)}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4 text-sm">No tasks in this project</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle={`${activeBoards.length} active projects · ${tasks.length} total tasks`}
        rightContent={<RefreshIndicator lastUpdated={lastUpdated} loading={loading} onRefresh={refetch} />}
      />

      {/* Active boards */}
      {activeBoards.length > 0 ? (
        <div className="space-y-3 mb-6">
          {activeBoards.map((board: any) => renderBoard(board))}
        </div>
      ) : (
        <div className="bg-gray-50 p-12 rounded-xl text-center border border-gray-200">
          <p className="text-gray-400">No active projects</p>
        </div>
      )}

      {/* Archived boards */}
      {archivedBoards.length > 0 && (
        <details className="mt-6">
          <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700 mb-3">
            Archived projects ({archivedBoards.length})
          </summary>
          <div className="space-y-3 opacity-75">
            {archivedBoards.map((board: any) => renderBoard(board))}
          </div>
        </details>
      )}
    </div>
  );
}
