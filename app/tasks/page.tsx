// app/tasks/page.tsx - Tasks Page (Linear Dark Style)
import { getKanbanBoards, getKanbanTasks } from '@/lib/connectors/HermesConnector';

export const dynamic = 'force-dynamic';

// Hardcoded profiles as workers
const WORKERS = [
  { name: 'default', label: '🤖 Default', color: '#7170ff' },
  { name: 'automation', label: '⚙️ Automation', color: '#10b981' },
  { name: 'coder', label: '💻 Coder', color: '#f59e0b' },
  { name: 'research', label: '🔍 Research', color: '#06b6d4' },
  { name: 'social', label: '📱 Social', color: '#ec4899' },
  { name: 'consultant', label: '🎯 Consultant', color: '#8b5cf6' },
];

// Columns configuration
const COLUMNS = [
  { key: 'todo', label: 'To Do', color: '#8a8f98' },
  { key: 'ready', label: 'Ready', color: '#7170ff' },
  { key: 'running', label: 'In Progress', color: '#10b981' },
  { key: 'blocked', label: 'Blocked', color: '#ef4444' },
  { key: 'review', label: 'In Review', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#27a644' },
];

export default async function TasksPage() {
  let boards = { boards: [] };
  let tasks = { tasks: [] };

  try { boards = await getKanbanBoards(); } catch (e) {}
  try { tasks = await getKanbanTasks(); } catch (e) {}

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = (tasks.tasks || []).filter((t: any) => t.status === col.key);
    return acc;
  }, {} as Record<string, any[]>);

  const totalTasks = (tasks.tasks || []).length;

  return (
    <main style={{ 
      minHeight: '100vh', 
      background: '#08090a', 
      color: '#f7f8f8',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: '2rem'
    }}>
      {/* Header */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.75rem', 
            fontWeight: 510,
            letterSpacing: '-0.02em',
            color: '#f7f8f8'
          }}>Team Tasks</h1>
          <p style={{ margin: '0.5rem 0 0', color: '#8a8f98', fontSize: '0.875rem' }}>
            {(boards.boards || []).length > 0 ? boards.boards.join(', ') : 'No boards'}
          </p>
        </div>
        
        {/* Workers legend */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {WORKERS.map((w) => (
            <span key={w.name} style={{
              padding: '0.25rem 0.75rem',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: w.color
            }}>
              {w.label}
            </span>
          ))}
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        padding: '1rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ color: '#8a8f98', fontSize: '0.875rem' }}>
          <span style={{ color: '#f7f8f8', fontWeight: 510 }}>{totalTasks}</span> total tasks
        </div>
        {COLUMNS.slice(0, 4).map((col) => (
          <div key={col.key} style={{ color: '#8a8f98', fontSize: '0.875rem' }}>
            <span style={{ color: col.color, fontWeight: 510 }}>{tasksByStatus[col.key].length}</span> {col.label}
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(6, 1fr)', 
        gap: '0.75rem',
        alignItems: 'start'
      }}>
        {COLUMNS.map((col) => (
          <div key={col.key}>
            {/* Column Header */}
            <div style={{ 
              padding: '0.75rem',
              borderBottom: `2px solid ${col.color}`,
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.8125rem', 
                  fontWeight: 510,
                  color: '#f7f8f8',
                  letterSpacing: '0.02em'
                }}>
                  {col.label}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#62666d',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {tasksByStatus[col.key].length}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.5rem',
              minHeight: '200px'
            }}>
              {tasksByStatus[col.key].length > 0 ? (
                tasksByStatus[col.key].map((task: any, i: number) => (
                  <div key={i} style={{
                    padding: '0.875rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}>
                    <div style={{ 
                      fontSize: '0.8125rem', 
                      fontWeight: 400,
                      color: '#f7f8f8',
                      lineHeight: 1.4,
                      marginBottom: '0.5rem'
                    }}>
                      {task.title || 'Untitled'}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      fontSize: '0.6875rem'
                    }}>
                      <span style={{ color: '#62666d' }}>
                        {task.board || 'fonselp'}
                      </span>
                      {task.assignee && (
                        <span style={{ 
                          color: '#8a8f98',
                          background: 'rgba(255,255,255,0.04)',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '3px'
                        }}>
                          {task.assignee}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: '#62666d',
                  fontSize: '0.75rem',
                  border: '1px dashed rgba(255,255,255,0.06)',
                  borderRadius: '6px'
                }}>
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Board selector */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <span style={{ color: '#8a8f98', fontSize: '0.8125rem', marginRight: '0.75rem' }}>
          Switch Board:
        </span>
        {(boards.boards || []).map((board: string) => (
          <button key={board} style={{
            margin: '0 0.25rem 0.5rem 0',
            padding: '0.375rem 0.75rem',
            background: board === 'fonselp' ? 'rgba(113, 112, 255, 0.15)' : 'rgba(255,255,255,0.04)',
            border: board === 'fonselp' ? '1px solid #7170ff' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            color: board === 'fonselp' ? '#7170ff' : '#d0d6e0',
            fontSize: '0.8125rem',
            fontWeight: 510,
            cursor: 'pointer'
          }}>
            {board}
          </button>
        ))}
      </div>
    </main>
  );
}
