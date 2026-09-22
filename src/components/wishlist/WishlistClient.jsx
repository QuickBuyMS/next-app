'use client';

/**
 * WishlistClient — displays saved products (Pure CSR)
 */
import {
  useGetWishlistDetailsQuery,
  useUpdateWishlistMutation,
  useUpdateCartMutation,
} from '@/services/orderApi';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '@/redux/slice/snackbarSlice';
import { selectProfile } from '@/redux/slice/authSlice';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiTrash2, FiShoppingCart, FiEye, FiShoppingBag } from 'react-icons/fi';

export default function WishlistClient() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectProfile);
  const userId = user?.user_id || user?.id;

  const { data, isLoading: isFetching, error } = useGetWishlistDetailsQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  });

  const [updateWishlist, { isLoading: isUpdatingWishlist }] = useUpdateWishlistMutation();
  const [updateCart, { isLoading: isAddingToCart }] = useUpdateCartMutation();

  const wishlist = data?.data || data || [];

  const handleRemove = async (productId) => {
    try {
      await updateWishlist({ userId, productId }).unwrap();
      dispatch(showSnackbar({ message: 'Removed from wishlist', type: 'success' }));
    } catch (err) {
      dispatch(showSnackbar({ message: 'Failed to remove from wishlist', type: 'error' }));
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await updateCart({ userId, productId, quantity: 1 }).unwrap();
      await updateWishlist({ userId, productId }).unwrap();
      dispatch(showSnackbar({ message: 'Moved to cart successfully!', type: 'success' }));
    } catch (err) {
      dispatch(showSnackbar({ message: 'Failed to move to cart', type: 'error' }));
    }
  };

  if (isFetching && wishlist.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        Failed to load wishlist. Please try again.
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="empty-state">
        <FiHeart className="empty-state__icon" />
        <h2 className="empty-state__title">Your wishlist is empty</h2>
        <p className="empty-state__desc">
          Save items you love here to buy them later. Browse products and click
          the heart icon to add items.
        </p>
        <Button onClick={() => router.push('/products')}>
          <FiShoppingBag size={18} />
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="wishlist-page" id="wishlist-page">
      <div className="wishlist-page__header">
        <div>
          <h1 className="page-title">My Wishlist</h1>
          <p className="wishlist-page__count">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
          </p>
        </div>
      </div>

      <div className="wishlist-grid">
        {wishlist.length > 0 && wishlist.map((item) => {
          const productId = item.product_id || item._id;

          return (
            <div className="wishlist-card" key={productId} id={`wishlist-item-${productId}`}>
              {/* Product Image */}
              <Link href={`/products/${productId}`} className="wishlist-card__image-wrap">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} className="wishlist-card__img" width={400} height={400} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                ) : (
                  <div className="wishlist-card__placeholder">
                    <FiShoppingBag size={32} />
                  </div>
                )}

                <span className="wishlist-card__badge">
                  ₹{item.price}
                </span>

                {/* Hover overlay */}
                <div className="wishlist-card__overlay">
                  <span className="wishlist-card__overlay-icon">
                    <FiEye size={20} />
                  </span>
                </div>
              </Link>

              {/* Product Info */}
              <div className="wishlist-card__info">
                {item.category && (
                  <span className="wishlist-card__category">{item.category}</span>
                )}
                <Link href={`/products/${productId}`}>
                  <h4 className="wishlist-card__name">{item.name || 'Product Name'}</h4>
                </Link>
                <div className="wishlist-card__pricing">
                </div>
              </div>

              {/* Action Buttons */}
              <div className="wishlist-card__actions">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleMoveToCart(productId)}
                  disabled={isAddingToCart || isUpdatingWishlist}
                  className="wishlist-card__cart-btn"
                >
                  <FiShoppingCart size={14} />
                  Move to Cart
                </Button>
                <button
                  className="wishlist-card__remove"
                  onClick={() => handleRemove(productId)}
                  disabled={isUpdatingWishlist}
                  title="Remove from wishlist"
                  aria-label="Remove from wishlist"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
