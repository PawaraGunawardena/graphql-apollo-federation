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
    # review type defines the queryable fields of review
    # declaring Review as an entity by adding key fields
    type Review @key(fields: "id") {
        id: ID!
        movieId: Int
        reviewer: String
        comment: String
        rating: Int
    }
    # Query type of the reviews graph returns the reviews graph shape
    # Extending the Query in subgraph because original Query definning in the federation gateway level
    type Query {
        review(id: ID!): Review
        reviews: [Review]
    }
`;

/**
 * Resolvers define how to fetch the types defined in the schema
 */
const resolvers = {
    Query: {
        review(_, { id }) {
            return fetch(`${apiUrl}/reviews/${id}`).then(res => res.json());
        },
        reviews() {
            return fetch(`${apiUrl}/reviews`).then(res => res.json());
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
    console.log(`Reviews Sub Graph has successfully started and listening at ${url}`);
});