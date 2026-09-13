// lib/connectors/HermesConnector.ts
const BRIDGE_URL = process.env.HERMES_BRIDGE_URL || 'https://scotch-rendering-sporty.ngrok-free.dev';

async function fetchHermes(endpoint: string) {
  try {
    const apiKey = process.env.MISSION_CONTROL_API_KEY || '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    
    const res = await fetch(`${BRIDGE_URL}${endpoint}`, {
      headers: { 
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      signal: controller.signal,
      next: { revalidate: 0 }  // no cache on server
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
export const getHealth = () => fetchHermes('/health');
export const getSessions = () => fetchHermes('/sessions');
export const getAgents = () => fetchHermes('/agents');
export const getCron = () => fetchHermes('/cron');
export const getKanbanBoards = () => fetchHermes('/kanban/boards');
export const getKanbanTasks = () => fetchHermes('/kanban/tasks');
export const getSkills = () => fetchHermes('/skills');
export const getLogs = () => fetchHermes('/logs');
export const getGatewayStatus = () => fetchHermes('/gateway/status');
export const getActivity = () => fetchHermes('/activity');
export const getCodeStats = () => fetchHermes('/code-stats');
export const getProfiles = () => fetchHermes('/profiles');
export const getConfig = () => fetchHermes('/config');

export async function getMCP() {
  const data = await fetchHermes('/mcp');
  if (!data || !data.servers || data.servers.length === 0) {
    return { servers: [], timestamp: new Date().toISOString() };
  }
  return data;
}

// Bulk fetch for dashboard — single call returns all data
export async function getDashboardData() {
  const [health, sessions, cron, kanbanBoards, kanbanTasks, skills, mcp, profiles, config] = await Promise.all([
    getHealth(),
    getSessions(),
    getCron(),
    getKanbanBoards(),
    getKanbanTasks(),
    getSkills(),
    getMCP(),
    getProfiles(),
    getConfig(),
  ]);
  return { health, sessions, cron, kanbanBoards, kanbanTasks, skills, mcp, profiles, config };
}

export async function getAgentsData() {
  const [health, mcp, profiles, config] = await Promise.all([
    getHealth(),
    getMCP(),
    getProfiles(),
    getConfig(),
  ]);
  return { health, mcp, profiles, config };
}

export async function getTasksData() {
  const [kanbanBoards, kanbanTasks] = await Promise.all([
    getKanbanBoards(),
    getKanbanTasks(),
  ]);
  return { kanbanBoards, kanbanTasks };
}

export async function getCodeData() {
  const [codeStats, activity] = await Promise.all([
    getCodeStats(),
    getActivity(),
  ]);
  return { codeStats, activity };
}

export async function getSystemData() {
  const [health, gateway, mcp, config] = await Promise.all([
    getHealth(),
    getGatewayStatus(),
    getMCP(),
    getConfig(),
  ]);
  return { health, gateway, mcp, config };
}
