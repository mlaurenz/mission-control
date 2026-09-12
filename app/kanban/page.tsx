// app/kanban/page.tsx - Kanban Boards Page (Clean Style)
import { getKanbanBoards, getKanbanTasks } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function KanbanPage() {
  let boards = { boards: [] };
  let tasks = { tasks: [] };

  try { boards = await getKanbanBoards(); } catch (e) {}
  try { tasks = await getKanbanTasks(); } catch (e) {}

  const boardList = boards.boards || [];
  
  // Group tasks by board
  const tasksByBoard: Record<string, any[]> = {};
  (tasks.tasks || []).forEach((t: any) => {
    const board = t.board || 'default';
    if (!tasksByBoard[board]) tasksByBoard[board] = [];
    tasksByBoard[board].push(t);
  });

  return (
    <main style={{ color: '#1a1a1a', background: '#ffffff' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>📋 Kanban Boards</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>
          All projects and their tasks
        </p>
      </header>

      {/* Boards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {boardList.map((board: any) => {
          const boardTasks = tasksByBoard[board.slug] || [];
          const taskCounts = board.counts || {};
          
          return (
            <div key={board.slug} style={{ 
              background: '#fafafa', 
              borderRadius: '8px', 
              border: '1px solid #e5e5e5',
              overflow: 'hidden'
            }}>
              {/* Board Header */}
              <div style={{ 
                padding: '1rem', 
                borderBottom: '1px solid #e5e5e5',
                background: board.is_current ? '#dcfce7' : '#f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1a1a1a', fontWeight: 600 }}>
                    {board.name}
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: '#666' }}>{board.slug}</span>
                </div>
                <span style={{ 
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  background: '#ffffff',
                  color: '#2563eb',
                  fontWeight: 500
                }}>
                  {board.total} tasks
                </span>
              </div>

              {/* Task Counts */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                padding: '0.75rem 1rem',
                borderBottom: '1px solid #e5e5e5',
                flexWrap: 'wrap'
              }}>
                {Object.entries(taskCounts).map(([status, count]: [string, any]) => (
                  <span key={status} style={{ 
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    background: status === 'ready' ? '#dbeafe' :
                               status === 'done' ? '#dcfce7' :
                               status === 'blocked' ? '#fee2e2' :
                               status === 'running' ? '#fef3c7' :
                               status === 'todo' ? '#f3f4f6' : '#f3f4f6',
                    color: status === 'ready' ? '#2563eb' :
                           status === 'done' ? '#16a34a' :
                           status === 'blocked' ? '#dc2626' :
                           status === 'running' ? '#d97706' : '#666'
                  }}>
                    {status}: {count}
                  </span>
                ))}
              </div>

              {/* Tasks Preview */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                {boardTasks.length > 0 ? boardTasks.slice(0, 5).map((task: any, i: number) => (
                  <div key={i} style={{ 
                    padding: '0.5rem 0.75rem',
                    background: '#ffffff',
                    borderRadius: '4px',
                    marginBottom: '0.25rem',
                    border: '1px solid #e5e5e5'
                  }}>
                    <div style={{ color: '#1a1a1a', fontSize: '0.8rem', fontWeight: 500 }}>
                      {task.title || 'Untitled'}
                    </div>
                    <div style={{ color: '#666', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                      {task.status}
                    </div>
                  </div>
                )) : (
                  <p style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '0.75rem' }}>
                    No tasks
                  </p>
                )}
                {boardTasks.length > 5 && (
                  <p style={{ padding: '0.5rem', textAlign: 'center', color: '#666', fontSize: '0.7rem' }}>
                    +{boardTasks.length - 5} more tasks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
