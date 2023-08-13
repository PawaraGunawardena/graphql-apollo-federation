const { ApolloServer, gql } = require("apollo-server");
const fetch = require("node-fetch");

const port = 4000;
const apiUrl = "http://localhost:3000";

/**
 * A schema is a collection of type definitions (typeDefs).
 * All the defined types together define the "shape" of queries that are executed against the backend/data.
 */
const typeDefs = gql`
    # movie type defines the queryable fields of Movie
    type Movie {
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

const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.listen({ port }).then(({ url }) => {
    console.log(`Movies Graph has successfully started and listening at ${url}`);
});