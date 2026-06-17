'use client';

/**
 * Protected main layout with sidebar nav + top bar
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
