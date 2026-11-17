import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { findByEmail, newToken, publicUser, verifyPassword } from '../lib/auth';

export default createEndpoint({
  description: 'Connexion email + mot de passe',
  inputSchema: z.object({ email: z.string(), password: z.string() }),
  outputSchema: z.object({ userId: z.string(), firstName: z.string().optional(), sessionToken: z.string() }),
  execute: async ({ input }) => {
    const user = await findByEmail(input.email ?? '');
    if (!user || !verifyPassword(input.password ?? '', user.passwordHash)) {
      throw new ZiteError({ code: 'UNAUTHORIZED', message: 'Email ou mot de passe incorrect' });
    }
    const sessionToken = newToken();
    await zite.voyageurs.update({ id: user.id, record: { sessionToken } });
    return { ...publicUser(user), sessionToken };
  },
});
