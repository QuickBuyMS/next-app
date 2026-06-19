'use client';

import { useGetProfileQuery, useLogoutMutation } from '@/services/authApi';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { showSnackbar } from '@/redux/slice/snackbarSlice';
import { logout as logoutAction } from '@/redux/slice/authSlice';
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
  FiChevronRight,
  FiAward
} from 'react-icons/fi';

export default function ProfileClient() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { data, isLoading, error } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();

  const profile = data?.data;

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
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-20 bg-white mx-4 mt-8 rounded-3xl shadow-sm border border-gray-100 max-w-lg md:mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Unavailable</h2>
        <p className="text-gray-600 mb-8">We couldn't load your profile information.</p>
        <Button onClick={() => router.push('/signin')} className="px-8">Sign In Again</Button>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const menuItems = [
    { icon: <FiPackage size={22} />, label: 'My Orders', desc: 'Track, return, or buy things again', href: '/orders', color: 'text-blue-600', bg: 'bg-blue-50 group-hover:bg-blue-100' },
    { icon: <FiHeart size={22} />, label: 'My Wishlist', desc: 'Your saved items and collections', href: '/wishlist', color: 'text-rose-600', bg: 'bg-rose-50 group-hover:bg-rose-100' },
    { icon: <FiMapPin size={22} />, label: 'Saved Addresses', desc: 'Manage your delivery locations', href: '/addresses', color: 'text-emerald-600', bg: 'bg-emerald-50 group-hover:bg-emerald-100' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 fade-in">
      
      {/* Header Area */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-gray-500 mt-2">Manage your account and preferences</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: User Card & Points */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* User ID Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300">
            {/* Decorative Background Graphic */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent z-0 group-hover:scale-105 transition-transform duration-500" />
            
            <div className="w-28 h-28 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center text-4xl font-black text-primary z-10 relative mt-4 transform group-hover:-translate-y-1 transition-transform duration-300">
              {getInitials(profile.name)}
            </div>
            
            <h2 className="text-2xl font-extrabold mt-5 text-gray-900 z-10">{profile.name}</h2>
            <div className="inline-flex items-center mt-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider z-10">
              <FiUser className="mr-1.5" />
              {profile.role || 'Customer'}
            </div>
            
            <div className="w-full space-y-3 mt-8 text-left z-10">
              <div className="flex items-center text-gray-700 bg-gray-50/80 p-4 rounded-xl border border-gray-100/50 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-4 text-primary">
                  <FiMail size={18} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Email</span>
                  <span className="text-sm font-semibold truncate">{profile.email}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-700 bg-gray-50/80 p-4 rounded-xl border border-gray-100/50 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-4 text-primary">
                  <FiPhone size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Phone</span>
                  <span className="text-sm font-semibold">{profile.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reward Points Card */}
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl shadow-lg p-8 flex items-center justify-between text-white relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-orange-500/25">
            {/* Glass decoration */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-colors duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center space-x-2 opacity-90 mb-2">
                <FiAward size={18} />
                <p className="text-sm font-bold uppercase tracking-wider">QuickBuy Rewards</p>
              </div>
              <p className="text-5xl font-black drop-shadow-sm">{profile.points || 0}</p>
              <p className="text-xs font-medium opacity-80 mt-1">Available Points</p>
            </div>
            
            <div className="relative z-10 w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
              <FiStar size={32} className="text-white drop-shadow-md" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Right Column: Menu & Actions */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100/80 bg-gray-50/30">
              <h3 className="text-xl font-extrabold text-gray-900">Account Settings</h3>
              <p className="text-sm text-gray-500 mt-1">Manage your shopping experience</p>
            </div>
            
            <div className="divide-y divide-gray-100/80">
              {menuItems.map((item, idx) => (
                <Link 
                  href={item.href} 
                  key={idx}
                  className="flex items-center justify-between p-6 sm:p-8 hover:bg-gray-50 transition-all duration-200 group"
                >
                  <div className="flex items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${item.color} ${item.bg}`}>
                      {item.icon}
                    </div>
                    <div className="ml-5">
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">{item.label}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    <FiChevronRight className="text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700 font-bold px-8 py-3 rounded-xl shadow-sm transition-all"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <FiLogOut className="mr-2" size={18} />
              {isLoggingOut ? 'Logging out...' : 'Sign Out Securely'}
            </Button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
