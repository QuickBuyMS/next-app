'use client';

/**
 * Top navigation bar with user avatar, search, and logout
 */
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectProfile } from '@/redux/slice/authSlice';
import { useLogoutMutation } from '@/services/authApi';
import { useRouter } from 'next/navigation';
import { FiBell, FiSearch, FiLogOut, FiShoppingCart } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Code splitting: ConfirmModal only needed on logout click
const ConfirmModal = dynamic(() => import('@/components/ui/ConfirmModal'), {
  ssr: false,
});

export default function TopBar() {
  const profile = useSelector(selectProfile);
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  const initials = profile?.name
    ? profile.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    : 'QB';

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // logout action in slice handles cleanup regardless
    } finally {
      setShowLogoutModal(false);
      router.push('/signin');
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar__search">
          <FiSearch size={18} className="topbar__search-icon" />
          <input
            type="text"
            placeholder="Search products, orders..."
            className="topbar__search-input"
            id="global-search"
          />
        </div>

        <div className="topbar__actions">
          <button
            className="topbar__icon-btn"
            aria-label="Cart"
            id="cart-btn"
            onClick={() => router.push('/cart')}
            title="Cart"
          >
            <FiShoppingCart size={20} />
          </button>
          <button
            className="topbar__icon-btn topbar__icon-btn--logout"
            aria-label="Logout"
            id="logout-btn"
            onClick={() => setShowLogoutModal(true)}
            title="Logout"
          >
            <FiLogOut size={20} />
          </button>

          <div
            className="topbar__profile cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-1"
            onClick={() => router.push('/profile')}
            title="View Profile"
          >
            <div className="topbar__avatar" id="user-avatar">
              {initials}
            </div>
            <div className="topbar__user-info">
              <span className="topbar__user-name">{profile?.name || 'User'}</span>
              <span className="topbar__user-role">{profile?.email || ''}</span>
            </div>
          </div>
        </div>
      </header>

      <ConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        title="Logout"
        message="Are you sure you want to sign out? You'll need to sign in again to access your account."
        confirmText="Sign Out"
        cancelText="Cancel"
        confirmVariant="primary"
        loading={isLoggingOut}
        icon={<FiLogOut size={28} />}
      />
    </>
  );
}
