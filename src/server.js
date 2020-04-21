const fs = require('fs')
const https = require('https')
const express = require('express')
const socketIO = require('socket.io')

const Game = require('./game')

const options = {
  key: fs.readFileSync('./privkey.pem'),
  cert: fs.readFileSync('./fullchain.pem')
}

const app = express()
const server = https.createServer(options, app).listen(5000)
const io = socketIO.listen(server)

app.use(express.static('src/public'))

let currentGame = new Game(11, 13)

io.on('connection', (socket) => {
  socket.on('new player', () => {
    console.log('New player connected:', socket.id)
    io.sockets.emit('chat message', 'Server: ' + socket.id + ' joined.')
    currentGame.addPlayer(socket.id)
  })

  socket.on('movement', (data) => {
    const player = currentGame.players[socket.id] || {}
    if (data.bomb) {
      player.droppedBomb = true
    }
    if (data.left) {
      player.nextMove = 'left'
    } else if (data.up) {
      player.nextMove = 'up'
    } else if (data.right) {
      player.nextMove = 'right'
    } else if (data.down) {
      player.nextMove = 'down'
    }
  })

  socket.on('restart', () => {
    const newGame = new Game(11, 13)
    for (const id in currentGame.players) {
      newGame.addPlayer(id)
    }
    currentGame = newGame
  })

  socket.on('chat message', (message) => {
    io.sockets.emit('chat message', socket.id + ': ' + message)
  })

  socket.on('disconnect', () => {
    console.log('Player left:', socket.id)
    io.sockets.emit('chat message', 'Server: ' + socket.id + ' left.')
    currentGame.removePlayer(socket.id)
  })
})

setInterval(() => {
  io.sockets.emit('state', currentGame.grid)
}, 1000 / 60)

setInterval(() => {
  currentGame.update()
}, 1000 / 10)
