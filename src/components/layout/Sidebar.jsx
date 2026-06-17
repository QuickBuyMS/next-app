'use client';

/**
 * Dashboard Sidebar navigation
 */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiShoppingBag,
  FiPackage,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiShoppingCart,
} from 'react-icons/fi';
import { useLogoutMutation } from '@/services/authApi';
import { useState } from 'react';

const navItems = [
  { label: 'Products', href: '/products', icon: <FiShoppingBag size={20} /> },
  { label: 'Cart', href: '/cart', icon: <FiShoppingCart size={20} /> },
  { label: 'Orders', href: '/orders', icon: <FiPackage size={20} /> },
  { label: 'Wishlist', href: '/wishlist', icon: <FiHeart size={20} /> },
  { label: 'Addresses', href: '/addresses', icon: <FiMapPin size={20} /> },
  { label: 'Settings', href: '/settings', icon: <FiSettings size={20} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [logoutApi] = useLogoutMutation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // logout action in slice handles cleanup regardless
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">⚡</span>
          {!collapsed && <span className="sidebar__logo-text">QuickBuy</span>}
        </div>
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="sidebar__link-icon">{item.icon}</span>
                  {!collapsed && (
                    <span className="sidebar__link-label">{item.label}</span>
                  )}
                  {isActive && <span className="sidebar__active-indicator" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button
          className="sidebar__link sidebar__link--logout"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
        >
          <span className="sidebar__link-icon">
            <FiLogOut size={20} />
          </span>
          {!collapsed && <span className="sidebar__link-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
