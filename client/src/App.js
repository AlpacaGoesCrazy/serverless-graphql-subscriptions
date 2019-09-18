import React, { Fragment, useState, useRef } from 'react'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'

import './styles.css'

const listenMessageSubscription = gql`
	subscription listenMessage {
		listenMessage
	}
`
const sendMessageMutation = gql`
	mutation sendMessage($message: String!) {
		sendMessage(message: $message)
	}
`

function App() {
	const [messages, setMessages] = useState([])
	const [input, setInput] = useState('')
	const [username, setUsername] = useState('Anonymous')
	const messageBoxRef = useRef()

	const onSubscriptionData = ({ subscriptionData: { data: { listenMessage } } }) => {
		setMessages(messages => [...messages, listenMessage])
		messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight
	}

	useSubscription(listenMessageSubscription, { onSubscriptionData })
	const [sendMessage] = useMutation(sendMessageMutation)

	const handleSend = () => {
		if(input) {
			sendMessage({ variables: { message: `${username}: ${input}` } })
			setInput('')
		}
	}

	const handleKeyPress = e => {
		if(e.charCode === 13) {
			handleSend()
		}
	}

	return (
		<Fragment>
			<List ref={messageBoxRef} className='message-container' disablePadding>
				{messages.map((message, i) =>
					<ListItem key={i} style={{ background: i % 2 !== 0 ? '#f5f5f5' : '#fff' }}>
						{message}
					</ListItem>
				)}
			</List>
			<div className='control-panel'>
				<TextField
					type='text'
					value={username}
					label='Username'
					onChange={e => setUsername(e.target.value)}
				/>
				<TextField
					className='input-message'
					type='text'
					autoFocus
					value={input}
					label='Message'
					onKeyPress={handleKeyPress}
					onChange={e => setInput(e.target.value)}

				/>
				<Button variant="contained" color="primary" onClick={handleSend}>
					SEND
				</Button>
			</div>
		</Fragment>
	)
}

export default App
