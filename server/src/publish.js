import DynamoDB from 'aws-sdk/clients/dynamodb'
import Topic from './models/Topic'
const parseNewEvent = DynamoDB.Converter.unmarshall

export async function handler(event) {
	const subscruptionEvent = event.Records[0]
	if(subscruptionEvent.eventName !== 'INSERT') {
		throw new Error('Invalid event. Wrong dynamodb event type, can publish only `INSERT` events to subscribers.')
	}
	const { topic, data } = process.env.IS_OFFLINE ?
		subscruptionEvent.dynamodb.NewImage :
		parseNewEvent(subscruptionEvent.dynamodb.NewImage)
	return new Topic(topic).publishMessage(data)
}
