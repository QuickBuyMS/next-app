'use client';

import { useGetOrderDetailsQuery, useCancelOrderMutation } from '@/services/orderApi';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiPackage, FiMapPin, FiCreditCard, FiXCircle } from 'react-icons/fi';
import Image from 'next/image';

import { use } from 'react';

export default function OrderDetailsPage({ params }) {
  const router = useRouter();
  const { id: orderId } = use(params);

  const { data: orderDetailsResponse, isLoading, isError } = useGetOrderDetailsQuery(orderId, { skip: !orderId });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const handleCancelOrder = async (orderId, orderItemId) => {
    if (window.confirm('Are you sure you want to cancel this item?')) {
      await cancelOrder({ orderId, orderItemId });
    }
  };

  if (isLoading) return <div className="p-8 flex-center"><Loader message="Loading order details..." /></div>;

  if (isError || !orderDetailsResponse?.data) {
    return (
      <div className="empty-state">
        <FiPackage className="empty-state__icon" />
        <h2 className="empty-state__title">Order Not Found</h2>
        <p className="empty-state__desc">We couldn't find the details for this order.</p>
        <Button onClick={() => router.push('/orders')}>Back to Orders</Button>
      </div>
    );
  }

  const { orderDetails, addressDetails, paymentDetails } = orderDetailsResponse.data;
  
  // orderDetails is an array of items for this order
  const orderSummary = orderDetails?.[0] || {};
  const totalAmount = orderSummary.total_amount || 0;
  const orderDate = new Date(orderSummary.created_at || Date.now()).toLocaleDateString();

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
    <div className="order-details-page fade-in" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Button variant="ghost" onClick={() => router.push('/orders')} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#666' }}>
        <FiChevronLeft /> Back to Orders
      </Button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title" style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Order Details</h1>
        <span className="order-card__id" style={{ fontSize: '16px', color: '#666' }}>Order #{orderId}</span>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        
        {/* Order Items */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiPackage /> Items Ordered
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orderDetails?.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '16px', borderBottom: index !== orderDetails.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f9f9f9', flexShrink: 0 }}>
                  <Image 
                    src={item.image_url || 'https://via.placeholder.com/150'} 
                    alt={item.name || 'Product'} 
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px', color: '#1a1a1a' }}>{item.name}</h3>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '4px' }}>Item #{item.order_item_id} | Quantity: {item.quantity}</p>
                  <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#008b8b' }}>₹{Number(item.price || 0).toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <span className={`order-card__status ${getStatusClass(item.status)}`} style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px' }}>
                    {item.status || 'Processing'}
                  </span>
                  {item.status?.toLowerCase() !== 'canceled' && item.status?.toLowerCase() !== 'cancelled' && item.status?.toLowerCase() !== 'delivered' && (
                    <Button 
                      variant="ghost" 
                      onClick={() => handleCancelOrder(orderId, item.order_item_id)} // Make sure order_item_id is available! Wait, `getParticularOrder` needs to select `oi.order_item_id` if we want to cancel individual items!
                      disabled={isCancelling}
                      style={{ color: '#d32f2f', fontSize: '12px', padding: '4px 8px' }}
                    >
                      <FiXCircle size={14} style={{ marginRight: '4px' }} /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {/* Shipping Address */}
          {addressDetails && (
            <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMapPin /> Shipping Address
              </h2>
              <p style={{ color: '#444', lineHeight: '1.5' }}>
                {addressDetails.city}, {addressDetails.state}<br/>
                Pincode: {addressDetails.pincode}<br/>
                {addressDetails.country || 'India'}
              </p>
            </div>
          )}

          {/* Payment Details */}
          {paymentDetails && (
            <div style={{ backgroundColor: '#fff', border: '1px solid #eee', borderRadius: '12px', padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiCreditCard /> Payment Summary
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Payment Method</span>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{paymentDetails.payment_method || 'N/A'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Payment Status</span>
                  <span className={`order-card__status ${getStatusClass(paymentDetails.payment_status)}`} style={{ padding: '2px 6px', fontSize: '12px', borderRadius: '4px' }}>
                    {paymentDetails.payment_status || 'Pending'}
                  </span>
                </div>
                {paymentDetails.transaction_id && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Transaction ID</span>
                    <span style={{ fontSize: '14px', color: '#666' }}>{paymentDetails.transaction_id}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #ccc' }}>
                  <span style={{ fontWeight: 'bold' }}>Total Amount</span>
                  <span style={{ fontWeight: 'bold', color: '#008b8b', fontSize: '18px' }}>₹{Number(totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
