'use client';

/**
 * Cart Page — displays items in the user's cart
 * Uses RTK Query hooks: useGetCartDetailsQuery, useUpdateCartMutation
 * Each item links to the SSR product detail page
 */
import { useGetCartDetailsQuery, useUpdateCartMutation } from '@/services/orderApi';
import CartItem from '@/components/orders/CartItem';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { selectProfile } from '@/redux/slice/authSlice';
import { showSnackbar } from '@/redux/slice/snackbarSlice';
import { FiShoppingCart, FiArrowLeft, FiShield, FiTruck } from 'react-icons/fi';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const userId = profile?.user_id;
  const { data: cartData, isLoading, isError } = useGetCartDetailsQuery(userId, { skip: !userId });
  const [updateCart, { isLoading: isUpdating }] = useUpdateCartMutation();

  const rawData = cartData?.data;
  const isArray = Array.isArray(rawData);
  const cartItems = isArray ? rawData : (rawData?.items || []);
  const totalAmount = isArray
    ? (rawData.length > 0 ? rawData[0].cart_total : 0)
    : (rawData?.totalAmount || 0);

  const cart = { items: cartItems, totalAmount };
  const itemCount = cart.items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      await updateCart({ userId, productId, quantity }).unwrap();
    } catch (err) {
      dispatch(
        showSnackbar({ message: 'Failed to update quantity', type: 'error' })
      );
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await updateCart({ userId, productId, quantity: 0 }).unwrap();
      dispatch(
        showSnackbar({ message: 'Item removed from cart', type: 'success' })
      );
    } catch (err) {
      dispatch(
        showSnackbar({ message: 'Failed to remove item', type: 'error' })
      );
    }
  };

  if (isLoading) return <Loader message="Loading cart..." />;

  if (isError || cart.items.length === 0) {
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

  console.log(cart)

  return (
    <div className="cart-page" id="cart-page">
      {/* Header with back link */}
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
        {/* Cart Items */}
        <div className="cart-page__items">
          {cart.items.map((item) => (
            <CartItem
              key={item.product_id || item.productId || item._id}
              item={item}
              onUpdate={handleUpdateQuantity}
              onRemove={handleRemoveItem}
            />
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="cart-page__summary">
          <h3 className="summary-title">Order Summary</h3>

          <div className="summary-row">
            <span>Subtotal ({itemCount} items)</span>
            <span>₹{cart.totalAmount}</span>
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
            <span>₹{cart.totalAmount}</span>
          </div>

          <Button
            className="checkout-btn"
            fullWidth
            onClick={() => router.push('/checkout')}
            disabled={isUpdating}
          >
            Proceed to Checkout
          </Button>

          {/* Trust badges */}
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
