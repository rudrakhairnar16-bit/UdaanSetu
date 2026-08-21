import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import { backendFetch } from '../backend';

const entityKinds = [
  'research', 'innovation', 'ipr', 'startup', 'milestone',
  'mentor', 'scheme', 'incubator', 'funding_request',
] as const;

export const entityRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      kind: z.enum(entityKinds).optional(),
      district: z.string().optional(),
      sector: z.string().optional(),
      stage: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const params = new URLSearchParams();
      if (input.kind) params.set('kind', input.kind);
      if (input.district) params.set('district', input.district);
      if (input.sector) params.set('sector', input.sector);
      if (input.stage) params.set('stage', input.stage);
      params.set('size', String(input.limit));
      if (input.cursor) params.set('cursor', input.cursor);
      if (input.search) params.set('search', input.search);
      const qs = params.toString();
      const data = await backendFetch(ctx.backendUrl!, ctx.token, `/entities?${qs}`);
      return data;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const data = await backendFetch(ctx.backendUrl!, ctx.token, `/entities/${input.id}`);
      return data;
    }),

  create: protectedProcedure
    .input(z.object({
      kind: z.enum(entityKinds),
      title: z.string().min(3),
      description: z.string().optional(),
      stage: z.string(),
      sector: z.string().optional(),
      district: z.string().optional(),
      parentId: z.string().optional(),
      meta: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const body: any = { ...input };
      if (input.parentId) body.parent_id = input.parentId;
      delete body.parentId;
      const data = await backendFetch(ctx.backendUrl!, ctx.token, '/entities', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return data;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      stage: z.string().optional(),
      sector: z.string().optional(),
      district: z.string().optional(),
      meta: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updates } = input;
      const data = await backendFetch(ctx.backendUrl!, ctx.token, `/entities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      return data;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await backendFetch(ctx.backendUrl!, ctx.token, `/entities/${input.id}`, {
        method: 'DELETE',
      });
      return { success: true };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const data = await backendFetch(ctx.backendUrl!, ctx.token, '/entities/stats/summary');
    return data;
  }),
});
