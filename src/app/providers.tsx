'use client';

import { ReactNode } from 'react';
import { app, analytics } from '@/lib/firebase';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
    </>
  );
} 