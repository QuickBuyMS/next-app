'use client';

/**
 * ProductListingClient — client-side interactive shell for the ISR products page
 *
 * Receives pre-fetched products & categories from the server component,
 * handles search, category filter, and price range filtering entirely
 * client-side (in-memory). URL query params stay synced for shareability.
 */
import ProductCard from '@/components/products/ProductCard';
import Loader from '@/components/ui/Loader';
import Pagination from '@/components/ui/Pagination';
import { FiSearch, FiPackage, FiX, FiFilter, FiClock } from 'react-icons/fi';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export default function ProductListingClient({
  initialProducts = [],
  categories = [],
  subcategories = [],
  fetchedAt,
  isSSRFiltered = false,
  currentPage = 1,
  pageSize = 5,
  hasMore = false,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read filter state from URL query params
  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedSubcategory = searchParams.get('subcategory') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const hasFilter = Boolean(
    searchTerm || selectedCategory || selectedSubcategory || minPriceParam || maxPriceParam
  );

  // Local state for debounced inputs
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  // Sync local state when URL params change externally
  useEffect(() => {
    setLocalSearch(searchTerm);
    setLocalMinPrice(minPriceParam);
    setLocalMaxPrice(maxPriceParam);
  }, [searchTerm, minPriceParam, maxPriceParam]);

  // Update URL query params
  const updateMultipleParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Reset page to 1 if we are changing core filters
      if ('search' in updates || 'category' in updates || 'subcategory' in updates || 'minPrice' in updates || 'maxPrice' in updates) {
        params.delete('page');
      }

      // If category changes, reset subcategory
      if ('category' in updates) {
        params.delete('subcategory');
      }

      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      const qs = params.toString();
      router.replace(`/products${qs ? `?${qs}` : ''}`, { scroll: false });
    },
    [searchParams, router]
  );

  const handlePageChange = (newPage) => {
    updateMultipleParams({ page: newPage });
  };

  const handlePageSizeChange = (newSize) => {
    // When changing page size, we must reset back to page 1
    updateMultipleParams({ limit: newSize, page: 1 });
  };

  // Debounce text/price inputs → push to URL
  useEffect(() => {
    const handler = setTimeout(() => {
      const updates = {};
      let hasChanges = false;
      if (localSearch !== searchTerm) {
        updates.search = localSearch;
        hasChanges = true;
      }
      if (localMinPrice !== minPriceParam) {
        updates.minPrice = localMinPrice;
        hasChanges = true;
      }
      if (localMaxPrice !== maxPriceParam) {
        updates.maxPrice = localMaxPrice;
        hasChanges = true;
      }

      if (hasChanges) {
        updateMultipleParams(updates);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [
    localSearch,
    localMinPrice,
    localMaxPrice,
    searchTerm,
    minPriceParam,
    maxPriceParam,
    updateMultipleParams,
  ]);

  // Clear all filters
  const handleClearAll = () => {
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    router.replace('/products', { scroll: false });
  };

  // The server now handles all filtering and sends us the exact list
  const displayProducts = initialProducts;

  // Format the ISR fetch timestamp for display
  const formattedFetchedAt = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

  return (
    <div className="products-page" id="products-page">
      {/* Hero Banner */}
      <div className="products-hero">
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

      {/* Search and Filter */}
      <div
        className="products-search"
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div
          className="products-search__wrapper"
          style={{ flex: 1, minWidth: '250px' }}
        >
          <FiSearch className="products-search__icon" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            className="products-search__input"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            id="products-search-input"
          />
          {hasFilter && (
            <button
              className="products-search__clear"
              onClick={handleClearAll}
              aria-label="Clear all filters"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        <div
          className="products-filter"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--white)',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border)',
          }}
        >
          <FiFilter
            size={18}
            style={{ color: 'var(--text-secondary)' }}
          />
          <select
            value={selectedCategory}
            onChange={(e) =>
              updateMultipleParams({ category: e.target.value })
            }
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => (
              <option
                key={cat.category_id || idx}
                value={cat.category_id || cat.name}
              >
                {cat.name || cat}
              </option>
            ))}
          </select>

          {selectedCategory && subcategories.length > 0 && (
            <>
              <div
                style={{
                  width: '1px',
                  height: '20px',
                  background: 'var(--border)',
                  margin: '0 0.5rem',
                }}
              ></div>
              <select
                value={selectedSubcategory}
                onChange={(e) =>
                  updateMultipleParams({ subcategory: e.target.value })
                }
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                <option value="">All Subcategories</option>
                {subcategories.map((sub, idx) => (
                  <option
                    key={sub.subcategory_id || idx}
                    value={sub.subcategory_id || sub.name}
                  >
                    {sub.name || sub}
                  </option>
                ))}
              </select>
            </>
          )}

          <div
            style={{
              width: '1px',
              height: '20px',
              background: 'var(--border)',
              margin: '0 0.5rem',
            }}
          ></div>
          <input
            type="number"
            placeholder="Min ₹"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              width: '60px',
            }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>-</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text-main)',
              fontSize: '0.9rem',
              width: '60px',
            }}
          />
        </div>

        <span className="products-search__count">
          {displayProducts.length} product
          {displayProducts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ISR indicator */}
      {formattedFetchedAt && (
        <div
          className="products-isr-badge"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.8rem',
            margin: '0 auto 1rem',
            maxWidth: '1300px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            opacity: 0.7,
          }}
        >
          <FiClock size={12} />
          <span>
            {isSSRFiltered
              ? `Live SSR search results (Fetched at ${formattedFetchedAt})`
              : `Data cached at ${formattedFetchedAt} · Refreshes every 3 min (ISR)`}
          </span>
        </div>
      )}

      {/* Product Grid */}
      {displayProducts.length === 0 ? (
        <div className="empty-state">
          <FiSearch className="empty-state__icon" />
          <h2 className="empty-state__title">No products found</h2>
          <p className="empty-state__desc">
            {hasFilter
              ? 'No products match the selected filters.'
              : 'Unable to load products. Please check your connection and try again.'}
          </p>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {displayProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            hasMore={hasMore}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </div>
  );
}
