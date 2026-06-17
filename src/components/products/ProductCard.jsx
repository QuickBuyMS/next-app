'use client';

/**
 * ProductCard — displays a product in the listing grid
 * Links to the SSR product detail page
 * Add to Cart and Add to Wishlist check auth — redirect to signin if unauthenticated
 */
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectProfile } from '@/redux/slice/authSlice';
import { useUpdateCartMutation, useUpdateWishlistMutation } from '@/services/orderApi';
import { showSnackbar } from '@/redux/slice/snackbarSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';

export default function ProductCard({ product }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const profile = useSelector(selectProfile);
  const userId = profile?.user_id;
  const [updateCart, { isLoading: isAdding }] = useUpdateCartMutation();
  const [updateWishlist, { isLoading: isWishing }] = useUpdateWishlistMutation();

  const {
    product_id,
    name = 'Unnamed Product',
    price = 0,
    image,
    image_url,
    category,
    discountPrice,
  } = product;

  const productId = product_id;
  const productImage = image_url;
  const hasDiscount = discountPrice && discountPrice < price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(productId)

    if (!isAuthenticated) {
      router.push(`/signin?redirect=/products`);
      return;
    }

    try {
      await updateCart({ userId, productId, quantity: 1 }).unwrap();
      dispatch(
        showSnackbar({ message: `${name} added to cart!`, type: 'success' })
      );
    } catch (err) {
      dispatch(
        showSnackbar({ message: 'Failed to add to cart', type: 'error' })
      );
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(`/signin?redirect=/products`);
      return;
    }

    try {
      await updateWishlist({ userId, productId }).unwrap();
      dispatch(
        showSnackbar({ message: `${name} added to wishlist!`, type: 'success' })
      );
    } catch (err) {
      dispatch(
        showSnackbar({ message: 'Failed to update wishlist', type: 'error' })
      );
    }
  };

  return (
    <div className="product-card" id={`product-card-${productId}`}>
      <Link href={`/product?id=${productId}`} className="product-card__link">
        <div className="product-card__image-wrap">
          {productImage ? (
            <Image
              src={productImage}
              alt={name}
              className="product-card__img"
              width={400}
              height={400}
              unoptimized
            />
          ) : (
            <div className="product-card__placeholder">
              <FiShoppingCart size={32} />
            </div>
          )}

          {hasDiscount && (
            <span className="product-card__badge">
              {Math.round(((price - discountPrice) / price) * 100)}% OFF
            </span>
          )}

          <div className="product-card__overlay">
            <span className="product-card__overlay-icon">
              <FiEye size={20} />
            </span>
          </div>
        </div>

        <div className="product-card__info">
          {category && (
            <span className="product-card__category">{category}</span>
          )}
          <h3 className="product-card__name">{name}</h3>
          <div className="product-card__pricing">
            <span className="product-card__price">
              ₹{(hasDiscount ? discountPrice : price)?.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="product-card__original-price">
                ₹{price?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="product-card__actions">
        <button
          className="product-card__cart-btn"
          onClick={handleAddToCart}
          disabled={isAdding}
          title="Add to Cart"
        >
          <FiShoppingCart size={16} />
          <span>{isAdding ? 'Adding...' : 'Add to Cart'}</span>
        </button>
        <button
          className={`product-card__wishlist-btn ${isWishing ? 'product-card__wishlist-btn--loading' : ''}`}
          onClick={handleAddToWishlist}
          disabled={isWishing}
          title="Add to Wishlist"
          aria-label="Add to Wishlist"
        >
          <FiHeart size={16} />
        </button>
      </div>
    </div>
  );
}
