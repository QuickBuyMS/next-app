'use client';

/**
 * ProductActions — client-side interactive buttons for product detail page
 * Handles "Add to Cart", "Buy Now", and "Add to Wishlist" with auth gating
 */
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated } from '@/redux/slice/authSlice';
import { useUpdateCartMutation, useUpdateWishlistMutation } from '@/services/orderApi';
import { showSnackbar } from '@/redux/slice/snackbarSlice';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { FiShoppingCart, FiZap, FiHeart } from 'react-icons/fi';

export default function ProductActions({ productId, productName }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [updateCart, { isLoading: isAdding }] = useUpdateCartMutation();
  const [updateWishlist, { isLoading: isWishing }] = useUpdateWishlistMutation();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/signin?redirect=/products/${productId}`);
      return;
    }

    try {
      await updateCart({ productId, quantity: 1 }).unwrap();
      dispatch(
        showSnackbar({ message: `${productName || 'Product'} added to cart!`, type: 'success' })
      );
    } catch (err) {
      dispatch(
        showSnackbar({ message: 'Failed to add to cart', type: 'error' })
      );
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push(`/signin?redirect=/product?id=${productId}`);
      return;
    }

    try {
      await updateCart({ productId, quantity: 1 }).unwrap();
      router.push('/checkout');
    } catch (err) {
      dispatch(
        showSnackbar({ message: 'Failed to add to cart', type: 'error' })
      );
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      router.push(`/signin?redirect=/product?id=${productId}`);
      return;
    }

    try {
      await updateWishlist({ productId }).unwrap();
      dispatch(
        showSnackbar({ message: `${productName || 'Product'} added to wishlist!`, type: 'success' })
      );
    } catch (err) {
      dispatch(
        showSnackbar({ message: 'Failed to update wishlist', type: 'error' })
      );
    }
  };

  return (
    <div className="product-actions" id="product-actions">
      <div className="product-actions__buttons">
        <Button
          variant="secondary"
          size="lg"
          onClick={handleAddToCart}
          loading={isAdding}
          className="product-actions__cart-btn"
        >
          <FiShoppingCart size={18} />
          Add to Cart
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={handleBuyNow}
          className="product-actions__buy-btn"
        >
          <FiZap size={18} />
          Buy Now
        </Button>
      </div>

      <button
        className={`product-actions__wishlist ${isWishing ? 'product-actions__wishlist--loading' : ''}`}
        onClick={handleWishlist}
        disabled={isWishing}
        title={`Add ${productName || 'product'} to wishlist`}
        aria-label="Add to wishlist"
      >
        <FiHeart size={20} />
      </button>
    </div>
  );
}
