import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import {

} from '../../../data/mockCatalog';

export const maxDuration = 30;

export async function POST(req) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-1.5-pro-latest'),
    messages,
    system: "You are a helpful e-commerce assistant. Use the search_catalog tool to find products that match the user's request. Present the options clearly.",
    tools: {
      search_catalog: {
        description: 'Search the product catalog based on user preferences.',
        parameters: z.object({
          maxPrice: z.number().optional().describe('Maximum price the user is willing to pay.'),
          material: z.string().optional().describe('Preferred material (e.g., stainless steel, cast iron).'),
          isInductionSafe: z.boolean().optional().describe('Whether the product must be induction-safe.'),
        }),
        execute: async ({ maxPrice, material, isInductionSafe }) => {
          let results = mockCatalog;

          if (maxPrice) {
            results = results.filter(product => product.price <= maxPrice);
          }
          if (material) {
            results = results.filter(product => product.material.toLowerCase().includes(material.toLowerCase()));
          }
          if (isInductionSafe) {
            results = results.filter(product => product.features.includes('induction-safe'));
          }

          return results.slice(0, 2);
        },
      },
    },
  });

  return result.toDataStreamResponse();
}
