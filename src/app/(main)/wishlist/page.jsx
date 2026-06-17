'use client';

/**
 * Wishlist Page — displays saved products
 * Uses RTK Query hooks: useGetWishlistDetailsQuery, useUpdateWishlistMutation
 * "Move to Cart" actually adds to cart and removes from wishlist
 */
import {
  useGetWishlistDetailsQuery,
  useUpdateWishlistMutation,
  useUpdateCartMutation,
} from '@/services/orderApi';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { selectProfile } from '@/redux/slice/authSlice';
import { showSnackbar } from '@/redux/slice/snackbarSlice';
import Link from 'next/link';
import Image from 'next/image';
import { FiHeart, FiTrash2, FiShoppingCart, FiEye, FiShoppingBag } from 'react-icons/fi';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const userId = profile?.user_id;
  const { data: wishlistData, isLoading, isError } = useGetWishlistDetailsQuery(userId, { skip: !userId });
  const [updateWishlist, { isLoading: isUpdatingWishlist }] = useUpdateWishlistMutation();
  const [updateCart, { isLoading: isAddingToCart }] = useUpdateCartMutation();
  console.log(wishlistData)
  const wishlist = wishlistData?.data || [];

  const handleRemove = async (productId) => {
    try {
      await updateWishlist({ userId, productId }).unwrap();
      dispatch(
        showSnackbar({ message: 'Removed from wishlist', type: 'success' })
      );
    } catch (err) {
      dispatch(
        showSnackbar({ message: 'Failed to remove from wishlist', type: 'error' })
      );
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      console.log('prod', productId)
      // Add to cart first
      await updateCart({ userId, productId, quantity: 1 }).unwrap();
      // Then remove from wishlist
      await updateWishlist({ userId, productId }).unwrap();
      dispatch(
        showSnackbar({ message: 'Moved to cart successfully!', type: 'success' })
      );
    } catch (err) {
      dispatch(
        showSnackbar({ message: 'Failed to move to cart', type: 'error' })
      );
    }
  };

  if (isLoading) return <Loader message="Loading wishlist..." />;

  if (isError || wishlist.length === 0) {
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
        {wishlist.length > 0 && wishlist?.map((item) => {
          const productId = item.product_id || item._id;
          const hasDiscount = item.discountPrice && item.discountPrice < item.price;

          return (
            <div className="wishlist-card" key={productId} id={`wishlist-item-${productId}`}>
              {/* Product Image */}
              <Link href={`/product?id=${productId}`} className="wishlist-card__image-wrap">
                {item.image_url ? (
                  <Image src={item.image_url} alt={item.name} className="wishlist-card__img" width={400} height={400} unoptimized />
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
                <Link href={`/product?id=${productId}`}>
                  <h4 className="wishlist-card__name">{item.name || 'Product Name'}</h4>
                </Link>
                <div className="wishlist-card__pricing">
                  {/* <span className="wishlist-card__price">
                    ₹{(hasDiscount ? item.discountPrice : item.price)?.toFixed(2) || '0.00'}
                  </span> */}
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
