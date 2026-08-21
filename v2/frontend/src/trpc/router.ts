import { createTRPCRouter } from '@/trpc/init';
import { authRouter } from './routers/auth';
import { entityRouter } from './routers/entity';
import { dashboardRouter } from './routers/dashboard';
import { analyticsRouter } from './routers/analytics';
import { govtRouter } from './routers/govt';
import { mlRouter } from './routers/ml';

export const appRouter = createTRPCRouter({
  auth: authRouter,
  entity: entityRouter,
  dashboard: dashboardRouter,
  analytics: analyticsRouter,
  govt: govtRouter,
  ml: mlRouter,
});

export type AppRouter = typeof appRouter;