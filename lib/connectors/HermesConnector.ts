// lib/connectors/HermesConnector.ts
const BRIDGE_URL = process.env.HERMES_BRIDGE_URL || 'https://scotch-rendering-sporty.ngrok-free.dev';

// Response types
export interface HealthResponse {
  service: string;
  status: string;
  timestamp: string;
}

export interface Session {
  last_active: string;
  title: string;
  workspace: string;
}

export interface SessionsResponse {
  sessions: Session[];
}

export interface BoardCounts {
  blocked: number;
  done: number;
  ready: number;
  todo: number;
  archived: number;
}

export interface Board {
  slug: string;
  name: string;
  archived: boolean;
  color: string;
  counts: BoardCounts;
  created_at: string;
  is_current: boolean;
  total: number;
  project_id: string;
  description: string;
}

export interface BoardsResponse {
  boards: Board[];
}

export interface Task {
  id: string;
  board: string;
  title: string;
  status: 'ready' | 'blocked' | 'todo' | 'done' | 'archived';
  created_at: string;
  started_at: string | null;
}

export interface TasksResponse {
  tasks: Task[];
}

export interface SkillsResponse {
  skills: string[];
}

export interface MCPResponse {
  servers: any[];
  timestamp?: string;
}

export interface ActivityEvent {
  description: string;
  timestamp: string;
  type: string;
}

export interface ActivityResponse {
  activity: ActivityEvent[];
}

export interface CodeStat {
  files: number;
  lines: number;
  project: string;
}

export interface CodeStatsResponse {
  code_stats: CodeStat[];
}

export interface GatewayStatusResponse {
  raw: string;
}

export interface LogsResponse {
  logs: string[];
}

export interface CronResponse {
  cron_jobs: any[];
}

async function fetchHermes(endpoint: string, timeoutMs?: number) {
  try {
    const apiKey = process.env.MISSION_CONTROL_API_KEY || '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || 4000);
    
    const res = await fetch(`${BRIDGE_URL}${endpoint}`, {
      headers: { 
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '1',
      },
      signal: controller.signal,
      next: { revalidate: 0 }
    });
    clearTimeout(timeout);
    
    if (!res.ok) {
      console.warn(`Bridge API error for ${endpoint}: ${res.status}`);
      return null;
    }
    return res.json();
  } catch (e: any) {
    console.warn(`Bridge unreachable for ${endpoint}:`, e.message);
    return null;
  }
}

// Individual fetchers
export const getHealth = (): Promise<HealthResponse | null> => fetchHermes('/health');
export const getSessions = (): Promise<SessionsResponse | null> => fetchHermes('/sessions');
export const getCron = (): Promise<CronResponse | null> => fetchHermes('/cron');
export const getKanbanBoards = (): Promise<BoardsResponse | null> => fetchHermes('/kanban/boards');
export const getKanbanTasks = (): Promise<TasksResponse | null> => fetchHermes('/kanban/tasks');
export const getSkills = (): Promise<SkillsResponse | null> => fetchHermes('/skills');
export const getLogs = (): Promise<LogsResponse | null> => fetchHermes('/logs', 8000);
export const getGatewayStatus = (): Promise<GatewayStatusResponse | null> => fetchHermes('/gateway/status', 8000);
export const getActivity = (): Promise<ActivityResponse | null> => fetchHermes('/activity');
export const getCodeStats = (): Promise<CodeStatsResponse | null> => fetchHermes('/code-stats');
export const getClients = (): Promise<any> => fetchHermes('/clients');
export const getClient = (slug: string): Promise<any> => fetchHermes(`/clients/${slug}`);
export const getProfiles = (): Promise<any> => fetchHermes('/profiles');
export const getProfileLogs = (name: string): Promise<any> => fetchHermes(`/profiles/${name}/logs`, 8000);

export async function getMCP(): Promise<MCPResponse> {
  const data = await fetchHermes('/mcp');
  if (!data || !data.servers || data.servers.length === 0) {
    return { servers: [], timestamp: new Date().toISOString() };
  }
  return data;
}

// Bulk fetchers for API routes
export async function getDashboardData() {
  const [health, sessions, kanbanBoards, kanbanTasks, activity, gatewayStatus, logs] = await Promise.all([
    getHealth(),
    getSessions(),
    getKanbanBoards(),
    getKanbanTasks(),
    getActivity(),
    getGatewayStatus(),
    getLogs(),
  ]);
  return { health, sessions, kanbanBoards, kanbanTasks, activity, gatewayStatus, logs };
}

export async function getProjectsData() {
  const [kanbanBoards, kanbanTasks] = await Promise.all([
    getKanbanBoards(),
    getKanbanTasks(),
  ]);
  return { kanbanBoards, kanbanTasks };
}

export async function getTasksData() {
  const [kanbanBoards, kanbanTasks] = await Promise.all([
    getKanbanBoards(),
    getKanbanTasks(),
  ]);
  return { kanbanBoards, kanbanTasks };
}

export async function getActivityData() {
  const [activity, logs] = await Promise.all([
    getActivity(),
    getLogs(),
  ]);
  return { activity, logs };
}

export async function getSystemData() {
  const [health, gateway, mcp, codeStats] = await Promise.all([
    getHealth(),
    getGatewayStatus(),
    getMCP(),
    getCodeStats(),
  ]);
  return { health, gateway, mcp, codeStats };
}
