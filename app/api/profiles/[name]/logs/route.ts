// app/api/profiles/[name]/logs/route.ts
import { getProfileLogs } from '../../../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const data = await getProfileLogs(name);
  return NextResponse.json(data || { logs: [], profile: name });
}
