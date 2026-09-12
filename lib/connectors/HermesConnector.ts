// lib/connectors/HermesConnector.ts
const API_KEY = process.env.MISSION_CONTROL_API_KEY;
const BRIDGE_URL = process.env.HERMES_BRIDGE_URL || 'https://scotch-rendering-sporty.ngrok-free.dev';

async function fetchHermes(endpoint: string) {
  const apiKey = process.env.MISSION_CONTROL_API_KEY;
  console.log(`Fetching ${endpoint} from ${BRIDGE_URL} with key: ${apiKey ? 'present' : 'missing'}`);
  
  const res = await fetch(`${BRIDGE_URL}${endpoint}`, {
    headers: { 
      'X-API-Key': apiKey || '',
      'Content-Type': 'application/json'
    }
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Hermes API error: ${res.status} - ${text}`);
  }
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
