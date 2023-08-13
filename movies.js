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
        discountDetails: Discount @external
        discountedAmount: Int @requires(fields: "discountDetails { amount type validityPeriod { beginMonth endMonth } }")
    }

    extend type Discount @key(fields: "id") {
        id: ID!
        amount: Float @external
        type: String @external
        validityPeriod: ValidityPeriod @external
    }

    extend type ValidityPeriod {
        beginMonth: Int @external
        endMonth: Int @external
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
    },
    Movie: {
        async __resolveReference(ref) {
            const response = await fetch(`${apiUrl}/movies/${ref.id}`)
                .then(
                    res => res.json()
                );

            response.discountDetails = ref.discountDetails;
            return response;
        },
        discountedAmount(parent) {
            // this field can resolve either with or without __resolveReference
            // but if the Entity already contains a __resolveReference, then it awlays tries to resolve the entire entiry, even getway once received the resolve entity. 
            // gateway requested call contains ( __typename: "Movie", id ) key values
            
            let discountedAmount=0;

            if(parent?.discountDetails?.validityPeriod) {
                const d = new Date();
                let thisMonth = d.getMonth();

                if(parent.discountDetails.validityPeriod.beginMonth-1 <= thisMonth && thisMonth <= parent.discountDetails.validityPeriod.endMonth-1) {
                    discountedAmount = parent.discountDetails.amount;
                }
            }
            return discountedAmount;
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
    console.log(`Movies Sub Graph has successfully started and listening at ${url}`);
});