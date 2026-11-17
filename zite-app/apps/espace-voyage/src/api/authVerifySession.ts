import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';

export default createEndpoint({
  description: 'Vérifie un token de session',
  inputSchema: z.object({ sessionToken: z.string() }),
  outputSchema: z.object({
    valid: z.boolean(),
    email: z.string().optional(),
    userId: z.string().optional(),
    firstName: z.string().optional(),
  }),
  execute: async ({ input }) => {
    if (!input.sessionToken) return { valid: false };
    const user = await zite.voyageurs.findOne({ filters: { sessionToken: input.sessionToken } });
    if (!user) return { valid: false };
    return { valid: true, email: user.email ?? '', userId: user.id, firstName: user.firstName ?? undefined };
  },
});
