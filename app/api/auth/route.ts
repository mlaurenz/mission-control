// app/api/auth/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    
    const correctUsername = process.env.MISSION_CONTROL_USERNAME || '';
    const correctPassword = process.env.MISSION_CONTROL_PASSWORD || '';
    
    if (!correctUsername || !correctPassword) {
      return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
    }
    
    if (username === correctUsername && password === correctPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('mission_control_auth', 'true', {
        path: '/',
        maxAge: 3600,
        httpOnly: true,
        sameSite: 'lax',
      });
      return response;
    }
    
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
