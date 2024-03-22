import { startStandaloneServer } from "@apollo/server/standalone";
import { createServer } from "../server";
import { context } from "../context";
import { MongoClient } from "mongodb";

export const startTestServer = async () => {

    const server = await createServer();

    const { url } = await startStandaloneServer(server, { context, listen: { port: 0 } });

    return { server, url }
}

export const seedCollection = async ({ name, docs, database = 'aiidprod', drop = true }: { name: string, database?: string, docs: Record<string, unknown>[], drop?: boolean }) => {

    const client = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);

    const db = client.db(database);
    const collection = db.collection(name);

    if (drop && (await db.listCollections().toArray()).find(c => c.name === name)) {

        await collection.drop();
    }

    const result = await collection.insertMany(docs);

    return result;
}

interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user_id: string;
}

export const login = async (username: string, password: string) => {

    const response = await fetch(`https://services.cloud.mongodb.com/api/client/v2.0/app/${process.env.REALM_APP_ID}/auth/providers/local-userpass/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password,
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AuthResponse = await response.json();

    return data;
}