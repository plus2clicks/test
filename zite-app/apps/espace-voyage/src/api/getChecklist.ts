import { z } from 'zod';
import { createEndpoint } from 'zitejs/backend';
import { requireSession } from '../lib/auth';

export default createEndpoint({
  description: 'Items cochés de la checklist du voyageur',
  inputSchema: z.object({ sessionToken: z.string() }),
  outputSchema: z.object({ checkedItems: z.array(z.number()) }),
  execute: async ({ input }) => {
    const user = await requireSession(input.sessionToken);
    let checkedItems: number[] = [];
    try {
      const parsed = JSON.parse(user.checkedItems || '[]');
      if (Array.isArray(parsed)) checkedItems = parsed.filter((n) => typeof n === 'number');
    } catch {
      checkedItems = [];
    }
    return { checkedItems };
  },
});
