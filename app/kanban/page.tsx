"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  priority?: number;
}

interface KanbanData {
  board: string;
  tasks: Task[];
  counts: Record<string, number>;
  total: number;
}

const STATUS_ORDER = ["todo", "triage", "ready", "in_progress", "review", "blocked", "done", "archived"];

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  todo: { bg: "#f3f4f6", text: "#6b7280", border: "#e5e7eb" },
  triage: { bg: "#fef3c7", text: "#d97706", border: "#fcd34d" },
  ready: { bg: "#dbeafe", text: "#2563eb", border: "#93c5fd" },
  in_progress: { bg: "#d1fae5", text: "#059669", border: "#6ee7b7" },
  review: { bg: "#ede9fe", text: "#7c3aed", border: "#c4b5fd" },
  blocked: { bg: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
  done: { bg: "#d1fae5", text: "#059669", border: "#6ee7b7" },
  archived: { bg: "#f3f4f6", text: "#9ca3af", border: "#e5e7eb" },
};

function TaskCard({ task }: { task: Task }) {
  const colors = statusColors[task.status] || statusColors.todo;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ 
          backgroundColor: colors.bg, 
          color: colors.text,
          border: `1px solid ${colors.border}`
        }}>
          {task.status.replace("_", " ")}
        </span>
        {task.priority && (
          <span className="text-xs text-gray-400">#{task.priority}</span>
        )}
      </div>
      <p className="text-sm text-gray-800 font-medium line-clamp-3">{task.title}</p>
      {task.assignee && (
        <div className="mt-2 flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
            {task.assignee.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs text-gray-500">{task.assignee}</span>
        </div>
      )}
    </div>
  );
}

export default function KanbanPage() {
  const [kanban, setKanban] = useState<KanbanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState("default");
  const [boards, setBoards] = useState<string[]>([]);

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    if (selectedBoard) {
      fetchKanban(selectedBoard);
    }
  }, [selectedBoard]);

  async function fetchBoards() {
    try {
      const res = await fetch("/api/kanban/boards");
      const data = await res.json();
      if (data.boards) {
        setBoards(data.boards.map((b: any) => b.slug || b.name));
      }
    } catch (e) {
      console.error("Failed to fetch boards:", e);
      setBoards(["default", "fonselp", "octopush", "bidlab-workertech"]);
    }
  }

  async function fetchKanban(board: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/kanban?board=${board}`);
      const data = await res.json();
      setKanban(data);
    } catch (e) {
      console.error("Failed to fetch kanban:", e);
      // Fallback data
      setKanban({
        board,
        tasks: [],
        counts: {},
        total: 0
      });
    }
    setLoading(false);
  }

  // Group tasks by status
  const tasksByStatus: Record<string, Task[]> = {};
  if (kanban?.tasks) {
    for (const task of kanban.tasks) {
      const status = task.status || "todo";
      if (!tasksByStatus[status]) {
        tasksByStatus[status] = [];
      }
      tasksByStatus[status].push(task);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">📋 Kanban Board</h1>
            <p className="text-sm text-gray-500 mt-1">Todas las tareas de Hermes</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white"
            >
              {boards.map((board) => (
                <option key={board} value={board}>{board}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STATUS_ORDER.map((status) => {
              const tasks = tasksByStatus[status] || [];
              const colors = statusColors[status] || statusColors.todo;
              const isLarge = tasks.length > 10;
              
              return (
                <div 
                  key={status} 
                  className={`flex-shrink-0 ${isLarge ? 'w-80' : 'w-72'}`}
                >
                  {/* Column Header */}
                  <div 
                    className="rounded-t-lg px-3 py-2 mb-2 flex items-center justify-between"
                    style={{ 
                      backgroundColor: colors.bg,
                      borderBottom: `3px solid ${colors.border}`
                    }}
                  >
                    <span className="font-semibold text-sm" style={{ color: colors.text }}>
                      {status.replace("_", " ").toUpperCase()}
                    </span>
                    <span 
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: colors.text, color: colors.bg }}
                    >
                      {tasks.length}
                    </span>
                  </div>
                  
                  {/* Tasks */}
                  <div className="space-y-2 min-h-[200px] bg-gray-100 rounded-b-lg p-2">
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No hay tareas
                      </div>
                    ) : (
                      tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {kanban && (
        <div className="px-6 pb-6">
          <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">{kanban.total}</div>
              <div className="text-sm text-gray-500">Total Tareas</div>
            </div>
            {Object.entries(kanban.counts || {}).map(([status, count]) => (
              <div key={status} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="text-2xl font-bold" style={{ color: statusColors[status]?.text || "#6b7280" }}>
                  {count}
                </div>
                <div className="text-sm text-gray-500 capitalize">{status.replace("_", " ")}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
