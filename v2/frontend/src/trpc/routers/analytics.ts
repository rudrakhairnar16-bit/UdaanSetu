import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import { backendFetch } from '../backend';

export const analyticsRouter = createTRPCRouter({
  overview: protectedProcedure.query(async ({ ctx }) => {
    const data = await backendFetch(ctx.backendUrl!, ctx.token, '/analytics/overview');
    return data;
  }),

  districts: protectedProcedure.query(async ({ ctx }) => {
    const data = await backendFetch(ctx.backendUrl!, ctx.token, '/analytics/districts');
    return data;
  }),

  mlMetrics: protectedProcedure.query(async ({ ctx }) => {
    const data = await backendFetch(ctx.backendUrl!, ctx.token, '/analytics/ml-metrics');
    return data;
  }),
});
