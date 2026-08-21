import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../init';

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
    .mutation(async ({ input }) => {
      // Implementation will call backend API
      return { success: true, message: 'Registration endpoint to be implemented' };
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      return { success: true, message: 'Login endpoint to be implemented' };
    }),

  logout: protectedProcedure.mutation(async () => {
    return { success: true };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      district: z.string().optional(),
      organization: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),

  changePassword: protectedProcedure
    .input(z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    }))
    .mutation(async ({ input }) => {
      return { success: true };
    }),
});