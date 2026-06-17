'use client';

/**
 * Public layout for the product detail page — no auth required
 * Uses the PublicNavbar instead of the full Sidebar layout
 */
import PublicNavbar from '@/components/layout/PublicNavbar';

export default function ProductLayout({ children }) {
  return (
    <div className="public-layout">
      <PublicNavbar />
      <main className="public-layout__content">{children}</main>
    </div>
  );
}
