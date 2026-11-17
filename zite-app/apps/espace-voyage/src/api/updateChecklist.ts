import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { zite } from 'zitejs/db';
import { requireSession } from '../lib/auth';

export default createEndpoint({
  description: 'Sauvegarde les items cochés de la checklist',
  inputSchema: z.object({ sessionToken: z.string(), checkedItems: z.array(z.number()) }),
  outputSchema: z.object({ ok: z.boolean() }),
  execute: async ({ input }) => {
    const user = await requireSession(input.sessionToken);
    const items = Array.isArray(input.checkedItems) ? input.checkedItems : [];
    await zite.voyageurs.update({ id: user.id, record: { checkedItems: JSON.stringify(items) } });
    return { ok: true };
  },
});
