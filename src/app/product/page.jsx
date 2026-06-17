/**
 * SSR Product Detail Page — Server Component
 *
 * Fetches product data at request time via the internal Next.js API route.
 * Uses searchParams (query params) — e.g. /product?id=xxx
 *
 * This demonstrates:
 * - Next.js SSR with server components
 * - API route usage for server-side data fetching
 * - Query params (searchParams) in Next.js App Router
 */
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiPackage, FiStar, FiTruck, FiShield } from 'react-icons/fi';
import ProductActions from '@/components/products/ProductActions';

// Metadata for SEO — dynamic based on product
export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const productId = params?.id;

  if (!productId) {
    return { title: 'Product Not Found — QuickBuy' };
  }

  try {
    const res = await fetch(
      `http://localhost:3000/api/product?id=${productId}`,
      { cache: 'no-store' }
    );
    const data = await res.json();
    const product = data?.data;

    if (product) {
      return {
        title: `${product.name} — QuickBuy`,
        description: product.description || `Buy ${product.name} on QuickBuy`,
      };
    }
  } catch {
    // fallback
  }

  return { title: 'Product — QuickBuy' };
}

export default async function ProductDetailPage({ searchParams }) {
  const params = await searchParams;
  const productId = params?.id;

  // No ID provided
  if (!productId) {
    return (
      <div className="product-detail-error">
        <div className="product-detail-error__card">
          <FiPackage size={48} />
          <h1>Product Not Found</h1>
          <p>No product ID was provided. Please select a product from the catalogue.</p>
          <Link href="/products" className="product-detail-error__back">
            <FiArrowLeft size={18} />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // Fetch product data from our API route (SSR — runs on the server)
  let product = null;
  let fetchError = null;

  try {
    const res = await fetch(
      `http://localhost:3000/api/product?id=${productId}`,
      { cache: 'no-store' }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      fetchError = errData?.error || 'Product not found';
    } else {
      const data = await res.json();
      product = data?.data;
    }
  } catch (err) {
    fetchError = 'Failed to load product details. Please try again later.';
  }

  // Error state
  if (fetchError || !product) {
    return (
      <div className="product-detail-error">
        <div className="product-detail-error__card">
          <FiPackage size={48} />
          <h1>Oops!</h1>
          <p>{fetchError || 'Product not found'}</p>
          <Link href="/products" className="product-detail-error__back">
            <FiArrowLeft size={18} />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  // Extract product fields
  const {
    product_id,
    name = 'Unnamed Product',
    price = 0,
    description = '',
    image,
    images = [],
    category,
    brand,
    stock,
    discountPrice,
    ratings,
  } = product;

  const resolvedId = _product_id;
  const allImages = image ? [image, ...images.filter((i) => i !== image)] : images;
  const hasDiscount = discountPrice && discountPrice < price;
  const inStock = stock === undefined || stock > 0;

  return (
    <div className="product-detail" id="product-detail-page">
      {/* Breadcrumb */}
      <nav className="product-detail__breadcrumb">
        <Link href="/products" className="product-detail__breadcrumb-link">
          <FiArrowLeft size={16} />
          Products
        </Link>
        <span className="product-detail__breadcrumb-sep">/</span>
        <span className="product-detail__breadcrumb-current">{name}</span>
      </nav>

      <div className="product-detail__layout">
        {/* Image Gallery */}
        <div className="product-detail__gallery">
          <div className="product-detail__main-image">
            {allImages.length > 0 ? (
              <Image
                src={allImages[0]}
                alt={name}
                className="product-detail__img"
                width={600}
                height={600}
                unoptimized
              />
            ) : (
              <div className="product-detail__img-placeholder">
                <FiPackage size={64} />
                <span>No image available</span>
              </div>
            )}

            {hasDiscount && (
              <span className="product-detail__discount-badge">
                {Math.round(((price - discountPrice) / price) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="product-detail__thumbs">
              {allImages.slice(0, 5).map((img, idx) => (
                <div
                  key={idx}
                  className={`product-detail__thumb ${idx === 0 ? 'product-detail__thumb--active' : ''}`}
                >
                  <Image src={img} alt={`${name} view ${idx + 1}`} width={100} height={100} unoptimized />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-detail__info">
          {category && (
            <span className="product-detail__category">{category}</span>
          )}

          <h1 className="product-detail__name">{name}</h1>

          {brand && (
            <p className="product-detail__brand">by <strong>{brand}</strong></p>
          )}

          {ratings !== undefined && (
            <div className="product-detail__rating">
              <FiStar size={16} className="product-detail__star" />
              <span>{ratings}</span>
              <span className="product-detail__rating-text">rating</span>
            </div>
          )}

          <div className="product-detail__price-block">
            <span className="product-detail__price">
              ₹{(hasDiscount ? discountPrice : price)?.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="product-detail__original-price">
                ₹{price?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <span className={`product-detail__stock ${inStock ? 'product-detail__stock--in' : 'product-detail__stock--out'}`}>
            {inStock ? 'In Stock' : 'Out of Stock'}
          </span>

          {description && (
            <div className="product-detail__description">
              <h3>Description</h3>
              <p>{description}</p>
            </div>
          )}

          {/* Client-side interactive actions */}
          <ProductActions productId={resolvedId} productName={name} />

          {/* Trust badges */}
          <div className="product-detail__trust">
            <div className="product-detail__trust-item">
              <FiTruck size={18} />
              <span>Free Delivery</span>
            </div>
            <div className="product-detail__trust-item">
              <FiShield size={18} />
              <span>Secure Payment</span>
            </div>
            <div className="product-detail__trust-item">
              <FiPackage size={18} />
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
