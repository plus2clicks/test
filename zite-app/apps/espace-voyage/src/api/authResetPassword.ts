import { z } from 'zod';
import { createEndpoint, ZiteError } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { hashPassword, newToken, publicUser } from '../lib/auth';

export default createEndpoint({
  description: 'Définit un nouveau mot de passe à partir du lien de réinitialisation',
  inputSchema: z.object({ resetToken: z.string(), newPassword: z.string() }),
  outputSchema: z.object({ email: z.string(), userId: z.string(), firstName: z.string().optional(), sessionToken: z.string() }),
  execute: async ({ input }) => {
    if (!input.newPassword || input.newPassword.length < 8) {
      throw new ZiteError({ code: 'BAD_REQUEST', message: 'Mot de passe trop court (8 caractères min.)' });
    }
    if (!input.resetToken) throw new ZiteError({ code: 'BAD_REQUEST', message: 'Lien invalide' });
    const user = await zite.voyageurs.findOne({ filters: { resetToken: input.resetToken } });
    if (!user) throw new ZiteError({ code: 'NOT_FOUND', message: 'Lien invalide ou déjà utilisé' });
    if (!user.resetExpiresAt || new Date(user.resetExpiresAt).getTime() < Date.now()) {
      throw new ZiteError({ code: 'BAD_REQUEST', message: 'Lien expiré, refais une demande' });
    }
    const sessionToken = newToken();
    await zite.voyageurs.update({
      id: user.id,
      record: { passwordHash: hashPassword(input.newPassword), sessionToken, resetToken: null, resetExpiresAt: null },
    });
    return { ...publicUser(user), sessionToken };
  },
});
