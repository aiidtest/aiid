import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { VoyageEmbeddings } from '../lib/VoyagerEmbeddings';
import { VectorSearch } from '../lib/VectorSearch';

async function main() {
    const argv = await yargs(hideBin(process.argv))
        .option('query', {
            alias: 'q',
            type: 'string',
            description: 'Search query',
            demandOption: true
        })
        .option('limit', {
            alias: 'l',
            type: 'number',
            description: 'Number of results',
            default: 5
        })
        .option('minScore', {
            alias: 's',
            type: 'number',
            description: 'Minimum similarity score (0-1)',
            default: 0.7
        }).argv;

    const embeddings = new VoyageEmbeddings(process.env.VOYAGE_API_KEY!);
    const search = new VectorSearch(embeddings);

    const results = await search.search(argv.query, {
        limit: argv.limit,
        minScore: argv.minScore
    });

    console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) {
    main();
}