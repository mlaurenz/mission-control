// app/api/agents/route.ts
import { getSessions, getGatewayStatus, getLogs, getMCP, getHealth } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [health, sessions, gateway, logs, mcp] = await Promise.all([
    getHealth(),
    getSessions(),
    getGatewayStatus(),
    getLogs(),
    getMCP(),
  ]);
  return NextResponse.json({ health, sessions, gateway, logs, mcp });
}
