// app/kanban/page.tsx - Kanban Board Page
import { getKanbanBoards, getKanbanTasks } from '@/lib/connectors/HermesConnector';

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

  const tasksByBoard: Record<string, Record<string, any[]>> = {};
  boardsList.forEach((b: any) => {
    tasksByBoard[b.slug] = {};
    COLUMNS.forEach(col => { tasksByBoard[b.slug][col] = []; });
  });

  tasksList.forEach((t: any) => {
    const board = t.board || 'default';
    const status = t.status?.toLowerCase() || 'todo';
    if (tasksByBoard[board]?.[status]) {
      tasksByBoard[board][status].push(t);
    }
  });

  return (
    <main style={{ minHeight: '100vh', background: '#ffffff', color: '#1a1a1a', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '2px solid #e5e5e5', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#1a1a1a', fontWeight: 700 }}>📋 Kanban Board</h1>
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>
              {isOffline ? '⚠️ Bridge offline' : 'Todas las tareas de Hermes'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {boardsList.map((board: any) => (
              <span key={board.slug} style={{
                padding: '0.25rem 0.75rem', background: '#f0f0f0', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600
              }}>
                {board.name || board.slug} ({board.total || 0})
              </span>
            ))}
          </div>
        </div>
      </header>

      {isOffline ? (
        <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
          <p style={{ margin: 0, color: '#92400e', fontSize: '1rem' }}>
            ⚠️ <strong>Bridge offline</strong><br/>
            <span style={{ fontSize: '0.9rem' }}>El bridge de Hermes no está alcanzable desde Vercel. Mostrando último estado conocido.</span>
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {boardsList.map((board: any) => {
            const boardTasks = tasksByBoard[board.slug] || {};
            const totalBoardTasks = Object.values(boardTasks).flat().length;
            const blockedCount = boardTasks['blocked']?.length || 0;
            
            return (
              <section key={board.slug} style={{
                background: '#fafafa', borderRadius: '12px', padding: '1.5rem',
                border: blockedCount > 0 ? '2px solid #ef4444' : '1px solid #e5e5e5'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#1a1a1a' }}>
                    {board.name || board.slug}
                    {blockedCount > 0 && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>⚠ {blockedCount} blocked</span>}
                  </h2>
                  <span style={{ color: '#666', fontSize: '0.85rem' }}>{totalBoardTasks} tareas</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`, gap: '0.5rem' }}>
                  {COLUMNS.map(col => {
                    const colTasks = boardTasks[col] || [];
                    if (colTasks.length === 0) return null;
                    return (
                      <div key={col} style={{ background: '#fff', borderRadius: '8px', padding: '0.75rem', border: '1px solid #e5e5e5' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                          {columnLabels[col]} ({colTasks.length})
                        </div>
                        {colTasks.map((task: any, i: number) => (
                          <div key={i} style={{
                            background: '#f9f9f9', borderRadius: '4px', padding: '0.5rem',
                            marginBottom: '0.25rem', fontSize: '0.75rem', borderLeft: col === 'blocked' ? '3px solid #ef4444' : '3px solid #e5e5e5'
                          }}>
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
        <div style={{ background: '#fafafa', padding: '3rem', borderRadius: '12px', textAlign: 'center' }}>
          <p style={{ color: '#666', margin: 0 }}>No hay boards disponibles</p>
        </div>
      )}
    </main>
  );
}
