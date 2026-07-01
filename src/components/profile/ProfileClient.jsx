'use client';

import { fetchProfile, updateProfileApi } from '@/services/profileApi';
import { useLogoutMutation } from '@/services/authApi';
import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { showSnackbar } from '@/redux/slice/snackbarSlice';
import { logout as logoutAction, selectCurrentToken, setProfile } from '@/redux/slice/authSlice';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiStar,
  FiPackage,
  FiHeart,
  FiMapPin,
  FiLogOut,
  FiAward,
  FiSettings,
  FiShield,
  FiCheck,
  FiCamera,
} from 'react-icons/fi';

export default function ProfileClient() {
  const router = useRouter();
  const dispatch = useDispatch();
  const accessToken = useSelector(selectCurrentToken);

  // ---- Local state ----
  const [profile, setProfileState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // The form state is always populated
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });

  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const loadProfile = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const fields = ["name", "email", "phone", "role", "points"];
      const result = await fetchProfile(accessToken, fields);
      if (result?.status && result.data) {
        setProfileState(result.data);
        dispatch(setProfile(result.data));
        setEditForm({
          name: result.data.name || '',
          email: result.data.email || '',
          phone: result.data.phone || '',
        });
      } else {
        setError(result?.message || 'Failed to load profile');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, dispatch]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    const changes = {};
    if (editForm.name !== profile?.name) changes.name = editForm.name;
    if (editForm.email !== profile?.email) changes.email = editForm.email;
    if (editForm.phone !== (profile?.phone || '')) changes.phone = editForm.phone;

    if (Object.keys(changes).length === 0) {
      dispatch(showSnackbar({ message: 'No changes made', type: 'info' }));
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateProfileApi(changes, accessToken);
      if (result?.status) {
        setProfileState(result.data);
        dispatch(setProfile(result.data));
        dispatch(showSnackbar({ message: 'Profile updated successfully', type: 'success' }));
      } else {
        dispatch(showSnackbar({ message: result?.message || 'Update failed', type: 'error' }));
      }
    } catch (err) {
      dispatch(showSnackbar({ message: err.message || 'Failed to update profile', type: 'error' }));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      dispatch(logoutAction());
      dispatch(showSnackbar({ message: 'Logged out successfully', type: 'success' }));
      router.push('/signin');
    } catch (err) {
      dispatch(showSnackbar({ message: 'Logout failed', type: 'error' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] bg-gray-50/50">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-gray-50/50">
        <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Profile Unavailable</h2>
          <p className="text-gray-500 mb-8">{error || 'We couldn\'t load your profile information.'}</p>
          <Button onClick={() => router.push('/signin')} className="w-full h-12">
            Return to Sign In
          </Button>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const sidebarLinks = [
    { icon: <FiUser />, label: 'Personal Information', active: true },
    { icon: <FiPackage />, label: 'Order History', href: '/orders' },
    { icon: <FiHeart />, label: 'Wishlist', href: '/wishlist' },
    { icon: <FiMapPin />, label: 'Saved Addresses', href: '/addresses' },
    { icon: <FiShield />, label: 'Security & Password', href: '/security' },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Spacious Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
          <p className="mt-2 text-gray-500 text-lg">Manage your personal information, security, and preferences.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <nav className="space-y-1">
              {sidebarLinks.map((link, idx) => (
                <div key={idx}>
                  {link.href ? (
                    <Link
                      href={link.href}
                      className="flex items-center px-4 py-3.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <span className="mr-3 text-lg text-gray-400">{link.icon}</span>
                      {link.label}
                    </Link>
                  ) : (
                    <div className="flex items-center px-4 py-3.5 text-sm font-medium rounded-xl bg-blue-50 text-blue-700 transition-colors cursor-default">
                      <span className="mr-3 text-lg text-blue-500">{link.icon}</span>
                      {link.label}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="mt-10 px-4">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                <FiLogOut className="mr-3 text-lg" />
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-8">
            
            {/* Quick Stats / Points Card */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiAward className="text-amber-500 mr-2" size={24} />
                  QuickBuy Rewards
                </h3>
                <p className="text-gray-500 mt-1 text-sm">Earn points on every purchase to unlock discounts.</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-gray-900">{profile.points || 0}</span>
                <span className="text-gray-500 ml-2 font-medium">PTS</span>
              </div>
            </div>

            {/* Profile Form Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              
              <div className="px-8 py-6 border-b border-gray-200 bg-gray-50/30 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <p className="mt-1 text-sm text-gray-500">Update your photo and personal details here.</p>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold uppercase tracking-wider">
                  {profile.role || 'Customer'}
                </div>
              </div>

              <div className="p-8">
                <form onSubmit={handleSave} className="space-y-10">
                  
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-8 pb-10 border-b border-gray-100">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-3xl font-bold text-gray-400">
                        {getInitials(profile.name)}
                      </div>
                      <button type="button" className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-gray-300 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
                        <FiCamera size={14} />
                      </button>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Profile Photo</h4>
                      <p className="text-sm text-gray-500 mt-1 mb-3">This will be displayed on your profile.</p>
                      <div className="flex space-x-3">
                        <button type="button" className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition-all">
                          Upload New
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    
                    {/* Full Name */}
                    <div className="md:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiUser className="text-gray-400" size={18} />
                        </div>
                        <input
                          id="name"
                          type="text"
                          required
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                          placeholder="e.g. Jane Doe"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiMail className="text-gray-400" size={18} />
                        </div>
                        <input
                          id="email"
                          type="email"
                          required
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                          placeholder="jane@example.com"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FiPhone className="text-gray-400" size={18} />
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Form Actions */}
                  <div className="pt-8 border-t border-gray-100 flex items-center justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setEditForm({ name: profile.name, email: profile.email, phone: profile.phone || '' })}
                      className="px-6 py-3 text-sm font-medium rounded-xl text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                    >
                      Discard Changes
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-8 py-3 text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm transition-all flex items-center"
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FiCheck className="mr-2" size={16} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                  
                </form>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
