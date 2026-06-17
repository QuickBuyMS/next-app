'use client';

import { useGetUserOrdersQuery, useCancelOrderMutation } from '@/services/orderApi';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectProfile } from '@/redux/slice/authSlice';
import { FiPackage, FiChevronRight, FiXCircle } from 'react-icons/fi';
import Image from 'next/image';

export default function OrdersPage() {
  const router = useRouter();
  const profile = useSelector(selectProfile);
  const userId = profile?.user_id;
  const { data: ordersData, isLoading, isError } = useGetUserOrdersQuery(userId, { skip: !userId });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const orders = ordersData?.data || [];

  const handleCancelOrder = async (orderId, orderItemId) => {
    if (window.confirm('Are you sure you want to cancel this item?')) {
      await cancelOrder({ orderId, orderItemId });
    }
  };

  if (isLoading) return <div className="p-8 flex-center"><Loader message="Loading your orders..." /></div>;

  if (isError || orders.length === 0) {
    return (
      <div className="empty-state">
        <FiPackage className="empty-state__icon" />
        <h2 className="empty-state__title">No orders yet</h2>
        <p className="empty-state__desc">
          When you place orders, they will appear here.
        </p>
        <Button onClick={() => router.push('/products')}>Start Shopping</Button>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'order-card__status--success';
      case 'canceled':
      case 'cancelled': return 'order-card__status--error';
      case 'paid': return 'order-card__status--info';
      default: return 'order-card__status--warning';
    }
  };

  return (
    <div className="orders-page fade-in" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>My Orders</h1>

      <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {orders.map((item) => (
          <div className="order-card" key={item.order_item_id} style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '16px' }}>
            <div className="order-card__header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <span className="order-card__id" style={{ fontWeight: 'bold', display: 'block' }}>Order #{item.order_id} | Item #{item.order_item_id}</span>
                <span className="order-card__date" style={{ color: '#666', fontSize: '14px' }}>
                  Placed on {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              <span className={`order-card__status ${getStatusClass(item.status)}`} style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', height: 'fit-content' }}>
                {item.status || 'Processing'}
              </span>
            </div>

            <div className="order-card__body" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f9f9f9', flexShrink: 0 }}>
                <Image
                  src={item.product_details?.image_url}
                  alt={item.product_details?.name || 'Product Image'}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px', color: '#1a1a1a' }}>
                  {item.product_details?.name}
                </h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>
                  Quantity: {item.product_details?.quantity}
                </p>
                <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#008b8b' }}>
                  ₹{Number(item.product_details?.price || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="order-card__footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
              {item.status?.toLowerCase() !== 'canceled' && item.status?.toLowerCase() !== 'cancelled' && item.status?.toLowerCase() !== 'delivered' && (
                <Button
                  variant="ghost"
                  className="order-card__cancel-btn"
                  onClick={() => handleCancelOrder(item.order_id, item.order_item_id)}
                  disabled={isCancelling}
                  style={{ color: '#d32f2f' }}
                >
                  <FiXCircle size={16} style={{ marginRight: '4px' }} /> Cancel Item
                </Button>
              )}

              <Button
                variant="secondary"
                onClick={() => router.push(`/orders/${item.order_id}`)}
              >
                View Details <FiChevronRight size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
