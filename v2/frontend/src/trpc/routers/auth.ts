import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../init';
import { backendFetch } from '../backend';

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
      role: z.enum(['researcher', 'mentor', 'investor', 'incubator']),
      district: z.string().optional(),
      organization: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const data = await backendFetch(ctx.backendUrl!, ctx.token, '/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      return data;
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const body = new URLSearchParams();
      body.append('username', input.email);
      body.append('password', input.password);
      const data = await backendFetch(ctx.backendUrl!, null, '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      return data;
    }),

  logout: protectedProcedure.mutation(async () => {
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const data = await backendFetch(ctx.backendUrl!, ctx.token, '/auth/me');
    return data;
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      district: z.string().optional(),
      organization: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const data = await backendFetch(ctx.backendUrl!, ctx.token, '/auth/me', {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
      return data;
    }),

  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    }))
    .mutation(async ({ input, ctx }) => {
      const data = await backendFetch(ctx.backendUrl!, ctx.token, '/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: input.currentPassword,
          new_password: input.newPassword,
        }),
      });
      return data;
    }),
});
