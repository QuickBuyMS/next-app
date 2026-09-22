/**
 * Loading skeleton for the products route
 *
 * Performance: Shows a hero + grid skeleton immediately while the server
 * fetches product data (ISR/SSR). This eliminates perceived load time
 * and prevents CLS when the real content arrives.
 */
export default function ProductsLoading() {
  return (
    <div className="products-loading-skeleton" aria-busy="true" aria-label="Loading products">
      {/* Hero skeleton */}
      <div
        className="skeleton"
        style={{
          height: '260px',
          borderRadius: '20px',
          marginBottom: '24px',
        }}
      />

      {/* Search bar skeleton */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="skeleton" style={{ height: '48px', flex: 1, minWidth: '250px', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '48px', width: '200px', borderRadius: '12px' }} />
      </div>

      {/* Product grid skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '24px',
        }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="skeleton" style={{ aspectRatio: '1', width: '100%' }} />
            <div style={{ padding: '16px' }}>
              <div className="skeleton" style={{ height: '12px', width: '60px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '18px', width: '80%', marginBottom: '8px' }} />
              <div className="skeleton" style={{ height: '20px', width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
