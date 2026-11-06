/**
 * Next.js API Route — AI Review Summary Sub-Route
 * GET /api/reviews/[productId]/summary
 *
 * Dedicated route for the AI summary endpoint.
 * This is separate from /api/reviews/[productId] (which returns raw reviews)
 * so Next.js can route them correctly as nested dynamic paths.
 */
import { apiHandler } from '@/utils/apiHandler';

const CATALOGUE_BASE_URL = process.env.CATALOGUE_BASE_URL || 'http://localhost:7002';

function extractProductId(request) {
  return request.url.match(/\/api\/reviews\/([^/?]+)\/summary/)?.[1];
}

export const GET = apiHandler({
  url: (request) => {
    const productId = extractProductId(request);
    return `${CATALOGUE_BASE_URL}/api/ai/reviews/${productId}/summary`;
  },
  validate: (request) => {
    const productId = extractProductId(request);
    if (!productId) return 'Product ID is required';
    return null;
  },
  routeLabel: '/api/reviews/[productId]/summary',
  errorMessage: 'Failed to fetch AI review summary',
});
