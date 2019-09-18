import Topic from '../models/Topic'

const publish = (topic, data) => {
	return new Topic(topic).postMessage(data)
}

export default publish
