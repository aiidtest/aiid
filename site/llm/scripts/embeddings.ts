import { db } from '../db';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import readline from 'readline';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { EmbeddingProvider } from '../types';
import { createEmbeddingProvider } from '@/lib/utils';

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

function chunkText(text: string): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const word of words) {
        if (currentLength + word.length > CHUNK_SIZE) {
            chunks.push(currentChunk.join(' '));
            // Take the last N words from the current chunk to create overlap
            const overlapWords = currentChunk.slice(-Math.floor(CHUNK_OVERLAP / 20));
            currentChunk = [...overlapWords];
            currentLength = currentChunk.join(' ').length;
        }
        currentChunk.push(word);
        currentLength += word.length + 1;
    }
    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }
    return chunks;
}

async function processReport(reportNumber: number, provider: EmbeddingProvider) {

    console.log(`Processing report ${reportNumber}`);

    if (await db.query.embeddings.findFirst({
        where: and(
            eq(schema.embeddings.sourceType, 'report'),
            eq(schema.embeddings.sourceId, reportNumber.toString())
        )
    })) {
        console.log(`Report ${reportNumber} already processed`);
        return;
    }

    const report = await db.query.reports.findFirst({
        where: eq(schema.reports.reportNumber, reportNumber),
    });

    if (!report) return;

    const metadataChunk = [
        `Title: ${report.title}`,
        `URL: ${report.url}`,
        `Language: ${report.language}`,
        `Source: ${report.sourceDomain}`,
        `Authors: ${report.authors?.join(', ') || ''}`,
        `Tags: ${report.tags?.join(', ') || ''}`,
        `Date Published: ${report.datePublished?.toISOString() || ''}`
    ].join('\n');

    try {
        // Start a transaction for all-or-nothing insertion
        await db.transaction(async (tx) => {
            const { embedding: metadataEmbedding } = await provider.getEmbedding(metadataChunk);

            await tx.insert(schema.embeddings).values({
                sourceType: 'report',
                sourceId: reportNumber.toString(),
                chunkIndex: 0,
                chunkText: metadataChunk,
                embedding: metadataEmbedding,
                model: provider.getModel(),
                metadata: {
                    reportNumber: reportNumber,
                    title: report.title,
                    url: report.url
                }
            } as typeof schema.embeddings.$inferInsert);

            const chunks = report.plainText ? chunkText(report.plainText) : [];

            // Process all chunks and collect their embeddings
            const chunkEmbeddings = await Promise.all(
                chunks.map(async (chunk, i) => {
                    const { embedding } = await provider.getEmbedding(chunk);
                    return {
                        sourceType: 'report',
                        sourceId: reportNumber.toString(),
                        chunkIndex: i + 1,
                        chunkText: chunk,
                        embedding: embedding,
                        model: provider.getModel(),
                        metadata: {
                            reportNumber: reportNumber,
                            title: report.title,
                            url: report.url
                        }
                    } as typeof schema.embeddings.$inferInsert;
                })
            );

            // Insert all chunks in a single operation if there are any
            if (chunkEmbeddings.length > 0) {
                await tx.insert(schema.embeddings).values(chunkEmbeddings);
            }

            console.log(`Processed report ${reportNumber}, ${chunks.length} chunks`);
        });
    } catch (error) {
        console.error(`Error processing report ${reportNumber}:`, error);
        throw error; // Re-throw to allow caller to handle
    }
}

async function processIncident(incidentId: number, provider: EmbeddingProvider) {

    console.log(`Processing incident ${incidentId}`);

    if (await db.query.embeddings.findFirst({
        where: and(
            eq(schema.embeddings.sourceType, 'incident'),
            eq(schema.embeddings.sourceId, incidentId.toString())
        )
    })) {
        console.log(`Incident ${incidentId} already processed`);
        return;
    }

    const incident = await db.query.incidents.findFirst({
        where: eq(schema.incidents.incidentId, incidentId),
    });

    if (!incident) return;

    const metadataChunk = [
        `Title: ${incident.title}`,
        `Editor Notes: ${incident.editorNotes || ''}`,
        `Date: ${incident.date?.toISOString() || ''}`
    ].join('\n');

    try {
        // Start a transaction for all-or-nothing insertion
        await db.transaction(async (tx) => {
            const { embedding: metadataEmbedding } = await provider.getEmbedding(metadataChunk);

            // Insert metadata chunk
            await tx.insert(schema.embeddings).values({
                sourceType: 'incident',
                sourceId: incidentId.toString(),
                chunkIndex: 0,
                chunkText: metadataChunk,
                embedding: metadataEmbedding,
                model: provider.getModel(),
                metadata: {
                    incidentId: incidentId,
                    title: incident.title,
                    date: incident.date?.toISOString()
                }
            } as typeof schema.embeddings.$inferInsert);

            const chunks = incident.description ? chunkText(incident.description) : [];

            // Process all chunks and collect their embeddings
            const chunkEmbeddings = await Promise.all(
                chunks.map(async (chunk, i) => {
                    const { embedding } = await provider.getEmbedding(chunk);
                    return {
                        sourceType: 'incident',
                        sourceId: incidentId.toString(),
                        chunkIndex: i + 1,
                        chunkText: chunk,
                        embedding: embedding,
                        model: provider.getModel(),
                        metadata: {
                            incidentId: incidentId,
                            title: incident.title,
                            date: incident.date?.toISOString()
                        }
                    } as typeof schema.embeddings.$inferInsert;
                })
            );

            // Insert all chunks in a single operation if there are any
            if (chunkEmbeddings.length > 0) {
                await tx.insert(schema.embeddings).values(chunkEmbeddings);
            }

            console.log(`Processed incident ${incidentId}, ${chunks.length} chunks`);
        });
    } catch (error) {
        console.error(`Error processing incident ${incidentId}:`, error);
        throw error; // Re-throw to allow caller to handle
    }
}

async function confirm(message: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(`${message} (y/N) `, answer => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}

async function parseNumberList(input: string): Promise<number[]> {
    if (input.toLowerCase() === 'all') return [];

    return input.split(',').flatMap(segment => {
        segment = segment.trim();
        const rangeMatch = segment.match(/^(\d+)\.\.(\d+)$/);

        if (rangeMatch) {
            const start = parseInt(rangeMatch[1]);
            const end = parseInt(rangeMatch[2]);
            if (isNaN(start) || isNaN(end)) return [];
            return Array.from({ length: end - start + 1 }, (_, i) => start + i);
        }

        const num = parseInt(segment);
        return isNaN(num) ? [] : [num];
    });
}

interface ProcessOptions {
    reportNumbers?: number[] | 'all';
    incidentIds?: number[] | 'all';
    provider: EmbeddingProvider;
}

async function parseAndValidateArgs(): Promise<ProcessOptions | null> {
    const argv = await yargs(hideBin(process.argv))
        .option('incidentId', {
            type: 'string',
            description: 'Incident ID(s) to process (comma-separated) or "all"'
        })
        .option('reportNumber', {
            type: 'string',
            description: 'Report number(s) to process (comma-separated) or "all"'
        })
        .option('provider', {
            type: 'string',
            description: 'Embedding provider to use (openai or voyageai)',
            default: 'openai'
        })
        .check((argv) => {
            if (!argv.incidentId && !argv.reportNumber) {
                throw new Error('At least one of --incidentId or --reportNumber must be provided');
            }
            return true;
        })
        .argv;

    const provider = createEmbeddingProvider(argv.provider);

    // Check if processing all items and confirm with user
    if (argv.incidentId?.toLowerCase() === 'all' || argv.reportNumber?.toLowerCase() === 'all') {
        const confirmed = await confirm('You\'ve selected to process ALL items. This may take a long time. Continue?');
        if (!confirmed) {
            console.log('Operation cancelled');
            return null;
        }
    }

    // Convert command line arguments to the appropriate format
    const reportNumbers = argv.reportNumber ?
        (argv.reportNumber.toLowerCase() === 'all' ? 'all' : await parseNumberList(argv.reportNumber)) :
        undefined;

    const incidentIds = argv.incidentId ?
        (argv.incidentId.toLowerCase() === 'all' ? 'all' : await parseNumberList(argv.incidentId)) :
        undefined;

    // Additional validation for empty arrays
    if (reportNumbers !== 'all' && Array.isArray(reportNumbers) && reportNumbers.length === 0 &&
        incidentIds !== 'all' && Array.isArray(incidentIds) && incidentIds.length === 0) {
        console.error('Error: No valid report numbers or incident IDs provided');
        return null;
    }

    return {
        reportNumbers,
        incidentIds,
        provider
    };
}

async function processItems(options: {
    reportNumbers?: number[] | 'all';
    incidentIds?: number[] | 'all';
    provider: EmbeddingProvider;
}) {
    const { reportNumbers, incidentIds, provider } = options;

    if (reportNumbers) {
        if (reportNumbers === 'all') {
            const allReports = await db.select().from(schema.reports);
            for (const report of allReports) {
                await processReport(report.reportNumber, provider);
            }
        } else if (reportNumbers.length > 0) {
            for (const reportNum of reportNumbers) {
                await processReport(reportNum, provider);
            }
        }
    }

    if (incidentIds) {
        if (incidentIds === 'all') {
            const allIncidents = await db.select().from(schema.incidents);
            for (const incident of allIncidents) {
                await processIncident(incident.incidentId, provider);
            }
        } else if (incidentIds.length > 0) {
            for (const incidentId of incidentIds) {
                await processIncident(incidentId, provider);
            }
        }
    }
}

async function main() {
    const options = await parseAndValidateArgs();

    if (options) {
        await processItems(options);
    }
}

if (require.main === module) {
    main();
}