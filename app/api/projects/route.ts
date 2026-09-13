// app/api/projects/route.ts
import { getProjectsData } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await getProjectsData();
  return NextResponse.json(data);
}
