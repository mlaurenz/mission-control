// app/api/clients/route.ts
import { getClients } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getClients();
  return NextResponse.json(data || { clients: [] });
}
