import OrdersClient from '@/components/orders/OrdersClient';

export const metadata = {
  title: 'My Orders — QuickBuy',
  description: 'View your order history on QuickBuy.',
};

export default function OrdersPage() {
  return <OrdersClient />;
}
