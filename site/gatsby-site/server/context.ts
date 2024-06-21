import { IncomingMessage } from "http";
import { MongoClient } from "mongodb";
import config from "./config";
import * as reporter from "./reporter";
import { Context } from "./interfaces";

function extractToken(header: string) {

    if (header && header!.startsWith('Bearer ')) {

        return header.substring(7);
    }

    return null;
}

export const verifyToken = async (token: string) => {

    const loginResponse = await fetch(
        `https://realm.mongodb.com/api/admin/v3.0/auth/providers/mongodb-cloud/login`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: config.REALM_API_PUBLIC_KEY,
                apiKey: config.REALM_API_PRIVATE_KEY,
            }),
        }
    );

    if (!loginResponse.ok) {
        throw new Error(`Error login into admin api! \n\n ${await loginResponse.text()}`);
    }

    const loginData = await loginResponse.json();

    const response = await fetch(
        `https://realm.mongodb.com/api/admin/v3.0/groups/${config.REALM_API_GROUP_ID}/apps/${config.REALM_API_APP_ID}/users/verify_token`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.access_token}`
            },
            body: JSON.stringify({ token }),
        }
    );

    if (!response.ok) {
        throw new Error(`Error verifying user token! \n\n ${await response.text()}`);
    }

    return response.json();
}

async function getUser(userId: string) {

    const client = new MongoClient(config.MONGODB_CONNECTION_STRING);

    const db = client.db('customData');

    const collection = db.collection('users');

    const userData = await collection.findOne({ userId });

    return {
        id: userId,
        roles: userData?.roles,
    }
}

export const getUserFromHeader = async (header: string) => {

    const token = extractToken(header);

    if (token) {

        const data = await verifyToken(token);

        if (data.sub) {

            const userData = await getUser(data.sub);

            return userData;
        }
    }

    return null;
}

export const context = async ({ req }: { req: IncomingMessage }): Promise<Context> => {

    try {

        const user = await getUserFromHeader(req.headers.authorization!);

        const client = new MongoClient(config.MONGODB_CONNECTION_STRING!);

        return { user, req, client };
    }
    catch (e) {

        reporter.error(e as Error);

        throw e;
    }
}