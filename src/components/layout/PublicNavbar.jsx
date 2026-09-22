'use client';

/**
 * PublicNavbar — minimal top navigation for public pages (products, product detail)
 * Shows QuickBuy logo, and Sign In / Profile button based on auth state
 * Includes logout with confirmation modal when authenticated
 */
import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectProfile } from '@/redux/slice/authSlice';
import { useLogoutMutation } from '@/services/authApi';
import { useRouter } from 'next/navigation';
import { FiShoppingCart, FiUser, FiLogIn, FiLogOut } from 'react-icons/fi';
import dynamic from 'next/dynamic';

// Code splitting: ConfirmModal is only rendered on logout click, no need in initial bundle
const ConfirmModal = dynamic(() => import('@/components/ui/ConfirmModal'), {
  ssr: false,
});

export default function PublicNavbar() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
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
    : 'U';

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
      <header className="public-navbar" id="public-navbar">
        <div className="public-navbar__inner">
          {/* Logo */}
          <Link href="/products" className="public-navbar__logo">
            <span className="public-navbar__logo-icon">⚡</span>
            <span className="public-navbar__logo-text">QuickBuy</span>
          </Link>

          {/* Right Actions */}
          <div className="public-navbar__actions">
            {isAuthenticated ? (
              <>
                <Link href="/cart" className="public-navbar__icon-btn" title="Cart">
                  <FiShoppingCart size={20} />
                </Link>
                <button
                  className="public-navbar__icon-btn public-navbar__icon-btn--logout"
                  onClick={() => setShowLogoutModal(true)}
                  title="Logout"
                  aria-label="Logout"
                  id="public-logout-btn"
                >
                  <FiLogOut size={20} />
                </button>
                <Link href="/products" className="public-navbar__profile-btn">
                  <span className="public-navbar__avatar">{initials}</span>
                  <span className="public-navbar__username">
                    {profile?.name || 'Account'}
                  </span>
                </Link>
              </>
            ) : (
              <Link href="/signin" className="public-navbar__signin-btn">
                <FiLogIn size={18} />
                <span>Sign In</span>
              </Link>
            )}
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
