import WishlistClient from '@/components/wishlist/WishlistClient';

export const metadata = {
  title: 'My Wishlist — QuickBuy',
  description: 'View your saved products on QuickBuy.',
};

export default function WishlistPage() {
  return <WishlistClient />;
}
