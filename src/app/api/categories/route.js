/**
 * Next.js API Route — Categories Proxy
 * GET /api/categories
 *
 * Server-side proxy to the catalogue microservice.
 * Used by the ISR products page to fetch all product categories
 * without exposing the microservice URL to the client.
 */
import { apiHandler } from '@/utils/apiHandler';

const CATALOGUE_BASE_URL = 'http://localhost:7002';

export const GET = apiHandler({
  url: `${CATALOGUE_BASE_URL}/api/catalogue/categories`,
  routeLabel: '/api/categories',
  errorMessage: 'Failed to fetch categories',
});
