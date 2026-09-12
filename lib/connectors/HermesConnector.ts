// lib/connectors/HermesConnector.ts
const API_KEY = process.env.MISSION_CONTROL_API_KEY;
const BRIDGE_URL = process.env.HERMES_BRIDGE_URL || 'https://scotch-rendering-sporty.ngrok-free.dev';

async function fetchHermes(endpoint: string) {
  const apiKey = process.env.MISSION_CONTROL_API_KEY;
  const res = await fetch(`${BRIDGE_URL}${endpoint}`, {
    headers: { 
      'X-API-Key': apiKey || '',
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error(`Hermes API error: ${res.status}`);
  return res.json();
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
  return fetchHermes('/mcp');
}

export async function getActivity() {
  return fetchHermes('/activity');
}

export async function getCodeStats() {
  return fetchHermes('/code-stats');
}
