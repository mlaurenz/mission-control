// app/api/profiles/route.ts
import { getProfiles } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const profiles = await getProfiles();
  return NextResponse.json(profiles || { profiles: [], active_profile: '' });
}
