// app/api/agents/route.ts
import { getAgentsData } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getAgentsData();
  return NextResponse.json(data);
}
