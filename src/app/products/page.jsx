/**
 * ISR Product Listing Page — Server Component
 *
 * Fetches the full product list and categories at build time via internal
 * Next.js API routes (/api/products, /api/categories), then revalidates
 * every 3 minutes (180 seconds).
 *
 * Interactive features (search, filters) are handled client-side via
 * the <ProductListingClient> component — it receives the pre-fetched
 * data as props and filters in-memory without extra network calls.
 *
 * This demonstrates:
 * - Next.js ISR with `revalidate = 180`
 * - All API calls routed through Next.js API routes (proxy layer)
 * - fetchData wrapper for clean try-catch handling
 */
import ProductListingClient from '@/components/products/ProductListingClient';
import IntentMatchmaker from '@/components/products/IntentMatchmaker';
import { fetchData } from '@/utils/fetchData';
import Image from 'next/image';

// Base URL for internal API routes (server-side fetch needs absolute URL)
const API_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  title: 'Browse Products — QuickBuy',
  description:
    'Discover amazing products on QuickBuy. Browse our curated collection of electronics, fashion, home & more.',
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;

  const search = params?.search || '';
  const category = params?.category || '';
  const subcategory = params?.subcategory || '';
  const minPrice = params?.minPrice || '';
  const maxPrice = params?.maxPrice || '';
  const page = params?.page ? parseInt(params.page, 10) : 1;
  const limit = params?.limit ? parseInt(params.limit, 10) : 5;
  const offset = (page - 1) * limit;

  const hasFilter = Boolean(search || category || subcategory || minPrice || maxPrice || page > 1 || limit !== 5);

  // Always hit the filter endpoint so we can enforce limit=5
  const productsPromise = fetchData({
    url: `${API_BASE_URL}/api/products/filter`,
    method: 'POST',
    body: {
      name: search || undefined,
      categoryId: category ? Number(category) : undefined,
      subcategoryId: subcategory ? Number(subcategory) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      limit,
      offset,
    },
    label: 'SSR /products/filter',
    fallback: [],
    revalidate: false, // Don't cache dynamic searches
  });

  // Fetch categories
  const categoriesPromise = fetchData({
    url: `${API_BASE_URL}/api/categories`,
    label: 'ISR /categories',
    revalidate: 180,
    fallback: [],
  });

  // Fetch subcategories conditionally if a category is selected
  let subcategoriesPromise = Promise.resolve({ data: [] });
  if (category) {
    subcategoriesPromise = fetchData({
      url: `${API_BASE_URL}/api/categories/${category}/subcategories`,
      label: 'SSR /subcategories',
      fallback: [],
      revalidate: false, // Re-fetch when category changes
    });
  }

  // Fetch all in parallel
  const [productsResult, categoriesResult, subcategoriesResult] = await Promise.all([
    productsPromise,
    categoriesPromise,
    subcategoriesPromise,
  ]);

  const fetchedAt = new Date().toISOString();
  const productsData = productsResult.data || [];

  return (
    <div className="products-page" id="products-page">
      {/* 
        LCP OPTIMIZATION:
        The Hero banner is placed directly in this Server Component.
        This guarantees the <img fetchpriority="high"> tag is in the initial HTML sent to the browser.
        If it were inside the ProductListingClient, the browser's preload scanner might miss it
        while waiting for the JS bundle to download and hydrate.
      */}
      <div className="products-hero">
        <Image
          src="/hero-banner-opt.webp"
          alt="Discover amazing products on QuickBuy"
          className="products-hero__image"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          unoptimized={true} // Bypasses the slow local dev image optimizer since we statically compressed it
        />
        <div className="products-hero__content">
          <h1 className="products-hero__title">
            Discover Amazing Products
          </h1>
          <p className="products-hero__subtitle">
            Browse our curated collection — no account needed
          </p>
        </div>
        <div className="products-hero__glow" />
      </div>

      <IntentMatchmaker />

      <ProductListingClient
        initialProducts={productsData}
        categories={categoriesResult.data}
        subcategories={subcategoriesResult.data}
        fetchedAt={fetchedAt}
        isSSRFiltered={hasFilter}
        currentPage={page}
        pageSize={limit}
        hasMore={productsData.length === limit}
      />
    </div>
  );
}
