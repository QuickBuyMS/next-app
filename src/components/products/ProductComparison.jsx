'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiRefreshCw, FiAlertCircle, FiCpu, FiCheck } from 'react-icons/fi';

export default function ProductComparison({ productId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchComparison() {
      try {
        const res = await fetch(`/api/compare/${productId}`);
        const json = await res.json();
        if (json.statusCode === 200) {
          setData(json.data);
        } else {
          setError(json.message || 'Failed to fetch comparison');
        }
      } catch (err) {
        setError('Error fetching AI comparison');
      } finally {
        setLoading(false);
      }
    }
    fetchComparison();
  }, [productId]);

  if (loading) {
    return (
      <div className="product-comparison loading" style={styles.loadingContainer}>
        <FiRefreshCw className="animate-spin" style={styles.spinIcon} />
        <span style={styles.loadingText}>AI Agent is analyzing similar products...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-comparison error" style={styles.errorContainer}>
        <FiAlertCircle size={24} color="var(--color-error)" />
        <span style={styles.errorText}>{error}</span>
      </div>
    );
  }

  if (!data || !data.comparisonTable || data.comparisonTable.includes('No similar products')) {
    return null;
  }

  // Combine products for header matching
  const allProducts = [data.targetProduct, ...(data.similarProducts || [])].filter(Boolean);
  
  function matchProduct(headerName, colIndex) {
    if (colIndex === 1 && data?.targetProduct) {
      return data.targetProduct;
    }

    const cleanHeader = (headerName || '')
      .toLowerCase()
      .replace(/[*_~`]/g, '')
      .replace(/\s*\([^)]*\)/g, '')
      .trim();

    const matched = allProducts.find((p) => {
      const pName = (p.name || '').toLowerCase();
      return cleanHeader.includes(pName) || pName.includes(cleanHeader);
    });

    if (matched) return matched;

    // Ordered fallback: column index i (starting at 2) maps to similarProducts[i - 2]
    if (colIndex > 1 && Array.isArray(data?.similarProducts) && data.similarProducts[colIndex - 2]) {
      return data.similarProducts[colIndex - 2];
    }

    return null;
  }

  // Parse markdown table returned by Gemini
  const rawText = data.comparisonTable;
  const lines = rawText.split('\n').filter(line => line.trim().startsWith('|'));
  
  let header = [];
  let rows = [];
  
  if (lines.length > 2) {
    header = lines[0].split('|').slice(1, -1).map(s => s.trim().replace(/\*\*/g, ''));
    rows = lines.slice(2).map(line => line.split('|').slice(1, -1).map(s => s.trim().replace(/\*\*/g, '')));
  }

  const recommendationMatch = rawText.match(/\*\*Recommendation:\*\*\s*(.*)/is) || rawText.match(/Recommendation:\s*(.*)/is);
  const recommendation = recommendationMatch ? recommendationMatch[1].replace(/\*\*/g, '').trim() : '';

  // Detect whether products are in the table columns (standard) or in rows
  const isRowOriented = (header[0] || '').toLowerCase().includes('product') && !header.slice(1).some((h, idx) => matchProduct(h, idx + 1));

  return (
    <div className="product-comparison-wrapper" style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.headerTitleWrap}>
          <FiCpu style={styles.aiIcon} />
          <h2 style={styles.title}>AI Smart Compare</h2>
        </div>
        <span style={styles.badge}>Powered by Gemini</span>
      </div>

      {lines.length > 0 ? (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                {header.map((h, i) => {
                  if (isRowOriented || i === 0) {
                    return <th key={i} style={styles.thFeature}>{h}</th>;
                  }

                  const productMatch = matchProduct(h, i);
                  const productImage = productMatch?.image_url || productMatch?.image;
                  const displayName = (h || '').replace(/[*_~`]/g, '').replace(/\s*\([^)]*\)/g, '').trim();
                  
                  return (
                    <th key={i} style={{...styles.thProduct, ...(i === 1 ? styles.thHighlight : {})}}>
                      <div style={styles.headerCellContent}>
                        {productMatch && productImage ? (
                          <div style={styles.imageWrap}>
                            <Image 
                              src={productImage} 
                              alt={productMatch.name || displayName || 'Product'} 
                              width={60} 
                              height={60} 
                              style={styles.productImage}
                            />
                          </div>
                        ) : (
                          <div style={styles.imagePlaceholder}>
                            <span>No Img</span>
                          </div>
                        )}
                        <span style={styles.productHeaderName}>{displayName || h}</span>
                        
                        {i === 1 && <span style={styles.targetBadge}>Current</span>}
                        
                        {productMatch && i !== 1 && (
                          <Link href={`/products/${productMatch.product_id}`} style={styles.viewLink}>
                            View Product
                          </Link>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const rowProduct = isRowOriented ? matchProduct(row[0] || '', i + 1) : null;
                const rowImage = rowProduct?.image_url || rowProduct?.image;
                const isTargetRow = rowProduct && String(rowProduct.product_id) === String(data?.targetProduct?.product_id);

                return (
                  <tr key={i} style={styles.tr}>
                    {row.map((cell, j) => {
                      if (isRowOriented && j === 0) {
                        return (
                          <td key={j} style={{...styles.td, ...(isTargetRow ? styles.tdHighlight : {})}}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {rowImage ? (
                                <div style={styles.imageWrap}>
                                  <Image src={rowImage} alt={rowProduct?.name || cell} width={50} height={50} style={styles.productImage} />
                                </div>
                              ) : (
                                <div style={styles.imagePlaceholder}><span>No Img</span></div>
                              )}
                              <div>
                                <span style={{ fontWeight: '600', display: 'block' }}>{cell}</span>
                                {rowProduct && (
                                  <Link href={`/products/${rowProduct.product_id}`} style={{ fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                                    View
                                  </Link>
                                )}
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={j} style={{...styles.td, ...(!isRowOriented && j === 1 ? styles.tdHighlight : {})}}>
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <pre style={styles.rawOutput}>{rawText}</pre>
      )}

      {recommendation && (
        <div style={styles.recommendationBox}>
          <div style={styles.recIconWrap}>
            <FiCheck size={18} color="#fff" />
          </div>
          <div style={styles.recContent}>
            <h4 style={styles.recTitle}>AI Recommendation</h4>
            <p style={styles.recText}>{recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    marginTop: '3rem',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'hidden',
    animation: 'fadeIn 0.5s ease-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    background: 'linear-gradient(135deg, rgba(78,67,228,0.05) 0%, rgba(163,95,241,0.05) 100%)',
    borderBottom: '1px solid var(--color-border-light)',
  },
  headerTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  aiIcon: {
    color: 'var(--color-accent)',
    fontSize: '1.5rem',
  },
  title: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--color-text)',
    margin: 0,
  },
  badge: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--color-accent)',
    background: 'rgba(78,67,228,0.1)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '3rem',
    background: 'var(--color-surface)',
    borderRadius: 'var(--radius-xl)',
    border: '1px dashed var(--color-border)',
    marginTop: '3rem',
    color: 'var(--color-accent)',
  },
  spinIcon: {
    fontSize: '1.5rem',
  },
  loadingText: {
    fontWeight: '500',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.5rem',
    background: 'var(--color-error-bg)',
    borderRadius: 'var(--radius-lg)',
    marginTop: '3rem',
  },
  errorText: {
    color: 'var(--color-error)',
    fontWeight: '500',
  },
  tableContainer: {
    overflowX: 'auto',
    padding: '1.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    minWidth: '800px',
  },
  thFeature: {
    padding: '1rem',
    borderBottom: '2px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontWeight: '600',
    fontSize: '0.9375rem',
    verticalAlign: 'bottom',
    minWidth: '150px',
  },
  thProduct: {
    padding: '1rem',
    borderBottom: '2px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontWeight: '600',
    fontSize: '0.875rem',
    minWidth: '180px',
    textAlign: 'center',
  },
  thHighlight: {
    background: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    borderRadius: '8px 8px 0 0',
    position: 'relative',
  },
  headerCellContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  imageWrap: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    background: '#fff',
    border: '1px solid var(--color-border-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: {
    objectFit: 'contain',
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    background: 'var(--color-bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    color: 'var(--color-text-muted)',
  },
  productHeaderName: {
    lineHeight: '1.2',
  },
  targetBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: 'var(--color-primary)',
    color: '#fff',
    fontSize: '0.65rem',
    padding: '2px 8px',
    borderRadius: '12px',
    fontWeight: 'bold',
    boxShadow: 'var(--shadow-sm)',
  },
  viewLink: {
    fontSize: '0.75rem',
    color: '#fff',
    background: 'var(--color-text)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    textDecoration: 'none',
    marginTop: '4px',
    transition: 'background 0.2s',
  },
  tr: {
    borderBottom: '1px solid var(--color-border-light)',
    transition: 'background 0.2s',
  },
  td: {
    padding: '1rem',
    fontSize: '0.9375rem',
    color: 'var(--color-text)',
    verticalAlign: 'top',
  },
  tdHighlight: {
    background: 'rgba(249, 123, 32, 0.03)',
    fontWeight: '500',
  },
  rawOutput: {
    padding: '1.5rem',
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.6',
  },
  recommendationBox: {
    display: 'flex',
    gap: '1rem',
    margin: '0 1.5rem 1.5rem',
    padding: '1.25rem',
    background: 'linear-gradient(135deg, rgba(83,177,117,0.1) 0%, rgba(83,177,117,0.05) 100%)',
    border: '1px solid rgba(83,177,117,0.2)',
    borderRadius: 'var(--radius-lg)',
  },
  recIconWrap: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'var(--color-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  recContent: {
    flex: 1,
  },
  recTitle: {
    margin: '0 0 0.25rem 0',
    fontSize: '0.9375rem',
    fontWeight: '700',
    color: 'var(--color-secondary)',
  },
  recText: {
    margin: 0,
    fontSize: '0.9375rem',
    color: 'var(--color-text)',
    lineHeight: '1.5',
  },
};

// Keyframes needed for spin
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .animate-spin { animation: spin 1s linear infinite; }
  `;
  document.head.appendChild(style);
}
