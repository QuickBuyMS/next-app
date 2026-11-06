/**
 * Next.js API Route — AI Review Summary Proxy
 *
 * GET  /api/reviews/[productId]/summary  → AI-generated structured summary
 * POST /api/reviews/[productId]          → Submit a new review
 *
 * Phase 6: This proxies to the NestJS /ai/reviews/* endpoints.
 */
import { apiHandler } from '@/utils/apiHandler';

const CATALOGUE_BASE_URL = process.env.CATALOGUE_BASE_URL || 'http://localhost:7002';

// ─── Helper to extract productId from URL ────────────────────────────────────
function extractProductId(request) {
  return request.url.match(/\/api\/reviews\/([^/?]+)/)?.[1];
}

// ─── GET /api/reviews/[productId]/summary ────────────────────────────────────
//
// LEARNING: This hits GET /ai/reviews/:productId/summary on the NestJS side,
// which runs the full generateObject pipeline:
//   1. Redis cache check
//   2. Fetch reviews from MySQL
//   3. Gemini generateObject → validated ReviewSummary
//   4. Cache in Redis (1h TTL)
//   5. Return typed JSON
export const GET = apiHandler({
  url: (request) => {
    const productId = extractProductId(request);
    // Check if this is the /summary sub-route
    const isSummary = request.url.includes('/summary');
    if (isSummary) {
      return `${CATALOGUE_BASE_URL}/api/ai/reviews/${productId}/summary`;
    }
    return `${CATALOGUE_BASE_URL}/api/ai/reviews/${productId}`;
  },
  validate: (request) => {
    const productId = extractProductId(request);
    if (!productId) return 'Product ID is required';
    return null;
  },
  routeLabel: '/api/reviews/[productId]',
  errorMessage: 'Failed to fetch AI review summary',
});

// ─── POST /api/reviews/[productId] ───────────────────────────────────────────
//
// LEARNING: After submitting a review, the NestJS service:
//   1. Inserts the review into MySQL
//   2. Invalidates the Redis cache for this product
//   → The next GET /summary will regenerate a fresh AI summary
export const POST = apiHandler({
  method: 'POST',
  url: (request) => {
    const productId = extractProductId(request);
    return `${CATALOGUE_BASE_URL}/api/ai/reviews/${productId}`;
  },
  validate: (request) => {
    const productId = extractProductId(request);
    if (!productId) return 'Product ID is required';
    return null;
  },
  routeLabel: '/api/reviews/[productId] (POST)',
  errorMessage: 'Failed to submit review',
});
