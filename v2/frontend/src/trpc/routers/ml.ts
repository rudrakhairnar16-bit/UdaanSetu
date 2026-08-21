import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import { backendFetch } from '../backend';

export const mlRouter = createTRPCRouter({
  riskPrediction: protectedProcedure
    .input(z.object({ entityId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/ml/risk', {
        method: 'POST',
        body: JSON.stringify({ entity_id: input.entityId }),
      });
    }),

  recommendations: protectedProcedure
    .input(z.object({ entityId: z.string(), limit: z.number().default(5) }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/ml/recommendations', {
        method: 'POST',
        body: JSON.stringify({ entity_id: input.entityId, limit: input.limit }),
      });
    }),

  similar: protectedProcedure
    .input(z.object({ entityId: z.string(), limit: z.number().default(10) }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/ml/similar', {
        method: 'POST',
        body: JSON.stringify({ entity_id: input.entityId, limit: input.limit }),
      });
    }),

  duplicateDetection: protectedProcedure
    .input(z.object({ kind: z.string(), title: z.string(), description: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/ml/detect-duplicates', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    }),

  trainModels: protectedProcedure
    .input(z.object({ force: z.boolean().default(false) }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/ml/train', {
        method: 'POST',
        body: JSON.stringify({ force: input.force }),
      });
    }),

  modelMetrics: protectedProcedure.query(async ({ ctx }) => {
    return backendFetch(ctx.backendUrl!, ctx.token, '/ml/metrics');
  }),
});
