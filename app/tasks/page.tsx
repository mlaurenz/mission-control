// app/tasks/page.tsx - Tasks Page
import { getKanbanBoards, getKanbanTasks } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  let boards = { boards: [] };
  let tasks = { tasks: [] };

  try { boards = await getKanbanBoards(); } catch (e) {}
  try { tasks = await getKanbanTasks(); } catch (e) {}

  // Group tasks by status
  const tasksByStatus = {
    todo: (tasks.tasks || []).filter((t: any) => t.status === 'todo'),
    ready: (tasks.tasks || []).filter((t: any) => t.status === 'ready'),
    running: (tasks.tasks || []).filter((t: any) => t.status === 'running'),
    blocked: (tasks.tasks || []).filter((t: any) => t.status === 'blocked'),
    review: (tasks.tasks || []).filter((t: any) => t.status === 'review'),
    done: (tasks.tasks || []).filter((t: any) => t.status === 'done'),
  };

  const total = (tasks.tasks || []).length;

  return (
    <main style={{ color: '#e0e0e0' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>📋 Tasks</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.85rem' }}>
          Kanban boards and tasks
        </p>
      </header>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Todo', key: 'todo', color: '#666' },
          { label: 'Ready', key: 'ready', color: '#60a5fa' },
          { label: 'Running', key: 'running', color: '#4ade80' },
          { label: 'Blocked', key: 'blocked', color: '#f87171' },
          { label: 'Review', key: 'review', color: '#f59e0b' },
          { label: 'Done', key: 'done', color: '#22c55e' },
        ].map((col) => (
          <div key={col.key} style={{ background: '#141414', padding: '1rem', borderRadius: '8px', border: '1px solid #333', textAlign: 'center' }}>
            <p style={{ margin: 0, color: col.color, fontSize: '1.5rem', fontWeight: 600 }}>{tasksByStatus[col.key as keyof typeof tasksByStatus].length}</p>
            <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.7rem' }}>{col.label}</p>
          </div>
        ))}
      </div>

      {/* Boards */}
      <h2 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1rem' }}>Boards: {(boards.boards || []).join(', ') || 'None'}</h2>

      {/* Tasks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {['todo', 'ready', 'running', 'blocked', 'review', 'done'].map((status) => (
          <div key={status} style={{ background: '#141414', borderRadius: '8px', border: '1px solid #333' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: '0.85rem', textTransform: 'capitalize' }}>{status}</span>
              <span style={{ color: '#666', fontSize: '0.75rem' }}>{tasksByStatus[status as keyof typeof tasksByStatus].length}</span>
            </div>
            <div style={{ padding: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {tasksByStatus[status as keyof typeof tasksByStatus].length > 0 ? (
                tasksByStatus[status as keyof typeof tasksByStatus].map((t: any, i: number) => (
                  <div key={i} style={{ padding: '0.5rem', background: '#1a1a1a', borderRadius: '4px', marginBottom: '0.25rem' }}>
                    <div style={{ color: '#fff', fontSize: '0.8rem' }}>{t.title || 'Untitled'}</div>
                    {t.board && <div style={{ color: '#666', fontSize: '0.7rem' }}>{t.board}</div>}
                  </div>
                ))
              ) : (
                <p style={{ padding: '1rem', textAlign: 'center', color: '#444', fontSize: '0.75rem' }}>No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
