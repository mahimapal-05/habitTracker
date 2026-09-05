import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'momentum-ultra-secure-jwt-secret-key-2026';
const secretKey = new TextEncoder().encode(JWT_SECRET);
export const COOKIE_NAME = 'momentum_session';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
}

/**
 * Hash plain password securely
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password with stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT token for user session
 */
export async function signToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey);
}

/**
 * Verify JWT token string
 */
export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

/**
 * Get authenticated user from request cookies or Authorization header
 */
export async function getAuthUser(req?: NextRequest | Request): Promise<UserSession | null> {
  // 1. Check Authorization Bearer header if available
  if (req && 'headers' in req) {
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await verifyToken(token);
      if (user) return user;
    }
  }

  // 2. Check Next.js cookie store
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      return await verifyToken(token);
    }
  } catch {
    // If called outside server component context, fallback
  }

  return null;
}
