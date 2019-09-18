import ApiGatewayManagementApi from 'aws-sdk/clients/apigatewaymanagementapi'
import client from '../utils/dynamodb'

class Client {
	constructor(connectionId) {
		this.connectionId = connectionId
	}

	async get() {
		const { Item } = await client.get({
			TableName: process.env.TOPICS_TABLE,
			Key: {
				connectionId: this.connectionId,
				topic: 'INITIAL_CONNECTION'
			}
		}).promise()
		return Item
	}

	async getTopics() {
		const { Items: topics } = await client.query({
			ExpressionAttributeValues: {
				':connectionId': this.connectionId
			},
			IndexName: 'reverse',
			KeyConditionExpression: 'connectionId = :connectionId',
			ProjectionExpression: 'topic, connectionId',
			TableName: process.env.TOPICS_TABLE
		}).promise()
		return topics
	}

	async removeTopics(RequestItems) {
		const res = await client.batchWrite({
			RequestItems
		}).promise()
		if(res.UnprocessedItems && res.UnprocessedItems.length) {
			return this.removeTopics(res.UnprocessedItems)
		}
	}

	async unsubscribe() {
		const topics = await this.getTopics()
		return this.removeTopics({
			[process.env.TOPICS_TABLE]: topics.map(({ topic, connectionId }) => ({
				DeleteRequest: { Key: { topic, connectionId } }
			}))
		})
	}

	async sendMessage(message) {
		const gatewayClient = new ApiGatewayManagementApi({
			apiVersion: '2018-11-29',
			endpoint: process.env.IS_OFFLINE ? 'http://localhost:3001' : process.env.PUBLISH_ENDPOINT
		})
		return gatewayClient.postToConnection({
			ConnectionId: this.connectionId,
			Data: JSON.stringify(message)
		}).promise()
	}

	async subscribe({ topic, subscriptionId, ttl }) {
		return client.put({
			Item: {
				topic,
				subscriptionId,
				connectionId: this.connectionId,
				ttl: typeof ttl === 'number' ? ttl : Math.floor(Date.now() / 1000) + 60 * 60 * 2,
			},
			TableName: process.env.TOPICS_TABLE
		}).promise()
	}

	async connect() {
		return this.subscribe({
			topic: 'INITIAL_CONNECTION'
		})
	}
}

export default Client
