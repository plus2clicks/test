import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { findByEmail, hashPassword, newToken, publicUser } from '../lib/auth';

export default createEndpoint({
  description: 'Crée le mot de passe (première connexion) et ouvre une session',
  inputSchema: z.object({ email: z.string(), password: z.string() }),
  outputSchema: z.object({ userId: z.string(), firstName: z.string().optional(), sessionToken: z.string() }),
  execute: async ({ input }) => {
    if (!input.password || input.password.length < 8) {
      throw new ZiteError({ code: 'BAD_REQUEST', message: 'Mot de passe trop court (8 caractères min.)' });
    }
    const user = await findByEmail(input.email ?? '');
    if (!user) throw new ZiteError({ code: 'NOT_FOUND', message: "Cet email n'est pas autorisé" });
    if (user.passwordHash) throw new ZiteError({ code: 'CONFLICT', message: 'Un mot de passe existe déjà' });
    const sessionToken = newToken();
    await zite.voyageurs.update({ id: user.id, record: { passwordHash: hashPassword(input.password), sessionToken } });
    return { ...publicUser(user), sessionToken };
  },
});
