// app/api/system/route.ts - Consolidated system data
import { getSystemData, getProfiles, getSessions, getSkills } from '../../../lib/connectors/HermesConnector';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [systemData, profiles, sessions, skills] = await Promise.all([
    getSystemData(),
    getProfiles(),
    getSessions(),
    getSkills(),
  ]);
  return NextResponse.json({
    ...systemData,
    profiles: profiles || { profiles: [], active_profile: '' },
    sessions: sessions || { sessions: [] },
    skills: skills || { skills: [] },
  });
}
