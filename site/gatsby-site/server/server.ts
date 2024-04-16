import { mergeSchemas } from '@graphql-tools/schema';
import { getSchema as getLocalSchema } from './local';
import { getSchema as getRemoteSchema } from './remote';
import 'json-bigint-patch';

export const getSchema = async () => {

    const localSchema = await getLocalSchema();

    const remoteSchema = await getRemoteSchema();

    const gatewaySchema = mergeSchemas({
        schemas: [remoteSchema, localSchema],
    });

    return gatewaySchema;
}
