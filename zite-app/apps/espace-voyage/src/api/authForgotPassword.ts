import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { findByEmail, newToken } from '../lib/auth';

export default createEndpoint({
  description: 'Génère un lien de réinitialisation (valable 1 h)',
  inputSchema: z.object({ email: z.string() }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input }) => {
    const user = await findByEmail(input.email ?? '');
    // Réponse identique que l'email existe ou non (pas de fuite d'information).
    if (!user) return { ok: true };
    const resetToken = newToken();
    const resetExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await zite.voyageurs.update({ id: user.id, record: { resetToken, resetExpiresAt } });
    const link = `${process.env.ZITE_APP_URL ?? ''}/?reset=${resetToken}`;
    // TODO: brancher l'intégration Email de Zite (zitejs/email) pour envoyer `link` à user.email.
    // En attendant, le lien est visible dans les logs du workflow.
    console.log(`Lien de réinitialisation pour ${user.email}: ${link}`);
    return { ok: true };
  },
});
