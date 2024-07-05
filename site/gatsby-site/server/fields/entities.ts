import { GraphQLFieldConfigMap, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { allow } from "graphql-shield";
import { generateMutationFields, generateQueryFields } from "../utils";
import { Context } from "../interfaces";
import { ObjectIdScalar } from "../scalars";
import { isAdmin } from "../rules";

export const EntityType = new GraphQLObjectType({
    name: 'Entity',
    fields: {
        _id: { type: ObjectIdScalar },
        entity_id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        created_at: { type: GraphQLString }, // Assuming the date is stored as a string
    },
});


export const queryFields: GraphQLFieldConfigMap<any, Context> = {

    ...generateQueryFields({ collectionName: 'entities', Type: EntityType })
}


export const mutationFields: GraphQLFieldConfigMap<any, Context> = {

    ...generateMutationFields({ collectionName: 'entities', Type: EntityType }),
}

export const permissions = {
    Query: {
        entity: allow,
        entities: allow,
    },
    Mutation: {
        deleteOneEntity: isAdmin,
        deleteManyEntities: isAdmin,
        insertOneEntity: isAdmin,
        insertManyEntities: isAdmin,
        updateOneEntity: isAdmin,
        updateManyEntities: isAdmin,
    }
}