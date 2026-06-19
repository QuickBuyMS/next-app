import ProfileClient from '@/components/profile/ProfileClient';

export const metadata = {
  title: 'My Profile — QuickBuy',
  description: 'View and manage your QuickBuy profile.',
};

export default function ProfilePage() {
  return (
    <div className="bg-gray-50/50 min-h-screen">
      <ProfileClient />
    </div>
  );
}
