// lib/connectors/HermesConnector.ts
const API_KEY = process.env.MISSION_CONTROL_API_KEY;
const BRIDGE_URL = process.env.HERMES_BRIDGE_URL || 'http://localhost:3001';

async function fetchHermes(endpoint: string) {
  const res = await fetch(`${BRIDGE_URL}${endpoint}`, {
    headers: { 'X-API-Key': API_KEY || '' }
  });
  if (!res.ok) throw new Error(`Hermes API error: ${res.status}`);
  return res.json();
}

export async function getHealth() {
  return fetchHermes('/health');
}

export async function getAgents() {
  return fetchHermes('/agents');
}

export async function getCronJobs() {
  return fetchHermes('/cron');
}

export async function getKanban() {
  return fetchHermes('/kanban');
}

export async function getSystem() {
  return fetchHermes('/system');
}

export async function getMCP() {
  return fetchHermes('/mcp');
}

export async function getSkills() {
  return fetchHermes('/skills');
}
