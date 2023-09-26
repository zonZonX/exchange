'use strict'

const socket = io('/')

const thisPlayer = $('#player')
const activePlayer = $('#activePlayer')
const infoArea = $('#infoArea')
const statusArea = $('#statusArea')
const restartButton = $('#restartButton')
const guestInfoArea = $('#guestInfoArea')

$on($('#restartButton'), 'click',
	event => socket.emit('restartGame'))
$on($$('#board td'), 'click',
	event => socket.emit('move', { field: event.target.id, player: thisPlayer.innerText }))

socket.on('setPlayer1', (data) => {
	thisPlayer.innerText = data.infoMessage.player
	activePlayer.innerText = data.infoMessage.activePlayer
	statusArea.innerHTML= data.statusMessage
	statusArea.classList.remove('none')
	guestInfoArea.classList.add('none')
	infoArea.classList.remove('none')
	restartButton.classList.add('none')
})

socket.on('setPlayer2', (data) => {
	infoArea.classList.remove('hidden')
	thisPlayer.innerText = data.infoMessage.player
	activePlayer.innerText = data.infoMessage.activePlayer
	infoArea.classList.remove('none')
})

socket.on('setGuest', (data) => {
	infoArea.classList.add('none')
	statusArea.classList.add('none')
	restartButton.classList.add('hidden')
	guestInfoArea.innerText = data.msg
	guestInfoArea.classList.remove('none')
})

socket.on('updateActivePlayer', (data) => {
	activePlayer.innerText = data.activePlayer
})

socket.on('statusMessage', (data) => {
	statusArea.innerHTML = data.msg
})

socket.on('showInfoArea', () => {
	infoArea.classList.remove('hidden')
})

socket.on('hideInfoArea', () => {
	infoArea.classList.add('hidden')
})

socket.on('hideStatusArea', () => {
	statusArea.classList.add('none')
})

socket.on('hideGuestInfoArea', () => {
	guestInfoArea.classList.add('none')
})

socket.on('showRestartButton', () => {
	restartButton.classList.remove('none', 'hidden')
})

socket.on('statusMessageWinner', (data) => {
	statusArea.innerText = data.msg + ' ' + data.winner + ' hat gewonnen.'
	statusArea.classList.remove('none', 'hidden')
})

socket.on('setActualScore', (data) => {
	JSON.parse(data).map((value, index) => {
		document.getElementById(index).innerText = value
	})
})
