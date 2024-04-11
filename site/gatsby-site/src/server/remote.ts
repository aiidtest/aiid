import { buildHTTPExecutor } from '@graphql-tools/executor-http'
import { makeExecutableSchema } from '@graphql-tools/schema';
import { FilterObjectFields, FilterTypes, schemaFromExecutor, wrapSchema } from '@graphql-tools/wrap';
import remoteTypeDefs from './remoteTypeDefs';
import config from '../../config';

const userExecutor = buildHTTPExecutor({
    endpoint: `https://realm.mongodb.com/api/client/v2.0/app/${config.realm.production_db.realm_app_id}/graphql`,
    headers(executorRequest) {
        return {
            authorization: executorRequest?.context.req.headers.authorization!,
        }
    },
});


const ignoreTypes = [
    'QuickAdd',
    'QuickaddQueryInput',
];

const ignoredQueries = [
    'quickadds',
];

const ignoredMutations = [
    'deleteManyQuickadds',
]

export const getSchema = async () => {

    const schema = wrapSchema({
        schema: makeExecutableSchema({ typeDefs: remoteTypeDefs }),
        executor: userExecutor,
        transforms: [
            new FilterTypes((typeName) => {

                if (ignoreTypes.includes(typeName.name)) {

                    return false;
                }

                return true

            }),
            new FilterObjectFields((typeName, fieldName) => {

                if (typeName === 'Query' && ignoredQueries.includes(fieldName)) {

                    return false;
                }

                if (typeName === 'Mutation' && ignoredMutations.includes(fieldName)) {

                    return false;
                }

                return true
            })
        ],
    });

    return schema;
}