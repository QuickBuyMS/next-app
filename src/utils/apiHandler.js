/**
 * apiHandler — reusable try-catch wrapper for Next.js API routes
 *
 * Eliminates repetitive try/catch + NextResponse boilerplate.
 * Handles upstream fetch, error parsing, and consistent JSON responses.
 *
 * Usage:
 *   import { apiHandler } from '@/utils/apiHandler';
 *
 *   export const GET = apiHandler({
 *     url: 'http://localhost:7002/api/catalogue/products',
 *     routeLabel: '/api/products',
 *     errorMessage: 'Failed to fetch products',
 *   });
 *
 * For handlers needing request data (query params, body, etc.):
 *   export const GET = apiHandler({
 *     url: (request) => {
 *       const { searchParams } = new URL(request.url);
 *       const id = searchParams.get('id');
 *       return `http://localhost:7002/api/catalogue/${id}`;
 *     },
 *     validate: (request) => {
 *       const { searchParams } = new URL(request.url);
 *       if (!searchParams.get('id')) return 'Product ID is required';
 *       return null; // no error
 *     },
 *     routeLabel: '/api/product',
 *     errorMessage: 'Failed to fetch product details',
 *   });
 */
import { NextResponse } from 'next/server';

/**
 * @param {Object} config
 * @param {string | ((request: Request) => string)} config.url
 *   — upstream URL. Can be a static string or a function that receives the request.
 * @param {string} [config.method='GET']
 *   — HTTP method for the upstream request.
 * @param {((request: Request) => object|null)} [config.body]
 *   — function that returns the JSON body for POST/PUT/PATCH requests.
 * @param {((request: Request) => string|null)} [config.validate]
 *   — optional validation function. Return an error string to reject, or null to proceed.
 * @param {string} [config.routeLabel]
 *   — label for console logs (e.g. '/api/products').
 * @param {string} [config.errorMessage='Request failed']
 *   — fallback error message for catch block.
 * @param {Object} [config.headers]
 *   — additional headers to send upstream.
 *
 * @returns {(request: Request) => Promise<NextResponse>} — Next.js route handler
 */
export function apiHandler({
  url,
  method = 'GET',
  body,
  validate,
  routeLabel = '/api',
  errorMessage = 'Request failed',
  headers = {},
}) {
  return async function handler(request) {
    try {
      // --- Validation (optional) ---
      if (validate) {
        const validationError = validate(request);
        if (validationError) {
          return NextResponse.json(
            { error: validationError, data: null },
            { status: 400 }
          );
        }
      }

      // --- Resolve URL ---
      const resolvedUrl = typeof url === 'function' ? url(request) : url;

      // --- Build fetch options ---
      const fetchOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        if (body) {
          // If a custom body mapping function is provided
          fetchOptions.body = JSON.stringify(body(request));
        } else {
          // Automatically parse and pass through the incoming request body
          try {
            const reqBody = await request.json();
            console.log(`[apiHandler] Extracted reqBody:`, reqBody);
            fetchOptions.body = JSON.stringify(reqBody);
          } catch (e) {
            console.error(`[apiHandler] Error reading request body:`, e.message);
          }
        }
      }

      // --- Upstream fetch ---
      const response = await fetch(resolvedUrl, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData?.message || errorMessage, data: null },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error(`[API ${routeLabel}] Fetch failed:`, error.message);
      return NextResponse.json(
        { error: errorMessage, data: null },
        { status: 500 }
      );
    }
  };
}
