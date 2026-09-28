/**
 * Next.js API Route — AI Product Comparison Proxy
 * GET /api/compare/{productId}
 *
 * Server-side proxy to the catalogue AI microservice.
 */
import { apiHandler } from '@/utils/apiHandler';

const CATALOGUE_BASE_URL = process.env.CATALOGUE_BASE_URL || 'http://localhost:7002';

export const GET = apiHandler({
  url: (request) => {
    const id = request.url.match(/\/api\/compare\/([^/?]+)/)?.[1];
    return `${CATALOGUE_BASE_URL}/api/ai/compare/${id}`;
  },
  validate: (request) => {
    const id = request.url.match(/\/api\/compare\/([^/?]+)/)?.[1];
    if (!id) return 'Product ID is required';
    return null;
  },
  routeLabel: '/api/compare/[id]',
  errorMessage: 'Failed to fetch AI product comparison',
});
