import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import assert from 'node:assert';

import incidents from './seeds/aiidprod/incidents';
import reports from './seeds/aiidprod/reports';
import submissions from './seeds/aiidprod/submissions';
import entities from './seeds/aiidprod/entities';

import users from './seeds/customData/users';


let instance: MongoMemoryServer | null = null;


export const init = async (extra?: Record<string, Record<string, Record<string, unknown>[]>>, { drop } = { drop: false }) => {

    await seedFixture({
        aiidprod: {
            incidents,
            reports,
            submissions,
            entities,
        },
        customData: {
            users,
        }
    });

    if (extra) {

        await seedFixture(extra, drop);
    }

    console.log('Data seeded successfully');
}

export const seedCollection = async ({ name, docs, database = 'aiidprod', drop = true }: { name: string, database?: string, docs: Record<string, unknown>[], drop?: boolean }) => {

    assert(process.env.MONGODB_CONNECTION_STRING?.includes('localhost') || process.env.MONGODB_CONNECTION_STRING?.includes('127.0.0.1'), 'Seeding is only allowed on localhost');

    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);

    const db = client.db(database);
    const collection = db.collection(name);

    if (drop && (await db.listCollections().toArray()).find(c => c.name === name)) {

        await collection.drop();
    }

    if (docs.length) {

        const result = await collection.insertMany(docs);

        return result;
    }
}


export const seedFixture = async (seeds: Record<string, Record<string, Record<string, unknown>[]>>, drop = true) => {

    for (const [database, collection] of Object.entries(seeds)) {

        for (const [name, docs] of Object.entries(collection)) {

            await seedCollection({ database, name, docs, drop });
        }
    }
}

async function start() {

    instance = await MongoMemoryServer.create({ instance: { port: 4110 } });

    await init();

    console.log(`\nIn memory mongodb started on  ${instance.getUri()} \n\n`,);
};

async function stop() {

    if (instance) {

        await instance.stop();
    }
}


process.on('SIGINT', async () => {

    console.log("\nTerminating...");

    await stop();

    process.exit(0);
});


if (require.main === module) {
    start();
}

