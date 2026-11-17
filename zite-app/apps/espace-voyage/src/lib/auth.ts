import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export type Voyageur = Awaited<ReturnType<typeof zite.voyageurs.findAll>>['records'][number];

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored || !stored.includes(':')) return false;
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function newToken(): string {
  return randomBytes(32).toString('hex');
}

export async function findByEmail(email: string): Promise<Voyageur | undefined> {
  const normalized = email.trim().toLowerCase();
  const { records } = await zite.voyageurs.findAll({ filters: { email: { contains: normalized } }, limit: 50 });
  return records.find((r) => (r.email ?? '').toLowerCase() === normalized);
}

export async function requireSession(sessionToken: string | undefined): Promise<Voyageur> {
  if (!sessionToken) throw new ZiteError({ code: 'UNAUTHORIZED', message: 'Session manquante' });
  const user = await zite.voyageurs.findOne({ filters: { sessionToken } });
  if (!user) throw new ZiteError({ code: 'UNAUTHORIZED', message: 'Session invalide' });
  return user;
}

export function publicUser(user: Voyageur) {
  return { userId: user.id, email: user.email ?? '', firstName: user.firstName ?? undefined };
}
