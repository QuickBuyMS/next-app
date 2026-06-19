import CartClient from '@/components/cart/CartClient';

export const metadata = {
  title: 'Your Cart — QuickBuy',
  description: 'View and checkout items in your QuickBuy shopping cart.',
};

export default function CartPage() {
  return (
    <div className="bg-gray-50/50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <CartClient />
      </div>
    </div>
  );
}
