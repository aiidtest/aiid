import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { VoyageEmbeddings } from '../../../lib/VoyagerEmbeddings';
import { VectorSearch } from '../../../lib/VectorSearch';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: anthropic('claude-3-5-sonnet-latest'),
        messages,
        tools: {
            getInformation: tool({
                description: `get information from your knowledge base to answer questions.`,
                parameters: z.object({
                    question: z.string().describe('the users question'),
                }),
                execute: async ({ question }) => {

                    const embeddings = new VoyageEmbeddings(process.env.VOYAGE_API_KEY!);
                    const search = new VectorSearch(embeddings);

                    const results = await search.search(question, { limit: 5, minScore: .7 });

                    return results;
                },
            }),
        },
        maxSteps: 5,
    });

    return result.toDataStreamResponse();
}