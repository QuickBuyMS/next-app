'use client';

/**
 * ProductListingClient — client-side interactive shell for the ISR products page
 *
 * Receives pre-fetched products & categories from the server component,
 * handles search, category filter, and price range filtering entirely
 * client-side (in-memory). URL query params stay synced for shareability.
 *
 * Performance optimizations:
 * - useTransition: wraps router.replace() calls to keep UI responsive during navigation
 * - useDeferredValue: defers search input rendering so typing stays snappy
 * - useCallback: memoizes updateMultipleParams and handlers
 * - Hero image: uses next/image with priority + fetchPriority for LCP
 */
import ProductCard from '@/components/products/ProductCard';
import Loader from '@/components/ui/Loader';
import Pagination from '@/components/ui/Pagination';
import { FiSearch, FiPackage, FiX, FiFilter, FiClock } from 'react-icons/fi';
import { useMemo } from 'react';
import { useProductFilters } from '@/hooks/useProductFilters';

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
  const {
    isNavigating,
    hasFilter,
    localSearch, setLocalSearch,
    localMinPrice, setLocalMinPrice,
    localMaxPrice, setLocalMaxPrice,
    selectedCategory, selectedSubcategory,
    updateMultipleParams,
    handleClearAll,
    handlePageChange,
    handlePageSizeChange,
  } = useProductFilters();

  // The server now handles all filtering and sends us the exact list
  const displayProducts = initialProducts;

  // Format the ISR fetch timestamp for display — memoized to avoid recalc on re-render
  const formattedFetchedAt = useMemo(() => {
    if (!fetchedAt) return null;
    return new Date(fetchedAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [fetchedAt]);

  return (
    <>
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

        <span className="products-search__count" style={{ opacity: isNavigating ? 0.5 : 1, transition: 'opacity 0.2s' }}>
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
    </>
  );
}
