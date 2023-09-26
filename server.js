'use strict'

import { createRequire } from 'module'
import chalk from 'chalk'
const require = createRequire(import.meta.url)

import GameModule from './GameModule.js'

const IP = '127.0.0.1'
const PORT = 8080

const express = require('express')
const app = express()
app.use(express.static('public'))
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html')
})

const http = require('http')
const socketIo = require('socket.io')
const webServer = http.Server(app)
const io = socketIo(webServer)

webServer.listen(PORT, IP, () => {
	console.log(chalk.green('_________________________________\n'))
	console.log(chalk.green(`webserver listens to port :${PORT}`))
	console.log(chalk.green('_________________________________\n'))
})

let clients = []

const setPlayer1 = (id) => {
	GameModule.setSocketId('player1', id)
	io.to(id).emit('setPlayer1', {
		infoMessage: GameModule.displayInfo('player1'),
		statusMessage: GameModule.displayStatus('waitForSecondPlayer')
	})
	io.emit('setActualScore',  JSON.stringify(GameModule.setActualScore()))
}

const setPlayer2 = (id) => {
	GameModule.setSocketId('player2', id)
	io.to(id).emit('setPlayer1', {
		infoMessage: GameModule.displayInfo('player2'),
	})
	io.emit('showInfoArea')
	io.emit('statusMessage', { msg: GameModule.displayStatus('connectedTwoPlayers') })
	io.emit('showRestartButton')
	io.emit('setActualScore',  JSON.stringify(GameModule.setActualScore()))
}

const setGuest = (id) => {
	io.to(id).emit('setGuest', { msg: GameModule.displayStatus('welcomeGuest') })
	io.to(id).emit('hideStatusArea')
	io.emit('setActualScore',  JSON.stringify(GameModule.setActualScore()))
}

const disconnectPlayer1 = () => {
	GameModule.setSocketId('player1', clients[2])
	clients.splice(2, 1)
	clients.splice(0,1)
	clients.unshift(GameModule.getSocketId('player1'))
}

const disconnectPlayer2 = () => {
	GameModule.setSocketId('player2', clients[2])
	clients.splice(2, 1)
	clients.splice(1, 1, GameModule.getSocketId('player2'))
}

const disconnectGuest = (id) => {
	clients.splice(clients.indexOf(id), 1)
}

io.on('connection', socket => {
	clients.push(socket.id)
	if (GameModule.getSocketId('player1') === '') setPlayer1(socket.id)
	else if (GameModule.getSocketId('player2') === '') setPlayer2(socket.id)
	else setGuest(socket.id)

	socket.on('disconnect', () => {
		if (clients.indexOf(socket.id) === 0 && clients.length > 2) {
			disconnectPlayer1(socket.id)
			GameModule.restartGame()
			setPlayer1(clients[0])
			setPlayer2(clients[1])
			clients.slice(2).forEach((client) => setGuest(client))
			io.to(clients[0]).emit('showInfoArea')
			io.to(clients[0]).emit('hideGuestInfoArea')
		}

		else if (clients.indexOf(socket.id) === 1 && clients.length > 2) {
			disconnectPlayer2(socket.id)
			GameModule.restartGame()
			setPlayer1(clients[0])
			setPlayer2(clients[1])
			clients.slice(2).forEach((client) => setGuest(client))
			io.to(clients[1]).emit('showInfoArea')
			io.to(clients[1]).emit('hideGuestInfoArea')
		}

		else if (clients.length <= 2 && (clients.indexOf(socket.id) === 0 || clients.indexOf(socket.id) === 1)) {
			disconnectGuest(socket.id)
			GameModule.restartGame()
			setPlayer1(clients[0])
			GameModule.setSocketId('player2', '')
			io.emit('hideInfoArea')
		} else {
			disconnectGuest(socket.id)
		}
	})

	socket.on('move', (data) => {
		if ( GameModule.getSocketId('player2') !== '' && GameModule.getGameStatus() !== 'finished') {
			io.emit('statusMessage', { msg: '' })
			if (data.player !== GameModule.getActivePlayer()) {
				io.to(socket.id).emit('statusMessage', { msg: GameModule.displayStatus('notYourTurn') })
			} else {
				if (GameModule.getActualScore(data.field) !== '') {
					io.to(socket.id).emit('statusMessage', { msg: GameModule.displayStatus('moveImpossible') })
					return false
				}
				GameModule.move(data.field, data.player)
				io.emit('setActualScore',  JSON.stringify(GameModule.setActualScore()))
				if (GameModule.getWinner() === true) {
					io.emit('statusMessageWinner', { msg: GameModule.displayStatus('statusWon'), winner: GameModule.getActivePlayer() })
					io.emit('hideInfoArea')
					io.emit('showStatusArea')
				} else if (GameModule.getAmountMoves() === 9) {
					GameModule.setGameStatus('finished')
					io.emit('statusMessage', { msg: GameModule.displayStatus('statusDrawn') })
					io.emit('hideInfoArea')
					io.emit('showStatusArea')
				}
				GameModule.toggleActivePlayer()
				io.emit('updateActivePlayer', { activePlayer: GameModule.getActivePlayer() })
			}
		}
	})

	socket.on('restartGame', () => {
		GameModule.restartGame()
		setPlayer1(clients[0])
		setPlayer2(clients[1])
		clients.slice(2).forEach((client) => {
			setGuest(client)
		})

	})

})
