'use client';

/**
 * Public layout for product pages — no auth required
 * Uses the PublicNavbar instead of the full Sidebar layout
 * Suspense boundary wraps children for useSearchParams support
 */
import { Suspense } from 'react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import Loader from '@/components/ui/Loader';

export default function ProductsLayout({ children }) {
  return (
    <div className="public-layout">
      <PublicNavbar />
      <main className="public-layout__content">
        <Suspense fallback={<Loader message="Loading..." />}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}

