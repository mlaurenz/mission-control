// lib/connectors/HermesConnector.ts
const API_KEY = process.env.MISSION_CONTROL_API_KEY || 'test123';
const BRIDGE_URL = process.env.HERMES_BRIDGE_URL || 'https://scotch-rendering-sporty.ngrok-free.dev';

async function fetchHermes(endpoint: string) {
  try {
    const apiKey = process.env.MISSION_CONTROL_API_KEY || 'test123';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    
    const res = await fetch(`${BRIDGE_URL}${endpoint}`, {
      headers: { 
        'X-API-Key': apiKey || '',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
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

export async function getHealth() {
  return fetchHermes('/health');
}

export async function getSessions() {
  return fetchHermes('/sessions');
}

export async function getAgents() {
  return fetchHermes('/agents');
}

export async function getCron() {
  return fetchHermes('/cron');
}

export async function getKanbanBoards() {
  return fetchHermes('/kanban/boards');
}

export async function getKanbanTasks() {
  return fetchHermes('/kanban/tasks');
}

export async function getSkills() {
  return fetchHermes('/skills');
}

export async function getLogs() {
  return fetchHermes('/logs');
}

export async function getGatewayStatus() {
  return fetchHermes('/gateway/status');
}

export async function getMCP() {
  const data = await fetchHermes('/mcp');
  if (!data || !data.servers || data.servers.length === 0) {
    return { servers: [], timestamp: new Date().toISOString() };
  }
  return data;
}

export async function getActivity() {
  return fetchHermes('/activity');
}

export async function getCodeStats() {
  return fetchHermes('/code-stats');
}
