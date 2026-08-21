import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/trpc/router';
import superjson from 'superjson';

export const trpcClient = createTRPCClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: '/api/trpc',
      headers() {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});