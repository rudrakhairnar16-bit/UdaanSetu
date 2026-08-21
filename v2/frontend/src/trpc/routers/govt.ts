import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';

export const govtRouter = createTRPCRouter({
  aadhaar: {
    verify: protectedProcedure
      .input(z.object({ aadhaarNumber: z.string(), name: z.string().optional() }))
      .mutation(async () => ({ status: 'verified', message: 'Mock verification' })),
    sendOtp: protectedProcedure
      .input(z.object({ aadhaarNumber: z.string() }))
      .mutation(async () => ({ status: 'otp_sent', message: 'OTP sent' })),
    verifyOtp: protectedProcedure
      .input(z.object({ aadhaarNumber: z.string(), otp: z.string() }))
      .mutation(async () => ({ status: 'verified', message: 'OTP verified' })),
  },

  digilocker: {
    verify: protectedProcedure
      .input(z.object({ documentType: z.string(), documentId: z.string().optional() }))
      .mutation(async () => ({ status: 'verified', message: 'Mock verification' })),
  },

  startupIndia: {
    verify: protectedProcedure
      .input(z.object({ registrationNumber: z.string(), startupName: z.string().optional() }))
      .mutation(async () => ({ status: 'verified', message: 'Mock verification' })),
    benefits: protectedProcedure
      .input(z.object({ registrationNumber: z.string() }))
      .query(async () => ({ benefits: [] })),
  },

  ipIndia: {
    verify: protectedProcedure
      .input(z.object({ applicationNumber: z.string(), patentTitle: z.string().optional() }))
      .mutation(async () => ({ status: 'verified', message: 'Mock verification' })),
    search: protectedProcedure
      .input(z.object({ query: z.string() }))
      .mutation(async () => ({ totalResults: 0, patents: [] })),
  },

  ondc: {
    search: protectedProcedure
      .input(z.object({ query: z.string().optional(), category: z.string().optional() }))
      .mutation(async () => ({ products: [] })),
    verify: protectedProcedure
      .input(z.object({ sellerId: z.string() }))
      .mutation(async () => ({ status: 'verified', message: 'Mock verification' })),
  },
});