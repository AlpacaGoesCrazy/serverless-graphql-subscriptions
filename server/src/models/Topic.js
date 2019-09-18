import uuid from 'uuid'
import client from '../utils/dynamodb'
import { handler as publish } from '../publish'
import Client from './Client'

class Topic {
	constructor(topic) {
		this.topic = topic
	}

	async getSubscribers() {
		const { Items: clients } = await client.query({
			ExpressionAttributeValues: {
				':topic': this.topic
			},
			KeyConditionExpression: 'topic = :topic',
			ProjectionExpression: 'connectionId, subscriptionId',
			TableName: process.env.TOPICS_TABLE
		}).promise()
		return clients
	}

	async publishMessage(data) {
		const subscribers = await this.getSubscribers()
		const promises = subscribers.map(async ({ connectionId, subscriptionId }) => {
			const TopicSubscriber = new Client(connectionId)
			try {
				const res = await TopicSubscriber.sendMessage({
					id: subscriptionId,
					payload: { data },
					type: 'data'
				})
				return res
			} catch(err) {
				if(err.statusCode === 410) {	// this client has disconnected unsubscribe it
					return TopicSubscriber.unsubscribe()
				}
			}
		})
		return Promise.all(promises)
	}

	async postMessage(data) {
		const payload = {
			data,
			topic: this.topic,
			id: uuid.v4(),
		}
		if(process.env.IS_OFFLINE) { // dynamodb streams are not working offline so invoke lambda directly
			await publish({
				Records: [{
					eventName: 'INSERT',
					dynamodb: {
						NewImage: payload
					}
				}]
			})
		}
		return client.put({
			Item: payload,
			TableName: process.env.EVENTS_TABLE
		}).promise()
	}
}

export default Topic
