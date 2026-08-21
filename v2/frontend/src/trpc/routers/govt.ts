import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../init';
import { backendFetch } from '../backend';

const aadhaarRouter = createTRPCRouter({
  verify: protectedProcedure
    .input(z.object({ aadhaarNumber: z.string(), name: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/govt/aadhaar/verify', {
        method: 'POST',
        body: JSON.stringify({ aadhaar_number: input.aadhaarNumber, name: input.name }),
      });
    }),
  sendOtp: protectedProcedure
    .input(z.object({ aadhaarNumber: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/govt/aadhaar/send-otp', {
        method: 'POST',
        body: JSON.stringify({ aadhaar_number: input.aadhaarNumber }),
      });
    }),
  verifyOtp: protectedProcedure
    .input(z.object({ aadhaarNumber: z.string(), otp: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/govt/aadhaar/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ aadhaar_number: input.aadhaarNumber, otp: input.otp }),
      });
    }),
});

const digilockerRouter = createTRPCRouter({
  verify: protectedProcedure
    .input(z.object({ documentType: z.string(), documentId: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/govt/digilocker/verify', {
        method: 'POST',
        body: JSON.stringify({ document_type: input.documentType, document_id: input.documentId }),
      });
    }),
});

const startupIndiaRouter = createTRPCRouter({
  verify: protectedProcedure
    .input(z.object({ registrationNumber: z.string(), startupName: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/govt/startup-india/verify', {
        method: 'POST',
        body: JSON.stringify({ registration_number: input.registrationNumber, startup_name: input.startupName }),
      });
    }),
  benefits: protectedProcedure
    .input(z.object({ registrationNumber: z.string() }))
    .query(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, `/govt/startup-india/benefits/${input.registrationNumber}`);
    }),
});

const ipIndiaRouter = createTRPCRouter({
  verify: protectedProcedure
    .input(z.object({ applicationNumber: z.string(), patentTitle: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/govt/ip-india/verify', {
        method: 'POST',
        body: JSON.stringify({ application_number: input.applicationNumber, patent_title: input.patentTitle }),
      });
    }),
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/govt/ip-india/search', {
        method: 'POST',
        body: JSON.stringify({ query: input.query }),
      });
    }),
});

const ondcRouter = createTRPCRouter({
  search: protectedProcedure
    .input(z.object({ query: z.string().optional(), category: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/govt/ondc/search', {
        method: 'POST',
        body: JSON.stringify({ query: input.query, category: input.category }),
      });
    }),
  verify: protectedProcedure
    .input(z.object({ sellerId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return backendFetch(ctx.backendUrl!, ctx.token, '/govt/ondc/verify', {
        method: 'POST',
        body: JSON.stringify({ seller_id: input.sellerId }),
      });
    }),
});

export const govtRouter = createTRPCRouter({
  aadhaar: aadhaarRouter,
  digilocker: digilockerRouter,
  startupIndia: startupIndiaRouter,
  ipIndia: ipIndiaRouter,
  ondc: ondcRouter,
});
