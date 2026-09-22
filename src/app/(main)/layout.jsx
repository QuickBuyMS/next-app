/**
 * Protected main layout with sidebar nav + top bar
 *
 * Performance: This is a Server Component (no 'use client').
 * Sidebar and TopBar are already 'use client' components — they can be
 * composed inside a server component. This reduces the client JS bundle
 * since the layout shell itself doesn't need to be shipped to the browser.
 */
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-layout__content">
        <TopBar />
        <main className="main-layout__page">{children}</main>
      </div>
    </div>
  );
}
