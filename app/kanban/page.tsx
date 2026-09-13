// app/kanban/page.tsx - Kanban Board with Tailwind
import { getKanbanBoards, getKanbanTasks } from '../../lib/connectors/HermesConnector';
import PageHeader from '../components/PageHeader';
import OfflineBanner from '../components/OfflineBanner';

export const dynamic = 'force-dynamic';

export default async function KanbanPage() {
  const boards = await getKanbanBoards();
  const tasks = await getKanbanTasks();

  const tasksList = tasks?.tasks || [];
  const boardsList = boards?.boards || [];
  const isOffline = !tasks;

  const COLUMNS = ['todo', 'ready', 'running', 'blocked', 'review', 'done', 'archived'];
  const columnLabels: Record<string, string> = {
    todo: 'TODO', ready: 'READY', running: 'IN PROGRESS',
    blocked: 'BLOCKED', review: 'REVIEW', done: 'DONE', archived: 'ARCHIVED'
  };
  const columnColors: Record<string, string> = {
    todo: 'border-gray-300', ready: 'border-blue-400', running: 'border-yellow-400',
    blocked: 'border-red-500', review: 'border-orange-400', done: 'border-green-500', archived: 'border-gray-400'
  };

  const tasksByBoard: Record<string, Record<string, any[]>> = {};
  boardsList.forEach((b: any) => {
    tasksByBoard[b.slug] = {};
    COLUMNS.forEach(col => { tasksByBoard[b.slug][col] = []; });
  });
  tasksList.forEach((t: any) => {
    const board = t.board || 'default';
    const status = t.status?.toLowerCase() || 'todo';
    if (tasksByBoard[board]?.[status]) tasksByBoard[board][status].push(t);
  });

  return (
    <div>
      <PageHeader
        title="Kanban Board"
        icon="📌"
        subtitle={isOffline ? '⚠️ Bridge offline' : 'Todas las tareas de Hermes'}
        rightContent={
          <div className="flex gap-1.5 flex-wrap">
            {boardsList.map((board: any) => (
              <span key={board.slug} className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-semibold text-gray-600">
                {board.name || board.slug} ({board.total || 0})
              </span>
            ))}
          </div>
        }
      />

      {isOffline ? (
        <OfflineBanner message="Mostrando último estado conocido" />
      ) : (
        <div className="space-y-6">
          {boardsList.map((board: any) => {
            const boardTasks = tasksByBoard[board.slug] || {};
            const totalBoardTasks = Object.values(boardTasks).flat().length;
            const blockedCount = boardTasks['blocked']?.length || 0;

            return (
              <section key={board.slug} className={`bg-gray-50 rounded-xl p-4 border ${blockedCount > 0 ? 'border-2 border-red-400' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold text-gray-900">
                    {board.name || board.slug}
                    {blockedCount > 0 && <span className="text-red-500 ml-2 text-sm">⚠ {blockedCount} blocked</span>}
                  </h2>
                  <span className="text-sm text-gray-500">{totalBoardTasks} tareas</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {COLUMNS.map(col => {
                    const colTasks = boardTasks[col] || [];
                    if (colTasks.length === 0) return null;
                    return (
                      <div key={col} className={`bg-white rounded-lg p-3 border-t-2 ${columnColors[col]}`}>
                        <div className="text-[0.65rem] font-bold text-gray-500 uppercase mb-2">
                          {columnLabels[col]} ({colTasks.length})
                        </div>
                        {colTasks.map((task: any, i: number) => (
                          <div key={i} className={`bg-gray-50 rounded p-2 mb-1 text-xs border-l-2 ${col === 'blocked' ? 'border-l-red-500' : 'border-l-gray-300'}`}>
                            {task.title || 'Untitled'}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {boardsList.length === 0 && !isOffline && (
        <div className="bg-gray-50 p-12 rounded-xl text-center">
          <p className="text-gray-400">No hay boards disponibles</p>
        </div>
      )}
    </div>
  );
}
