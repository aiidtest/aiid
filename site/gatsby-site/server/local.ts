import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { shield, deny } from 'graphql-shield';
import { applyMiddleware } from 'graphql-middleware';
import { ObjectIdScalar } from './scalars';

import {
    queryFields as quickAddsQueryFields,
    mutationFields as quickAddsMutationFields,
    permissions as quickAddsPermissions,
} from './fields/quickadds';

import {
    queryFields as reportsQueryFields,
    mutationFields as reportsMutationFields,
    permissions as reportsPermissions
} from './fields/reports';

import {
    queryFields as entitiesQueryFields,
    mutationFields as entitiesMutationFields,
    permissions as entitiesPermissions
} from './fields/entities';

import {
    queryFields as usersQueryFields,
    mutationFields as usersMutationFields,
    permissions as usersPermissions
} from './fields/users';

import {
    queryFields as incidentsQueryFields,
    mutationFields as incidentsMutationFields,
    permissions as incidentsPermissions
} from './fields/incidents';

import {
    queryFields as submissionsQueryFields,
    mutationFields as submissionsMutationFields,
    permissions as submissionsPermissions
} from './fields/submissions';


export const getSchema = () => {

    const query = new GraphQLObjectType({
        name: 'Query',
        fields: {
            ObjectId: {
                type: ObjectIdScalar,
                description: 'Custom scalar for MongoDB ObjectID',
            },
            ...quickAddsQueryFields,
            ...reportsQueryFields,
            ...incidentsQueryFields,
            ...entitiesQueryFields,
            ...usersQueryFields,
            ...submissionsQueryFields,
        }
    });

    const mutation = new GraphQLObjectType({
        name: 'Mutation',
        fields: {
            ...quickAddsMutationFields,
            ...reportsMutationFields,
            ...incidentsMutationFields,
            ...entitiesMutationFields,
            ...usersMutationFields,
            ...submissionsMutationFields,
        }
    });

    const schema = new GraphQLSchema({
        query,
        mutation,
    })

    // graphql-shield, allows us to define wildcard fields and mutations. Every field starts private, and its permissions need to be set explicitly.

    const permissions = shield(
        {
            Query: {
                "*": deny,
                ...quickAddsPermissions.Query,
                ...reportsPermissions.Query,
                ...incidentsPermissions.Query,
                ...entitiesPermissions.Query,
                ...usersPermissions.Query,
                ...submissionsPermissions.Query,
            },
            Mutation: {
                "*": deny,
                ...quickAddsPermissions.Mutation,
                ...reportsPermissions.Mutation,
                ...incidentsPermissions.Mutation,
                ...entitiesPermissions.Mutation,
                ...usersPermissions.Mutation,
                ...submissionsPermissions.Mutation,
            },
        },
        {
            allowExternalErrors: process.env.NODE_ENV !== 'production',
        }
    );

    const schemaWithAuth = applyMiddleware(schema, permissions)

    return schemaWithAuth;
}
