// app/api/sessions/route.ts
import { getSessions, getHealth } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [sessions, health] = await Promise.all([getSessions(), getHealth()]);
  return NextResponse.json({ sessions, health });
}
