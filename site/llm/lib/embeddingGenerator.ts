// src/utils/embeddingGenerator.ts
import OpenAI from 'openai';
import { EmbeddingOptions, EmbeddingResponse, ProcessedChunk } from '../types';

export class EmbeddingGenerator {
    private openai: OpenAI;
    private defaultOptions: Required<EmbeddingOptions> = {
        model: 'text-embedding-3-small',
        batchSize: 100,
        dimensions: 1536
    };

    constructor(
        apiKey: string,
        private options: EmbeddingOptions = {}
    ) {
        this.openai = new OpenAI({ apiKey });
        this.options = { ...this.defaultOptions, ...options };
    }

    public async generateEmbeddings(chunks: ProcessedChunk[]): Promise<ProcessedChunk[]> {
        const batchedChunks = this.batchArray(chunks, this.options.batchSize!);
        const results: ProcessedChunk[] = [];

        for (const batch of batchedChunks) {
            try {
                const response = await this.openai.embeddings.create({
                    model: this.options.model!,
                    input: batch.map(chunk => chunk.text),
                });

                batch.forEach((chunk, index) => {
                    results.push({
                        ...chunk,
                        embedding: response.data[index].embedding
                    });
                });
            } catch (error) {
                console.error('Error generating embeddings:', error);
                throw error;
            }
        }

        return results;
    }

    private batchArray<T>(array: T[], batchSize: number): T[][] {
        return array.reduce((batches, item, index) => {
            const batchIndex = Math.floor(index / batchSize);
            if (!batches[batchIndex]) {
                batches[batchIndex] = [];
            }
            batches[batchIndex].push(item);
            return batches;
        }, [] as T[][]);
    }
}