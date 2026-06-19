/**
 * Next.js API Route — Products List Proxy
 * GET /api/products
 *
 * Server-side proxy to the catalogue microservice.
 * Used by the ISR products page to fetch the full product list
 * without exposing the microservice URL to the client.
 */
import { apiHandler } from '@/utils/apiHandler';

const CATALOGUE_BASE_URL = 'http://localhost:7002';

export const GET = apiHandler({
  url: `${CATALOGUE_BASE_URL}/api/catalogue/products`,
  routeLabel: '/api/products',
  errorMessage: 'Failed to fetch products',
});
