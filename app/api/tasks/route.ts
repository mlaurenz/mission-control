// app/api/tasks/route.ts
import { getTasksData } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getTasksData();
  return NextResponse.json(data);
}
