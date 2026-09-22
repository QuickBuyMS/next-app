import { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export function useProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // INP: useTransition keeps the UI responsive while router.replace() runs
  const [isNavigating, startTransition] = useTransition();

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

  // Update URL query params — wrapped in startTransition for INP
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

      // INP: Wrap navigation in startTransition so UI stays interactive
      startTransition(() => {
        router.replace(`/products${qs ? `?${qs}` : ''}`, { scroll: false });
      });
    },
    [searchParams, router]
  );

  const handlePageChange = useCallback((newPage) => {
    updateMultipleParams({ page: newPage });
  }, [updateMultipleParams]);

  const handlePageSizeChange = useCallback((newSize) => {
    // When changing page size, we must reset back to page 1
    updateMultipleParams({ limit: newSize, page: 1 });
  }, [updateMultipleParams]);

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
  const handleClearAll = useCallback(() => {
    setLocalSearch('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    startTransition(() => {
      router.replace('/products', { scroll: false });
    });
  }, [router]);

  return {
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
  };
}
