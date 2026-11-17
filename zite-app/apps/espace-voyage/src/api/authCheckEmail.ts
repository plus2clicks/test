import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { findByEmail } from '../lib/auth';

export default createEndpoint({
  description: "Vérifie si un email est autorisé et s'il a déjà un mot de passe",
  inputSchema: z.object({ email: z.string() }),
  outputSchema: z.object({ status: z.enum(['not_found', 'no_password', 'has_password']) }),
  execute: async ({ input }) => {
    const user = await findByEmail(input.email ?? '');
    if (!user) return { status: 'not_found' as const };
    return { status: user.passwordHash ? ('has_password' as const) : ('no_password' as const) };
  },
});
