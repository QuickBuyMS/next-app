/**
 * fetchData — universal try-catch wrapper for data fetching (SSR + CSR)
 *
 * Works in both server components (ISR/SSR) and client components (CSR).
 * Eliminates repetitive try/catch + res.ok checks everywhere.
 * Returns a consistent { data, error, status } object.
 *
 * ─── SSR / ISR usage (server components) ───
 *
 *   import { fetchData } from '@/utils/fetchData';
 *
 *   // Basic GET with ISR revalidation
 *   const { data: products } = await fetchData({
 *     url: 'http://localhost:3000/api/products',
 *     label: 'Products',
 *     revalidate: 180,
 *     fallback: [],
 *   });
 *
 * ─── CSR usage (client components) ───
 *
 *   // GET with query params
 *   const { data, error } = await fetchData({
 *     url: '/api/products',
 *     params: { category: 'electronics', page: 1 },
 *     label: 'Products',
 *   });
 *
 *   // POST with JSON body
 *   const { data, error } = await fetchData({
 *     url: '/api/order/place-order',
 *     method: 'POST',
 *     body: { userId: 1, items: [...] },
 *     label: 'PlaceOrder',
 *   });
 *
 *   // With auth headers
 *   const { data, error } = await fetchData({
 *     url: '/api/auth/profile',
 *     headers: { Authorization: `Bearer ${token}` },
 *     label: 'Profile',
 *   });
 */

/**
 * @param {Object} config
 * @param {string} config.url — the URL to fetch
 * @param {string} [config.method='GET'] — HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param {Object} [config.body] — request body (auto-serialized to JSON)
 * @param {Object} [config.params] — URL query params (appended to URL)
 * @param {Object} [config.headers] — additional request headers
 * @param {string} [config.label='fetch'] — label for console logs
 * @param {number|false} [config.revalidate] — ISR revalidation in seconds (SSR only), false for no-store
 * @param {*} [config.fallback=null] — fallback value returned on error
 * @param {string|null} [config.dataKey='data'] — key to extract from JSON response, null for raw JSON
 * @param {boolean} [config.credentials=false] — send cookies (withCredentials)
 *
 * @returns {Promise<{ data: *, error: string|null, status: number|null }>}
 */
export async function fetchData({
  url,
  method = 'GET',
  body,
  params,
  headers = {},
  label = 'fetch',
  revalidate,
  fallback = null,
  dataKey = 'data',
  credentials = false,
}) {
  try {
    // --- Build URL with query params ---
    let finalUrl = url;
    if (params && typeof params === 'object') {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        finalUrl += (url.includes('?') ? '&' : '?') + qs;
      }
    }

    // console.log('finalUrl', finalUrl)

    // --- Build fetch options ---
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // Body for non-GET requests
    if (body && method.toUpperCase() !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }

    // Credentials (send cookies)
    if (credentials) {
      fetchOptions.credentials = 'include';
    }

    // ISR / caching (SSR only — ignored in browser)
    if (revalidate !== undefined && revalidate !== false) {
      fetchOptions.next = { revalidate };
    } else if (revalidate === false) {
      fetchOptions.cache = 'no-store';
    }

    // --- Fetch ---
    const res = await fetch(finalUrl, fetchOptions);

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const errorMsg =
        errData?.error || errData?.message || `Failed to fetch ${label}`;
      console.error(`[${label}] Fetch failed (${res.status}):`, errorMsg);
      return { data: fallback, error: errorMsg, status: res.status };
    }

    const json = await res.json();
    const data = dataKey ? (json?.[dataKey] ?? fallback) : json;
    return { data, error: null, status: res.status };
  } catch (error) {
    console.error(`[${label}] Fetch error:`, error.message);
    return { data: fallback, error: error.message, status: null };
  }
}
