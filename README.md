GraphQL Apollo Federation Project
==================================

1. To up and running the backend server

    json-server -q db.json

2. Access backend data

        * Movies: 
            http://localhost:3000/movies

        * Reviews: 
            http://localhost:3000/reviews

        * Prices: 
            http://localhost:3000/prices
            
        * Movies: 
            http://localhost:3000/discounts

3. Install dependencies

        npm install

4. Run json server and graphql server (terminate if started the backend server separately)

        npm run server

5. Access the playground from the URL

    http://localhost:4000/

6. Run query against GraphQL endpoint

        query Movies {
            movies {
                id
                name
                genre
                duration
                views
            }
        }

        query Movie {
            movie(id:2) {
                id
                name
                genre
                duration
                views
            }
        }