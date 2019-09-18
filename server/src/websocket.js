import { schema } from './graphql'
import { parse, getOperationAST, validate, subscribe } from 'graphql'
import Client from './models/Client'

export async function handler(event) {
	if (!(event.requestContext && event.requestContext.connectionId)) {
		throw new Error('Invalid event. Missing `connectionId` parameter.')
	}

	const connectionId = event.requestContext.connectionId
	const route = event.requestContext.routeKey
	const Subscriber = new Client(connectionId)
	const response = { statusCode: 200, body: '' }

	if(route === '$connect') {
		await new Client(connectionId).connect()
		return response
	} else if(route === '$disconnect') {
		await new Client(connectionId).unsubscribe()
		return response
	} else {
		if (!event.body) {
			return response
		}

		let operation = JSON.parse(event.body)

		if(operation.type === 'connection_init') {
			await Subscriber.sendMessage({ type: 'connection_ack' })
			return response
		}

		if(operation.type === 'stop') {
			return response
		}
		const client = await Subscriber.get()
		if(!client) {
			throw new Error('Unknown client')
		}

		const { query: rawQuery, variables, operationName } = operation.payload
		const graphqlDocument = parse(rawQuery)
		const operationAST = getOperationAST(graphqlDocument, operation.operationName || '')

		if(!operationAST || operationAST.operation !== 'subscription') {
			await Subscriber.sendMessage({
				payload: { message: 'Only subscriptions are supported' },
				type: 'error'
			})
			return response
		}

		const validationErrors = validate(schema, graphqlDocument)
		if(validationErrors.length > 0) {
			await Subscriber.sendMessage({
				payload: { errors: validationErrors },
				type: 'error'
			})
			return response
		}

		try {
			await subscribe({
				document: graphqlDocument,
				schema,
				rootValue: operation,
				operationName: operationName,
				variableValues: variables,
				contextValue: {
					connectionId,
					ttl: client.ttl
				}
			})
		} catch(err) {
			await Subscriber.sendMessage({
				id: operation.id,
				payload: err,
				type: 'error'
			})
		}
		return response
	}
}
