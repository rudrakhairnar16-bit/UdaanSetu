'use client';

import { TRPCProvider } from '@/trpc/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ReactNode } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </TRPCProvider>
  );
}
