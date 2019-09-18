import React from 'react'
import ReactDOM from 'react-dom'
import { ApolloClient } from 'apollo-client'
import { ApolloProvider } from '@apollo/react-hooks'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'

import App from './App'

const http_endpoint = process.env.REACT_APP_HTTP_ENDPOINT
const ws_endpoint = process.env.REACT_APP_SUBSCRIPTION_ENDPOINT

const subClient = new SubscriptionClient(ws_endpoint, { lazy: true, reconnect: true }, null, [])
const wsLink = new WebSocketLink(subClient)
const httpLink = new HttpLink({ uri: http_endpoint })

const link = split(
	({ query }) => {
		const definition = getMainDefinition(query)
		return (
			definition.kind === 'OperationDefinition' &&
			definition.operation === 'subscription'
		)
	},
	wsLink,
	httpLink,
)

const client = new ApolloClient({
	cache: new InMemoryCache(),
	link
})

ReactDOM.render(
	(<ApolloProvider client={client}>
		<App/>
	</ApolloProvider>),
	document.getElementById('root')
)


