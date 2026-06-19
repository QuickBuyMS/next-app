'use client';

/**
 * Reusable Pagination Component
 * Features:
 * - Previous / Next buttons with icons
 * - Current page indicator
 * - Page size dropdown (5, 10, 25, 100)
 */
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({
  currentPage,
  hasMore,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  return (
    <div
      className="pagination"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        marginTop: '3rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Items per page:
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          style={{
            padding: '0.3rem 0.5rem',
            borderRadius: 'var(--border-radius)',
            border: '1px solid var(--border)',
            background: 'var(--white)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={100}>100</option>
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.6rem',
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--border-radius)',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.5 : 1,
            color: 'var(--text-main)',
            transition: 'all 0.2s',
          }}
          aria-label="Previous Page"
        >
          <FiChevronLeft size={20} />
        </button>

        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            fontWeight: '600',
            color: 'var(--text-main)',
            minWidth: '70px',
            justifyContent: 'center',
          }}
        >
          Page {currentPage}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasMore}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.6rem',
            background: 'var(--white)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--border-radius)',
            cursor: !hasMore ? 'not-allowed' : 'pointer',
            opacity: !hasMore ? 0.5 : 1,
            color: 'var(--text-main)',
            transition: 'all 0.2s',
          }}
          aria-label="Next Page"
        >
          <FiChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
