'use client';

/**
 * ProductsPageClient — client wrapper for the products page
 *
 * Manages the "AI override" state: when the user runs an AI search,
 * the AI's product results replace the SSR product grid using the
 * SAME <ProductListingClient> / <ProductCard> layout as normal browsing.
 *
 * Flow:
 *  1. Page loads with SSR products (normal mode)
 *  2. User types in AI search bar → IntentMatchmaker calls onProductsFound(products)
 *  3. This component overrides initialProducts with the AI results
 *  4. ProductListingClient renders them in the existing products-grid
 *  5. User clicks "Clear" → products revert to SSR list
 */

import { useState, useCallback } from 'react';
import IntentMatchmaker from '@/components/products/IntentMatchmaker';
import ProductListingClient from '@/components/products/ProductListingClient';

export default function ProductsPageClient({
  initialProducts = [],
  categories = [],
  subcategories = [],
  fetchedAt,
  isSSRFiltered = false,
  currentPage = 1,
  pageSize = 5,
  hasMore = false,
}) {
  const [aiProducts, setAiProducts] = useState(null); // null = show SSR list

  // Called by IntentMatchmaker when AI returns products
  const handleProductsFound = useCallback((products) => {
    // Normalize to match ProductCard's expected shape
    const normalized = products.map(p => ({
      product_id:       String(p.product_id || p.id),
      name:             p.name || 'Unnamed Product',
      price:            Number(p.price || 0),
      image_url:        p.image_url || p.image || '',
      image:            p.image_url || p.image || '',
      category:         p.category_name || p.category || '',
      category_name:    p.category_name || p.category || '',
      subcategory_name: p.subcategory_name || p.subcategory || '',
      description:      p.description || '',
      discountPrice:    p.discountPrice || null,
    }));
    setAiProducts(normalized);
  }, []);

  // Called when user clears the AI search → back to SSR products
  const handleReset = useCallback(() => {
    setAiProducts(null);
  }, []);

  const isAiMode        = aiProducts !== null;
  const displayProducts = isAiMode ? aiProducts : initialProducts;

  return (
    <>
      <IntentMatchmaker
        onProductsFound={handleProductsFound}
        onReset={handleReset}
      />

      {/* AI mode banner */}
      {isAiMode && (
        <div className="ai-results-banner" role="status" aria-live="polite">
          <span className="ai-results-banner__text">
            ✨ Showing {aiProducts.length} AI-matched product{aiProducts.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <ProductListingClient
        initialProducts={displayProducts}
        categories={isAiMode ? [] : categories}
        subcategories={isAiMode ? [] : subcategories}
        fetchedAt={isAiMode ? null : fetchedAt}
        isSSRFiltered={isSSRFiltered}
        currentPage={isAiMode ? 1 : currentPage}
        pageSize={isAiMode ? displayProducts.length : pageSize}
        hasMore={isAiMode ? false : hasMore}
      />
    </>
  );
}
