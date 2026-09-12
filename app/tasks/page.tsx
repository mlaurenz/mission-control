// app/tasks/page.tsx - Tasks Page (Clean Style)
import { getKanbanBoards, getKanbanTasks } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  let boards = { boards: [] };
  let tasks = { tasks: [] };

  try { boards = await getKanbanBoards(); } catch (e) {}
  try { tasks = await getKanbanTasks(); } catch (e) {}

  const tasksByStatus = {
    todo: (tasks.tasks || []).filter((t: any) => t.status === 'todo'),
    ready: (tasks.tasks || []).filter((t: any) => t.status === 'ready'),
    running: (tasks.tasks || []).filter((t: any) => t.status === 'running'),
    blocked: (tasks.tasks || []).filter((t: any) => t.status === 'blocked'),
    review: (tasks.tasks || []).filter((t: any) => t.status === 'review'),
    done: (tasks.tasks || []).filter((t: any) => t.status === 'done'),
  };

  return (
    <main style={{ color: '#1a1a1a', background: '#ffffff' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1a1a1a', fontWeight: 600 }}>📋 Tasks</h1>
        <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>Kanban boards and tasks</p>
      </header>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
        {[
          { label: 'Todo', key: 'todo', color: '#6b7280' },
          { label: 'Ready', key: 'ready', color: '#2563eb' },
          { label: 'Running', key: 'running', color: '#16a34a' },
          { label: 'Blocked', key: 'blocked', color: '#dc2626' },
          { label: 'Review', key: 'review', color: '#d97706' },
          { label: 'Done', key: 'done', color: '#16a34a' },
        ].map((col) => (
          <div key={col.key} style={{ background: '#fafafa', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e5e5', textAlign: 'center' }}>
            <p style={{ margin: 0, color: col.color, fontSize: '1.5rem', fontWeight: 600 }}>{tasksByStatus[col.key as keyof typeof tasksByStatus].length}</p>
            <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.7rem', textTransform: 'uppercase' }}>{col.label}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.1rem', color: '#1a1a1a', marginBottom: '1rem', fontWeight: 600 }}>Boards: {(boards.boards || []).join(', ') || 'None'}</h2>

      {/* Tasks Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {['todo', 'ready', 'running', 'blocked', 'review', 'done'].map((status) => (
          <div key={status} style={{ background: '#fafafa', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#1a1a1a', fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: 500 }}>{status}</span>
              <span style={{ color: '#666', fontSize: '0.75rem' }}>{tasksByStatus[status as keyof typeof tasksByStatus].length}</span>
            </div>
            <div style={{ padding: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {tasksByStatus[status as keyof typeof tasksByStatus].length > 0 ? (
                tasksByStatus[status as keyof typeof tasksByStatus].map((t: any, i: number) => (
                  <div key={i} style={{ padding: '0.625rem', background: '#ffffff', borderRadius: '4px', marginBottom: '0.25rem', border: '1px solid #e5e5e5' }}>
                    <div style={{ color: '#1a1a1a', fontSize: '0.8rem', fontWeight: 500 }}>{t.title || 'Untitled'}</div>
                    {t.board && <div style={{ color: '#666', fontSize: '0.7rem' }}>{t.board}</div>}
                  </div>
                ))
              ) : (
                <p style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '0.75rem' }}>No tasks</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
