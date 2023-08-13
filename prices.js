const { ApolloServer, gql } = require("apollo-server");
const { buildSubgraphSchema } = require("@apollo/subgraph");
const fetch = require("node-fetch");

const port = 4002;
const apiUrl = "http://localhost:3000";

/**
 * A schema is a collection of type definitions (typeDefs).
 * All the defined types together define the "shape" of queries that are executed against the backend/data.
 */
const typeDefs = gql`
    # price type defines the queryable fields of price
    # declaring Price as an entity by adding key fields
    type Price @key(fields: "id") {
        id: ID!
        entity: Movie
        entityPrice: PriceDetails
        serviceCharges: ServiceCharges
    }

    type PriceDetails {
        amount: Float
        currency: String
    }

    type ServiceCharges {
        stream: PriceDetails
        support: PriceDetails
    }

    extend type Movie @key(fields: "id") {
        id: ID! @external
        price: Price
    }

    # Query type of the prices graph returns the prices graph shape
    # Extending the Query in subgraph because original Query definning in the federation gateway level
    type Query {
        price(id: ID!): Price
        prices: [Price]
    }
`;

/**
 * Resolvers define how to fetch the types defined in the schema
 */
const resolvers = {
    Query: {
        price(_, { id }) {
            return fetch(`${apiUrl}/prices/${id}`).then(res => res.json());
        },
        prices() {
            return fetch(`${apiUrl}/prices`).then(res => res.json());
        }
    },
    Price: {
        entity(parent) {
            return {__typename: "Movie", id: parent.referenceEntityId}
        }
    },
    Movie: {
        async price(parent) {
            // console.log("HELLO", parent);
            const response = await fetch(`${apiUrl}/prices/`);
            const priceResponse = await response.json();
            const filteredResponse = priceResponse.filter(
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
    console.log(`Prices Sub Graph has successfully started and listening at ${url}`);
});