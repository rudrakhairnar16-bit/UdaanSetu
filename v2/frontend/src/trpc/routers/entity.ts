import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';

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
    .query(async ({ input }) => {
      return { items: [], nextCursor: undefined };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return null;
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
    .mutation(async ({ input }) => {
      return { id: 'new-id', ...input };
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
    .mutation(async ({ input }) => {
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),

  getStats: protectedProcedure.query(async () => {
    return {
      research: 0,
      innovation: 0,
      ipr: 0,
      startup: 0,
      mentor: 0,
      scheme: 0,
      incubator: 0,
      funding_request: 0,
    };
  }),
});