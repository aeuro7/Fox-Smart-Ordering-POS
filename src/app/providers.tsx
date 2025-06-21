'use client';

import { ReactNode } from 'react';
import { app, analytics } from '@/lib/firebase';
import { OrderProvider } from './order/OrderContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <OrderProvider>
      {children}
    </OrderProvider>
  );
} 