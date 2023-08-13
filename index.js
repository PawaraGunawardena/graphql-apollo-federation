const { ApolloServer } = require("apollo-server");
const { ApolloGateway } = require("@apollo/gateway");

const port = 4000;

/**
 * Gateway needs the subgraph service list as an argument
 */
const gateway = new ApolloGateway({
    serviceList: [{
        name: "movies", url: "http://localhost:4001"
    }]
});

const server = new ApolloServer({
    gateway,
    subscriptions: false
});

server.listen({ port }).then(({ url }) => {
    console.log(`Graph gateway has successfully started and listening at ${url}`);
});