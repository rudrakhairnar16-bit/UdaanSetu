import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import { backendFetch } from '../backend';

export const dashboardRouter = createTRPCRouter({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const data = await backendFetch(ctx.backendUrl!, ctx.token, '/dashboard/overview');
    return data;
  }),

  atRisk: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input, ctx }) => {
      const data = await backendFetch(ctx.backendUrl!, ctx.token, `/dashboard/at-risk?limit=${input.limit}`);
      return data;
    }),
});
