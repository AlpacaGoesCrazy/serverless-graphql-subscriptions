import DynamoDB from 'aws-sdk/clients/dynamodb'

const localConfig = {
	region: 'localhost',
	endpoint: 'http://localhost:8000',
	accessKeyId: 'DEFAULT_ACCESS_KEY',
	secretAccessKey: 'DEFAULT_SECRET'
}

const remoteConfig = {
	region: process.env.AWS_REGION
}

const client = new DynamoDB.DocumentClient(process.env.IS_OFFLINE ? localConfig : remoteConfig)
export default client
