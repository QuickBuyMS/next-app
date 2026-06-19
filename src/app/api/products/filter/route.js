/**
 * Next.js API Route — Products Filter Proxy
 * POST /api/products/filter
 *
 * Proxy to the catalogue microservice filter endpoint.
 * Accepts filter payload in body: { categoryId, minPrice, maxPrice, search }
 */
import { apiHandler } from '@/utils/apiHandler';

const CATALOGUE_BASE_URL = 'http://localhost:7002';

export const POST = apiHandler({
  url: `${CATALOGUE_BASE_URL}/api/catalogue/products/filter`,
  routeLabel: '/api/products/filter',
  errorMessage: 'Failed to filter products',
  method: "POST"
});
