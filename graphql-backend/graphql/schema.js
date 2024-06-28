const { buildSchema } = require('graphql');



module.exports = buildSchema(`


    type Post {
        _id: String!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!  
    }

    type PostData {
        posts: [Post!]
        totalPosts:Int!
    }

    type User {
        _id:ID!,
        name: String!
        email: String!
        password: String!
        status: String!
        posts: [Post!]
    }
    

    type AuthData {
        userId: String!
        token: String!
        tokenExpiration: Int!
    }


    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    input PostInputData {
        title: String!
        imageUrl: String!
        content: String!
    }
        
    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page:Int):  PostData!
    }


    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);