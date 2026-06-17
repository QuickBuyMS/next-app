/**
 * Next.js API Route — Product Details Proxy
 * GET /api/product?id={productId}
 *
 * Server-side proxy to the catalogue microservice.
 * This route is used by the SSR product detail page to fetch product data
 * at request time without exposing the microservice URL to the client.
 */
import { NextResponse } from 'next/server';

const CATALOGUE_BASE_URL = 'http://localhost:7002';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('id');

  if (!productId) {
    return NextResponse.json(
      { error: 'Product ID is required', data: null },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${CATALOGUE_BASE_URL}/api/catalogue/${productId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // No caching — fetch fresh on each SSR request
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData?.message || 'Product not found', data: null },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /api/product] Fetch failed:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch product details', data: null },
      { status: 500 }
    );
  }
}
