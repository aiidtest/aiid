// src/types/rag.ts
export interface TextChunkMetadata {
    source: 'incident' | 'report';
    sourceId: number;
    chunkIndex: number;
    startIndex: number;
    endIndex: number;
    totalChunks: number;
}

export interface ChunkingOptions {
    maxChunkSize?: number;
    overlap?: number;
    minChunkSize?: number;
    splitter?: 'character' | 'sentence' | 'paragraph';
}

export interface EmbeddingOptions {
    model?: 'text-embedding-3-small' | 'text-embedding-3-large';
    batchSize?: number;
    dimensions?: number;
}

export interface ProcessingOptions {
    chunkingOptions?: ChunkingOptions;
    embeddingOptions?: EmbeddingOptions;
    skipExisting?: boolean;
    parallel?: number;
}

export interface EmbeddingResponse {
    embedding: number[];
    usage: {
        prompt_tokens: number;
        total_tokens: number;
    };
}

export interface ProcessedChunk {
    text: string;
    metadata: TextChunkMetadata;
    embedding?: number[];
}