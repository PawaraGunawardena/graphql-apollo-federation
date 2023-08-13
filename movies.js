const { ApolloServer, gql } = require("apollo-server");
const { buildSubgraphSchema } = require("@apollo/subgraph");
const fetch = require("node-fetch");

const port = 4001;
const apiUrl = "http://localhost:3000";

/**
 * A schema is a collection of type definitions (typeDefs).
 * All the defined types together define the "shape" of queries that are executed against the backend/data.
 */
const typeDefs = gql`
    # movie type defines the queryable fields of Movie
    type Movie @key(fields: "id"){
        id: ID!
        name: String
        duration: Int
        genre: String
        views: Int
    }
    # Query type of the movies graph returns the movies graph shape
    type Query {
        movie(id: ID!): Movie
        movies: [Movie]
    }
`;

/**
 * Resolvers define how to fetch the types defined in the schema
 */
const resolvers = {
    Query: {
        movie(_, { id }) {
            return fetch(`${apiUrl}/movies/${id}`).then(res => res.json());
        },
        movies() {
            return fetch(`${apiUrl}/movies`).then(res => res.json());
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
    console.log(`Movies Graph has successfully started and listening at ${url}`);
});