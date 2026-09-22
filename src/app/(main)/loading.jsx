/**
 * Loading skeleton for the (main) route group
 *
 * Performance: This enables React Streaming — the layout shell (sidebar, topbar)
 * renders immediately while the page component loads. Users see instant feedback
 * instead of a blank area during route transitions.
 */
export default function MainLoading() {
  return (
    <div className="main-loading-skeleton" aria-busy="true" aria-label="Loading content">
      {/* Title skeleton */}
      <div className="skeleton" style={{ height: '32px', width: '200px', marginBottom: '24px' }} />
      {/* Content card skeleton */}
      <div className="skeleton" style={{ height: '180px', marginBottom: '16px', borderRadius: '16px' }} />
      {/* Secondary content skeleton */}
      <div className="skeleton" style={{ height: '120px', marginBottom: '16px', borderRadius: '16px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
      </div>
    </div>
  );
}
