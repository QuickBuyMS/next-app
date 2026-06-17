'use client';

/**
 * Public Products Page — browse products without login
 * Uses RTK Query to fetch product list from catalogue API
 * Each product links to the SSR product detail page (/product?id=xxx)
 * Search term is synced with URL query params (/products?search=xxx)
 */
import { useFilterProductsQuery, useGetProductsQuery, useGetCategoriesQuery } from '@/services/catalogueApi';
import ProductCard from '@/components/products/ProductCard';
import Loader from '@/components/ui/Loader';
import { FiSearch, FiPackage, FiX, FiFilter } from 'react-icons/fi';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read search term and category from URL query params
  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  const hasFilter = Boolean(searchTerm || selectedCategory || minPriceParam || maxPriceParam);

  const {
    data: allData,
    isLoading: isAllLoading,
    isError: isAllError,
    error: allError,
  } = useGetProductsQuery(undefined, { skip: hasFilter });

  const {
    data: filterData,
    isLoading: isFilterLoading,
    isError: isFilterError,
    error: filterError,
  } = useFilterProductsQuery({
    name: searchTerm || undefined,
    categoryId: selectedCategory ? Number(selectedCategory) : undefined,
    minPrice: minPriceParam ? Number(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
  }, { skip: !hasFilter });

  const { data: catData } = useGetCategoriesQuery();

  const isLoading = isAllLoading || isFilterLoading;
  const isError = isAllError || isFilterError;
  const error = hasFilter ? filterError : allError;
  const activeData = hasFilter ? filterData : allData;

  const categories = catData?.data || [];

  const filteredProducts = activeData?.data || [];

  // Update URL query params when user types in search or selects category
  const updateMultipleParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.replace(`/products?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const [localSearch, setLocalSearch] = useState(searchTerm);
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  useEffect(() => {
    setLocalSearch(searchTerm);
    setLocalMinPrice(minPriceParam);
    setLocalMaxPrice(maxPriceParam);
  }, [searchTerm, minPriceParam, maxPriceParam]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const updates = {};
      let hasChanges = false;
      if (localSearch !== searchTerm) { updates.search = localSearch; hasChanges = true; }
      if (localMinPrice !== minPriceParam) { updates.minPrice = localMinPrice; hasChanges = true; }
      if (localMaxPrice !== maxPriceParam) { updates.maxPrice = localMaxPrice; hasChanges = true; }

      if (hasChanges) {
        updateMultipleParams(updates);
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [localSearch, localMinPrice, localMaxPrice, searchTerm, minPriceParam, maxPriceParam, updateMultipleParams]);

  // Clear search
  const handleClearAll = () => {
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    router.replace('/products', { scroll: false });
  };

  if (isLoading) return <Loader message="Loading products..." />;

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
      <div className="products-search" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="products-search__wrapper" style={{ flex: 1, minWidth: '250px' }}>
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

        <div className="products-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--white)', padding: '0.5rem 1rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border)' }}>
          <FiFilter size={18} style={{ color: 'var(--text-secondary)' }} />
          <select
            value={selectedCategory}
            onChange={(e) => updateMultipleParams({ category: e.target.value })}
            style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <option value="">All Categories</option>
            {categories.map((cat, idx) => (
              <option key={cat.category_id || idx} value={cat.category_id || cat.name}>
                {cat.name || cat}
              </option>
            ))}
          </select>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 0.5rem' }}></div>
          <input
            type="number"
            placeholder="Min ₹"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '0.9rem', width: '60px' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>-</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-main)', fontSize: '0.9rem', width: '60px' }}
          />
        </div>

        <span className="products-search__count">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Product Grid */}
      {isError ? (
        <div className="empty-state">
          <FiPackage className="empty-state__icon" />
          <h2 className="empty-state__title">Unable to load products</h2>
          <p className="empty-state__desc">
            {error?.data?.message || 'Please check your connection and try again.'}
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state">
          <FiSearch className="empty-state__icon" />
          <h2 className="empty-state__title">No products found</h2>
          <p className="empty-state__desc">
            {searchTerm
              ? `No results for "${searchTerm}". Try a different search term.`
              : 'No products are available at the moment.'}
          </p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}

