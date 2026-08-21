import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';

export const dashboardRouter = createTRPCRouter({
  overview: protectedProcedure.query(async () => {
    return {
      pipeline: {
        research: { total: 0, active: 0 },
        innovation: { total: 0, active: 0 },
        ipr: { total: 0, active: 0 },
        startup: { total: 0, active: 0 },
        impact: { total: 0, active: 0 },
      },
      counts: {
        research: 0,
        innovation: 0,
        ipr: 0,
        startup: 0,
        mentor: 0,
        scheme: 0,
        incubator: 0,
      },
      banner: 'Welcome to Gujarat Innovation Ecosystem!',
      atRisk: [],
      recent: [],
    };
  }),

  atRisk: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async () => {
      return [];
    }),
});