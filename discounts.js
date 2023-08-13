const { ApolloServer, gql } = require("apollo-server");
const { buildSubgraphSchema } = require("@apollo/subgraph");
const fetch = require("node-fetch");

const port = 4003;
const apiUrl = "http://localhost:3000";

/**
 * A schema is a collection of type definitions (typeDefs).
 * All the defined types together define the "shape" of queries that are executed against the backend/data.
 */
const typeDefs = gql`
    # discount type defines the queryable fields of discount
    # declaring Discount as an entity by adding key fields
    type Discount @key(fields: "id") {
        id: ID!
        entity: Movie
        validityPeriod: ValidityPeriod
        amount: Float
        type: String
    }

    type ValidityPeriod {
        beginMonth: Int
        endMonth: Int
    }

    extend type Movie @key(fields: "id") {
        id: ID! @external
        discount: Discount
    }

    # Query type of the discounts graph returns the discounts graph shape
    # Extending the Query in subgraph because original Query definning in the federation gateway level
    type Query {
        discount(id: ID!): Discount
        discounts: [Discount]
    }
`;

/**
 * Resolvers define how to fetch the types defined in the schema
 */
const resolvers = {
    Query: {
        discount(_, { id }) {
            return fetch(`${apiUrl}/discounts/${id}`).then(res => res.json());
        },
        discounts() {
            return fetch(`${apiUrl}/discounts`).then(res => res.json());
        }
    },
    Discount: {
        entity(parent) {
            return {__typename: "Movie", id: parent.referenceEntityId}
        }
    },
    Movie: {
        async discount(parent) {
            const response = await fetch(`${apiUrl}/discounts/`);
            const discountsResponse = await response.json();
            const filteredResponse = discountsResponse.filter(
                (price) => {
                    return price.referenceEntityId == parent.id;
                }
            );
            return filteredResponse[0];
        }
    }
};

/**
 * For subgraph it needs to define as the schema of the subgraph
 * For the single Apollo graphql server need to pass as follow
        const server = new ApolloServer({
                typeDefs,
                resolvers
            });
 */
const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }])
});

server.listen({ port }).then(({ url }) => {
    console.log(`Discounts Sub Graph has successfully started and listening at ${url}`);
});