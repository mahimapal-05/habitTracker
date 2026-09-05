import { NextResponse } from 'next/server';
import { seedDemoAccount } from '@/lib/seedDemoData';
import { prisma } from '@/lib/prisma';
import { signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const userId = await seedDemoAccount();
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Demo user initialization failed' }, { status: 500 });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      message: 'Demo account loaded successfully!',
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: any) {
    console.error('Demo login error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
