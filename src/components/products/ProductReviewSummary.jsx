'use client';
import { useState, useEffect } from 'react';
import { FiStar, FiThumbsUp, FiThumbsDown, FiCpu, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

/**
 * ProductReviewSummary — Phase 6 Frontend Component
 *
 * Renders the AI-generated structured review summary returned by:
 *   GET /ai/reviews/:productId/summary
 *
 * Shape of `data` (from ReviewSummarySchema):
 *   {
 *     sentimentScore:  number (0-10)
 *     averageRating:   number (1-5, 1 decimal)
 *     pros:            string[]
 *     cons:            string[]
 *     verdict:         string
 *     totalReviewed:   number
 *     ratingBreakdown: { five, four, three, two, one }
 *   }
 */
export default function ProductReviewSummary({ productId }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/reviews/${productId}/summary`)
      .then(r => r.json())
      .then(json => {
        if (json.statusCode === 200 && json.data) {
          setData(json.data);
        } else if (json.data && !json.error) {
          setData(json.data);
        } else {
          setError(json.error || json.message || 'Could not load AI summary');
        }
      })
      .catch((err) => setError(err.message || 'Failed to fetch AI review summary'))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div style={styles.loadingBox}>
        <FiRefreshCw style={{ fontSize: '1.25rem', animation: 'spin 1s linear infinite' }} />
        <span style={styles.loadingText}>AI is reading the reviews…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    const isNoReviews = error.toLowerCase().includes('no reviews found');
    return (
      <div style={isNoReviews ? styles.emptyBox : styles.errorBox}>
        {isNoReviews ? (
          <span style={styles.emptyText}>💬 No reviews yet for this product. Be the first to leave one!</span>
        ) : (
          <>
            <FiAlertCircle size={20} color="var(--color-error, #ef4444)" />
            <span style={styles.errorText}>{error}</span>
          </>
        )}
      </div>
    );
  }

  if (!data) return null;

  const {
    sentimentScore,
    averageRating,
    pros = [],
    cons = [],
    verdict,
    totalReviewed,
    ratingBreakdown = {},
  } = data;

  // Color the sentiment score (0-10) like a traffic light
  const sentimentColor =
    sentimentScore >= 7 ? '#22c55e' :
    sentimentScore >= 4 ? '#f59e0b' : '#ef4444';

  // Total for rating bar widths
  const totalRatings =
    (ratingBreakdown.five  ?? 0) +
    (ratingBreakdown.four  ?? 0) +
    (ratingBreakdown.three ?? 0) +
    (ratingBreakdown.two   ?? 0) +
    (ratingBreakdown.one   ?? 0);

  const ratingRows = [
    { label: '5 ★', count: ratingBreakdown.five  ?? 0, color: '#22c55e' },
    { label: '4 ★', count: ratingBreakdown.four  ?? 0, color: '#84cc16' },
    { label: '3 ★', count: ratingBreakdown.three ?? 0, color: '#f59e0b' },
    { label: '2 ★', count: ratingBreakdown.two   ?? 0, color: '#f97316' },
    { label: '1 ★', count: ratingBreakdown.one   ?? 0, color: '#ef4444' },
  ];

  return (
    <section style={styles.wrapper} aria-label="AI Review Summary">

      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <FiCpu style={{ color: 'var(--color-accent, #6366f1)', fontSize: '1.4rem' }} />
          <h3 style={styles.title}>AI Review Summary</h3>
        </div>
        <span style={styles.badge}>Powered by Gemini</span>
      </div>

      {/* ── Score + Rating + Breakdown ── */}
      <div style={styles.statsRow}>

        {/* Sentiment gauge */}
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Sentiment</span>
          <div style={{ ...styles.sentimentScore, color: sentimentColor }}>
            {sentimentScore.toFixed(1)}
            <span style={styles.sentimentMax}>/10</span>
          </div>
          <div style={styles.sentimentBar}>
            <div
              style={{
                ...styles.sentimentFill,
                width: `${(sentimentScore / 10) * 100}%`,
                background: sentimentColor,
              }}
            />
          </div>
        </div>

        {/* Average star rating */}
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Avg Rating</span>
          <div style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(n => (
              <FiStar
                key={n}
                style={{
                  color: n <= Math.round(averageRating) ? '#f59e0b' : '#d1d5db',
                  fontSize: '1.1rem',
                }}
              />
            ))}
          </div>
          <span style={styles.ratingText}>{averageRating} / 5 ({totalReviewed} reviews)</span>
        </div>

        {/* Rating breakdown bars */}
        <div style={{ ...styles.statCard, flex: 2 }}>
          <span style={styles.statLabel}>Rating Breakdown</span>
          <div style={styles.breakdownList}>
            {ratingRows.map(({ label, count, color }) => {
              const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              return (
                <div key={label} style={styles.breakdownRow}>
                  <span style={styles.breakdownLabel}>{label}</span>
                  <div style={styles.breakdownBarBg}>
                    <div
                      style={{
                        ...styles.breakdownBarFill,
                        width: `${pct}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <span style={styles.breakdownCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Pros & Cons ── */}
      <div style={styles.prosConsRow}>
        <div style={styles.prosBox}>
          <div style={styles.prosConsHeader}>
            <FiThumbsUp color="#22c55e" />
            <span style={{ ...styles.prosConsTitle, color: '#22c55e' }}>What customers love</span>
          </div>
          <ul style={styles.list}>
            {pros.map((pro, i) => (
              <li key={i} style={styles.listItem}>
                <span style={{ ...styles.dot, background: '#22c55e' }} />
                {pro}
              </li>
            ))}
          </ul>
        </div>

        {cons.length > 0 && (
          <div style={styles.consBox}>
            <div style={styles.prosConsHeader}>
              <FiThumbsDown color="#ef4444" />
              <span style={{ ...styles.prosConsTitle, color: '#ef4444' }}>Common complaints</span>
            </div>
            <ul style={styles.list}>
              {cons.map((con, i) => (
                <li key={i} style={styles.listItem}>
                  <span style={{ ...styles.dot, background: '#ef4444' }} />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── AI Verdict ── */}
      {verdict && (
        <div style={styles.verdictBox}>
          <span style={styles.verdictLabel}>🏆 AI Verdict</span>
          <p style={styles.verdictText}>{verdict}</p>
        </div>
      )}
    </section>
  );
}

const styles = {
  wrapper: {
    marginTop: '2.5rem',
    background: 'var(--color-surface, #1e1e2e)',
    borderRadius: 'var(--radius-xl, 16px)',
    border: '1px solid var(--color-border, rgba(255,255,255,0.08))',
    boxShadow: 'var(--shadow-md, 0 4px 24px rgba(0,0,0,0.2))',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(168,85,247,0.06) 100%)',
    borderBottom: '1px solid var(--color-border, rgba(255,255,255,0.08))',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
  },
  title: {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: '700',
    color: 'var(--color-text, #f1f5f9)',
    fontFamily: 'var(--font-heading, inherit)',
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--color-accent, #6366f1)',
    background: 'rgba(99,102,241,0.12)',
    padding: '4px 12px',
    borderRadius: '999px',
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '2rem 1.5rem',
    marginTop: '2.5rem',
    background: 'var(--color-surface, #1e1e2e)',
    borderRadius: 'var(--radius-xl, 16px)',
    border: '1px dashed var(--color-border, rgba(255,255,255,0.08))',
    color: 'var(--color-accent, #6366f1)',
    fontWeight: '500',
  },
  loadingText: {
    fontSize: '0.9375rem',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.25rem 1.5rem',
    marginTop: '2.5rem',
    borderRadius: 'var(--radius-lg, 12px)',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
  },
  errorText: {
    color: 'var(--color-error, #ef4444)',
    fontSize: '0.9375rem',
  },
  emptyBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    marginTop: '2.5rem',
    borderRadius: 'var(--radius-lg, 12px)',
    background: 'rgba(255,255,255,0.03)',
    border: '1px dashed var(--color-border, rgba(255,255,255,0.1))',
  },
  emptyText: {
    color: 'var(--color-text-secondary, #94a3b8)',
    fontSize: '0.9375rem',
  },
  statsRow: {
    display: 'flex',
    gap: '1px',
    padding: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  statCard: {
    flex: 1,
    minWidth: '140px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid var(--color-border-light, rgba(255,255,255,0.05))',
  },
  statLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-text-muted, #6b7280)',
  },
  sentimentScore: {
    fontSize: '2rem',
    fontWeight: '800',
    lineHeight: 1,
    letterSpacing: '-0.02em',
  },
  sentimentMax: {
    fontSize: '1rem',
    fontWeight: '400',
    opacity: 0.5,
    marginLeft: '2px',
  },
  sentimentBar: {
    height: '4px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  sentimentFill: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.6s ease',
  },
  starRow: {
    display: 'flex',
    gap: '3px',
  },
  ratingText: {
    fontSize: '0.8125rem',
    color: 'var(--color-text-secondary, #94a3b8)',
  },
  breakdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  breakdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  breakdownLabel: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary, #94a3b8)',
    width: '28px',
    flexShrink: 0,
  },
  breakdownBarBg: {
    flex: 1,
    height: '6px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: '99px',
    transition: 'width 0.5s ease',
    minWidth: '2px',
  },
  breakdownCount: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted, #6b7280)',
    width: '20px',
    textAlign: 'right',
    flexShrink: 0,
  },
  prosConsRow: {
    display: 'flex',
    gap: '1rem',
    padding: '0 1.5rem 1.5rem',
    flexWrap: 'wrap',
  },
  prosBox: {
    flex: 1,
    minWidth: '200px',
    padding: '1rem',
    background: 'rgba(34,197,94,0.05)',
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid rgba(34,197,94,0.15)',
  },
  consBox: {
    flex: 1,
    minWidth: '200px',
    padding: '1rem',
    background: 'rgba(239,68,68,0.05)',
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid rgba(239,68,68,0.15)',
  },
  prosConsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  prosConsTitle: {
    fontSize: '0.875rem',
    fontWeight: '700',
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.875rem',
    color: 'var(--color-text, #f1f5f9)',
    lineHeight: '1.4',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '5px',
  },
  verdictBox: {
    margin: '0 1.5rem 1.5rem',
    padding: '1rem 1.25rem',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(168,85,247,0.1) 100%)',
    borderRadius: 'var(--radius-lg, 12px)',
    border: '1px solid rgba(99,102,241,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  verdictLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--color-accent, #6366f1)',
  },
  verdictText: {
    margin: 0,
    fontSize: '0.9375rem',
    color: 'var(--color-text, #f1f5f9)',
    fontWeight: '500',
    lineHeight: '1.5',
    fontStyle: 'italic',
  },
};
