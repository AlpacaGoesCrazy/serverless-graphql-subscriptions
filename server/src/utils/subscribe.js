import Client from '../models/Client'
import { PubSub } from 'graphql-subscriptions'

const subscribeResolver = topic => async ({ id }, args, { connectionId, ttl }) => {
	await new Client(connectionId).subscribe({
		ttl,
		topic,
		subscriptionId: id
	})
	return new PubSub().asyncIterator([topic])
}

export default subscribeResolver
