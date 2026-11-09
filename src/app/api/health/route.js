/**
 * Diagnostic Health & Proxy Route
 * GET /api/health
 *
 * Directly tests the connection from Vercel to Render and returns what Vercel sees.
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const catalogueUrl = process.env.CATALOGUE_BASE_URL || 'NOT_SET';
  const nestUrl = process.env.NEST_API_BASE_URL || 'NOT_SET';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'NOT_SET';
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'NOT_SET';

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      CATALOGUE_BASE_URL: catalogueUrl,
      NEST_API_BASE_URL: nestUrl,
      NEXT_PUBLIC_SITE_URL: siteUrl,
      VERCEL_URL: vercelUrl,
      NODE_ENV: process.env.NODE_ENV,
    },
    renderBackendCheck: {
      urlCalled: `${catalogueUrl}/api/catalogue/products`,
      status: null,
      ok: false,
      productCount: 0,
      sampleProduct: null,
      error: null,
    },
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${catalogueUrl}/api/catalogue/products`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });
    clearTimeout(timeout);

    diagnostics.renderBackendCheck.status = res.status;
    diagnostics.renderBackendCheck.ok = res.ok;

    if (res.ok) {
      const json = await res.json();
      const list = json.data || json || [];
      diagnostics.renderBackendCheck.productCount = Array.isArray(list) ? list.length : 0;
      diagnostics.renderBackendCheck.sampleProduct = Array.isArray(list) ? list[0] : null;
    } else {
      diagnostics.renderBackendCheck.error = await res.text().catch(() => 'Could not read error text');
    }
  } catch (err) {
    diagnostics.renderBackendCheck.error = err.message || String(err);
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
