import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Get all kanban boards
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const board = searchParams.get("board") || "default";

  try {
    // Try Hermes CLI fallback
    const { execSync } = await import('child_process');
    const output = execSync(`hermes kanban --board ${board} list`, {
      encoding: 'utf8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Parse output - detect status from prefix
    // Format: "▶ todo • Task title" or "✓ done • Task title"
    const lines = output.split('\n').filter(l => l.trim());
    const tasks: any[] = [];
    const counts: Record<string, number> = {};
    
    for (const line of lines) {
      // Match patterns like "▶ todo • Task title" or "✓ done • title"
      const matchTodo = line.match(/▶\s+(\S+)\s*[•:]\s*(.+)/);
      const matchDone = line.match(/✓\s+(\S+)\s*[•:]\s*(.+)/);
      
      let status = 'todo';
      let title = line;
      
      if (matchTodo) {
        status = matchTodo[1];
        title = matchTodo[2];
      } else if (matchDone) {
        status = matchDone[1];
        title = matchDone[2];
      } else if (line.startsWith('▶') || line.startsWith('✓')) {
        // Try to extract status from the line
        continue;
      }
      
      if (title.trim()) {
        tasks.push({ 
          id: `t_${tasks.length}`, 
          title: title.trim(), 
          status 
        });
        counts[status] = (counts[status] || 0) + 1;
      }
    }
    
    return NextResponse.json({
      board,
      tasks,
      counts,
      total: tasks.length,
    });
  } catch (e) {
    // Return empty kanban on error - no DB available
    return NextResponse.json({
      board,
      tasks: [],
      counts: {},
      total: 0,
    });
  }
}
