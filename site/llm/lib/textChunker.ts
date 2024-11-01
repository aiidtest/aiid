// src/utils/textChunker.ts
import { ChunkingOptions, ProcessedChunk, TextChunkMetadata } from '../types';

export class TextChunker {
    private defaultOptions: Required<ChunkingOptions> = {
        maxChunkSize: 512,
        overlap: 50,
        minChunkSize: 100,
        splitter: 'sentence'
    };

    constructor(private options: ChunkingOptions = {}) {
        this.options = { ...this.defaultOptions, ...options };
    }

    public async chunkText(
        text: string,
        metadata: Omit<TextChunkMetadata, 'chunkIndex' | 'startIndex' | 'endIndex' | 'totalChunks'>
    ): Promise<ProcessedChunk[]> {
        const chunks: ProcessedChunk[] = [];
        let segments: string[] = [];

        switch (this.options.splitter) {
            case 'sentence':
                segments = this.splitIntoSentences(text);
                break;
            case 'paragraph':
                segments = this.splitIntoParagraphs(text);
                break;
            default:
                segments = this.splitByCharacter(text);
        }

        let currentChunk = '';
        let startIndex = 0;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            if ((currentChunk + segment).length <= this.options.maxChunkSize!) {
                currentChunk += segment;
            } else {
                if (currentChunk.length >= this.options.minChunkSize!) {
                    chunks.push({
                        text: currentChunk.trim(),
                        metadata: {
                            ...metadata,
                            chunkIndex: chunks.length,
                            startIndex,
                            endIndex: startIndex + currentChunk.length,
                            totalChunks: 0 // Will be updated later
                        }
                    });
                }
                currentChunk = segment;
                startIndex += currentChunk.length;
            }
        }

        // Add the last chunk if it meets the minimum size
        if (currentChunk.length >= this.options.minChunkSize!) {
            chunks.push({
                text: currentChunk.trim(),
                metadata: {
                    ...metadata,
                    chunkIndex: chunks.length,
                    startIndex,
                    endIndex: startIndex + currentChunk.length,
                    totalChunks: 0
                }
            });
        }

        // Update total chunks
        return chunks.map(chunk => ({
            ...chunk,
            metadata: { ...chunk.metadata, totalChunks: chunks.length }
        }));
    }

    private splitIntoSentences(text: string): string[] {
        // Basic sentence splitting - can be improved with better regex or NLP
        return text.match(/[^.!?]+[.!?]+/g) || [text];
    }

    private splitIntoParagraphs(text: string): string[] {
        return text.split(/\n\s*\n/);
    }

    private splitByCharacter(text: string): string[] {
        const chunks: string[] = [];
        for (let i = 0; i < text.length; i += this.options.maxChunkSize!) {
            chunks.push(text.slice(i, i + this.options.maxChunkSize!));
        }
        return chunks;
    }
}