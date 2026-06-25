/**
 * Next.js API Route — Product Details Proxy
 * GET /api/products/{productId}
 *
 * Server-side proxy to the catalogue microservice.
 * Used by the SSR product detail page to fetch product data
 * at request time without exposing the microservice URL to the client.
 */
import { apiHandler } from '@/utils/apiHandler';

const CATALOGUE_BASE_URL = process.env.CATALOGUE_BASE_URL || 'http://localhost:7002';

export const GET = apiHandler({
  url: (request) => {
    const id = request.url.match(/\/api\/products\/([^/?]+)/)?.[1];
    return `${CATALOGUE_BASE_URL}/api/catalogue/${id}`;
  },
  validate: (request) => {
    const id = request.url.match(/\/api\/products\/([^/?]+)/)?.[1];
    if (!id) return 'Product ID is required';
    return null;
  },
  routeLabel: '/api/products/[id]',
  errorMessage: 'Failed to fetch product details',
});
