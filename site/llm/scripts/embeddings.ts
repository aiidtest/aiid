import { db } from '../db';
import { reports, incidents, reportEmbeddings, incidentEmbeddings } from '../db/schema';
import { eq } from 'drizzle-orm';
import readline from 'readline';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { EmbeddingProvider } from '../types';
import { VoyageEmbeddings } from '../lib/VoyagerEmbeddings';

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
            currentChunk = words.slice(-CHUNK_OVERLAP / 20);
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

    if (await db.query.reportEmbeddings.findFirst({ where: eq(reportEmbeddings.reportNumber, reportNumber) })) {
        console.log(`Report ${reportNumber} already processed`);
        return;
    }

    const report = await db.query.reports.findFirst({
        where: eq(reports.reportNumber, reportNumber),
    });

    if (!report) return;

    const metadata = [
        `Title: ${report.title}`,
        `URL: ${report.url}`,
        `Language: ${report.language}`,
        `Source: ${report.sourceDomain}`,
        `Authors: ${report.authors?.join(', ') || ''}`,
        `Tags: ${report.tags?.join(', ') || ''}`,
        `Date Published: ${report.datePublished?.toISOString() || ''}`
    ].join('\n');

    const { embedding: metadataEmbedding } = await provider.getEmbedding(metadata);

    await db.insert(reportEmbeddings).values({
        reportNumber: reportNumber,
        chunkIndex: 0,
        chunkText: metadata,
        embedding: metadataEmbedding,
        model: provider.getModel(),
    });

    const chunks = report.plainText ? chunkText(report.plainText) : [];

    for (let i = 0; i < chunks.length; i++) {

        const { embedding } = await provider.getEmbedding(chunks[i]);

        await db.insert(reportEmbeddings).values({
            reportNumber: reportNumber,
            chunkIndex: i + 1,
            chunkText: chunks[i],
            embedding: embedding,
            model: provider.getModel(),
        });
    }

    console.log(`Processed report ${reportNumber}, ${chunks.length} chunks`);
}

async function processIncident(incidentId: number, provider: EmbeddingProvider) {

    console.log(`Processing incident ${incidentId}`);

    if (await db.query.incidentEmbeddings.findFirst({ where: eq(incidentEmbeddings.incidentId, incidentId) })) {
        console.log(`Incident ${incidentId} already processed`);
        return;
    }

    const incident = await db.query.incidents.findFirst({
        where: eq(incidents.incidentId, incidentId),
    });

    if (!incident) return;

    const metadata = [
        `Title: ${incident.title}`,
        `Editor Notes: ${incident.editorNotes || ''}`,
        `Date: ${incident.date?.toISOString() || ''}`
    ].join('\n');

    const { embedding: metadataEmbedding } = await provider.getEmbedding(metadata);

    await db.insert(incidentEmbeddings).values({
        incidentId: incidentId,
        chunkIndex: 0,
        chunkText: metadata,
        embedding: metadataEmbedding,
        model: provider.getModel(),
    });

    const chunks = incident.description ? chunkText(incident.description) : [];

    for (let i = 0; i < chunks.length; i++) {

        const { embedding } = await provider.getEmbedding(metadata);

        await db.insert(incidentEmbeddings).values({
            incidentId: incidentId,
            chunkIndex: i + 1,
            chunkText: chunks[i],
            embedding: embedding,
            model: provider.getModel(),
        });
    }

    console.log(`Processed incident ${incidentId}, ${chunks.length} chunks`);
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

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .option('incidentId', {
            type: 'string',
            description: 'Incident ID(s) to process (comma-separated) or "all"'
        })
        .option('reportNumber', {
            type: 'string',
            description: 'Report number(s) to process (comma-separated) or "all"'
        })
        .argv;

    const provider = new VoyageEmbeddings(process.env.VOYAGE_API_KEY!);

    if (argv.incidentId?.toLowerCase() === 'all' || argv.reportNumber?.toLowerCase() === 'all') {
        const confirmed = await confirm('You\'ve selected to process ALL items. This may take a long time. Continue?');
        if (!confirmed) {
            console.log('Operation cancelled');
            return;
        }
    }

    if (argv.reportNumber) {
        const reportNumbers = await parseNumberList(argv.reportNumber);
        if (reportNumbers.length > 0) {
            for (const reportNum of reportNumbers) {
                await processReport(reportNum, provider);
            }
        } else {
            const allReports = await db.select().from(reports);
            for (const report of allReports) {
                await processReport(report.reportNumber, provider);
            }
        }
    }

    if (argv.incidentId) {
        const incidentIds = await parseNumberList(argv.incidentId);
        if (incidentIds.length > 0) {
            for (const incidentId of incidentIds) {
                await processIncident(incidentId, provider);
            }
        } else {
            const allIncidents = await db.select().from(incidents);
            for (const incident of allIncidents) {
                await processIncident(incident.incidentId, provider);
            }
        }
    }
}

if (require.main === module) {
    main();
}