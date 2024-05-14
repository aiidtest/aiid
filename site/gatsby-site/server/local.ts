import {
    queryFields as quickAddsQueryFields,
    mutationFields as quickAddsMutationFields,
    permissions as quickAddsPermissions,
} from './fields/quickadds';
import { GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql';
import { shield, deny } from 'graphql-shield';
import { applyMiddleware } from 'graphql-middleware';
import { ObjectIdScalar } from './scalars';

export const getSchema = () => {

    const query = new GraphQLObjectType({
        name: 'Query',
        fields: {
            ObjectId: {
                type: ObjectIdScalar,
                description: 'Custom scalar for MongoDB ObjectID',
            },
            ...quickAddsQueryFields,
        }
    });

    const mutation = new GraphQLObjectType({
        name: 'Mutation',
        fields: {
            _: {
                type: GraphQLString,
                description: 'Placeholder field to avoid empty mutation type',
            },
            ...quickAddsMutationFields,
        }
    });

    const schema = new GraphQLSchema({
        query,
        mutation,
    })


    const permissions = shield({
        Query: {
            "*": deny,
            ...quickAddsPermissions.Query,

        },
        Mutation: {
            "*": deny,
            ...quickAddsPermissions.Mutation,
        },
    });

    const schemaWithAuth = applyMiddleware(schema, permissions)

    return schemaWithAuth;
}