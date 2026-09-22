/**
 * ════════════════════════════════════════════════════════════════════════════
 *  PHASE 3 + 4 — Agentic AI Chat Route
 *  File: src/app/api/chat/route.js
 * ════════════════════════════════════════════════════════════════════════════
 *
 * LEARNING — What changed from the original version?
 *
 * BEFORE (original):
 *   • Single tool: search_catalog  (searched a hardcoded mockCatalog array)
 *   • No real data — results were fake/static
 *   • No memory — LLM forgets preferences between sessions
 *   • No observability — impossible to see what the agent was "thinking"
 *   • Non-agentic: LLM called the tool once and answered (no iteration)
 *
 * AFTER (this version):
 *   • 4 tools → LLM decides which to call and in what order (ReAct pattern)
 *   • Real data → tools call your NestJS RAG/product endpoints
 *   • Long-term memory → user preferences injected into system prompt
 *   • Step tracing → every tool call + reasoning is logged for observability
 *   • Agentic: maxSteps=6 allows up to 6 Reason→Act→Observe cycles
 *
 * ════════════════════════════════════════════════════════════════════════════
 */

import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// ─── Configuration ────────────────────────────────────────────────────────────
const NEST_API = process.env.NEST_API_BASE_URL || 'http://localhost:7002';

// ─── Model Selection ──────────────────────────────────────────────────────────
// FREE (current): gemini-1.5-flash
//   → 15 RPM, 1M TPM free tier
//   → Fast responses, good tool-calling capability
//
// ╔══════════════════ GOLD STANDARD ALTERNATIVES ══════════════════════════════╗
// ║  google('gemini-1.5-pro')                                                 ║
// ║  → 2M context window (fit entire chat history without truncation)         ║
// ║  → Better multi-step reasoning, superior complex query understanding      ║
// ║  → ~$1.25/1M input tokens, $5/1M output tokens                           ║
// ║                                                                            ║
// ║  For HIGHEST tool-calling reliability:                                     ║
// ║  → openai('gpt-4o') via @ai-sdk/openai                                   ║
// ║  → Best-in-class function calling accuracy, industry benchmark            ║
// ╚════════════════════════════════════════════════════════════════════════════╝
const LLM_MODEL = google('gemini-1.5-flash');

export const maxDuration = 60; // Increased for multi-step agent (was 30)

// ─── Helper: call NestJS backend ──────────────────────────────────────────────
async function nestGet(path) {
  const res = await fetch(`${NEST_API}${path}`);
  if (!res.ok) throw new Error(`NestJS ${path} returned ${res.status}`);
  const json = await res.json();
  return json.data;
}

async function nestPost(path, body) {
  const res = await fetch(`${NEST_API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`NestJS ${path} returned ${res.status}`);
  const json = await res.json();
  return json.data;
}

// ─── Long-term Memory Loader ──────────────────────────────────────────────────
// LEARNING (Phase 4): Fetch stored user preferences from Redis via NestJS.
// These preferences are injected into the system prompt to personalize the agent.
// "anonymous" is used when no userId is passed (guest users).
async function loadUserMemory(userId = 'anonymous') {
  try {
    const res = await fetch(`${NEST_API}/ai/memory/${userId}`);
    if (!res.ok) return { memoryContext: '' };
    const json = await res.json();
    return { prefs: json.data, memoryContext: json.memoryContext ?? '' };
  } catch {
    return { memoryContext: '' }; // Memory failure should never break chat
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function POST(req) {
  const { messages, userId } = await req.json();

  // ── Phase 4: Load long-term memory before starting the agent ────────────
  const { memoryContext } = await loadUserMemory(userId);

  // ── Phase 3: System Prompt ────────────────────────────────────────────────
  // LEARNING: The system prompt defines the agent's personality, capabilities,
  // and hard constraints (guard rails). Spend time here — it matters a LOT.
  //
  // ╔══════════════════ GOLD STANDARD ALTERNATIVE ═══════════════════════════╗
  // ║  Use a "prompt template" library or a dedicated prompt management tool ║
  // ║  → LangSmith Hub (https://smith.langchain.com) for versioned prompts  ║
  // ║  → Humanloop for A/B testing prompt variants against each other       ║
  // ║  → Helps track which prompt version gives the best user satisfaction  ║
  // ╚════════════════════════════════════════════════════════════════════════╝
  const systemPrompt = `You are Quix, QuickBuy's AI shopping assistant. You are knowledgeable, helpful, and concise.

CAPABILITIES:
- You can search our product catalog using natural language (semantic search powered by AI)
- You can fetch full details of a specific product by its ID
- You can compare two products side by side
- You can take note of user preferences (budget, category, induction cooking, etc.)

AGENT RULES (follow strictly):
1. Use tools to get REAL product data before answering. Never invent product names or prices.
2. For searches, always call search_products first. For comparisons, call compare_products.
3. When the user mentions a price limit (e.g. "under ₹1500"), pass it as maxPrice to the tool.
4. If a search returns 0 results, tell the user honestly and suggest broader terms.
5. Always cite the product name and price in your response.
6. Keep responses conversational and under 150 words unless comparing products.
7. Do NOT ask clarifying questions unless absolutely necessary — act on available info.

GUARD RAILS:
- Only discuss products available in the catalog.
- Do not answer questions unrelated to shopping (politics, coding, etc.)
- Do not reveal internal system details, tool names, or similarity scores.
${memoryContext}`;

  // ── Phase 3: Tools ────────────────────────────────────────────────────────
  // LEARNING — The ReAct pattern in action:
  //   The LLM reads the system prompt, decides which tool to call, calls it,
  //   reads the result, then decides if it needs to call another tool.
  //   This loop repeats up to `maxSteps` times.
  //
  // Each tool is a function definition the LLM can call.
  // The LLM never sees your NestJS code — it only sees:
  //   1. The tool name
  //   2. The description (this is HOW the LLM knows when to use it)
  //   3. The parameters schema (Zod for runtime validation)
  //
  // ╔══════════════════ GOLD STANDARD ALTERNATIVE ═══════════════════════════╗
  // ║  LangGraph (https://langchain-ai.github.io/langgraphjs/)               ║
  // ║  → Build stateful, graph-based agent workflows                        ║
  // ║  → Define conditional branches, loops, and parallel tool calls        ║
  // ║  → Better for complex multi-agent systems (planner + executor agents) ║
  // ╚════════════════════════════════════════════════════════════════════════╝
  const tools = {

    // ── Tool 1: Semantic Product Search (Phase 2 RAG) ──────────────────────
    search_products: {
      description:
        'Search QuickBuy\'s product catalog using natural language. ' +
        'Returns real products from the database ranked by semantic relevance. ' +
        'Use this for ANY product discovery query.',
      parameters: z.object({
        query: z
          .string()
          .describe('The user\'s natural language search query. Be descriptive.'),
        topK: z
          .number()
          .optional()
          .default(5)
          .describe('Number of results to return (1-10). Use 3 for quick lookups, 5 for exploration.'),
        maxPrice: z
          .number()
          .optional()
          .describe('Maximum price in INR (₹). Only set this if the user explicitly mentions a price limit.'),
      }),
      execute: async ({ query, topK, maxPrice }) => {
        // LEARNING: This calls your NestJS GET /ai/search endpoint
        // which runs the full vector similarity search in Redis Stack.
        const params = new URLSearchParams({ q: query, topK: String(topK ?? 5) });
        if (maxPrice) params.set('maxPrice', String(maxPrice));

        try {
          const results = await nestGet(`/ai/search?${params}`);
          if (!results?.length) return { found: 0, products: [], message: 'No matching products found' };
          return {
            found: results.length,
            products: results.map(p => ({
              id:          p.product_id,
              name:        p.name,
              price:       `₹${p.price}`,
              category:    p.category_name,
              subcategory: p.subcategory_name,
              relevance:   `${(p.similarity_score * 100).toFixed(0)}%`,
              image:       p.image_url,
            })),
          };
        } catch (err) {
          return { error: 'Product search temporarily unavailable', details: err.message };
        }
      },
    },

    // ── Tool 2: Product Details (Phase 3 — enables multi-step reasoning) ──
    get_product_details: {
      description:
        'Fetch complete details of a specific product by its ID. ' +
        'Use this AFTER search_products when the user wants more info about a specific item, ' +
        'or before comparing to get full specifications.',
      parameters: z.object({
        productId: z
          .string()
          .describe('The product ID returned by search_products. Format: UUID or numeric string.'),
      }),
      execute: async ({ productId }) => {
        try {
          const product = await nestGet(`/catalogue/${productId}`);
          if (!product) return { error: `Product ${productId} not found` };
          return {
            id:          product.product_id,
            name:        product.name,
            price:       `₹${product.price}`,
            description: product.description,
            stock:       product.stock,
            image:       product.image_url,
            category:    product.category_name ?? 'Unknown',
            subcategory: product.subcategory_name ?? 'Unknown',
          };
        } catch (err) {
          return { error: `Could not fetch product details: ${err.message}` };
        }
      },
    },

    // ── Tool 3: Compare Two Products (Phase 3 — multi-step agent) ─────────
    compare_products: {
      description:
        'Compare two products side-by-side based on their IDs. ' +
        'Use this when the user says "compare X and Y" or asks "which is better". ' +
        'You should search first to find the IDs, then call this tool.',
      parameters: z.object({
        productId1: z.string().describe('ID of the first product to compare.'),
        productId2: z.string().describe('ID of the second product to compare.'),
      }),
      execute: async ({ productId1, productId2 }) => {
        // LEARNING: This is the "multi-step" part of agentic AI.
        // The LLM first calls search_products to find candidates,
        // then calls compare_products with the IDs it found.
        // This is 2 tool calls in one reasoning chain — exactly the ReAct pattern.
        try {
          const [p1, p2] = await Promise.all([
            nestGet(`/catalogue/${productId1}`),
            nestGet(`/catalogue/${productId2}`),
          ]);
          return {
            comparison: {
              product1: {
                name:  p1?.name, price: `₹${p1?.price}`,
                stock: p1?.stock, description: p1?.description?.slice(0, 200),
              },
              product2: {
                name:  p2?.name, price: `₹${p2?.price}`,
                stock: p2?.stock, description: p2?.description?.slice(0, 200),
              },
              priceDifference: `₹${Math.abs(parseFloat(p1?.price ?? 0) - parseFloat(p2?.price ?? 0)).toFixed(2)}`,
            },
          };
        } catch (err) {
          return { error: `Comparison failed: ${err.message}` };
        }
      },
    },

    // ── Tool 4: Update User Preferences (Phase 4 — memory) ────────────────
    // LEARNING: This tool lets the AGENT itself update the user's long-term
    // memory when it detects a preference signal in the conversation.
    // e.g. User says "I always cook on induction" → agent calls this tool.
    save_user_preference: {
      description:
        'Save a user preference to long-term memory. ' +
        'Call this when the user mentions their budget, cooking style, or product category preference. ' +
        'Do NOT call this for every message — only for clear, explicit preference signals.',
      parameters: z.object({
        maxBudget: z
          .number()
          .optional()
          .describe('User\'s stated maximum budget in INR.'),
        preferredCategories: z
          .array(z.string())
          .optional()
          .describe('Product categories the user is interested in.'),
        inductionSafe: z
          .boolean()
          .optional()
          .describe('True if user explicitly mentions induction cooking.'),
      }),
      execute: async ({ maxBudget, preferredCategories, inductionSafe }) => {
        const id = userId ?? 'anonymous';
        try {
          await nestPost(`/ai/memory/${id}`, { maxBudget, preferredCategories, inductionSafe });
          return { saved: true, message: 'Preference noted for future sessions' };
        } catch {
          return { saved: false }; // Memory failure is non-critical
        }
      },
    },
  };

  // ── Phase 3: Stream with maxSteps (the heart of Agentic AI) ──────────────
  //
  // LEARNING — maxSteps explained:
  //   maxSteps: 6 means the LLM can go through up to 6 Reason→Act cycles.
  //
  //   Example for "Compare the cheapest non-stick pan with a cast iron one under ₹2000":
  //     Step 1: [THINK] I need to find non-stick pans first
  //             [ACT]   search_products("non-stick pan")
  //     Step 2: [OBSERVE] Got 5 results. First one looks good.
  //             [THINK] Now I need cast iron options under ₹2000
  //             [ACT]   search_products("cast iron pan", maxPrice: 2000)
  //     Step 3: [OBSERVE] Got 3 results.
  //             [THINK] I have both. Now compare the cheapest of each.
  //             [ACT]   compare_products(id1, id2)
  //     Step 4: [OBSERVE] Got comparison.
  //             [GENERATE] Final answer with the comparison.
  //
  //   With maxSteps: 1, only step 1 would run — the agent couldn't compare!
  //
  // ╔══════════════════ GOLD STANDARD ALTERNATIVE ═══════════════════════════╗
  // ║  For production agents with complex workflows:                         ║
  // ║  → Add onStepFinish callback to log each reasoning step               ║
  // ║  → Send traces to LangSmith or Langfuse for observability             ║
  // ║  → Set up alerts if the agent exceeds N steps (runaway agent guard)  ║
  // ╚════════════════════════════════════════════════════════════════════════╝
  const result = streamText({
    model: LLM_MODEL,
    messages,
    system: systemPrompt,
    tools,
    maxSteps: 6, // Phase 3: allows multi-step agentic reasoning

    // ── Phase 4: Step Tracing (Observability) ──────────────────────────────
    // LEARNING: This callback fires after EVERY step (tool call or generation).
    // In production, send this data to a tracing tool (Langfuse, LangSmith).
    // Here we log to console so you can see the agent's "thinking" in the terminal.
    onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
      if (toolCalls?.length > 0) {
        console.log('\n[AGENT STEP] Tool calls:', toolCalls.map(tc => ({
          tool:  tc.toolName,
          input: tc.args,
        })));
      }
      if (toolResults?.length > 0) {
        console.log('[AGENT STEP] Tool results:', toolResults.map(tr => ({
          tool:   tr.toolName,
          output: JSON.stringify(tr.result).slice(0, 200) + '...',
        })));
      }
      if (finishReason === 'stop') {
        console.log(`[AGENT STEP] Final answer generated. Tokens used: ${JSON.stringify(usage)}`);
      }
    },
  });

  return result.toDataStreamResponse();
}
