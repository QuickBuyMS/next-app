/**
 * SSR Product Detail Page — Server Component
 *
 * Fetches product data at request time via the internal Next.js API route.
 * Uses dynamic route params — /products/{id}
 *
 * This demonstrates:
 * - Next.js SSR with server components
 * - Dynamic route segments ([id] param)
 * - API route usage for server-side data fetching
 * - fetchData wrapper for clean try-catch handling
 */
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowLeft, FiPackage, FiStar, FiTruck, FiShield } from 'react-icons/fi';
import ProductActions from '@/components/products/ProductActions';
import { fetchData } from '@/utils/fetchData';

const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Metadata for SEO — dynamic based on product
export async function generateMetadata({ params }) {
  const { id: productId } = await params;

  if (!productId) {
    return { title: 'Product Not Found — QuickBuy' };
  }

  const isPreRendered = ['1', '2', '3', '4', '5'].includes(String(productId));

  const { data: product } = await fetchData({
    url: `${API_BASE_URL}/api/products/${productId}`,
    label: 'ProductMeta',
    revalidate: isPreRendered ? undefined : 180,
    fallback: null,
  });

  if (product) {
    return {
      title: `${product.name} — QuickBuy`,
      description: product.description || `Buy ${product.name} on QuickBuy`,
    };
  }

  return { title: 'Product — QuickBuy' };
}

// Pre-render specific products (IDs 1-5) at build time
export async function generateStaticParams() {
  const ids = ['1', '2', '3', '4', '5'];

  return ids.map((id) => ({
    id: id,
  }));
}

export default async function ProductDetailPage({ params }) {
  const { id: productId } = await params;

  const isPreRendered = ['1', '2', '3', '4', '5'].includes(String(productId));

  // Fetch product data from our API route (SSR — runs on the server)
  const { data: product, error: fetchError } = await fetchData({
    url: `${API_BASE_URL}/api/products/${productId}`,
    label: 'ProductDetail',
    revalidate: isPreRendered ? undefined : 180,
    fallback: null,
  });

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

  const resolvedId = product_id;
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
