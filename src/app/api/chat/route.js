/**
 * ════════════════════════════════════════════════════════════════════════════
 *  Agentic AI Chat Route — AI SDK v7 + Robust RAG Fallback
 *  File: src/app/api/chat/route.js
 * ════════════════════════════════════════════════════════════════════════════
 */

import { streamText, tool, convertToModelMessages, generateText, isStepCount } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const NEST_API = process.env.NEST_API_BASE_URL || 'http://localhost:7002';
const API_KEY  = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const google    = createGoogleGenerativeAI({ apiKey: API_KEY });
const LLM_MODEL = google('gemini-3.8-flash');

export const maxDuration = 60;

// ─── Product Normalization ──────────────────────────────────────────────────

function formatProducts(products = []) {
  return products.map((p) => ({
    id:               String(p.product_id || p.id),
    product_id:       String(p.product_id || p.id),
    name:             p.name || 'Unnamed Product',
    price:            Number(p.price || 0),
    formatted_price:  `₹${Number(p.price || 0).toLocaleString('en-IN')}`,
    description:      p.description || `${p.name || ''} (${p.category_name || ''} - ${p.subcategory_name || ''})`,
    category:         p.category_name || p.category || '',
    category_name:    p.category_name || p.category || '',
    subcategory:      p.subcategory_name || p.subcategory || '',
    subcategory_name: p.subcategory_name || p.subcategory || '',
    image:            p.image_url || p.image || '',
    image_url:        p.image_url || p.image || '',
  }));
}

// ─── User Memory ────────────────────────────────────────────────────────────

async function loadUserMemory(userId = 'anonymous') {
  try {
    const res = await fetch(`${NEST_API}/api/ai/memory/${userId}`,
      { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return { memoryContext: '' };
    const json = await res.json();
    return { prefs: json.data, memoryContext: json.memoryContext ?? '' };
  } catch {
    return { memoryContext: '' };
  }
}

// ─── Extract text from AI SDK v7 UI Message ─────────────────────────────────

function extractQueryText(uiMessages = []) {
  const lastMsg = uiMessages[uiMessages.length - 1];
  if (!lastMsg) return '';
  if (Array.isArray(lastMsg.parts)) {
    const t = lastMsg.parts.filter(p => p.type === 'text').map(p => p.text).join(' ').trim();
    if (t) return t;
  }
  if (typeof lastMsg.content === 'string') return lastMsg.content.trim();
  if (typeof lastMsg.text    === 'string') return lastMsg.text.trim();
  return '';
}

// ─── Check if an error is a quota/rate-limit error ─────────────────────────

function isQuotaError(err) {
  if (!err) return false;
  const msg = err?.message || String(err);
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('rate limit') ||
    msg.includes('exceeded') ||
    err?.statusCode === 429 ||
    err?.lastError?.statusCode === 429 ||
    err?.reason === 'maxRetriesExceeded'
  );
}

// ─── AI SDK v7 Compliant Fallback Stream ────────────────────────────────────

function createFallbackStream(text, products = [], queryText = '') {
  const formatted = formatProducts(products);
  const enc       = new TextEncoder();
  const send      = (ctrl, obj) => ctrl.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));

  const body = new ReadableStream({
    start(ctrl) {
      send(ctrl, { type: 'start' });
      send(ctrl, { type: 'start-step' });

      // Emit tool invocation so IntentMatchmaker renders product cards
      if (formatted.length > 0) {
        const id = `call_rag_${Date.now()}`;
        send(ctrl, { type: 'tool-input-available',  toolCallId: id, toolName: 'search_catalog', input: { query: queryText || 'search' } });
        send(ctrl, { type: 'tool-output-available', toolCallId: id, toolName: 'search_catalog', output: { products: formatted } });
      }

      // Stream text answer
      send(ctrl, { type: 'text-start', id: '0' });
      const words = text.split(' ');
      const chunkSize = 5;
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '');
        send(ctrl, { type: 'text-delta', id: '0', delta: chunk });
      }
      send(ctrl, { type: 'text-end',   id: '0' });

      send(ctrl, { type: 'finish-step' });
      send(ctrl, { type: 'finish', finishReason: 'stop' });
      ctrl.enqueue(enc.encode('data: [DONE]\n\n'));
      ctrl.close();
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type':                  'text/event-stream; charset=utf-8',
      'Cache-Control':                 'no-cache',
      'Connection':                    'keep-alive',
      'x-vercel-ai-ui-message-stream': 'v1',
      'x-accel-buffering':             'no',
    },
  });
}

// ─── Build a rich RAG-only text response ───────────────────────────────────

function buildRagFallbackText(queryText, products) {
  if (products.length === 0) {
    return `I couldn't find direct matches for "${queryText}" in our catalog right now. Try searching for cameras, laptops, smartphones, or fashion items!`;
  }
  const top = products.slice(0, 3);
  const list = top.map((p, i) =>
    `${i + 1}. ${p.name} — ₹${Number(p.price).toLocaleString('en-IN')}` +
    (p.category_name ? ` (${p.category_name})` : '')
  ).join(', ');
  return `Here are the top results for "${queryText}" from our catalog: ${list}. Tap any product to view full details!`;
}

// ─── POST /api/chat ─────────────────────────────────────────────────────────

export async function POST(req) {
  let uiMessages = [];
  let userId = 'anonymous';
  try {
    const body = await req.json();
    uiMessages = body.messages || [];
    userId     = body.userId   || 'anonymous';
  } catch (err) {
    console.error('[CHAT] Parse error:', err);
    return new Response('Bad request', { status: 400 });
  }

  if (uiMessages.length === 0) {
    return new Response('No messages', { status: 400 });
  }

  const queryText = extractQueryText(uiMessages);
  console.log('[CHAT] Query:', queryText);

  let rawProducts = [];
  if (queryText) {
    try {
      const r = await fetch(
        `${NEST_API}/api/ai/search?q=${encodeURIComponent(queryText)}&topK=8`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (r.ok) {
        const j = await r.json();
        rawProducts = j.data || [];
        console.log(`[CHAT] RAG: ${rawProducts.length} products found`);
      }
    } catch (e) {
      console.warn('[CHAT] RAG search failed:', e.message);
    }
  }

  const { memoryContext }  = await loadUserMemory(userId);
  const formattedCatalog   = formatProducts(rawProducts);

  const catalogContext = formattedCatalog.length > 0
    ? formattedCatalog.map((p, i) =>
        `[${i + 1}] "${p.name}" — ₹${Number(p.price).toLocaleString('en-IN')}` +
        ` | ${p.category_name}${p.subcategory_name ? ' / ' + p.subcategory_name : ''}` +
        `\n   ${p.description}`
      ).join('\n\n')
    : 'No product matches found.';

  const systemPrompt = `You are Quix, QuickBuy's friendly AI shopping assistant.

PRODUCTS RETRIEVED VIA SEMANTIC SEARCH:
${catalogContext}

INSTRUCTIONS:
1. Call search_catalog with the user's query to get structured product data for rendering.
2. Then write a warm, helpful 2-3 sentence reply recommending the best matches and WHY they fit.
3. Only recommend products from the search results. Prices in ₹.
4. Keep total response under 100 words.
${memoryContext}`;

  const catalogTool = tool({
    description: `Search QuickBuy product catalog. The user wants: "${queryText}". Call with query="${queryText}".`,
    parameters: z.object({
      query:    z.string().optional().describe('Search query (use user query if unsure)'),
      maxPrice: z.number().optional().describe('Max price in INR'),
    }),
    execute: async ({ query, maxPrice }) => {
      const q = query || queryText || 'product';
      try {
        let url = `${NEST_API}/api/ai/search?q=${encodeURIComponent(q)}&topK=8`;
        if (maxPrice && maxPrice > 0) url += `&maxPrice=${maxPrice}`;
        const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!r.ok) return { products: [] };
        const j = await r.json();
        const data = j.data || [];
        return { products: formatProducts(data) };
      } catch {
        return { products: [] };
      }
    },
  });

  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(uiMessages, {
      tools: { search_catalog: catalogTool, search_products: catalogTool },
      ignoreIncompleteToolCalls: true,
    });
  } catch (convErr) {
    console.warn('[CHAT] convertToModelMessages error:', convErr.message);
    modelMessages = [{ role: 'user', content: queryText || 'help me find a product' }];
  }

  let llmAvailable = false;
  try {
    await generateText({
      model: LLM_MODEL,
      prompt: 'ok',
      maxTokens: 1,
      maxRetries: 0,
      abortSignal: AbortSignal.timeout(3000),
    });
    llmAvailable = true;
  } catch (probeErr) {
    if (isQuotaError(probeErr)) {
      console.warn('[CHAT] LLM quota exceeded → RAG fallback');
    } else {
      console.warn('[CHAT] LLM probe failed:', probeErr?.message);
    }
  }

  if (llmAvailable) {
    try {
      const result = streamText({
        model:    LLM_MODEL,
        system:   systemPrompt,
        messages: modelMessages,
        tools: {
          search_catalog:  catalogTool,
          search_products: catalogTool,
        },
        stopWhen:   isStepCount(5),
        maxRetries: 1,
        onError({ error }) {
          console.error('[CHAT] Stream error:', error?.message);
        },
      });

      return result.toUIMessageStreamResponse();
    } catch (streamErr) {
      console.error('[CHAT] streamText threw synchronously:', streamErr?.message);
    }
  }

  const fallbackText = buildRagFallbackText(queryText, formattedCatalog);
  console.log('[CHAT] Serving RAG fallback with', formattedCatalog.length, 'products');
  return createFallbackStream(fallbackText, rawProducts, queryText);
}
