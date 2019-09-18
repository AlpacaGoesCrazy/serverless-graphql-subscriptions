import { makeExecutableSchema } from 'graphql-tools'
import { ApolloServer, gql } from 'apollo-server-lambda'
import publish from './utils/publish'
import subscribe from './utils/subscribe'

const typeDefs = gql`
	type Query {
		_: String
	}
	type Mutation {
		sendMessage(message: String!): String
	}
	type Subscription {
		listenMessage: String
	}
`

const resolvers = {
	Mutation: {
		sendMessage: async (root, { message }) => {
			await publish('MY_TOPIC', { listenMessage: message })
			return message
		}
	},
	Subscription: {
		listenMessage: {
			subscribe: subscribe('MY_TOPIC')
		}
	}
}

export const schema = makeExecutableSchema({
	typeDefs,
	resolvers,
})

const server = new ApolloServer({ schema })

export const handler = server.createHandler({
	cors: {
		origin: '*',
		credentials: true,
	}
})

