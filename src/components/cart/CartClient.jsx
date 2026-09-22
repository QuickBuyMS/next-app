'use client';

/**
 * CartClient — displays items in the user's cart (Pure CSR)
 */
import { useGetCartDetailsQuery, useUpdateCartMutation } from '@/services/orderApi';
import CartItem from '@/components/orders/CartItem';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '@/redux/slice/snackbarSlice';
import { selectProfile } from '@/redux/slice/authSlice';
import { FiShoppingCart, FiArrowLeft, FiShield, FiTruck } from 'react-icons/fi';
import Link from 'next/link';
import { useCallback } from 'react';

export default function CartClient() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectProfile);
  const userId = user?.user_id || user?.id;

  const { data, isLoading: isFetching, error } = useGetCartDetailsQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });
  
  const [updateCart, { isLoading: isUpdating }] = useUpdateCartMutation();

  const rawData = data?.data || data;
  const isArray = Array.isArray(rawData);
  const cartItems = isArray ? rawData : (rawData?.items || []);
  const totalAmount = isArray
    ? (rawData.length > 0 ? rawData[0].cart_total : 0)
    : (rawData?.totalAmount || 0);

  const itemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleUpdateQuantity = useCallback(async (productId, quantity) => {
    try {
      await updateCart({ userId, productId, quantity }).unwrap();
    } catch (err) {
      dispatch(showSnackbar({ message: 'Failed to update quantity', type: 'error' }));
    }
  }, [updateCart, userId, dispatch]);

  const handleRemoveItem = useCallback(async (productId) => {
    try {
      await updateCart({ userId, productId, quantity: 0 }).unwrap();
      dispatch(showSnackbar({ message: 'Item removed from cart', type: 'success' }));
    } catch (err) {
      dispatch(showSnackbar({ message: 'Failed to remove item', type: 'error' }));
    }
  }, [updateCart, userId, dispatch]);

  if (isFetching && cartItems.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load cart. Please try again.
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="empty-state">
        <FiShoppingCart className="empty-state__icon" />
        <h2 className="empty-state__title">Your cart is empty</h2>
        <p className="empty-state__desc">
          Looks like you haven&apos;t added anything to your cart yet.
          Start browsing products to find something you love!
        </p>
        <Button onClick={() => router.push('/products')}>Browse Products</Button>
      </div>
    );
  }

  return (
    <div className="cart-page" id="cart-page">
      <div className="cart-page__header">
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p className="cart-page__count">{itemCount} item{itemCount !== 1 ? 's' : ''} in your cart</p>
        </div>
        <Link href="/products" className="cart-page__continue">
          <FiArrowLeft size={16} />
          Continue Shopping
        </Link>
      </div>

      <div className="cart-page__layout">
        <div className="cart-page__items">
          {cartItems.map((item) => (
            <CartItem
              key={item.product_id || item.productId || item._id}
              item={item}
              onUpdate={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        <div className="cart-page__summary">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal ({itemCount} items)</span>
            <span>₹{totalAmount}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span className="text-success">Free</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>Included</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row summary-row--total">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>

          <Button
            className="checkout-btn"
            fullWidth
            onClick={() => router.push('/checkout')}
            disabled={isUpdating}
          >
            Proceed to Checkout
          </Button>

          <div className="cart-page__trust">
            <div className="cart-page__trust-item">
              <FiShield size={14} />
              <span>Secure Checkout</span>
            </div>
            <div className="cart-page__trust-item">
              <FiTruck size={14} />
              <span>Free Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
