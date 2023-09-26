'use strict'

let gameStatus = {
	playground: ['', '', '', '', '', '', '', '', ''],
	players: {
		player1: {
			symbol: 'X',
			id: ''
		},
		player2: {
			symbol: 'O',
			id: ''
		}
	},
	activePlayer: 'X',
	numberMoves: 0,
	status: 'ongoing',
}

let statusMessage = ''
let infoMessage = ''
let data = []

const message = {
	waitForSecondPlayer: 'Bitte warte auf deinen Mitspieler.',
	connectedTwoPlayers: 'Zwei Spieler verbunden. Das Spiel kann beginnen.',
	moveImpossible: 'Dummy. Das Feld ist schon besetzt.',
	notYourTurn: 'Dummy. Du bist nicht dran.',
	welcomeGuest: 'Das Spiel hat schon begonnen. Du kannst aber zuschauen.',
	statusDrawn: 'Das Spiel ist beendet. Unentschieden.',
	statusWon: 'Das Spiel ist beendet.'
}

const move = (field, player) => {
	gameStatus.playground.splice(field, 1, player)
	gameStatus.numberMoves++
}

const setSocketId = (player, socketId) => gameStatus.players[player].id = socketId
const getSocketId = (player) => gameStatus.players[player].id
const setActualScore = () => data = gameStatus.playground
const getActualScore = (field) => gameStatus.playground[field]
const getActivePlayer = () => gameStatus.activePlayer
const getPlayerSymbol = (player) => gameStatus.players[player].symbol
const toggleActivePlayer = () => (gameStatus.activePlayer === 'X') ? gameStatus.activePlayer = 'O' : gameStatus.activePlayer = 'X'
const getAmountMoves = () => gameStatus.numberMoves
const getGameStatus = () => gameStatus.status
const setGameStatus = (stat) => gameStatus.status = stat
const displayStatus = (messageKey) => statusMessage = message[messageKey]

const displayInfo = (player) => {
	infoMessage = { player: gameStatus.players[player].symbol, activePlayer: gameStatus.activePlayer }
	return infoMessage
}

const getWinner = () => {
	const validCombinations = ['XXX', 'OOO']
	const winningCombinations = [
		gameStatus.playground[0] + gameStatus.playground[1] + gameStatus.playground[2],
		gameStatus.playground[3] + gameStatus.playground[4] + gameStatus.playground[5],
		gameStatus.playground[6] + gameStatus.playground[7] + gameStatus.playground[8],
		gameStatus.playground[0] + gameStatus.playground[3] + gameStatus.playground[6],
		gameStatus.playground[1] + gameStatus.playground[4] + gameStatus.playground[7],
		gameStatus.playground[2] + gameStatus.playground[5] + gameStatus.playground[8],
		gameStatus.playground[0] + gameStatus.playground[4] + gameStatus.playground[8],
		gameStatus.playground[2] + gameStatus.playground[4] + gameStatus.playground[6],
	]

	return winningCombinations.includes(validCombinations[0]) || winningCombinations.includes(validCombinations[1])
}

const restartGame = () => {
	gameStatus.playground.fill('')
	gameStatus.numberMoves = 0
	gameStatus.activePlayer = 'X'
	gameStatus.status = 'ongoing'
}

export default {
	move,
	setActualScore,
	getActualScore,
	setSocketId,
	getSocketId,
	displayInfo,
	displayStatus,
	getActivePlayer,
	getPlayerSymbol,
	toggleActivePlayer,
	getAmountMoves,
	setGameStatus,
	getGameStatus,
	getWinner,
	restartGame
}
